import { html } from '../lib/html.mjs';
import { sketch } from '../lib/drawings.mjs';
import { icon } from '../lib/icons.mjs';
import { layout, orgJsonLd } from '../lib/layout.mjs';
import { preloadFor, sectionHead, quoteBand, yardCard, deliveryMap, plate, latRule, board, manifest, sequence } from '../lib/components.mjs';
import { SERVICES } from '../data/services.mjs';
import { PROJECTS } from '../data/projects.mjs';
import { LOCATIONS } from '../data/locations.mjs';
import { SITE } from '../config.mjs';

// The hero photograph is a wide strip, so every screen gets the landscape file at the strip's own width.
const HERO = { sizes: '(min-width: 1440px) 1328px, (min-width: 700px) calc(100vw - 2 * clamp(1.125rem, .3rem + 3.4vw, 3.5rem)), 100vw', art: false };

// Services in the order a package moves through them.
const FLOW = ['takeoffs', 'design', 'crating', 'shipping', 'remote', 'delivery'];
// One line of work per sector for the schedule.
const WORK = [['Village housing packages', 'village'], ['Schools, clinics & public buildings', 'public'], ['Commercial & multifamily framing', 'multi'], ['Custom homes', 'home']];

export default {
  path: '',
  render: (ctx) => layout(ctx, {
    title: 'Lumber & building materials for Alaska and the Pacific Northwest',
    description: 'Uresco Construction Materials supplies lumber, engineered wood, siding and complete building packages from Kent, Anchorage and Fairbanks, with job-site delivery and remote shipping anywhere in Alaska.',
    preload: preloadFor(ctx, 'barge-strip', HERO),
    jsonLd: orgJsonLd(ctx),
    body: html`
<section class="hero">
  <div class="wrap">
    <div class="sheetbar">
      <p class="label"><span class="num">Sheet 01</span> · Wholesale building materials</p>
      <p class="label sheetbar__meta">${SITE.tagline}</p>
    </div>
    <div class="hero__sheet">
    <div class="hero__top">
      <h1 class="display hero__title">The whole building, on <em>one&nbsp;manifest.</em></h1>
      <div class="hero__side">
        <p class="lede">Lumber, engineered wood, siding and complete building packages from three yards, delivered to the job site down the road or across an ocean.</p>
        <div class="actions">
          <a class="btn" href="${ctx.u('quote/')}">Request a quote ${icon('arrow', { size: 18 })}</a>
          <a class="btn btn--line" href="${ctx.u('quote/#plans')}">${icon('upload', { size: 18 })} Send plans</a>
        </div>
      </div>
    </div>
    ${latRule()}
    </div>
    <div class="hero__object">
      ${plate(ctx, 'barge-strip', { cls: 'hero__media', fig: '1', caption: 'A tug and a loaded freight barge.', more: 'Off the road system, this is how a building arrives.', eager: true, ...HERO })}
      ${board(ctx)}
    </div>
  </div>
</section>

<section class="section notes" aria-labelledby="notes-t">
  <div class="wrap">
    <div class="shead__bar"><span class="bub num" aria-hidden="true">01</span><p class="label shead__label">General notes</p><p class="label shead__meta">N-1 to N-4</p></div>
    <p class="notes__line" id="notes-t">One of the largest independent building material suppliers serving Alaska and the Pacific Northwest. Our specialty is the job that is <em>a long way from a lumber yard.</em></p>
    <dl class="notes__grid">
      <div><dt class="num" data-count>${SITE.years}+</dt><dd>years supplying institutional, commercial and residential builders.</dd></div>
      <div><dt class="num" data-count>03</dt><dd>distribution centers that work as one team: Kent, Anchorage and Fairbanks.</dd></div>
      <div><dt class="num" data-count>09</dt><dd>product lines, from framing lumber to the last box of fasteners.</dd></div>
      <div><dt class="num" data-count>71.3°<small>N</small></dt><dd>Delivery anywhere in Alaska, from Sitka to Utqiaġvik.</dd></div>
    </dl>
  </div>
</section>

<section class="section section--flush" id="manifest">
  <div class="wrap">
    ${sectionHead({ no: '02', eyebrow: 'The manifest', meta: 'Lines 001–009', title: 'Everything on the load, <em>line by line.</em>', lede: 'A wholesale dealer’s full list. Open a line to see what is in it, drawn the way it goes together.', action: html`<a class="link" href="${ctx.u('products/')}">All products ${icon('arrow', { size: 16 })}</a>` })}
    ${manifest(ctx)}
  </div>
</section>

<section class="section section--panel" id="delivery">
  <div class="wrap">
    ${sectionHead({ no: '03', eyebrow: 'Delivery area', meta: 'Sheet A-1', title: 'Down the road or <em>across an ocean.</em>', lede: 'Boom trucks and Moffett forklifts around Puget Sound. Ocean freight, barge and air to places without a lumber yard. We specialize in remote location delivery.' })}
    ${deliveryMap(ctx, { compact: true, action: html`<a class="btn btn--dark btn--block" href="${ctx.u('alaska/')}">How Alaska delivery works ${icon('arrow', { size: 18 })}</a>` })}
  </div>
</section>

<section class="section" id="services">
  <div class="wrap">
    ${sectionHead({ no: '04', eyebrow: 'Services', meta: 'S-01 to S-06', title: 'From the plans <em>to the pad.</em>', lede: 'Six services on one line, from the first take-off to the last bundle set down on site. Use one or all of them.', action: html`<a class="link" href="${ctx.u('services/')}">All services ${icon('arrow', { size: 16 })}</a>` })}
    ${sequence(FLOW.map((id, i) => { const s = SERVICES.find((x) => x.id === id); return { no: 'S-0' + (i + 1), name: s.name, body: s.short, href: ctx.u('services/') + '#' + s.id, link: 'Details' }; }), { cls: 'seq--six' })}
  </div>
</section>

${quoteBand(ctx, { no: '05' })}

<section class="section" id="work">
  <div class="wrap">
    ${sectionHead({ no: '06', eyebrow: 'Who we build for', meta: 'Schedule', title: 'Institutional. Commercial. <em>Residential.</em>', lede: 'From schools and multifamily framing to custom homes and packages for communities off the road system.', action: html`<a class="link" href="${ctx.u('projects/')}">See project types ${icon('arrow', { size: 16 })}</a>` })}
    <div class="sched" role="table" aria-label="Kinds of work Uresco supplies">
      <div class="sched__cols label" role="row"><span role="columnheader">Mark</span><span role="columnheader">Sector</span><span role="columnheader">Work</span><span role="columnheader">Typical package</span></div>
      ${WORK.map(([t, k]) => [PROJECTS.find((p) => p.title === t), k]).map(([p, k], i) => html`
      <div class="sched__row" role="row">
        <span class="sched__mark" role="cell"><b class="num">${'ABCD'[i]}</b>${sketch(k)}</span>
        <span class="sched__sector label" role="cell">${p.sector}</span>
        <span class="sched__work" role="cell"><b>${p.title}</b><span>${p.scope}</span></span>
        <span class="sched__pkg" role="cell">${p.materials.map((m) => html`<i>${m}</i>`)}</span>
      </div>`)}
    </div>
  </div>
</section>

<section class="section section--panel" id="yards">
  <div class="wrap">
    ${sectionHead({ no: '07', eyebrow: 'Yards', meta: 'Yards 01–03', title: 'Which yard <em>should I call?</em>', lede: 'The one nearest the job. Any of the three can help; they work as one team.', action: html`<a class="link" href="${ctx.u('locations/')}">Faxes, mail &amp; details ${icon('arrow', { size: 16 })}</a>` })}
    <div class="yards">${LOCATIONS.map((l) => yardCard(ctx, l, { compact: true }))}</div>
    <div class="stub">
      <div class="stub__tag"><p class="label">Contractor accounts</p></div>
      <div class="stub__body">
        <h2 class="h2 h2--sm">Buying for a crew? Open an account.</h2>
        <p>Apply online. The application goes straight to the yard you name as your home yard.</p>
      </div>
      <a class="btn btn--dark" href="${ctx.u('accounts/')}">Apply for an account ${icon('arrow', { size: 18 })}</a>
    </div>
  </div>
</section>
`,
  }),
};
