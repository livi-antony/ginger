const Database = require('better-sqlite3');
const path = require('node:path');
const { app } = require('electron');

// Store the DB file in the app's user-data folder — the OS-blessed place
// for app data. It persists across restarts and app updates.
const dbPath = path.join(app.getPath('userData'), 'ginger.db');
const db = new Database(dbPath);

// Safer defaults: WAL mode = better performance + resilience.
db.pragma('journal_mode = WAL');

// --- Schema ---
// We use ONE table for the folder hierarchy (areas/sections/subsections),
// distinguished by a `type` column and a `parent_id` pointing upward.
// Tasks are separate, and attach to any node via `parent_id` + `parent_type`.
db.exec(`
  CREATE TABLE IF NOT EXISTS nodes (
    id         TEXT PRIMARY KEY,
    type       TEXT NOT NULL,          -- 'area' | 'section' | 'subsection'
    name       TEXT NOT NULL,
    parent_id  TEXT,                   -- NULL for areas
    archived   INTEGER NOT NULL DEFAULT 0,
    position   INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id           TEXT PRIMARY KEY,
    name         TEXT NOT NULL,
    done         INTEGER NOT NULL DEFAULT 0,
    parent_id    TEXT NOT NULL,        -- which node it belongs to
    position     INTEGER NOT NULL DEFAULT 0
  );
`);

module.exports = { db };