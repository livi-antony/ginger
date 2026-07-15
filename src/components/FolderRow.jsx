import React, { useRef } from 'react';
import { ChevronRight, Folder } from 'lucide-react';
import EditableName from './EditableName.jsx';

function FolderRow({ name, onClick, onRename }) {
  const holdTimer = useRef(null);
  const didHold = useRef(false);
  const editRef = useRef(null);   // lets us trigger edit mode in EditableName

  function handleMouseDown() {
    didHold.current = false;
    holdTimer.current = setTimeout(() => {
      didHold.current = true;        // mark: this was a hold, not a click
      editRef.current?.startEditing();
    }, 500);
  }

  function handleMouseUp() {
    clearTimeout(holdTimer.current);
  }

  function handleClick() {
    // If the press became a hold, swallow the click (don't navigate).
    if (didHold.current) {
      didHold.current = false;
      return;
    }
    onClick();
  }

  return (
    <li
      className="row row-folder"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}   // cancel hold if pointer leaves
      onClick={handleClick}
    >
      <Folder className="row-icon" size={18} strokeWidth={2} />
      <EditableName
        ref={editRef}
        className="row-name"
        value={name}
        onSave={onRename}
      />
      <ChevronRight className="row-chevron" size={18} strokeWidth={2} />
    </li>
  );
}

export default FolderRow;