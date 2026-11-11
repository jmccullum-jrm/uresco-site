// Site checks: run after `node build.mjs`.  npm run check
//  1. Static: every page has a title, description, one <h1>, alt on every <img>, unique ids; every
//     internal link, image and asset resolves to a file in docs/, and every #anchor to an element;
//     no page says what the review round ruled out, prints hours outside Locations, or carries a
//     phone number, fax or email that is not on the fact sheet.
//  2. Browser: every page loads in Chromium at five widths with no errors, no horizontal
//     scroll and no stretched hero photo, and both forms validate and hand off.
//  3. The shared pieces and the finished inner pages: the yard strip, the route plate, interludes,
//     the product finder and pager, quote links, the services anchors, the projects filter.
//  4. The review round: real taps on the Alaska finder, the credit application on paper, the quote
//     links, holidays, large browser text, and the layouts that broke between 1000 and 1320 wide.
// CHECK=pieces runs only part 3 (and the static pass), for a quick look at those.
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, dirname, resolve, relative } from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { createRequire } from 'module';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = process.env.OUT ? resolve(process.env.OUT) : join(ROOT, 'docs');
const problems = [];
const fail = (page, msg) => problems.push(`${page}: ${msg}`);

const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const pages = walk(DOCS).filter((f) => f.endsWith('.html'));
const NEVER = [/one point of contact/i, /from quote to landing/i, /price it delivered/i, /delivered pricing/i, /the package and the freight/i, /freight,? quoted together/i, /carriers? booked/i, /carrier bookings/i, /stock varies by yard/i, /\b(?:about )?ten minutes/i, /last sailings/i, /estimators, designers/i, /\bon Puget Sound\b/i, /Form 0\d/, /truck lettered/i,
  // Account terms and process nobody has confirmed (the application itself stays).
  /monthly statement/i, /pay by statement/i, /job accounts?\b/i, /authorized buyers?/i, /\bhome yard\b/i, /check references/i, /one account,? three yards/i, /charge account/i, /authorize Uresco/i, /obtain credit information/i, /sends? your certificates once/i,
  // Guarantees and placement promises.
  /left on the dock/i, /ship(?:s|ped) together/i, /where the crew needs/i, /not (?:left )?at the curb/i,
  // Routes, schedules and stock stated as Uresco's own.
  /lane north/i, /start of the lane/i, /barged to a beach/i, /every load starts/i, /plan back from the sailing/i, /what.s in the yard/i, /full range/i, /stock list/i, /plan for the freight/i, /coordinated for you/i,
  // A finished take-off, specifications and invented documents.
  /builds? the take-?off/i, /checks? it for gaps/i, /every stick/i, /ground contact/i, /western red cedar/i, /no lumber yard to run back to/i, /call the nearest mark/i, /company record/i, /three promises/i, /on the record/i, /\bManifest\b/, /not on our short list, which/i, /Add to a quote/i];
