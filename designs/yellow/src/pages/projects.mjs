import { html } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';
import { layout } from '../lib/layout.mjs';
import { win, pageHero, pageHeroPreload, quoteBand, sectionHead, marquee, openStatus, callBtn } from '../lib/components.mjs';
import { PROJECTS, SECTORS } from '../data/projects.mjs';
import { LOCATIONS, tel } from '../data/locations.mjs';

// The page shows KINDS of work, grouped by the four sectors: no job, customer or place is named
// because none has been supplied (see data/projects.mjs). The order follows the home page's arcade.
const ORDER = ['Remote Alaska', 'Institutional', 'Commercial', 'Residential'];
const LINE = {
  'Remote Alaska': 'Communities off the road system',
  Institutional: 'Public and institutional work',
  Commercial: 'Commercial and multifamily work',
  Residential: 'Custom homes and exteriors',
};
const slug = (s) => s.toLowerCase().replace(/[^a-z]+/g, '-');
const GROUPS = [...ORDER, ...SECTORS.filter((s) => !ORDER.includes(s))].filter((s) => SECTORS.includes(s)).map((sector) => ({
  sector,
  id: slug(sector),
  // A real project, once there is one, leads its sector and shows its place and year.
  kinds: PROJECTS.filter((p) => p.sector === sector).sort((a, b) => (b.real ? 1 : 0) - (a.real ? 1 : 0)),
}));

// Counts are written as words in headlines, and always follow the data.
const WORD = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'];
const count = (n) => WORD[n] || String(n);
const KINDS = GROUPS.reduce((n, g) => n + g.kinds.length, 0);

// "Which yard should I call?", as the site answers it everywhere.
const WHERE = { kent: 'Puget Sound and the Northwest', anchorage: 'Southcentral or remote Alaska', fairbanks: 'The Interior and points north' };
// One word from each kind of work, for the tape.
const TAPE = ['Housing', 'Schools', 'Clinics', 'Framing', 'Concrete', 'Homes', 'Decks', 'Export'];

const kind = (ctx, p, i) => html`
  <li class="pj-kind" style="--i:${i}" data-kind data-reveal>
    ${win(ctx, p.photo, { tag: 'span', shape: 'arch', duo: true, cls: 'pj-kind__win', sizes: '(min-width: 1100px) 30vw, (min-width: 700px) 44vw, 120px', alt: '' })}
    <div class="pj-kind__body">
      <h4 class="pj-kind__title">${p.title}</h4>
      ${p.real && (p.place || p.year) ? html`<p class="pj-kind__where">${[p.place, p.year].filter(Boolean).join(' · ')}</p>` : ''}
      <p class="pj-kind__scope">${p.scope}</p>
      <ul class="pj-kind__mats" aria-label="Typical materials">${p.materials.map((m) => html`<li>${m}</li>`)}</ul>
      <a class="link pj-kind__go" href="${ctx.u('quote/')}?product=${encodeURIComponent(p.title)}"><span class="pj-kind__go-l">Quote a job like this</span><span class="pj-kind__go-s">Get a quote</span><span class="sr-only">: ${p.title}</span> ${icon('arrow', { size: 16 })}</a>
    </div>
  </li>`;

export default {
  path: 'projects/',
  render: (ctx) => layout(ctx, {
    title: 'Projects',
    description: 'The kinds of work Uresco supplies: village housing packages, schools and clinics, commercial and multifamily framing, concrete work, custom homes, decks and export packages.',
    preload: [pageHeroPreload(ctx, 'framer')],
    body: html`
${pageHero(ctx, {
  cls: 'pj-hero',
  eyebrow: 'Projects',
  title: 'What it <em>becomes.</em>',
  lede: 'We supply the materials; builders turn them into buildings. So this is not a list of jobs: it is the kinds of work our three yards supply.',
  photoKey: 'framer',
  caption: 'A framer nailing a wall frame',
  actions: html`<a class="btn" href="${ctx.u('quote/')}">Request a quote ${icon('arrow', { size: 18 })}</a>${callBtn(ctx, { cls: 'btn--line' })}`,
  after: html`<nav class="pj-jump" aria-label="Sectors">
    <span class="pj-jump__k" aria-hidden="true">${count(GROUPS.length)} sectors</span>
    <ul>${GROUPS.map((g) => html`<li><a href="#${g.id}">${g.sector}</a></li>`)}</ul>
  </nav>`,
})}

<section class="section field-k pj-work clip" id="work">
  <div class="divider divider--u" aria-hidden="true"><i class="plx"></i><i class="plx"></i><i class="plx"></i></div>
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Kinds of work', title: `${count(KINDS)} kinds. <em>${count(GROUPS.length)} sectors.</em>`, lede: 'Institutional, commercial and residential builders, and communities off the road system.' })}
    <div class="pj-filter" data-filters role="group" aria-label="Show one sector">
      <button type="button" class="toggle pj-pill" data-filter="all" aria-pressed="true">All work</button>
      ${GROUPS.map((g) => html`<button type="button" class="toggle pj-pill" data-filter="${g.sector}" aria-pressed="false">${g.sector}</button>`)}
    </div>
    <p class="sr-only" role="status" data-filter-status></p>
    <div class="pj-sectors" data-filter-grid>
      ${GROUPS.map((g, n) => html`
      <section class="pj-sector" data-sector="${g.sector}" id="${g.id}" aria-labelledby="pj-h-${g.id}">
        <header class="pj-sector__head">
          <span class="pj-sector__no nums" aria-hidden="true">${String(n + 1).padStart(2, '0')}</span>
          <h3 class="pj-sector__name" id="pj-h-${g.id}">${g.sector}</h3>
          <p class="pj-sector__line">${LINE[g.sector] || ''}</p>
        </header>
        <ul class="pj-kinds">${g.kinds.map((p, i) => kind(ctx, p, i))}</ul>
      </section>`)}
    </div>
    <p class="pj-note">Photographs show the kind of work, not Uresco projects.</p>
  </div>
</section>

${marquee(TAPE, { tone: 'y', tilt: true, slow: true })}

<section class="section field-p pj-call">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Have a job like these?', title: 'Where’s <em>the job?</em>', lede: 'Call the yard nearest it. Any yard can help: the three work as one team.' })}
  </div>
  <ul class="pj-yards">
    ${LOCATIONS.map((l) => html`<li><a class="pj-yard" href="${tel(l.phone)}">
      <span class="pj-yard__where">${WHERE[l.id] || l.region}</span>
      <span class="pj-yard__city"><span class="sr-only">Call </span><b>${l.city}</b>${openStatus(l)}</span>
      <span class="pj-yard__num nums">${l.phone}</span>
      <span class="line__go">${icon('phone', { size: 22 })}</span>
    </a></li>`)}
  </ul>
  <div class="wrap">
    <a class="ticket" href="${ctx.u('services/')}" data-reveal>
      <span class="ticket__k">Services</span>
      <span class="ticket__t">Plans in. Load out.</span>
      <span class="ticket__d">Six services take a job like these from drawings to a delivered load.</span>
      <span class="line__go">${icon('arrow', { size: 22 })}</span>
    </a>
  </div>
</section>

${quoteBand(ctx, { title: 'Or send <em>the plans.</em>', body: 'Upload drawings or a list and say what you’re building. We’ll help with the take-off and quote it.' })}
`,
  }),
};
