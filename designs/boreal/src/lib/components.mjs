import { readFileSync } from 'fs';
import { html, raw } from './html.mjs';
import { icon } from './icons.mjs';
import { LOCATIONS, tel, address, mapsUrl, hoursLines, hoursAttr, tzLabel, latLabel } from '../data/locations.mjs';
import { PLACES, ALIASES, ACCESS, EXAMPLE } from '../data/places.mjs';
import { SITE } from '../config.mjs';

const PHOTOS = JSON.parse(readFileSync(new URL('../data/photos.generated.json', import.meta.url), 'utf8'));
const MAP = JSON.parse(readFileSync(new URL('../data/map.json', import.meta.url), 'utf8'));

export const photo = (key) => {
  const p = PHOTOS[key];
  if (!p) throw new Error(`Unknown photo "${key}" — add it to scripts/photos.json and run npm run images`);
  return p;
};

// Portrait screens can get the 3:4 crop made by scripts/images.py instead of a stretched landscape file.
const PORTRAIT = '(max-aspect-ratio: 1/1)';
const LANDSCAPE = '(min-aspect-ratio: 1001/1000)';
const setOf = (ctx, key, prefix, widths) => widths.map((w) => `${ctx.u(`assets/img/${key}${prefix}-${w}.webp`)} ${w}w`).join(', ');

// Responsive image. `sizes` must describe the width the image is really drawn at, including any
// extra width object-fit: cover needs in a tall box. `art` adds the portrait crop on portrait screens.
export const picture = (ctx, key, { sizes = '100vw', cls = '', eager = false, alt, art = false, artSizes = '100vw' } = {}) => {
  const p = photo(key);
  const mid = p.widths.find((w) => w >= 1200) || p.widths[p.widths.length - 1];
  const img = html`<img class="${cls}" src="${ctx.u(`assets/img/${key}-${mid}.webp`)}" srcset="${setOf(ctx, key, '', p.widths)}" sizes="${sizes}" width="${p.width}" height="${p.height}" alt="${alt ?? p.alt}"${raw(eager ? ' fetchpriority="high"' : ' loading="lazy"')} decoding="async"${raw(` style="${p.focal ? `object-position:${p.focal};` : ''}background-color:${p.color || '#12272e'}"`)}>`;
  if (!art || !p.portrait?.length) return img;
  return html`<picture><source media="${PORTRAIT}" srcset="${setOf(ctx, key, '-p', p.portrait)}" sizes="${artSizes}" width="${p.pwidth}" height="${p.pheight}">${img}</picture>`;
};

// Preload hint for a page hero photo. Pass art: true only where the hero uses the portrait crop.
export const HERO_SIZES = '(min-width: 1000px) 56vw, 100vw';
export const preloadFor = (ctx, key, { sizes = HERO_SIZES, art = false, artSizes = '100vw' } = {}) => {
  const p = photo(key);
  const both = art && p.portrait?.length;
  const landscape = { srcset: setOf(ctx, key, '', p.widths), sizes, media: both ? LANDSCAPE : null };
  return both ? [{ srcset: setOf(ctx, key, '-p', p.portrait), sizes: artSizes, media: PORTRAIT }, landscape] : [landscape];
};

// Live open/closed badge; filled in by the hours script in the yard's own time zone. Hidden without JS.
export const openStatus = (l, { short = false } = {}) =>
  l.hours ? html`<span class="status" data-hours="${hoursAttr(l)}"${short ? html` data-short` : ''} hidden></span>` : '';

// The yard's local time, ticking once a minute. Empty without JS.
export const clock = (l) => (l.hours ? html`<span class="clock" data-clock="${l.hours.tz}"></span>` : '');

// Section eyebrow: a small mono label. (`stamp` is the name the older pages call it by.)
export const eyebrow = (text) => html`<p class="eyebrow">${text}</p>`;
export const stamp = (text) => eyebrow(text);

