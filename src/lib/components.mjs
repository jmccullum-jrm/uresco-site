import { readFileSync } from 'fs';
import { html, raw } from './html.mjs';
import { icon } from './icons.mjs';
import { LOCATIONS, tel, address, mapsUrl } from '../data/locations.mjs';
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
  return html`<img class="${cls}" src="${ctx.u(`assets/img/${key}-${mid}.webp`)}" srcset="${srcset}" sizes="${sizes}" width="${p.width}" height="${p.height}" alt="${alt ?? p.alt}"${raw(eager ? ' fetchpriority="high"' : ' loading="lazy"')} decoding="async"${raw(p.focal ? ` style="object-position:${p.focal}"` : '')}>`;
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
        ${l.hours ? html`<div><dt>Hours</dt><dd>${l.hours}</dd></div>` : ''}
        ${l.mailing ? html`<div><dt>Mail</dt><dd>${l.mailing}</dd></div>` : ''}
      </dl>
      <div class="yard__actions">
        <a class="btn btn--sm" href="${tel(l.phone)}">${icon('phone', { size: 16 })} Call</a>
        <a class="btn btn--sm btn--line" href="${mapsUrl(l)}" target="_blank" rel="noopener">${icon('directions', { size: 16 })} Directions</a>
      </div>
    </div>
  </article>`;
};

// The delivery corridor: Natural Earth land projected in scripts/map.mjs.
export const deliveryMap = ({ id = 'map', compact = false } = {}) => {
  const W = MAP.width, H = MAP.height;
  const anchor = (side) => ({ w: 'end', e: 'start', n: 'middle', s: 'middle' }[side] || 'start');
  const dx = (side) => ({ w: -10, e: 10, n: 0, s: 0 }[side] ?? 10);
  const dy = (side) => ({ n: -11, s: 20 }[side] ?? 5);
  return html`
  <figure class="dmap${compact ? ' dmap--compact' : ''}">
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="${id}-t ${id}-d" class="dmap__svg">
      <title id="${id}-t">Uresco delivery map</title>
      <desc id="${id}-d">Distribution centers in Kent, Washington, and Anchorage and Fairbanks, Alaska, with ocean freight from Puget Sound to Southcentral Alaska, the road system north to the Arctic, and barge lanes to western Alaska communities.</desc>
      <defs>
        <pattern id="${id}-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" class="dmap__grid"/></pattern>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#${id}-grid)"/>
      <path class="dmap__land" d="${MAP.land}"/>
      <path class="dmap__state" d="${MAP.alaska}"/>
      <path class="dmap__state" d="${MAP.washington}"/>
      <path class="dmap__border" d="${MAP.borders}"/>
      <path class="dmap__lane dmap__lane--sea" d="${MAP.sea}" pathLength="1"/>
      <path class="dmap__lane dmap__lane--barge" d="${MAP.barge}"/>
      <path class="dmap__lane dmap__lane--barge" d="${MAP.barge2}"/>
      <path class="dmap__lane dmap__lane--road" d="${MAP.road}"/>
      <g class="dmap__towns">
        ${MAP.towns.map((t) => html`<g transform="translate(${t.xy[0]} ${t.xy[1]})"><circle r="4"/>${compact ? '' : html`<text x="${dx(t.side)}" y="${dy(t.side)}" text-anchor="${anchor(t.side)}">${t.name}</text>`}</g>`)}
      </g>
      <g class="dmap__yards">
        ${MAP.yards.map((y) => html`<g transform="translate(${y.xy[0]} ${y.xy[1]})"><circle class="dmap__pulse" r="22"/><circle r="11"/><circle class="dmap__dot" r="4.5"/><text x="${(y.side || 'e') === 'w' ? -20 : 20}" y="7" text-anchor="${(y.side || 'e') === 'w' ? 'end' : 'start'}">${y.name}</text></g>`)}
      </g>
    </svg>
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
        <span class="ystrip__city">${l.city}<small>${l.state}</small></span>
        <span class="ystrip__num">${icon('phone', { size: 16 })}${l.phone}</span>
      </a></li>`)}
  </ul>`;

export { SITE, address };
