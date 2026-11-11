import { readFileSync } from 'fs';
import { html, raw } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';
import { layout } from '../lib/layout.mjs';
import { sectionHead, pageHero, pageHeroPreload, quoteBand, yardCard, deliveryMap, eyebrow, sticker, marquee, win, photoCaption, callBtn, pauseBtn, MAP_TOWNS } from '../lib/components.mjs';
import { LOCATIONS, byId, tel } from '../data/locations.mjs';
import { LATITUDES } from '../data/destinations.mjs';
import { PLACES, ALIASES, ACCESS, lanesFor } from '../data/places.mjs';

const MAP = JSON.parse(readFileSync(new URL('../data/map.json', import.meta.url), 'utf8'));

// How freight moves in Alaska, in general terms. Uresco coordinates it; it does not run the carriers.
const MODES = [
  { icon: 'truck', name: 'The road system', tag: 'Truck', body: 'The road system links Anchorage, the Kenai Peninsula, the Mat-Su, Fairbanks, Valdez, Tok and, by the Dalton Highway, the North Slope. Job sites along it are typically reached by truck.' },
  { icon: 'ship', name: 'Ocean freight & barge', tag: 'Sea', body: 'Southeast Alaska is reached by sea. Western and northern communities generally rely on barge in the ice-free season. We work with you on shipping coordination and dock delivery.' },
  { icon: 'plane', name: 'Air cargo', tag: 'Air', body: 'Off the road system, communities receive freight by air year-round. Tell us where you’re building and we’ll work out how to get it there.' },
];

const LEGS = [
  { icon: 'ruler', name: 'Plans in, take-off out', body: 'Send drawings or a list. We help with the take-off and quote the materials.' },
  { icon: 'crate', name: 'Package and crate', body: 'The complete package comes together, crated and packaged for the trip.' },
  { icon: 'route', name: 'Work out the freight', body: 'We work with you on all aspects of shipping coordination, dock delivery and rural Alaska delivery.' },
  { icon: 'pin', name: 'Dock or site delivery', body: 'Delivered to the dock or straight to the site.' },
];

// Also the page's FAQPage structured data, so every answer here must stand on its own.
const FAQ = [
  ['Can you deliver to my community?', 'Yes. Delivery is available anywhere in Alaska, from Sitka to Utqiaġvik (Barrow). Tell us where the job is. We will quote the package and work out the freight with you.'],
  ['When should I order for barge season?', 'Early, if your community depends on a seasonal barge. In Western and Arctic Alaska and along the rivers, barges generally run only in the ice-free season. Ask your yard what yours looks like.'],
  ['Do you ship complete building packages?', 'Yes. We are fully equipped to handle remote-location and export building packages, with crating and packaging for the trip.'],
  ['Can you work from my plans?', 'Yes. Send drawings or a materials list. We offer material take-off assistance and estimates, and design services for your unique project needs.'],
  ['Who coordinates the shipping?', 'We work with you on all aspects of shipping coordination, dock delivery and rural Alaska delivery.'],
];

const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[^a-z]/g, '');
// Example chips, south to north. The combobox reaches every place; these are the quick ones.
const CHIPS = ['Sitka', 'Juneau', 'Unalaska', 'Bethel', 'Nome', 'Deadhorse', 'Utqiaġvik'];
// The marquee runs every town named on the map, south to north.
const TOWN_ORDER = ['ketchikan', 'sitka', 'juneau', 'cordova', 'valdez', 'homer', 'kodiak', 'unalaska', 'dillingham', 'bethel', 'nome', 'galena', 'kotzebue', 'deadhorse', 'utqiagvik'];
const TOWNS = TOWN_ORDER.map((id) => MAP_TOWNS.find((t) => t.id === id).name);
// The question in the hero cycles through a few of them.
const ASK = ['Bethel', 'Nome', 'Sitka', 'Kotzebue', 'Galena', 'Utqiaġvik', 'my village'];
// A quote link from this page starts the form on remote shipping, with the yard that takes remote sites.
const REMOTE_QUOTE = 'quote/?yard=anchorage&delivery=Remote%20Alaska%20shipping';
// Which yard to call (FACTS: "Which yard should I call?"), for the no-JavaScript answer.
const CALL_FOR = { kent: 'Puget Sound', anchorage: 'Southcentral Alaska or a remote site', fairbanks: 'The Interior and points north' };
const MODE_ICONS = ['truck', 'ship', 'plane', 'pin'];

