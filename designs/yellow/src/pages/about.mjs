import { html, raw } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';
import { layout } from '../lib/layout.mjs';
import { win, snapshot, seal, eyebrow, sticker, sectionHead, marquee, pageHero, pageHeroPreload, quoteBand, yardsStrip, callBtn, pauseBtn, photoCaption } from '../lib/components.mjs';
import { LOCATIONS } from '../data/locations.mjs';
import { SITE } from '../config.mjs';

// ================= About =================
// The page is built around Uresco's own tag: the printed tag on a load of plywood, "LUMBER BY:".
// It shows the real one, then the same idea at poster size.
const HERO = 'timber-weathered';

// What the tag says, and what a new customer wants to know. Only facts from FACTS.md.
const TAG_ROWS = [
  ['In business', html`More than ${SITE.years} years.`],
  ['Independent', 'One of the largest independent building material suppliers serving Alaska and the Pacific Northwest.'],
  ['Wholesale to', 'Institutional, commercial and residential builders.'],
];

// The mission, as three things to hold us to. Each row goes to where you can check it.
const PROMISES = [
  { name: 'The materials', text: 'A trusted, dependable source of quality construction materials.', href: 'products/', go: 'See the product lines' },
  { name: 'The sales staff', text: 'Knowledgeable and resourceful, a call or an email away.', href: 'locations/', go: 'Find your yard' },
  { name: 'The service', text: 'A commitment to professional and prompt service.', href: 'services/', go: 'See the services' },
];

const about = {
  path: 'about/',
  render: (ctx) => layout(ctx, {
    title: 'About Uresco',
    description: `For more than ${SITE.years} years, Uresco Construction Materials has been a trusted source for quality building materials throughout the Pacific Northwest and all of Alaska.`,
    preload: [pageHeroPreload(ctx, HERO)],
    body: html`
${pageHero(ctx, {
  cls: 'ab-hero',
  eyebrow: 'About Uresco',
  title: 'The name <em>on the load.</em>',
  lede: `For more than ${SITE.years} years, Uresco has been a trusted source for quality building materials throughout the Pacific Northwest and all of Alaska.`,
  photoKey: HERO,
  caption: 'Weathered timber ends',
  actions: html`${callBtn(ctx)}<a class="btn btn--line" href="${ctx.u('locations/')}">Find your yard ${icon('arrow', { size: 18 })}</a>${pauseBtn()}`,
  art: seal(ctx, { around: 'Quality materials • Trusted service •', big: SITE.years + '+', small: 'years', cls: 'phero__seal' }),
})}

<section class="section field-p ab-tag" id="tag">
  <div class="wrap ab-tag__grid">
    <div class="ab-tag__say">
      ${eyebrow('The short version')}
      <h2 class="d2">Read <em>the tag.</em></h2>
      <p class="lede">This is the tag on a Uresco load. Here’s the same idea, for anyone new to us.</p>
      ${snapshot(ctx, 'uresco-truck', { caption: 'The tag on a Uresco load', sizes: '(min-width: 760px) 260px, 62vw', cls: 'ab-shot', winCls: 'snap__win--tag ab-shot__win' })}
    </div>

    <article class="ab-card" aria-label="Uresco at a glance" data-reveal>
      <header class="ab-card__head">
        <p class="ab-card__by">Lumber by:</p>
        <p class="ab-card__name"><b>UCM</b> <span>Uresco</span></p>
        <p class="ab-card__legal">${SITE.legal.replace('Uresco ', '')}</p>
      </header>
      <dl class="ab-card__rows">
        ${TAG_ROWS.map(([k, v]) => html`<div><dt>${k}</dt><dd>${v}</dd></div>`)}
        <div class="ab-card__ships">
          <dt>Ships from</dt>
          <dd><ul class="ab-card__yards">${LOCATIONS.map((l) => html`<li><a href="${ctx.u('locations/')}#${l.id}">${l.city}, ${l.state}${l.id === 'kent' ? html`<small> headquarters</small>` : ''}</a></li>`)}</ul></dd>
        </div>
        <div class="ab-card__addr"><dt>Address</dt><dd>Yours. Job sites down the road or across an ocean, from Sitka to Utqiaġvik.</dd></div>
      </dl>
    </article>
  </div>
</section>

<section class="section field-k ab-remote clip" id="remote">
  <div class="divider divider--p" aria-hidden="true"><i class="plx"></i><i class="plx"></i><i class="plx"></i></div>
  <div class="wrap ab-remote__grid">
    <div class="ab-remote__copy">
      ${eyebrow('Our specialty')}
      <h2 class="d2">Some jobs <em>have no road.</em></h2>
      <p class="lede">We specialize in remote location delivery. Complete building packages, crated for the trip, with shipping coordination, dock delivery and rural Alaska delivery worked out with you.</p>
      <ul class="ab-pills" aria-label="What that takes">
        <li><a href="${ctx.u('services/')}#takeoffs">Take-offs</a></li>
        <li><a href="${ctx.u('services/')}#design">Design help</a></li>
        <li><a href="${ctx.u('services/')}#remote">Export packages</a></li>
        <li><a href="${ctx.u('services/')}#crating">Crating</a></li>
        <li><a href="${ctx.u('services/')}#shipping">Shipping coordination</a></li>
      </ul>
      <div class="actions"><a class="btn" href="${ctx.u('alaska/')}">How remote delivery works ${icon('arrow', { size: 18 })}</a></div>
    </div>
    <figure class="ab-remote__fig">
      ${win(ctx, 'floatplane', { shape: 'arch', duo: true, cls: 'ab-remote__win', sizes: '(min-width: 900px) 30vw, 66vw', after: photoCaption('floatplane', 'A small plane over skiffs at Port Alsworth, Alaska') })}
      ${sticker(raw('Sitka <span aria-hidden="true">→</span><span class="sr-only">to</span> Utqiaġvik'), { tone: 'y', rot: -7, cls: 'ab-remote__sticker' })}
    </figure>
  </div>
</section>

${marquee(['Kent', 'Anchorage', 'Fairbanks', 'Sitka', 'Utqiaġvik'], { tone: 'p', tilt: true, slow: true })}

<section class="section field-y ab-hold" id="mission">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Our mission', title: 'Three things <em>to hold us to.</em>', lede: 'So you can buy with confidence that you are getting the best products at the best prices.' })}
  </div>
  <ol class="lines ab-lines">
    ${PROMISES.map((p, i) => html`<li><a class="line" href="${ctx.u(p.href)}">
      <span class="line__no nums" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
      <span class="line__name">${p.name}</span>
      <span class="line__items">${p.text}</span>
      <span class="sr-only">. ${p.go}</span>
      <span class="line__go">${icon('arrow', { size: 22 })}</span>
    </a></li>`)}
  </ol>
</section>

<section class="section field-p ab-ring" id="call">
  <div class="wrap">
    <div class="ab-ring__head">
      <div class="ab-ring__say">
        ${eyebrow('Who picks up')}
        <h2 class="d2">Call. Email. <em>Stop by.</em></h2>
        <p class="lede">Our friendly, knowledgeable sales staff is here to help.</p>
      </div>
      ${snapshot(ctx, 'uresco-yard', { caption: 'In a Uresco yard', rot: 3, sizes: '(min-width: 760px) 300px, 70vw', cls: 'ab-shot ab-shot--yard', winCls: 'ab-shot__win' })}
    </div>
    ${yardsStrip(ctx)}
    <ul class="ab-mails">
      ${LOCATIONS.map((l) => html`<li><span>${l.city}</span> <a href="mailto:${l.email}">${l.email}</a></li>`)}
    </ul>
    <a class="ticket" href="${ctx.u('accounts/')}" data-reveal>
      <span class="ticket__k">Contractor accounts</span>
      <span class="ticket__t">Buying for a crew? Open an account.</span>
      <span class="ticket__d">Apply online, or ask your yard about an account.</span>
      <span class="line__go">${icon('arrow', { size: 22 })}</span>
    </a>
  </div>
</section>

${quoteBand(ctx, { title: 'Now you know <em>who to call.</em>', body: 'Send drawings or a list and the yard nearest your project will help with the take-off. Quality materials, trusted service.', photoKey: 'lumber-stack', caption: 'Ends of stacked lumber', label: 'First job with us?', cls: 'ab-band' })}
`,
  }),
};

