import { readFileSync } from 'fs';
import { html, raw } from './html.mjs';
import { icon } from './icons.mjs';
import { LOCATIONS, tel, mapsUrl, hoursLines, hoursAttr, tzLabel } from '../data/locations.mjs';
import { PLACES, ALIASES, ACCESS, EXAMPLE } from '../data/places.mjs';

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
  const img = html`<img class="${cls}" src="${ctx.u(`assets/img/${key}-${mid}.webp`)}" srcset="${setOf(ctx, key, '', p.widths)}" sizes="${sizes}" width="${p.width}" height="${p.height}" alt="${alt ?? p.alt}"${raw(eager ? ' fetchpriority="high"' : ' loading="lazy"')} decoding="async"${raw(` style="${p.focal ? `object-position:${p.focal};` : ''}background-color:${p.color || '#1A1A17'}"`)}>`;
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
export const openStatus = (l) =>
  l.hours ? html`<span class="status" data-hours="${hoursAttr(l)}" hidden></span>` : '';

// The yard's local time, ticking once a minute. Empty without JS.
export const clock = (l) => (l.hours ? html`<span class="clock" data-clock="${l.hours.tz}"></span>` : '');

// Section eyebrow: a small mono label.
export const eyebrow = (text) => html`<p class="eyebrow">${text}</p>`;

// Headline on the left; supporting text and link on the right, so sections read as a spread.
// <em> in a title is the second, quieter tone of a two-tone headline.
export const sectionHead = ({ eyebrow: eb, title, lede, action, level = 2, id }) => html`
  <div class="shead${lede || action ? '' : ' shead--solo'}">
    <div class="shead__main">
      ${eb ? eyebrow(eb) : ''}
      ${raw(`<h${level} class="h2"${id ? ` id="${id}"` : ''}>`)}${raw(title)}${raw(`</h${level}>`)}
    </div>
    ${lede || action ? html`<div class="shead__aside">
      ${lede ? html`<p class="lede">${lede}</p>` : ''}
      ${action || ''}
    </div>` : ''}
  </div>`;

// "Call a yard": opens the call sheet with all three numbers. A link underneath, so without JavaScript
// it goes to the Locations page instead of doing nothing.
export const callLink = (ctx, { cls = 'btn--line', label = 'Call a yard', size = 18 } = {}) =>
  html`<a class="btn ${cls}" href="${ctx.u('locations/')}" data-open="call-sheet" aria-haspopup="dialog">${icon('phone', { size })} ${label}</a>`;

// Who took a photograph, for the caption. Nearly every photo on the site is stock: saying so keeps
// any of them from being read as Uresco's own yard, truck, crew or job.
export const photoCredit = (key) => {
  const c = photo(key).credit;
  return c ? html`<small class="frame__credit">Photo: ${c}</small>` : '';
};

// Inner-page hero: words on the left, one large rounded photograph on the right with a place caption.
// Slots: `eyebrowAside` sits beside the eyebrow, `note` after the lede, `figure` inside the photograph
// (it replaces the caption, so bring your own), `cls` goes on the section.
export const pageHero = (ctx, { eyebrow: eb, title, lede, photoKey, actions = '', crumbs = [], caption, cls = '', eyebrowAside = '', note = '', figure = '' }) => html`
  <section class="phero${cls ? ' ' + cls : ''}">
    <div class="wrap phero__grid">
      <div class="phero__copy">
        ${crumbs.length ? html`<nav class="crumbs" aria-label="Breadcrumb"><ol>
          <li><a href="${ctx.u('')}">Home</a></li>
          ${crumbs.map(([label, href]) => html`<li>${href ? html`<a href="${ctx.u(href)}">${label}</a>` : html`<span aria-current="page">${label}</span>`}</li>`)}
        </ol></nav>` : ''}
        ${eyebrowAside ? html`<div class="phero__row">${eb ? eyebrow(eb) : ''}${eyebrowAside}</div>` : (eb ? eyebrow(eb) : '')}
        <h1 class="display">${raw(title)}</h1>
        ${lede ? html`<p class="phero__lede">${lede}</p>` : ''}
        ${note}
        ${actions ? html`<div class="actions">${actions}</div>` : ''}
      </div>
      <figure class="phero__media frame">
        ${picture(ctx, photoKey, { eager: true, sizes: HERO_SIZES })}
        ${figure || (caption ? html`<figcaption class="frame__cap">${caption}${photoCredit(photoKey)}</figcaption>` : '')}
      </figure>
    </div>
  </section>`;

