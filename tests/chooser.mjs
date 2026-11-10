// Checks for the design chooser (docs/index.html). Run after `node build.mjs`:  node tests/chooser.mjs
//  1. Static: the chooser lists every design, one is featured, every design was built and they all have the same pages.
//  2. Browser: switching designs keeps the page, the address follows what the frame shows, links to a design and page
//     open there, Back works, the phone view works, the bar fits from 320px up, it works without JavaScript, and a
//     missing address inside a design lands on that design's own "not found" page.
import { existsSync, readFileSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { createRequire } from 'module';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = join(ROOT, 'docs');
const BASE = (process.env.BASE || '/uresco-site/').replace(/\/*$/, '/');
const { featured, designs } = JSON.parse(readFileSync(join(ROOT, 'designs/designs.json'), 'utf8'));
const keys = designs.map((d) => d.key);
const problems = [];
const fail = (msg) => problems.push(msg);
const eq = (got, want, what) => { if (got !== want) fail(`${what}: expected ${JSON.stringify(want)}, got ${JSON.stringify(got)}`); };

// ---- Static ----
if (!existsSync(join(DOCS, 'index.html'))) { console.error('docs/index.html is missing. Run node build.mjs first.'); process.exit(1); }
const html = readFileSync(join(DOCS, 'index.html'), 'utf8');
const data = JSON.parse(html.match(/<script type="application\/json" id="designs">([\s\S]*?)<\/script>/)[1]);
eq(data.designs.map((d) => d.key).join(), keys.join(), 'designs in the chooser');
eq((html.match(/class="pick"/g) || []).length, keys.length, 'number of choices in the bar');
eq((html.match(/class="pick"[^>]*aria-current="true"/g) || []).length, 1, 'choices marked as showing');
if (!new RegExp(`data-key="${featured}"[^>]*aria-current="true"`).test(html)) fail('the featured design is not the one showing first');
if (!/name="robots" content="noindex, nofollow"/.test(html)) fail('the chooser is missing noindex');
for (const f of ['404.html', 'robots.txt', '.nojekyll', 'favicon.svg']) if (!existsSync(join(DOCS, f))) fail(`docs/${f} is missing`);
for (const d of data.designs) {
  if (!existsSync(join(DOCS, 'designs', d.key, 'index.html'))) fail(`docs/designs/${d.key}/ was not built`);
  const other = data.designs[0];
  const missing = other.pages.filter((p) => !d.pages.includes(p));
  const extra = d.pages.filter((p) => !other.pages.includes(p));
  if (missing.length || extra.length) fail(`${d.key} and ${other.key} do not have the same pages (missing: ${missing.join(' ') || 'none'}; extra: ${extra.join(' ') || 'none'})`);
}
console.log(`static: chooser lists ${keys.length} designs, ${data.designs[0].pages.length} pages each`);

// ---- Browser ----
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
const TYPES = { html: 'text/html', css: 'text/css', js: 'text/javascript', webp: 'image/webp', png: 'image/png', jpg: 'image/jpeg', svg: 'image/svg+xml', woff2: 'font/woff2', json: 'application/json', webmanifest: 'application/manifest+json', xml: 'application/xml', txt: 'text/plain' };
// Serve docs/ under the same folder GitHub Pages uses, with its 404 behaviour.
const server = createServer((req, res) => {
  const p = decodeURIComponent(req.url.split('?')[0]);
  let f = p.startsWith(BASE) ? join(DOCS, p.slice(BASE.length)) : null;
  if (f && p.endsWith('/')) f = join(f, 'index.html');
  if (!f || !resolve(f).startsWith(DOCS) || !existsSync(f)) {
    res.writeHead(404, { 'content-type': 'text/html' });
    return res.end(readFileSync(join(DOCS, '404.html')));
  }
  res.writeHead(200, { 'content-type': TYPES[f.split('.').pop()] || 'application/octet-stream' });
  res.end(readFileSync(f));
}).listen(0);
const origin = `http://localhost:${server.address().port}`;
const home = origin + BASE;

const browser = await chromium.launch();
const watch = (page, label) => {
  page.on('pageerror', (e) => fail(`${label}: script error: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource.*404/.test(m.text())) fail(`${label}: console error: ${m.text()}`); });
};
const state = (page) => page.evaluate(() => ({
  hash: location.hash,
  title: document.title,
  current: [...document.querySelectorAll('.pick[aria-current="true"]')].map((a) => a.dataset.key).join(),
  frame: document.getElementById('frame').contentWindow.location.pathname,
  frameTitle: document.getElementById('frame').title,
  open: document.getElementById('open').getAttribute('href'),
  h1: document.getElementById('frame').contentDocument.querySelectorAll('h1').length,
}));
// The frame has finished loading `path` and the bar has caught up.
const settled = (page, key, path = '') => page.waitForFunction(([k, p, b]) => {
  const f = document.getElementById('frame');
  try {
    return f.contentWindow.location.pathname === `${b}designs/${k}/${p}` && f.contentDocument.readyState === 'complete'
      && location.hash === `#${k}/${p}` && document.querySelector('.pick[aria-current="true"]').dataset.key === k;
  } catch { return false; }
}, [key, path, BASE], { timeout: 15000 }).catch(() => fail(`timed out waiting for ${key}/${path} to show`));

{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  watch(page, 'chooser');
  await page.goto(home, { waitUntil: 'load' });
  await settled(page, featured);
  let s = await state(page);
  eq(s.current, featured, 'design showing on arrival');
  eq(s.h1, 1, 'headings in the framed home page');

  // Every choice switches the frame, the bar, the title and the "open without this bar" link.
  for (const d of designs) {
    await page.click(`.pick[data-key="${d.key}"]`);
    await settled(page, d.key);
    s = await state(page);
    eq(s.frame, `${BASE}designs/${d.key}/`, `frame after choosing ${d.key}`);
    eq(s.title, `${d.name} · Uresco design preview`, `title after choosing ${d.key}`);
    eq(s.frameTitle, `${d.name} design`, `frame name after choosing ${d.key}`);
    if (!s.open.endsWith(`${BASE}designs/${d.key}/`)) fail(`"open without this bar" after choosing ${d.key} points at ${s.open}`);
  }

  // A link clicked inside the design moves the address; switching design then keeps that page.
  const [a, b] = keys;
  await page.click(`.pick[data-key="${a}"]`);
  await settled(page, a);
  await page.frameLocator('#frame').locator('a[href$="alaska/"]:visible').first().click();
  await settled(page, a, 'alaska/');
  await page.click(`.pick[data-key="${b}"]`);
  await settled(page, b, 'alaska/');
  eq((await state(page)).h1, 1, `headings on ${b}/alaska/ in the frame`);

  // Back returns to the design you were looking at.
  await page.goBack();
  await settled(page, a, 'alaska/');

  // Links that leave the site open in a new tab rather than inside the frame.
  const ext = await page.evaluate(() => {
    const doc = document.getElementById('frame').contentDocument;
    const link = [...doc.querySelectorAll('a[href^="http"]')].find((x) => x.origin !== location.origin && !x.target);
    if (!link) return 'none';
    doc.addEventListener('click', (e) => e.preventDefault(), { once: true });
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    return link.target;
  });
  if (ext !== 'none') eq(ext, '_blank', 'target of an outside link clicked in the frame');

  // Phone view narrows the frame and back again.
  await page.click('#view');
  eq(await page.evaluate(() => Math.round(document.getElementById('frame').getBoundingClientRect().width)), 390, 'frame width in phone view');
  await page.click('#view');
  eq(await page.evaluate(() => Math.round(document.getElementById('frame').getBoundingClientRect().width)), 1440, 'frame width after leaving phone view');

  // Addresses that name a design and page open there; nonsense falls back sensibly.
  const last = keys[keys.length - 1];
  await page.goto(`${home}#${last}/products/`, { waitUntil: 'load' });
  await page.reload({ waitUntil: 'load' });
  await settled(page, last, 'products/');
  await page.goto(`${origin}/blank-does-not-matter`, { waitUntil: 'load' });
  await page.goto(`${home}#${last}/no-such-page/`, { waitUntil: 'load' });
  await settled(page, last);
  await page.goto(`${origin}/blank-does-not-matter`, { waitUntil: 'load' });
  await page.goto(`${home}#nonsense/whatever/`, { waitUntil: 'load' });
  await settled(page, featured);
  // Editing the address by hand also switches.
  await page.evaluate((k) => { location.hash = `#${k}/quote/`; }, a);
  await settled(page, a, 'quote/');
  await page.close();
}

// The bar fits at every width, whichever design is showing, and whatever font the device gives it:
// the second pass widens every letter to stand in for a wider system font (the bar uses the system font).
{
  const page = await browser.newPage();
  watch(page, 'chooser widths');
  for (const wide of [false, true]) {
    for (const w of [320, 360, 390, 600, 779, 780, 979, 980, 1024, 1100, 1199, 1200, 1280, 1359, 1360, 1440, 1920]) {
      await page.setViewportSize({ width: w, height: 800 });
      for (const k of keys) {
        await page.goto(`${origin}/blank-does-not-matter`);
        await page.goto(`${home}#${k}/`, { waitUntil: 'domcontentloaded' });
        await page.waitForFunction((key) => document.querySelector('.pick[aria-current="true"]')?.dataset.key === key, k);
        if (wide) {
          await page.addStyleTag({ content: '.bar, .bar * { letter-spacing: .12em !important; word-spacing: .12em !important; }' });
          await page.evaluate(() => dispatchEvent(new Event('resize')));
        }
        const r = await page.evaluate(() => {
          const bar = document.querySelector('.bar');
          const shown = [...bar.querySelectorAll('.pick, .tool, .bar__title, .bar__blurb')].filter((e) => e.offsetParent !== null);
          return {
            over: document.documentElement.scrollWidth - innerWidth,
            right: Math.max(...shown.map((e) => e.getBoundingClientRect().right)),
            height: bar.getBoundingClientRect().height,
            picks: [...bar.querySelectorAll('.pick')].filter((e) => e.offsetParent !== null).length,
            small: shown.filter((e) => e.matches('.pick, .tool') && (e.getBoundingClientRect().width < 36 || e.getBoundingClientRect().height < 36)).length,
            cut: [...bar.querySelectorAll('.pick__name')].filter((n) => getComputedStyle(n).position !== 'absolute' && n.scrollWidth > n.clientWidth + 0.5).map((n) => n.textContent).join(', '),
          };
        });
        const at = `${w}px${wide ? ' in a wide font' : ''} with ${k} showing`;
        if (r.over > 0 || r.right > w + 0.5) fail(`${at}: the bar is wider than the screen (reaches ${Math.round(r.right)}px)`);
        if (r.height > 56) fail(`${at}: the bar wrapped to ${Math.round(r.height)}px tall`);
        if (r.picks !== keys.length) fail(`${at}: only ${r.picks} of ${keys.length} choices are visible`);
        if (r.small) fail(`${at}: ${r.small} bar buttons are smaller than 36px`);
        if (r.cut && !(wide && w < 400)) fail(`${at}: design names are cut short (${r.cut})`);
      }
    }
  }
  await page.close();
}

// Without JavaScript each choice still loads its design into the frame.
{
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(home, { waitUntil: 'load' });
  const other = keys.find((k) => k !== featured);
  await page.click(`.pick[data-key="${other}"]`);
  await page.waitForTimeout(500);
  const urls = page.frames().map((f) => f.url());
  if (!urls.some((u) => u.endsWith(`${BASE}designs/${other}/`))) fail(`without JavaScript, choosing ${other} did not load it in the frame (frames: ${urls.join(', ')})`);
  await ctx.close();
}

// A missing address inside a design lands on that design's own "not found" page, and its links work from there.
{
  const page = await browser.newPage();
  for (const k of keys) {
    await page.goto(`${home}designs/${k}/no/such/page/`, { waitUntil: 'load' });
    await page.waitForURL(`**${BASE}designs/${k}/404.html`, { timeout: 5000 }).catch(() => fail(`${k}: a missing page did not hand over to its own not-found page (stayed at ${page.url()})`));
    const hrefs = await page.evaluate(() => [...document.querySelectorAll('a[href]')].map((x) => x.href).filter((h) => h.startsWith(location.origin)).slice(0, 12));
    for (const h of [...new Set(hrefs)]) {
      const r = await page.request.get(h);
      if (r.status() !== 200) fail(`${k} not-found page: link ${h.replace(origin, '')} returns ${r.status()}`);
    }
  }
  await page.goto(`${home}nothing-here/`, { waitUntil: 'load' });
  const back = await page.getAttribute('main a', 'href');
  eq(back, BASE, 'link back to the chooser on the not-found page');
  await page.close();
}

await browser.close();
server.close();
if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n` + problems.map((p) => '  - ' + p).join('\n'));
  process.exit(1);
}
console.log('browser: switching, same-page switching, addresses, Back, phone view, bar widths, no-JavaScript and not-found pages work\nCHOOSER CHECKS PASSED');
