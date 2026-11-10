import { html, raw } from './html.mjs';
import { icon, mark } from './icons.mjs';
import { SITE } from '../config.mjs';
import { LOCATIONS, tel, mapsUrl } from '../data/locations.mjs';
import { openStatus, latOf, deg } from './components.mjs';
import { CATEGORIES } from '../data/products.mjs';

const NAV = [
  { href: 'products/', label: 'Products', menu: true },
  { href: 'services/', label: 'Services' },
  { href: 'alaska/', label: 'Alaska delivery' },
  { href: 'projects/', label: 'Projects' },
  { href: 'locations/', label: 'Locations' },
  { href: 'about/', label: 'About' },
];

// The mark stays; the wordmark is set in the display serif with a mono descriptor under it.
// `reading` puts the latitude reading in the descriptor's slot: on phones it takes over while the
// reader is inside a chapter of a journey page (modules/rail.js), and is hidden from wide screens up.
export const brand = (ctx, { cls = '', reading = null } = {}) => html`
  <a class="brand ${cls}" href="${ctx.u('')}">
    <span class="brand__mark">${mark({ id: 'mk' + ctx.uid() })}</span>
    <span class="brand__word"><span class="brand__name">Uresco</span> <span class="brand__desc">Construction Materials</span>${reading ? html`<span class="latchip" aria-hidden="true"><span data-read>${deg(reading.lat)}</span><span data-place>${reading.name}</span></span>` : ''}</span>
  </a>`;

const isCurrent = (ctx, href) => (href === '' ? ctx.path === '' : ctx.path.startsWith(href));
const two = (n) => String(n).padStart(2, '0');
const current = (ctx, href, exact = false) => raw((exact ? ctx.path === href : isCurrent(ctx, href)) ? ' aria-current="page"' : '');

// Quote links in the chrome carry what the visitor is looking at.
const quoteHref = (ctx) => {
  const base = ctx.u('quote/');
  const line = CATEGORIES.find((c) => ctx.path === `products/${c.slug}/`);
  if (line) return `${base}?product=${encodeURIComponent(line.name)}`;
  if (ctx.path === 'pacific-northwest/') return `${base}?yard=kent`;
  if (ctx.path === 'alaska/') return `${base}?yard=anchorage`;
  return base;
};

// Products menu: the nine lines as a numbered index. Opens on hover, or from the caret button
// (keyboard and touch); without JavaScript the Products link simply goes to the products page.
const mega = (ctx) => html`
  <div class="mega" id="mega" role="group" aria-label="Product lines">
    <div class="mega__inner">
      <div class="mega__lead">
        <p class="label">Products</p>
        <p class="mega__title">A wholesale dealer’s full line, from framing packages to the last box of fasteners.</p>
        <a class="link" href="${ctx.u('products/')}">All products ${icon('arrow', { size: 16 })}</a>
      </div>
      <ol class="mega__list">
        ${CATEGORIES.map((c, i) => html`<li><a href="${ctx.u('products/' + c.slug + '/')}">
          <img src="${ctx.u(`assets/img/${c.photo}-240.webp`)}" width="60" height="60" alt="" loading="lazy" decoding="async">
          <span class="mega__text"><span class="mega__name"><span class="mega__no">${two(i + 1)}</span>${c.short}</span>
          <span class="mega__items">${c.items.slice(0, 3).map(([n]) => n.replace(/[®™]/g, '')).join(' · ')}</span></span>
        </a></li>`)}
      </ol>
    </div>
  </div>`;

// The rail: a latitude scale fixed to the left edge on wide screens. site.js moves the needle as the
// page scrolls through sections that carry data-lat. Stops are links, so it also works as chapter
// navigation. Below 1200px it is replaced by the reading in the masthead (.latchip).
const RAIL = { lo: 46, hi: 72 };
const pos = (lat) => (((RAIL.hi - lat) / (RAIL.hi - RAIL.lo)) * 100).toFixed(2) + '%';
const rail = (ctx, stops) => html`
  <nav class="rail" aria-label="Chapters, by latitude" data-rail data-lo="${RAIL.lo}" data-hi="${RAIL.hi}">
    <span class="rail__n" aria-hidden="true">N</span>
    <div class="rail__track">
      <div class="rail__scale" aria-hidden="true">
        ${Array.from({ length: RAIL.hi - RAIL.lo + 1 }, (_, i) => RAIL.lo + i).map((d) => html`<i class="${d % 5 ? '' : 'is-major'}" style="top:${pos(d)}">${d % 5 ? '' : html`<b>${d}°</b>`}</i>`)}
      </div>
      <ol class="rail__stops">
        ${stops.map((s) => html`<li style="top:${pos(s.lat)}"><a href="#${s.id}" data-stop="${s.lat}"><span class="sr-only">${s.name}, ${deg(s.lat)}</span><span class="rail__tip" aria-hidden="true">${s.name} <span>${deg(s.lat)}</span></span></a></li>`)}
      </ol>
      <div class="rail__needle" data-needle aria-hidden="true"><span class="rail__read" data-read>${deg(stops[0].lat)}</span><span class="rail__place" data-place>${stops[0].name}</span></div>
    </div>
  </nav>`;