// From the fact sheet, by hand, so a slip in the data cannot pass by agreeing with itself.
const NUMBERS = ['(253) 395-1211', '(800) 275-8333', '(253) 872-8432', '(907) 563-2500', '(800) 563-2500', '(907) 561-2076', '(907) 456-1550', '(907) 456-5519'];
const TELS = NUMBERS.map((n) => '+1' + n.replace(/\D/g, ''));
const EMAILS = ['sales@uresco.com', 'anchorage@uresco.com', 'fairbanks@uresco.com'];
const idsOf = new Map();
const idsIn = (file) => {
  if (!idsOf.has(file)) idsOf.set(file, new Set([...readFileSync(file, 'utf8').matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  return idsOf.get(file);
};
const ONLY_PIECES = process.env.CHECK === 'pieces';

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
  // The review round's list of things the site must never say (RULES), and what it prints as hours.
  // What a visitor reads, what a screen reader reads, and what search engines read all count.
  const ld = [...src.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]).join(' ');
  const alts = [...src.matchAll(/\salt="([^"]*)"/g)].map((m) => m[1]).join(' ');
  const shown = src.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const said = `${shown} ${ld} ${alts}`.replace(/&#39;|&rsquo;/g, "'").replace(/&amp;/g, '&');
  for (const bad of NEVER) if (bad.test(said)) fail(rel, `says something it must not: ${said.match(bad)[0]}`);
  if (/openingHours/.test(src)) fail(rel, 'publishes opening hours in structured data (they are placeholders)');
  const isLocations = rel === 'locations/index.html';
  if (!isLocations) for (const bad of [/\bHours\b/, /\buntil\b/i, /\d\s?[ap]\.?m\.?(?![a-z])/i]) if (bad.test(shown)) fail(rel, `prints yard hours or a time (only the Locations page may): ${shown.match(bad)[0]}`);
  // A stock photograph says whose it is, and never claims to be Uresco's.
  for (const block of [...src.matchAll(/<figure\b[\s\S]*?<\/figure>/g), ...src.matchAll(/<section class="interlude">[\s\S]*?<\/section>/g)].map((m) => m[0])) {
    const key = (block.match(/assets\/img\/([a-z0-9-]+?)-\d+\.webp/) || [])[1];
    const cap = (block.match(/<(?:figcaption|p class="fig__cap")[^>]*>([\s\S]*?)<\/(?:figcaption|p)>/) || [])[1];
    if (!key || !cap) continue;
    const text = cap.replace(/<[^>]+>/g, ' ');
    if (key.startsWith('uresco-')) continue;
    if (!/Photo:/.test(text)) fail(rel, `captioned stock photo ${key} has no credit`);
    if (/Uresco|\bour\b/i.test(text)) fail(rel, `stock photo ${key} is captioned as Uresco's own: ${text.trim()}`);
  }
  // Every number and address on the page is one from the fact sheet.
  for (const m of src.matchAll(/tel:([+\d]+)/g)) if (!TELS.includes(m[1])) fail(rel, `tel link to a number not on the fact sheet: ${m[1]}`);
  for (const m of src.matchAll(/\(\d{3}\) ?\d{3}-\d{4}/g)) if (!NUMBERS.includes(m[0])) fail(rel, `phone number not on the fact sheet: ${m[0]}`);
  for (const m of src.matchAll(/[\w.]+@[\w.]+\.\w+/g)) if (!EMAILS.includes(m[0]) && !m[0].endsWith('example.com')) fail(rel, `email not on the fact sheet: ${m[0]}`);
  // Anything that opens a dialog is a link, so it still goes somewhere without JavaScript.
  if (/<button\b[^>]*\bdata-open=/.test(src)) fail(rel, 'a dialog opener is a button; it should be a link with data-open');
  if (!isLocations) for (const tag of src.match(/<span class="status"[^>]*>/g) || []) if (!tag.includes('data-short')) fail(rel, 'long open/closed status prints a time (only the Locations page may)');
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
    if (!existsSync(target)) { fail(rel, `broken link ${ref}`); continue; }
    const frag = ref.includes('#') && ref.split('#')[1];
    if (frag && target.endsWith('.html') && !idsIn(target).has(decodeURIComponent(frag))) fail(rel, `link to a missing anchor ${ref}`);
  }
  for (const m of src.matchAll(/\shref="#([^"]+)"/g)) if (!idsIn(file).has(m[1])) fail(rel, `link to a missing anchor #${m[1]}`);
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
const paths = pages.filter((f) => !/http-equiv="refresh"/.test(readFileSync(f, 'utf8'))).map((f) => relative(DOCS, f)).filter((r) => r !== '404.html')
  .map((r) => r.replace(/index\.html$/, ''));

// Every width that has ever broken something stays in this list.
for (const [name, viewport, mobile] of ONLY_PIECES ? [] : [['small phone', { width: 360, height: 740 }, true], ['phone', { width: 390, height: 844 }, true], ['tablet', { width: 768, height: 1024 }, true], ['small laptop', { width: 1024, height: 768 }, false], ['desktop', { width: 1440, height: 900 }, false]]) {
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
    // A link from a page that knows the place and the yard starts the form with both.
    await page.goto(base + 'quote/?location=Bethel%2C%20AK&yard=fairbanks', { waitUntil: 'networkidle' });
    if ((await page.inputValue('#location')) !== 'Bethel, AK') fail('desktop /quote/', 'location prefill missing');
    if ((await page.inputValue('#yard')) !== 'Fairbanks') fail('desktop /quote/', 'yard prefill missing');

    // Credit application: required fields, consent box, routing to the chosen yard.
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
    // On an ordinary Tuesday, so a run on a holiday (when the badges hide) still means something.
    await page.clock.setFixedTime(new Date('2026-11-17T18:00:00Z'));
    await page.reload({ waitUntil: 'networkidle' });
    const statuses = await page.$$eval('.yard [data-hours]', (els) => els.filter((e) => !e.hidden && /Open|Closed/.test(e.textContent)).length);
    if (statuses !== 3) fail('desktop /locations/', `open/closed status shown for ${statuses} of 3 yards`);
    // A yard must not read Open on a holiday: it could send someone to a locked gate.
    for (const day of ['2026-11-26T18:00:00Z', '2026-12-25T18:00:00Z', '2027-01-01T18:00:00Z']) {
      await page.clock.setFixedTime(new Date(day));
      await page.reload({ waitUntil: 'networkidle' });
      const shown = await page.$$eval('.yard [data-hours]', (els) => els.filter((e) => !e.hidden && /Open/.test(e.textContent)).length);
      if (shown) fail('desktop /locations/', `${shown} yards read Open on the holiday ${day.slice(0, 10)}`);
    }
  }
  await ctx.close();
}

// The yard phone numbers are the point of the hero: on common screens they show without scrolling.
// Hinted text runs wider and wraps sooner, so check with font hinting on as well. Only the
// headless shell (Playwright's default browser) obeys this flag; full Chromium ignores it.
const hinted = await chromium.launch({ args: ['--font-render-hinting=full'] });
for (const [mode, b] of ONLY_PIECES ? [] : [['', browser], [' hinted', hinted]]) {
  for (const [w, h] of [[768, 1024], [800, 1024], [899, 1000], [1024, 768], [1280, 720], [1280, 800], [1366, 768], [1440, 900], [1536, 864], [1920, 1080]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    await page.goto(base, { waitUntil: 'networkidle' });
    const low = await page.$$eval('.ystrip__num', (els) => Math.max(...els.map((e) => e.getBoundingClientRect().bottom)));
    if (low > h) fail(`${w}x${h}${mode} /`, `yard phone numbers cut off at the fold by ${Math.ceil(low - h)}px`);
    const crowded = await page.$$eval('.ystrip__item', (els) => els.some((e) => {
      const city = e.querySelector('.ystrip__city').getBoundingClientRect();
      const num = e.querySelector('.ystrip__num').getBoundingClientRect();
      return num.top < city.bottom - 2 && num.left < city.right + 8;
    }));
    if (crowded) fail(`${w}x${h}${mode} /`, 'yard name and phone number collide');
    await ctx.close();
  }
}
await hinted.close();

// ---- The shared pieces and the finished inner pages ----
const open = async (viewport, mobile = false) => {
  const ctx = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile });
  return { ctx, page: await ctx.newPage() };
};

