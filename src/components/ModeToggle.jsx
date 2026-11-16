import React from 'react';

const MODES = [
  { id: 'dynamic', label: 'Dynamic' },
  { id: 'simple', label: 'Simple' },
];

export default function ModeToggle({ mode, onChange }) {
  return (
    <div className="mode-toggle" role="radiogroup" aria-label="Gallery view">
      <span
        className="mode-toggle__thumb"
        aria-hidden="true"
        style={{ transform: mode === 'simple' ? 'translateX(100%)' : 'translateX(0)' }}
      />
      {MODES.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={mode === id}
          className={`mode-toggle__option${mode === id ? ' is-active' : ''}`}
          onClick={() => onChange(id)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
