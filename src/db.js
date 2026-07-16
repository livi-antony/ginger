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
    id             TEXT PRIMARY KEY,
    name           TEXT NOT NULL,
    done           INTEGER NOT NULL DEFAULT 0,
    parent_id      TEXT NOT NULL,
    parent_task_id TEXT,
    position       INTEGER NOT NULL DEFAULT 0
  );
`);

// Migration: add parent_task_id if an older tasks table lacks it.
const taskCols = db.prepare(`PRAGMA table_info(tasks)`).all();
if (!taskCols.some((c) => c.name === 'parent_task_id')) {
  db.exec(`ALTER TABLE tasks ADD COLUMN parent_task_id TEXT`);
}

// Read everything and rebuild the nested tree the UI expects.
function getTree() {
  const nodes = db.prepare(
    `SELECT * FROM nodes WHERE archived = 0 ORDER BY position, name`
  ).all();
  const allTasks = db.prepare(`SELECT * FROM tasks ORDER BY position`).all();

  // Recursively build a task and its subtasks.
  const buildTask = (t) => ({
    id: t.id,
    name: t.name,
    done: t.done === 1,
    subtasks: allTasks
      .filter((c) => c.parent_task_id === t.id)
      .map(buildTask),
  });

  // Top-level tasks of a node = tasks with this parent_id and NO parent_task.
  const tasksFor = (nodeId) =>
    allTasks
      .filter((t) => t.parent_id === nodeId && !t.parent_task_id)
      .map(buildTask);

  const childrenOf = (parentId, type) =>
    nodes.filter((n) => n.parent_id === parentId && n.type === type);

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

function archiveNode(id) {
  db.prepare(`UPDATE nodes SET archived = 1 WHERE id = ?`).run(id);
}

function deleteNode(id) {
  // Delete the node, its descendant nodes, and all their tasks.
  // Gather this node + all nodes beneath it.
  const toDelete = [id];
  let frontier = [id];
  while (frontier.length) {
    const children = db
      .prepare(`SELECT id FROM nodes WHERE parent_id IN (${frontier.map(() => '?').join(',')})`)
      .all(...frontier)
      .map((r) => r.id);
    toDelete.push(...children);
    frontier = children;
  }
  const placeholders = toDelete.map(() => '?').join(',');
  db.prepare(`DELETE FROM tasks WHERE parent_id IN (${placeholders})`).run(...toDelete);
  db.prepare(`DELETE FROM nodes WHERE id IN (${placeholders})`).run(...toDelete);
}

function deleteTask(id) {
  const cascade = (tid) => {
    const kids = db.prepare(`SELECT id FROM tasks WHERE parent_task_id = ?`).all(tid);
    for (const k of kids) cascade(k.id);
    db.prepare(`DELETE FROM tasks WHERE id = ?`).run(tid);
  };
  cascade(id);
}

// Walk up from a task's parent, setting each ancestor done iff all its children are done.
function rollUp(startParentId) {
  let parentId = startParentId;
  while (parentId) {
    const siblings = db.prepare(`SELECT done FROM tasks WHERE parent_task_id = ?`).all(parentId);
    const allDone = siblings.length > 0 && siblings.every((s) => s.done === 1);
    db.prepare(`UPDATE tasks SET done = ? WHERE id = ?`).run(allDone ? 1 : 0, parentId);
    const row = db.prepare(`SELECT parent_task_id FROM tasks WHERE id = ?`).get(parentId);
    parentId = row ? row.parent_task_id : null;
  }
}

function addSubtask({ name, parentId, parentTaskId }) {
  const id = randomUUID();
  db.prepare(
    `INSERT INTO tasks (id, name, parent_id, parent_task_id) VALUES (?, ?, ?, ?)`
  ).run(id, name, parentId, parentTaskId);

  // A new subtask is incomplete, so its parent (and ancestors) can't be "all done".
  // Re-run the roll-up from the new subtask to fix any now-stale completed parents.
  rollUp(parentTaskId);

  return { id };
}

// Set a task done/undone, cascade DOWN to all descendants,
// then roll UP: any ancestor becomes done iff all its children are done.
function setTaskDone(taskId, done) {
  const doneVal = done ? 1 : 0;

  // 1. Set this task.
  db.prepare(`UPDATE tasks SET done = ? WHERE id = ?`).run(doneVal, taskId);

  // 2. Cascade down to all descendants.
  const cascade = (id) => {
    const kids = db.prepare(`SELECT id FROM tasks WHERE parent_task_id = ?`).all(id);
    for (const k of kids) {
      db.prepare(`UPDATE tasks SET done = ? WHERE id = ?`).run(doneVal, k.id);
      cascade(k.id);
    }
  };
  cascade(taskId);

  // 3. Roll up through ancestors.
  const row = db.prepare(`SELECT parent_task_id FROM tasks WHERE id = ?`).get(taskId);
  rollUp(row ? row.parent_task_id : null);
}

export { db, getTree, addNode, addTask, addSubtask, renameNode, renameTask, setTaskDone, archiveNode, deleteNode, deleteTask };