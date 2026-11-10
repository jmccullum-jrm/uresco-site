// Site checks: run after `node build.mjs`.  npm run check
//  1. Static: every page has a title, description, one <h1>, alt on every <img>, unique ids,
//     and every internal link, image and asset resolves to a file in docs/.
//  2. Browser: every page loads in Chromium at five widths with no errors, no horizontal
//     scroll and no stretched hero photo, and both forms validate and hand off.
import { readFileSync, readdirSync, statSync, existsSync, mkdtempSync, cpSync, writeFileSync, rmSync } from 'fs';
import { join, dirname, resolve, relative } from 'path';
import { tmpdir } from 'os';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { createRequire } from 'module';
import { execFileSync } from 'child_process';
import { LOCATIONS } from '../src/data/locations.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = process.env.OUT ? resolve(process.env.OUT) : join(ROOT, 'docs');
const problems = [];
const fail = (page, msg) => problems.push(`${page}: ${msg}`);

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
// Things the site must never say (see the review rules). Checked on visible text only.
const NEVER = [/one point of contact/i, /from quote to landing/i, /price it delivered/i, /delivered pricing/i, /quoted together/i, /takes? about \w+ minutes/i,
  /stock varies/i, /last sailings/i, /estimators,? designers and drivers/i, /\bon (the )?puget sound\b/i, /priced and ready to order/i, /carrier bookings/i, /ships together/i, /\bbuilds? the take-?off/i,
  // Accounts: no invented document, process or reach.
  /yard ticket/i, /paper works too/i, /drop it at any yard/i, /return to your home yard/i, /any of (our|the) three yards/i,
  // Freight: no guarantee, no packing method or pick-up nobody confirmed, no route of Uresco's own.
  /arrives the way it left/i, /\bbanded\b/i, /or yard pick-?up/i, /pick up at the yard/i, /truck from (kent|anchorage|fairbanks)/i, /not at the curb/i, /where the crew needs/i, /the lane north/i, /we schedule delivery/i, /off the road system, barges run/i,
  // Take-offs are help, design is not engineering, and Uresco supplies: it does not build or say who may buy.
  /we fill in this column/i, /get a take-?off/i, /every stick\. counted/i, /designed to fit/i, /engineered to your plans/i, /who we build for/i, /owner-builder/i, /agency, tribe/i, /tribal or alaska native/i];
