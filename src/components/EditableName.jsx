import React, { useState, forwardRef, useImperativeHandle } from 'react';

// forwardRef lets a parent hold a ref to this component.
const EditableName = forwardRef(({ value, onSave, className }, ref) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  // Expose startEditing() to the parent via the ref.
  useImperativeHandle(ref, () => ({
    startEditing: () => {
      setDraft(value);
      setEditing(true);
    },
  }));

  function commit() {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) onSave(trimmed);
    else setDraft(value);
    setEditing(false);
  }

  if (editing) {
    return (
      <input
        className="name-input"
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') { setDraft(value); setEditing(false); }
        }}
        onBlur={commit}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}   // don't start a hold on the input
      />
    );
  }

  return (
    <span
      className={className}
      onDoubleClick={(e) => {
        e.stopPropagation();
        setDraft(value);
        setEditing(true);
      }}
    >
      {value}
    </span>
  );
});

export default EditableName;