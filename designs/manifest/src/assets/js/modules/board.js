// Dispatch board and the clocks in the utility strip.
// [data-clock="America/Anchorage"] shows that zone's time; with [data-seconds] it ticks every second.
// Text is written into fixed cells (.fl) where they exist, and only the cells that change are flipped.
(() => {
  const clocks = Array.from(document.querySelectorAll('[data-clock]'));
  if (!clocks.length) return;
  const still = window.matchMedia('(prefers-reduced-motion: reduce)');
  const formats = {};
  const timeIn = (tz, seconds) => {
    const key = tz + (seconds ? 's' : '');
    formats[key] = formats[key] || new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: seconds ? '2-digit' : undefined, hourCycle: 'h23' });
    return formats[key].format(new Date());
  };
  const flip = (cell) => { cell.classList.remove('is-flip'); void cell.offsetWidth; cell.classList.add('is-flip'); };
  const write = (el, text) => {
    const cells = el.querySelectorAll('.fl');
    if (!cells.length) { if (el.textContent !== text) el.textContent = text; return; }
    cells.forEach((cell, i) => {
      const ch = text[i] || ' ';
      if (cell.textContent === ch) return;
      cell.textContent = ch;
      if (!still.matches) flip(cell);
    });
  };
  const tick = () => clocks.forEach((el) => {
    try { write(el, timeIn(el.dataset.clock, el.hasAttribute('data-seconds') && !still.matches)); } catch { /* unknown zone: leave the dashes */ }
  });
  const loop = () => { tick(); setTimeout(loop, 1000 - (Date.now() % 1000) + 5); };
  loop();

  // On arrival the phone numbers clatter into place, the way a board refreshes: under half a second, and the
  // links (and the screen-reader text) carry the real number throughout.
  if (still.matches) return;
  document.querySelectorAll('[data-flap] .fl').forEach((cell, i) => {
    const final = cell.textContent;
    if (!/\d/.test(final)) return;
    let n = 2 + (i % 4);
    const step = () => {
      if (n-- > 0) { cell.textContent = String((+final + n * 3 + i) % 10); setTimeout(step, 42); } else { cell.textContent = final; flip(cell); }
    };
    setTimeout(step, 60 + (i % 14) * 10);
  });
})();
