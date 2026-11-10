// Products menu: it opens on hover and keyboard focus in CSS alone. This adds Escape to close it.
(() => {
  const item = document.querySelector('.nav__item--menu');
  const menu = item && item.querySelector('.mega');
  if (!menu) return;
  item.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    menu.setAttribute('data-closed', '');
    item.querySelector('.nav__link').focus();
  });
  item.addEventListener('mouseleave', () => menu.removeAttribute('data-closed'));
  item.addEventListener('focusout', (e) => { if (!item.contains(e.relatedTarget)) menu.removeAttribute('data-closed'); });
})();
