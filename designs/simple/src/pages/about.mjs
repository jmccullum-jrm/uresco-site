import { html, raw } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';
import { layout } from '../lib/layout.mjs';
import { drawing, kit } from '../lib/drawings.mjs';
import { plate, sectionHead, pageHero, quoteBand, yardStrip, latRule } from '../lib/components.mjs';
import { SITE } from '../config.mjs';

const { rng, P, rect, poly, seg, label, dimH, note } = kit;

// ---------- End grain ----------
// Growth rings with the outer one in yellow, drawn the way the logo is drawn. The rings are not a count: only "more than 35 years" is stated.
const CX = 186, CY = 176;
const point = (r, t, ph) => {
  const k = 1 + 0.034 * Math.sin(2 * t + ph[0] + r * 0.012) + 0.02 * Math.sin(3 * t + ph[1] - r * 0.018) + 0.012 * Math.sin(5 * t + ph[2] + r * 0.03);
  return [CX + r * k * Math.cos(t), CY + r * k * Math.sin(t)];
};
// A closed smooth curve through K points, written with relative quadratic segments to keep the file small.
const ring = (r, ph, K = 20) => {
  const pts = Array.from({ length: K }, (_, i) => point(r, (i / K) * Math.PI * 2, ph));
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const p = (v) => Math.round(v * 10) / 10;
  let [x, y] = mid(pts[K - 1], pts[0]).map(p);
  let d = `M${x} ${y}`;
  for (let i = 0; i < K; i++) {
    const c = pts[i], m = mid(c, pts[(i + 1) % K]);
    const nx = p(m[0]), ny = p(m[1]);
    d += `q${p(c[0] - x)} ${p(c[1] - y)} ${p(nx - x)} ${p(ny - y)}`;
    x = nx; y = ny;
  }
  return d + 'z';
};
const endGrain = () => {
  const R = rng(35);
  const ph = [R() * 6.28, R() * 6.28, R() * 6.28];
  let r = 5, rings = '';
  for (let i = 0; i < 35; i++) { r += 2.9 + R() * 1.5; rings += ring(r, ph); }
  const r35 = r, r36 = r35 + 8, bark = r36 + 8;
  const band = ring(r36, ph, 24) + ring(r35, ph, 24);
  const checks = seg(CX + 28 * Math.cos(3.6), CY + 28 * Math.sin(3.6), CX + 92 * Math.cos(3.66), CY + 92 * Math.sin(3.66))
    + seg(CX + 70 * Math.cos(5.55), CY + 70 * Math.sin(5.55), CX + 140 * Math.cos(5.5), CY + 140 * Math.sin(5.5));
  const obj = P(ring(bark, ph, 40)) + `<path class="dw-o dw-h" fill-rule="evenodd" d="${band}"/>` + P(rings, 'dw-t') + P(checks, 'dw-t') + `<circle class="dw-a dw-a--ink" cx="${CX}" cy="${CY}" r="2"/>`;
  const reach = r35 + 4, base = CY + bark + 6;
  const ann = P(seg(CX, CY + 4, CX, base + 18), 'dw-c')
    + dimH(CX, CX + reach, base + 2, base + 16, '').replace(/<text[^>]*><\/text>/, '')
    + label(CX + reach / 2, base + 33, 'MORE THAN 35 YEARS', 'dw-dt')
    + note(362, 262, 'TODAY', [CX + 118, CY + 96]);
  return raw(`<svg class="dw" viewBox="0 0 480 384" role="img" aria-labelledby="ab-rings-t"><title id="ab-rings-t">The end grain of a log: growth rings around the pith, with the outermost ring highlighted. The dimension from the pith to the outer ring reads more than thirty-five years.</title><g class="dw-obj">${raw(obj)}</g><g class="dw-ann">${raw(ann)}</g></svg>`);
};

// ---------- About ----------
const DATA = [
  ['Legal name', 'Uresco Construction Materials, Inc.'],
  ['Also known as', 'Uresco, UCM'],
  ['Trade', 'Wholesale dealer of building materials'],
  ['Customers', 'Institutional, commercial and residential builders'],
  ['Headquarters', 'Kent, Washington'],
  ['Yards', 'Kent, Anchorage and Fairbanks'],
];

