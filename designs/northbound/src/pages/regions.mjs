import { html, raw } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';
import { layout, orgJsonLd } from '../lib/layout.mjs';
import { picture, preloadFor, pageHero, sectionHead, chapterHead, figure, closing, stockFrame, stockList, routePlate, openStatus, deg, latOf, LAT, MAP } from '../lib/components.mjs';
import { LOCATIONS, byId, tel, mapsUrl, hoursLines, tzLabel } from '../data/locations.mjs';
import { BRANDS } from '../data/products.mjs';

const kent = byId('kent');
const two = (n) => String(n).padStart(2, '0');

/* ---------- Pacific Northwest ---------- */

// The two machines, drawn as a side elevation on a blueprint sheet. Numbers tie the drawing to the
// three steps printed under it; the steps carry the whole meaning, so the drawing is decoration.
const mk = (n, x, y) => `<g class="pnw-mk"><circle cx="${x}" cy="${y}" r="12"/><text x="${x}" y="${y + 5}">${n}</text></g>`;
const wheel = (x, y, r) => `<circle class="ln" pathLength="1" cx="${x}" cy="${y}" r="${r}"/><circle class="ln ln--thin" pathLength="1" cx="${x}" cy="${y}" r="${Math.round(r * 0.3)}"/>`;
const ln = (d, cls = '') => `<path class="ln ${cls}" pathLength="1" d="${d}"/>`;
const bundle = (x, y, w, h) => `<path class="load" d="M${x} ${y}h${w}v${h}h${-w}z"/><path class="load__band" d="M${x + w * 0.25} ${y}v${h}M${x + w * 0.75} ${y}v${h}"/>`;
const svg = (body) => raw(`<svg viewBox="0 0 480 300" aria-hidden="true" focusable="false">${body}</svg>`);

const RIG_BOOM = svg([
  ln('M4 254H300V244H476'),
  '<path class="hatch" d="M8 262H296M306 252H476"/>',
  // Truck, facing left.
  ln('M30 214H290'), ln('M36 214V156L50 134H96V214'), ln('M54 142H88V172H43', 'ln--thin'), ln('M104 200H290V214'),
  wheel(70, 236, 18), wheel(226, 236, 18), wheel(266, 236, 18),
  ln('M284 214V252M276 254H292'),
  // Boom.
  ln('M108 200V176H130V200'), ln('M119 176 122 120', 'ln--thick'), ln('M122 120 236 62', 'ln--thick'),
  '<circle class="ln" pathLength="1" cx="236" cy="62" r="6"/>',
  ln('M236 62 372 86', 'ln--thick'), ln('M372 86V128', 'ln--thin'), ln('M372 128 328 146M372 128 416 146', 'ln--thin'),
  // The load: where it was, the way it swung, where it is, where it goes.
  '<path class="dash" d="M150 160h96v40h-96z"/>',
  '<path class="dots" d="M198 156C226 112 318 110 366 142"/>',
  bundle(324, 146, 96, 40),
  ln('M372 191V199M368 195l4 4 4-4', 'ln--thin'),
  '<path class="dash" d="M324 204h96v40h-96z"/>',
  // The work beyond the curb.
  ln('M436 244V150M452 244V150M468 244V150M430 150H474M430 244H474', 'ln--thin'),
  mk(1, 198, 180), mk(2, 296, 120), mk(3, 372, 224),
].join(''));

const RIG_MOFFETT = svg([
  ln('M4 254H208C222 248 236 258 250 253S280 247 300 254 340 258 362 252 420 250 476 254'),
  '<path class="hatch" d="M8 262H204"/>',
  // The back of the truck, and the forklift's place on it.
  ln('M0 214H128'), ln('M0 200H128V214'), wheel(38, 236, 18), wheel(86, 236, 18),
  '<path class="dash" d="M134 214V166H186V214ZM194 118V246M196 196H226"/>',
  '<circle class="dash" cx="150" cy="232" r="14"/>',
  // The way it drove.
  '<path class="dots" d="M196 246C206 240 214 244 226 246"/>',
  // The forklift, carrying.
  ln('M226 216H372', 'ln--thick'), ln('M228 216V182H274V216'), ln('M276 216V140H338L352 216'), ln('M268 140H346'),
  ln('M296 216V192H314', 'ln--thin'), ln('M332 190 316 180', 'ln--thin'),
  wheel(244, 236, 18), wheel(356, 234, 20),
  ln('M384 252V96', 'ln--thick'), ln('M394 252V104', 'ln--thin'), ln('M384 96H394'), ln('M386 194H464', 'ln--thick'),
  bundle(398, 150, 76, 42),
  mk(1, 160, 190), mk(2, 214, 224), mk(3, 436, 171),
].join(''));

