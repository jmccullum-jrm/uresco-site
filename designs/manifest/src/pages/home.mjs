import { html } from '../lib/html.mjs';
import { sketch } from '../lib/drawings.mjs';
import { icon } from '../lib/icons.mjs';
import { layout, orgJsonLd } from '../lib/layout.mjs';
import { preloadFor, sectionHead, quoteBand, quoteHref, yardCard, deliveryMap, plate, latRule, board, manifest, sequence, stub } from '../lib/components.mjs';
import { SERVICES } from '../data/services.mjs';
import { PROJECTS } from '../data/projects.mjs';
import { LOCATIONS } from '../data/locations.mjs';
import { SITE } from '../config.mjs';

// The hero photograph is a wide strip, so every screen gets the landscape file at the strip's own width.
const HERO = { sizes: '(min-width: 1440px) 1328px, (min-width: 700px) calc(100vw - 2 * clamp(1.125rem, .3rem + 3.4vw, 3.5rem)), 100vw' };

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
      <p class="label">Wholesale building materials</p>
      <p class="label sheetbar__meta">${SITE.tagline}</p>
    </div>
    <div class="hero__sheet">
    <div class="hero__top">
      <h1 class="display hero__title">The whole building, on <em>one&nbsp;manifest.</em></h1>
      <div class="hero__side">
        <p class="lede">Wholesale lumber, engineered wood, siding and complete building packages, delivered to job sites down the road or across an ocean.</p>
        <div class="actions">
          <a class="btn" href="${ctx.u('quote/')}">Request a quote ${icon('arrow', { size: 18 })}</a>
          <a class="btn btn--line" href="${ctx.u('quote/#plans')}">${icon('upload', { size: 18 })} Send plans</a>
        </div>
      </div>
    </div>
    ${latRule()}
    </div>
    <div class="hero__object">
      ${plate(ctx, 'barge-strip', { cls: 'hero__media', fig: '1', caption: 'A tug and a loaded freight barge.', more: 'Off the road system, freight generally arrives like this.', eager: true, ...HERO })}
      ${board(ctx)}
      <a class="hero__acct" href="${ctx.u('accounts/')}">
        <span class="hero__acct-no num" aria-hidden="true">+</span>
        <span class="hero__acct-act">Open an account</span>
        <span class="hero__acct-name">Accounts</span>
        <span class="hero__acct-for">Buying regularly? Apply online for a contractor account.</span>
        <span class="hero__acct-go" aria-hidden="true">${icon('arrow', { size: 18 })}</span>
      </a>
    </div>
  </div>
</section>

<section class="section notes" aria-labelledby="notes-t">
  <div class="wrap">
    <div class="shead__bar"><span class="bub num" aria-hidden="true">01</span><p class="label shead__label">General notes</p></div>
    <div class="notes__top">
      <p class="notes__line" id="notes-t">One of the largest independent building material suppliers serving Alaska and the Pacific Northwest. Our specialty is the job that is <em>a long way from a lumber yard.</em></p>
      ${plate(ctx, 'uresco-truck', { cls: 'notes__tag', fig: '2', caption: 'The tag on a Uresco load.', sizes: '(min-width: 900px) 15rem, 10.5rem' })}
    </div>
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
    ${sectionHead({ no: '02', eyebrow: 'The manifest', title: 'Everything on the load, <em>line by line.</em>', lede: 'A wholesale dealer’s full list. Open a line to see what is in it and how it goes together.', action: html`<a class="link" href="${ctx.u('products/')}">All products ${icon('arrow', { size: 16 })}</a>` })}
    ${manifest(ctx)}
  </div>
</section>

<section class="section section--panel" id="delivery">
  <div class="wrap">
    ${sectionHead({ no: '03', eyebrow: 'Delivery area', title: 'Down the road or <em>across an ocean.</em>', lede: 'Moffett forklifts and boom trucks at the job site. Off the road system, freight generally moves by sea, barge or air, and we can work with you on all of it. We specialize in remote location delivery.' })}
    ${deliveryMap(ctx, { compact: true, action: html`<a class="btn btn--dark btn--block" href="${ctx.u('alaska/')}">How Alaska delivery works ${icon('arrow', { size: 18 })}</a><a class="link pmap__quote" href="${quoteHref(ctx, { yard: 'anchorage' })}">Quote a remote job ${icon('arrow', { size: 16 })}</a>` })}
  </div>
</section>

<section class="section" id="services">
  <div class="wrap">
    ${sectionHead({ no: '04', eyebrow: 'Services', title: 'From the plans <em>to the pad.</em>', lede: 'Six services, in the order a package moves through them. Use one or all.', action: html`<a class="link" href="${ctx.u('services/')}">All services ${icon('arrow', { size: 16 })}</a>` })}
    ${sequence(SERVICES.map((s) => ({ no: s.no, name: s.name, body: s.short, href: ctx.u('services/') + '#' + s.id, link: 'Details' })), { cls: 'seq--six' })}
  </div>
</section>

${quoteBand(ctx, { no: '05', body: 'Send drawings or a list. We will build the take-off and quote it, and work out the freight with you.' })}

<div class="wrap stubrow">
  ${stub({ tag: 'Contractor accounts', title: 'Buying regularly? Open an account.', body: 'Apply online and name the yard you buy from most.', level: 2, actions: html`<a class="btn btn--dark" href="${ctx.u('accounts/')}">Apply for an account ${icon('arrow', { size: 18 })}</a>` })}
</div>

<section class="section" id="work">
  <div class="wrap">
    ${sectionHead({ no: '06', eyebrow: 'Who we supply', title: 'Institutional. Commercial. <em>Residential.</em>', lede: 'From schools and multifamily framing to custom homes and packages for communities off the road system.', action: html`<a class="link" href="${ctx.u('projects/')}">See project types ${icon('arrow', { size: 16 })}</a>` })}
    <div class="sched" role="table" aria-label="Kinds of work Uresco supplies">
      <div class="sched__cols label" role="row"><span role="columnheader">Mark</span><span role="columnheader">Sector</span><span role="columnheader">Work</span><span role="columnheader">Typical package</span></div>
      ${WORK.map(([t, k]) => [PROJECTS.find((p) => p.title === t), k]).map(([p, k], i) => html`
      <div class="sched__row" role="row">
        <span class="sched__mark" role="cell"><b class="num">${'ABCD'[i]}</b>${sketch(k)}</span>
        <span class="sched__sector label" role="cell">${p.sector}</span>
        <span class="sched__work" role="cell"><b>${p.title}</b><span>${p.scope}</span></span>
        <div class="sched__pkg" role="cell"><ul class="tags">${p.materials.map((m) => html`<li>${m}</li>`)}</ul></div>
      </div>`)}
    </div>
  </div>
</section>

<section class="section section--panel" id="yards">
  <div class="wrap">
    ${sectionHead({ no: '07', eyebrow: 'Yards', title: 'Which yard <em>should I call?</em>', lede: 'The one nearest the job. Any of the three can help; they work as one team.', action: html`<p class="yardjump"><span class="label">Full details</span>${LOCATIONS.map((l) => html`<a class="link" href="${ctx.u('locations/')}#${l.id}">${l.city}</a>`)}</p>` })}
    <div class="yards">${LOCATIONS.map((l) => yardCard(ctx, l))}</div>
  </div>
</section>
`,
  }),
};
