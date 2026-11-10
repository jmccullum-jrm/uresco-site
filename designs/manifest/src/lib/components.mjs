import { readFileSync } from 'fs';
import { html, raw } from './html.mjs';
import { icon } from './icons.mjs';
import { drawing, glyph } from './drawings.mjs';
import { LOCATIONS, tel, mapsUrl, hoursAttr, tzLabel } from '../data/locations.mjs';
import { CATEGORIES, BRANDS } from '../data/products.mjs';

const PHOTOS = JSON.parse(readFileSync(new URL('../data/photos.generated.json', import.meta.url), 'utf8'));
const MAP = JSON.parse(readFileSync(new URL('../data/map.json', import.meta.url), 'utf8'));

export const photo = (key) => {
  const p = PHOTOS[key];
  if (!p) throw new Error(`Unknown photo "${key}" — add it to scripts/photos.json and run npm run images`);
  return p;
};

// "Which yard should I call?" — the guidance from the old site, used on the board, the call sheet and the yard cards.
export const YARD_FOR = Object.fromEntries(LOCATIONS.map((l) => [l.id, l.callFor]));
// The highlighter must not strand a short word at a line end, so a leading "the", "a", "and"… is bound to the word after it.
export const tieEm = (t) => String(t).replace(/<em>((?:(?:a|an|and|the|of|or|to|in|on|at|by|for|our)\s+)+)/gi, (m, words) => `<em>${words.trim().split(/\s+/).join('&nbsp;')}&nbsp;`);
export const lineNo = (i) => String(i + 1).padStart(3, '0');
export const two = (i) => String(i + 1).padStart(2, '0');
// A product's name without the trademark sign. The sign is kept on the product pages, which are the full list, and nowhere else.
const plain = (s) => s.replace(/[®™]/g, '');
export const itemName = (s) => plain(s).replace(/\s*\(.*?\)/, '');

// Quote links carry what the visitor was looking at: the form starts from product, yard and location.
export const quoteHref = (ctx, { product, yard, location, delivery, hash = '' } = {}) => {
  const q = Object.entries({ product, yard, location, delivery }).filter(([, v]) => v).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
  return `${ctx.u('quote/')}${q ? '?' + q : ''}${hash}`;
};

const setOf = (ctx, key, widths) => widths.map((w) => `${ctx.u(`assets/img/${key}-${w}.webp`)} ${w}w`).join(', ');

// Responsive image. `sizes` must describe the width the image is really drawn at, including any
// extra width object-fit: cover needs in a tall box.
export const picture = (ctx, key, { sizes = '100vw', cls = '', eager = false, alt } = {}) => {
  const p = photo(key);
  const mid = p.widths.find((w) => w >= 1200) || p.widths[p.widths.length - 1];
  return html`<img class="${cls}" src="${ctx.u(`assets/img/${key}-${mid}.webp`)}" srcset="${setOf(ctx, key, p.widths)}" sizes="${sizes}" width="${p.width}" height="${p.height}" alt="${alt ?? p.alt}"${raw(eager ? ' fetchpriority="high"' : ' loading="lazy"')} decoding="async"${raw(` style="${p.focal ? `object-position:${p.focal};` : ''}background-color:${p.color || '#22211e'}"`)}>`;
};

// The plate is 4:3 beside the title on wide screens and 3:2 under it on narrow ones; a 3:2 photograph covers both.
export const PHERO_SIZES = '(min-width: 1000px) min(47vw, 620px), 100vw';

// Preload hint for a hero photograph. The default matches the page-hero plate; pass `sizes` for anything else.
export const preloadFor = (ctx, key, { sizes = PHERO_SIZES } = {}) => [{ srcset: setOf(ctx, key, photo(key).widths), sizes }];

// Live open/closed badge; filled in by the script in the yard's own time zone. Hidden without JS.
export const openStatus = (l) => (l.hours ? html`<span class="status" data-hours="${hoursAttr(l)}" hidden></span>` : '');