// Yard strip: name and number never touch, nothing is cut, at every width that has ever broken it.
for (const w of [320, 360, 390, 760, 768, 800, 899, 900, 1000, 1180, 1280]) {
  const { ctx, page } = await open({ width: w, height: 900 });
  for (const path of ['', 'products/', 'services/']) {
    await page.goto(base + path, { waitUntil: 'load' });
    const bad = await page.$$eval('.ystrip__item', (els) => els.filter((e) => e.offsetWidth).flatMap((e) => {
      const city = e.querySelector('.ystrip__city b').getBoundingClientRect();
      const num = e.querySelector('.ystrip__num').getBoundingClientRect();
      const lat = e.querySelector('.ystrip__lat');
      const out = [];
      if (num.top < city.bottom - 2 && num.left < city.right + 6) out.push('name runs into number');
      if (num.right > e.getBoundingClientRect().right + 1) out.push('number runs out of the cell');
      if (lat.scrollWidth > lat.clientWidth + 1) out.push('latitude line cut');
      return out;
    }));
    if (bad.length) fail(`${w} /${path}`, `yard strip: ${[...new Set(bad)].join(', ')}`);
  }
  await ctx.close();
}

// Without JavaScript every Call, Directions and Menu control still goes somewhere, nothing is left
// on screen that needs the script, and nothing waits for a reveal.
for (const [name, viewport, mobile] of [['phone', { width: 390, height: 844 }, true], ['desktop', { width: 1440, height: 900 }, false]]) {
  const ctx = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile, javaScriptEnabled: false });
  const page = await ctx.newPage();
  for (const path of ['', 'services/', 'products/framing-lumber/', 'alaska/', 'quote/']) {
    await page.goto(base + path, { waitUntil: 'load' });
    const r = await page.evaluate(() => {
      const on = (e) => { const b = e.getBoundingClientRect(), c = getComputedStyle(e); return b.width > 0 && b.height > 0 && c.visibility !== 'hidden'; };
      return {
        dead: [...document.querySelectorAll('button:not([type=submit])')].filter(on).map((b) => b.textContent.trim().slice(0, 30)),
        openers: [...document.querySelectorAll('[data-open]')].filter((e) => e.tagName !== 'A' || !e.getAttribute('href')).length,
        hidden: [...document.querySelectorAll('.rv, .rv-img')].filter((e) => getComputedStyle(e).opacity === '0').length,
      };
    });
    if (r.dead.length) fail(`no-js ${name} /${path}`, `buttons that do nothing without JavaScript: ${r.dead.join(', ')}`);
    if (r.openers) fail(`no-js ${name} /${path}`, `${r.openers} dialog openers with nowhere to go`);
    if (r.hidden) fail(`no-js ${name} /${path}`, `${r.hidden} elements waiting for a reveal`);
  }
  if (mobile) {
    for (const [sel, want] of [['.actionbar__btn--call', '/locations/'], ['.actionbar__btn:nth-child(2)', '/locations/'], ['.masthead__menu', '#footer-index'], ['main [data-open="call-sheet"]', '/locations/']]) {
      await page.goto(base + 'services/', { waitUntil: 'load' });
      await page.click(sel);
      await page.waitForURL((u) => u.href.includes(want));
      if (!page.url().includes(want)) fail(`no-js ${name}`, `${sel} led to ${page.url()}, expected ${want}`);
    }
  }
  await ctx.close();
}

// How a page ends: most close on the quote prompt and the three numbers.
{
  const { ctx, page } = await open({ width: 1440, height: 900 });
  for (const path of ['alaska/', 'products/', 'products/windows-doors-cabinets/', 'services/', 'projects/', 'pacific-northwest/', 'locations/']) {
    await page.goto(base + path, { waitUntil: 'load' });
    const last = await page.$eval('main', (m) => ({ cls: m.lastElementChild.className, manifest: m.lastElementChild.querySelectorAll('.manifest').length, nums: m.lastElementChild.querySelectorAll('.ystrip__num').length, tel: m.lastElementChild.querySelectorAll('a[href^="tel:"]').length }));
    if (!last.cls.includes('closing') || last.manifest !== 1 || last.nums !== 3 || last.tel !== 3) fail(`desktop /${path}`, `does not end on the closing band: ${JSON.stringify(last)}`);
  }
  // A quote link on a page that knows the yard carries it, and the map's minor roads are drawn with their casing.
  await page.goto(base + 'pacific-northwest/', { waitUntil: 'load' });
  const stockQuotes = await page.$$eval('.stock__add', (els) => els.map((e) => e.getAttribute('href')));
  if (stockQuotes.length !== 9 || stockQuotes.some((h) => !h.includes('&yard=kent'))) fail('desktop /pacific-northwest/', `stock list quote links: ${stockQuotes[0]}`);
  await page.goto(base, { waitUntil: 'load' });
  if (!(await page.$('.lane.roadbed--minor'))) fail('desktop /', 'the minor roads on the plate have lost their casing');
  // Pointing at a stock row must not change any box: only opacity and transform are animated.
  const rows = await page.$$('.stock__row');
  const before = await rows[3].evaluate((r) => { const b = r.getBoundingClientRect(); return { h: b.height, p: getComputedStyle(r).paddingLeft }; });
  await rows[3].hover();
  await page.waitForTimeout(600);
  const after = await rows[3].evaluate((r) => { const b = r.getBoundingClientRect(); return { h: b.height, p: getComputedStyle(r).paddingLeft }; });
  if (before.h !== after.h || before.p !== after.p) fail('desktop /', `stock row changes size on hover: ${JSON.stringify([before, after])}`);
  // A body link that opens the call sheet does that, rather than leaving the page.
  await page.goto(base + 'services/', { waitUntil: 'networkidle' });
  const here = page.url();
  await page.click('main [data-open="call-sheet"]');
  if (!(await page.isVisible('#call-sheet')) || page.url() !== here) fail('desktop /services/', 'body Call link did not open the sheet');
  await page.keyboard.press('Escape');
  // The legend under the finder's plate reads across, one column, with its control under it.
  await page.goto(base + 'alaska/', { waitUntil: 'networkidle' });
  const legend = await page.$eval('.finder .plate__legend', (l) => ({ l: l.clientWidth, ul: l.querySelector('ul').clientWidth }));
  if (legend.ul < legend.l - 1) fail('desktop /alaska/', `map legend squeezed into ${legend.ul} of ${legend.l}px`);
  await ctx.close();
}

