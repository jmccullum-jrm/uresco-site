import { html, raw } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';
import { layout, orgJsonLd } from '../lib/layout.mjs';
import { win, winImg, winPreload, rings, eyebrow, sticker, seal, sectionHead, marquee, quoteBand, yardCard, deliveryMap, yardsStrip, lineIndex, MAP_TOWNS } from '../lib/components.mjs';
import { BRANDS } from '../data/products.mjs';
import { SERVICES } from '../data/services.mjs';
import { PROJECTS } from '../data/projects.mjs';
import { LOCATIONS } from '../data/locations.mjs';
import { SITE } from '../config.mjs';

// The hero says how the lumber travels. Each word brings its own photograph into the U;
// the last word is the name on the trucks, and the window fills with the mark.
const HERO_SIZES = '(min-width: 1900px) 515px, (min-width: 1500px) 440px, (min-width: 760px) 31vw, 70vw';
const SLIDES = [
  { word: 'Truck.', photo: 'hero-truck-denali' },
  { word: 'Barge.', photo: 'tug-barge' },
  { word: 'Air.', photo: 'floatplane' },
  { word: 'UCM.', photo: null },
];

// The last slide: the mark itself, drawn to the window's proportions so its rings line up
// with the rings outside the window.
const HERO_MARK = html`<span class="hero__mark"><svg viewBox="0 0 400 470" preserveAspectRatio="none" focusable="false"><g fill="none" stroke="#0E0E0C" stroke-width="36">${[42, 106, 170].map((r) => raw(`<path d="M${200 - r} -20V270A${r} ${r} 0 0 0 ${200 + r} 270V-20"/>`))}</g></svg></span>`;

// Every place named on the delivery map, yards first: the marquee's whole vocabulary.
const PLACES = ['Kent', 'Anchorage', 'Fairbanks', ...['sitka', 'juneau', 'ketchikan', 'kodiak', 'bethel', 'nome', 'kotzebue', 'utqiagvik'].map((id) => MAP_TOWNS.find((t) => t.id === id).name)];

const SECTORS = [
  { tag: 'Remote Alaska', project: 0 },
  { tag: 'Institutional', project: 1 },
  { tag: 'Commercial', project: 2 },
  { tag: 'Residential', project: 4 },
];

const WHICH = { kent: 'Puget Sound and the Northwest', anchorage: 'Southcentral and remote Alaska', fairbanks: 'The Interior and points north' };

