import { html, raw } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';
import { layout } from '../lib/layout.mjs';
import { picture, preloadFor, sectionHead, pageHero, quoteBand, interlude, callLink } from '../lib/components.mjs';
import { FIGURES, FLOOR_FRAMING, asFig, figBody } from '../lib/drawings.mjs';
import { SERVICES } from '../data/services.mjs';
import { CATEGORIES } from '../data/products.mjs';

// The six services as one line, in the order a job meets them: plans in, delivered load out.
const LINE = [...SERVICES].sort((a, b) => a.seq - b.seq);
const no = (s) => String(s.seq).padStart(2, '0');

// A complete building package: framing, panels, a crate of smaller goods and the windows and doors, on one deck.
const PACKAGE = `<svg class="fig" viewBox="0 0 560 360" aria-hidden="true" focusable="false">
<path class="l w" d="M46 296h468"/><path class="d" d="M86 296v14M204 296v14M322 296v14M440 296v14"/>
<rect class="f" x="66" y="222" width="158" height="74" rx="3"/>
<path class="d" d="M97.6 222v74M129.2 222v74M160.8 222v74M192.4 222v74M66 246.7h158M66 271.3h158"/>
<rect class="f" x="66" y="172" width="158" height="50" rx="3"/>
<path class="d" d="M66 184.5h158M66 197h158M66 209.5h158"/>
<rect class="f" x="240" y="190" width="130" height="106" rx="3"/>
<path class="d" d="M240 225.3h130M240 260.7h130M283.3 190v106M326.7 190v106"/>
<rect class="f" x="258" y="148" width="62" height="42" rx="3"/><rect class="f" x="326" y="162" width="36" height="28" rx="3"/>
<path class="d" d="M289 148v42M326 176h36"/>
<rect class="f" x="386" y="164" width="52" height="132" rx="3"/>
<path class="l" d="M396 176h32v44h-32zM396 232h32v52h-32z"/><path class="d" d="M412 176v44"/>
<rect class="f" x="446" y="186" width="50" height="110" rx="3"/>
<path class="d" d="M446 241h50M471 186v110"/>
<path class="y w" d="M66 198h158M240 212h130M240 274h130M386 228h110"/>
<path class="d" d="M471 186C486 158 492 128 492 102"/>
<rect class="yf" x="402" y="68" width="146" height="34" rx="8"/><text class="tk" x="475" y="90" text-anchor="middle">ONE PACKAGE</text>
<text class="t" x="66" y="162">FRAMING + PANELS</text><text class="t" x="240" y="138">CRATED GOODS</text>
</svg>`;

// The line drawings are the site's own (src/lib/drawings.mjs), used here as each service's picture.
const fig = (svg, cls = '') => raw(asFig(svg, `sv-fig${cls ? ' ' + cls : ''}`));
const FIG = {
  // Take-offs: the take-off sheet on its own, and (where the card is wide) the plans it was made from.
  takeoffs: raw(`${fig(FIGURES[1], 'sv-fig--solo')}<svg class="fig sv-fig sv-fig--pair" viewBox="0 0 836 360" aria-hidden="true" focusable="false">
<g transform="translate(-88 0)">${figBody(FIGURES[0])}</g>
<path class="y w" d="M400 180h58m-13-13 13 13-13 13"/>
<g transform="translate(366 0)">${figBody(FIGURES[1])}</g>
</svg>`),
  remote: fig(PACKAGE),
  crating: fig(FIGURES[2]),
  shipping: fig(FIGURES[3]),
  delivery: fig(FIGURES[4]),
  design: fig(FLOOR_FRAMING),
};

// What each stop adds to the service's own description in src/data/services.mjs.
// Every line restates uresco.com; the two equipment notes say what that equipment does anywhere.
const SPEC = {
  takeoffs: [['You send', 'Drawings or a materials list'], ['We help with', 'The take-off and the estimate'], ['Goes to', 'The yard you choose']],
  design: [['Along with', 'Take-off assistance'], ['See also', (ctx) => html`<a href="${ctx.u('products/engineered-wood/')}">Engineered floor, beam and truss packages</a>`]],
  crating: [['Built for', 'Long hauls and multiple handoffs'], ['Loads', 'Remote and export packages']],
  shipping: [['Shipping', 'Coordinated with you'], ['Last leg', 'Rural Alaska delivery']],
  delivery: [['Boom trucks', 'Lift bundles off the bed and set them in place'], ['Moffetts', 'Truck-mounted forklifts that unload and carry across the site'], ['Goes to', 'Job sites down the road']],
};

