import { html, raw, esc } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';
import { layout } from '../lib/layout.mjs';
import { preloadFor, sectionHead, pageHero, quoteBand, callLink, photoCredit, openStatus } from '../lib/components.mjs';
import { glyph } from '../lib/drawings.mjs';
import { CATEGORIES, BRANDS } from '../data/products.mjs';
import { SERVICES } from '../data/services.mjs';
import { LOCATIONS, tel } from '../data/locations.mjs';
import { SITE } from '../config.mjs';

/* ------------------------------------------------------------------------------------------
   Editorial pairings. Nothing here is a claim about stock: it is how the site cross-references
   its own nine lines and six services.
   ------------------------------------------------------------------------------------------ */

// What tends to land on the same truck as each line.
const RELATED = {
  'framing-lumber': ['engineered-wood', 'panels-sheathing', 'hardware-supplies'],
  'panels-sheathing': ['framing-lumber', 'siding-exterior', 'insulation-drywall'],
  'engineered-wood': ['framing-lumber', 'panels-sheathing', 'hardware-supplies'],
  'concrete-forming': ['framing-lumber', 'hardware-supplies', 'panels-sheathing'],
  'cedar-decking': ['siding-exterior', 'hardware-supplies', 'framing-lumber'],
  'siding-exterior': ['cedar-decking', 'windows-doors-cabinets', 'insulation-drywall'],
  'insulation-drywall': ['panels-sheathing', 'siding-exterior', 'windows-doors-cabinets'],
  'windows-doors-cabinets': ['siding-exterior', 'insulation-drywall', 'framing-lumber'],
  'hardware-supplies': ['framing-lumber', 'engineered-wood', 'cedar-decking'],
};

// The three services that pair with each line (ids from src/data/services.mjs).
const GOES_WITH = {
  'framing-lumber': ['takeoffs', 'delivery', 'remote'],
  'panels-sheathing': ['takeoffs', 'delivery', 'crating'],
  'engineered-wood': ['design', 'takeoffs', 'delivery'],
  'concrete-forming': ['takeoffs', 'delivery', 'shipping'],
  'cedar-decking': ['takeoffs', 'delivery', 'crating'],
  'siding-exterior': ['takeoffs', 'delivery', 'remote'],
  'insulation-drywall': ['takeoffs', 'delivery', 'remote'],
  'windows-doors-cabinets': ['takeoffs', 'crating', 'remote'],
  'hardware-supplies': ['takeoffs', 'delivery', 'remote'],
};
// A data line for each service card, in the words uresco.com uses.
const SERVICE_TAG = {
  takeoffs: 'From plans or a list',
  design: 'For unique projects',
  delivery: 'Boom truck · Moffett forklift',
  remote: 'Anywhere in Alaska · export',
  shipping: 'Dock · rural Alaska',
  crating: 'Crating · packaging',
};

// What each hero photograph shows. They are stock photographs, so the caption says what is in
// the picture and never where it was taken.
const CAPTION = {
  'framing-lumber': 'Dimensional lumber, stacked',
  'panels-sheathing': 'Plywood panels, bundled',
  'engineered-wood': 'Roof trusses and wall framing',
  'concrete-forming': 'A foundation pour',
  'cedar-decking': 'Vertical cedar siding',
  'siding-exterior': 'Lap siding and trim',
  'insulation-drywall': 'Fiberglass batts between studs',
  'windows-doors-cabinets': 'Windows staged for installation',
  'hardware-supplies': 'Construction screws',
};

// Each named brand: the word that finds its product and its manufacturer link in the data.
const BRAND_KEY = { 'James Hardie': 'Hardie', CertainTeed: 'CertainTeed', 'Simpson Strong-Tie': 'Simpson', 'Georgia-Pacific DensGlass': 'DensGlass', Parallam: 'Parallam' };

