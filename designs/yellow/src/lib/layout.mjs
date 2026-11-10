import { html, raw } from './html.mjs';
import { icon, mark } from './icons.mjs';
import { SITE } from '../config.mjs';
import { LOCATIONS, tel, mapsUrl } from '../data/locations.mjs';
import { openStatus, lineWin } from './components.mjs';
import { CATEGORIES } from '../data/products.mjs';

export const NAV = [
  { href: 'products/', label: 'Products', menu: true },
  { href: 'services/', label: 'Services' },
  { href: 'alaska/', label: 'Alaska delivery', bar: 'Alaska' },
  { href: 'pacific-northwest/', label: 'Pacific Northwest', bar: 'Pacific NW' },
  { href: 'projects/', label: 'Projects' },
  { href: 'locations/', label: 'Locations' },
  { href: 'about/', label: 'About' },
];

// The mark sits in a black tile on the yellow bar, and in its original yellow tile on black.
export const brand = (ctx, { cls = '', onBlack = false } = {}) => html`
  <a class="brand ${cls}" href="${ctx.u('')}">
    <span class="brand__mark">${mark(onBlack ? { id: 'mk' + ctx.uid() } : { id: 'mk' + ctx.uid(), tile: '#0E0E0C', ink: '#F5B800' })}</span>
    <span class="brand__word"><span class="brand__name">Uresco</span> <span class="brand__desc">Construction Materials</span></span>
  </a>`;

const isCurrent = (ctx, href) => (href === '' ? ctx.path === '' : ctx.path.startsWith(href));

// Products menu: the nine lines, numbered like the index on the home page.
const productMenu = (ctx) => html`
  <div class="megamenu" role="group" aria-label="Product lines">
    <div class="megamenu__grid">
      ${CATEGORIES.map((c) => html`<a href="${ctx.u('products/' + c.slug + '/')}">${lineWin(c, { cls: 'megamenu__sign' })}<span>${c.short}</span></a>`)}
    </div>
    <div class="megamenu__foot">
      <p>Tarps, poly, caulking, adhesives, house wraps and more. If it’s not listed, ask your yard.</p>
      <a class="link" href="${ctx.u('products/')}">All products ${icon('arrow', { size: 16 })}</a>
    </div>
  </div>`;

const header = (ctx) => html`
  <a class="skip" href="#main">Skip to content</a>
  <div class="utility" role="region" aria-label="Call a yard">
    <div class="wrap utility__row">
      <ul class="utility__yards">
        ${LOCATIONS.map((l) => html`<li><span class="utility__city">${l.city}</span><a href="${tel(l.phone)}">${l.phone}</a>${openStatus(l)}</li>`)}
      </ul>
      <div class="utility__links">
        <a href="${ctx.u('accounts/')}">Contractor accounts</a>
        <a class="utility__mail" href="mailto:${SITE.email}">${icon('mail', { size: 15 })}${SITE.email}</a>
      </div>
    </div>
  </div>
  <header class="masthead" data-masthead>
    <div class="wrap masthead__row">
      ${brand(ctx)}
      <nav class="nav" aria-label="Main">
        <ul class="nav__list">
          ${NAV.map((n) => html`<li class="${n.menu ? 'nav__item nav__item--menu' : 'nav__item'}">
            <a class="nav__link" href="${ctx.u(n.href)}"${raw(isCurrent(ctx, n.href) ? ' aria-current="page"' : '')}>${n.bar || n.label}${n.menu ? icon('chevron-down', { size: 14, cls: 'nav__caret' }) : ''}</a>
            ${n.menu ? productMenu(ctx) : ''}
          </li>`)}
        </ul>
      </nav>
      <div class="masthead__acts">
        <a class="btn btn--sm btn--line masthead__call" href="${ctx.u('locations/')}" data-open="call-sheet" aria-haspopup="dialog">${icon('phone', { size: 16 })}<span class="masthead__call-t">Call<span class="masthead__more masthead__more--call"> a yard</span></span></a>
        <a class="btn btn--sm masthead__cta" href="${ctx.u('quote/')}"><span><span class="masthead__more masthead__more--cta">Request a </span>quote</span></a>
        <a class="masthead__menu" href="#site-index" data-open="drawer" aria-haspopup="dialog" aria-controls="drawer">
          ${icon('menu', { size: 20 })}<span>Menu</span>
        </a>
      </div>
    </div>
  </header>
  <dialog class="drawer" id="drawer" aria-label="Menu">
    <div class="drawer__top">
      ${brand(ctx)}
      <button type="button" class="xbtn" data-close>${icon('close', { size: 22 })}<span class="sr-only">Close menu</span></button>
    </div>
    <nav aria-label="Mobile">
      <ul class="drawer__nav">
        ${NAV.map((n, i) => (n.menu ? html`<li style="--i:${i}">
          <details class="drawer__group">
            <summary>${n.label}</summary>
            <ul class="drawer__lines">
              ${CATEGORIES.map((c) => html`<li><a href="${ctx.u('products/' + c.slug + '/')}"${raw(ctx.path.startsWith('products/' + c.slug) ? ' aria-current="page"' : '')}>${c.short}</a></li>`)}
              <li class="drawer__all"><a href="${ctx.u(n.href)}">All products ${icon('arrow', { size: 16 })}</a></li>
            </ul>
          </details>
        </li>` : html`<li style="--i:${i}"><a href="${ctx.u(n.href)}"${raw(isCurrent(ctx, n.href) ? ' aria-current="page"' : '')}>${n.label}</a></li>`))}
      </ul>
    </nav>
    <ul class="drawer__yards" aria-label="Call a yard">
      ${LOCATIONS.map((l) => html`<li><a href="${tel(l.phone)}"><b>${l.city}</b><span>${l.phone}</span></a></li>`)}
    </ul>
    <div class="drawer__cta">
      <a class="btn btn--paper" href="${ctx.u('quote/')}">Request a quote ${icon('arrow', { size: 18 })}</a>
      <a class="btn btn--line" href="${ctx.u('accounts/')}">Open an account</a>
    </div>
  </dialog>`;

