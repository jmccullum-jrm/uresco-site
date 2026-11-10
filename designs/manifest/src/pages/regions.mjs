import { readFileSync } from 'fs';
import { html, raw } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';
import { layout, orgJsonLd } from '../lib/layout.mjs';
import { glyph, kit } from '../lib/drawings.mjs';
import { PHERO_SIZES, YARD_FOR, TZ_ABBR, lineNo, two, itemName, openStatus, preloadFor, sectionHead, pageHero, plate, quoteBand, quoteHref, yardCard, deliveryMap, latRule, board, trimLane } from '../lib/components.mjs';
import { LOCATIONS, byId, tel, address, mapsUrl, hoursLines, tzLabel } from '../data/locations.mjs';
import { CATEGORIES } from '../data/products.mjs';
import { SERVICES } from '../data/services.mjs';

const MAP = JSON.parse(readFileSync(new URL('../data/map.json', import.meta.url), 'utf8'));
const kent = byId('kent');
const LAT = { kent: 47.4, anchorage: 61.2, fairbanks: 64.8 };

// ---------- The two unloading details ----------
const { n, P, rect, poly, seg, circ, member, label, dimH, note } = kit;
const svg = (title, id, obj, ann) => raw(`<svg class="dw" viewBox="0 0 480 320" role="img" aria-labelledby="${id}-t"><title id="${id}-t">${title}</title><g class="dw-obj">${obj}</g><g class="dw-ann">${ann}</g></svg>`);

const G = 262; // ground line, the same datum for both details
const unit = (x, y, w = 56, h = 28) => P(rect(x, y, w, h), 'dw-o dw-h') + P(seg(x, y + h / 3, x + w, y + h / 3) + seg(x, y + (2 * h) / 3, x + w, y + (2 * h) / 3), 'dw-t') + P(rect(x + 9, y - 2, 5, h + 4) + rect(x + w - 14, y - 2, 5, h + 4), 'dw-o dw-o--hole');
// A flatbed in elevation, cab to the left.
const truck = (dx = 0) => P(rect(40 + dx, 233, 238, 6)) + P(rect(84 + dx, 221, 194, 10))
  + P(poly([[40 + dx, 233], [40 + dx, 200], [52 + dx, 176], [82 + dx, 176], [82 + dx, 233]])) + P(poly([[47 + dx, 200], [56 + dx, 183], [74 + dx, 183], [74 + dx, 200]]), 'dw-t dw-t--o')
  + [64, 212, 246].map((x) => P(circ(x + dx, G - 15, 15)) + P(circ(x + dx, G - 15, 4.5), 'dw-t dw-t--o')).join('');
const ground = (x1, x2) => P(seg(x1, G, x2, G), 'dw-t');

// Detail A: up and over.
const detailBoom = () => {
  const curb = 306, lx = 340, ly = 124, lw = 56, tipX = lx + lw / 2;
  const crane = P(seg(106, 200, 128, 132), 'dw-t dw-t--o') + P(rect(92, 182, 16, 39)) + P(member(100, 184, 150, 86, 11)) + P(member(150, 86, tipX, 64, 8)) + P(circ(100, 184, 4) + circ(150, 86, 4.5));
  const sling = P(seg(tipX, 64, tipX, 106) + seg(tipX, 106, lx + 8, ly) + seg(tipX, 106, lx + lw - 8, ly), 'dw-t dw-t--o');
  const site = [336, 366, 396, 426, 456].map((x) => P(rect(x - 3, 174, 6, G - 180))).join('') + P(rect(330, 166, 132, 8)) + P(rect(330, G - 6, 132, 6));
  const obj = truck() + crane + site + unit(lx, ly, lw) + sling + ground(24, 468) + P(rect(curb, G - 8, 14, 8));
  const ann = dimH(curb + 7, lx + lw, [G - 8, ly], 34, 'OVER THE CURB') + note(214, 56, 'BOOM', [240, 76], 'end') + note(428, 104, 'UNIT', [396, 128]) + label(160, G + 28, 'BOOM TRUCK', 'dw-nt') + label(curb + 7, G + 28, 'CURB', 'dw-nt') + label(404, G + 28, 'DECK', 'dw-nt');
  return svg('A boom truck parked at the curb reaches its boom over the curb and lowers a unit of lumber onto the deck of a framed building.', 'pn-boom', obj, ann);
};

