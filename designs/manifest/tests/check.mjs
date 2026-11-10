// Site checks: run after `node build.mjs`.  npm run check
//  1. Static: every page has a title, description, one <h1>, alt on every <img>, unique ids; every internal
//     link, image, asset and #anchor resolves; every phone number and email is one of the yards'; and the claims,
//     hours and sheet numbers the review round ruled out stay out.
//  2. Browser: every page loads in Chromium at five widths with no errors, no horizontal
//     scroll and no stretched hero photo, and both forms validate and hand off.
//  3. Inner pages: a width sweep from 320 to 2560 for horizontal scroll (in both browsers), a call control in the
//     masthead at every width, the map's labels stay on the sheet, the products, services and projects pages do
//     what their controls promise, and without the script every call, directions and menu control still leads somewhere.
//     ONLY=inner node tests/check.mjs runs this part alone.
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, dirname, resolve, relative } from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { createRequire } from 'module';
import { LOCATIONS } from '../src/data/locations.mjs';
import { SITE } from '../src/config.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = process.env.OUT ? resolve(process.env.OUT) : join(ROOT, 'docs');
const problems = [];
const fail = (page, msg) => problems.push(`${page}: ${msg}`);

// What a visitor can read on a page: the body with its markup and scripts taken out.
const textOf = (src) => src.replace(/<head>[\s\S]*?<\/head>/, ' ').replace(/<(script|style)[\s\S]*?<\/\1>/g, ' ').replace(/<[^>]+>/g, ' ');
const YARD_TELS = new Set(LOCATIONS.flatMap((l) => [l.phone, l.tollFree]).filter(Boolean).map((n) => 'tel:+1' + n.replace(/\D/g, '')));
const YARD_MAIL = new Set(LOCATIONS.map((l) => 'mailto:' + l.email));

const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const pages = walk(DOCS).filter((f) => f.endsWith('.html'));