// The Products row of the phone menu. Native <details>, so the nine lines need no script of their own.
const drawerProducts = (ctx, n, i) => html`
  <li><details class="drawer__more"${raw(ctx.path.startsWith(n.href) ? ' open' : '')}>
    <summary><span class="drawer__no">${two(i + 1)}</span>${n.label}${icon('chevron-down', { size: 22, cls: 'drawer__caret' })}</summary>
    <ol class="drawer__lines">
      <li><a class="drawer__all" href="${ctx.u(n.href)}"${current(ctx, n.href, true)}>All products ${icon('arrow', { size: 16 })}</a></li>
      ${CATEGORIES.map((c, j) => html`<li><a href="${ctx.u('products/' + c.slug + '/')}"${current(ctx, 'products/' + c.slug + '/')}><span class="drawer__no">${two(j + 1)}</span>${c.short}</a></li>`)}
    </ol>
  </details></li>`;

// Dialog openers are links, so without JavaScript Call and Directions land on the yards and Menu
// on the footer index. 00-core.js opens the dialog instead when it can.
const header = (ctx) => html`
  <a class="skip" href="#main">Skip to content</a>
  <div class="dateline" role="region" aria-label="Call a yard">
    <ul class="dateline__yards">
      ${LOCATIONS.map((l) => html`<li><span class="dateline__lat">${deg(latOf(l))}</span><span class="dateline__city">${l.city}</span><a href="${tel(l.phone)}">${l.phone}</a>${openStatus(l, { short: true })}</li>`)}
    </ul>
    <div class="dateline__links">
      <a href="${ctx.u('accounts/')}">Open an account</a>
    </div>
  </div>
  <header class="masthead" data-masthead>
    <div class="masthead__row">
      ${brand(ctx, { reading: ctx.rail ? ctx.rail[0] : null })}
      <nav class="nav" aria-label="Main">
        <ul class="nav__list">
          ${NAV.map((n) => html`<li class="${n.menu ? 'nav__item nav__item--menu' : 'nav__item'}"${n.menu ? html` data-menu` : ''}>
            <a class="nav__link" href="${ctx.u(n.href)}"${current(ctx, n.href)}>${n.label}</a>${n.menu ? html`<button type="button" class="nav__toggle" aria-expanded="false" aria-controls="mega">${icon('chevron-down', { size: 14 })}<span class="sr-only">Show product lines</span></button>
            ${mega(ctx)}` : ''}
          </li>`)}
        </ul>
      </nav>
      <div class="masthead__acts">
        <a class="btn btn--sm masthead__call" href="${ctx.u('locations/')}" data-open="call-sheet" aria-haspopup="dialog">${icon('phone', { size: 16 })}<span>Call<span class="masthead__more"> a yard</span></span></a>
        <a class="btn btn--sm masthead__cta" href="${quoteHref(ctx)}"><span class="masthead__cta-long">Request a quote</span><span class="masthead__cta-short">Quote</span></a>
        <a class="masthead__menu" href="#footer-index" data-open="drawer" aria-haspopup="dialog" aria-controls="drawer">
          <span>Menu</span>${icon('menu', { size: 20 })}
        </a>
      </div>
    </div>
    ${ctx.rail ? html`<span class="masthead__progress" data-progress aria-hidden="true"></span>` : ''}
  </header>
  <dialog class="drawer" id="drawer" aria-label="Menu">
    <div class="drawer__top">
      ${brand(ctx)}
      <button type="button" class="iconbtn" data-close>${icon('close', { size: 22 })}<span class="sr-only">Close menu</span></button>
    </div>
    <nav class="drawer__body" aria-label="Mobile">
      <ol class="drawer__nav">
        ${NAV.map((n, i) => (n.menu ? drawerProducts(ctx, n, i) : html`<li><a href="${ctx.u(n.href)}"${current(ctx, n.href)}><span class="drawer__no">${two(i + 1)}</span>${n.label}</a></li>`))}
      </ol>
      <ul class="drawer__minor">
        <li><a href="${ctx.u('pacific-northwest/')}">Pacific Northwest</a></li>
        <li><a href="mailto:${SITE.email}">${SITE.email}</a></li>
      </ul>
    </nav>
    <div class="drawer__foot">
      <div class="drawer__cta">
        <a class="btn" href="${quoteHref(ctx)}">Request a quote</a>
        <a class="btn btn--line" href="${ctx.u('accounts/')}">Open an account</a>
      </div>
      <ul class="drawer__yards">
        ${LOCATIONS.map((l) => html`<li><a href="${tel(l.phone)}"><span class="drawer__lat">${deg(latOf(l))}</span><b>${l.city}</b><span class="drawer__num">${l.phone}</span></a></li>`)}
      </ul>
    </div>
  </dialog>`;

