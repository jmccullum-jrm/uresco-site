import { html, raw } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';
import { layout } from '../lib/layout.mjs';
import { picture, preloadFor, sectionHead, pageHero, quoteBand, openStatus, callLink } from '../lib/components.mjs';
import { PROJECTS, SECTORS } from '../data/projects.mjs';
import { SERVICES } from '../data/services.mjs';
import { LOCATIONS, tel } from '../data/locations.mjs';

// No project list has been supplied, so this page describes kinds of work, never a job.
// Each kind is shown as a load: what is typically on it, and which stops of the services line it uses.
const LINE = [...SERVICES].sort((a, b) => a.seq - b.seq);

// The sectors in the order the home page introduces them. The words restate the scope lines in
// src/data/projects.mjs; each sector points at the service or page its work leans on most.
const ABOUT = {
  'Remote Alaska': { title: 'Remote Alaska. <em>Off the road system.</em>', text: 'Whole buildings for communities reached by barge or by air, and materials for work across the Interior and up the road north. Remote-location delivery is the specialty.', link: ['How remote delivery works', 'alaska/'], yards: ['anchorage', 'fairbanks'] },
  Institutional: { title: 'Institutional. <em>Public buildings.</em>', text: 'Schools, clinics and public buildings, with the engineered floor systems and fire-retardant-treated lumber their drawings call for. Complete packages for export are assembled the same way.', link: ['Design services', 'services/#design'] },
  Commercial: { title: 'Commercial. <em>Frame and form.</em>', text: 'Framing lumber, engineered beams and truss packages for multifamily and commercial work, and the forming panels and timbers that concrete and site work start with.', link: ['Job-site delivery', 'services/#delivery'] },
  Residential: { title: 'Residential. <em>Frame to finish.</em>', text: 'Custom homes taken off from the plans, and the decks, siding and exteriors that finish them.', link: ['Estimates & take-offs', 'services/#takeoffs'] },
};
const ORDER = ['Remote Alaska', 'Institutional', 'Commercial', 'Residential'];
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const sectors = [...ORDER.filter((s) => SECTORS.includes(s)), ...SECTORS.filter((s) => !ORDER.includes(s))]
  .map((name) => ({ name, id: slug(name), ...(ABOUT[name] || { title: `${name}.`, text: '' }), kinds: PROJECTS.filter((p) => p.sector === name).sort((a, b) => (b.real ? 1 : 0) - (a.real ? 1 : 0)) }))
  .filter((s) => s.kinds.length);
const total = sectors.reduce((n, s) => n + s.kinds.length, 0);
const kinds = (n) => `${n} ${n === 1 ? 'kind' : 'kinds'} of work`;

// The three legs of the services line, for the section that points there.
const LEGS = [
  { leg: 'On paper', icon: 'ruler', body: 'Send drawings or a list. We help with the take-off and the estimate, and with design where a project needs it.', link: 'Take-offs and design' },
  { leg: 'In the yard', icon: 'crate', body: 'For remote and export work the whole job comes together as one package, with crating and packaging for the trip.', link: 'Packages and crating' },
  { leg: 'On the way', icon: 'truck', body: 'Shipping coordinated to the dock, or delivery to the job site by boom truck and Moffett forklift.', link: 'Freight and delivery' },
].map((l) => ({ ...l, stops: LINE.filter((s) => s.leg === l.leg) }));

// One kind of work. The photograph shows that kind of building, not a Uresco job, so it carries
// no place or project caption: only what is typically on the load.
const kind = (ctx, p, i, n) => html`
  <article class="pj-kind reveal" style="--i:${i}">
    <div class="pj-kind__media frame">
      ${picture(ctx, p.photo, { sizes: '(min-width: 1200px) 30vw, (min-width: 700px) 46vw, 94vw' })}
      <div class="glass glass--over">
        <p class="glass__lab">Typically on the load</p>
        <ul>${p.materials.map((m) => html`<li>${m}</li>`)}</ul>
      </div>
    </div>
    <h3 class="pj-kind__title">${p.title}</h3>
    ${p.real && (p.place || p.year) ? html`<p class="pj-kind__where">${[p.place, p.year].filter(Boolean).join(' · ')}</p>` : ''}
    <p class="pj-kind__text">${p.scope}</p>
    <div class="pj-route">
      <p class="pj-route__lab" id="pj-route-${n}">Services it typically uses</p>
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
    description: 'The kinds of work Uresco materials go into: village housing packages, schools and clinics, commercial and multifamily framing, concrete work, custom homes and export packages, and what is typically on each load.',
    preload: [preloadFor(ctx, 'framing-joists')],
    body: html`
${pageHero(ctx, {
  eyebrow: 'Kinds of work',
  title: 'What the materials <em>become.</em>',
  lede: 'We supply the materials and builders do the building, so this is not a list of jobs. It is the kinds of work our loads go into across the Pacific Northwest and Alaska, and what each one typically needs.',
  photoKey: 'framing-joists',
  caption: 'Roof trusses and wall framing',
  actions: html`<a class="btn btn--lg" href="${ctx.u('quote/')}">Request a quote ${icon('arrow', { size: 18 })}</a>${callLink(ctx, { cls: 'btn--lg btn--line' })}`,
})}

<section class="section pj-board" id="work" aria-label="Kinds of work, by sector">
  <div class="wrap">
    <div class="pj-bar">
      <div class="pj-filter jsonly" role="group" aria-label="Show kinds of work by sector" data-pj-filter>
        <button type="button" class="chip" data-pj="all" aria-pressed="true">All work</button>
        ${sectors.map((s) => html`<button type="button" class="chip" data-pj="${s.id}" aria-pressed="false">${s.name}</button>`)}
      </div>
      <nav class="pj-filter nojs" aria-label="Sectors">
        ${sectors.map((s) => html`<a class="chip" href="#${s.id}">${s.name}</a>`)}
      </nav>
      <p class="pj-bar__note"><span data-pj-count role="status">${kinds(total)} in ${sectors.length} sectors</span> <i>·</i> Photographs are illustrative</p>
    </div>
    ${sectors.map((s, n) => html`
    <section class="pj-sector" id="${s.id}" data-pj-sector aria-labelledby="${s.id}-title">
      <div class="pj-sector__head">
        <p class="eyebrow">Sector 0${n + 1} <i>·</i> ${kinds(s.kinds.length)}</p>
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
    ${sectionHead({ eyebrow: 'Behind every load', title: 'Different work, <em>the same line.</em>', lede: 'Whatever the job, it runs through the same six services. Some loads use two of them. A remote package uses them all.', action: html`<a class="link" href="${ctx.u('services/')}">All six services ${icon('arrow', { size: 16 })}</a>` })}
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