const rigPanel = ({ no, name, drawing, body, steps, i }) => html`
  <figure class="pnw-rig rv" style="--i:${i}">
    <div class="pnw-rig__head"><span>${no}</span><span>Not to scale</span></div>
    <div class="pnw-rig__draw">${drawing}</div>
    <figcaption class="pnw-rig__text">
      <h3 class="h3">${name}</h3>
      <p>${body}</p>
      <ol class="pnw-rig__steps">${steps.map((s, n) => html`<li><span aria-hidden="true">${n + 1}</span>${s}</li>`)}</ol>
    </figcaption>
  </figure>`;

// The chart near Kent: the printed sheet (the same file as the route plate), cut close, with the
// lanes leaving north. Crop and marks all use the sheet's own coordinates; pages/pacific-northwest.css
// sets the crop for each screen size.
const SEA_LANES = [['sea', 'sea', 0.1], ['passage', 'sea sea--minor', 0.5], ['passage2', 'sea sea--minor', 1.1]];
const pct = ([x, y]) => `left:${((x / MAP.width) * 100).toFixed(2)}%;top:${((y / MAP.height) * 100).toFixed(2)}%`;
const SHOWN_TOWNS = MAP.towns.filter((t) => t.region === 'southeast');
const laneChart = (ctx) => {
  const k = MAP.yards.find((y) => y.id === 'kent');
  return html`
  <figure class="pnw-chart__wrap">
    <div class="pnw-chart rv">
      <div class="pnw-chart__sheet">
        <img src="${ctx.u('assets/map.svg')}?v=${ctx.version}" width="${MAP.width}" height="${MAP.height}" loading="lazy" decoding="async" alt="Chart of the coast from Puget Sound north to Southeast Alaska. A freight lane leaves Kent, Washington and runs north along the British Columbia coast toward the Gulf of Alaska, with the Inside Passage branching to Southeast Alaska.">
        <svg viewBox="0 0 ${MAP.width} ${MAP.height}" aria-hidden="true" focusable="false">
          ${raw(SEA_LANES.map(([k2, c, d]) => `<path class="lane ${c}" d="${MAP.lanes[k2]}" pathLength="1" style="--d:${d}s"/>`).join(''))}
          ${raw(SHOWN_TOWNS.map((t) => `<circle class="town" cx="${t.xy[0]}" cy="${t.xy[1]}" r="3.4"/>`).join(''))}
          <g class="yardmark"><circle class="yardmark__disc" cx="${k.xy[0]}" cy="${k.xy[1]}" r="8"/><circle class="yardmark__dot" cx="${k.xy[0]}" cy="${k.xy[1]}" r="2.6"/></g>
        </svg>
        ${SHOWN_TOWNS.map((t) => html`<span class="pnw-chart__town" aria-hidden="true" data-side="${t.side}" style="${pct(t.xy)}">${t.name}</span>`)}
        <span class="pnw-chart__yard" aria-hidden="true" style="${pct(k.xy)}"><b>Kent</b><i>${deg(LAT.kent)}</i></span>
        <span class="pnw-chart__to" aria-hidden="true" style="${pct([690, 708])}">${icon('arrow', { size: 14 })} To Anchorage <i>${deg(LAT.anchorage)}</i></span>
      </div>
      <p class="pnw-chart__title" aria-hidden="true"><span>Plate IV</span><b>The lane north</b><i>Departing Kent</i></p>
    </div>
    <figcaption class="fig__cap"><span>Lanes are drawn to show how freight generally moves. They are not carrier routes or schedules.</span></figcaption>
  </figure>`;
};

// The way north, as a list that reads without the chart. General geography, not Uresco schedules.
const LEGS = [
  { lat: LAT.sitka, name: 'Sitka', how: 'Southeast Alaska is reached by sea.' },
  { lat: LAT.anchorage, name: 'Anchorage', how: 'Our Southcentral Alaska yard, on the road system.', href: 'locations/#anchorage' },
  { lat: LAT.fairbanks, name: 'Fairbanks', how: 'Our Interior Alaska yard, on the road system.', href: 'locations/#fairbanks' },
  { lat: LAT.utqiagvik, name: 'Utqiaġvik', how: 'Barge in the ice-free season, and air.' },
];