// Detail B: rides in on the truck, then drives off and carries the load across the site.
const detailMoffett = () => {
  const dx = -20, x = 302;
  const ghost = P(poly([[238, 244], [238, 196], [268, 196], [276, 214], [276, 244]]), 'dw-c');
  const moffett = P(circ(x + 12, 247, 15)) + P(circ(x + 12, 247, 4.5), 'dw-t dw-t--o') + P(circ(x + 62, 250, 12)) + P(circ(x + 62, 250, 3.5), 'dw-t dw-t--o')
    + P(poly([[x, 238], [x, 212], [x + 26, 206], [x + 50, 206], [x + 50, 238]]))
    + P(poly([[x + 12, 206], [x + 12, 170], [x + 48, 170], [x + 48, 206]], false), 'dw-t dw-t--o')
    + P(rect(x + 52, 148, 7, 100)) + P(rect(x + 59, 206, 4, 42)) + P(poly([[x + 63, 240], [x + 130, 240], [x + 130, 245], [x + 63, 245]]));
  const site = P(rect(452, 170, 6, 86)) + P(rect(472, 170, 6, 86)) + P(rect(446, 164, 40, 6)) + P(rect(440, G - 6, 46, 6));
  const obj = truck(dx) + ghost + moffett + unit(x + 66, 212, 64) + site + ground(10, 480);
  const ann = dimH(258, x + 66, [221, 212], 118, 'ACROSS THE SITE') + note(188, 170, 'RIDES HERE', [244, 200], 'end') + label(120, G + 28, 'TRUCK', 'dw-nt') + label(x + 36, G + 28, 'MOFFETT', 'dw-nt') + label(476, G + 28, 'SITE', 'dw-nt', 'end');
  return svg('A flatbed truck with the place its forklift rides marked at the rear, and the truck-mounted Moffett forklift off the truck, carrying a unit of lumber across the ground toward a framed wall.', 'pn-moff', obj, ann);
};

// ---------- Pacific Northwest ----------
// The sibling of the Alaska page's ship-to ticket: a plain GET form to the quote page, so it needs no script.
const ticket = (ctx) => html`
  <div class="shipto pn-ticket">
    <form class="shipto__ask pn-ticket__ask" action="${ctx.u('quote/')}" method="get">
      <input type="hidden" name="yard" value="kent">
      <h2 class="shipto__title"><label for="deliver-to">Where is the job?</label></h2>
      <div class="pn-ticket__go">
        <div class="shipto__field">
          <span class="shipto__prefix label" aria-hidden="true">Deliver to</span>
          <input class="shipto__input" id="deliver-to" name="location" type="text" autocomplete="off" autocapitalize="words" spellcheck="false" enterkeyhint="go" placeholder="City or address">
        </div>
        <button class="btn btn--dark btn--block" type="submit">Start a quote from Kent ${icon('arrow', { size: 18 })}</button>
      </div>
    </form>
    <div class="pn-ticket__card">
      <p class="pn-ticket__head"><b>Job-site delivery from Kent</b></p>
      <dl class="pn-ticket__rows">
        <div><dt>From</dt><dd><b>Kent yard</b> ${address(kent)} <a class="link pn-ticket__dir" href="${mapsUrl(kent)}" target="_blank" rel="noopener">Directions ${icon('arrow-up-right', { size: 14 })}</a></dd></div>
        <div><dt>To</dt><dd><span class="hl">Your job site</span> in the Puget Sound region</dd></div>
        <div><dt>Unload</dt><dd>Boom truck or truck-mounted Moffett forklift</dd></div>
      </dl>
      <p class="pn-ticket__note">Tell the yard what the site is like when you order.</p>
    </div>
  </div>`;