// ---------- Section head ----------
// A ruled bar (detail bubble, label, note at the far end), then the headline with its supporting text beside it.
export const sectionHead = ({ no, eyebrow, title, lede, action, meta, level = 2 }) => html`
  <header class="shead${lede || action ? '' : ' shead--solo'}" data-reveal>
    <div class="shead__bar">
      ${no ? html`<span class="bub num" aria-hidden="true">${no}</span>` : ''}
      ${eyebrow ? html`<p class="label shead__label">${eyebrow}</p>` : ''}
      ${meta ? html`<p class="label shead__meta">${meta}</p>` : ''}
    </div>
    <div class="shead__grid">
      ${raw(`<h${level} class="h2">`)}${raw(tieEm(title))}${raw(`</h${level}>`)}
      ${lede || action ? html`<div class="shead__aside">
        ${lede ? html`<p class="lede">${lede}</p>` : ''}
        ${action || ''}
      </div>` : ''}
    </div>
  </header>`;

// ---------- Photograph as a plate ----------
// Printed in two inks (see .plate in the stylesheet), trimmed with crop marks and captioned as a figure,
// so a stock picture is never mistaken for Uresco's own yard.
export const plate = (ctx, key, { fig = '1', caption, more = '', cls = '', sizes, eager = false, alt } = {}) => {
  const p = photo(key);
  return html`
  <figure class="plate ${cls}">
    <div class="plate__frame"><div class="plate__img">${picture(ctx, key, { sizes, eager, alt })}</div></div>
    <figcaption class="plate__cap"><span class="label label--blue">Fig. ${fig}</span><span>${caption || p.alt}${more ? html` <span class="plate__more">${more}</span>` : ''}</span>${p.credit && !/Uresco/.test(p.credit) ? html`<span class="plate__credit">Photo: ${p.credit}</span>` : ''}</figcaption>
  </figure>`;
};

// ---------- Latitude rule ----------
// The distance this company covers, drawn as a dimension line: five real latitudes on one scale.
// These are the city latitudes in FACTS.md; the map's yard labels use the same figures.
const LATS = [
  { name: 'Kent', lat: 47.4, row: 'a' },
  { name: 'Sitka', lat: 57.1, row: 'b' },
  { name: 'Anchorage', lat: 61.2, row: 'a' },
  { name: 'Fairbanks', lat: 64.8, row: 'b' },
  { name: 'Utqiaġvik', lat: 71.3, row: 'a' },
];
const LAT0 = 46, LAT1 = 72.5;
const latPct = (lat) => (((lat - LAT0) / (LAT1 - LAT0)) * 100).toFixed(2);
export const latRule = ({ highlight, note = '' } = {}) => html`
  <div class="latrule" role="img" aria-label="Latitude scale. ${LATS.map((p) => `${p.name} ${p.lat} degrees north`).join(', ')}.">
    <div class="latrule__track" aria-hidden="true">
      ${highlight ? html`<span class="latrule__hl" style="left:${latPct(highlight[0])}%;right:${(100 - latPct(highlight[1])).toFixed(2)}%"></span>` : ''}
      ${LATS.map((p, i) => html`<span class="latrule__pt latrule__pt--${p.row}${i === 0 ? ' is-first' : ''}${i === LATS.length - 1 ? ' is-last' : ''}" style="left:${latPct(p.lat)}%"><b>${p.name}</b><i class="num">${p.lat.toFixed(1)}° N</i></span>`)}
    </div>
  </div>
  ${note ? html`<p class="latrule__note">${note}</p>` : ''}`;

