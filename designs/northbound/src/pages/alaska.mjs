import { html, raw } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';
import { layout } from '../lib/layout.mjs';
import { sectionHead, closing, callLink, steps, faq, figure, yardSpread, routePlate, interlude, pageHero, openStatus, LAT, deg, MAP } from '../lib/components.mjs';
import { LOCATIONS, byId, tel } from '../data/locations.mjs';
import { PLACES, ALIASES, ACCESS, EXAMPLE, groupOf } from '../data/places.mjs';

// The Alaska page answers one question: can you get a building package to my community, and how?
// It says yes in the first line, then lets the visitor name the place. It runs south to north, like
// the home page, so the latitude rail works here too.
const STOPS = [
  { id: 'reach', lat: LAT.sitka, name: 'Sitka' },
  { id: 'anchorage', lat: LAT.anchorage, name: 'Anchorage' },
  { id: 'fairbanks', lat: LAT.fairbanks, name: 'Fairbanks' },
  { id: 'north', lat: LAT.utqiagvik, name: 'Utqiaġvik' },
];

// How freight generally reaches each part of the state. General geography, not Uresco schedules.
const REGIONS = [
  { name: 'Southeast', places: 'Ketchikan · Sitka · Juneau', how: 'No road in. Freight typically arrives by sea.', modes: ['ship'], yard: 'anchorage' },
  { name: 'Southcentral & the Kenai', places: 'Anchorage · Mat-Su · Kenai Peninsula · Valdez', how: 'On the road system: typically by truck from the Anchorage yard.', modes: ['truck'], yard: 'anchorage' },
  { name: 'The Interior', places: 'Fairbanks · Tok · Galena', how: 'Highway communities typically by truck from the Fairbanks yard. River villages by barge and air.', modes: ['truck', 'ship', 'plane'], yard: 'fairbanks' },
  { name: 'Western Alaska', places: 'Bethel · Dillingham · Nome · Kotzebue', how: 'Off the road system. Typically barge in the ice-free season, air year-round.', modes: ['ship', 'plane'], yard: 'anchorage' },
  { name: 'The Arctic Slope', places: 'Deadhorse · Utqiaġvik', how: 'Deadhorse by the Dalton Highway. Utqiaġvik typically by barge in the ice-free season, and by air year-round.', modes: ['truck', 'ship', 'plane'], yard: 'fairbanks' },
  { name: 'Kodiak, Cordova & the Aleutians', places: 'Kodiak · Cordova · Unalaska', how: 'Island and coastal communities with no road in, typically reached by sea and air.', modes: ['ship', 'plane'], yard: 'anchorage' },
];

// How freight moves in Alaska, in general terms. Uresco coordinates it; it does not run the carriers.
const MODES = [
  { icon: 'road', name: 'The road system', body: 'Job sites on the road system, in Southcentral, the Interior and up the highways north, are typically reached by truck from our Anchorage and Fairbanks yards.' },
  { icon: 'ship', name: 'Ocean freight & barge', body: 'Southeast Alaska is reached by sea. Coastal and western communities are typically reached by ocean carriers and, in the ice-free season, by barge. We work with you on shipping coordination and dock delivery.' },
  { icon: 'plane', name: 'Air cargo', body: 'Off the road system, air runs year-round. Tell us where you are building and we will work out how to get it there.' },
];

const FAQ = [
  ['Can you deliver to my community?', 'Delivery is available anywhere in Alaska, from Sitka to Utqiaġvik (Barrow). Tell us where the job is and we will work out the route with you, by road, ocean freight, barge or air, and quote the package.'],
  ['When should I order for barge season?', 'Early. Off the road system, barges run in the ice-free season, so call early in the year and we will plan back from the sailing you need.'],
  ['Which yard should I call?', 'Southcentral Alaska or a remote site: Anchorage. The Interior and points north: Fairbanks. Puget Sound: Kent. Any yard can help. They work as one team.'],
  ['Do you ship complete building packages?', 'Yes. We are fully equipped to handle remote-location and export building packages, crated for the trip. One complete package beats a second freight bill.'],
  ['Can you work from my plans?', 'Send drawings or a materials list. We will build the take-off, check it for gaps and quote it. Design services are available for your unique project needs.'],
  ['Who coordinates the shipping?', 'We work with you on all aspects of shipping coordination, dock delivery and rural Alaska delivery.'],
];

