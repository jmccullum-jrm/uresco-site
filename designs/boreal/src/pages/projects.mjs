import { html, raw } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';
import { layout } from '../lib/layout.mjs';
import { picture, preloadFor, sectionHead, pageHero, quoteBand, openStatus, callLink } from '../lib/components.mjs';
import { PROJECTS, SECTORS } from '../data/projects.mjs';
import { SERVICES } from '../data/services.mjs';
import { LOCATIONS, tel } from '../data/locations.mjs';

// No project list has been supplied, so this page describes kinds of work, never a job.
// Each kind says what it often needs, and which services to ask about.
const LINE = [...SERVICES].sort((a, b) => a.seq - b.seq);

// The sectors in the order the home page introduces them. The words restate the scope lines in
// src/data/projects.mjs; each sector points at the service or page its work leans on most.
// `label` names the sector on its chip and over its heading.
const ABOUT = {
  'Remote Alaska': { label: 'Remote & export', title: 'Off the road system, <em>up the road north, and for export.</em>', text: 'Whole buildings for communities reached by barge or by air, materials for work across the Interior and up the road north, and complete packages crated for export. Remote-location delivery is the specialty.', link: ['How remote delivery works', 'alaska/'], yards: ['anchorage', 'fairbanks'] },
  Institutional: { title: 'Public <em>buildings.</em>', text: 'The engineered floor systems and fire-retardant-treated lumber that school, clinic and public-building drawings call for.', link: ['Design services', 'services/#design'] },
  Commercial: { title: 'Frame <em>and form.</em>', text: 'Framing lumber, engineered beams and truss packages for multifamily and commercial work, and the forming panels and timbers that concrete and site work start with.', link: ['Job-site delivery', 'services/#delivery'] },
  Residential: { title: 'Frame <em>to finish.</em>', text: 'Custom homes taken off from the plans, and the decks, siding and exteriors that finish them.', link: ['Estimates & take-offs', 'services/#takeoffs'] },
};
const ORDER = ['Remote Alaska', 'Institutional', 'Commercial', 'Residential'];
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const sectors = [...ORDER.filter((s) => SECTORS.includes(s)), ...SECTORS.filter((s) => !ORDER.includes(s))]
  .map((name) => ({ name, label: name, id: slug(name), ...(ABOUT[name] || { title: `${name}.`, text: '' }), kinds: PROJECTS.filter((p) => p.sector === name).sort((a, b) => (b.real ? 1 : 0) - (a.real ? 1 : 0)) }))
  .filter((s) => s.kinds.length);

// A photograph can name a place; a card about a kind of work must not tie that place to it.
const ALT = { 'remote-village': 'Snow-drifted buildings and a boat at sunset over sea ice' };

// The three parts of the services, for the section that points there.
const LEGS = [
  { leg: 'On paper', icon: 'ruler', body: 'Send drawings or a list. We help with the take-off and the estimate, and with design where a project needs it.', link: 'Take-offs and design' },
  { leg: 'In the yard', icon: 'crate', body: 'For remote and export work the whole job comes together as one package, with crating and packaging for the trip.', link: 'Packages and crating' },
  { leg: 'On the way', icon: 'truck', body: 'Shipping coordinated to the dock, or delivery to the job site by boom truck and Moffett forklift.', link: 'Freight and delivery' },
].map((l) => ({ ...l, stops: LINE.filter((s) => s.leg === l.leg) }));

// One kind of work. The photograph shows that kind of building, not a Uresco job, so it carries
// no place or project caption: only what the work often needs.
const kind = (ctx, p, i, n) => html`
  <article class="pj-kind reveal" style="--i:${i}">
    <div class="pj-kind__media frame">
      ${picture(ctx, p.photo, { sizes: '(min-width: 1200px) 30vw, (min-width: 700px) 46vw, 94vw', ...(ALT[p.photo] ? { alt: ALT[p.photo] } : {}) })}
      <div class="glass glass--over">
        <p class="glass__lab">Often needed for this work</p>
        <ul>${p.materials.map((m) => html`<li>${m}</li>`)}</ul>
      </div>
    </div>
    <h3 class="pj-kind__title">${p.title}</h3>
    ${p.real && (p.place || p.year) ? html`<p class="pj-kind__where">${[p.place, p.year].filter(Boolean).join(' · ')}</p>` : ''}
    <p class="pj-kind__text">${p.scope}</p>
    <div class="pj-route">
      <p class="pj-route__lab" id="pj-route-${n}">Services to ask about</p>
      <ol class="pj-route__stops" aria-labelledby="pj-route-${n}">
        ${LINE.map((s) => ((p.services || []).includes(s.id)
          ? html`<li class="is-on"><i></i>${s.step}<span class="sr-only">: ${s.name}</span></li>`
          : html`<li aria-hidden="true"><i></i>${s.step}</li>`))}
      </ol>
    </div>
    <a class="link pj-kind__quote" href="${ctx.u('quote/')}?product=${encodeURIComponent(p.title)}">Request a quote<span class="sr-only">: ${p.title}</span> ${icon('arrow', { size: 16 })}</a>
  </article>`;

