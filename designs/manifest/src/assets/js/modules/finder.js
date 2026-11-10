/* Alaska page: "Where are you building?" The combobox, the ship-to ticket and the pin on the plate.
   Markup and data come from finder() in src/pages/alaska.mjs. The ticket is already rendered for the
   example place; this script only fills its fields, so nothing moves on load. Without it the three
   yards are shown instead (alaska.css). */
(() => {
  const root = document.querySelector('[data-finder]');
  if (!root) return;
  const $ = (s, el = root) => el.querySelector(s);
  const $$ = (s, el = root) => Array.from(el.querySelectorAll(s));
  const calm = matchMedia('(prefers-reduced-motion: reduce)');
  const touch = matchMedia('(pointer: coarse)');
  const fold = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’'.]/g, '').toLowerCase().trim();

  const data = JSON.parse($('[data-finder-data]').textContent);
  const places = data.places.map(([name, st, region, access, yard, x, y]) => ({ name, st, region, access, yard, x, y, key: fold(name) }));
  const byName = new Map(places.map((p) => [p.name, p]));
  const aliases = Object.entries(data.aliases).map(([alias, name]) => ({ alias, key: fold(alias), place: byName.get(name) }));
  const SUGGEST = data.suggest.map((name) => ({ p: byName.get(name) }));

  const input = $('.shipto__input'), list = $('.shipto__list'), clear = $('[data-clear]');
  const route = $('[data-route]'), live = $('[data-live]'), searchEl = $('.shipto__search');
  const field = (k) => $(`[data-r="${k}"]`, route);
  let active = -1, options = [];

  /* ---- The ticket ---- */
  const quoteUrl = (where, yard) => `${data.quote}?location=${encodeURIComponent(where)}${yard ? '&yard=' + yard : ''}`;
  // Once a place is named, every plain quote link on the page carries it.
  const quoteLinks = Array.from(document.querySelectorAll('a[href$="quote/"]'));
  const carry = (url) => { field('quote').href = url; quoteLinks.forEach((a) => { a.href = url; }); };
  const showYard = (id) => $$('[data-y]', route).forEach((el) => { el.hidden = el.dataset.y !== id; });
  // The new name is written in the same way a drawing is plotted.
  const plot = () => {
    if (calm.matches) return;
    const el = field('name');
    el.classList.remove('is-new');
    void el.offsetWidth;
    el.classList.add('is-new');
  };

  const fill = (p) => {
    const acc = data.access[p.access], yard = data.yards[p.yard];
    const modes = acc.modes.map(([lane, text]) => [lane, text.replace('{yard}', yard.name)]);
    field('name').textContent = `${p.name}, ${data.states[p.st]}`;
    field('eg').hidden = true;
    field('region').textContent = p.region;
    field('tag').textContent = acc.tag;
    field('tag').hidden = false;
    showYard(p.yard);
    modes.forEach(([lane, text], i) => {
      field(`m${i}`).textContent = text;
      field(`t${i}`).textContent = lane;
      field(`t${i}`).classList.toggle('is-none', !lane);
    });
    if (modes.some(([lane]) => lane)) field('modes').removeAttribute('data-lanes'); else field('modes').dataset.lanes = 'none';
    field('how').hidden = false;
    field('else').hidden = true;
    field('note').hidden = false;
    field('short').textContent = p.name;
    carry(quoteUrl(`${p.name}, ${p.st}`, p.yard));
    live.textContent = `${p.name}, ${data.states[p.st]}. ${acc.tag}. Yard to call: ${yard.name}, ${yard.phone}. How freight typically gets there: ${modes.map((m) => m[1]).join('; ')}. Typical for the region, not a schedule or a price. Any yard can help.`;
  };
  const fillUnknown = (text) => {
    field('name').textContent = text;
    field('eg').hidden = true;
    field('region').textContent = 'Not on our short list';
    field('tag').hidden = true;
    showYard('any');
    field('how').hidden = true;
    field('else').hidden = false;
    field('note').hidden = true;
    field('short').textContent = text.length > 22 ? 'this job' : text;
    carry(quoteUrl(text));
    live.textContent = `${text} is not on our short list, which does not mean we cannot get there. Any yard can help. Use the quote button, or call a yard.`;
  };

  /* ---- The pin on the delivery plate ---- */
  const labels = document.querySelector('.pmap__labels');
  let pin = null, covered = null;
  const pinOn = (p) => {
    if (!labels) return;
    if (covered) { covered.classList.remove('is-pinned'); covered = null; }
    // Yards and Puget Sound already sit under a yard tag; a second label there only hides it.
    const show = p && p.st === 'AK' && !Object.values(data.yards).some((y) => y.name === p.name);
    if (!show) { if (pin) pin.hidden = true; return; }
    if (!pin) {
      pin = document.createElement('span');
      pin.className = 'pmap__pin';
      pin.setAttribute('aria-hidden', 'true');
      pin.innerHTML = '<i></i><b></b>';
      labels.append(pin);
    }
    pin.hidden = false;
    pin.style.left = `${p.x}%`;
    pin.style.top = `${p.y}%`;
    pin.lastChild.textContent = p.name;
    covered = Array.from(labels.querySelectorAll('.pmap__town')).find((t) => t.textContent === p.name) || null;
    if (covered) covered.classList.add('is-pinned');
    // Use the side the plate already keeps clear for this town; near the top edge, stay on the sheet.
    pin.lastChild.dataset.side = p.y < 14 ? 'e' : covered ? covered.dataset.side : p.x > 66 ? 'w' : 'e';
  };

  /* ---- Choosing ---- */
  const press = (name) => $$('.shipto__chip').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.place === name)));
  const settle = () => { if (touch.matches) input.blur(); };
  const choose = (p) => {
    close();
    input.value = p.name;
    clear.hidden = false;
    press(p.name);
    fill(p);
    plot();
    pinOn(p);
  };
  const chooseUnknown = (text) => {
    close();
    clear.hidden = false;
    press('');
    fillUnknown(text.slice(0, 60));
    plot();
    pinOn(null);
  };

  /* ---- The combobox ---- */
  const search = (q) => {
    const k = fold(q);
    if (!k) return SUGGEST;
    const out = [];
    places.forEach((p) => {
      const i = p.key.indexOf(k);
      if (i === 0) out.push({ p, rank: 0 });
      else if (i > 0) out.push({ p, rank: p.key[i - 1] === ' ' ? 1 : 2 });
    });
    aliases.forEach((a) => { if (a.key.startsWith(k) && !out.some((o) => o.p === a.place)) out.push({ p: a.place, rank: 0, alias: a.alias }); });
    const hits = out.sort((a, b) => a.rank - b.rank || a.p.name.localeCompare(b.p.name)).slice(0, 8);
    return hits.length ? hits : [{ unknown: q.trim() }];
  };
  const setActive = (i) => {
    active = i;
    $$('[role=option]', list).forEach((el, j) => el.setAttribute('aria-selected', String(j === i)));
    const el = list.children[i];
    if (el) { input.setAttribute('aria-activedescendant', el.id); el.scrollIntoView({ block: 'nearest' }); } else input.removeAttribute('aria-activedescendant');
  };
  const open = () => {
    options = search(input.value);
    list.textContent = '';
    options.forEach((o, i) => {
      const li = document.createElement('li');
      li.id = `${list.id}-${i}`;
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', 'false');
      if (o.unknown) {
        li.className = 'is-none';
        li.textContent = `Not on our short list. See what to do for ${o.unknown}.`;
      } else {
        const name = document.createElement('span');
        name.textContent = o.alias ? `${o.p.name} (${o.alias})` : o.p.name;
        const meta = document.createElement('small');
        meta.textContent = `${o.p.region}, ${o.p.st}`;
        li.append(name, meta);
      }
      list.append(li);
    });
    list.hidden = false;
    searchEl.classList.add('is-open');
    input.setAttribute('aria-expanded', 'true');
    setActive(input.value.trim() ? 0 : -1);
  };
  function close() {
    list.hidden = true;
    searchEl.classList.remove('is-open');
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    active = -1;
  }
  const take = (o) => {
    if (o.unknown) chooseUnknown(o.unknown); else choose(o.p);
    settle();
  };

  input.addEventListener('input', () => { clear.hidden = !input.value; open(); });
  input.addEventListener('focus', () => {
    input.select();
    open();
    // On a phone, lift the field above the keyboard's reach.
    if (window.innerWidth < 700) input.scrollIntoView({ block: 'start', behavior: calm.matches ? 'auto' : 'smooth' });
  });
  input.addEventListener('click', () => { if (list.hidden) open(); });
  input.addEventListener('blur', () => setTimeout(close, 120));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (list.hidden) return open();
      if (e.altKey) return close();
      if (options.length) setActive((active + (e.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (list.hidden) open();
      const pick = options[active] || (input.value.trim() ? options[0] : null);
      if (pick) take(pick);
    } else if (e.key === 'Escape') {
      if (!list.hidden) { e.preventDefault(); close(); } else if (input.value) { input.value = ''; clear.hidden = true; }
    }
  });
  // mousedown, not click: the choice must land before the field's blur closes the list.
  list.addEventListener('mousedown', (e) => e.preventDefault());
  list.addEventListener('click', (e) => {
    const li = e.target.closest('[role=option]');
    const o = li && options[Array.prototype.indexOf.call(list.children, li)];
    if (o) take(o);
  });
  clear.addEventListener('click', () => { input.value = ''; clear.hidden = true; input.focus(); });

  root.addEventListener('click', (e) => {
    const chip = e.target.closest('.shipto__chip');
    if (chip && byName.has(chip.dataset.place)) choose(byName.get(chip.dataset.place));
  });
})();