// ---------- The board ----------
// Three yards on a departures board: local time (hours and minutes), open or closed, and the number. Every row is a tel: link.
// Characters are set in fixed cells so the script can write them; without the script they are simply the text.
const cells = (s) => raw([...s].map((ch) => `<span class="fl${ch === ' ' ? ' fl--sp' : ''}">${ch === ' ' ? '&nbsp;' : ch}</span>`).join(''));
export const TZ_ABBR = { 'America/Los_Angeles': 'PT', 'America/Anchorage': 'AKT' };
export const board = (ctx, { id = 'board' } = {}) => html`
  <section class="board" aria-labelledby="${id}-t">
    <div class="board__head">
      <h2 class="board__title" id="${id}-t">Call a yard <span>Three yards, one team</span></h2>
      <p class="board__live js-only" aria-hidden="true"><i></i>Live · local time at each yard</p>
    </div>
    <div class="board__cols" aria-hidden="true"><span>No.</span><span>Yard</span><span>Call this yard for</span><span>Local time</span><span>Status</span><span>Call</span></div>
    <ol class="board__rows">
      ${LOCATIONS.map((l, i) => html`<li>
        <a class="board__row" href="${tel(l.phone)}">
          <span class="board__no num" aria-hidden="true">${two(i)}</span>
          <span class="board__yard">${l.city}<small>, ${l.state}</small></span>
          <span class="board__for">${YARD_FOR[l.id]}</span>
          <span class="board__clock js-only">${l.hours ? html`<span class="board__time" data-clock="${l.hours.tz}" aria-hidden="true">${cells('--:--')}</span><abbr class="board__tz" title="${tzLabel(l)}">${TZ_ABBR[l.hours.tz]}</abbr>` : ''}</span>
          <span class="board__status">${openStatus(l)}</span>
          <span class="board__num"><span class="sr-only">${l.phone}</span><span class="board__digits" data-flap aria-hidden="true">${cells(l.phone)}</span></span>
          <span class="board__go" aria-hidden="true">${icon('phone', { size: 18 })}</span>
        </a>
      </li>`)}
    </ol>
  </section>`;

// ---------- The manifest ----------
// Products as a load manifest. Each line is a <details>: on a phone it opens in place; on a wide screen the open
// line's drawing sits in the plate beside the list. One markup, no script needed (the script only adds hover).
export const manifest = (ctx, { id = 'mf' } = {}) => html`
  <div class="mfwrap"><div class="manifest" data-manifest>
    <div class="manifest__cols label" aria-hidden="true"><span>Line</span><span>Product line</span><span>Items</span></div>
    ${CATEGORIES.map((c, i) => html`
    <details class="mline" name="${id}"${i === 0 ? html` open` : ''}>
      <summary class="mline__row">
        <span class="mline__no num">${lineNo(i)}</span>
        <span class="mline__glyph">${glyph(c.slug, { size: 36 })}</span>
        <h3 class="mline__name">${c.name}</h3>
        <span class="mline__sum">${c.items.map(([name]) => plain(name)).join(' · ')}</span>
        <span class="mline__qty num">${String(c.items.length).padStart(2, '0')}<span class="sr-only"> items</span></span>
        <span class="mline__mark" aria-hidden="true"></span>
      </summary>
      <div class="mline__panel">
        <div class="dwg">
          <p class="dwg__bar label"><span>${c.short}</span><span class="dwg__nts">Typical · not to scale</span></p>
          <div class="dwg__canvas">${drawing(c.slug, { id })}</div>
          <p class="dwg__note">Typical sizes shown. Ask your yard what is in stock.</p>
        </div>
        <div class="mline__body">
          <p class="mline__lede">${c.lede}</p>
          <ul class="mline__items">${c.items.map(([name]) => html`<li>${plain(name)}</li>`)}</ul>
          <div class="mline__links">
            <a class="btn btn--sm btn--dark" href="${ctx.u('products/' + c.slug + '/')}">See ${c.short} ${icon('arrow', { size: 16 })}</a>
            <a class="link" href="${quoteHref(ctx, { product: c.name })}">Quote this line</a>
          </div>
        </div>
      </div>
    </details>`)}
    <a class="mline__ask" href="${ctx.u('quote/')}">
      <span class="mline__no num">+</span>
      <span><b>Not on the list?</b> We also carry a large variety of other building materials. Ask your yard.</span>
      ${icon('arrow', { size: 18 })}
    </a>
    <p class="brandline"><span class="label">Brands we carry</span>${BRANDS.map((b) => html`<span>${b}</span>`)}</p>
  </div></div>`;

// Compact packing list: product lines as links with their glyphs and every item on the line (inner pages).
// `only` is a list of categories to show instead of all nine.
export const packingList = (ctx, { only, cls = '' } = {}) => html`
  <ol class="plist ${cls}">
    ${(only || CATEGORIES).map((c) => html`<li><a href="${ctx.u('products/' + c.slug + '/')}">
      <span class="plist__no num">${lineNo(CATEGORIES.indexOf(c))}</span>
      <span class="plist__glyph">${glyph(c.slug, { size: 40 })}</span>
      <span class="plist__name">${c.short}</span>
      <span class="plist__items">${c.items.map(([n]) => plain(n)).join(' · ')}</span>
      ${icon('arrow', { size: 16 })}
    </a></li>`)}
  </ol>`;