// Second entries for the A–Z: trade abbreviations and the other way round a builder might say it.
const ALSO = [
  ['GLB', 'Glulam beams (GLB)'],
  ['LVL', 'Laminated veneer lumber (LVL)'],
  ['OSB', 'Oriented strand board (OSB)'],
  ['PSL beams', 'Parallam® PSL beams'],
  ['XPS & EPS foam', 'Rigid foam insulation (XPS & EPS)'],
  ['FRT lumber', 'Fire-retardant-treated lumber'],
  ['Treated lumber', 'Pressure-treated lumber'],
  ['Trusses', 'Truss packages'],
  ['Fiber-cement siding', 'James Hardie® fiber-cement siding'],
  ['Gypsum sheathing', 'DensGlass® Gold sheathing'],
  ['Batt insulation', 'Fiberglass batt insulation'],
  ['Connectors & hangers', 'Simpson Strong-Tie® hardware'],
  ['Nails & screws', 'Fasteners'],
  ['Poly sheeting', 'Tarps & poly sheeting'],
  ['Adhesives', 'Caulking & adhesives'],
  ['Cabinets', 'Custom cabinets'],
];

// Words people type that are not on the list. Search only: never printed, and no claim about sizes or stock.
const TYPED = {
  'Dimensional lumber': '2x4 2x6 2x8 2x10 2x12 stud studs joist joists rafters',
  Timbers: '4x4 6x6 8x8 posts beams',
  'Pressure-treated lumber': 'pt lumber treated',
  'Fire-retardant-treated lumber': 'frt fire rated treated',
  Plywood: 'cdx ply',
  'Oriented strand board (OSB)': 'osb wafer board',
  'I-joist floor systems': 'tji ijoist i joist floor joists',
  'Glulam beams (GLB)': 'glue lam',
  'Truss packages': 'trusses',
  'MDO plywood': 'forms forming form ply',
  'HDO plywood': 'forms forming form ply',
  'Cedar decking': 'deck boards',
  'Cedar fencing': 'fence',
  'Composite decking': 'deck boards',
  'James Hardie® fiber-cement siding': 'hardieplank hardie',
  Roofing: 'shingles roof underlayment',
  'House wraps': 'tyvek building wrap weather barrier',
  'Rigid foam insulation (XPS & EPS)': 'foam board',
  'Fiberglass batt insulation': 'batts',
  Drywall: 'sheetrock gyp board',
  'Simpson Strong-Tie® hardware': 'joist hanger hangers hurricane ties straps connectors',
  Fasteners: 'nails screws anchor bolts anchors lag',
  'Tarps & poly sheeting': 'plastic vapor barrier visqueen',
  'Caulking & adhesives': 'caulk glue sealant',
};

/* ---------- Small helpers ---------- */
const no = (i) => String(i + 1).padStart(2, '0');
const plain = (s) => s.replace(/[®™]/g, '');
const slug = (s) => plain(s).toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const lineUrl = (ctx, c) => ctx.u(`products/${c.slug}/`);
const quoteUrl = (ctx, c) => `${ctx.u('quote/')}?product=${encodeURIComponent(c.name)}`;
const lower = (c) => c.short.toLowerCase();
// Two-tone line names: the last part of the name is the quieter half.
const twoTone = (name) => {
  const i = name.lastIndexOf(' & ');
  const cut = i > 0 ? i : name.indexOf(' ');
  return `${esc(name.slice(0, cut))} <em>${esc(name.slice(cut + 1))}</em>`;
};
const COUNT = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'];
const LINES = COUNT[CATEGORIES.length] || String(CATEGORIES.length);   // "Nine"
const lines = LINES.toLowerCase();
const EVERY = CATEGORIES.flatMap((c) => c.items.map(([name, note]) => ({ name, note, line: c })));
const findItem = (name) => EVERY.find((e) => e.name === name);

// What the filter searches for each product: its name, its note, and any second name it goes by.
const haystack = (name, note) => [name, note, ...ALSO.filter(([, to]) => to === name).map(([a]) => a), TYPED[name] || ''].map(plain).join(' ').toLowerCase();

/* ==========================================================================================
   /products/ : the index
   ========================================================================================== */

