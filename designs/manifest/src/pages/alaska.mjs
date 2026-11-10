import { html, raw } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';
import { drawing } from '../lib/drawings.mjs';
import { layout } from '../lib/layout.mjs';
import { preloadFor, sectionHead, pageHero, quoteBand, yardCard, deliveryMap, latRule, sequence, packingList } from '../lib/components.mjs';
import { LOCATIONS } from '../data/locations.mjs';

// How freight reaches a job in Alaska, in general terms. Uresco coordinates it; it does not run the carriers.
const WAYS = [
  { tag: 'B', mode: 'By road', icon: 'road', where: 'Southcentral, the Interior and the highway north', body: 'Job sites on the road system are reached by truck from our Anchorage and Fairbanks yards.' },
  { tag: 'A · C', mode: 'By sea', icon: 'ship', where: 'Southeast, the coast and western Alaska', body: 'Ocean carriers and seasonal barges reach the communities the road does not. We coordinate the booking and get your package to the dock.' },
  { tag: 'D', mode: 'By air', icon: 'plane', where: 'Communities off the road system', body: 'Some places are reached only by air. Tell us where you are building and we will work out how to get it there.' },
];

const STEPS = [
  { no: '01', name: 'Plans in, take-off out', body: 'Send drawings or a materials list. We build the take-off and price it delivered to your community.' },
  { no: '02', name: 'Package and crate', body: 'We assemble the complete package, then crate, band and wrap it for the trip and every handoff on the way.' },
  { no: '03', name: 'Coordinate the freight', body: 'Truck, ocean freight, barge or air: we work with you on the shipping, against your schedule and the season.' },
  { no: '04', name: 'Dock or site delivery', body: 'It lands at the dock or on the job site, anywhere in Alaska.' },
];

const FAQ = [
  ['Can you deliver to my community?', 'Delivery is available anywhere in Alaska, from Sitka to Utqiaġvik (Barrow). Tell us where the job is and we will work out the route — road, ocean freight, barge or air — and price it.'],
  ['When should I order for barge season?', 'Early. Off the road system, barges run in the ice-free season, so a package has to be built, crated and at the dock before the sailing it needs. Call early and we will plan backward from the sailing you need.'],
  ['Do you ship complete building packages?', 'Yes. We are fully equipped to handle remote-location and export building packages — framing, envelope, openings and hardware — so the whole job ships together.'],
  ['Can you work from my plans?', 'Send drawings or a materials list. We will build the take-off and quote it. Design services are available for projects with unique needs.'],
  ['Who coordinates the shipping?', 'We work with you on all aspects of shipping coordination, dock delivery and rural Alaska delivery.'],
];


