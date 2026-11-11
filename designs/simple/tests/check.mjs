// Simple design: manifest hover, Products mega menu and nav-current-for-PNW checks removed (those flourishes no longer exist).
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
//  4. The review round: every serious finding, as a check, so it cannot come back. The credit application stays complete,
//     prints on two Letter pages and keeps sensitive fields out of drafts and email; links beat drafts; the finder, Find,
//     the manifest and the highlighter behave; larger text, keyboard focus, print and forced colours stay usable.
//     ONLY=review node tests/check.mjs runs this part alone.
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
  // And what the second review ruled out: invented account terms, invented guarantees, labels that read as real departments or documents.
  for (const claim of ['pay on a statement', 'job accounts', 'buy on account', 'specimen', 'one account. all three', 'set up once', 'confirm your limit', 'home yard', 'charge account', 'authorize uresco', 'obtain credit information', 'what we promise', 'every stick', 'build the take-off', 'builds the take-off', 'we fill in this column', 'priced material list', 'a sketch', 'use one or all', 'any station', 'past the curb', 'not at the curb', 'where the crew needs', 'dispatch', 'delivery ticket', 'core of what we ship', 'sequenced to the schedule', 'staged out of', 'nothing gets left', 'arrive the way they left', 'survive the trip', 'banded', 'band and wrap', 'steel banding', 'no line carries', 'owner-builder', 'tribal or alaska', 'agency, tribe', 'one ring']) {
    if (src.toLowerCase().includes(claim)) fail(rel, `says "${claim}", which the review ruled out`);
  }
  // Yard hours are placeholders. They print on the Locations page and nowhere else, and never in structured data.
  if (/openingHours/.test(src)) fail(rel, 'structured data states opening hours');
  if (rel !== 'locations/index.html') {
    const when = textOf(src).match(/\b\d{1,2}(:\d\d)?\s*[ap]\.?m\b\.?|\buntil\b/i);
    if (when) fail(rel, `prints a time: "${when[0]}"`);
  }
  // No invented drawing-control numbers.
  const code = textOf(src).match(/\bSheet\s+[A-Z]?-?\d+\b|\bRev\.\s*\d{4}|\bDwg\.?\s+[A-Z]?-?\d+|\bItem\s+\d{3}\.\d|\bLine\s+\d{3}\s+of\s+\d{3}/);
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
// Every photograph shipped is one a page shows, or the source a page's crop is cut from.
const PHOTOS = JSON.parse(readFileSync(join(ROOT, 'scripts/photos.json'), 'utf8'));
const builtHtml = pages.map((f) => readFileSync(f, 'utf8')).join('');
const photoKeys = [...new Set(readdirSync(join(DOCS, 'assets/img')).map((f) => f.replace(/-\d+\.webp$/, '')))];
const shownPhotos = photoKeys.filter((k) => builtHtml.includes(`assets/img/${k}-`));
const cropSources = shownPhotos.map((k) => PHOTOS[k]?.src).filter((s) => s?.startsWith('@')).map((s) => s.slice(1));
for (const k of photoKeys) if (!shownPhotos.includes(k) && !cropSources.includes(k)) fail('assets/img', `${k} is published but no page shows it`);
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
  // Simple design: the home page has no yard cards, so the email and fax check is removed.
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
  if (says !== 'Institutional: 1 kind of work') fail('phone /projects/', `filter status reads "${says}"`);
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