// Headline on the left; supporting text and link on the right, so sections read as a spread.
// <em> in a title is the second, quieter tone of a two-tone headline.
export const sectionHead = ({ eyebrow: eb, title, lede, action, level = 2 }) => html`
  <div class="shead${lede || action ? '' : ' shead--solo'}">
    <div class="shead__main">
      ${eb ? eyebrow(eb) : ''}
      ${raw(`<h${level} class="h2">`)}${raw(title)}${raw(`</h${level}>`)}
    </div>
    ${lede || action ? html`<div class="shead__aside">
      ${lede ? html`<p class="lede">${lede}</p>` : ''}
      ${action || ''}
    </div>` : ''}
  </div>`;

// Inner-page hero: words on the left, one large rounded photograph on the right with a place caption.
export const pageHero = (ctx, { eyebrow: eb, title, lede, photoKey, actions = '', crumbs = [], caption }) => html`
  <section class="phero">
    <div class="wrap phero__grid">
      <div class="phero__copy">
        ${crumbs.length ? html`<nav class="crumbs" aria-label="Breadcrumb"><ol>
          <li><a href="${ctx.u('')}">Home</a></li>
          ${crumbs.map(([label, href]) => html`<li>${href ? html`<a href="${ctx.u(href)}">${label}</a>` : html`<span aria-current="page">${label}</span>`}</li>`)}
        </ol></nav>` : ''}
        ${eb ? eyebrow(eb) : ''}
        <h1 class="display">${raw(title)}</h1>
        ${lede ? html`<p class="phero__lede">${lede}</p>` : ''}
        ${actions ? html`<div class="actions">${actions}</div>` : ''}
      </div>
      <figure class="phero__media frame">
        ${picture(ctx, photoKey, { eager: true, sizes: HERO_SIZES })}
        ${caption ? html`<figcaption class="frame__cap">${caption}</figcaption>` : ''}
      </figure>
    </div>
  </section>`;

// Closing call to action: a dark card under northern light.
export const quoteBand = (ctx, { title = 'Send plans. <em>Get a take-off.</em>', body = 'Upload drawings or a list and the yard nearest your project builds the take-off: every stick, panel and connector, priced and ready to order.', eyebrow: eb = 'Estimates & take-offs' } = {}) => html`
  <section class="cta">
      <div class="cta__card">
        <div class="cta__copy">
          ${eyebrow(eb)}
          <h2 class="h2">${raw(title)}</h2>
          <p>${body}</p>
          <div class="actions">
            <a class="btn btn--lg" href="${ctx.u('quote/')}">Request a quote ${icon('arrow', { size: 18 })}</a>
            <button type="button" class="btn btn--lg btn--glass" data-open="call-sheet" aria-haspopup="dialog">${icon('phone', { size: 18 })} Call a yard</button>
          </div>
        </div>
        <figure class="cta__media frame">${picture(ctx, 'blueprints', { sizes: '(min-width: 900px) 40vw, 100vw' })}</figure>
      </div>
  </section>`;