// Lists that are the point of the row are never cut with an ellipsis.
{
  const { ctx, page } = await open({ width: 390, height: 844 }, true);
  for (const [path, sel] of [['', '.stock__items'], ['services/', '.svx-sheet__items'], ['products/engineered-wood/', '.stock__items']]) {
    await page.goto(base + path, { waitUntil: 'load' });
    const cut = await page.$$eval(sel, (els) => els.filter((e) => e.offsetWidth && (getComputedStyle(e).textOverflow === 'ellipsis' || e.scrollWidth > e.clientWidth + 1)).length);
    if (!(await page.$(sel))) fail(`phone /${path}`, `${sel} is gone (update this check)`);
    if (cut) fail(`phone /${path}`, `${cut} × ${sel} cut off`);
  }
  await ctx.close();
}

// Route plate: on a phone the whole route fits the frame (Kent to Utqiaġvik, no panning) and no
// label is cut by the frame, in the full sheet or either crop.
for (const [w, name] of [[320, 'phone'], [390, 'phone'], [600, 'crop'], [768, 'crop'], [820, 'crop'], [1024, 'sheet'], [1440, 'sheet']]) {
  const { ctx, page } = await open({ width: w, height: 900 }, w < 700);
  for (const path of ['', 'alaska/']) {
    await page.goto(base + path, { waitUntil: 'load' });
    const r = await page.$eval('[data-plate]', (plate) => {
      const scroller = plate.querySelector('.plate__scroll');
      const frame = scroller.getBoundingClientRect();
      const inFrame = (b) => b.left >= frame.left - 1 && b.right <= frame.right + 1 && b.top >= frame.top - 1 && b.bottom <= frame.bottom + 1;
      const labels = [...plate.querySelectorAll('.plate__labels > *')].filter((e) => getComputedStyle(e).display !== 'none');
      const named = (t) => labels.find((e) => e.textContent.includes(t));
      return {
        pans: scroller.scrollWidth - scroller.clientWidth,
        cut: labels.filter((e) => !inFrame(e.getBoundingClientRect())).map((e) => e.textContent.trim()),
        kent: !!named('Kent') && inFrame(named('Kent').getBoundingClientRect()),
        north: !!named('Utqia') && inFrame(named('Utqia').getBoundingClientRect()),
      };
    });
    if (r.pans > 1) fail(`${w} /${path}`, `route plate pans by ${r.pans}px`);
    if (r.cut.length) fail(`${w} /${path}`, `route plate labels cut by the frame: ${r.cut.join(', ')}`);
    if (!r.kent || !r.north) fail(`${w} /${path}`, 'route plate does not show both Kent and Utqiaġvik');
  }
  await ctx.close();
}

