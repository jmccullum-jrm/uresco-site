/* Kinds of work (projects page): the chips show one sector at a time and say how much is showing.
   Without this script the chips are links to each sector and everything is on the page. */
(() => {
  const { $, $$ } = UCM;
  const bar = $('[data-pj-filter]');
  if (!bar) return;
  const chips = $$('button[data-pj]', bar), sectors = $$('[data-pj-sector]'), count = $('[data-pj-count]');
  const all = count ? count.textContent : '';
  const mast = $('[data-masthead]');
  bar.addEventListener('click', (e) => {
    const chip = e.target.closest('button[data-pj]');
    if (!chip) return;
    const f = chip.dataset.pj;
    let n = 0;
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
    sectors.forEach((s) => {
      const on = f === 'all' || s.id === f;
      s.hidden = !on;
      if (on) n += $$('.pj-kind', s).length;
    });
    if (count) count.textContent = f === 'all' ? all : `${n} ${n === 1 ? 'kind' : 'kinds'} of work in ${chip.textContent}`;
    // On a phone the first result is behind the action bar after a tap: bring it up under the masthead.
    if (matchMedia('(max-width: 43.6875em)').matches) {
      const first = sectors.find((s) => !s.hidden);
      if (first) window.scrollBy({ top: first.getBoundingClientRect().top - (mast ? mast.offsetHeight : 0) - 8, behavior: UCM.calm.matches ? 'auto' : 'smooth' });
    }
  });
})();
