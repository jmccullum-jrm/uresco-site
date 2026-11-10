import { html, raw } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';
import { layout } from '../lib/layout.mjs';
import { sectionHead, pageHero, pageHeroPreload, quoteBand, yardCard, deliveryMap, eyebrow, sticker, marquee, win, MAP_TOWNS } from '../lib/components.mjs';
import { LOCATIONS, byId, tel } from '../data/locations.mjs';
import { WAYS, DESTINATIONS, LATITUDES } from '../data/destinations.mjs';

// How freight moves in Alaska, in general terms. Uresco coordinates it; it does not run the carriers.
const MODES = [
  { icon: 'truck', name: 'The road system', tag: 'Truck', body: 'Job sites on the road system (Southcentral, the Interior and the highways north) are reached by truck from our Anchorage and Fairbanks yards.' },
  { icon: 'ship', name: 'Ocean freight & barge', tag: 'Sea', body: 'Southeast, coastal and western Alaska are reached by ocean carriers and seasonal barge service. We coordinate bookings and get your package to the dock.' },
  { icon: 'plane', name: 'Air cargo', tag: 'Air', body: 'Some communities are reached only by air. Tell us where you’re building and we’ll work out how to get it there.' },
];

const LEGS = [
  { icon: 'ruler', name: 'Plans in, take-off out', body: 'Send drawings or a list. We build the take-off and quote it.' },
  { icon: 'crate', name: 'Package and crate', body: 'We assemble the complete package, then crate, band and wrap it for the trip.' },
  { icon: 'route', name: 'Book the freight', body: 'We coordinate the carrier (truck, ocean freight, barge or air) against your schedule and the season.' },
  { icon: 'pin', name: 'Dock or site delivery', body: 'Delivered to the dock or straight to the site, with one point of contact the whole way.' },
];

const FAQ = [
  ['Can you deliver to my community?', 'Delivery is available anywhere in Alaska, from Sitka to Utqiaġvik (Barrow). Tell us where the job is and we will work out the route (road, ocean freight, barge or air) and quote it.'],
  ['When should I order for barge season?', 'Barge service to western and northern Alaska runs only in the ice-free season. Call early in the year: we plan backward from the sailing you need, so the package is built, crated and at the dock in time.'],
  ['Do you ship complete building packages?', 'Yes. We are fully equipped to handle remote-location and export building packages (framing, envelope, openings and hardware) so the whole job ships together.'],
  ['Can you work from my plans?', 'Send drawings or a materials list. We will build the take-off, check it for gaps and quote it. Design services are available for projects with unique needs.'],
  ['Who coordinates the shipping?', 'We work with you on all aspects of shipping coordination, dock delivery and rural Alaska delivery, so you have one point of contact from quote to landing.'],
];

// Chips run south to north, the way the map reads.
const TOWN_ORDER = ['ketchikan', 'sitka', 'juneau', 'cordova', 'valdez', 'homer', 'kodiak', 'unalaska', 'dillingham', 'bethel', 'nome', 'galena', 'kotzebue', 'deadhorse', 'utqiagvik'];
const TOWNS = TOWN_ORDER.map((id) => ({ id, name: MAP_TOWNS.find((t) => t.id === id).name, ...DESTINATIONS[id] }));
// The question in the hero cycles through a few of them.
const ASK = ['Bethel', 'Nome', 'Sitka', 'Kotzebue', 'Galena', 'Utqiaġvik', 'my village'];

const finderData = () => JSON.stringify({
  ways: WAYS,
  towns: Object.fromEntries(TOWNS.map((t) => { const y = byId(t.yard); return [t.id, { name: t.name, way: t.way, yard: y.city, phone: y.phone, tel: tel(y.phone), yardId: y.id }]; })),
}).replace(/</g, '\\u003c');

// The tape: latitude as a tape measure, 46° to 72° north.
const T0 = 46, T1 = 72;
const tapePos = (lat) => (((lat - T0) / (T1 - T0)) * 100).toFixed(2);

