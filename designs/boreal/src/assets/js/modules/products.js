/* Products.
   1. The index (/products/): a field that narrows the nine lines as you type. It searches product
      names, what each is for, brands and trade abbreviations; matching products show their note.
   2. A line page: "Add to quote" on any product. The list is kept for the visit (sessionStorage),
      so products from several lines can reach one request, and every quote link on the page carries
      it to the quote form. The button says which state it is in ("Add to quote" / "On the quote"),
      so it carries no pressed state of its own.
   Both are extras: without this script the index is the full list and the buttons carry the line. */
(() => {
  const { $, $$ } = UCM;
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

  /* ---- The list of picks, shared by the line pages and the index ---- */
  const KEY = 'uresco.picks';
  const readPicks = () => { try { return JSON.parse(sessionStorage.getItem(KEY)) || []; } catch { return []; } };
  const writePicks = (list) => { try { if (list.length) sessionStorage.setItem(KEY, JSON.stringify(list)); else sessionStorage.removeItem(KEY); } catch { /* storage blocked: the list still works on this page */ } };
  // One row of text per line: "Line — product, product". `own` is the line a link belongs to, listed even with nothing picked in it.
  const productText = (list, own) => {
    const byLine = new Map();
    list.forEach(({ line, item }) => byLine.set(line, [...(byLine.get(line) || []), item]));
    if (own && !byLine.has(own)) byLine.set(own, []);
    return [...byLine].map(([line, items]) => line + (items.length ? ' — ' + items.join(', ') : '')).join('\n');
  };
  // Quote links that belong to a line, and the page's bare ones (action bar, masthead): each goes back to its own href when the list is empty.
  const carrier = (lineLinks) => {
    const bare = $$('a[href]').filter((a) => a.host === location.host && /\/quote\/$/.test(a.pathname) && !a.search && !a.hash).map((a) => [a, null]);
    const links = [...lineLinks, ...bare].map(([a, own]) => ({ a, own, was: a.getAttribute('href') }));
    return (list) => links.forEach(({ a, own, was }) => a.setAttribute('href', list.length ? was.split('?')[0] + '?product=' + encodeURIComponent(productText(list, own)) : was));
  };

  const root = $('[data-pidx]');
  if (root) {
    const input = $('[data-pidx-q]', root), clear = $('[data-pidx-clear]', root), count = $('[data-pidx-count]', root), none = $('[data-pidx-none]', root), more = $('[data-pidx-more]', root);
    const tries = $$('[data-pidx-try]', root);
    const rows = $$('[data-pidx-row]', root).map((el) => ({
      el, text: norm(el.dataset.s),
      items: $$('[data-pidx-item]', el).map((li) => ({ li, note: $('small', li), text: norm(li.dataset.s) })),
    }));
    const all = count.innerHTML;
    const STOP = new Set(['a', 'an', 'and', 'for', 'in', 'of', 'on', 'the', 'to', 'with']);
    const has = (text, words) => words.every((w) => (' ' + text).includes(' ' + w));
    const apply = () => {
      const words = norm(input.value).replace(/(\d) (?:x|by) (\d)/g, '$1x$2').split(' ').filter(Boolean);
      const on = words.length > 0;
      // Every word first. If nothing has them all, any of them: a near answer beats none.
      const exact = !on || rows.some((r) => has(r.text, words) || r.items.some((it) => has(it.text, words)));
      const wide = words.filter((w) => w.length > 1 && !STOP.has(w));
      const test = exact ? (t) => has(t, words) : (t) => wide.some((w) => (' ' + t).includes(' ' + w));
      let lines = 0, products = 0;
      rows.forEach((r) => {
        let hits = 0;
        r.items.forEach((it) => {
          const hit = on && test(it.text);
          it.li.classList.toggle('is-hit', hit);
          it.note.hidden = !hit;
          if (hit) hits++;
        });
        const show = !on || hits > 0 || test(r.text);
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
      else if (products) count.textContent = `${exact ? '' : 'Closest: '}${products} product${products === 1 ? '' : 's'} in ${lines} line${lines === 1 ? '' : 's'}`;
      else count.textContent = `${exact ? '' : 'Closest: '}${lines === 1 ? '1 line matches' : `${lines} lines match`}`;
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
    // Products picked on a line page ride along from here too.
    const carry = carrier($$('.pidx-row__quote', root).map((a) => [a, new URL(a.href).searchParams.get('product')]));
    carry(readPicks());
    // Back from a line page with the field still filled in, or the list changed.
    window.addEventListener('pageshow', () => { if (input.value) apply(); carry(readPicks()); });
  }

  const line = $('[data-pline]');
  if (line) {
    const here = line.dataset.line;
    const picks = $$('[data-pline-pick]', line), statuses = $$('[data-pline-status]', line).map((el) => ({ el, idle: el.textContent }));
    const acts = $('[data-pline-acts]', line), clear = $('[data-pline-clear]', line);
    const carry = carrier($$('[data-pline-quote]').map((a) => [a, here]));
    let list = readPicks();
    const sync = () => {
      picks.forEach((b) => {
        const on = list.some((p) => p.line === here && p.item === b.dataset.plinePick);
        b.toggleAttribute('data-on', on);
        b.closest('li').classList.toggle('is-picked', on);
      });
      const names = list.map((p) => p.item);
      statuses.forEach(({ el, idle }) => {
        el.textContent = names.length ? `${names.length} on the quote: ${names.join(', ')}.` : idle;
        el.classList.toggle('is-on', names.length > 0);
      });
      if (acts) acts.hidden = !names.length;
      carry(list);
    };
    picks.forEach((b) => b.addEventListener('click', () => {
      const item = b.dataset.plinePick, on = list.some((p) => p.line === here && p.item === item);
      list = on ? list.filter((p) => !(p.line === here && p.item === item)) : [...list, { line: here, item }];
      writePicks(list);
      sync();
    }));
    if (clear) clear.addEventListener('click', () => { list = []; writePicks(list); sync(); if (picks[0]) picks[0].focus(); });
    window.addEventListener('pageshow', () => { list = readPicks(); sync(); });
    sync();
  }
})();
