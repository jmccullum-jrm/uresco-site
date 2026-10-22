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

// Responsive image. `sizes` should describe the rendered width; eager is for the hero only.
export const picture = (ctx, key, { sizes = '100vw', cls = '', eager = false, alt } = {}) => {
  const p = photo(key);
  const srcset = p.widths.map((w) => `${ctx.u(`assets/img/${key}-${w}.webp`)} ${w}w`).join(', ');
  const mid = p.widths.find((w) => w >= 1200) || p.widths[p.widths.length - 1];
  return html`<img class="${cls}" src="${ctx.u(`assets/img/${key}-${mid}.webp`)}" srcset="${srcset}" sizes="${sizes}" width="${p.width}" height="${p.height}" alt="${alt ?? p.alt}"${raw(eager ? ' fetchpriority="high"' : ' loading="lazy"')} decoding="async"${raw(` style="${p.focal ? `object-position:${p.focal};` : ''}background-color:${p.color || '#22211e'}"`)}>`;
};

export const preloadFor = (ctx, key, sizes = '100vw') => {
  const p = photo(key);
  const mid = p.widths.find((w) => w >= 1200) || p.widths[p.widths.length - 1];
  return {
    src: ctx.u(`assets/img/${key}-${mid}.webp`),
    srcset: p.widths.map((w) => `${ctx.u(`assets/img/${key}-${w}.webp`)} ${w}w`).join(', '),
    sizes,
  };
};

// Live open/closed badge; filled in by site.js in the yard's own time zone. Hidden without JS.
export const openStatus = (l, { short = false } = {}) =>
  l.hours ? html`<span class="status" data-hours="${hoursAttr(l)}"${short ? html` data-short` : ''} hidden></span>` : '';

// Section eyebrow styled after a lumber grade stamp.
export const stamp = (text, { dark = false, no } = {}) =>
  html`<p class="stamp${dark ? ' stamp--dark' : ''}">${no ? html`<span class="stamp__no">${no}</span>` : ''}${text}</p>`;

export const sectionHead = ({ eyebrow, no, title, lede, dark = false, align = 'left', action }) => html`
  <div class="shead shead--${align}">
    <div class="shead__text">
      ${eyebrow ? stamp(eyebrow, { dark, no }) : ''}
      <h2 class="h2">${raw(title)}</h2>
      ${lede ? html`<p class="lede">${lede}</p>` : ''}
    </div>
    ${action || ''}
  </div>`;

