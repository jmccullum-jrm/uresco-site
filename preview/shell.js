// The design chooser. Works without this script (each choice is a link that loads into the frame);
// with it, switching keeps you on the same page, the address remembers where you are, and the phone view works.
(() => {
  const data = JSON.parse(document.getElementById('designs').textContent);
  const frame = document.getElementById('frame');
  const stage = document.querySelector('.stage');
  const picks = [...document.querySelectorAll('.pick')];
  const open = document.getElementById('open');
  const blurb = document.getElementById('blurb');
  const view = document.getElementById('view');
  const root = new URL('.', location.href);                       // folder this page lives in
  const byKey = Object.fromEntries(data.designs.map((d) => [d.key, d]));
  let key = data.featured;
  let path = '';

  const home = (k) => new URL(`designs/${k}/`, root);
  const has = (k, p) => byKey[k].pages.includes(p);
  const urlFor = (k, p) => new URL(has(k, p) ? p : '', home(k));

  // "#yellow/alaska/" → { key, path }
  const fromHash = () => {
    const m = decodeURIComponent(location.hash.slice(1)).match(/^([a-z]+)(?:\/(.*))?$/);
    if (!m || !byKey[m[1]]) return null;
    const p = (m[2] || '').replace(/[^a-z0-9\-/.]/gi, '');
    return { key: m[1], path: has(m[1], p) ? p : '' };
  };

  // Fit the bar to the font this device gives it: drop one detail at a time until nothing is cut off
  // (the steps are listed in shell.css).
  const bar = document.querySelector('.bar');
  const cramped = () => bar.scrollWidth > bar.clientWidth + 0.5
    || [...bar.querySelectorAll('.pick__name')].some((n) => getComputedStyle(n).position !== 'absolute' && n.scrollWidth > n.clientWidth + 0.5);
  const fit = () => {
    for (let i = 1; i <= 5; i++) bar.classList.remove(`f${i}`);
    for (let i = 1; i <= 5 && cramped(); i++) bar.classList.add(`f${i}`);
  };

  const show = () => {
    const d = byKey[key];
    for (const a of picks) {
      const on = a.dataset.key === key;
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      a.href = urlFor(a.dataset.key, path).href;
    }
    frame.title = `${d.name} design`;
    document.title = `${d.name} · Uresco design preview`;
    if (blurb) blurb.textContent = d.blurb;
    if (open) open.href = urlFor(key, path).href;
    const want = `#${key}/${path}`;
    if (location.hash !== want) history.replaceState(null, '', want);
    fit();
  };

  // Where is the frame now? Read it back so links clicked inside the design keep the bar in step.
  const sync = () => {
    let loc;
    try { loc = frame.contentWindow.location; } catch { return; }   // left our site: nothing to read
    if (!loc || loc.origin !== location.origin) return;
    const rel = loc.pathname.slice(root.pathname.length);
    const m = rel.match(/^designs\/([a-z]+)\/(.*)$/);
    if (!m || !byKey[m[1]]) return;
    key = m[1];
    path = m[2].replace(/index\.html$/, '');
    show();
    // Links that leave the site (maps, manufacturers) cannot load inside a frame: open them in a new tab.
    try {
      frame.contentDocument.addEventListener('click', (e) => {
        const a = e.target.closest && e.target.closest('a[href]');
        if (!a || !/^https?:$/.test(a.protocol) || a.origin === location.origin) return;
        if (!a.target || a.target === '_self') { a.target = '_blank'; a.rel = 'noopener'; }
      }, true);
    } catch { /* not ours to touch */ }
  };

  const go = (k, p) => {
    key = k; path = has(k, p) ? p : '';
    show();
    frame.contentWindow.location.assign(urlFor(key, path).href);
  };

  for (const a of picks) {
    a.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;   // let "open in new tab" through
      e.preventDefault();
      if (a.dataset.key !== key) go(a.dataset.key, path);
    });
  }
  frame.addEventListener('load', sync);
  addEventListener('hashchange', () => {
    const h = fromHash();
    if (h && (h.key !== key || h.path !== path)) go(h.key, h.path);
  });

  addEventListener('resize', fit);

  if (view) {
    view.hidden = false;
    view.addEventListener('click', () => {
      const on = view.getAttribute('aria-pressed') !== 'true';
      view.setAttribute('aria-pressed', String(on));
      stage.classList.toggle('is-phone', on);
    });
  }

  // A link straight to a design and page ("…/#boreal/alaska/") opens there.
  const start = fromHash();
  if (start && (start.key !== key || start.path)) {
    key = start.key; path = start.path;
    frame.src = urlFor(key, path).href;
  }
  show();
  if (frame.contentDocument && frame.contentDocument.readyState === 'complete') sync();
})();
