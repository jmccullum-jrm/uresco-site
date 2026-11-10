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
    if (e.target instanceof HTMLDialogElement) e.target.close();
    if (e.target.closest('[data-print]')) window.print();
  });
  // A link inside the drawer that points at this page would otherwise leave it open.
  $$('dialog a[href]').forEach((a) => a.addEventListener('click', () => a.closest('dialog').close()));

  /* The phone action bar steps aside while the keyboard is up. */
  const TYPING = 'input:not([type=radio],[type=checkbox],[type=file]), textarea, select';
  document.addEventListener('focusin', (e) => { if (e.target.matches?.(TYPING)) document.body.classList.add('is-typing'); });
  document.addEventListener('focusout', (e) => { if (e.target.matches?.(TYPING)) document.body.classList.remove('is-typing'); });

  /* Open / closed, computed in each yard's own time zone.
     data-hours = {"tz":"America/Anchorage","week":[null,[420,990],…]}  (Sunday first, minutes after midnight) */
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const clock = (m) => {
    const h = Math.floor(m / 60), mm = m % 60, ap = h < 12 ? 'a.m.' : 'p.m.';
    return `${((h + 11) % 12) + 1}${mm ? ':' + String(mm).padStart(2, '0') : ''} ${ap}`;
  };
  const yardStatus = ({ tz, week }) => {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' })
      .formatToParts(new Date()).map((p) => [p.type, p.value]));
    const day = DAYS.indexOf(parts.weekday), now = +parts.hour * 60 + +parts.minute;
    const today = week[day];
    if (today && now >= today[0] && now < today[1]) return { open: true, text: `Open now · until ${clock(today[1])}` };
    for (let i = 0; i < 8; i++) {
      const d = (day + i) % 7, h = week[d];
      if (h && (i > 0 || now < h[0])) return { open: false, text: `Closed · opens ${i === 0 ? 'today' : i === 1 ? 'tomorrow' : DAYS[d]} ${clock(h[0])}` };
    }
    return { open: false, text: 'Closed' };
  };
  const paintHours = () => $$('[data-hours]').forEach((el) => {
    try {
      const s = yardStatus(JSON.parse(el.dataset.hours));
      el.textContent = el.hasAttribute('data-short') ? (s.open ? 'Open' : 'Closed') : s.text;
      el.classList.toggle('is-open', s.open);
      el.hidden = false;
    } catch { /* leave hidden */ }
  });
  paintHours();
  setInterval(paintHours, 60 * 1000);
})();
