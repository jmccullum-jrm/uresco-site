import { html, raw } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';
import { layout } from '../lib/layout.mjs';
import { preloadFor, sectionHead, pageHero, quoteBand, yardCard, routeStage, interlude } from '../lib/components.mjs';
import { LOCATIONS } from '../data/locations.mjs';

// How freight moves in Alaska, in general terms. Uresco coordinates it; it does not run the carriers.
const MODES = [
  { icon: 'road', name: 'The road system', where: 'Southcentral · the Interior · the highway north', body: 'Job sites on the road system are reached by truck from our Anchorage and Fairbanks yards.' },
  { icon: 'ship', name: 'Ocean freight & barge', where: 'Southeast · the coast · western and Arctic Alaska', body: 'Coastal and river communities are reached by sea. We coordinate the booking and get your package to the dock.' },
  { icon: 'plane', name: 'Air cargo', where: 'Year-round, where nothing else reaches', body: 'Some communities are reached only by air. Tell us where you are building and we will work out how to get it there.' },
];

const STEPS = [
  ['Plans in, take-off out', 'Send drawings or a list. We build the take-off and price it delivered.'],
  ['Package and crate', 'We assemble the complete package, then crate, band and wrap it for the trip.'],
  ['Coordinate the freight', 'Truck, ocean freight, barge or air, planned against your schedule and the season.'],
  ['Dock or site delivery', 'Delivered to the dock or straight to the site, with one point of contact the whole way.'],
];

const FAQ = [
  ['Can you deliver to my community?', 'Delivery is available anywhere in Alaska, from Sitka to Utqiaġvik (Barrow). Tell us where the job is and we will work out the route, by road, ocean freight, barge or air, and price it.'],
  ['When should I order for barge season?', 'Barge service to western and northern Alaska runs only in the ice-free months. Call early in the year: we plan backward from the sailing you need, so the package is built, crated and at the dock in time.'],
  ['Do you ship complete building packages?', 'Yes. We are fully equipped to handle remote-location and export building packages, from framing and envelope to openings and hardware, so the whole job ships together.'],
  ['Can you work from my plans?', 'Send drawings or a materials list. We will build the take-off, check it for gaps and quote it. Design services are available for projects with unique needs.'],
  ['Who coordinates the shipping?', 'We work with you on all aspects of shipping coordination, dock delivery and rural Alaska delivery, so you have one point of contact from quote to landing.'],
];

export default {
  path: 'alaska/',
  render: (ctx) => layout(ctx, {
    title: 'Alaska Delivery — Anchorage & Fairbanks',
    description: 'Building materials delivered anywhere in Alaska, from Sitka to Utqiaġvik. Remote and export building packages, shipping coordination and dock delivery from Uresco’s Anchorage and Fairbanks distribution centers.',
    preload: [preloadFor(ctx, 'chugach')],
    jsonLd: html`<script type="application/ld+json">${raw(JSON.stringify({
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
    }))}</script>`,
    body: html`
${pageHero(ctx, {
  eyebrow: 'Alaska delivery',
  title: 'Anywhere <em>in Alaska.</em>',
  lede: 'From Sitka to Utqiaġvik. Two Alaska distribution centers carry a full range of products for the commercial and residential builder, and remote-location delivery is the specialty.',
  photoKey: 'chugach',
  caption: html`Chugach Mountains, Alaska <span>61° N</span>`,
  actions: html`<a class="btn btn--lg" href="${ctx.u('quote/')}">Quote a remote job ${icon('arrow', { size: 18 })}</a><button type="button" class="btn btn--lg btn--line" data-open="call-sheet" aria-haspopup="dialog">${icon('phone', { size: 18 })} Call Anchorage or Fairbanks</button>`,
})}

<section class="section section--tight" id="finder">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Can you reach my community?', title: 'Name the place. <em>See the way in.</em>', lede: 'Delivery is available anywhere in Alaska. Pick a community to see which yard to call and how freight typically gets there.' })}
  </div>
  ${routeStage(ctx, { variant: 'embed', label: 'Where are you building?' })}
</section>

<section class="section">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'How freight moves', title: 'Road, sea <em>or air.</em>', lede: 'Much of Alaska is off the road system. We coordinate the freight; the geography picks the mode.' })}
    <div class="modes">
      ${MODES.map((m) => html`<article class="mode reveal">
        <span class="mode__icon">${icon(m.icon, { size: 24 })}</span>
        <h3 class="h3">${m.name}</h3>
        <p class="mode__where">${m.where}</p>
        <p>${m.body}</p>
      </article>`)}
    </div>
    <div class="callout reveal">
      <span class="callout__icon">${icon('snow', { size: 22 })}</span>
      <p><strong>Plan around the season.</strong> Barge service to western and northern Alaska runs only in the ice-free months. Call early and we will plan back from the sailing you need.</p>
      <a class="link" href="${ctx.u('quote/')}">Start a quote ${icon('arrow', { size: 16 })}</a>
    </div>
  </div>
</section>

<section class="section section--ice">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'How a remote package works', title: 'One call. <em>Every leg.</em>', lede: 'Remote jobs fail on the details: a missing box of hangers, a load that misses the barge. The process is built around not letting that happen.' })}
    <ol class="steps">
      ${STEPS.map(([t, b], i) => html`<li class="reveal"><span class="steps__no">0${i + 1}</span><h3 class="h3">${t}</h3><p>${b}</p></li>`)}
    </ol>
  </div>
</section>

${interlude(ctx, 'remote-village', { line: 'Utqiaġvik. <em>71° north.</em> Still on our map.', note: 'Snow-drifted buildings on the Arctic coast. Delivery is available anywhere in Alaska.' })}

<section class="section" id="yards">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Alaska yards', title: 'Anchorage <em>and Fairbanks.</em>', lede: 'Our friendly, knowledgeable sales staff is here to help. Give us a call, email or stop by.' })}
    <div class="ycards ycards--2">${LOCATIONS.filter((l) => l.state === 'AK').map((l) => yardCard(ctx, l, { photoSizes: '(min-width: 900px) 46vw, 92vw' }))}</div>
  </div>
</section>

<section class="section section--ice">
  <div class="wrap faq-wrap">
    ${sectionHead({ eyebrow: 'Questions', title: 'Remote delivery, <em>answered.</em>' })}
    <div class="faq">
      ${FAQ.map(([q, a], i) => html`<details${i === 0 ? html` open` : ''}><summary>${q}</summary><p>${a}</p></details>`)}
    </div>
  </div>
</section>
${quoteBand(ctx, { eyebrow: 'Remote & export packages', title: 'Building off <em>the road system?</em>', body: 'Send plans or a list and tell us where the job is. We will quote the package and the freight together.' })}
`,
  }),
};
