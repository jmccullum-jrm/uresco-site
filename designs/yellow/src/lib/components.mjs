import { readFileSync } from 'fs';
import { html, raw } from './html.mjs';
import { icon } from './icons.mjs';
import { LOCATIONS, tel, address, mapsUrl, hoursLines, hoursAttr, tzLabel } from '../data/locations.mjs';
import { CATEGORIES } from '../data/products.mjs';
import { SITE } from '../config.mjs';

const PHOTOS = JSON.parse(readFileSync(new URL('../data/photos.generated.json', import.meta.url), 'utf8'));
const MAP = JSON.parse(readFileSync(new URL('../data/map.json', import.meta.url), 'utf8'));

export const photo = (key) => {
  const p = PHOTOS[key];
  if (!p) throw new Error(`Unknown photo "${key}" — add it to scripts/photos.json and run npm run images`);
  return p;
};

const PORTRAIT = '(max-aspect-ratio: 1/1)';
const setOf = (ctx, key, prefix, widths) => widths.map((w) => `${ctx.u(`assets/img/${key}${prefix}-${w}.webp`)} ${w}w`).join(', ');

// Plain responsive image. `sizes` must describe the width the image is really drawn at.
// `art` adds the portrait crop for portrait screens. Most of the site should use win() instead.
export const picture = (ctx, key, { sizes = '100vw', cls = '', eager = false, alt, art = false, artSizes = '100vw' } = {}) => {
  const p = photo(key);
  const mid = p.widths.find((w) => w >= 1200) || p.widths[p.widths.length - 1];
  const img = html`<img class="${cls}" src="${ctx.u(`assets/img/${key}-${mid}.webp`)}" srcset="${setOf(ctx, key, '', p.widths)}" sizes="${sizes}" width="${p.width}" height="${p.height}" alt="${alt ?? p.alt}"${raw(eager ? ' fetchpriority="high"' : ' loading="lazy"')} decoding="async"${raw(` style="${p.focal ? `object-position:${p.focal};` : ''}background-color:${p.color || '#22211e'}"`)}>`;
  if (!art || !p.portrait?.length) return img;
  return html`<picture><source media="${PORTRAIT}" srcset="${setOf(ctx, key, '-p', p.portrait)}" sizes="${artSizes}" width="${p.pwidth}" height="${p.pheight}">${img}</picture>`;
};
// ---- The U as a window -------------------------------------------------------------------
// Every photograph sits in a window: shape 'u' (hangs), 'arch' (stands), 'pill' or 'card'.
// Windows are taller than wide, so a photo's 3:4 crop is used when it has one (`art` in
// photos.json); a landscape file is asked for wide enough to cover the height.
// `sizes` is the width of the WINDOW; `duo` prints the photo in yellow, for black fields.
const windowSource = (ctx, key, sizes) => {
  const p = photo(key);
  const tall = p.portrait?.length > 0;
  const native = p.height > p.width;
  const widths = tall ? p.portrait : p.widths;
  const cover = tall || native ? 1 : 1.9;
  const sz = cover === 1 ? sizes : sizes.split(',').map((part) => {
    const t = part.trim(); const cut = t.lastIndexOf(') ') + 1;
    return `${t.slice(0, cut)}${cut ? ' ' : ''}calc(${t.slice(cut).trim()} * ${cover})`;
  }).join(', ');
  const mid = widths.find((w) => w >= 640) || widths[widths.length - 1];
  return { p, srcset: setOf(ctx, key, tall ? '-p' : '', widths), sizes: sz, src: ctx.u(`assets/img/${key}${tall ? '-p' : ''}-${mid}.webp`), w: tall ? p.pwidth : p.width, h: tall ? p.pheight : p.height };
};
export const winImg = (ctx, key, { sizes = '(min-width: 1000px) 33vw, 92vw', eager = false, alt, deferred = false, cls = '', thumb = false } = {}) => {
  // A thumb is a window never drawn wider than ~120px: one small file, no srcset.
  if (thumb) { const p = photo(key); return html`<img src="${ctx.u(`assets/img/${key}-240.webp`)}" width="240" height="${Math.round((240 * p.height) / p.width)}" alt="${alt ?? p.alt}" loading="lazy" decoding="async"${raw(p.focal ? ` style="object-position:${p.focal}"` : '')}>`; }
  const s = windowSource(ctx, key, sizes);
  const pos = s.p.focal && !(s.p.portrait?.length) ? `object-position:${s.p.focal};` : '';
  // A deferred image has no src until a script asks for it (slides after the first).
  const load = deferred ? html` data-srcset="${s.srcset}" data-src="${s.src}"` : html` src="${s.src}" srcset="${s.srcset}"`;
  return html`<img${cls ? html` class="${cls}"` : ''}${load} sizes="${s.sizes}" width="${s.w}" height="${s.h}" alt="${alt ?? s.p.alt}"${raw(eager ? ' fetchpriority="high"' : deferred ? '' : ' loading="lazy"')} decoding="async"${raw(` style="${pos}background-color:${s.p.color || '#22211e'}"`)}>`;
};
export const win = (ctx, key, { shape = 'u', duo = false, cls = '', tag = 'div', ...img } = {}) =>
  html`${raw(`<${tag} class="win win--${shape}${duo ? ' win--duo' : ''}${cls ? ' ' + cls : ''}">`)}${winImg(ctx, key, img)}${raw(`</${tag}>`)}`;