const spec = (ctx, s) => html`<dl class="sv-spec">${SPEC[s.id].map(([k, v]) => html`<div><dt>${k}</dt><dd>${typeof v === 'function' ? v(ctx) : v}</dd></div>`)}</dl>`;

// One of Uresco's own photographs, set like a small print: evidence beside a claim.
const proof = (ctx, key, text) => html`
  <figure class="sv-proof">
    ${picture(ctx, key, { sizes: '112px' })}
    <figcaption><span>From Uresco</span>${text}</figcaption>
  </figure>`;

// The picture at the top of a stop: a line drawing on night, or a photograph.
const drawing = (s) => html`
  <div class="sv-stop__media sv-stop__media--night">
    <p class="sv-stop__bar"><span>${s.step}</span><span><b>${no(s)}</b> / 0${LINE.length}</span></p>
    ${FIG[s.id]}
  </div>`;

// A stop on the line: picture, what the service is, what it comes to, and the next thing to do.
const stop = (ctx, s, { wide = false, media, side, acts, i = 0 }) => html`
  <article class="sv-stop${wide ? ' sv-stop--wide' : ''} reveal" id="${s.id}" style="--i:${i}">
    ${media || drawing(s)}
    <div class="sv-stop__body">
      <div class="sv-stop__main">
        <h3 class="sv-stop__title">${s.name}</h3>
        <p class="sv-stop__text">${s.body}</p>
      </div>
      <div class="sv-stop__side">${side || spec(ctx, s)}</div>
      ${acts ? html`<div class="sv-stop__acts">${acts}</div>` : ''}
    </div>
  </article>`;

const S = Object.fromEntries(SERVICES.map((s) => [s.id, s]));
const legHead = (name, title, lede) => {
  const stops = LINE.filter((s) => s.leg === name);
  return sectionHead({ eyebrow: html`${no(stops[0])}–${no(stops[stops.length - 1])} <i>·</i> ${name}`, title, lede });
};

