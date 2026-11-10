(() => {
  const { $$ } = UCM;

  /* Open / closed, computed in each yard's own time zone.
     data-hours = {"tz":"America/Anchorage","week":[null,[420,990],…]}  (Sunday first, minutes after midnight) */
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const clock = (m, always) => {
    const h = Math.floor(m / 60), mm = m % 60, ap = h < 12 ? 'a.m.' : 'p.m.';
    return `${((h + 11) % 12) + 1}${mm || always ? ':' + String(mm).padStart(2, '0') : ''} ${ap}`;
  };
  const partsIn = (tz) => Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' })
    .formatToParts(new Date()).map((p) => [p.type, p.value]));
  const yardStatus = ({ tz, week }) => {
    const parts = partsIn(tz);
    const day = DAYS.indexOf(parts.weekday), now = +parts.hour * 60 + +parts.minute;
    const today = week[day];
    if (today && now >= today[0] && now < today[1]) return { open: true, text: `Open now · until ${clock(today[1])}` };
    for (let i = 0; i < 8; i++) {
      const d = (day + i) % 7, h = week[d];
      if (h && (i > 0 || now < h[0])) return { open: false, text: `Closed · opens ${i === 0 ? 'today' : i === 1 ? 'tomorrow' : DAYS[d]} ${clock(h[0])}` };
    }
    return { open: false, text: 'Closed' };
  };
  const paint = () => {
    $$('[data-hours]').forEach((el) => {
      try {
        const s = yardStatus(JSON.parse(el.dataset.hours));
        const text = el.hasAttribute('data-short') ? (s.open ? 'Open' : 'Closed') : s.text;
        if (el.textContent !== text) el.textContent = text;
        el.classList.toggle('is-open', s.open);
        el.hidden = false;
      } catch { /* leave hidden */ }
    });
    /* The yard's local time: "10:42 a.m." */
    $$('[data-clock]').forEach((el) => {
      try {
        const p = partsIn(el.dataset.clock);
        const text = clock(+p.hour * 60 + +p.minute, true);
        if (el.textContent !== text) el.textContent = text;
      } catch { /* leave empty */ }
    });
  };
  paint();
  setInterval(paint, 15 * 1000);
})();
