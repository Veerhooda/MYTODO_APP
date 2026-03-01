const express = require('express');
const { getDb } = require('../db/schema');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// --- Helper: compute weekly stats ---
function getWeekStats(db, weekStart) {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const endStr = weekEnd.toISOString().split('T')[0];

  const blocks = db.prepare(`
    SELECT tb.*, p.name as pillar_name, p.color as pillar_color
    FROM time_blocks tb LEFT JOIN pillars p ON tb.pillar_id = p.id
    WHERE tb.date >= ? AND tb.date <= ?
  `).all(weekStart, endStr);

  const totalBlocks = blocks.length;
  const completed = blocks.filter(b => b.status === 'completed').length;
  const missed = blocks.filter(b => b.status === 'missed').length;
  const completionRate = totalBlocks > 0 ? Math.round((completed / totalBlocks) * 100) : 0;

  // Hours per pillar
  const pillarHours = {};
  blocks.filter(b => b.status === 'completed').forEach(b => {
    const name = b.pillar_name || 'General';
    pillarHours[name] = (pillarHours[name] || 0) + (b.duration / 60);
  });

  const totalHours = Object.values(pillarHours).reduce((s, h) => s + h, 0).toFixed(1);

  // Habit stats
  const habitLogs = db.prepare(`
    SELECT hl.*, h.name as habit_name FROM habit_logs hl
    JOIN habits h ON hl.habit_id = h.id
    WHERE hl.date >= ? AND hl.date <= ? AND hl.completed = 1
  `).all(weekStart, endStr);

  // Task stats
  const tasksCompleted = db.prepare(`
    SELECT COUNT(*) as count FROM tasks
    WHERE status = 'completed' AND created_at >= ? AND created_at <= ?
  `).get(weekStart, endStr + ' 23:59:59');

  const tasksCreated = db.prepare(`
    SELECT COUNT(*) as count FROM tasks
    WHERE created_at >= ? AND created_at <= ?
  `).get(weekStart, endStr + ' 23:59:59');

  return {
    totalBlocks,
    completedBlocks: completed,
    missedBlocks: missed,
    completionRate,
    pillarHours,
    totalHours: parseFloat(totalHours),
    habitsCompleted: habitLogs.length,
    tasksCompleted: tasksCompleted.count,
    tasksCreated: tasksCreated.count,
  };
}

// --- Weekly Review ---
router.get('/weekly/:weekStart', authMiddleware, (req, res) => {
  const db = getDb();
  const weekStart = req.params.weekStart;

  let review = db.prepare('SELECT * FROM weekly_reviews WHERE week_start = ?').get(weekStart);
  if (!review) {
    db.prepare('INSERT INTO weekly_reviews (week_start) VALUES (?)').run(weekStart);
    review = db.prepare('SELECT * FROM weekly_reviews WHERE week_start = ?').get(weekStart);
  }

  // Parse JSON fields
  review.wins = JSON.parse(review.wins || '[]');
  review.skill_growth = JSON.parse(review.skill_growth || '{}');
  review.key_learnings = JSON.parse(review.key_learnings || '[]');
  review.blockers = JSON.parse(review.blockers || '[]');
  review.next_week_intentions = JSON.parse(review.next_week_intentions || '[]');

  // Auto-computed stats
  const stats = getWeekStats(db, weekStart);

  res.json({ ...review, stats });
});

router.put('/weekly/:weekStart', authMiddleware, (req, res) => {
  const db = getDb();
  const {
    wins, skill_growth, consistency_score, energy_reflection,
    adjustment, key_learnings, blockers, mood, next_week_intentions, gratitude
  } = req.body;

  // Try updating new columns, fallback gracefully
  try {
    db.prepare(`
      UPDATE weekly_reviews SET
        wins = ?, skill_growth = ?, consistency_score = ?, energy_reflection = ?,
        adjustment = ?, key_learnings = ?, blockers = ?, mood = ?,
        next_week_intentions = ?, gratitude = ?
      WHERE week_start = ?
    `).run(
      JSON.stringify(wins || []), JSON.stringify(skill_growth || {}),
      consistency_score, energy_reflection, adjustment,
      JSON.stringify(key_learnings || []), JSON.stringify(blockers || []),
      mood, JSON.stringify(next_week_intentions || []), gratitude,
      req.params.weekStart
    );
  } catch {
    // Fallback for old schema
    db.prepare(`
      UPDATE weekly_reviews SET wins = ?, skill_growth = ?, consistency_score = ?, energy_reflection = ?, adjustment = ?
      WHERE week_start = ?
    `).run(JSON.stringify(wins || []), JSON.stringify(skill_growth || {}), consistency_score, energy_reflection, adjustment, req.params.weekStart);
  }

  res.json({ success: true });
});