// Preload hint for a window that is the first thing on the page.
export const winPreload = (ctx, key, sizes) => { const s = windowSource(ctx, key, sizes); return { srcset: s.srcset, sizes: s.sizes }; };

// The mark's rings, n of them, around whatever positioned box they are placed in.
export const rings = (n = 3, { arch = false, cls = '' } = {}) =>
  html`<div class="rings${arch ? ' rings--arch' : ''}${cls ? ' ' + cls : ''}" aria-hidden="true">${Array.from({ length: n }, () => raw('<i></i>'))}</div>`;

// Live open/closed badge; filled in by JS in the yard's own time zone. Hidden without JS.
export const openStatus = (l, { short = false } = {}) =>
  l.hours ? html`<span class="status" data-hours="${hoursAttr(l)}"${short ? html` data-short` : ''} hidden></span>` : '';

// Section eyebrow. (`stamp` is the name pages written for the previous design still call.)
export const eyebrow = (text) => html`<p class="eyebrow">${text}</p>`;
export const stamp = eyebrow;

export const sticker = (text, { tone = '', rot = -4, cls = '', reveal = true } = {}) =>
  html`<span class="sticker${tone ? ' sticker--' + tone : ''}${cls ? ' ' + cls : ''}" style="--rot:${rot}deg"${reveal ? html` data-reveal="pop"` : ''}>${text}</span>`;

// A round seal with text running around it. Decorative: whatever it says is also said in text nearby.
export const seal = (ctx, { around, big, small, cls = '' }) => {
  const id = 'seal' + ctx.uid();
  return html`<div class="seal${cls ? ' ' + cls : ''}" aria-hidden="true" data-reveal="pop">
    <svg class="seal__spin" viewBox="0 0 200 200" focusable="false"><defs><path id="${id}" d="M100 100m-77 0a77 77 0 1 1 154 0a77 77 0 1 1-154 0"/></defs><text><textPath href="#${id}" textLength="478" lengthAdjust="spacing">${around}</textPath></text></svg>
    <span class="seal__mid"><b>${big}</b>${small}</span>
  </div>`;
};

// Headline on the left; supporting text and link on the right.
export const sectionHead = ({ eyebrow: eb, title, lede, action, id }) => html`
  <div class="shead${lede || action ? '' : ' shead--solo'}">
    <div class="shead__title">
      ${eb ? eyebrow(eb) : ''}
      <h2 class="d2"${id ? html` id="${id}"` : ''}>${raw(title)}</h2>
    </div>
    ${lede || action ? html`<div class="shead__aside">
      ${lede ? html`<p class="lede">${lede}</p>` : ''}
      ${action || ''}
    </div>` : ''}
  </div>`;

