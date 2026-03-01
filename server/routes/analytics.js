const express = require('express');
const { getDb } = require('../db/schema');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, (req, res) => {
  const db = getDb();
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Monday of this week
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const weekStart = monday.toISOString().split('T')[0];
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const weekEnd = sunday.toISOString().split('T')[0];

  const hoursPerPillar = db.prepare(`
    SELECT p.name, p.color, COALESCE(SUM(tb.duration), 0) as total_minutes
    FROM pillars p
    LEFT JOIN time_blocks tb ON tb.pillar_id = p.id
      AND tb.date >= ? AND tb.date <= ?
      AND tb.status = 'completed' AND tb.user_id = ?
    WHERE p.user_id = ?
    GROUP BY p.id
  `).all(weekStart, weekEnd, req.userId, req.userId);

  // Streak graph (last 28 days)
  const fourWeeksAgo = new Date(today);
  fourWeeksAgo.setDate(today.getDate() - 28);
  const streakData = db.prepare(`
    SELECT hl.date, COUNT(*) as completions
    FROM habit_logs hl
    JOIN habits h ON hl.habit_id = h.id
    WHERE hl.completed = 1 AND hl.date >= ? AND h.user_id = ?
    GROUP BY hl.date
    ORDER BY hl.date
  `).all(fourWeeksAgo.toISOString().split('T')[0], req.userId);

  // Deep work completion %
  const totalBlocks = db.prepare(
    'SELECT COUNT(*) as cnt FROM time_blocks WHERE date >= ? AND date <= ? AND user_id = ?'
  ).get(weekStart, weekEnd, req.userId).cnt;
  const completedBlocks = db.prepare(
    'SELECT COUNT(*) as cnt FROM time_blocks WHERE date >= ? AND date <= ? AND status = ? AND user_id = ?'
  ).get(weekStart, weekEnd, 'completed', req.userId).cnt;
  const deepWorkPct = totalBlocks > 0 ? Math.round((completedBlocks / totalBlocks) * 100) : 0;

  // Focus consistency trend (last 4 weeks)
  const trends = [];
  for (let w = 3; w >= 0; w--) {
    const ws = new Date(monday);
    ws.setDate(monday.getDate() - (w * 7));
    const we = new Date(ws);
    we.setDate(ws.getDate() + 6);
    const wsStr = ws.toISOString().split('T')[0];
    const weStr = we.toISOString().split('T')[0];

    const total = db.prepare(
      'SELECT COUNT(*) as cnt FROM time_blocks WHERE date >= ? AND date <= ? AND user_id = ?'
    ).get(wsStr, weStr, req.userId).cnt;
    const completed = db.prepare(
      'SELECT COUNT(*) as cnt FROM time_blocks WHERE date >= ? AND date <= ? AND status = ? AND user_id = ?'
    ).get(wsStr, weStr, 'completed', req.userId).cnt;

    trends.push({
      week_start: wsStr,
      completion_pct: total > 0 ? Math.round((completed / total) * 100) : 0,
    });
  }

  // Burnout risk: completion < 50% for 5 consecutive days
  let burnoutRisk = false;
  let lowDays = 0;
  for (let d = 6; d >= 0; d--) {
    const checkDate = new Date(monday);
    checkDate.setDate(monday.getDate() + d);
    const checkStr = checkDate.toISOString().split('T')[0];
    if (checkDate > today) continue;

    const dayTotal = db.prepare(
      'SELECT COUNT(*) as cnt FROM time_blocks WHERE date = ? AND user_id = ?'
    ).get(checkStr, req.userId).cnt;
    const dayDone = db.prepare(
      'SELECT COUNT(*) as cnt FROM time_blocks WHERE date = ? AND status = ? AND user_id = ?'
    ).get(checkStr, 'completed', req.userId).cnt;

    if (dayTotal > 0 && (dayDone / dayTotal) < 0.5) {
      lowDays++;
    } else {
      lowDays = 0;
    }
    if (lowDays >= 5) {
      burnoutRisk = true;
      break;
    }
  }

  res.json({
    hoursPerPillar: hoursPerPillar.map(h => ({ ...h, hours: Math.round(h.total_minutes / 60 * 10) / 10 })),
    streakData,
    deepWorkPct,
    trends,
    burnoutRisk,
  });
});

module.exports = router;