export default {
  path: 'alaska/',
  render: (ctx) => layout(ctx, {
    title: 'Alaska Delivery — Anchorage & Fairbanks',
    description: 'Building materials delivered anywhere in Alaska, from Sitka to Utqiaġvik. Remote and export building packages, shipping coordination and dock delivery from Uresco’s Anchorage and Fairbanks distribution centers.',
    preload: [pageHeroPreload(ctx, 'floatplane')],
    jsonLd: html`<script type="application/ld+json">${raw(JSON.stringify({
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
    }))}</script>`,
    body: html`
${pageHero(ctx, {
  cls: 'phero--yes',
  eyebrow: 'Alaska delivery',
  before: html`<p class="ask">
    <span class="sr-only">Can you get a building package to my community?</span>
    <span class="ask__q" aria-hidden="true">Can you get a building package to</span>
    <span class="ask__swap" aria-hidden="true" data-swap>${ASK.map((w, i) => html`<span${i === 0 ? html` class="is-on"` : ''}>${w}?</span>`)}</span>
  </p>`,
  title: 'Yes. <span class="yes__strap">Anywhere in Alaska.</span>',
  lede: 'From Sitka to Utqiaġvik. Two Alaska yards with a full line for the commercial and residential builder, and remote-location delivery to everywhere the road doesn’t go.',
  photoKey: 'floatplane',
  actions: html`<a class="btn" href="${ctx.u('quote/')}">Quote a remote job ${icon('arrow', { size: 18 })}</a><button type="button" class="btn btn--line" data-open="call-sheet" aria-haspopup="dialog">${icon('phone', { size: 18 })} Call an Alaska yard</button><button type="button" class="motion-toggle motion-toggle--icon" data-motion-toggle><span class="sr-only">Pause motion</span></button>`,
})}

<section class="section field-k finder clip" id="route">
  <div class="divider divider--u" aria-hidden="true"><i class="plx"></i><i class="plx"></i><i class="plx"></i></div>
  <div class="wrap finder__grid">
    <div class="finder__head">
      ${eyebrow('Reach')}
      <h2 class="d2">Pick a place. <em>See the way in.</em></h2>
      <p class="lede">Two Alaska yards on the road system, a Kent yard on Puget Sound, and the freight lanes that connect them to the rest of the state.</p>
    </div>
    <div class="finder__map">
      ${deliveryMap(ctx)}
      ${sticker(raw('Sitka <span aria-hidden="true">→</span><span class="sr-only">to</span> Utqiaġvik'), { tone: 'y', rot: -7, cls: 'finder__sticker' })}
    </div>
    <div class="finder__pick" data-finder>
      <p class="finder__label" id="finder-label">Where are you building? <span>Pick an example</span></p>
      <ul class="towns" aria-labelledby="finder-label">
        ${TOWNS.map((t) => html`<li><button type="button" class="town" data-town="${t.id}" aria-pressed="false">${t.name}</button></li>`)}
      </ul>
      <div class="way on-y" data-way aria-live="polite">
        <span class="way__icon" aria-hidden="true">${['route', 'truck', 'ship', 'plane'].map((n) => html`<span data-ico="${n}">${icon(n, { size: 30 })}</span>`)}</span>
        <p class="way__label" data-way-label>Road, sea or air</p>
        <h3 class="way__name" data-way-name>Anywhere in Alaska</h3>
        <p class="way__text" data-way-text>Delivery is available anywhere in Alaska, from Sitka to Utqiaġvik. Tell us where the job is and we’ll work out the way in.</p>
        <div class="way__acts">
          <a class="btn btn--sm nums" data-way-call href="${tel(byId('anchorage').phone)}">${icon('phone', { size: 16 })} <span data-way-yard>Anchorage</span> ${raw('&nbsp;')}<span data-way-phone>${byId('anchorage').phone}</span></a>
          <a class="link" data-way-quote href="${ctx.u('quote/')}">Quote this job ${icon('arrow', { size: 16 })}</a>
        </div>
      </div>
      <script type="application/json" data-finder-data>${raw(finderData())}</script>
    </div>
  </div>
</section>

<section class="section field-p legsec">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'How a remote package works', title: 'One call. <em>Every leg.</em>', lede: 'Remote jobs fail on the details: a missing box of hangers, a load that misses the barge. The process is built around not letting that happen.' })}
    <ol class="legs">
      ${LEGS.map((l, i) => html`<li class="leg" style="--i:${i}" data-reveal>
        <span class="leg__no nums" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
        <span class="leg__icon">${icon(l.icon, { size: 28 })}</span>
        <h3 class="leg__name">${l.name}</h3>
        <p class="leg__text">${l.body}</p>
      </li>`)}
    </ol>
  </div>
</section>

<section class="field-y north clip">
  <div class="wrap north__grid">
    <div class="north__copy">
      ${eyebrow('How far north')}
      <h2 class="north__big"><span>71°</span> <span>north.</span></h2>
      <p class="lede">Utqiaġvik, on the Arctic coast, is as far north as Alaska goes. It is still on our map: delivery is available from Sitka to Utqiaġvik, anywhere in the state.</p>
    </div>
    <figure class="north__fig">
      ${win(ctx, 'remote-village', { cls: 'north__win', sizes: '(min-width: 900px) 26vw, 56vw' })}
      <figcaption>Utqiaġvik, 71.3° N</figcaption>
    </figure>
  </div>
  <div class="tape" role="img" aria-label="Latitude scale from 46 to 72 degrees north: Kent yard 47.4, Sitka 57.1, Anchorage yard 61.2, Fairbanks yard 64.8, Utqiaġvik 71.3.">
    <div class="tape__ticks" aria-hidden="true">${[50, 55, 60, 65, 70].map((d) => html`<span style="--at:${tapePos(d)}%">${d}°</span>`)}</div>
    ${LATITUDES.map((p, i) => html`<span class="tape__stop${p.yard ? ' tape__stop--yard' : ''}${i % 2 ? ' tape__stop--low' : ''}" aria-hidden="true" style="--at:${tapePos(p.lat)}%"><b>${p.name}</b><i class="nums">${p.lat.toFixed(1)}°</i></span>`)}
  </div>
</section>

<section class="section field-k modesec">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Ways we move freight', title: 'Road, sea <em>or air.</em>', lede: 'How it travels depends on where it is going. Often it is more than one of these.' })}
    <ul class="modes">
      ${MODES.map((m, i) => html`<li class="mode" style="--i:${i}" data-reveal>
        <span class="mode__icon">${icon(m.icon, { size: 44 })}</span>
        <span class="mode__tag">${m.tag}</span>
        <h3 class="mode__name">${m.name}</h3>
        <p>${m.body}</p>
      </li>`)}
    </ul>
    <div class="season on-y" data-reveal>
      <span class="season__icon">${icon('snow', { size: 30 })}</span>
      <p><strong>Plan around the season.</strong> Barge service to western and northern Alaska runs only in the ice-free season. Call early in the year and we’ll plan back from the sailing you need.</p>
      <button type="button" class="btn btn--sm" data-open="call-sheet" aria-haspopup="dialog">${icon('phone', { size: 16 })} Call a yard</button>
    </div>
  </div>
</section>

<section class="section field-p">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Alaska yards', title: 'Anchorage <em>&amp; Fairbanks.</em>', lede: 'Our friendly, knowledgeable sales staff is here to help. Give us a call, email or stop by.' })}
    <div class="yards yards--2">${LOCATIONS.filter((l) => l.state === 'AK').map((l) => yardCard(ctx, l, { photoSizes: '(min-width: 900px) 16vw, 30vw' }))}</div>
  </div>
</section>

${marquee(TOWNS.map((t) => t.name), { tone: 'k', tilt: true, slow: true })}

<section class="section field-p faqsec">
  <div class="wrap faqsec__grid">
    <div class="faqsec__head">
      ${eyebrow('Questions')}
      <h2 class="d2">Before <em>you ask.</em></h2>
      <p class="lede">Not answered here? Ask the yard.</p>
      <div class="actions"><button type="button" class="btn" data-open="call-sheet" aria-haspopup="dialog">${icon('phone', { size: 18 })} Call a yard</button></div>
    </div>
    <div class="faq">
      ${FAQ.map(([q, a], i) => html`<details${i === 0 ? html` open` : ''}><summary>${q}</summary><p>${a}</p></details>`)}
    </div>
  </div>
</section>
${quoteBand(ctx, { title: 'Building off <em>the road system?</em>', body: 'Send plans or a list and tell us where the job is. We’ll quote the package and coordinate the freight.', photoKey: 'tug-barge', label: 'Remote & export packages' })}
`,
  }),
};
