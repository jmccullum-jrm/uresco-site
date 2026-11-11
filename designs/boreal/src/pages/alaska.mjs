import { html, raw } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';
import { layout } from '../lib/layout.mjs';
import { sectionHead, quoteBand, yardCard, routeStage, interlude } from '../lib/components.mjs';
import { LOCATIONS } from '../data/locations.mjs';

// How freight generally moves in Alaska. Uresco works with the customer on shipping coordination;
// nothing here is a Uresco schedule, carrier or route.
const MODES = [
  { icon: 'road', name: 'The road system', where: 'Southcentral · the Interior · the highway north', body: 'Job sites on the road system are typically reached by truck from the Anchorage and Fairbanks yards, with boom trucks and truck-mounted Moffett forklifts.' },
  { icon: 'ship', name: 'Ocean freight & barge', where: 'Southeast · the coast · western and Arctic Alaska', body: 'Coastal communities are generally reached by sea, and river communities by barge in the ice-free season. We work with you on shipping coordination and dock delivery.' },
  { icon: 'plane', name: 'Air cargo', where: 'Year-round, off the road system', body: 'Off the road system, air is the year-round way in. Tell us where you are building and we will work out the freight with you.' },
];

const STEPS = [
  ['Send plans or a list', 'Send drawings or a list. We help with the take-off and quote the package.'],
  ['Package and crate', 'The complete package comes together, with crating and packaging for the trip.'],
  ['Coordinate the freight', 'Truck, ocean freight, barge or air: we work with you on all aspects of shipping coordination.'],
  ['Dock or site delivery', 'Delivered to the dock or straight to the site.'],
];

// Also the FAQPage structured data, so each answer has to hold up as plain text on its own.
const FAQ = [
  ['Can you deliver to my community?', 'Delivery is available anywhere in Alaska, from Sitka to Utqiaġvik (Barrow). Tell us where the job is and we will work with you on how to get it there: road, ocean freight, barge or air.'],
  ['Which yard should I call?', 'Southcentral Alaska or a remote site: Anchorage. The Interior and points north: Fairbanks. Puget Sound: Kent. Any yard can help; they work as one team.'],
  ['When should I order for barge season?', 'Early. In western and Arctic Alaska, barges generally run only in the ice-free season, so a package has to be ready before the barge window closes. Tell us where you are building and when you need it, and we will work out the freight with you.'],
  ['Do you ship complete building packages?', 'Yes. We are fully equipped to handle remote-location and export building packages, with crating and packaging for the trip. One complete package beats a second freight bill.'],
  ['Can you work from my plans?', 'Yes. Send drawings or a materials list and we will help with the take-off and the estimate. Design help is available for projects that need more than a list.'],
  ['Who coordinates the shipping?', 'We work with you on all aspects of shipping coordination, dock delivery and rural Alaska delivery.'],
  ['Does the quote include freight?', 'We will quote the package and work out the freight with you. Ask your yard.'],
];

export default {
  path: 'alaska/',
  render: (ctx) => layout(ctx, {
    title: 'Alaska Delivery — Anchorage & Fairbanks',
    description: 'Building materials delivered anywhere in Alaska, from Sitka to Utqiaġvik. Remote and export building packages, shipping coordination and dock delivery from Uresco’s Anchorage and Fairbanks distribution centers.',
    preload: [{ href: `${ctx.u('assets/map.svg')}?v=${ctx.version}`, type: 'image/svg+xml' }],
    jsonLd: html`<script type="application/ld+json">${raw(JSON.stringify({
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
    }))}</script>`,
    body: html`
<section class="ak-open" id="finder" aria-labelledby="ak-title">
  ${routeStage(ctx, {
    variant: 'embed',
    eager: true,
    label: 'Where are you building?',
    copy: html`
      <p class="eyebrow">Can you reach my community?</p>
      <h1 class="display" id="ak-title">Yes. A whole building package, <em>anywhere in Alaska.</em></h1>
      <p class="hero__lede">From Sitka to Utqiaġvik. Name the place to see which yard to call and how freight typically gets there.</p>`,
  })}
  <p class="wrap ak-lanes">Lanes are drawn to show how freight generally moves. They are not carrier routes or schedules.</p>
</section>

<section class="section">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'How freight moves', title: 'Road, sea <em>or air.</em>', lede: 'Much of Alaska is off the road system. Where you are building decides how freight typically gets there.' })}
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
      <p><strong>Plan around the season.</strong> In western and Arctic Alaska, barges generally run only in the ice-free season. Call early so the package is ready for the barge window.</p>
      <a class="link" href="${ctx.u('quote/')}">Request a quote ${icon('arrow', { size: 16 })}</a>
    </div>
  </div>
</section>

<section class="section section--ice">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'How a remote package works', title: 'From plans <em>to the dock.</em>', lede: 'A missing box of hangers is a small problem down the road and a second freight bill across an ocean. So the work starts with the whole package.' })}
    <ol class="steps">
      ${STEPS.map(([t, b], i) => html`<li class="reveal"><span class="steps__no">0${i + 1}</span><h3 class="h3">${t}</h3><p>${b}</p></li>`)}
    </ol>
  </div>
</section>

${interlude(ctx, 'remote-village', { line: 'Utqiaġvik. <em>71° north.</em> Still on our map.', note: 'Snow-drifted buildings and a boat over sea ice, Utqiaġvik.' })}

<section class="section" id="yards">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Alaska yards', title: 'Anchorage <em>and Fairbanks.</em>', lede: 'Our friendly, knowledgeable sales staff is here to help. Give us a call, email or stop by.', action: html`<a class="link" href="${ctx.u('accounts/')}">Open a contractor account ${icon('arrow', { size: 16 })}</a>` })}
    <div class="ycards ycards--2">${LOCATIONS.filter((l) => l.state === 'AK').map((l) => yardCard(ctx, l))}</div>
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
${quoteBand(ctx, { eyebrow: 'Remote & export packages', title: 'Building off <em>the road system?</em>', body: 'Send plans or a list and tell us where the job is. We will quote the package and work out the freight with you.' })}
`,
  }),
};
