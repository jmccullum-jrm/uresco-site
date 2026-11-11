// "Where are you building?" on the Alaska page: a combobox over a short list of places, the answer
// under it, and a mark on the route plate. Markup and data come from src/pages/alaska.mjs. The answer
// is already rendered for the example place, so this script only fills its fields.
(() => {
  const finder = $('[data-placefinder]');
  if (!finder) return;
  const data = JSON.parse($('[data-finder-data]', finder).textContent);
  const calm = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(pointer: coarse)');
  const fold = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’'.]/g, '').toLowerCase().trim();

  const places = data.places.map(([name, st, lat, xy, region, access, yard, group, label, both]) => ({ name, st, lat, xy, region, access, yard, group, label, both, key: fold(name) }));
  const byName = new Map(places.map((p) => [p.name, p]));
  const aliases = Object.entries(data.aliases).map(([alias, name]) => ({ alias, key: fold(alias), place: byName.get(name) }));
  const SUGGEST = ['Bethel', 'Nome', 'Kotzebue', 'Utqiaġvik', 'Juneau', 'Sitka', 'Anchorage', 'Fairbanks'].map((name) => ({ p: byName.get(name) }));

  const input = $('.finder__input', finder), list = $('.finder__list', finder), clear = $('[data-clear]', finder);
  const answer = $('[data-answer]', finder), live = $('[data-live]', finder);
  const section = finder.closest('[data-lat]');
  const field = (k) => $(`[data-a="${k}"]`, answer);
  let active = -1, options = [];

  /* ---- The answer ---- */
  const quoteUrl = (where, yard, remote) => `${data.quote}?location=${encodeURIComponent(where)}${yard ? '&yard=' + yard : ''}${remote ? '&delivery=remote' : ''}`;
  // Who to call: one yard to start with, or both Alaska yards for a remote place in the Interior or
  // north of it, where the yards' own guidance points both ways.
  const yardsFor = (p) => (p.both ? ['anchorage', 'fairbanks'] : [p.yard]);
  const showYards = (ids) => $$('[data-y]', answer).forEach((el) => { el.hidden = !ids.includes(el.dataset.y); });
  // The quote links that follow the visitor around the page carry the place they chose.
  const carried = $$('.actionbar a[href*="quote/"], .masthead a[href*="quote/"], #drawer a[href*="quote/"], .closing a[href*="quote/"]');
  const carry = (url) => carried.forEach((a) => { const hash = a.getAttribute('href').split('#')[1]; a.setAttribute('href', url + (hash ? `#${hash}` : '')); });
  const swap = () => {
    if (calm.matches) return;
    answer.classList.add('is-swapping');
    requestAnimationFrame(() => requestAnimationFrame(() => answer.classList.remove('is-swapping')));
  };
  const fill = (p) => {
    const acc = data.access[p.access], yard = data.yards[p.yard];
    const modes = acc.modes.map((m) => m[1].replace('{yard}', yard.name));
    field('eg').hidden = true;
    field('lat').hidden = false; field('latnum').textContent = p.lat.toFixed(1);
    field('region').textContent = p.region;
    field('name').textContent = `${p.name}, ${data.states[p.st]}`;
    field('tag').textContent = acc.tag; field('tag').hidden = false;
    const ids = yardsFor(p), plural = ids.length > 1;
    showYards(ids);
    field('yardlabel').textContent = plural ? 'Yards to call' : 'Start with';
    [0, 1].forEach((i) => {
      const m = acc.modes[i];
      field('m' + i).textContent = m ? modes[i] : '';
      field('m' + i).parentElement.hidden = !m;
      $$(`[data-ic^="${i}-"]`, answer).forEach((ic) => { ic.hidden = !m || ic.dataset.ic !== `${i}-${m[0]}`; });
    });
    field('how').hidden = false; field('else').hidden = true; field('note').hidden = false;
    field('short').textContent = p.name;
    const url = quoteUrl(`${p.name}, ${p.st}`, plural ? null : p.yard, p.access === 'coastal' || p.access === 'seasonal');
    field('quote').setAttribute('href', url);
    carry(url);
    const who = ids.map((id) => `${data.yards[id].name}, ${data.yards[id].phone}`).join(' or ');
    live.textContent = `${p.name}, ${data.states[p.st]}. ${acc.tag}. How freight typically gets there: ${modes.join('; ')}. ${plural ? 'Yards to call' : 'Start with'}: ${who}. Typical for the region, not a schedule or a price. Any yard can help.`;
  };
  const fillUnknown = (text) => {
    field('eg').hidden = true;
    field('lat').hidden = true;
    field('region').textContent = 'Not on our short list';
    field('name').textContent = text;
    field('tag').hidden = true;
    showYards(['any']);
    field('yardlabel').textContent = 'Call';
    field('how').hidden = true; field('else').hidden = false; field('note').hidden = true;
    field('short').textContent = text;
    const url = quoteUrl(text);
    field('quote').setAttribute('href', url);
    carry(url);
    live.textContent = `${text} is not on our short list. Any yard can help. Use the quote button, or call a yard.`;
  };

  /* ---- The route plate ---- */
  const plate = $('[data-plate]', finder);
  const layer = plate && $('.plate__labels', plate);
  let mark = null;
  if (layer) {
    mark = document.createElement('span');
    mark.className = 'plate__dest'; mark.setAttribute('aria-hidden', 'true');
    mark.innerHTML = '<i></i><b></b>';
    layer.append(mark);
  }
  // Which side of the mark its name goes: a place the plate already names keeps that side, the data's
  // preference comes next, otherwise the name points inland. Whichever it is must stay inside the frame.
  const preferred = (p, town) => town?.dataset.side || p.label || (p.xy[0] > data.w * 0.72 ? 'w' : 'e');
  let frameFor = null;
  const placeName = () => {
    const pref = frameFor;
    if (!pref || mark.hidden) return;
    const frame = $('.plate__scroll', plate).getBoundingClientRect(), name = $('b', mark);
    for (const s of [pref, ...['e', 'w', 's', 'n'].filter((k) => k !== pref)]) {
      mark.dataset.side = s;
      const r = name.getBoundingClientRect();
      if (r.left >= frame.left + 3 && r.right <= frame.right - 3 && r.top >= frame.top + 3 && r.bottom <= frame.bottom - 3) return;
    }
    mark.dataset.side = pref;
  };
  if (mark) window.addEventListener('resize', placeName);
  const paint = (p, { spotlight = true } = {}) => {
    if (!mark) return;
    $$('.plate__town.is-dest', layer).forEach((t) => t.classList.remove('is-dest'));
    if (!p) {
      mark.hidden = true;
      plate.removeAttribute('data-show'); plate.removeAttribute('data-access');
      return;
    }
    const town = $$('.plate__town', layer).find((t) => t.textContent === p.name);
    if (town) town.classList.add('is-dest');
    mark.hidden = false;
    mark.style.left = (p.xy[0] / data.w * 100).toFixed(2) + '%';
    mark.style.top = (p.xy[1] / data.h * 100).toFixed(2) + '%';
    $('b', mark).textContent = p.name;
    frameFor = preferred(p, town);
    placeName();
    if (spotlight && p.group) plate.setAttribute('data-show', p.group); else plate.removeAttribute('data-show');
    if (spotlight) plate.setAttribute('data-access', p.access); else plate.removeAttribute('data-access');
  };
  paint(byName.get(data.example), { spotlight: false });

  // The latitude rail reads the place on screen.
  const setRail = (p) => {
    if (!section || !p) return;
    section.dataset.lat = p.lat.toFixed(1);
    section.dataset.place = p.name;
    window.dispatchEvent(new Event('resize'));
  };

  /* ---- Choosing ---- */
  const dropKeyboard = () => { if (coarse.matches) input.blur(); };
  const choose = (p) => {
    close();
    input.value = p.name; clear.hidden = false;
    swap(); fill(p); paint(p); setRail(p);
    dropKeyboard();
  };
  const chooseUnknown = (text) => {
    const name = text.slice(0, 60);
    close(); clear.hidden = false;
    swap(); fillUnknown(name); paint(null);
    dropKeyboard();
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
    return out.sort((a, b) => a.rank - b.rank || a.p.name.localeCompare(b.p.name)).slice(0, 8);
  };
  const setActive = (i) => {
    active = i;
    Array.from(list.children).forEach((el, j) => el.setAttribute('aria-selected', String(j === i)));
    const el = list.children[i];
    if (el) { input.setAttribute('aria-activedescendant', el.id); el.scrollIntoView({ block: 'nearest' }); } else input.removeAttribute('aria-activedescendant');
  };
  const addOption = (i) => {
    const li = document.createElement('li');
    li.setAttribute('role', 'option'); li.id = `place-opt-${i}`; li.setAttribute('aria-selected', 'false');
    list.append(li);
    return li;
  };
  const open = () => {
    const typed = input.value.trim();
    options = search(input.value);
    list.textContent = '';
    options.forEach((o, i) => {
      const li = addOption(i);
      const name = document.createElement('span');
      name.textContent = o.alias ? `${o.p.name} (${o.alias})` : o.p.name;
      const meta = document.createElement('small');
      meta.textContent = `${o.p.lat.toFixed(1)}°N · ${o.p.st === 'WA' ? 'Washington' : o.p.region}`;
      li.append(name, meta);
    });
    if (!options.length) {
      options = [{ unknown: true }];
      const li = addOption(0);
      li.className = 'is-none';
      li.textContent = `${typed} is not on our short list. Press Enter or tap here and we will still point you to a yard.`;
    }
    list.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    setActive(typed ? 0 : -1);
  };
  function close() {
    list.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    active = -1;
  }
  const pick = (o) => { if (o.unknown) chooseUnknown(input.value.trim()); else choose(o.p); };

  input.addEventListener('input', () => { clear.hidden = !input.value; open(); });
  input.addEventListener('focus', () => {
    input.select(); open();
    // On a phone, lift the field above the keyboard's reach.
    if (window.innerWidth < 700) input.scrollIntoView({ block: 'start', behavior: calm.matches ? 'auto' : 'smooth' });
  });
  input.addEventListener('blur', () => setTimeout(close, 120));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (list.hidden) return open();
      setActive((active + (e.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (list.hidden) open();
      const o = options[active] || (input.value.trim() ? options[0] : null);
      if (o) pick(o);
    } else if (e.key === 'Escape') {
      if (!list.hidden) { e.preventDefault(); close(); } else if (input.value) { e.preventDefault(); input.value = ''; clear.hidden = true; }
    } else if (e.key === 'Tab') {
      // Closed now, not on blur: otherwise focus lands in the scrolling list and falls to <body>.
      close();
    }
  });
  // mousedown, not click: the choice must land before the field's blur closes the list.
  list.addEventListener('mousedown', (e) => e.preventDefault());
  list.addEventListener('click', (e) => {
    const li = e.target.closest('[role=option]');
    const o = li && options[Array.prototype.indexOf.call(list.children, li)];
    if (o) pick(o);
  });
  clear.addEventListener('click', () => { input.value = ''; clear.hidden = true; input.focus(); });
  finder.addEventListener('click', (e) => {
    // A button only: the section around the finder carries data-place too, for the rail.
    const eg = e.target.closest('button[data-place]');
    if (eg && byName.has(eg.dataset.place)) choose(byName.get(eg.dataset.place));
  });
})();
