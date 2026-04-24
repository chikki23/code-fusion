import React, { useState, useEffect, useCallback } from 'react';
import Editor from './Editor';
import Header from './Header';
import ConsolePanel from './ConsolePanel';
import SplitPane from './SplitPane';
import useLocalStorage from '../hooks/useLocalStorage';

function App() {
  const [html, setHtml] = useLocalStorage('html', '');
  const [css, setCss] = useLocalStorage('css', '');
  const [js, setJs] = useLocalStorage('js', '');
  const [srcDoc, setSrcDoc] = useState('');
  const [consoleLogs, setConsoleLogs] = useState([]);

  // Listen for console messages from the iframe
  useEffect(() => {
    function handleMessage(e) {
      if (e.data && e.data.source === 'codefusion-iframe') {
        setConsoleLogs(prev => [
          ...prev,
          { type: e.data.type, message: e.data.message }
        ]);
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Debounced live preview
  useEffect(() => {
    const timeout = setTimeout(() => {
      // Clear console when code changes
      setConsoleLogs([]);

      setSrcDoc(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <style>${css}</style>
          </head>
          <body>
            ${html}
            <script>
              // Override console methods to send messages to parent
              (function() {
                const originalConsole = {
                  log: console.log,
                  warn: console.warn,
                  error: console.error
                };

                function serialize(args) {
                  return Array.from(args).map(function(arg) {
                    if (typeof arg === 'object') {
                      try { return JSON.stringify(arg, null, 2); }
                      catch(e) { return String(arg); }
                    }
                    return String(arg);
                  }).join(' ');
                }

                console.log = function() {
                  originalConsole.log.apply(console, arguments);
                  window.parent.postMessage({
                    source: 'codefusion-iframe',
                    type: 'log',
                    message: serialize(arguments)
                  }, '*');
                };

                console.warn = function() {
                  originalConsole.warn.apply(console, arguments);
                  window.parent.postMessage({
                    source: 'codefusion-iframe',
                    type: 'warn',
                    message: serialize(arguments)
                  }, '*');
                };

                console.error = function() {
                  originalConsole.error.apply(console, arguments);
                  window.parent.postMessage({
                    source: 'codefusion-iframe',
                    type: 'error',
                    message: serialize(arguments)
                  }, '*');
                };

                // Catch runtime errors
                window.onerror = function(msg, url, line, col, error) {
                  window.parent.postMessage({
                    source: 'codefusion-iframe',
                    type: 'error',
                    message: msg + (line ? ' (line ' + line + ')' : '')
                  }, '*');
                };
              })();
            <\/script>
            <script>${js}<\/script>
          </body>
        </html>
      `);
    }, 300);

    return () => clearTimeout(timeout);
  }, [html, css, js]);

  // Reset all code
  const handleReset = useCallback(() => {
    setHtml('');
    setCss('');
    setJs('');
    setConsoleLogs([]);
  }, [setHtml, setCss, setJs]);

  // Download as HTML file
  const handleDownload = useCallback(() => {
    const content = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CodeFusion Export</title>
  <style>
${css}
  </style>
</head>
<body>
${html}
  <script>
${js}
  <\/script>
</body>
</html>`;

    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'codefusion-export.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [html, css, js]);

  // Clear console
  const handleClearConsole = useCallback(() => {
    setConsoleLogs([]);
  }, []);

  return (
    <div className="app-container">
      <Header onReset={handleReset} onDownload={handleDownload} />

      <div className="main-content">
        <SplitPane direction="vertical" minSize={80}>
          {/* Top: 3 editors side by side */}
          <div className="editors-pane">
            <SplitPane direction="horizontal" minSize={100}>
              <Editor
                language="xml"
                displayName="HTML"
                value={html}
                onChange={setHtml}
                badge="html"
              />
              <Editor
                language="css"
                displayName="CSS"
                value={css}
                onChange={setCss}
                badge="css"
              />
              <Editor
                language="javascript"
                displayName="JS"
                value={js}
                onChange={setJs}
                badge="js"
              />
            </SplitPane>
          </div>

          {/* Bottom: Output + Console */}
          <div className="output-pane">
            <SplitPane direction="vertical" minSize={34}>
              {/* Output iframe */}
              <div className="output-wrapper">
                <div className="output-header">
                  <div className="output-header-left">
                    <span className="output-dot"></span>
                    <span className="output-title">Output</span>
                  </div>
                </div>
                <div className="output-iframe-container">
                  <iframe
                    srcDoc={srcDoc}
                    title="output"
                    sandbox="allow-scripts"
                  />
                </div>
              </div>

              {/* Console */}
              <ConsolePanel
                logs={consoleLogs}
                onClear={handleClearConsole}
              />
            </SplitPane>
          </div>
        </SplitPane>
      </div>
    </div>
  );
}

export default App;