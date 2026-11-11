// Projects: the sector filter hides every [data-sector] that does not match, a line says what is
// showing, and a link to a sector that has been filtered out brings everything back first.
(() => {
  const filters = $('[data-filters]');
  if (!filters) return;
  const status = $('[data-pjx-status]');
  const kinds = $$('.pjx-kind');
  filters.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-filter]');
    if (!b) return;
    const f = b.dataset.filter;
    $$('button', filters).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    $$('[data-sector]').forEach((el) => { el.hidden = f !== 'all' && el.dataset.sector !== f; });
    const shown = kinds.filter((k) => !k.closest('[hidden]')).length;
    status.textContent = f === 'all' ? status.dataset.all : `${f}: showing ${shown} of ${kinds.length} kinds of work`;
  });
  const land = () => {
    const target = location.hash.length > 1 && document.getElementById(location.hash.slice(1));
    if (!target || !target.closest('[hidden]')) return;
    $('button[data-filter="all"]', filters).click();
    target.scrollIntoView();
  };
  window.addEventListener('hashchange', land);
})();
