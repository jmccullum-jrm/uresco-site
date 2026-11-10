import { readFileSync } from 'fs';
import { html, raw } from './html.mjs';
import { icon } from './icons.mjs';
import { LOCATIONS, tel, address, mapsUrl, hoursLines, hoursAttr, tzLabel } from '../data/locations.mjs';
import { SITE } from '../config.mjs';

const PHOTOS = JSON.parse(readFileSync(new URL('../data/photos.generated.json', import.meta.url), 'utf8'));
const MAP = JSON.parse(readFileSync(new URL('../data/map.json', import.meta.url), 'utf8'));

/* ---------- Latitude: the thread the whole design hangs on ---------- */

// Latitudes as the owner's fact sheet gives them (one decimal).
export const LAT = { kent: 47.4, sitka: 57.1, valdez: 61.1, anchorage: 61.2, denali: 63.1, fairbanks: 64.8, utqiagvik: 71.3 };
export const latOf = (l) => LAT[l.id];
export const deg = (lat) => `${Number(lat).toFixed(1)}°N`;

/* ---------- Photographs ---------- */

export const photo = (key) => {
  const p = PHOTOS[key];
  if (!p) throw new Error(`Unknown photo "${key}" — add it to scripts/photos.json and run npm run images`);
  return p;
};

// Portrait screens get the 3:4 crop made by scripts/images.py instead of a stretched landscape file.
const PORTRAIT = '(max-aspect-ratio: 1/1)';
const LANDSCAPE = '(min-aspect-ratio: 1001/1000)';
const setOf = (ctx, key, prefix, widths) => widths.map((w) => `${ctx.u(`assets/img/${key}${prefix}-${w}.webp`)} ${w}w`).join(', ');

// Responsive image. `sizes` must describe the width the image is really drawn at, including any
// extra width object-fit: cover needs in a tall box. `art` adds the portrait crop for phones.
// `pos` overrides the photo's focal point for one placement.
export const picture = (ctx, key, { sizes = '100vw', cls = '', eager = false, alt, art = false, artSizes = '100vw', pos } = {}) => {
  const p = photo(key);
  const mid = p.widths.find((w) => w >= 1200) || p.widths[p.widths.length - 1];
  const at = pos || p.focal;
  const img = html`<img class="${cls}" src="${ctx.u(`assets/img/${key}-${mid}.webp`)}" srcset="${setOf(ctx, key, '', p.widths)}" sizes="${sizes}" width="${p.width}" height="${p.height}" alt="${alt ?? p.alt}"${raw(eager ? ' fetchpriority="high"' : ' loading="lazy"')} decoding="async"${raw(` style="${at ? `object-position:${at};` : ''}background-color:${p.color || '#8c9694'}"`)}>`;
  if (!art || !p.portrait?.length) return img;
  return html`<picture><source media="${PORTRAIT}" srcset="${setOf(ctx, key, '-p', p.portrait)}" sizes="${artSizes}" width="${p.pwidth}" height="${p.pheight}">${img}</picture>`;
};

// Preload hints for a hero: one per crop, so a phone never fetches the landscape file too.
// With no sizes given it assumes the page-hero frame (heroSizes), which is what pageHero() draws.
export const preloadFor = (ctx, key, { sizes, artSizes = '100vw' } = {}) => {
  const p = photo(key);
  sizes = sizes || heroSizes(key);
  const landscape = { srcset: setOf(ctx, key, '', p.widths), sizes, media: p.portrait?.length ? LANDSCAPE : null };
  return p.portrait?.length ? [{ srcset: setOf(ctx, key, '-p', p.portrait), sizes: artSizes, media: PORTRAIT }, landscape] : [landscape];
};