// A material list with the quantities still to come: the visitor sends the left column, the yard helps fill in the
// right one. Drawn, so it says what a take-off is where a stock photo of hands on plans could only decorate.
const TAKEOFF_ROWS = ['Framing lumber', 'Sheathing & panels', 'I-joists & beams', 'Windows & doors', 'Hardware & fasteners'];
export const takeoffSheet = (items = TAKEOFF_ROWS) => html`
  <div class="takeoff" aria-hidden="true">
    <p class="takeoff__bar"><span>Material take-off</span><span>Qty</span></p>
    <ul>${items.slice(0, 5).map((t) => html`<li><span>${t}</span><i></i></li>`)}</ul>
    <p class="takeoff__note">We help fill in this column</p>
  </div>`;

// Closing call to action: a dark screen with the words, and a take-off waiting to be filled in. `href` and `label`
// change the primary button; `actions` replaces it outright; `call: false` drops the Call a yard button beside it (for a
// band that already shows the numbers); `items` are the sheet's rows (five at most); `media` swaps the sheet for your own element.
export const quoteBand = (ctx, { title = 'Send plans. <em>Get a take-off.</em>', body = 'Send drawings or a list. We help with the take-off and the estimate, and we will quote the package and work out the freight with you.', eyebrow: eb = 'Estimates & take-offs', href, label = 'Request a quote', actions = '', call = true, items, media = '' } = {}) => html`
  <section class="cta">
      <div class="cta__card">
        <div class="cta__copy">
          ${eyebrow(eb)}
          <h2 class="h2">${raw(title)}</h2>
          <p>${body}</p>
          <div class="actions">
            ${actions || html`<a class="btn btn--lg" href="${href || ctx.u('quote/')}">${label} ${icon('arrow', { size: 18 })}</a>`}
            ${call ? callLink(ctx, { cls: 'btn--lg btn--glass' }) : ''}
          </div>
        </div>
        ${media || takeoffSheet(items)}
      </div>
  </section>`;

