import { html, raw } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';
import { layout, orgJsonLd } from '../lib/layout.mjs';
import { picture, preloadFor, stamp, sectionHead, quoteBand, yardCard, deliveryMap, yardsStrip } from '../lib/components.mjs';
import { CATEGORIES, BRANDS } from '../data/products.mjs';
import { SERVICES } from '../data/services.mjs';
import { PROJECTS } from '../data/projects.mjs';
import { LOCATIONS } from '../data/locations.mjs';
import { SITE } from '../config.mjs';

// Tile layout for the nine categories: one feature, two wide, six standard (4-column grid).
const TILE = { 'framing-lumber': 'tile--feature', 'cedar-decking': 'tile--wide', 'hardware-supplies': 'tile--wide' };
const ORDER = ['framing-lumber', 'panels-sheathing', 'engineered-wood', 'cedar-decking', 'concrete-forming', 'siding-exterior', 'insulation-drywall', 'windows-doors-cabinets', 'hardware-supplies'];

export default {
  path: '',
  render: (ctx) => layout(ctx, {
    title: 'Lumber & building materials for Alaska and the Pacific Northwest',
    description: 'Uresco Construction Materials supplies lumber, engineered wood, siding and complete building packages from Kent, Anchorage and Fairbanks, with job-site delivery and remote shipping anywhere in Alaska.',
    overlay: true,
    preload: [preloadFor(ctx, 'hero-truck-denali')],
    jsonLd: orgJsonLd(ctx),
    body: html`
<section class="hero">
  <div class="hero__media">${picture(ctx, 'hero-truck-denali', { eager: true })}</div>
  <div class="wrap hero__inner">
    <div class="hero__copy">
      ${stamp('Kent · Anchorage · Fairbanks', { dark: true })}
      <h1 class="display">From Puget Sound <br>to the <em>North Slope.</em></h1>
      <p class="hero__lede">Lumber, engineered wood, siding and complete building packages for institutional, commercial and residential builders — delivered to the job site down the road or across an ocean.</p>
      <div class="actions">
        <a class="btn" href="${ctx.u('quote/')}">Request a quote ${icon('arrow', { size: 18 })}</a>
        <a class="btn btn--line" href="${ctx.u('quote/#plans')}">${icon('upload', { size: 18 })} Send plans</a>
      </div>
    </div>
    ${yardsStrip(ctx)}
  </div>
</section>

<section class="proof" aria-label="At a glance">
  <div class="wrap proof__grid">
    <div class="proof__item"><span class="proof__big">${SITE.years}+</span><span class="proof__label">years supplying builders in Alaska and the Northwest</span></div>
    <div class="proof__item"><span class="proof__big">3</span><span class="proof__label">distribution centers: Kent, Anchorage and Fairbanks</span></div>
    <div class="proof__item"><span class="proof__big">Statewide</span><span class="proof__label">remote-site delivery anywhere in Alaska, Sitka to Utqiaġvik</span></div>
    <div class="proof__item"><span class="proof__big">Independent</span><span class="proof__label">one of the largest independent suppliers in the region</span></div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Products', no: '01', title: 'Everything to get <em>the job built.</em>', lede: 'A wholesale dealer’s full line, from framing packages to the last box of fasteners, with the brands builders specify.', action: html`<a class="link" href="${ctx.u('products/')}">All products ${icon('arrow', { size: 16 })}</a>` })}
    <div class="tiles">
      ${ORDER.map((slug) => CATEGORIES.find((c) => c.slug === slug)).map((c) => html`
        <a class="tile reveal ${TILE[c.slug] || ''}" href="${ctx.u('products/' + c.slug + '/')}">
          ${picture(ctx, c.photo, { sizes: TILE[c.slug] ? '(min-width: 1000px) 50vw, 100vw' : '(min-width: 1000px) 25vw, (min-width: 560px) 50vw, 100vw', alt: '' })}
          <span class="tile__body">
            <span><span class="tile__name">${c.short}</span>${TILE[c.slug] === 'tile--feature' ? html`<span class="tile__meta">${c.lede}</span>` : ''}</span>
            <span class="tile__go">${icon('arrow', { size: 18 })}</span>
          </span>
        </a>`)}
      <a class="tile tile--wide tile--ask reveal" href="${ctx.u('quote/')}">
        <span class="tile__name">Don’t see it listed?</span>
        <span class="tile__body" style="padding:0">
          <p>We carry a large variety of other building materials — tarps, poly, caulking, adhesives, house wraps and more. Ask your yard.</p>
          <span class="tile__go">${icon('arrow', { size: 18 })}</span>
        </span>
      </a>
    </div>
  </div>
</section>

<section class="section section--dark rings">
  <div class="wrap reach">
    <div>
      ${stamp('Remote & export delivery', { dark: true, no: '02' })}
      <h2 class="h2">Down the road <br>or <em>across an ocean.</em></h2>
      <p class="lede">Uresco specializes in getting materials to places without a lumber yard. We work with you on every part of it — shipping coordination, dock delivery and rural Alaska delivery.</p>
      <ol class="steps">
        <li><b>Send plans or a list</b><span>We build the take-off and price it delivered to your community.</span></li>
        <li><b>We package it</b><span>Sorted, crated and wrapped to survive the trip and the handoffs.</span></li>
        <li><b>We coordinate freight</b><span>Truck, ocean freight, barge or air — booked to meet your window.</span></li>
        <li><b>It lands where you build</b><span>Dock delivery or straight to the site.</span></li>
      </ol>
      <div class="actions"><a class="btn" href="${ctx.u('alaska/')}">How remote delivery works ${icon('arrow', { size: 18 })}</a></div>
    </div>
    <div class="mapframe reveal">${deliveryMap(ctx)}</div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Services', no: '03', title: 'More than a <em>lumber yard.</em>', lede: 'Estimators, designers and drivers who know what it takes to get a building package right the first time.', action: html`<a class="link" href="${ctx.u('services/')}">All services ${icon('arrow', { size: 16 })}</a>` })}
    <div class="svc-grid">
      ${SERVICES.map((s) => html`<div class="svc reveal"><div class="svc__icon">${icon(s.icon, { size: 26 })}</div><h3 class="h3">${s.name}</h3><p>${s.short}</p></div>`)}
    </div>
  </div>
</section>

${quoteBand(ctx)}

<section class="section section--bone">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Who we build for', no: '04', title: 'Institutional. Commercial. <em>Residential.</em>', lede: 'Schools and clinics, multifamily and commercial framing, custom homes, and complete packages for communities off the road system.', action: html`<a class="link" href="${ctx.u('projects/')}">See project types ${icon('arrow', { size: 16 })}</a>` })}
    <div class="proj-grid">
      ${PROJECTS.slice(0, 4).map((p) => html`
        <article class="proj reveal">
          <div class="proj__media">${picture(ctx, p.photo, { sizes: '(min-width: 1100px) 25vw, (min-width: 600px) 50vw, 100vw' })}<span class="proj__tag">${p.sector}</span></div>
          <div class="proj__body"><h3 class="h3">${p.title}</h3><p>${p.scope}</p></div>
        </article>`)}
    </div>
  </div>
</section>

<section class="section--tight">
  <div class="wrap">
    <div class="brands">
      <span class="brands__label">Brands we carry</span>
      <ul>${BRANDS.map((b) => html`<li>${b}</li>`)}</ul>
    </div>
  </div>
</section>

<section class="section" id="yards">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Locations', no: '05', title: 'Three yards. <em>One team.</em>', lede: 'Call the yard nearest your project, or any of them — they work as one.', action: html`<a class="link" href="${ctx.u('locations/')}">Locations ${icon('arrow', { size: 16 })}</a>` })}
    <div class="yards">${LOCATIONS.map((l) => yardCard(ctx, l))}</div>
  </div>
</section>
`,
  }),
};
