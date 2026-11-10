import { html, raw, esc } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';
import { drawing, glyph, keyElevation, KEY_VIEW, KEY_TAGS } from '../lib/drawings.mjs';
import { layout } from '../lib/layout.mjs';
import { pageHero, sectionHead, quoteBand, quoteHref, sequence, openStatus, lineNo, packingList } from '../lib/components.mjs';
import { CATEGORIES, BRANDS } from '../data/products.mjs';
import { SERVICES } from '../data/services.mjs';
import { LOCATIONS, tel } from '../data/locations.mjs';

// ---------- Shared by the index and the nine line pages ----------

const two = (n) => String(n).padStart(2, '0');
const lineUrl = (ctx, c) => ctx.u('products/' + c.slug + '/');
// The quote form starts its materials list with whatever ?product= carries, so a line's name goes across.
const quoteUrl = (ctx, c) => quoteHref(ctx, { product: c.name });
const plain = (s) => s.replace(/[®™]/g, '');
// Anchor for an item on its line page: "Glulam beams (GLB)" → glulam-beams-glb
const anchor = (name) => plain(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// "Ask your yard": the three numbers, each one tap away, with the live lamp where the script is running.
const yardTels = (cls) => html`
  <ul class="${cls}">
    ${LOCATIONS.map((l) => html`<li><a href="${tel(l.phone)}"><span class="${cls}-city"><span>${l.city}<small>, ${l.state}</small></span>${openStatus(l)}</span><span class="num">${l.phone}</span></a></li>`)}
  </ul>`;

// ---------- The index: /products/ ----------

// Extra index entries: the abbreviations and second words a builder looks under.
// Each points at an item already in the data (or at a whole line); nothing here adds a product.
const ALSO = [
  ['Adhesives, construction', 'hardware-supplies', 'Caulking & adhesives'],
  ['Batt insulation', 'insulation-drywall', 'Fiberglass batt insulation'],
  ['Connectors, structural', 'hardware-supplies', 'Simpson Strong-Tie® hardware'],
  ['Decking, cedar & composite', 'cedar-decking', 'Cedar decking'],
  ['EPS rigid foam', 'insulation-drywall', 'Rigid foam insulation (XPS & EPS)'],
  ['Fiber-cement siding', 'siding-exterior', 'James Hardie® fiber-cement siding'],
  ['Forming panels (MDO & HDO)', 'concrete-forming', null],
  ['FRT lumber', 'framing-lumber', 'Fire-retardant-treated lumber'],
  ['Gypsum sheathing', 'panels-sheathing', 'DensGlass® Gold sheathing'],
  ['Hangers, ties & holdowns', 'hardware-supplies', 'Simpson Strong-Tie® hardware'],
  ['Nails, screws & anchors', 'hardware-supplies', 'Fasteners'],
  ['Poly sheeting', 'hardware-supplies', 'Tarps & poly sheeting'],
  ['PSL', 'engineered-wood', 'Parallam® PSL beams'],
  ['Siding, cedar', 'cedar-decking', 'Cedar siding & trim'],
  ['Siding, fiber-cement', 'siding-exterior', 'James Hardie® fiber-cement siding'],
  ['XPS rigid foam', 'insulation-drywall', 'Rigid foam insulation (XPS & EPS)'],
];
for (const [term, slug, item] of ALSO) {
  const c = CATEGORIES.find((x) => x.slug === slug);
  if (!c || (item && !c.items.some(([n]) => n === item))) throw new Error(`Index entry "${term}" points at something that is not in the data`);
}

// Every item, plus the entries above, in alphabetical order and grouped by first letter.
const ENTRIES = [
  ...CATEGORIES.flatMap((c, i) => c.items.map(([name]) => ({ term: name, c, i, item: name }))),
  ...ALSO.map(([term, slug, item]) => { const i = CATEGORIES.findIndex((x) => x.slug === slug); return { term, c: CATEGORIES[i], i, item }; }),
].sort((a, b) => plain(a.term).localeCompare(plain(b.term), 'en', { sensitivity: 'base' }));
const LETTERS = [...new Set(ENTRIES.map((e) => plain(e.term)[0].toUpperCase()))];

// What the Find field searches for each item: its name, its note and any index entry that points at it.
const keysFor = (c, [name, note]) => [name, note, ...ALSO.filter(([, slug, item]) => slug === c.slug && item === name).map(([t]) => t)].map(plain).join(' ');
const lineKeys = (c) => [c.name, c.short, ...c.brands, ...ALSO.filter(([, slug, item]) => slug === c.slug && !item).map(([t]) => t)].map(plain).join(' ');

// Brands, each tied to the item and the line it is on, in line order.
const BRAND_KEY = { 'James Hardie': 'James Hardie', CertainTeed: 'CertainTeed', 'Simpson Strong-Tie': 'Simpson', 'Georgia-Pacific DensGlass': 'DensGlass', Parallam: 'Parallam' };
const BRAND_ROWS = BRANDS.map((b) => {
  const key = BRAND_KEY[b];
  const i = CATEGORIES.findIndex((c) => c.items.some(([n]) => n.includes(key)));
  if (!key || i < 0) throw new Error(`Brand "${b}" is not on any line`);
  const c = CATEGORIES[i];
  return { name: b, c, i, item: c.items.find(([n]) => n.includes(key)), lit: (c.literature || []).find(([label]) => label.includes(key)) };
}).sort((a, b) => a.i - b.i);

// ---------- The key elevation (Dwg 000) ----------
// The drawing is keyElevation() in lib/drawings.mjs; the numbered tags are links set over it in percent.
// The plate is written twice, as the hero's object from 1000 px and after the list below that (one is display:none at any width):
// on a phone the list has to come first, and moving a block of links with CSS order would leave the keyboard going the old way.
const keyPlate = (ctx, cls) => html`
      <figure class="dwg pidx-key ${cls}" aria-label="Key drawing: one building with each product line numbered">
        <p class="dwg__bar label"><span>Dwg 000</span><span>Key to the nine lines</span><span class="dwg__nts">Typical · not to scale</span></p>
        <div class="dwg__canvas">
          <div class="pidx-key__sheet">
            ${keyElevation()}
            <ol class="pidx-key__tags">
              ${CATEGORIES.map((c, i) => html`<li><a class="pidx-key__tag" data-k="${i + 1}" href="${lineUrl(ctx, c)}" style="left:${(((KEY_TAGS[i].at[0] - KEY_VIEW.x) / KEY_VIEW.w) * 100).toFixed(2)}%;top:${(((KEY_TAGS[i].at[1] - KEY_VIEW.y) / KEY_VIEW.h) * 100).toFixed(2)}%"><span class="num" aria-hidden="true">${i + 1}</span><span class="sr-only">Line ${lineNo(i)}: ${c.name}</span></a></li>`)}
            </ol>
          </div>
        </div>
        <figcaption class="pidx-key__cap label">One building, every line. Tap a number to open it.</figcaption>
      </figure>`;

const WAYS = [
  ['by-line', 'By line', two(CATEGORIES.length), 'lines'],
  ['by-name', 'By name', two(ENTRIES.length), 'entries'],
  ['by-brand', 'By brand', two(BRANDS.length), 'brands'],
];

const index = {
  path: 'products/',
  render: (ctx) => layout(ctx, {
    title: 'Products',
    description: 'Framing lumber and timbers, plywood and OSB, engineered wood and trusses, cedar, siding, insulation, forming panels, windows, doors, cabinets and hardware from Uresco Construction Materials.',
    body: html`
${pageHero(ctx, {
  cls: 'pidx-hero',
  crumbs: [['Products']],
  meta: 'Nine product lines',
  title: 'Every product line, <em>on one sheet.</em>',
  lede: 'Nine lines, framing lumber to fasteners. Find yours by line, by name or by brand.',
  after: html`
        <nav class="pidx-toc" aria-label="On this sheet">
          <ol>
            ${WAYS.map(([id, name, n, unit], i) => html`<li><a href="#${id}">
              <span class="bub num" aria-hidden="true">${two(i + 1)}</span>
              <span class="pidx-toc__name">${name}</span>
              <span class="pidx-toc__n label"><b class="num">${n}</b> ${unit}</span>
              ${icon('arrow', { size: 16, cls: 'pidx-toc__go' })}
            </a></li>`)}
          </ol>
        </nav>`,
  media: keyPlate(ctx, 'pidx-key--hero'),
})}

<section class="section section--flush pidx-sec" id="by-line" aria-labelledby="by-line-t">
  <div class="wrap">
    <div class="pidx-barwrap" data-reveal>
      <div class="shead__bar pidx-bar">
        <span class="bub num" aria-hidden="true">01</span>
        <h2 class="label shead__label" id="by-line-t">By line</h2>
        <form class="pidx-find" role="search" data-find>
          <label class="label" for="find">Find</label>
          <input id="find" type="search" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="search" placeholder="LVL, Hardie, cedar…" aria-controls="lines" aria-describedby="find-status">
          <button type="reset" aria-label="Clear the search" hidden>${icon('close', { size: 16 })}</button>
        </form>
        <p class="label shead__meta" id="find-status" role="status" data-find-status>Nine lines</p>
      </div>
    </div>
    <div class="pidx-cols label" aria-hidden="true"><span>Line</span><span>Product line</span><span>On this line</span><span>Brands</span></div>
    <ol class="pidx-lines" id="lines">
      ${CATEGORIES.map((c, i) => html`
      <li class="pidx-line" id="${c.slug}" data-line="${i + 1}" data-find-row="${lineKeys(c)}">
        <span class="pidx-line__no num" aria-hidden="true">${lineNo(i)}</span>
        <span class="pidx-line__glyph">${glyph(c.slug, { size: 44 })}</span>
        <h3 class="pidx-line__name"><a href="${lineUrl(ctx, c)}"><span class="sr-only">Line ${lineNo(i)}: </span>${c.name}</a></h3>
        <ul class="pidx-line__items">${c.items.map((it) => html`<li><span data-k="${keysFor(c, it)}">${it[0]}</span></li>`)}</ul>
        ${c.brands.length ? html`<p class="pidx-line__brands label"><span class="sr-only">Brands: </span>${c.brands.map((b) => html`<span>${b}</span>`)}</p>` : html`<p class="pidx-line__brands pidx-line__brands--none label" aria-hidden="true">—</p>`}
        <span class="pidx-line__go" aria-hidden="true">${icon('arrow', { size: 18 })}</span>
      </li>`)}
      <li class="pidx-none" data-find-none hidden>
        <span class="pidx-line__no num" aria-hidden="true">?</span>
        <p>No line carries <q></q>.</p>
      </li>
    </ol>
    <div class="pidx-ask">
      <span class="pidx-line__no num" aria-hidden="true">+</span>
      <p><b>Not on the list?</b> We carry a large variety of other building materials. For that, and for sizes, grades and what is in stock, ask your yard.</p>
      ${yardTels('pidx-tels')}
    </div>
    ${keyPlate(ctx, 'pidx-key--after')}
  </div>
</section>

<section class="section section--panel" id="by-name">
  <div class="wrap">
    ${sectionHead({ no: '02', eyebrow: 'By name', meta: 'A–Z', title: 'Know the name? <em>Find the line.</em>', lede: 'Every item in alphabetical order, with the abbreviations the trade uses. The number is the line it is on.' })}
    <div class="pidx-az">
      ${LETTERS.map((L) => html`
      <div class="pidx-az__grp">
        <h3 class="pidx-az__ltr num">${L}</h3>
        <ul>
          ${ENTRIES.filter((e) => plain(e.term)[0].toUpperCase() === L).map((e) => html`<li><a href="${lineUrl(ctx, e.c)}${e.item ? '#' + anchor(e.item) : ''}"><span class="pidx-az__term">${e.term}</span><span class="pidx-az__lead" aria-hidden="true"></span><span class="pidx-az__ref num"><span class="sr-only">line </span>${lineNo(e.i)}</span></a></li>`)}
        </ul>
      </div>`)}
    </div>
  </div>
</section>

<section class="section" id="by-brand">
  <div class="wrap">
    ${sectionHead({ no: '03', eyebrow: 'By brand', title: 'Brands <em>we carry.</em>', lede: 'The manufacturers we name, and the line each one is on. Literature opens on the manufacturer’s own site.' })}
    <div class="pidx-brands">
      <div class="pidx-brands__cols label" aria-hidden="true"><span>Line</span><span>Brand</span><span>Carried as</span><span>Go to</span></div>
      ${BRAND_ROWS.map((b) => html`
      <article class="pidx-brand">
        <span class="pidx-line__no num" aria-hidden="true">${lineNo(b.i)}</span>
        <h3 class="pidx-brand__name">${b.name}</h3>
        <p class="pidx-brand__what"><b>${b.item[0]}</b> ${b.item[1]}</p>
        <p class="pidx-brand__links">
          <a class="link" href="${lineUrl(ctx, b.c)}#${anchor(b.item[0])}">Line ${lineNo(b.i)}<span class="sr-only">: ${b.c.name}</span> ${icon('arrow', { size: 14 })}</a>
          ${b.lit ? html`<a class="link" href="${b.lit[1]}" target="_blank" rel="noopener">Literature<span class="sr-only">: ${b.name} (opens the manufacturer’s site)</span> ${icon('arrow-up-right', { size: 14 })}</a>` : ''}
        </p>
      </article>`)}
    </div>
  </div>
</section>
${quoteBand(ctx, { no: '04' })}
`,
  }),
};

// ---------- A product line: /products/<slug>/ ----------

// Other lines a job usually needs alongside this one. The previous and next lines are on the pager directly below,
// so they are left out here: the section names five different lines, never the same one twice.
const RELATED = {
  'framing-lumber': ['engineered-wood', 'concrete-forming', 'insulation-drywall'],
  'panels-sheathing': ['insulation-drywall', 'siding-exterior', 'hardware-supplies'],
  'engineered-wood': ['framing-lumber', 'hardware-supplies', 'insulation-drywall'],
  'concrete-forming': ['framing-lumber', 'hardware-supplies', 'panels-sheathing'],
  'cedar-decking': ['hardware-supplies', 'framing-lumber', 'windows-doors-cabinets'],
  'siding-exterior': ['windows-doors-cabinets', 'panels-sheathing', 'hardware-supplies'],
  'insulation-drywall': ['panels-sheathing', 'framing-lumber', 'hardware-supplies'],
  'windows-doors-cabinets': ['siding-exterior', 'framing-lumber', 'cedar-decking'],
  'hardware-supplies': ['engineered-wood', 'cedar-decking', 'concrete-forming'],
};

// The three that suit each line best. Every service is open to every line; these are the usual company.
// `why` is general knowledge about the material, not a claim about Uresco.
const SERVES = {
  'framing-lumber': { ids: ['takeoffs', 'remote', 'delivery'], why: 'A framing package starts with a count off the plans.' },
  'panels-sheathing': { ids: ['takeoffs', 'crating', 'delivery'], why: 'Sheets are counted off the plans and travel best banded and wrapped.' },
  'engineered-wood': { ids: ['takeoffs', 'design', 'delivery'], why: 'Long members get worked out before they get ordered.' },
  'concrete-forming': { ids: ['takeoffs', 'shipping', 'delivery'], why: 'Forming panels have to be there before the pour.' },
  'cedar-decking': { ids: ['takeoffs', 'crating', 'delivery'], why: 'Finish boards show every scuff.' },
  'siding-exterior': { ids: ['takeoffs', 'remote', 'delivery'], why: 'The envelope has to get there with the rest of the building.' },
  'insulation-drywall': { ids: ['takeoffs', 'shipping', 'delivery'], why: 'Foam is bulky and drywall breaks at the corners, so both take planning to move.' },
  'windows-doors-cabinets': { ids: ['design', 'crating', 'remote'], why: 'Glass and casework are the easiest things on a load to damage.' },
  'hardware-supplies': { ids: ['takeoffs', 'remote', 'delivery'], why: 'It is the smallest line on the load, and the crew stops without it.' },
};

// The name as a headline: the stroke of highlighter goes under the last member of the list.
const titleOf = (c) => {
  const at = c.name.lastIndexOf(' & ');
  const cut = at > 0 ? at + 2 : c.name.indexOf(' ');
  return `${esc(c.name.slice(0, cut))} <em>${esc(c.name.slice(cut + 1))}</em>`;
};

const category = (c, i) => {
  const no = lineNo(i), n = CATEGORIES.length;
  const prev = CATEGORIES[(i + n - 1) % n], next = CATEGORIES[(i + 1) % n];
  const services = SERVICES.filter((s) => SERVES[c.slug].ids.includes(s.id));
  const related = RELATED[c.slug].map((slug) => CATEGORIES.find((x) => x.slug === slug));
  return {
    path: `products/${c.slug}/`,
    render: (ctx) => layout(ctx, {
      title: c.name,
      description: `${c.lede} ${c.items.map(([name]) => name).join(', ')} from Uresco Construction Materials in Kent, Anchorage and Fairbanks.`,
      body: html`
${pageHero(ctx, {
  cls: 'pln-hero',
  crumbs: [['Products', 'products/'], [c.short]],
  meta: html`Line ${no} of ${lineNo(n - 1)}`,
  pre: html`<p class="pln-mark">${glyph(c.slug, { size: 44 })}<span class="sr-only">Line </span><span class="num">${no}</span> <span class="label">of nine lines</span></p>`,
  title: titleOf(c),
  lede: c.lede,
  actions: html`<a class="btn" href="${quoteUrl(ctx, c)}">Quote this line ${icon('arrow', { size: 18 })}</a><a class="btn btn--line pln-hero__call" href="${ctx.u('locations/')}" data-open="call-sheet">${icon('phone', { size: 18 })} Call a yard</a>`,
  media: html`
      <figure class="dwg pln-hero__dwg">
        <p class="dwg__bar label"><span>Dwg ${no}</span><span>${c.short}</span><span class="dwg__nts">Typical · not to scale</span></p>
        <div class="dwg__canvas">${drawing(c.slug, { id: 'pln' })}</div>
        <p class="dwg__note">Typical sizes shown. Ask your yard what is in stock.</p>
      </figure>`,
  below: html`
    <nav class="pln-rule" aria-label="All nine product lines" data-reveal>
      <ol>
        ${CATEGORIES.map((x, j) => html`<li><a href="${lineUrl(ctx, x)}"${j === i ? html` aria-current="page"` : ''}><span class="num">${lineNo(j)}</span><span class="pln-rule__name">${x.short}</span></a></li>`)}
        <li class="pln-rule__all"><a href="${ctx.u('products/')}"><span class="num">All</span><span class="pln-rule__name">All nine lines</span></a></li>
      </ol>
    </nav>`,
})}

<section class="section pln-sec" id="items">
  <div class="wrap">
    ${sectionHead({ no: '01', eyebrow: 'On this line', meta: `${two(c.items.length)} items`, title: `Line ${no}, <em>item by item.</em>`, lede: c.body })}
    <div class="pln-body">
      <div class="pln-list">
        <div class="pln-cols label" aria-hidden="true"><span>Item</span><span>Product</span><span>What it is</span></div>
        <ol class="pln-items">
          ${c.items.map(([name, note], k) => html`
          <li class="pln-item" id="${anchor(name)}">
            <span class="pln-item__no num"><span class="sr-only">Item </span>${no}.${k + 1}</span>
            <h3 class="pln-item__name">${raw(esc(name).replace(/Strong-Tie®?/, (m) => `<span class="pln-nb">${m}</span>`))}</h3>
            <p class="pln-item__note">${note}</p>
          </li>`)}
        </ol>
        ${c.brands.length ? html`
        <div class="pln-item pln-item--mfr">
          <span class="pln-item__no label">${c.brands.length > 1 ? 'Brands' : 'Brand'}</span>
          <p class="pln-item__name">${c.brands.map((b) => html`<span>${b}</span>`)}</p>
          ${c.literature ? html`<ul class="pln-lit">${c.literature.map(([label, url]) => html`<li><a href="${url}" target="_blank" rel="noopener">${label}<span class="pln-lit__go">${icon('arrow-up-right', { size: 14 })}</span><span class="sr-only"> (opens the manufacturer’s site)</span></a></li>`)}</ul>` : ''}
        </div>` : ''}
        <div class="pln-item pln-item--quote">
          <span class="pln-item__no num" aria-hidden="true">+</span>
          <p class="pln-item__name">Put line ${no} on a quote.</p>
          <p class="pln-item__note"><a class="btn btn--sm btn--dark" href="${quoteUrl(ctx, c)}">Quote this line ${icon('arrow', { size: 16 })}</a></p>
        </div>
      </div>
      <aside class="pln-ask" aria-labelledby="ask-t">
        <p class="label label--blue">Note 1 · Sizes, grades &amp; stock</p>
        <h3 class="h3" id="ask-t">Ask your yard.</h3>
        <p>This page lists what is on the line, and the drawing shows a typical section. For sizes, grades, treatments and what is in the yard today, call the yard nearest the job.</p>
        ${yardTels('pln-tels')}
      </aside>
    </div>
  </div>
</section>

<section class="section section--panel" id="services">
  <div class="wrap">
    ${sectionHead({ no: '02', eyebrow: 'Services', title: 'Three services <em>that go with it.</em>', lede: `${SERVES[c.slug].why} These are the three of our six services that suit this line best. Use one or all of them.`, action: html`<a class="link" href="${ctx.u('services/')}">All six services ${icon('arrow', { size: 16 })}</a>` })}
    ${sequence(services.map((s) => ({ no: s.no, name: s.name, body: s.short, href: ctx.u('services/') + '#' + s.id, link: 'Details' })), { cls: 'seq--four pln-seq' })}
  </div>
</section>

<section class="section" id="load">
  <div class="wrap">
    ${sectionHead({ no: '03', eyebrow: 'Same load', title: 'The rest of <em>the load.</em>', lede: `Lines that usually land on the same job as ${c.short.toLowerCase()}. Put them on one take-off: one complete package beats a second freight bill.`, action: html`<a class="link" href="${ctx.u('products/')}">All nine lines ${icon('arrow', { size: 16 })}</a>` })}
    ${packingList(ctx, { only: related, cls: 'pln-also' })}
    <nav class="pln-pager" aria-label="Previous and next product line">
      <a class="pln-pager__cell" rel="prev" href="${lineUrl(ctx, prev)}">
        ${icon('arrow', { size: 18, cls: 'pln-pager__back' })}
        <span class="label">Previous · <span class="num">${lineNo(CATEGORIES.indexOf(prev))}</span></span>
        <b>${prev.short}</b>
      </a>
      <a class="pln-pager__cell pln-pager__cell--next" rel="next" href="${lineUrl(ctx, next)}">
        <span class="label">Next · <span class="num">${lineNo(CATEGORIES.indexOf(next))}</span></span>
        <b>${next.short}</b>
        ${icon('arrow', { size: 18 })}
      </a>
    </nav>
  </div>
</section>
${quoteBand(ctx, { no: '04', eyebrow: `Quote line ${no}`, product: c.name })}
`,
    }),
  };
};

export default [index, ...CATEGORIES.map(category)];
