// The manifest: one line open at a time. On a wide screen the open line fills the plate beside the list, so
// resting the pointer on (or tabbing to) a line shows its drawing and the open line cannot be closed.
// On a phone every line starts closed: the closed rows already say what is on them, and an open plate pushes the rest down.
(() => {
  document.querySelectorAll('[data-manifest]').forEach((root) => {
    const lines = Array.from(root.querySelectorAll('details.mline'));
    if (!lines.length) return;
    const wide = window.matchMedia('(min-width: 62.5em)');
    const pointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const open = (d) => { if (d.open) return; lines.forEach((x) => { if (x !== d) x.open = false; }); d.open = true; };
    if (!wide.matches) lines.forEach((d) => { d.open = false; });
    // Hover intent: a line opens only when the pointer has rested on it. A pointer crossing the rows on its way to the
    // plate keeps moving, so the timer keeps restarting and the line the visitor was reading stays open.
    let timer;
    lines.forEach((d, i) => {
      const row = d.querySelector('summary');
      row.addEventListener('click', (e) => { if (wide.matches && d.open) e.preventDefault(); });
      row.addEventListener('mousemove', () => { if (!wide.matches || !pointer.matches) return; clearTimeout(timer); timer = setTimeout(() => open(d), 200); });
      row.addEventListener('mouseleave', () => clearTimeout(timer));
      row.addEventListener('focus', () => { if (wide.matches && row.matches(':focus-visible')) open(d); });
      row.addEventListener('keydown', (e) => {
        const to = e.key === 'ArrowDown' ? lines[i + 1] : e.key === 'ArrowUp' ? lines[i - 1] : null;
        if (to) { e.preventDefault(); to.querySelector('summary').focus(); }
      });
      d.addEventListener('toggle', () => {
        if (!d.open) return;
        // Browsers without <details name> still get one line at a time.
        lines.forEach((x) => { if (x !== d) x.open = false; });
        // On a phone the line above may have just closed: keep the one that was tapped on screen.
        if (wide.matches) return;
        const top = row.getBoundingClientRect().top, mast = (document.querySelector('.masthead')?.offsetHeight || 0) + 8;
        if (top < mast) window.scrollTo({ top: window.scrollY + top - mast, behavior: 'instant' });
      });
    });
    wide.addEventListener('change', () => { if (wide.matches && !lines.some((d) => d.open)) lines[0].open = true; });
  });
})();