// A band of very large type that slides sideways. Decorative; the same words appear in the page.
export const marquee = (items, { tone = 'k', tilt = false, slow = false } = {}) => {
  const run = items.map((t) => html`<span>${t}</span><i></i>`);
  return html`<div class="marquee marquee--${tone}${tilt ? ' marquee--tilt' : ''}" aria-hidden="true"><div class="marquee__track"${slow ? html` style="--dur:70s"` : ''}>${run}${run}</div></div>`;
};

const crumbsNav = (ctx, crumbs) => (crumbs.length ? html`<nav class="crumbs" aria-label="Breadcrumb"><ol>
        <li><a href="${ctx.u('')}">Home</a></li>
        ${crumbs.map(([label, href]) => html`<li>${href ? html`<a href="${ctx.u(href)}">${label}</a>` : html`<span aria-current="page">${label}</span>`}</li>`)}
      </ol></nav>` : '');

// Page hero: a yellow poster. Headline left, a U window hanging on the right inside the mark's
// rings. With no photoKey the rings stand alone. `before` goes above the headline, `after` below the actions.
export const pageHero = (ctx, { eyebrow: eb, title, lede, photoKey, actions = '', crumbs = [], before = '', after = '', cls = '', alt }) => {
  const plain = String(title).replace(/<[^>]+>/g, '');
  return html`
  <section class="phero field-y clip${photoKey ? '' : ' phero--plain'}${cls ? ' ' + cls : ''}">
    <div class="wrap phero__grid">
      <div class="phero__copy">
        ${crumbsNav(ctx, crumbs)}
        ${eb ? eyebrow(eb) : ''}
        ${before}
        <h1 class="d1 phero__title${plain.length > 30 ? ' phero__title--long' : ''}">${raw(title)}</h1>
        ${lede ? html`<p class="lede phero__lede">${lede}</p>` : ''}
        ${actions ? html`<div class="actions">${actions}</div>` : ''}
        ${after}
      </div>
      <div class="phero__art">
        ${rings(4)}
        ${photoKey ? win(ctx, photoKey, { cls: 'phero__media', eager: true, alt, sizes: '(min-width: 900px) 30vw, 70vw' }) : html`<div class="phero__u" aria-hidden="true"></div>`}
      </div>
    </div>
  </section>`;
};
export const pageHeroPreload = (ctx, key) => winPreload(ctx, key, '(min-width: 900px) 30vw, 70vw');
// The name pages written for the previous design use for the same hint.
export const preloadFor = pageHeroPreload;

// Closing call to action: an arch standing on the bottom edge of a yellow field.
export const quoteBand = (ctx, { title = 'Send plans. <em>Get a take-off.</em>', body = 'Upload drawings or a list and the yard nearest your project builds the take-off: every stick, panel and connector, ready to quote.', photoKey = 'blueprints', label = 'Estimates & take-offs' } = {}) => html`
  <section class="qband field-y clip">
    <div class="wrap qband__grid">
      <div class="qband__art">
        ${rings(3, { arch: true })}
        ${win(ctx, photoKey, { shape: 'arch', cls: 'qband__media', sizes: '(min-width: 900px) 30vw, 60vw' })}
      </div>
      <div class="qband__copy">
        ${eyebrow(label)}
        <h2 class="d2">${raw(title)}</h2>
        <p class="lede">${body}</p>
        <div class="actions">
          <a class="btn btn--lg" href="${ctx.u('quote/')}">Request a quote ${icon('arrow', { size: 20 })}</a>
          <button type="button" class="btn btn--lg btn--line" data-open="call-sheet" aria-haspopup="dialog">${icon('phone', { size: 20 })} Call a yard</button>
        </div>
      </div>
    </div>
  </section>`;

// Latitudes as the site states them (FACTS: Kent 47.4, Anchorage 61.2, Fairbanks 64.8).
const LAT = { kent: '47.4° N', anchorage: '61.2° N', fairbanks: '64.8° N' };
const latitude = (l) => LAT[l.id] || `${Math.abs(l.geo.lat).toFixed(1)}° N`;
// What each yard card shows in its window: the place, never a stand-in for the yard itself.
const YARD_PHOTO = { kent: 'rainier-tacoma', anchorage: 'anchorage', fairbanks: 'fairbanks' };