// The accounts page may ask for anything on the application, but it states nothing about what an account includes, or about limits, terms, approvals or statements.
const ACCOUNT_CLAIMS = [/what an account does/i, /buy on account/i, /job accounts/i, /monthly statements?/i, /\bnet[ -]?\d+\b/i, /once it.?s approved/i, /once it has been reviewed/i, /we check references/i, /confirm your limit/i, /limits and terms are confirmed/i, /authorize uresco/i];
// The only contact details the site may print (data/locations.mjs, which FACTS.md backs).
const PHONES = new Set(LOCATIONS.flatMap((l) => [l.phone, l.tollFree, l.fax]).filter(Boolean));
const MAILS = new Set(LOCATIONS.map((l) => l.email));
for (const file of pages) {
  const rel = relative(DOCS, file);
  const src = readFileSync(file, 'utf8');
  if (/http-equiv="refresh"/.test(src)) continue;
  const ld = [...src.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]).join(' ');
  const text = src.replace(/<(script|style)[\s\S]*?<\/\1>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  for (const re of NEVER) if (re.test(text) || re.test(ld)) fail(rel, `says something the rules forbid: ${(text.match(re) || ld.match(re))[0]}`);
  if (rel === join('accounts', 'index.html')) for (const re of ACCOUNT_CLAIMS) if (re.test(text)) fail(rel, `makes a claim about accounts: ${text.match(re)[0]}`);
  // The yard hours are placeholders: they appear in the Locations details and nowhere else.
  if (rel !== join('locations', 'index.html') && /Mon[–-]Fri|Sat[–-]Sun|\b\d{1,2}(:\d\d)? ?[ap]\.m\./.test(text)) fail(rel, 'prints yard hours');
  if (/\buntil\b/i.test(text)) fail(rel, `says "until": ${text.match(/.{30}\buntil\b.{20}/i)[0]}`);
  if (/openingHours/.test(src)) fail(rel, 'structured data states opening hours');
  // Every phone number, fax and email on the page is one of the yards' own.
  for (const m of text.matchAll(/\(\d{3}\) ?\d{3}-\d{4}/g)) if (!PHONES.has(m[0])) fail(rel, `unknown number ${m[0]}`);
  for (const m of src.matchAll(/\bmailto:([^"?]+)/g)) if (!MAILS.has(m[1])) fail(rel, `unknown email ${m[1]}`);
  // A control that opens the call sheet or the menu is a link, so it still goes somewhere without the script.
  if (/<button\b[^>]*\bdata-open=/.test(src)) fail(rel, 'a button opens a dialog; it does nothing without JavaScript');
}
console.log(`static: ${pages.length} pages checked`);

// ---- Browser pass ----
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
const TYPES = { html: 'text/html', css: 'text/css', js: 'text/javascript', webp: 'image/webp', png: 'image/png', jpg: 'image/jpeg', svg: 'image/svg+xml', woff2: 'font/woff2', json: 'application/json', webmanifest: 'application/manifest+json', xml: 'application/xml', txt: 'text/plain' };
const serve = (dir) => createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  let f = join(dir, p);
  if (p.endsWith('/')) f = join(f, 'index.html');
  if (!existsSync(f)) { res.writeHead(404); return res.end('not found'); }
  res.writeHead(200, { 'content-type': TYPES[f.split('.').pop()] || 'application/octet-stream' });
  res.end(readFileSync(f));
}).listen(0);
const server = serve(DOCS);
const base = `http://127.0.0.1:${server.address().port}/`;
const browser = await chromium.launch(existsSync('/opt/pw-browsers/chromium') ? { executablePath: '/opt/pw-browsers/chromium' } : {});
const paths = pages.filter((f) => !/http-equiv="refresh"/.test(readFileSync(f, 'utf8'))).map((f) => relative(DOCS, f)).filter((r) => r !== '404.html')
  .map((r) => r.replace(/index\.html$/, ''));

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
  if (name === 'phone' || name === 'desktop') {
    // The home hero photograph, not a line of type, is the largest contentful paint.
    await page.goto(base, { waitUntil: 'networkidle' });
    const lcp = await page.evaluate(() => new Promise((done) => {
      let last = null;
      new PerformanceObserver((l) => { last = l.getEntries().pop(); }).observe({ type: 'largest-contentful-paint', buffered: true });
      setTimeout(() => done(last ? (last.element ? last.element.tagName + ' ' + (last.url || '').split('/').pop() : 'gone') : 'none'), 300);
    }));
    if (!/^IMG hero-truck-denali/.test(lcp)) fail(`${name} /`, `largest contentful paint is ${lcp}, expected the hero photograph`);
    // The pause control stops ambient motion and remembers it on the next page.
    await page.evaluate(() => document.querySelector('.footer [data-motion-toggle]').click());
    await page.goto(base + 'alaska/', { waitUntil: 'networkidle' });
    if ((await page.evaluate(() => document.documentElement.dataset.motion)) !== 'off') fail(`${name} /alaska/`, 'pause motion was not remembered');
    const spinning = await page.evaluate(() => getComputedStyle(document.querySelector('.marquee__track')).animationPlayState);
    if (spinning !== 'paused') fail(`${name} /alaska/`, `marquee still ${spinning} after pause`);
    await page.evaluate(() => document.querySelector('.footer [data-motion-toggle]').click());
    // Route finder: picking a town names it, says how freight gets there and offers the right yard.
    await page.click('.town[data-town="deadhorse"]');
    const way = await page.evaluate(() => [document.querySelector('[data-way-name]').textContent, document.querySelector('[data-way-label]').textContent, document.querySelector('[data-way-call]').getAttribute('href'), document.querySelector('[data-way-quote]').getAttribute('href'), document.querySelector('.finder [data-map]').dataset.mode]);
    if (way[0] !== 'Deadhorse' || way[1] !== 'On the road system' || way[2] !== 'tel:+19074561550' || !/yard=fairbanks&location=Deadhorse/.test(way[3]) || way[4] !== 'road') fail(`${name} /alaska/`, `route finder answered ${JSON.stringify(way)}`);
    // The nine product lines are all on the home page index.
    await page.goto(base, { waitUntil: 'networkidle' });
    const lines = await page.$$eval('.lines .line', (els) => els.length);
    if (lines !== 9) fail(`${name} /`, `${lines} product lines in the index, expected 9`);
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
    // Arriving from the Alaska route finder: yard and place are already filled in.
    await page.goto(base + 'quote/?yard=fairbanks&location=Galena%2C%20AK', { waitUntil: 'networkidle' });
    if ((await page.inputValue('#location')) !== 'Galena, AK' || (await page.inputValue('#yard')) !== 'Fairbanks') fail('desktop /quote/', 'route finder prefill missing');
    // An off-road place arrives with remote shipping chosen, and the note says how freight generally gets there.
    await page.evaluate(() => localStorage.clear());
    await page.goto(base + 'quote/?yard=anchorage&location=Bethel%2C%20AK&delivery=Remote%20Alaska%20shipping', { waitUntil: 'networkidle' });
    if (!(await page.isChecked('input[name=delivery][value="Remote Alaska shipping"]'))) fail('desktop /quote/', 'delivery prefill missing');
    if (!/^Bethel: barge/.test(await page.textContent('[data-way-note]'))) fail('desktop /quote/', 'no note on how freight reaches Bethel');
    await page.evaluate(() => localStorage.clear());
    await page.goto(base + 'quote/?product=Cedar%2C%20Decking%20%26%20Fencing', { waitUntil: 'networkidle' });
    if (!(await page.inputValue('#materials')).startsWith('Cedar, Decking & Fencing:')) fail('desktop /quote/', 'product prefill missing');

    // Credit application: required fields, consent box, routing to the home yard.
    await page.goto(base + 'accounts/', { waitUntil: 'networkidle' });
    for (const sel of ['#dba', '#entity', '#ein', '#license', '#years', '#website', '#title', '#ap_contact', '#buyers', '#limit', '#monthly', '#ref2_company', '#ref2_contact', '#ref3_company', '#ref3_contact', '#bank', '#bank_contact', 'input[name=documents]', 'input[name=po]', 'input[name=tax]'])
      if (!(await page.$(`form[data-form=credit] ${sel}`))) fail('desktop /accounts/', `the application has lost ${sel}`);
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
    await page.fill('#company', 'Draft Co'); await page.fill('#ein', '12-3456789'); await page.fill('#bank', 'First Test Bank'); await page.fill('#bank_contact', 'Teller 555-0100');
    await page.fill('#signature', 'Sig Nature'); await page.fill('#signed', '2026-10-22'); await page.check('#agree');
    const draft = await page.evaluate(() => localStorage.getItem('uresco.draft.credit'));
    if (!draft || !draft.includes('Draft Co') || /12-3456789|First Test Bank|Teller 555|Sig Nature|2026-10-22|"agree"/.test(draft)) fail('desktop /accounts/', `draft handling wrong: ${draft}`);
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });

    // Open/closed status is filled in from each yard's hours.
    await page.goto(base + 'locations/', { waitUntil: 'networkidle' });
    const statuses = await page.$$eval('.yard [data-hours]', (els) => els.filter((e) => !e.hidden && /Open|Closed/.test(e.textContent)).length);
    if (statuses !== 3) fail('desktop /locations/', `open/closed status shown for ${statuses} of 3 yards`);
  }
  await ctx.close();
}