const STOPS_PNW = [
  { id: 'kent', lat: LAT.kent, name: 'Kent' },
  { id: 'north', lat: LAT.anchorage, name: 'Anchorage' },
];

const pnw = {
  path: 'pacific-northwest/',
  render: (ctx) => layout(ctx, {
    title: 'Pacific Northwest — Kent, WA',
    description: 'Uresco’s Kent, Washington headquarters and Pacific Northwest distribution center: lumber, engineered wood, siding and building packages with job-site delivery by boom truck and Moffett forklift.',
    preload: [preloadFor(ctx, 'rainier-tacoma')],
    rail: STOPS_PNW,
    body: html`
${pageHero(ctx, {
  crumbs: [['Pacific Northwest']],
  eyebrow: `Pacific Northwest · Kent · ${deg(LAT.kent)}`,
  title: 'Down the road, <em>from Kent.</em>',
  lede: 'Our headquarters and Pacific Northwest distribution center. A full range of building products for commercial and residential builders, set down on job sites around the Puget Sound region by boom truck and truck-mounted Moffett forklift.',
  photoKey: 'rainier-tacoma',
  caption: 'Mount Rainier in alpenglow above the Tacoma waterfront.',
  place: 'Tacoma, Washington',
  lat: LAT.tacoma,
  pos: '50% 46%',
  actions: html`<a class="btn" href="${tel(kent.phone)}">${icon('phone', { size: 18 })} Call Kent ${kent.phone}</a><a class="btn btn--line" href="${ctx.u('quote/')}?yard=kent">Request a quote ${icon('arrow', { size: 18 })}</a>`,
  attrs: html` data-page="pnw" data-lat="${LAT.kent}" data-place="Kent"`,
})}

<section class="section pnw-yard" id="kent" data-lat="${LAT.kent}" data-place="Kent" aria-labelledby="kent-title">
  <div class="wrap">
    ${chapterHead({ no: '01', kicker: 'The Kent yard', lat: LAT.kent, tag: 'Headquarters', id: 'kent-title', title: 'The yard <em>nearest your job.</em>', lede: 'Kent carries a full range of building products and services for the commercial and residential builder, and is fully equipped to get them to your site. Give us a call, email or stop by.' })}
    <div class="pnw-yard__grid">
      <div class="pnw-record rv">
        <a class="pnw-record__tel" href="${tel(kent.phone)}">${kent.phone}</a>
        <p class="pnw-record__status">${openStatus(kent, { short: true })}</p>
        <dl class="yard__lines">
          <div><dt>Yard</dt><dd><address>${kent.street}<br>${kent.city}, ${kent.state} ${kent.zip}</address></dd></div>
          <div><dt>Toll-free</dt><dd><a href="${tel(kent.tollFree)}">${kent.tollFree}</a></dd></div>
          <div><dt>Fax</dt><dd>${kent.fax}</dd></div>
          <div><dt>Email</dt><dd><a href="mailto:${kent.email}">${kent.email}</a></dd></div>
          <div><dt>Mail</dt><dd>${kent.mailing}</dd></div>
        </dl>
        <div class="yard__actions">
          <a class="btn btn--sm btn--line" href="${mapsUrl(kent)}" target="_blank" rel="noopener">${icon('directions', { size: 16 })} Directions</a>
          <a class="btn btn--sm btn--line" href="${ctx.u('quote/')}?yard=kent#plans">${icon('upload', { size: 16 })} Send plans</a>
        </div>
      </div>
      <div class="pnw-yard__side">
        <div class="pnw-prints" aria-label="From the Uresco archive" role="group">
          <figure class="print pnw-print rv">${picture(ctx, 'uresco-yard', { sizes: '(min-width: 1000px) 340px, 58vw' })}<figcaption>From the Uresco archive: bundles staged in a Uresco yard.</figcaption></figure>
          <figure class="print pnw-print pnw-print--2 rv" style="--i:1">${picture(ctx, 'uresco-truck', { sizes: '(min-width: 1000px) 240px, 40vw' })}<figcaption>The tag on a Uresco load.</figcaption></figure>
        </div>
        <div class="pnw-does rv">
          <p class="label">From this yard</p>
          <ul>
            <li><a href="#delivery">Job-site delivery by boom truck and Moffett forklift ${icon('arrow', { size: 16 })}</a></li>
            <li><a href="${ctx.u('services/')}#takeoffs">Take-offs, estimates and design services ${icon('arrow', { size: 16 })}</a></li>
            <li><a href="${ctx.u('services/')}#remote">Remote and export building packages ${icon('arrow', { size: 16 })}</a></li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section section--deep pnw-drop" id="delivery" data-lat="${LAT.kent}" data-place="Kent" aria-labelledby="delivery-title">
  <div class="wrap">
    ${sectionHead({ no: '02', eyebrow: 'Job-site delivery', id: 'delivery-title', title: 'Not at the curb. <em>Where the crew needs it.</em>', lede: 'Two machines, two ways to get a load off the truck and onto the site. Around the Puget Sound region, Kent’s deliveries go out with one or the other.' })}
    <div class="pnw-rigs">
      ${rigPanel({ no: 'Plate II', i: 0, name: 'Boom truck', drawing: RIG_BOOM, body: 'A crane on the truck lifts the load off the bed and sets it down on site.', steps: ['The load rides on the bed.', 'The boom lifts it clear of the truck.', 'It comes down where the crew needs it.'] })}
      ${rigPanel({ no: 'Plate III', i: 1, name: 'Moffett forklift', drawing: RIG_MOFFETT, body: 'A forklift that rides on the back of the truck, then carries the load across the site.', steps: ['It travels on the back of the truck.', 'At the site it drives off and takes the load.', 'It carries the load across the site.'] })}
    </div>
    <div class="pnw-drop__foot rv">
      <p class="lede">Tell us the address and where on the site you want the load.</p>
      <a class="btn" href="${tel(kent.phone)}">${icon('phone', { size: 18 })} Call Kent ${kent.phone}</a>
    </div>
  </div>
  ${figure(ctx, 'cranes-dusk', { ratio: 'cine', cls: 'fig--bleed pnw-drop__photo', parallax: true, caption: 'Tower cranes over a construction site at dusk.', pos: '50% 58%' })}
</section>

<section class="section pnw-line" id="stock" data-lat="${LAT.kent}" data-place="Kent" aria-labelledby="stock-title">
  <div class="wrap">
    ${sectionHead({ no: '03', eyebrow: 'The full line', id: 'stock-title', title: 'From framing packages <em>to the last box of fasteners.</em>', lede: 'Nine product lines for the commercial and residential builder. Open a line to see what is in it, or ask Kent.', action: html`<a class="link" href="${ctx.u('products/')}">All products ${icon('arrow', { size: 16 })}</a>` })}
    <div class="stock" data-stock>
      ${stockFrame(ctx)}
      ${stockList(ctx, { extra: '&yard=kent' })}
    </div>
    <div class="brandline">
      <p class="label">Brands we carry</p>
      <ul>${BRANDS.map((b) => html`<li>${b}</li>`)}</ul>
    </div>
    <p class="stocknote">We also carry a large variety of other building materials: tarps, polyurethane rolls, caulking, adhesives, house wraps and more. Not on the list? <a href="${tel(kent.phone)}">Ask Kent, ${kent.phone}.</a></p>
  </div>
</section>

<section class="section section--ice pnw-north" id="north" data-lat="${LAT.kent}" data-lat-to="${LAT.anchorage}" data-place="At sea" data-place-end="Anchorage" aria-labelledby="north-title">
  <div class="wrap pnw-north__grid">
    <div class="pnw-north__head">
      <p class="shead__bar rv-line"><span class="chead__no">04</span><span>The start of the lane</span></p>
      <h2 class="h2 rv" id="north-title">Kent is where <em>the lane north starts.</em></h2>
      <p class="lede rv" style="--i:1">Remote location and export building packages are our specialty. We work with you on all aspects of shipping coordination, dock delivery and rural Alaska delivery, anywhere from Sitka to Utqiaġvik.</p>
    </div>
    <div class="pnw-north__map">${laneChart(ctx)}</div>
    <div class="pnw-north__body">
      <ol class="pnw-legs rv">
        ${LEGS.map((l) => html`<li><span class="pnw-legs__lat">${deg(l.lat)}</span><span class="pnw-legs__name">${l.href ? html`<a href="${ctx.u(l.href)}">${l.name}</a>` : l.name}</span><span class="pnw-legs__how">${l.how}</span></li>`)}
      </ol>
      <p class="pnw-north__note rv" style="--i:1">Typical for the region, not a schedule or a price. Any yard can help.</p>
      <div class="actions rv" style="--i:2">
        <a class="btn btn--line" href="${ctx.u('alaska/')}">How remote delivery works ${icon('arrow', { size: 18 })}</a>
      </div>
    </div>
  </div>
</section>

${closing(ctx, {
  query: '?yard=kent',
  title: 'Building around <em>Puget Sound?</em>',
  body: 'Send plans or a materials list and tell us where the job is. Kent will work up the take-off and the estimate.',
  rows: [['Send', 'Plans, drawings or a materials list'], ['To', 'The Kent yard'], ['Returns', 'A take-off and an estimate'], ['Ships', 'To your job site, by boom truck or Moffett forklift']],
})}
`,
  }),
};

