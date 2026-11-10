import { html, raw } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';
import { layout, orgJsonLd } from '../lib/layout.mjs';
import { picture, sectionHead, quoteBand, yardCard, mapPlate, arcPath, openStatus, legend } from '../lib/components.mjs';
import { BOOM_TRUCK, MOFFETT_TRUCK, asFig } from '../lib/drawings.mjs';
import { LOCATIONS, byId, tel } from '../data/locations.mjs';
import { CATEGORIES } from '../data/products.mjs';

const kent = byId('kent');

const quoteFrom = (ctx, id) => `${ctx.u('quote/')}?yard=${id}`;

/* ------------------------------------------------------------------------------------------
   The Puget Sound close-up: a Natural Earth 10 m coastline in a conic projection on the same
   1800 × 1000 canvas as the main map, with the towns from src/data/places.mjs laid out in the
   right-hand half. Towns are examples, never a delivery-area list; the dashed lines mean
   "call Kent for this one", and the yellow lane is the first few miles of the line north.
   ------------------------------------------------------------------------------------------ */
const SOUND = {
  w: 1800, h: 1000,
  land: 'M452 1024l36-15 42-14 -9-6 -8 3 -16-8 -51 0 -2-3 20-7 -26-4 -29 0 -4-9 4-14 -8-17 -24-10 -31-5 -13 6 -7 10 6 20 -1 31 9 20 9-2 2 3 0 11 -11-8 -9-3 -7 1 -2 5 0 7 -16 3 3-9 -2-6 5-35 1-55 -3-57 -17-109 -19-58 -6-9 -13-2 -15-41 9 1 4 5 5-1 -7-8 -15-2 -7-3 -14-130 -1-42 -14-55 -4-25 -16-47 -1-34 -4-15 -9-3 -6-5 -4-11 -13-16 -3-30 -35-21 -14-32 -15-7 -11 2 -17-30 -17-75 -10-78 988 0 5 12 -2 22 8 13 13 6 7 0 -5-37 3-10 25-6 12 0 6 3 4 8 2 13 5 5 6 0 9 3 8 12 9 19 2 16 -13 8 0 7 13-1 7-9 11-27 -9-14 -24-26 -2-11 1-6 55 0 -2 2 0 12 5 9 6 6 6 20 24 46 6 6 11 6 5 6 2 26 34 49 5 12 -7 3 -24 3 -4 8 -5 16 -4 9 -28 35 -20 50 -7 41 -4 8 -7 4 -9 2 -8-5 0-10 6-17 11-58 1-26 -5-33 -6 12 -3 33 -10 9 0-18 -5-16 -6-5 -7 15 0 14 17 42 -13 12 -15 41 -11 14 -5 20 -4 4 -15 9 -49 62 -27 65 -9 14 -13 12 -11 14 -9 33 -16 36 -2 14 19 15 36-4 103-45 20-12 20-21 -18-3 -24 10 -42 30 -46 21 -24 0 -13-21 0-14 31-45 25-59 44-67 46-31 61-26 7-7 4-13 14-54 61-87 6-6 7-3 9 3 2 6 -2 8 2 8 13 3 4-14 -13-62 -15-29 0-9 35 23 15 13 6 22 0 13 5 31 4 9 7 7 2 9 -9 14 11 6 6 6 5 6 0 11 -9 18 -7 2 -28-8 -11 3 2 11 -6 13 -9 14 -11 5 -32-37 -7 3 2 11 5 6 6 4 7 13 21 86 -4 6 4 6 -13 8 -17-20 -22-50 -9 17 -2 9 4 24 7 6 19 12 5 0 -5 13 -17 22 -2 9 30-15 26-22 20-13 7 16 2 22 4 13 16 6 -3 15 -24 80 -4 20 13 20 -5 12 -6 9 -9 6 -11 3 15 32 2 15 -6 19 -9 0 -48-22 -16-12 3-9 8-8 9-27 11-12 7-15 -4-22 -5 17 -9 8 -19 10 -14 18 -6 2 -5 3 0 8 -4 16 -9 15 -2 14 2 12 15 26 0 5 -9 12 0-5 -6 8 0 4 4 13 0 6 -20 16 -15-29 -9-41 0-21 11-6 5-14 2-16 0-32 -4-14 -9-11 -2-6 2-12 -8 12 -10 44 -6 17 -25 23 -6 3 -11 1 -5 8 -18 66 -9 20 -15 15 -33 9 -16 7 -6 14 8-6 16-6 11 0 2 12 -7 8 -24 9 -7 13 14-6 51-37 4-2 16-27 8 3 -4 14 -27 51 -9 9 -11 8 16 2 13-8 11-15 7-21 4 9 0 18 -5 9 7 11 4 20 7 7 9 0 0-9 -9-23 7-9 -2-33 4-11 25-19 4 7 -5 17 -4 6 9-2 15-9 -2-16 5-5 11 8 15 27 15 6 9 8 7 20 22-14 22-21 49-73 13-29 9-33 0-33 8 9 22 13 22 20 11 3 9-3 11-10 -17-14 0-8 4-10 7-8 11-8 13-6 19-6 7-9 2-14 0-16 -22-35 -4-12 0-38 -2-11 -11-21 -13-49 11-17 8-3 7 10 6 13 7 8 4-32 -4-12 -9-11 -33-17 -6-7 -2-9 2-3 6-3 5-14 13-24 2-10 -4-28 -7-11 -4-12 2-18 2-16 4-12 7-10 17-16 9-15 0-20 2-13 7-12 0-10 2-7 17-14 9-9 22-5 4-4 13-8 2-24 11-12 -11-9 -9-2 -8 11 -44-35 -19-21 -4-9 394 0 0 1048zM1409 -24l7 12 13 29 -10 0 -7-7 -11-18 -20-16 28 0zM1305 -24l5 74 7 11 8-6 7-22 -6-20 -3-19 7-11 13 11 9 12 10 11 48 35 9 13 4 21 7 14 2 9 -2 5 -5 3 -15 32 -2 1 -5 0 -2-4 0-6 -2-2 -13 6 -9 2 -4-5 0-20 -4-19 -7-17 -8-8 -9 2 -11 12 -6 5 -7-2 -6-3 -5-8 -8-6 -11-16 -9-19 0-15 -13-29 4-22 32 0zM1217 -24l15 45 2 23 -4 15 -13-2 -17-30 -4-12 -3-17 3-8 4 0 4 6 2 20 3 5 8 0 0-14 -6-18 -11-11 2-2 15 0zM1212 800l13 2 5 4 2 11 -3 23 -15 14 -13-8 -11-11 -2-9 8-8 7-16zM1377 582l9 15 9 8 24 15 -4 0 -27 12 -31 30 -4-12 0-12 4-9 9-3 7-5 2-9 -4-7 -11 3 4 6 -17 9 -3 6 0 18 -4 15 -5 5 -4 0 -11-14 -2-9 2-9 7-12 4-69 5-10 8-14 11-10 9-5 -2 12 2 6 9 12 2 10 0 18zM1340 419l0 5 5 10 6 3 -6 5 -7 9 -13-3 -13-18 -9-3 -9 1 -4-4 7-15 0-11 -5-8 -2-9 0-18 11-15 2-9 0-16 7-3 6 2 7 5 9 12 2 29 4 13 7 6 -5 8 -9 6 7 6 0 8zM1113 722l0 12 -2 11 9 11 4 10 0 25 -7 13 -9 9 -8-22 0-6 -5-8 -15-18 0-8 7-29 4-9 9 0 5-4 11-5 11-7 -5 10 -9 6z',
  grat: 'M110 948L263 952L417 955L570 958L724 960L877 962L1031 964L1184 965L1337 965L1491 965L1644 965L1798 964L1951 962L2105 960L2258 957L2411 954L2565 951L2718 947L2872 942M122 498L274 502L426 505L578 508L730 510L882 512L1034 514L1186 515L1338 515L1490 515L1642 515L1794 514L1946 512L2098 510L2250 508L2402 505L2554 501L2706 497L2858 493M134 48L285 52L435 55L586 58L736 61L887 62L1037 64L1188 65L1339 65L1489 65L1640 65L1790 64L1941 62L2091 60L2242 58L2392 55L2543 51L2693 47L2844 43M406 1495L409 1315L413 1135L417 955L421 775L424 595L428 415L432 235L435 55L439 -125L443 -305M716 1500L719 1320L721 1140L724 960L726 780L729 600L731 421L734 241L736 61L739 -119L742 -299M1026 1504L1028 1324L1029 1144L1031 964L1032 784L1033 604L1035 424L1036 244L1037 64L1039 -116L1040 -296M1337 1505L1337 1325L1337 1145L1337 965L1338 785L1338 605L1338 425L1338 245L1339 65L1339 -115L1339 -295M1647 1505L1646 1325L1645 1145L1644 965L1643 785L1642 605L1642 425L1641 245L1640 65L1639 -115L1638 -295M1957 1502L1955 1322L1953 1142L1951 962L1949 782L1947 602L1945 422L1943 242L1941 62L1939 -118L1937 -298',
  lane: 'M1500 580C1493 563 1476 505 1460 475C1443 444 1413 430 1399 398C1385 366 1386 322 1375 281C1364 241 1351 194 1332 155C1313 116 1288 83 1260 47C1232 11 1181 -43 1165 -61',
  kent: [1500.2, 580.2],
  exit: [1262, 62],
  towns: [["Seattle",1440.1,419.8,"n"],["Bellevue",1519.5,416.1,"e"],["Redmond",1567.9,358.3,"e"],["Everett",1518.1,84,"e"],["Bremerton",1257.9,454.7,"w"],["Renton",1510.1,530.4,"e"],["Federal Way",1451.9,675.4,"w"],["Auburn",1503.8,688.8,"e"],["Tacoma",1371.9,737.5,"w"],["Puyallup",1464.2,798.7,"e"],["Olympia",1092.1,930,"e"]],
  labels: [["47° N",693,960],["48° N",706.3,60.1],["123° W",1037.4,81.9],["122° W",1644.3,964.6]],
};
const at = ([x, y]) => `left:${((x / SOUND.w) * 100).toFixed(2)}%;top:${((y / SOUND.h) * 100).toFixed(2)}%`;
const townQuote = (ctx, name) => `${ctx.u('quote/')}?location=${encodeURIComponent(`${name}, WA`)}&amp;yard=kent`;

