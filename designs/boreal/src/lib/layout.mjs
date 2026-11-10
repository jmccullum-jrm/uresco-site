import { html, raw } from './html.mjs';
import { icon, mark } from './icons.mjs';
import { SITE } from '../config.mjs';
import { LOCATIONS, tel, mapsUrl } from '../data/locations.mjs';
import { openStatus } from './components.mjs';
import { CATEGORIES } from '../data/products.mjs';
import { glyph } from './drawings.mjs';

export const NAV = [
  { href: 'products/', label: 'Products', menu: true },
  { href: 'services/', label: 'Services' },
  { href: 'alaska/', label: 'Alaska delivery' },
  { href: 'projects/', label: 'Projects' },
  { href: 'locations/', label: 'Locations' },
  { href: 'about/', label: 'About' },
];

// The lockup: the end-grain U beside the name, with the descriptor set small in mono.
export const brand = (ctx, { cls = '' } = {}) => html`
  <a class="brand ${cls}" href="${ctx.u('')}">
    <span class="brand__mark">${mark({ id: 'mk' + ctx.uid() })}</span>
    <span class="brand__word"><span class="brand__name">Uresco</span> <span class="brand__desc">Construction Materials</span></span>
  </a>`;

const isCurrent = (ctx, href) => (href === '' ? ctx.path === '' : ctx.path.startsWith(href));
const current = (ctx, href) => raw(isCurrent(ctx, href) ? ' aria-current="page"' : '');

// Products menu: the nine lines with what is in each, and a way out for anything not listed.
const megaMenu = (ctx) => html`
  <div class="mega" id="mega" data-mega>
    <div class="mega__panel">
      <ul class="mega__grid">
        ${CATEGORIES.map((c) => html`<li><a class="mega__item" href="${ctx.u('products/' + c.slug + '/')}">
          ${glyph(c.slug)}
          <span><b>${c.short}</b><small>${c.items.slice(0, 3).map(([n]) => n.replace(/ \(.*\)| by .*|®|™/g, '')).join(' · ')}</small></span>
        </a></li>`)}
      </ul>
      <div class="mega__side">
        <p class="eyebrow">Not on the list?</p>
        <p>Tarps, poly, caulking, adhesives, house wraps and more. If a job needs it, ask your yard.</p>
        <a class="btn btn--sm" href="${ctx.u('quote/')}">Send a materials list ${icon('arrow', { size: 16 })}</a>
        <a class="link link--light" href="${ctx.u('products/')}">All product lines ${icon('arrow', { size: 16 })}</a>
      </div>
    </div>
  </div>`;

// One setting for everything that moves by itself (map beacons, drifting lanes, the sky). The script
// shows the control only on pages where something is looping, and remembers the choice between pages.
const motionToggle = (cls = '') => html`<button type="button" class="motion ${cls}" data-motion hidden>${icon('pause', { size: 14, cls: 'i--pause' })}${icon('play', { size: 14, cls: 'i--play' })}<span>Pause motion</span></button>`;

