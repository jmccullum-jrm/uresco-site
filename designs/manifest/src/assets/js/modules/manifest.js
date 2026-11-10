// The manifest: one line open at a time. On a wide screen the open line fills the plate beside the list,
// so pointing at (or tabbing to) a line shows its drawing and the open line cannot be closed.
(() => {
  document.querySelectorAll('[data-manifest]').forEach((root) => {
    const lines = Array.from(root.querySelectorAll('details.mline'));
    if (!lines.length) return;
    const wide = window.matchMedia('(min-width: 1000px)');
    const pointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const open = (d) => { if (d.open) return; lines.forEach((x) => { if (x !== d) x.open = false; }); d.open = true; };
    let timer;
    lines.forEach((d, i) => {
      const row = d.querySelector('summary');
      row.addEventListener('click', (e) => { if (wide.matches && d.open) e.preventDefault(); });
      row.addEventListener('mouseenter', () => { if (!wide.matches || !pointer.matches) return; clearTimeout(timer); timer = setTimeout(() => open(d), 80); });
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