// Call or visit: every yard with its number and a map link side by side. From the Alaska page the
// Alaska yards come first. Status shows Open or Closed only: yard hours are unconfirmed placeholders.
const callSheet = (ctx) => {
  const yards = ctx.path.startsWith('alaska') ? [...LOCATIONS.filter((l) => l.state === 'AK'), ...LOCATIONS.filter((l) => l.state !== 'AK')] : LOCATIONS;
  return html`
  <dialog class="sheet" id="call-sheet" aria-labelledby="call-sheet-title">
    <div class="sheet__head">
      <h2 id="call-sheet-title" class="sheet__title">Call or visit a yard</h2>
      <button type="button" class="xbtn" data-close>${icon('close', { size: 22 })}<span class="sr-only">Close</span></button>
    </div>
    <ul class="sheet__list">
      ${yards.map((l) => html`<li class="sheet__yard">
        <div class="sheet__top"><b class="sheet__city">${l.city}, ${l.state}</b>${openStatus(l)}</div>
        <p class="sheet__addr"><span>${l.street}</span> <span class="nw">Fax <span class="nums">${l.fax}</span></span></p>
        <div class="sheet__acts">
          <a class="sheet__num" href="${tel(l.phone)}">${icon('phone', { size: 18 })}<span class="sr-only">Call the ${l.city} yard at </span>${l.phone}</a>
          <a class="sheet__dir" href="${mapsUrl(l)}" target="_blank" rel="noopener">${icon('directions', { size: 18 })}Directions<span class="sr-only"> to the ${l.city} yard</span></a>
        </div>
        <div class="sheet__more">
          <a href="mailto:${l.email}">${icon('mail', { size: 16 })}${l.email}</a>
          <a href="${ctx.u('locations/#' + l.id)}"><span class="sr-only">${l.city} yard </span>Details ${icon('arrow', { size: 14 })}</a>
        </div>
      </li>`)}
    </ul>
  </dialog>`;
};

// Call and Directions both open the sheet; without the script they are links to the locations page.
const actionBar = (ctx) => html`
  <div class="actionbar" role="region" aria-label="Quick actions">
    <a class="actionbar__btn" href="${ctx.u('locations/')}" data-open="call-sheet" aria-haspopup="dialog">${icon('phone', { size: 19 })}Call</a>
    <a class="actionbar__btn" href="${ctx.u('locations/')}" data-open="call-sheet" aria-haspopup="dialog">${icon('directions', { size: 19 })}Directions</a>
    <a class="actionbar__btn actionbar__btn--primary" href="${ctx.u('quote/')}">${icon('file', { size: 19 })}Quote</a>
  </div>`;

