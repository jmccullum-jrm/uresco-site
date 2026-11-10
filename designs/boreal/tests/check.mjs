// Site checks: run after `node build.mjs`.  npm run check
//  1. Static: every page has a title, description, one <h1>, alt on every <img>, unique ids; every
//     internal link, fragment, image and asset resolves; every aria reference points at something; the
//     copy holds to the facts sheet (claims, hours, geography, phones, addresses, photo captions).
//  2. Browser: every page loads in Chromium at five widths with no errors, no horizontal
//     scroll and no stretched hero photo; the finder answers by keyboard and by its Go button and
//     hands the place to the quote form; both forms validate and hand off; the product filter, the
//     product picks, the projects filter and the services anchors work; every page keeps the 12px
//     floor, 40px touch targets and uncut product lists on a phone; every Call, Directions and Menu
//     control still leads somewhere with JavaScript off.
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

// The contact details the site may print: FACTS.md, and nothing else.
const FACTS = {
  phones: ['(253) 395-1211', '(800) 275-8333', '(253) 872-8432', '(907) 563-2500', '(800) 563-2500', '(907) 561-2076', '(907) 456-1550', '(907) 456-5519'],
  emails: ['sales@uresco.com', 'anchorage@uresco.com', 'fairbanks@uresco.com'],
  addresses: ['8246 S 194th St', 'Kent, WA 98032', 'PO Box 1778, Kent, WA 98035-1778', '12790 Old Seward Hwy', 'Anchorage, AK 99515', '1077 Aspen St', 'Fairbanks, AK 99709'],
};

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
  // Things the facts sheet does not let the site say. Each of these was written once and removed.
  for (const claim of [/one point of contact/i, /the whole way/i, /from quote to landing/i, /delivered pric/i, /price it delivered/i, /prices it, delivered/i, /quoted together/i, /priced and ready/i, /checked for gaps/i,
    /stock varies/i, /last sailings?/i, /about ten minutes/i, /estimators, designers/i, /carrier bookings/i, /when the sailing is/i, /not at the curb/i, /banded/i, /phased|sequenced to/i, /job accounts/i])
    if (claim.test(src)) fail(rel, `says something the facts do not support: ${claim}`);
  // The yard hours are placeholders: they appear on the Locations page and nowhere else, never as a time of day
  // or an "open until", and never in structured data.
  const visible = src.slice(src.indexOf('<body')).replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/g, ' ').replace(/<[^>]+>/g, ' ');
  if (!rel.startsWith('locations') && (/Mon–Fri|Sat–Sun/.test(src) || /\d\s?[ap]\.m\./i.test(visible))) fail(rel, 'prints the placeholder yard hours');
  if (/\buntil\b/i.test(visible)) fail(rel, 'says "until": a yard\'s hours or a promise about time');
  if (/openingHours/.test(src)) fail(rel, 'puts the placeholder hours in structured data');
  if (/\bon (the )?Puget Sound\b/i.test(visible)) fail(rel, 'puts Kent on Puget Sound; it is in the Puget Sound region');
  // Every phone number, email and street address on the page is one from the facts sheet.
  for (const m of visible.matchAll(/\(\d{3}\) \d{3}-\d{4}/g)) if (!FACTS.phones.includes(m[0])) fail(rel, `phone number not in the facts: ${m[0]}`);
  for (const m of src.matchAll(/[\w.-]+@uresco\.com/g)) if (!FACTS.emails.includes(m[0])) fail(rel, `email not in the facts: ${m[0]}`);
  for (const m of src.matchAll(/tel:\+1(\d{10})/g)) if (!FACTS.phones.some((f) => f.replace(/\D/g, '') === m[1])) fail(rel, `tel: link not in the facts: ${m[1]}`);
  for (const a of FACTS.addresses) if (rel === 'locations/index.html' && !visible.includes(a)) fail(rel, `address missing: ${a}`);
  // Nearly every photograph is stock. Only Uresco's own may be described as Uresco's, and the tag is a tag.
  for (const img of src.match(/<img\b[^>]*>/g) || []) {
    const alt = (img.match(/\salt="([^"]*)"/) || [])[1] || '';
    if (/Uresco/.test(alt) && !/\/img\/uresco-|map\.svg/.test(img)) fail(rel, `stock photo described as Uresco's: ${alt}`);
    if (/truck/i.test(alt) && /\/img\/uresco-/.test(img)) fail(rel, `the Uresco tag photo is not a truck: ${alt}`);
  }
  // A control that opens a dialog is a link underneath, unless it is itself inside a dialog (no script, no dialog).
  if (/<button\b[^>]*data-open/.test(src.replace(/<dialog\b[\s\S]*?<\/dialog>/g, ''))) fail(rel, 'a page button opens a dialog but is dead without JavaScript');
  // Every aria reference and label points at something on the page.
  for (const m of src.matchAll(/\s(?:aria-labelledby|aria-controls|aria-describedby|for)="([^"]+)"/g))
    for (const id of m[1].trim().split(/\s+/)) if (!ids.includes(id)) fail(rel, `refers to missing id ${id}`);
  if (rel === '404.html') continue; // links are absolute to the deploy base
  const refs = [...src.matchAll(/\s(?:href|src)="([^"]+)"/g), ...src.matchAll(/\ssrcset="([^"]+)"/g)].flatMap((m) =>
    m[0].includes('srcset') ? m[1].split(',').map((s) => s.trim().split(/\s+/)[0]) : [m[1]]);
  for (const ref of refs) {
    if (/^(https?:|mailto:|tel:|#|data:)/.test(ref)) continue;
    const clean = ref.split(/[?#]/)[0];
    let target = resolve(dirname(file), clean);
    if (clean.endsWith('/') || clean === '' || clean === '.' || clean === './') target = join(target, 'index.html');
    if (!existsSync(target)) { fail(rel, `broken link ${ref}`); continue; }
    // A link to a place on a page lands on something.
    const hash = ref.split('#')[1];
    if (hash && target.endsWith('.html') && !readFileSync(target, 'utf8').includes(` id="${hash}"`)) fail(rel, `link to missing anchor ${ref}`);
  }
  for (const m of src.matchAll(/\shref="#([^"]+)"/g)) if (!ids.includes(m[1])) fail(rel, `link to missing anchor #${m[1]}`);
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

// ---- Inner pages: what the visitor relies on ----
// On a phone: nothing important under 12px, controls at least 40px, no product list cut off with an ellipsis.
// Links inside a sentence are exempt from the touch rule; a row's stretched link is measured by its row; a form
// control inside a <label> is measured by the label; anything the pointer cannot reach is not a control.
const innerPhone = async (page) => {
  for (const p of ['', 'alaska/', 'products/', 'products/engineered-wood/', 'services/', 'projects/', 'pacific-northwest/', 'locations/', 'quote/', 'accounts/', 'about/']) {
    await page.goto(base + p, { waitUntil: 'networkidle' });
    const found = await page.evaluate(() => {
      const main = document.querySelector('main');
      const shows = (e) => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden'; };
      const name = (e) => `${e.tagName.toLowerCase()}.${String(e.className.baseVal ?? e.className).trim().split(/\s+/)[0]}`;
      const small = new Set(), tiny = new Set(), cut = new Set();
      const walk = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
      while (walk.nextNode()) {
        const e = walk.currentNode.parentElement;
        if (!walk.currentNode.textContent.trim() || !shows(e) || e.closest('.sr-only')) continue;
        if (parseFloat(getComputedStyle(e).fontSize) < 12) small.add(name(e));
      }
      main.querySelectorAll('a, button, input, select, textarea, summary').forEach((e) => {
        const s = getComputedStyle(e);
        if (!shows(e) || s.display === 'inline' || s.pointerEvents === 'none') return;
        const r = (e.closest('label') || e).getBoundingClientRect();
        if (r.height < 40 || r.width < 40) tiny.add(`${name(e)} ${Math.round(r.width)}x${Math.round(r.height)}`);
      });
      main.querySelectorAll('*').forEach((e) => {
        const s = getComputedStyle(e);
        if (shows(e) && !e.closest('.sr-only') && ((s.textOverflow === 'ellipsis' && e.scrollWidth > e.clientWidth) || (s.webkitLineClamp !== 'none' && e.scrollHeight > e.clientHeight + 1))) cut.add(name(e));
      });
      return { small: [...small], tiny: [...tiny], cut: [...cut] };
    });
    found.small.forEach((x) => fail(`phone /${p}`, `text under 12px: ${x}`));
    found.tiny.forEach((x) => fail(`phone /${p}`, `control under 40px: ${x}`));
    found.cut.forEach((x) => fail(`phone /${p}`, `text cut off: ${x}`));
  }
};

const innerDesktop = async (page) => {
  // The products index narrows as you type, says how much is left, and has an answer for nothing.
  await page.goto(base + 'products/', { waitUntil: 'networkidle' });
  const rows = () => page.$$eval('[data-pidx-row]', (els) => els.filter((e) => !e.hidden).map((e) => e.id));
  await page.fill('[data-pidx-q]', 'lvl');
  if ((await rows()).join() !== 'engineered-wood') fail('desktop /products/', `"lvl" left [${await rows()}]`);
  if ((await page.textContent('[data-pidx-count]')).trim() !== '1 product in 1 line') fail('desktop /products/', 'filter count wrong for "lvl"');
  await page.fill('[data-pidx-q]', 'zzz');
  if (!(await page.isVisible('[data-pidx-none]'))) fail('desktop /products/', 'no answer when nothing matches');
  await page.fill('[data-pidx-q]', '');
  if ((await rows()).length !== 9) fail('desktop /products/', 'clearing the filter did not bring back nine lines');
  const addLine = await page.getAttribute('#engineered-wood .pidx-row__quote', 'href');
  if (!addLine.endsWith('quote/?product=Engineered%20Wood%20%26%20Trusses')) fail('desktop /products/', `"Add to a quote" links to ${addLine}`);

  // Products picked on a line page go to the quote form, on every quote button.
  await page.goto(base + 'products/engineered-wood/', { waitUntil: 'networkidle' });
  for (const item of ['Glulam beams (GLB)', 'Truss packages']) await page.click(`[data-pline-pick="${item}"]`);
  const hrefs = await page.$$eval('[data-pline-quote]', (els) => els.map((e) => e.href));
  if (new Set(hrefs).size !== 1 || hrefs.length < 3) fail('desktop /products/engineered-wood/', 'quote buttons do not all carry the picks');
  await page.goto(hrefs[0], { waitUntil: 'networkidle' });
  if (!(await page.inputValue('#materials')).startsWith('Engineered Wood & Trusses — Glulam beams (GLB), Truss packages:')) fail('desktop /quote/', 'picked products not filled in');
  await page.evaluate(() => localStorage.clear());

  // The projects filter shows one sector and says so; the quote link hands the kind of work to the form.
  await page.goto(base + 'projects/', { waitUntil: 'networkidle' });
  const sectors = () => page.$$eval('[data-pj-sector]', (els) => els.filter((e) => !e.hidden).map((e) => e.id));
  await page.click('.pj-filter button[data-pj="commercial"]');
  if ((await sectors()).join() !== 'commercial') fail('desktop /projects/', `filter left [${await sectors()}]`);
  if ((await page.textContent('[data-pj-count]')).trim() !== '2 kinds of work in Commercial') fail('desktop /projects/', 'filter count wrong');
  await page.click('.pj-filter button[data-pj="all"]');
  if ((await sectors()).length !== 4) fail('desktop /projects/', '"All work" did not bring back four sectors');
  const kind = await page.$eval('.pj-kind__quote', (a) => a.href);
  await page.goto(kind, { waitUntil: 'networkidle' });
  if (!(await page.inputValue('#materials')).startsWith(decodeURIComponent(kind.split('product=')[1]))) fail('desktop /quote/', 'kind of work not filled in');
  await page.evaluate(() => localStorage.clear());

  // Every service can be linked to, and the linked card is the one marked.
  for (const id of ['takeoffs', 'design', 'delivery', 'remote', 'shipping', 'crating']) {
    await page.goto(base + 'services/#' + id, { waitUntil: 'load' });
    if (!(await page.$(`article.sv-stop#${id}:target`))) fail('desktop /services/', `#${id} is not a service card`);
  }

  // Printed hours only where the rules allow them; every other yard card has the live status alone.
  await page.goto(base + 'locations/', { waitUntil: 'networkidle' });
  const printed = await page.$$eval('.ycard__facts dt', (els) => els.filter((e) => e.textContent === 'Hours').length);
  if (printed !== 3) fail('desktop /locations/', `hours printed for ${printed} of 3 yards`);
};
// ---- end of inner pages ----

// Without the script every control still has somewhere to go, and what only the script can drive is not shown.
const withoutScript = async () => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, javaScriptEnabled: false });
  const page = await ctx.newPage();
  for (const p of ['', 'products/framing-lumber/', 'quote/', 'projects/', 'about/']) {
    await page.goto(base + p, { waitUntil: 'load' });
    const hrefOf = (sel) => page.getAttribute(sel, 'href');
    if (!(await hrefOf('.masthead__call')).endsWith('locations/')) fail(`no-JS /${p}`, 'masthead Call does not lead to the yards');
    if ((await hrefOf('.masthead__menu')) !== '#site-index' || !(await page.$('#site-index'))) fail(`no-JS /${p}`, 'Menu does not lead to the footer index');
    if (!(await page.$$eval('.actionbar a', (a) => a.slice(0, 2).every((x) => x.getAttribute('href').endsWith('locations/'))))) fail(`no-JS /${p}`, 'action bar Call and Directions do not lead to the yards');
    const dead = await page.$$eval('main button, header button, footer button, .actionbar button', (els) => els.filter((e) => e.type !== 'submit' && e.getBoundingClientRect().width && !e.classList.contains('map__dot')).map((e) => e.className));
    dead.forEach((c) => fail(`no-JS /${p}`, `button does nothing without the script: ${c}`));
    if ((await page.$$eval('main a[href]:not([href])', (a) => a.length))) fail(`no-JS /${p}`, 'link without a destination');
  }
  await ctx.close();
};

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
  // The pages read as one site: an eyebrow over every h1, and every inner page ends on the same closing band.
  if (name === 'desktop') for (const p of paths) {
    await page.goto(base + p, { waitUntil: 'domcontentloaded' });
    const shape = await page.evaluate(() => ({ eyebrow: !!document.querySelector('h1').parentElement.querySelector('.eyebrow'), last: document.querySelector('main').lastElementChild.className }));
    if (!shape.eyebrow) fail(`desktop /${p}`, 'the h1 has no eyebrow over it');
    if (p && !/\bcta\b/.test(shape.last)) fail(`desktop /${p}`, `page ends on .${shape.last}, not the closing band`);
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
    // On the quote page the third button goes to the plans step, not back to the top of the same page.
    if ((await page.getAttribute('.actionbar__btn--primary', 'href')) !== '#plans') fail('phone /quote/', 'action bar Quote links to the page it is on');
    await page.evaluate(() => localStorage.clear());
    // A place off the list is a real row: tapping it gets an answer. So does the Go button.
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.fill('.finder__input', 'Kwethluk');
    if ((await page.textContent('.finder__list [role=option]')).trim().indexOf('Use Kwethluk') !== 0) fail('phone /', 'a place off the list is not offered as a choice');
    await page.tap('.finder__list [role=option]');
    await page.waitForTimeout(250);
    if ((await page.textContent('[data-r="name"]')) !== 'Kwethluk' || !(await page.isVisible('.route__y[data-y="any"]'))) fail('phone /', 'tapping the unlisted place did nothing');
    await page.fill('.finder__input', 'nome');
    if (!(await page.isVisible('[data-go]'))) fail('phone /', 'no visible Go button while the field has text');
    await page.tap('[data-go]');
    await page.waitForTimeout(250);
    if (!/^Nome, Alaska/.test(await page.textContent('[data-r="name"]'))) fail('phone /', 'the Go button did not choose the place');
    if (await page.isVisible('[data-go]')) fail('phone /', 'Go button still showing once the place is answered');
    await innerPhone(page);
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
    const statuses = await page.$$eval('.ycard__top [data-hours]', (els) => els.filter((e) => !e.hidden && /Open|Closed/.test(e.textContent)).length);
    if (statuses !== 3) fail('desktop /locations/', `open/closed status shown for ${statuses} of 3 yards`);
    const clocks = await page.$$eval('.ycard [data-clock]', (els) => els.filter((e) => /^\d{1,2}:\d\d [ap]\.m\.$/.test(e.textContent)).length);
    if (clocks !== 3) fail('desktop /locations/', `local time shown for ${clocks} of 3 yards`);

    // The finder: typed by keyboard, answered in the card, drawn on the map, handed to the quote form.
    await page.goto(base, { waitUntil: 'networkidle' });
    const before = await page.textContent('[data-r="name"]');
    if (!/^Bethel, Alaska/.test(before)) fail('desktop /', `finder example is "${before}"`);
    await page.focus('.finder__input');
    await page.keyboard.type('utqiag');
    if ((await page.getAttribute('.finder__input', 'aria-expanded')) !== 'true') fail('desktop /', 'finder list did not open while typing');
    const first = await page.textContent('.finder__list [role=option]');
    if (!first.startsWith('Utqiaġvik')) fail('desktop /', `"utqiag" suggested "${first}"`);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(250);
    const chosen = await page.textContent('[data-r="name"]');
    if (chosen !== 'Utqiaġvik, Alaska') fail('desktop /', `finder chose "${chosen}"`);
    if (!(await page.isVisible('.route__y[data-y="fairbanks"]'))) fail('desktop /', 'Utqiaġvik did not point to the Fairbanks yard');
    const how = await page.textContent('.route__modes');
    if (!/Barge in season/.test(how) || !/Air year-round/.test(how)) fail('desktop /', `Utqiaġvik freight reads "${how.trim()}"`);
    const href = await page.getAttribute('[data-r="quote"]', 'href');
    if (!href.includes('location=Utqia%C4%A1vik%2C%20AK') || !href.endsWith('yard=fairbanks')) fail('desktop /', `finder quote link is ${href}`);
    if ((await page.textContent('.map__tag--dest')) !== 'Utqiaġvik' || await page.isHidden('.map__tag--dest')) fail('desktop /', 'chosen place not marked on the map');
    // Pause motion stops every endless animation; Play starts them again.
    const loopStates = () => page.evaluate(() => document.getAnimations().filter((a) => a.effect.getComputedTiming().iterations === Infinity).map((a) => a.playState));
    await page.click('.utility__motion');
    if ((await loopStates()).some((s) => s !== 'paused')) fail('desktop /', 'Pause motion left something moving');
    await page.click('.utility__motion');
    if (!(await loopStates()).includes('running')) fail('desktop /', 'Play motion did not start the map again');
    // The old name still finds it.
    await page.fill('.finder__input', 'Barrow');
    const alias = await page.textContent('.finder__list [role=option]');
    if (!alias.startsWith('Utqiaġvik (Barrow)')) fail('desktop /', `"Barrow" suggested "${alias}"`);
    // A place that is not on the list still gets an answer and a way forward.
    await page.fill('.finder__input', 'Chicken');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(250);
    if (!(await page.isVisible('[data-r="else"]')) || !(await page.isVisible('.route__y[data-y="any"]'))) fail('desktop /', 'unknown place got no answer');
    await page.goto(base + 'quote/' + href.slice(href.indexOf('?')), { waitUntil: 'networkidle' });
    if ((await page.inputValue('#location')) !== 'Utqiaġvik, AK') fail('desktop /quote/', 'place from the finder not filled in');
    if ((await page.inputValue('#yard')) !== 'Fairbanks') fail('desktop /quote/', 'yard from the finder not selected');
    // An off-road place starts on remote shipping, and the first screen says what carried over.
    if (!(await page.isChecked('input[name=delivery][value="Remote Alaska shipping"]'))) fail('desktop /quote/', 'off-road place left on job-site delivery');
    if (!/Utqiaġvik, AK · Fairbanks yard/.test(await page.textContent('[data-carried]')) || await page.isHidden('[data-carried]')) fail('desktop /quote/', 'first screen does not say what the link carried over');
    await page.evaluate(() => localStorage.clear());
    await page.goto(base + 'quote/?location=Tacoma%2C%20WA&yard=kent', { waitUntil: 'networkidle' });
    if (!(await page.isChecked('input[name=delivery][value="Job-site delivery"]'))) fail('desktop /quote/', 'road-system place did not stay on job-site delivery');
    await page.evaluate(() => localStorage.clear());
    await innerDesktop(page);
  }
  await ctx.close();
}

