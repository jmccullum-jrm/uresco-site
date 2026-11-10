// Uresco site behaviour, part 1: things every page has. No dependencies; everything degrades to plain links.
// Files in this folder are joined in name order into one site.js; features with their own file live in modules/.
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

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
  // Openers are links, so they lead somewhere useful without this script (the yards, the footer index).
  // With it they open a dialog, so they are announced and keyed as buttons.
  $$('a[data-open]').forEach((a) => {
    a.setAttribute('role', 'button');
    a.addEventListener('keydown', (e) => { if (e.key === ' ') { e.preventDefault(); a.click(); } });
  });
  // A link inside the drawer that points at this page would otherwise leave it open.
  $$('dialog a[href]').forEach((a) => a.addEventListener('click', () => a.closest('dialog').close()));

  /* The phone action bar steps aside while the keyboard is up. */
  const TYPING = 'input:not([type=radio],[type=checkbox],[type=file]), textarea, select';
  document.addEventListener('focusin', (e) => { if (e.target.matches?.(TYPING)) document.body.classList.add('is-typing'); });
  document.addEventListener('focusout', (e) => { if (e.target.matches?.(TYPING)) document.body.classList.remove('is-typing'); });

  /* Open / closed, computed in each yard's own time zone. The words are all a visitor sees: the hours are placeholders.
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