const TRY = ['LVL', 'Plywood', 'Hardie', 'Hangers', 'Decking', 'Insulation'];

const finderBar = () => html`
  <div class="pidx-find jsonly" role="search" aria-label="Filter the product lines">
    <label class="pidx-find__label" for="pidx-q">What are you looking for?</label>
    <p class="pidx-find__count" data-pidx-count role="status">${LINES} product lines</p>
    <div class="pidx-find__field">
      ${icon('search', { size: 20 })}
      <input class="pidx-find__input" id="pidx-q" type="search" data-pidx-q autocomplete="off" autocapitalize="none" spellcheck="false" enterkeyhint="search" placeholder="Product, brand or use">
      <button type="button" class="pidx-find__clear" data-pidx-clear hidden>${icon('close', { size: 16 })}<span class="sr-only">Clear the filter</span></button>
    </div>
    <div class="pidx-find__chips" role="group" aria-label="Examples">
      <span class="pidx-find__try" aria-hidden="true">Try</span>
      ${TRY.map((t) => html`<button type="button" class="chip" data-pidx-try="${t}" aria-pressed="false">${t}</button>`)}
    </div>
  </div>`;

const indexRow = (ctx, c, i) => html`
  <li class="pidx-row rowcard reveal" id="${c.slug}" data-pidx-row data-s="${plain([c.name, c.short, ...c.brands].join(' ')).toLowerCase()}">
    <span class="pidx-row__no" aria-hidden="true">${no(i)}</span>
    ${glyph(c.slug, 'pidx-row__thumb')}
    <div class="pidx-row__main">
      <h3 class="pidx-row__name"><a href="${lineUrl(ctx, c)}">${c.name}</a></h3>
      <p class="pidx-row__lede">${c.lede}</p>
      ${c.brands.length ? html`<ul class="pidx-row__brands brands brands--sm" aria-label="Brands in this line">${c.brands.map((b) => html`<li>${b}</li>`)}</ul>` : ''}
    </div>
    <ul class="pidx-row__items" aria-label="In this line">
      ${c.items.map(([name, note]) => html`<li data-pidx-item data-s="${haystack(name, note)}"><span>${name}</span><small hidden>${note}</small></li>`)}
    </ul>
    <a class="pidx-row__quote link" href="${quoteUrl(ctx, c)}">${icon('plus', { size: 16 })} Quote this line<span class="sr-only">: ${c.name}</span></a>
    <span class="pidx-row__go go" aria-hidden="true">${icon('arrow', { size: 18 })}</span>
  </li>`;

// The A–Z: every product and its second names in one alphabetical list. Each entry names its line.
// `letter` marks the first entry under each letter; `phoneLetter` the first that is not a second
// name, because phones leave the second names out.
const azEntries = (ctx) => {
  const entry = (label, e, also) => ({ label, sub: e.line.short, href: `${lineUrl(ctx, e.line)}#${slug(e.name)}`, also, initial: plain(label)[0].toUpperCase() });
  const list = [...EVERY.map((e) => entry(e.name, e, false)), ...ALSO.map(([label, to]) => entry(label, findItem(to), true))]
    .sort((x, y) => plain(x.label).localeCompare(plain(y.label), 'en', { sensitivity: 'base' }));
  const seen = new Set(), seenMain = new Set();
  for (const e of list) {
    if (!seen.has(e.initial)) { seen.add(e.initial); e.letter = true; }
    if (!e.also && !seenMain.has(e.initial)) { seenMain.add(e.initial); e.phoneLetter = true; }
  }
  return list;
};

const brandRows = (ctx) => BRANDS.map((b) => {
  const key = BRAND_KEY[b] || b;
  const item = EVERY.find((e) => e.name.includes(key));
  const lit = (item?.line.literature || []).find(([label]) => label.includes(key));
  return item ? { name: b, item, lit } : null;
}).filter(Boolean);

