import { html, raw } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';
import { layout, orgJsonLd } from '../lib/layout.mjs';
import { picture, preloadFor, photo, figure, chapterHead, sectionHead, manifest, steps, yardSpread, routePlate, yardsStrip, openStatus, deg, latOf, LAT } from '../lib/components.mjs';
import { CATEGORIES, BRANDS } from '../data/products.mjs';
import { SERVICES } from '../data/services.mjs';
import { PROJECTS } from '../data/projects.mjs';
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
const two = (n) => String(n).padStart(2, '0');
const BLANK = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
// Who to call for what, from the yards' own guidance.
const CALL_FOR = { kent: 'Puget Sound and the Pacific Northwest', anchorage: 'Southcentral Alaska, or any remote site', fairbanks: 'The Interior and points north' };
const SECTORS = ['Remote Alaska', 'Institutional', 'Commercial', 'Residential'].map((s) => PROJECTS.find((p) => p.sector === s));

// One picture in the stock list's frame. Only the first is fetched with the page.
const stockImg = (ctx, c, i) => {
  const p = photo(c.photo);
  const set = p.widths.filter((w) => w <= 1280).map((w) => `${ctx.u(`assets/img/${c.photo}-${w}.webp`)} ${w}w`).join(', ');
  const src = ctx.u(`assets/img/${c.photo}-${p.widths.find((w) => w >= 800) || p.widths[p.widths.length - 1]}.webp`);
  const pos = p.focal ? ` style="object-position:${p.focal}"` : '';
  return i === 0
    ? html`<img class="is-on" src="${src}" srcset="${set}" sizes="(min-width: 1000px) 36vw, 1px" width="${p.width}" height="${p.height}" alt="" loading="lazy" decoding="async"${raw(pos)}>`
    : html`<img src="${BLANK}" data-src="${src}" data-srcset="${set}" sizes="(min-width: 1000px) 36vw, 1px" width="${p.width}" height="${p.height}" alt="" decoding="async"${raw(pos)}>`;
};

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
      <p class="lede cover__lede">Lumber, engineered wood and complete building packages, delivered across the Pacific Northwest and anywhere in Alaska. For more than ${SITE.years} years.</p>
      <div class="actions cover__actions">
        <a class="btn" href="${ctx.u('quote/')}">Request a quote ${icon('arrow', { size: 18 })}</a>
        <a class="btn btn--line" href="${ctx.u('quote/#plans')}">${icon('upload', { size: 18 })} Send plans</a>
      </div>
    </div>
    <figure class="cover__media hero__media">
      ${picture(ctx, 'valdez-pier', { eager: true, art: true, ...COVER, pos: '58% 72%' })}
      <figcaption class="cover__cap"><span>A working pier under fog and new snow.</span> <span class="fig__place">Valdez, Alaska · ${deg(LAT.valdez)}</span></figcaption>
    </figure>
  </div>
  <div class="cover__strip">${yardsStrip(ctx)}</div>
</section>

<section class="prologue">
  <div class="wrap prologue__grid">
    <div class="prologue__side">
      <p class="label">The route</p>
      <p class="prologue__span" aria-hidden="true"><span>${deg(LAT.kent)}</span><i></i><span>${deg(LAT.utqiagvik)}</span></p>
      <a class="link prologue__go" href="#kent">Follow a load north ${icon('arrow', { size: 16, cls: 'i--down' })}</a>
    </div>
    <p class="prologue__text rv">Some of what we sell crosses town on a boom truck. Some of it is crated, trucked to a dock, shipped across the Gulf of Alaska and barged to a beach with no road behind it. Either way it starts in the same place: <em>a list, a yard, and people who know the way.</em></p>
    <dl class="facts">
      <div class="rv"><dt>${SITE.years}+</dt><dd>years as a source for quality building materials in Alaska and the Pacific Northwest</dd></div>
      <div class="rv" style="--i:1"><dt>3</dt><dd>distribution centers: Kent, Anchorage and Fairbanks</dd></div>
      <div class="rv" style="--i:2"><dt><em>Anywhere</em></dt><dd>in Alaska: delivery is available from Sitka to Utqiaġvik</dd></div>
      <div class="rv" style="--i:3"><dt><em>Independent</em></dt><dd>one of the largest independent building material suppliers in the region</dd></div>
    </dl>
  </div>
</section>

