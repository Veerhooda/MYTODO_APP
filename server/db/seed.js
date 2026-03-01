const bcrypt = require('bcryptjs');
const { getDb, initDb } = require('./schema');

function seed() {
  const db = initDb();

  // Clear existing data
  db.exec(`
    DELETE FROM habit_logs;
    DELETE FROM habits;
    DELETE FROM time_blocks;
    DELETE FROM tasks;
    DELETE FROM weekly_reviews;
    DELETE FROM monthly_reflections;
    DELETE FROM quotes;
    DELETE FROM rotation_config;
    DELETE FROM pillars;
    DELETE FROM user;
  `);

  // Seed user
  const hash = bcrypt.hashSync('veer123', 10);
  db.prepare('INSERT INTO user (username, password_hash) VALUES (?, ?)').run('veer', hash);

  // Seed pillars
  const pillars = [
    { name: 'Competitive Programming', color: '#6c63ff', goals: JSON.stringify(['DSA Practice', 'Codeforces', 'TLE Sheet']) },
    { name: 'Systems', color: '#00d4aa', goals: JSON.stringify(['Linux Mastery', 'AI OS']) },
    { name: 'Development', color: '#ff9f43', goals: JSON.stringify(['Full Stack', 'Aura One']) },
    { name: 'Academics', color: '#ff6b6b', goals: JSON.stringify(['Assignments', 'CS50']) },
  ];

  const insertPillar = db.prepare('INSERT INTO pillars (name, color, goals) VALUES (?, ?, ?)');
  for (const p of pillars) {
    insertPillar.run(p.name, p.color, p.goals);
  }

  // Seed rotation config – Week A starts this Monday
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const cycleStart = monday.toISOString().split('T')[0];
  db.prepare('INSERT INTO rotation_config (cycle_start_date) VALUES (?)').run(cycleStart);

  // Seed habits
  const habits = [
    { name: 'DSA Practice', pillar_id: 1, target: 5 },
    { name: 'Codeforces Practice', pillar_id: 1, target: 2 },
    { name: 'TLE Sheet', pillar_id: 1, target: 3 },
    { name: 'Linux Practice', pillar_id: 2, target: 5 },
  ];

  const insertHabit = db.prepare('INSERT INTO habits (name, pillar_id, target_per_week) VALUES (?, ?, ?)');
  for (const h of habits) {
    insertHabit.run(h.name, h.pillar_id, h.target);
  }

  // Seed quotes
  const quotes = [
    { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
    { text: 'Discipline is choosing between what you want now and what you want most.', author: 'Abraham Lincoln' },
    { text: 'Consistency is what transforms average into excellence.', author: 'Unknown' },
    { text: 'It does not matter how slowly you go as long as you do not stop.', author: 'Confucius' },
    { text: 'Suffer the pain of discipline or suffer the pain of regret.', author: 'Jim Rohn' },
    { text: 'The compound effect is the principle of reaping huge rewards from small, seemingly insignificant actions.', author: 'Darren Hardy' },
    { text: 'What you do every day matters more than what you do once in a while.', author: 'Gretchen Rubin' },
    { text: 'Success is the sum of small efforts repeated day in and day out.', author: 'Robert Collier' },
    { text: 'Hard work beats talent when talent doesn\'t work hard.', author: 'Tim Notke' },
    { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  ];

  const insertQuote = db.prepare('INSERT INTO quotes (text, author) VALUES (?, ?)');
  for (const q of quotes) {
    insertQuote.run(q.text, q.author);
  }

  // Seed sample tasks
  const sampleTasks = [
    { title: 'Complete TLE Sheet Section 1', type: 'project', pillar_id: 1, estimated_time: 120, deadline: null },
    { title: 'CS50 Problem Set 4', type: 'deadline', pillar_id: 4, estimated_time: 180, deadline: '2026-03-08' },
    { title: 'Set up Linux dual boot', type: 'project', pillar_id: 2, estimated_time: 240, deadline: null },
    { title: 'Aura One landing page', type: 'project', pillar_id: 3, estimated_time: 300, deadline: null },
  ];

  const insertTask = db.prepare('INSERT INTO tasks (title, type, pillar_id, estimated_time, deadline) VALUES (?, ?, ?, ?, ?)');
  for (const t of sampleTasks) {
    insertTask.run(t.title, t.type, t.pillar_id, t.estimated_time, t.deadline);
  }

  console.log('Database seeded successfully.');
}

seed();
