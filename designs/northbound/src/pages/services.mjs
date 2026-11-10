import { html, raw } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';
import { layout } from '../lib/layout.mjs';
import { picture, preloadFor, pageHero, sectionHead, figure, closing, callLink, LAT } from '../lib/components.mjs';
import { SERVICES, SEQUENCE, SEA } from '../data/services.mjs';
import { CATEGORIES } from '../data/products.mjs';

// The services page follows one load from the plans to the ground. The six services are told in
// the order a load meets them (SEQUENCE), each under its own anchor: other pages link to
// /services/#<id>, so the ids never change. Stops 03 to 05 are only needed by a job that crosses
// water, so they share the dark sheet; the rest sit on paper.
const two = (n) => String(n).padStart(2, '0');
const RUN = SEQUENCE.map((id, i) => ({ ...SERVICES.find((s) => s.id === id), no: two(i + 1) }));
const stop = Object.fromEntries(RUN.map((s) => [s.id, s]));
// Which part of the run each stop opens: every job needs the first two, a job across an ocean
// adds the next three, and the last is the truck down the road.
const LEG = RUN.map((s, i) => {
  const sea = SEA.includes(s.id), afterSea = i > 0 && SEA.includes(RUN[i - 1].id);
  return i === 0 ? 'Every job' : sea && !afterSea ? 'Across an ocean' : !sea && afterSea ? 'Down the road' : '';
});
// The stops a job across an ocean adds, as the run's standfirst names them: "03, 04 and 05".
const SEA_NOS = SEA.map((id) => stop[id].no);
const SEA_LIST = `${SEA_NOS.slice(0, -1).join(', ')} and ${SEA_NOS[SEA_NOS.length - 1]}`;
// The quote form starts its materials list with whatever ?product= carries.
const quoteQuery = (s) => `?product=${encodeURIComponent(s.name)}`;

// The ruled bar that opens a stop: its number, the service's name (the heading), and the stop's
// short name on the right.
const bar = (s) => html`
  <header class="chead__bar svx-bar rv-line">
    <span class="chead__no">${s.no}</span>
    <h2 class="svx-bar__name" id="${s.id}-title">${s.name}</h2>
    <span class="chead__lat svx-bar__stage">${s.stage}</span>
  </header>`;

// The handoff: what the customer brings to this stop and what they get back from it.
const handoff = (s, i = 0) => html`
  <dl class="svx-io rv" style="--i:${i}">
    <div><dt>You bring</dt><dd>${s.brings}</dd></div>
    <div><dt>You get</dt><dd>${s.gets}</dd></div>
  </dl>`;

const line = (s, cls = '') => html`<p class="h2 svx-line ${cls} rv">${raw(s.line)}</p>`;

// The take-off sheet: what a take-off can cover, top to bottom. The nine product lines, each a link.
const takeoffSheet = (ctx) => html`
  <div class="svx-sheet rv" style="--i:1">
    <div class="svx-sheet__head">
      <p class="label">Material take-off</p>
      <p class="label" aria-hidden="true">The list</p>
    </div>
    <ol class="svx-sheet__rows">
      ${CATEGORIES.map((c, i) => html`<li><a href="${ctx.u('products/' + c.slug + '/')}">
        <span class="svx-sheet__no">${String((i + 1) * 10).padStart(3, '0')}</span>
        <span class="svx-sheet__name">${c.name}</span>
        <span class="svx-sheet__items">${c.items.map(([n]) => n.replace(/[®™]/g, '')).join(' · ')}</span>
        ${icon('arrow', { size: 16, cls: 'svx-sheet__go' })}
      </a></li>`)}
    </ol>
    <p class="svx-sheet__foot">Quantities and prices come from your plans.</p>
  </div>`;

const ENGINEERED = CATEGORIES.find((c) => c.slug === 'engineered-wood');

