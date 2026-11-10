// Products index. Two things, both extras over a list that already works as plain links:
//  1. Find a product: typing narrows the stock list to the lines that carry it and underlines
//     the matching items. With one line left, Enter opens it.
//  2. On wide screens, pointing at (or tabbing to) a line shows its photograph in the frame.
(() => {
  const root = $('[data-prod-ledger]');
  if (!root) return;
  const rows = $$('.prod-row', root);
  const imgs = $$('.stock__frame img', root);
  const cap = $('[data-prod-cap]', root);
  const wide = matchMedia('(min-width: 1000px)');

  const show = (i) => {
    if (!wide.matches || !imgs[i]) return;
    const img = imgs[i];
    rows.forEach((r, j) => r.classList.toggle('is-on', j === i));
    const on = () => {
      imgs.forEach((x) => x.classList.toggle('is-on', x === img));
      if (cap) cap.textContent = rows[i].dataset.cap;
    };
    if (img.dataset.srcset) {
      img.srcset = img.dataset.srcset; img.src = img.dataset.src;
      delete img.dataset.srcset;
    }
    if (img.complete && img.naturalWidth > 1) on(); else img.addEventListener('load', on, { once: true });
  };
  rows.forEach((r, i) => {
    r.addEventListener('pointerenter', () => show(i));
    r.addEventListener('focusin', () => show(i));
  });

  const input = $('[data-prod-q]', root);
  const count = $('[data-prod-count]', root);
  const clear = $('[data-prod-clear]', root);
  const none = $('[data-prod-none]', root);
  if (!input) return;
  // Folded the same way as the data-terms the page was built with.
  const fold = (s) => s.replace(/[®™]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const left = () => rows.filter((r) => !r.hidden);
  const apply = () => {
    const words = fold(input.value).split(' ').filter(Boolean);
    rows.forEach((r) => {
      r.hidden = !words.every((w) => r.dataset.terms.includes(w));
      $$('.prod-row__items li', r).forEach((li) => li.classList.toggle('is-hit', words.length > 0 && words.some((w) => li.dataset.t.includes(w))));
    });
    const n = left().length;
    count.textContent = !words.length ? `${rows.length} lines` : n === 1 ? '1 line · Enter opens it' : n ? `${n} of ${rows.length} lines` : 'No match';
    none.hidden = n > 0;
    clear.hidden = !input.value;
    // Keep the frame on a line that is still in the list.
    if (n && !left().some((r) => r.classList.contains('is-on'))) show(rows.indexOf(left()[0]));
  };
  input.addEventListener('input', apply);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && input.value && left().length === 1) { e.preventDefault(); $('a', left()[0]).click(); }
    if (e.key === 'Escape' && input.value) { e.preventDefault(); input.value = ''; apply(); }
  });
  clear.addEventListener('click', () => { input.value = ''; apply(); input.focus(); });
  // A value the browser restored on the way back from a line page still filters.
  if (input.value) apply();
  window.addEventListener('pageshow', () => { if (input.value) apply(); });
})();