const soundMap = (ctx) => html`
  <div class="map pn-plate">
    <svg class="pn-plate__land" viewBox="0 0 ${SOUND.w} ${SOUND.h}" role="img" aria-label="Map of the Puget Sound region: the Kent yard, with Seattle, Bellevue, Redmond, Everett, Bremerton, Renton, Federal Way, Auburn, Tacoma, Puyallup and Olympia around it.">
      <defs><linearGradient id="pn-land" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#32444A"/><stop offset="1" stop-color="#262F31"/></linearGradient></defs>
      <path class="pn-plate__grat" d="${SOUND.grat}"/>
      <path class="pn-plate__shore" d="${SOUND.land}"/>
      <path class="pn-plate__ground" d="${SOUND.land}"/>
      <g class="pn-plate__spokes">
        ${SOUND.towns.map(([name, x, y], i) => raw(`<path class="pn-spoke" data-town="${name}" style="--i:${i}" d="${arcPath(SOUND.kent, [x, y])}"/>`))}
      </g>
      <path class="lane lane--sea pn-plate__lane" pathLength="100" d="${SOUND.lane}"/>
    </svg>
    <div class="map__pins">
      ${SOUND.labels.map(([t, x, y]) => html`<span class="map__grat" aria-hidden="true" style="${at([x, y])}">${t}</span>`)}
      ${SOUND.towns.map(([name, x, y, side]) => html`<a class="map__dot pn-town" data-town="${name}" href="${raw(townQuote(ctx, name))}" tabindex="-1" aria-hidden="true" style="${at([x, y])}"><span class="map__name" data-side="${side}">${name}</span></a>`)}
      <a class="map__yard" data-side="e" href="#kent" style="${at(SOUND.kent)}"><i class="map__beacon"></i><span class="map__tag"><b>Kent</b>${openStatus(kent)}<span class="sr-only"> yard details</span></span></a>
      <a class="pn-exit" href="#north" style="${at(SOUND.exit)}" aria-label="The lane north to Alaska"><span>${icon('arrow-up-right', { size: 14 })}To Alaska</span></a>
    </div>
  </div>`;