// ---------- Sequence ----------
// Stations on one line: a process, drawn the way a dimension string is. A step with an href is one link, edge to edge.
export const sequence = (steps, { cls = '' } = {}) => html`
  <ol class="seq ${cls}" data-reveal style="--n:${steps.length}">
    ${steps.map((s) => html`<li class="seq__step">
      <span class="seq__no num">${s.no}</span>
      <h3 class="seq__name">${s.href ? html`<a href="${s.href}">${s.name}</a>` : s.name}</h3>
      <p>${s.body}</p>
      ${s.href ? html`<a class="link" href="${s.href}" aria-hidden="true" tabindex="-1">${s.link || 'More'} ${icon('arrow', { size: 14 })}</a>` : ''}
    </li>`)}
  </ol>`;

// ---------- Page hero ----------
// `media` takes any object in place of the photograph (a drawing plate); `cls` is added to the section; `pre` goes above the
// headline and `after` under the actions; `sheet` is the page's name in the breadcrumb and `meta` the short reference at the
// right-hand end of the sheet bar.
export const pageHero = (ctx, { sheet, meta, title, lede, photoKey, media = '', cls = '', pre = '', after = '', actions = '', crumbs = [], caption, fig = '1', below = '' }) => html`
  <section class="phero ${cls}">
    <div class="wrap">
      <div class="sheetbar">
        <nav class="crumbs" aria-label="Breadcrumb"><ol>
          <li><a href="${ctx.u('')}">Home</a></li>
          ${crumbs.length ? crumbs.map(([label, href]) => html`<li>${href ? html`<a href="${ctx.u(href)}">${label}</a>` : html`<span aria-current="page">${label}</span>`}</li>`) : html`<li><span aria-current="page">${sheet}</span></li>`}
        </ol></nav>
        ${meta ? html`<p class="label sheetbar__meta">${meta}</p>` : ''}
      </div>
      <div class="phero__grid${photoKey || media ? '' : ' phero__grid--plain'}">
        <div class="phero__inner">
          ${pre}
          <h1 class="display">${raw(tieEm(title))}</h1>
          ${lede ? html`<p class="lede phero__lede">${lede}</p>` : ''}
          ${actions ? html`<div class="actions">${actions}</div>` : ''}
          ${after}
        </div>
        ${media || (photoKey ? plate(ctx, photoKey, { cls: 'phero__media', fig, caption, eager: true, sizes: PHERO_SIZES }) : '')}
      </div>
      ${below}
    </div>
  </section>`;

// ---------- Take-off band (the quote call to action) ----------
// A blank take-off sheet with the quantity column highlighted: the column Uresco helps fill in. On a product line's page its rows are that line's items.
// `product`, `yard` and `location` go on both buttons, so the form starts with what the visitor was looking at.
const TAKEOFF = [['Dimensional lumber, studs & plates', 'EA'], ['I-joists, rim & beams', 'LF'], ['Wall & roof sheathing', 'SHT'], ['Hangers, ties & fasteners', 'BOX'], ['Windows & exterior doors', 'EA']];
const sheetRows = (product) => {
  const c = product && CATEGORIES.find((x) => x.name === product);
  if (!c) return TAKEOFF;
  const rows = c.items.slice(0, TAKEOFF.length).map(([n]) => [itemName(n), '']);
  while (rows.length < TAKEOFF.length) rows.push(['', '']);
  return rows;
};
export const quoteBand = (ctx, { title = 'Send the plans. <em>We’ll help with the take-off.</em>', body = 'Send drawings or a list. We will help with the take-off and the estimate.', eyebrow = 'Estimates & take-offs', no, product, yard, location } = {}) => html`
  <section class="takeoff">
    <div class="wrap takeoff__grid">
      <div class="takeoff__copy">
        <div class="shead__bar">${no ? html`<span class="bub num" aria-hidden="true">${no}</span>` : ''}<p class="label shead__label">${eyebrow}</p></div>
        <h2 class="h2">${raw(tieEm(title))}</h2>
        <p class="lede">${body}</p>
        <div class="actions">
          <a class="btn" href="${quoteHref(ctx, { product, yard, location })}">Request a quote ${icon('arrow', { size: 18 })}</a>
          <a class="btn btn--line" href="${quoteHref(ctx, { product, yard, location, hash: '#plans' })}">${icon('upload', { size: 18 })} Send plans</a>
        </div>
      </div>
      <div class="tsheet" aria-hidden="true" data-reveal>
        <div class="tsheet__head"><b>Material take-off</b><span>Job <i></i></span><span>Ship to <i></i></span></div>
        <div class="tsheet__cols"><span>Ln</span><span>Description</span><span>Unit</span><span>Qty</span></div>
        ${sheetRows(product).map(([d, u], i) => html`<div class="tsheet__row"><span>${two(i)}</span><span>${d || raw('&nbsp;')}</span><span>${u}</span><span class="tsheet__qty"></span></div>`)}
        <div class="tsheet__row tsheet__row--more"><span>+</span><span>and every line after it</span><span></span><span class="tsheet__qty"></span></div>
        <p class="tsheet__note"><span>We help fill in this column</span></p>
      </div>
    </div>
  </section>`;

