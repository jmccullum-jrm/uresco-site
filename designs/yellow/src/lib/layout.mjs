import { html, raw, esc } from './html.mjs';
import { icon, mark } from './icons.mjs';
import { SITE } from '../config.mjs';
import { LOCATIONS, tel, address, mapsUrl, hoursLines, openingHoursLd } from '../data/locations.mjs';
import { openStatus } from './components.mjs';
import { CATEGORIES } from '../data/products.mjs';

export const NAV = [
  { href: 'products/', label: 'Products', menu: true },
  { href: 'services/', label: 'Services' },
  { href: 'alaska/', label: 'Alaska Delivery' },
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
      ${CATEGORIES.map((c) => html`<a href="${ctx.u('products/' + c.slug + '/')}"><span class="win win--u win--duo"><img src="${ctx.u(`assets/img/${c.photo}-240.webp`)}" width="46" height="56" alt="" loading="lazy" decoding="async"></span><span>${c.short}</span></a>`)}
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
        ${LOCATIONS.map((l) => html`<li><span class="utility__city">${l.city}</span><a href="${tel(l.phone)}">${l.phone}</a>${openStatus(l, { short: true })}</li>`)}
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
            <a class="nav__link" href="${ctx.u(n.href)}"${raw(isCurrent(ctx, n.href) ? ' aria-current="page"' : '')}>${n.label}${n.menu ? icon('chevron-down', { size: 14, cls: 'nav__caret' }) : ''}</a>
            ${n.menu ? productMenu(ctx) : ''}
          </li>`)}
        </ul>
      </nav>
      <div class="masthead__acts">
        <button type="button" class="btn btn--sm btn--line masthead__call" data-open="call-sheet" aria-haspopup="dialog">${icon('phone', { size: 16 })}Call</button>
        <a class="btn btn--sm masthead__cta" href="${ctx.u('quote/')}">Get a quote</a>
        <button class="masthead__menu" type="button" data-open="drawer" aria-haspopup="dialog" aria-controls="drawer">
          ${icon('menu', { size: 20 })}<span>Menu</span>
        </button>
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
        ${NAV.map((n, i) => html`<li style="--i:${i}"><a href="${ctx.u(n.href)}"${raw(isCurrent(ctx, n.href) ? ' aria-current="page"' : '')}>${n.label}</a></li>`)}
      </ul>
    </nav>
    <ul class="drawer__minor">
      <li><a href="${ctx.u('accounts/')}">Contractor accounts</a></li>
      <li><a href="${ctx.u('pacific-northwest/')}">Pacific Northwest</a></li>
    </ul>
    <ul class="drawer__yards" aria-label="Call a yard">
      ${LOCATIONS.map((l) => html`<li><a href="${tel(l.phone)}"><b>${l.city}</b><span>${l.phone}</span></a></li>`)}
    </ul>
    <a class="btn btn--block btn--paper" href="${ctx.u('quote/')}">Request a quote ${icon('arrow', { size: 18 })}</a>
  </dialog>`;

const callSheet = () => html`
  <dialog class="sheet" id="call-sheet" aria-labelledby="call-sheet-title">
    <div class="sheet__head">
      <h2 id="call-sheet-title" class="sheet__title">Call a yard</h2>
      <button type="button" class="xbtn" data-close>${icon('close', { size: 22 })}<span class="sr-only">Close</span></button>
    </div>
    <ul class="sheet__list">
      ${LOCATIONS.map((l) => html`<li class="sheet__yard">
        <span><b>${l.city}, ${l.state}</b><small>${l.street}</small>${openStatus(l)}</span>
        <span class="sheet__acts">
          <a class="sheet__dir" href="${mapsUrl(l)}" target="_blank" rel="noopener" aria-label="Directions to the ${l.city} yard">${icon('directions', { size: 20 })}</a>
          <a class="sheet__num" href="${tel(l.phone)}">${icon('phone', { size: 18 })}${l.phone}</a>
        </span></li>`)}
    </ul>
    <a class="sheet__mail" href="mailto:${SITE.email}">${icon('mail', { size: 18 })} ${SITE.email}</a>
  </dialog>`;

const actionBar = (ctx) => html`
  <div class="actionbar" role="region" aria-label="Quick actions">
    <button type="button" class="actionbar__btn" data-open="call-sheet" aria-haspopup="dialog">${icon('phone', { size: 19 })}Call</button>
    <a class="actionbar__btn" href="${ctx.u('locations/')}">${icon('directions', { size: 19 })}Directions</a>
    <a class="actionbar__btn actionbar__btn--primary" href="${ctx.u('quote/')}">${icon('file', { size: 19 })}Quote</a>
  </div>`;

const footer = (ctx) => html`
  <footer class="footer">
    <div class="rings" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
    <div class="wrap">
      <div class="footer__lead">
        <p class="footer__tag d2">Quality materials, trusted service.</p>
        <div class="footer__acts">
          <a class="btn btn--yellow" href="${ctx.u('quote/')}">Request a quote ${icon('arrow', { size: 18 })}</a>
          <button type="button" class="btn btn--line" data-open="call-sheet" aria-haspopup="dialog">${icon('phone', { size: 18 })} Call a yard</button>
        </div>
      </div>
      <div class="footer__cols">
        ${LOCATIONS.map((l) => html`
          <div class="footer__yard">
            <h2 class="footer__h">${l.city}, ${l.state}</h2>
            <address>${l.street}<br>${l.city}, ${l.state} ${l.zip}</address>
            <a class="footer__num" href="${tel(l.phone)}">${l.phone}</a>
            ${l.tollFree ? html`<a href="${tel(l.tollFree)}">${l.tollFree} <small>toll-free</small></a>` : ''}
            <a href="mailto:${l.email}">${l.email}</a>
            ${l.hours ? html`<small class="footer__hours">${hoursLines(l).join(' · ')}</small>` : ''}
          </div>`)}
        <nav class="footer__nav" aria-label="Footer">
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
      openingHoursSpecification: openingHoursLd(l),
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
${callSheet()}
</body>
</html>
`;
};

export { esc, address };
