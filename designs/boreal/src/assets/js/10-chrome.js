(() => {
  const { $, $$ } = UCM;

  /* Dialogs: [data-open="id"] opens, [data-close] or a backdrop click closes.
     Openers are links wherever they can be, so without this script (or a browser without <dialog>)
     they still lead to the locations page or the footer index. */
  const onBackdrop = (e, d) => {
    const r = d.getBoundingClientRect();
    return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
  };
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
    if (e.target instanceof HTMLDialogElement && onBackdrop(e, e.target)) e.target.close();
    if (e.target.closest('[data-print]')) window.print();
  });
  // A link inside a dialog that points at this page would otherwise leave it open.
  $$('dialog a[href]').forEach((a) => a.addEventListener('click', () => a.closest('dialog').close()));

  /* Masthead: a hairline appears once the page has scrolled. */
  const mast = $('[data-masthead]');
  if (mast) {
    const onScroll = () => mast.toggleAttribute('data-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* Products menu. Hover and focus open it in CSS; the button makes it work by touch and keyboard,
     and Escape closes it wherever the pointer happens to be. */
  $$('[data-menu]').forEach((item) => {
    const btn = $('.nav__toggle', item);
    const set = (open) => { item.toggleAttribute('data-open', open); btn.setAttribute('aria-expanded', String(open)); };
    btn.addEventListener('click', () => { item.removeAttribute('data-shut'); set(!item.hasAttribute('data-open')); });
    item.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      set(false); item.setAttribute('data-shut', ''); btn.focus();
    });
    item.addEventListener('mouseleave', () => item.removeAttribute('data-shut'));
    item.addEventListener('focusout', (e) => { if (!item.contains(e.relatedTarget)) { set(false); item.removeAttribute('data-shut'); } });
    document.addEventListener('click', (e) => { if (!item.contains(e.target)) set(false); });
  });

  /* Motion that runs on its own can be paused. One setting for the whole site, remembered between pages.
     html.is-still pauses only the endless animations (see 30-components.css), so a line that is still
     drawing itself finishes, and a loop that starts later obeys the same setting. */
  const root = document.documentElement;
  const toggles = $$('[data-motion]');
  const STILL = 'ucm-still';
  const isLoop = (a) => { try { return a.effect.getComputedTiming().iterations === Infinity; } catch { return false; } };
  if (toggles.length && document.getAnimations) {
    let still = false;
    try { still = localStorage.getItem(STILL) === '1'; } catch { /* no storage: lasts for this page */ }
    const label = () => {
      root.classList.toggle('is-still', still);
      toggles.forEach((b) => { $('span', b).textContent = still ? 'Play motion' : 'Pause motion'; });
    };
    if (document.getAnimations().some(isLoop)) toggles.forEach((b) => { b.hidden = false; });
    label();
    toggles.forEach((b) => b.addEventListener('click', () => {
      still = !still;
      label();
      try { still ? localStorage.setItem(STILL, '1') : localStorage.removeItem(STILL); } catch { /* fine */ }
    }));
  }

  /* The phone action bar steps aside while the keyboard is up. */
  const TYPING = 'input:not([type=radio],[type=checkbox],[type=file]), textarea, select';
  document.addEventListener('focusin', (e) => { if (e.target.matches?.(TYPING)) document.body.classList.add('is-typing'); });
  document.addEventListener('focusout', (e) => { if (e.target.matches?.(TYPING)) document.body.classList.remove('is-typing'); });
})();