// ---------- Yard card ----------
// A yard as a specification sheet. A yard shows only whether it is open now, never its hours:
// those are placeholders and print on the Locations page alone.
export const yardCard = (ctx, l, { headingLevel = 3 } = {}) => {
  const H = `h${headingLevel}`;
  const i = LOCATIONS.indexOf(l);
  return html`
  <article class="yard" id="${l.id}">
    <header class="yard__head">
      <p class="label"><span class="num">Yard ${two(i)}</span> · ${l.region}</p>
      ${raw(`<${H} class="yard__city">`)}${l.city}<span>, ${l.state}</span>${raw(`</${H}>`)}
      <p class="yard__for">Call for: ${YARD_FOR[l.id]}</p>
    </header>
    <a class="yard__phone num" href="${tel(l.phone)}">${l.phone}</a>
    <dl class="yard__lines">
      ${l.tollFree ? html`<div><dt>Toll-free</dt><dd><a class="num" href="${tel(l.tollFree)}">${l.tollFree}</a></dd></div>` : ''}
      <div><dt>Email</dt><dd><a href="mailto:${l.email}">${l.email}</a></dd></div>
      <div><dt>Address</dt><dd><address>${l.street}<br>${l.city}, ${l.state} ${l.zip}</address></dd></div>
      ${l.fax ? html`<div><dt>Fax</dt><dd class="num">${l.fax}</dd></div>` : ''}
      ${l.mailing ? html`<div><dt>Mail</dt><dd>${l.mailing}</dd></div>` : ''}
      ${l.hours ? html`<div class="yard__now"><dt>Local time</dt><dd><span class="num"><span data-clock="${l.hours.tz}">--:--</span> <abbr title="${tzLabel(l)}">${TZ_ABBR[l.hours.tz]}</abbr></span>${openStatus(l)}</dd></div>` : ''}
    </dl>
    <div class="yard__actions">
      <a class="btn btn--sm" href="${tel(l.phone)}">${icon('phone', { size: 16 })} Call ${l.city}</a>
      <a class="btn btn--sm btn--line" href="${mapsUrl(l)}" target="_blank" rel="noopener">${icon('directions', { size: 16 })} Directions</a>
      <a class="link yard__quote" href="${quoteHref(ctx, { yard: l.id })}">Quote from ${l.city} ${icon('arrow', { size: 14 })}</a>
    </div>
  </article>`;
};

// ---------- Yard strip ----------
// Three yards as three numbers, each cell one tel: link: the light alternative to three yard cards on an inner page.
export const yardStrip = (ctx, { cls = '' } = {}) => html`
  <ul class="ystrip ${cls}">
    ${LOCATIONS.map((l, i) => html`<li>
      <a class="ystrip__cell" href="${tel(l.phone)}">
        <span class="ystrip__top"><span class="label"><span class="ystrip__ref"><span class="num">Yard ${two(i)}</span> · </span>${l.city}, ${l.state}</span>${openStatus(l)}</span>
        <span class="ystrip__for">${YARD_FOR[l.id]}</span>
        <span class="ystrip__num num">${l.phone}</span>
        <span class="ystrip__go">${icon('phone', { size: 16 })}<span>Call ${l.city}</span></span>
      </a>
    </li>`)}
  </ul>`;

