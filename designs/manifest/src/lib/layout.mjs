import { html, raw } from './html.mjs';
import { icon, mark } from './icons.mjs';
import { glyph } from './drawings.mjs';
import { SITE } from '../config.mjs';
import { LOCATIONS, tel, mapsUrl } from '../data/locations.mjs';
import { openStatus, YARD_FOR, lineNo, two } from './components.mjs';
import { CATEGORIES, BRANDS } from '../data/products.mjs';

const NAV = [
  { href: 'products/', label: 'Products', menu: true },
  { href: 'services/', label: 'Services' },
  { href: 'alaska/', label: 'Alaska delivery' },
  { href: 'projects/', label: 'Projects' },
  { href: 'locations/', label: 'Locations' },
  { href: 'about/', label: 'About' },
];

// Sheet names for the title block in the footer and the bar at the top of each page.
const SHEETS = { '': 'Home', 'products/': 'Products', 'services/': 'Services', 'alaska/': 'Alaska delivery', 'projects/': 'Projects', 'locations/': 'Locations', 'about/': 'About', 'quote/': 'Request a quote', 'accounts/': 'Contractor accounts', 'pacific-northwest/': 'Pacific Northwest' };
const sheetName = (ctx, title) => SHEETS[ctx.path] || (ctx.path.startsWith('products/') ? 'Products' : title);

const brand = (ctx, { cls = '' } = {}) => html`
  <a class="brand ${cls}" href="${ctx.u('')}">
    <span class="brand__mark">${mark({ id: 'mk' + ctx.uid() })}</span>
    <span class="brand__word"><span class="brand__name">Uresco</span> <span class="brand__desc">Construction Materials</span></span>
  </a>`;

const isCurrent = (ctx, href) => (href === '' ? ctx.path === '' : ctx.path.startsWith(href));

// The Products menu is the manifest in miniature: nine numbered lines, each with its drawing.
const productMenu = (ctx) => html`
  <div class="mega" role="group" aria-label="Product lines">
    <div class="wrap mega__inner">
      <div class="mega__head">
        <p class="label">Index of product lines</p>
        <a class="link" href="${ctx.u('products/')}">All products ${icon('arrow', { size: 16 })}</a>
      </div>
      <ol class="mega__grid">
        ${CATEGORIES.map((c, i) => html`<li><a href="${ctx.u('products/' + c.slug + '/')}">
          <span class="mega__no num">${lineNo(i)}</span>
          <span class="mega__glyph">${glyph(c.slug, { size: 44 })}</span>
          <span class="mega__name">${c.short}</span>
        </a></li>`)}
      </ol>
      <p class="mega__foot"><span class="label">Brands we carry</span> ${BRANDS.join(' · ')}</p>
    </div>
  </div>`;