// Two ways a load comes off the truck. Drawn, because no photograph of Uresco's own trucks at work exists at a usable size.
const GEAR = [
  { fig: BOOM_TRUCK, title: 'Boom truck', body: 'A crane on the truck lifts bundles off the bed and sets them in place.' },
  { fig: MOFFETT_TRUCK, title: 'Truck-mounted Moffett forklift', body: 'The forklift rides in on the back of the truck, comes off at the site and carries the load across it.' },
];

const pnw = {
  path: 'pacific-northwest/',
  render: (ctx) => layout(ctx, {
    title: 'Pacific Northwest — Kent, WA',
    description: 'Uresco’s Kent, Washington headquarters and Pacific Northwest distribution center: lumber, engineered wood, siding and building packages with job-site delivery by boom truck and Moffett forklift around the Puget Sound region.',
    body: html`
<section class="pn-open" id="sound" aria-labelledby="pn-title">
  <div class="stage stage--embed pn-sound" data-sound>
    <div class="stage__sky" aria-hidden="true"></div>
    <div class="stage__map">${soundMap(ctx)}</div>
    <div class="stage__ui">
      <div class="stage__copy">
        <p class="eyebrow">Pacific Northwest <i>·</i> Kent, WA</p>
        <h1 class="display" id="pn-title">Down the road <em>from Kent.</em></h1>
        <p class="hero__lede">Our headquarters yard carries the full range and delivers to job sites around the Puget Sound region by boom truck and truck-mounted Moffett forklift.</p>
      </div>
      <div class="finder pn-panel">
        <div class="route__yard">
          <div class="route__y">
            <p class="route__who"><span class="route__lab">Yard to call</span><b>Kent</b> ${openStatus(kent)}</p>
            <a class="btn btn--dark" href="${tel(kent.phone)}">${icon('phone', { size: 16 })}<span class="sr-only">Call Kent: </span>${kent.phone}</a>
          </div>
        </div>
        <div class="pn-panel__towns">
          <p class="finder__label" id="pn-towns">Where is the job? <span>Pick a town to start a quote.</span></p>
          <ul class="pn-chips" aria-labelledby="pn-towns">
            ${SOUND.towns.map(([name]) => html`<li><a class="chip" data-town="${name}" href="${raw(townQuote(ctx, name))}">${name}</a></li>`)}
          </ul>
        </div>
        <a class="btn btn--block" href="${quoteFrom(ctx, 'kent')}">Request a quote from Kent ${icon('arrow', { size: 18 })}</a>
        <p class="route__note">Towns are examples, not the limit. Building somewhere else in the region? Ask Kent.</p>
      </div>
    </div>
    ${legend({ items: [['yard', 'Uresco yard'], ['arc', 'Yard to call'], ['sea', 'Lane north']], note: 'Lines are illustrative' })}
  </div>
</section>

<section class="section" aria-labelledby="pn-gear-title">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Job-site delivery', title: 'Off the truck <em>and onto the site.</em>', lede: 'Kent delivers to job sites with Moffett fork unload and boom trucks. The site decides which one you want.', id: 'pn-gear-title' })}
    <div class="pn-gear">
      ${GEAR.map((g, i) => html`<article class="pn-unit reveal" style="--i:${i}">
        <div class="pn-unit__media">${raw(asFig(g.fig, 'pn-fig'))}</div>
        <div class="pn-unit__body">
          <h3 class="pn-unit__title">${g.title}</h3>
          <p class="pn-unit__text">${g.body}</p>
        </div>
      </article>`)}
    </div>
    <div class="callout reveal">
      <span class="callout__icon">${icon('truck', { size: 22 })}</span>
      <p><strong>Not sure which your site needs?</strong> Tell Kent what the site is like and where the load has to end up.</p>
      <a class="link" href="${tel(kent.phone)}"><span class="sr-only">Call Kent: </span>${kent.phone} ${icon('arrow', { size: 16 })}</a>
    </div>
  </div>
</section>

<section class="section section--ice" aria-labelledby="pn-load-title">
  <div class="wrap pn-load">
    <div class="pn-load__head">
      <p class="eyebrow">In the yard</p>
      <h2 class="h2" id="pn-load-title">The full range, <em>on one load sheet.</em></h2>
      <p class="lede">The Kent distribution center offers a full range of building products and services for the commercial and residential builder.</p>
      <p class="pn-load__more"><b>Not on the sheet?</b> We also carry tarps, polyurethane rolls, caulking, adhesives, house wraps and more. Ask your yard.</p>
      <figure class="pn-load__proof">
        ${picture(ctx, 'uresco-truck', { sizes: '72px' })}
        <figcaption><span>From Uresco</span>The tag on a Uresco load.</figcaption>
      </figure>
    </div>
    <div class="pn-bill reveal">
      <div class="pn-bill__top">
        <p><span>From</span><b>Kent, WA</b></p>
        ${icon('arrow', { size: 18, cls: 'pn-bill__arrow' })}
        <p><span>To</span><b>Your job site</b></p>
        <a class="link" href="${ctx.u('products/')}">All products ${icon('arrow', { size: 16 })}</a>
      </div>
      <ol class="pn-bill__rows">
        ${CATEGORIES.map((c, i) => html`<li class="pn-row">
          <span class="pn-row__no" aria-hidden="true">0${i + 1}</span>
          <div class="pn-row__main">
            <a class="pn-row__name" href="${ctx.u('products/' + c.slug + '/')}">${c.name}</a>
            <p class="pn-row__items">${c.items.map(([n]) => n).join(' · ')}</p>
          </div>
          <a class="pn-row__quote" href="${ctx.u('quote/')}?product=${encodeURIComponent(c.name)}&amp;yard=kent">Quote<span class="sr-only"> ${c.name} from Kent</span></a>
        </li>`)}
      </ol>
    </div>
  </div>
</section>

<section class="pn-north" id="north" aria-labelledby="pn-north-title">
  <div class="stage stage--embed pn-north__stage">
    <div class="stage__sky" aria-hidden="true"></div>
    <div class="stage__map">${mapPlate(ctx, { dots: false })}</div>
    <div class="stage__ui">
      <div class="stage__copy">
        <p class="eyebrow">Across an ocean</p>
        <h2 class="h2" id="pn-north-title">Kent to Alaska, <em>anywhere in the state.</em></h2>
        <p class="pn-north__lede">Kent is the south end of the Uresco map. We are fully equipped to handle remote-location and export building packages, and we work with you on shipping coordination, dock delivery and rural Alaska delivery.</p>
        <ul class="pn-north__points">
          <li><a href="${ctx.u('services/#remote')}">${icon('ship', { size: 18 })}Remote &amp; export packages ${icon('arrow', { size: 16 })}</a></li>
          <li><a href="${ctx.u('services/#crating')}">${icon('crate', { size: 18 })}Crating &amp; packaging ${icon('arrow', { size: 16 })}</a></li>
          <li><a href="${ctx.u('services/#shipping')}">${icon('route', { size: 18 })}Shipping coordination ${icon('arrow', { size: 16 })}</a></li>
        </ul>
        <div class="actions"><a class="btn btn--lg" href="${ctx.u('alaska/')}">Alaska delivery ${icon('arrow', { size: 18 })}</a></div>
      </div>
    </div>
    ${legend()}
  </div>
</section>

<section class="section pn-yard" aria-labelledby="pn-yard-title">
  <div class="wrap pn-yard__grid">
    <div class="pn-yard__head">
      <p class="eyebrow">The Kent yard</p>
      <h2 class="h2" id="pn-yard-title">Call, email <em>or stop by.</em></h2>
      <p class="lede">Our friendly, knowledgeable sales staff is here to help.</p>
      <dl class="pn-yard__more">
        <div><dt>Toll-free</dt><dd><a href="${tel(kent.tollFree)}">${kent.tollFree}</a></dd></div>
        <div><dt>Email</dt><dd><a href="mailto:${kent.email}">${kent.email}</a></dd></div>
      </dl>
    </div>
    ${yardCard(ctx, kent, { compact: true })}
  </div>
</section>

${quoteBand(ctx, { eyebrow: 'Puget Sound job sites', title: 'Send the list. <em>Kent will quote it.</em>', body: 'Send drawings or a materials list and tell us where the job is. Kent will help with the take-off and the estimate.', href: quoteFrom(ctx, 'kent'), label: 'Request a quote from Kent' })}
`,
  }),
};