{
  const { ctx, page } = await open({ width: 1440, height: 900 });
  // An interlude photograph fills its frame.
  await page.goto(base + 'products/', { waitUntil: 'load' });
  const gap = await page.$eval('.interlude__frame', (f) => {
    const box = f.getBoundingClientRect(), img = f.querySelector('img').getBoundingClientRect();
    return { below: Math.round(box.bottom - img.bottom), above: Math.round(img.top - box.top) };
  });
  if (gap.below > 0 || gap.above > 0) fail('desktop /products/', `interlude photograph leaves a strip of its frame showing (${gap.above}px above, ${gap.below}px below)`);

  // Product finder.
  await page.goto(base + 'products/', { waitUntil: 'networkidle' });
  await page.fill('#prod-q', 'lvl');
  const hits = await page.$$eval('.prod-row:not([hidden])', (els) => els.map((e) => e.id));
  if (hits.join() !== 'engineered-wood') fail('desktop /products/', `finder for "lvl" left [${hits}], expected engineered-wood`);
  await page.fill('#prod-q', 'zzz');
  if (!(await page.isVisible('[data-prod-none]'))) fail('desktop /products/', 'finder has no "nothing found" state');
  await page.fill('#prod-q', '');
  // Each row can go straight to a quote with its line on it.
  const quotes = await page.$$eval('.prod-row__quote', (els) => els.map((e) => e.getAttribute('href')));
  if (quotes.length !== 9 || quotes.some((h) => !h.includes('?product='))) fail('desktop /products/', 'each line needs a "Quote this line" link that carries the line');
  // The row is one big link; the quote link has to sit above it.
  await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle' }), page.click('.prod-row__quote')]);
  if (!(await page.inputValue('#materials')).startsWith('Framing Lumber & Timbers:')) fail('desktop /products/', '"Quote this line" did not reach the form with its line');

  // Line pages: the hero button starts the quote with the line, and the manifest's two buttons carry it too.
  await page.goto(base + 'products/engineered-wood/', { waitUntil: 'networkidle' });
  const manifestLinks = await page.$$eval('.manifest a', (els) => els.map((e) => e.getAttribute('href')));
  if (manifestLinks.length < 2 || manifestLinks.some((h) => !h.includes('?product=Engineered%20Wood%20%26%20Trusses'))) fail('desktop /products/engineered-wood/', `manifest links lost the line: ${manifestLinks}`);
  if (await page.$eval('.manifest__title', (e) => e.tagName) !== 'H2') fail('desktop /products/engineered-wood/', 'manifest heading level');
  await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle' }), page.click('.phero .btn[href*="quote"]')]);
  if (!(await page.inputValue('#materials')).startsWith('Engineered Wood & Trusses:')) fail('desktop /products/engineered-wood/', 'quote link did not start the materials list with the line');

  // The pager walks all nine lines and comes back round.
  await page.goto(base + 'products/framing-lumber/', { waitUntil: 'load' });
  const walked = new Set();
  for (let i = 0; i < 9; i++) {
    walked.add(new URL(page.url()).pathname);
    await Promise.all([page.waitForNavigation({ waitUntil: 'load' }), page.click('.prod-pager a[rel=next]')]);
  }
  if (walked.size !== 9 || !page.url().endsWith('products/framing-lumber/')) fail('desktop /products/', `pager visited ${walked.size} of 9 lines and ended on ${page.url()}`);

  // Services: other pages link to these anchors, so they must exist exactly once.
  await page.goto(base + 'services/', { waitUntil: 'load' });
  for (const id of ['takeoffs', 'design', 'delivery', 'remote', 'shipping', 'crating'])
    if ((await page.$$(`[id="${id}"]`)).length !== 1) fail('desktop /services/', `anchor #${id} missing or repeated`);

  // Projects filter.
  await page.goto(base + 'projects/', { waitUntil: 'networkidle' });
  const shown = () => page.$$eval('.pjx-kind', (els) => els.filter((e) => e.offsetParent !== null).length);
  await page.click('button[data-filter="Commercial"]');
  if ((await shown()) !== 2) fail('desktop /projects/', `Commercial shows ${await shown()} kinds, expected 2`);
  if ((await page.getAttribute('button[data-filter="Commercial"]', 'aria-pressed')) !== 'true') fail('desktop /projects/', 'filter button not marked pressed');
  if ((await page.textContent('[data-pjx-status]')) !== 'Commercial: showing 2 of 8 kinds of work') fail('desktop /projects/', 'filter status line wrong');
  await page.click('button[data-filter="all"]');
  if ((await shown()) !== 8) fail('desktop /projects/', `All work shows ${await shown()} kinds, expected 8`);
  const pq = await page.$$eval('.pjx-kind__quote', (els) => els.map((e) => e.getAttribute('href')));
  if (pq.length !== 8 || pq.some((h) => !h.includes('?product='))) fail('desktop /projects/', 'each kind of work needs a quote link that carries it');
  await ctx.close();
}


// ---- What the review round found. Each of these broke once. ----

