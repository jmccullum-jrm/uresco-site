// Uresco site behaviour. No dependencies; everything degrades to plain links and forms.
// Files in this folder, then modules/, are joined in name order into one site.js (see build.mjs).
// Each file is its own closure; these two helpers are the only things they share.
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

(() => {
  /* Dialogs: [data-open="id"] opens, [data-close] or a backdrop click closes. */
  document.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-open]');
    if (opener) {
      const dlg = document.getElementById(opener.dataset.open);
      if (dlg && typeof dlg.showModal === 'function') {
        e.preventDefault();
        $$('dialog[open]').forEach((d) => d.close());
        dlg.showModal();
        opener.setAttribute('aria-expanded', 'true');
        dlg.addEventListener('close', () => opener.setAttribute('aria-expanded', 'false'), { once: true });
      }
      return;
    }
    if (e.target.closest('[data-close]')) { e.target.closest('dialog')?.close(); return; }
    // A click on the dialog element itself is either its backdrop or its own padding; only the backdrop closes.
    if (e.target instanceof HTMLDialogElement) {
      const r = e.target.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) e.target.close();
    }
    if (e.target.closest('[data-print]')) window.print();
  });
  // A link inside a dialog that points at this page would otherwise leave it open. Phone numbers,
  // email and map links stay put: the sheet is still needed when the visitor comes back.
  $$('dialog a[href]:not([href^="tel:"], [href^="mailto:"], [target="_blank"])').forEach((a) => a.addEventListener('click', () => a.closest('dialog').close()));

  /* The phone action bar steps aside while the keyboard is up. */
  const TYPING = 'input:not([type=radio],[type=checkbox],[type=file]), textarea, select';
  document.addEventListener('focusin', (e) => { if (e.target.matches?.(TYPING)) document.body.classList.add('is-typing'); });
  document.addEventListener('focusout', (e) => { if (e.target.matches?.(TYPING)) document.body.classList.remove('is-typing'); });

  /* Open / closed, computed in each yard's own time zone. The hours are placeholders, so the badge
     says only "Open" or "Closed" and never prints a time.
     data-hours = {"tz":"America/Anchorage","week":[null,[420,990],…]}  (Sunday first, minutes after midnight) */
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const FIXED = ['1-1', '6-19', '7-4', '11-11', '12-25'];
  const utc = (y, m, d) => new Date(Date.UTC(y, m - 1, d));
  const isFixed = (t) => FIXED.includes(`${t.getUTCMonth() + 1}-${t.getUTCDate()}`);
  // A federal holiday on this date, including the Friday or Monday it is observed when it falls on a weekend.
  const isHoliday = (y, m, d) => {
    const wd = utc(y, m, d).getUTCDay(), nth = Math.ceil(d / 7);
    return isFixed(utc(y, m, d)) || (wd === 5 && isFixed(utc(y, m, d + 1))) || (wd === 1 && isFixed(utc(y, m, d - 1)))
      || (wd === 1 && ((m === 1 && nth === 3) || (m === 2 && nth === 3) || (m === 5 && d > 24) || (m === 9 && nth === 1) || (m === 10 && nth === 2)))
      || (wd === 4 && m === 11 && nth === 4);
  };
  // true or false, or null on a day the placeholder hours cannot speak for.
  const isOpen = ({ tz, week, closed = [] }) => {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: tz, year: 'numeric', month: 'numeric', day: 'numeric', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' })
      .formatToParts(new Date()).map((p) => [p.type, p.value]));
    const iso = `${parts.year}-${parts.month.padStart(2, '0')}-${parts.day.padStart(2, '0')}`;
    if (closed.includes(iso)) return false;
    if (isHoliday(+parts.year, +parts.month, +parts.day)) return null;
    const today = week[DAYS.indexOf(parts.weekday)], now = +parts.hour * 60 + +parts.minute;
    return !!today && now >= today[0] && now < today[1];
  };
  const paintHours = () => $$('[data-hours]').forEach((el) => {
    try {
      const open = isOpen(JSON.parse(el.dataset.hours));
      el.hidden = open === null;
      if (open === null) return;
      el.textContent = open ? 'Open' : 'Closed';
      el.classList.toggle('is-open', open);
    } catch { /* leave hidden */ }
  });
  paintHours();
  setInterval(paintHours, 60 * 1000);
})();
