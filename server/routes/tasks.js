const express = require('express');
const { getDb } = require('../db/schema');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, (req, res) => {
  const db = getDb();
  const { type, pillar_id, status } = req.query;

  let query = `
    SELECT t.*, p.name as pillar_name, p.color as pillar_color
    FROM tasks t
    LEFT JOIN pillars p ON t.pillar_id = p.id
    WHERE 1=1
  `;
  const params = [];

  if (type) { query += ' AND t.type = ?'; params.push(type); }
  if (pillar_id) { query += ' AND t.pillar_id = ?'; params.push(pillar_id); }
  if (status) { query += ' AND t.status = ?'; params.push(status); }

  query += ' ORDER BY t.created_at DESC';
  const tasks = db.prepare(query).all(...params);
  res.json(tasks);
});

router.post('/', authMiddleware, (req, res) => {
  const db = getDb();
  const { title, type, pillar_id, estimated_time, notes, deadline } = req.body;

  const result = db.prepare(`
    INSERT INTO tasks (title, type, pillar_id, estimated_time, notes, deadline)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(title, type, pillar_id, estimated_time, notes, deadline);

  const task = db.prepare(`
    SELECT t.*, p.name as pillar_name, p.color as pillar_color
    FROM tasks t LEFT JOIN pillars p ON t.pillar_id = p.id
    WHERE t.id = ?
  `).get(result.lastInsertRowid);
  res.json(task);
});

router.put('/:id', authMiddleware, (req, res) => {
  const db = getDb();
  const { title, type, pillar_id, estimated_time, status, notes, completion_reflection, deadline } = req.body;

  db.prepare(`
    UPDATE tasks SET
      title = COALESCE(?, title),
      type = COALESCE(?, type),
      pillar_id = COALESCE(?, pillar_id),
      estimated_time = COALESCE(?, estimated_time),
      status = COALESCE(?, status),
      notes = COALESCE(?, notes),
      completion_reflection = COALESCE(?, completion_reflection),
      deadline = COALESCE(?, deadline)
    WHERE id = ?
  `).run(title, type, pillar_id, estimated_time, status, notes, completion_reflection, deadline, req.params.id);

  const task = db.prepare(`
    SELECT t.*, p.name as pillar_name, p.color as pillar_color
    FROM tasks t LEFT JOIN pillars p ON t.pillar_id = p.id
    WHERE t.id = ?
  `).get(req.params.id);
  res.json(task);
});

router.delete('/:id', authMiddleware, (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
