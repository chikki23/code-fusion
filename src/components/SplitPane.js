import React, { useState, useCallback, useEffect, useRef } from 'react';

/**
 * SplitPane — A resizable split pane layout with draggable sash dividers.
 *
 * Props:
 *   direction: 'horizontal' | 'vertical'
 *   children:  2+ React elements to split between
 *   minSize:   minimum panel size in px (default 60)
 */
export default function SplitPane({ direction = 'horizontal', children, minSize = 60 }) {
  const childArray = React.Children.toArray(children);
  const count = childArray.length;
  const containerRef = useRef(null);

  // Initialize equal sizes as percentages
  const [sizes, setSizes] = useState(() =>
    Array(count).fill(100 / count)
  );

  // Track which sash is being dragged (-1 = none)
  const dragIndexRef = useRef(-1);
  const startPosRef = useRef(0);
  const startSizesRef = useRef([]);

  const isHorizontal = direction === 'horizontal';

  const handleMouseDown = useCallback((sashIndex, e) => {
    e.preventDefault();
    dragIndexRef.current = sashIndex;
    startPosRef.current = isHorizontal ? e.clientX : e.clientY;
    startSizesRef.current = [...sizes];
    document.body.classList.add('sash-dragging');
  }, [sizes, isHorizontal]);

  useEffect(() => {
    function handleMouseMove(e) {
      if (dragIndexRef.current === -1) return;

      const container = containerRef.current;
      if (!container) return;

      const containerSize = isHorizontal
        ? container.getBoundingClientRect().width
        : container.getBoundingClientRect().height;

      // Account for sash widths (each sash is 6px)
      const sashCount = count - 1;
      const availableSize = containerSize - sashCount * 6;

      const currentPos = isHorizontal ? e.clientX : e.clientY;
      const delta = currentPos - startPosRef.current;
      const deltaPercent = (delta / availableSize) * 100;

      const idx = dragIndexRef.current;
      const newSizes = [...startSizesRef.current];

      const minPercent = (minSize / availableSize) * 100;

      let newLeft = newSizes[idx] + deltaPercent;
      let newRight = newSizes[idx + 1] - deltaPercent;

      // Enforce minimums
      if (newLeft < minPercent) {
        newRight -= (minPercent - newLeft);
        newLeft = minPercent;
      }
      if (newRight < minPercent) {
        newLeft -= (minPercent - newRight);
        newRight = minPercent;
      }

      // Final clamp
      if (newLeft < minPercent || newRight < minPercent) return;

      newSizes[idx] = newLeft;
      newSizes[idx + 1] = newRight;

      setSizes(newSizes);
    }

    function handleMouseUp() {
      if (dragIndexRef.current === -1) return;
      dragIndexRef.current = -1;
      document.body.classList.remove('sash-dragging');
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isHorizontal, count, minSize]);

  // Build interleaved children + sashes
  const elements = [];
  childArray.forEach((child, i) => {
    elements.push(
      <div
        key={`panel-${i}`}
        className="split-panel"
        style={{ [isHorizontal ? 'width' : 'height']: `${sizes[i]}%` }}
      >
        {child}
      </div>
    );

    if (i < count - 1) {
      elements.push(
        <div
          key={`sash-${i}`}
          className={`sash ${isHorizontal ? 'sash-horizontal' : 'sash-vertical'}`}
          onMouseDown={(e) => handleMouseDown(i, e)}
        >
          <div className="sash-line" />
        </div>
      );
    }
  });

  return (
    <div
      ref={containerRef}
      className={`split-pane split-pane-${direction}`}
    >
      {elements}
    </div>
  );
}
