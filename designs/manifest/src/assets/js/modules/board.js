// Dispatch board and the clocks in the utility strip.
// [data-clock="America/Anchorage"] shows that zone's time in hours and minutes, and changes on the minute.
// Nothing ticks on its own: the only continuous motion left is the board's lamp, and the Pause button stops it and the clocks.
(() => {
  const clocks = Array.from(document.querySelectorAll('[data-clock]'));
  if (!clocks.length) return;
  const still = window.matchMedia('(prefers-reduced-motion: reduce)');
  const formats = {};
  const timeIn = (tz) => {
    formats[tz] = formats[tz] || new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
    return formats[tz].format(new Date());
  };
  const write = (el, text) => {
    const cells = el.querySelectorAll('.fl');
    if (!cells.length) { if (el.textContent !== text) el.textContent = text; return; }
    cells.forEach((cell, i) => {
      const ch = text[i] || ' ';
      if (cell.textContent !== ch) cell.textContent = ch;
    });
  };
  const tick = () => clocks.forEach((el) => {
    try { write(el, timeIn(el.dataset.clock)); } catch { /* unknown zone: leave the dashes */ }
  });

  let paused = false;
  try { paused = localStorage.getItem('uresco.clocks.paused') === '1'; } catch { /* storage blocked: start running */ }
  const nextMinute = () => 60000 - (Date.now() % 60000) + 50;
  const loop = () => { if (!paused) tick(); setTimeout(loop, nextMinute()); };
  tick();
  setTimeout(loop, nextMinute());

  // Pause: stops the clocks changing and the lamp blinking. Added here because it only means something with the script.
  document.querySelectorAll('.board__head').forEach((head) => {
    const board = head.closest('.board');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'board__pause';
    const paint = () => {
      board.classList.toggle('is-paused', paused);
      btn.innerHTML = (paused ? 'Resume' : 'Pause') + '<span class="sr-only"> the clocks</span>';
    };
    btn.addEventListener('click', () => {
      paused = !paused;
      try { localStorage.setItem('uresco.clocks.paused', paused ? '1' : '0'); } catch { /* not remembered, still works */ }
      if (!paused) tick();
      document.querySelectorAll('.board__pause').forEach((b) => b.dispatchEvent(new Event('uresco:paint')));
    });
    btn.addEventListener('uresco:paint', paint);
    paint();
    head.appendChild(btn);
  });

  // On arrival the phone numbers clatter into place, the way a board refreshes: under half a second, and the
  // links (and the screen-reader text) carry the real number throughout.
  if (still.matches) return;
  const flip = (cell) => { cell.classList.remove('is-flip'); void cell.offsetWidth; cell.classList.add('is-flip'); };
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