export default {
  path: 'services/',
  render: (ctx) => layout(ctx, {
    title: 'Services',
    description: 'Material take-off help and estimates, design services, remote and export building packages, crating, shipping coordination and job-site delivery by boom truck and Moffett forklift from Uresco.',
    preload: [preloadFor(ctx, 'unloading')],
    body: html`
${pageHero(ctx, {
  eyebrow: 'Services',
  title: 'From your plans <em>to your site.</em>',
  lede: 'Take-offs, design help, complete packages, crating, freight and delivery. Six services, in the order a job meets them.',
  photoKey: 'unloading',
  caption: 'Lumber coming off a flatbed',
  actions: html`<a class="btn btn--lg" href="${ctx.u('quote/#plans')}">${icon('upload', { size: 18 })} Send plans</a>${callLink(ctx, { cls: 'btn--lg btn--line' })}`,
})}

<section class="sv-line" aria-labelledby="sv-line-title">
  <div class="sv-line__card">
    <div class="sv-line__head">
      <div>
        <p class="eyebrow">In order</p>
        <h2 class="h2" id="sv-line-title">Six services, <em>in job order.</em></h2>
      </div>
      <p class="sv-line__lede">Use one or all six. A job across town may only need a take-off and a truck. A package for a village off the road system uses most of them.</p>
    </div>
    <nav class="sv-map" aria-label="The six services, in order">
      <ol class="sv-map__stops">
        ${LINE.map((s, i) => html`<li class="sv-map__stop reveal" style="--i:${i}">
          ${i === 0 || LINE[i - 1].leg !== s.leg ? html`<span class="sv-map__leg">${s.leg}</span>` : ''}
          <a class="sv-map__link" href="#${s.id}">
            <i class="sv-map__node" aria-hidden="true"></i>
            <span class="sv-map__no">${no(s)}</span>
            <b class="sv-map__name">${s.name}</b>
            <small class="sv-map__short">${s.short}</small>
            ${icon('chevron-down', { size: 18, cls: 'sv-map__go' })}
          </a>
        </li>`)}
        <li class="sv-map__end"><i aria-hidden="true"></i><span>Your site</span></li>
      </ol>
    </nav>
  </div>
</section>

<section class="section sv-leg">
  <div class="wrap">
    ${legHead('On paper', 'Plans in. <em>Help with the take-off.</em>', 'Send drawings or a materials list. We help with the take-off and the estimate, and with the design where a project needs it.')}
    <div class="sv-leg__grid">
      ${stop(ctx, S.takeoffs, { wide: true, acts: html`<a class="btn btn--dark" href="${ctx.u('quote/#plans')}">${icon('upload', { size: 17 })} Send plans or a list</a>` })}
      ${stop(ctx, S.design, { i: 1, acts: callLink(ctx, { label: 'Talk it through with a yard', size: 17 }) })}
    </div>
  </div>
</section>

<section class="section section--ice sv-leg">
  <div class="wrap">
    ${legHead('In the yard', 'The whole job, <em>built into one package.</em>', 'Where there is no lumber yard down the road, everything has to arrive together. We assemble the complete package, then pack it for the trip.')}
    <div class="sv-leg__grid">
      ${stop(ctx, S.remote, {
        wide: true,
        side: html`<div class="sv-kit">
          <p class="sv-kit__lab">A complete package can carry</p>
          <ul class="sv-kit__list">${CATEGORIES.map((c) => html`<li><a href="${ctx.u('products/' + c.slug + '/')}">${icon('check', { size: 14 })}${c.short}</a></li>`)}<li><span class="sv-kit__more">And a large variety of other building materials</span></li></ul>
        </div>`,
        acts: html`<a class="btn btn--dark" href="${ctx.u('alaska/')}">How remote delivery works ${icon('arrow', { size: 17 })}</a>`,
      })}
      ${stop(ctx, S.crating, { i: 1, acts: proof(ctx, 'uresco-yard', 'Wrapped bundles and a forklift in a Uresco yard.') })}
    </div>
  </div>
</section>

${interlude(ctx, 'hero-truck-denali', { line: 'Down the road, <em>or across an ocean.</em>', note: 'Stock photograph: a freight truck below Denali, Alaska.' })}

<section class="section sv-leg">
  <div class="wrap">
    ${legHead('On the way', 'To the dock, <em>or to the job site.</em>', 'We can work with you on all aspects of shipping coordination, dock delivery and rural Alaska delivery. Down the road, it goes by boom truck and Moffett forklift.')}
    <div class="sv-leg__grid sv-leg__grid--even">
      ${stop(ctx, S.shipping, {
        side: html`<ul class="sv-modes" aria-label="How freight moves">
          <li class="chip">${icon('road', { size: 16 })}Road system</li>
          <li class="chip">${icon('ship', { size: 16 })}Ocean freight &amp; barge</li>
          <li class="chip">${icon('plane', { size: 16 })}Air cargo</li>
        </ul>${spec(ctx, S.shipping)}`,
        acts: html`<a class="link" href="${ctx.u('alaska/#finder')}">Name the place, see the way in ${icon('arrow', { size: 16 })}</a>`,
      })}
      ${stop(ctx, S.delivery, { i: 1, acts: html`${callLink(ctx, { label: 'Call the yard nearest the job', size: 17 })}${proof(ctx, 'uresco-truck', 'The tag on a Uresco load.')}` })}
    </div>
  </div>
</section>

${quoteBand(ctx, { title: 'Send plans. <em>Add what the job needs.</em>', body: 'Send drawings or a list and we will help with the take-off and the estimate. Add crating, freight or delivery once you know what the job needs.', href: `${ctx.u('quote/#plans')}`, label: 'Send plans' })}
`,
  }),
};