await withoutScript();

// The first screen has to answer the two things people come for: a yard's number and the finder.
// On common laptop screens both show without scrolling. Hinted text runs wider and wraps sooner,
// so check with font hinting on as well. Only the headless shell (Playwright's default browser)
// obeys this flag; full Chromium ignores it.
const hinted = await chromium.launch({ args: ['--font-render-hinting=full'] });
for (const [mode, b] of [['', browser], [' hinted', hinted]]) {
  for (const [w, h] of [[1024, 768], [1280, 720], [1280, 800], [1366, 768], [1440, 900], [1536, 864], [1920, 1080]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    await page.goto(base, { waitUntil: 'networkidle' });
    const phones = await page.$$eval('.utility__yards a', (els) => els.map((e) => e.getBoundingClientRect()).filter((r) => r.width && r.bottom > 0).length);
    if (phones !== 3) fail(`${w}x${h}${mode} /`, `${phones} of 3 yard numbers on the first screen`);
    const field = await page.$eval('.finder__input', (e) => e.getBoundingClientRect().bottom);
    if (field > h) fail(`${w}x${h}${mode} /`, `finder field cut off at the fold by ${Math.ceil(field - h)}px`);
    if (w >= 1100) {
      const cta = await page.$eval('[data-r="quote"]', (e) => e.getBoundingClientRect().bottom);
      if (cta > h) fail(`${w}x${h}${mode} /`, `route card cut off at the fold by ${Math.ceil(cta - h)}px`);
    }
    await ctx.close();
  }
}
await hinted.close();
await browser.close();
server.close();

if (problems.length) {
  console.log(`\n${problems.length} problem(s):\n` + problems.map((p) => '  ✗ ' + p).join('\n'));
  process.exit(1);
}
console.log(`browser: ${paths.length} pages × 5 widths clean; finder, quote form, credit application, hours, dialogs, the fold (plain and hinted), product filter and picks, projects filter, service anchors and the no-JavaScript fallbacks work\nALL CHECKS PASSED`);