for (const file of pages) {
  const rel = relative(DOCS, file);
  const src = readFileSync(file, 'utf8');
  // Redirect stubs: only check that they point at a real page.
  const refresh = src.match(/http-equiv="refresh" content="0; url=([^"]+)"/);
  if (refresh) {
    if (!existsSync(join(resolve(dirname(file), refresh[1]), 'index.html'))) fail(rel, `redirects to missing page ${refresh[1]}`);
    continue;
  }
  if (!/<title>[^<]{10,}<\/title>/.test(src)) fail(rel, 'missing or short <title>');
  if (!/<meta name="description" content="[^"]{50,}"/.test(src)) fail(rel, 'missing or short meta description');
  const h1 = (src.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) fail(rel, `${h1} <h1> elements`);
  for (const img of src.match(/<img\b[^>]*>/g) || []) if (!/\salt="/.test(img)) fail(rel, `img without alt: ${img.slice(0, 80)}`);
  const ids = [...src.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dup.length) fail(rel, `duplicate ids: ${[...new Set(dup)].join(', ')}`);
  // Claims the review round ruled out (see the writing notes in DESIGN.md).
  for (const claim of ['one point of contact', 'from quote to landing', 'price it delivered', 'delivered pricing', 'quoted together', 'varies by yard', 'estimators, designers', 'takes about ten minutes', 'on puget sound', 'last sailings', 'rfi log', 'volcanic peak']) {
    if (src.toLowerCase().includes(claim)) fail(rel, `says "${claim}", which FACTS.md does not support`);
  }
  // Yard hours are placeholders. They print on the Locations page and nowhere else, and never in structured data.
  if (/openingHours/.test(src)) fail(rel, 'structured data states opening hours');
  if (rel !== 'locations/index.html') {
    const when = textOf(src).match(/\b\d{1,2}(:\d\d)?\s*[ap]\.?m\b\.?|\buntil\b/i);
    if (when) fail(rel, `prints a time: "${when[0]}"`);
  }
  // No invented drawing-control numbers.
  const code = textOf(src).match(/\bSheet\s+[A-Z]?-?\d+\b|\bRev\.\s*\d{4}/);
  if (code) fail(rel, `prints a drawing-control number: "${code[0]}"`);
  // Every number and address a visitor can tap is one of the yards'.
  for (const m of src.matchAll(/href="(tel:[^"]+)"/g)) if (!YARD_TELS.has(m[1])) fail(rel, `unknown phone number ${m[1]}`);
  for (const m of src.matchAll(/href="(mailto:[^"]+)"/g)) if (!YARD_MAIL.has(m[1])) fail(rel, `unknown email ${m[1]}`);
  // A stock photograph is never described as Uresco's own.
  for (const img of src.match(/<img\b[^>]*>/g) || []) {
    const key = (img.match(/assets\/img\/([a-z-]+)-\d+\.webp/) || [])[1];
    if (key && !key.startsWith('uresco-') && /uresco|ucm/i.test((img.match(/\salt="([^"]*)"/) || [])[1] || '')) fail(rel, `stock photo ${key} is described as Uresco's own`);
  }
  // Anything that opens a dialog is a link first, so it leads somewhere without the script.
  if (/<button\b[^>]*data-open/.test(src)) fail(rel, 'a dialog opener is a button, so it does nothing without the script');
  // A product list is never cut off: its items are what the visitor came for.
  for (const m of src.matchAll(/class="(?:plist__items|mline__sum|pidx-line__items)[^"]*">([^<]*)/g)) if (/…|\.\.\./.test(m[1])) fail(rel, `product list ends in an ellipsis: ${m[1].slice(0, 60)}`);
  if (rel === '404.html') continue; // links are absolute to the deploy base
  const refs = [...src.matchAll(/\s(?:href|src)="([^"]+)"/g), ...src.matchAll(/\ssrcset="([^"]+)"/g)].flatMap((m) =>
    m[0].includes('srcset') ? m[1].split(',').map((s) => s.trim().split(/\s+/)[0]) : [m[1]]);
  for (const ref of refs) {
    if (/^#./.test(ref) && !ids.includes(ref.slice(1))) fail(rel, `broken anchor ${ref}`);
    if (/^(https?:|mailto:|tel:|#|data:)/.test(ref)) continue;
    const clean = ref.split(/[?#]/)[0];
    let target = resolve(dirname(file), clean);
    if (clean.endsWith('/') || clean === '' || clean === '.' || clean === './') target = join(target, 'index.html');
    if (!existsSync(target)) { fail(rel, `broken link ${ref}`); continue; }
    // An anchor on another page has to be there too.
    const hash = ref.split('#')[1];
    if (hash && target.endsWith('.html') && !readFileSync(target, 'utf8').includes(`id="${hash}"`)) fail(rel, `broken anchor ${ref}`);
  }
}
console.log(`static: ${pages.length} pages checked`);

// ---- Browser pass ----
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
const TYPES = { html: 'text/html', css: 'text/css', js: 'text/javascript', webp: 'image/webp', png: 'image/png', jpg: 'image/jpeg', svg: 'image/svg+xml', woff2: 'font/woff2', json: 'application/json', webmanifest: 'application/manifest+json', xml: 'application/xml', txt: 'text/plain' };
const server = createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.startsWith(SITE.base)) p = '/' + p.slice(SITE.base.length);   // the 404 page's links are absolute to the deploy base
  let f = join(DOCS, p);
  if (p.endsWith('/')) f = join(f, 'index.html');
  if (!existsSync(f)) { res.writeHead(404); return res.end('not found'); }
  res.writeHead(200, { 'content-type': TYPES[f.split('.').pop()] || 'application/octet-stream' });
  res.end(readFileSync(f));
}).listen(0);
const base = `http://127.0.0.1:${server.address().port}/`;
const browser = await chromium.launch(existsSync('/opt/pw-browsers/chromium') ? { executablePath: '/opt/pw-browsers/chromium' } : {});
const paths = pages.filter((f) => !/http-equiv="refresh"/.test(readFileSync(f, 'utf8'))).map((f) => relative(DOCS, f))
  .map((r) => r.replace(/index\.html$/, ''));

// ---- Inner pages ----
const SWEEP_PAGES = ['', 'alaska/', 'pacific-northwest/', 'products/', 'products/engineered-wood/', 'services/', 'projects/', 'locations/', 'quote/', 'accounts/', 'about/', '404.html'];
// Every width that has ever scrolled sideways, and the edges of each layout, stay in this list.
const SWEEP = [320, 360, 390, 430, 600, 700, 768, 820, 860, 900, 1000, 1019, 1024, 1100, 1180, 1188, 1200, 1280, 1366, 1440, 1536, 1920, 2560];
// No horizontal scroll at any of the sweep widths, and a call control in the masthead at every one of them.
// Hinted text runs wider, so this also runs in the hinted browser.
const overflowSweep = async (b, mode = '') => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  for (const p of SWEEP_PAGES) {
    await page.goto(base + p, { waitUntil: 'networkidle' });
    for (const width of SWEEP) {
      await page.setViewportSize({ width, height: 900 });
      await page.waitForTimeout(40);
      const measure = () => page.evaluate(() => {
        const el = document.querySelector('.masthead [data-open="call-sheet"]');
        const r = el ? el.getBoundingClientRect() : null;
        return { over: document.documentElement.scrollWidth - document.documentElement.clientWidth, call: !!r && r.width > 0 && r.left >= 0 && r.right <= innerWidth };
      });
      let { over, call } = await measure();
      // On a loaded machine a resize can be read mid-layout. A real overflow is still there a moment later.
      if (over > 0 || !call) { await page.waitForTimeout(300); ({ over, call } = await measure()); }
      if (over > 0) fail(`${width}px${mode} /${p}`, `scrolls sideways by ${over}px`);
      if (!call) fail(`${width}px${mode} /${p}`, 'no call control in the masthead');
    }
  }
  await ctx.close();
};

const innerChecks = async () => {
  // 1. The width sweep.
  await overflowSweep(browser);
  const desk = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await desk.newPage();

  // 2. The delivery plate: every place it marks has its name on the sheet, at every width.
  await page.goto(base + 'alaska/', { waitUntil: 'networkidle' });
  for (const width of [320, 360, 390, 699, 700, 768, 1100, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.waitForTimeout(60);
    const bad = await page.evaluate(() => {
      const sheet = document.querySelector('.pmap__canvas').getBoundingClientRect();
      const out = [];
      const shown = (el) => getComputedStyle(el).display !== 'none';
      document.querySelectorAll('.pmap__town, .pmap__yard').forEach((el) => {
        if (!shown(el)) return;
        const r = el.getBoundingClientRect(), edge = parseFloat(getComputedStyle(el).borderTopWidth) || 0;   // a yard tag's clear border is only touch target
        if (r.left + edge < sheet.left - 1 || r.right - edge > sheet.right + 1 || r.top + edge < sheet.top - 1 || r.bottom - edge > sheet.bottom + 1) out.push(`${el.textContent.trim()} runs off the sheet`);
      });
      document.querySelectorAll('.pm-town').forEach((dot) => {
        if (!shown(dot)) return;
        const key = [...dot.classList].find((c) => c.startsWith('pm-town--')).slice(9);
        const label = document.querySelector(`.pmap__town--${key}`);
        if (!label || !shown(label)) out.push(`${key} is a dot with no name`);
      });
      return out;
    });
    bad.forEach((b) => fail(`${width}px /alaska/`, `map: ${b}`));
  }
  await desk.close();

  // 3. Touch: yard cards keep their email and fax, the hours stay on the Locations page, and clocks do not tick.
  const touch = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  const phone = await touch.newPage();
  await phone.goto(base, { waitUntil: 'networkidle' });
  const cards = await phone.$$eval('.yard', (els) => els.map((el) => ({
    mail: [...el.querySelectorAll('a[href^="mailto:"]')].some((a) => a.getBoundingClientRect().height > 0),
    fax: [...el.querySelectorAll('dt')].some((d) => d.textContent.trim() === 'Fax' && d.getBoundingClientRect().height > 0),
  })));
  if (cards.length !== 3 || !cards.every((c) => c.mail && c.fax)) fail('phone /', `yard cards should show email and fax: ${JSON.stringify(cards)}`);
  if (await phone.$('[data-seconds]')) fail('phone /', 'a clock is ticking seconds');
  for (const p of ['', 'alaska/', 'products/', 'products/engineered-wood/', 'services/', 'projects/']) {
    await phone.goto(base + p, { waitUntil: 'networkidle' });
    const hours = await phone.evaluate(() => (document.querySelector('main').innerText.match(/\b\d{1,2}(:\d\d)?\s*[ap]\.?m\b\.?/gi) || []).slice(0, 3));
    if (hours.length) fail(`phone /${p}`, `hours are printed: ${hours.join(', ')}`);
    const ell = await phone.$$eval('.plist__items, .mline__sum, .pidx-line__items', (els) => els.filter((e) => e.scrollWidth > e.clientWidth + 1 || getComputedStyle(e).textOverflow === 'ellipsis').length);
    if (ell) fail(`phone /${p}`, `${ell} product lists are cut off`);
  }

  // Nothing under 12 px on a phone: a label set smaller than that is a label nobody on a job site can read.
  for (const p of SWEEP_PAGES) {
    await phone.goto(base + p, { waitUntil: 'networkidle' });
    const small = await phone.evaluate(() => {
      const found = new Set();
      const walker = document.createTreeWalker(document.querySelector('main'), NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const el = walker.currentNode.parentElement;
        if (!walker.currentNode.nodeValue.trim() || el.closest('svg, .sr-only') || !el.getClientRects().length) continue;
        if (parseFloat(getComputedStyle(el).fontSize) < 11.95) found.add(el.className || el.tagName);
      }
      return [...found];
    });
    if (small.length) fail(`phone /${p}`, `text under 12 px: ${small.join(', ')}`);
  }

  // 4. Products: the Find field, the numbered key and quote links that carry the line.
  await phone.goto(base + 'products/', { waitUntil: 'networkidle' });
  if ((await phone.$$eval('.pidx-line', (l) => l.length)) !== 9) fail('phone /products/', 'expected nine product lines');
  if ((await phone.$$eval('.pidx-key__tag', (l) => l.length)) % 9 !== 0) fail('phone /products/', 'the key drawing should number nine lines');
  await phone.fill('#find', 'LVL');
  await phone.waitForTimeout(60);
  const found = await phone.$$eval('.pidx-line:not([hidden]) h3', (l) => l.map((h) => h.textContent));
  if (found.length !== 1 || !/Engineered Wood/.test(found[0])) fail('phone /products/', `Find "LVL" showed [${found}]`);
  await phone.fill('#find', 'zzz-nothing');
  await phone.waitForTimeout(60);
  if (!(await phone.isVisible('[data-find-none]'))) fail('phone /products/', 'Find with no match should say so');
  const line = await phone.goto(base + 'products/cedar-decking/', { waitUntil: 'networkidle' });
  if (!line.ok()) fail('phone /products/cedar-decking/', 'did not load');
  const q = await phone.$$eval('a[href*="quote/"]', (l) => l.filter((a) => a.closest('main')).map((a) => a.getAttribute('href')));
  const carry = encodeURIComponent('Cedar, Decking & Fencing');
  if (!q.length || !q.every((h) => h.includes('?product=' + carry))) fail('phone /products/cedar-decking/', `quote links do not all carry the line: ${q.filter((h) => !h.includes('?product=')).join(', ')}`);

  // 5. Services: six stations, each at its anchor with a drawing, and the three numbers.
  await phone.goto(base + 'services/', { waitUntil: 'networkidle' });
  for (const id of ['takeoffs', 'design', 'crating', 'shipping', 'remote', 'delivery']) {
    if (!(await phone.$(`#${id} .dwg svg`))) fail('phone /services/', `station #${id} is missing or has no drawing`);
  }
  if ((await phone.$$eval('.ystrip a[href^="tel:"]', (l) => l.length)) !== 3) fail('phone /services/', 'expected three yard numbers in the strip');

  // 6. Projects: the sector key filters the schedule and says what is showing.
  await phone.goto(base + 'projects/', { waitUntil: 'networkidle' });
  await phone.click('.pj-filter [data-filter="Institutional"]');
  const vis = await phone.$$eval('.pj-group', (l) => l.filter((g) => !g.hidden).map((g) => g.id));
  if (vis.join() !== 'institutional') fail('phone /projects/', `filter showed [${vis}]`);
  const says = await phone.textContent('[data-pj-count]');
  if (says !== 'Institutional: 2 kinds of work') fail('phone /projects/', `filter status reads "${says}"`);
  if ((await phone.getAttribute('.pj-filter [data-filter="Institutional"]', 'aria-pressed')) !== 'true') fail('phone /projects/', 'pressed filter is not marked');
  await phone.click('.pj-filter [data-filter="all"]');
  if ((await phone.$$eval('.pj-group', (l) => l.filter((g) => !g.hidden).length)) !== 4) fail('phone /projects/', '"All work" did not restore every sector');
  await touch.close();

  // 7. Without the script the pages still give their content: every station, every line, every sector, and no dead filter;
  //    and every call, directions and menu control still leads somewhere real.
  for (const [vp, viewport] of [['phone', { width: 390, height: 844 }], ['desktop', { width: 1440, height: 900 }]]) {
    const ctx = await browser.newContext({ viewport, javaScriptEnabled: false });
    const off = await ctx.newPage();
    for (const p of ['', 'alaska/', 'services/', 'projects/', 'about/', 'locations/', 'products/cedar-decking/']) {
      await off.goto(base + p, { waitUntil: 'load' });
      const dead = await off.$$eval('[data-open], .actionbar a, .masthead__menu', (els) => els.filter((el) => el.getClientRects().length && (el.tagName !== 'A' || !el.getAttribute('href') || (el.hash && !document.getElementById(el.hash.slice(1))))).map((el) => el.textContent.trim()));
      if (dead.length) fail(`no script ${vp} /${p}`, `controls that go nowhere: ${dead.join(', ')}`);
      const numbers = await off.$$eval('.footer a[href^="tel:"]', (l) => l.filter((a) => a.getClientRects().length).length);
      if (numbers < 3) fail(`no script ${vp} /${p}`, `only ${numbers} yard numbers in the footer`);
    }
    await ctx.close();
  }
  const nojs = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
  const off = await nojs.newPage();
  await off.goto(base + 'projects/', { waitUntil: 'load' });
  if (await off.isVisible('.pj-filter')) fail('no script /projects/', 'the filter is offered but cannot work');
  if ((await off.$$eval('.pj-row', (l) => l.length)) !== 8) fail('no script /projects/', 'expected all eight lines of work');
  await nojs.close();
};

const finish = () => {
  if (problems.length) {
    console.log(`\n${problems.length} problem(s):\n` + problems.map((p) => '  ✗ ' + p).join('\n'));
    process.exit(1);
  }
};

if (process.env.ONLY === 'inner') {
  await innerChecks();
  await browser.close();
  server.close();
  finish();
  console.log(`inner pages: sweep of ${SWEEP.length} widths, map, products, services and projects clean\nINNER CHECKS PASSED`);
  process.exit(0);
}

// Every width that has ever broken something stays in this list.
for (const [name, viewport, mobile] of [['small phone', { width: 360, height: 740 }, true], ['phone', { width: 390, height: 844 }, true], ['tablet', { width: 768, height: 1024 }, true], ['small laptop', { width: 1024, height: 768 }, false], ['desktop', { width: 1440, height: 900 }, false]]) {
  const ctx = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('response', (r) => { if (r.status() >= 400 && r.url().startsWith(base)) errs.push(`${r.status()} ${r.url()}`); });
  for (const p of paths) {
    errs.length = 0;
    await page.goto(base + p, { waitUntil: 'networkidle' });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (overflow > 0) fail(`${name} /${p}`, `scrolls sideways by ${overflow}px`);
    // A hero photo must not be drawn much bigger than the file the browser picked for it.
    const stretched = await page.evaluate(() => {
      const img = document.querySelector('.hero__media img, .phero__media img');
      if (!img) return null;
      const box = img.getBoundingClientRect();
      const file = +(img.currentSrc.match(/-(\d+)\.webp/) || [])[1];
      const ratio = img.naturalWidth / img.naturalHeight;
      const drawn = Math.max(box.width, box.height * ratio);
      return file && drawn > file * 1.2 ? `${img.currentSrc.split('/').pop().split('?')[0]} (${file}px file drawn at ${Math.round(drawn)}px)` : null;
    });
    if (stretched) fail(`${name} /${p}`, `hero photo stretched: ${stretched}`);
    errs.forEach((e) => fail(`${name} /${p}`, e));
  }
  if (name === 'phone') {
    // Call sheet opens from the action bar and closes again.
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.click('.actionbar [data-open="call-sheet"]');
    if (!(await page.isVisible('#call-sheet'))) fail('phone /', 'call sheet did not open');
    await page.keyboard.press('Escape');
    if (await page.isVisible('#call-sheet')) fail('phone /', 'call sheet did not close');
    // Menu drawer.
    await page.click('.masthead__menu');
    if (!(await page.isVisible('#drawer'))) fail('phone /', 'menu drawer did not open');
    // The action bar steps aside while typing.
    await page.goto(base + 'quote/', { waitUntil: 'networkidle' });
    await page.focus('#name');
    await page.waitForTimeout(350);
    const barTop = await page.$eval('.actionbar', (el) => el.getBoundingClientRect().top);
    if (barTop < 844) fail('phone /quote/', 'action bar still on screen while typing');
  } else if (name === 'desktop') {
    // Quote form: empty submit flags the required fields; a filled one hands off to email.
    await page.goto(base + 'quote/', { waitUntil: 'networkidle' });
    await page.click('button[type=submit]');
    const invalid = await page.$$eval('[aria-invalid="true"]', (els) => els.map((e) => e.id));
    if (invalid.join() !== 'name,phone,email,location') fail('desktop /quote/', `validation flagged [${invalid}]`);
    await page.fill('#name', 'Test Builder'); await page.fill('#phone', '907-555-0100');
    await page.fill('#email', 'test@example.com'); await page.fill('#location', 'Bethel, AK');
    await page.selectOption('#yard', 'Anchorage');
    await page.setInputFiles('input[type=file]', { name: 'plans.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4') });
    if ((await page.$$eval('[data-files] li', (l) => l.length)) !== 1) fail('desktop /quote/', 'uploaded file not listed');
    await page.click('button[type=submit]');
    await page.waitForTimeout(300);
    if (!(await page.isVisible('[data-done]'))) fail('desktop /quote/', 'confirmation not shown after submit');
    if (await page.isVisible('form[data-form]')) fail('desktop /quote/', 'form still on screen after submit');
    const to = await page.textContent('[data-mail-to]');
    if (to !== 'anchorage@uresco.com') fail('desktop /quote/', `request routed to ${to}, expected anchorage@uresco.com`);

    // A product page's quote link starts the materials list with that product line.
    await page.goto(base + 'quote/?product=Cedar%2C%20Decking%20%26%20Fencing', { waitUntil: 'networkidle' });
    if (!(await page.inputValue('#materials')).startsWith('Cedar, Decking & Fencing:')) fail('desktop /quote/', 'product prefill missing');
    // A yard card or the ship-to ticket starts the form with its yard and place.
    await page.goto(base + 'quote/?yard=fairbanks&location=Nome%2C%20AK', { waitUntil: 'networkidle' });
    if ((await page.inputValue('#yard')) !== 'Fairbanks') fail('desktop /quote/', '?yard= did not choose the yard');
    if ((await page.inputValue('#location')) !== 'Nome, AK') fail('desktop /quote/', '?location= did not fill the job location');

    // Credit application: required fields, consent box, routing to the home yard.
    await page.goto(base + 'accounts/', { waitUntil: 'networkidle' });
    await page.click('form[data-form=credit] button[type=submit]');
    const bad = await page.$$eval('[aria-invalid="true"]', (els) => els.map((e) => e.id));
    for (const id of ['company', 'address', 'name', 'phone', 'email', 'ref1_company', 'ref1_contact', 'agree', 'signature', 'signed'])
      if (!bad.includes(id)) fail('desktop /accounts/', `required field ${id} not flagged`);
    for (const [id, v] of [['company', 'Test Framing LLC'], ['address', '1 Main St, Kent WA'], ['name', 'Pat Builder'], ['phone', '253-555-0100'],
      ['email', 'pat@example.com'], ['ref1_company', 'Acme Supply'], ['ref1_contact', 'Lee 253-555-0199'], ['signature', 'Pat Builder'], ['signed', '2026-10-22']]) await page.fill('#' + id, v);
    await page.check('#agree');
    await page.selectOption('form[data-form=credit] #yard', 'Fairbanks');
    await page.click('form[data-form=credit] button[type=submit]');
    await page.waitForTimeout(300);
    if (!(await page.isVisible('[data-done]'))) fail('desktop /accounts/', 'confirmation not shown after submit');
    if (await page.isVisible('form[data-form]')) fail('desktop /accounts/', 'form still on screen after submit');
    const to2 = await page.textContent('[data-mail-to]');
    if (to2 !== 'fairbanks@uresco.com') fail('desktop /accounts/', `application routed to ${to2}`);
    const leftBehind = await page.evaluate(() => localStorage.getItem('uresco.draft.credit'));
    if (leftBehind) fail('desktop /accounts/', 'draft left in the browser after submit');
    // Sensitive fields are never kept in a draft.
    await page.goto(base + 'accounts/', { waitUntil: 'networkidle' });
    await page.fill('#company', 'Draft Co'); await page.fill('#ein', '12-3456789');
    const draft = await page.evaluate(() => localStorage.getItem('uresco.draft.credit'));
    if (!draft || !draft.includes('Draft Co') || draft.includes('12-3456789')) fail('desktop /accounts/', `draft handling wrong: ${draft}`);
    await page.evaluate(() => localStorage.clear());

    // Open/closed status is filled in from each yard's hours.
    await page.goto(base + 'locations/', { waitUntil: 'networkidle' });
    const statuses = await page.$$eval('.yard [data-hours]', (els) => els.filter((e) => !e.hidden && /Open|Closed/.test(e.textContent)).length);
    if (statuses !== 3) fail('desktop /locations/', `open/closed status shown for ${statuses} of 3 yards`);
  }
  await ctx.close();
}

// The dispatch board is the point of the hero: on common screens all three numbers show without scrolling.
// Hinted text runs wider and wraps sooner, so check with font hinting on as well. Only the
// headless shell (Playwright's default browser) obeys this flag; full Chromium ignores it.
const hinted = await chromium.launch({ args: ['--font-render-hinting=full'] });
for (const [mode, b] of [['', browser], [' hinted', hinted]]) {
  for (const [w, h] of [[1024, 768], [1280, 720], [1280, 800], [1366, 768], [1440, 900], [1536, 864], [1920, 1080]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    await page.goto(base, { waitUntil: 'networkidle' });
    const low = await page.$$eval('.board__num', (els) => Math.max(...els.map((e) => e.getBoundingClientRect().bottom)));
    if (low > h) fail(`${w}x${h}${mode} /`, `dispatch board phone numbers cut off at the fold by ${Math.ceil(low - h)}px`);
    const crowded = await page.$$eval('.board__row', (els) => els.some((e) => {
      const city = e.querySelector('.board__yard').getBoundingClientRect();
      const num = e.querySelector('.board__num').getBoundingClientRect();
      return num.top < city.bottom - 2 && num.left < city.right + 8;
    }));
    if (crowded) fail(`${w}x${h}${mode} /`, 'yard name and phone number collide on the dispatch board');
    await ctx.close();
  }
}
await overflowSweep(hinted, ' hinted');
await hinted.close();
await innerChecks();
await browser.close();
server.close();

finish();
console.log(`browser: ${paths.length} pages × 5 widths clean; quote form, credit application, hours, dialogs and the fold work\ninner pages: sweep of ${SWEEP.length} widths, map, products, services and projects clean\nALL CHECKS PASSED`);
