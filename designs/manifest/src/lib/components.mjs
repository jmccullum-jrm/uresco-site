import { readFileSync } from 'fs';
import { html, raw } from './html.mjs';
import { icon } from './icons.mjs';
import { drawing, glyph } from './drawings.mjs';
import { LOCATIONS, tel, address, mapsUrl, hoursAttr, tzLabel } from '../data/locations.mjs';
import { CATEGORIES, BRANDS } from '../data/products.mjs';
import { SITE } from '../config.mjs';

const PHOTOS = JSON.parse(readFileSync(new URL('../data/photos.generated.json', import.meta.url), 'utf8'));
const MAP = JSON.parse(readFileSync(new URL('../data/map.json', import.meta.url), 'utf8'));

export const photo = (key) => {
  const p = PHOTOS[key];
  if (!p) throw new Error(`Unknown photo "${key}" — add it to scripts/photos.json and run npm run images`);
  return p;
};

// "Which yard should I call?" — the guidance from the old site, used on the board, the call sheet and the yard cards.
export const YARD_FOR = {
  kent: 'Puget Sound & the Pacific Northwest',
  anchorage: 'Southcentral Alaska & remote sites',
  fairbanks: 'The Interior & points north',
};
export const lineNo = (i) => String(i + 1).padStart(3, '0');
const two = (i) => String(i + 1).padStart(2, '0');

// Portrait screens get the 3:4 crop made by scripts/images.py instead of a stretched landscape file.
const PORTRAIT = '(max-aspect-ratio: 1/1)';
const LANDSCAPE = '(min-aspect-ratio: 1001/1000)';
const setOf = (ctx, key, prefix, widths) => widths.map((w) => `${ctx.u(`assets/img/${key}${prefix}-${w}.webp`)} ${w}w`).join(', ');

// Responsive image. `sizes` must describe the width the image is really drawn at, including any
// extra width object-fit: cover needs in a tall box. `art` adds the portrait crop for phones.
export const picture = (ctx, key, { sizes = '100vw', cls = '', eager = false, alt, art = false, artSizes = '100vw' } = {}) => {
  const p = photo(key);
  const mid = p.widths.find((w) => w >= 1200) || p.widths[p.widths.length - 1];
  const img = html`<img class="${cls}" src="${ctx.u(`assets/img/${key}-${mid}.webp`)}" srcset="${setOf(ctx, key, '', p.widths)}" sizes="${sizes}" width="${p.width}" height="${p.height}" alt="${alt ?? p.alt}"${raw(eager ? ' fetchpriority="high"' : ' loading="lazy"')} decoding="async"${raw(` style="${p.focal ? `object-position:${p.focal};` : ''}background-color:${p.color || '#22211e'}"`)}>`;
  if (!art || !p.portrait?.length) return img;
  return html`<picture><source media="${PORTRAIT}" srcset="${setOf(ctx, key, '-p', p.portrait)}" sizes="${artSizes}" width="${p.pwidth}" height="${p.pheight}">${img}</picture>`;
};

// The plate is 4:3 beside the title on wide screens and 3:2 under it on narrow ones; a 3:2 photograph covers both.
export const PHERO_SIZES = '(min-width: 1000px) min(47vw, 620px), 100vw';

// Preload hint for a hero photograph. The defaults match the page-hero plate; pass `sizes` for anything else.
// `art` adds a second hint for the portrait crop, for a layout that uses picture(…, { art: true }).
export const preloadFor = (ctx, key, { sizes = PHERO_SIZES, artSizes = '100vw', art = false } = {}) => {
  const p = photo(key);
  const both = art && p.portrait?.length;
  const landscape = { srcset: setOf(ctx, key, '', p.widths), sizes, media: both ? LANDSCAPE : null };
  return both ? [{ srcset: setOf(ctx, key, '-p', p.portrait), sizes: artSizes, media: PORTRAIT }, landscape] : [landscape];
};