export default {
  path: 'alaska/',
  render: (ctx) => layout(ctx, {
    title: 'Alaska Delivery — Anchorage & Fairbanks',
    description: 'Building materials delivered anywhere in Alaska, from Sitka to Utqiaġvik. Remote and export building packages, shipping coordination and dock delivery from Uresco’s Anchorage and Fairbanks distribution centers.',
    preload: [preloadFor(ctx, 'port-alsworth')],
    jsonLd: html`<script type="application/ld+json">${raw(JSON.stringify({
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
    }))}</script>`,
    body: html`
${pageHero(ctx, {
  sheet: 'Alaska Delivery',
  eyebrow: 'Sheet 04 · Anchorage · Fairbanks',
  title: 'A whole building, to <em>anywhere in Alaska.</em>',
  lede: 'On the road system, at the end of a barge line or reachable only by air. Two Alaska yards and one on Puget Sound take a job from plans to a crated package on your dock.',
  photoKey: 'port-alsworth',
  caption: 'Skiffs and a bush plane at Port Alsworth, Alaska, a community off the road system.',
  actions: html`<a class="btn" href="${ctx.u('quote/')}">Quote a remote job ${icon('arrow', { size: 18 })}</a><a class="btn btn--line" href="#yards" data-open="call-sheet">${icon('phone', { size: 18 })} Call Anchorage or Fairbanks</a>`,
  below: latRule({ highlight: [57.1, 71.3], note: 'Delivery available: Sitka to Utqiaġvik' }),
})}

<section class="section" id="area">
  <div class="wrap">
    ${sectionHead({ no: '01', eyebrow: 'Delivery area', meta: 'Sheet A-1', title: 'Built for places <em>without a lumber yard.</em>', lede: 'Three yards and the lanes that connect them to the rest of the state. Find your community, then call the Alaska yard nearest the route.' })}
    ${deliveryMap(ctx, { action: html`<a class="btn btn--dark btn--block" href="#yards" data-open="call-sheet">${icon('phone', { size: 18 })} Ask a yard about your route</a>` })}
  </div>
</section>

<section class="section section--panel" id="ways">
  <div class="wrap">
    ${sectionHead({ no: '02', eyebrow: 'Ways in', meta: 'Lanes A–D', title: 'Road, sea <em>or air.</em>', lede: 'Much of Alaska is off the road system. How a package travels depends on where it is going and what time of year it is.' })}
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
      <p><strong>Plan for the barge window.</strong> Communities off the road system get their freight by barge in the ice-free season and by air year-round. One complete package on the right sailing beats a second freight bill, so call early.</p>
    </div>
  </div>
</section>

<section class="section" id="how">
  <div class="wrap">
    ${sectionHead({ no: '03', eyebrow: 'How a remote package works', meta: 'Steps 01–04', title: 'One list. <em>Every leg.</em>', lede: 'Remote jobs go wrong on the details: a missing box of hangers, a load that is not on the dock when the barge is. The whole process is built around the list being right before anything moves.' })}
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
    ${sectionHead({ no: '04', eyebrow: 'What goes in the crate', meta: 'Lines 001–009', title: 'The package is <em>the whole manifest.</em>', lede: 'Framing, envelope, openings and hardware ship together, so the job does not wait on a second load.', action: html`<a class="link" href="${ctx.u('products/')}">All products ${icon('arrow', { size: 16 })}</a>` })}
    ${packingList(ctx)}
  </div>
</section>

<section class="section section--panel" id="yards">
  <div class="wrap">
    ${sectionHead({ no: '05', eyebrow: 'Alaska yards', meta: 'Yards 02 and 03', title: 'Anchorage <em>&amp; Fairbanks.</em>', lede: 'Our friendly, knowledgeable sales staff is here to help. Give us a call, email or stop by.' })}
    <div class="yards yards--2">${LOCATIONS.filter((l) => l.state === 'AK').map((l) => yardCard(ctx, l))}</div>
  </div>
</section>

<section class="section" id="questions">
  <div class="wrap rfi">
    <div class="rfi__head">
      ${sectionHead({ no: '06', eyebrow: 'Questions', meta: 'RFI log', title: 'Remote delivery, <em>answered.</em>' })}
      <p class="lede">On a job, a question to the supplier is a request for information. Here are five that come up on remote jobs.</p>
      <a class="btn btn--line" href="#yards" data-open="call-sheet">${icon('phone', { size: 18 })} Ask a yard</a>
    </div>
    <div class="rfi__log">
      ${FAQ.map(([q, a], i) => html`<details class="rfi__item"${i === 0 ? html` open` : ''}><summary><span class="num">RFI ${String(i + 1).padStart(2, '0')}</span><span class="rfi__q">${q}</span><span class="rfi__mark" aria-hidden="true"></span></summary><div class="rfi__a"><p class="label label--blue">Response</p><p>${a}</p></div></details>`)}
    </div>
  </div>
</section>
${quoteBand(ctx, { no: '07', eyebrow: 'Start a remote job', title: 'Building off <em>the road system?</em>', body: 'Send plans or a list and tell us where the job is. We will quote the package and work out the freight with you.' })}
`,
  }),
};
