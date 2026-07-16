import React from 'react';
import { ChevronRight, Folder } from 'lucide-react';
import EditableName from './EditableName.jsx';

function FolderRow({ name, onClick, onRename, onContextMenu, isEditing, onStartEdit, onStopEdit }) {
  return (
    <li
      className="row row-folder"
      onClick={isEditing ? undefined : onClick}
      onContextMenu={onContextMenu}
    >
      <Folder className="row-icon" size={18} strokeWidth={2} />
      <EditableName
        className="row-name"
        value={name}
        editing={isEditing}
        onSave={onRename}
        onStartEdit={onStartEdit}
        onStopEdit={onStopEdit}
      />
      <ChevronRight className="row-chevron" size={18} strokeWidth={2} />
    </li>
  );
}

export default FolderRow;