export default {
  path: 'services/',
  render: (ctx) => layout(ctx, {
    title: 'Services',
    description: 'Material take-offs and estimates, design services, remote and export building packages, crating, shipping coordination and job-site delivery by boom truck and Moffett forklift, from Uresco’s three yards.',
    preload: [preloadFor(ctx, 'hero-truck-denali')],
    body: html`
${pageHero(ctx, {
  crumbs: [['Services']],
  eyebrow: 'Services · Take-offs to delivery',
  title: 'Everything between the plans <em>and the load.</em>',
  lede: 'Take-offs, design help, packaging, crating, freight, and a truck that sets the load down where you want it. Six services, in the order a job meets them.',
  photoKey: 'hero-truck-denali',
  caption: 'A freight truck on the highway below Denali.',
  place: 'Interior Alaska',
  lat: LAT.denali,
  pos: '60% 42%',
  actions: html`<a class="btn" href="${ctx.u('quote/')}">Request a quote ${icon('arrow', { size: 18 })}</a>${callLink(ctx)}`,
})}

<section class="section svx-index" aria-labelledby="run-title">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'The run', id: 'run-title', title: 'Six stops, <em>one after another.</em>', lede: `A job down the road goes from ${stop.design.no} straight to ${stop.delivery.no}. A job across an ocean adds ${SEA_LIST} on the way.` })}
    <ol class="svx-run">
      ${RUN.map((s, i) => html`<li class="svx-run__stop${SEA.includes(s.id) ? ' is-sea' : ''}${LEG[i] ? ' has-leg' : ''}">
        ${LEG[i] ? html`<span class="svx-run__leg">${LEG[i]}</span>` : ''}
        <a href="#${s.id}">
          <span class="svx-run__no rv" style="--i:${i}">${s.no}</span>
          <span class="svx-run__text rv" style="--i:${i}"><span class="svx-run__name">${s.name}</span><span class="svx-run__stage">${s.stage}</span></span>
          ${icon('arrow', { size: 18, cls: 'svx-run__go' })}
        </a>
      </li>`)}
    </ol>
  </div>
</section>

<section class="svx-yard" aria-label="Every job: the list and the design">
  <div class="wrap">
    <article class="svx-stage svx-stage--list" id="takeoffs" aria-labelledby="takeoffs-title">
      ${bar(stop.takeoffs)}
      <div class="svx-stage__grid">
        <div class="svx-stage__text">
          ${line(stop.takeoffs)}
          <p class="svx-stage__body rv" style="--i:1">${stop.takeoffs.body}</p>
          ${handoff(stop.takeoffs, 2)}
          <div class="actions rv" style="--i:3">
            <a class="btn btn--line" href="${ctx.u('quote/')}${quoteQuery(stop.takeoffs)}#plans">${icon('upload', { size: 18 })} Send plans</a>
            <a class="link" href="${ctx.u('quote/')}${quoteQuery(stop.takeoffs)}">Request a quote ${icon('arrow', { size: 16 })}</a>
          </div>
        </div>
        <div class="svx-stage__media">
          ${figure(ctx, 'blueprints', { ratio: 'land', sizes: '(min-width: 1000px) min(48vw, 46rem), 100vw', caption: 'Marking up a set of drawings with a scale rule.', pos: '50% 55%' })}
          ${takeoffSheet(ctx)}
        </div>
      </div>
    </article>

    <article class="svx-stage svx-stage--flip" id="design" aria-labelledby="design-title">
      ${bar(stop.design)}
      <div class="svx-stage__grid">
        <div class="svx-stage__text">
          ${line(stop.design)}
          <p class="svx-stage__body rv" style="--i:1">${stop.design.body}</p>
          ${handoff(stop.design, 2)}
          <div class="svx-members rv" style="--i:3">
            <p class="label">Engineered wood we supply</p>
            <ul>${ENGINEERED.items.map(([n]) => html`<li>${n.replace(/[®™]/g, '')}</li>`)}</ul>
            <a class="link" href="${ctx.u('products/' + ENGINEERED.slug + '/')}">${ENGINEERED.name} ${icon('arrow', { size: 16 })}</a>
          </div>
        </div>
        <div class="svx-stage__media">
          ${figure(ctx, 'framing-joists', { ratio: 'land', sizes: '(min-width: 1000px) min(48vw, 46rem), 100vw', caption: 'Roof trusses set on a newly framed house.', pos: '50% 40%' })}
        </div>
      </div>
    </article>
  </div>
</section>

<section class="section section--deep svx-sea" aria-label="Across an ocean: the package, the crate and the freight">
  <article class="svx-lead" id="remote" aria-labelledby="remote-title">
    <div class="wrap">
      ${bar(stop.remote)}
      <div class="svx-lead__head">
        ${line(stop.remote, 'svx-line--xl')}
        <div class="svx-lead__side">
          <p class="lede rv" style="--i:1">${stop.remote.body}</p>
          ${handoff(stop.remote, 2)}
        </div>
      </div>
    </div>
    ${figure(ctx, 'valdez-port', { ratio: 'cine', cls: 'fig--bleed svx-bleed', parallax: true, caption: 'A port crane at the foot of the mountains.', place: 'Valdez, Alaska', lat: LAT.valdez, pos: '55% 62%' })}
    <div class="wrap svx-lead__foot">
      <p class="pull rv">Nothing gets <em>left on the dock.</em></p>
      <div class="svx-lead__more rv" style="--i:1">
        <p>Framing, envelope, openings and hardware go out as one package, planned from the far end back. Delivery is available anywhere in Alaska, from Sitka to Utqiaġvik.</p>
        <div class="actions">
          <a class="btn btn--line" href="${ctx.u('alaska/')}">How remote delivery works ${icon('arrow', { size: 18 })}</a>
          <a class="link" href="${ctx.u('quote/')}${quoteQuery(stop.remote)}">Quote a remote package ${icon('arrow', { size: 16 })}</a>
        </div>
      </div>
    </div>
  </article>

  <div class="wrap svx-pair">
    <article class="svx-stage svx-stage--half" id="crating" aria-labelledby="crating-title">
      ${bar(stop.crating)}
      ${figure(ctx, 'plywood', { ratio: 'port', sizes: '(min-width: 700px) min(36vw, 33rem), 78vw', caption: 'Panel stacks, banded and wrapped.', pos: '50% 30%' })}
      ${line(stop.crating, 'svx-line--sm')}
      <p class="svx-stage__body rv" style="--i:1">${stop.crating.body}</p>
      ${handoff(stop.crating, 2)}
    </article>
    <article class="svx-stage svx-stage--half svx-stage--wide" id="shipping" aria-labelledby="shipping-title">
      ${bar(stop.shipping)}
      ${figure(ctx, 'juneau-freight', { ratio: 'land', sizes: '(min-width: 700px) min(50vw, 46rem), 100vw', caption: 'Containers in a freight yard.', place: 'Juneau, Alaska', lat: LAT.juneau, pos: '50% 52%' })}
      ${line(stop.shipping, 'svx-line--sm')}
      <p class="svx-stage__body rv" style="--i:1">${stop.shipping.body}</p>
      ${handoff(stop.shipping, 2)}
      <ul class="svx-legs rv" style="--i:3">
        <li>${icon('route', { size: 20 })}Shipping coordination</li>
        <li>${icon('ship', { size: 20 })}Dock delivery</li>
        <li>${icon('plane', { size: 20 })}Rural Alaska delivery</li>
      </ul>
    </article>
  </div>
</section>

<section class="section svx-site" aria-label="Down the road: the drop">
  <div class="wrap">
    <article class="svx-stage svx-stage--drop" id="delivery" aria-labelledby="delivery-title">
      ${bar(stop.delivery)}
      <div class="svx-stage__grid">
        <div class="svx-stage__text">
          ${line(stop.delivery, 'svx-line--xl')}
          <p class="lede rv" style="--i:1">${stop.delivery.body} Around Puget Sound, call Kent. In Southcentral Alaska, call Anchorage. In the Interior and points north, call Fairbanks.</p>
          <dl class="svx-rig rv" style="--i:2">
            <div><dt>Boom truck</dt><dd>A crane on the truck lifts the load off the bed and sets it down on site.</dd></div>
            <div><dt>Moffett forklift</dt><dd>Rides on the back of the truck, then carries the load across the site.</dd></div>
          </dl>
          ${handoff(stop.delivery, 3)}
          <div class="actions rv" style="--i:4">
            ${callLink(ctx, { text: 'Call the nearest yard' })}
            <a class="link" href="${ctx.u('locations/')}">Find your yard ${icon('arrow', { size: 16 })}</a>
          </div>
        </div>
        <div class="svx-stage__media svx-prints">
          ${figure(ctx, 'unloading', { ratio: 'tall', sizes: '(min-width: 1000px) min(36vw, 33rem), (min-width: 700px) 31rem, 82vw', caption: 'Unloading lumber from a flatbed in the street.', pos: '50% 48%' })}
          <figure class="print print--over rv" style="--i:2">
            ${picture(ctx, 'uresco-truck', { sizes: '(min-width: 1000px) 190px, 40vw' })}
            <figcaption>From the Uresco archive: the tag on a Uresco load.</figcaption>
          </figure>
        </div>
      </div>
    </article>
  </div>
</section>

${closing(ctx, {
  title: 'Start at <em>stop one.</em>',
  body: 'Send drawings or a materials list and tell us where the job is. The yard nearest your project builds the take-off and prices it.',
})}
`,
  }),
};
