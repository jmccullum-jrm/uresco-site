import { html, raw } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';
import { layout } from '../lib/layout.mjs';
import { picture, preloadFor, pageHero, sectionHead, interlude, yardsStrip, callLink, deg, LAT } from '../lib/components.mjs';
import { LOCATIONS } from '../data/locations.mjs';
import { BRANDS } from '../data/products.mjs';
import { SITE } from '../config.mjs';

// The end-grain of a log, one ring for each of the 35 years the fact sheet gives. Widths and shape
// wander the way real growth rings do; a fixed seed keeps the build stable. The last ring is left
// open and yellow: more than 35 years, and the current one is not finished.
const RINGS = (() => {
  const N = 35, P = 72;
  let seed = 3517;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const a = Array.from({ length: 5 }, () => rnd() * Math.PI * 2);
  let r = 182;
  const paths = [];
  for (let i = 0; i < N; i++) {
    r += 6.1 + rnd() * 5.6;
    const k = i / (N - 1);
    const ox = (1 - k) * -9, oy = (1 - k) * 7;
    const amp = 2 + k * 7;
    let last, d = '';
    for (let j = 0; j < P; j++) {
      const t = (j / P) * Math.PI * 2;
      const R = r + amp * (Math.sin(2 * t + a[0]) + 0.6 * Math.sin(3 * t + a[1]) + 0.35 * Math.sin(5 * t + a[2] + k)) + 1.6 * Math.sin(7 * t + a[3] + k * 3);
      const x = Math.round(ox + R * Math.cos(t)), y = Math.round(oy + R * Math.sin(t));
      if (!last) d = `M${x} ${y}`;
      else d += `l${x - last[0]} ${y - last[1]}`;
      last = [x, y];
    }
    paths.push(d + 'z');
  }
  const heavy = (i) => i % 5 === 4;
  return raw(`<svg viewBox="-500 -500 1000 1000" aria-hidden="true" focusable="false">${paths.map((d, i) =>
    `<path class="${i === N - 1 ? 'abt-ring abt-ring--open' : heavy(i) ? 'abt-ring abt-ring--h' : 'abt-ring'}" pathLength="1" style="--r:${i}" d="${d}"/>`).join('')}</svg>`);
})();

// Every line of the mission, and what stands behind it.
const PROMISES = [
  { promise: 'A trusted, dependable source of quality construction materials.', backing: `Nine product lines, from framing lumber and engineered beams to siding, insulation, windows and fasteners, with brands including ${BRANDS.slice(0, 3).join(', ')}.`, link: ['See what we carry', 'products/'] },
  { promise: 'A knowledgeable, resourceful sales staff.', backing: 'Material take-offs, estimates and design services for your unique project needs. On a remote job, we work with you on all aspects of shipping coordination.', link: ['See the services', 'services/'] },
  { promise: 'Professional and prompt service.', backing: 'Dependable site delivery to job sites down the road or across an ocean: boom trucks and truck-mounted Moffett forklifts around the Puget Sound region, dock and rural delivery anywhere in Alaska.', link: ['How delivery works', 'services/#delivery'] },
];

// Uresco's own photographs. They are small, so they are shown as prints.
const ARCHIVE = [
  { key: 'uresco-truck', cap: 'The tag on a Uresco load.' },
  { key: 'uresco-yard', cap: 'Bundles staged in a Uresco yard.' },
  { key: 'uresco-stack', cap: 'Lumber stacked in a Uresco yard.' },
  { key: 'uresco-woodpile', cap: 'Timber ends in a Uresco yard.' },
];

