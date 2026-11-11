import { html, raw } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';
import { layout, orgJsonLd } from '../lib/layout.mjs';
import { picture, eyebrow, sectionHead, yardCard, routeStage, openStatus, photoCredit, takeoffSheet } from '../lib/components.mjs';
import { journey } from '../lib/journey.mjs';
import { glyph } from '../lib/drawings.mjs';
import { CATEGORIES, BRANDS } from '../data/products.mjs';
import { PROJECTS } from '../data/projects.mjs';
import { LOCATIONS, tel } from '../data/locations.mjs';
import { SITE } from '../config.mjs';

const itemsLine = (c) => c.items.map(([n]) => n).join(' · ');
// One of each sector for the home page.
const SECTORS = ['Remote Alaska', 'Institutional', 'Commercial', 'Residential'].map((s) => PROJECTS.find((p) => p.sector === s));
const sectorId = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

// The first phone screen answers "who do I call" before the map asks where you are building.
// Wider screens have the same three numbers in the utility bar.
const dial = (ctx) => html`
  <div class="dial">
    <ul class="dial__list" aria-label="Call a yard">
      ${LOCATIONS.map((l) => html`<li><a class="dial__row" href="${tel(l.phone)}">
        <b class="dial__yard">${l.city}</b>
        ${openStatus(l)}
        <span class="dial__num">${icon('phone', { size: 15 })}<span class="sr-only">Call ${l.city}: </span>${l.phone}</span>
      </a></li>`)}
    </ul>
    <a class="dial__acct" href="${ctx.u('accounts/')}"><span class="dial__q">Buying for a crew?</span> <b>Open an account</b> ${icon('arrow', { size: 15 })}</a>
  </div>`;

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
      <p class="hero__lede">Uresco supplies lumber and complete building packages, down the road or across an ocean.<span class="hero__more"> Name the place to see which yard to call and how freight typically gets there.</span></p>
      ${dial(ctx)}`,
  })}
</section>

<section class="section section--first" id="yards">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Three yards, one team', title: 'Call the yard <em>nearest the job.</em>', lede: 'Any of the three can help. Kent covers Puget Sound and the Pacific Northwest, Anchorage covers Southcentral and remote Alaska, and Fairbanks covers the Interior and points north.', action: html`<a class="link" href="${ctx.u('accounts/')}">Open a contractor account ${icon('arrow', { size: 16 })}</a>` })}
    <div class="ycards">${LOCATIONS.map((l) => yardCard(ctx, l, { compact: true, contact: true }))}</div>
  </div>
</section>

<section class="section about">
  <div class="wrap">
    <div class="about__lead">
      <p class="statement reveal">For more than ${SITE.years} years, Uresco has supplied the people who build Alaska and the Pacific Northwest. <span>A knowledgeable sales staff, and a specialty in remote-location&nbsp;delivery.</span></p>
      <div class="about__own">
        <figure class="own reveal"><div class="frame">${picture(ctx, 'uresco-yard', { sizes: '(min-width: 1000px) 208px, 44vw' })}</div><figcaption>A Uresco yard</figcaption></figure>
        <figure class="own reveal"><div class="frame">${picture(ctx, 'uresco-truck', { sizes: '(min-width: 1000px) 208px, 44vw' })}</div><figcaption>The tag on a Uresco load</figcaption></figure>
      </div>
    </div>
    <dl class="stats">
      <div class="reveal"><dt>${SITE.years}+</dt><dd>years supplying institutional, commercial and residential builders</dd></div>
      <div class="reveal"><dt>3</dt><dd>distribution centers: Kent, Anchorage and Fairbanks</dd></div>
      <div class="reveal"><dt>Sitka <span>→</span> Utqiaġvik</dt><dd>remote-location delivery anywhere in Alaska</dd></div>
      <div class="reveal"><dt>One of the largest</dt><dd>independent building material suppliers serving Alaska and the Pacific Northwest</dd></div>
    </dl>
  </div>
</section>

<section class="section lines" data-lines>
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Product lines', title: 'The whole load, <em>from one supplier.</em>', lede: 'A wholesale dealer’s full line, from framing packages to the last box of fasteners.', action: html`<a class="link" href="${ctx.u('products/')}">All products ${icon('arrow', { size: 16 })}</a>` })}
    <div class="lines__grid">
      <ol class="lines__list">
        ${CATEGORIES.map((c, i) => html`<li class="rowcard"><a class="line" href="${ctx.u('products/' + c.slug + '/')}" data-line="${i}">
          <span class="line__no" aria-hidden="true">0${i + 1}</span>
          ${glyph(c.slug, 'line__glyph')}
          <span class="line__text"><b class="line__name">${c.name}</b><small class="line__items">${itemsLine(c)}</small></span>
          <span class="line__go go">${icon('arrow', { size: 18 })}</span>
        </a><a class="btn btn--line btn--sm line__add" href="${ctx.u('quote/')}?product=${encodeURIComponent(c.name)}">${icon('plus', { size: 15 })}<span class="line__add-long">Quote this line</span><span class="line__add-short" aria-hidden="true">Quote</span><span class="sr-only">: ${c.name}</span></a></li>`)}
      </ol>
      <div class="lines__preview" aria-hidden="true">
        ${CATEGORIES.map((c, i) => html`<figure class="lines__shot frame${i === 0 ? ' is-ready is-on' : ''}" data-shot="${i}">
          ${picture(ctx, c.photo, { sizes: '(min-width: 1000px) 44vw, 1px', alt: '' })}
          <figcaption><b>${c.short}</b><span>${c.lede}</span></figcaption>
        </figure>`)}
      </div>
    </div>
    <div class="lines__foot">
      <p><b>Not on the list?</b> We also carry a large variety of other building materials. Ask your yard.</p>
      <ul class="brands" aria-label="Brands we carry">${BRANDS.map((b) => html`<li>${b}</li>`)}</ul>
    </div>
  </div>
</section>

<section class="section section--ice">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'From plans to site', title: 'How a building package <em>travels.</em>', lede: 'Five steps, from plans to site. Use the ones your job needs.' })}
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
    <p class="frame__cap">A tug and freight barge${photoCredit('tug-barge')}</p>
  </div>
</section>

<section class="section sectors">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Who we supply', title: 'Institutional. Commercial. <em>Residential.</em>', lede: 'From schools and multifamily framing to custom homes and housing packages for communities off the road system.', action: html`<a class="link" href="${ctx.u('projects/')}">See the kinds of work ${icon('arrow', { size: 16 })}</a>` })}
  </div>
  <div class="sectors__rail" role="group" aria-label="Kinds of work" tabindex="0">
    ${SECTORS.map((p) => html`
      <a class="scard reveal" href="${ctx.u('projects/')}#${sectorId(p.sector)}">
        <div class="scard__media frame">
          ${picture(ctx, p.photo, { sizes: '(min-width: 1000px) 24vw, 300px', alt: '' })}
          <span class="chip chip--glass">${p.sector}</span>
          <div class="glass glass--over">
            <p class="glass__lab">Often needed for this work</p>
            <ul>${p.materials.map((m) => html`<li>${m}</li>`)}</ul>
          </div>
        </div>
        <b class="scard__title">${p.title}</b>
        <span class="scard__text">${p.scope}</span>
      </a>`)}
  </div>
  <div class="wrap"><p class="sectors__note">Stock photographs of the kinds of work we supply, not Uresco jobs.</p></div>
</section>

<section class="closing">
  <div class="wrap closing__grid">
    <div class="cta__card closing__quote">
      <div class="cta__copy">
        ${eyebrow('Estimates & take-offs')}
        <h2 class="h2">Send plans. <em>We help with the take-off.</em></h2>
        <p>Send drawings or a materials list. We help with the take-off and the estimate, and we will quote the package and work out the freight with you.</p>
        <div class="actions">
          <a class="btn btn--lg" href="${ctx.u('quote/')}">Request a quote ${icon('arrow', { size: 18 })}</a>
          <a class="btn btn--lg btn--glass" href="${ctx.u('quote/#plans')}">${icon('upload', { size: 18 })} Send plans</a>
        </div>
      </div>
      ${takeoffSheet()}
    </div>
    <div class="closing__account">
      ${eyebrow('Contractor accounts')}
      <h2 class="h3">Buying for a crew? Open an account.</h2>
      <p>Fill in the application, or ask your yard.</p>
      <a class="btn btn--dark" href="${ctx.u('accounts/')}">Open an account ${icon('arrow', { size: 18 })}</a>
    </div>
  </div>
</section>
`,
  }),
};