// The Alaska finder, the way a person uses it: real taps and clicks, because fill() never saw the bug.
{
  const { ctx, page } = await open({ width: 390, height: 844 }, true);
  await page.goto(base + 'alaska/', { waitUntil: 'networkidle' });
  await page.tap('#place-input');
  await page.waitForTimeout(200);
  if ((await page.inputValue('#place-input')) !== '') fail('phone /alaska/', `tapping the finder filled in "${await page.inputValue('#place-input')}"`);
  if ((await page.evaluate(() => document.activeElement.id)) !== 'place-input') fail('phone /alaska/', 'tapping the finder did not leave focus in the field');
  await page.keyboard.type('Nome');
  await page.waitForTimeout(150);
  if ((await page.inputValue('#place-input')) !== 'Nome') fail('phone /alaska/', `typing in the finder gave "${await page.inputValue('#place-input')}"`);
  await page.tap('#place-list li');
  await page.waitForTimeout(250);
  if ((await page.$eval('[data-a=name]', (e) => e.textContent)) !== 'Nome, Alaska') fail('phone /alaska/', 'choosing a place did not answer');
  await page.tap('[data-clear]');
  await page.waitForTimeout(200);
  if ((await page.inputValue('#place-input')) !== '') fail('phone /alaska/', 'the clear button did not clear the finder');
  await page.tap('.finder__title');
  await page.waitForTimeout(300);
  await page.tap('button[data-place="Bethel"]');
  await page.waitForTimeout(250);
  if ((await page.inputValue('#place-input')) !== 'Bethel') fail('phone /alaska/', 'a Try link did not fill the finder');
  await page.tap('#place-input');
  await page.waitForTimeout(250);
  if ((await page.inputValue('#place-input')) !== 'Bethel') fail('phone /alaska/', 'tapping the field after a Try link changed the place');
  // Off the road system, the quote starts as remote shipping, not job-site delivery.
  const q = await page.$eval('[data-a=quote]', (a) => a.href);
  if (!q.includes('delivery=remote') || !q.includes('yard=anchorage')) fail('phone /alaska/', `quote link for Bethel: ${q}`);
  await page.goto(q, { waitUntil: 'networkidle' });
  const form = await page.evaluate(() => ({ loc: document.querySelector('#location').value, yard: document.querySelector('#yard').value, delivery: [...document.querySelectorAll('input[name=delivery]')].find((x) => x.checked)?.value }));
  if (form.loc !== 'Bethel, AK' || form.yard !== 'Anchorage' || !/remote/i.test(form.delivery)) fail('phone /quote/', `arriving from the Bethel answer: ${JSON.stringify(form)}`);
  // A place in the link beats the saved draft, and the visitor is told.
  await page.fill('#location', 'Juneau, AK');
  await page.waitForTimeout(200);
  await page.goto(base + 'quote/?location=Bethel%2C%20AK&yard=anchorage', { waitUntil: 'networkidle' });
  if ((await page.inputValue('#location')) !== 'Bethel, AK') fail('phone /quote/', 'a saved draft beat the place in the link');
  if (!/Juneau/.test(await page.textContent('[data-restored-text]'))) fail('phone /quote/', 'the visitor was not told the place changed');
  // Quote links add up; a second line does not replace the first.
  await page.evaluate(() => localStorage.clear());
  for (const line of ['Framing%20Lumber%20%26%20Timbers', 'Engineered%20Wood%20%26%20Trusses']) await page.goto(`${base}quote/?product=${line}`, { waitUntil: 'networkidle' });
  const list = await page.inputValue('#materials');
  if (!list.includes('Framing Lumber & Timbers:') || !list.includes('Engineered Wood & Trusses:')) fail('phone /quote/', `product lines did not accumulate: ${list}`);
  await page.evaluate(() => localStorage.clear());
  // The product finder keeps a usable field once something is typed.
  await page.goto(base + 'products/', { waitUntil: 'networkidle' });
  await page.tap('#prod-q');
  await page.keyboard.type('simpson');
  await page.waitForTimeout(150);
  const prod = await page.evaluate(() => ({ w: document.querySelector('#prod-q').getBoundingClientRect().width, t: document.querySelector('[data-prod-count]').textContent }));
  if (prod.w < 200) fail('phone /products/', `search field shrank to ${Math.round(prod.w)}px while typing`);
  if (/enter/i.test(prod.t)) fail('phone /products/', `keyboard hint on a phone: ${prod.t}`);
  // Keyboard focus never ends up behind the action bar.
  for (const path of ['', 'products/']) {
    await page.goto(base + path, { waitUntil: 'load' });
    let hidden = 0;
    for (let i = 0; i < 60; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(15);
      hidden += await page.evaluate(() => {
        const a = document.activeElement;
        if (!a || a === document.body || a.closest('.actionbar')) return 0;
        const box = a.getBoundingClientRect(), bar = document.querySelector('.actionbar').getBoundingClientRect();
        if (!box.height) return 0;
        return Math.max(0, Math.min(box.bottom, bar.bottom) - Math.max(box.top, bar.top)) / box.height >= 0.2 ? 1 : 0;
      });
    }
    if (hidden) fail(`phone /${path}`, `${hidden} tab stops land behind the action bar`);
  }
  await ctx.close();
}
{
  const { ctx, page } = await open({ width: 1440, height: 900 });
  await page.goto(base + 'alaska/', { waitUntil: 'networkidle' });
  await page.click('#place-input');
  await page.waitForTimeout(150);
  if ((await page.inputValue('#place-input')) !== '') fail('desktop /alaska/', 'clicking the finder filled in a place');
  await page.keyboard.type('Nome');
  if ((await page.inputValue('#place-input')) !== 'Nome') fail('desktop /alaska/', `typing after a click gave "${await page.inputValue('#place-input')}"`);
  // Tab out of the open list moves on to a control; it does not drop focus to the page.
  await page.keyboard.press('Tab');
  await page.waitForTimeout(200);
  const after = await page.evaluate(() => ({ body: document.activeElement === document.body, list: document.activeElement.id === 'place-list', closed: document.getElementById('place-list').hidden }));
  if (after.body || after.list || !after.closed) fail('desktop /alaska/', `Tab from the finder list: ${JSON.stringify(after)}`);
  // Remote places north of the Interior are not assigned a yard the owner has not named.
  await page.fill('#place-input', 'Utqiagvik');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(200);
  const yards = await page.$$eval('[data-y]', (els) => els.filter((e) => !e.hidden).map((e) => e.dataset.y));
  if (yards.length !== 2 || (await page.textContent('[data-a=yardlabel]')) !== 'Yards to call') fail('desktop /alaska/', `Utqiaġvik answer: ${yards}`);
  await ctx.close();
}

// The Locations phone number stays out of the address column in the band where it used to overprint.
{
  const { ctx, page } = await open({ width: 1000, height: 800 });
  for (const w of [1000, 1024, 1040, 1060, 1100, 1160, 1199, 1200, 1280, 1440]) {
    await page.setViewportSize({ width: w, height: 800 });
    await page.goto(base + 'locations/', { waitUntil: 'load' });
    const over = await page.$$eval('.lcx-book', (els) => els.map((e) => e.querySelector('.lcx-tel').getBoundingClientRect().right - e.querySelector('.lcx-book__col:nth-child(2)').getBoundingClientRect().left));
    if (over.some((x) => x > 0)) fail(`${w} /locations/`, `phone number runs ${Math.ceil(Math.max(...over))}px into the address column`);
  }
  // The home page's fact row and yard directory hold their columns through the laptop band.
  for (const w of [1000, 1024, 1060, 1100, 1160, 1200, 1280, 1320]) {
    await page.setViewportSize({ width: w, height: 800 });
    await page.goto(base, { waitUntil: 'load' });
    const r = await page.evaluate(() => ({
      cities: [...document.querySelectorAll('.dir__city')].map((e) => Math.round(e.getBoundingClientRect().height)),
      facts: [...document.querySelectorAll('.facts dt')].map((d) => { const x = document.createRange(); x.selectNodeContents(d); return x.getBoundingClientRect().right - d.parentElement.getBoundingClientRect().right; }),
      tels: [...document.querySelectorAll('.dir__tel')].map((e) => Math.round(e.getBoundingClientRect().top)),
    }));
    if (new Set(r.cities).size > 1) fail(`${w} /`, `directory cities break differently: ${r.cities}`);
    if (new Set(r.tels).size > 1) fail(`${w} /`, `directory numbers do not line up: ${r.tels}`);
    if (r.facts.some((x) => x > 0)) fail(`${w} /`, 'a fact runs past its column');
  }
  await ctx.close();
}

