import { html, raw } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';
import { layout } from '../lib/layout.mjs';
import { picture, preloadFor, sectionHead, pageHero, quoteBand, yardCard, mapPlate, openStatus, callLink } from '../lib/components.mjs';
import { LOCATIONS, byId, tel } from '../data/locations.mjs';
import { SITE } from '../config.mjs';

const kent = byId('kent'), anchorage = byId('anchorage'), fairbanks = byId('fairbanks');

// The company on one sheet, the way a purchasing department would write it down.
// Every line is from FACTS.md or src/data.
const SHEET = (ctx) => [
  ['Legal name', SITE.legal],
  ['Goes by', 'Uresco, or UCM'],
  ['Business', 'Wholesale dealer of building materials'],
  ['Customers', 'Institutional, commercial and residential builders'],
  ['Standing', 'One of the largest independent building material suppliers serving Alaska and the Pacific Northwest'],
  ['In business', `More than ${SITE.years} years`],
  ['Headquarters', html`<a href="${ctx.u('locations/')}#kent">Kent, Washington</a>`],
  ['Yards', html`<a href="${ctx.u('locations/')}#kent">Kent</a>, <a href="${ctx.u('locations/')}#anchorage">Anchorage</a> and <a href="${ctx.u('locations/')}#fairbanks">Fairbanks</a>`],
  ['Serves', 'The Pacific Northwest and all of Alaska'],
  ['Specialty', 'Remote location delivery, from Sitka to Utqiaġvik'],
];

// The mission, a line at a time, with what it comes to on a job.
const PROMISES = [
  {
    line: 'A trusted, dependable source of <em>quality construction materials.</em>',
    proof: 'Nine product lines, framing lumber to roofing, including James Hardie, CertainTeed, Simpson Strong-Tie, Georgia-Pacific DensGlass and Parallam.',
    link: ['products/', 'See the product lines'],
  },
  {
    line: 'A knowledgeable, resourceful <em>sales staff.</em>',
    proof: 'Send plans and they will help with the take-off and the estimate. Design services are available for your unique project needs.',
    link: ['services/#takeoffs', 'Take-offs and design'],
  },
  {
    line: 'Professional, <em>prompt service.</em>',
    proof: 'Job-site delivery by Moffett fork unload and boom truck. Crating and packaging, shipping coordination, dock delivery and rural Alaska delivery when the job is off the road.',
    link: ['services/', 'All six services'],
  },
];

// North along the ruler: yards above it, the two ends of "anywhere in Alaska" below.
const lat0 = 47, lat1 = 72;
const along = (lat) => `${(((lat - lat0) / (lat1 - lat0)) * 100).toFixed(2)}%`;
const GRADS = [50, 55, 60, 65, 70];

const OWN = [
  ['uresco-truck', 'The tag on a Uresco load'],
  ['uresco-yard', 'Wrapped bundles in a Uresco yard'],
  ['uresco-woodpile', 'Timber ends at a Uresco yard'],
];

