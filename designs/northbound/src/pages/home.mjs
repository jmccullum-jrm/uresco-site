import { html } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';
import { layout, orgJsonLd } from '../lib/layout.mjs';
import { picture, preloadFor, photo, figure, chapterHead, sectionHead, manifest, steps, yardSpread, routePlate, yardsStrip, stockFrame, stockList, openStatus, deg, latOf, LAT } from '../lib/components.mjs';
import { BRANDS } from '../data/products.mjs';
import { SERVICES } from '../data/services.mjs';
import { PROJECTS, SECTOR_NOTES } from '../data/projects.mjs';
import { LOCATIONS, byId, tel, mapsUrl } from '../data/locations.mjs';
import { SITE } from '../config.mjs';

// The home page is a trip north. Each chapter is a place on the way and what Uresco does there;
// data-lat on each section is what the latitude rail reads as the page scrolls.
const COVER = { sizes: '(min-width: 1000px) max(56vw, 118vh), 100vw', artSizes: '100vw' };
const STOPS = [
  { id: 'kent', lat: LAT.kent, name: 'Kent' },
  { id: 'anchorage', lat: LAT.anchorage, name: 'Anchorage' },
  { id: 'fairbanks', lat: LAT.fairbanks, name: 'Fairbanks' },
  { id: 'last-mile', lat: LAT.utqiagvik, name: 'Utqiaġvik' },
];
// Who to call for what, from the yards' own guidance.
const CALL_FOR = { kent: 'Puget Sound and the Pacific Northwest', anchorage: 'Southcentral Alaska, or any remote site', fairbanks: 'The Interior and points north' };
const SECTORS = ['Institutional', 'Commercial', 'Residential', 'Remote Alaska'].map((s) => PROJECTS.find((p) => p.sector === s));
const two = (n) => String(n).padStart(2, '0');