const finderData = () => JSON.stringify({
  places: PLACES.map((p) => [p.name, p.st, p.region, p.access, p.yard, lanesFor(p), MAP.places[p.name]]),
  aliases: ALIASES,
  access: ACCESS,
  yards: Object.fromEntries(LOCATIONS.map((l) => [l.id, { name: l.city, phone: l.phone, tel: tel(l.phone) }])),
  size: [MAP.width, MAP.height],
}).replace(/</g, '\\u003c');

// The tape: latitude as a tape measure, 46° to 72° north.
const T0 = 46, T1 = 72;
const tapePos = (lat) => (((lat - T0) / (T1 - T0)) * 100).toFixed(2);

export default {
  path: 'alaska/',
  render: (ctx) => layout(ctx, {
    title: 'Alaska delivery — Anchorage & Fairbanks',
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
  lede: 'Delivery is available from Sitka to Utqiaġvik, by truck, ocean freight, barge or air. Tell us where the job is and we’ll work out the way in. Alaska is big enough to make any map nervous.',
  photoKey: 'floatplane',
  caption: 'A small plane over skiffs at Port Alsworth, Alaska',
  actions: html`<a class="btn" href="${ctx.u(REMOTE_QUOTE)}">Quote a remote job ${icon('arrow', { size: 18 })}</a>${callBtn(ctx, { cls: 'btn--line', label: 'Call an Alaska yard' })}${pauseBtn()}`,
  after: html`<p class="phero__jump"><a class="link" href="#lookup">Look up your community ${icon('arrow', { size: 16 })}</a></p>`,
})}

<section class="section field-k finder clip" id="route">
  <div class="divider divider--u" aria-hidden="true"><i class="plx"></i><i class="plx"></i><i class="plx"></i></div>
  <div class="wrap finder__grid">
    <div class="finder__head">
      ${eyebrow('Route finder')}
      <h2 class="d2 finder__title">Name the place. <br><em>See the way in.</em></h2>
      <p class="lede">Type your town or village. You get the yard to call and how freight typically gets there.</p>
    </div>
    <div class="finder__pick" data-finder>
      <div class="finder__search" id="lookup">
        <label class="finder__label" for="finder-input">Where are you building?</label>
        <div class="finder__field">
          ${icon('search', { size: 22, cls: 'finder__i' })}
          <input class="finder__input" id="finder-input" type="text" role="combobox" aria-expanded="false" aria-controls="finder-list" aria-autocomplete="list" autocomplete="off" autocapitalize="words" spellcheck="false" enterkeyhint="search" placeholder="Town, village or city">
          <button type="button" class="finder__clear" data-clear hidden>${icon('close', { size: 18 })}<span class="sr-only">Clear the search</span></button>
          <ul class="finder__list" id="finder-list" role="listbox" aria-label="Places" hidden></ul>
        </div>
        <ul class="towns" aria-label="Example places">
          ${CHIPS.map((c) => html`<li><button type="button" class="toggle town" data-town="${slug(c)}" data-place="${c}" aria-pressed="false">${c}</button></li>`)}
        </ul>
      </div>
      <div class="way way--live on-y" data-way>
        <span class="way__icon" aria-hidden="true">${['route', 'truck', 'ship'].map((n) => html`<span data-ico="${n}">${icon(n, { size: 30 })}</span>`)}</span>
        <p class="way__label" data-way-label>Road, sea or air</p>
        <h3 class="way__name" data-way-name>Anywhere in Alaska</h3>
        <p class="way__region" data-way-region hidden></p>
        <p class="way__text" data-way-text>Delivery is available from Sitka to Utqiaġvik. Name the place above, or tell a yard where the job is.</p>
        <div class="way__how" data-way-how hidden>
          <p class="way__sub">How freight typically gets there</p>
          <ul class="way__modes">
            ${[0, 1].map((i) => html`<li>${MODE_ICONS.map((k) => html`<span class="way__mode-ic" data-ic="${i}-${k}" hidden>${icon(k, { size: 18 })}</span>`)}<span data-way-m="${i}"></span></li>`)}
          </ul>
        </div>
        <div class="way__yard">
          <p class="way__sub">Yard to call</p>
          <a class="btn btn--block nums" data-way-call href="${tel(byId('anchorage').phone)}">${icon('phone', { size: 16 })} <span data-way-yard>Anchorage</span><span data-way-phone>${byId('anchorage').phone}</span></a>
        </div>
        <a class="btn btn--block btn--line way__quote" data-way-quote href="${ctx.u(REMOTE_QUOTE)}"><span data-way-short>Quote this job</span> ${icon('arrow', { size: 16 })}</a>
        <p class="way__note" data-way-note>Typical for the region, not a schedule or a price. Any yard can help.</p>
      </div>
      <p class="sr-only" data-live aria-live="polite" aria-atomic="true"></p>
      <script type="application/json" data-finder-data>${raw(finderData())}</script>
      <noscript>
        <style>.finder__search, .way--live, .finder__head .lede { display: none; }</style>
        <div class="way way--yards on-y">
          <h3 class="way__name">Call the yard nearest your job</h3>
          <ul class="way__list">
            ${LOCATIONS.map((l) => html`<li><span><b>${l.city}, ${l.state}</b><small>${CALL_FOR[l.id]}</small></span><a class="btn btn--sm nums" href="${tel(l.phone)}">${icon('phone', { size: 16 })} ${l.phone}</a></li>`)}
          </ul>
          <a class="btn btn--block btn--line way__quote" href="${ctx.u('quote/')}">Request a quote ${icon('arrow', { size: 16 })}</a>
        </div>
      </noscript>
    </div>
    <div class="finder__map">
      ${deliveryMap(ctx)}
      ${sticker(raw('Sitka <span aria-hidden="true">→</span><span class="sr-only">to</span> Utqiaġvik'), { tone: 'y', rot: -7, cls: 'finder__sticker' })}
    </div>
  </div>