export default {
  path: '',
  render: (ctx) => layout(ctx, {
    title: 'Lumber & building materials for Alaska and the Pacific Northwest',
    description: 'Uresco Construction Materials supplies lumber, engineered wood, siding and complete building packages from Kent, Anchorage and Fairbanks, with job-site delivery and remote shipping anywhere in Alaska.',
    preload: [winPreload(ctx, 'hero-truck-denali', HERO_SIZES)],
    jsonLd: orgJsonLd(ctx),
    body: html`
<section class="hero field-y" data-hero>
  <div class="wrap hero__grid">
    <p class="hero__kicker eyebrow"><span class="hero__kicker-co">${SITE.name} <span aria-hidden="true">/</span></span> ${SITE.tagline}</p>
    <h1 class="hero__title">
      <span class="sr-only">Lumber by truck, by barge and by air. Lumber by UCM.</span>
      <span class="hero__line" aria-hidden="true"><span class="hero__w">Lumber</span> <span class="hero__w hero__by">by</span></span>
      <span class="hero__line hero__swap" aria-hidden="true" data-swap>${SLIDES.map((s, i) => html`<span${i === 0 ? html` class="is-on"` : ''}>${s.word}</span>`)}</span>
    </h1>
    <div class="hero__art">
      ${rings(4)}
      <i class="rings__ripple" aria-hidden="true"></i>
      <div class="win win--u hero__media" data-slides>
        ${SLIDES.map((s, i) => (s.photo
          ? winImg(ctx, s.photo, { sizes: HERO_SIZES, eager: i === 0, deferred: i > 0, cls: i === 0 ? 'is-on' : '', alt: i === 0 ? undefined : '' })
          : HERO_MARK))}
      </div>
      ${seal(ctx, { around: 'Quality materials • Trusted service •', big: SITE.years + '+', small: 'years', cls: 'hero__seal' })}
      <button type="button" class="motion-toggle motion-toggle--icon" data-motion-toggle><span class="sr-only">Pause motion</span></button>
    </div>
    <div class="hero__copy">
      <p class="hero__lede">Lumber, engineered wood, siding and complete building packages from three yards, delivered to job sites down the road or across an ocean.</p>
      ${yardsStrip(ctx)}
      <div class="hero__cta">
        <a class="btn" href="${ctx.u('quote/')}">Request a quote ${icon('arrow', { size: 18 })}</a>
        <a class="btn btn--line" href="${ctx.u('quote/#plans')}">${icon('upload', { size: 18 })} Send plans</a>
      </div>
    </div>
  </div>
</section>

${marquee(PLACES, { tone: 'k', tilt: true })}

<section class="section field-p about">
  <div class="wrap about__grid">
    <div class="about__say">
      ${eyebrow('Who we are')}
      <p class="about__big">For more than ${SITE.years} years, Uresco has been a trusted source ${win(ctx, 'lumber-stack', { tag: 'span', shape: 'pill', cls: 'chip-win', thumb: true, alt: '' })} for quality building materials throughout the Pacific Northwest ${win(ctx, 'rainier-tacoma', { tag: 'span', shape: 'pill', cls: 'chip-win', thumb: true, alt: '' })} and all of <span class="nw">Alaska ${win(ctx, 'chugach', { tag: 'span', shape: 'pill', cls: 'chip-win', thumb: true, alt: '' })}.</span></p>
    </div>
    <div class="about__aside">
      <figure class="tagshot" style="--rot:4deg" data-reveal="pop">
        <span class="win win--card tagshot__win">${winImg(ctx, 'uresco-truck', { sizes: '230px', alt: 'Plywood on a Uresco truck with a tag that reads “Lumber by UCM Uresco Construction Materials, Inc.”' })}</span>
        <figcaption>The tag on a Uresco load</figcaption>
      </figure>
      <p class="lede">One of the largest independent building material suppliers serving Alaska and the Pacific Northwest: a wholesale dealer for institutional, commercial and residential builders.</p>
      <a class="link" href="${ctx.u('about/')}">About Uresco ${icon('arrow', { size: 16 })}</a>
    </div>
  </div>
  <div class="wrap">
    <ul class="proof">
      <li class="proof__item proof__item--circle" style="--rot:-5deg" data-reveal="pop"><b>${SITE.years}+</b><span>years supplying builders</span></li>
      <li class="proof__item proof__item--u" style="--rot:3deg;--i:1" data-reveal="pop"><b>3</b><span>yards: Kent, Anchorage, Fairbanks</span></li>
      <li class="proof__item proof__item--arch" style="--rot:-2deg;--i:2" data-reveal="pop"><b>9</b><span>product lines, quoted as one load</span></li>
      <li class="proof__item proof__item--tile" style="--rot:4deg;--i:3" data-reveal="pop"><b>71° N</b><span>delivery as far as Utqiaġvik, anywhere in Alaska</span></li>
    </ul>
  </div>
</section>

<section class="section field-y products" id="products">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Products', title: 'Nine lines. <em>One load.</em>', lede: 'A wholesale dealer’s full line, from framing packages to the last box of fasteners.', action: html`<a class="link" href="${ctx.u('products/')}">All products ${icon('arrow', { size: 16 })}</a>` })}
  </div>
  ${lineIndex(ctx)}
  <div class="wrap products__foot">
    <a class="askrow" href="${ctx.u('quote/')}">
      <span class="askrow__q">Don’t see it listed?</span>
      <span class="askrow__a">We carry plenty more: tarps, poly, caulking, adhesives, house wraps. Ask your yard.</span>
      <span class="line__go">${icon('arrow', { size: 22 })}</span>
    </a>
    <div class="brands">
      <span class="brands__label">Brands we carry</span>
      <ul>${BRANDS.map((b, i) => html`<li>${sticker(b, { rot: [-3, 2, -1, 3, -2][i % 5], reveal: false })}</li>`)}</ul>
    </div>
  </div>
</section>

<section class="section field-k reach clip">
  <div class="divider divider--u" aria-hidden="true"><i class="plx"></i><i class="plx"></i><i class="plx"></i></div>
  <div class="wrap reach__grid">
    <div class="reach__copy">
      ${eyebrow('Remote & export delivery')}
      <h2 class="d2 reach__title">Down the road. <em>Across an ocean.</em></h2>
      <p class="lede">We specialize in getting materials to places without a lumber yard: shipping coordination, dock delivery and rural Alaska delivery, from Sitka to Utqiaġvik.</p>
      <ol class="hops">
        <li><span><b>Send plans or a list.</b> We build the take-off and quote it.</span></li>
        <li><span><b>We package it.</b> Sorted, crated and wrapped for the trip.</span></li>
        <li><span><b>We coordinate the freight.</b> Truck, ocean freight, barge or air.</span></li>
        <li><span><b>It lands where you build.</b> At the dock or on the site.</span></li>
      </ol>
      <div class="actions"><a class="btn" href="${ctx.u('alaska/')}">How remote delivery works ${icon('arrow', { size: 18 })}</a></div>
    </div>
    <div class="reach__map">
      ${deliveryMap(ctx, { compact: true })}
      ${sticker(raw('Sitka <span aria-hidden="true">→</span><span class="sr-only">to</span> Utqiaġvik'), { tone: 'y', rot: -7, cls: 'reach__sticker' })}
    </div>
  </div>
</section>

<section class="section field-p services">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Services', title: 'We do <em>the hard part.</em>', lede: 'Estimators, designers and drivers who know what it takes to get a building package right the first time.', action: html`<a class="link" href="${ctx.u('services/')}">All services ${icon('arrow', { size: 16 })}</a>` })}
    <ul class="svcs">
      ${SERVICES.map((s, i) => html`<li style="--i:${i % 3}" data-reveal><a class="svc" href="${ctx.u('services/')}#${s.id}">
        <span class="svc__icon">${icon(s.icon, { size: 30 })}</span>
        <span class="svc__no nums" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
        <b class="svc__name">${s.name}</b>
        <span class="svc__text">${s.short}</span>
      </a></li>`)}
    </ul>
  </div>
</section>

${marquee(['Lumber', 'Timbers', 'Plywood', 'OSB', 'I-joists', 'Glulam', 'LVL', 'Cedar', 'Siding', 'Insulation', 'Drywall', 'Hardware'], { tone: 'y', tilt: true, slow: true })}

<section class="section field-k sectors clip">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Who we build for', title: 'Schools. Homes. <em>Whole villages.</em>', lede: 'Institutional, commercial and residential builders, and communities off the road system.', action: html`<a class="link" href="${ctx.u('projects/')}">See project types ${icon('arrow', { size: 16 })}</a>` })}
    <ul class="arcade">
      ${SECTORS.map((s, i) => { const p = PROJECTS[s.project]; return html`<li style="--i:${i}" data-reveal>
        <a class="arc" href="${ctx.u('projects/')}">
          ${win(ctx, p.photo, { tag: 'span', shape: 'arch', duo: true, cls: 'arc__win', sizes: '(min-width: 1000px) 22vw, (min-width: 600px) 44vw, 62vw', alt: '' })}
          <span class="arc__tag">${s.tag}</span>
          <b class="arc__title">${p.title}</b>
          <span class="arc__text">${p.scope}</span>
        </a></li>`; })}
    </ul>
  </div>
</section>

${quoteBand(ctx)}

<section class="section field-p yardsec" id="yards">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Locations', title: 'Three yards. <em>One team.</em>', lede: 'Call the yard nearest your project, or any of them. They work as one.', action: html`<a class="link" href="${ctx.u('locations/')}">Faxes, emails &amp; details ${icon('arrow', { size: 16 })}</a>` })}
    <div class="yards">${LOCATIONS.map((l) => yardCard(ctx, { ...l, region: WHICH[l.id] }, { compact: true }))}</div>
    <a class="ticket" href="${ctx.u('accounts/')}" data-reveal>
      <span class="ticket__k">Contractor accounts</span>
      <span class="ticket__t">Buying for a crew? Open an account.</span>
      <span class="ticket__d">Order on account from any of the three yards. Apply online.</span>
      <span class="line__go">${icon('arrow', { size: 22 })}</span>
    </a>
  </div>
</section>
`,
  }),
};