// A yard as a live card: status, local time, one-tap call. `compact` drops fax, email and hours.
export const yardCard = (ctx, l, { showPhoto = true, headingLevel = 3, compact = false, photoSizes = '(min-width: 1000px) 33vw, 100vw' } = {}) => {
  const H = `h${headingLevel}`;
  return html`
  <article class="ycard reveal${compact ? ' ycard--compact' : ''}" id="${l.id}">
    ${showPhoto ? html`<div class="ycard__media">${picture(ctx, l.photo, { sizes: photoSizes })}
      <span class="ycard__lat">${latLabel(l)}</span>
      <span class="ycard__note">${l.photoNote}</span>
    </div>` : ''}
    <div class="ycard__body">
      <div class="ycard__top">
        ${raw(`<${H} class="ycard__city">`)}${l.city}<span>, ${l.state}</span>${raw(`</${H}>`)}
        ${openStatus(l, { short: true })}
      </div>
      <p class="ycard__role">${l.role}</p>
      <a class="ycard__phone" href="${tel(l.phone)}"><span class="sr-only">Call ${l.city}: </span>${l.phone}</a>
      <dl class="ycard__facts">
        ${l.hours ? html`<div><dt>Local time</dt><dd>${clock(l)} <span class="ycard__tz">${tzLabel(l)}</span></dd></div>` : ''}
        <div><dt>Call for</dt><dd>${l.callFor}</dd></div>
        <div><dt>Address</dt><dd><address>${l.street}<br>${l.city}, ${l.state} ${l.zip}</address></dd></div>
        ${compact ? '' : html`
        ${l.tollFree ? html`<div><dt>Toll-free</dt><dd><a href="${tel(l.tollFree)}">${l.tollFree}</a></dd></div>` : ''}
        ${l.fax ? html`<div><dt>Fax</dt><dd>${l.fax}</dd></div>` : ''}
        <div><dt>Email</dt><dd><a href="mailto:${l.email}">${l.email}</a></dd></div>
        ${l.hours ? html`<div><dt>Hours</dt><dd>${hoursLines(l).map((h) => html`${h}<br>`)}</dd></div>` : ''}
        ${l.mailing ? html`<div><dt>Mail</dt><dd>${l.mailing}</dd></div>` : ''}`}
      </dl>
      <div class="ycard__acts">
        <a class="btn" href="${tel(l.phone)}">${icon('phone', { size: 17 })} Call ${l.city}</a>
        <a class="btn btn--line" href="${mapsUrl(l)}" target="_blank" rel="noopener">${icon('directions', { size: 17 })} Directions<span class="sr-only"> to the ${l.city} yard (opens a map)</span></a>
      </div>
      <a class="ycard__quote link" href="${ctx.u('quote/')}?yard=${l.id}">Get a quote from ${l.city} ${icon('arrow', { size: 16 })}</a>
    </div>
  </article>`;
};

/* ------------------------------------------------------------------------------------------
   The map.
   src/data/map.json is a real projection made by scripts/map.mjs (canvas 1800 × 1000).
   - mapSvg() is the base drawing: graticule, land, Alaska and Washington. build.mjs writes it
     to assets/map.svg, so it is one cached image (and the home page's largest paint).
   - mapPlate() lays the live parts over it: lanes, the route arc, yards, place dots and labels,
     all positioned in the same 1800 × 1000 space so the camera can move them as one.
   ------------------------------------------------------------------------------------------ */
const W = MAP.width, H = MAP.height;
const at = ([x, y]) => `left:${((x / W) * 100).toFixed(2)}%;top:${((y / H) * 100).toFixed(2)}%`;

