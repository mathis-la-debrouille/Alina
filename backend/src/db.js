// src/db.js
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config();

let db;

if (process.env.NODE_ENV === 'production') {
  db = new sqlite3.Database(':memory:');
} else {
  const dbPath = path.resolve(__dirname, '../db/alina-database.db');
  db = new sqlite3.Database(dbPath);
}

db.serialize(() => {
  // Create users table with alina_config field
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstname TEXT,
    email TEXT UNIQUE,
    password TEXT,
    alina_id INTEGER,
    role TEXT CHECK(role IN ('admin', 'simple')) NOT NULL DEFAULT 'simple',
    alina_config TEXT DEFAULT '{"accent": "french", "gender": "female", "age": "young"}'
  )`);

  // Create asks table
  db.run(`CREATE TABLE IF NOT EXISTS asks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    question TEXT,
    answer TEXT,
    audio_response_s3_url TEXT,
    ask_date TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  // Create default admin user with hashed password
  const adminPassword = bcrypt.hashSync('alina654__admin', 10);
  db.run(`INSERT OR IGNORE INTO users (firstname, email, password, role) VALUES ('adminalina', 'admin@alina.com', ?, 'admin')`, [adminPassword]);
});

module.exports = db;
