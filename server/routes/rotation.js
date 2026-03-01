const express = require('express');
const { getDb } = require('../db/schema');
const { authMiddleware } = require('../middleware/auth');
const { getCurrentRotation, checkAcademicOverride } = require('../utils/rotation');

const router = express.Router();

router.get('/', authMiddleware, (req, res) => {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];

  const config = db.prepare('SELECT * FROM rotation_config ORDER BY id DESC LIMIT 1').get();
  let rotation = getCurrentRotation(config.cycle_start_date, today);

  const tasks = db.prepare(`
    SELECT t.*, p.name as pillar_name FROM tasks t
    LEFT JOIN pillars p ON t.pillar_id = p.id
    WHERE t.type = 'deadline' AND t.status != 'completed'
  `).all();
  rotation = checkAcademicOverride(tasks, rotation);

  if (config.current_override) {
    rotation.primary = config.current_override;
    rotation.overridden = true;
  }

  res.json({ ...rotation, cycle_start_date: config.cycle_start_date });
});

router.put('/override', authMiddleware, (req, res) => {
  const db = getDb();
  const { primary } = req.body;

  if (primary) {
    db.prepare('UPDATE rotation_config SET current_override = ?').run(primary);
  } else {
    db.prepare('UPDATE rotation_config SET current_override = NULL').run();
  }

  res.json({ success: true });
});

module.exports = router;
