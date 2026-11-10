// "Where are you building?" on the Alaska page: a combobox over src/data/places.mjs, one yellow
// answer card and the map. The card's first state, in the HTML, already says the general answer;
// without this script a <noscript> block shows the three yards instead.
(() => {
  const box = document.querySelector('[data-finder]');
  if (!box) return;
  let data;
  try { data = JSON.parse(box.querySelector('[data-finder-data]').textContent); } catch { return; }

  const $ = (s, el = box) => el.querySelector(s);
  const $$ = (s, el = box) => Array.from(el.querySelectorAll(s));
  const calm = matchMedia('(prefers-reduced-motion: reduce)');
  const fold = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’'.]/g, '').toLowerCase().trim();
  const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[^a-z]/g, '');

  const places = data.places.map(([name, st, region, access, yard, lanes, xy]) => ({ name, st, region, access, yard, lanes, xy, key: fold(name) }));
  const byName = new Map(places.map((p) => [p.name, p]));
  const aliases = Object.entries(data.aliases).map(([alias, name]) => ({ alias, key: fold(alias), place: byName.get(name) }));
  const SUGGEST = ['Anchorage', 'Fairbanks', 'Juneau', 'Sitka', 'Bethel', 'Nome', 'Kotzebue', 'Utqiaġvik'].map((n) => ({ p: byName.get(n) }));
  const STATE = { AK: 'Alaska', WA: 'Washington' };

  const input = $('.finder__input'), list = $('.finder__list'), clear = $('[data-clear]');
  const chips = $$('.town');
  const card = $('[data-way]'), live = $('[data-live]');
  const part = (name) => card.querySelector(`[data-way-${name}]`);
  const quote = part('quote'), call = part('call'), any = part('any'), how = part('how');
  const quoteBase = quote.getAttribute('href').split('?')[0];

  const map = document.querySelector('.finder [data-map]');
  const labels = map && map.querySelector('.dmap__labels');
  const [mapW, mapH] = data.size;
  let marker = null; // for a chosen place with no label of its own
  let active = -1, options = [];

  /* ---- The card ---- */
  const pop = () => { card.classList.remove('is-new'); void card.offsetWidth; card.classList.add('is-new'); };
  const showQuote = (label, href) => { part('short').textContent = label; quote.href = href; };

  const fill = (p) => {
    const acc = data.access[p.access], yard = data.yards[p.yard];
    const modes = acc.modes.map(([ic, text]) => [ic, text.replace('{yard}', yard.name)]);
    part('label').textContent = acc.tag;
    part('name').textContent = p.name;
    part('region').textContent = `${p.region}, ${STATE[p.st]}`;
    part('region').hidden = false;
    part('text').hidden = true;
    how.hidden = false;
    modes.forEach(([ic, text], i) => {
      card.querySelector(`[data-way-m="${i}"]`).textContent = text;
      card.querySelectorAll(`[data-ic^="${i}-"]`).forEach((el) => { el.hidden = el.dataset.ic !== `${i}-${ic}`; });
    });
    part('yard').textContent = yard.name;
    part('phone').textContent = yard.phone;
    call.href = yard.tel; call.hidden = false; any.hidden = true;
    const offRoad = p.access === 'coastal' || p.access === 'seasonal';
    showQuote(`Get a quote for ${p.name}`, `${quoteBase}?yard=${p.yard}&location=${encodeURIComponent(`${p.name}, ${p.st}`)}${offRoad ? '&delivery=Remote%20Alaska%20shipping' : ''}`);
    part('note').hidden = false;
    card.dataset.ico = acc.icon;
    live.textContent = `${p.name}, ${STATE[p.st]}. ${acc.tag}. How freight typically gets there: ${modes.map((m) => m[1]).join(', ')}. Yard to call: ${yard.name}, ${yard.phone}. Typical for the region, not a schedule or a price.`;
    pop();
  };

  const fillUnknown = (text) => {
    part('label').textContent = 'Not on our short list';
    part('name').textContent = text;
    part('region').hidden = true;
    part('text').textContent = 'That is not on our short list, which does not mean we cannot get there. Send the details and a yard will work out the route.';
    part('text').hidden = false;
    how.hidden = true;
    call.hidden = true; any.hidden = false;
    showQuote(`Get a quote for ${text}`, `${quoteBase}?location=${encodeURIComponent(text)}`);
    part('note').hidden = true;
    delete card.dataset.ico;
    live.textContent = `${text} is not on our short list, which does not mean we cannot get there. Any yard can help. Use the quote button, or call a yard.`;
    pop();
  };

  /* ---- The map: light the lanes, the place and the yard to call ---- */
  const draw = (p) => {
    if (!map) return;
    map.querySelectorAll('.dmap__town.is-on').forEach((el) => el.classList.remove('is-on'));
    map.querySelectorAll('.dmap__yard.is-on').forEach((el) => el.classList.remove('is-on'));
    if (marker) { marker.remove(); marker = null; }
    if (!p) { delete map.dataset.mode; return; }
    map.dataset.mode = p.lanes;
    const yard = map.querySelector(`.dmap__yard[href$="#${p.yard}"]`);
    if (yard) yard.classList.add('is-on');
    const own = map.querySelector(`.dmap__town[data-town="${slug(p.name)}"]`);
    if (own) { own.classList.add('is-on'); return; }
    // Puget Sound sits under the Kent pin, and a yard's own town under its pin: the lit pin says it.
    if (p.access === 'local' || !p.xy || !labels || samePlaceAsYard(p, yard)) return;
    marker = document.createElement('span');
    marker.className = 'dmap__town is-on';
    marker.setAttribute('aria-hidden', 'true');
    marker.dataset.side = p.xy[0] > mapW * 0.45 ? 'w' : 'e';
    marker.style.left = `${(p.xy[0] / mapW * 100).toFixed(2)}%`;
    marker.style.top = `${(p.xy[1] / mapH * 100).toFixed(2)}%`;
    const dot = document.createElement('i'), name = document.createElement('b');
    name.textContent = p.name;
    marker.append(dot, name);
    labels.append(marker);
  };
  const samePlaceAsYard = (p, pin) => {
    if (!pin) return false;
    const x = parseFloat(pin.style.left) / 100 * mapW, y = parseFloat(pin.style.top) / 100 * mapH;
    return Math.hypot(p.xy[0] - x, p.xy[1] - y) < 12;
  };

  /* ---- Choosing ---- */
  const press = (name) => chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.place === name)));
  // On a phone the answer sits below the field and the chips: bring all of it clear of the masthead
  // and the action bar. (scrollIntoView's "nearest" ignores scroll-margin once the card is in view.)
  const reveal = () => {
    if (window.innerWidth >= 1000) return;
    setTimeout(() => {
      const bar = document.querySelector('.actionbar'), mast = document.querySelector('.masthead');
      const low = (bar && bar.getClientRects().length ? bar.getBoundingClientRect().top : window.innerHeight) - 14;
      const high = (mast ? mast.getBoundingClientRect().bottom : 0) + 12;
      const r = card.getBoundingClientRect();
      let dy = r.bottom > low ? r.bottom - low : 0;
      if (r.top - dy < high) dy = r.top - high;
      if (Math.abs(dy) > 1) window.scrollBy({ top: dy, behavior: calm.matches ? 'auto' : 'smooth' });
    }, 60);
  };
  const choose = (p, { typed = false } = {}) => {
    close();
    input.value = p.name; clear.hidden = false;
    press(p.name); fill(p); draw(p);
    if (typed) input.blur();
    reveal();
  };
  const chooseUnknown = (text) => {
    close();
    clear.hidden = false; press(''); fillUnknown(text.slice(0, 60)); draw(null);
    input.blur();
    reveal();
  };

  /* ---- The combobox ---- */
  const search = (q) => {
    const k = fold(q);
    if (!k) return SUGGEST;
    const out = [];
    places.forEach((p) => { const i = p.key.indexOf(k); if (i === 0) out.push({ p, rank: 0 }); else if (i > 0) out.push({ p, rank: p.key[i - 1] === ' ' ? 1 : 2 }); });
    aliases.forEach((a) => { if (a.key.startsWith(k) && !out.some((o) => o.p === a.place)) out.push({ p: a.place, rank: 0, alias: a.alias }); });
    return out.sort((a, b) => a.rank - b.rank || a.p.name.localeCompare(b.p.name)).slice(0, 8);
  };
  const setActive = (i) => {
    active = i;
    Array.from(list.children).forEach((el, j) => el.setAttribute('aria-selected', String(j === i)));
    const el = list.children[i];
    if (el && el.id) { input.setAttribute('aria-activedescendant', el.id); el.scrollIntoView({ block: 'nearest' }); } else input.removeAttribute('aria-activedescendant');
  };
  const open = () => {
    options = search(input.value);
    list.textContent = '';
    options.forEach((o, i) => {
      const li = document.createElement('li');
      li.setAttribute('role', 'option'); li.id = `finder-opt-${i}`; li.setAttribute('aria-selected', 'false');
      const name = document.createElement('span'); name.textContent = o.alias ? `${o.p.name} (${o.alias})` : o.p.name;
      const meta = document.createElement('small'); meta.textContent = o.p.region;
      li.append(name, meta);
      list.append(li);
    });
    if (!options.length) {
      const li = document.createElement('li');
      li.className = 'is-none'; li.setAttribute('role', 'option'); li.setAttribute('aria-disabled', 'true'); li.setAttribute('aria-selected', 'false');
      li.textContent = 'Not on our short list. Press Enter and we will still point you to a yard.';
      list.append(li);
    }
    list.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    setActive(options.length && input.value.trim() ? 0 : -1);
  };
  function close() { list.hidden = true; input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); active = -1; }

  input.addEventListener('input', () => { clear.hidden = !input.value; open(); });
  input.addEventListener('focus', () => {
    input.select(); open();
    // On a phone, lift the field above the keyboard's reach.
    if (window.innerWidth < 700) $('.finder__field').scrollIntoView({ block: 'start', behavior: calm.matches ? 'auto' : 'smooth' });
  });
  input.addEventListener('blur', () => setTimeout(close, 120));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (list.hidden) return open();
      if (!options.length) return;
      setActive((active + (e.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (list.hidden) open();
      const pick = options[active] || (input.value.trim() ? options[0] : null);
      if (pick) choose(pick.p, { typed: true });
      else if (input.value.trim()) chooseUnknown(input.value.trim());
    } else if (e.key === 'Escape') {
      if (!list.hidden) { e.preventDefault(); close(); } else if (input.value) { input.value = ''; clear.hidden = true; }
    }
  });
  // mousedown, not click: the choice must land before the field's blur closes the list.
  list.addEventListener('mousedown', (e) => e.preventDefault());
  list.addEventListener('click', (e) => {
    const li = e.target.closest('[role=option]');
    const o = li && options[Array.prototype.indexOf.call(list.children, li)];
    if (o) choose(o.p, { typed: true });
  });
  clear.addEventListener('click', () => { input.value = ''; clear.hidden = true; input.focus(); });

  box.addEventListener('click', (e) => {
    const chip = e.target.closest('.town');
    if (chip && byName.has(chip.dataset.place)) choose(byName.get(chip.dataset.place));
  });
})();