const NOTES = [
  { head: 'We sell wholesale.', body: 'Uresco is a wholesale dealer to institutional, commercial and residential builders.', link: ['accounts/', 'Contractor accounts'] },
  { head: 'We are independent.', body: 'One of the largest independent building material suppliers serving Alaska and the Pacific Northwest.' },
  { head: 'We have been at it for more than 35 years.', body: 'A trusted source for quality building materials throughout the Pacific Northwest and all of Alaska.' },
  { head: 'Three yards work as one team.', body: 'Kent is the headquarters. Anchorage serves Southcentral Alaska and Fairbanks serves the Interior. Whichever one you call can help.', link: ['locations/', 'The three yards'] },
  { head: 'Remote delivery is our specialty.', body: 'We are fully equipped to handle remote-location and export building packages, and delivery is available anywhere in Alaska, from Sitka to Utqiaġvik (Barrow).', link: ['alaska/', 'Alaska delivery'] },
  { head: 'We carry framing to finish.', body: 'Nine product lines, from framing lumber to fasteners, with James Hardie, CertainTeed, Simpson Strong-Tie, Georgia-Pacific DensGlass and Parallam among them.', link: ['products/', 'See the product lines'] },
];

// The mission, clause by clause, each with the services that go with it. It is an aim, and the page says so.
const CLAUSES = [
  { claim: 'A trusted and dependable source of quality construction materials.', proof: 'Nine product lines, listed on this site.', link: ['products/', 'What we carry'] },
  { claim: 'A knowledgeable and resourceful sales staff.', proof: 'Ask them about help with a material take-off, an estimate or design for your project.', link: ['services/#takeoffs', 'Take-offs and estimates'] },
  { claim: 'Professional and prompt service.', proof: 'Services include job-site delivery by boom truck and truck-mounted Moffett forklift, crating and shipping coordination.', link: ['services/#delivery', 'Delivery and shipping'] },
];

