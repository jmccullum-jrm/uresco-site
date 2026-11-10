import { html, raw, esc } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';
import { layout } from '../lib/layout.mjs';
import { picture, preloadFor, sectionHead, pageHero, closing, callLink, interlude, stockFrame, stockRow, openStatus, deg, latOf } from '../lib/components.mjs';
import { CATEGORIES, BRANDS } from '../data/products.mjs';
import { SERVICES } from '../data/services.mjs';
import { LOCATIONS, tel } from '../data/locations.mjs';

// The products index is a stock list you can search; each line page is one row of it, opened up.
// Everything stated here comes from data/products.mjs and data/services.mjs. Where a builder would
// want specifics (sizes, grades, what is on the ground) the page says "ask your yard".

const two = (n) => String(n).padStart(2, '0');
const noOf = (c) => two(CATEGORIES.indexOf(c) + 1);
const bySlug = (slug) => CATEGORIES.find((c) => c.slug === slug);
const lineUrl = (ctx, c) => ctx.u(`products/${c.slug}/`);
// The quote form starts its materials list with whatever ?product= carries.
const quoteQuery = (c) => `?product=${encodeURIComponent(c.name)}`;
const quoteUrl = (ctx, c) => `${ctx.u('quote/')}${quoteQuery(c)}`;
const plain = (s) => s.replace(/[®™]/g, '');
// A registered mark set small beside display type, where the serif's own ® is too loud.
const reg = (s) => raw(esc(s).replace(/®/g, '<sup class="prod-reg">®</sup>'));
// What the finder matches against. modules/products.js folds what is typed the same way.
const fold = (s) => plain(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

// Per line: the section headline, the hero photograph when the list thumbnail is too loud to run
// edge to edge, what the hero shows, and the three services to ask about first.
const LINE = {
  'framing-lumber': { headline: 'The core <em>of the load.</em>', caption: 'The ends of stacked dimensional lumber.', services: ['takeoffs', 'delivery', 'remote'] },
  'panels-sheathing': { headline: 'Subfloor <em>to roof.</em>', caption: 'Bundled stacks of plywood panels.', services: ['takeoffs', 'delivery', 'crating'] },
  'engineered-wood': { headline: 'Quoted <em>from your plans.</em>', caption: 'Roof trusses set on a new frame.', services: ['takeoffs', 'design', 'delivery'] },
  'concrete-forming': { headline: 'MDO <em>and HDO.</em>', caption: 'A crew placing concrete beside formed foundation walls.', services: ['takeoffs', 'delivery', 'shipping'] },
  'cedar-decking': { headline: 'Cedar, <em>and composite.</em>', caption: 'Cedar siding under a deep roof overhang.', services: ['takeoffs', 'delivery', 'crating'] },
  'siding-exterior': { headline: 'The envelope, <em>kept tight.</em>', caption: 'Lap siding and trimmed windows on a two-story house.', services: ['takeoffs', 'delivery', 'remote'] },
  'insulation-drywall': { headline: 'Foam, batts <em>and board.</em>', caption: 'Fiberglass batts going in between the studs.', services: ['takeoffs', 'delivery', 'remote'] },
  'windows-doors-cabinets': { headline: 'Ships with <em>the rest of the job.</em>', caption: 'New windows staged in front of a wrapped and sheathed house.', services: ['takeoffs', 'crating', 'remote'] },
  'hardware-supplies': { headline: 'Down to <em>the last box.</em>', hero: 'framer', caption: 'A framer nailing off a wall frame.', services: ['takeoffs', 'remote', 'delivery'] },
};

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

// Where each named brand lives, and what it is, in the data's own words.
const BRAND_LINES = {
  'James Hardie': ['siding-exterior', 'Fiber-cement siding'],
  'CertainTeed': ['siding-exterior', 'Siding and trim'],
  'Simpson Strong-Tie': ['hardware-supplies', 'Structural connectors'],
  'Georgia-Pacific DensGlass': ['panels-sheathing', 'Gypsum exterior sheathing'],
  'Parallam': ['engineered-wood', 'Parallel strand lumber'],
};

// The A to Z: every item in the data, plus the short names builders actually say. Each of these
// is an abbreviation or a word taken from an item's own name or note, never a new product.
const ALSO_KNOWN_AS = [
  ['Adhesives', 'hardware-supplies'], ['Decking', 'cedar-decking'], ['EPS foam', 'insulation-drywall'], ['Fencing', 'cedar-decking'],
  ['Fiber-cement siding', 'siding-exterior'], ['FRT lumber', 'framing-lumber'], ['GLB', 'engineered-wood'], ['Hangers & connectors', 'hardware-supplies'],
  ['LVL', 'engineered-wood'], ['Nails & screws', 'hardware-supplies'], ['OSB', 'panels-sheathing'], ['Poly sheeting', 'hardware-supplies'],
  ['PSL', 'engineered-wood'], ['Treated lumber', 'framing-lumber'], ['XPS foam', 'insulation-drywall'],
];
const AZ = [...CATEGORIES.flatMap((c) => c.items.map(([n]) => [n, c])), ...ALSO_KNOWN_AS.map(([n, slug]) => [n, bySlug(slug)])]
  .sort((a, b) => plain(a[0]).localeCompare(plain(b[0]), 'en', { sensitivity: 'base' }));
const AZ_GROUPS = AZ.reduce((groups, entry) => {
  const letter = plain(entry[0])[0].toUpperCase();
  const last = groups[groups.length - 1];
  if (last && last.letter === letter) last.entries.push(entry); else groups.push({ letter, entries: [entry] });
  return groups;
}, []);
const termsOf = (c) => fold([c.name, c.short, c.lede, ...c.items.flat(), ...c.brands, ...ALSO_KNOWN_AS.filter(([, slug]) => slug === c.slug).map(([n]) => n)].join(' '));

const yardLinks = () => LOCATIONS.map((l) => html`<a href="${tel(l.phone)}">${l.city} ${l.phone}</a>`);

/* ---------- /products/ ---------- */

const index = {
  path: 'products/',
  render: (ctx) => layout(ctx, {
    title: 'Products',
    description: 'Framing lumber and timbers, plywood and OSB, engineered wood and trusses, cedar, siding, insulation, forming panels, windows, doors, cabinets and hardware from Uresco Construction Materials.',
    preload: [preloadFor(ctx, 'pine-racking')],
    body: html`
${pageHero(ctx, {
  crumbs: [['Products']],
  eyebrow: 'Products · Nine lines · Three yards',
  title: 'Everything <em>on the list.</em>',
  lede: 'A wholesale dealer’s full line, from framing packages to the last box of fasteners. Find the line below, then ask your yard what is on the ground today.',
  photoKey: 'pine-racking',
  caption: 'Bundled lumber on cantilever racking.',
  actions: html`<a class="btn" href="${ctx.u('quote/')}">Request a quote ${icon('arrow', { size: 18 })}</a>${callLink(ctx)}`,
})}

<section class="section prod-lines" id="lines" aria-labelledby="lines-title">
  <div class="wrap">
    ${sectionHead({ no: '01', eyebrow: 'The stock list', id: 'lines-title', title: 'Nine lines, <em>one load.</em>', lede: 'Every line opens to what is in it. For sizes, grades and what is on the ground today, call your yard.' })}
    <div class="stock prod-ledger" data-prod-ledger>
      ${stockFrame(ctx, { sizes: '(min-width: 1440px) 430px, (min-width: 1000px) 30vw, 1px', caption: html`<span data-prod-cap>01 · ${CATEGORIES[0].name}</span>` })}
      <div class="prod-ledger__body">
        <div class="prod-find">
          <label class="label prod-find__label" for="prod-q">Find a product</label>
          <div class="prod-find__field">
            ${icon('search')}
            <input class="prod-find__input" id="prod-q" type="search" placeholder="LVL, Hardie, OSB…" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="search" aria-controls="prod-list" aria-describedby="prod-count" data-prod-q>
            <button type="button" class="prod-find__clear" data-prod-clear hidden>Clear</button>
          </div>
          <p class="prod-find__count" id="prod-count" role="status" data-prod-count>9 lines</p>
        </div>
        <ol class="prod-ledger__list" id="prod-list">
          ${CATEGORIES.map((c, i) => html`<li class="prod-row${i === 0 ? ' is-on' : ''}" id="${c.slug}" data-terms="${termsOf(c)}" data-cap="${two(i + 1)} · ${c.name}">
            <img class="stock__thumb" src="${ctx.u(`assets/img/${c.photo}-240.webp`)}" width="60" height="60" alt="" loading="lazy" decoding="async">
            <div class="prod-row__main">
              <h3 class="prod-row__name"><a href="${lineUrl(ctx, c)}"><span class="prod-row__no">${two(i + 1)}</span>${c.name}</a></h3>
              <p class="prod-row__lede">${c.lede}</p>
            </div>
            <ul class="prod-row__items">${c.items.map(([n, note]) => html`<li data-t="${fold(n + ' ' + note)}">${n}</li>`)}</ul>
            <a class="prod-row__quote" href="${quoteUrl(ctx, c)}">Add to a quote<span class="sr-only">: ${c.name}</span></a>
            ${icon('arrow', { size: 20, cls: 'stock__go' })}
          </li>`)}
        </ol>
        <div class="prod-none" data-prod-none hidden>
          <p class="prod-none__line">No line by that name.</p>
          <p>We carry more than is listed here, so ask your yard: ${yardLinks().map((a, i) => html`${i ? ', ' : ''}${a}`)}.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section section--deep prod-brands" aria-labelledby="brands-title">
  <div class="wrap prod-brands__grid">
    <div>
      <h2 class="shead__bar rv-line prod-brands__bar" id="brands-title"><span class="chead__no"></span><span>Brands we carry</span></h2>
      <ul class="prod-brands__list">
        ${BRANDS.map((b, i) => {
          const [slug, what] = BRAND_LINES[b];
          const c = bySlug(slug);
          return html`<li class="rv" style="--i:${i}"><a href="${lineUrl(ctx, c)}">
            <span class="prod-brands__name">${b}</span>
            ${icon('arrow', { size: 20, cls: 'prod-brands__go' })}
            <span class="prod-brands__meta"><span class="prod-brands__what">${what}</span><span class="prod-brands__line"><span class="sr-only">, in line </span>${noOf(c)}<span class="prod-brands__short"> · ${c.short}</span></span></span>
          </a></li>`;
        })}
      </ul>
    </div>
    <div class="prod-also">
      <p class="label">We also carry</p>
      <p class="prod-also__text rv">Tarps, polyurethane rolls, caulking, adhesives, house wraps <em>and more.</em></p>
      <p class="rv" style="--i:1">A large variety of other building materials never makes a list like this one. If you need it on the job, ask.</p>
      ${callLink(ctx, { cls: 'btn btn--line rv', attrs: html` style="--i:2"` })}
    </div>
  </div>
</section>

<section class="section section--paper2 prod-az" id="a-z" aria-labelledby="az-title">
  <div class="wrap">
    ${sectionHead({ no: '02', eyebrow: 'Index', id: 'az-title', title: 'Every product, <em>A to Z.</em>', lede: 'Know the name but not the line? Each entry opens the line it belongs to. The number is the line.' })}
    <div class="prod-az__cols">
      ${AZ_GROUPS.map((g) => html`<div class="prod-az__group">
        <h3 class="prod-az__letter">${g.letter}</h3>
        <ul>${g.entries.map(([n, c]) => html`<li><a href="${lineUrl(ctx, c)}"><span class="prod-az__name">${n}</span><span class="prod-az__dots" aria-hidden="true"></span><span class="prod-az__no"><span class="sr-only">line </span>${noOf(c)}</span></a></li>`)}</ul>
      </div>`)}
    </div>
  </div>
</section>

${interlude(ctx, 'timber-weathered', { line: 'Not on the list? <em>Ask your yard.</em>', note: 'Weathered timber ends, showing their rings.', pos: '50% 55%' })}

${closing(ctx)}
`,
  }),
};

/* ---------- /products/<slug>/ ---------- */

// The line's name as a headline: the last part in italic, as every headline on the site has one.
const titleOf = (c) => {
  const amp = c.name.lastIndexOf(' & ');
  if (amp > 0) return `${esc(c.name.slice(0, amp))} <em>&amp; ${esc(c.name.slice(amp + 3))}</em>`;
  const [first, ...rest] = c.name.split(' ');
  return `${esc(first)} <em>${esc(rest.join(' '))}</em>`;
};

// The closing manifest, with the line already written on it: both buttons carry the line to the quote form.
const lineClosing = (ctx, c) => closing(ctx, {
  title: 'Put it <em>on the list.</em>',
  body: `Send drawings or a materials list. The quote form opens with ${c.short.toLowerCase()} already on it, and the yard prices the line with the rest of the job.`,
  cta: 'Quote this line',
  query: quoteQuery(c),
  rows: [
    ['Line', `${noOf(c)} · ${c.name}`],
    ['Send', 'Plans, drawings or a materials list'],
    ['To', 'The yard nearest your project'],
    ['Returns', 'A take-off, priced with the rest of the job'],
  ],
});

const category = (c, i) => {
  const line = LINE[c.slug];
  const heroKey = line.hero || c.photo;
  const prev = CATEGORIES[(i + CATEGORIES.length - 1) % CATEGORIES.length];
  const next = CATEGORIES[(i + 1) % CATEGORIES.length];
  const first = line.services.map((id) => SERVICES.find((s) => s.id === id));
  const others = SERVICES.filter((s) => !line.services.includes(s.id));
  return {
    path: `products/${c.slug}/`,
    render: (ctx) => layout(ctx, {
      title: c.name,
      description: `${c.lede} ${c.items.map(([n]) => n).join(', ')} from Uresco Construction Materials in Kent, Anchorage and Fairbanks.`,
      preload: [preloadFor(ctx, heroKey)],
      body: html`
${pageHero(ctx, {
  crumbs: [['Products', 'products/'], [c.short]],
  eyebrow: `Product line ${two(i + 1)} of ${two(CATEGORIES.length)}`,
  title: titleOf(c),
  lede: c.lede,
  photoKey: heroKey,
  caption: line.caption,
  pos: line.pos,
  actions: html`<a class="btn" href="${quoteUrl(ctx, c)}">Quote this line ${icon('arrow', { size: 18 })}</a>${callLink(ctx)}`,
  attrs: html` data-prod-line="${two(i + 1)}"`,
})}

<section class="section prod-in" aria-labelledby="in-title">
  <div class="wrap">
    ${sectionHead({ no: '01', eyebrow: 'In the line', id: 'in-title', title: line.headline, lede: c.body })}
    <div class="prod-in__grid">
      <div class="prod-in__main">
        <ol class="prod-items${c.items.length <= 3 ? ' prod-items--few' : ''}">
          ${c.items.map(([name, note], n) => html`<li class="rv" style="--i:${n}">
            <span class="prod-items__no" aria-hidden="true">${two(n + 1)}</span>
            <h3 class="prod-items__name">${reg(name)}</h3>
            <p class="prod-items__note">${note}</p>
          </li>`)}
        </ol>
        ${c.brands.length ? html`<div class="prod-makers rv">
          <div class="prod-makers__who">
            <p class="label">${c.brands.length > 1 ? 'Brands' : 'Brand'} in this line</p>
            <ul class="prod-makers__names">${c.brands.map((b) => html`<li>${reg(b)}</li>`)}</ul>
          </div>
          ${c.literature ? html`<div class="prod-makers__lit">
            <p class="label">Specs &amp; literature</p>
            <ul>${c.literature.map(([text, url]) => html`<li><a class="prod-makers__link" href="${url}" target="_blank" rel="noopener">${text.slice(0, text.lastIndexOf(' ') + 1)}<span>${text.slice(text.lastIndexOf(' ') + 1)}${icon('arrow-up-right', { size: 16 })}</span><span class="sr-only"> (opens the manufacturer’s site)</span></a></li>`)}</ul>
          </div>` : ''}
        </div>` : ''}
      </div>
      <div class="prod-ask rv">
        <p class="label prod-ask__head">Sizes, grades &amp; stock</p>
        <div class="prod-ask__body">
          <h3 class="prod-ask__title">Ask <em>your yard.</em></h3>
          <p>Call the yard nearest your job for sizes, grades and what is on the ground today.</p>
        </div>
        <ul class="prod-ask__yards">
          ${LOCATIONS.map((l) => html`<li><a href="${tel(l.phone)}">
            <span class="prod-ask__lat">${deg(latOf(l))}</span>
            ${openStatus(l, { short: true })}
            <span class="prod-ask__city">${l.city}</span>
            <span class="prod-ask__num">${l.phone}</span>
          </a></li>`)}
        </ul>
        <p class="prod-ask__foot"><a class="link" href="${quoteUrl(ctx, c)}">Or send the list for a price ${icon('arrow', { size: 16 })}</a></p>
      </div>
    </div>
  </div>
</section>

<section class="section section--deep prod-svc" aria-labelledby="svc-title">
  <div class="wrap">
    <p class="shead__bar rv-line"><span class="chead__no">02</span><span>Services with this line</span></p>
    <div class="prod-svc__grid">
      <div class="prod-svc__lead">
        <h2 class="h2 rv" id="svc-title">From the list <em>to the site.</em></h2>
        <p class="lede rv" style="--i:1">Any line can be estimated, packaged and delivered with the rest of the job. For ${c.short.toLowerCase()}, start by asking about these three.</p>
        <a class="link rv" style="--i:2" href="${ctx.u('services/')}">All six services ${icon('arrow', { size: 16 })}</a>
        <figure class="print print--inline prod-svc__print rv" style="--i:3">
          ${picture(ctx, 'uresco-stack', { sizes: '200px' })}
          <figcaption>From the Uresco archive: stacked lumber in the yard.</figcaption>
        </figure>
      </div>
      <div>
        <ul class="svc__list svc__list--lg">
          ${first.map((s, n) => html`<li class="rv" style="--i:${n}"><a href="${ctx.u('services/')}#${s.id}">${icon(s.icon, { size: 24 })}<span><b>${s.name}</b><small>${s.short}</small></span>${icon('arrow', { size: 18, cls: 'svc__go' })}</a></li>`)}
        </ul>
        <p class="prod-svc__more">Also: ${others.map((s, n) => html`${n ? ' · ' : ''}<a href="${ctx.u('services/')}#${s.id}">${s.name}</a>`)}</p>
      </div>
    </div>
  </div>
</section>

<section class="section prod-rest" aria-labelledby="rest-title">
  <div class="wrap">
    ${sectionHead({ no: '03', eyebrow: 'Goes with', id: 'rest-title', title: 'The rest of <em>the load.</em>', lede: 'A building takes more than one line. These three are worth pricing in the same request.', action: html`<a class="link" href="${ctx.u('products/')}">All nine lines ${icon('arrow', { size: 16 })}</a>` })}
    <ol class="stock__list stock__list--thumbs">
      ${RELATED[c.slug].map((slug) => stockRow(ctx, bySlug(slug)))}
    </ol>
    <nav class="prod-pager" aria-label="Previous and next product line">
      <a class="prod-pager__cell" href="${lineUrl(ctx, prev)}" rel="prev">
        <span class="prod-pager__dir">${icon('arrow', { size: 16, cls: 'prod-pager__back' })} Previous line</span>
        <span class="prod-pager__name"><span class="prod-pager__no">${noOf(prev)}</span>${prev.name}</span>
      </a>
      <a class="prod-pager__cell prod-pager__cell--next" href="${lineUrl(ctx, next)}" rel="next">
        <span class="prod-pager__dir">Next line ${icon('arrow', { size: 16 })}</span>
        <span class="prod-pager__name"><span class="prod-pager__no">${noOf(next)}</span>${next.name}</span>
      </a>
    </nav>
  </div>
</section>

${lineClosing(ctx, c)}
`,
    }),
  };
};

export default [index, ...CATEGORIES.map(category)];