export default {
  path: '',
  render: (ctx) => layout(ctx, {
    title: 'Lumber & building materials for Alaska and the Pacific Northwest',
    description: 'Uresco Construction Materials supplies lumber, engineered wood, siding and complete building packages from Kent, Anchorage and Fairbanks, with job-site delivery and remote shipping anywhere in Alaska.',
    preload: preloadFor(ctx, 'valdez-pier', COVER),
    jsonLd: orgJsonLd(ctx),
    rail: STOPS,
    body: html`
<section class="cover" data-lat="${LAT.kent}" data-place="Kent">
  <div class="cover__top">
    <div class="cover__copy">
      <p class="label cover__kicker">Wholesale building materials <span>· Kent · Anchorage · Fairbanks</span></p>
      <h1 class="display cover__title"><span>Down the road,</span> <span>or <em>across</em></span> <span><em>an ocean.</em></span></h1>
      <div class="cover__calls">${yardsStrip(ctx)}</div>
      <p class="lede cover__lede">Lumber, engineered wood and complete building packages for builders across the Pacific Northwest and all of Alaska, for more than ${SITE.years} years.</p>
      <div class="actions cover__actions">
        <a class="btn" href="${ctx.u('quote/')}">Request a quote ${icon('arrow', { size: 18 })}</a>
        <a class="btn btn--line" href="${ctx.u('quote/#plans')}">${icon('upload', { size: 18 })} Send plans</a>
      </div>
      <nav class="cover__jump" aria-label="Shortcuts">
        <a href="#lines">Products</a>
        <a href="${ctx.u('alaska/')}">Alaska</a>
        <a href="#yards">Yards</a>
        <a href="${ctx.u('accounts/')}"><span>Open an </span>account</a>
      </nav>
    </div>
    <figure class="cover__media hero__media">
      ${picture(ctx, 'valdez-pier', { eager: true, art: true, ...COVER, pos: '58% 72%' })}
      <figcaption class="cover__cap"><span>A working pier under fog and new snow.</span> <span class="fig__place">Valdez, Alaska · ${deg(LAT.valdez)}</span> <span class="cover__credit">Photo: ${photo('valdez-pier').credit}</span></figcaption>
    </figure>
  </div>
  <div class="cover__strip">${yardsStrip(ctx)}</div>
</section>

<section class="prologue">
  <div class="wrap prologue__grid">
    <div class="prologue__side">
      <p class="label">The route</p>
      <p class="prologue__span" aria-hidden="true"><span>${deg(LAT.kent)}</span><i></i><span>${deg(LAT.utqiagvik)}</span></p>
      <a class="link prologue__go" href="#kent">Follow the route north ${icon('arrow', { size: 16, cls: 'i--down' })}</a>
    </div>
    <p class="prologue__text rv">Some of what we sell crosses town on a boom truck. Some of it is crated and shipped to a community with no road in. Either way it starts in the same place: <em>a list, a yard, and people who know the way.</em></p>
    <dl class="facts">
      <div class="rv"><dt>${SITE.years}<span class="facts__plus">+</span></dt><dd>years as a source for quality building materials in Alaska and the Pacific Northwest</dd></div>
      <div class="rv" style="--i:1"><dt>3</dt><dd>distribution centers: Kent, Anchorage and Fairbanks</dd></div>
      <div class="rv" style="--i:2"><dt><em>Anywhere</em></dt><dd>in Alaska: delivery is available from Sitka to Utqiaġvik</dd></div>
      <div class="rv" style="--i:3"><dt><em>Independent</em></dt><dd>one of the largest independent building material suppliers serving Alaska and the Pacific Northwest</dd></div>
    </dl>
  </div>
</section>

<section class="chapter chapter--kent" id="kent" data-lat="${LAT.kent}" data-place="Kent" aria-labelledby="kent-title">
  <div class="wrap">
    ${chapterHead({ no: '01', kicker: 'Kent, Washington', lat: LAT.kent, tag: 'Headquarters', id: 'kent-title', title: 'Headquarters, <em>in the Puget Sound region.</em>', lede: 'Kent is our headquarters and Pacific Northwest distribution center. Wholesale building materials, from framing lumber to fasteners.' })}
  </div>
  ${figure(ctx, 'lumber-stickered', { ratio: 'cine', cls: 'fig--bleed', parallax: true, art: true, caption: 'Rough-sawn boards, stacked and stickered.', pos: '50% 45%' })}
  <div class="wrap">
    <div class="kent">
      <div class="kent__copy">
        <h3 class="h3 rv">Around Puget Sound, we bring it <em>to the site.</em></h3>
        <p class="rv" style="--i:1">Job-site delivery goes out on boom trucks and truck-mounted Moffett forklifts.</p>
        <p class="rv" style="--i:2">Institutional, commercial and residential builders call Kent for one load or for a whole project.</p>
        <div class="actions rv" style="--i:3">
          <a class="btn btn--line" href="${tel(byId('kent').phone)}">${icon('phone', { size: 18 })} Kent ${byId('kent').phone}</a>
          <a class="link" href="${ctx.u('pacific-northwest/')}">Kent and the Pacific Northwest ${icon('arrow', { size: 16 })}</a>
        </div>
      </div>
      <div class="kent__prints">
        <figure class="print print--archive rv">
          ${picture(ctx, 'uresco-yard', { sizes: '(min-width: 1000px) 344px, 66vw' })}
          <figcaption>From the Uresco archive: wrapped bundles and a forklift in a Uresco yard.</figcaption>
        </figure>
        <figure class="print print--over rv" style="--i:2">
          ${picture(ctx, 'uresco-truck', { sizes: '(min-width: 1000px) 190px, 40vw' })}
          <figcaption>The tag on a Uresco load.</figcaption>
        </figure>
      </div>
    </div>

    <div class="stockhead" id="lines">
      <h3 class="h2 rv">What <em>we carry.</em></h3>
      <p class="rv" style="--i:1">Nine product lines. Call your yard for what is on the ground today.</p>
    </div>
    <div class="stock" data-stock>
      ${stockFrame(ctx)}
      ${stockList(ctx)}
    </div>
    <div class="brandline">
      <p class="label">Brands we carry</p>
      <ul>${BRANDS.map((b) => html`<li>${b}</li>`)}</ul>
    </div>
    <p class="stocknote">We also carry tarps, polyurethane rolls, caulking, adhesives, house wraps and more. <a href="${ctx.u('products/')}">See all products</a>, or ask your yard.</p>

    <div class="account rv">
      <div>
        <p class="label">Contractor accounts</p>
        <h3 class="h2">Buying for a crew? <em>Open an account.</em></h3>
      </div>
      <div class="account__side">
        <p>Apply online or print the form. For terms, ask your yard.</p>
        <a class="btn btn--dark" href="${ctx.u('accounts/')}">Apply for an account ${icon('arrow', { size: 18 })}</a>
      </div>
    </div>
  </div>
</section>

<section class="chapter chapter--crossing section--deep" id="crossing" data-lat="${LAT.kent}" data-lat-to="${LAT.anchorage}" data-place="At sea" data-place-end="Anchorage" aria-labelledby="crossing-title">
  <div class="wrap">
    ${chapterHead({ no: '02', kicker: 'The crossing', lat: LAT.kent, to: LAT.anchorage, id: 'crossing-title', title: 'Packed once, <em>for the whole trip.</em>', lede: 'A building bound for a place with no lumber yard cannot be one box of hangers short. Plan it as one complete package.' })}
  </div>
  ${figure(ctx, 'tug-barge', { ratio: 'cine', cls: 'fig--bleed', parallax: true, caption: 'A tug and a loaded barge under way.', pos: '50% 62%' })}
  <div class="wrap">
    ${steps([
      ['Plans in, take-off out', 'Send drawings or a list. We help with the take-off and give you an estimate.'],
      ['Pulled and packaged', 'We assemble the package, then crate and package it for the trip.'],
      ['Freight, coordinated', 'Truck, ocean freight, barge or air. We work with you on all aspects of shipping coordination.'],
      ['Dock or site', 'Delivered to the dock, or straight to where you build.'],
    ])}
    <div class="crossing__mid">
      <div class="crossing__lead">
        <p class="pull rv">One complete package beats <em>a second freight bill.</em></p>
      </div>
      <div class="svc">
        <p class="label">What we handle</p>
        <ul class="svc__list">
          ${SERVICES.map((s) => html`<li><a href="${ctx.u('services/')}#${s.id}">${icon(s.icon, { size: 22 })}<span><b>${s.name}</b><small>${s.short}</small></span>${icon('arrow', { size: 18, cls: 'svc__go' })}</a></li>`)}
        </ul>
      </div>
    </div>
    ${manifest(ctx)}
  </div>
</section>

<section class="chapter chapter--landfall" aria-labelledby="landfall-title">
  <div class="wrap">
    ${chapterHead({ no: '03', kicker: 'Landfall', lat: LAT.anchorage, to: LAT.fairbanks, id: 'landfall-title', title: 'Two yards <em>on the road system.</em>', lede: 'Our Alaska distribution centers supply commercial and residential builders. Jobs on the road system generally go by truck from Anchorage or Fairbanks.' })}
    ${yardSpread(ctx, byId('anchorage'), { photoKey: 'anchorage', caption: 'The city under the Chugach Mountains, across the inlet ice.', place: 'Anchorage', pos: '72% 50%', attrs: html` data-lat="${LAT.anchorage}" data-place="Anchorage"` })}
    ${yardSpread(ctx, byId('fairbanks'), { photoKey: 'fairbanks', caption: 'Green aurora over a snowbanked road and frosted birches.', place: 'Near Fairbanks', flip: true, pos: '50% 60%', attrs: html` data-lat="${LAT.fairbanks}" data-place="Fairbanks"` })}
  </div>
</section>

<section class="chapter chapter--last section--ice" id="last-mile" data-lat="${LAT.fairbanks}" data-lat-to="${LAT.utqiagvik}" data-place="Rural AK" data-place-end="Utqiaġvik" aria-labelledby="last-title">
  <div class="wrap">
    ${chapterHead({ no: '04', kicker: 'The last mile', lat: LAT.fairbanks, to: LAT.utqiagvik, id: 'last-title', title: 'Past the end <em>of the road.</em>', lede: 'Much of Alaska has no road in. Freight generally arrives by barge in the ice-free season and by air year-round, and Southeast is reached by sea. Remote delivery is what we specialize in.' })}
    ${routePlate(ctx)}
    <div class="last__close">
      <p class="last__line rv">Delivery is available anywhere in Alaska, <em>from Sitka to Utqiaġvik.</em></p>
      <div class="last__side rv" style="--i:1">
        <p>We can work with you on all aspects of shipping coordination, dock delivery and rural Alaska delivery. We are fully equipped to handle remote-location and export building packages.</p>
        <div class="actions">
          <a class="btn" href="${ctx.u('alaska/')}">How remote delivery works ${icon('arrow', { size: 18 })}</a>
          <a class="btn btn--line" href="${ctx.u('quote/')}?yard=anchorage&amp;delivery=remote">Quote a remote job</a>
        </div>
      </div>
    </div>
  </div>
  ${figure(ctx, 'remote-village', { ratio: 'cine', cls: 'fig--bleed last__photo', parallax: true, art: true, caption: 'Snow-drifted buildings and a beached boat on the Arctic coast.', place: 'Utqiaġvik', lat: LAT.utqiagvik, pos: '45% 58%' })}
</section>

<section class="section coda" data-lat="${LAT.utqiagvik}" data-place="Utqiaġvik">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Who we supply', title: 'Institutional. Commercial. <em>Residential.</em>', lede: 'From schools and multifamily framing to custom homes and whole packages for communities off the road system.', action: html`<a class="link" href="${ctx.u('projects/')}">See the work we supply ${icon('arrow', { size: 16 })}</a>` })}
    <ol class="sectors">
      ${SECTORS.map((p, i) => html`<li class="rv" style="--i:${i}"><a class="sector" href="${ctx.u('projects/')}#${SECTOR_NOTES[p.sector].id}">
        <span class="sector__no" aria-hidden="true">${two(i + 1)}</span>
        <span class="sector__name">${p.sector}</span>
        <span class="sector__body"><span class="sector__title">${p.title}</span><span class="sector__text">${p.scope}</span></span>
        ${icon('arrow', { size: 20, cls: 'sector__go' })}
      </a></li>`)}
    </ol>
  </div>
</section>

<section class="section directory section--paper2" id="yards" aria-labelledby="yards-title">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Call a yard', id: 'yards-title', title: 'Three yards. <em>One team.</em>', lede: 'Call the yard nearest your project, or any of them. Our friendly, knowledgeable sales staff is here to help.', action: html`<a class="link" href="${ctx.u('locations/')}">Fax, email and yard details ${icon('arrow', { size: 16 })}</a>` })}
    <ul class="dir">
      ${LOCATIONS.map((l, i) => html`<li class="dir__yard rv" style="--i:${i}">
        <p class="label">${deg(latOf(l))}</p>
        <h3 class="dir__city">${l.city}<span>, ${l.state}</span></h3>
        <p class="dir__for"><span class="label">Call for</span> ${CALL_FOR[l.id]}</p>
        <a class="dir__tel" href="${tel(l.phone)}">${l.phone}</a>
        <p class="dir__meta">${l.street}, ${l.city}, ${l.state} ${l.zip} ${openStatus(l, { short: true })}</p>
        <dl class="dir__lines">
          ${l.tollFree ? html`<div><dt>Toll-free</dt><dd><a href="${tel(l.tollFree)}">${l.tollFree}</a></dd></div>` : ''}
          <div><dt>Fax</dt><dd>${l.fax}</dd></div>
          <div><dt>Email</dt><dd><a href="mailto:${l.email}">${l.email}</a></dd></div>
        </dl>
        <p class="dir__links">
          <a href="${mapsUrl(l)}" target="_blank" rel="noopener">Directions<span class="sr-only"> to ${l.city}</span></a>
          <a href="${ctx.u('quote/')}?yard=${l.id}">Quote<span class="sr-only"> from ${l.city}</span></a>
          <a href="${ctx.u('locations/')}#${l.id}">Details<span class="sr-only"> for ${l.city}</span></a>
        </p>
      </li>`)}
    </ul>
    <p class="dir__foot"><span>Buying for a crew?</span> <a class="link" href="${ctx.u('accounts/')}">Open an account ${icon('arrow', { size: 16 })}</a></p>
  </div>
</section>
`,
  }),
};