/* ---------- Locations ---------- */

// "Which yard should I call?", from the yards' own guidance.
const CALL_FOR = { kent: 'Around Puget Sound', anchorage: 'Southcentral Alaska, or any remote site', fairbanks: 'The Interior and points north' };
// A photograph of the place, never of the yard itself.
const PLACE = {
  kent: { key: 'tacoma-port', caption: 'Container cranes at the Port of Tacoma, across Commencement Bay.', place: 'Tacoma, Washington', lat: LAT.tacoma, pos: '60% 55%' },
  anchorage: { key: 'anchorage', caption: 'The city under the Chugach Mountains, across the inlet ice.', place: 'Anchorage', lat: LAT.anchorage, pos: '72% 50%' },
  fairbanks: { key: 'fairbanks', caption: 'Green aurora over a snowbanked road and frosted birches.', place: 'Near Fairbanks', pos: '50% 60%' },
};
const STOPS_YARDS = LOCATIONS.map((l) => ({ id: l.id, lat: latOf(l), name: l.city }));
const quoteFrom = (ctx, l) => `${ctx.u('quote/')}?yard=${l.id}`;

// The first thing on the page: who to call, as three ruled rows. Each row is one tap.
const board = () => html`
  <div class="lcx-board">
    <h2 class="lcx-board__q">Which yard should I call?</h2>
    <ul class="lcx-board__rows">
      ${LOCATIONS.map((l) => html`<li><a class="lcx-row" href="${tel(l.phone)}">
        <span class="lcx-row__if">${CALL_FOR[l.id]}</span>
        <span class="lcx-row__city">${l.city}</span>
        ${openStatus(l, { short: true })}
        <span class="lcx-row__num">${icon('phone', { size: 18 })}${l.phone}</span>
      </a></li>`)}
    </ul>
    <div class="lcx-board__foot">
      <p>Not sure? Call any of them. Any yard can help; they work as one team.</p>
      <p class="lcx-board__jump"><span>Full details:</span> ${LOCATIONS.map((l) => html`<a href="#${l.id}">${l.city}</a>`)}</p>
    </div>
  </div>`;

