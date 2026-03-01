const express = require('express');
const { getDb } = require('../db/schema');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get blocks for a date range
router.get('/', authMiddleware, (req, res) => {
  const db = getDb();
  const { start, end } = req.query;

  let query = `
    SELECT tb.*, p.name as pillar_name, p.color as pillar_color
    FROM time_blocks tb
    LEFT JOIN pillars p ON tb.pillar_id = p.id
  `;
  const params = [];

  if (start && end) {
    query += ' WHERE tb.date >= ? AND tb.date <= ?';
    params.push(start, end);
  } else if (start) {
    query += ' WHERE tb.date >= ?';
    params.push(start);
  }

  query += ' ORDER BY tb.date, tb.start_time';
  const blocks = db.prepare(query).all(...params);
  res.json(blocks);
});

// Create block
router.post('/', authMiddleware, (req, res) => {
  const db = getDb();
  const { date, block_number, pillar_id, task_title, start_time, duration, is_recurring, day_of_week } = req.body;

  const result = db.prepare(`
    INSERT INTO time_blocks (date, block_number, pillar_id, task_title, start_time, duration, is_recurring, day_of_week)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(date, block_number, pillar_id, task_title, start_time, duration, is_recurring ? 1 : 0, day_of_week);

  const block = db.prepare('SELECT * FROM time_blocks WHERE id = ?').get(result.lastInsertRowid);
  res.json(block);
});

// Update block
router.put('/:id', authMiddleware, (req, res) => {
  const db = getDb();
  const { date, block_number, pillar_id, task_title, start_time, duration, status } = req.body;

  db.prepare(`
    UPDATE time_blocks
    SET date = COALESCE(?, date),
        block_number = COALESCE(?, block_number),
        pillar_id = COALESCE(?, pillar_id),
        task_title = COALESCE(?, task_title),
        start_time = COALESCE(?, start_time),
        duration = COALESCE(?, duration),
        status = COALESCE(?, status)
    WHERE id = ?
  `).run(date, block_number, pillar_id, task_title, start_time, duration, status, req.params.id);

  const block = db.prepare(`
    SELECT tb.*, p.name as pillar_name, p.color as pillar_color
    FROM time_blocks tb
    LEFT JOIN pillars p ON tb.pillar_id = p.id
    WHERE tb.id = ?
  `).get(req.params.id);
  res.json(block);
});

// Reschedule (drag-drop)
router.put('/:id/reschedule', authMiddleware, (req, res) => {
  const db = getDb();
  const { date, start_time } = req.body;

  db.prepare('UPDATE time_blocks SET date = ?, start_time = ? WHERE id = ?')
    .run(date, start_time, req.params.id);

  const block = db.prepare(`
    SELECT tb.*, p.name as pillar_name, p.color as pillar_color
    FROM time_blocks tb
    LEFT JOIN pillars p ON tb.pillar_id = p.id
    WHERE tb.id = ?
  `).get(req.params.id);
  res.json(block);
});

// Delete block
router.delete('/:id', authMiddleware, (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM time_blocks WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Generate blocks for current week from rotation
router.post('/generate', authMiddleware, (req, res) => {
  const db = getDb();
  const { week_start, rotation } = req.body;
  const pillars = db.prepare('SELECT * FROM pillars').all();

  const getPillarId = (name) => {
    const p = pillars.find(p => p.name === name);
    return p ? p.id : null;
  };

  const blocks = [];
  for (let day = 0; day < 7; day++) {
    const date = new Date(week_start);
    date.setDate(date.getDate() + day);
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();

    if (dayOfWeek === 0) {
      // Sunday – Review day
      blocks.push({ date: dateStr, block_number: 1, pillar_id: null, task_title: 'Weekly Review', start_time: '10:00', duration: 90, day_of_week: 0 });
    } else if (dayOfWeek === 6) {
      // Saturday
      blocks.push({ date: dateStr, block_number: 1, pillar_id: getPillarId(rotation.primary), task_title: `${rotation.primary} – Long Build`, start_time: '09:00', duration: 180, day_of_week: 6 });
      blocks.push({ date: dateStr, block_number: 2, pillar_id: getPillarId(rotation.secondary), task_title: `${rotation.secondary} – Deep Block`, start_time: '13:00', duration: 120, day_of_week: 6 });
    } else {
      // Weekday
      blocks.push({ date: dateStr, block_number: 1, pillar_id: getPillarId(rotation.primary), task_title: `${rotation.primary} – Primary`, start_time: '09:00', duration: 90, day_of_week: dayOfWeek });
      blocks.push({ date: dateStr, block_number: 2, pillar_id: getPillarId(rotation.secondary), task_title: `${rotation.secondary} – Secondary`, start_time: '11:00', duration: 75, day_of_week: dayOfWeek });
      const maintenancePillar = rotation.maintenance[day % rotation.maintenance.length];
      blocks.push({ date: dateStr, block_number: 3, pillar_id: getPillarId(maintenancePillar), task_title: `${maintenancePillar} – Maintenance`, start_time: '14:00', duration: 30, day_of_week: dayOfWeek });
    }
  }

  const insert = db.prepare(`
    INSERT INTO time_blocks (date, block_number, pillar_id, task_title, start_time, duration, is_recurring, day_of_week)
    VALUES (?, ?, ?, ?, ?, ?, 1, ?)
  `);

  const insertMany = db.transaction((blocks) => {
    for (const b of blocks) {
      insert.run(b.date, b.block_number, b.pillar_id, b.task_title, b.start_time, b.duration, b.day_of_week);
    }
  });

  insertMany(blocks);
  res.json({ generated: blocks.length });
});

module.exports = router;
