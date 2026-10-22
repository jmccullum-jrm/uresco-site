import { html } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';
import { layout } from '../lib/layout.mjs';
import { preloadFor, sectionHead, pageHero, quoteBand, yardCard, deliveryMap, stamp } from '../lib/components.mjs';
import { LOCATIONS } from '../data/locations.mjs';

// How freight moves in Alaska, in general terms. Uresco coordinates it; it does not run the carriers.
const MODES = [
  { icon: 'road', name: 'The road system', body: 'Job sites on the road system — Southcentral, the Interior and the highways north — are reached by truck from our Anchorage and Fairbanks yards.' },
  { icon: 'ship', name: 'Ocean freight & barge', body: 'Southeast, coastal and western Alaska are reached by scheduled ocean carriers and seasonal barge service. We coordinate bookings and get your package to the dock.' },
  { icon: 'plane', name: 'Air cargo', body: 'Some communities are reached only by air. Tell us where you’re building and we’ll work out how to get it there.' },
];

const FAQ = [
  ['Can you deliver to my community?', 'Delivery is available anywhere in Alaska, from Sitka to Utqiaġvik. Tell us where the job is and we will work out the route — road, ocean freight, barge or air — and price it.'],
  ['When should I order for barge season?', 'Barge service to western and northern Alaska runs only in the ice-free months, and the last sailings fill up. Call early in the year: we plan backward from the sailing you need so the package is built, crated and at the dock in time.'],
  ['Do you ship complete building packages?', 'Yes. We are fully equipped to handle remote-location and export building packages — framing, envelope, openings and hardware — so the whole job ships together.'],
  ['Can you work from my plans?', 'Send drawings or a materials list. We will build the take-off, check it for gaps and quote it. Design services are available for projects with unique needs.'],
  ['Who coordinates the shipping?', 'We work with you on all aspects of shipping coordination, dock delivery and rural Alaska delivery, so you have one point of contact from quote to landing.'],
];

export default {
  path: 'alaska/',
  render: (ctx) => layout(ctx, {
    title: 'Alaska Delivery — Anchorage & Fairbanks',
    description: 'Building materials delivered anywhere in Alaska, from Sitka to Utqiaġvik. Remote and export building packages, shipping coordination and dock delivery from Uresco’s Anchorage and Fairbanks distribution centers.',
    preload: [preloadFor(ctx, 'chugach')],
    body: html`
${pageHero(ctx, {
  eyebrow: 'Alaska · Anchorage · Fairbanks',
  title: 'Anywhere <em>in Alaska.</em>',
  lede: 'From Sitka to Utqiaġvik. Our Alaska distribution centers offer a full range of products and services for the commercial and residential builder — and we specialize in remote location delivery.',
  photoKey: 'chugach',
  crumbs: [['Alaska delivery']],
  actions: html`<a class="btn" href="${ctx.u('quote/')}">Quote a remote job ${icon('arrow', { size: 18 })}</a><button type="button" class="btn btn--line" data-open="call-sheet">${icon('phone', { size: 18 })} Call Anchorage or Fairbanks</button>`,
})}

<section class="section section--dark">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Reach', no: '01', title: 'Built for places <em>without a lumber yard.</em>', lede: 'Two Alaska yards on the road system, a Kent yard on Puget Sound, and the freight lanes that connect them to the rest of the state.', dark: true })}
    <div class="mapframe">${deliveryMap({ id: 'ak-map' })}</div>
  </div>
</section>

<section class="section">
  <div class="wrap reach on-light">
    <div>
      ${stamp('How a remote package works', { no: '02' })}
      <h2 class="h2">One call. <em>Every leg.</em></h2>
      <p class="lede">Remote jobs fail on the details: a missing box of hangers, a load that misses the last barge. Our process is built around not letting that happen.</p>
    </div>
    <ol class="steps">
      <li><b>Plans in, take-off out</b><span>Send drawings or a list. We build the take-off and price it delivered.</span></li>
      <li><b>Package and crate</b><span>We assemble the complete package and crate, band and wrap it for the trip.</span></li>
      <li><b>Book the freight</b><span>We coordinate the carrier — truck, ocean freight, barge or air — against your schedule and the season.</span></li>
      <li><b>Dock or site delivery</b><span>Delivered to the dock or straight to the site, with one point of contact the whole way.</span></li>
    </ol>
  </div>
</section>

<section class="section section--dark">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Ways we move freight', no: '03', title: 'Road, sea <em>or air.</em>', dark: true })}
    <div class="modes">
      ${MODES.map((m) => html`<div class="mode"><div class="svc__icon">${icon(m.icon, { size: 26 })}</div><h3 class="h3">${m.name}</h3><p>${m.body}</p></div>`)}
    </div>
    <div class="callout">${icon('snow', { size: 22 })}<p><strong>Plan around the season.</strong> Barge service to western and northern Alaska runs only in the ice-free months, and the last sailings fill up. Call early and we’ll plan back from the sailing you need.</p></div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Alaska yards', no: '04', title: 'Anchorage <em>& Fairbanks.</em>', lede: 'Our friendly, knowledgeable sales staff is here to help. Give us a call, email or stop by today.' })}
    <div class="yards" style="grid-template-columns:repeat(auto-fit,minmax(320px,1fr))">${LOCATIONS.filter((l) => l.state === 'AK').map((l) => yardCard(ctx, l))}</div>
  </div>
</section>

<section class="section section--bone">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Questions', no: '05', title: 'Remote delivery, <em>answered.</em>' })}
    <div class="faq">
      ${FAQ.map(([q, a], i) => html`<details${i === 0 ? html` open` : ''}><summary>${q}</summary><p>${a}</p></details>`)}
    </div>
  </div>
</section>
${quoteBand(ctx, { title: 'Building off <em>the road system?</em>', body: 'Send plans or a list and tell us where the job is. We’ll quote the package and the freight together.' })}
`,
  }),
};
