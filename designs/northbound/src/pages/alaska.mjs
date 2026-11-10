import { html, raw } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';
import { layout } from '../lib/layout.mjs';
import { preloadFor, sectionHead, pageHero, manifest, steps, faq, figure, yardSpread, routePlate, interlude, LAT, deg } from '../lib/components.mjs';
import { byId, tel } from '../data/locations.mjs';

// The Alaska page answers one question: can you get a building package to my community, and how?
// It runs south to north, like the home page, so the latitude rail works here too.
const STOPS = [
  { id: 'reach', lat: LAT.sitka, name: 'Sitka' },
  { id: 'anchorage', lat: LAT.anchorage, name: 'Anchorage' },
  { id: 'fairbanks', lat: LAT.fairbanks, name: 'Fairbanks' },
  { id: 'north', lat: LAT.utqiagvik, name: 'Utqiaġvik' },
];

// How freight generally reaches each part of the state. General geography, not Uresco schedules.
// x is where the region sits across the plate (0–1), used to pan the map on small screens.
const REGIONS = [
  { id: 'southeast', name: 'Southeast', places: 'Ketchikan · Sitka · Juneau', how: 'No road in. Freight arrives by sea.', modes: ['ship'], yard: 'anchorage', x: 0.63 },
  { id: 'southcentral', name: 'Southcentral & the Kenai', places: 'Anchorage · Mat-Su · Kenai Peninsula · Valdez', how: 'On the road system: by truck from the Anchorage yard.', modes: ['truck'], yard: 'anchorage', x: 0.42 },
  { id: 'interior', name: 'The Interior', places: 'Fairbanks · Tok · Galena', how: 'Highway communities by truck from the Fairbanks yard. River villages by barge and air.', modes: ['truck', 'plane'], yard: 'fairbanks', x: 0.42 },
  { id: 'western', name: 'Western Alaska', places: 'Bethel · Dillingham · Nome · Kotzebue', how: 'Off the road system. Barge in the ice-free season, air all year.', modes: ['ship', 'plane'], yard: 'anchorage', x: 0.27 },
  { id: 'arctic', name: 'The Arctic Slope', places: 'Deadhorse · Utqiaġvik', how: 'Deadhorse by the Dalton Highway. Utqiaġvik by barge in season, and by air.', modes: ['truck', 'ship', 'plane'], yard: 'fairbanks', x: 0.4 },
  { id: 'southwest', name: 'Kodiak & the Aleutians', places: 'Kodiak · Unalaska', how: 'Island communities, reached by sea.', modes: ['ship'], yard: 'anchorage', x: 0.24 },
];

// How freight moves in Alaska, in general terms. Uresco coordinates it; it does not run the carriers.
const MODES = [
  { icon: 'road', name: 'The road system', body: 'Job sites on the road system, in Southcentral, the Interior and up the highways north, are reached by truck from our Anchorage and Fairbanks yards.' },
  { icon: 'ship', name: 'Ocean freight & barge', body: 'Southeast, coastal and western Alaska are reached by ocean carriers and seasonal barge service. We coordinate the bookings and get your package to the dock.' },
  { icon: 'plane', name: 'Air cargo', body: 'Some communities are reached only by air. Tell us where you are building and we will work out how to get it there.' },
];

const FAQ = [
  ['Can you deliver to my community?', 'Delivery is available anywhere in Alaska, from Sitka to Utqiaġvik (Barrow). Tell us where the job is and we will work out the route, by road, ocean freight, barge or air, and price it.'],
  ['When should I order for barge season?', 'Barge service to western and northern Alaska runs only in the ice-free months, and space on the last sailings goes first. Call early in the year: we plan backward from the sailing you need, so the package is built, crated and at the dock in time.'],
  ['Do you ship complete building packages?', 'Yes. We are fully equipped to handle remote-location and export building packages: framing, envelope, openings and hardware, so the whole job ships together.'],
  ['Can you work from my plans?', 'Send drawings or a materials list. We will build the take-off, check it for gaps and quote it. Design services are available for projects with unique needs.'],
  ['Who coordinates the shipping?', 'We work with you on all aspects of shipping coordination, dock delivery and rural Alaska delivery, so you have one point of contact from quote to landing.'],
];