const about = {
  path: 'about/',
  render: (ctx) => layout(ctx, {
    title: 'About Uresco',
    description: `For more than ${SITE.years} years, Uresco Construction Materials has been a trusted source for quality building materials throughout the Pacific Northwest and all of Alaska. Three yards, wholesale, and remote-location delivery is our specialty.`,
    body: html`
${pageHero(ctx, {
  cls: 'ab-hero',
  sheet: 'About',
  meta: `More than ${SITE.years} years`,
  title: 'Down the road or <em>across an ocean.</em>',
  lede: `For more than ${SITE.years} years, Uresco has been a trusted source for quality building materials throughout the Pacific Northwest and all of Alaska.`,
  actions: html`<a class="btn" href="${ctx.u('locations/')}" data-open="call-sheet" aria-haspopup="dialog">${icon('phone', { size: 18 })} Call a yard</a><a class="btn btn--line" href="${ctx.u('products/')}">See what we carry ${icon('arrow', { size: 18 })}</a>`,
  media: html`<figure class="dwg ab-rings phero__media" data-reveal>
    <p class="dwg__bar label"><span>End grain</span><span class="dwg__nts">Not to scale</span></p>
    <div class="dwg__canvas">${endGrain()}</div>
  </figure>`,
  below: html`<div class="ab-data">
    ${plate(ctx, 'uresco-woodpile', { cls: 'ab-photo', fig: '1', sizes: '214px', eager: true, caption: 'Timber ends stacked in a Uresco yard. Our own photograph.' })}
    <dl class="ab-data__grid">
      ${DATA.map(([k, v]) => html`<div><dt>${k}</dt><dd>${v}</dd></div>`)}
    </dl>
  </div>`,
})}

<section class="section" id="notes">
  <div class="wrap">
    ${sectionHead({ no: '01', eyebrow: 'General notes', title: 'Who you are <em>buying from.</em>', lede: 'The short version.' })}
    <ol class="ab-notes">
      ${NOTES.map((t, i) => html`<li class="ab-note">
        <span class="ab-note__no num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
        <div>
          <h3 class="h3">${t.head}</h3>
          <p>${t.body}</p>
          ${t.link ? html`<a class="link ab-note__link" href="${ctx.u(t.link[0])}">${t.link[1]} ${icon('arrow', { size: 14 })}</a>` : ''}
        </div>
      </li>`)}
    </ol>
  </div>
</section>

<section class="section section--panel" id="reach">
  <div class="wrap">
    ${sectionHead({ no: '02', eyebrow: 'Delivery', title: 'Close to the yard, <em>and&nbsp;a&nbsp;long way from one.</em>', lede: 'Dependable site delivery to job sites down the road or across an ocean.' })}
    ${latRule({ highlight: [47.4, 71.3], note: 'The reach of the three yards: Kent to Utqiaġvik' })}
    <div class="ab-reach">
      <article class="ab-way">
        <figure class="dwg ab-dwg" data-reveal>
          <p class="dwg__bar label"><span>Job-site delivery</span><span class="dwg__nts">Typical</span></p>
          <div class="dwg__canvas">${drawing('svc-delivery', { id: 'ab' })}</div>
        </figure>
        <h3 class="h3">Down the road.</h3>
        <p>Job-site delivery by boom truck and truck-mounted Moffett forklift.</p>
        <a class="link" href="${ctx.u('pacific-northwest/')}">The Kent yard ${icon('arrow', { size: 14 })}</a>
      </article>
      <article class="ab-way">
        <figure class="dwg ab-dwg" data-reveal>
          <p class="dwg__bar label"><span>Every handoff</span><span class="dwg__nts">Typical</span></p>
          <div class="dwg__canvas">${drawing('svc-shipping', { id: 'ab' })}</div>
        </figure>
        <h3 class="h3">Across an ocean.</h3>
        <p>Complete building packages, crated for the trip. We work with you on all aspects of shipping coordination, dock delivery and rural Alaska delivery.</p>
        <a class="link" href="${ctx.u('alaska/')}">Alaska delivery ${icon('arrow', { size: 14 })}</a>
      </article>
    </div>
  </div>
</section>

<section class="section" id="mission">
  <div class="wrap">
    ${sectionHead({ no: '03', eyebrow: 'Our mission', title: 'What we <em>set&nbsp;out to do.</em>' })}
    <div class="ab-spec">
      ${CLAUSES.map((c, i) => html`<div class="ab-spec__row">
        <p class="ab-spec__no num" aria-hidden="true">1.${i + 1}</p>
        <p class="ab-spec__claim">${c.claim}</p>
        <p class="ab-spec__proof">${c.proof} <a class="link" href="${ctx.u(c.link[0])}">${c.link[1]} ${icon('arrow', { size: 14 })}</a></p>
      </div>`)}
      <p class="ab-spec__result">The aim: that you buy with confidence, knowing you are getting the best products at the best prices.</p>
    </div>
  </div>
</section>

<section class="section section--panel" id="yards">
  <div class="wrap">
    ${sectionHead({ no: '04', eyebrow: 'Talk to us', title: '<em>Give us a call,</em> email or stop by.', lede: 'Our friendly, knowledgeable sales staff is here to help. Call the yard nearest the job.', action: html`<a class="link" href="${ctx.u('locations/')}">Addresses, fax &amp; directions ${icon('arrow', { size: 16 })}</a>` })}
    ${yardStrip(ctx)}
  </div>
</section>

${quoteBand(ctx, { no: '05', eyebrow: 'Start here', title: 'Try us on <em>the&nbsp;next job.</em>', body: 'Send plans or a materials list and we will help with the take-off and quote the package. Not ready to send anything? Call the yard nearest the job.' })}
`,
  }),
};

// ---------- Not found ----------
// GitHub Pages serves 404.html from any depth, so every link is written from the site root it was built for.
const INDEX = [
  ['', 'Home', 'Start here: the three yards and the product lines'],
  ['products/', 'Products', 'Nine lines, from framing lumber to fasteners'],
  ['services/', 'Services', 'Take-offs, design, crating, shipping and delivery'],
  ['alaska/', 'Alaska delivery', 'Road, water or air, anywhere in Alaska'],
  ['pacific-northwest/', 'Pacific Northwest', 'The Kent yard and job-site delivery'],
  ['projects/', 'Projects', 'The kinds of work we supply'],
  ['locations/', 'Locations', 'Addresses, phone, fax and email'],
  ['about/', 'About', 'Who Uresco is'],
  ['quote/', 'Request a quote', 'Send plans or a materials list'],
  ['accounts/', 'Contractor accounts', 'Apply for an account'],
];

