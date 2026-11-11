// Products menu: it opens on hover and keyboard focus in CSS alone. This adds Escape to close it.
(() => {
  const item = document.querySelector('.nav__item--menu');
  const menu = item && item.querySelector('.mega');
  if (!menu) return;
  // On the document, because a menu opened by the pointer has to close with Escape even when focus is elsewhere.
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !item.matches(':hover, :focus-within')) return;
    const inside = item.matches(':focus-within');
    menu.setAttribute('data-closed', '');
    if (inside) item.querySelector('.nav__link').focus();
  });
  item.addEventListener('mouseleave', () => menu.removeAttribute('data-closed'));
  item.addEventListener('focusout', (e) => { if (!item.contains(e.relatedTarget)) menu.removeAttribute('data-closed'); });
})();
