import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRotateLeft, faDownload } from '@fortawesome/free-solid-svg-icons';

export default function Header({ onReset, onDownload }) {
  return (
    <header className="header">
      <div className="header-brand">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#667eea" />
              <stop offset="100%" stopColor="#764ba2" />
            </linearGradient>
          </defs>
          <path
            d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"
            fill="url(#brandGrad)"
          />
        </svg>
        <span className="brand-text">CodeFusion</span>
      </div>

      <div className="header-actions">
        <button
          className="header-btn"
          onClick={onReset}
          title="Reset all editors"
        >
          <FontAwesomeIcon icon={faRotateLeft} />
          <span>Reset</span>
        </button>
        <button
          className="header-btn primary"
          onClick={onDownload}
          title="Download as HTML file"
        >
          <FontAwesomeIcon icon={faDownload} />
          <span>Download</span>
        </button>
      </div>
    </header>
  );
}
