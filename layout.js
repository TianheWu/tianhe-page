(() => {
  'use strict';
  const root = document.documentElement;
  const canvasWidth = 1280;
  let previousWidth = 0;

  function fitCanvas() {
    // Use the layout viewport, not visualViewport: pinch-to-zoom must still
    // magnify the page instead of being cancelled by the automatic fit.
    const width = root.clientWidth || window.innerWidth;
    if (!width || width === previousWidth) return;
    previousWidth = width;
    root.style.setProperty('--page-scale', String(Math.min(1, width / canvasWidth)));
  }

  // This small script runs in the head, before the first visible page paint.
  fitCanvas();
  window.addEventListener('resize', fitCanvas, { passive: true });
  if (typeof ResizeObserver !== 'undefined') {
    const observer = new ResizeObserver(fitCanvas);
    observer.observe(root);
  }
})();
