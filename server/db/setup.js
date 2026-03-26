const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'medscribe.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema();
  }
  return db;
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS consultations (
      id TEXT PRIMARY KEY,
      doctor_name TEXT NOT NULL,
      doctor_crm TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      audio_duration_seconds INTEGER,
      status TEXT DEFAULT 'recording',
      transcription TEXT,
      anamnesis JSON,
      hypotheses JSON,
      exams JSON,
      treatment TEXT,
      patient_summary TEXT
    )
  `);
}

module.exports = { getDb };