// A photograph with a magazine caption: what it shows on the left, where and how far north on
// the right. `ratio` names a crop (see .fig--* in 30-components.css); `parallax` lets the image
// drift a little as it crosses the screen; `reveal` opens it by clip-path as it enters.
export const figure = (ctx, key, { caption, place, lat, ratio = 'wide', sizes = '100vw', art = false, artSizes, cls = '', parallax = false, reveal = true, eager = false, pos, alt } = {}) => html`
  <figure class="fig fig--${ratio} ${cls}">
    <div class="fig__frame${reveal ? ' rv-img' : ''}"${parallax ? html` data-parallax` : ''}>${picture(ctx, key, { sizes, art, artSizes, eager, pos, alt })}</div>
    ${caption || place ? html`<figcaption class="fig__cap">${caption ? html`<span>${caption}</span>` : ''}${place ? html`<span class="fig__place">${place}${lat ? html` · ${deg(lat)}` : ''}</span>` : ''}</figcaption>` : ''}
  </figure>`;

/* ---------- Small pieces ---------- */

// Live open/closed badge; filled in by site.js in the yard's own time zone. Hidden without JS.
export const openStatus = (l, { short = false } = {}) =>
  l.hours ? html`<span class="status" data-hours="${hoursAttr(l)}"${short ? html` data-short` : ''} hidden></span>` : '';

// Mono label: eyebrows, coordinates, table heads.
export const label = (text, { cls = '' } = {}) => html`<p class="label ${cls}">${text}</p>`;
// Kept under its old name for pages not yet rebuilt.
export const stamp = (text) => label(text);

// Chapter opener: number and place on a ruled line, the chapter's latitude set very large, then
// the headline and a short standfirst. `to` is the latitude a travelling chapter ends at; the
// large figure is where the chapter arrives.
export const chapterHead = ({ no, kicker, lat, to, title, lede, id, tag }) => html`
  <header class="chead">
    <p class="chead__bar rv-line"><span class="chead__no">${no}</span><span class="chead__kicker">${kicker}</span><span class="chead__lat">${deg(lat)}${to ? html` <i aria-hidden="true">→</i><span class="sr-only"> to </span> ${deg(to)}` : ''}</span></p>
    <div class="chead__body">
      <p class="chead__deg rv" aria-hidden="true"><small>${tag || (to ? `From ${deg(lat)} to` : 'Latitude')}</small><span>${Number(to || lat).toFixed(1)}</span><sup>°N</sup></p>
      <div class="chead__text">
        <h2 class="h2 chead__title rv" style="--i:1"${id ? html` id="${id}"` : ''}>${raw(title)}</h2>
        ${lede ? html`<p class="lede chead__lede rv" style="--i:2">${lede}</p>` : ''}
      </div>
    </div>
  </header>`;

// Section opener for inner pages: label, headline, and supporting text set off to the right.
export const sectionHead = ({ eyebrow, title, lede, action, no, id }) => html`
  <header class="shead${lede || action ? '' : ' shead--solo'}">
    ${eyebrow ? html`<p class="shead__bar rv-line"><span class="chead__no">${no || ''}</span><span>${eyebrow}</span></p>` : ''}
    <div class="shead__body">
      <h2 class="h2 rv"${id ? html` id="${id}"` : ''}>${raw(title)}</h2>
      ${lede || action ? html`<div class="shead__aside rv" style="--i:1">
        ${lede ? html`<p class="lede">${lede}</p>` : ''}
        ${action || ''}
      </div>` : ''}
    </div>
  </header>`;

// `sizes` for a page-hero photograph. The frame is a band (see .phero__frame) and the picture is cut
// 14% tall for parallax, so a wide original is drawn wider than the screen. Use the same value for
// the preload hint, or the browser fetches two files.
export const heroSizes = (key) => {
  const p = photo(key);
  return `max(100vw, calc(${((1.14 * p.width) / p.height).toFixed(2)} * clamp(16rem, 58vw, 40rem)))`;
};

