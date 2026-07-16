import React from 'react';
import { Pencil } from 'lucide-react';
import EditableName from './EditableName.jsx';

function AreaHeader({ eyebrow, title, nodeId, isEditing, onSave, onStartEdit, onStopEdit }) {
  return (
    <header className="area-header">
      {eyebrow && <span className="area-eyebrow">{eyebrow}</span>}
      <div className="area-title-row">
        {nodeId ? (
          <>
            <EditableName
              className="area-title"
              value={title}
              editing={isEditing}
              onSave={onSave}
              onStartEdit={onStartEdit}
              onStopEdit={onStopEdit}
            />
            {!isEditing && (
              <button
                className="title-edit-btn"
                onClick={onStartEdit}
                aria-label="Rename"
              >
                <Pencil size={16} strokeWidth={2} />
              </button>
            )}
          </>
        ) : (
          <h1 className="area-title">{title}</h1>
        )}
      </div>
    </header>
  );
}

export default AreaHeader;