// One yard, sorted by what you came to do: call it, visit it, or write to it.
const record = (ctx, l, i, { flip = false } = {}) => {
  const p = PLACE[l.id];
  return html`
  <article class="yard lcx-yard${flip ? ' lcx-yard--flip' : ''}" id="${l.id}" aria-labelledby="${l.id}-name">
    <p class="chead__bar rv-line"><span class="chead__no">${two(i + 1)}</span><span class="chead__kicker">${l.role}</span><span class="chead__lat">${deg(latOf(l))}</span></p>
    <div class="lcx-yard__grid">
      <div class="lcx-yard__head">
        <h2 class="lcx-yard__city rv" id="${l.id}-name">${l.city}<span>, ${l.state}</span></h2>
        <p class="lcx-yard__blurb rv" style="--i:1">${l.blurb}</p>
        <a class="link rv" style="--i:2" href="${quoteFrom(ctx, l)}">Get a quote from ${l.city} ${icon('arrow', { size: 16 })}</a>
      </div>
      ${figure(ctx, p.key, { ratio: 'land', sizes: '(min-width: 1000px) 56vw, 100vw', cls: 'lcx-yard__photo', parallax: true, caption: p.caption, place: p.place, lat: p.lat, pos: p.pos })}
      <div class="lcx-book">
        <section class="lcx-book__col lcx-book__col--call rv" aria-label="Call ${l.city}">
          <h3 class="label">Call</h3>
          <a class="lcx-tel" href="${tel(l.phone)}">${l.phone}</a>
          ${l.tollFree ? html`<a class="lcx-tel2" href="${tel(l.tollFree)}">${l.tollFree} <small>toll-free</small></a>` : ''}
          <p class="lcx-now">${openStatus(l)}<small data-clock="${l.hours.tz}"></small></p>
        </section>
        <section class="lcx-book__col rv" style="--i:1" aria-label="Visit ${l.city}">
          <h3 class="label">Visit</h3>
          <address class="lcx-addr">${l.street}<br>${l.city}, ${l.state} ${l.zip}</address>
          <a class="btn btn--sm btn--line" href="${mapsUrl(l)}" target="_blank" rel="noopener">${icon('directions', { size: 16 })} Directions</a>
          <p class="lcx-hours"><span class="label">Hours</span>${hoursLines(l).map((h) => html`${h}<br>`)}<small>${tzLabel(l)}</small></p>
        </section>
        <section class="lcx-book__col rv" style="--i:2" aria-label="Write to ${l.city}">
          <h3 class="label">Write</h3>
          <dl class="lcx-write">
            <div><dt>Email</dt><dd><a href="mailto:${l.email}">${l.email}</a></dd></div>
            <div><dt>Fax</dt><dd>${l.fax}</dd></div>
            ${l.mailing ? html`<div><dt>Mail</dt><dd>${l.mailing}</dd></div>` : ''}
          </dl>
        </section>
      </div>
    </div>
  </article>`;
};