// Page hero for inner pages: type on paper, then the photograph running off both edges below it.
export const pageHero = (ctx, { eyebrow, title, lede, photoKey, actions = '', crumbs = [], caption, place, lat, pos, attrs = '' }) => html`
  <section class="phero"${attrs}>
    <div class="wrap phero__inner">
      ${crumbs.length ? html`<nav class="crumbs" aria-label="Breadcrumb"><ol>
        <li><a href="${ctx.u('')}">Home</a></li>
        ${crumbs.map(([text, href]) => html`<li>${href ? html`<a href="${ctx.u(href)}">${text}</a>` : html`<span aria-current="page">${text}</span>`}</li>`)}
      </ol></nav>` : ''}
      ${eyebrow ? label(eyebrow, { cls: 'phero__eyebrow' }) : ''}
      <h1 class="display phero__title">${raw(title)}</h1>
      <div class="phero__row">
        ${lede ? html`<p class="lede phero__lede">${lede}</p>` : ''}
        ${actions ? html`<div class="actions">${actions}</div>` : ''}
      </div>
    </div>
    <figure class="phero__media">
      <div class="phero__frame" data-parallax>${picture(ctx, photoKey, { eager: true, art: true, pos, sizes: heroSizes(photoKey) })}</div>
      ${caption || place ? html`<figcaption class="fig__cap wrap">${caption ? html`<span>${caption}</span>` : ''}${place ? html`<span class="fig__place">${place}${lat ? html` · ${deg(lat)}` : ''}</span>` : ''}</figcaption>` : ''}
    </figure>
  </section>`;

// The quote prompt, drawn as a shipping manifest: what goes in, who handles it, what comes back.
export const manifest = (ctx, { title = 'Start with <em>the list.</em>', body = 'Send drawings or a materials list. The yard nearest your project builds the take-off, checks it for gaps and prices it.', rows, id = 'manifest' } = {}) => {
  const lines = rows || [
    ['Send', 'Plans, drawings or a materials list'],
    ['To', 'The yard nearest your project'],
    ['Returns', 'A take-off: every stick, panel and connector, priced'],
    ['Ships', 'To the job site down the road, or to the dock for the trip north'],
  ];
  return html`
  <div class="manifest rv" id="${id}">
    <div class="manifest__head">
      <p class="label">Estimates &amp; take-offs</p>
      <p class="label manifest__form" aria-hidden="true">Form 01 · Request for quote</p>
    </div>
    <div class="manifest__body">
      <div class="manifest__pitch">
        <h3 class="h2 manifest__title">${raw(title)}</h3>
        <p>${body}</p>
        <div class="actions">
          <a class="btn" href="${ctx.u('quote/')}">Request a quote ${icon('arrow', { size: 18 })}</a>
          <a class="btn btn--line" href="${ctx.u('quote/#plans')}">${icon('upload', { size: 18 })} Send plans</a>
        </div>
      </div>
      <dl class="manifest__rows">
        ${lines.map(([k, v]) => html`<div><dt>${k}</dt><dd>${v}</dd></div>`)}
      </dl>
    </div>
  </div>`;
};
// Old name, for pages not yet rebuilt: the manifest inside a plain section.
export const quoteBand = (ctx, opts = {}) => html`<section class="section section--deep"><div class="wrap">${manifest(ctx, opts)}</div></section>`;

export const steps = (list) => html`
  <ol class="steps">
    ${list.map(([title, body], i) => html`<li class="rv" style="--i:${i}"><span class="steps__no" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><h3 class="steps__title">${title}</h3><p>${body}</p></li>`)}
  </ol>`;

export const faq = (list) => html`
  <div class="faq">
    ${list.map(([q, a], i) => html`<details${i === 0 ? html` open` : ''}><summary><span>${q}</span>${icon('chevron-down', { size: 20 })}</summary><p>${a}</p></details>`)}
  </div>`;

/* ---------- Yards ---------- */

