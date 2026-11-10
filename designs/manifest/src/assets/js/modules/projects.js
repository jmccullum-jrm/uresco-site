// Projects: the sector key filters the schedule, says what is now showing (for a screen reader too) and brings the
// schedule back into view if the lines being read have just been filtered away. Without the script the key is not shown.
(() => {
  const key = document.querySelector('[data-pj-filters]');
  const out = document.querySelector('[data-pj-count]');
  const sched = document.querySelector('.pj-sched');
  if (!key || !out || !sched) return;
  const all = out.textContent;
  const buttons = Array.from(key.querySelectorAll('button[data-filter]'));
  const groups = Array.from(sched.querySelectorAll('[data-sector]'));
  key.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-filter]');
    if (!b) return;
    const f = b.dataset.filter;
    buttons.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    groups.forEach((g) => { g.hidden = f !== 'all' && g.dataset.sector !== f; });
    const n = sched.querySelectorAll('[data-sector]:not([hidden]) .pj-row').length;
    out.textContent = f === 'all' ? all : `${f}: ${n} ${n === 1 ? 'kind' : 'kinds'} of work`;
    const box = sched.getBoundingClientRect();
    if (box.top < 0 || box.top > window.innerHeight * 0.8) sched.scrollIntoView({ block: 'start' });
  });
  // The sector index under the hero links to the groups. If the key has filtered one away, show everything first.
  document.querySelectorAll('.pj-index a').forEach((a) => a.addEventListener('click', () => {
    const group = document.getElementById(a.hash.slice(1));
    if (group && group.hidden) key.querySelector('[data-filter="all"]').click();
  }));
})();