const about = {
  path: 'about/',
  render: (ctx) => layout(ctx, {
    title: 'About Uresco',
    description: `For more than ${SITE.years} years, Uresco Construction Materials has been a trusted source for quality building materials throughout the Pacific Northwest and all of Alaska.`,
    preload: [preloadFor(ctx, 'lumber-stack')],
    body: html`
${pageHero(ctx, {
  crumbs: [['About']],
  eyebrow: `About Uresco · More than ${SITE.years} years`,
  title: 'Who you are <em>buying from.</em>',
  lede: `Uresco Construction Materials is a wholesale dealer in building materials, with yards in Kent, Anchorage and Fairbanks. For more than ${SITE.years} years we have supplied builders across the Pacific Northwest and all of Alaska.`,
  photoKey: 'lumber-stack',
  caption: 'Ends of stacked dimensional lumber.',
  pos: '50% 52%',
  actions: html`<a class="btn" href="${ctx.u('quote/')}">Request a quote ${icon('arrow', { size: 18 })}</a>${callLink(ctx)}`,
})}

<section class="abt-stand" aria-label="What we do">
  <div class="wrap abt-stand__grid">
    <p class="label abt-stand__side">In short</p>
    <p class="prologue__text rv">We sell building materials, wholesale, to institutional, commercial and residential builders across the Pacific Northwest and all of Alaska. Our specialty is the hard part: <em>a complete building package, delivered to a site with no road to it.</em></p>
  </div>
</section>

<section class="section abt-years" aria-labelledby="years-title">
  <div class="wrap abt-years__grid">
    <div class="abt-rings rv">
      ${RINGS}
      <p class="abt-rings__fig" aria-hidden="true"><span>${SITE.years}</span><sup>+</sup></p>
    </div>
    <div class="abt-years__text">
      <p class="shead__bar rv-line"><span class="chead__no">01</span><span>On the record</span></p>
      <h2 class="h2 rv" id="years-title">Thirty-five rings <em>and counting.</em></h2>
      <p class="lede rv" style="--i:1">For more than ${SITE.years} years, Uresco has been a trusted source for quality building materials throughout the Pacific Northwest and all of Alaska, and is one of the largest independent building material suppliers serving Alaska and the Pacific Northwest.</p>
      <p class="abt-years__note rv" style="--i:2">Drawn with one ring for each of those years. The last ring is still open.</p>
    </div>
  </div>
</section>

<section class="section section--paper2 abt-sheet" aria-labelledby="sheet-title">
  <div class="wrap abt-sheet__grid">
    <div class="abt-sheet__intro">
      <p class="shead__bar rv-line"><span class="chead__no">02</span><span>Company record</span></p>
      <h2 class="h2 rv" id="sheet-title">The short version, <em>on one sheet.</em></h2>
      <p class="lede rv" style="--i:1">For purchasing departments, and anyone checking who they are about to buy from.</p>
      <a class="link rv" style="--i:2" href="${ctx.u('accounts/')}">Open a contractor account ${icon('arrow', { size: 16 })}</a>
    </div>
    <div class="abt-form rv" style="--i:1">
      <div class="abt-form__head">
        <p class="label">Who we are</p>
        <p class="label abt-form__no" aria-hidden="true">Company record</p>
      </div>
      <dl class="abt-form__rows">
        <div><dt>Name</dt><dd>${SITE.legal}</dd></div>
        <div><dt>Known as</dt><dd>Uresco, or UCM</dd></div>
        <div><dt>Business</dt><dd>Wholesale dealer in building materials</dd></div>
        <div><dt>Customers</dt><dd>Institutional, commercial and residential builders</dd></div>
        <div><dt>In business</dt><dd>More than ${SITE.years} years</dd></div>
        <div><dt>Standing</dt><dd>One of the largest independent building material suppliers serving Alaska and the Pacific Northwest</dd></div>
        <div><dt>Yards</dt><dd class="abt-form__yards">${LOCATIONS.map((l) => html`<a href="${ctx.u('locations/')}#${l.id}">${l.city}, ${l.state}${l.id === 'kent' ? ' (headquarters)' : ''}</a>`)}</dd></div>
        <div><dt>Serves</dt><dd>The Pacific Northwest and all of Alaska, from Sitka to Utqiaġvik</dd></div>
        <div><dt>Specialty</dt><dd>Remote location and export building packages</dd></div>
      </dl>
      <p class="abt-form__foot">${SITE.tagline}</p>
    </div>
  </div>
</section>

<section class="section section--deep abt-mission" aria-labelledby="mission-title">
  <div class="wrap">
    ${sectionHead({ no: '03', eyebrow: 'Our mission', id: 'mission-title', title: 'Three promises, <em>and what backs them up.</em>', lede: 'Our mission, line by line, and what each line means on a job.' })}
    <ol class="abt-promises">
      ${PROMISES.map((p, i) => html`<li class="abt-promise rv" style="--i:${i}">
        <span class="abt-promise__no" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
        <p class="abt-promise__line">${p.promise}</p>
        <div class="abt-promise__back">
          <p>${p.backing}</p>
          <a class="link" href="${ctx.u(p.link[1])}">${p.link[0]} ${icon('arrow', { size: 16 })}</a>
        </div>
      </li>`)}
    </ol>
    <p class="pull abt-pull rv">So you can buy with confidence that you are getting <em>the best products at the best prices.</em></p>
  </div>
</section>

<div class="abt-far">
  ${interlude(ctx, 'floatplane', { line: 'We specialize in <em>remote location delivery.</em>', note: 'Skiffs on a gravel beach below a volcanic peak, as a floatplane passes.', place: 'Port Alsworth, Alaska', pos: '50% 55%' })}
  <div class="wrap abt-far__foot">
    <p>Delivery is available anywhere in Alaska, from Sitka to Utqiaġvik.</p>
    <a class="link" href="${ctx.u('alaska/')}">How remote delivery works ${icon('arrow', { size: 16 })}</a>
  </div>
</div>

<section class="section section--paper2 abt-archive" aria-labelledby="archive-title">
  <div class="wrap abt-archive__grid">
    <div class="abt-archive__text">
      <p class="shead__bar rv-line"><span class="chead__no">04</span><span>The archive</span></p>
      <h2 class="h2 rv" id="archive-title">From <em>our own yards.</em></h2>
      <p class="lede rv" style="--i:1">Lumber on the ground, banded and tagged.</p>
    </div>
    <div class="abt-prints">
      ${ARCHIVE.map((a, i) => html`<figure class="print abt-print abt-print--${i + 1} rv" style="--i:${i}">
        ${picture(ctx, a.key, { sizes: '(min-width: 1000px) 340px, 44vw' })}
        <figcaption>${a.cap}</figcaption>
      </figure>`)}
    </div>
  </div>
</section>

<section class="section abt-close" aria-labelledby="close-title">
  <div class="wrap">
    <div class="abt-close__head">
      <h2 class="h2 rv" id="close-title">Give us a call, <em>email or stop by.</em></h2>
      <div class="abt-close__side rv" style="--i:1">
        <p class="lede">Our friendly, knowledgeable sales staff is here to help.</p>
        <div class="actions">
          <a class="btn" href="${ctx.u('quote/')}">Request a quote ${icon('arrow', { size: 18 })}</a>
          <a class="btn btn--line" href="${ctx.u('accounts/')}">Open an account</a>
        </div>
      </div>
    </div>
    ${yardsStrip(ctx)}
    <a class="link abt-close__more" href="${ctx.u('locations/')}">Addresses, fax and email ${icon('arrow', { size: 16 })}</a>
  </div>
</section>
`,
  }),
};