// ---------- Delivery plate ----------
// The base drawing is a cached file (assets/map.svg, written by build.mjs from mapSvg()): land, graticule, borders.
// Lanes and markers are a small inline SVG over it so they can be drawn in; names are HTML so they stay legible.
export const mapSvg = () => {
  const W = MAP.width, H = MAP.height;
  let ticks = '';
  for (let x = 0; x <= W; x += 25) ticks += `M${x} 0v${x % 100 ? 6 : 12}M${x} ${H}v${x % 100 ? -6 : -12}`;
  for (let y = 0; y <= H; y += 25) ticks += `M0 ${y}h${y % 100 ? 6 : 12}M${W} ${y}h${y % 100 ? -6 : -12}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<rect width="${W}" height="${H}" fill="#FBFAF6"/>
<path d="${MAP.graticule}" fill="none" stroke="#1F45C2" stroke-opacity=".3" stroke-width=".8"/>
<path d="${MAP.land}" fill="#EAE7DC" stroke="#62645D" stroke-width=".9" stroke-linejoin="round"/>
<path d="${MAP.borders}" fill="none" stroke="#62645D" stroke-width=".9" stroke-dasharray="7 3 1.5 3"/>
<path d="${MAP.alaska}${MAP.washington}" fill="#F8E7A6" stroke="#121311" stroke-width="1.3" stroke-linejoin="round"/>
<path d="${ticks}" fill="none" stroke="#121311" stroke-width="1"/>
</svg>`;
};

const LANES = [
  { id: 'A', cls: 'sea', name: 'Ocean freight', note: 'Puget Sound to Southeast and Southcentral Alaska' },
  { id: 'B', cls: 'road', name: 'Road system', note: 'Anchorage, Fairbanks and the highway north' },
  { id: 'C', cls: 'barge', name: 'Barge', note: 'Western and Arctic coast, in the ice-free season' },
  { id: 'D', cls: 'air', name: 'Air freight', note: 'Communities off the road system, year-round' },
];
// Kent is inland, so the ocean lane stops short of its marker, out in Puget Sound: the first curve of the lane is cut at `t`.
export const trimLane = (d, t = 0.38) => d.replace(/^M([\d.]+),([\d.]+)Q([\d.]+),([\d.]+) ([\d.]+),([\d.]+)/, (_, ...v) => {
  const [x0, y0, cx, cy, x1, y1] = v.slice(0, 6).map(Number);
  const at = (a, b, c) => (1 - t) ** 2 * a + 2 * t * (1 - t) * b + t ** 2 * c;
  return `M${at(x0, cx, x1).toFixed(1)},${at(y0, cy, y1).toFixed(1)}Q${((1 - t) * cx + t * x1).toFixed(1)},${((1 - t) * cy + t * y1).toFixed(1)} ${x1},${y1}`;
});
const KEY_TOWNS = ['Utqiaġvik', 'Nome', 'Bethel', 'Unalaska', 'Sitka', 'Deadhorse'];
export const townKey = (name) => name.normalize('NFD').replace(/[^a-zA-Z]/g, '').toLowerCase();

