import { html } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';
import { drawing } from '../lib/drawings.mjs';
import { layout } from '../lib/layout.mjs';
import { preloadFor, sectionHead, pageHero, quoteBand, yardStrip } from '../lib/components.mjs';
import { SERVICES } from '../data/services.mjs';

// What each station shows beside its text.
const DWG = {
  takeoffs: ['Plans in, list out', 'svc-takeoffs'],
  design: ['A member, worked out', 'svc-design'],
  crating: ['Made up for freight', 'package'],
  shipping: ['Every hand-off', 'svc-shipping'],
  remote: ['One job, one package', 'svc-remote'],
  delivery: ['Past the curb', 'svc-delivery'],
};

// Copy for each station. The service names and paragraphs are in data/services.mjs; these restate what uresco.com says.
const DETAIL = {
  takeoffs: {
    spec: ['Drawings, a list or a sketch', 'Build the material take-off and the estimate', 'A materials list and an estimate for the job'],
    acts: (ctx) => html`<a class="btn btn--sm btn--dark" href="${ctx.u('quote/#plans')}">${icon('upload', { size: 16 })} Send plans</a><a class="link" href="${ctx.u('quote/')}">Request a quote ${icon('arrow', { size: 14 })}</a>`,
  },
  design: {
    body: 'Some jobs need more than a list. For those, our team offers design services for your unique project needs, with take-off assistance alongside.',
    spec: ['A project with needs of its own', 'Design help and take-off assistance', 'Materials worked out for your project before you order'],
    acts: (ctx) => html`<a class="btn btn--sm btn--dark" href="#yards" data-open="call-sheet">${icon('phone', { size: 16 })} Talk to a yard</a><a class="link" href="${ctx.u('products/engineered-wood/')}">Engineered wood ${icon('arrow', { size: 14 })}</a>`,
  },
  crating: {
    spec: ['An order with a long way to go', 'Crate, band and wrap the load', 'Units made up for long hauls, export and remote sites'],
    acts: (ctx) => html`<a class="link" href="${ctx.u('alaska/')}#how">How a remote package is made up ${icon('arrow', { size: 14 })}</a>`,
  },
  shipping: {
    spec: ['Where the job is and when it has to land', 'Work out the shipping, the dock and the last leg with you', 'Dock delivery or rural Alaska delivery, arranged with you'],
    acts: (ctx) => html`<a class="link" href="${ctx.u('alaska/')}#ways">Road, water or air: the ways in ${icon('arrow', { size: 14 })}</a>`,
  },
  remote: {
    spec: ['A building going where there is no lumber yard', 'Assemble the complete package so the whole job ships together', 'One package, anywhere in Alaska from Sitka to Utqiaġvik, or made up for export'],
    acts: (ctx) => html`<a class="btn btn--sm btn--dark" href="${ctx.u('quote/')}">Quote a remote job ${icon('arrow', { size: 16 })}</a><a class="link" href="${ctx.u('alaska/')}">Alaska delivery ${icon('arrow', { size: 14 })}</a>`,
  },
  delivery: {
    spec: ['A load and a job site', 'Send a boom truck or a truck-mounted Moffett forklift', 'Materials set where the crew needs them, not at the curb'],
    acts: () => html`<a class="btn btn--sm btn--dark" href="#yards" data-open="call-sheet">${icon('phone', { size: 16 })} Call the nearest yard</a>`,
  },
};
const SPEC = ['You bring', 'We do', 'You get'];

// The six services, in the order a job uses them.
const stations = SERVICES.map((s) => ({ ...s, ...DETAIL[s.id], dwg: DWG[s.id] }));

// The six stations on one line, as the index to the page. It sits under the hero the way the latitude rule does on the Alaska page.
const index = html`
  <nav class="sv-index" aria-label="Services on this page">
    <ol>
      ${stations.map((s) => html`<li><a href="#${s.id}"><span class="sv-index__no num">${s.no}</span><b>${s.tag}</b><span class="sv-index__phase">${s.phase}</span></a></li>`)}
    </ol>
  </nav>`;

const station = (ctx, s) => html`
  <li class="sv-st" id="${s.id}" data-reveal>
    <span class="sv-st__dot" aria-hidden="true"></span>
    <div class="sv-st__grid">
      <div class="sv-st__head">
        <p class="sv-st__bar"><span class="sv-st__no num">${s.no}</span><span class="label">${s.phase}</span></p>
        <h3 class="sv-st__name">${s.name}</h3>
      </div>
      <div class="sv-st__body">
        <p class="sv-st__lede">${s.body}</p>
        <dl class="sv-spec">
          ${s.spec.map((d, i) => html`<div><dt>${SPEC[i]}</dt><dd>${d}</dd></div>`)}
        </dl>
      </div>
      <div class="sv-st__acts">${s.acts(ctx)}</div>
      <figure class="dwg sv-dwg" data-reveal>
        <p class="dwg__bar label"><span>Dwg ${s.no}</span><span class="sv-dwg__title">${s.dwg[0]}</span><span class="dwg__nts">Typical</span></p>
        <div class="dwg__canvas">${drawing(s.dwg[1], { id: 'sv' })}</div>
      </figure>
    </div>
  </li>`;

export default {
  path: 'services/',
  render: (ctx) => layout(ctx, {
    title: 'Services',
    description: 'Material take-offs and estimates, design services, crating, shipping coordination, remote and export building packages, and job-site delivery by boom truck and Moffett forklift from Uresco.',
    preload: [preloadFor(ctx, 'hero-truck-denali')],
    body: html`
${pageHero(ctx, {
  sheet: 'Services',
  meta: 'Six services',
  title: 'Everything between the plans <em>and the pad.</em>',
  lede: 'Take-offs, design help, crating, shipping coordination, complete remote packages and job-site delivery: six services, in the order a job uses them.',
  photoKey: 'hero-truck-denali',
  caption: 'A truck on an Alaska highway, with Denali behind it. A stock photograph, not a Uresco truck.',
  actions: html`<a class="btn" href="${ctx.u('quote/')}">Request a quote ${icon('arrow', { size: 18 })}</a><a class="btn btn--line" href="#yards" data-open="call-sheet">${icon('phone', { size: 18 })} Call a yard</a>`,
  below: index,
})}

<section class="section" id="line">
  <div class="wrap">
    ${sectionHead({ no: '01', eyebrow: 'The line', title: 'One job, <em>six stations.</em>', lede: 'A job can join the line at any station and leave at any other: a take-off only, a delivery only, or the whole run from the drawings to the last bundle set down on site.' })}
    <ol class="sv-line">
      ${stations.map((s) => station(ctx, s))}
    </ol>
    <div class="gnote sv-note">
      <p class="label label--blue">Note 1 · Scope</p>
      <p><strong>Use one service or all six.</strong> The three yards work as one team, so whichever one you call can start your job at the station it needs.</p>
    </div>
  </div>
</section>

<section class="section section--panel" id="yards">
  <div class="wrap">
    ${sectionHead({ no: '02', eyebrow: 'Who to call', title: 'Start with <em>the nearest yard.</em>', lede: 'Our friendly, knowledgeable sales staff is here to help. Call the yard nearest the job; any of the three can help.', action: html`<a class="link" href="${ctx.u('locations/')}">Addresses, fax &amp; directions ${icon('arrow', { size: 16 })}</a>` })}
    ${yardStrip(ctx)}
  </div>
</section>

${quoteBand(ctx, { no: '03' })}
`,
  }),
};