const heroCalls = () => html`<ul class="phero__calls">
  <li><a href="${tel(kent.phone)}"><span class="phero__yard"><span class="label">Kent yard</span>${openStatus(kent)}</span><span class="num phero__num"><span class="sr-only">Call the Kent yard: </span>${kent.phone}</span></a></li>
  <li><a href="${tel(kent.tollFree)}"><span class="phero__yard"><span class="label">Toll-free</span></span><span class="num phero__num"><span class="sr-only">Call toll-free: </span>${kent.tollFree}</span></a></li>
</ul>`;

const pnHero = (ctx) => html`${ticket(ctx)}
  ${plate(ctx, 'rainier-tacoma', { cls: 'phero__media', eager: true, sizes: PHERO_SIZES, caption: 'Mount Rainier above the Tacoma waterfront. A stock photograph of the Puget Sound region, not a Uresco job.' })}`;

// The nine lines as a build schedule: which stage of a typical building calls for each one.
// `from` and `to` are grid lines on the four-column chart. Line numbers stay the manifest's own.
const STAGES = [['A', 'Foundation'], ['B', 'Structure'], ['C', 'Close it in'], ['D', 'Finish']];
const CHART = [
  ['concrete-forming', 1, 2], ['framing-lumber', 2, 3], ['panels-sheathing', 2, 3], ['engineered-wood', 2, 3],
  ['siding-exterior', 3, 4], ['windows-doors-cabinets', 3, 5], ['insulation-drywall', 4, 5], ['cedar-decking', 3, 5], ['hardware-supplies', 1, 5],
];
const stageWords = (from, to) => (to - from === 4 ? 'Every stage' : STAGES.slice(from - 1, to - 1).map((s) => s[1]).join(' to '));
const schedule = (ctx) => html`
  <div class="pn-gantt" data-reveal>
    <div class="pn-gantt__head" aria-hidden="true">
      <span class="label">Line</span>
      <div class="pn-gantt__cols">${STAGES.map(([k, name]) => html`<span><b class="num">${k}</b>${name}</span>`)}</div>
    </div>
    <ol class="pn-gantt__rows">
      ${CHART.map(([slug, from, to], i) => { const c = CATEGORIES.find((x) => x.slug === slug); return html`<li>
        <a class="pn-gantt__row" href="${ctx.u('products/' + slug + '/')}" style="--from:${from};--to:${to};--i:${i}">
          <span class="pn-gantt__who">
            <span class="pn-gantt__no num">${lineNo(CATEGORIES.indexOf(c))}</span>
            <span class="pn-gantt__glyph">${glyph(slug, { size: 36 })}</span>
            <span class="pn-gantt__name">${c.short}</span>
            <span class="pn-gantt__items">${c.items.map(([name]) => itemName(name)).join(' · ')}</span>
          </span>
          <span class="pn-gantt__when"><span class="sr-only">Called for at: </span>${stageWords(from, to)}</span>
          <span class="pn-gantt__track" aria-hidden="true"><i></i><i></i><i></i><i></i><b></b></span>
        </a>
      </li>`; })}
    </ol>
    <p class="pn-gantt__note"><span class="label label--blue">Note 2</span>How a building generally goes up. A typical order, not a schedule. Ask your yard about your job.</p>
  </div>`;

