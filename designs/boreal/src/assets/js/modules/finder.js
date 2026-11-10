/* "Where are you building?" — the combobox, the route card and the map camera.
   Markup and data come from finder() and mapPlate() in src/lib/components.mjs. The card is already
   rendered for the example place; this script only fills its fields, so nothing shifts on load. */
(() => {
  const { $, $$, calm } = UCM;
  const fold = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’'.]/g, '').toLowerCase().trim();
  const MAX_ZOOM = 2.8;

  $$('[data-stage]').forEach((stage, n) => {
    const finder = $('[data-finder]', stage);
    const map = $('[data-map]', stage);
    if (!finder || !map) return;
    const data = JSON.parse($('[data-finder-data]', finder).textContent);
    const places = data.places.map(([name, st, xy, lat, lon, region, access, yard]) => ({ name, st, xy, lat, lon, region, access, yard, key: fold(name) }));
    const byName = new Map(places.map((p) => [p.name, p]));
    const aliases = Object.entries(data.aliases).map(([alias, name]) => ({ alias, key: fold(alias), place: byName.get(name) }));
    const SUGGEST = ['Anchorage', 'Fairbanks', 'Bethel', 'Nome', 'Kotzebue', 'Utqiaġvik', 'Juneau', 'Seattle'].map((s) => ({ p: byName.get(s) }));

    const input = $('.finder__input', finder), list = $('.finder__list', finder), clear = $('[data-clear]', finder);
    const route = $('[data-route]', finder), live = $('[data-live]', finder);
    const cam = $('[data-cam]', map), arc = $('[data-arc]', map), dest = $('[data-dest]', map), destName = $('[data-dest-name]', map);
    const reset = $('[data-reset]', stage);
    const field = (k) => $(`[data-r="${k}"]`, route);
    let active = -1, options = [], current = byName.get(data.example), zoomed = false;

    /* ---- The card ---- */
    const quoteUrl = (where, yard) => `${data.quote}?location=${encodeURIComponent(where)}${yard ? '&yard=' + yard : ''}`;
    const showYard = (id) => $$('[data-y]', route).forEach((el) => { el.hidden = el.dataset.y !== id; });
    const swap = () => {
      if (calm.matches) return;
      route.classList.add('is-swapping');
      setTimeout(() => route.classList.remove('is-swapping'), 140);
    };

    // The coordinates count from the last place to the new one: a small sign that the card is live.
    let shown = [current.lat, current.lon], ticking = 0;
    const fmt = (lat, lon) => `${Math.abs(lat).toFixed(2)}° N, ${Math.abs(lon).toFixed(2)}° W`;
    const tick = (p) => {
      const el = field('coords'), from = shown.slice(), t0 = performance.now(), id = ++ticking;
      shown = [p.lat, p.lon];
      if (calm.matches || !from[0]) { el.textContent = fmt(p.lat, p.lon); return; }
      const step = (now) => {
        if (id !== ticking) return;
        const t = Math.min(1, (now - t0) / 700), e = 1 - Math.pow(1 - t, 3);
        el.textContent = fmt(from[0] + (p.lat - from[0]) * e, from[1] + (p.lon - from[1]) * e);
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const fill = (p) => {
      const acc = data.access[p.access], yard = data.yards[p.yard];
      field('name').textContent = `${p.name}, ${data.states[p.st]}`;
      field('eg').hidden = true;
      field('region').textContent = p.region;
      field('tag').textContent = acc.tag; field('tag').hidden = false;
      tick(p);
      showYard(p.yard);
      [0, 1].forEach((i) => {
        const m = acc.modes[i];
        field('m' + i).textContent = m ? m[1].replace('{yard}', yard.name) : '';
        field('m' + i).parentElement.hidden = !m;
        $$(`[data-ic^="${i}-"]`, route).forEach((ic) => { ic.hidden = !m || ic.dataset.ic !== `${i}-${m[0]}`; });
      });
      field('how').hidden = false; field('else').hidden = true; field('note').hidden = false;
      field('short').textContent = p.name;
      field('quote').href = quoteUrl(`${p.name}, ${p.st}`, p.yard);
      live.textContent = `${p.name}, ${data.states[p.st]}. ${acc.tag}. Yard to call: ${yard.name}, ${yard.phone}. ${acc.modes.map((m) => m[1].replace('{yard}', yard.name)).join('; ')}.`;
    };
    const fillUnknown = (text) => {
      field('name').textContent = text;
      field('eg').hidden = true;
      field('region').textContent = 'Not on our short list';
      field('tag').hidden = true;
      ticking++; shown = [0, 0]; field('coords').textContent = '';
      showYard('any');
      field('how').hidden = true; field('else').hidden = false; field('note').hidden = true;
      field('short').textContent = text;
      field('quote').href = quoteUrl(text);
      live.textContent = `${text} is not on our short list. Any yard can help. Use the quote button, or call a yard.`;
    };

    /* ---- The map ---- */
    const arcPath = ([x1, y1], [x2, y2]) => {
      const dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy) || 1;
      const lift = Math.min(90, d * 0.22), nx = -dy / d, ny = dx / d, s = ny > 0 ? -1 : 1;
      return `M${x1.toFixed(1)},${y1.toFixed(1)}Q${((x1 + x2) / 2 + nx * lift * s).toFixed(1)},${((y1 + y2) / 2 + ny * lift * s).toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`;
    };
    const setCam = (tx, ty, z) => {
      cam.classList.add('is-flying');
      cam.style.setProperty('--tx', tx.toFixed(1) + 'px');
      cam.style.setProperty('--ty', ty.toFixed(1) + 'px');
      cam.style.setProperty('--z', z.toFixed(3));
      zoomed = z > 1.02;
      map.toggleAttribute('data-zoomed', zoomed);
      if (reset) reset.hidden = !zoomed;
    };
    // Fit a yard and a place (map units) into the part of the map that is on screen and not under the
    // finder, leaving room for their labels, which keep their size however far the camera zooms.
    const fly = (yard, place, name = '') => {
      if (!yard) return setCam(0, 0, 1);
      const W = map.offsetWidth, H = map.offsetHeight, k = W / data.w, phone = window.innerWidth < 700;
      const mr = map.getBoundingClientRect(), cr = map.parentElement.getBoundingClientRect(), sr = stage.getBoundingClientRect(), fr = finder.getBoundingClientRect();
      let left = Math.max(0, cr.left - mr.left, sr.left - mr.left), right = Math.min(W, cr.right - mr.left, sr.right - mr.left);
      let top = Math.max(0, cr.top - mr.top, sr.top - mr.top), bottom = Math.min(H, cr.bottom - mr.top, sr.bottom - mr.top);
      const beside = fr.top < mr.top + bottom - 40 && fr.bottom > mr.top + top + 40 && fr.right < mr.left + (left + right) / 2;
      if (beside) left = Math.max(left, fr.right - mr.left + 16);          // wide: the finder sits over the map's left
      else if (fr.top < mr.top + bottom) bottom = Math.max(top + 80, fr.top - mr.top); // band, phone: it overlaps the bottom edge
      // Label room: the yard's tag sits on the far side from the place; the place's tag on its own far
      // side (wide screens) or above or below its dot (phones).
      const east = place[0] >= yard[0], yardTag = 150, placeTag = phone ? 56 : 44 + name.length * 8;
      const roomL = 20 + (east ? yardTag : placeTag), roomR = 20 + (east ? placeTag : yardTag);
      const roomT = phone ? 64 : 48, roomB = phone ? 52 : 64;
      const x0 = Math.min(yard[0], place[0]) * k, x1 = Math.max(yard[0], place[0]) * k, y0 = Math.min(yard[1], place[1]) * k, y1 = Math.max(yard[1], place[1]) * k;
      const fw = Math.max(40, right - left - roomL - roomR), fh = Math.max(40, bottom - top - roomT - roomB);
      const z = Math.max(1, Math.min(MAX_ZOOM, fw / Math.max(1, x1 - x0), fh / Math.max(1, y1 - y0)));
      const tx = Math.min(0, Math.max(W - z * W, left + roomL + fw / 2 - z * (x0 + x1) / 2));
      const ty = Math.min(0, Math.max(H - z * H, top + roomT + fh / 2 - z * (y0 + y1) / 2));
      setCam(tx, ty, z);
    };
    const yardPins = $$('[data-yard]', map);
    const draw = (p, { move = true } = {}) => {
      yardPins.forEach((y) => { y.dataset.side = y.dataset.home || (y.dataset.home = y.dataset.side); y.removeAttribute('data-on'); });
      if (!p) { dest.hidden = true; arc.setAttribute('d', 'M0,0'); map.removeAttribute('data-mode'); $$('.map__dot.is-dest', map).forEach((d) => d.classList.remove('is-dest')); if (move) fly(); return; }
      $$('.map__dot.is-dest', map).forEach((d) => d.classList.remove('is-dest'));
      $(`.map__dot[data-place="${CSS.escape(p.name)}"]`, map)?.classList.add('is-dest');
      const yard = data.yards[p.yard], east = p.xy[0] >= yard.xy[0];
      const same = Math.hypot(p.xy[0] - yard.xy[0], p.xy[1] - yard.xy[1]) < 5;
      map.dataset.mode = p.access;
      dest.hidden = same;
      dest.style.left = (p.xy[0] / data.w * 100).toFixed(2) + '%';
      dest.style.top = (p.xy[1] / data.h * 100).toFixed(2) + '%';
      dest.dataset.side = east ? 'e' : 'w';            // wide screens: beside the dot, away from the yard
      dest.dataset.vside = p.xy[1] > yard.xy[1] + 12 ? 's' : 'n'; // phones: above or below it
      destName.textContent = p.name;
      // The yard's own label steps to the far side, so the two never cover each other.
      const pin = yardPins.find((y) => y.dataset.yard === p.yard);
      if (pin) pin.setAttribute('data-on', '');
      if (pin && !same) pin.dataset.side = east ? 'w' : 'e';
      arc.setAttribute('d', same ? 'M0,0' : arcPath(yard.xy, p.xy));
      arc.classList.remove('is-drawing');
      void arc.getBoundingClientRect();
      arc.classList.add('is-drawing');
      if (move) fly(yard.xy, p.xy, p.name);
    };

    /* ---- Choosing ---- */
    const press = (name) => $$('.chip[data-place]', finder).forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.place === name)));
    const choose = (p, { typed = false } = {}) => {
      current = p;
      close();
      input.value = p.name; clear.hidden = false;
      press(p.name); swap(); fill(p); draw(p);
      if (typed) input.blur();
    };
    const chooseUnknown = (text) => {
      current = null;
      close(); clear.hidden = false; press(''); swap(); fillUnknown(text.slice(0, 60)); draw(null);
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
      $$('[role=option]', list).forEach((el, j) => el.setAttribute('aria-selected', String(j === i)));
      const el = list.children[i];
      if (el && el.id) { input.setAttribute('aria-activedescendant', el.id); el.scrollIntoView({ block: 'nearest' }); } else input.removeAttribute('aria-activedescendant');
    };
    const open = () => {
      options = search(input.value);
      list.textContent = '';
      options.forEach((o, i) => {
        const li = document.createElement('li');
        li.setAttribute('role', 'option'); li.id = `${list.id}-${i}`; li.setAttribute('aria-selected', 'false');
        const name = document.createElement('span'); name.textContent = o.alias ? `${o.p.name} (${o.alias})` : o.p.name;
        const meta = document.createElement('small'); meta.textContent = `${o.p.region}, ${o.p.st}`;
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
      if (window.innerWidth < 700) input.scrollIntoView({ block: 'start', behavior: calm.matches ? 'auto' : 'smooth' });
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
        if (!list.hidden) { e.preventDefault(); close(); }
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

    finder.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip[data-place]');
      if (chip && byName.has(chip.dataset.place)) choose(byName.get(chip.dataset.place));
    });
    // Dots on the map are a pointer shortcut; the combobox reaches every place by keyboard.
    map.addEventListener('click', (e) => {
      const dot = e.target.closest('.map__dot');
      if (dot && byName.has(dot.dataset.place)) choose(byName.get(dot.dataset.place));
    });
    if (reset) reset.addEventListener('click', () => fly());

    // The example's line draws itself once the page has settled.
    if (!calm.matches) setTimeout(() => arc.classList.add('is-drawing'), 350);

    /* Keep the framing through rotation and resize; rest the animations while the map is off screen. */
    let t;
    window.addEventListener('resize', () => {
      clearTimeout(t);
      t = setTimeout(() => { if (zoomed && current) fly(data.yards[current.yard].xy, current.xy, current.name); else if (zoomed) fly(); }, 150);
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([en]) => map.classList.toggle('is-paused', !en.isIntersecting)).observe(stage);
    }
  });
})();
