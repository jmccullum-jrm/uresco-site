import { readFileSync } from 'fs';
import { html, raw } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';
import { drawing } from '../lib/drawings.mjs';
import { layout } from '../lib/layout.mjs';
import { plate, PHERO_SIZES, YARD_FOR, openStatus, preloadFor, sectionHead, pageHero, quoteBand, yardCard, deliveryMap, latRule, sequence, packingList } from '../lib/components.mjs';
import { LOCATIONS, tel } from '../data/locations.mjs';
import { PLACES, ALIASES, ACCESS, EXAMPLE, CHIPS, SUGGEST } from '../data/places.mjs';

const MAP = JSON.parse(readFileSync(new URL('../data/map.json', import.meta.url), 'utf8'));

// How freight reaches a job in Alaska, in general terms. Uresco coordinates it; it does not run the carriers.
const WAYS = [
  { tag: 'B', mode: 'By road', icon: 'road', where: 'Southcentral, the Interior and the highway north', body: 'Job-site delivery by truck from our Anchorage and Fairbanks yards, with Moffett fork unload and boom trucks.' },
  { tag: 'A · C', mode: 'By water', icon: 'ship', where: 'Southeast, the coast and the western rivers', body: 'Ocean freight generally reaches Southeast and the coast. Barges reach western Alaska and its river communities in the ice-free season. We work with you on the shipping and the dock delivery.' },
  { tag: 'D', mode: 'By air', icon: 'plane', where: 'Communities off the road system', body: 'Some places are reached only by air. Tell us where you are building and we will work out how to get it there.' },
];

const STEPS = [
  { no: '01', name: 'Plans in, take-off out', body: 'Send drawings or a materials list. We build the take-off and quote it, and work with you on the freight.' },
  { no: '02', name: 'Package and crate', body: 'We assemble the complete package, then crate, band and wrap it for the trip and every handoff on the way.' },
  { no: '03', name: 'Coordinate the freight', body: 'Truck, ocean freight, barge or air: we work with you on the shipping, against your schedule and the season.' },
  { no: '04', name: 'Dock or site delivery', body: 'It lands at the dock or on the job site, anywhere in Alaska.' },
];

const FAQ = [
  ['Can you deliver to my community?', 'Yes. Delivery is available anywhere in Alaska, from Sitka to Utqiaġvik (Barrow). Tell us where the job is. We will quote the package and work out the freight with you: road, ocean freight, barge or air.'],
  ['When should I order for barge season?', 'Early. Off the road system, barges generally run only in the ice-free season, so a package has to be built, crated and at the dock before the sailing it needs. Call early and we will work out the timing with you.'],
  ['Do you ship complete building packages?', 'Yes. We are fully equipped to handle remote-location and export building packages: framing, envelope, openings and hardware, so the whole job ships together.'],
  ['Can you work from my plans?', 'Send drawings or a materials list. We will build the take-off and quote it. Design services are available for projects with unique needs.'],
  ['Who coordinates the shipping?', 'We work with you on all aspects of shipping coordination, dock delivery and rural Alaska delivery.'],
];

const STATES = { AK: 'Alaska', WA: 'Washington' };
const pct = (n, of) => +((n / of) * 100).toFixed(2);
const placeOf = (name) => PLACES.find((p) => p.name === name);
const yardOf = (id) => LOCATIONS.find((l) => l.id === id);
const modeText = (m, yard) => m[1].replace('{yard}', yard.city);

// Everything the ticket's script needs. Places: [name, state, region, access, yard, x%, y% on the plate].
const finderData = (ctx) => JSON.stringify({
  quote: ctx.u('quote/'), states: STATES, access: ACCESS, aliases: ALIASES, suggest: SUGGEST,
  yards: Object.fromEntries(LOCATIONS.map((l) => [l.id, { name: l.city, phone: l.phone }])),
  places: PLACES.map((p) => { const [x, y] = MAP.places[p.name]; return [p.name, p.st, p.region, p.access, p.yard, pct(x, MAP.width), pct(y, MAP.height)]; }),
});

