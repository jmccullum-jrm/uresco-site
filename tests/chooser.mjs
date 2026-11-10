// Checks for the design chooser (docs/index.html). Run after `node build.mjs`:  node tests/chooser.mjs
//  1. Static: the chooser lists every design, one is featured, every design was built and they all have the same pages.
//  2. Browser: switching designs keeps the page, the address follows what the frame shows, links to a design and page
//     open there, Back works, the phone view is a true 390 by 844 screen, the description row, draft marker and
//     "send my pick" work, the bar fits from 320px up in any font, it works without JavaScript, and a missing
//     address inside a design lands on that design's own "not found" page.
import { existsSync, readFileSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { createRequire } from 'module';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = join(ROOT, 'docs');
const BASE = (process.env.BASE || '/uresco-site/').replace(/\/*$/, '/');
const config = JSON.parse(readFileSync(join(ROOT, 'designs/designs.json'), 'utf8'));
const designs = config.designs.filter((d) => !(config.hide || []).includes(d.key));
const featured = designs.some((d) => d.key === config.featured) ? config.featured : designs[0].key;
if (designs.length < 2) { console.log('Only one design is showing, so there is no chooser to check.'); process.exit(0); }
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
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await ctx.newPage();
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

  // Phone view is a true 390 by 844 screen (scaled down if the window is short) that sits wholly inside the stage.
  await page.click('#view');
  const phone = await page.evaluate(() => {
    const f = document.getElementById('frame');
    const r = f.getBoundingClientRect();
    const st = document.querySelector('.stage').getBoundingClientRect();
    return { size: `${f.contentWindow.innerWidth}x${f.contentWindow.innerHeight}`, inside: r.top >= st.top && r.bottom <= st.bottom + 0.5 && r.left >= st.left && r.right <= st.right, ratio: Math.round((r.width / r.height) * 1000) };
  });
  eq(phone.size, '390x844', 'screen size inside the phone view');
  eq(phone.inside, true, 'phone view fits inside the stage');
  eq(phone.ratio, Math.round((390 / 844) * 1000), 'phone view proportions');
  await page.click('#view');
  eq(await page.evaluate(() => Math.round(document.getElementById('frame').getBoundingClientRect().width)), 1440, 'frame width after leaving phone view');

  // The description row names the design showing, can be closed and reopened, and stays closed for the visit.
  const aboutText = () => page.evaluate(() => (document.getElementById('about').hidden ? null : document.getElementById('about').textContent.replace(/\s+/g, ' ').trim()));
  const here = designs.find((d) => d.key === a);
  if (!(await aboutText())?.startsWith(`${here.name}. ${here.blurb}`)) fail(`the description row does not describe ${a}: ${await aboutText()}`);
  if (config.finished) {
    eq(await page.isVisible('#about-draft'), !config.finished.includes('alaska/'), 'draft marker on the Alaska page');
    await page.evaluate((k) => { location.hash = `#${k}/products/`; }, a);
    await settled(page, a, 'products/');
    eq(await page.isVisible('#about-draft'), !config.finished.includes('products/'), 'draft marker on the products page');
  }
  await page.click('#about-close');
  eq(await aboutText(), null, 'description row after closing it');
  eq(await page.getAttribute('#info', 'aria-expanded'), 'false', 'About button state after closing the row');
  await page.reload({ waitUntil: 'load' });
  eq(await aboutText(), null, 'description row after a reload (it should stay closed for the visit)');
  await page.click('#info');
  if (!(await aboutText())) fail('the About button did not bring the description row back');

  // "Send my pick" puts a sentence naming the design and a link to it on the clipboard.
  await page.click('#send');
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  if (!copied.includes(`the ${here.name} design`) || !copied.endsWith(`${BASE}#${a}/`)) fail(`"Send my pick" copied ${JSON.stringify(copied)}`);
  if (!(await page.isVisible('#said'))) fail('"Send my pick" gave no confirmation');

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
  await ctx.close();
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
          const strip = document.querySelector('.picks').getBoundingClientRect();
          const vis = (e) => e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden';
          const controls = [...document.querySelectorAll('.pick, .tool, .mini, .about__close')].filter(vis);
          const cur = document.querySelector('.pick[aria-current="true"]').getBoundingClientRect();
          return {
            over: document.documentElement.scrollWidth - innerWidth,
            barOver: bar.scrollWidth - bar.clientWidth,
            height: bar.getBoundingClientRect().height,
            // names a visitor can read without scrolling the row sideways
            names: [...bar.querySelectorAll('.pick__name')].filter((n) => { const b = n.getBoundingClientRect(); return vis(n) && b.width > 8 && b.left >= strip.left - 0.5 && b.right <= strip.right + 0.5; }).length,
            scrolls: document.querySelector('.picks').scrollWidth - document.querySelector('.picks').clientWidth > 0.5,
            currentInView: cur.left >= strip.left - 0.5 && cur.right <= strip.right + 0.5,
            small: controls.filter((e) => e.getBoundingClientRect().width < 40 || e.getBoundingClientRect().height < 40).map((e) => e.id || e.className).join(', '),
            star: [...document.querySelectorAll('.pick__tag, .pick__star')].some(vis),
            offscreen: controls.filter((e) => !e.closest('.picks') && e.getBoundingClientRect().right > innerWidth + 0.5).length,
          };
        });
        const at = `${w}px${wide ? ' in a wide font' : ''} with ${k} showing`;
        if (r.over > 0 || r.barOver > 0 || r.offscreen) fail(`${at}: the bar is wider than the screen`);
        if (r.height > 60) fail(`${at}: the bar wrapped to ${Math.round(r.height)}px tall`);
        if (!r.currentInView) fail(`${at}: the design that is showing is scrolled out of view in the bar`);
        if (r.small) fail(`${at}: controls smaller than 40px: ${r.small}`);
        if (!r.star) fail(`${at}: nothing marks the featured design`);
        // In the normal font every name is readable at once from 360px up; in a much wider font the row may scroll on phones.
        if (!wide && w >= 360 && (r.scrolls || r.names !== keys.length)) fail(`${at}: only ${r.names} of ${keys.length} design names are visible without scrolling`);
        if (wide && w >= 600 && r.names !== keys.length) fail(`${at}: only ${r.names} of ${keys.length} design names are visible`);
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
console.log('browser: switching, same-page switching, addresses, Back, phone view, description row, send my pick, bar fit in two fonts, no-JavaScript and not-found pages work\nCHOOSER CHECKS PASSED');
