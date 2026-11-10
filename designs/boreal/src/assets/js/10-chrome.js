(() => {
  const { $, $$ } = UCM;

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

  /* The phone action bar steps aside while the keyboard is up. */
  const TYPING = 'input:not([type=radio],[type=checkbox],[type=file]), textarea, select';
  document.addEventListener('focusin', (e) => { if (e.target.matches?.(TYPING)) document.body.classList.add('is-typing'); });
  document.addEventListener('focusout', (e) => { if (e.target.matches?.(TYPING)) document.body.classList.remove('is-typing'); });

  /* Projects filter */
  const filters = $('[data-filters]');
  if (filters) {
    filters.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-filter]');
      if (!b) return;
      const f = b.dataset.filter;
      $$('button', filters).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      $$('[data-sector]').forEach((card) => { card.hidden = f !== 'all' && card.dataset.sector !== f; });
      $('.proj-grid').classList.toggle('is-filtered', f !== 'all');
    });
  }
})();