// Ocean freight in general: the delivery plate's own base drawing, cropped to the stretch from Puget Sound to Southeast.
const CROP = { x: 620, y: 470, w: 580, h: 390 };
const NORTH_TOWNS = ['Juneau', 'Sitka', 'Ketchikan'];
const laneDetail = (ctx) => {
  const W = MAP.width, H = MAP.height, u = ctx.uid();
  const at = ([x, y]) => `left:${((x / W) * 100).toFixed(2)}%;top:${((y / H) * 100).toFixed(2)}%`;
  const towns = MAP.towns.filter((t) => NORTH_TOWNS.includes(t.name));
  const yard = MAP.yards.find((y) => y.id === 'kent');
  const ids = `pn${u}a`;
  const lane = trimLane(MAP.sea);   // Kent is inland: the lane stops short of the yard, out in Puget Sound
  const laneEnd = lane.match(/^M([\d.]+),([\d.]+)/).slice(1, 3);
  return html`
  <figure class="pmap pn-detail" data-reveal>
    <div class="pmap__canvas pn-detail__canvas" style="aspect-ratio:${CROP.w} / ${CROP.h}">
      <div class="pn-detail__sheet" style="left:${(-CROP.x / CROP.w * 100).toFixed(2)}%;top:${(-CROP.y / CROP.h * 100).toFixed(2)}%;width:${(W / CROP.w * 100).toFixed(2)}%">
        <img src="${ctx.u('assets/map.svg')}?v=${ctx.version}" width="${W}" height="${H}" alt="Detail of the delivery map: Washington State with the Kent yard inland, and a dashed line showing ocean freight in general, running from Puget Sound north-west past Ketchikan and Sitka toward Southcentral Alaska." loading="lazy" decoding="async">
        <svg class="pmap__lanes" viewBox="0 0 ${W} ${H}" aria-hidden="true" focusable="false">
          ${raw(`<mask id="${ids}" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><path class="pm-draw" d="${lane}" pathLength="1"/></mask><path class="pm-lane pm-lane--sea" d="${lane}" mask="url(#${ids})"/>`)}
          ${raw(towns.map((t) => `<circle class="pm-town" cx="${t.xy[0]}" cy="${t.xy[1]}" r="2.6"/>`).join(''))}
          ${raw(`<circle class="pm-town" cx="${laneEnd[0]}" cy="${laneEnd[1]}" r="2.6"/>`)}
          ${raw(`<g class="pm-yard"><circle cx="${yard.xy[0]}" cy="${yard.xy[1]}" r="6.5"/><circle class="pm-yard__dot" cx="${yard.xy[0]}" cy="${yard.xy[1]}" r="2.2"/></g>`)}
        </svg>
        <div class="pmap__labels">
          ${towns.map((t) => html`<span class="pmap__town" aria-hidden="true" data-side="${t.side}" style="${at(t.xy)}">${t.name}</span>`)}
          <span class="pmap__town pn-detail__sound" aria-hidden="true" data-side="s" style="${at(laneEnd)}">Puget Sound</span>
          <span class="pmap__yard pn-detail__yard" data-side="e" style="${at(yard.xy)}">Kent<small>47.4° N</small></span>
        </div>
      </div>
    </div>
    <figcaption class="pmap__side">
      <div class="tblock">
        <p class="tblock__firm"><b>Ocean freight, in general</b><span>Typical for the region</span></p>
        <p class="tblock__title"><span>Title</span><b>Puget Sound to Alaska</b></p>
      </div>
      <ul class="pn-detail__yards">
        ${LOCATIONS.map((l) => html`<li><a href="${tel(l.phone)}"><span class="label">${l.city}</span><span class="num">${l.phone}</span></a></li>`)}
      </ul>
      <p class="pmap__action"><a class="btn btn--dark btn--block" href="${ctx.u('alaska/')}">Alaska delivery ${icon('arrow', { size: 18 })}</a></p>
      <p class="pmap__note">The line shows how ocean freight generally moves. It is not a carrier route or a schedule. Any yard can help.</p>
    </figcaption>
  </figure>`;
};

