import React from 'react';
import { CirclePlus } from 'lucide-react';

// Reusable add button with a hover tooltip below it.
// `label` is the tooltip text (e.g. "Add area"); `onClick` fires the action.
function AddButton({ label, onClick }) {
  return (
    <div className="add-button-wrap">
      <button className="add-button" onClick={onClick} aria-label={label}>
        <CirclePlus size={22} strokeWidth={2} />
      </button>
      <span className="add-tooltip">{label}</span>
    </div>
  );
}

export default AddButton;