import { readFileSync } from 'fs';
import { html, raw } from './html.mjs';
import { icon } from './icons.mjs';
import { LOCATIONS, tel, address, mapsUrl, hoursLines, hoursAttr, tzLabel } from '../data/locations.mjs';
import { SITE } from '../config.mjs';

const PHOTOS = JSON.parse(readFileSync(new URL('../data/photos.generated.json', import.meta.url), 'utf8'));
const MAP = JSON.parse(readFileSync(new URL('../data/map.json', import.meta.url), 'utf8'));

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
// extra width object-fit: cover needs in a tall box. `art` adds the portrait crop for page heroes.
export const picture = (ctx, key, { sizes = '100vw', cls = '', eager = false, alt, art = false, artSizes = '100vw' } = {}) => {
  const p = photo(key);
  const mid = p.widths.find((w) => w >= 1200) || p.widths[p.widths.length - 1];
  const img = html`<img class="${cls}" src="${ctx.u(`assets/img/${key}-${mid}.webp`)}" srcset="${setOf(ctx, key, '', p.widths)}" sizes="${sizes}" width="${p.width}" height="${p.height}" alt="${alt ?? p.alt}"${raw(eager ? ' fetchpriority="high"' : ' loading="lazy"')} decoding="async"${raw(` style="${p.focal ? `object-position:${p.focal};` : ''}background-color:${p.color || '#22211e'}"`)}>`;
  if (!art || !p.portrait?.length) return img;
  return html`<picture><source media="${PORTRAIT}" srcset="${setOf(ctx, key, '-p', p.portrait)}" sizes="${artSizes}" width="${p.pwidth}" height="${p.pheight}">${img}</picture>`;
};

// Preload hints for a hero: one per crop, so a phone never fetches the landscape file too.
export const preloadFor = (ctx, key, { sizes = '100vw', artSizes = '100vw' } = {}) => {
  const p = photo(key);
  const landscape = { srcset: setOf(ctx, key, '', p.widths), sizes, media: p.portrait?.length ? LANDSCAPE : null };
  return p.portrait?.length ? [{ srcset: setOf(ctx, key, '-p', p.portrait), sizes: artSizes, media: PORTRAIT }, landscape] : [landscape];
};

// Live open/closed badge; filled in by site.js in the yard's own time zone. Hidden without JS.
export const openStatus = (l, { short = false } = {}) =>
  l.hours ? html`<span class="status" data-hours="${hoursAttr(l)}"${short ? html` data-short` : ''} hidden></span>` : '';

// Section eyebrow styled after a lumber grade stamp.
export const stamp = (text, { dark = false } = {}) =>
  html`<p class="stamp${dark ? ' stamp--dark' : ''}">${text}</p>`;

// Headline on the left; supporting text and link on the right, so sections read as a spread.
export const sectionHead = ({ eyebrow, title, lede, dark = false, action }) => html`
  <div class="shead${lede || action ? '' : ' shead--solo'}">
    <div class="shead__title">
      ${eyebrow ? stamp(eyebrow, { dark }) : ''}
      <h2 class="h2">${raw(title)}</h2>
    </div>
    ${lede || action ? html`<div class="shead__aside">
      ${lede ? html`<p class="lede">${lede}</p>` : ''}
      ${action || ''}
    </div>` : ''}
  </div>`;

export const pageHero = (ctx, { eyebrow, title, lede, photoKey, actions = '', crumbs = [] }) => html`
  <section class="phero">
    <div class="phero__media">${picture(ctx, photoKey, { eager: true, art: true })}</div>
    <div class="wrap phero__inner">
      ${crumbs.length ? html`<nav class="crumbs" aria-label="Breadcrumb"><ol>
        <li><a href="${ctx.u('')}">Home</a></li>
        ${crumbs.map(([label, href]) => html`<li>${href ? html`<a href="${ctx.u(href)}">${label}</a>` : html`<span aria-current="page">${label}</span>`}</li>`)}
      </ol></nav>` : ''}
      ${eyebrow ? stamp(eyebrow, { dark: true }) : ''}
      <h1 class="display">${raw(title)}</h1>
      ${lede ? html`<p class="phero__lede">${lede}</p>` : ''}
      ${actions ? html`<div class="actions">${actions}</div>` : ''}
    </div>
  </section>`;