const about = {
  path: 'about/',
  render: (ctx) => layout(ctx, {
    title: 'About Uresco',
    description: `For more than ${SITE.years} years, Uresco Construction Materials has been a trusted source for quality building materials throughout the Pacific Northwest and all of Alaska.`,
    preload: [preloadFor(ctx, 'timber-weathered')],
    body: html`
${pageHero(ctx, {
  eyebrow: html`About Uresco <i>·</i> ${SITE.years}+ years`,
  title: `More than ${SITE.years} years <em>of getting it there.</em>`,
  lede: 'One of the largest independent building material suppliers serving Alaska and the Pacific Northwest, with dependable delivery to job sites down the road or across an ocean.',
  photoKey: 'timber-weathered',
  caption: 'Weathered timbers, end on',
  actions: html`<a class="btn btn--lg" href="${ctx.u('quote/')}">Request a quote ${icon('arrow', { size: 18 })}</a>${callLink(ctx, { cls: 'btn--lg btn--line' })}`,
})}

<section class="section section--first" aria-labelledby="ab-sheet-title">
  <div class="wrap ab-sheet">
    <div class="ab-sheet__copy">
      <p class="eyebrow">Who you are calling</p>
      <h2 class="h2" id="ab-sheet-title">Wholesale, independent <em>and built for distance.</em></h2>
      <p class="lede">Uresco supplies institutional, commercial and residential builders from three distribution centers: our headquarters in Kent, Washington, and yards in Anchorage and Fairbanks, Alaska.</p>
      <p class="ab-own__lab">From Uresco</p>
      <ul class="ab-own" aria-label="Photographs from our own yards">
        ${OWN.map(([key, cap]) => html`<li><figure>${picture(ctx, key, { sizes: '(min-width: 1000px) 140px, 30vw' })}<figcaption>${cap}</figcaption></figure></li>`)}
      </ul>
    </div>
    <div class="ab-card reveal">
      <div class="ab-card__bar"><span>The company, on one sheet</span><span>UCM</span></div>
      <dl class="ab-card__rows">
        ${SHEET(ctx).map(([k, v]) => html`<div><dt>${k}</dt><dd>${v}</dd></div>`)}
      </dl>
      <div class="ab-card__foot"><a class="link" href="${ctx.u('locations/')}">Phone, fax and email for each yard ${icon('arrow', { size: 16 })}</a></div>
    </div>
  </div>
</section>

<section class="section section--ice" aria-labelledby="ab-mission-title">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'The mission', title: 'What we promise, <em>and where to check it.</em>', lede: 'Our mission has three parts. Here is each one, and what it comes to on your job.', id: 'ab-mission-title' })}
    <ol class="ab-promises">
      ${PROMISES.map((p, i) => html`<li class="ab-promise reveal" style="--i:${i}">
        <span class="ab-promise__no" aria-hidden="true">0${i + 1}</span>
        <h3 class="ab-promise__line">${raw(p.line)}</h3>
        <div class="ab-promise__proof">
          <p>${p.proof}</p>
          <a class="link" href="${ctx.u(p.link[0])}">${p.link[1]} ${icon('arrow', { size: 16 })}</a>
        </div>
      </li>`)}
    </ol>
    <p class="ab-promises__end">All of it so you can buy with confidence that you are getting <b>the best products at the best prices.</b></p>
  </div>
</section>

<section class="ab-reach" aria-labelledby="ab-reach-title">
  <div class="ab-reach__card">
    <div class="ab-reach__head">
      <div>
        <p class="eyebrow">The specialty</p>
        <h2 class="h2" id="ab-reach-title">Remote delivery <em>is the specialty.</em></h2>
      </div>
      <p class="ab-reach__lede">Three yards on one line north. We specialize in remote location delivery, and delivery is available from Sitka to Utqiaġvik, anywhere in Alaska.</p>
    </div>
    <div class="ab-ruler" role="group" aria-label="Uresco’s yards and delivery range, by latitude, south to north">
      <ol class="ab-ruler__yards">
        ${[kent, anchorage, fairbanks].map((l, i) => html`<li class="ab-mark" style="--at:${along(l.geo.lat)};--i:${i}">
          <i class="ab-mark__dot" aria-hidden="true"></i>
          <span class="ab-mark__lat">${l.latShort}</span>
          <b class="ab-mark__name">${l.city}</b>
          <small class="ab-mark__role">${l.id === 'kent' ? 'Headquarters' : l.role.replace(' distribution center', '').replace(' Alaska', '')}</small>
          <a class="ab-mark__tel" href="${tel(l.phone)}"><span class="sr-only">Call ${l.city}: </span>${l.phone}</a>
        </li>`)}
      </ol>
      <div class="ab-ruler__rule" aria-hidden="true">
        <i class="ab-ruler__line"></i>
        ${GRADS.map((g) => html`<span class="ab-ruler__grad" style="--at:${along(g)}">${g}°</span>`)}
      </div>
      <p class="ab-ruler__span" style="--from:${along(57.1)};--to:${along(71.3)}">
        <span><b>Sitka</b> 57.1° N</span>
        <span class="ab-ruler__mid">Anywhere in Alaska</span>
        <span><b>Utqiaġvik</b> 71.3° N</span>
      </p>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="ab-call-title">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Sales staff', title: 'Talk to the yard <em>nearest the job.</em>', lede: 'Our friendly, knowledgeable sales staff is here to help. Give us a call, email or stop by.', id: 'ab-call-title' })}
    <div class="ycards">${LOCATIONS.map((l) => yardCard(ctx, l, { compact: true }))}</div>
  </div>
</section>

${quoteBand(ctx, { eyebrow: 'New to Uresco?', title: 'Start with <em>a phone call.</em>', body: 'Call the yard nearest the job, or send plans and a materials list. We will quote the package and work out the freight with you.' })}
`,
  }),
};

// GitHub Pages serves 404.html from any depth, so every link here is absolute to the site root the page
// was built for (ctx.base), and the layout is given a ctx.u that does the same.
const notFound = {
  path: '404/',
  file: '404.html',
  render: (ctx) => {
    const base = ctx.base || '/';
    const abs = { ...ctx, u: (to) => base + to };
    const PLACES_TO_GO = [
      ['products/', 'Products'], ['services/', 'Services'], ['alaska/', 'Alaska delivery'], ['pacific-northwest/', 'Pacific Northwest'],
      ['projects/', 'Projects'], ['locations/', 'Locations'], ['about/', 'About'], ['accounts/', 'Open an account'],
    ];
    return layout(abs, {
      title: 'Page not found',
      description: 'This page doesn’t exist. Find lumber, building materials and delivery across Alaska and the Pacific Northwest at Uresco.',
      body: html`
<section class="nf">
  <div class="wrap nf__grid">
    <div class="nf__copy">
      <p class="eyebrow">404 <i>·</i> Off the map</p>
      <h1 class="display">This page <em>missed the barge.</em></h1>
      <p class="phero__lede">The page you were after isn’t here. It may have moved when we rebuilt the site.</p>
      <div class="actions">
        <a class="btn btn--lg" href="${base}">Go to the home page ${icon('arrow', { size: 18 })}</a>
        <a class="btn btn--lg btn--line" href="${base + 'quote/'}">Request a quote</a>
      </div>
    </div>
    <div class="stage nf__stage">
      <div class="stage__sky" aria-hidden="true"></div>
      <div class="stage__map">${mapPlate(abs, { dots: false, marker: { left: 72.5, top: 73, name: 'This page' } })}</div>
    </div>
  </div>
  <div class="wrap nf__rows">
    <section class="nf__yards" aria-labelledby="nf-call">
      <h2 class="eyebrow" id="nf-call">Or call a yard</h2>
      <ul>
        ${LOCATIONS.map((l) => html`<li><span class="nf__who"><b>${l.city}, ${l.state}</b>${openStatus(l)}<small>${l.serves}</small></span><a class="nf__tel" href="${tel(l.phone)}">${icon('phone', { size: 16 })}<span class="sr-only">Call ${l.city}: </span>${l.phone}</a></li>`)}
      </ul>
    </section>
    <nav class="nf__links" aria-label="Main pages">
      <h2 class="eyebrow">Or try one of these</h2>
      <ul>
        ${PLACES_TO_GO.map(([to, label]) => html`<li><a href="${base + to}">${label}${icon('arrow', { size: 16 })}</a></li>`)}
      </ul>
    </nav>
  </div>
</section>`,
    });
  },
};

export default [about, notFound];