/* ---------- "Where are you building?" ---------- */
const STATES = { AK: 'Alaska', WA: 'Washington' };
const CALL_FOR = { kent: 'Puget Sound', anchorage: 'Southcentral Alaska or a remote site', fairbanks: 'The Interior and points north' };
const TRY = ['Bethel', 'Nome', 'Utqiaġvik', 'Juneau'];
const MODE_ICONS = ['truck', 'ship', 'plane'];
const ex = PLACES.find((p) => p.name === EXAMPLE);
const exAccess = ACCESS[ex.access];
const exYard = byId(ex.yard);
const modeText = ([, text], yard) => text.replace('{yard}', yard.city);
const quoteHref = (ctx, where, yard) => html`${ctx.u('quote/')}?location=${encodeURIComponent(where)}&amp;yard=${yard}`;

// What the script needs, and nothing it does not. Written into the page as JSON.
const finderData = (ctx) => JSON.stringify({
  quote: ctx.u('quote/'),
  example: EXAMPLE,
  w: MAP.width,
  h: MAP.height,
  states: STATES,
  access: ACCESS,
  yards: Object.fromEntries(LOCATIONS.map((l) => [l.id, { name: l.city, phone: l.phone }])),
  places: PLACES.map((p) => [p.name, p.st, Number(p.lat.toFixed(1)), MAP.places[p.name], p.region, p.access, p.yard, groupOf(p), p.label || '']),
  aliases: ALIASES,
});

// The card is already rendered for the example place; the script only fills its fields, so nothing
// shifts on load. Without JavaScript the field and the card are hidden and the three yards remain.
const finder = (ctx) => html`
  <div class="finder__side">
    <p class="shead__bar"><span class="chead__no">01</span><span>Your community</span></p>
    <h2 class="h3 finder__title" id="reach-title"><label for="place-input">Where are you building?</label></h2>

    <div class="finder__live">
      <div class="finder__field">
        ${icon('pin', { size: 20 })}
        <input class="finder__input" id="place-input" type="text" role="combobox" aria-expanded="false" aria-controls="place-list" aria-autocomplete="list" autocomplete="off" autocapitalize="words" spellcheck="false" enterkeyhint="search" placeholder="Town, village or city">
        <button type="button" class="finder__clear" data-clear hidden>${icon('close', { size: 18 })}<span class="sr-only">Clear the search</span></button>
        <ul class="finder__list" id="place-list" role="listbox" aria-label="Places" hidden></ul>
      </div>
      <p class="finder__try">Try ${raw(TRY.map((c, i) => `<button type="button" class="finder__eg" data-place="${c}">${c}</button>${i === TRY.length - 2 ? ' or ' : i < TRY.length - 2 ? ', ' : '.'}`).join(''))}</p>

      <div class="answer" data-answer>
        <div class="answer__head">
          <p class="answer__lat" data-a="lat" aria-hidden="true"><span data-a="latnum">${ex.lat.toFixed(1)}</span><sup>°N</sup></p>
          <div class="answer__where">
            <p class="answer__kicker"><span class="answer__eg" data-a="eg">Example</span><span data-a="region">${ex.region}</span></p>
            <p class="answer__name" data-a="name">${ex.name}, ${STATES[ex.st]}</p>
            <p class="answer__tag" data-a="tag">${exAccess.tag}</p>
          </div>
        </div>
        <p class="answer__else" data-a="else" hidden>That is not on our short list, which does not mean we cannot get there. Send the details and a yard will work out the route with you.</p>
        <dl class="answer__rows">
          <div data-a="how">
            <dt>How freight typically gets there</dt>
            <dd><ul class="answer__modes">
              ${[0, 1].map((i) => html`<li${exAccess.modes[i] ? '' : html` hidden`}>${MODE_ICONS.map((k) => html`<span class="answer__ic" data-ic="${i}-${k}"${exAccess.modes[i]?.[0] === k ? '' : html` hidden`}>${icon(k, { size: 20 })}</span>`)}<span data-a="m${i}">${exAccess.modes[i] ? modeText(exAccess.modes[i], exYard) : ''}</span></li>`)}
            </ul></dd>
          </div>
          <div>
            <dt>Yard to call</dt>
            <dd>
              ${LOCATIONS.map((l) => html`<div class="answer__yard" data-y="${l.id}"${l.id === ex.yard ? '' : html` hidden`}>
                <p class="answer__city">${l.city} ${openStatus(l, { short: true })}</p>
                <a class="btn btn--dark answer__call" href="${tel(l.phone)}">${icon('phone', { size: 16 })}<span class="sr-only">Call ${l.city}: </span>${l.phone}</a>
              </div>`)}
              <div class="answer__yard" data-y="any" hidden>
                <p class="answer__city">Any of the three</p>
                ${callLink(ctx, { cls: 'btn btn--dark answer__call', size: 16 })}
              </div>
            </dd>
          </div>
        </dl>
        <a class="btn btn--block answer__quote" data-a="quote" href="${quoteHref(ctx, `${ex.name}, ${ex.st}`, ex.yard)}"><span>Get a quote for <span data-a="short">${ex.name}</span></span> ${icon('arrow', { size: 18 })}</a>
        <p class="answer__note" data-a="note">Typical for the region, not a schedule or a price. Any yard can help.</p>
      </div>
      <p class="sr-only" role="status" aria-live="polite" data-live></p>
      <script type="application/json" data-finder-data>${raw(finderData(ctx))}</script>
    </div>

    <div class="finder__nojs">
      <p class="finder__nojs-lead">Call the yard nearest your job. Any yard can help.</p>
      <ul class="finder__yards">
        ${LOCATIONS.map((l) => html`<li><span><b>${l.city}, ${l.state}</b><small>${CALL_FOR[l.id]}</small></span><a href="${tel(l.phone)}">${l.phone}</a></li>`)}
      </ul>
      <a class="btn btn--block" href="${ctx.u('quote/')}">Request a quote ${icon('arrow', { size: 18 })}</a>
    </div>
  </div>`;

