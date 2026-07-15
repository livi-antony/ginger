import React, { useState } from 'react';
import AreaHeader from './components/AreaHeader.jsx';
import FolderRow from './components/FolderRow.jsx';
import TaskRow from './components/TaskRow.jsx';
import { motion } from 'framer-motion';

const sections = [
  { id: 1, name: 'Semester 2' },
  { id: 2, name: 'Semester 1' },
];

function App() {
  // useState: React "remembers" this between re-renders.
  // `tasks` is the current value; `setTasks` is how we change it.
  // Each task now has a `done` flag.
  const [tasks, setTasks] = useState([
    { id: 1, name: 'Email tutor about extension', done: false },
    { id: 2, name: 'Buy textbook for BIO201', done: false },
    { id: 3, name: 'Renew library books', done: false },
  ]);

  // Flip one task's done state. We build a NEW array (never mutate the old one)
  // — React re-renders because setTasks gives it a new value.
  function toggleTask(id) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  }

  // Sort so undone tasks stay on top and done ones drift to the bottom.
  // We copy with [...tasks] first so we don't mutate state directly.
  const orderedTasks = [...tasks].sort((a, b) => a.done - b.done);

  return (
    <div className="app">
      <AreaHeader eyebrow="Area" title="Study" />

      <section className="group">
        <h2 className="group-label">Sections</h2>
        <ul className="list">
          {sections.map((section) => (
            <FolderRow key={section.id} name={section.name} />
          ))}
        </ul>
      </section>

      <section className="group">
        <h2 className="group-label">To do</h2>
        <motion.ul layout className="list">
          {orderedTasks.map((task) => (
            <TaskRow key={task.id} task={task} onToggle={toggleTask} />
          ))}
        </motion.ul>
      </section>
    </div>
  );
}

export default App;