export default {
  path: 'projects/',
  render: (ctx) => layout(ctx, {
    title: 'Projects',
    description: 'The kinds of work Uresco supplies: village housing packages, schools and clinics, commercial and multifamily framing, concrete work, custom homes and export packages, and what each one often needs.',
    preload: [preloadFor(ctx, 'framing-joists')],
    body: html`
${pageHero(ctx, {
  cls: 'pj-hero',
  eyebrow: 'Kinds of work',
  title: 'The kinds of work <em>we supply.</em>',
  lede: 'We supply the materials and builders do the building, so this is not a list of jobs. It is the kinds of work we supply across the Pacific Northwest and Alaska, and what each one often needs.',
  photoKey: 'framing-joists',
  caption: 'Roof trusses and wall framing',
  actions: html`<a class="btn btn--lg" href="${ctx.u('quote/')}">Request a quote ${icon('arrow', { size: 18 })}</a>${callLink(ctx, { cls: 'btn--lg btn--line' })}`,
})}

<section class="section pj-board" id="work" aria-label="Kinds of work, by sector">
  <div class="wrap">
    <div class="pj-bar">
      <div class="pj-filter jsonly" role="group" aria-label="Show kinds of work by sector" data-pj-filter>
        <button type="button" class="chip" data-pj="all" aria-pressed="true">All work</button>
        ${sectors.map((s) => html`<button type="button" class="chip" data-pj="${s.id}" aria-pressed="false">${s.label}</button>`)}
      </div>
      <nav class="pj-filter nojs" aria-label="Sectors">
        ${sectors.map((s) => html`<a class="chip" href="#${s.id}">${s.label}</a>`)}
      </nav>
      <p class="pj-bar__note"><span class="pj-bar__count" data-pj-count role="status"></span><span>Stock photographs of the kinds of work we supply, not Uresco jobs.</span></p>
    </div>
    ${sectors.map((s) => html`
    <section class="pj-sector" id="${s.id}" data-pj-sector aria-labelledby="${s.id}-eyebrow ${s.id}-title">
      <div class="pj-sector__head">
        <p class="eyebrow" id="${s.id}-eyebrow">${s.label}</p>
        <h2 class="pj-sector__title" id="${s.id}-title">${raw(s.title)}</h2>
        <p class="pj-sector__text">${s.text}</p>
        ${s.yards ? html`<div class="pj-yards">
          <p class="pj-yards__lab">Yards to call</p>
          <ul>${LOCATIONS.filter((l) => s.yards.includes(l.id)).map((l) => html`<li>
            <span><b>${l.city} ${openStatus(l)}</b><small>${l.serves}</small></span>
            <a href="${tel(l.phone)}"><span class="sr-only">Call ${l.city}: </span>${l.phone}</a>
          </li>`)}</ul>
        </div>` : ''}
        ${s.link ? html`<a class="link" href="${ctx.u(s.link[1])}">${s.link[0]} ${icon('arrow', { size: 16 })}</a>` : ''}
      </div>
      <div class="pj-sector__kinds">
        ${s.kinds.map((p, i) => kind(ctx, p, i, ctx.uid()))}
      </div>
    </section>`)}
  </div>
</section>

<section class="section section--ice pj-legs">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Behind every load', title: 'Different work, <em>the same six services.</em>', lede: 'Some loads use two of the six services and a remote package uses most of them.', action: html`<a class="link" href="${ctx.u('services/')}">All six services ${icon('arrow', { size: 16 })}</a>` })}
    <div class="modes">
      ${LEGS.map((l, i) => html`<article class="mode reveal" style="--i:${i}">
        <span class="mode__icon">${icon(l.icon, { size: 24 })}</span>
        <h3 class="h3">${l.leg}</h3>
        <p class="mode__where">${l.stops.map((s) => s.step).join(' · ')}</p>
        <p>${l.body}</p>
        <a class="link" href="${ctx.u('services/#' + l.stops[0].id)}">${l.link} ${icon('arrow', { size: 16 })}</a>
      </article>`)}
    </div>
    <div class="callout reveal">
      <span class="callout__icon">${icon('compass', { size: 22 })}</span>
      <p><strong>Building something else, or somewhere else?</strong> These are examples, not limits. Name the place to see which yard to call and how freight typically gets there.</p>
      <a class="link" href="${ctx.u('')}#hero-title">Where are you building? ${icon('arrow', { size: 16 })}</a>
    </div>
  </div>
</section>
${quoteBand(ctx, { title: 'Have a job <em>like these?</em>', body: 'Send plans or a list. We help with the take-off and the estimate, and we will quote the package and work out the freight with you.' })}
`,
  }),
};
