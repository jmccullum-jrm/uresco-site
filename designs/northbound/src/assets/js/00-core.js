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
  const isOpen = ({ tz, week }) => {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' })
      .formatToParts(new Date()).map((p) => [p.type, p.value]));
    const today = week[DAYS.indexOf(parts.weekday)], now = +parts.hour * 60 + +parts.minute;
    return !!today && now >= today[0] && now < today[1];
  };
  const paintHours = () => $$('[data-hours]').forEach((el) => {
    try {
      const open = isOpen(JSON.parse(el.dataset.hours));
      el.textContent = open ? 'Open' : 'Closed';
      el.classList.toggle('is-open', open);
      el.hidden = false;
    } catch { /* leave hidden */ }
  });
  paintHours();
  setInterval(paintHours, 60 * 1000);
})();