export const mapSvg = () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs><linearGradient id="us" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#27525B"/><stop offset="1" stop-color="#1B3E46"/></linearGradient><path id="land" d="${MAP.land}"/></defs>
<path d="${MAP.graticule}" fill="none" stroke="#A9DCE8" stroke-opacity=".075"/>
<g fill="none" stroke="#7FC4D9" stroke-linejoin="round"><use href="#land" stroke-width="22" stroke-opacity=".035"/><use href="#land" stroke-width="11" stroke-opacity=".05"/><use href="#land" stroke-width="4" stroke-opacity=".07"/></g>
<use href="#land" fill="#10262D" stroke="#2C4B54" stroke-width=".8"/>
<g fill="url(#us)" stroke="#6FA9B6" stroke-width="1" stroke-linejoin="round"><path d="${MAP.alaska}"/><path d="${MAP.washington}"/></g>
</svg>`;

const MAP_ALT = `Map of the corridor Uresco serves: yards in Kent, Washington, and Anchorage and Fairbanks, Alaska; ocean freight from Puget Sound across the Gulf of Alaska; the Alaska road system north to Deadhorse; and seasonal barge lanes to western and Arctic Alaska.`;

// A gentle arc from a yard to a place: who serves it, not the path freight takes.
export const arcPath = ([x1, y1], [x2, y2]) => {
  const dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy) || 1;
  const lift = Math.min(90, d * 0.22);
  // Bulge toward the top of the map.
  const nx = -dy / d, ny = dx / d, s = ny > 0 ? -1 : 1;
  const cx = (x1 + x2) / 2 + nx * lift * s, cy = (y1 + y2) / 2 + ny * lift * s;
  return `M${x1.toFixed(1)},${y1.toFixed(1)}Q${cx.toFixed(1)},${cy.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`;
};

const placeOf = (name) => PLACES.find((p) => p.name === name);
const xyOf = (name) => MAP.places.find((p) => p.name === name).xy;
const yardXy = (id) => MAP.yards.find((y) => y.id === id).xy;
const stateName = { AK: 'Alaska', WA: 'Washington' };
const coords = (p) => `${Math.abs(p.lat).toFixed(2)}° N, ${Math.abs(p.lon).toFixed(2)}° W`;

export const mapPlate = (ctx, { eager = false, example = null, dots = true } = {}) => {
  const ex = example && placeOf(example);
  return html`
  <div class="map" data-map>
    <div class="map__cam" data-cam>
      <img class="map__base" src="${ctx.u('assets/map.svg')}?v=${ctx.version}" width="${W}" height="${H}" alt="${MAP_ALT}"${raw(eager ? ' fetchpriority="high"' : ' loading="lazy"')} decoding="async">
      <svg class="map__lanes" viewBox="0 0 ${W} ${H}" aria-hidden="true" focusable="false">
        <g class="lane lane--road">${MAP.roads.map((d) => raw(`<path d="${d}"/>`))}</g>
        <g class="lane lane--barge">${MAP.barges.map((d) => raw(`<path d="${d}"/>`))}</g>
        <path class="lane lane--inside" d="${MAP.inside}"/>
        <path class="lane lane--sea" d="${MAP.sea}" pathLength="100"/>
        <path class="lane lane--pulse" d="${MAP.sea}" pathLength="100"/>
        <path class="map__arc" data-arc pathLength="1" d="${ex ? arcPath(yardXy(ex.yard), xyOf(ex.name)) : 'M0,0'}"/>
      </svg>
      <div class="map__pins">
        ${MAP.gratLabels.map((g) => html`<span class="map__grat" aria-hidden="true" style="${at(g.xy)}">${g.t}</span>`)}
        ${dots ? PLACES.map((p) => html`<button type="button" class="map__dot${ex && p.name === ex.name ? ' is-dest' : ''}" tabindex="-1" aria-hidden="true" data-place="${p.name}" style="${at(xyOf(p.name))}">${p.label ? html`<span class="map__name" data-side="${p.label}">${p.name}</span>` : ''}</button>`) : ''}
        ${MAP.yards.map((y) => { const l = LOCATIONS.find((x) => x.id === y.id); return html`<a class="map__yard" data-side="${ex && ex.yard === y.id ? (xyOf(ex.name)[0] >= y.xy[0] ? 'w' : 'e') : y.side}"${ex && ex.yard === y.id ? html` data-on` : ''} data-home="${y.side}" data-yard="${y.id}" style="${at(y.xy)}" href="${ctx.path === '' ? '' : ctx.u('locations/')}#${y.id}"><i class="map__beacon"></i><span class="map__tag"><b>${y.name}</b>${openStatus(l, { short: true })}<span class="sr-only"> yard details</span></span></a>`; })}
        <span class="map__dest" data-dest data-side="${ex && xyOf(ex.name)[0] < yardXy(ex.yard)[0] ? 'w' : 'e'}" data-vside="${ex && xyOf(ex.name)[1] > yardXy(ex.yard)[1] + 12 ? 's' : 'n'}" style="${ex ? at(xyOf(ex.name)) : ''}"${ex ? '' : html` hidden`}><i></i><span class="map__tag map__tag--dest" data-dest-name>${ex ? ex.name : ''}</span></span>
      </div>
    </div>
  </div>`;
};

const legend = ({ places = true } = {}) => html`
  <ul class="legend" aria-label="Map legend">
    <li><i class="lg lg--yard"></i>Uresco yard</li>
    <li><i class="lg lg--sea"></i>Ocean freight</li>
    <li><i class="lg lg--road"></i>Road system</li>
    <li><i class="lg lg--barge"></i>Seasonal barge</li>
    ${places ? html`<li class="legend__note">Lanes are illustrative</li>` : ''}
  </ul>`;

// Everything the finder script needs, as data: places in map space, who to call, what to say.
const finderData = (ctx) => JSON.stringify({
  w: W, h: H,
  quote: ctx.u('quote/'),
  example: EXAMPLE,
  aliases: ALIASES,
  states: stateName,
  access: Object.fromEntries(Object.entries(ACCESS).map(([k, v]) => [k, { tag: v.tag, modes: v.modes }])),
  yards: Object.fromEntries(MAP.yards.map((y) => { const l = LOCATIONS.find((x) => x.id === y.id); return [y.id, { name: l.city, phone: l.phone, xy: y.xy }]; })),
  places: PLACES.map((p) => [p.name, p.st, xyOf(p.name), p.lat, p.lon, p.region, p.access, p.yard]),
}).replace(/</g, '\\u003c');

const CHIPS = ['Bethel', 'Nome', 'Utqiaġvik', 'Sitka', 'Kodiak', 'Tacoma'];
const MODE_ICONS = ['truck', 'ship', 'plane', 'pin'];

// The "Where are you building?" panel: a combobox over the places list, and the route card it fills.
// The card is rendered here for the example place, so the first paint is complete and nothing shifts
// when the script takes over. Without JavaScript the panel is a plain list of the three yards.
export const finder = (ctx, { label = 'Where are you building?', labelledby = null } = {}) => {
  const n = ctx.uid();
  const ex = placeOf(EXAMPLE);
  const acc = ACCESS[ex.access];
  const yard = LOCATIONS.find((l) => l.id === ex.yard);
  const modeText = (m) => m[1].replace('{yard}', yard.city);
  return html`
  <div class="finder" data-finder>
    <script type="application/json" data-finder-data>${raw(finderData(ctx))}</script>
    <div class="finder__search jsonly">
      ${labelledby ? '' : html`<label class="finder__label" for="finder-${n}">${label}</label>`}
      <div class="finder__field">
        ${icon('search', { size: 20 })}
        <input class="finder__input" id="finder-${n}" type="text" role="combobox" aria-expanded="false" aria-controls="finder-list-${n}" aria-autocomplete="list"${labelledby ? html` aria-labelledby="${labelledby}"` : ''} autocomplete="off" autocapitalize="words" spellcheck="false" enterkeyhint="search" placeholder="Town, village or city">
        <button type="button" class="finder__clear" data-clear hidden>${icon('close', { size: 16 })}<span class="sr-only">Clear the search</span></button>
        <ul class="finder__list" id="finder-list-${n}" role="listbox" aria-label="Places" hidden></ul>
      </div>
      <div class="finder__chips" role="group" aria-label="Example places">
        <span class="finder__try" aria-hidden="true">Try</span>
        ${CHIPS.map((c) => html`<button type="button" class="chip" data-place="${c}" aria-pressed="${c === EXAMPLE ? 'true' : 'false'}">${c}</button>`)}
      </div>
    </div>

    <div class="route jsonly" data-route>
      <div class="route__head">
        <div>
          <p class="route__name"><span data-r="name">${ex.name}, ${stateName[ex.st]}</span> <span class="route__eg" data-r="eg">Example</span></p>
          <p class="route__meta"><span data-r="region">${ex.region}</span><span class="route__tag" data-r="tag">${acc.tag}</span></p>
        </div>
        <p class="route__coords" data-r="coords">${coords(ex)}</p>
      </div>
      <div class="route__yard">
        ${LOCATIONS.map((l) => html`<div class="route__y" data-y="${l.id}"${l.id === ex.yard ? '' : html` hidden`}>
          <p class="route__who"><span class="route__lab">Yard to call</span><b>${l.city}</b> ${openStatus(l, { short: true })}</p>
          <a class="btn btn--dark" href="${tel(l.phone)}">${icon('phone', { size: 16 })}<span class="sr-only">Call ${l.city}: </span>${l.phone}</a>
        </div>`)}
        <div class="route__y" data-y="any" hidden>
          <p class="route__who"><span class="route__lab">Yard to call</span><b>Any of the three</b></p>
          <button type="button" class="btn btn--dark" data-open="call-sheet" aria-haspopup="dialog">${icon('phone', { size: 16 })} Call a yard</button>
        </div>
      </div>
      <div class="route__how" data-r="how">
        <p class="route__lab">How freight typically gets there</p>
        <ul class="route__modes">
          ${[0, 1].map((i) => html`<li>${MODE_ICONS.map((k) => html`<span class="route__ic" data-ic="${i}-${k}"${acc.modes[i]?.[0] === k ? '' : html` hidden`}>${icon(k, { size: 18 })}</span>`)}<span data-r="m${i}">${acc.modes[i] ? modeText(acc.modes[i]) : ''}</span></li>`)}
        </ul>
      </div>
      <p class="route__else" data-r="else" hidden>That is not on our short list, which does not mean we cannot get there. Send the details and a yard will work out the route.</p>
      <a class="btn btn--block route__quote" data-r="quote" href="${ctx.u('quote/')}?location=${encodeURIComponent(`${ex.name}, ${ex.st}`)}&amp;yard=${ex.yard}">Get a quote for <span data-r="short">${ex.name}</span> ${icon('arrow', { size: 18 })}</a>
      <p class="route__note" data-r="note">Typical for the region, not a schedule or a price. Any yard can help.</p>
    </div>
    <p class="sr-only" data-live aria-live="polite"></p>

    <div class="finder__nojs nojs">
      <p class="finder__label">Call the yard nearest your job</p>
      <ul class="finder__yards">
        ${LOCATIONS.map((l) => html`<li><span><b>${l.city}, ${l.state}</b><small>${l.callFor}</small></span><a href="${tel(l.phone)}">${l.phone}</a></li>`)}
      </ul>
      <a class="btn btn--block" href="${ctx.u('quote/')}">Request a quote ${icon('arrow', { size: 18 })}</a>
    </div>
  </div>`;
};

// The dark "screen" that holds the map and the finder: the home hero, and a section on the Alaska page.
export const routeStage = (ctx, { copy, variant = 'hero', eager = false, labelledby = null, label } = {}) => html`
  <div class="stage stage--${variant}" data-stage>
    <div class="stage__sky" aria-hidden="true"></div>
    <div class="stage__map">
      ${mapPlate(ctx, { eager, example: EXAMPLE })}
      <button type="button" class="stage__reset jsonly" data-reset hidden>${icon('expand', { size: 16 })} Whole map</button>
    </div>
    <div class="stage__ui">
      ${copy ? html`<div class="stage__copy">${copy}</div>` : ''}
      ${finder(ctx, { labelledby, label })}
    </div>
    ${legend()}
  </div>`;

// The map on its own (Locations page): a figure, no finder.
export const deliveryMap = (ctx) => html`
  <figure class="stage stage--figure">
    <div class="stage__sky" aria-hidden="true"></div>
    <div class="stage__map">${mapPlate(ctx, { dots: false })}</div>
    <figcaption>${legend({ places: false })}</figcaption>
  </figure>`;

// A wide rounded photograph with one line over it: a change of pace between dense sections.
export const interlude = (ctx, key, { line, note } = {}) => html`
  <section class="interlude">
      <figure class="interlude__frame frame">
        ${picture(ctx, key, { art: true, sizes: '98vw', artSizes: '96vw' })}
        <figcaption class="interlude__text">
          <p class="interlude__line">${raw(line)}</p>
          ${note ? html`<p class="interlude__note">${note}</p>` : ''}
        </figcaption>
      </figure>
  </section>`;

export { SITE, address };
