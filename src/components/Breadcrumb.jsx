import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

function Breadcrumb({ trail, onCrumbClick }) {
  return (
    <nav className="breadcrumb">
      <button
        className="crumb crumb-home"
        onClick={() => onCrumbClick(0)}
        aria-label="Home"
      >
        <Home size={15} strokeWidth={2} />
      </button>
      {trail.map((crumb, index) => (
        <span key={crumb.id} className="crumb-group">
          <ChevronRight className="crumb-sep" size={14} strokeWidth={2} />
          <button
            className="crumb"
            onClick={() => onCrumbClick(index + 1)}
          >
            {crumb.name}
          </button>
        </span>
      ))}
    </nav>
  );
}

export default Breadcrumb;