<section class="chapter chapter--kent" id="kent" data-lat="${LAT.kent}" data-place="Kent" aria-labelledby="kent-title">
  <div class="wrap">
    ${chapterHead({ no: '01', kicker: 'Kent, Washington', lat: LAT.kent, tag: 'Departing', id: 'kent-title', title: 'Every load starts <em>in the yard.</em>', lede: 'Kent is headquarters and our Pacific Northwest distribution center: a wholesale dealer’s full line, from framing packages to the last box of fasteners.' })}
  </div>
  ${figure(ctx, 'lumber-stickered', { ratio: 'cine', cls: 'fig--bleed', parallax: true, art: true, caption: 'Rough-sawn boards, stacked and stickered.', pos: '50% 45%' })}
  <div class="wrap">
    <div class="kent">
      <div class="kent__copy">
        <h3 class="h3 rv">Around Puget Sound, we bring it <em>to the site.</em></h3>
        <p class="rv" style="--i:1">Job-site delivery goes out on boom trucks and truck-mounted Moffett forklifts, so a load is set where the crew needs it, not left at the curb.</p>
        <p class="rv" style="--i:2">Institutional, commercial and residential builders call Kent for one load or for a whole project.</p>
        <div class="actions rv" style="--i:3">
          <a class="btn btn--line" href="${tel(byId('kent').phone)}">${icon('phone', { size: 18 })} Kent ${byId('kent').phone}</a>
          <a class="link" href="${ctx.u('pacific-northwest/')}">The Kent yard ${icon('arrow', { size: 16 })}</a>
        </div>
      </div>
      <div class="kent__prints">
        ${figure(ctx, 'forklift-yard', { ratio: 'port', sizes: '(min-width: 1000px) 30vw, 62vw', caption: 'A forklift in a building-supply yard.', cls: 'kent__main' })}
        <figure class="print rv" style="--i:2">
          ${picture(ctx, 'uresco-truck', { sizes: '(min-width: 1000px) 190px, 40vw' })}
          <figcaption>From the Uresco archive: a truck lettered “Lumber by UCM Uresco”.</figcaption>
        </figure>
      </div>
    </div>

    <div class="stockhead">
      <h3 class="h2 rv">What’s <em>in the yard.</em></h3>
      <p class="rv" style="--i:1">Nine product lines. Stock varies by yard, so call for what is on the ground today.</p>
    </div>
    <div class="stock" data-stock>
      <div class="stock__view" aria-hidden="true">
        <div class="stock__frame">${CATEGORIES.map((c, i) => stockImg(ctx, c, i))}</div>
        <p class="fig__cap"><span>Point at a line to see it.</span></p>
      </div>
      <ol class="stock__list">
        ${CATEGORIES.map((c, i) => html`<li><a class="stock__row${i === 0 ? ' is-on' : ''}" href="${ctx.u('products/' + c.slug + '/')}">
          <span class="stock__no">${two(i + 1)}</span>
          <img class="stock__thumb" src="${ctx.u(`assets/img/${c.photo}-240.webp`)}" width="60" height="60" alt="" loading="lazy" decoding="async">
          <span class="stock__text"><span class="stock__name">${c.name}</span><span class="stock__items">${c.items.map(([n]) => n).join(' · ')}</span></span>
          ${icon('arrow', { size: 20, cls: 'stock__go' })}
        </a></li>`)}
      </ol>
    </div>
    <div class="brandline">
      <p class="label">Brands we carry</p>
      <ul>${BRANDS.map((b) => html`<li>${b}</li>`)}</ul>
    </div>
    <p class="stocknote">Also on hand: tarps, polyurethane rolls, caulking, adhesives, house wraps and more. <a href="${ctx.u('products/')}">See all products</a>, or ask your yard.</p>
  </div>
</section>

<section class="chapter chapter--crossing section--deep" id="crossing" data-lat="${LAT.kent}" data-lat-to="${LAT.anchorage}" data-place="At sea" data-place-end="Anchorage" aria-labelledby="crossing-title">
  <div class="wrap">
    ${chapterHead({ no: '02', kicker: 'The crossing', lat: LAT.kent, to: LAT.anchorage, id: 'crossing-title', title: 'Packed once, <em>for the whole trip.</em>', lede: 'A building bound for a place with no lumber yard cannot be one box of hangers short. So a remote package is planned from the far end back.' })}
  </div>
  ${figure(ctx, 'tug-barge', { ratio: 'cine', cls: 'fig--bleed', parallax: true, caption: 'A tug and a loaded barge under way.', pos: '50% 62%' })}
  <div class="wrap">
    ${steps([
      ['Plans in, take-off out', 'Send drawings or a list. We build the take-off, check it for gaps and price it delivered.'],
      ['Pulled and packaged', 'The complete package is assembled, then crated, banded and wrapped for the trip and every handoff on it.'],
      ['Freight, coordinated', 'Truck, ocean freight, barge or air. We work with you on the shipping, against your schedule and the season.'],
      ['Dock or site', 'Delivered to the dock, or straight to where you build.'],
    ])}
    <div class="crossing__mid">
      <div class="crossing__lead">
        <p class="pull rv">One complete package beats <em>a second freight bill.</em></p>
        <figure class="print print--inline rv" style="--i:2">
          ${picture(ctx, 'uresco-yard', { sizes: '200px' })}
          <figcaption>From the Uresco archive: bundles staged in the yard.</figcaption>
        </figure>
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
    ${chapterHead({ no: '03', kicker: 'Landfall', lat: LAT.anchorage, to: LAT.fairbanks, id: 'landfall-title', title: 'Two yards <em>on the road system.</em>', lede: 'Our Alaska distribution centers carry a full range of products and services for commercial and residential builders. Jobs on the road system are reached by truck from Anchorage and Fairbanks.' })}
    ${yardSpread(ctx, byId('anchorage'), { photoKey: 'anchorage', caption: 'The city under the Chugach Mountains, across the inlet ice.', place: 'Anchorage', pos: '72% 50%', attrs: html` data-lat="${LAT.anchorage}" data-place="Anchorage"` })}
    ${yardSpread(ctx, byId('fairbanks'), { photoKey: 'winter-road', caption: 'A winter highway through the spruce.', place: 'Near Fairbanks', flip: true, pos: '52% 70%', attrs: html` data-lat="${LAT.fairbanks}" data-place="Fairbanks"` })}
  </div>