const index = {
  path: 'products/',
  render: (ctx) => layout(ctx, {
    title: 'Products',
    description: 'Framing lumber and timbers, plywood and OSB, engineered wood and trusses, cedar, siding, insulation, forming panels, windows, doors, cabinets and hardware from Uresco Construction Materials.',
    preload: [preloadFor(ctx, 'lumber-stack')],
    jsonLd: html`<script type="application/ld+json">${raw(JSON.stringify({
      '@context': 'https://schema.org', '@type': 'ItemList', name: 'Product lines',
      itemListElement: CATEGORIES.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, url: `${SITE.url}/products/${c.slug}/` })),
    }).replace(/</g, '\\u003c'))}</script>`,
    body: html`
<div class="pidx-top">
${pageHero(ctx, {
  eyebrow: 'Product lines',
  title: 'What we carry, <em>line by line.</em>',
  lede: `${LINES} lines of building materials for institutional, commercial and residential builders. For sizes, grades and availability, ask your yard.`,
  photoKey: 'lumber-stack',
  caption: 'Ends of stacked lumber',
  actions: html`<a class="btn btn--lg" href="${ctx.u('quote/')}">Request a quote ${icon('arrow', { size: 18 })}</a>${callLink(ctx, { cls: 'btn--lg btn--line' })}`,
})}
</div>

<section class="section pidx" data-pidx aria-labelledby="pidx-title">
  <div class="wrap">
    <h2 class="sr-only" id="pidx-title">The ${lines} product lines</h2>
    ${finderBar()}
    <p class="pidx-cols" aria-hidden="true"><span>No.</span><span>Line</span><span>In the line</span></p>
    <ol class="pidx-list">
      ${CATEGORIES.map((c, i) => indexRow(ctx, c, i))}
    </ol>
    <div class="pidx-none" data-pidx-none hidden>
      <p class="pidx-none__title">Nothing on the list by that name.</p>
      <p>That does not mean we cannot get it. Ask your yard, or send the list and we will tell you.</p>
      <div class="actions">${callLink(ctx, { cls: 'btn--dark' })}<a class="btn btn--line" href="${ctx.u('quote/')}">Send a materials list ${icon('arrow', { size: 18 })}</a></div>
    </div>
    <div class="callout pidx-more reveal" data-pidx-more>
      <span class="callout__icon">${icon('plus', { size: 22 })}</span>
      <p><strong>Not on the list?</strong> We also carry a large variety of other building materials. If the job needs it, ask your yard.</p>
      <a class="link" href="${ctx.u('quote/')}">Send a materials list ${icon('arrow', { size: 16 })}</a>
    </div>
  </div>
</section>

<section class="section section--ice">
  <div class="wrap faq-wrap">
    <div class="pidx-brands__head">
      ${sectionHead({ eyebrow: 'Brands', title: 'The brands <em>we carry.</em>' })}
      <p class="lede">The line each one belongs to, and a way to the manufacturer’s own specs and installation guides.</p>
    </div>
    <ul class="pidx-brandlist">
      ${brandRows(ctx).map(({ name, item, lit }) => html`
        <li class="pidx-brand reveal">
          <h3 class="pidx-brand__name">${name}</h3>
          <p class="pidx-brand__what">${item.name}. <span>${item.note}</span></p>
          <a class="link pidx-brand__line" href="${lineUrl(ctx, item.line)}#${slug(item.name)}"><span class="sr-only">${name}: in </span>${item.line.short} ${icon('arrow', { size: 16 })}</a>
          ${lit ? html`<a class="pidx-brand__lit" href="${lit[1]}" target="_blank" rel="noopener">Specs &amp; guides<span class="sr-only"> from the manufacturer of ${name} (opens the manufacturer’s site)</span> ${icon('arrow-up-right', { size: 15 })}</a>` : ''}
        </li>`)}
    </ul>
  </div>
</section>

<section class="section pidx-azs">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'A to Z', title: 'Every product, <em>alphabetical.</em>', lede: 'The same list the other way round. Each entry opens its line at that product.' })}
    <ul class="pidx-az">
      ${azEntries(ctx).map((e) => html`<li class="${[e.letter && 'pidx-az__first', e.phoneLetter && 'pidx-az__pfirst', e.also && 'pidx-az__also'].filter(Boolean).join(' ')}">${e.letter || e.phoneLetter ? html`<span class="pidx-az__letter${e.letter ? '' : ' pidx-az__letter--phone'}${e.phoneLetter ? '' : ' pidx-az__letter--wide'}" aria-hidden="true">${e.initial}</span>` : ''}<a href="${e.href}"><span class="pidx-az__name">${e.label}</span><i class="pidx-az__dots" aria-hidden="true"></i><small><span class="sr-only">, in </span>${e.sub}</small></a></li>`)}
    </ul>
  </div>
</section>
${quoteBand(ctx, { eyebrow: 'Pricing & availability', title: 'Have a list? <em>Send it over.</em>', body: 'Send plans or a materials list and we will quote it and work out the freight with you. For sizes, grades and availability, ask your yard.' })}
`,
  }),
};

