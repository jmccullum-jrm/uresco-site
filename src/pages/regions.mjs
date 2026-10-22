import { html } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';
import { layout, orgJsonLd } from '../lib/layout.mjs';
import { picture, preloadFor, sectionHead, pageHero, quoteBand, yardCard, deliveryMap, stamp } from '../lib/components.mjs';
import { LOCATIONS, byId, tel } from '../data/locations.mjs';
import { CATEGORIES } from '../data/products.mjs';

const kent = byId('kent');

const pnw = {
  path: 'pacific-northwest/',
  render: (ctx) => layout(ctx, {
    title: 'Pacific Northwest — Kent, WA',
    description: 'Uresco’s Kent, Washington headquarters and Pacific Northwest distribution center: lumber, engineered wood, siding and building packages with job-site delivery by boom truck and Moffett forklift.',
    preload: [preloadFor(ctx, 'rainier-tacoma')],
    body: html`
${pageHero(ctx, {
  eyebrow: 'Pacific Northwest · Kent, WA',
  title: 'Delivered to your <em>Puget Sound job site.</em>',
  lede: 'Uresco has the knowledge and resources to get you exactly what you need for your next project, delivered to your job site.',
  photoKey: 'rainier-tacoma',
  crumbs: [['Pacific Northwest']],
  actions: html`<a class="btn" href="${tel(kent.phone)}">${icon('phone', { size: 18 })} ${kent.phone}</a><a class="btn btn--line" href="${ctx.u('quote/')}">Request a quote ${icon('arrow', { size: 18 })}</a>`,
})}
<section class="section">
  <div class="wrap">
    <div class="split">
      <div>
        ${stamp('Kent distribution center', { no: '01' })}
        <h2 class="h2">A full line <em>for the builder.</em></h2>
        <p class="lede">Our Kent distribution center offers a full range of building products and services for the commercial and residential builder, and is fully equipped to handle deliveries to your job site using Moffett forklift unloading.</p>
        <ul class="ticks">
          <li>${icon('check', { size: 16 })}Job-site delivery by boom truck and Moffett forklift</li>
          <li>${icon('check', { size: 16 })}Take-offs, estimates and design services</li>
          <li>${icon('check', { size: 16 })}Remote and export building packages</li>
        </ul>
      </div>
      ${yardCard(ctx, kent, { showPhoto: false, headingLevel: 2 })}
    </div>
  </div>
</section>
<section class="section section--bone">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'In the yard', no: '02', title: 'What we <em>stock.</em>', action: html`<a class="link" href="${ctx.u('products/')}">All products ${icon('arrow', { size: 16 })}</a>` })}
    <nav class="cat-nav" aria-label="Product categories">
      ${CATEGORIES.map((c) => html`<a href="${ctx.u('products/' + c.slug + '/')}">${c.short}${icon('arrow', { size: 16 })}</a>`)}
    </nav>
  </div>
</section>
${quoteBand(ctx)}
`,
  }),
};

const locations = {
  path: 'locations/',
  render: (ctx) => layout(ctx, {
    title: 'Locations',
    description: 'Uresco distribution centers in Kent, Washington, and Anchorage and Fairbanks, Alaska: addresses, phone, fax and email for each yard.',
    preload: [preloadFor(ctx, 'combilift')],
    jsonLd: orgJsonLd(ctx),
    body: html`
${pageHero(ctx, {
  eyebrow: 'Locations',
  title: 'Three distribution centers. <em>One team.</em>',
  lede: 'Our distribution centers maintain complete inventories of building materials, offering institutional, commercial and residential builders the best of selection, pricing and service.',
  photoKey: 'combilift',
  crumbs: [['Locations']],
})}
<section class="section">
  <div class="wrap">
    <div class="yards">${LOCATIONS.map((l) => yardCard(ctx, l, { headingLevel: 2 }))}</div>
  </div>
</section>
<section class="section section--dark">
  <div class="wrap reach">
    <div>
      ${stamp('Which yard should I call?', { dark: true })}
      <h2 class="h2">Call the one <em>nearest the job.</em></h2>
      <p class="lede">Building around Puget Sound? Call Kent. Southcentral Alaska or a remote site? Call Anchorage. The Interior and points north? Call Fairbanks. Not sure — call any of us. We work as one team.</p>
      <div class="actions"><a class="btn" href="${ctx.u('quote/')}">Request a quote ${icon('arrow', { size: 18 })}</a></div>
    </div>
    <div class="mapframe">${deliveryMap(ctx, { compact: true })}</div>
  </div>
</section>
`,
  }),
};

export default [pnw, locations];