export default {
  path: 'alaska/',
  render: (ctx) => layout(ctx, {
    title: 'Alaska Delivery — Anchorage & Fairbanks',
    description: 'Building materials delivered anywhere in Alaska, from Sitka to Utqiaġvik. Remote and export building packages, shipping coordination and dock delivery from Uresco’s Anchorage and Fairbanks distribution centers.',
    preload: [preloadFor(ctx, 'floatplane-lake')],
    rail: STOPS,
    jsonLd: html`<script type="application/ld+json">${raw(JSON.stringify({
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
    }))}</script>`,
    body: html`
${pageHero(ctx, {
  crumbs: [['Alaska delivery']],
  eyebrow: `Alaska delivery · ${deg(LAT.sitka)} to ${deg(LAT.utqiagvik)}`,
  title: 'Anywhere <em>in Alaska.</em>',
  lede: 'Complete building packages, crated and shipped by road, sea, barge or air to places without a lumber yard. From Sitka to Utqiaġvik, out of two Alaska distribution centers and one on Puget Sound.',
  photoKey: 'floatplane-lake',
  caption: 'A floatplane lifts off the water. Some communities are reached only by air.',
  pos: '45% 62%',
  actions: html`<a class="btn" href="${ctx.u('quote/')}">Quote a remote job ${icon('arrow', { size: 18 })}</a><button type="button" class="btn btn--line" data-open="call-sheet" aria-haspopup="dialog">${icon('phone', { size: 18 })} Call Anchorage or Fairbanks</button>`,
  attrs: html` data-lat="${LAT.sitka}" data-place="Sitka"`,
})}

<section class="section reach" id="reach" data-lat="${LAT.sitka}" data-place="Southeast" aria-labelledby="reach-title">
  <div class="wrap">
    ${sectionHead({ no: '01', eyebrow: 'Reach', id: 'reach-title', title: 'Can you get it to my community? <em>Yes.</em>', lede: 'Tell us where the job is. We work out the route and price the package and the freight together. Here is how materials generally reach each part of the state.' })}
    <div class="finder" data-finder="plate">
      <div class="finder__map">${routePlate(ctx, { no: 'Plate I', title: 'Reaching every part of Alaska', eager: false })}</div>
      <div class="finder__side">
        <p class="label finder__hint">Find your region</p>
        <ul class="finder__list">
          ${REGIONS.map((r) => html`<li><button type="button" class="region" data-region="${r.id}" data-x="${r.x}" aria-pressed="false">
            <span class="region__name">${r.name}</span>
            <span class="region__modes" aria-hidden="true">${r.modes.map((m) => icon(m, { size: 18 }))}</span>
            <span class="region__places">${r.places}</span>
            <span class="region__how">${r.how}</span>
            <span class="region__yard">Start with ${byId(r.yard).city}</span>
          </button></li>`)}
        </ul>
        <p class="finder__note">Not on the list? It is still on the route. Call <a href="${tel(byId('anchorage').phone)}">Anchorage ${byId('anchorage').phone}</a> or <a href="${tel(byId('fairbanks').phone)}">Fairbanks ${byId('fairbanks').phone}</a>.</p>
      </div>
    </div>
  </div>
</section>

<section class="section section--paper2 legs" data-lat="${LAT.sitka}" data-lat-to="${LAT.anchorage}" data-place="At sea" data-place-end="Anchorage" aria-labelledby="legs-title">
  <div class="wrap">
    ${sectionHead({ no: '02', eyebrow: 'How a remote package moves', id: 'legs-title', title: 'One call. <em>Every leg.</em>', lede: 'Remote jobs fail on the details: a missing box of hangers, a load that misses the last barge. The work is built around not letting that happen.' })}
    ${steps([
      ['Plans in, take-off out', 'Send drawings or a list. We build the take-off, check it for gaps and price it delivered.'],
      ['Package and crate', 'We assemble the complete package, then crate, band and wrap it for the trip.'],
      ['Book the freight', 'We coordinate the carrier, whether truck, ocean freight, barge or air, against your schedule and the season.'],
      ['Dock or site delivery', 'Delivered to the dock or straight to the site, with one point of contact the whole way.'],
    ])}
  </div>
</section>

<section class="section section--deep modes" data-lat="${LAT.anchorage}" data-place="Anchorage" aria-labelledby="modes-title">
  <div class="wrap">
    ${sectionHead({ no: '03', eyebrow: 'Ways we move freight', id: 'modes-title', title: 'Road, sea <em>or air.</em>', lede: 'Much of Alaska is off the road system. Which way a package travels depends on where it is going and what month it is.' })}
    <ul class="modes__list">
      ${MODES.map((m, i) => html`<li class="rv" style="--i:${i}">${icon(m.icon, { size: 28 })}<h3 class="h3">${m.name}</h3><p>${m.body}</p></li>`)}
    </ul>
    <div class="callout season rv">${icon('snow', { size: 24 })}<p><strong>Plan around the season.</strong> Barge service to western and northern Alaska runs only in the ice-free months, and space on the last sailings goes first. Call early and we will plan back from the sailing you need.</p></div>
  </div>
  ${figure(ctx, 'tug-barge', { ratio: 'cine', cls: 'fig--bleed modes__photo', parallax: true, caption: 'A tug and a loaded barge under way.', pos: '50% 62%' })}
</section>

<section class="section yardsec" aria-labelledby="yards-title">
  <div class="wrap">
    ${sectionHead({ no: '04', eyebrow: 'Alaska yards', id: 'yards-title', title: 'Anchorage <em>&amp; Fairbanks.</em>', lede: 'Two distribution centers on the road system, with a full range of products and services for the commercial and residential builder. Give us a call, email or stop by.' })}
    ${yardSpread(ctx, byId('anchorage'), { photoKey: 'chugach', caption: 'Glaciers and peaks of the Chugach Mountains.', place: 'East of Anchorage', attrs: html` data-lat="${LAT.anchorage}" data-place="Anchorage"` })}
    ${yardSpread(ctx, byId('fairbanks'), { photoKey: 'north-slope', caption: 'A loaded pickup under hoarfrost.', place: 'Interior Alaska', flip: true, pos: '62% 60%', attrs: html` data-lat="${LAT.fairbanks}" data-place="Fairbanks"` })}
  </div>
</section>

<section class="section section--ice asked" id="north" data-lat="${LAT.fairbanks}" data-lat-to="${LAT.utqiagvik}" data-place="The Bush" data-place-end="Utqiaġvik" aria-labelledby="faq-title">
  <div class="wrap asked__grid">
    <div class="asked__head">
      <p class="shead__bar"><span class="chead__no">05</span><span>Questions</span></p>
      <h2 class="h2 rv" id="faq-title">Remote delivery, <em>answered.</em></h2>
      <p class="lede rv" style="--i:1">Still wondering? The yards answer questions like these every day.</p>
      <button type="button" class="btn btn--line rv" style="--i:2" data-open="call-sheet" aria-haspopup="dialog">${icon('phone', { size: 18 })} Call a yard</button>
    </div>
    ${faq(FAQ)}
  </div>
</section>

${interlude(ctx, 'remote-village', { line: 'Utqiaġvik, 71.3° north. <em>Still on the route.</em>', note: 'Snow-drifted buildings and a beached boat on the Arctic coast.', place: 'Utqiaġvik', lat: LAT.utqiagvik, pos: '45% 58%' })}

<section class="section closing" data-lat="${LAT.utqiagvik}" data-place="Utqiaġvik">
  <div class="wrap">
    ${manifest(ctx, {
      title: 'Building off <em>the road system?</em>',
      body: 'Send plans or a list and tell us where the job is. We will quote the package and the freight together.',
      rows: [['Send', 'Plans or a list, and where the job is'], ['To', 'The Anchorage or Fairbanks yard'], ['Returns', 'The package and the freight, quoted together'], ['Lands', 'At the dock, or on your site']],
    })}
  </div>
</section>
`,
  }),
};