const pnw = {
  path: 'pacific-northwest/',
  render: (ctx) => layout(ctx, {
    title: 'Pacific Northwest — Kent, WA',
    description: 'Uresco’s Kent, Washington headquarters and Pacific Northwest distribution center: building materials for institutional, commercial and residential builders, with job-site delivery around the Puget Sound region by boom truck and truck-mounted Moffett forklift.',
    preload: [preloadFor(ctx, 'rainier-tacoma')],
    body: html`
${pageHero(ctx, {
  cls: 'phero--ask pn-hero',
  sheet: 'Pacific Northwest',
  meta: 'Kent, Washington',
  title: '<span class="phero__q">Do you deliver to the job site?</span> Yes. <br><em>Boom or Moffett.</em>',
  lede: 'Our Kent headquarters supplies institutional, commercial and residential builders, with job-site delivery by boom truck and truck-mounted Moffett forklift around the Puget Sound region.',
  after: heroCalls(),
  media: pnHero(ctx),
})}

<section class="section" id="delivery">
  <div class="wrap">
    ${sectionHead({ no: '01', eyebrow: 'Job-site delivery', title: 'Two ways <em>off&nbsp;the&nbsp;truck.</em>', lede: 'Job-site delivery uses boom trucks and truck-mounted Moffett forklifts. This is how each one generally works.' })}
    <div class="pn-unload">
      <article class="pn-way">
        <figure class="dwg pn-dwg" data-reveal>
          <p class="dwg__bar label"><span>Detail A</span><span>Boom truck</span><span class="dwg__nts">Typical · not to scale</span></p>
          <div class="dwg__canvas">${detailBoom()}</div>
        </figure>
        <h3 class="h3">Up and over.</h3>
        <p>A boom truck lifts a unit off the bed and swings it up and over. It generally suits a load that has to go up, or over something.</p>
      </article>
      <article class="pn-way">
        <figure class="dwg pn-dwg" data-reveal>
          <p class="dwg__bar label"><span>Detail B</span><span>Truck-mounted Moffett</span><span class="dwg__nts">Typical · not to scale</span></p>
          <div class="dwg__canvas">${detailMoffett()}</div>
        </figure>
        <h3 class="h3">Across the site.</h3>
        <p>A truck-mounted forklift rides in on the back of the truck, drives off at the job and carries a unit over the ground. It generally suits a load that has to travel.</p>
      </article>
    </div>
    <div class="gnote pn-note">
      <p class="label label--blue">Note 1 · Your site</p>
      <p><strong>Not sure which one your site needs?</strong> Tell the Kent yard what is there when you order: <a class="num" href="${tel(kent.phone)}">${kent.phone}</a>.</p>
    </div>
  </div>
</section>

<section class="section section--panel" id="range">
  <div class="wrap">
    ${sectionHead({ no: '02', eyebrow: 'Product lines', title: 'Nine lines, in the order <em>a&nbsp;job calls for them.</em>', lede: 'The product lines, in the order a building generally needs them. Ask your yard what is in stock.', action: html`<a class="link" href="${ctx.u('products/')}">All products ${icon('arrow', { size: 16 })}</a>` })}
    ${schedule(ctx)}
  </div>
</section>

<section class="section" id="yard">
  <div class="wrap">
    ${sectionHead({ no: '03', eyebrow: 'Kent, Washington', title: 'The headquarters yard, <em>and&nbsp;what else we do.</em>', lede: 'Our friendly, knowledgeable sales staff is here to help. Give us a call, email or stop by.' })}
    <div class="pn-yard">
      ${yardCard(ctx, kent, { headingLevel: 3 })}
      <div class="pn-also">
        <p class="label pn-also__head">Also from Uresco</p>
        <ul>
          ${SERVICES.filter((s) => s.id !== 'delivery').map((s) => html`<li><a href="${ctx.u('services/')}#${s.id}"><span class="num">${s.no}</span><b>${s.name}</b><small>${s.short}</small>${icon('arrow', { size: 16 })}</a></li>`)}
        </ul>
      </div>
    </div>
  </div>
</section>

<section class="section section--panel" id="north">
  <div class="wrap">
    ${sectionHead({ no: '04', eyebrow: 'Alaska work', title: 'Building in Alaska? <em>Start with any yard.</em>', lede: 'Ocean freight generally runs from Puget Sound to Southeast and Southcentral Alaska. Call this yard or an Alaska yard. All three work as one team.' })}
    ${latRule({ highlight: [47.4, 71.3], note: 'The reach of the three yards: Kent to Utqiaġvik' })}
    ${laneDetail(ctx)}
  </div>
</section>

${quoteBand(ctx, { no: '05', eyebrow: 'Start with Kent', yard: 'kent', title: 'Send the plans <em>to&nbsp;Kent.</em>', body: 'Send drawings or a list and tell us where the job is. We will help with the take-off and quote the package, and work out the delivery with you.' })}
`,
  }),
};

