import React from 'react';
import { ChevronRight, Folder } from 'lucide-react';

function FolderRow({ name }) {
  return (
    <li className="row row-folder">
      <Folder className="row-icon" size={18} strokeWidth={2} />
      <span className="row-name">{name}</span>
      <ChevronRight className="row-chevron" size={18} strokeWidth={2} />
    </li>
  );
}

export default FolderRow;