/* ==========================================================================================
   /products/<slug>/ : one line. Nine pages from this template.
   ========================================================================================== */

// The shared page hero, with the arrows beside the eyebrow and what is in the line laid over the photograph.
const lineHero = (ctx, c, i, prev, next) => pageHero(ctx, {
  cls: 'pline-hero',
  crumbs: [['Products', 'products/'], [c.short]],
  eyebrow: html`<span class="pline-hero__w">Product </span>line <i>·</i> ${no(i)} / ${no(CATEGORIES.length - 1)}`,
  eyebrowAside: html`<nav class="pline-step" aria-label="Step through the product lines">
    <a class="go go--raised go--back" href="${lineUrl(ctx, prev)}" rel="prev">${icon('arrow', { size: 16 })}<span class="sr-only">Previous line: ${prev.name}</span></a>
    <a class="go go--raised" href="${lineUrl(ctx, next)}" rel="next">${icon('arrow', { size: 16 })}<span class="sr-only">Next line: ${next.name}</span></a>
  </nav>`,
  title: twoTone(c.name),
  lede: c.lede,
  note: html`<p class="pline-hero__has"><b>In this line</b> ${c.items.map(([n]) => n).join(' · ')}</p>`,
  photoKey: c.photo,
  actions: html`
    <a class="btn btn--lg pline-qbtn" href="${quoteUrl(ctx, c)}" data-pline-quote>Request a quote on ${lower(c)} ${icon('arrow', { size: 18 })}</a>
    ${callLink(ctx, { cls: 'btn--lg btn--line pline-hero__call' })}`,
  figure: html`<figcaption class="pline-hero__over">
    ${CAPTION[c.slug] ? html`<p class="frame__cap pline-hero__cap">${CAPTION[c.slug]}${photoCredit(c.photo)}</p>` : html`<span></span>`}
    <div class="glass pline-hero__panel">
      <p class="glass__lab">In this line</p>
      <ul>${c.items.map(([n]) => html`<li>${n}</li>`)}</ul>
    </div>
  </figcaption>`,
});

// The yards and the quote: where "ask your yard" leads.
const askCard = (ctx, c) => html`
  <div class="pline-ask">
    <p class="eyebrow">Sizes, grades &amp; availability</p>
    <h3 class="pline-ask__title">Ask your yard.</h3>
    <p class="pline-ask__text">Call the yard nearest the job, or send plans or a list. We will quote it and work out the freight with you.</p>
    <ul class="pline-ask__yards">
      ${LOCATIONS.map((l) => html`<li>
        <span class="pline-ask__who"><b>${l.city}</b>${openStatus(l)}</span>
        <a class="pline-ask__num" href="${tel(l.phone)}">${icon('phone', { size: 16 })}<span class="sr-only">Call ${l.city}: </span>${l.phone}</a>
      </li>`)}
    </ul>
    <a class="btn btn--block pline-qbtn" href="${quoteUrl(ctx, c)}" data-pline-quote>Request a quote on ${lower(c)} ${icon('arrow', { size: 18 })}</a>
    <p class="pline-ask__picked jsonly" data-pline-status>Add products from the list and the quote form starts with them.</p>
  </div>`;