// Call and Directions both open this. On the Alaska page modules/placefinder.js moves Kent to the end.
const callSheet = (ctx) => html`
  <dialog class="sheet" id="call-sheet" aria-labelledby="call-sheet-title">
    <div class="sheet__head">
      <h2 id="call-sheet-title" class="sheet__title">Call or visit a yard</h2>
      <button type="button" class="iconbtn" data-close>${icon('close', { size: 22 })}<span class="sr-only">Close</span></button>
    </div>
    <ul class="sheet__list">
      ${LOCATIONS.map((l) => html`<li class="sheet__yard">
        <div class="sheet__who">
          <span class="sheet__lat">${deg(latOf(l))} · ${l.callFor}</span>
          ${openStatus(l, { short: true })}
          <p class="sheet__place"><b>${l.city}, ${l.state}</b> <small>${l.street}</small></p>
        </div>
        <div class="sheet__acts">
          <a class="sheet__num" href="${tel(l.phone)}">${icon('phone', { size: 18 })}<span><span class="sr-only">Call ${l.city}: </span>${l.phone}</span></a>
          <a class="sheet__dir" href="${mapsUrl(l)}" target="_blank" rel="noopener">${icon('directions', { size: 18 })}<span>Directions<span class="sr-only"> to the ${l.city} yard</span></span></a>
        </div>
        <ul class="sheet__more">
          <li><a href="mailto:${l.email}">${l.email}</a></li>
          <li>Fax ${l.fax}</li>
          <li class="sheet__details"><a href="${ctx.u('locations/')}#${l.id}"><span class="sr-only">${l.city} yard </span>Details ${icon('arrow', { size: 14 })}</a></li>
        </ul></li>`)}
    </ul>
    <p class="sheet__note">Any yard can help. They work as one team.</p>
  </dialog>`;

const actionBar = (ctx) => html`
  <div class="actionbar" role="region" aria-label="Quick actions">
    <a class="actionbar__btn actionbar__btn--call" href="${ctx.u('locations/')}" data-open="call-sheet" aria-haspopup="dialog">${icon('phone', { size: 20 })}Call</a>
    <a class="actionbar__btn" href="${ctx.u('locations/')}" data-open="call-sheet" aria-haspopup="dialog">${icon('directions', { size: 20 })}Directions</a>
    <a class="actionbar__btn actionbar__btn--primary" href="${quoteHref(ctx)}">${icon('file', { size: 20 })}Quote</a>
  </div>`;

const footer = (ctx) => html`
  <footer class="footer">
    <div class="wrap">
      <div class="footer__lead">
        <p class="footer__line">Quality materials, <em>trusted service.</em></p>
        <div class="footer__cta">
          <a class="btn" href="${quoteHref(ctx)}">Request a quote ${icon('arrow', { size: 18 })}</a>
          <a class="btn btn--line" href="${ctx.u('accounts/')}">Open an account</a>
        </div>
      </div>
      <div class="footer__cols">
        ${LOCATIONS.map((l) => html`
          <div class="footer__yard">
            <p class="footer__meta"><span>${deg(latOf(l))}</span>${openStatus(l, { short: true })}</p>
            <h3 class="footer__h">${l.city}, ${l.state}</h3>
            <a class="footer__tel" href="${tel(l.phone)}">${l.phone}</a>
            ${l.tollFree ? html`<a href="${tel(l.tollFree)}">${l.tollFree} <small>toll-free</small></a>` : ''}
            <a href="mailto:${l.email}">${l.email}</a>
            <p class="footer__fax">Fax ${l.fax}</p>
            <address>${l.street}<br>${l.city}, ${l.state} ${l.zip}</address>
          </div>`)}
        <nav class="footer__nav" id="footer-index" aria-label="Footer">
          <p class="footer__meta">Index</p>
          <h3 class="footer__h">Explore</h3>
          <ul>
            <li><a href="${ctx.u('products/')}">Products</a></li>
            <li><a href="${ctx.u('services/')}">Services</a></li>
            <li><a href="${ctx.u('alaska/')}">Alaska delivery</a></li>
            <li><a href="${ctx.u('pacific-northwest/')}">Pacific Northwest</a></li>
            <li><a href="${ctx.u('projects/')}">Projects</a></li>
            <li><a href="${ctx.u('locations/')}">Locations</a></li>
            <li><a href="${ctx.u('about/')}">About</a></li>
            <li><a href="${ctx.u('accounts/')}">Open an account</a></li>
            <li><a href="${quoteHref(ctx)}">Request a quote</a></li>
          </ul>
        </nav>
      </div>
      <div class="footer__base">
        ${brand(ctx, { cls: 'brand--paper' })}
        <p>© ${new Date().getFullYear()} ${SITE.legal}</p>
        <p>Wholesale building materials for the Pacific Northwest and all of Alaska, for more than ${SITE.years} years.</p>
      </div>
    </div>
  </footer>`;

