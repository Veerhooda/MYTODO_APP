const express = require('express');
const { getDb } = require('../db/schema');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, (req, res) => {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];

  const habits = db.prepare(`
    SELECT h.*, p.name as pillar_name, p.color as pillar_color
    FROM habits h
    LEFT JOIN pillars p ON h.pillar_id = p.id
    WHERE h.user_id = ?
  `).all(req.userId);

  // Get Monday of current week
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const weekStart = monday.toISOString().split('T')[0];

  const result = habits.map(h => {
    // Week logs
    const weekLogs = db.prepare(
      'SELECT * FROM habit_logs WHERE habit_id = ? AND date >= ? ORDER BY date'
    ).all(h.id, weekStart);

    // Streak calculation
    const allLogs = db.prepare(
      'SELECT * FROM habit_logs WHERE habit_id = ? AND completed = 1 ORDER BY date DESC'
    ).all(h.id);

    let streak = 0;
    const d = new Date(today);
    for (let i = 0; i < 365; i++) {
      const dateStr = d.toISOString().split('T')[0];
      const found = allLogs.find(l => l.date === dateStr);
      if (found) {
        streak++;
      } else if (i > 0) {
        break;
      }
      d.setDate(d.getDate() - 1);
    }

    // Completion rate (last 4 weeks)
    const fourWeeksAgo = new Date(now);
    fourWeeksAgo.setDate(now.getDate() - 28);
    const recentLogs = db.prepare(
      'SELECT COUNT(*) as cnt FROM habit_logs WHERE habit_id = ? AND completed = 1 AND date >= ?'
    ).get(h.id, fourWeeksAgo.toISOString().split('T')[0]);
    const completionRate = Math.round((recentLogs.cnt / (h.target_per_week * 4)) * 100);

    return {
      ...h,
      streak,
      completionRate: Math.min(completionRate, 100),
      weekLogs,
      completedThisWeek: weekLogs.filter(l => l.completed).length,
    };
  });

  res.json(result);
});

router.post('/:id/log', authMiddleware, (req, res) => {
  const db = getDb();
  const { date, done_condition_note } = req.body;
  const logDate = date || new Date().toISOString().split('T')[0];

  // Auth check
  const habit = db.prepare('SELECT id FROM habits WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!habit) return res.status(403).json({ error: 'Unauthorized' });

  // Upsert
  const existing = db.prepare('SELECT * FROM habit_logs WHERE habit_id = ? AND date = ?')
    .get(req.params.id, logDate);

  if (existing) {
    db.prepare('UPDATE habit_logs SET completed = 1, done_condition_note = ? WHERE id = ?')
      .run(done_condition_note, existing.id);
  } else {
    db.prepare('INSERT INTO habit_logs (habit_id, date, completed, done_condition_note) VALUES (?, ?, 1, ?)')
      .run(req.params.id, logDate, done_condition_note);
  }

  res.json({ success: true });
});

router.delete('/:id/log', authMiddleware, (req, res) => {
  const db = getDb();
  const { date } = req.body;
  const logDate = date || new Date().toISOString().split('T')[0];

  // Auth check
  const habit = db.prepare('SELECT id FROM habits WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!habit) return res.status(403).json({ error: 'Unauthorized' });

  db.prepare('DELETE FROM habit_logs WHERE habit_id = ? AND date = ?')
    .run(req.params.id, logDate);

  res.json({ success: true });
});

module.exports = router;