// The ship-to ticket: name a community, get the yard to call and how freight typically gets there.
// It is rendered filled in for the example place; the script only swaps the fields, so nothing moves on load.
// Without script the field and ticket are hidden and the three yards are shown instead.
const finder = (ctx) => {
  const ex = placeOf(EXAMPLE), acc = ACCESS[ex.access], exYard = yardOf(ex.yard);
  return html`
  <div class="shipto" data-finder>
    <script type="application/json" data-finder-data>${raw(finderData(ctx))}</script>
    <div class="shipto__ask">
      <h2 class="shipto__title"><label for="ship-to">Where are you building?</label></h2>
      <p class="shipto__nojs shipto__hint">Call the yard nearest your job. Any yard can help.</p>
      <div class="shipto__search">
        <div class="shipto__field">
          <span class="shipto__prefix label" aria-hidden="true">Ship to</span>
          <input class="shipto__input" id="ship-to" type="text" role="combobox" aria-expanded="false" aria-controls="ship-to-list" aria-autocomplete="list" autocomplete="off" autocapitalize="words" spellcheck="false" enterkeyhint="search" placeholder="Town, village or city">
          <button type="button" class="shipto__clear" data-clear hidden>${icon('close', { size: 16 })}<span class="sr-only">Clear the field</span></button>
          <ul class="shipto__list" id="ship-to-list" role="listbox" aria-label="Places" hidden></ul>
        </div>
        <p class="shipto__help">Towns, villages and cities in Alaska and around Puget Sound. If yours is not listed, type it anyway.</p>
        <div class="shipto__try" role="group" aria-label="Example places">
          <span class="label shipto__trylab" aria-hidden="true">Try</span>
          ${CHIPS.map((c) => html`<button type="button" class="shipto__chip" data-place="${c}" aria-pressed="${c === EXAMPLE ? 'true' : 'false'}">${c}</button>`)}
        </div>
      </div>
    </div>

    <div class="shipto__card" data-route>
      <div class="shipto__to">
        <p class="label shipto__lab">Destination <span class="label--blue" data-r="eg">Example</span></p>
        <p class="shipto__name"><span class="hl" data-r="name">${ex.name}, ${STATES[ex.st]}</span></p>
        <p class="shipto__meta"><span data-r="region">${ex.region}</span><span class="shipto__tag" data-r="tag">${acc.tag}</span></p>
      </div>
      <div class="shipto__yard">
        <p class="label shipto__lab">Yard to call</p>
        ${LOCATIONS.map((l) => html`<div class="shipto__y" data-y="${l.id}"${l.id === ex.yard ? '' : html` hidden`}>
          <p class="shipto__city">${l.city} ${openStatus(l)}</p>
          <a class="shipto__tel num" href="${tel(l.phone)}"><span class="sr-only">Call ${l.city}: </span>${l.phone}</a>
        </div>`)}
        <div class="shipto__y" data-y="any" hidden>
          <p class="shipto__city">Any of the three</p>
          <a class="btn btn--sm btn--dark" href="#yards" data-open="call-sheet" aria-haspopup="dialog">${icon('phone', { size: 16 })} Call a yard</a>
        </div>
      </div>
      <div class="shipto__how" data-r="how">
        <p class="label shipto__lab">How freight typically gets there</p>
        <ul class="shipto__modes" data-r="modes"${acc.modes.some((m) => m[0]) ? '' : html` data-lanes="none"`}>
          ${[0, 1].map((i) => html`<li><span class="pmap__tag${acc.modes[i][0] ? '' : ' is-none'}" data-r="t${i}" aria-hidden="true">${acc.modes[i][0]}</span><span data-r="m${i}">${modeText(acc.modes[i], exYard)}</span></li>`)}
        </ul>
      </div>
      <p class="shipto__else" data-r="else" hidden>That is not on our short list, which does not mean we cannot get there. Send the details and a yard will work out the route.</p>
      <div class="shipto__foot">
        <a class="btn" data-r="quote" href="${ctx.u('quote/')}?location=${encodeURIComponent(`${ex.name}, ${ex.st}`)}&amp;yard=${ex.yard}">Get a quote for <span data-r="short">${ex.name}</span> ${icon('arrow', { size: 18 })}</a>
        <p class="shipto__note" data-r="note">Typical for the region, not a schedule or a price. Any yard can help.</p>
      </div>
    </div>
    <p class="sr-only" data-live aria-live="polite"></p>

    <div class="shipto__nojs shipto__fallback">
      <ul class="shipto__yards">
        ${LOCATIONS.map((l) => html`<li><span class="shipto__who"><b>${l.city}, ${l.state}</b><small>${YARD_FOR[l.id]}</small></span><a class="shipto__tel num" href="${tel(l.phone)}"><span class="sr-only">Call ${l.city}: </span>${l.phone}</a></li>`)}
      </ul>
      <a class="btn btn--block" href="${ctx.u('quote/')}">Request a quote ${icon('arrow', { size: 18 })}</a>
    </div>
  </div>`;
};

