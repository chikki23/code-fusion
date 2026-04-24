import React, { useRef, useEffect } from 'react';

export default function ConsolePanel({ logs, onClear }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const logsEndRef = useRef(null);

  useEffect(() => {
    if (logsEndRef.current && !collapsed) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, collapsed]);

  return (
    <div className={`console-panel ${collapsed ? 'collapsed' : ''}`}>
      <div className="console-header" onClick={() => setCollapsed(prev => !prev)}>
        <div className="console-header-left">
          <span className="console-dot"></span>
          <span className="console-title">Console</span>
          {logs.length > 0 && (
            <span className="console-count">{logs.length}</span>
          )}
        </div>
        <div className="console-actions">
          {logs.length > 0 && (
            <button
              className="console-btn"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
            >
              Clear
            </button>
          )}
          <span className="console-toggle-icon">▼</span>
        </div>
      </div>

      <div className="console-logs">
        {logs.length === 0 ? (
          <div className="console-empty">
            Console output will appear here...
          </div>
        ) : (
          logs.map((entry, index) => (
            <div key={index} className={`console-entry ${entry.type}`}>
              <span className="console-entry-prefix">
                {entry.type === 'error' ? '✕' : entry.type === 'warn' ? '⚠' : '›'}
              </span>
              <span className="console-entry-text">{entry.message}</span>
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}
