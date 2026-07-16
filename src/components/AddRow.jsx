import React, { useState } from 'react';
import { Plus } from 'lucide-react';

function AddRow({ label, onAdd, startOpen = false, onCancel }) {
  const [editing, setEditing] = useState(startOpen);
  const [name, setName] = useState('');

  function save() {
    const trimmed = name.trim();
    if (trimmed) onAdd(trimmed);
    setName('');
    setEditing(false);
    if (onCancel) onCancel();
  }

  function cancel() {
    setName('');
    setEditing(false);
    if (onCancel) onCancel();
  }

  if (editing) {
    return (
      <div className="row row-add row-add-editing">
        <Plus className="row-add-icon" size={18} strokeWidth={2} />
        <input
          className="row-add-input"
          autoFocus
          value={name}
          placeholder={label}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') save();
            if (e.key === 'Escape') cancel();
          }}
          onBlur={save}
        />
      </div>
    );
  }

  return (
    <div className="row row-add" onClick={() => setEditing(true)}>
      <Plus className="row-add-icon" size={18} strokeWidth={2} />
      <span className="row-add-label">{label}</span>
    </div>
  );
}

export default AddRow;