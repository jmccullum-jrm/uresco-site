/* Products.
   1. The index (/products/): a field that narrows the nine lines as you type. It searches product
      names, what each is for, brands and trade abbreviations; matching products show their note.
   2. A line page: "Add to quote" on any product, and every quote button on the page carries the
      line and the products chosen to the quote form. The button says which state it is in
      ("Add to quote" / "On the quote"), so it carries no pressed state of its own.
   Both are extras: without this script the index is the full list and the buttons carry the line. */
(() => {
  const { $, $$ } = UCM;
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

  const root = $('[data-pidx]');
  if (root) {
    const input = $('[data-pidx-q]', root), clear = $('[data-pidx-clear]', root), count = $('[data-pidx-count]', root), none = $('[data-pidx-none]', root), more = $('[data-pidx-more]', root);
    const tries = $$('[data-pidx-try]', root);
    const rows = $$('[data-pidx-row]', root).map((el) => ({
      el, text: norm(el.dataset.s),
      items: $$('[data-pidx-item]', el).map((li) => ({ li, note: $('small', li), text: norm(li.dataset.s) })),
    }));
    const all = count.innerHTML;
    const has = (text, words) => words.every((w) => (' ' + text).includes(' ' + w));
    const apply = () => {
      const words = norm(input.value).split(' ').filter(Boolean);
      const on = words.length > 0;
      let lines = 0, products = 0;
      rows.forEach((r) => {
        let hits = 0;
        r.items.forEach((it) => {
          const hit = on && has(it.text, words);
          it.li.classList.toggle('is-hit', hit);
          it.note.hidden = !hit;
          if (hit) hits++;
        });
        const show = !on || hits > 0 || has(r.text, words);
        r.el.hidden = !show;
        r.el.classList.toggle('is-narrowed', on && hits > 0);
        // A row shown by the filter must not wait for the scroll reveal.
        if (on) r.el.classList.add('is-in');
        if (show) { lines++; products += hits; }
      });
      root.classList.toggle('is-filtered', on);
      clear.hidden = !on;
      none.hidden = !on || lines > 0;
      if (more) more.hidden = on && !lines;
      tries.forEach((b) => b.setAttribute('aria-pressed', String(on && norm(b.dataset.pidxTry) === words.join(' '))));
      if (!on) count.innerHTML = all;
      else if (!lines) count.textContent = 'No match on the list';
      else if (products) count.textContent = `${products} product${products === 1 ? '' : 's'} in ${lines} line${lines === 1 ? '' : 's'}`;
      else count.textContent = lines === 1 ? '1 line matches' : `${lines} lines match`;
    };
    // The list is under the field: bring the field to the top of the screen so the answers show as you type.
    const lift = () => {
      const bar = input.closest('.pidx-find'), top = bar.getBoundingClientRect().top;
      const mast = $('[data-masthead]'), want = (mast ? mast.offsetHeight : 0) + 16;
      if (top > want + 40) window.scrollBy({ top: top - want, behavior: UCM.calm.matches ? 'auto' : 'smooth' });
    };
    input.addEventListener('focus', lift);
    input.addEventListener('input', apply);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && input.value) { input.value = ''; apply(); }
      // The field filters as you type; on a phone, Enter has nothing left to do but put the keyboard away.
      if (e.key === 'Enter' && matchMedia('(pointer: coarse)').matches) input.blur();
    });
    input.addEventListener('search', apply);
    clear.addEventListener('click', () => { input.value = ''; apply(); input.focus(); });
    tries.forEach((b) => b.addEventListener('click', () => {
      input.value = b.getAttribute('aria-pressed') === 'true' ? '' : b.dataset.pidxTry;
      apply();
      lift();
    }));
    // Back from a line page with the field still filled in.
    window.addEventListener('pageshow', () => { if (input.value) apply(); });
  }

  const line = $('[data-pline]');
  if (line) {
    const picks = $$('[data-pline-pick]', line), links = $$('[data-pline-quote]'), status = $('[data-pline-status]', line);
    const idle = status ? status.textContent : '';
    const isOn = (b) => b.hasAttribute('data-on');
    const sync = () => {
      const chosen = picks.filter(isOn).map((b) => b.dataset.plinePick);
      const product = line.dataset.line + (chosen.length ? ' — ' + chosen.join(', ') : '');
      links.forEach((a) => { a.href = line.dataset.quote + '?product=' + encodeURIComponent(product); });
      picks.forEach((b) => b.closest('li').classList.toggle('is-picked', isOn(b)));
      if (status) {
        status.textContent = chosen.length ? `On the quote: ${chosen.join(', ')}.` : idle;
        status.classList.toggle('is-on', chosen.length > 0);
      }
    };
    picks.forEach((b) => b.addEventListener('click', () => { b.toggleAttribute('data-on'); sync(); }));
  }
})();