</section>

<section class="section field-p legsec">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'How a remote package works', title: 'Four legs. <br><em>One package.</em>', lede: 'One complete package beats a second freight bill.' })}
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
      <p class="lede">Utqiaġvik, on the Arctic coast, is the northernmost community in Alaska. It is still on our map: delivery is available from Sitka to Utqiaġvik, anywhere in the state.</p>
    </div>
    <div class="north__fig">
      ${win(ctx, 'north-slope', { cls: 'north__win', sizes: '(min-width: 900px) 26vw, 56vw', after: photoCaption('north-slope', 'A loaded pickup in the snow, Interior Alaska') })}
    </div>
  </div>
  <div class="tape" role="img" aria-label="Latitude scale from 46 to 72 degrees north: Kent yard 47.4, Sitka 57.1, Anchorage yard 61.2, Fairbanks yard 64.8, Utqiaġvik 71.3.">
    <div class="tape__ticks" aria-hidden="true">${[50, 55, 60, 65, 70].map((d) => html`<span style="--at:${tapePos(d)}%">${d}°</span>`)}</div>
    ${LATITUDES.map((p, i) => html`<span class="tape__stop${p.yard ? ' tape__stop--yard' : ''}${i % 2 ? ' tape__stop--low' : ''}" aria-hidden="true" style="--at:${tapePos(p.lat)}%"><b>${p.name}</b><i class="nums">${p.lat.toFixed(1)}°</i></span>`)}
  </div>
</section>

<section class="section field-k modesec">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'How freight moves', title: 'Road, sea <em>or air.</em>', lede: 'How it travels depends on where it is going. Often it is more than one of these. Weather will have notes.' })}
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
      <p><strong>Plan around the season.</strong> In Western and Arctic Alaska and along the rivers, barges generally run only in the ice-free season, so plan for the barge window first. Call a yard early.</p>
      ${callBtn(ctx, { cls: 'btn--sm', size: 16 })}
    </div>
  </div>
</section>

<section class="section field-p">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Alaska yards', title: 'Anchorage <em>&amp; Fairbanks.</em>', lede: 'Our friendly, knowledgeable sales staff is here to help. Give us a call, email or stop by.' })}
    <div class="yards yards--2">${LOCATIONS.filter((l) => l.state === 'AK').map((l) => yardCard(ctx, l, { photoSizes: '(min-width: 900px) 16vw, 30vw' }))}</div>
  </div>
</section>

${marquee(TOWNS, { tone: 'k', tilt: true, slow: true })}

<section class="section field-p faqsec">
  <div class="wrap faqsec__grid">
    <div class="faqsec__head">
      ${eyebrow('Questions')}
      <h2 class="d2">Before <em>you ask.</em></h2>
      <p class="lede">Not answered here? Ask the yard.</p>
      <div class="actions">${callBtn(ctx)}</div>
    </div>
    <div class="faq">
      ${FAQ.map(([q, a], i) => html`<details${i === 0 ? html` open` : ''}><summary>${q}</summary><p>${a}</p></details>`)}
    </div>
  </div>
</section>
${quoteBand(ctx, { title: 'Building off <em>the road system?</em>', body: 'Send plans or a list and tell us where the job is. We will quote the package and work out the freight with you.', photoKey: 'tug-barge', label: 'Remote & export packages', caption: 'A tug pushing a loaded freight barge', href: ctx.u(REMOTE_QUOTE) })}
`,
  }),
};