// The main pages, for someone who has landed nowhere.
const WAYS_OUT = [
  ['products/', 'Products', 'Nine lines, from framing to fasteners'],
  ['services/', 'Services', 'Take-offs, packages, delivery'],
  ['alaska/', 'Alaska delivery', 'Sitka to Utqiaġvik'],
  ['pacific-northwest/', 'Pacific Northwest', 'Job sites around Puget Sound'],
  ['locations/', 'Locations', 'Three yards, every number'],
  ['quote/', 'Request a quote', 'Send plans or a list'],
];

const notFound = {
  path: '404/',
  file: '404.html',
  render: (ctx) => {
    // GitHub Pages serves 404.html from any depth, so this page links absolutely to the site root
    // it was built for instead of relatively.
    const base = ctx.base || '/';
    const c = { ...ctx, u: (to) => base + to };
    return layout(c, {
      title: 'Page not found',
      description: 'This page doesn’t exist. Find lumber, building materials and delivery across Alaska and the Pacific Northwest at Uresco.',
      preload: [pageHeroPreload(c, 'tug-barge')],
      body: html`
${pageHero(c, {
  cls: 'nf-hero',
  eyebrow: 'Error 404 · Off the map',
  title: 'This page <em>missed the barge.</em>',
  lede: 'It may have moved when we rebuilt the site. Try one of these, or call a yard and ask.',
  photoKey: 'tug-barge',
  caption: 'A tug pushing a loaded freight barge',
  actions: html`<a class="btn" href="${base}">Go to the home page ${icon('arrow', { size: 18 })}</a><a class="btn btn--line" href="${c.u('products/')}">Browse products</a>`,
  after: yardsStrip(c),
})}
<section class="section field-k nf-ways">
  <div class="wrap">
    ${eyebrow('Try these instead')}
    <ul class="nf-list">
      ${WAYS_OUT.map(([to, name, what], i) => html`<li style="--i:${i}"><a class="nf-way" href="${c.u(to)}">
        <b class="nf-way__name">${name}</b>
        <span class="nf-way__what">${what}</span>
        <span class="line__go">${icon('arrow', { size: 20 })}</span>
      </a></li>`)}
    </ul>
  </div>
</section>`,
    });
  },
};

export default [about, notFound];
