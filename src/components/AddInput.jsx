import React from 'react';
import { motion } from 'framer-motion';

function AddInput({ value, onChange, onSave, onCancel, placeholder }) {
  return (
    <motion.input
      className="add-input"
      autoFocus
      initial={{ opacity: 0, scaleX: 0.3 }}   // start narrow + invisible
      animate={{ opacity: 1, scaleX: 1 }}      // expand to full + visible
      transition={{ duration: 0.2, ease: 'easeOut' }}
      style={{ originX: 0 }}                    // grow from the left edge
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onSave();
        if (e.key === 'Escape') onCancel();
      }}
      onBlur={onCancel}
    />
  );
}

export default AddInput;