// Live open/closed badge; filled in by the script in the yard's own time zone. Hidden without JS.
export const openStatus = (l, { short = false } = {}) =>
  l.hours ? html`<span class="status" data-hours="${hoursAttr(l)}"${short ? html` data-short` : ''} hidden></span>` : '';

// Mono label: the lettering on a drawing.
export const stamp = (text) => html`<p class="label">${text}</p>`;

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
      ${raw(`<h${level} class="h2">`)}${raw(title)}${raw(`</h${level}>`)}
      ${lede || action ? html`<div class="shead__aside">
        ${lede ? html`<p class="lede">${lede}</p>` : ''}
        ${action || ''}
      </div>` : ''}
    </div>
  </header>`;

// ---------- Photograph as a plate ----------
// One photograph per page, at most. It is printed in two inks (see .plate in the stylesheet), trimmed with
// crop marks and captioned as a figure, so a stock picture is never mistaken for Uresco's own yard.
export const plate = (ctx, key, { fig = '1', caption, more = '', cls = '', sizes, eager = false, art = false, artSizes } = {}) => {
  const p = photo(key);
  return html`
  <figure class="plate ${cls}">
    <div class="plate__img">${picture(ctx, key, { sizes, eager, art, artSizes })}</div>
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
      ${LATS.map((p, i) => html`<span class="latrule__pt latrule__pt--${p.row}${i === LATS.length - 1 ? ' is-last' : ''}" style="left:${latPct(p.lat)}%"><b>${p.name}</b><i class="num">${p.lat.toFixed(1)}° N</i></span>`)}
    </div>
  </div>
  ${note ? html`<p class="latrule__note">${note}</p>` : ''}`;

// ---------- Dispatch board ----------
// Three yards on a departures board: local time (ticking), open or closed, and the number. Every row is a tel: link.
// Characters are set in fixed cells so the script can flip them; without the script they are simply the text.
const cells = (s) => raw([...s].map((ch) => `<span class="fl${ch === ' ' ? ' fl--sp' : ''}">${ch === ' ' ? '&nbsp;' : ch}</span>`).join(''));
const TZ_ABBR = { 'America/Los_Angeles': 'PT', 'America/Anchorage': 'AKT' };
export const board = (ctx, { id = 'board' } = {}) => html`
  <section class="board" aria-labelledby="${id}-t">
    <div class="board__head">
      <h2 class="board__title" id="${id}-t">Dispatch <span>Three yards, one team</span></h2>
      <p class="board__live js-only" aria-hidden="true"><i></i>Live · local time at each yard</p>
    </div>
    <div class="board__cols" aria-hidden="true"><span>No.</span><span>Yard</span><span>Call this yard for</span><span>Local time</span><span>Status</span><span>Tap to call</span></div>
    <ol class="board__rows">
      ${LOCATIONS.map((l, i) => html`<li>
        <a class="board__row" href="${tel(l.phone)}">
          <span class="board__no num" aria-hidden="true">${two(i)}</span>
          <span class="board__yard">${l.city}<small>, ${l.state}</small></span>
          <span class="board__for">${YARD_FOR[l.id]}</span>
          <span class="board__clock"><span class="board__time js-only" data-clock="${l.hours.tz}" data-seconds aria-hidden="true">${cells('--:--:--')}</span><abbr class="board__tz" title="${tzLabel(l)}">${TZ_ABBR[l.hours.tz]}</abbr></span>
          <span class="board__status">${openStatus(l, { short: true })}</span>
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
        <span class="mline__qty num">${String(c.items.length).padStart(2, '0')}<span class="sr-only"> items</span></span>
        <span class="mline__mark" aria-hidden="true"></span>
      </summary>
      <div class="mline__panel">
        <div class="dwg">
          <p class="dwg__bar label"><span>Dwg ${lineNo(i)}</span><span>${c.short}</span><span class="dwg__nts">Typical · not to scale</span></p>
          <div class="dwg__canvas">${drawing(c.slug, { id })}</div>
        </div>
        <div class="mline__body">
          <p class="mline__lede">${c.lede}</p>
          <ul class="mline__items">${c.items.map(([name]) => html`<li>${name}</li>`)}</ul>
          <div class="mline__links">
            <a class="btn btn--sm btn--dark" href="${ctx.u('products/' + c.slug + '/')}">Open line ${lineNo(i)} ${icon('arrow', { size: 16 })}</a>
            <a class="link" href="${ctx.u('quote/')}?product=${encodeURIComponent(c.name)}">Add to a quote</a>
          </div>
        </div>
      </div>
    </details>`)}
    <a class="mline__ask" href="${ctx.u('quote/')}">
      <span class="mline__no num">+</span>
      <span><b>Not on the list?</b> Tarps, poly, caulking, adhesives, house wraps and more. Ask your yard.</span>
      ${icon('arrow', { size: 18 })}
    </a>
    <p class="brandline"><span class="label">Brands on the manifest</span>${BRANDS.map((b) => html`<span>${b}</span>`)}</p>
  </div></div>`;

// Compact packing list: the nine lines as links with their glyphs (inner pages).
export const packingList = (ctx) => html`
  <ol class="plist">
    ${CATEGORIES.map((c, i) => html`<li><a href="${ctx.u('products/' + c.slug + '/')}">
      <span class="plist__no num">${lineNo(i)}</span>
      <span class="plist__glyph">${glyph(c.slug, { size: 40 })}</span>
      <span class="plist__name">${c.short}</span>
      <span class="plist__items">${c.items.map(([n]) => n.replace(/\s*\(.*?\)/, '').replace(/[®™]/g, '')).slice(0, 3).join(' · ')}</span>
      ${icon('arrow', { size: 16 })}
    </a></li>`)}
  </ol>`;

// ---------- Sequence ----------
// Stations on one line: a process, drawn the way a dimension string is.
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
export const pageHero = (ctx, { eyebrow, title, lede, photoKey, actions = '', crumbs = [], sheet, caption, fig = '1', below = '' }) => html`
  <section class="phero">
    <div class="wrap">
      <div class="sheetbar">
        <nav class="crumbs" aria-label="Breadcrumb"><ol>
          <li><a href="${ctx.u('')}">Home</a></li>
          ${crumbs.length ? crumbs.map(([label, href]) => html`<li>${href ? html`<a href="${ctx.u(href)}">${label}</a>` : html`<span aria-current="page">${label}</span>`}</li>`) : html`<li><span aria-current="page">${sheet || eyebrow || 'Page'}</span></li>`}
        </ol></nav>
        ${eyebrow ? html`<p class="label sheetbar__meta">${eyebrow}</p>` : ''}
      </div>
      <div class="phero__grid${photoKey ? '' : ' phero__grid--plain'}">
        <div class="phero__inner">
          <h1 class="display">${raw(title)}</h1>
          ${lede ? html`<p class="lede phero__lede">${lede}</p>` : ''}
          ${actions ? html`<div class="actions">${actions}</div>` : ''}
        </div>
        ${photoKey ? plate(ctx, photoKey, { cls: 'phero__media', fig, caption, eager: true, sizes: PHERO_SIZES }) : ''}
      </div>
      ${below}
    </div>
  </section>`;

// ---------- Take-off band (the quote call to action) ----------
// A blank take-off sheet with the quantity column highlighted: the part Uresco fills in.
const TAKEOFF = [['Dimensional lumber, studs & plates', 'EA'], ['I-joists, rim & beams', 'LF'], ['Wall & roof sheathing', 'SHT'], ['Hangers, ties & fasteners', 'BOX'], ['Windows & exterior doors', 'EA']];
export const quoteBand = (ctx, { title = 'Send the plans. <em>We’ll fill in the quantities.</em>', body = 'Upload drawings or a list and the yard nearest your project builds the take-off: every stick, panel and connector, priced and ready to order.', eyebrow = 'Estimates & take-offs', no } = {}) => html`
  <section class="takeoff">
    <div class="wrap takeoff__grid">
      <div class="takeoff__copy">
        <div class="shead__bar">${no ? html`<span class="bub num" aria-hidden="true">${no}</span>` : ''}<p class="label shead__label">${eyebrow}</p></div>
        <h2 class="h2">${raw(title)}</h2>
        <p class="lede">${body}</p>
        <div class="actions">
          <a class="btn" href="${ctx.u('quote/')}">Request a quote ${icon('arrow', { size: 18 })}</a>
          <a class="btn btn--line" href="${ctx.u('quote/#plans')}">${icon('upload', { size: 18 })} Send plans</a>
        </div>
      </div>
      <div class="tsheet" aria-hidden="true" data-reveal>
        <div class="tsheet__head"><b>Material take-off</b><span>Job <i></i></span><span>Ship to <i></i></span></div>
        <div class="tsheet__cols"><span>Ln</span><span>Description</span><span>Unit</span><span>Qty</span></div>
        ${TAKEOFF.map(([d, u], i) => html`<div class="tsheet__row"><span>${two(i)}</span><span>${d}</span><span>${u}</span><span class="tsheet__qty"></span></div>`)}
        <div class="tsheet__row tsheet__row--more"><span>…</span><span>and every line after it</span><span></span><span class="tsheet__qty"></span></div>
        <p class="tsheet__note"><span>We fill in this column</span></p>
      </div>
    </div>
  </section>`;

// ---------- Yard card ----------
// A yard as a specification sheet. `compact` drops fax, mail and the anchor id (for pages that list all three).
export const yardCard = (ctx, l, { headingLevel = 3, compact = false } = {}) => {
  const H = `h${headingLevel}`;
  const i = LOCATIONS.indexOf(l);
  return html`
  <article class="yard${compact ? ' yard--compact' : ''}"${compact ? '' : html` id="${l.id}"`}>
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
      ${!compact && l.fax ? html`<div><dt>Fax</dt><dd class="num">${l.fax}</dd></div>` : ''}
      ${!compact && l.mailing ? html`<div><dt>Mail</dt><dd>${l.mailing}</dd></div>` : ''}
      ${l.hours ? html`<div><dt>Now</dt><dd>${openStatus(l)}</dd></div>` : ''}
    </dl>
    <div class="yard__actions">
      <a class="btn btn--sm" href="${tel(l.phone)}">${icon('phone', { size: 16 })} Call ${l.city}</a>
      <a class="btn btn--sm btn--line" href="${mapsUrl(l)}" target="_blank" rel="noopener">${icon('directions', { size: 16 })} Directions</a>
      <a class="link yard__quote" href="${ctx.u('quote/')}?yard=${l.id}">Quote from ${l.city} ${icon('arrow', { size: 14 })}</a>
    </div>
  </article>`;
};

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
  { id: 'A', cls: 'sea', name: 'Ocean freight', note: 'Puget Sound to Southcentral Alaska' },
  { id: 'B', cls: 'road', name: 'Road system', note: 'Anchorage, Fairbanks and the highway north' },
  { id: 'C', cls: 'barge', name: 'Barge', note: 'Western and Arctic coast, in the ice-free season' },
  { id: 'D', cls: 'air', name: 'Air freight', note: 'Communities off the road system, year-round' },
];
const KEY_TOWNS = ['Utqiaġvik', 'Nome', 'Bethel', 'Unalaska', 'Sitka', 'Deadhorse'];

export const deliveryMap = (ctx, { compact = false, sheet = 'A-1', action = '' } = {}) => {
  const W = MAP.width, H = MAP.height, u = ctx.uid();
  const at = ([x, y]) => `left:${((x / W) * 100).toFixed(2)}%;top:${((y / H) * 100).toFixed(2)}%`;
  const alt = `Map of Uresco’s delivery area: distribution centers in Kent, Washington, and Anchorage and Fairbanks, Alaska; ocean freight from Puget Sound to Southcentral Alaska; the road system north to Deadhorse; barge lanes to western Alaska; and air freight to communities off the road system, including ${MAP.towns.map((t) => t.name).join(', ')}.`;
  const masked = (d, cls, id) => `<mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><path class="pm-draw" d="${d}" pathLength="1"/></mask><path class="pm-lane pm-lane--${cls}" d="${d}" mask="url(#${id})"/>`;
  const towns = compact ? MAP.towns.filter((t) => KEY_TOWNS.includes(t.name)) : MAP.towns;
  return html`
  <figure class="pmap${compact ? ' pmap--compact' : ''}" data-reveal>
    <div class="pmap__canvas">
      <img src="${ctx.u('assets/map.svg')}?v=${ctx.version}" width="${W}" height="${H}" alt="${alt}" loading="lazy" decoding="async">
      <svg class="pmap__lanes" viewBox="0 0 ${W} ${H}" aria-hidden="true" focusable="false">
        ${raw(masked(MAP.air, 'air', `pm${u}d`))}
        ${raw(masked(MAP.barge + MAP.barge2, 'barge', `pm${u}c`))}
        ${raw(masked(MAP.sea, 'sea', `pm${u}a`))}
        <path class="pm-lane pm-lane--road" d="${MAP.road}" pathLength="1"/>
        ${raw(MAP.towns.map((t) => `<circle class="pm-town" cx="${t.xy[0]}" cy="${t.xy[1]}" r="4.5"/>`).join(''))}
        ${raw(MAP.yards.map((y) => `<g class="pm-yard"><circle cx="${y.xy[0]}" cy="${y.xy[1]}" r="13"/><circle class="pm-yard__dot" cx="${y.xy[0]}" cy="${y.xy[1]}" r="4.5"/></g>`).join(''))}
      </svg>
      <div class="pmap__labels">
        ${MAP.gratLabels.map((g) => html`<span class="pmap__grat pmap__grat--${g.edge}" aria-hidden="true" style="${at(g.xy)}">${g.text}</span>`)}
        ${MAP.tags.map((t) => html`<span class="pmap__tag pmap__tag--${t.id}" aria-hidden="true" style="${at(t.xy)}">${t.id}</span>`)}
        ${towns.map((t) => html`<span class="pmap__town${KEY_TOWNS.includes(t.name) ? '' : ' pmap__town--minor'}${t.name === 'Bethel' ? ' pmap__town--tight' : ''}" aria-hidden="true" data-side="${t.side}" style="${at(t.xy)}">${t.name}</span>`)}
        ${MAP.yards.map((y) => html`<a class="pmap__yard" data-side="${y.side || 'e'}" style="${at(y.xy)}" href="${ctx.u('locations/')}#${y.id}"><span class="sr-only">Yard details: </span>${y.name}<small>${(LATS.find((p) => p.name === y.name)?.lat ?? y.lat).toFixed(1)}° N</small></a>`)}
        <span class="pmap__scale" aria-hidden="true" style="--mi:${((MAP.scale250 / W) * 100).toFixed(2)}%"><i></i><em><span>0</span><span>250</span><span>500 mi</span></em><b>Scale at 60° N</b></span>
      </div>
    </div>
    <figcaption class="pmap__side">
      <div class="tblock">
        <p class="tblock__firm"><b>Uresco Construction Materials, Inc.</b><span>Kent · Anchorage · Fairbanks</span></p>
        <p class="tblock__sheet"><span>Sheet</span><b>${sheet}</b></p>
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
      <p class="pmap__note">Conic conformal projection. Lanes are illustrative, not carrier schedules.</p>
    </figcaption>
  </figure>`;
};
export { LANES };

// Kept for pages not yet rebuilt in this system: a quiet band with one line of text (no second photograph).
export const interlude = (ctx, key, { line, note } = {}) => html`
  <section class="section section--panel">
    <div class="wrap"><p class="h2">${raw(line)}</p>${note ? html`<p class="lede">${note}</p>` : ''}</div>
  </section>`;

export { SITE, address };