</section>

<section class="chapter chapter--last section--ice" id="last-mile" data-lat="${LAT.fairbanks}" data-lat-to="${LAT.utqiagvik}" data-place="The Bush" data-place-end="Utqiaġvik" aria-labelledby="last-title">
  <div class="wrap">
    ${chapterHead({ no: '04', kicker: 'The last mile', lat: LAT.fairbanks, to: LAT.utqiagvik, id: 'last-title', title: 'Past the end <em>of the road.</em>', lede: 'Much of Alaska has no road in. Freight arrives by barge in the ice-free season and by air all year, and Southeast is reached by sea. Remote delivery is what we specialize in.' })}
    ${routePlate(ctx)}
    <div class="last__close">
      <p class="last__line rv">Delivery is available anywhere in Alaska, <em>from Sitka to Utqiaġvik.</em></p>
      <div class="last__side rv" style="--i:1">
        <p>We work with you on every part of getting it there: shipping coordination, dock delivery and rural Alaska delivery, with remote-location and export building packages a specialty.</p>
        <div class="actions">
          <a class="btn" href="${ctx.u('alaska/')}">How remote delivery works ${icon('arrow', { size: 18 })}</a>
          <a class="btn btn--line" href="${ctx.u('quote/')}">Quote a remote job</a>
        </div>
      </div>
    </div>
  </div>
  ${figure(ctx, 'remote-village', { ratio: 'cine', cls: 'fig--bleed last__photo', parallax: true, art: true, caption: 'Snow-drifted buildings and a beached boat on the Arctic coast.', place: 'Utqiaġvik', lat: LAT.utqiagvik, pos: '45% 58%' })}
</section>

<section class="section coda" data-lat="${LAT.utqiagvik}" data-place="Utqiaġvik">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Who we build for', title: 'Institutional. Commercial. <em>Residential.</em>', lede: 'From schools and multifamily framing to custom homes and whole packages for communities off the road system.', action: html`<a class="link" href="${ctx.u('projects/')}">See the kinds of work ${icon('arrow', { size: 16 })}</a>` })}
    <ul class="sectors">
      ${SECTORS.map((p, i) => html`<li class="rv" style="--i:${i}"><a class="sector" href="${ctx.u('projects/')}">
        <span class="sector__media">${picture(ctx, p.sector === 'Remote Alaska' ? 'floatplane' : p.photo, { sizes: '(min-width: 1000px) 22vw, 46vw', alt: '' })}</span>
        <span class="label">${p.sector}</span>
        <span class="sector__title">${p.title}</span>
        <span class="sector__text">${p.scope}</span>
      </a></li>`)}
    </ul>

    <div class="account rv">
      <div>
        <p class="label">Contractor accounts</p>
        <h2 class="h2">Buying for a crew? <em>Open an account.</em></h2>
      </div>
      <div class="account__side">
        <p>Order on account from any of our three yards, with job accounts and authorized buyers. The application takes about ten minutes online.</p>
        <a class="btn btn--dark" href="${ctx.u('accounts/')}">Apply for an account ${icon('arrow', { size: 18 })}</a>
      </div>
    </div>
  </div>
</section>

<section class="section directory section--paper2" id="yards" aria-labelledby="yards-title">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Call a yard', id: 'yards-title', title: 'Three yards. <em>One team.</em>', lede: 'Call the yard nearest your project, or any of them. Our friendly, knowledgeable sales staff is here to help.', action: html`<a class="link" href="${ctx.u('locations/')}">Faxes, hours and details ${icon('arrow', { size: 16 })}</a>` })}
    <ul class="dir">
      ${LOCATIONS.map((l, i) => html`<li class="dir__yard rv" style="--i:${i}">
        <p class="label">${deg(latOf(l))}</p>
        <h3 class="dir__city">${l.city}<span>, ${l.state}</span></h3>
        <p class="dir__for"><span class="label">Call for</span> ${CALL_FOR[l.id]}</p>
        <a class="dir__tel" href="${tel(l.phone)}">${l.phone}</a>
        <p class="dir__meta">${l.street}, ${l.city}, ${l.state} ${l.zip} ${openStatus(l)}</p>
        <p class="dir__links"><a href="${mapsUrl(l)}" target="_blank" rel="noopener">Directions</a><a href="mailto:${l.email}">${l.email}</a></p>
      </li>`)}
    </ul>
  </div>
</section>
`,
  }),
};
