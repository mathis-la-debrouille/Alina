// src/db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

let db;

if (process.env.NODE_ENV === 'production') {
  // Use in-memory DB for production
  db = new sqlite3.Database(':memory:');
} else {
  // Use file-based DB for local dev
  const dbPath = path.resolve(__dirname, '../db/alina-database.db');
  db = new sqlite3.Database(dbPath);
}

module.exports = db;
