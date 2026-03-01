const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'productivity.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function initDb() {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS user (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS pillars (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      color TEXT NOT NULL,
      goals TEXT NOT NULL DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS rotation_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cycle_start_date TEXT NOT NULL,
      current_override TEXT DEFAULT NULL
    );

    CREATE TABLE IF NOT EXISTS time_blocks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      block_number INTEGER NOT NULL,
      pillar_id INTEGER,
      task_title TEXT,
      start_time TEXT NOT NULL,
      duration INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      is_recurring INTEGER NOT NULL DEFAULT 0,
      day_of_week INTEGER,
      FOREIGN KEY (pillar_id) REFERENCES pillars(id)
    );

    CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      pillar_id INTEGER NOT NULL,
      target_per_week INTEGER NOT NULL,
      FOREIGN KEY (pillar_id) REFERENCES pillars(id)
    );

    CREATE TABLE IF NOT EXISTS habit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      done_condition_note TEXT,
      FOREIGN KEY (habit_id) REFERENCES habits(id),
      UNIQUE(habit_id, date)
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('daily','project','deadline')),
      pillar_id INTEGER,
      estimated_time INTEGER,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','in_progress','completed','cancelled')),
      notes TEXT,
      completion_reflection TEXT,
      deadline TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (pillar_id) REFERENCES pillars(id)
    );

    CREATE TABLE IF NOT EXISTS weekly_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      week_start TEXT UNIQUE NOT NULL,
      wins TEXT DEFAULT '[]',
      skill_growth TEXT DEFAULT '{}',
      consistency_score INTEGER,
      energy_reflection TEXT,
      adjustment TEXT
    );

    CREATE TABLE IF NOT EXISTS monthly_reflections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      month TEXT UNIQUE NOT NULL,
      output_shipped TEXT,
      practice_volume TEXT,
      bottleneck TEXT,
      strategic_change TEXT,
      next_primary TEXT
    );

    CREATE TABLE IF NOT EXISTS quotes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      author TEXT
    );
  `);

  return db;
}

module.exports = { getDb, initDb };
