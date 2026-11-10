// Site checks: run after `node build.mjs`.  npm run check
//  1. Static: every page has a title, description, one <h1>, alt on every <img>, unique ids,
//     and every internal link, image and asset resolves to a file in docs/.
//  2. Browser: every page loads in Chromium at five widths with no errors, no horizontal
//     scroll and no stretched hero photo, and both forms validate and hand off.
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, dirname, resolve, relative } from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { createRequire } from 'module';
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
  /stock varies/i, /last sailings/i, /estimators,? designers and drivers/i, /\bon (the )?puget sound\b/i, /priced and ready to order/i, /carrier bookings/i, /ships together/i, /\bbuilds? the take-?off/i];
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
  await page.click('.pj-pill[data-filter="Institutional"]');
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
console.log(`browser: ${paths.length} pages × 5 widths clean; quote form, credit application, hours, dialogs, shared components, products, services, projects and the fold work\nALL CHECKS PASSED`);