// ---------- Locations ----------
// The key plan: a corner of the delivery plate, with this yard marked. It sits where a key plan sits on a drawing.
const KEY = { w: 460, h: 330 };
const keyPlan = (ctx, l) => {
  const y = MAP.yards.find((m) => m.id === l.id);
  if (!y) return '';
  const [cx, cy] = y.xy, W = MAP.width, H = MAP.height;
  const x0 = Math.max(0, Math.min(W - KEY.w, cx - KEY.w / 2)), y0 = Math.max(0, Math.min(H - KEY.h, cy - KEY.h / 2));
  return html`<div class="lo-key" aria-hidden="true">
    <div class="lo-key__crop">
      <div class="lo-key__sheet" style="left:${(-x0 / KEY.w * 100).toFixed(2)}%;top:${(-y0 / KEY.h * 100).toFixed(2)}%;width:${(W / KEY.w * 100).toFixed(2)}%"><img src="${ctx.u('assets/map.svg')}?v=${ctx.version}" width="${W}" height="${H}" alt="" loading="lazy" decoding="async"></div>
      <i style="left:${((cx - x0) / KEY.w * 100).toFixed(2)}%;top:${((cy - y0) / KEY.h * 100).toFixed(2)}%"></i>
    </div>
    <span class="lo-key__cap"><span class="lo-key__word">Key plan</span>${LAT[l.id] ? html`<span class="num">${LAT[l.id].toFixed(1)}° N</span>` : ''}</span>
  </div>`;
};

// A yard as a row of the directory: four ways to reach it, labelled the way people ask for them.
const yardRow = (ctx, l, i) => html`
  <article class="yard lo-yard" id="${l.id}">
    <header class="lo-yard__id">
      <p class="label lo-yard__ref"><span class="num">Yard ${two(i)}</span> · ${l.region}</p>
      <h3 class="yard__city">${l.city}<span>, ${l.state}</span></h3>
      <div class="lo-yard__meta">
        <div class="lo-yard__text">
          <p class="lo-yard__role">${l.role}</p>
          ${l.hours ? html`<p class="lo-yard__now"><span class="num"><span data-clock="${l.hours.tz}">--:--</span> <abbr title="${tzLabel(l)}">${TZ_ABBR[l.hours.tz]}</abbr></span>${openStatus(l)}</p>` : ''}
        </div>
        ${keyPlan(ctx, l)}
      </div>
      <a class="link lo-yard__quote" href="${quoteHref(ctx, { yard: l.id })}">Quote from ${l.city} ${icon('arrow', { size: 14 })}</a>
    </header>
    <dl class="lo-ways">
      <div class="lo-way lo-way--call">
        <dt>Call</dt>
        <dd>
          <a class="lo-way__num num" href="${tel(l.phone)}"><span class="sr-only">Call ${l.city}: </span>${l.phone}</a>
          ${l.tollFree ? html`<a class="lo-way__toll num" href="${tel(l.tollFree)}">${l.tollFree} <small>toll-free</small></a>` : ''}
          <a class="btn btn--sm lo-way__btn" href="${tel(l.phone)}">${icon('phone', { size: 16 })}<span>Call ${l.city}</span></a>
          <p class="lo-way__for">Call for: ${YARD_FOR[l.id]}</p>
        </dd>
      </div>
      <div class="lo-way lo-way--visit">
        <dt>Visit</dt>
        <dd>
          <address>${l.street}<br>${l.city}, ${l.state} ${l.zip}</address>
          <a class="btn btn--sm btn--line lo-way__btn" href="${mapsUrl(l)}" target="_blank" rel="noopener">${icon('directions', { size: 16 })} Directions</a>
          <dl class="lo-more">
            ${l.mailing ? html`<div><dt>Mail</dt><dd>${l.mailing}</dd></div>` : ''}
            ${l.hours ? html`<div class="lo-hours"><dt>Hours</dt><dd>${hoursLines(l).map((h) => html`<span>${h}</span>`)}<small>${tzLabel(l)}</small></dd></div>` : ''}
          </dl>
        </dd>
      </div>
      <div class="lo-way lo-way--fax">
        <dt>Fax</dt>
        <dd class="num">${l.fax}</dd>
      </div>
      <div class="lo-way lo-way--email">
        <dt>Email</dt>
        <dd><a class="lo-way__mail" href="mailto:${l.email}">${l.email}</a></dd>
      </div>
    </dl>
  </article>`;