export const deliveryMap = (ctx, { compact = false, action = '' } = {}) => {
  const W = MAP.width, H = MAP.height, u = ctx.uid();
  const at = ([x, y]) => `left:${((x / W) * 100).toFixed(2)}%;top:${((y / H) * 100).toFixed(2)}%`;
  const alt = `Map of Uresco’s delivery area: distribution centers in Kent, Washington, and Anchorage and Fairbanks, Alaska; ocean freight from Puget Sound to Southeast and Southcentral Alaska; the road system north to Deadhorse; barge lanes along the western and Arctic coast; and air freight to communities off the road system. Example destinations: ${MAP.towns.map((t) => t.name).join(', ')}.`;
  const masked = (d, cls, id) => `<mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><path class="pm-draw" d="${d}" pathLength="1"/></mask><path class="pm-lane pm-lane--${cls}" d="${d}" mask="url(#${id})"/>`;
  const towns = compact ? MAP.towns.filter((t) => KEY_TOWNS.includes(t.name)) : MAP.towns;
  return html`
  <figure class="pmap${compact ? ' pmap--compact' : ''}" data-reveal>
    <div class="pmap__canvas">
      <img src="${ctx.u('assets/map.svg')}?v=${ctx.version}" width="${W}" height="${H}" alt="${alt}" loading="lazy" decoding="async">
      <svg class="pmap__lanes" viewBox="0 0 ${W} ${H}" aria-hidden="true" focusable="false">
        ${raw(masked(MAP.air, 'air', `pm${u}d`))}
        ${raw(masked(MAP.barge + MAP.barge2, 'barge', `pm${u}c`))}
        ${raw(masked(trimLane(MAP.sea), 'sea', `pm${u}a`))}
        <path class="pm-lane pm-lane--road" d="${MAP.road}" pathLength="1"/>
        ${raw(towns.map((t) => `<circle class="pm-town pm-town--${townKey(t.name)}" cx="${t.xy[0]}" cy="${t.xy[1]}" r="4.5"/>`).join(''))}
        ${raw(MAP.yards.map((y) => `<g class="pm-yard"><circle cx="${y.xy[0]}" cy="${y.xy[1]}" r="13"/><circle class="pm-yard__dot" cx="${y.xy[0]}" cy="${y.xy[1]}" r="4.5"/></g>`).join(''))}
      </svg>
      <div class="pmap__labels">
        ${MAP.gratLabels.filter((g) => !(g.edge === 's' && /^1[36]0/.test(g.text))).map((g) => html`<span class="pmap__grat pmap__grat--${g.edge}" aria-hidden="true" style="${at(g.xy)}">${g.text}</span>`)}
        ${MAP.tags.map((t) => html`<span class="pmap__tag pmap__tag--${t.id}" aria-hidden="true" style="${at(t.xy)}">${t.id}</span>`)}
        ${towns.map((t) => html`<span class="pmap__town pmap__town--${townKey(t.name)}" aria-hidden="true" data-side="${t.side}" style="${at(t.xy)}">${t.name}</span>`)}
        ${MAP.yards.map((y) => html`<a class="pmap__yard pmap__yard--${y.id}" data-side="${y.side || 'e'}" style="${at(y.xy)}" href="${ctx.u('locations/')}#${y.id}"><span class="sr-only">Yard details: </span>${y.name}<small>${(LATS.find((p) => p.name === y.name)?.lat ?? y.lat).toFixed(1)}° N</small></a>`)}
        <span class="pmap__scale" aria-hidden="true" style="--mi:${((MAP.scale250 / W) * 100).toFixed(2)}%"><i></i><em><span>0</span><span>250</span><span>500 mi</span></em><b>Scale at 60° N</b></span>
      </div>
    </div>
    <figcaption class="pmap__side">
      <div class="tblock">
        <p class="tblock__firm"><b>Three yards</b><span>Kent · Anchorage · Fairbanks</span></p>
        <p class="tblock__title"><span>Title</span><b>Delivery area</b></p>
      </div>
      <ul class="pmap__legend">
        ${LANES.map((l) => html`<li><span class="pmap__tag pmap__tag--${l.id}">${l.id}</span><i class="lg lg--${l.cls}"></i><span><b>${l.name}</b> <small>${l.note}</small></span></li>`)}
      </ul>
      <ul class="pmap__keys">
        <li><i class="lg lg--yard"></i>Uresco yard</li>
        <li><i class="lg lg--town"></i>Example destination</li>
      </ul>
      ${action ? html`<p class="pmap__action">${action}</p>` : ''}
      <p class="pmap__note">Lanes are drawn to show how freight generally moves. They are not carrier routes or schedules.</p>
    </figcaption>
  </figure>`;
};

// ---------- Stub ----------
// The tear-off yellow ticket: the one solid yellow block on a page. `title` is a heading at `level`, or a paragraph if none is given.
export const stub = ({ tag, title, body, actions, cls = '', level }) => html`
  <div class="stub ${cls}">
    <div class="stub__tag"><p class="label">${tag}</p></div>
    <div class="stub__body">
      ${level ? raw(`<h${level} class="stub__t">`) : raw('<p class="stub__t">')}${title}${level ? raw(`</h${level}>`) : raw('</p>')}
      <p>${body}</p>
    </div>
    <div class="stub__acts">${actions}</div>
  </div>`;