export const quoteBand = (ctx, { title = 'Send plans. <em>Get a take-off.</em>', body = 'Upload drawings or a list and the yard nearest your project will build the take-off — every stick, panel and connector, priced and ready to order.' } = {}) => html`
  <section class="qband">
    <div class="qband__media">${picture(ctx, 'blueprints', { sizes: '(min-width: 900px) 75vw, 100vw' })}</div>
    <div class="wrap qband__inner">
      <div class="qband__card">
        ${stamp('Estimates & take-offs')}
        <h2 class="h2">${raw(title)}</h2>
        <p>${body}</p>
        <div class="actions">
          <a class="btn btn--dark" href="${ctx.u('quote/')}">Request a quote ${icon('arrow', { size: 18 })}</a>
          <button type="button" class="btn btn--line" data-open="call-sheet">${icon('phone', { size: 18 })} Call a yard</button>
        </div>
      </div>
    </div>
  </section>`;

export const yardCard = (ctx, l, { showPhoto = true, headingLevel = 3, compact = false, photoSizes = '(min-width: 1000px) 33vw, (min-width: 600px) 100vw, 100vw' } = {}) => {
  const H = `h${headingLevel}`;
  return html`
  <article class="yard${compact ? ' yard--compact' : ''}"${compact ? '' : html` id="${l.id}"`}>
    ${showPhoto ? html`<div class="yard__media">${picture(ctx, l.photo, { sizes: photoSizes })}<span class="yard__badge">${l.region}</span></div>` : ''}
    <div class="yard__body">
      ${raw(`<${H} class="yard__city">`)}${l.city}<span>, ${l.state}</span>${raw(`</${H}>`)}
      ${compact ? '' : html`<p class="yard__role">${l.role}</p>`}
      <address class="yard__addr">${icon('pin', { size: 18 })}<span>${l.street}<br>${l.city}, ${l.state} ${l.zip}</span></address>
      ${compact
        ? html`<p class="yard__hours">${hoursLines(l)[0] || ''} ${openStatus(l)}</p>`
        : html`<dl class="yard__lines">
        <div><dt>Phone</dt><dd><a href="${tel(l.phone)}">${l.phone}</a></dd></div>
        ${l.tollFree ? html`<div><dt>Toll-free</dt><dd><a href="${tel(l.tollFree)}">${l.tollFree}</a></dd></div>` : ''}
        ${l.fax ? html`<div><dt>Fax</dt><dd>${l.fax}</dd></div>` : ''}
        <div><dt>Email</dt><dd><a href="mailto:${l.email}">${l.email}</a></dd></div>
        ${l.hours ? html`<div><dt>Hours</dt><dd>${hoursLines(l).map((h) => html`${h}<br>`)}<small>${tzLabel(l)}</small> ${openStatus(l)}</dd></div>` : ''}
        ${l.mailing ? html`<div><dt>Mail</dt><dd>${l.mailing}</dd></div>` : ''}
      </dl>`}
      <div class="yard__actions">
        <a class="btn btn--sm" href="${tel(l.phone)}">${icon('phone', { size: 16 })} ${compact ? l.phone : 'Call'}</a>
        <a class="btn btn--sm btn--line" href="${mapsUrl(l)}" target="_blank" rel="noopener">${icon('directions', { size: 16 })} Directions</a>
      </div>
      ${compact ? '' : html`<a class="yard__quote" href="${ctx.u('quote/')}?yard=${l.id}">Get a quote from ${l.city} ${icon('arrow', { size: 16 })}</a>`}
    </div>
  </article>`;
};

