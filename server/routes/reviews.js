const express = require('express');
const { getDb } = require('../db/schema');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Weekly review
router.get('/weekly/:weekStart', authMiddleware, (req, res) => {
  const db = getDb();
  let review = db.prepare('SELECT * FROM weekly_reviews WHERE week_start = ?').get(req.params.weekStart);

  if (!review) {
    db.prepare('INSERT INTO weekly_reviews (week_start) VALUES (?)').run(req.params.weekStart);
    review = db.prepare('SELECT * FROM weekly_reviews WHERE week_start = ?').get(req.params.weekStart);
  }

  // Parse JSON fields
  review.wins = JSON.parse(review.wins || '[]');
  review.skill_growth = JSON.parse(review.skill_growth || '{}');
  res.json(review);
});

router.put('/weekly/:weekStart', authMiddleware, (req, res) => {
  const db = getDb();
  const { wins, skill_growth, consistency_score, energy_reflection, adjustment } = req.body;

  db.prepare(`
    UPDATE weekly_reviews SET
      wins = ?,
      skill_growth = ?,
      consistency_score = ?,
      energy_reflection = ?,
      adjustment = ?
    WHERE week_start = ?
  `).run(
    JSON.stringify(wins || []),
    JSON.stringify(skill_growth || {}),
    consistency_score,
    energy_reflection,
    adjustment,
    req.params.weekStart
  );

  res.json({ success: true });
});

// Monthly reflection
router.get('/monthly/:month', authMiddleware, (req, res) => {
  const db = getDb();
  let reflection = db.prepare('SELECT * FROM monthly_reflections WHERE month = ?').get(req.params.month);

  if (!reflection) {
    db.prepare('INSERT INTO monthly_reflections (month) VALUES (?)').run(req.params.month);
    reflection = db.prepare('SELECT * FROM monthly_reflections WHERE month = ?').get(req.params.month);
  }

  res.json(reflection);
});

router.put('/monthly/:month', authMiddleware, (req, res) => {
  const db = getDb();
  const { output_shipped, practice_volume, bottleneck, strategic_change, next_primary } = req.body;

  db.prepare(`
    UPDATE monthly_reflections SET
      output_shipped = ?,
      practice_volume = ?,
      bottleneck = ?,
      strategic_change = ?,
      next_primary = ?
    WHERE month = ?
  `).run(output_shipped, practice_volume, bottleneck, strategic_change, next_primary, req.params.month);

  res.json({ success: true });
});

module.exports = router;
