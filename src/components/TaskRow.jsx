import React from 'react';
import { motion } from 'framer-motion';
import { Circle, CheckCircle2 } from 'lucide-react';

function TaskRow({ task, onToggle }) {
  return (
    <motion.li
      layout                                  // animate position changes automatically
      transition={{ type: 'spring', stiffness: 500, damping: 40 }}
      className={`row row-task ${task.done ? 'row-task-done' : ''}`}
    >
      {task.done ? (
        <CheckCircle2
          className="row-check row-check-done"
          size={18}
          strokeWidth={2}
          onClick={() => onToggle(task.id)}
        />
      ) : (
        <Circle
          className="row-check"
          size={18}
          strokeWidth={2}
          onClick={() => onToggle(task.id)}
        />
      )}
      <span className="row-name">{task.name}</span>
    </motion.li>
  );
}

export default TaskRow;