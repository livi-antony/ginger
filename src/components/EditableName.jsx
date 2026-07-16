import React, { useState, useEffect } from 'react';

// `editing` is controlled by the parent. Calls onStopEdit when done.
function EditableName({ value, editing, onSave, onStopEdit, onStartEdit, className, clickToEdit }) {
  const [draft, setDraft] = useState(value);

  // Reset the draft each time we enter edit mode.
  useEffect(() => {
    if (editing) setDraft(value);
  }, [editing, value]);

  function commit() {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) onSave(trimmed);
    onStopEdit();
  }

  if (editing) {
    return (
      <input
        className={`name-input ${className || ''}`}
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') onStopEdit();
        }}
        onBlur={commit}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      />
    );
  }

  return (
    <span
      className={className}
      onClick={clickToEdit ? (e) => { e.stopPropagation(); onStartEdit(); } : undefined}
    >
      {value}
    </span>
  );
}

export default EditableName;