// A print laid over another covers the photograph, never the words under it.
for (const w of [390, 768, 1024, 1440]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  for (const [path, sel] of [['', '.kent__prints'], ['pacific-northwest/', '.pnw-prints']]) {
    await page.goto(base + path, { waitUntil: 'load' });
    await page.locator(sel).first().scrollIntoViewIfNeeded();
    const covered = await page.$eval(sel, (box) => [...box.querySelectorAll('figcaption')].flatMap((cap) => {
      const fig = cap.closest('figure');
      const range = document.createRange();
      range.selectNodeContents(cap);
      return [...range.getClientRects()].flatMap((r) => [.12, .5, .88].map((f) => {
        const hit = document.elementFromPoint(r.left + r.width * f, r.top + r.height / 2);
        return hit && !fig.contains(hit) ? cap.textContent.trim() : null;
      })).filter(Boolean);
    }));
    if (covered.length) fail(`${w} /${path}`, `a print covers the caption "${covered[0]}"`);
  }
  await ctx.close();
}

// The credit application: every part of it, the hand-off, what a draft keeps, and the paper form.
{
  const { ctx, page } = await open({ width: 1440, height: 900 });
  const pdfPages = async () => {
    const buf = await page.pdf({ format: 'Letter', preferCSSPageSize: true });
    return (buf.toString('latin1').match(/\/Type\s*\/Page\b(?!s)/g) || []).length;
  };
  await page.goto(base + 'accounts/', { waitUntil: 'networkidle' });
  for (const name of ['company', 'dba', 'entity', 'ein', 'license', 'years', 'website', 'address', 'name', 'title', 'phone', 'email', 'ap_contact', 'buyers', 'yard', 'limit', 'monthly', 'po', 'tax', 'ref1_company', 'ref1_contact', 'ref2_company', 'ref2_contact', 'ref3_company', 'ref3_contact', 'bank', 'bank_contact', 'documents', 'agree', 'signature', 'signed'])
    if (!(await page.$(`form[data-form=credit] [name="${name}"]`))) fail('desktop /accounts/', `the application lost its ${name} field`);
  if (await page.$('.ac-ledger')) fail('desktop /accounts/', 'the list of unconfirmed account terms came back');
  if (!(await page.$('.form__warn'))) fail('desktop /accounts/', 'no warning that tax ID and bank details travel by email');
  if (!/You will attach these to the email/.test(await page.textContent('form[data-form=credit] .drop'))) fail('desktop /accounts/', 'drop zone does not say files go in the email step');
  // Printed blank: two Letter pages, the letterhead on the first, a real signature cell on the second.
  if ((await pdfPages()) !== 2) fail('desktop /accounts/', `blank application prints on ${await pdfPages()} pages, expected 2`);
  await page.emulateMedia({ media: 'print' });
  const paper = await page.evaluate(() => {
    const on = (s) => { const e = document.querySelector(s); return !!e && getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().height > 0; };
    return { letterhead: on('.letterhead'), sign: document.querySelector('.field--sign').getBoundingClientRect().height, date: on('.field--signdate'), refs: on('.refs'), bank: on('#bank'), breaks: getComputedStyle(document.querySelector('.fieldset--newpage')).breakBefore, chrome: on('.masthead') || on('.footer') || on('.actionbar') || on('.fp-hero') };
  });
  await page.emulateMedia({ media: null });
  if (!paper.letterhead || !paper.date || !paper.refs || !paper.bank || paper.sign < 70 || paper.chrome || paper.breaks !== 'page') fail('desktop /accounts/', `paper form: ${JSON.stringify(paper)}`);
  // What a draft keeps.
  for (const [id, v] of [['company', 'Draft Co'], ['ein', '98-7654321'], ['bank', 'First Test Bank'], ['bank_contact', 'Dana 253-555-0123'], ['signature', 'Sig Nature'], ['signed', '2026-11-17']]) await page.fill('#' + id, v);
  await page.waitForTimeout(100);
  const draft = await page.evaluate(() => localStorage.getItem('uresco.draft.credit')) || '';
  if (!draft.includes('Draft Co')) fail('desktop /accounts/', 'the draft is not being saved');
  for (const secret of ['98-7654321', 'First Test Bank', 'Dana 253', 'Sig Nature', '2026-11-17']) if (draft.includes(secret)) fail('desktop /accounts/', `a draft kept "${secret}"`);
  // Submit: hands off to the chosen yard's address, and the application can still be printed afterwards.
  await page.evaluate(() => localStorage.clear());
  await page.goto(base + 'accounts/', { waitUntil: 'networkidle' });
  for (const [id, v] of [['company', 'Test Framing LLC'], ['address', '1 Main St, Kent WA'], ['name', 'Pat Builder'], ['phone', '253-555-0100'], ['email', 'pat@example.com'], ['ref1_company', 'Acme Supply'], ['ref1_contact', 'Lee 253-555-0199'], ['signature', 'Pat Builder'], ['signed', '2026-10-22']]) await page.fill('#' + id, v);
  await page.check('#agree');
  await page.selectOption('form[data-form=credit] #yard', 'Anchorage');
  await page.click('form[data-form=credit] button[type=submit]');
  await page.waitForTimeout(300);
  const mail = await page.getAttribute('[data-mail-link]', 'href');
  if (!mail || !mail.startsWith('mailto:anchorage@uresco.com?') || !decodeURIComponent(mail).includes('Test Framing LLC')) fail('desktop /accounts/', `hand-off link: ${mail}`);
  if (!(await page.isVisible('[data-done] [data-print]'))) fail('desktop /accounts/', 'no way to print after submitting');
  if ((await pdfPages()) !== 2) fail('desktop /accounts/', `after submit the application prints on ${await pdfPages()} pages, expected 2`);
  await page.evaluate(() => localStorage.clear());
  await ctx.close();
}