// The answer comes first; on a phone the ticket sits between the words and the photograph.
const heroMedia = (ctx) => html`${finder(ctx)}
  ${plate(ctx, 'port-alsworth', { cls: 'phero__media', eager: true, sizes: PHERO_SIZES, caption: 'Skiffs and a bush plane at Port Alsworth, Alaska, a community off the road system. A stock photograph.' })}`;
const heroCalls = () => html`<ul class="phero__calls">
  ${LOCATIONS.filter((l) => l.state === 'AK').map((l) => html`<li><a href="${tel(l.phone)}"><span class="phero__yard"><span class="label">${l.city}</span>${openStatus(l)}</span><span class="num phero__num"><span class="sr-only">Call ${l.city}: </span>${l.phone}</span></a></li>`)}
</ul>`;

export default {
  path: 'alaska/',
  render: (ctx) => layout(ctx, {
    title: 'Alaska delivery — Anchorage & Fairbanks',
    description: 'Building materials delivered anywhere in Alaska, from Sitka to Utqiaġvik. Remote and export building packages, shipping coordination and dock delivery from Uresco’s Anchorage and Fairbanks distribution centers.',
    preload: [preloadFor(ctx, 'port-alsworth')],
    jsonLd: html`<script type="application/ld+json">${raw(JSON.stringify({
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
    }))}</script>`,
    body: html`
${pageHero(ctx, {
  cls: 'phero--ask',
  sheet: 'Alaska delivery',
  meta: 'Anchorage · Fairbanks',
  title: '<span class="phero__q">Can you get a building package to my community?</span> Yes. <br><em>Anywhere in Alaska.</em>',
  lede: 'On the road system, at the end of a barge line or reachable only by air, delivery is available from Sitka to Utqiaġvik. Two Alaska yards and one in Kent, Washington, take a job from plans to a crated package on your dock.',
  after: heroCalls(),
  media: heroMedia(ctx),
  below: latRule({ highlight: [57.1, 71.3], note: 'Delivery available: Sitka to Utqiaġvik' }),
})}

<section class="section" id="area">
  <div class="wrap">
    ${sectionHead({ no: '01', eyebrow: 'Delivery area', title: 'Built for places <em>without a lumber yard.</em>', lede: 'Three yards and the lanes that connect them to the rest of the state. Your community does not need to be on the map: tell the Anchorage or Fairbanks yard where you are building.' })}
    ${deliveryMap(ctx, { action: html`<a class="btn btn--dark btn--block" href="#yards" data-open="call-sheet">${icon('phone', { size: 18 })} Ask a yard about your route</a>` })}
  </div>
</section>

<section class="section section--panel" id="ways">
  <div class="wrap">
    ${sectionHead({ no: '02', eyebrow: 'Ways in', meta: 'Lanes A–D', title: 'Road, water <em>or air.</em>', lede: 'Much of Alaska is off the road system. How a package travels depends on where it is going and what time of year it is.' })}
    <div class="ways">
      ${WAYS.map((w) => html`<article class="way">
        <p class="way__tag"><span class="label">Lane</span><b class="num">${w.tag}</b></p>
        <div class="way__icon">${icon(w.icon, { size: 28 })}</div>
        <h3 class="h3">${w.mode}</h3>
        <p class="label way__where">${w.where}</p>
        <p>${w.body}</p>
      </article>`)}
    </div>
    <div class="gnote">
      <p class="label label--blue">Note 1 · Season</p>
      <p><strong>Plan for the barge window.</strong> Communities off the road system generally get their freight by barge in the ice-free season and by air year-round. One complete package on the right sailing beats a second freight bill, so call early.</p>
    </div>
  </div>
</section>

<section class="section" id="how">
  <div class="wrap">
    ${sectionHead({ no: '03', eyebrow: 'How a remote package works', title: 'One list. <em>Every leg.</em>', lede: 'Remote jobs go wrong on the details: a missing box of hangers, a load that is not on the dock when the barge is. The whole process is built around the list being right before anything moves.' })}
    ${sequence(STEPS, { cls: 'seq--four' })}
    <div class="pack">
      <figure class="dwg pack__dwg" data-reveal>
        <p class="dwg__bar label"><span>Dwg 010</span><span>A package, made up for freight</span><span class="dwg__nts">Typical · not to scale</span></p>
        <div class="dwg__canvas">${drawing('package', { id: 'ak' })}</div>
      </figure>
      <div class="pack__note">
        <p class="label label--blue">Note 2 · Handoffs</p>
        <h3 class="h3">Crated for the trip, not just the truck.</h3>
        <p>Long hauls and repeated handoffs are hard on materials. We crate, band and wrap loads so they arrive the way they left.</p>
        <ul class="pack__list">
          <li>Units banded and wrapped</li>
          <li>Crating and packaging</li>
          <li>Dock delivery or straight to the site</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<section class="section section--flush" id="package">
  <div class="wrap">
    ${sectionHead({ no: '04', eyebrow: 'What goes in the crate', title: 'The package is <em>the whole manifest.</em>', lede: 'Framing, envelope, openings and hardware ship together, so the job does not wait on a second load.', action: html`<a class="link" href="${ctx.u('products/')}">All products ${icon('arrow', { size: 16 })}</a>` })}
    ${packingList(ctx)}
  </div>
</section>

<section class="section section--panel" id="yards">
  <div class="wrap">
    ${sectionHead({ no: '05', eyebrow: 'Alaska yards', title: 'Anchorage <em>&amp; Fairbanks.</em>', lede: 'Our friendly, knowledgeable sales staff is here to help. Give us a call, email or stop by.' })}
    <div class="yards yards--2">${LOCATIONS.filter((l) => l.state === 'AK').map((l) => yardCard(ctx, l))}</div>
  </div>
</section>

<section class="section" id="questions">
  <div class="wrap faq">
    <div class="faq__head">
      ${sectionHead({ no: '06', eyebrow: 'Questions', meta: 'FAQ', title: 'Remote delivery, <em>answered.</em>' })}
      <p class="lede">Five questions that come up on remote jobs.</p>
      <a class="btn btn--line" href="#yards" data-open="call-sheet">${icon('phone', { size: 18 })} Ask a yard</a>
    </div>
    <div class="faq__log">
      ${FAQ.map(([q, a], i) => html`<details class="faq__item"${i === 0 ? html` open` : ''}><summary><span class="num">Q${i + 1}</span><span class="faq__q">${q}</span><span class="faq__mark" aria-hidden="true"></span></summary><div class="faq__a"><p class="label label--blue">Answer</p><p>${a}</p></div></details>`)}
    </div>
  </div>
</section>
${quoteBand(ctx, { no: '07', eyebrow: 'Start a remote job', title: 'Building off <em>the road system?</em>', body: 'Send plans or a list and tell us where the job is. We will quote the package and work out the freight with you.' })}
`,
  }),
};
