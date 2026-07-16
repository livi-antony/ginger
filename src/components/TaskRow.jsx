import React from 'react';
import { motion } from 'framer-motion';
import { Circle, CheckCircle2 } from 'lucide-react';
import EditableName from './EditableName.jsx';

function TaskRow({ task, onToggle, onRename, onContextMenu, isEditing, onStartEdit, onStopEdit }) {
  return (
    <motion.li
      layout
      transition={{ type: 'spring', stiffness: 500, damping: 40 }}
      className={`row row-task ${task.done ? 'row-task-done' : ''}`}
      onContextMenu={onContextMenu}
    >
      {task.done ? (
        <CheckCircle2 className="row-check row-check-done" size={18} strokeWidth={2} onClick={() => onToggle(task.id)} />
      ) : (
        <Circle className="row-check" size={18} strokeWidth={2} onClick={() => onToggle(task.id)} />
      )}
      <EditableName
        className="row-name"
        value={task.name}
        editing={isEditing}
        onSave={onRename}
        onStartEdit={onStartEdit}
        onStopEdit={onStopEdit}
      />
    </motion.li>
  );
}

export default TaskRow;