// The delivery corridor: Natural Earth land projected in scripts/map.mjs.
// The drawing is a cached image (assets/map.svg, written by build.mjs from mapSvg());
// place names are HTML laid over it, so they stay legible at any size and use the site fonts.
export const mapSvg = () => {
  const W = MAP.width, H = MAP.height;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<style>
.g{stroke:rgba(190,214,226,.1);stroke-width:1;fill:none}.land{fill:#1E2528}.st{fill:#3A3831;stroke:#6B655A;stroke-width:1.3}
.b{fill:none;stroke:#4A4C49;stroke-width:1;stroke-dasharray:3 4}.l{fill:none;stroke-width:2.6;stroke-linecap:round}
.sea{stroke:#F5B800;stroke-dasharray:10 8}.road{stroke:#F2EEE5;stroke-width:2.4}.barge{stroke:#F5B800;stroke-dasharray:1 7;stroke-width:3.2}
.t{fill:#F2EEE5}.y{fill:#F5B800}.yd{fill:#0E0E0C}.p{fill:#F5B800;opacity:.25;transform-box:fill-box;transform-origin:center}
@media (prefers-reduced-motion:no-preference){.sea{animation:lane 30s linear infinite}.p{animation:pulse 2.6s cubic-bezier(.2,.7,.1,1) infinite}}
@keyframes lane{to{stroke-dashoffset:-360}}@keyframes pulse{0%{transform:scale(.4);opacity:.55}100%{transform:scale(1.6);opacity:0}}
</style>
<path class="land" d="${MAP.land}"/><path class="g" d="${MAP.graticule}"/><path class="st" d="${MAP.alaska}"/><path class="st" d="${MAP.washington}"/><path class="b" d="${MAP.borders}"/>
<path class="l sea" d="${MAP.sea}"/><path class="l barge" d="${MAP.barge}"/><path class="l barge" d="${MAP.barge2}"/><path class="l road" d="${MAP.road}"/>
${MAP.towns.map((t) => `<circle class="t" cx="${t.xy[0]}" cy="${t.xy[1]}" r="4.5"/>`).join('')}
${MAP.yards.map((y) => `<circle class="p" cx="${y.xy[0]}" cy="${y.xy[1]}" r="22"/><circle class="y" cx="${y.xy[0]}" cy="${y.xy[1]}" r="11"/><circle class="yd" cx="${y.xy[0]}" cy="${y.xy[1]}" r="4.5"/>`).join('')}
</svg>`;
};

export const deliveryMap = (ctx, { compact = false } = {}) => {
  const W = MAP.width, H = MAP.height;
  const at = ([x, y]) => `left:${((x / W) * 100).toFixed(2)}%;top:${((y / H) * 100).toFixed(2)}%`;
  const alt = `Map of Uresco’s delivery reach: distribution centers in Kent, Washington, and Anchorage and Fairbanks, Alaska; ocean freight from Puget Sound to Southcentral Alaska; the road system north to Deadhorse; and barge lanes to western Alaska communities including ${MAP.towns.map((t) => t.name).join(', ')}.`;
  return html`
  <figure class="dmap${compact ? ' dmap--compact' : ''}">
    <div class="dmap__canvas">
      <img src="${ctx.u('assets/map.svg')}?v=${ctx.version}" width="${W}" height="${H}" alt="${alt}" loading="lazy" decoding="async">
      <div class="dmap__labels">
        ${compact ? '' : MAP.towns.map((t) => html`<span class="dmap__town" aria-hidden="true" data-side="${t.side}" style="${at(t.xy)}">${t.name}</span>`)}
        ${MAP.yards.map((y) => html`<a class="dmap__yard" data-side="${y.side || 'e'}" style="${at(y.xy)}" href="${ctx.u('locations/')}#${y.id}" aria-label="${y.name} yard details">${y.name}</a>`)}
      </div>
    </div>
    <figcaption class="dmap__legend">
      <span><i class="lg lg--yard"></i>Uresco yard</span>
      <span><i class="lg lg--sea"></i>Ocean freight</span>
      <span><i class="lg lg--road"></i>Road system</span>
      <span><i class="lg lg--barge"></i>Barge &amp; air</span>
      ${compact ? '' : html`<span><i class="lg lg--town"></i>Example destinations</span>`}
    </figcaption>
  </figure>`;
};

// Full-width photograph with a single line over it: a change of pace between dense sections.
export const interlude = (ctx, key, { line, note } = {}) => html`
  <section class="interlude">
    ${picture(ctx, key, { art: true, sizes: 'max(100vw, 120vh)' })}
    <div class="wrap interlude__text">
      <p class="interlude__line">${raw(line)}</p>
      ${note ? html`<p class="interlude__note">${note}</p>` : ''}
    </div>
  </section>`;

export const yardsStrip = (ctx) => html`
  <ul class="ystrip">
    ${LOCATIONS.map((l) => html`<li>
      <a href="${tel(l.phone)}" class="ystrip__item">
        <span class="ystrip__city"><b>${l.city}</b><small>${l.state}</small>${openStatus(l, { short: true })}</span>
        <span class="ystrip__num">${icon('phone', { size: 16 })}${l.phone}</span>
      </a></li>`)}
  </ul>`;

export { SITE, address };
