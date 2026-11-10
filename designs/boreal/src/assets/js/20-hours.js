(() => {
  const { $$ } = UCM;

  /* Open / closed, computed in each yard's own time zone. The word and nothing more: the hours in the
     data are placeholders, so no opening or closing time is ever written out.
     data-hours = {"tz":"America/Anchorage","week":[null,[420,990],…],"closedDates":["2026-11-26",…]}
     (week is Sunday first, in minutes after midnight; closedDates are in the yard's own calendar) */
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const partsIn = (tz) => Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' })
    .formatToParts(new Date()).map((p) => [p.type, p.value]));
  const isOpen = ({ tz, week, closedDates = [] }) => {
    const parts = partsIn(tz);
    if (closedDates.includes(`${parts.year}-${parts.month}-${parts.day}`)) return false;
    const today = week[DAYS.indexOf(parts.weekday)], now = +parts.hour * 60 + +parts.minute;
    return !!today && now >= today[0] && now < today[1];
  };
  /* The local clock beside a yard: "10:42 a.m." */
  const clockText = (m) => {
    const h = Math.floor(m / 60);
    return `${((h + 11) % 12) + 1}:${String(m % 60).padStart(2, '0')} ${h < 12 ? 'a.m.' : 'p.m.'}`;
  };
  const paint = () => {
    $$('[data-hours]').forEach((el) => {
      try {
        const open = isOpen(JSON.parse(el.dataset.hours));
        const text = open ? 'Open' : 'Closed';
        if (el.textContent !== text) el.textContent = text;
        el.classList.toggle('is-open', open);
        el.hidden = false;
      } catch { /* leave hidden */ }
    });
    $$('[data-clock]').forEach((el) => {
      try {
        const p = partsIn(el.dataset.clock);
        const text = clockText(+p.hour * 60 + +p.minute);
        if (el.textContent !== text) el.textContent = text;
      } catch { /* leave empty */ }
    });
  };
  paint();
  setInterval(paint, 15 * 1000);
})();
