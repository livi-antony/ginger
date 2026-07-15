import { randomUUID } from 'node:crypto';

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

// Read everything and rebuild the nested tree the UI expects.
function getTree() {
  // Pull all rows (skip archived for now).
  const nodes = db.prepare(
    `SELECT * FROM nodes WHERE archived = 0 ORDER BY position, name`
  ).all();
  const tasks = db.prepare(
    `SELECT * FROM tasks ORDER BY position`
  ).all();

  // Helper: get tasks belonging to a given node id, as {id, name, done}.
  const tasksFor = (nodeId) =>
    tasks
      .filter((t) => t.parent_id === nodeId)
      .map((t) => ({ id: t.id, name: t.name, done: t.done === 1 }));

  // Helper: get child nodes of a given parent (or top-level areas if null).
  const childrenOf = (parentId, type) =>
    nodes.filter((n) => n.parent_id === parentId && n.type === type);

  // Build areas → sections → subsections, attaching tasks at each level.
  const areas = childrenOf(null, 'area').map((area) => ({
    id: area.id,
    name: area.name,
    tasks: tasksFor(area.id),
    sections: childrenOf(area.id, 'section').map((section) => ({
      id: section.id,
      name: section.name,
      tasks: tasksFor(section.id),
      subsections: childrenOf(section.id, 'subsection').map((sub) => ({
        id: sub.id,
        name: sub.name,
        tasks: tasksFor(sub.id),
      })),
    })),
  }));

  return areas;
}

// Create a new node (area/section/subsection) and return it.
function addNode({ type, name, parentId = null }) {
  const id = randomUUID();
  db.prepare(
    `INSERT INTO nodes (id, type, name, parent_id) VALUES (?, ?, ?, ?)`
  ).run(id, type, name, parentId);
  return { id, type, name, parentId };
}

function addTask({ name, parentId }) {
  const id = randomUUID();
  db.prepare(
    `INSERT INTO tasks (id, name, parent_id) VALUES (?, ?, ?)`
  ).run(id, name, parentId);
  return { id, name, parentId };
}

function renameNode(id, name) {
  db.prepare(`UPDATE nodes SET name = ? WHERE id = ?`).run(name, id);
}

function renameTask(id, name) {
  db.prepare(`UPDATE tasks SET name = ? WHERE id = ?`).run(name, id);
}

export { db, getTree, addNode, addTask, renameNode, renameTask };