const locations = {
  path: 'locations/',
  render: (ctx) => layout(ctx, {
    title: 'Locations',
    description: 'Uresco distribution centers in Kent, Washington, and Anchorage and Fairbanks, Alaska: addresses, phone, fax and email for each yard.',
    preload: [preloadFor(ctx, 'winter-road')],
    jsonLd: orgJsonLd(ctx),
    rail: STOPS_YARDS,
    body: html`
${pageHero(ctx, {
  crumbs: [['Locations']],
  eyebrow: `Locations · ${deg(LAT.kent)} to ${deg(LAT.fairbanks)}`,
  title: 'Three yards. <em>One team.</em>',
  lede: 'Call the yard nearest the job, or visit, fax or email any of them. Every number is below.',
  actions: board(),
  photoKey: 'winter-road',
  caption: 'A pickup on a winter highway through the spruce.',
  place: 'Interior Alaska',
  pos: '52% 70%',
  attrs: html` data-page="locations" data-lat="${LAT.kent}" data-place="Kent"`,
})}

<section class="section lcx-sec" data-lat="${LAT.kent}" data-place="Kent">
  <div class="wrap">${record(ctx, LOCATIONS[0], 0)}</div>
</section>

<section class="section section--deep lcx-chart" data-lat="${LAT.kent}" data-lat-to="${LAT.anchorage}" data-place="At sea" data-place-end="Anchorage" aria-labelledby="chart-title">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'The chart', id: 'chart-title', title: 'Find the job. <em>Call the nearest mark.</em>', lede: 'The yellow marks are the yards. Choose one to go to its details. Any yard can help you plan the route from there.' })}
    ${routePlate(ctx, { no: 'Plate I', title: 'Three yards, one route' })}
  </div>
</section>

<section class="section lcx-sec" data-lat="${LAT.anchorage}" data-place="Anchorage">
  <div class="wrap">${record(ctx, LOCATIONS[1], 1, { flip: true })}</div>
</section>

<section class="section section--ice lcx-sec" data-lat="${LAT.fairbanks}" data-place="Fairbanks">
  <div class="wrap">${record(ctx, LOCATIONS[2], 2)}</div>
</section>

${closing(ctx, {
  title: 'Have plans <em>in hand?</em>',
  body: 'Our friendly, knowledgeable sales staff is here to help. Send drawings or a materials list and tell us where the job is, and the yard nearest it will work up the take-off.',
  rows: [['Send', 'Plans, drawings or a materials list'], ['To', 'The yard nearest your project'], ['Returns', 'A take-off and an estimate'], ['Ships', 'To the job site down the road, or to the dock for the trip north']],
})}
`,
  }),
};

export default [pnw, locations];
