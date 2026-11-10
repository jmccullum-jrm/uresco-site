// Products. Two small enhancements; both pages work without them.
//  1. The index (/products/): typing in "Find a product" narrows the nine lines to the rows
//     and items that match, and Enter goes to the first match.
//  2. A line page: ticking other lines on the load ticket sends them all to the quote form.
(() => {
  /* ---- 1. Finder ---- */
  const form = document.querySelector('[data-find]');
  if (form) {
    const input = form.querySelector('input');
    const clear = form.querySelector('[data-find-clear]');
    const status = form.querySelector('[data-find-status]');
    const more = document.querySelector('[data-find-more]');
    const idle = status.textContent;
    const rows = Array.from(document.querySelectorAll('[data-find-row]')).map((row) => ({
      row, hay: row.dataset.findRow, link: row.querySelector('.pl-line__link'),
      items: Array.from(row.querySelectorAll('[data-find]')).map((el) => ({ el, hay: el.dataset.find, link: el.querySelector('a') })),
    }));
    // "trusses" finds "truss", "2x6" stays whole, "i-joist" becomes two words.
    const words = (q) => q.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().split(' ').filter(Boolean)
      .map((w) => (w.length > 3 ? w.replace(/(es|s)$/, '') : w));
    const has = (hay, ws) => ws.every((w) => hay.includes(w));
    const touch = matchMedia('(hover: none)').matches;
    let first = null;
    const run = () => {
      const ws = words(input.value);
      const on = ws.length > 0;
      // "i-joist" should find I-joists before everything with a joist in it: if anything holds
      // the words side by side, only those count; otherwise the words may sit anywhere.
      const phrase = ' ' + ws.join(' ');
      const tight = on && rows.some((r) => r.items.some((it) => (' ' + it.hay).includes(phrase)));
      const hit = (it) => (tight ? (' ' + it.hay).includes(phrase) : has(it.hay, ws));
      let lines = 0, products = 0;
      first = null;
      rows.forEach((r) => {
        const hits = on ? r.items.filter(hit) : [];
        const byName = on && has(r.hay, ws);
        const show = !on || byName || hits.length > 0;
        r.row.hidden = !show;
        // A line that matches by its own name shows everything in it; otherwise only the hits.
        r.items.forEach((it) => { const h = hits.includes(it); it.el.hidden = on && !h && !byName; it.el.classList.toggle('is-hit', h); });
        if (on && show) { lines++; products += hits.length; if (!first) first = hits.length ? hits[0].link : r.link; }
      });
      clear.hidden = !input.value;
      if (more) more.classList.toggle('is-up', on && !lines);
      const enter = touch ? '' : (lines === 1 && products < 2 ? ' Enter opens it.' : ' Enter opens the first.');
      status.textContent = !on ? idle
        : !lines ? 'Not on the list by that name. Ask your yard: we carry more than fits here.'
        : products ? `${products} ${products === 1 ? 'product' : 'products'} in ${lines} ${lines === 1 ? 'line' : 'lines'}.${enter}`
        : `${lines} ${lines === 1 ? 'line' : 'lines'} by that name.${enter}`;
    };
    input.addEventListener('input', run);
    form.addEventListener('submit', (e) => { e.preventDefault(); if (first) location.href = first.href; });
    clear.addEventListener('click', () => { input.value = ''; run(); input.focus(); });
    input.addEventListener('keydown', (e) => { if (e.key === 'Escape' && input.value) { e.preventDefault(); input.value = ''; run(); } });
    // On a phone the keyboard covers half the screen: bring the field to the top so the rows show under it.
    input.addEventListener('focus', () => { if (matchMedia('(max-width: 899px)').matches) form.scrollIntoView({ block: 'start' }); });
    // Coming back to the page restores what was typed; show the matching rows again.
    window.addEventListener('pageshow', run);
    run();
  }

  /* ---- 2. Load ticket ---- */
  const load = document.querySelector('[data-load]');
  if (load) {
    const field = load.querySelector('input[name=product]');
    const own = field.value;
    const picks = Array.from(load.querySelectorAll('input[type=checkbox]'));
    const label = load.querySelector('[data-load-label]');
    const count = load.querySelector('[data-load-count]');
    const unit = load.querySelector('[data-load-unit]');
    const paint = () => {
      const on = picks.filter((p) => p.checked);
      // One line per row of the quote form's materials box, this page's line first.
      field.value = [own, ...on.map((p) => p.value)].join(':\n');
      count.textContent = on.length + 1;
      unit.textContent = on.length ? 'lines on the load' : 'line on the load';
      label.textContent = on.length ? label.dataset.many : label.dataset.one;
    };
    picks.forEach((p) => p.addEventListener('change', paint));
    window.addEventListener('pageshow', paint);
    paint();
  }
})();