// Reads the same with or without the finder: where things are, how freight typically gets there,
// who to call. Static on purpose, so there is one interactive finder on the page and not two.
const regionLedger = (ctx) => html`
  <div class="regions">
    <div class="regions__head">
      <h3 class="h4">Or read it by region</h3>
      <p>Typical for the region, not a schedule or a price. Any yard can help.</p>
    </div>
    <ul class="regions__list">
      ${REGIONS.map((r) => {
        const y = byId(r.yard);
        return html`<li class="region">
          <h4 class="region__name">${r.name}</h4>
          <span class="region__modes" aria-hidden="true">${r.modes.map((m) => icon(m, { size: 18 }))}</span>
          <p class="region__places">${r.places}</p>
          <p class="region__how">${r.how}</p>
          <p class="region__acts">
            <a class="region__call" href="${tel(y.phone)}">${icon('phone', { size: 16 })}<span>Call ${y.city}</span> <b>${y.phone}</b></a>
            <a class="region__quote" href="${quoteHref(ctx, r.name, r.yard)}">Quote <span class="sr-only">for ${r.name} </span>${icon('arrow', { size: 16 })}</a>
          </p>
        </li>`;
      })}
    </ul>
    <p class="regions__note">Somewhere else? Any yard can help. Call <a href="${tel(byId('anchorage').phone)}">Anchorage ${byId('anchorage').phone}</a> or <a href="${tel(byId('fairbanks').phone)}">Fairbanks ${byId('fairbanks').phone}</a>.</p>
  </div>`;

