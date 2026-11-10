import { html } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';
import { layout, orgJsonLd } from '../lib/layout.mjs';
import { picture, eyebrow, sectionHead, yardCard, routeStage } from '../lib/components.mjs';
import { journey } from '../lib/journey.mjs';
import { CATEGORIES, BRANDS } from '../data/products.mjs';
import { PROJECTS } from '../data/projects.mjs';
import { LOCATIONS } from '../data/locations.mjs';
import { SITE } from '../config.mjs';

const itemsLine = (c) => c.items.map(([n]) => n).join(' · ');
// One of each sector for the home page.
const SECTORS = ['Remote Alaska', 'Institutional', 'Commercial', 'Residential'].map((s) => PROJECTS.find((p) => p.sector === s));

export default {
  path: '',
  render: (ctx) => layout(ctx, {
    title: 'Lumber & building materials for Alaska and the Pacific Northwest',
    description: 'Uresco Construction Materials supplies lumber, engineered wood, siding and complete building packages from Kent, Anchorage and Fairbanks, with job-site delivery and remote shipping anywhere in Alaska.',
    preload: [{ href: `${ctx.u('assets/map.svg')}?v=${ctx.version}`, type: 'image/svg+xml' }],
    jsonLd: orgJsonLd(ctx),
    body: html`
<section class="hero" aria-labelledby="hero-title">
  ${routeStage(ctx, {
    variant: 'hero',
    eager: true,
    labelledby: 'hero-title',
    copy: html`
      <p class="eyebrow">Wholesale building materials<span class="eyebrow__more"> <i>·</i> ${SITE.years}+ years</span></p>
      <h1 class="display" id="hero-title">Where are you building?</h1>
      <p class="hero__lede">Lumber and building packages, delivered down the road or across an ocean. Name the place to see how.</p>`,
  })}
</section>

<section class="section section--first" id="yards">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Three yards, one team', title: 'Call the yard <em>nearest the job.</em>', lede: 'Any of the three can help. Kent covers Puget Sound, Anchorage covers Southcentral and remote Alaska, and Fairbanks covers the Interior and the road north.', action: html`<a class="link" href="${ctx.u('locations/')}">Fax, email and yard details ${icon('arrow', { size: 16 })}</a>` })}
    <div class="ycards">${LOCATIONS.map((l) => yardCard(ctx, l, { compact: true, photoSizes: '(min-width: 900px) 30vw, 92vw' }))}</div>
  </div>
</section>

<section class="section about">
  <div class="wrap">
    <p class="statement reveal">For more than ${SITE.years} years, Uresco has supplied the people who build Alaska and the Pacific Northwest. <span>One of the largest independent building-material suppliers in the region, with a knowledgeable sales staff and a specialty in remote-location delivery.</span></p>
    <dl class="stats">
      <div class="reveal"><dt>${SITE.years}+</dt><dd>years supplying institutional, commercial and residential builders</dd></div>
      <div class="reveal"><dt>3</dt><dd>distribution centers: Kent, Anchorage and Fairbanks</dd></div>
      <div class="reveal"><dt>Sitka <span>→</span> Utqiaġvik</dt><dd>remote-site delivery anywhere in Alaska</dd></div>
      <div class="reveal"><dt>Independent</dt><dd>one of the largest independent suppliers serving the region</dd></div>
    </dl>
  </div>
</section>

<section class="section lines" data-lines>
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Product lines', title: 'The whole load, <em>from one supplier.</em>', lede: 'A wholesale dealer’s full line, from framing packages to the last box of fasteners.', action: html`<a class="link" href="${ctx.u('products/')}">All products ${icon('arrow', { size: 16 })}</a>` })}
    <div class="lines__grid">
      <ol class="lines__list">
        ${CATEGORIES.map((c, i) => html`<li><a class="line" href="${ctx.u('products/' + c.slug + '/')}" data-line="${i}">
          <span class="line__no" aria-hidden="true">0${i + 1}</span>
          <img class="line__thumb" src="${ctx.u(`assets/img/${c.photo}-240.webp`)}" width="64" height="64" alt="" loading="lazy" decoding="async">
          <span class="line__text"><b class="line__name">${c.name}</b><small class="line__items">${itemsLine(c)}</small></span>
          <span class="line__go">${icon('arrow', { size: 18 })}</span>
        </a></li>`)}
      </ol>
      <div class="lines__preview" aria-hidden="true">
        ${CATEGORIES.map((c, i) => html`<figure class="lines__shot frame${i === 0 ? ' is-ready is-on' : ''}" data-shot="${i}">
          ${picture(ctx, c.photo, { sizes: '(min-width: 1000px) 44vw, 1px', alt: '' })}
          <figcaption><b>${c.short}</b><span>${c.lede}</span></figcaption>
        </figure>`)}
      </div>
    </div>
    <div class="lines__foot">
      <p><b>Not on the list?</b> We also carry tarps, poly sheeting, caulking, adhesives, house wraps and more. Ask your yard.</p>
      <ul class="brands" aria-label="Brands we carry">${BRANDS.map((b) => html`<li>${b}</li>`)}</ul>
    </div>
  </div>
</section>

<section class="section section--ice">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'From plans to site', title: 'How a building package <em>travels.</em>', lede: 'The same five steps whether the site is across town or across the Gulf of Alaska, with one point of contact the whole way.' })}
    ${journey(ctx)}
  </div>
</section>

<section class="remote">
  <div class="remote__frame frame">
    ${picture(ctx, 'tug-barge', { sizes: '(min-width: 900px) 98vw, 94vw' })}
    <div class="remote__head">
      <div>
        ${eyebrow('Remote Alaska & export')}
        <h2 class="h2">Built for places <em>without a lumber yard.</em></h2>
        <a class="btn btn--lg btn--dark" href="${ctx.u('alaska/')}">How remote delivery works ${icon('arrow', { size: 18 })}</a>
      </div>
      <p class="remote__lede">Complete building packages, crated and shipped to communities off the road system, from Sitka to Utqiaġvik. We work with you on shipping coordination, dock delivery and rural Alaska delivery.</p>
    </div>
    <ul class="remote__modes" aria-label="How freight moves">
      <li>${icon('road', { size: 18 })}Road system</li>
      <li>${icon('ship', { size: 18 })}Ocean freight &amp; barge</li>
      <li>${icon('plane', { size: 18 })}Air cargo</li>
    </ul>
    <p class="frame__cap">A tug and freight barge</p>
  </div>
</section>

<section class="section sectors">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Who we supply', title: 'Institutional. Commercial. <em>Residential.</em>', lede: 'From schools and multifamily framing to custom homes and housing packages for communities off the road system.', action: html`<a class="link" href="${ctx.u('projects/')}">See the kinds of work ${icon('arrow', { size: 16 })}</a>` })}
  </div>
  <div class="sectors__rail" role="group" aria-label="Kinds of work" tabindex="0">
    ${SECTORS.map((p) => html`
      <a class="scard reveal" href="${ctx.u('projects/')}">
        <span class="scard__media frame">
          ${picture(ctx, p.photo, { sizes: '(min-width: 1000px) 24vw, 300px', alt: '' })}
          <span class="chip chip--glass">${p.sector}</span>
          <span class="scard__load"><span class="scard__lab">Typically on the load</span>${p.materials.map((m) => html`<span>${m}</span>`)}</span>
        </span>
        <b class="scard__title">${p.title}</b>
        <span class="scard__text">${p.scope}</span>
      </a>`)}
  </div>
</section>

<section class="closing">
  <div class="wrap closing__grid">
    <div class="cta__card closing__quote">
      <div class="cta__copy">
        ${eyebrow('Estimates & take-offs')}
        <h2 class="h2">Send plans. <em>Get a take-off.</em></h2>
        <p>Upload drawings or a list and the yard nearest your project builds the take-off: every stick, panel and connector, priced and ready to order.</p>
        <div class="actions">
          <a class="btn btn--lg" href="${ctx.u('quote/')}">Request a quote ${icon('arrow', { size: 18 })}</a>
          <a class="btn btn--lg btn--glass" href="${ctx.u('quote/#plans')}">${icon('upload', { size: 18 })} Send plans</a>
        </div>
      </div>
      <figure class="cta__media frame">${picture(ctx, 'blueprints', { sizes: '(min-width: 900px) 30vw, 92vw' })}</figure>
    </div>
    <div class="closing__account">
      ${eyebrow('Contractor accounts')}
      <h2 class="h3">Buying for a crew? Open an account.</h2>
      <p>Order on account from any of the three yards, with job accounts and authorized buyers.</p>
      <a class="btn btn--dark" href="${ctx.u('accounts/')}">Apply for an account ${icon('arrow', { size: 18 })}</a>
    </div>
  </div>
</section>
`,
  }),
};
