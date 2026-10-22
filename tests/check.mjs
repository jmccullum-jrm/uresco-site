// Site checks: run after `node build.mjs`.  npm run check
//  1. Static: every page has a title, description, one <h1>, alt on every <img>, unique ids,
//     and every internal link, image and asset resolves to a file in docs/.
//  2. Browser: every page loads in Chromium at phone and desktop widths with no errors,
//     no horizontal scroll, and the quote form validates and hands off.
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, dirname, resolve, relative } from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { createRequire } from 'module';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = join(ROOT, 'docs');
const problems = [];
const fail = (page, msg) => problems.push(`${page}: ${msg}`);

const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const pages = walk(DOCS).filter((f) => f.endsWith('.html'));

for (const file of pages) {
  const rel = relative(DOCS, file);
  const src = readFileSync(file, 'utf8');
  if (/http-equiv="refresh"/.test(src)) continue; // legacy redirect stubs
  if (!/<title>[^<]{10,}<\/title>/.test(src)) fail(rel, 'missing or short <title>');
  if (!/<meta name="description" content="[^"]{50,}"/.test(src)) fail(rel, 'missing or short meta description');
  const h1 = (src.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) fail(rel, `${h1} <h1> elements`);
  for (const img of src.match(/<img\b[^>]*>/g) || []) if (!/\salt="/.test(img)) fail(rel, `img without alt: ${img.slice(0, 80)}`);
  const ids = [...src.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dup.length) fail(rel, `duplicate ids: ${[...new Set(dup)].join(', ')}`);
  if (rel === '404.html') continue; // links are absolute to the deploy base
  const refs = [...src.matchAll(/\s(?:href|src)="([^"]+)"/g), ...src.matchAll(/\ssrcset="([^"]+)"/g)].flatMap((m) =>
    m[0].includes('srcset') ? m[1].split(',').map((s) => s.trim().split(/\s+/)[0]) : [m[1]]);
  for (const ref of refs) {
    if (/^(https?:|mailto:|tel:|#|data:)/.test(ref)) continue;
    const clean = ref.split(/[?#]/)[0];
    let target = resolve(dirname(file), clean);
    if (clean.endsWith('/') || clean === '' || clean === '.' || clean === './') target = join(target, 'index.html');
    if (!existsSync(target)) fail(rel, `broken link ${ref}`);
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
  let f = join(DOCS, p);
  if (p.endsWith('/')) f = join(f, 'index.html');
  if (!existsSync(f)) { res.writeHead(404); return res.end('not found'); }
  res.writeHead(200, { 'content-type': TYPES[f.split('.').pop()] || 'application/octet-stream' });
  res.end(readFileSync(f));
}).listen(0);
const base = `http://127.0.0.1:${server.address().port}/`;
const browser = await chromium.launch(existsSync('/opt/pw-browsers/chromium') ? { executablePath: '/opt/pw-browsers/chromium' } : {});
const paths = pages.map((f) => relative(DOCS, f)).filter((r) => r !== '404.html' && !r.startsWith('products-services'))
  .map((r) => r.replace(/index\.html$/, ''));

for (const [name, viewport, mobile] of [['phone', { width: 390, height: 844 }, true], ['desktop', { width: 1440, height: 900 }, false]]) {
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
    errs.forEach((e) => fail(`${name} /${p}`, e));
  }
  if (mobile) {
    // Call sheet opens from the action bar and closes again.
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.click('.actionbar [data-open="call-sheet"]');
    if (!(await page.isVisible('#call-sheet'))) fail('phone /', 'call sheet did not open');
    await page.keyboard.press('Escape');
    if (await page.isVisible('#call-sheet')) fail('phone /', 'call sheet did not close');
    // Menu drawer.
    await page.click('.masthead__menu');
    if (!(await page.isVisible('#drawer'))) fail('phone /', 'menu drawer did not open');
  } else {
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
    const to = await page.textContent('[data-mail-to]');
    if (to !== 'anchorage@uresco.com') fail('desktop /quote/', `request routed to ${to}, expected anchorage@uresco.com`);

    // A product page's quote link starts the materials list with that product line.
    await page.goto(base + 'quote/?product=Cedar%2C%20Decking%20%26%20Fencing', { waitUntil: 'networkidle' });
    if (!(await page.inputValue('#materials')).startsWith('Cedar, Decking & Fencing:')) fail('desktop /quote/', 'product prefill missing');

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
    const to2 = await page.textContent('[data-mail-to]');
    if (to2 !== 'fairbanks@uresco.com') fail('desktop /accounts/', `application routed to ${to2}`);

    // Open/closed status is filled in from each yard's hours.
    await page.goto(base + 'locations/', { waitUntil: 'networkidle' });
    const statuses = await page.$$eval('.yard [data-hours]', (els) => els.filter((e) => !e.hidden && /Open|Closed/.test(e.textContent)).length);
    if (statuses !== 3) fail('desktop /locations/', `open/closed status shown for ${statuses} of 3 yards`);
  }
  await ctx.close();
}
await browser.close();
server.close();

if (problems.length) {
  console.log(`\n${problems.length} problem(s):\n` + problems.map((p) => '  ✗ ' + p).join('\n'));
  process.exit(1);
}
console.log(`browser: ${paths.length} pages × 2 widths clean; quote form, credit application, hours and dialogs work\nALL CHECKS PASSED`);