// Shared components at the widths that have broken them.
for (const w of [320, 360, 390, 600, 699, 768, 999]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 844 }, hasTouch: w < 1000 });
  const page = await ctx.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  // Every place name on the delivery map is whole and inside the map.
  const cut = await page.$$eval('.dmap__town, .dmap__yard', (els) => {
    const box = els[0].closest('.dmap__canvas').getBoundingClientRect();
    return els.filter((e) => getComputedStyle(e).display !== 'none').filter((e) => {
      const r = e.querySelector('b').getBoundingClientRect();
      return r.left < box.left || r.right > box.right || r.top < box.top || r.bottom > box.bottom;
    }).map((e) => e.textContent.trim());
  });
  if (cut.length) fail(`${w}px /`, `map labels cut off: ${cut}`);
  // A yard's name, number and call button never run into each other.
  const hit = await page.$$eval('.ystrip__item', (els) => els.some((e) => {
    const c = e.querySelector('.ystrip__city').getBoundingClientRect();
    const n = e.querySelector('.ystrip__num').getBoundingClientRect();
    return n.left < c.right + 2 && n.top < c.bottom - 2 && c.top < n.bottom - 2;
  }));
  if (hit) fail(`${w}px /`, 'yard pill text collides');
  // The product index never cuts off a list, and a row's picture never covers its name when it flips.
  const rows = await page.$$eval('.lines .line', (els) => els.flatMap((row) => {
    row.classList.add('is-on');
    const items = row.querySelector('.line__items');
    const r = document.createRange(); r.selectNodeContents(row.querySelector('.line__name'));
    const name = [...r.getClientRects()];
    const pic = row.querySelector('.line__win').getBoundingClientRect();
    return [items.scrollHeight > items.clientHeight + 1 ? `${row.textContent.trim().slice(0, 20)}: list cut off` : null,
      pic.width && name.some((b) => b.right > pic.left + 1 && b.bottom > pic.top && b.top < pic.bottom) ? `${row.textContent.trim().slice(0, 20)}: picture over the name` : null].filter(Boolean);
  }));
  rows.forEach((m) => fail(`${w}px /`, m));
  // The route finder's map: every name stays whole, including a place someone has just picked.
  await page.goto(base + 'alaska/', { waitUntil: 'networkidle' });
  for (const town of ['', 'juneau', 'unalaska', 'utqiagvik']) {
    if (town) await page.$eval(`.town[data-town="${town}"]`, (b) => b.click());
    await page.waitForTimeout(350);
    const lost = await page.$$eval('.finder .dmap__town, .finder .dmap__yard', (els) => {
      const box = els[0].closest('.dmap__canvas').getBoundingClientRect();
      return els.filter((e) => getComputedStyle(e).display !== 'none').filter((e) => {
        const r = e.querySelector('b').getBoundingClientRect();
        return r.left < box.left - 1 || r.right > box.right + 1 || r.top < box.top - 1 || r.bottom > box.bottom + 1;
      }).map((e) => e.textContent.trim());
    });
    if (lost.length) fail(`${w}px /alaska/${town ? ' ' + town : ''}`, `map labels cut off: ${lost}`);
  }
  await ctx.close();
}