// --- Monthly Reflection ---
router.get('/monthly/:month', authMiddleware, (req, res) => {
  const db = getDb();
  const month = req.params.month;

  let reflection = db.prepare('SELECT * FROM monthly_reflections WHERE month = ?').get(month);
  if (!reflection) {
    db.prepare('INSERT INTO monthly_reflections (month) VALUES (?)').run(month);
    reflection = db.prepare('SELECT * FROM monthly_reflections WHERE month = ?').get(month);
  }

  // Parse JSON
  reflection.monthly_goals = JSON.parse(reflection.monthly_goals || '[]');
  reflection.goals_met = JSON.parse(reflection.goals_met || '[]');

  // Auto-compute monthly stats
  const monthStart = month + '-01';
  const nextMonth = new Date(month + '-01');
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const monthEnd = nextMonth.toISOString().split('T')[0];

  const blocks = db.prepare(`
    SELECT tb.*, p.name as pillar_name FROM time_blocks tb
    LEFT JOIN pillars p ON tb.pillar_id = p.id
    WHERE tb.date >= ? AND tb.date < ?
  `).all(monthStart, monthEnd);

  const completedBlocks = blocks.filter(b => b.status === 'completed');
  const pillarBreakdown = {};
  completedBlocks.forEach(b => {
    const name = b.pillar_name || 'General';
    if (!pillarBreakdown[name]) pillarBreakdown[name] = { hours: 0, blocks: 0 };
    pillarBreakdown[name].hours += b.duration / 60;
    pillarBreakdown[name].blocks += 1;
  });

  const habitsCompleted = db.prepare(`
    SELECT COUNT(*) as count FROM habit_logs
    WHERE date >= ? AND date < ? AND completed = 1
  `).get(monthStart, monthEnd);

  const tasksCompleted = db.prepare(
    `SELECT COUNT(*) as count FROM tasks WHERE status = 'completed' AND created_at >= ? AND created_at < ?`
  ).get(monthStart, monthEnd);

  const totalTasks = db.prepare(
    `SELECT COUNT(*) as count FROM tasks WHERE created_at >= ? AND created_at < ?`
  ).get(monthStart, monthEnd);

  // Weekly reviews for this month
  const reviews = db.prepare(`
    SELECT * FROM weekly_reviews WHERE week_start >= ? AND week_start < ?
  `).all(monthStart, monthEnd);

  const avgConsistency = reviews.length > 0
    ? Math.round(reviews.reduce((s, r) => s + (r.consistency_score || 0), 0) / reviews.length)
    : 0;

  const totalHours = Object.values(pillarBreakdown).reduce((s, p) => s + p.hours, 0).toFixed(1);

  reflection.monthlyStats = {
    totalBlocks: blocks.length,
    completedBlocks: completedBlocks.length,
    completionRate: blocks.length > 0 ? Math.round((completedBlocks.length / blocks.length) * 100) : 0,
    totalHours: parseFloat(totalHours),
    pillarBreakdown,
    habitsCompleted: habitsCompleted.count,
    tasksCompleted: tasksCompleted.count,
    totalTasks: totalTasks.count,
    avgConsistency,
    weeksReviewed: reviews.length,
  };

  res.json(reflection);
});

router.put('/monthly/:month', authMiddleware, (req, res) => {
  const db = getDb();
  const {
    output_shipped, practice_volume, bottleneck, strategic_change,
    next_primary, monthly_goals, goals_met, habit_summary,
    biggest_win, overall_rating
  } = req.body;

  try {
    db.prepare(`
      UPDATE monthly_reflections SET
        output_shipped = ?, practice_volume = ?, bottleneck = ?,
        strategic_change = ?, next_primary = ?, monthly_goals = ?,
        goals_met = ?, habit_summary = ?, biggest_win = ?, overall_rating = ?
      WHERE month = ?
    `).run(
      output_shipped, practice_volume, bottleneck, strategic_change, next_primary,
      JSON.stringify(monthly_goals || []), JSON.stringify(goals_met || []),
      habit_summary, biggest_win, overall_rating, req.params.month
    );
  } catch {
    db.prepare(`
      UPDATE monthly_reflections SET output_shipped = ?, practice_volume = ?, bottleneck = ?, strategic_change = ?, next_primary = ?
      WHERE month = ?
    `).run(output_shipped, practice_volume, bottleneck, strategic_change, next_primary, req.params.month);
  }

  res.json({ success: true });
});

// --- Weekly Plans ---
router.get('/plan/:weekStart', authMiddleware, (req, res) => {
  const db = getDb();
  const weekStart = req.params.weekStart;

  let plan = null;
  try {
    plan = db.prepare('SELECT * FROM weekly_plans WHERE week_start = ?').get(weekStart);
  } catch { /* table may not exist yet */ }

  if (!plan) {
    try {
      db.prepare('INSERT INTO weekly_plans (week_start) VALUES (?)').run(weekStart);
      plan = db.prepare('SELECT * FROM weekly_plans WHERE week_start = ?').get(weekStart);
    } catch {
      plan = { week_start: weekStart, objectives: '[]', notes: '', time_budget: '{}' };
    }
  }

  plan.objectives = JSON.parse(plan.objectives || '[]');
  plan.time_budget = JSON.parse(plan.time_budget || '{}');

  res.json(plan);
});

router.put('/plan/:weekStart', authMiddleware, (req, res) => {
  const db = getDb();
  const { objectives, primary_focus, secondary_focus, notes, time_budget } = req.body;

  try {
    db.prepare(`
      UPDATE weekly_plans SET
        objectives = ?, primary_focus = ?, secondary_focus = ?, notes = ?, time_budget = ?
      WHERE week_start = ?
    `).run(
      JSON.stringify(objectives || []), primary_focus, secondary_focus, notes,
      JSON.stringify(time_budget || {}), req.params.weekStart
    );
  } catch { /* graceful fallback */ }

  res.json({ success: true });
});

module.exports = router;
