// Products menu. It opens on hover with CSS alone; this adds the caret button for keyboard and
// touch, Escape to close, and closing when focus or a click lands elsewhere.
(() => {
  const item = $('[data-menu]');
  if (!item) return;
  const btn = $('.nav__toggle', item);
  const set = (open) => {
    item.toggleAttribute('data-open', open);
    btn.setAttribute('aria-expanded', String(open));
  };
  btn.addEventListener('click', () => set(!item.hasAttribute('data-open')));
  item.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && item.hasAttribute('data-open')) { set(false); btn.focus(); }
  });
  item.addEventListener('focusout', (e) => { if (!item.contains(e.relatedTarget)) set(false); });
  document.addEventListener('click', (e) => { if (!item.contains(e.target)) set(false); });
  // Escape also dismisses a menu that only the pointer opened; moving away and back brings it again.
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && item.matches(':hover')) item.setAttribute('data-shut', ''); });
  item.addEventListener('mouseleave', () => item.removeAttribute('data-shut'));
})();