// What every page promises at phone and desktop width.
for (const [name, viewport, mobile] of [['phone', { width: 390, height: 844 }, true], ['desktop', { width: 1440, height: 900 }, false]]) {
  const ctx = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile });
  const page = await ctx.newPage();
  for (const p of paths) {
    await page.goto(base + p, { waitUntil: 'networkidle' });
    // Everything that arrives on scroll does arrive: nothing stays hidden or clipped away.
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < H; y += Math.round(viewport.height * 0.7)) {
      await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
      await page.waitForTimeout(40);
    }
    await page.waitForTimeout(150);
    const unseen = await page.$$eval('[data-reveal]:not(.is-in)', (els) => els.filter((e) => e.offsetParent).map((e) => e.className));
    if (unseen.length) fail(`${name} /${p}`, `never revealed: ${[...new Set(unseen)].slice(0, 4)}`);
    // A stock photograph in a hero or a closing band says what it shows.
    const bare = await page.evaluate(() => ['.phero', '.qband'].filter((s) => { const el = document.querySelector(s); return el && el.querySelector('.win img') && !el.querySelector('.wcap'); }));
    if (bare.length) fail(`${name} /${p}`, `photograph without a caption in ${bare}`);
    if (!mobile) continue;
    // Nothing important under 12px on a phone; controls at least 40px tall on touch screens.
    const problems2 = await page.evaluate(() => {
      const shown = (el) => { const s = getComputedStyle(el), b = el.getBoundingClientRect(); return s.display !== 'none' && s.visibility !== 'hidden' && b.width > 1 && b.height > 1; };
      const out = [];
      const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      while (walk.nextNode()) {
        const t = walk.currentNode, el = t.parentElement;
        if (!t.textContent.trim() || !el || el.closest('.sr-only, script, style, dialog:not([open]), .megamenu, .print-only, sup') || !shown(el)) continue;
        const fs = parseFloat(getComputedStyle(el).fontSize);
        if (fs > 0 && fs < 11.99) out.push(`text under 12px (${fs.toFixed(1)}): ${t.textContent.trim().slice(0, 24)}`);
      }
      for (const el of document.querySelectorAll('main a[href], main button, main summary, main select, .footer a, .footer button, .masthead a, .actionbar a')) {
        if (el.closest('.sr-only') || !shown(el)) continue;
        const after = getComputedStyle(el, '::after');
        const h = Math.max(el.getBoundingClientRect().height, after.content !== 'none' && after.position === 'absolute' ? parseFloat(after.height) || 0 : 0);
        if (h < 39.5) out.push(`control ${Math.round(h)}px tall: ${el.textContent.trim().slice(0, 24)}`);
      }
      return out;
    });
    [...new Set(problems2)].slice(0, 6).forEach((m) => fail(`phone /${p}`, m));
  }
  await ctx.close();
}