// One name per product line, a credit on the stock frame, a rail on every page, and no big photo twice.
{
  const { ctx, page } = await open({ width: 1440, height: 900 });
  await page.goto(base + 'products/', { waitUntil: 'networkidle' });
  const menu = await page.$$eval('.mega__name', (e) => e.map((x) => x.textContent.trim()));
  const rows = await page.$$eval('.prod-row h2, .prod-row h3', (e) => e.map((x) => x.textContent.trim().replace(/^\d+\s*/, '')));
  if (menu.join('|') !== rows.join('|')) fail('desktop /products/', `line names differ between the menu and the page: ${menu} / ${rows}`);
  await page.goto(base, { waitUntil: 'networkidle' });
  const credits = await page.$$eval('.stock__credit', (e) => e.map((x) => x.textContent.trim()));
  if (!credits.length || credits.some((c) => !/^Stock photo\. Photo: \S/.test(c))) fail('desktop /', `stock frame credits: ${credits[0]}`);
  const cap = await page.$eval('.cover__cap', (e) => getComputedStyle(e).backgroundColor);
  if (cap !== 'rgb(244, 239, 230)') fail('desktop /', `cover caption has lost its paper slip (background ${cap})`);
  if ((await page.$$('.sectors img')).length) fail('desktop /', '"Who we supply" has gone back to photo tiles');
  const big = new Map();
  for (const p of paths) {
    await page.goto(base + p, { waitUntil: 'load' });
    const rail = await page.$eval('.rail', (e) => getComputedStyle(e).display).catch(() => 'none');
    if (rail === 'none') fail(`desktop /${p}`, 'no latitude scale in the margin');
    for (const key of await page.$$eval('main img', (els) => els.filter((i) => i.getBoundingClientRect().width >= 1100).map((i) => ((i.currentSrc || i.src).match(/img\/([a-z0-9-]+?)(?:-p)?-\d+\.webp/) || [])[1]).filter(Boolean)))
      big.set(key, new Set([...(big.get(key) || []), p || 'home']));
  }
  for (const [key, where] of big) if (where.size > 1) fail('desktop', `${key} is full width or hero size on ${[...where].join(', ')}`);
  await page.goto(base + 'about/', { waitUntil: 'load' });
  const years = await page.evaluate(() => {
    const walk = document.createTreeWalker(document.querySelector('.abt-form'), NodeFilter.SHOW_TEXT);
    let n; while ((n = walk.nextNode())) if (/More than 35/.test(n.textContent)) return getComputedStyle(n.parentElement).fontFamily;
    return '';
  });
  if (!/Instrument/.test(years)) fail('desktop /about/', `"More than 35 years" set in ${years || 'nothing'}; small figures are sans so the 3 cannot read as a 5`);
  await ctx.close();
}

// Larger browser text gets the phone chrome instead of a page that scrolls sideways.
for (const [w, size] of [[1280, 20], [1280, 24], [1280, 32], [390, 20], [390, 24]]) {
  const big = await chromium.launch({ args: [`--blink-settings=defaultFontSize=${size}`] });
  const ctx = await big.newContext({ viewport: { width: w, height: 800 } });
  const page = await ctx.newPage();
  for (const path of ['', 'alaska/', 'products/', 'services/', 'locations/', 'quote/', 'accounts/', 'about/']) {
    await page.goto(base + path, { waitUntil: 'load' });
    const r = await page.evaluate(() => {
      const top = (s) => { const e = [...document.querySelectorAll(s)].find((x) => x.offsetWidth); return e ? e.getBoundingClientRect().right : 0; };
      return { over: document.documentElement.scrollWidth - document.documentElement.clientWidth, right: Math.max(top('.masthead a[data-open="call-sheet"]'), top('.masthead__menu')), w: innerWidth };
    });
    if (r.over > 0) fail(`${w} at ${size}px text /${path}`, `scrolls sideways by ${r.over}px`);
    if (r.right > r.w) fail(`${w} at ${size}px text /${path}`, 'call or menu control off the screen');
  }
  await big.close();
}

await browser.close();
server.close();

if (problems.length) {
  console.log(`\n${problems.length} problem(s):\n` + problems.map((p) => '  ✗ ' + p).join('\n'));
  process.exit(1);
}
console.log(`browser: ${ONLY_PIECES ? 'shared pieces and inner pages only' : `${paths.length} pages × 5 widths clean; quote form, credit application and its paper copy, hours, dialogs, the finder and the fold work`}\nALL CHECKS PASSED`);
