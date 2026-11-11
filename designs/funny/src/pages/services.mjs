import { html, raw } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';
import { layout } from '../lib/layout.mjs';
import { win, pageHero, pageHeroPreload, quoteBand, sticker, marquee, photoCaption, callBtn } from '../lib/components.mjs';
import { SERVICES } from '../data/services.mjs';
import { CATEGORIES } from '../data/products.mjs';

// The page tells the six services in the order a job meets them (`step` in the data): two on
// paper, two that pack the load, two that move it. Every section keeps the id other pages link to.
const STOPS = [...SERVICES].sort((a, b) => a.step - b.step);
const ACTS = ['On paper', 'Packed', 'On the way'];
const no = (n) => String(n).padStart(2, '0');

// What a complete building package holds (the Alaska page names the same four), with the
// product lines each layer draws on.
const LAYERS = [
  ['Framing', 'Lumber, timbers and engineered wood'],
  ['Envelope', 'Sheathing, siding, insulation and roofing'],
  ['Openings', 'Windows and doors'],
  ['Hardware', 'Connectors and fasteners'],
];
// FACTS: "Crating and packaging." Those two words, each wearing what it says.
const WRAPS = [['crate', 'Crated'], ['pack', 'Packaged']];
const LEGS = [
  ['route', 'Shipping coordination', 'We can work with you on all aspects of it, whether the load goes by truck, ocean freight, barge or air.'],
  ['ship', 'Dock delivery', 'Materials brought to the dock.'],
  ['plane', 'Rural Alaska delivery', 'The last leg, into communities the road doesn’t reach.'],
];
const RIGS = [
  ['boom', 'Boom truck', 'A crane on the truck lifts the load off the deck and sets it down on site.'],
  ['forklift', 'Moffett forklift', 'A forklift that rides on the back of the truck, then carries the load across the site.'],
];