// A yard as a live card: status, local time, one-tap call. `compact` drops toll-free, fax, email and mail, and links to
// the yard's own card on the Locations page instead; `contact` keeps the fax and email on a compact card. A yard card
// has no photograph: every picture we have of those places is a stock postcard, and the rules forbid one beside a
// yard's name. Yard hours are placeholders, so they are printed on the Locations page and nowhere else.
export const yardCard = (ctx, l, { headingLevel = 3, compact = false, contact = false, hours = ctx.path === 'locations/' } = {}) => {
  const H = `h${headingLevel}`;
  const fax = l.fax ? html`<div><dt>Fax</dt><dd>${l.fax}</dd></div>` : '';
  const email = html`<div><dt>Email</dt><dd><a href="mailto:${l.email}">${l.email}</a></dd></div>`;
  return html`
  <article class="ycard reveal${compact ? ' ycard--compact' : ''}" id="${l.id}">
    <div class="ycard__body">
      <div class="ycard__top">
        ${raw(`<${H} class="ycard__city">`)}${l.city}<span>, ${l.state}</span>${raw(`</${H}>`)}
        ${openStatus(l)}
      </div>
      <p class="ycard__role">${l.role}</p>
      <a class="ycard__phone" href="${tel(l.phone)}"><span class="sr-only">Call ${l.city}: </span>${l.phone}</a>
      <dl class="ycard__facts">
        ${l.hours ? html`<div><dt>Local time</dt><dd>${clock(l)} <span class="ycard__tz">${tzLabel(l)}</span></dd></div>` : ''}
        <div><dt>Call for</dt><dd>${l.serves}</dd></div>
        <div><dt>Address</dt><dd><address>${l.street}<br>${l.city}, ${l.state} ${l.zip}</address></dd></div>
        ${compact ? (contact ? html`${fax}${email}` : '') : html`
        ${l.tollFree ? html`<div><dt>Toll-free</dt><dd><a href="${tel(l.tollFree)}">${l.tollFree}</a></dd></div>` : ''}
        ${fax}${email}
        ${hours && l.hours ? html`<div><dt>Hours</dt><dd>${hoursLines(l).map((h) => html`${h}<br>`)}</dd></div>` : ''}
        ${l.mailing ? html`<div><dt>Mail</dt><dd>${l.mailing}</dd></div>` : ''}`}
      </dl>
      <div class="ycard__acts">
        <a class="btn" href="${tel(l.phone)}">${icon('phone', { size: 17 })} Call ${l.city}</a>
        <a class="btn btn--line" href="${mapsUrl(l)}" target="_blank" rel="noopener">${icon('directions', { size: 17 })} Directions<span class="sr-only"> to the ${l.city} yard (opens a map)</span></a>
      </div>
      <div class="ycard__links">
        <a class="ycard__quote link" href="${ctx.u('quote/')}?yard=${l.id}">Request a quote from ${l.city} ${icon('arrow', { size: 16 })}</a>
        ${compact ? html`<a class="ycard__more link" href="${ctx.u('locations/')}#${l.id}">Email and fax<span class="sr-only"> for ${l.city}</span> ${icon('arrow', { size: 16 })}</a>` : ''}
      </div>
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
<defs><linearGradient id="us" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#32444A"/><stop offset="1" stop-color="#262F31"/></linearGradient><path id="land" d="${MAP.land}"/></defs>
<path d="${MAP.graticule}" fill="none" stroke="#E3E7E6" stroke-opacity=".07"/>
<g fill="none" stroke="#C9D2D2" stroke-linejoin="round"><use href="#land" stroke-width="22" stroke-opacity=".025"/><use href="#land" stroke-width="11" stroke-opacity=".04"/><use href="#land" stroke-width="4" stroke-opacity=".06"/></g>
<use href="#land" fill="#1A1C1A" stroke="#3A403F" stroke-width=".8"/>
<g fill="url(#us)" stroke="#8FA2A6" stroke-width="1" stroke-linejoin="round"><path d="${MAP.alaska}"/><path d="${MAP.washington}"/></g>
</svg>`;

const MAP_ALT = `Map of the corridor Uresco serves: yards in Kent, Washington, and Anchorage and Fairbanks, Alaska; ocean freight from Puget Sound across the Gulf of Alaska; the Alaska road system north to Deadhorse; and seasonal barge lanes to western and Arctic Alaska.`;

// A gentle arc from a yard to a place: who to call, not the path freight takes. It is dashed and has its own
// legend entry, so nobody reads it as a route across land.
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

// `marker` drops the destination marker somewhere that is not a place: { left, top, name } in percent of the map.
export const mapPlate = (ctx, { eager = false, example = null, dots = true, marker = null } = {}) => {
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
        <path class="map__arc" data-arc d="${ex ? arcPath(yardXy(ex.yard), xyOf(ex.name)) : 'M0,0'}"/>
      </svg>
      <div class="map__pins">
        ${MAP.gratLabels.filter((g) => g.xy[0] > 800).map((g) => html`<span class="map__grat" aria-hidden="true" style="${at(g.xy)}">${g.t}</span>`)}
        ${dots ? PLACES.map((p) => html`<button type="button" class="map__dot${ex && p.name === ex.name ? ' is-dest' : ''}" tabindex="-1" aria-hidden="true" data-place="${p.name}" style="${at(xyOf(p.name))}">${p.label ? html`<span class="map__name" data-side="${p.label}">${p.name}</span>` : ''}</button>`) : ''}
        ${MAP.yards.map((y) => { const l = LOCATIONS.find((x) => x.id === y.id); return html`<a class="map__yard" data-side="${ex && ex.yard === y.id ? (xyOf(ex.name)[0] >= y.xy[0] ? 'w' : 'e') : y.side}"${ex && ex.yard === y.id ? html` data-on` : ''} data-home="${y.side}" data-yard="${y.id}" style="${at(y.xy)}" href="${ctx.path === '' ? '' : ctx.u('locations/')}#${y.id}"><i class="map__beacon"></i><span class="map__tag"><b>${y.name}</b>${openStatus(l)}<span class="sr-only"> yard details</span></span></a>`; })}
        <span class="map__dest" data-dest data-side="${ex && xyOf(ex.name)[0] < yardXy(ex.yard)[0] ? 'w' : 'e'}" data-vside="${ex && xyOf(ex.name)[1] > yardXy(ex.yard)[1] + 12 ? 's' : 'n'}" style="${ex ? at(xyOf(ex.name)) : marker ? `left:${marker.left}%;top:${marker.top}%` : ''}"${ex || marker ? '' : html` hidden`}><i></i><span class="map__tag map__tag--dest" data-dest-name>${ex ? ex.name : marker ? marker.name : ''}</span></span>
      </div>
    </div>
  </div>`;
};

// The key to a map. `items` are [swatch, label]: swatches are yard, sea, road, barge and arc (.lg--*).
const LANES = [['yard', 'Uresco yard'], ['sea', 'Ocean freight'], ['road', 'Road system'], ['barge', 'Seasonal barge']];
export const legend = ({ items = LANES, note = 'Lanes are illustrative' } = {}) => html`
  <ul class="legend" aria-label="Map legend">
    ${items.map(([swatch, label]) => html`<li><i class="lg lg--${swatch}"></i>${label}</li>`)}
    ${note ? html`<li class="legend__note">${note}</li>` : ''}
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
        <button type="button" class="finder__go" data-go hidden>Go</button>
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
          <p class="route__who"><span class="route__lab">Yard to call</span><b>${l.city}</b> ${openStatus(l)}</p>
          <a class="btn btn--dark" href="${tel(l.phone)}">${icon('phone', { size: 16 })}<span class="sr-only">Call ${l.city}: </span>${l.phone}</a>
        </div>`)}
        <div class="route__y route__y--any" data-y="any" hidden>
          <p class="route__lab">Yard to call</p>
          <ul class="route__guide">
            ${LOCATIONS.map((l) => html`<li><span><b>${l.city}</b><small>${l.serves}</small></span><a class="btn btn--line" href="${tel(l.phone)}">${icon('phone', { size: 16 })}<span class="sr-only">Call ${l.city}: </span>${l.phone}</a></li>`)}
          </ul>
        </div>
      </div>
      <div class="route__how" data-r="how">
        <p class="route__lab">How freight typically gets there</p>
        <ul class="route__modes">
          ${[0, 1].map((i) => html`<li>${MODE_ICONS.map((k) => html`<span class="route__ic" data-ic="${i}-${k}"${acc.modes[i]?.[0] === k ? '' : html` hidden`}>${icon(k, { size: 18 })}</span>`)}<span data-r="m${i}">${acc.modes[i] ? modeText(acc.modes[i]) : ''}</span></li>`)}
        </ul>
      </div>
      <p class="route__else" data-r="else" hidden>That is not on our short list, which does not mean we cannot get there. Send the details and a yard will work out the route.</p>
      <a class="btn btn--block route__quote" data-r="quote" href="${ctx.u('quote/')}?location=${encodeURIComponent(`${ex.name}, ${ex.st}`)}&amp;yard=${ex.yard}">Request a quote for <span data-r="short">${ex.name}</span> ${icon('arrow', { size: 18 })}</a>
      <p class="route__note" data-r="note">Typical for the region, not a schedule or a price. Any yard can help.</p>
    </div>
    <p class="sr-only" data-live aria-live="polite"></p>

    <div class="finder__nojs nojs">
      <p class="finder__label">Call the yard nearest your job</p>
      <ul class="finder__yards">
        ${LOCATIONS.map((l) => html`<li><span><b>${l.city}, ${l.state}</b><small>${l.serves}</small></span><a href="${tel(l.phone)}">${l.phone}</a></li>`)}
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
    ${legend({ items: [...LANES, ['arc', 'Yard to call']] })}
  </div>`;

// A wide rounded photograph with one line over it: a change of pace between dense sections.
export const interlude = (ctx, key, { line, note } = {}) => html`
  <section class="interlude">
      <figure class="interlude__frame frame">
        ${picture(ctx, key, { art: true, sizes: '98vw', artSizes: '96vw' })}
        <figcaption class="interlude__text">
          <p class="interlude__line">${raw(line)}</p>
          ${note ? html`<p class="interlude__note">${note}${photoCredit(key)}</p>` : ''}
        </figcaption>
      </figure>
  </section>`;