const category = (c, i) => {
  const prev = CATEGORIES[(i + CATEGORIES.length - 1) % CATEGORIES.length];
  const next = CATEGORIES[(i + 1) % CATEGORIES.length];
  // A line added to the data without a pairing here still gets the three most general services.
  const services = (GOES_WITH[c.slug] || ['takeoffs', 'delivery', 'remote']).map((id) => SERVICES.find((s) => s.id === id)).filter(Boolean);
  const related = (RELATED[c.slug] || []).map((s) => CATEGORIES.find((x) => x.slug === s));
  return {
    path: `products/${c.slug}/`,
    render: (ctx) => layout(ctx, {
      title: c.name,
      description: `${c.lede} ${c.items.map(([n]) => plain(n)).join(', ')} from Uresco Construction Materials in Kent, Anchorage and Fairbanks.`,
      preload: [preloadFor(ctx, c.photo)],
      body: html`
${lineHero(ctx, c, i, prev, next)}

<section class="section pline" data-pline data-line="${c.name}" data-quote="${ctx.u('quote/')}">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Product by product', title: `What we carry <em>in ${esc(lower(c))}.</em>`, lede: c.body })}
    <div class="pline-grid">
      <div class="pline-main">
        <div class="pline-list">
          <p class="pline-list__bar"><span>Line ${no(i)}</span><span class="jsonly">Pick what you need</span></p>
          <ol class="pline-list__rows">
            ${c.items.map(([name, note], j) => html`
              <li class="pline-item" id="${slug(name)}">
                <span class="pline-item__no" aria-hidden="true">${no(j)}</span>
                <div class="pline-item__text">
                  <h3 class="pline-item__name">${name}</h3>
                  <p>${note}</p>
                </div>
                <button type="button" class="pline-item__pick jsonly" data-pline-pick="${name}">
                  <span class="pline-item__plus">${icon('plus', { size: 16 })}</span><span class="pline-item__check">${icon('check', { size: 16 })}</span>
                  <span class="pline-item__label"><span class="pline-item__add">Add<span class="pline-item__wide"> to quote</span></span><span class="pline-item__on"><span class="pline-item__wide">On the quote</span><span class="pline-item__narrow">Added</span></span><span class="sr-only">: ${plain(name)}</span><span class="sr-only pline-item__on"> (remove)</span></span>
                </button>
              </li>`)}
          </ol>
          <div class="pline-tray jsonly">
            <p class="pline-tray__text" data-pline-status aria-live="polite">Add products and the quote form starts with them.</p>
            <div class="pline-tray__acts" data-pline-acts hidden>
              <button type="button" class="pline-tray__clear" data-pline-clear>Clear the list</button>
              <a class="btn btn--dark pline-tray__go" href="${quoteUrl(ctx, c)}" data-pline-quote>Open the quote ${icon('arrow', { size: 16 })}</a>
            </div>
          </div>
          <div class="pline-list__foot">
            <span class="pline-list__q" aria-hidden="true">${icon('plus', { size: 18 })}</span>
            <p><b>Something else in this line?</b> If the job calls for it and it is not listed here, ask your yard.</p>
            ${callLink(ctx, { cls: 'btn--line pline-list__ask', label: 'Ask your yard', size: 16 })}
          </div>
        </div>
        ${c.brands.length ? html`
        <div class="pline-brands">
          <div>
            <h3 class="pline-brands__h">Brand${c.brands.length > 1 ? 's' : ''} in this line</h3>
            <ul class="pline-brands__list brands brands--ink">${c.brands.map((b) => html`<li>${b}</li>`)}</ul>
          </div>
          ${c.literature ? html`<div>
            <h3 class="pline-brands__h">From the manufacturer</h3>
            <ul class="pline-brands__lit">${c.literature.map(([label, url]) => html`<li><a href="${url}" target="_blank" rel="noopener">${icon('file', { size: 17 })}<span>${label}<span class="sr-only"> (opens the manufacturer’s site)</span></span>${icon('arrow-up-right', { size: 15 })}</a></li>`)}</ul>
          </div>` : ''}
        </div>` : ''}
      </div>
      ${askCard(ctx, c)}
    </div>
  </div>
</section>

<section class="section section--ice">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Services for this line', title: 'What goes <em>with the order.</em>', lede: `Three of our services that pair with ${lower(c)}. Ask for any of them when you send the list.`, action: html`<a class="link" href="${ctx.u('services/')}">All ${(COUNT[SERVICES.length] || String(SERVICES.length)).toLowerCase()} services ${icon('arrow', { size: 16 })}</a>` })}
    <div class="modes">
      ${services.map((s) => html`<article class="mode pline-svc has-go reveal">
        <span class="mode__icon">${icon(s.icon, { size: 24 })}</span>
        <h3 class="h3"><a href="${ctx.u('services/')}#${s.id}">${s.name}</a></h3>
        <p class="mode__where">${SERVICE_TAG[s.id]}</p>
        <p>${s.short}</p>
        <span class="pline-svc__go go" aria-hidden="true">${icon('arrow', { size: 18 })}</span>
      </article>`)}
    </div>
  </div>
</section>

<section class="section pline-more">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Related lines', title: 'The rest <em>of the load.</em>', lede: 'A list rarely stops at one line. These are the three to check next.', action: html`<a class="link" href="${ctx.u('products/')}">All ${lines} lines ${icon('arrow', { size: 16 })}</a>` })}
    <ul class="pline-rel">
      ${related.map((x) => html`<li class="reveal"><a class="pline-rel__card" href="${lineUrl(ctx, x)}">
        ${glyph(x.slug, 'pline-rel__thumb')}
        <span class="pline-rel__text"><b>${x.short}</b><small>${x.items.map(([n]) => n).join(' · ')}</small></span>
        <span class="pline-rel__go go" aria-hidden="true">${icon('arrow', { size: 18 })}</span>
      </a></li>`)}
    </ul>
    <nav class="pline-pager" aria-label="Previous and next product line">
      <a class="pline-pager__link" rel="prev" href="${lineUrl(ctx, prev)}">
        <span class="pline-pager__go go go--raised go--lg go--back" aria-hidden="true">${icon('arrow', { size: 18 })}</span>
        <span class="pline-pager__text"><small>Previous<span class="pline-pager__w"> line</span> <i>·</i> ${no(CATEGORIES.indexOf(prev))}</small><b><span class="pline-pager__full">${prev.name}</span><span class="pline-pager__short">${prev.short}</span></b></span>
      </a>
      <a class="pline-pager__link pline-pager__link--next" rel="next" href="${lineUrl(ctx, next)}">
        <span class="pline-pager__text"><small>Next<span class="pline-pager__w"> line</span> <i>·</i> ${no(CATEGORIES.indexOf(next))}</small><b><span class="pline-pager__full">${next.name}</span><span class="pline-pager__short">${next.short}</span></b></span>
        <span class="pline-pager__go go go--raised go--lg" aria-hidden="true">${icon('arrow', { size: 18 })}</span>
      </a>
    </nav>
  </div>
</section>

${quoteBand(ctx, {
  eyebrow: 'Pricing & availability',
  title: `Request a quote <em>on ${esc(lower(c))}.</em>`,
  body: 'Send plans or a list and we will quote it and work out the freight with you. The form opens with this line already on it.',
  items: c.items.map(([n]) => plain(n)),
  actions: html`<a class="btn btn--lg pline-qbtn" href="${quoteUrl(ctx, c)}" data-pline-quote>Request a quote on ${lower(c)} ${icon('arrow', { size: 18 })}</a>`,
})}
`,
    }),
  };
};

export default [index, ...CATEGORIES.map(category)];