// ---- The review round ----
const reviewChecks = async () => {
  const sheets = (pdf) => (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
  const SECRETS = { ein: '12-3456789', bank: 'First Bank Kent', bank_contact: 'Jo 253-555-0111' };
  const fillCredit = async (p) => {
    for (const [id, v] of [['company', 'Test Framing LLC'], ['address', '1 Main St, Kent WA'], ['name', 'Pat Builder'], ['phone', '253-555-0100'], ['email', 'pat@example.com'], ['ref1_company', 'Acme Supply'], ['ref1_contact', 'Lee 253-555-0199'], ['signature', 'Pat Builder'], ['signed', '2026-10-22'], ...Object.entries(SECRETS)]) await p.fill('#' + id, v);
    await p.check('#agree');
  };
  const SUBMIT = 'form[data-form=credit] button[type=submit]';
  const DRAFT = () => localStorage.getItem('uresco.draft.credit');

  // The credit application: complete, printable, and careful with what it keeps and sends.
  const desk = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await desk.newPage();
  await p.goto(base + 'accounts/', { waitUntil: 'networkidle' });
  const WHOLE = ['company', 'dba', 'entity', 'ein', 'license', 'years', 'website', 'address', 'name', 'title', 'phone', 'email', 'ap_contact', 'buyers', 'yard', 'limit', 'monthly', 'ref1_company', 'ref1_contact', 'ref2_company', 'ref2_contact', 'ref3_company', 'ref3_contact', 'bank', 'bank_contact', 'agree', 'signature', 'signed'];
  const lost = await p.evaluate((ids) => ids.filter((id) => !document.querySelector(`form[data-form=credit] #${id}`)), WHOLE);
  if (lost.length) fail('/accounts/', `the credit application has lost: ${lost.join(', ')}`);
  for (const name of ['po', 'tax']) if (!(await p.$(`form[data-form=credit] input[name=${name}]`))) fail('/accounts/', `the credit application has lost its ${name} choices`);
  if (await p.$('#terms, .ac-sched, .ac-stmt')) fail('/accounts/', 'the account terms section is back');
  const blank = sheets(await p.pdf({ format: 'Letter' }));
  if (blank !== 2) fail('print /accounts/', `a blank application prints on ${blank} pages`);
  await fillCredit(p);
  await p.click(SUBMIT);
  await p.waitForSelector('[data-done]:not([hidden])');
  const body = decodeURIComponent((await p.getAttribute('[data-mail-again]', 'href')).split('body=')[1] || '');
  const shown = await p.textContent('[data-mail-text]');
  for (const v of Object.values(SECRETS)) if (body.includes(v) || shown.includes(v)) fail('/accounts/', `"${v}" went into the email`);
  if (!/give these to your yard/.test(body)) fail('/accounts/', 'the email does not say how to give the tax ID and bank details');
  if (!(await p.isVisible('[data-held-note]'))) fail('/accounts/', 'the notice does not say the tax ID and bank details were left out');
  if (!(await p.isVisible('[data-done] [data-print]')) || !(await p.isVisible('[data-done] [data-back]'))) fail('/accounts/', 'the notice has lost Print or Back to the form');
  const filled = sheets(await p.pdf({ format: 'Letter' }));
  if (filled !== 2) fail('print /accounts/', `a submitted application prints on ${filled} pages`);
  await p.emulateMedia({ media: 'print' });
  const onPaper = await p.$eval('form[data-form=credit]', (f) => (getComputedStyle(f).display !== 'none' ? f.querySelector('#company').value : ''));
  await p.emulateMedia({ media: 'screen' });
  if (onPaper !== 'Test Framing LLC') fail('print /accounts/', 'a submitted application does not print with its answers');
  await p.click('[data-done] [data-back]');
  if (!(await p.isVisible('#company')) || (await p.inputValue('#company')) !== 'Test Framing LLC') fail('/accounts/', 'Back to the form lost the answers');
  await p.close();
  // Only a form service can say a thing was sent: a failure keeps the draft, a confirmed send clears it.
  const svc = await desk.newPage();
  let status = 500;
  await svc.route('https://forms.invalid/**', (r) => r.fulfill({ status, headers: { 'access-control-allow-origin': '*' }, contentType: 'application/json', body: '{}' }));
  await svc.goto(base + 'accounts/', { waitUntil: 'networkidle' });
  await svc.$eval('form[data-form=credit]', (f) => { f.dataset.endpoint = 'https://forms.invalid/x'; });
  await fillCredit(svc);
  await svc.click(SUBMIT);
  await svc.waitForSelector('[data-failed]:not([hidden])');
  if (!(await svc.evaluate(DRAFT))) fail('/accounts/', 'a failed send lost the draft');
  status = 200;
  await svc.click(SUBMIT);
  await svc.waitForSelector('[data-done]:not([hidden])');
  if (await svc.evaluate(DRAFT)) fail('/accounts/', 'a confirmed send left the draft behind');
  await desk.close();
  // With the script off the browser writes the email itself, so held fields must have no name to be written under.
  if (!SITE.formEndpoint) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
    const off = await ctx.newPage();
    await off.goto(base + 'accounts/', { waitUntil: 'load' });
    for (const id of Object.keys(SECRETS)) if ((await off.getAttribute('#' + id, 'name')) !== null) fail('no script /accounts/', `#${id} would be written into the email`);
    if ((await off.getAttribute('form[data-form]', 'enctype')) !== 'text/plain') fail('no script /accounts/', 'the email would arrive URL-encoded');
    if (!/left out of it/.test(await off.textContent('.fm-foot'))) fail('no script /accounts/', 'the note does not warn about the tax ID and bank details');
    await off.goto(base + 'alaska/', { waitUntil: 'load' });
    if (!(await off.getAttribute('.masthead__cta', 'href')).includes('yard=anchorage')) fail('no script /alaska/', 'the masthead quote link does not start on Anchorage');
    await ctx.close();
  }

  // Phone: the quote form, links against drafts, the finder, Find and the manifest.
  const touch = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const m = await touch.newPage();
  await m.goto(base + 'quote/', { waitUntil: 'networkidle' });
  for (const [id, v] of [['name', 'Sam'], ['location', 'Bethel, AK'], ['phone', 'abc'], ['email', 'pat@x']]) await m.fill('#' + id, v);
  await m.click('button[type=submit]');
  await m.waitForTimeout(120);
  if (await m.isVisible('[data-done]')) fail('/quote/', 'a phone of "abc" and an email of "pat@x" went through');
  await m.goto(base + 'quote/?location=Nome%2C%20AK', { waitUntil: 'networkidle' });
  if ((await m.inputValue('#location')) !== 'Nome, AK' || !/Bethel/.test(await m.textContent('[data-link-note]'))) fail('/quote/', 'a link did not beat the saved draft and say so');
  if (new URL(m.url()).search) fail('/quote/', 'the link parameters stayed in the address, so a reload overrules the person');
  await m.goto(base + 'quote/?yard=anchorage', { waitUntil: 'networkidle' });
  await m.selectOption('#yard', 'Fairbanks');
  await m.waitForTimeout(60);
  await m.reload({ waitUntil: 'networkidle' });
  if ((await m.inputValue('#yard')) !== 'Fairbanks') fail('/quote/', 'a reload put the yard back to what the link said');
  await m.setInputFiles('input[type=file]', { name: 'plan-a1.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4') });
  await m.waitForTimeout(80);
  await m.reload({ waitUntil: 'networkidle' });
  if (!/plan-a1\.pdf was not kept/.test(await m.textContent('[data-file-err]'))) fail('/quote/', 'a reload dropped the file without saying so');
  if (!/Files are not/.test(await m.textContent('[data-draft-state]'))) fail('/quote/', 'the draft line implies files are kept');
  await m.evaluate(() => localStorage.clear());

  await m.goto(base + 'alaska/', { waitUntil: 'networkidle' });
  const alaskaLinks = await m.$$eval('.takeoff a[href*="quote/"], .actionbar__btn--primary, .tb__cta a[href*="quote/"]', (l) => l.map((a) => a.getAttribute('href')));
  if (alaskaLinks.length < 4 || !alaskaLinks.every((h) => h.includes('yard=anchorage'))) fail('/alaska/', `a quote link does not start on Anchorage: ${alaskaLinks.join(' ')}`);
  await m.tap('.shipto__chip[data-place="Bethel"]');
  await m.waitForTimeout(200);
  if (!/barge window/i.test(await m.textContent('[data-r="season"]'))) fail('/alaska/', 'the ticket does not say a whole package is planned around the barge');
  if (!/^Lane [A-D]$/.test((await m.textContent('[data-r="t0"]')).trim())) fail('/alaska/', 'the ticket shows a bare lane letter');
  const toQuote = new URL(await m.getAttribute('[data-r="quote"]', 'href'), base + 'alaska/').href;
  await m.goto(toQuote, { waitUntil: 'networkidle' });
  if (!/Remote Alaska/.test(await m.$eval('input[name=delivery]:checked', (e) => e.value))) fail('/quote/', 'a Bethel quote does not start on remote shipping');
  if ((await m.inputValue('#role')) !== '') fail('/quote/', 'an untouched "I am a" is sent as an answer');
  await m.evaluate(() => localStorage.clear());
  await m.goto(base + 'alaska/', { waitUntil: 'networkidle' });
  await m.fill('.shipto__input', 'Kotzebue');
  await m.$eval('.shipto__input', (e) => e.blur());
  await m.waitForTimeout(350);
  if (!/Kotzebue/.test(await m.textContent('[data-r="name"]'))) fail('/alaska/', 'a town typed but not picked left another town on the ticket');
  if ((await m.$$eval('[data-y]:not([hidden])', (l) => l.map((e) => e.dataset.y))).join() !== 'anchorage,fairbanks') fail('/alaska/', 'Kotzebue should show both Alaska yards');

  await m.goto(base + 'products/', { waitUntil: 'networkidle' });
  for (const [word, line] of [['sheetrock', 'Insulation'], ['2x4', 'Framing'], ['joist hangers', 'Hardware']]) {
    await m.fill('#find', word);
    await m.waitForTimeout(60);
    const hit = await m.$$eval('.pidx-line:not([hidden]) h3', (l) => l.map((h) => h.textContent).join());
    if (!hit.includes(line)) fail('/products/', `Find "${word}" did not show ${line}: [${hit}]`);
  }
  await m.fill('#find', 'gutters');
  await m.waitForTimeout(60);
  if (!/Nothing listed.*Ask your yard/s.test(await m.textContent('[data-find-none]')) || !/Nothing listed/.test(await m.textContent('[data-find-status]'))) fail('/products/', 'no match reads as a statement that we do not carry it');

  await m.goto(base, { waitUntil: 'networkidle' });
  await m.goto(base + 'products/hardware-supplies/', { waitUntil: 'networkidle' });
  const rows = await m.$$eval('.tsheet__row span:nth-child(2)', (l) => l.map((s) => s.textContent).join());
  if (!/Simpson/.test(rows) || /Dimensional lumber/.test(rows)) fail('/products/hardware-supplies/', `the take-off sheet is not this line's items: ${rows}`);
  await touch.close();

  // Mouse: the manifest's hover intent, the menu's Escape, one name per line, the current nav item.
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const d = await ctx.newPage();
  await d.goto(base, { waitUntil: 'networkidle' });
  await d.goto(base + 'pacific-northwest/', { waitUntil: 'networkidle' });

  // The highlighter never strands a short word at the end of a line.
  const stranded = () => {
    const out = [];
    document.querySelectorAll('.display em, .h2 em').forEach((em) => {
      const r = document.createRange(), nodes = [], walker = document.createTreeWalker(em, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) nodes.push(walker.currentNode);
      let top = null, first = '';
      for (const n of nodes) for (let i = 0; i < n.length; i++) {
        r.setStart(n, i); r.setEnd(n, i + 1);
        const b = r.getBoundingClientRect();
        if (!b.height) continue;
        if (top === null) top = b.top;
        if (Math.abs(b.top - top) < b.height / 2) first += n.data[i];
      }
      if (new Set([...em.getClientRects()].map((c) => Math.round(c.top))).size > 1 && /^(a|an|and|the|of|or|to|in|on|at|by|for|our)$/i.test(first.replace(/\s/g, ' ').trim())) out.push(em.textContent.trim());
    });
    return out;
  };
  for (const width of [390, 1440]) {
    await d.setViewportSize({ width, height: 900 });
    for (const u of SWEEP_PAGES) {
      await d.goto(base + u, { waitUntil: 'load' });
      (await d.evaluate(stranded)).forEach((t) => fail(`${width}px /${u}`, `the highlighter strands a short word: "${t}"`));
    }
  }

  // On paper: ink objects print black, framed objects stay whole, the highlighter does not paint over the line above.
  await d.setViewportSize({ width: 1440, height: 900 });
  await d.emulateMedia({ media: 'print' });
  await d.goto(base + 'locations/', { waitUntil: 'networkidle' });
  if ((await d.$eval('.board__digits .fl', (e) => getComputedStyle(e).color)) !== 'rgb(0, 0, 0)') fail('print /locations/', 'the phone numbers do not print black');
  await d.goto(base + 'alaska/', { waitUntil: 'networkidle' });
  const whole = await d.evaluate(() => ['.shipto__card', '.pmap', '.dwg'].filter((s) => getComputedStyle(document.querySelector(s)).breakInside !== 'avoid'));
  if (whole.length) fail('print /alaska/', `can split across a page: ${whole.join(', ')}`);
  if ((await d.$eval('.display em', (e) => getComputedStyle(e).backgroundImage)) !== 'none') fail('print /alaska/', 'the highlighter still prints');
  await ctx.close();

  // Tab focus never lands behind the action bar.
  const kb = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const k = await kb.newPage();
  await k.goto(base + 'locations/', { waitUntil: 'networkidle' });
  let behind = 0;
  for (let i = 0; i < 40; i++) {
    await k.keyboard.press('Tab');
    await k.waitForTimeout(25);
    if (await k.evaluate(() => {
      const a = document.activeElement, bar = document.querySelector('.actionbar');
      if (!a || a === document.body || a.closest('.actionbar, .masthead')) return false;
      const b = a.getBoundingClientRect(), top = bar.getBoundingClientRect().top;
      return Math.max(0, Math.min(b.bottom, innerHeight) - Math.max(b.top, top)) > b.height / 2;
    })) behind++;
  }
  if (behind) fail('390px /locations/', `${behind} tab stops land behind the action bar`);
  await kb.close();

  // Touch targets at tablet width, where a mouse-sized link is easy to miss.
  const tab = await browser.newContext({ viewport: { width: 768, height: 1024 }, isMobile: true, hasTouch: true });
  const t = await tab.newPage();
  await t.goto(base + 'products/', { waitUntil: 'networkidle' });
  const small = await t.$$eval('.pidx-az a, .crumbs a, .footer a', (l) => l.filter((a) => { const r = a.getBoundingClientRect(); return r.width && r.height < 39.5; }).map((a) => a.textContent.trim()));
  if (small.length) fail('768px /products/', `links under 40 px: ${small.slice(0, 8).join(', ')}`);
  await tab.close();

  // Windows High Contrast: a chosen option still looks chosen.
  const hc = await browser.newContext({ viewport: { width: 1440, height: 900 }, forcedColors: 'active' });
  const h = await hc.newPage();
  await h.goto(base + 'quote/', { waitUntil: 'networkidle' });
  const mark = await h.evaluate(() => getComputedStyle(document.querySelector('.fm-opt:has(input:checked) .fm-opt__box'), '::after').backgroundColor);
  if (mark === 'rgba(0, 0, 0, 0)') fail('forced colours /quote/', 'a chosen option looks unchosen');
  await hc.close();

  // Larger text: Chrome's "Very large" default falls through to the stacked layouts instead of running off the page.
  const big = await chromium.launch({ args: ['--blink-settings=defaultFontSize=24'] });
  const bc = await big.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  const b = await bc.newPage();
  for (const u of ['', 'alaska/', 'quote/', 'accounts/', 'locations/']) {
    await b.goto(base + u, { waitUntil: 'load' });
    const over = await b.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (over > 0) fail(`24px text /${u}`, `scrolls sideways by ${over}px`);
  }
  await big.close();
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

if (process.env.ONLY === 'review') {
  await reviewChecks();
  await browser.close();
  server.close();
  finish();
  console.log('review round: clean\nREVIEW CHECKS PASSED');
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
    // Handing over to an email app proves nothing was sent, so the typing stays until the person clears it. Sensitive fields never do.
    const keptAfter = await page.evaluate(() => localStorage.getItem('uresco.draft.credit'));
    if (!keptAfter || !keptAfter.includes('Test Framing LLC')) fail('desktop /accounts/', 'the draft was lost after the email hand-off');
    if (keptAfter && /"(ein|bank|bank_contact|signature|signed|agree)"/.test(keptAfter)) fail('desktop /accounts/', `sensitive field in the draft after submit: ${keptAfter}`);
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
await reviewChecks();
await browser.close();
server.close();

finish();
console.log(`browser: ${paths.length} pages × 5 widths clean; quote form, credit application, hours, dialogs and the fold work\ninner pages: sweep of ${SWEEP.length} widths, map, products, services and projects clean\nreview round: credit application, drafts, finder, Find, manifest, highlighter, print, focus and large text clean\nALL CHECKS PASSED`);