export default {
  path: 'alaska/',
  render: (ctx) => layout(ctx, {
    title: 'Alaska delivery — Anchorage & Fairbanks',
    description: 'Building materials delivered anywhere in Alaska, from Sitka to Utqiaġvik. Remote and export building packages, shipping coordination and dock delivery from Uresco’s Anchorage and Fairbanks distribution centers.',
    rail: STOPS,
    jsonLd: html`<script type="application/ld+json">${raw(JSON.stringify({
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
    }))}</script>`,
    body: html`
${pageHero(ctx, {
  crumbs: [['Alaska delivery']],
  eyebrow: `Alaska delivery · ${deg(LAT.sitka)} to ${deg(LAT.utqiagvik)}`,
  title: '<span class="ask__q">Can you get a building package to my community?</span> <span class="ask__a">Yes. <em>Anywhere in Alaska.</em></span>',
  after: html`<p class="lede phero__lede ask__lede">Complete building packages, crated and shipped by road, sea, barge or air, from Sitka to Utqiaġvik. Name your community and see how freight typically gets there.</p>`,
  cls: 'phero--ask',
  attrs: html` data-lat="${LAT.sitka}" data-place="Sitka"`,
})}

<section class="reach" id="reach" data-lat="${ex.lat.toFixed(1)}" data-place="${ex.name}" aria-labelledby="reach-title">
  <div class="wrap">
    <div class="finder" data-finder data-placefinder>
      ${finder(ctx)}
      <div class="finder__map">${routePlate(ctx, { no: 'Plate I', title: 'Reaching every part of Alaska', eager: true })}</div>
    </div>
    ${regionLedger(ctx)}
  </div>
</section>

${figure(ctx, 'floatplane-lake', { ratio: 'cine', cls: 'fig--bleed ask__photo', parallax: true, caption: 'A floatplane skims across a lake. Off the road system, air runs year-round.', pos: '45% 62%' })}

<section class="section section--paper2 legs" data-lat="${ex.lat.toFixed(1)}" data-lat-to="${LAT.anchorage}" data-place="En route" data-place-end="Anchorage" aria-labelledby="legs-title">
  <div class="wrap">
    ${sectionHead({ no: '02', eyebrow: 'How a remote package moves', id: 'legs-title', title: 'From the take-off <em>to the dock.</em>', lede: 'Remote jobs go wrong on the details: a missing box of hangers, a load that misses the barge. One complete package beats a second freight bill.' })}
    ${steps([
      ['Plans in, take-off out', 'Send drawings or a list. We build the take-off, check it for gaps and quote it.'],
      ['Package and crate', 'We assemble the complete package and crate it for the trip.'],
      ['Work out the freight', 'We work with you on shipping coordination, whether truck, ocean freight, barge or air, around your schedule and the season.'],
      ['Dock or site delivery', 'Delivered to the dock or straight to the site.'],
    ])}
  </div>
</section>

<section class="section section--deep modes" data-lat="${LAT.anchorage}" data-place="Anchorage" aria-labelledby="modes-title">
  <div class="wrap">
    ${sectionHead({ no: '03', eyebrow: 'Ways freight moves', id: 'modes-title', title: 'Road, sea <em>or air.</em>', lede: 'Much of Alaska is off the road system. Which way a package travels depends on where it is going and what month it is.' })}
    <ul class="modes__list">
      ${MODES.map((m, i) => html`<li class="rv" style="--i:${i}">${icon(m.icon, { size: 28 })}<h3 class="h3">${m.name}</h3><p>${m.body}</p></li>`)}
    </ul>
    <div class="callout season rv">${icon('snow', { size: 24 })}<p><strong>Plan around the season.</strong> Barge service to western and northern Alaska runs only in the ice-free months. Call early and we will plan back from the sailing you need.</p></div>
  </div>
  ${figure(ctx, 'valdez-port', { ratio: 'cine', cls: 'fig--bleed modes__photo', parallax: true, caption: 'A working port below snow-covered mountains.', place: 'Valdez, Alaska', lat: LAT.valdez, pos: '50% 84%' })}
</section>

<section class="section yardsec" aria-labelledby="yards-title">
  <div class="wrap">
    ${sectionHead({ no: '04', eyebrow: 'Alaska yards', id: 'yards-title', title: 'Anchorage <em>&amp; Fairbanks.</em>', lede: 'Two distribution centers on the road system. Our friendly, knowledgeable sales staff is here to help. Give us a call, email or stop by.' })}
    ${yardSpread(ctx, byId('anchorage'), { photoKey: 'chugach', caption: 'Glaciers and peaks of the Chugach Mountains.', attrs: html` data-lat="${LAT.anchorage}" data-place="Anchorage"` })}
    ${yardSpread(ctx, byId('fairbanks'), { photoKey: 'north-slope', caption: 'A loaded pickup under hoarfrost in Interior Alaska.', flip: true, pos: '62% 60%', attrs: html` data-lat="${LAT.fairbanks}" data-place="Fairbanks"` })}
  </div>
</section>

<section class="section section--ice asked" id="north" data-lat="${LAT.fairbanks}" data-lat-to="${LAT.utqiagvik}" data-place="The Bush" data-place-end="Utqiaġvik" aria-labelledby="faq-title">
  <div class="wrap asked__grid">
    <div class="asked__head">
      <p class="shead__bar"><span class="chead__no">05</span><span>Questions</span></p>
      <h2 class="h2 rv" id="faq-title">Remote delivery, <em>answered.</em></h2>
      <p class="lede rv" style="--i:1">Not answered here? Call a yard.</p>
      ${callLink(ctx, { cls: 'btn btn--line rv', attrs: html` style="--i:2"` })}
    </div>
    ${faq(FAQ)}
  </div>
</section>

${interlude(ctx, 'remote-village', { line: 'Utqiaġvik, 71.3° north. <em>Still on the route.</em>', note: 'Snow-drifted buildings and a beached boat on the Arctic coast.', place: 'Utqiaġvik', lat: LAT.utqiagvik, pos: '45% 58%' })}

${closing(ctx, {
  title: 'Building off <em>the road system?</em>',
  body: 'Send plans or a list and tell us where the job is. We will quote the package and work out the freight with you.',
  query: `?location=${encodeURIComponent('Alaska')}&yard=anchorage`,
  rows: [['Send', 'Plans or a list, and where the job is'], ['To', 'The Anchorage or Fairbanks yard'], ['Returns', 'A quote for the package and a plan for the freight'], ['Lands', 'At the dock, or on your site']],
})}
`,
  }),
};
