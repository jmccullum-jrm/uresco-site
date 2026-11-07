import { html } from '../lib/html.mjs';
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
const HERO = { sizes: 'max(100vw, 150vh)', artSizes: 'max(100vw, 50vh)' };

export default {
  path: '',
  render: (ctx) => layout(ctx, {
    title: 'Lumber & building materials for Alaska and the Pacific Northwest',
    description: 'Uresco Construction Materials supplies lumber, engineered wood, siding and complete building packages from Kent, Anchorage and Fairbanks, with job-site delivery and remote shipping anywhere in Alaska.',
    overlay: true,
    preload: preloadFor(ctx, 'hero-truck-denali', HERO),
    jsonLd: orgJsonLd(ctx),
    body: html`
<section class="hero">
  <div class="hero__media">${picture(ctx, 'hero-truck-denali', { eager: true, art: true, ...HERO })}</div>
  <div class="wrap hero__inner">
    <div class="hero__copy">
      ${stamp(SITE.tagline, { dark: true })}
      <h1 class="display">From Puget&nbsp;Sound <br>to the <em>North&nbsp;Slope.</em></h1>
      <p class="hero__lede">Lumber, engineered wood, siding and complete building packages, delivered to the job site down the road or across an ocean.</p>
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
    ${sectionHead({ eyebrow: 'Products', title: 'Everything to get <em>the job built.</em>', lede: 'A wholesale dealer’s full line, from framing packages to the last box of fasteners.', action: html`<a class="link" href="${ctx.u('products/')}">All products ${icon('arrow', { size: 16 })}</a>` })}
    <div class="tiles">
      ${ORDER.map((slug) => CATEGORIES.find((c) => c.slug === slug)).map((c) => html`
        <a class="tile reveal ${TILE[c.slug] || ''}" href="${ctx.u('products/' + c.slug + '/')}">
          ${picture(ctx, c.photo, { sizes: TILE[c.slug] ? '(min-width: 1000px) 50vw, 100vw' : '(min-width: 1000px) 25vw, 50vw', alt: '' })}
          <span class="tile__body">
            <span><span class="tile__name">${c.short}</span>${TILE[c.slug] === 'tile--feature' ? html`<span class="tile__meta">${c.lede}</span>` : ''}</span>
            <span class="tile__go">${icon('arrow', { size: 18 })}</span>
          </span>
        </a>`)}
      <a class="tile tile--wide tile--ask reveal" href="${ctx.u('quote/')}">
        <span class="tile__name">Don’t see it listed?</span>
        <span class="tile__body" style="padding:0">
          <span class="tile__text">We carry a large variety of other building materials — tarps, poly, caulking, adhesives, house wraps and more. Ask your yard.</span>
          <span class="tile__go">${icon('arrow', { size: 18 })}</span>
        </span>
      </a>
    </div>
    <div class="brands">
      <span class="brands__label">Brands we carry</span>
      <ul>${BRANDS.map((b) => html`<li>${b}</li>`)}</ul>
    </div>
  </div>
</section>

<section class="section section--sea">
  <div class="wrap reach reach--bleed">
    <div class="reach__copy">
      ${stamp('Remote & export delivery', { dark: true })}
      <h2 class="h2">Down the road <br>or <em>across an ocean.</em></h2>
      <p class="lede">We specialize in getting materials to places without a lumber yard: shipping coordination, dock delivery and rural Alaska delivery.</p>
      <ol class="steps">
        <li><b>Send plans or a list</b><span>We build the take-off and price it delivered to your community.</span></li>
        <li><b>We package it</b><span>Sorted, crated and wrapped to survive the trip and the handoffs.</span></li>
        <li><b>We coordinate freight</b><span>Truck, ocean freight, barge or air, booked to meet your window.</span></li>
        <li><b>It lands where you build</b><span>Dock delivery or straight to the site.</span></li>
      </ol>
      <div class="actions"><a class="btn" href="${ctx.u('alaska/')}">How remote delivery works ${icon('arrow', { size: 18 })}</a></div>
    </div>
    <div class="reach__map">${deliveryMap(ctx)}</div>
  </div>
</section>

<section class="section">
  <div class="wrap svc-split">
    <div class="svc-split__head">
      ${stamp('Services')}
      <h2 class="h2">More than a <em>lumber yard.</em></h2>
      <p class="lede">Estimators, designers and drivers who know what it takes to get a building package right the first time.</p>
    </div>
    <ul class="svc-list">
      ${SERVICES.map((s) => html`<li><a class="svc-row" href="${ctx.u('services/')}#${s.id}">
        <span class="svc-row__icon">${icon(s.icon, { size: 24 })}</span>
        <span class="svc-row__text"><b>${s.name}</b><small>${s.short}</small></span>
        ${icon('arrow', { size: 20, cls: 'svc-row__go' })}
      </a></li>`)}
    </ul>
  </div>
</section>

${quoteBand(ctx)}

<section class="section section--bone">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Who we build for', title: 'Institutional. Commercial. <em>Residential.</em>', lede: 'From schools and multifamily framing to custom homes and packages for communities off the road system.', action: html`<a class="link" href="${ctx.u('projects/')}">See project types ${icon('arrow', { size: 16 })}</a>` })}
  </div>
  <div class="scroller" role="group" aria-label="Types of work" tabindex="0">
    ${PROJECTS.slice(0, 4).map((p) => html`
      <a class="pcard" href="${ctx.u('projects/')}">
        <span class="pcard__media">${picture(ctx, p.photo, { sizes: '(min-width: 1100px) 33vw, 340px', alt: '' })}<span class="proj__tag">${p.sector}</span></span>
        <span class="pcard__title">${p.title}</span>
        <span class="pcard__text">${p.scope}</span>
      </a>`)}
  </div>
</section>

<section class="acband rings">
  <div class="wrap acband__row">
    <div>
      ${stamp('Contractor accounts', { dark: true })}
      <h2 class="h2">Buying for a crew? <em>Open an account.</em></h2>
      <p>Order on account from any of our three yards, with job accounts and authorized buyers. Apply online in about ten minutes.</p>
    </div>
    <a class="btn" href="${ctx.u('accounts/')}">Apply for an account ${icon('arrow', { size: 18 })}</a>
  </div>
</section>

<section class="section" id="yards">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Locations', title: 'Three yards. <em>One team.</em>', lede: 'Call the yard nearest your project, or any of them. They work as one.', action: html`<a class="link" href="${ctx.u('locations/')}">Faxes, emails &amp; details ${icon('arrow', { size: 16 })}</a>` })}
    <div class="yards">${LOCATIONS.map((l) => yardCard(ctx, l, { compact: true }))}</div>
  </div>
</section>
`,
  }),
};
