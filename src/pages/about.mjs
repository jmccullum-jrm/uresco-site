import { html } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';
import { layout } from '../lib/layout.mjs';
import { picture, preloadFor, sectionHead, pageHero, quoteBand, stamp } from '../lib/components.mjs';
import { SITE } from '../config.mjs';

const VALUES = [
  ['Quality materials', 'A trusted, dependable source of quality construction materials — the right grade, the right brand, the right count.'],
  ['Trusted service', 'A knowledgeable, resourceful sales staff committed to professional and prompt service.'],
  ['Remote expertise', 'Remote-site and export building packages, with shipping coordination from quote to dock.'],
  ['Independent', 'One of the largest independent building-material suppliers serving Alaska and the Pacific Northwest.'],
];

const about = {
  path: 'about/',
  render: (ctx) => layout(ctx, {
    title: 'About Uresco',
    description: `For more than ${SITE.years} years, Uresco Construction Materials has been a trusted source for quality building materials throughout the Pacific Northwest and all of Alaska.`,
    preload: [preloadFor(ctx, 'lumber-stack')],
    body: html`
${pageHero(ctx, {
  eyebrow: `About · ${SITE.years}+ years`,
  title: 'Quality materials. <em>Trusted service.</em>',
  lede: `For more than ${SITE.years} years, Uresco has been a trusted source for quality building materials throughout the Pacific Northwest and all of Alaska.`,
  photoKey: 'lumber-stack',
  crumbs: [['About']],
})}
<section class="section">
  <div class="wrap split">
    <div>
      ${stamp('Who we are', { no: '01' })}
      <h2 class="h2">Independent, <em>and built for distance.</em></h2>
      <p class="lede">As one of the largest independent building-material suppliers serving Alaska and the Pacific Northwest, Uresco offers institutional, commercial and residential builders the best selection, pricing and service.</p>
      <p>Our reliable service includes dependable delivery to job sites down the road or across an ocean. From our headquarters in Kent and our distribution centers in Anchorage and Fairbanks, we supply everything from framing lumber and engineered beams to siding, insulation, windows, cabinets and the hardware that holds it all together.</p>
    </div>
    <div class="split__media">${picture(ctx, 'uresco-truck', { sizes: '(min-width: 860px) 50vw, 100vw' })}${stamp('Lumber by UCM')}</div>
  </div>
</section>

<section class="section section--dark rings">
  <div class="wrap">
    ${stamp('Our mission', { dark: true, no: '02' })}
    <p class="mission">Uresco provides a trusted and dependable source of quality construction materials, a knowledgeable and resourceful sales staff, and we are committed to professional and prompt service.</p>
    <p class="lede">That commitment lets our customers buy their materials with confidence that they will receive the best products at the best prices.</p>
    <div class="values">
      ${VALUES.map(([k, v]) => html`<div><b>${k}</b><p>${v}</p></div>`)}
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'From our yards', no: '03', title: 'The <em>UCM</em> yards.', lede: 'Photos from Uresco’s own yards and trucks.' })}
    <div class="archive">
      <figure>${picture(ctx, 'uresco-truck', { sizes: '(min-width: 760px) 33vw, 50vw' })}<figcaption>UCM delivery truck</figcaption></figure>
      <figure>${picture(ctx, 'uresco-yard', { sizes: '(min-width: 760px) 33vw, 50vw' })}<figcaption>Wrapped bundles in the yard</figcaption></figure>
      <figure>${picture(ctx, 'uresco-stack', { sizes: '(min-width: 760px) 33vw, 50vw' })}<figcaption>Stacked and stickered</figcaption></figure>
    </div>
  </div>
</section>
<section class="section section--bone">
  <div class="wrap split">
    <div class="split__media">${picture(ctx, 'combilift', { sizes: '(min-width: 860px) 50vw, 100vw' })}${stamp('Work with us')}</div>
    <div>
      ${stamp('Careers', { no: '04' })}
      <h2 class="h2">Good people <em>move good lumber.</em></h2>
      <p class="lede">Yard crew, drivers, estimators and inside sales — we’re always glad to hear from people who take pride in getting the order right. Call or email the yard nearest you and ask about openings.</p>
      <div class="actions"><a class="btn btn--dark" href="${ctx.u('locations/')}">Find your nearest yard ${icon('arrow', { size: 18 })}</a></div>
    </div>
  </div>
</section>
${quoteBand(ctx, { title: 'Let’s build <em>something.</em>', body: 'Call your Uresco team today for your building-material needs, or send plans and we’ll quote the job.' })}
`,
  }),
};

const notFound = {
  path: '404/',
  file: '404.html',
  render: (ctx) => {
    // GitHub Pages serves 404.html from any depth, so this page links absolutely to the site root
    // it was built for instead of relatively.
    return layout({ ...ctx, u: (to) => (ctx.base || '/') + to }, {
      title: 'Page not found',
      description: 'This page doesn’t exist. Find lumber, building materials and delivery across Alaska and the Pacific Northwest at Uresco.',
      body: html`
<section class="section lost">
  <div class="wrap">
    ${stamp('404 · Off the map')}
    <h1 class="display" style="color:var(--ink)">This page <br>missed the barge.</h1>
    <p class="lede">The page you were after isn’t here. It may have moved when we rebuilt the site.</p>
    <div class="actions">
      <a class="btn btn--dark" href="${ctx.base || '/'}">Go to the home page ${icon('arrow', { size: 18 })}</a>
      <a class="btn btn--line" href="${(ctx.base || '/') + 'products/'}">Browse products</a>
    </div>
  </div>
</section>`,
    });
  },
};

export default [about, notFound];