// One yard in the footer: name, status, number. The details are off on phones (they are one tap away
// in the call sheet) and on the home page, which has just shown all three yards in full.
const footerYard = (l, compact) => html`
  <div class="footer__yard${compact ? ' footer__yard--compact' : ''}">
    <div class="footer__yardhead"><h2 class="footer__h">${l.city}, ${l.state}</h2>${openStatus(l)}</div>
    <a class="footer__num" href="${tel(l.phone)}">${l.phone}</a>
    ${compact ? '' : html`<div class="footer__more">
      <address>${l.street}<br>${l.city}, ${l.state} ${l.zip}</address>
      ${l.tollFree ? html`<a href="${tel(l.tollFree)}">${l.tollFree} <small>toll-free</small></a>` : ''}
      <a href="mailto:${l.email}">${l.email}</a>
      <span class="footer__fax">Fax <span class="nums">${l.fax}</span></span>
    </div>`}
  </div>`;

const footer = (ctx) => html`
  <footer class="footer">
    <div class="rings" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
    <div class="wrap">
      <div class="footer__lead">
        <p class="footer__tag d2">Quality materials, trusted service.</p>
      </div>
      <div class="footer__cols">
        ${LOCATIONS.map((l) => footerYard(l, ctx.path === ''))}
        <nav class="footer__nav" id="site-index" aria-label="Footer">
          <h2 class="footer__h">Explore</h2>
          <a href="${ctx.u('products/')}">Products</a>
          <a href="${ctx.u('services/')}">Services</a>
          <a href="${ctx.u('alaska/')}">Alaska delivery</a>
          <a href="${ctx.u('pacific-northwest/')}">Pacific Northwest</a>
          <a href="${ctx.u('projects/')}">Projects</a>
          <a href="${ctx.u('about/')}">About</a>
          <a href="${ctx.u('locations/')}">Locations</a>
          <a href="${ctx.u('accounts/')}">Contractor accounts</a>
          <a href="${ctx.u('quote/')}">Request a quote</a>
        </nav>
        <nav class="footer__nav footer__nav--lines" aria-label="Product lines">
          <h2 class="footer__h">Product lines</h2>
          ${CATEGORIES.map((c) => html`<a href="${ctx.u('products/' + c.slug + '/')}">${c.short}</a>`)}
        </nav>
      </div>
      <span class="footer__word" aria-hidden="true">Uresco</span>
    </div>
    <div class="footer__legal">
      <div class="wrap footer__legal-row">
        <span>© ${new Date().getFullYear()} ${SITE.legal}</span>
        <span>Serving the Pacific Northwest and all of Alaska.</span>
        <button type="button" class="footer__motion" data-motion-toggle>Pause motion</button>
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

export const layout = (ctx, { title, description, body, jsonLd = '', preload = [] }) => {
  const fullTitle = ctx.path === '' ? `${SITE.name} | Lumber & Building Materials for Alaska and the Pacific Northwest` : `${title} | ${SITE.name}`;
  const canonical = SITE.url + '/' + ctx.path;
  return html`<!doctype html>
<html lang="en-US">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${fullTitle}</title>
<meta name="description" content="${description}">
${SITE.preview ? raw('<meta name="robots" content="noindex, nofollow">') : ''}
<link rel="canonical" href="${canonical}">
<meta name="theme-color" content="#F5B800">
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
<script>try{if(localStorage.getItem('uresco.motion')==='off')document.documentElement.dataset.motion='off'}catch(e){}</script>
<link rel="preload" href="${ctx.u('assets/fonts/archivo-wide-var.woff2')}" as="font" type="font/woff2" crossorigin>
${preload.flat().map((p) => html`<link rel="preload" as="image" imagesrcset="${p.srcset}" imagesizes="${p.sizes}"${p.media ? html` media="${p.media}"` : ''} fetchpriority="high">`)}
<link rel="stylesheet" href="${ctx.u('assets/css/site.css')}?v=${ctx.version}">
<script src="${ctx.u('assets/js/site.js')}?v=${ctx.version}" defer></script>
${jsonLd}
${crumbsLd(ctx, title)}
</head>
<body>
${header(ctx)}
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