export const yardCard = (ctx, l, { showPhoto = true, headingLevel = 3, compact = false, photoSizes = '(min-width: 1000px) 33vw, 100vw' } = {}) => {
  const H = `h${headingLevel}`;
  return html`
  <article class="yard${compact ? ' yard--compact' : ''}"${compact ? '' : html` id="${l.id}"`}>
    ${showPhoto ? html`<div class="yard__media">${picture(ctx, l.photo, { sizes: photoSizes })}</div>` : ''}
    <div class="yard__body">
      <p class="label yard__lat">${deg(latOf(l))} · ${l.region}</p>
      ${raw(`<${H} class="yard__city">`)}${l.city}<span>, ${l.state}</span>${raw(`</${H}>`)}
      <p class="yard__role">${l.role}</p>
      <dl class="yard__lines">
        <div><dt>Yard</dt><dd><address>${l.street}<br>${l.city}, ${l.state} ${l.zip}</address></dd></div>
        <div><dt>Phone</dt><dd><a class="yard__tel" href="${tel(l.phone)}">${l.phone}</a> ${openStatus(l)}</dd></div>
        ${compact ? '' : html`
        ${l.tollFree ? html`<div><dt>Toll-free</dt><dd><a href="${tel(l.tollFree)}">${l.tollFree}</a></dd></div>` : ''}
        ${l.fax ? html`<div><dt>Fax</dt><dd>${l.fax}</dd></div>` : ''}
        <div><dt>Email</dt><dd><a href="mailto:${l.email}">${l.email}</a></dd></div>
        ${l.hours ? html`<div><dt>Hours</dt><dd>${hoursLines(l).map((h) => html`${h}<br>`)}<small>${tzLabel(l)}</small></dd></div>` : ''}
        ${l.mailing ? html`<div><dt>Mail</dt><dd>${l.mailing}</dd></div>` : ''}`}
      </dl>
      <div class="yard__actions">
        <a class="btn btn--sm" href="${tel(l.phone)}">${icon('phone', { size: 16 })} Call ${l.city}</a>
        <a class="btn btn--sm btn--line" href="${mapsUrl(l)}" target="_blank" rel="noopener">${icon('directions', { size: 16 })} Directions</a>
      </div>
      ${compact ? '' : html`<a class="link yard__quote" href="${ctx.u('quote/')}?yard=${l.id}">Get a quote from ${l.city} ${icon('arrow', { size: 16 })}</a>`}
    </div>
  </article>`;
};

// A yard as a magazine spread: a large photograph of the place on one side, the yard's details
// on the other. `photoKey` is a picture of the place (never captioned as the yard itself).
export const yardSpread = (ctx, l, { photoKey, caption, place, ratio = 'land', flip = false, headingLevel = 3, pos, attrs = '' } = {}) => {
  const H = `h${headingLevel}`;
  return html`
  <article class="spread${flip ? ' spread--flip' : ''}" id="${l.id}"${attrs}>
    ${figure(ctx, photoKey, { caption, place, lat: latOf(l), ratio, pos, sizes: '(min-width: 1000px) 56vw, 100vw', cls: 'spread__media', parallax: true })}
    <div class="spread__body">
      <p class="label spread__lat rv">${deg(latOf(l))} · ${l.role}</p>
      ${raw(`<${H} class="spread__city rv" style="--i:1">`)}${l.city}${raw(`</${H}>`)}
      <p class="spread__blurb rv" style="--i:2">${l.blurb}</p>
      <dl class="yard__lines rv" style="--i:3">
        <div><dt>Yard</dt><dd><address>${l.street}<br>${l.city}, ${l.state} ${l.zip}</address></dd></div>
        <div><dt>Phone</dt><dd><a class="yard__tel" href="${tel(l.phone)}">${l.phone}</a> ${openStatus(l)}</dd></div>
        ${l.tollFree ? html`<div><dt>Toll-free</dt><dd><a href="${tel(l.tollFree)}">${l.tollFree}</a></dd></div>` : ''}
        <div><dt>Email</dt><dd><a href="mailto:${l.email}">${l.email}</a></dd></div>
      </dl>
      <div class="yard__actions rv" style="--i:4">
        <a class="btn btn--sm" href="${tel(l.phone)}">${icon('phone', { size: 16 })} Call ${l.city}</a>
        <a class="btn btn--sm btn--line" href="${mapsUrl(l)}" target="_blank" rel="noopener">${icon('directions', { size: 16 })} Directions</a>
      </div>
      <a class="link yard__quote rv" style="--i:5" href="${ctx.u('quote/')}?yard=${l.id}">Get a quote from ${l.city} ${icon('arrow', { size: 16 })}</a>
    </div>
  </article>`;
};