const header = (ctx) => html`
  <a class="skip" href="#main">Skip to content</a>
  <div class="utility" role="region" aria-label="Call a yard">
    <div class="wrap utility__row">
      <ul class="utility__yards">
        ${LOCATIONS.map((l) => html`<li><span class="utility__city">${l.city}</span><a href="${tel(l.phone)}">${l.phone}</a>${openStatus(l)}</li>`)}
      </ul>
      <div class="utility__links">
        ${motionToggle('utility__motion')}
        <a href="${ctx.u('accounts/')}">Open an account</a>
        <a class="utility__mail" href="mailto:${SITE.email}">${SITE.email}</a>
      </div>
    </div>
  </div>
  <header class="masthead" data-masthead>
    <div class="wrap masthead__row">
      ${brand(ctx)}
      <nav class="nav" aria-label="Main">
        <ul class="nav__list">
          ${NAV.map((n) => html`<li class="${n.menu ? 'nav__item nav__item--menu' : 'nav__item'}"${n.menu ? html` data-menu` : ''}>
            <a class="nav__link" href="${ctx.u(n.href)}"${current(ctx, n.href)}>${n.label}</a>
            ${n.menu ? html`<button type="button" class="nav__toggle jsonly" aria-expanded="false" aria-controls="mega">${icon('chevron-down', { size: 14 })}<span class="sr-only">Product lines</span></button>${megaMenu(ctx)}` : ''}
          </li>`)}
        </ul>
      </nav>
      <div class="masthead__acts">
        <a class="btn btn--sm btn--dark masthead__call" href="${ctx.u('locations/')}" data-open="call-sheet" aria-haspopup="dialog">${icon('phone', { size: 16 })}<span>Call<span class="masthead__call-more"> a yard</span></span></a>
        <a class="btn btn--sm masthead__cta" href="${ctx.u('quote/')}">Request a quote</a>
        <a class="masthead__menu" href="#site-index" data-open="drawer" aria-haspopup="dialog" aria-controls="drawer">
          ${icon('menu', { size: 22 })}<span class="sr-only">Menu</span>
        </a>
      </div>
    </div>
  </header>
  <dialog class="drawer" id="drawer" aria-label="Menu">
    <div class="drawer__top">
      ${brand(ctx)}
      <button type="button" class="iconbtn" data-close>${icon('close', { size: 22 })}<span class="sr-only">Close menu</span></button>
    </div>
    <nav aria-label="Mobile">
      <ul class="drawer__nav">
        ${NAV.map((n) => html`<li><a href="${ctx.u(n.href)}"${current(ctx, n.href)}>${n.label}${icon('arrow', { size: 18 })}</a></li>`)}
        <li><a href="${ctx.u('accounts/')}"${current(ctx, 'accounts/')}>Open an account${icon('arrow', { size: 18 })}</a></li>
      </ul>
      <p class="eyebrow">Product lines</p>
      <ul class="drawer__lines">
        ${CATEGORIES.map((c) => html`<li><a href="${ctx.u('products/' + c.slug + '/')}">${c.short}</a></li>`)}
      </ul>
      <ul class="drawer__minor">
        <li><a href="${ctx.u('pacific-northwest/')}">Pacific Northwest</a></li>
        <li><a href="mailto:${SITE.email}">${SITE.email}</a></li>
        <li>${motionToggle()}</li>
      </ul>
    </nav>
    <div class="drawer__foot">
      <button type="button" class="btn btn--lg btn--dark" data-open="call-sheet" aria-haspopup="dialog">${icon('phone', { size: 18 })} Call a yard</button>
      <a class="btn btn--lg" href="${ctx.u('quote/')}">Request a quote</a>
    </div>
  </dialog>`;

// Every yard with Call and Directions side by side, then the rest of how to reach it. Status is the live
// open/closed word only: the hours in the data are placeholders. Opened by anything with data-open="call-sheet".
const callSheet = (ctx) => html`
  <dialog class="sheet" id="call-sheet" aria-labelledby="call-sheet-title">
    <div class="sheet__head">
      <h2 id="call-sheet-title" class="sheet__title">Call or visit a yard</h2>
      <button type="button" class="iconbtn" data-close>${icon('close', { size: 22 })}<span class="sr-only">Close</span></button>
    </div>
    <ul class="sheet__list">
      ${LOCATIONS.map((l) => html`<li class="sheet__yard">
        <div class="sheet__who">
          <p class="sheet__name"><b>${l.city}, ${l.state}</b>${openStatus(l)}</p>
          <a class="sheet__more" href="${ctx.u('locations/#' + l.id)}">Details<span class="sr-only"> for the ${l.city} yard</span></a>
          <small>${l.serves}</small>
        </div>
        <div class="sheet__acts">
          <a class="sheet__num" href="${tel(l.phone)}">${icon('phone', { size: 18 })}<span class="sheet__verb">Call</span><span class="sr-only"> the ${l.city} yard at </span>${l.phone}</a>
          <a class="sheet__dir" href="${mapsUrl(l)}" target="_blank" rel="noopener">${icon('directions', { size: 18 })}Directions<span class="sr-only"> to the ${l.city} yard (opens a map)</span></a>
        </div>
        <p class="sheet__meta"><a href="mailto:${l.email}">${l.email}</a>${l.fax ? html`<span>Fax ${l.fax}</span>` : ''}</p>
      </li>`)}
    </ul>
    <p class="sheet__foot">Any yard can help. They work as one team.</p>
  </dialog>`;

// On the quote page itself, the third button goes to the plans step instead of reloading the page.
const actionBar = (ctx) => html`
  <div class="actionbar" role="region" aria-label="Quick actions">
    <a class="actionbar__btn" href="${ctx.u('locations/')}" data-open="call-sheet" aria-haspopup="dialog">${icon('phone', { size: 20 })}Call</a>
    <a class="actionbar__btn" href="${ctx.u('locations/')}" data-open="call-sheet" aria-haspopup="dialog">${icon('directions', { size: 20 })}Directions</a>
    ${ctx.path === 'quote/'
      ? html`<a class="actionbar__btn actionbar__btn--primary" href="#plans">${icon('upload', { size: 20 })}Send plans</a>`
      : html`<a class="actionbar__btn actionbar__btn--primary" href="${ctx.u('quote/')}">${icon('file', { size: 20 })}Quote</a>`}
  </div>`;