// Which yard should I call? The guidance the site has always given, as a routing slip.
const ROUTES = [
  { where: 'Puget Sound and the Pacific Northwest', id: 'kent' },
  { where: 'Southcentral Alaska, or a remote site', id: 'anchorage' },
  { where: 'The Interior and points north', id: 'fairbanks' },
];
const routing = (ctx) => html`
  <div class="lo-route" data-reveal>
    <div class="lo-route__cols label" aria-hidden="true"><span>The job is in</span><span>Call</span><span>Number</span></div>
    <ol>
      ${ROUTES.map((r) => { const l = byId(r.id); return html`<li><a class="lo-route__row" href="${tel(l.phone)}">
        <span class="lo-route__where">${r.where}</span>
        <span class="lo-route__yard"><span class="lo-route__arrow" aria-hidden="true">${icon('arrow', { size: 20 })}</span>${l.city}</span>
        <span class="lo-route__num num">${l.phone}</span>
      </a></li>`; })}
      <li><a class="lo-route__row lo-route__row--any" href="#directory" data-open="call-sheet" aria-haspopup="dialog">
        <span class="lo-route__where">Not sure</span>
        <span class="lo-route__yard"><span class="lo-route__arrow" aria-hidden="true">${icon('arrow', { size: 20 })}</span>Any of the three</span>
        <span class="lo-route__num lo-route__num--note">They work as one team.</span>
      </a></li>
    </ol>
  </div>`;

const loHero = (ctx) => html`
  <div class="lo-board">
    ${board(ctx, { id: 'lo-board' })}
    <nav class="lo-jump" aria-label="Yard details on this page">
      <span class="label">Addresses, fax &amp; email</span>
      <ul>${LOCATIONS.map((l) => html`<li><a href="#${l.id}">${l.city}${icon('chevron-down', { size: 14 })}</a></li>`)}</ul>
    </nav>
  </div>
  ${plate(ctx, 'anchorage', { cls: 'phero__media', eager: true, sizes: PHERO_SIZES, caption: 'Anchorage below the Chugach Mountains. A stock photograph, not a Uresco yard.' })}`;

const locations = {
  path: 'locations/',
  render: (ctx) => layout(ctx, {
    title: 'Locations',
    description: 'Call, visit, fax or email a Uresco yard: Kent, Washington, and Anchorage and Fairbanks, Alaska. Addresses, phone numbers, directions, fax and email for each distribution center.',
    preload: [preloadFor(ctx, 'anchorage')],
    jsonLd: orgJsonLd(ctx),
    body: html`
${pageHero(ctx, {
  cls: 'lo-hero',
  sheet: 'Locations',
  meta: 'Kent · Anchorage · Fairbanks',
  title: 'Call the yard <em>nearest the job.</em>',
  lede: 'Kent, Anchorage and Fairbanks. Any of the three can help: they work as one team.',
  media: loHero(ctx),
})}

<section class="section" id="directory">
  <div class="wrap">
    ${sectionHead({ no: '01', eyebrow: 'Yard directory', title: '<em>Call,</em> visit, fax or email.', lede: 'Our friendly, knowledgeable sales staff is here to help. Give us a call, email or stop by.' })}
    <div class="lo-dir">${LOCATIONS.map((l, i) => yardRow(ctx, l, i))}</div>
  </div>
</section>

<section class="section section--panel" id="which">
  <div class="wrap">
    ${sectionHead({ no: '02', eyebrow: 'Which yard?', title: 'Which yard <em>should I call?</em>', lede: 'Call the one nearest the job. Any yard can help, so if the job does not fit a line below, start with whichever you like.' })}
    ${routing(ctx)}
    ${deliveryMap(ctx, {})}
  </div>
</section>

${quoteBand(ctx, { no: '03', eyebrow: 'Found your yard?', title: 'Send it <em>the&nbsp;plans.</em>', body: 'Send drawings or a list and choose a yard. We will help with the take-off and quote the package.' })}
`,
  }),
};

export default [pnw, locations];