// The three yards as one ruled line: latitude, city, number. Each cell is a phone link.
export const yardsStrip = (ctx) => html`
  <ul class="ystrip" aria-label="Call a yard">
    ${LOCATIONS.map((l) => html`<li>
      <a href="${tel(l.phone)}" class="ystrip__item">
        <span class="ystrip__lat">${deg(latOf(l))}<span> · ${l.id === 'kent' ? 'Headquarters' : l.id === 'anchorage' ? 'Southcentral' : 'Interior'}</span></span>
        ${openStatus(l, { short: true })}
        <span class="ystrip__city"><b>${l.city}</b><small>${l.state}</small></span>
        <span class="ystrip__num">${icon('phone', { size: 16 })}${l.phone}</span>
      </a></li>`)}
  </ul>`;

/* ---------- The route plate ---------- */

// The base sheet: water, coast, land, graticule and neatline. Written once to assets/map.svg by
// build.mjs and loaded as an image, so both pages that show the plate share one cached file.
// Everything that moves or is read (lanes, yards, place names) is drawn over it by routePlate().
export const plateSvg = () => {
  const { width: W, height: H, margin: M } = MAP;
  const tick = [];
  for (const e of MAP.edges.lat) {
    if (e.left != null) tick.push(`M${M - 9} ${e.left}H${M}`);
    if (e.right != null) tick.push(`M${W - M} ${e.right}h9`);
  }
  for (const e of MAP.edges.lon) {
    if (e.top != null) tick.push(`M${e.top} ${M - 9}V${M}`);
    if (e.bottom != null) tick.push(`M${e.bottom} ${H - M}v9`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs><clipPath id="f"><rect x="${M}" y="${M}" width="${W - 2 * M}" height="${H - 2 * M}"/></clipPath><path id="l" d="${MAP.land}"/></defs>
<rect x="${M}" y="${M}" width="${W - 2 * M}" height="${H - 2 * M}" fill="#DCE6E4"/>
<g clip-path="url(#f)" fill="none" stroke-linejoin="round">
<use href="#l" stroke="#CEDBD9" stroke-width="26"/><use href="#l" stroke="#C2D2D1" stroke-width="15"/><use href="#l" stroke="#B3C7C7" stroke-width="6"/>
<use href="#l" fill="#EFE9DC" stroke="#56706F" stroke-width=".9"/>
<path d="${MAP.alaska}" fill="#FBF8F1" stroke="#12201B" stroke-width="1.1"/><path d="${MAP.washington}" fill="#FBF8F1" stroke="#12201B" stroke-width="1.1"/>
<path d="${MAP.graticule}" stroke="#1E4A57" stroke-opacity=".22" stroke-width=".8"/>
<path d="${MAP.arcticCircle}" stroke="#1E4A57" stroke-opacity=".6" stroke-width=".9" stroke-dasharray="7 5"/>
<path d="${MAP.borders}" stroke="#12201B" stroke-opacity=".45" stroke-width=".9" stroke-dasharray="9 4 2 4"/>
</g>
<rect x="${M}" y="${M}" width="${W - 2 * M}" height="${H - 2 * M}" fill="none" stroke="#12201B" stroke-width="1.2"/>
<rect x="${M - 6}" y="${M - 6}" width="${W - 2 * M + 12}" height="${H - 2 * M + 12}" fill="none" stroke="#12201B" stroke-width="2.4"/>
<path d="${tick.join('')}" stroke="#12201B" stroke-width="1.2" fill="none"/>
</svg>`;
};
export const mapSvg = plateSvg;

const LANE_ORDER = [
  ['sea', 'sea', 0.1], ['passage', 'sea sea--minor', 0.3], ['passage2', 'sea sea--minor', 0.6],
  ['road', 'road', 0.5], ['road4', 'road road--minor', 0.6], ['road2', 'road road--minor', 0.8], ['road3', 'road road--minor', 0.95],
];
const BARGE_ORDER = [['barge', 0.9], ['barge2', 1.5], ['barge3', 1.4], ['barge4', 1.8], ['barge5', 2.1]];

// title: the cartouche text. finder: adds region hooks so the Alaska page's list can light up places.
export const routePlate = (ctx, { title = 'Puget Sound to the Arctic coast', no = 'Plate I', id = 'plate', eager = false } = {}) => {
  const { width: W, height: H, margin: M } = MAP;
  const at = ([x, y]) => `left:${((x / W) * 100).toFixed(2)}%;top:${((y / H) * 100).toFixed(2)}%`;
  const alt = `Map of the route north. Uresco distribution centers at Kent, Washington, and Anchorage and Fairbanks, Alaska. Ocean freight runs from Puget Sound across the Gulf of Alaska to Anchorage, with the Inside Passage serving Southeast Alaska. The road system links Anchorage, the Kenai Peninsula, Valdez, Tok and Fairbanks, and continues north to Deadhorse. Seasonal barge lanes reach western and Arctic Alaska. Example destinations: ${MAP.towns.map((t) => t.name).join(', ')}.`;
  const draw = (d, cls, delay) => `<path class="lane ${cls}" d="${d}" pathLength="1" style="--d:${delay}s"/>`;
  return html`
  <figure class="plate" id="${id}" data-plate>
    <div class="plate__scroll">
      <div class="plate__sheet">
        <img class="plate__base" src="${ctx.u('assets/map.svg')}?v=${ctx.version}" width="${W}" height="${H}" alt="${alt}"${raw(eager ? '' : ' loading="lazy"')} decoding="async">
        <svg class="plate__lanes" viewBox="0 0 ${W} ${H}" aria-hidden="true" focusable="false">
          <defs>
            <mask id="${id}-bm" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">${raw(BARGE_ORDER.map(([k, d]) => `<path class="lane lane--mask" d="${MAP.lanes[k]}" pathLength="1" style="--d:${d}s"/>`).join(''))}</mask>
            <mask id="${id}-am" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">${raw(MAP.air.map((d, i) => `<path class="lane lane--mask" d="${d}" pathLength="1" style="--d:${2.2 + i * 0.15}s"/>`).join(''))}</mask>
          </defs>
          ${raw(LANE_ORDER.filter(([, c]) => c.startsWith('road')).map(([k, c, d]) => draw(MAP.lanes[k], c.replace('road', 'roadbed'), d)).join(''))}
          ${raw(LANE_ORDER.map(([k, c, d]) => draw(MAP.lanes[k], c, d)).join(''))}
          <g mask="url(#${id}-bm)">${raw(BARGE_ORDER.map(([k]) => `<path class="barge" d="${MAP.lanes[k]}"/>`).join(''))}</g>
          <g mask="url(#${id}-am)">${raw(MAP.air.map((d) => `<path class="air" d="${d}"/>`).join(''))}</g>
          ${raw(MAP.towns.map((t) => `<circle class="town" data-region="${t.region}" cx="${t.xy[0]}" cy="${t.xy[1]}" r="4"/>`).join(''))}
          ${raw(MAP.yards.map((y) => `<g class="yardmark" data-region="${y.id === 'kent' ? 'pnw' : y.id === 'anchorage' ? 'southcentral' : 'interior'}"><circle class="yardmark__pulse" cx="${y.xy[0]}" cy="${y.xy[1]}" r="20"/><circle class="yardmark__disc" cx="${y.xy[0]}" cy="${y.xy[1]}" r="10"/><circle class="yardmark__dot" cx="${y.xy[0]}" cy="${y.xy[1]}" r="3.2"/></g>`).join(''))}
          <g class="compass" transform="translate(${MAP.compass.xy[0]} ${MAP.compass.xy[1]}) rotate(${MAP.compass.north})">
            <circle r="34"/><circle r="26" class="compass__in"/>
            <path class="compass__star" d="M0-46 6-6 46 0 6 6 0 46-6 6-46 0-6-6Z"/><path class="compass__north" d="M0-46 6-6H-6Z"/>
            <path class="compass__ticks" d="M0-34V-30M0 34V30M-34 0H-30M34 0H30M24 24 21.2 21.2M-24 24-21.2 21.2M24-24 21.2-21.2M-24-24-21.2-21.2"/>
          </g>
          <g class="scalebar" transform="translate(${M + 26} ${H - M - 30})">
            <path d="M0 0H${(MAP.mile100 * 2).toFixed(1)}M0-6V0M${MAP.mile100}-6V0M${(MAP.mile100 * 2).toFixed(1)}-6V0"/><path class="scalebar__fill" d="M0-3H${MAP.mile100}"/>
          </g>
        </svg>
        <div class="plate__labels">
          ${MAP.seas.map((s) => html`<span class="plate__sea" aria-hidden="true" style="${at(s.xy)}">${s.name}</span>`)}
          ${MAP.lands.map((s) => html`<span class="plate__land" aria-hidden="true" style="${at(s.xy)}">${s.name}</span>`)}
          <span class="plate__circle" aria-hidden="true" style="${at(MAP.arcticLabel)}">Arctic Circle</span>
          ${MAP.edges.lat.map((e) => html`${e.left != null ? html`<span class="plate__deg plate__deg--l" aria-hidden="true" style="top:${((e.left / H) * 100).toFixed(2)}%">${e.deg}°</span>` : ''}${e.right != null ? html`<span class="plate__deg plate__deg--r" aria-hidden="true" style="top:${((e.right / H) * 100).toFixed(2)}%">${e.deg}°</span>` : ''}`)}
          ${MAP.edges.lon.map((e) => html`${e.top != null ? html`<span class="plate__deg plate__deg--t" aria-hidden="true" style="left:${((e.top / W) * 100).toFixed(2)}%">${e.deg}°W</span>` : ''}${e.bottom != null ? html`<span class="plate__deg plate__deg--b" aria-hidden="true" style="left:${((e.bottom / W) * 100).toFixed(2)}%">${e.deg}°W</span>` : ''}`)}
          <span class="plate__scale" aria-hidden="true" style="left:${(((M + 26) / W) * 100).toFixed(2)}%;top:${(((H - M - 22) / H) * 100).toFixed(2)}%">0 · 100 · 200 miles at 60°N</span>
          ${MAP.towns.map((t) => html`<span class="plate__town plate__town--r${t.rank}" aria-hidden="true" data-side="${t.side}" data-region="${t.region}" style="${at(t.xy)}">${t.name}</span>`)}
          ${MAP.yards.map((y) => html`<a class="plate__yard" data-side="${y.side || 'e'}" style="${at(y.xy)}" href="${ctx.u('locations/')}#${y.id}"><b>${y.name}</b><span>${deg(LAT[y.id])}</span><span class="sr-only"> yard details</span></a>`)}
          <div class="plate__title" aria-hidden="true"><span>${no}</span><b>The route north</b><i>${title}</i></div>
        </div>
      </div>
    </div>
    <figcaption class="plate__legend">
      <p class="plate__hint">${icon('arrow', { size: 16 })} Drag the map sideways to follow the lane south to Kent.</p>
      <ul>
        <li><i class="lg lg--yard"></i>Uresco yard</li>
        <li><i class="lg lg--sea"></i>Ocean freight</li>
        <li><i class="lg lg--road"></i>Road system</li>
        <li><i class="lg lg--barge"></i>Barge, ice-free season</li>
        <li><i class="lg lg--air"></i>Air, year-round</li>
        <li><i class="lg lg--town"></i>Example destinations</li>
      </ul>
      <p>Lanes are drawn to show how freight generally moves. They are not carrier routes or schedules.</p>
    </figcaption>
  </figure>`;
};
export const deliveryMap = (ctx, opts) => routePlate(ctx, opts);

// Full-width photograph with a single line under it: a change of pace between dense sections.
export const interlude = (ctx, key, { line, note, place, lat, pos } = {}) => html`
  <section class="interlude">
    <div class="interlude__frame rv-img" data-parallax>${picture(ctx, key, { art: true, sizes: '100vw', pos })}</div>
    <div class="wrap interlude__text">
      ${line ? html`<p class="interlude__line rv">${raw(line)}</p>` : ''}
      <p class="fig__cap">${note ? html`<span>${note}</span>` : ''}${place ? html`<span class="fig__place">${place}${lat ? html` · ${deg(lat)}` : ''}</span>` : ''}</p>
    </div>
  </section>`;

export { SITE, address, MAP };