// A yard as a freight tag. `compact` is the home-page version: number, directions, nothing else.
export const yardCard = (ctx, l, { showPhoto = true, headingLevel = 3, compact = false, photoSizes = '(min-width: 1000px) 30vw, (min-width: 640px) 45vw, 30vw' } = {}) => {
  const H = `h${headingLevel}`;
  return html`
  <article class="yard${compact ? ' yard--compact' : ''}${showPhoto ? '' : ' yard--plain'}"${compact ? '' : html` id="${l.id}"`} data-reveal>
    <div class="yard__head">
      <span class="yard__lat nums">${l.state} <i aria-hidden="true"></i> ${latitude(l)}</span>
      ${raw(`<${H} class="yard__city">`)}${l.city}<span class="sr-only">, ${l.state}</span>${raw(`</${H}>`)}
      <p class="yard__role">${compact ? l.region : l.role}</p>
      ${showPhoto ? win(ctx, YARD_PHOTO[l.id] || l.photo, { cls: 'yard__media', sizes: photoSizes }) : ''}
    </div>
    <div class="yard__body">
      <address class="yard__addr">${icon('pin', { size: 18 })}<span>${l.street}<br>${l.city}, ${l.state} ${l.zip}</span></address>
      ${compact
        ? html`<p class="yard__hours">${openStatus(l)}</p>`
        : html`<dl class="yard__lines">
        ${l.tollFree ? html`<div><dt>Toll-free</dt><dd><a href="${tel(l.tollFree)}">${l.tollFree}</a></dd></div>` : ''}
        ${l.fax ? html`<div><dt>Fax</dt><dd>${l.fax}</dd></div>` : ''}
        <div><dt>Email</dt><dd><a href="mailto:${l.email}">${l.email}</a></dd></div>
        ${l.hours ? html`<div><dt>Hours</dt><dd>${hoursLines(l).map((h) => html`${h}<br>`)}<small>${tzLabel(l)}</small> ${openStatus(l)}</dd></div>` : ''}
        ${l.mailing ? html`<div><dt>Mail</dt><dd>${l.mailing}</dd></div>` : ''}
      </dl>`}
      <div class="yard__actions">
        <a class="btn yard__call nums" href="${tel(l.phone)}">${icon('phone', { size: 18 })} ${l.phone}</a>
        <a class="btn btn--line yard__dir" href="${mapsUrl(l)}" target="_blank" rel="noopener">${icon('directions', { size: 18 })} <span class="yard__dir-t">Directions</span><span class="sr-only"> to the ${l.city} yard (opens a map)</span></a>
      </div>
      ${compact ? '' : html`<a class="link yard__quote" href="${ctx.u('quote/')}?yard=${l.id}">Get a quote from ${l.city} ${icon('arrow', { size: 16 })}</a>`}
    </div>
  </article>`;
};

// The three yard numbers as big pills: the first thing to tap on the home page.
export const yardsStrip = (ctx) => html`
  <ul class="ystrip" aria-label="Call a yard">
    ${LOCATIONS.map((l) => html`<li>
      <a href="${tel(l.phone)}" class="ystrip__item">
        <span class="ystrip__city"><b>${l.city}</b>${openStatus(l, { short: true })}</span>
        <span class="ystrip__num nums">${l.phone}</span>
        <span class="ystrip__go">${icon('phone', { size: 18 })}</span>
      </a></li>`)}
  </ul>`;

// Product lines as a bold index: numbered rows that flip between yellow and black.
export const lineIndex = (ctx) => html`
  <ol class="lines" data-lines>
    ${CATEGORIES.map((c, i) => html`<li>
      <a class="line" href="${ctx.u('products/' + c.slug + '/')}">
        <span class="line__no nums" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
        <span class="line__name">${c.short}</span>
        <span class="line__items">${c.items.map(([n]) => n.replace(/[®™]/g, '').replace(/ \(.*\)$/, '')).join(' · ')}</span>
        ${win(ctx, c.photo, { tag: 'span', cls: 'line__win', sizes: '(min-width: 900px) 190px, 74px', alt: '' })}
        <span class="line__go">${icon('arrow', { size: 22 })}</span>
      </a></li>`)}
  </ol>`;