// The drawing: a dock, one unit left on it, and the barge already gone.
const leftOnTheDock = () => {
  const waterY = 240;
  const dock = P(rect(20, 180, 184, 12)) + [44, 92, 140, 190].map((x) => P(rect(x, 192, 8, waterY + 22 - 192))).join('') + P(rect(192, 164, 10, 16));
  const unit = P(rect(66, 124, 104, 56), 'dw-o dw-h') + P(seg(66, 143, 170, 143) + seg(66, 162, 170, 162), 'dw-t') + P(rect(84, 122, 7, 60) + rect(145, 122, 7, 60), 'dw-o dw-o--hole');
  const tug = (x) => P(poly([[x, 222], [x + 56, 222], [x + 48, 244], [x + 6, 244]])) + P(rect(x + 14, 200, 28, 22)) + P(rect(x + 22, 184, 12, 16));
  const barge = (x) => P(poly([[x, 222], [x + 134, 222], [x + 126, 244], [x + 8, 244]])) + [10, 40, 70, 100].map((o) => P(rect(x + o, 202, 24, 20)) + P(seg(x + o, 212, x + o + 24, 212), 'dw-t')).join('');
  const water = P([seg(16, waterY, 468, waterY), seg(36, waterY + 10, 120, waterY + 10), seg(186, waterY + 10, 300, waterY + 10), seg(340, waterY + 10, 452, waterY + 10), seg(84, waterY + 20, 200, waterY + 20), seg(260, waterY + 20, 400, waterY + 20)].join(''), 'dw-t');
  const obj = dock + unit + tug(290) + barge(342) + water;
  const ann = dimH(204, 290, 164, 118, 'MISSED IT BY THIS MUCH') + note(108, 90, 'THIS PAGE', [118, 124], 'end') + label(409, 192, 'BARGE', 'dw-nt') + label(110, 284, 'DOCK', 'dw-nt');
  return raw(`<svg class="dw" viewBox="0 44 480 256" role="img" aria-labelledby="nf-dock-t"><title id="nf-dock-t">One unit labelled this page, left behind on a dock while a tug and a loaded barge pull away. The gap between them is dimensioned: missed it by this much.</title><g class="dw-obj">${raw(obj)}</g><g class="dw-ann">${raw(ann)}</g></svg>`);
};

const notFound = {
  path: '404/',
  file: '404.html',
  render: (ctx) => {
    const abs = { ...ctx, u: (to) => (ctx.base || '/') + to };
    return layout(abs, {
      title: 'Page not found',
      description: 'This page isn’t here. Find lumber, building materials and delivery across Alaska and the Pacific Northwest at Uresco, or call a yard.',
      body: html`
${pageHero(abs, {
  cls: 'nf-hero',
  sheet: 'Page not found',
  meta: 'Error 404',
  title: 'This page <em>missed the barge.</em>',
  lede: 'The page you were after isn’t here. It may have moved when we rebuilt the site. Try one of the pages below.',
  actions: html`<a class="btn" href="${abs.u('')}">Go to the home page ${icon('arrow', { size: 18 })}</a><a class="btn btn--line" href="${abs.u('products/')}">Browse products</a>`,
  media: html`<figure class="dwg phero__media nf-dwg">
    <p class="dwg__bar label"><span>Left on the dock</span><span class="dwg__nts">Not to scale</span></p>
    <div class="dwg__canvas">${leftOnTheDock()}</div>
  </figure>`,
})}
<section class="section" id="sheets">
  <div class="wrap">
    ${sectionHead({ no: '01', eyebrow: 'Pages', title: 'Try one of <em>these pages.</em>' })}
    <ol class="nf-index">
      ${INDEX.map(([href, name, what], i) => html`<li><a href="${abs.u(href)}"><span class="num">${String(i + 1).padStart(2, '0')}</span><b>${name}</b><small>${what}</small>${icon('arrow', { size: 16 })}</a></li>`)}
    </ol>
  </div>
</section>
<section class="section section--panel" id="yards">
  <div class="wrap">
    ${sectionHead({ no: '02', eyebrow: 'Who to call', title: 'Or skip the website. <em>Call&nbsp;a yard.</em>', lede: 'Our friendly, knowledgeable sales staff is here to help.', action: html`<a class="btn" href="${abs.u('quote/')}">Request a quote ${icon('arrow', { size: 18 })}</a>` })}
    ${yardStrip(abs)}
  </div>
</section>`,
    });
  },
};

export default [about, notFound];
