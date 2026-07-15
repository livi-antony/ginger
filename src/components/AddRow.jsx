import React, { useState } from 'react';
import { Plus } from 'lucide-react';

// A muted "ghost" row that adds an item to its group.
// `label` = placeholder text (e.g. "Add a section"); `onAdd` = save function.
function AddRow({ label, onAdd }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');

  function save() {
    const trimmed = name.trim();
    if (trimmed) onAdd(trimmed);
    setName('');
    setEditing(false);
  }

  if (editing) {
    return (
      <li className="row row-add row-add-editing">
        <Plus className="row-add-icon" size={18} strokeWidth={2} />
        <input
          className="row-add-input"
          autoFocus
          value={name}
          placeholder={label}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') save();
            if (e.key === 'Escape') { setName(''); setEditing(false); }
          }}
          onBlur={save}
        />
      </li>
    );
  }

  return (
    <li className="row row-add" onClick={() => setEditing(true)}>
      <Plus className="row-add-icon" size={18} strokeWidth={2} />
      <span className="row-add-label">{label}</span>
    </li>
  );
}

export default AddRow;