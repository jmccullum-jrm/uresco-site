// The design chooser. Works without this script (each choice is a link that loads into the frame);
// with it, switching keeps you on the same page, the address remembers where you are, the bar fits
// itself to the screen, and the phone view, description row and "send my pick" button work.
(() => {
  const data = JSON.parse(document.getElementById('designs').textContent);
  const $ = (id) => document.getElementById(id);
  const frame = $('frame');
  const stage = document.querySelector('.stage');
  const bar = document.querySelector('.bar');
  const strip = document.querySelector('.picks');
  const picks = [...document.querySelectorAll('.pick')];
  const root = new URL('.', location.href);                       // folder this page lives in
  const byKey = Object.fromEntries(data.designs.map((d) => [d.key, d]));
  let key = data.featured;
  let path = '';
  let shownDraft = '';
  const said = $('said');
  let saidTimer;
  const say = (msg) => { said.textContent = msg; said.hidden = false; clearTimeout(saidTimer); saidTimer = setTimeout(() => { said.hidden = true; }, 5000); };

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

  // Fit the bar to the font this device gives it: drop one detail at a time until the row of designs
  // no longer has to scroll (the steps are listed in shell.css). If it still must scroll, keep the
  // design that is showing in view.
  const cramped = () => strip.scrollWidth > strip.clientWidth + 0.5 || bar.scrollWidth > bar.clientWidth + 0.5;
  const sizePhone = () => {
    if (!stage.classList.contains('is-phone')) return stage.style.removeProperty('--s');
    const s = Math.min(1, (stage.clientHeight - 44) / 844, (stage.clientWidth - 44) / 390);
    stage.style.setProperty('--s', String(Math.max(0.3, s)));
  };
  const fit = () => {
    for (let i = 1; i <= 7; i++) bar.classList.remove(`f${i}`);
    for (let i = 1; i <= 7 && cramped(); i++) bar.classList.add(`f${i}`);
    document.body.classList.toggle('compact', bar.classList.contains('f4'));
    const cur = strip.querySelector('[aria-current="true"]');
    if (cur && strip.scrollWidth > strip.clientWidth + 0.5) {
      const a = cur.getBoundingClientRect();
      const b = strip.getBoundingClientRect();
      strip.scrollLeft += a.left - b.left - (b.width - a.width) / 2;
    }
    sizePhone();
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
    $('about-name').textContent = `${d.name}.`;
    $('about-long').textContent = d.blurb;
    $('about-short').textContent = d.short || d.blurb;
    // While some pages are still drafts, say so on those pages (in the row, or briefly if the row is closed).
    const draft = Boolean(data.finished) && !data.finished.includes(path);
    $('about-draft').hidden = !draft;
    if (draft && $('about').hidden && shownDraft !== `${key}/${path}`) say('Draft page: not designed yet');
    shownDraft = draft ? `${key}/${path}` : '';
    for (const a of document.querySelectorAll('[data-act="open"]')) a.href = urlFor(key, path).href;
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

  // Phone view.
  const view = $('view');
  view.hidden = false;
  view.addEventListener('click', () => {
    const on = view.getAttribute('aria-pressed') !== 'true';
    view.setAttribute('aria-pressed', String(on));
    stage.classList.toggle('is-phone', on);
    sizePhone();
  });

  // The description row can be closed and brought back; the choice lasts for the visit.
  const about = $('about');
  const info = $('info');
  const store = { get: () => { try { return sessionStorage.getItem('ucm-about'); } catch { return null; } }, set: (v) => { try { sessionStorage.setItem('ucm-about', v); } catch { /* private window */ } } };
  const setAbout = (on) => {
    about.hidden = !on;
    info.setAttribute('aria-expanded', String(on));
    store.set(on ? 'open' : 'closed');
    sizePhone();
  };
  info.hidden = false;
  $('about-close').hidden = false;
  info.addEventListener('click', () => setAbout(about.hidden));
  $('about-close').addEventListener('click', () => { setAbout(false); info.focus(); });
  if (store.get() === 'closed') setAbout(false);

  // "Send my pick": the share sheet on phones, otherwise a line of text and the link on the clipboard.
  const sendPick = async () => {
    const d = byKey[key];
    const url = `${root.href}#${key}/`;
    const text = `My pick for the new Uresco website is the ${d.name} design.`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Uresco website design', text, url }); return; } catch (e) { if (e && e.name === 'AbortError') return; }
    }
    try { await navigator.clipboard.writeText(`${text} ${url}`); say('Copied. Paste it into a text or an email.'); } catch {
      location.href = `mailto:?subject=${encodeURIComponent('Uresco website design')}&body=${encodeURIComponent(`${text}\n${url}`)}`;
    }
  };
  for (const b of document.querySelectorAll('[data-act="send"]')) { b.hidden = false; b.addEventListener('click', sendPick); }

  // A link straight to a design and page ("…/#boreal/alaska/") opens there.
  const start = fromHash();
  if (start && (start.key !== key || start.path)) {
    key = start.key; path = start.path;
    frame.src = urlFor(key, path).href;
  }
  show();
  if (frame.contentDocument && frame.contentDocument.readyState === 'complete') sync();
})();