// Each stop: its field, its headline, and what it shows beside the copy.
const STAGE = {
  takeoffs: {
    field: 'p',
    title: 'One job. <br><em>One list.</em>',
    show: (ctx) => html`
      <div class="sv-show sv-show--sheet">
        ${win(ctx, 'framing-joists', { cls: 'sv-win sv-win--hang', sizes: '(min-width: 900px) 24vw, 110px', after: photoCaption('framing-joists', 'Roof trusses and wall framing') })}
        <div class="sv-sheet" data-reveal>
          <p class="sv-sheet__head"><b>Take-off</b><span>One list. Every line we carry.</span></p>
          <ol class="sv-sheet__rows">
            ${CATEGORIES.map((c, i) => html`<li><a href="${ctx.u('products/' + c.slug + '/')}"><span class="nums" aria-hidden="true">${no(i + 1)}</span><span>${c.short}</span>${icon('check', { size: 18 })}</a></li>`)}
          </ol>
          <p class="sv-sheet__foot">And the small stuff: tarps, poly, caulking, adhesives, house wraps.</p>
        </div>
      </div>`,
    more: (ctx) => html`
      <ol class="sv-how">
        <li><span><b>Send drawings, a list or a sketch.</b> Whatever you have.</span></li>
        <li><span><b>We help with the take-off</b> and estimate it.</span></li>
        <li><span><b>Any yard can help.</b> Call the one nearest your job.</span></li>
      </ol>
      <div class="actions">
        <a class="btn" href="${ctx.u('quote/#plans')}">${icon('upload', { size: 18 })} Send plans</a>
        ${callBtn(ctx, { cls: 'btn--line sv-dup' })}
      </div>`,
  },
  design: {
    arch: true,
    field: 'k',
    flip: true,
    title: 'For your <em>unique project.</em>',
    show: (ctx) => html`
      <div class="sv-show sv-show--design">
        ${win(ctx, 'custom-home', { shape: 'arch', duo: true, cls: 'sv-win sv-win--stand', sizes: '(min-width: 900px) 34vw, 66vw', after: photoCaption('custom-home', 'New wood framing and trusses') })}
      </div>`,
    more: (ctx) => html`
      <div class="actions">
        ${callBtn(ctx)}
        <a class="btn btn--line" href="${ctx.u('quote/#plans')}">${icon('upload', { size: 18 })} Send plans</a>
      </div>`,
  },
  remote: {
    field: 'y',
    title: 'The whole job. <br><em>One package.</em>',
    show: (ctx) => html`
      <div class="sv-show sv-show--pack">
        ${win(ctx, 'tug-barge', { shape: 'pill', cls: 'sv-pack__win', sizes: '(min-width: 900px) 38vw, 92vw', after: photoCaption('tug-barge', 'A tug and a loaded freight barge') })}
        <ul class="sv-pack" aria-label="What a complete building package holds">
          ${LAYERS.map(([name, items], i) => html`<li style="--i:${i}" data-reveal><b>${name}</b><span>${items}</span></li>`)}
        </ul>
        ${sticker(raw('Sitka <span aria-hidden="true">→</span><span class="sr-only">to</span> Utqiaġvik'), { tone: '', rot: -6, cls: 'sv-pack__sticker' })}
      </div>`,
    more: (ctx) => html`
      <div class="actions">
        <a class="btn" href="${ctx.u('alaska/')}">Alaska delivery ${icon('arrow', { size: 18 })}</a>
        <a class="btn btn--line sv-dup" href="${ctx.u('quote/?yard=anchorage&delivery=Remote%20Alaska%20shipping')}">Quote a remote job</a>
      </div>`,
  },
  crating: {
    field: 'k',
    flip: true,
    title: 'Crated <em>for the trip.</em>',
    show: (ctx) => html`
      <div class="sv-show sv-show--wraps">
        <ul class="sv-wraps">
          ${WRAPS.map(([kind, word], i) => html`<li class="sv-wrap sv-wrap--${kind}" style="--i:${i}" data-reveal><b>${word}</b></li>`)}
        </ul>
      </div>`,
    more: (ctx) => html`
      <div class="actions">
        ${callBtn(ctx, { cls: 'btn--line sv-dup' })}
      </div>`,
  },
  shipping: {
    arch: true,
    field: 'p',
    title: 'To the dock. <br><em>And past it.</em>',
    show: (ctx) => html`
      <div class="sv-show sv-show--ship">
        ${win(ctx, 'juneau-freight', { cls: 'sv-win sv-win--hang', sizes: '(min-width: 900px) 28vw, 66vw', after: photoCaption('juneau-freight', 'A freight yard in Juneau') })}
      </div>`,
    more: () => '',
    after: (ctx) => html`
      <ol class="sv-legs">
        ${LEGS.map(([ic, name, text], i) => html`<li class="sv-leg" style="--i:${i}" data-reveal><span class="sv-leg__icon">${icon(ic, { size: 26 })}</span><b>${name}</b><span>${text}</span></li>`)}
      </ol>
      <a class="ticket sv-ticket" href="${ctx.u('alaska/')}#route" data-reveal>
        <span class="ticket__k">Alaska delivery</span>
        <span class="ticket__t">Where’s it going?</span>
        <span class="ticket__d">Name a place and see how freight typically reaches it, and which yard to call.</span>
        <span class="line__go">${icon('arrow', { size: 22 })}</span>
      </a>`,
  },
  delivery: {
    arch: true,
    field: 'k',
    flip: true,
    title: 'Two ways <em>off the truck.</em>',
    show: (ctx) => html`
      <div class="sv-show sv-show--site">
        ${win(ctx, 'unloading', { shape: 'arch', duo: true, cls: 'sv-win sv-win--stand', sizes: '(min-width: 900px) 34vw, 66vw', after: photoCaption('unloading', 'Unloading lumber from a flatbed') })}
      </div>`,
    more: (ctx) => html`
      <ul class="sv-rigs">
        ${RIGS.map(([ic, name, text], i) => html`<li class="sv-rig" style="--i:${i}" data-reveal><span class="sv-rig__icon">${icon(ic, { size: 38 })}</span><b>${name}</b><span>${text}</span></li>`)}
      </ul>
      <div class="actions">
        ${callBtn(ctx)}
        <a class="btn btn--line sv-dup" href="${ctx.u('quote/')}">Request a quote ${icon('arrow', { size: 18 })}</a>
      </div>`,
  },
};

