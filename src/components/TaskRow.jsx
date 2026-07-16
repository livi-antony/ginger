import React from 'react';
import { motion } from 'framer-motion';
import { Circle, CheckCircle2, CirclePlus } from 'lucide-react';
import EditableName from './EditableName.jsx';
import AddRow from './AddRow.jsx';

function TaskRow({
  task,
  onToggle, onRename, onContextMenu,
  editingId, setEditingId,
  onAddSubtask, addingSubtaskFor, onSaveSubtask, onCancelSubtask,
}) {
  const subtasks = task.subtasks || [];
  const hasSubs = subtasks.length > 0;
  const doneCount = subtasks.filter((s) => s.done).length;
  const isAdding = addingSubtaskFor === task.id;
  const showContainer = hasSubs || isAdding;

  // A single task line (used for both parent and subtasks).
  const TaskLine = ({ t, isSub, onToggleLine, onRenameLine }) => (
    <div
      className={`task-line ${isSub ? 'task-line-sub' : ''} ${t.done ? 'task-line-done' : ''}`}
      onContextMenu={(e) => onContextMenu(e, t)}
    >
      {t.done ? (
        <CheckCircle2 className="row-check row-check-done" size={18} strokeWidth={2} onClick={() => onToggleLine(t, false)} />
      ) : (
        <Circle className="row-check" size={18} strokeWidth={2} onClick={() => onToggleLine(t, true)} />
      )}
      <EditableName
        className="row-name"
        value={t.name}
        editing={editingId === t.id}
        onSave={(name) => onRenameLine(t.id, name)}
        onStartEdit={() => setEditingId(t.id)}
        onStopEdit={() => setEditingId(null)}
        clickToEdit={!t.done}
      />
      {!isSub && hasSubs && (
        <span className="task-progress">{doneCount}/{subtasks.length}</span>
      )}
      {!isSub && (
        <button className="subtask-add-btn" onClick={() => onAddSubtask(task)} aria-label="Add subtask">
          <CirclePlus size={16} strokeWidth={2} />
        </button>
      )}
    </div>
  );

  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{
        opacity: 0,
        height: '1px',
        marginTop: 0,
        marginBottom: 0,
        transition: { duration: 0.25, ease: 'easeInOut' },
      }}
      transition={{ type: 'spring', stiffness: 500, damping: 40 }}
      className={`row row-task ${task.done ? 'row-task-done' : ''}`}
      style={{ overflow: 'hidden' }}
    >
      <TaskLine t={task} isSub={false} onToggleLine={onToggle} onRenameLine={onRename} />

      {(hasSubs || isAdding) && (
        <div className="subtask-area">
          {[...subtasks].sort((a, b) => a.done - b.done).map((sub) => (
            <TaskLine key={sub.id} t={sub} isSub={true} onToggleLine={onToggle} onRenameLine={onRename} />
          ))}
          <div className="task-line task-line-sub subtask-addrow">
            <AddRow
              label="Add subtask"
              onAdd={(name) => onSaveSubtask(name, task)}
            />
          </div>
        </div>
      )}
    </motion.li>
  );
}

export default TaskRow;