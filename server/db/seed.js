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
    DELETE FROM weekly_plans;
    DELETE FROM quotes;
    DELETE FROM rotation_config;
    DELETE FROM pillars;
    DELETE FROM user;
  `);

  // Seed users
  const hashVeer = bcrypt.hashSync('veer123', 10);
  const hashDev = bcrypt.hashSync('devpratap123', 10);
  
  const insertUser = db.prepare('INSERT INTO user (username, password_hash) VALUES (?, ?)');
  const veerResult = insertUser.run('veer', hashVeer);
  const devResult = insertUser.run('devpratap', hashDev);
  
  const veerId = veerResult.lastInsertRowid;
  const devId = devResult.lastInsertRowid;

  // Function to seed user-specific data
  const seedForUser = (userId, username) => {
    // 1. Seed Pillars
    const pillars = [
      { name: 'Competitive Programming', color: '#6c63ff', goals: JSON.stringify(['DSA Practice', 'Codeforces', 'TLE Sheet']) },
      { name: 'Systems', color: '#00d4aa', goals: JSON.stringify(['Linux Mastery', 'AI OS']) },
      { name: 'Development', color: '#ff9f43', goals: JSON.stringify(['Full Stack', 'Aura One']) },
      { name: 'Academics', color: '#ff6b6b', goals: JSON.stringify(['Assignments', 'CS50']) },
    ];

    const insertPillar = db.prepare('INSERT INTO pillars (user_id, name, color, goals) VALUES (?, ?, ?, ?)');
    const pillarIds = {};
    for (const p of pillars) {
      const res = insertPillar.run(userId, p.name, p.color, p.goals);
      pillarIds[p.name] = res.lastInsertRowid;
    }

    // 2. Seed rotation config – Week A starts this Monday
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    const cycleStart = monday.toISOString().split('T')[0];
    db.prepare('INSERT INTO rotation_config (user_id, cycle_start_date) VALUES (?, ?)').run(userId, cycleStart);

    // 3. Seed Habits
    const habits = [
      { name: 'DSA Practice', pillar_id: pillarIds['Competitive Programming'], target: 5 },
      { name: 'Codeforces Practice', pillar_id: pillarIds['Competitive Programming'], target: 2 },
      { name: 'TLE Sheet', pillar_id: pillarIds['Competitive Programming'], target: 3 },
      { name: 'Linux Practice', pillar_id: pillarIds['Systems'], target: 5 },
    ];

    const insertHabit = db.prepare('INSERT INTO habits (user_id, name, pillar_id, target_per_week) VALUES (?, ?, ?, ?)');
    for (const h of habits) {
      insertHabit.run(userId, h.name, h.pillar_id, h.target);
    }

    // 4. Seed Tasks
    const sampleTasks = [
      { title: 'Complete TLE Sheet Section 1', type: 'project', pillar_id: pillarIds['Competitive Programming'], estimated_time: 120, deadline: null },
      { title: 'CS50 Problem Set 4', type: 'deadline', pillar_id: pillarIds['Academics'], estimated_time: 180, deadline: '2026-03-08' },
      { title: 'Set up Linux dual boot', type: 'project', pillar_id: pillarIds['Systems'], estimated_time: 240, deadline: null },
      { title: 'Aura One landing page', type: 'project', pillar_id: pillarIds['Development'], estimated_time: 300, deadline: null },
      { title: 'Set up profile for ' + username, type: 'daily', pillar_id: null, estimated_time: 30, deadline: null }
    ];

    const insertTask = db.prepare('INSERT INTO tasks (user_id, title, type, pillar_id, estimated_time, deadline) VALUES (?, ?, ?, ?, ?, ?)');
    for (const t of sampleTasks) {
      insertTask.run(userId, t.title, t.type, t.pillar_id, t.estimated_time, t.deadline);
    }
  };

  // Run seed function for both users
  seedForUser(veerId, 'veer');
  seedForUser(devId, 'devpratap');

  // Seed Quotes (Global, no user_id)
  const quotes = [
    { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
    { text: 'Discipline is choosing between what you want now and what you want most.', author: 'Abraham Lincoln' },
    { text: 'Consistency is what transforms average into excellence.', author: 'Unknown' },
    { text: 'It does not matter how slowly you go as long as you do not stop.', author: 'Confucius' },
    { text: 'Suffer the pain of discipline or suffer the pain of regret.', author: 'Jim Rohn' },
    { text: 'The compound effect is the principle of reaping huge rewards from small, seemingly insignificant actions.', author: 'Darren Hardy' },
    { text: 'What you do every day matters more than what you do once in a while.', author: 'Gretchen Rubin' },
    { text: 'Success is the sum of small efforts repeated day in and day out.', author: 'Robert Collier' },
    { text: "Hard work beats talent when talent doesn't work hard.", author: 'Tim Notke' },
    { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  ];

  const insertQuote = db.prepare('INSERT INTO quotes (text, author) VALUES (?, ?)');
  for (const q of quotes) {
    insertQuote.run(q.text, q.author);
  }

  console.log('Database seeded successfully for users: veer, devpratap.');
}

seed();