const header = (ctx) => html`
  <a class="skip" href="#main">Skip to content</a>
  <div class="utility" role="region" aria-label="Call a yard">
    <div class="wrap utility__row">
      <ul class="utility__yards">
        ${LOCATIONS.map((l) => html`<li>
          <a href="${tel(l.phone)}"><span class="utility__city">${l.city}</span> <span class="utility__num">${l.phone}</span></a>
          <span class="utility__time js-only" data-clock="${l.hours.tz}" aria-hidden="true">--:--</span>
          ${openStatus(l)}
        </li>`)}
      </ul>
      <div class="utility__links">
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
          ${NAV.map((n) => html`<li class="${n.menu ? 'nav__item nav__item--menu' : 'nav__item'}">
            <a class="nav__link" href="${ctx.u(n.href)}"${raw(isCurrent(ctx, n.href) ? ' aria-current="page"' : '')}>${n.label}${n.menu ? icon('chevron-down', { size: 14, cls: 'nav__caret' }) : ''}</a>
            ${n.menu ? productMenu(ctx) : ''}
          </li>`)}
        </ul>
      </nav>
      <div class="masthead__acts">
        <a class="btn btn--sm btn--line masthead__call" href="${ctx.u('locations/')}" data-open="call-sheet" aria-haspopup="dialog">${icon('phone', { size: 16 })}<span>Call<span class="mh-long"> a yard</span></span></a>
        <a class="btn btn--sm masthead__cta" href="${ctx.u('quote/')}"><span><span class="mh-long">Request a </span>quote</span>${icon('arrow', { size: 16 })}</a>
        <a class="masthead__menu" href="#index" data-open="drawer" aria-haspopup="dialog" aria-controls="drawer">
          <span>Menu</span>${icon('menu', { size: 20 })}
        </a>
      </div>
    </div>
  </header>
  <dialog class="drawer" id="drawer" aria-label="Menu">
    <div class="drawer__top">
      ${brand(ctx)}
      <button type="button" class="drawer__close" data-close><span>Close</span>${icon('close', { size: 20 })}</button>
    </div>
    <nav aria-label="Phone menu">
      <ol class="drawer__nav">
        ${NAV.map((n, i) => n.menu ? html`<li><details class="drawer__group">
          <summary${raw(isCurrent(ctx, n.href) ? ' aria-current="true"' : '')}><span class="num">${two(i)}</span>${n.label}${icon('chevron-down', { size: 20 })}</summary>
          <ol class="drawer__lines">
            ${CATEGORIES.map((c, j) => html`<li><a href="${ctx.u('products/' + c.slug + '/')}"><span class="num">${lineNo(j)}</span><span class="drawer__glyph">${glyph(c.slug, { size: 30 })}</span><span>${c.short}</span></a></li>`)}
          </ol>
          <a class="drawer__all" href="${ctx.u(n.href)}">All products ${icon('arrow', { size: 18 })}</a>
        </details></li>` : html`<li><a href="${ctx.u(n.href)}"${raw(isCurrent(ctx, n.href) ? ' aria-current="page"' : '')}><span class="num">${two(i)}</span>${n.label}${icon('arrow', { size: 20 })}</a></li>`)}
      </ol>
      <ul class="drawer__minor">
        <li><a href="${ctx.u('pacific-northwest/')}">Pacific Northwest</a></li>
        <li><a href="mailto:${SITE.email}">${SITE.email}</a></li>
      </ul>
    </nav>
    <div class="drawer__cta">
      <a class="btn btn--block" href="${ctx.u('quote/')}">Request a quote ${icon('arrow', { size: 18 })}</a>
      <a class="btn btn--block btn--line" href="${ctx.u('accounts/')}">Open an account</a>
    </div>
    <ul class="drawer__yards">
      ${LOCATIONS.map((l) => html`<li><a href="${tel(l.phone)}"><span class="drawer__city">${l.city}, ${l.state}</span><span class="num">${l.phone}</span>${icon('phone', { size: 18 })}</a></li>`)}
    </ul>
  </dialog>`;

// Call or visit a yard: one row per yard with Call and Directions side by side, then its email, fax and details.
// Read from the Alaska page, the Alaska yards come first.
const sheetYards = (ctx) => (ctx.path.startsWith('alaska/') ? [...LOCATIONS].sort((a, b) => (b.state === 'AK') - (a.state === 'AK')) : LOCATIONS);

const callSheet = (ctx) => html`
  <dialog class="sheet" id="call-sheet" aria-labelledby="call-sheet-title">
    <div class="sheet__head">
      <h2 id="call-sheet-title" class="sheet__title">Call or visit a yard</h2>
      <button type="button" class="drawer__close" data-close><span>Close</span>${icon('close', { size: 20 })}</button>
    </div>
    <ul class="sheet__list">
      ${sheetYards(ctx).map((l, i) => html`<li class="sheet__yard">
        <p class="label sheet__for">${two(i)} · ${YARD_FOR[l.id]}</p>
        <div class="sheet__id">
          <h3 class="sheet__name">${l.city}, ${l.state}</h3>
          ${openStatus(l)}
          <a class="sheet__more" href="${ctx.u('locations/')}#${l.id}">Details<span class="sr-only"> for the ${l.city} yard</span></a>
        </div>
        <p class="sheet__addr">${l.street}</p>
        <div class="sheet__acts">
          <a class="sheet__num" href="${tel(l.phone)}">${icon('phone', { size: 18 })}<span class="sr-only">Call ${l.city}: </span><span class="num">${l.phone}</span></a>
          <a class="sheet__dir" href="${mapsUrl(l)}" target="_blank" rel="noopener">${icon('directions', { size: 18 })}Directions<span class="sr-only"> to the ${l.city} yard</span></a>
        </div>
        <p class="sheet__reach">
          <a href="mailto:${l.email}">${l.email}</a>
          ${l.fax ? html`<span class="sheet__fax"><span class="label">Fax</span> <span class="num">${l.fax}</span></span>` : ''}
        </p>
      </li>`)}
    </ul>
  </dialog>`;

