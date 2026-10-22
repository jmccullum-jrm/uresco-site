import { html } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';
import { layout } from '../lib/layout.mjs';
import { picture, preloadFor, sectionHead, pageHero, quoteBand, stamp } from '../lib/components.mjs';
import { CATEGORIES, BRANDS } from '../data/products.mjs';
import { LOCATIONS, tel } from '../data/locations.mjs';

const askAside = (ctx, c) => html`
  <aside class="aside">
    ${stamp('Pricing & availability', { dark: true })}
    <h2>Get a price on ${c ? c.short.toLowerCase() : 'your list'}</h2>
    <p>Stock varies by yard and season. Send a list or plans for a delivered price, or call the yard nearest your job.</p>
    <a class="btn btn--block" href="${ctx.u('quote/')}">Request a quote ${icon('arrow', { size: 18 })}</a>
    <ul>
      ${LOCATIONS.map((l) => html`<li><a href="${tel(l.phone)}"><span>${l.city}</span><span>${l.phone}</span></a></li>`)}
    </ul>
  </aside>`;

const index = {
  path: 'products/',
  render: (ctx) => layout(ctx, {
    title: 'Products',
    description: 'Framing lumber and timbers, plywood and OSB, engineered wood and trusses, cedar, siding, insulation, forming panels, windows, doors, cabinets and hardware from Uresco Construction Materials.',
    preload: [preloadFor(ctx, 'pine-racking')],
    body: html`
${pageHero(ctx, {
  eyebrow: 'Wholesale building materials',
  title: 'Quality materials to <em>get the job built.</em>',
  lede: 'Our distribution centers carry a full range of products for the commercial and residential builder. Here’s what we stock, line by line.',
  photoKey: 'pine-racking',
  crumbs: [['Products']],
  actions: html`<a class="btn" href="${ctx.u('quote/')}">Request a quote ${icon('arrow', { size: 18 })}</a>`,
})}
<section class="section">
  <div class="wrap">
    <div class="catalog">
      ${CATEGORIES.map((c) => html`
        <article class="catalog__row reveal" id="${c.slug}">
          <a class="catalog__media" href="${ctx.u('products/' + c.slug + '/')}" tabindex="-1" aria-hidden="true">${picture(ctx, c.photo, { sizes: '(min-width: 980px) 300px, (min-width: 640px) 220px, 100vw', alt: '' })}</a>
          <div>
            <h2><a href="${ctx.u('products/' + c.slug + '/')}">${c.name}</a></h2>
            <p>${c.lede}</p>
            <ul class="catalog__items">${c.items.map(([name]) => html`<li>${name}</li>`)}</ul>
          </div>
          <a class="btn btn--sm btn--line" href="${ctx.u('products/' + c.slug + '/')}">Details ${icon('arrow', { size: 16 })}</a>
        </article>`)}
    </div>
    <p class="lede" style="margin-top:2.5rem">We also carry a large variety of other building materials for your construction projects — tarps, poly sheeting, caulking, adhesives, house wraps and more. If it’s not listed, ask.</p>
  </div>
</section>
<section class="section--tight">
  <div class="wrap">
    <div class="brands"><span class="brands__label">Brands we carry</span><ul>${BRANDS.map((b) => html`<li>${b}</li>`)}</ul></div>
  </div>
</section>
${quoteBand(ctx)}
`,
  }),
};

const category = (c) => ({
  path: `products/${c.slug}/`,
  render: (ctx) => layout(ctx, {
    title: c.name,
    description: `${c.lede} ${c.items.map(([n]) => n).join(', ')} from Uresco Construction Materials in Kent, Anchorage and Fairbanks.`,
    preload: [preloadFor(ctx, c.photo)],
    body: html`
${pageHero(ctx, {
  eyebrow: 'Products',
  title: c.name,
  lede: c.lede,
  photoKey: c.photo,
  crumbs: [['Products', 'products/'], [c.short]],
})}
<section class="section">
  <div class="wrap cat">
    <div>
      <p class="lede" style="margin-top:0;margin-bottom:2.5rem;color:var(--ink)">${c.body}</p>
      <dl class="spec">
        ${c.items.map(([name, note]) => html`<div><dt>${name}</dt><dd>${note}</dd></div>`)}
      </dl>
      ${c.brands.length ? html`<div class="brandchips" aria-label="Brands">${c.brands.map((b) => html`<span>${b}</span>`)}</div>` : ''}
    </div>
    ${askAside(ctx, c)}
  </div>
</section>
<section class="section section--bone">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'More products', title: 'The rest of <em>the load.</em>' })}
    <nav class="cat-nav" aria-label="Product categories">
      ${CATEGORIES.map((x) => html`<a href="${ctx.u('products/' + x.slug + '/')}"${x.slug === c.slug ? html` aria-current="page"` : ''}>${x.short}${icon('arrow', { size: 16 })}</a>`)}
    </nav>
  </div>
</section>
${quoteBand(ctx)}
`,
  }),
});

// The old site's URL, kept alive for bookmarks and search results.
const legacy = {
  path: 'products-services/',
  redirect: true,
  render: (ctx) => html`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Products</title>
<meta name="robots" content="noindex"><link rel="canonical" href="https://www.uresco.com/products/">
<meta http-equiv="refresh" content="0; url=${ctx.u('products/')}"></head>
<body><p>This page moved to <a href="${ctx.u('products/')}">Products</a>.</p></body></html>`,
};

export default [index, ...CATEGORIES.map(category), legacy];
