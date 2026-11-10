import { html, raw } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';
import { layout } from '../lib/layout.mjs';
import { eyebrow, sticker, seal, sectionHead, marquee, pageHero, pageHeroPreload, quoteBand, yardsStrip, lineWin, callBtn, pauseBtn } from '../lib/components.mjs';
import { CATEGORIES, BRANDS } from '../data/products.mjs';
import { SERVICES } from '../data/services.mjs';
import { SITE } from '../config.mjs';

// ---- Shared by the index and the nine line pages ----------------------------------------
const no = (i) => String(i + 1).padStart(2, '0');
const lineUrl = (ctx, c) => ctx.u('products/' + c.slug + '/');
// The quote form starts its materials list with whatever arrives in ?product= (see 00-core.js).
const quoteUrl = (ctx, c) => `${ctx.u('quote/')}?product=${encodeURIComponent(c.name)}`;
// An item's anchor on its line page: "Laminated veneer lumber (LVL)" -> "laminated-veneer-lumber-lvl".
const itemId = (name) => name.toLowerCase().replace(/[®™]/g, '').replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
// Trademark signs sit small beside the name instead of at full size inside it.
const marks = (s) => raw(String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/([®™])/g, '<sup>$1</sup>'));

// ---- The index ---------------------------------------------------------------------------
// Words a builder might type that the item names and notes do not spell out. Search only:
// none of this is printed, and every hit still lands on "ask your yard" for sizes and stock.
const ALSO = {
  'Dimensional lumber': 'framing lumber 2x4 2x6 2x8 2x10 2x12 sticks',
  Timbers: 'heavy timber post beam',
  'Pressure-treated lumber': 'pt treated',
  'Fire-retardant-treated lumber': 'frt fire treated',
  Plywood: 'ply subfloor sheathing panel',
  'Oriented strand board (OSB)': 'subfloor sheathing panel',
  'DensGlass® Gold sheathing': 'georgia pacific gp dens glass gypsum',
  'I-joist floor systems': 'ijoist i joist joists',
  'Glulam beams (GLB)': 'glu lam glue laminated beam',
  'Laminated veneer lumber (LVL)': 'header beam rim board',
  'Parallam® PSL beams': 'parallel strand column',
  'Truss packages': 'trusses roof floor',
  'MDO plywood': 'form ply forms concrete forming overlay',
  'HDO plywood': 'form ply forms concrete forming overlay',
  'Cedar siding & trim': 'bevel channel',
  'Cedar decking': 'deck boards',
  'Cedar fencing': 'fence pickets rails posts',
  'Composite decking': 'deck boards stairs',
  'James Hardie® fiber-cement siding': 'hardie fibre cement lap panel trim',
  'CertainTeed siding': 'certain teed trim',
  Roofing: 'roof underlayment',
  'House wraps': 'housewrap house wrap wrb weather barrier',
  'Rigid foam insulation (XPS & EPS)': 'foam board continuous insulation',
  'Fiberglass batt insulation': 'batts fibreglass',
  Drywall: 'gypsum board gyp wallboard',
  Windows: 'window',
  Doors: 'door',
  'Custom cabinets': 'cabinetry casework kitchen',
  'Simpson Strong-Tie® hardware': 'strongtie strong tie hangers ties holdowns connectors joist hanger',
  Fasteners: 'nails screws anchors',
  'Tarps & poly sheeting': 'tarp plastic sheeting',
  'Caulking & adhesives': 'caulk sealant glue adhesive',
};
// What the finder matches against: lower case, no punctuation.
const hay = (...parts) => parts.join(' ').toLowerCase().replace(/[®™]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

// Where each brand lives: [line slug, item index]. The build fails if a brand is added to the
// data without a place here, so the list on the page can never fall behind the data.
const BRAND_AT = {
  'James Hardie': ['siding-exterior', 0, 'James Hardie®'],
  CertainTeed: ['siding-exterior', 1, 'CertainTeed'],
  'Simpson Strong-Tie': ['hardware-supplies', 0, 'Simpson Strong-Tie®'],
  'Georgia-Pacific DensGlass': ['panels-sheathing', 2, 'Georgia-Pacific DensGlass®'],
  Parallam: ['engineered-wood', 3, 'Parallam®'],
};
export const brandHref = (ctx, b) => {
  const [slug, n] = BRAND_AT[b];
  const c = CATEGORIES.find((x) => x.slug === slug);
  return `${lineUrl(ctx, c)}#${itemId(c.items[n][0])}`;
};
const brandRows = (ctx) => BRANDS.map((b) => {
  const at = BRAND_AT[b];
  if (!at) throw new Error(`products: brand "${b}" has no place in BRAND_AT (src/pages/products.mjs)`);
  const i = CATEGORIES.findIndex((c) => c.slug === at[0]); const c = CATEGORIES[i]; const [item, note] = c.items[at[1]];
  return { label: at[2], c, i, item, note, href: `${lineUrl(ctx, c)}#${itemId(item)}` };
});

// The tape between the hero and the index: one word for most of what is on the list below.
const TAPE = ['Lumber', 'Timbers', 'Plywood', 'OSB', 'I-joists', 'Glulam', 'LVL', 'Trusses', 'Cedar', 'Decking', 'Siding', 'Roofing', 'Insulation', 'Drywall', 'Windows', 'Doors', 'Cabinets', 'Fasteners'];

const finder = html`
  <form class="pl-find" role="search" aria-label="Product index" data-find>
    <label class="pl-find__label" for="pl-q">Find a product</label>
    <span class="pl-find__box">
      ${icon('search', { size: 22, cls: 'pl-find__i' })}
      <input class="pl-find__input" id="pl-q" name="q" type="search" placeholder="LVL, cedar, hangers…" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="search" aria-controls="pl-lines" aria-describedby="pl-find-status">
      <button type="button" class="pl-find__clear" data-find-clear hidden>${icon('close', { size: 20 })}<span class="sr-only">Clear the search</span></button>
    </span>
    <p class="pl-find__status" id="pl-find-status" role="status" data-find-status>Type a product, a brand or a part of the building.</p>
  </form>`;

const indexRow = (ctx, c, i) => html`
    <li class="line pl-line" data-find-row="${hay(c.name, c.short, ...c.brands)}">
      <span class="line__no nums" aria-hidden="true">${no(i)}</span>
      <h3 class="line__name"><a class="pl-line__link" href="${lineUrl(ctx, c)}"><span class="sr-only">Line ${i + 1}: </span>${c.short}</a></h3>
      <ul class="line__items pl-line__items">
        ${c.items.map(([name, note]) => html`<li data-find="${hay(name, note, ALSO[name] || '')}"><a href="${lineUrl(ctx, c)}#${itemId(name)}">${marks(name)}</a></li>`)}
      </ul>
      ${lineWin(c)}
      <span class="line__go" aria-hidden="true">${icon('arrow', { size: 22 })}</span>
    </li>`;

const index = {
  path: 'products/',
  render: (ctx) => layout(ctx, {
    title: 'Products',
    description: 'Framing lumber and timbers, plywood and OSB, engineered wood and trusses, cedar, siding, insulation, forming panels, windows, doors, cabinets and hardware from Uresco Construction Materials.',
    preload: [pageHeroPreload(ctx, 'lumber-stack')],
    jsonLd: html`<script type="application/ld+json">${raw(JSON.stringify({
      '@context': 'https://schema.org', '@type': 'ItemList', name: 'Uresco product lines',
      itemListElement: CATEGORIES.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, url: `${SITE.url}/products/${c.slug}/` })),
    }).replace(/</g, '\\u003c'))}</script>`,
    body: html`
${pageHero(ctx, {
  cls: 'pl-top',
  eyebrow: 'Products',
  title: 'What’s on<br><em>the truck.</em>',
  lede: 'Nine product lines for institutional, commercial and residential builders, from framing lumber to the last box of fasteners.',
  photoKey: 'lumber-stack',
  caption: 'Ends of stacked lumber',
  actions: html`<a class="btn" href="#index" data-find-go>Find a product ${icon('arrow', { size: 18, cls: 'pl-down' })}</a>${callBtn(ctx, { cls: 'btn--line' })}${pauseBtn()}`,
})}

${marquee(TAPE, { tone: 'k', tilt: true, slow: true })}

<section class="section field-y pl-index" id="index">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'The index', title: 'Nine lines. <br><em>Look it up.</em>', action: finder })}
  </div>
  <ol class="lines pl-lines" id="pl-lines" data-lines>
    ${CATEGORIES.map((c, i) => indexRow(ctx, c, i))}
  </ol>
  <div class="pl-more" data-find-more>
    <span class="line__no" aria-hidden="true">+</span>
    <h3 class="line__name pl-more__q">Not on the list?</h3>
    <p class="pl-more__a">We carry a large variety of other building materials. If you don’t see it here, ask your yard.</p>
    ${callBtn(ctx, { cls: 'pl-more__call' })}
  </div>
</section>

<section class="section field-k pl-brands">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Manufacturers', title: 'Brands <em>we carry.</em>', lede: 'The brands we carry, and the line each one is in.' })}
  </div>
  <ul class="pl-brandlist">
    ${brandRows(ctx).map((b) => html`<li>
      <a class="pl-brand" href="${b.href}">
        <span class="pl-brand__name">${marks(b.label)}</span>
        <span class="pl-brand__what"><b>${marks(b.item)}</b><span>${b.note}</span></span>
        <span class="pl-brand__line"><span class="nums">${no(b.i)}</span>${b.c.short}</span>
        <span class="line__go" aria-hidden="true">${icon('arrow', { size: 22 })}</span>
      </a></li>`)}
  </ul>
</section>

${quoteBand(ctx, { title: 'Got a list? <br><em>Send it.</em>', body: 'Send a materials list or the drawings. We’ll help with the take-off and quote it.', label: 'Estimates & take-offs' })}
`,
  }),
};

// ---- A product line ----------------------------------------------------------------------
// Three services to show with each line (ids from data/services.mjs). An editorial pick: every
// service is available for every line, and the section links to all of them.
const WITH = {
  'framing-lumber': ['takeoffs', 'delivery', 'remote'],
  'panels-sheathing': ['takeoffs', 'delivery', 'crating'],
  'engineered-wood': ['design', 'takeoffs', 'delivery'],
  'concrete-forming': ['takeoffs', 'delivery', 'shipping'],
  'cedar-decking': ['takeoffs', 'delivery', 'crating'],
  'siding-exterior': ['takeoffs', 'delivery', 'remote'],
  'insulation-drywall': ['takeoffs', 'delivery', 'remote'],
  'windows-doors-cabinets': ['design', 'crating', 'remote'],
  'hardware-supplies': ['takeoffs', 'remote', 'shipping'],
};
// What each line's hero photograph literally shows (data keeps the longer alt text).
const CAPTION = {
  'lumber-stack': 'Ends of stacked lumber', plywood: 'Bundled stacks of plywood', 'framing-joists': 'Roof trusses and wall framing', 'concrete-forms': 'Foundation walls and a concrete pump',
  cedar: 'Vertical cedar siding', siding: 'Lap siding and white-trimmed windows', insulation: 'Fitting fiberglass batts', windows: 'New windows stacked at a house', hardware: 'Black construction screws',
};
const service = (id) => { const s = SERVICES.find((x) => x.id === id); if (!s) throw new Error(`products: no service "${id}" in data/services.mjs`); return s; };
// The headline is the line's full name, set as large as its column allows. FIT is the width, in
// em, of the widest line each name breaks into in the display face (measured in the browser at
// width 125%, weight 900, with "&" kept beside a word). A name not listed here gets an estimate
// from its longest word, on the safe side.
const FIT = {
  'framing-lumber': 6.83, 'panels-sheathing': 7.67, 'engineered-wood': 8.52, 'concrete-forming': 7.26, 'cedar-decking': 7.19,
  'siding-exterior': 6.08, 'insulation-drywall': 7.94, 'windows-doors-cabinets': 6.85, 'hardware-supplies': 7.9,
};
const fit = (c) => FIT[c.slug] || Math.max(...c.name.split(/\s+/).map((w) => w.length)) * 0.9 + (c.name.includes('&') ? 1.4 : 0);

const pagerHalf = (ctx, x, i, dir) => html`
    <a class="pl-pager__half pl-pager__half--${dir}" href="${lineUrl(ctx, x)}" rel="${dir}">
      <span class="line__go" aria-hidden="true">${icon('arrow', { size: 22 })}</span>
      <span class="pl-pager__k">${dir === 'prev' ? 'Previous line' : 'Next line'}</span>
      <span class="pl-pager__name"><span class="nums" aria-hidden="true">${no(i)}</span> ${x.short}</span>
      ${lineWin(x, { cls: 'pl-pager__win' })}
    </a>`;

const category = (c, i) => ({
  path: `products/${c.slug}/`,
  render: (ctx) => {
    const n = CATEGORIES.length;
    const prev = (i + n - 1) % n; const next = (i + 1) % n;
    const others = CATEGORIES.map((x, j) => [x, j]).filter(([, j]) => j !== i);
    const lower = c.short.toLowerCase();
    return layout(ctx, {
      title: c.name,
      description: `${c.lede} ${c.items.map(([name]) => name).join(', ')} from Uresco Construction Materials in Kent, Anchorage and Fairbanks.`,
      preload: [pageHeroPreload(ctx, c.photo)],
      body: html`
${pageHero(ctx, {
  cls: `pl-hero${c.name.length > 30 ? ' pl-hero--s' : ''}`,
  style: `--pl-fit:${fit(c)}`,
  eyebrow: `Product line ${no(i)} of ${no(n - 1)}`,
  title: c.name.replace(/&/g, '&amp;'),
  lede: c.lede,
  photoKey: c.photo,
  caption: CAPTION[c.photo],
  crumbs: [['Products', 'products/'], [c.short]],
  actions: html`<a class="btn" href="${quoteUrl(ctx, c)}">Quote this line ${icon('arrow', { size: 18 })}</a>${callBtn(ctx, { cls: 'btn--line' })}${pauseBtn()}`,
  art: seal(ctx, { around: 'Uresco product line • Uresco product line •', big: no(i), small: `of ${no(n - 1)}`, cls: 'phero__seal' }),
})}

<section class="section field-k pl-spec clip" id="line">
  <div class="divider divider--u" aria-hidden="true"><i class="plx"></i><i class="plx"></i><i class="plx"></i></div>
  <div class="wrap pl-spec__grid">
    <div class="pl-spec__main">
      ${eyebrow(c.short)}
      <h2 class="d2">In <em>this line.</em></h2>
      <p class="lede pl-spec__lede">${c.body}</p>
      <ol class="pl-items">
        ${c.items.map(([name, note], j) => html`<li class="pl-item" id="${itemId(name)}" style="--i:${j}" data-reveal>
          <h3 class="pl-item__name">${marks(name)}</h3>
          <p class="pl-item__note">${note}</p>
        </li>`)}
      </ol>
      ${c.brands.length || c.literature ? html`<div class="pl-makers">
        <p class="pl-makers__k">${c.brands.length > 1 ? 'Brands in this line' : 'Brand in this line'}</p>
        <ul class="pl-makers__brands">${c.brands.map((b, k) => html`<li>${sticker(html`<span>${marks(b)}</span>`, { rot: [-3, 2, -2][k % 3], reveal: false })}</li>`)}</ul>
        ${c.literature ? html`<ul class="pl-makers__lit">${c.literature.map(([label, url]) => html`<li><a class="link" href="${url}" target="_blank" rel="noopener"><span>${marks(label)}</span> ${icon('arrow-up-right', { size: 16 })}<span class="sr-only"> (opens the manufacturer’s site)</span></a></li>`)}</ul>` : ''}
      </div>` : ''}
      <a class="pl-send" href="${quoteUrl(ctx, c)}">
        <span class="pl-send__q">Working from plans?</span>
        <span class="pl-send__a">Send the drawings and we’ll help with the material take-off.</span>
        <span class="line__go" aria-hidden="true">${icon('arrow', { size: 22 })}</span>
      </a>
    </div>
    <div class="pl-ask on-y">
      <p class="pl-ask__k">Sizes, grades, what’s in stock</p>
      <h2 class="pl-ask__t">Ask your yard.</h2>
      <p class="pl-ask__p">This page lists what we carry. For sizes, grades and availability, ask your yard.</p>
      ${yardsStrip(ctx, { stacked: true })}
    </div>
  </div>
</section>

<section class="section field-p pl-round">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'One request', title: 'Round out <em>the load.</em>', lede: `Put ${lower} on one request with the rest of the job. Take-offs, crating and shipping coordination are here when you need them.`, action: html`<a class="link" href="${ctx.u('services/')}">All services ${icon('arrow', { size: 16 })}</a>` })}
    <ul class="svcs pl-svcs">
      ${(WITH[c.slug] || []).map(service).map((s, k) => html`<li style="--i:${k}" data-reveal><a class="svc" href="${ctx.u('services/')}#${s.id}">
        <span class="svc__icon">${icon(s.icon, { size: 30 })}</span>
        <span class="svc__no nums" aria-hidden="true">${String(SERVICES.indexOf(s) + 1).padStart(2, '0')}</span>
        <b class="svc__name">${s.name}</b>
        <span class="svc__text">${s.short}</span>
      </a></li>`)}
    </ul>
    <form class="pl-load" method="get" action="${ctx.u('quote/')}" data-load data-reveal>
      <input type="hidden" name="product" value="${c.name}">
      <fieldset class="pl-load__more">
        <legend class="pl-load__q">What else is on the job?</legend>
        <p class="pl-load__hint">Check the lines you need. They all go on one quote request.</p>
        <div class="pl-picks">
          ${others.map(([x, j]) => html`<label class="pl-pick"><input type="checkbox" value="${x.name}"><span><b class="nums" aria-hidden="true">${no(j)}</b>${x.short}</span></label>`)}
        </div>
      </fieldset>
      <p class="pl-load__plain"><b class="pl-load__q">One request for the job.</b><span class="pl-load__hint">Start with this line and list the rest of the job in the same request.</span></p>
      <div class="pl-load__go">
        <p class="pl-load__sum" aria-live="polite"><b class="nums" data-load-count>1</b><span data-load-unit>line on the load</span></p>
        <button type="submit" class="btn btn--lg btn--yellow"><span data-load-label data-one="Quote this line" data-many="Quote these lines">Quote this line</span> ${icon('arrow', { size: 20 })}</button>
      </div>
    </form>
  </div>
</section>

<nav class="pl-pager field-k" aria-label="Other product lines">
  ${pagerHalf(ctx, CATEGORIES[prev], prev, 'prev')}
  <a class="pl-pager__all" href="${ctx.u('products/')}"><span>All</span><b>9</b><span>lines</span></a>
  ${pagerHalf(ctx, CATEGORIES[next], next, 'next')}
</nav>

${quoteBand(ctx, { href: quoteUrl(ctx, c), title: 'Send the list. <br><em>Get a quote.</em>', body: `Send a materials list or the plans, and we’ll quote ${lower} with the rest of the job.`, label: 'Estimates & take-offs' })}
`,
    });
  },
});

export default [index, ...CATEGORIES.map(category)];