// The main pages, for someone who has landed nowhere.
const LOST_LINKS = [
  ['Products', 'products/', 'Lumber, engineered wood, siding and more'],
  ['Services', 'services/', 'Take-offs, design, crating, freight, delivery'],
  ['Alaska delivery', 'alaska/', 'Sitka to Utqiaġvik'],
  ['Pacific Northwest', 'pacific-northwest/', 'The Kent yard'],
  ['Projects', 'projects/', 'The kinds of work we supply'],
  ['Locations', 'locations/', 'Addresses, fax and email'],
  ['About', 'about/', 'Who you are buying from'],
  ['Contractor accounts', 'accounts/', 'Apply for an account'],
  ['Request a quote', 'quote/', 'Send plans or a list'],
];

const notFound = {
  path: '404/',
  file: '404.html',
  render: (ctx) => {
    // GitHub Pages serves 404.html from any depth, so this page links absolutely to the site root
    // it was built for instead of relatively.
    const base = ctx.base || '/';
    const local = { ...ctx, u: (to) => base + to };
    return layout(local, {
      title: 'Page not found',
      description: 'This page doesn’t exist. Find lumber, building materials and delivery across Alaska and the Pacific Northwest at Uresco.',
      body: html`
<section class="lost">
  <div class="wrap">
    <div class="lost__head">
      <div class="lost__copy">
        <p class="label phero__eyebrow">Error 404 · Page not found</p>
        <h1 class="display phero__title">This page <em>missed the barge.</em></h1>
        <p class="lede">The page you were after isn’t here. It may have moved when we rebuilt the site. These will get you back on the route.</p>
        <div class="actions">
          <a class="btn" href="${base}">Go to the home page ${icon('arrow', { size: 18 })}</a>
          ${callLink(local)}
        </div>
      </div>
      <div class="lost__fix">
        <p class="lost__deg" aria-hidden="true"><small>Your position</small><span>40.4</span><sup>°N</sup></p>
        <p class="lost__note">That is well south of our first yard, at ${deg(LAT.kent)}.</p>
      </div>
    </div>
    <div class="lost__where">
      <nav class="lost__nav" aria-label="Main pages">
        <h2 class="shead__bar"><span class="chead__no"></span><span>Where to next</span></h2>
        <ol>
          ${LOST_LINKS.map(([name, href, note], i) => html`<li><a href="${base + href}"><span class="lost__no" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><span class="lost__name">${name}</span><span class="lost__desc">${note}</span>${icon('arrow', { size: 18 })}</a></li>`)}
        </ol>
      </nav>
      <div class="lost__call">
        <h2 class="shead__bar"><span class="chead__no"></span><span>Or call a yard</span></h2>
        ${yardsStrip(local)}
        <p class="lost__team">Any yard can help. They work as one team.</p>
      </div>
    </div>
  </div>
</section>`,
    });
  },
};

export default [about, notFound];