// ---- The delivery map --------------------------------------------------------------------
// Natural Earth land projected in scripts/map.mjs, drawn as a flat poster: yellow Alaska and
// Washington on black. The land is a cached image (assets/map.svg, written by build.mjs);
// lanes are a small inline SVG over it so they can animate; names are HTML so they use the site type.
export const mapSvg = () => {
  const W = MAP.width, H = MAP.height;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<path fill="#24231F" d="${MAP.land}"/><path fill="none" stroke="#F7F3EA" stroke-opacity=".09" d="${MAP.graticule}"/>
<path fill="#F5B800" d="${MAP.alaska}"/><path fill="#F5B800" d="${MAP.washington}"/>
</svg>`;
};

const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[^a-z]/g, '');
// Towns hidden on the small home-page map and on phones, where their names would collide.
const MINOR = new Set(['cordova', 'homer', 'galena', 'dillingham', 'valdez', 'ketchikan']);
// Where each yard's name sits relative to its marker, chosen to stay clear of nearby towns.
const YARD_SIDE = { kent: 'w', anchorage: 'ne', fairbanks: 'e' };
export const MAP_TOWNS = MAP.towns.map((t) => ({ ...t, id: slug(t.name) }));

export const deliveryMap = (ctx, { compact = false } = {}) => {
  const W = MAP.width, H = MAP.height;
  const at = ([x, y]) => `left:${((x / W) * 100).toFixed(2)}%;top:${((y / H) * 100).toFixed(2)}%`;
  const alt = `Map of Uresco’s delivery reach: yards in Kent, Washington, and Anchorage and Fairbanks, Alaska; ocean freight from Puget Sound to Southcentral Alaska; the road system north to Deadhorse; and barge lanes to western Alaska. Example destinations: ${MAP.towns.map((t) => t.name).join(', ')}.`;
  return html`
  <figure class="dmap${compact ? ' dmap--compact' : ''}" data-map>
    <div class="dmap__canvas">
      <div class="dmap__inner">
        <img src="${ctx.u('assets/map.svg')}?v=${ctx.version}" width="${W}" height="${H}" alt="${alt}" loading="lazy" decoding="async">
        <svg class="dmap__lanes" viewBox="0 0 ${W} ${H}" aria-hidden="true" focusable="false">
          <path class="lane lane--sea" d="${MAP.sea}"/>
          <path class="lane lane--barge" d="${MAP.barge}"/><path class="lane lane--barge" d="${MAP.barge2}"/>
          <path class="lane lane--road" d="${MAP.road}"/>
        </svg>
        <div class="dmap__labels">
          ${MAP_TOWNS.map((t) => html`<span class="dmap__town${MINOR.has(t.id) ? ' dmap__town--minor' : ''}" aria-hidden="true" data-town="${t.id}" data-side="${t.side}" style="${at(t.xy)}"><i></i><b>${t.name}</b></span>`)}
          ${MAP.yards.map((y) => html`<a class="dmap__yard" data-side="${YARD_SIDE[y.id] || 'e'}" style="${at(y.xy)}" href="${ctx.u('locations/')}#${y.id}" aria-label="${y.name} yard details"><i></i><b>${y.name}</b></a>`)}
        </div>
      </div>
      <span class="dmap__kent" aria-hidden="true">Kent, WA ${icon('arrow', { size: 14 })}</span>
    </div>
    <figcaption class="dmap__legend">
      <span><i class="lg lg--yard"></i>Uresco yard</span>
      <span><i class="lg lg--road"></i>Road system</span>
      <span><i class="lg lg--sea"></i>Ocean freight</span>
      <span><i class="lg lg--barge"></i>Barge &amp; air</span>
    </figcaption>
  </figure>`;
};

// Kept for pages written for the previous design: a window and one line.
export const interlude = (ctx, key, { line, note } = {}) => html`
  <section class="section field-y">
    <div class="wrap">
      <p class="d2">${raw(line)}</p>
      ${note ? html`<p class="lede">${note}</p>` : ''}
    </div>
  </section>`;

export { SITE, address };
