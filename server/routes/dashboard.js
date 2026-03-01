const express = require('express');
const { getDb } = require('../db/schema');
const { authMiddleware } = require('../middleware/auth');
const { getCurrentRotation, checkAcademicOverride } = require('../utils/rotation');

const router = express.Router();

router.get('/', authMiddleware, (req, res) => {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];
  const dayOfWeek = new Date().getDay(); // 0=Sun, 6=Sat

  // Get rotation
  const config = db.prepare('SELECT * FROM rotation_config WHERE user_id = ? ORDER BY id DESC LIMIT 1').get(req.userId);
  let rotation = getCurrentRotation(config.cycle_start_date, today);

  // Check academic override
  const tasks = db.prepare(`
    SELECT t.*, p.name as pillar_name FROM tasks t
    LEFT JOIN pillars p ON t.pillar_id = p.id
    WHERE t.type = 'deadline' AND t.status != 'completed' AND t.user_id = ?
  `).all(req.userId);
  rotation = checkAcademicOverride(tasks, rotation);

  if (config.current_override) {
    rotation.primary = config.current_override;
    rotation.overridden = true;
  }

  // Today's blocks
  const blocks = db.prepare(`
    SELECT tb.*, p.name as pillar_name, p.color as pillar_color
    FROM time_blocks tb
    LEFT JOIN pillars p ON tb.pillar_id = p.id
    WHERE tb.date = ? AND tb.user_id = ?
    ORDER BY tb.block_number
  `).all(today, req.userId);

  // Streaks for habits
  const habits = db.prepare('SELECT * FROM habits WHERE user_id = ?').all(req.userId);
  const streaks = habits.map(h => {
    const logs = db.prepare(
      'SELECT * FROM habit_logs WHERE habit_id = ? AND completed = 1 ORDER BY date DESC'
    ).all(h.id);

    let streak = 0;
    const d = new Date(today);
    for (let i = 0; i < 365; i++) {
      const dateStr = d.toISOString().split('T')[0];
      const found = logs.find(l => l.date === dateStr);
      if (found) {
        streak++;
      } else if (i > 0) {
        break;
      }
      d.setDate(d.getDate() - 1);
    }

    return { id: h.id, name: h.name, streak };
  });

  // Upcoming deadlines
  const deadlines = db.prepare(`
    SELECT t.*, p.name as pillar_name, p.color as pillar_color
    FROM tasks t
    LEFT JOIN pillars p ON t.pillar_id = p.id
    WHERE t.type = 'deadline' AND t.status != 'completed' AND t.deadline >= ? AND t.user_id = ?
    ORDER BY t.deadline ASC
    LIMIT 5
  `).all(today, req.userId);

  // Daily quote
  const dayNum = Math.floor((new Date(today).getTime() / (24 * 60 * 60 * 1000)));
  const quoteCount = db.prepare('SELECT COUNT(*) as cnt FROM quotes').get().cnt;
  const quoteIndex = (dayNum % quoteCount) + 1;
  const quote = db.prepare('SELECT * FROM quotes WHERE id = ?').get(quoteIndex) ||
    db.prepare('SELECT * FROM quotes LIMIT 1').get();

  // Pillars
  const pillars = db.prepare('SELECT * FROM pillars WHERE user_id = ?').all(req.userId);

  res.json({
    rotation,
    blocks,
    streaks,
    deadlines,
    quote,
    pillars,
    today,
    dayOfWeek,
    isSunday: dayOfWeek === 0,
  });
});

module.exports = router;
