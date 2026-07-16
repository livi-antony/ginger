import React, { useEffect } from 'react';
import { Pencil, Archive, Trash2 } from 'lucide-react';

// Renders a menu at (x, y). `items` = [{ label, icon, onClick, danger }].
function ContextMenu({ x, y, items, onClose }) {
  // Close on any click elsewhere, or Escape.
  useEffect(() => {
    const close = () => onClose();
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };

    // Delay attaching so the click/contextmenu that opened the menu
    // doesn't immediately trigger these and close it.
    const timer = setTimeout(() => {
      window.addEventListener('click', close);
      window.addEventListener('contextmenu', close);
      window.addEventListener('keydown', onKey);
    }, 0);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', close);
      window.removeEventListener('contextmenu', close);
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div
      className="context-menu"
      style={{ top: y, left: x }}
      onClick={(e) => e.stopPropagation()}   // clicks inside don't self-close
    >
      {items.map((item) => (
        <button
          key={item.label}
          className={`context-item ${item.danger ? 'context-item-danger' : ''}`}
          onClick={() => { item.onClick(); onClose(); }}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}

export default ContextMenu;