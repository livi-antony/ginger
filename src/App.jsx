import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { areas } from './data.js';
import AreaHeader from './components/AreaHeader.jsx';
import FolderRow from './components/FolderRow.jsx';
import TaskRow from './components/TaskRow.jsx';
import Breadcrumb from './components/Breadcrumb.jsx';

function App() {
  // The whole dataset lives in state so we can toggle tasks anywhere in it.
  const [data, setData] = useState(areas);

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

  // Header text
  const headerEyebrow =
    level === 'root' ? '' :
    level === 'area' ? 'Area' :
    level === 'section' ? 'Section' : 'Subsection';
  const headerTitle = level === 'root' ? 'Home' : currentNode.name;

  return (
    <div className="app">
      <Breadcrumb trail={trail} onCrumbClick={goToCrumb} />
      <AreaHeader eyebrow={headerEyebrow} title={headerTitle} />

      {folders.length > 0 && (
        <section className="group">
          <h2 className="group-label">{folderLabel}</h2>
          <ul className="list">
            {folders.map((folder) => (
              <FolderRow
                key={folder.id}
                name={folder.name}
                onClick={() => openFolder(folder.id)}
              />
            ))}
          </ul>
        </section>
      )}

      {level !== 'root' && (
        <section className="group">
          <h2 className="group-label">To do</h2>
          <motion.ul layout className="list">
            {orderedTasks.map((task) => (
              <TaskRow key={task.id} task={task} onToggle={toggleTask} />
            ))}
          </motion.ul>
          {orderedTasks.length === 0 && (
            <p className="empty">Nothing here yet.</p>
          )}
        </section>
      )}
    </div>
  );
}

export default App;