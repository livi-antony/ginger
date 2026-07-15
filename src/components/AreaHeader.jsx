import React from 'react';

// A "presentational" component — just receives data and displays it.
// `eyebrow` and `title` are props: values passed in from the parent.
function AreaHeader({ eyebrow, title }) {
  return (
    <header className="area-header">
      <span className="area-eyebrow">{eyebrow}</span>
      <h1 className="area-title">{title}</h1>
    </header>
  );
}

export default AreaHeader;