const actionBar = (ctx) => html`
  <div class="actionbar" role="region" aria-label="Quick actions">
    <a class="actionbar__btn" href="${ctx.u('locations/')}" data-open="call-sheet" aria-haspopup="dialog">${icon('phone', { size: 20 })}Call</a>
    <a class="actionbar__btn" href="${ctx.u('locations/')}" data-open="call-sheet" aria-haspopup="dialog">${icon('directions', { size: 20 })}Directions</a>
    <a class="actionbar__btn actionbar__btn--primary" href="${ctx.u('quote/')}">${icon('file', { size: 20 })}Quote</a>
  </div>`;

// The footer is the sheet's title block: firm, yards, index, sheet name.
const footer = (ctx, title) => html`
  <footer class="footer">
    <div class="wrap">
      <div class="tb">
        <div class="tb__cell tb__firm">
          ${brand(ctx, { cls: 'brand--lg' })}
          <p class="tb__tag">${SITE.tagline}</p>
          <p class="tb__about">Wholesale building materials for institutional, commercial and residential builders across the Pacific Northwest and all of Alaska.</p>
        </div>
        <div class="tb__cell tb__cta">
          <p class="label">Start here</p>
          <a class="btn" href="${ctx.u('quote/')}">Request a quote ${icon('arrow', { size: 18 })}</a>
          <a class="btn btn--line" href="${ctx.u('accounts/')}">Open an account</a>
        </div>
        ${LOCATIONS.map((l, i) => html`
          <div class="tb__cell tb__yard">
            <h3 class="label">Yard ${two(i)} · ${l.city}, ${l.state}</h3>
            <a class="tb__phone num" href="${tel(l.phone)}">${l.phone}</a>
            ${l.tollFree ? html`<a class="num" href="${tel(l.tollFree)}">${l.tollFree} <small>toll-free</small></a>` : ''}
            <address>${l.street}<br>${l.city}, ${l.state} ${l.zip}</address>
            <a href="mailto:${l.email}">${l.email}</a>
            ${l.fax ? html`<span class="tb__fax">Fax <span class="num">${l.fax}</span></span>` : ''}
            ${openStatus(l)}
          </div>`)}
        <nav class="tb__cell tb__index" id="index" aria-label="Footer">
          <h3 class="label">Index</h3>
          <ul>
            <li><a href="${ctx.u('products/')}">Products</a></li>
            <li><a href="${ctx.u('services/')}">Services</a></li>
            <li><a href="${ctx.u('alaska/')}">Alaska delivery</a></li>
            <li><a href="${ctx.u('pacific-northwest/')}">Pacific Northwest</a></li>
            <li><a href="${ctx.u('projects/')}">Projects</a></li>
            <li><a href="${ctx.u('locations/')}">Locations</a></li>
            <li><a href="${ctx.u('about/')}">About</a></li>
            <li><a href="${ctx.u('accounts/')}">Contractor accounts</a></li>
            <li><a href="${ctx.u('quote/')}">Request a quote</a></li>
          </ul>
        </nav>
        <div class="tb__cell tb__legal">
          <span>© ${new Date().getFullYear()} ${SITE.legal}</span>
          <span>Serving the Pacific Northwest and all of Alaska.</span>
        </div>
        <div class="tb__cell tb__stamp"><span class="label">Sheet</span><b>${sheetName(ctx, title)}</b></div>
        <div class="tb__cell tb__stamp"><span class="label">Yards</span><b class="num">03</b></div>
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
<meta name="theme-color" content="#121311">
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
<link rel="preload" href="${ctx.u('assets/fonts/geistmono-var.woff2')}" as="font" type="font/woff2" crossorigin>
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
${footer(ctx, title)}
${actionBar(ctx)}
${callSheet(ctx)}
</body>
</html>
`;
};