// With JavaScript off, every Call, Directions and Menu control still leads somewhere.
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, javaScriptEnabled: false });
  const page = await ctx.newPage();
  for (const p of ['', 'alaska/', 'products/framing-lumber/']) {
    await page.goto(base + p, { waitUntil: 'load' });
    const dead = await page.$$eval('[data-open]', (els) => els.filter((e) => e.tagName !== 'A' || !e.getAttribute('href')).map((e) => e.outerHTML.slice(0, 60)));
    if (dead.length) fail(`no-JS /${p}`, `controls that go nowhere: ${dead}`);
    for (const [sel, want] of [['.actionbar [data-open]', /\/locations\/$/], ['.actionbar [data-open] + [data-open]', /\/locations\/$/], ['.masthead__call', /\/locations\/$/], ['.masthead__menu', /#site-index$/]]) {
      await page.goto(base + p, { waitUntil: 'load' });
      await page.click(sel);
      await page.waitForTimeout(150);
      if (!want.test(page.url())) fail(`no-JS /${p}`, `${sel} went to ${page.url()}`);
      if (want.test('#site-index') && !(await page.isVisible('#site-index'))) fail(`no-JS /${p}`, 'the site index is not on the page');
    }
  }
  await page.goto(base + 'alaska/', { waitUntil: 'load' });
  if (!(await page.isVisible('.way--yards')) || await page.isVisible('.way--live')) fail('no-JS /alaska/', 'the three yards do not replace the route finder');
  await ctx.close();
}

// Products, services and projects: what each page promises.
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  // Index: nine rows, every item linked, the finder narrows them.
  await page.goto(base + 'products/', { waitUntil: 'networkidle' });
  if ((await page.$$('.pl-lines .pl-line')).length !== 9) fail('/products/', 'expected 9 rows in the index');
  if ((await page.$$('.pl-line__items a')).length !== 32) fail('/products/', 'expected 32 linked products');
  await page.fill('#pl-q', 'hangers');
  const found = await page.$$eval('.pl-line:not([hidden])', (els) => els.length);
  if (found !== 1) fail('/products/', `finder: "hangers" left ${found} rows, expected 1`);
  // A line page: the quote links carry the line, and ticking more lines lists them all.
  await page.goto(base + 'products/cedar-decking/', { waitUntil: 'networkidle' });
  const carried = 'quote/?product=Cedar%2C%20Decking%20%26%20Fencing';
  for (const sel of ['.phero .actions a.btn', '.qband .actions a.btn']) {
    if (!(await page.getAttribute(sel, 'href')).endsWith(carried)) fail('/products/cedar-decking/', `${sel} does not carry the product line`);
  }
  await page.$$eval('.pl-pick input', (els) => { els[0].click(); els[1].click(); });
  await page.evaluate(() => { localStorage.clear(); document.querySelector('.pl-load').submit(); });
  await page.waitForURL(/quote\//);
  const asked = (await page.inputValue('#materials')).trim().split('\n').filter(Boolean);
  if (asked.length !== 3 || asked.some((l) => !l.endsWith(':'))) fail('/products/cedar-decking/', `load ticket sent ${JSON.stringify(asked)}`);
  await page.evaluate(() => localStorage.clear());
  // Services: six stops, and every hook on the rack lands on one.
  await page.goto(base + 'services/', { waitUntil: 'networkidle' });
  if ((await page.$$('.sv-stop[id]')).length !== 6) fail('/services/', 'expected 6 service sections');
  const hooks = await page.$$eval('.sv-hook[href^="#"]', (els) => els.map((a) => !!document.querySelector(a.getAttribute('href'))));
  if (hooks.length !== 6 || hooks.includes(false)) fail('/services/', `rack links: ${hooks}`);
  // Projects: a sector pill shows that sector's two kinds of work; a link to a sector opens it.
  await page.goto(base + 'projects/', { waitUntil: 'networkidle' });
  await page.click('.pj-pill[data-filter="Commercial"]');
  const shown = await page.$$eval('.pj-sector:not([hidden])', (els) => [els.length, els.reduce((n, e) => n + e.querySelectorAll('.pj-kind').length, 0)]);
  if (shown[0] !== 1 || shown[1] !== 2) fail('/projects/', `filter showed ${shown[0]} sectors, ${shown[1]} kinds`);
  await page.goto(base + 'projects/#commercial', { waitUntil: 'networkidle' });
  if (!(await page.isVisible('.pj-pill[data-filter="Commercial"][aria-pressed="true"]'))) fail('/projects/#commercial', 'link did not open the sector');
  // A stock photograph in a hero says what it shows.
  for (const p of ['products/', 'services/', 'projects/']) {
    await page.goto(base + p, { waitUntil: 'networkidle' });
    if (!(await page.isVisible('.phero .wcap'))) fail(`/${p}`, 'hero photograph has no caption');
  }
  await ctx.close();
}

// What the reviews found. Each of these shipped once; none may come back.
{
  const open = async (path, width, height, opts = {}) => {
    const ctx = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce', ...opts });
    const page = await ctx.newPage();
    await page.goto(base + path, { waitUntil: 'networkidle' });
    return page;
  };
  const shut = (page) => page.context().close();
  const PHONE = { isMobile: true, hasTouch: true };

  // The credit application prints as a form to sign: two Letter pages, blank or filled, with the choices ticked on a filled copy only.
  const pdfPages = async (page) => Math.max(0, ...[...(await page.pdf({ format: 'Letter', preferCSSPageSize: true, printBackground: true })).toString('latin1').matchAll(/\/Count\s+(\d+)/g)].map((m) => +m[1]));
  const paper = (page) => page.evaluate(() => {
    const on = (s) => { const e = document.querySelector(s); return !!e && getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().height > 0; };
    return { letterhead: on('.letterhead'), yards: on('.ac-return'), refs: on('.refs'), signature: on('#signature'), footer: on('.footer'), hero: on('.phero'), aside: on('.fm-aside'), ticks: [...document.querySelectorAll('.pbox.is-on')].map((b) => b.textContent.trim()).join() };
  });
  {
    const page = await open('accounts/', 1440, 900);
    await page.emulateMedia({ media: 'print' });
    const blank = await paper(page);
    if (!blank.letterhead || !blank.yards || !blank.refs || !blank.signature || blank.footer || blank.hero || blank.aside || blank.ticks) fail('print /accounts/', `blank copy: ${JSON.stringify(blank)}`);
    await page.emulateMedia({ media: null });
    const empty = await pdfPages(page);
    if (empty !== 2) fail('print /accounts/', `blank application is ${empty} pages, expected 2`);
    for (const [id, v] of [['company', 'Test Framing LLC'], ['ein', '12-3456789'], ['address', '1 Main St, Kent WA'], ['name', 'Pat Builder'], ['phone', '253-555-0100'], ['email', 'pat@example.com'], ['buyers', 'Pat\nSam\nLee'], ['ref1_company', 'Acme Supply'], ['ref1_contact', 'Lee 253-555-0199'], ['bank', 'Test Bank'], ['signature', 'Pat Builder'], ['signed', '2026-10-22']]) await page.fill('#' + id, v);
    await page.selectOption('#entity', 'LLC'); await page.selectOption('#yard', 'Fairbanks'); await page.check('#agree');
    await page.emulateMedia({ media: 'print' });
    const filled = await paper(page);
    if (filled.ticks !== 'LLC,Fairbanks') fail('print /accounts/', `filled copy ticks [${filled.ticks}], expected LLC and Fairbanks`);
    if (!(await page.$eval('.seg input:checked', (i) => getComputedStyle(i).boxShadow !== 'none'))) fail('print /accounts/', 'a chosen radio prints empty');
    await page.emulateMedia({ media: null });
    const full = await pdfPages(page);
    if (full !== 2) fail('print /accounts/', `filled application is ${full} pages, expected 2`);
    // After sending, the notice offers a paper copy and the paper copy is still the form.
    await page.click('form[data-form=credit] button[type=submit]');
    await page.waitForTimeout(300);
    if (!(await page.isVisible('[data-done] [data-print]'))) fail('/accounts/', 'no way to print what was sent');
    if (await pdfPages(page) !== 2) fail('print /accounts/', 'printing after submit is not the two-page form');
    await shut(page);
  }

  // Every other page prints whole: nothing waits for a scroll, and an inner page keeps its headline.
  for (const p of ['alaska/', 'services/', 'products/framing-lumber/']) {
    const page = await open(p, 1280, 900, { reducedMotion: 'no-preference' });
    await page.emulateMedia({ media: 'print' });
    const r = await page.evaluate(() => ({ blank: [...document.querySelectorAll('[data-reveal]')].filter((e) => getComputedStyle(e).opacity !== '1').length, h1: !!document.querySelector('h1').offsetParent }));
    if (r.blank || !r.h1) fail(`print /${p}`, `${r.blank} blocks print blank, h1 ${r.h1 ? 'shown' : 'missing'}`);
    await shut(page);
  }

  // Locations: nothing paints over the details, and the pills keep clear of the next column.
  for (const w of [768, 860, 1024, 1100, 1280]) {
    const page = await open('locations/', w, 900);
    const hit = await page.evaluate(() => [...document.querySelectorAll('.lc-band')].flatMap((band) => {
      band.scrollIntoView({ block: 'center' });
      const rows = band.querySelector('.lc-rows'), out = [];
      const pills = Math.max(...[...band.querySelectorAll('.lc-yard__call .btn')].map((b) => b.getBoundingClientRect().right));
      if (rows.getBoundingClientRect().left < pills && rows.getBoundingClientRect().top < band.querySelector('.lc-yard__call').getBoundingClientRect().bottom - 4) out.push(`pills run into the details on ${band.id}`);
      const walk = document.createTreeWalker(rows, NodeFilter.SHOW_TEXT);
      while (walk.nextNode()) {
        if (!walk.currentNode.textContent.trim()) continue;
        const g = document.createRange(); g.selectNodeContents(walk.currentNode);
        const box = g.getBoundingClientRect(), at = document.elementFromPoint(box.right - 2, box.top + box.height / 2);
        if (at && !rows.contains(at)) out.push(`${walk.currentNode.textContent.trim().slice(0, 20)} on ${band.id} is covered`);
      }
      return out;
    }));
    hit.forEach((m) => fail(`${w}px /locations/`, m));
    await shut(page);
  }

  // A photo credit never lies under the tilted tape or the next band.
  for (const [p, w, h] of [['about/', 900, 800], ['about/', 1440, 900], ['about/', 2560, 1440], ['products/', 1920, 1080], ['products/', 2560, 1440], ['services/', 1366, 768], ['services/', 2560, 1440], ['products/hardware-supplies/', 1920, 900]]) {
    const page = await open(p, w, h);
    const under = await page.evaluate(() => [...document.querySelectorAll('.wcap')].filter((c) => c.offsetParent).filter((c) => {
      c.scrollIntoView({ block: 'center' });
      const b = c.getBoundingClientRect();
      for (let i = .05; i < 1; i += .1) for (const j of [.1, .5, .9]) { const at = document.elementFromPoint(b.left + b.width * i, b.top + b.height * j); if (at && !c.contains(at)) return true; }
      return false;
    }).map((c) => c.textContent.trim().slice(0, 30)));
    if (under.length) fail(`${w}x${h} /${p}`, `caption covered: ${under}`);
    await shut(page);
  }

  // Pacific Northwest: the latitudes on the tape stay on the screen.
  for (const w of [320, 360, 900, 1024]) {
    const page = await open('pacific-northwest/', w, 900);
    const right = await page.$$eval('.pn-north .pn-tape *', (els) => Math.max(...els.filter((e) => !e.children.length && e.textContent.trim()).map((e) => { const g = document.createRange(); g.selectNodeContents(e); return g.getBoundingClientRect().right; })));
    if (right > w) fail(`${w}px /pacific-northwest/`, `tape runs ${Math.ceil(right - w)}px off the screen`);
    await shut(page);
  }

  // The route finder answers the question asked.
  {
    const page = await open('alaska/', 1440, 900);
    const links = await page.evaluate(() => ['.phero .actions a.btn', '.qband .actions a.btn', '[data-way-quote]'].map((s) => document.querySelector(s).getAttribute('href')));
    if (!links.every((h) => /yard=anchorage/.test(h))) fail('/alaska/', `a remote quote starts at the wrong yard: ${links}`);
    const find = async (t) => { await page.fill('#finder-input', t); await page.press('#finder-input', 'Enter'); await page.waitForTimeout(120); return page.evaluate(() => ({ name: document.querySelector('[data-way-name]').textContent, region: document.querySelector('[data-way-region]').textContent, card: document.querySelector('.way--live').textContent, quote: document.querySelector('[data-way-quote]').getAttribute('href'), yard: document.querySelector('[data-way-yard]').textContent })); };
    for (const [t, want] of [['Bethel AK', 'Bethel'], ['Kotzebue, AK', 'Kotzebue'], ['barrow ak', 'Utqiaġvik']]) { const a = await find(t); if (a.name !== want) fail('/alaska/ finder', `"${t}" answered ${a.name}`); }
    const bethel = await find('Bethel');
    if (!/Complete building packages go here/.test(bethel.card)) fail('/alaska/ finder', 'an off-road card does not say a package can go there');
    if (/Alaska, Alaska/.test((await find('Sitka')).region)) fail('/alaska/ finder', 'region reads "Alaska, Alaska"');
    if ((await find('Utqiaġvik')).yard !== 'Anchorage') fail('/alaska/ finder', 'an off-road place does not go to Anchorage');
    if (/pick-?up|Truck from/i.test((await find('Deadhorse')).card)) fail('/alaska/ finder', 'a road place promises pick-up or a route');
    const unlisted = await find('Kwigillingok');
    if (!/yard=anchorage/.test(unlisted.quote) || !/delivery=Remote/.test(unlisted.quote)) fail('/alaska/ finder', `unlisted place quotes as ${unlisted.quote}`);
    // The towns on the map are not dead taps.
    await page.click('.finder .dmap__pick[data-place-pick="Nome"]');
    await page.waitForTimeout(150);
    if ((await page.textContent('[data-way-name]')) !== 'Nome') fail('/alaska/ finder', 'clicking a town on the map does nothing');
    // The answer lands where it can be read.
    await page.goto(base + 'alaska/#lookup', { waitUntil: 'networkidle' });
    await find('Bethel');
    await page.waitForTimeout(700);
    const box = await page.$eval('.way--live', (c) => { const r = c.getBoundingClientRect(); return [r.top, r.bottom, innerHeight]; });
    if (box[0] < 0 || box[1] > box[2]) fail('/alaska/ finder', `answer off screen: ${box.map(Math.round)}`);
    await shut(page);
  }

  // Forms: a tray adds, a corrected prefill survives a reload, and a request handed to the email app is not thrown away.
  {
    const page = await open('quote/', 1440, 900);
    const file = (name) => ({ name, mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4') });
    await page.setInputFiles('input[type=file]', file('one.pdf'));
    await page.setInputFiles('input[type=file]', file('two.pdf'));
    if ((await page.$$eval('[data-files] li', (l) => l.length)) !== 2) fail('/quote/', 'a second pick replaced the first file');
    await page.goto(base + 'quote/?yard=anchorage&location=Bethel%2C%20AK&delivery=Remote%20Alaska%20shipping', { waitUntil: 'networkidle' });
    await page.fill('#location', 'Kwethluk, AK'); await page.selectOption('#yard', 'Fairbanks');
    await page.waitForTimeout(100);
    await page.reload({ waitUntil: 'networkidle' });
    if ((await page.inputValue('#location')) !== 'Kwethluk, AK' || (await page.inputValue('#yard')) !== 'Fairbanks') fail('/quote/', 'a reload put the link\'s prefill back over what was corrected');
    for (const [id, v] of [['name', 'Pat'], ['phone', '907-555-0100'], ['email', 'p@example.com']]) await page.fill('#' + id, v);
    await page.click('form[data-form] button[type=submit]');
    await page.waitForTimeout(300);
    await page.reload({ waitUntil: 'networkidle' });
    if ((await page.inputValue('#name')) !== 'Pat') fail('/quote/', 'the draft was thrown away at the mail hand-off');
    await shut(page);
  }

  // Keyboard: Escape dismisses the Products menu, and focus never hides behind the action bar.
  {
    const page = await open('', 1440, 900);
    await page.focus('.nav__item--menu > .nav__link');
    await page.waitForTimeout(350);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(350);
    const m = await page.evaluate(() => [getComputedStyle(document.querySelector('.megamenu')).visibility, document.querySelector('.nav__item--menu > .nav__link').getAttribute('aria-expanded'), document.activeElement.textContent.trim().split(/\s/)[0]]);
    if (m[0] !== 'hidden' || m[1] !== 'false' || m[2] !== 'Products') fail('/ menu', `after Escape: ${m}`);
    await shut(page);
    const phone = await open('', 390, 844);
    let hidden = 0;
    for (let i = 0; i < 70; i++) {
      await phone.keyboard.press('Tab');
      hidden += await phone.evaluate(() => { const e = document.activeElement, bar = document.querySelector('.actionbar'); if (!e || e === document.body || bar.contains(e)) return 0; const r = e.getBoundingClientRect(), b = bar.getBoundingClientRect(); return r.bottom > b.top && r.top < b.bottom && b.height > 0 ? 1 : 0; });
    }
    if (hidden) fail('390px /', `${hidden} focus stops hidden behind the action bar`);
    await shut(phone);
  }

  // Every part of the masthead is still reachable, including Pacific Northwest.
  {
    const page = await open('', 1440, 900);
    if (!(await page.$('.nav__link[href*="pacific-northwest"]'))) fail('/', 'Pacific Northwest is missing from the masthead');
    if (!(await page.$('main a[href*="pacific-northwest"]'))) fail('/', 'the home page does not lead to Pacific Northwest');
    if (await page.$('.megamenu__grid img')) fail('/', 'the Products menu has gone back to photo thumbnails');
    await shut(page);
  }

  // A fourth yard, with a long name and no hours, still builds and still fits.
  {
    const tmp = mkdtempSync(join(tmpdir(), 'uresco-yard-'));
    try {
      cpSync(join(ROOT, 'src'), join(tmp, 'src'), { recursive: true });
      cpSync(join(ROOT, 'build.mjs'), join(tmp, 'build.mjs'));
      cpSync(join(ROOT, 'package.json'), join(tmp, 'package.json'));
      const f = join(tmp, 'src/data/locations.mjs');
      const data = readFileSync(f, 'utf8');
      const end = data.indexOf('\n];', data.indexOf('export const LOCATIONS'));
      writeFileSync(f, data.slice(0, end) + `\n  { id: 'north', city: 'North Anchorage Port', state: 'AK', region: 'Alaska', role: 'Test', street: '1 Test St', zip: '99501', phone: '(907) 563-2500', fax: '(907) 561-2076', email: 'anchorage@uresco.com', hours: null, page: 'alaska/', photo: 'rainier-tacoma', photoCaption: 'Test', geo: { lat: 61.3, lng: -149.8 } },` + data.slice(end));
      execFileSync(process.execPath, ['build.mjs'], { cwd: tmp, env: { ...process.env, OUT: join(tmp, 'docs') }, stdio: 'pipe' });
      const other = serve(join(tmp, 'docs'));
      for (const w of [390, 1024, 1440]) {
        const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
        const page = await ctx.newPage();
        await page.goto(`http://127.0.0.1:${other.address().port}/locations/`, { waitUntil: 'networkidle' });
        const r = await page.evaluate(() => ({ wide: document.documentElement.scrollWidth, row: [...document.querySelectorAll('#north .lc-rows *')].some((e) => /^Hours/.test(e.textContent.trim())) }));
        if (r.wide > w) fail(`${w}px 4th yard`, `page is ${r.wide}px wide`);
        if (r.row) fail(`${w}px 4th yard`, 'a yard with no hours prints an Hours row');
        await ctx.close();
      }
      other.close();
    } catch (e) { fail('4th yard', String(e.stderr || e.message).split('\n')[0]); }
    rmSync(tmp, { recursive: true, force: true });
  }

  // Text at 200%: nothing makes the page wider than the screen.
  const big = await chromium.launch({ args: ['--blink-settings=defaultFontSize=32'] });
  for (const [w, mobile] of [[320, true], [390, true], [1280, false]]) {
    const ctx = await big.newContext({ viewport: { width: w, height: 844 }, reducedMotion: 'reduce', isMobile: mobile, hasTouch: mobile });
    const page = await ctx.newPage();
    for (const p of paths) {
      await page.goto(base + p, { waitUntil: 'networkidle' });
      const wide = await page.evaluate(() => document.documentElement.scrollWidth);
      if (wide > w) fail(`200% text ${w}px /${p}`, `page is ${wide}px wide`);
    }
    await ctx.close();
  }
  await big.close();
}

// The yard phone numbers are the point of the hero: on common screens they show without scrolling.
// Hinted text runs wider and wraps sooner, so check with font hinting on as well. Only the
// headless shell (Playwright's default browser) obeys this flag; full Chromium ignores it.
const hinted = await chromium.launch({ args: ['--font-render-hinting=full'] });
for (const [mode, b] of [['', browser], [' hinted', hinted]]) {
  for (const [w, h] of [[1024, 768], [1280, 720], [1280, 800], [1366, 768], [1440, 900], [1536, 864], [1920, 1080]]) {
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
await browser.close();
server.close();

if (problems.length) {
  console.log(`\n${problems.length} problem(s):\n` + problems.map((p) => '  ✗ ' + p).join('\n'));
  process.exit(1);
}
console.log(`browser: ${paths.length} pages × 5 widths clean; quote form, credit application and its print copy, hours, dialogs, shared components, products, services, projects, the route finder, the review findings, 200% text and the fold work\nALL CHECKS PASSED`);