// One line of the switchboard: the question, the yard that answers it, and the number as one big target.
const ANSWER = {
  kent: 'Around Puget Sound',
  anchorage: 'Southcentral Alaska or a remote site',
  fairbanks: 'The Interior and points north',
};

const locations = {
  path: 'locations/',
  render: (ctx) => layout(ctx, {
    title: 'Locations',
    description: 'Uresco distribution centers in Kent, Washington, and Anchorage and Fairbanks, Alaska: phone, toll-free, fax, email, addresses and directions for each yard.',
    jsonLd: orgJsonLd(ctx),
    preload: [{ href: `${ctx.u('assets/map.svg')}?v=${ctx.version}`, type: 'image/svg+xml' }],
    body: html`
<section class="lc-open" aria-labelledby="lc-title">
  <div class="stage stage--embed lc-sw">
    <div class="stage__sky" aria-hidden="true"></div>
    <div class="stage__map">${mapPlate(ctx, { dots: false, eager: true })}</div>
    <div class="stage__ui">
      <div class="stage__copy">
        <p class="eyebrow">Locations</p>
        <h1 class="display" id="lc-title">Three yards. <em>One team.</em></h1>
      </div>
      <div class="finder lc-board">
        <h2 class="lc-board__title">Which yard should I call?</h2>
        <ul class="lc-rows">
          ${LOCATIONS.map((l) => html`<li class="lc-row" data-yard="${l.id}">
            <p class="lc-row__q">${ANSWER[l.id]}</p>
            <p class="lc-row__yard"><a href="#${l.id}">${l.city}<span>, ${l.state}</span></a>${openStatus(l)}</p>
            <a class="lc-row__num" href="${tel(l.phone)}"><span class="sr-only">Call ${l.city}: </span><span class="lc-row__digits">${l.phone}</span><span class="lc-row__call" aria-hidden="true">${icon('phone', { size: 20 })}</span></a>
          </li>`)}
        </ul>
        <p class="lc-board__foot">Not sure? Call any of us. We work as one team.</p>
      </div>
    </div>
    ${legend()}
  </div>
</section>

<section class="section" aria-labelledby="lc-yards-title">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Yard details', title: 'Call, visit, fax <em>or email.</em>', lede: 'Our friendly, knowledgeable sales staff is here to help. Give us a call, email or stop by.', id: 'lc-yards-title' })}
    <div class="lc-yards">
      ${LOCATIONS.map((l) => yardCard(ctx, l))}
    </div>
    <div class="callout reveal">
      <span class="callout__icon">${icon('clock', { size: 22 })}</span>
      <p><strong>Two time zones.</strong> Kent is on Pacific time; Anchorage and Fairbanks are on Alaska time. Each card shows the yard’s local time.</p>
    </div>
  </div>
</section>

${quoteBand(ctx, { eyebrow: 'Would rather write?', title: 'Send the plans. <br><em>We will find the yard.</em>', body: 'Send drawings or a materials list and tell us where the job is. The yard nearest your project will help with the take-off and the estimate.' })}
`,
  }),
};

export default [pnw, locations];
