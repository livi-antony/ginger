import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AddButton from './components/AddButton.jsx';
import AddInput from './components/AddInput.jsx';
import AddRow from './components/AddRow.jsx';
import AreaHeader from './components/AreaHeader.jsx';
import Breadcrumb from './components/Breadcrumb.jsx';
import FolderRow from './components/FolderRow.jsx';
import TaskRow from './components/TaskRow.jsx';
import ContextMenu from './components/ContextMenu.jsx';
import ConfirmDialog from './components/ConfirmDialog.jsx';
import { Pencil, Archive, Trash2 } from 'lucide-react';

function App() {
  // The whole dataset lives in state so we can toggle tasks anywhere in it.
  const [data, setData] = useState([]);      // starts empty, filled from DB
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);   // is the input showing?
  const [newName, setNewName] = useState('');    // what's typed so far
  const [menu, setMenu] = useState(null);      // { x, y, kind, id, name } or null
  const [confirm, setConfirm] = useState(null); // { message, onConfirm } or null
  const [editingId, setEditingId] = useState(null);   // id of item being renamed
  const [addingSubtaskFor, setAddingSubtaskFor] = useState(null); // task id or null

  function toggleTaskDone(task, done) {
    window.ginger.setTaskDone(task.id, done).then(refresh);
  }

  function addSubtaskTo(taskName, parentTask) {
    window.ginger.addSubtask({
      name: taskName,
      parentId: currentNode.id,
      parentTaskId: parentTask.id,
    }).then(() => { setAddingSubtaskFor(null); refresh(); });
  }

  function startEdit(kind, id) {
    setEditingId(id);
  }

  // Load (or reload) the whole tree from the database.
  function refresh() {
    return window.ginger.getTree().then((tree) => {
      setData(tree);
      setLoading(false);
    });
  }

  // Fetch once when the app first loads.
  useEffect(() => {
    refresh();
  }, []);

  // `path` = where we are. [] = Areas list. ['a1'] = inside Study.
  // ['a1','s1'] = inside a Section. ['a1','s1','ss1'] = inside a Subsection.
  const [path, setPath] = useState([]);

  // --- Figure out what to display based on the path ---
  // Walk down the tree following the path to find the "current" node.
  let currentChildren = data;        // at root, children = the areas
  let currentNode = null;            // the node we're "inside" (null at root)
  let level = 'root';                // root | area | section | subsection
  const trail = [];                  // breadcrumb pieces

  if (path.length >= 1) {
    currentNode = data.find((a) => a.id === path[0]);
    trail.push({ id: currentNode.id, name: currentNode.name });
    level = 'area';
  }
  if (path.length >= 2) {
    currentNode = currentNode.sections.find((s) => s.id === path[1]);
    trail.push({ id: currentNode.id, name: currentNode.name });
    level = 'section';
  }
  if (path.length >= 3) {
    currentNode = currentNode.subsections.find((ss) => ss.id === path[2]);
    trail.push({ id: currentNode.id, name: currentNode.name });
    level = 'subsection';
  }

  // What folders show at this level?
  let folders = [];
  let folderLabel = '';
  if (level === 'root') {
    folders = data;
    folderLabel = 'Areas';
  } else if (level === 'area') {
    folders = currentNode.sections;
    folderLabel = 'Sections';
  } else if (level === 'section') {
    folders = currentNode.subsections;
    folderLabel = 'Subsections';
  }
  // Subsection level has no child folders — tasks only.

  // What tasks show? Root has none; otherwise the current node's tasks.
  const tasks = level === 'root' ? [] : currentNode.tasks;
  const orderedTasks = [...tasks].sort((a, b) => a.done - b.done);

  // --- Navigation ---
  function openFolder(id) {
    setPath([...path, id]);   // drill in: add to the path
  }

  function goToCrumb(depth) {
    setPath(path.slice(0, depth));  // jump: trim path to that depth
  }

  // --- Toggling a task, wherever it lives in the tree ---
  // We rebuild the tree, flipping the matching task's `done`.
  function toggleTask(taskId) {
    function flipInList(list) {
      return list.map((t) =>
        t.id === taskId ? { ...t, done: !t.done } : t
      );
    }
    function walk(nodes, kind) {
      return nodes.map((node) => {
        const updated = { ...node, tasks: flipInList(node.tasks || []) };
        if (updated.sections) updated.sections = walk(updated.sections);
        if (updated.subsections) updated.subsections = walk(updated.subsections);
        return updated;
      });
    }
    setData((current) => walk(current));
  }

  // Save a new folder at the current level.
  function saveNewFolder() {
    const name = newName.trim();
    if (!name) return;   // ignore empty names

    // What type are we adding, based on where we are?
    const type =
      level === 'root' ? 'area' :
      level === 'area' ? 'section' : 'subsection';

    // Parent is the current node's id (or null at root for areas).
    const parentId = level === 'root' ? null : currentNode.id;

    window.ginger.addNode({ type, name, parentId }).then(() => {
      setNewName('');       // clear the input
      setAdding(false);     // hide the input
      refresh();            // re-pull from DB so the new item appears
    });
  }

  // Add a folder (area/section/subsection) at the current level.
  function addFolder(name) {
    const type =
      level === 'root' ? 'area' :
      level === 'area' ? 'section' : 'subsection';
    const parentId = level === 'root' ? null : currentNode.id;
    window.ginger.addNode({ type, name, parentId }).then(refresh);
  }

  // Add a task to the current node.
  function addTaskHere(name) {
    window.ginger.addTask({ name, parentId: currentNode.id }).then(refresh);
  }

  function renameFolder(id, name) {
    window.ginger.renameNode(id, name).then(refresh);
  }

  function renameTaskName(id, name) {
    window.ginger.renameTask(id, name).then(refresh);
  }

  function archiveFolder(id) {
    window.ginger.archiveNode(id).then(refresh);
  }
  function deleteFolder(id, name) {
    setConfirm({
      message: `Delete "${name}" and everything inside it?`,
      onConfirm: () => window.ginger.deleteNode(id).then(() => { setConfirm(null); refresh(); }),
    });
  }
  function deleteTaskItem(id) {
    window.ginger.deleteTask(id).then(refresh);
  }

  // Build the menu items depending on what was right-clicked.
  function openMenu(e, kind, id, name) {
    e.preventDefault();
    e.stopPropagation();
    setMenu({ x: e.clientX, y: e.clientY, kind, id, name });
  }

  // Header text
  const headerEyebrow =
    level === 'root' ? 'Ginger' :
    level === 'area' ? 'Area' :
    level === 'section' ? 'Section' : 'Subsection';
  const headerTitle = level === 'root' ? 'Home' : currentNode.name;

  return (
    <div className="app">
      <Breadcrumb trail={trail} onCrumbClick={goToCrumb} />
      <AreaHeader
        eyebrow={headerEyebrow}
        title={headerTitle}
        nodeId={level === 'root' ? null : currentNode.id}
        isEditing={level !== 'root' && editingId === currentNode.id}
        onSave={(name) => renameFolder(currentNode.id, name)}
        onStartEdit={() => setEditingId(currentNode.id)}
        onStopEdit={() => setEditingId(null)}
      />

      {loading ? (
        <p className="empty">Loading…</p>
      ) : (
        <>
          {/* Folder group — Areas / Sections / Subsections (not at subsection level) */}
          {level !== 'subsection' && (
            <section className="group">
              <h2 className="group-label">{folderLabel}</h2>
              <ul className="list">
                {folders.map((folder) => (
                  <FolderRow
                    key={folder.id}
                    name={folder.name}
                    onClick={() => openFolder(folder.id)}
                    onRename={(name) => renameFolder(folder.id, name)}
                    onContextMenu={(e) => openMenu(e, 'folder', folder.id, folder.name)}
                    isEditing={editingId === folder.id}
                    onStartEdit={() => setEditingId(folder.id)}
                    onStopEdit={() => setEditingId(null)}
                  />
                ))}
                <AddRow
                  label={`Add ${folderLabel.slice(0, -1).toLowerCase()}`}
                  onAdd={addFolder}
                />
              </ul>
            </section>
          )}

          {/* Task group — everywhere except the root */}
          {level !== 'root' && (
            <section className="group">
              <h2 className="group-label">To do</h2>
              <motion.ul layout className="list">
                <AnimatePresence>
                  {orderedTasks.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      onToggle={toggleTaskDone}
                      onRename={renameTaskName}
                      onContextMenu={(e, t) => openMenu(e, 'task', t.id, t.name)}
                      editingId={editingId}
                      setEditingId={setEditingId}
                      onAddSubtask={(t) => setAddingSubtaskFor(t.id)}
                      addingSubtaskFor={addingSubtaskFor}
                      onSaveSubtask={addSubtaskTo}
                      onCancelSubtask={() => setAddingSubtaskFor(null)}
                    />
                  ))}
                </AnimatePresence>
                <AddRow label="Add a task" onAdd={addTaskHere} />
              </motion.ul>
            </section>
          )}
        </>
      )}
      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          onClose={() => setMenu(null)}
          items={[
            {
              label: 'Edit',
              icon: <Pencil size={15} />,
              onClick: () => startEdit(menu.kind, menu.id),
            },
            ...(menu.kind === 'folder'
              ? [{
                  label: 'Archive',
                  icon: <Archive size={15} />,
                  onClick: () => archiveFolder(menu.id),
                }]
              : []),
            {
              label: 'Delete',
              icon: <Trash2 size={15} />,
              danger: true,
              onClick: () =>
                menu.kind === 'folder'
                  ? deleteFolder(menu.id, menu.name)
                  : deleteTaskItem(menu.id),
            },
          ]}
        />
      )}

      {confirm && (
        <ConfirmDialog
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}

export default App;