// Six hooks along the top edge of each section; the load hangs one hook further along each time.
const rail = (s) => html`<div class="sv-rail" aria-hidden="true" data-reveal>${STOPS.map((t, n) => (t.step === s.step
  ? html`<i class="is-on">${icon(s.icon, { size: 30 })}</i>`
  : html`<i${t.step < s.step ? html` class="is-done"` : ''} style="--n:${n}"></i>`))}</div>`;

const stop = (ctx, s) => {
  const st = STAGE[s.id];
  const next = STOPS[s.step];
  return html`
<section class="section field-${st.field} sv-stop sv-stop--${s.id}${st.flip ? ' sv-stop--flip' : ''}${st.arch ? ' sv-stop--arch' : ''}" id="${s.id}" aria-labelledby="sv-h-${s.id}">
  <div class="wrap sv-stop__grid">
    <div class="sv-stop__copy">
      ${rail(s)}
      <p class="sv-stop__name"><span class="sv-stop__no nums">${no(s.step)}<span aria-hidden="true"> / 06</span><span class="sr-only"> of 6:</span></span> ${s.name}</p>
      <h2 class="d2 sv-stop__title" id="sv-h-${s.id}"><span class="sr-only">${s.name}: </span>${raw(st.title)}</h2>
      <p class="lede">${s.body}</p>
      ${st.more(ctx)}
    </div>
    ${st.show(ctx)}
    <div class="sv-stop__foot">
      ${st.after ? st.after(ctx) : ''}
      ${next
        ? html`<a class="link sv-next" href="#${next.id}"><span class="sv-next__k">Next <span class="nums">${no(next.step)}</span></span> ${next.label}<span class="sr-only">: ${next.name}</span> ${icon('arrow', { size: 16 })}</a>`
        : html`<a class="link sv-next sv-next--end" href="${ctx.u('quote/#plans')}"><span class="sv-next__k">Start at <span class="nums">01</span></span> Send plans ${icon('arrow', { size: 16 })}</a>`}
    </div>
  </div>
</section>`;
};

export default {
  path: 'services/',
  render: (ctx) => layout(ctx, {
    title: 'Services',
    description: 'Material take-offs and estimates, design services, remote and export building packages, crating, shipping coordination and job-site delivery by boom truck and Moffett forklift from Uresco.',
    preload: [pageHeroPreload(ctx, 'blueprints')],
    body: html`
${pageHero(ctx, {
  cls: 'sv-hero',
  eyebrow: 'Services',
  title: 'Plans in. <br><em>Load out.</em>',
  lede: 'Six services take a job from a set of drawings to a load delivered to the job site. The whole movie, not just the trailer.',
  photoKey: 'blueprints',
  caption: 'Marking up drawings',
  actions: html`<a class="btn" href="${ctx.u('quote/#plans')}">${icon('upload', { size: 18 })} Send plans</a>${callBtn(ctx, { cls: 'btn--line' })}`,
})}

<nav class="sv-rack field-k" aria-label="The six services, in order">
  <div class="wrap">
    <ul class="sv-rack__acts">
      ${ACTS.map((act, a) => html`<li class="sv-act">
        <p class="sv-act__name">${act}</p>
        <ul class="sv-act__stops">
          ${STOPS.slice(a * 2, a * 2 + 2).map((s) => html`<li><a class="sv-hook" href="#${s.id}">
            <span class="sv-hook__u" style="--i:${s.step - 1}">${icon(s.icon, { size: 30 })}</span>
            <span class="sv-hook__no nums" aria-hidden="true">${no(s.step)}</span>
            <b class="sv-hook__name">${s.label}</b>
            <span class="sr-only">: ${s.name}</span>
          </a></li>`)}
        </ul>
      </li>`)}
    </ul>
  </div>
</nav>

${STOPS.map((s) => stop(ctx, s))}

${marquee(STOPS.map((s) => s.label), { tone: 'y', tilt: true, slow: true })}

${quoteBand(ctx, { title: 'Start with <em>the plans.</em>', body: 'Send drawings or a list. We’ll help with the take-off and the estimate.', label: 'Estimates & take-offs' })}
`,
  }),
};