// The site ends on the brand: a yellow surface with the name, the tagline and the two ways to get started,
// then the black surface that holds the yards and the index. Two surfaces, one seam.
const footer = (ctx) => {
  const [first, ...rest] = SITE.tagline.split(', ');
  return html`
  <footer class="footer">
    <div class="footer__band">
      <div class="footer__band-in">
        <div class="footer__brandline">
          ${brand(ctx, { cls: 'brand--band' })}
          <p class="footer__tagline">${first}, <em>${rest.join(', ')}</em></p>
        </div>
        <div class="footer__start">
          <p class="footer__line">Lumber and building materials for the Pacific Northwest and all of Alaska, delivered down the road or across an ocean.</p>
          <div class="footer__acts">
            <a class="btn btn--dark" href="${ctx.u('locations/')}" data-open="call-sheet" aria-haspopup="dialog">${icon('phone', { size: 18 })} Call or visit a yard</a>
            <a class="btn btn--band" href="${ctx.u('accounts/')}">Open an account ${icon('arrow', { size: 18 })}</a>
          </div>
        </div>
      </div>
    </div>
    <div class="footer__card">
      <div class="footer__in">
        <div class="footer__cols">
          ${LOCATIONS.map((l) => html`
            <div class="footer__yard">
              <h2 class="footer__h">${l.city}, ${l.state} ${openStatus(l)}</h2>
              <a class="footer__num" href="${tel(l.phone)}">${l.phone}</a>
              ${l.tollFree ? html`<a href="${tel(l.tollFree)}">${l.tollFree} <small>toll-free</small></a>` : ''}
              <a href="mailto:${l.email}">${l.email}</a>
              <address>${l.street}<br>${l.city}, ${l.state} ${l.zip}</address>
              <a class="footer__more" href="${ctx.u('locations/#' + l.id)}">Yard details<span class="sr-only">: ${l.city}</span></a>
            </div>`)}
          <nav class="footer__nav" id="site-index" aria-label="Footer">
            <h2 class="footer__h">Explore</h2>
            <ul>
              <li><a href="${ctx.u('products/')}">Products</a></li>
              <li><a href="${ctx.u('services/')}">Services</a></li>
              <li><a href="${ctx.u('alaska/')}">Alaska delivery</a></li>
              <li><a href="${ctx.u('pacific-northwest/')}">Pacific Northwest</a></li>
              <li><a href="${ctx.u('projects/')}">Projects</a></li>
              <li><a href="${ctx.u('locations/')}">Locations</a></li>
              <li><a href="${ctx.u('about/')}">About</a></li>
              <li><a href="${ctx.u('accounts/')}">Open an account</a></li>
              <li><a href="${ctx.u('quote/')}">Request a quote</a></li>
            </ul>
          </nav>
        </div>
        <div class="footer__legal">
          <span>© ${new Date().getFullYear()} ${SITE.legal}</span>
          <span class="footer__geo">${LOCATIONS.map((l) => `${l.latShort} ${l.city}`).join(' · ')}</span>
          ${motionToggle('footer__motion')}
        </div>
      </div>
    </div>
  </footer>`;
};

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

// preload entries: { srcset, sizes, media } for a responsive photo, or { href, type } for one file.
export const layout = (ctx, { title, description, body, jsonLd = '', preload = [], bodyClass = '' }) => {
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
<meta name="theme-color" content="#F4F6F6">
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
<link rel="preload" href="${ctx.u('assets/fonts/geist-var.woff2')}" as="font" type="font/woff2" crossorigin>
${preload.flat().map((p) => (p.href
    ? html`<link rel="preload" as="image" href="${p.href}"${p.type ? html` type="${p.type}"` : ''} fetchpriority="high">`
    : html`<link rel="preload" as="image" imagesrcset="${p.srcset}" imagesizes="${p.sizes}"${p.media ? html` media="${p.media}"` : ''} fetchpriority="high">`))}
<link rel="stylesheet" href="${ctx.u('assets/css/site.css')}?v=${ctx.version}">
<script src="${ctx.u('assets/js/site.js')}?v=${ctx.version}" defer></script>
${jsonLd}
${crumbsLd(ctx, title)}
</head>
<body class="${bodyClass}">
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