export const pageHero = (ctx, { eyebrow, title, lede, photoKey, actions = '', crumbs = [] }) => html`
  <section class="phero">
    <div class="phero__media">${picture(ctx, photoKey, { eager: true, sizes: '100vw' })}</div>
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
    <div class="qband__media">${picture(ctx, 'blueprints', { sizes: '(min-width: 900px) 50vw, 100vw' })}</div>
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

export const yardCard = (ctx, l, { showPhoto = true, headingLevel = 3 } = {}) => {
  const H = `h${headingLevel}`;
  return html`
  <article class="yard" id="${l.id}">
    ${showPhoto ? html`<div class="yard__media">${picture(ctx, l.photo, { sizes: '(min-width: 1000px) 33vw, 100vw' })}<span class="yard__badge">${l.region}</span></div>` : ''}
    <div class="yard__body">
      ${raw(`<${H} class="yard__city">`)}${l.city}<span>, ${l.state}</span>${raw(`</${H}>`)}
      <p class="yard__role">${l.role}</p>
      <address class="yard__addr">${icon('pin', { size: 18 })}<span>${l.street}<br>${l.city}, ${l.state} ${l.zip}</span></address>
      <dl class="yard__lines">
        <div><dt>Phone</dt><dd><a href="${tel(l.phone)}">${l.phone}</a></dd></div>
        ${l.tollFree ? html`<div><dt>Toll-free</dt><dd><a href="${tel(l.tollFree)}">${l.tollFree}</a></dd></div>` : ''}
        ${l.fax ? html`<div><dt>Fax</dt><dd>${l.fax}</dd></div>` : ''}
        <div><dt>Email</dt><dd><a href="mailto:${l.email}">${l.email}</a></dd></div>
        ${l.hours ? html`<div><dt>Hours</dt><dd>${hoursLines(l).map((h) => html`${h}<br>`)}<small>${tzLabel(l)}</small> ${openStatus(l)}</dd></div>` : ''}
        ${l.mailing ? html`<div><dt>Mail</dt><dd>${l.mailing}</dd></div>` : ''}
      </dl>
      <div class="yard__actions">
        <a class="btn btn--sm" href="${tel(l.phone)}">${icon('phone', { size: 16 })} Call</a>
        <a class="btn btn--sm btn--line" href="${mapsUrl(l)}" target="_blank" rel="noopener">${icon('directions', { size: 16 })} Directions</a>
      </div>
      <a class="yard__quote" href="${ctx.u('quote/')}?yard=${l.id}">Get a quote from ${l.city} ${icon('arrow', { size: 16 })}</a>
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
.g{stroke:rgba(242,238,229,.05);stroke-width:1;fill:none}.land{fill:#1B1A17}.st{fill:#26241F;stroke:#45413A;stroke-width:1.2}
.b{fill:none;stroke:#3A3731;stroke-width:1;stroke-dasharray:3 4}.l{fill:none;stroke-width:2.4;stroke-linecap:round}
.sea{stroke:#F5B800;stroke-dasharray:10 8}.road{stroke:#F2EEE5;stroke-width:2.2}.barge{stroke:#F5B800;stroke-dasharray:1 7;stroke-width:3}
.t{fill:#F2EEE5}.y{fill:#F5B800}.yd{fill:#0E0E0C}.p{fill:#F5B800;opacity:.25;transform-box:fill-box;transform-origin:center}
@media (prefers-reduced-motion:no-preference){.sea{animation:lane 30s linear infinite}.p{animation:pulse 2.6s cubic-bezier(.2,.7,.1,1) infinite}}
@keyframes lane{to{stroke-dashoffset:-360}}@keyframes pulse{0%{transform:scale(.4);opacity:.55}100%{transform:scale(1.6);opacity:0}}
</style>
<defs><pattern id="g" width="40" height="40" patternUnits="userSpaceOnUse"><path class="g" d="M40 0H0V40"/></pattern></defs>
<rect width="${W}" height="${H}" fill="url(#g)"/>
<path class="land" d="${MAP.land}"/><path class="st" d="${MAP.alaska}"/><path class="st" d="${MAP.washington}"/><path class="b" d="${MAP.borders}"/>
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
      <div class="dmap__labels" aria-hidden="true">
        ${compact ? '' : MAP.towns.map((t) => html`<span class="dmap__town" data-side="${t.side}" style="${at(t.xy)}">${t.name}</span>`)}
        ${MAP.yards.map((y) => html`<span class="dmap__yard" data-side="${y.side || 'e'}" style="${at(y.xy)}">${y.name}</span>`)}
      </div>
    </div>
    <figcaption class="dmap__legend">
      <span><i class="lg lg--yard"></i>Uresco distribution center</span>
      <span><i class="lg lg--sea"></i>Ocean freight</span>
      <span><i class="lg lg--road"></i>Road system</span>
      <span><i class="lg lg--barge"></i>Barge &amp; air to rural communities</span>
      ${compact ? '' : html`<span><i class="lg lg--town"></i>Example destinations</span>`}
    </figcaption>
  </figure>`;
};

export const yardsStrip = (ctx) => html`
  <ul class="ystrip">
    ${LOCATIONS.map((l) => html`<li>
      <a href="${tel(l.phone)}" class="ystrip__item">
        <span class="ystrip__city">${l.city}<small>${l.state}</small>${openStatus(l, { short: true })}</span>
        <span class="ystrip__num">${icon('phone', { size: 16 })}${l.phone}</span>
      </a></li>`)}
  </ul>`;

export { SITE, address };