// Structured data so search engines know the three yards as one business with three places.
export const orgJsonLd = (ctx) => {
  const org = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': SITE.url + '/#org',
    name: SITE.name,
    legalName: SITE.legal,
    alternateName: ['Uresco', 'UCM'],
    url: SITE.url + '/',
    email: SITE.email,
    logo: SITE.url + '/assets/brand/uresco-mark-512.png',
    slogan: SITE.tagline,
    areaServed: ['Alaska', 'Washington', 'Pacific Northwest'],
    subOrganization: LOCATIONS.map((l) => ({
      '@type': 'HomeAndConstructionBusiness',
      '@id': `${SITE.url}/locations/#${l.id}`,
      name: `${SITE.name} — ${l.city}`,
      url: `${SITE.url}/${l.page}`,
      telephone: '+1-' + l.phone.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3'),
      faxNumber: l.fax ? '+1-' + l.fax.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3') : undefined,
      email: l.email,
      address: { '@type': 'PostalAddress', streetAddress: l.street, addressLocality: l.city, addressRegion: l.state, postalCode: l.zip, addressCountry: 'US' },
      geo: { '@type': 'GeoCoordinates', latitude: l.geo.lat, longitude: l.geo.lng },
    })),
  };
  return html`<script type="application/ld+json">${raw(JSON.stringify(org).replace(/</g, '\\u003c'))}</script>`;
};

// BreadcrumbList for inner pages: Home › (Products ›) page.
const crumbsLd = (ctx, title) => {
  if (!ctx.path || ctx.path === '404/') return '';
  const parts = [['Home', '']];
  if (ctx.path.startsWith('products/') && ctx.path !== 'products/') parts.push(['Products', 'products/']);
  parts.push([title, ctx.path]);
  const ld = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: parts.map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE.url}/${p}` })) };
  return html`<script type="application/ld+json">${raw(JSON.stringify(ld))}</script>`;
};

// rail: [{ id, lat, name }] turns on the latitude rail for a page whose sections carry data-lat.
export const layout = (ctx, { title, description, body, jsonLd = '', preload = [], rail: stops = null }) => {
  ctx.rail = stops;
  const fullTitle = ctx.path === '' ? `${SITE.name} | Lumber & Building Materials for Alaska and the Pacific Northwest` : `${title} | ${SITE.name}`;
  const canonical = SITE.url + '/' + ctx.path;
  const font = (f) => html`<link rel="preload" href="${ctx.u('assets/fonts/' + f)}" as="font" type="font/woff2" crossorigin>`;
  return html`<!doctype html>
<html lang="en-US" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${fullTitle}</title>
<meta name="description" content="${description}">
${SITE.preview ? raw('<meta name="robots" content="noindex, nofollow">') : ''}
<link rel="canonical" href="${canonical}">
<meta name="theme-color" content="#F4EFE6">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${SITE.name}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${SITE.url}/assets/brand/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${ctx.u('favicon.svg')}" type="image/svg+xml">
<link rel="icon" href="${ctx.u('favicon-32.png')}" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="${ctx.u('apple-touch-icon.png')}">
<link rel="manifest" href="${ctx.u('site.webmanifest')}">
<script>document.documentElement.className='js'</script>
${font('fraunces-var.woff2')}
${font('fraunces-italic-var.woff2')}
${preload.flat().map((p) => html`<link rel="preload" as="image" imagesrcset="${p.srcset}" imagesizes="${p.sizes}"${p.media ? html` media="${p.media}"` : ''} fetchpriority="high">`)}
<link rel="stylesheet" href="${ctx.u('assets/css/site.css')}?v=${ctx.version}">
<script src="${ctx.u('assets/js/site.js')}?v=${ctx.version}" defer></script>
${jsonLd}
${crumbsLd(ctx, title)}
</head>
<body class="${stops ? 'has-rail' : ''}">
${header(ctx)}
${stops ? rail(ctx, stops) : ''}
<main id="main">
${body}
</main>
${footer(ctx)}
${actionBar(ctx)}
${callSheet(ctx)}
</body>
</html>
`;
};

