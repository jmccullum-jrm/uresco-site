// Locations: the time it is at each yard right now, beside its live status, for anyone calling
// across time zones. Without JavaScript the line is simply empty.
(() => {
  const clocks = $$('[data-clock]');
  if (!clocks.length) return;
  const paint = () => clocks.forEach((el) => {
    try {
      const now = new Intl.DateTimeFormat('en-US', { timeZone: el.dataset.clock, hour: 'numeric', minute: '2-digit' }).format(new Date());
      el.textContent = `${now.replace('AM', 'a.m.').replace('PM', 'p.m.')} there now`;
    } catch { /* leave it empty */ }
  });
  paint();
  setInterval(paint, 30 * 1000);
})();
