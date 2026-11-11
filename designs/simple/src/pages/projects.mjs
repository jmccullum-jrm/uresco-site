import { html } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';
import { sketch, glyph } from '../lib/drawings.mjs';
import { layout } from '../lib/layout.mjs';
import { preloadFor, sectionHead, pageHero, quoteBand, lineNo } from '../lib/components.mjs';
import { PROJECTS, SECTOR_NOTES } from '../data/projects.mjs';
import { SERVICES } from '../data/services.mjs';
import { CATEGORIES } from '../data/products.mjs';

// Sectors in the order the home page's schedule shows them, so its marks A to D mean the same thing here.
const ORDER = ['Remote Alaska', 'Institutional', 'Commercial', 'Residential'];
const slug = (s) => s.toLowerCase().replace(/[^a-z]+/g, '-');
const two = (n) => String(n).padStart(2, '0');
const WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'];
const count = (n) => WORDS[n] || String(n);

const svc = (id) => SERVICES.find((s) => s.id === id);
const has = (p, c) => p.lines === 'all' || p.lines.includes(c.slug);

export default {
  path: 'projects/',
  render: (ctx) => {
    // Sector by sector; a real project (see data/projects.mjs) goes ahead of the general lines in its sector.
    const groups = ORDER.map((sector, g) => ({
      sector, letter: 'ABCD'[g], id: slug(sector), note: SECTOR_NOTES[sector],
      items: PROJECTS.filter((p) => p.sector === sector).sort((a, b) => (b.real ? 1 : 0) - (a.real ? 1 : 0)).map((p, i) => ({ ...p, mark: 'ABCD'[g] + (i + 1) })),
    }));
    const all = groups.flatMap((g) => g.items);
    return layout(ctx, {
      title: 'Projects',
      description: 'The kinds of work Uresco supplies, sector by sector: village housing packages, schools and clinics, commercial and multifamily framing, concrete work, custom homes and export packages.',
      preload: [preloadFor(ctx, 'custom-home')],
      body: html`
${pageHero(ctx, {
  sheet: 'Projects',
  meta: 'Kinds of work, not a job list',
  title: 'The kinds of work <em>we&nbsp;supply.</em>',
  lede: 'For more than 35 years we have supplied institutional, commercial and residential builders across the Pacific Northwest and all of Alaska. These are the kinds of work, and what typically ships for each.',
  photoKey: 'custom-home',
  caption: 'Looking up through new wood framing and trusses. A stock photograph, not a Uresco job.',
  actions: html`<a class="btn" href="${ctx.u('quote/')}">Quote a job like these ${icon('arrow', { size: 18 })}</a><a class="btn btn--line" href="${ctx.u('locations/')}" data-open="call-sheet">${icon('phone', { size: 18 })} Call a yard</a>`,
  below: html`
  <nav class="pj-index" aria-label="Sectors on this page">
    <ol>
      ${groups.map((g) => html`<li><a href="#${g.id}">
        <span class="pj-index__top"><span class="bub bub--sm num" aria-hidden="true">${g.letter}</span><b>${g.sector}</b></span>
        <span class="pj-index__kinds">${g.items.map((p) => html`<span>${p.title}</span>`)}</span>
      </a></li>`)}
    </ol>
  </nav>`,
})}

<section class="section" id="schedule">
  <div class="wrap">
    ${sectionHead({ no: '01', eyebrow: 'Schedule of work', title: `${count(all.length)} kinds of work, <em>${count(groups.length).toLowerCase()} sectors.</em>`, lede: 'Find the line nearest your job. Each one gives the work, what typically goes on the truck, and the services it usually calls on.' })}
    <div class="pj-sheet">
      <aside class="pj-side" aria-label="About this schedule">
        <div class="pj-side__in">
          <div class="tblock pj-tblock">
            <p class="tblock__title"><span>Title</span><b>Schedule of work</b></p>
          </div>
          <div class="pj-filter" data-pj-filters role="group" aria-label="Show one sector of the schedule">
            <p class="label pj-filter__label">Show</p>
            <button type="button" class="pj-filter__btn pj-filter__btn--all" data-filter="all" aria-pressed="true"><span class="bub bub--sm num" aria-hidden="true">+</span><span>All work</span><span class="num">${two(all.length)}</span></button>
            ${groups.map((g) => html`<button type="button" class="pj-filter__btn" data-filter="${g.sector}" aria-pressed="false"><span class="bub bub--sm num" aria-hidden="true">${g.letter}</span><span>${g.sector}</span><span class="num">${two(g.items.length)}</span></button>`)}
          </div>
          <p class="pj-status" data-pj-status role="status"><span class="label">Showing</span> <span data-pj-count>All ${all.length} kinds of work</span></p>
          <p class="pj-side__note">These are kinds of work, not a list of jobs. Yours will follow your plans.</p>
        </div>
      </aside>
      <div class="pj-sched">
        <div class="pj-cols label" aria-hidden="true"><span>Mark</span><span>Work</span><span>Typical package</span></div>
        ${groups.map((g) => html`
        <section class="pj-group" id="${g.id}" data-sector="${g.sector}" aria-labelledby="${g.id}-t">
          <header class="pj-group__head">
            <span class="bub bub--sm num" aria-hidden="true">${g.letter}</span>
            <h3 class="pj-group__name" id="${g.id}-t">${g.sector}</h3>
            <p class="pj-group__note">${g.note}</p>
          </header>
          ${g.items.map((p) => html`
          <article class="pj-row">
            <div class="pj-row__mark"><b class="bub num">${p.mark}</b>${sketch(p.sketch)}</div>
            <div class="pj-row__work">
              <h4 class="pj-row__title">${p.title}</h4>
              ${p.real && (p.place || p.year) ? html`<p class="label pj-row__where">${[p.place, p.year].filter(Boolean).join(' · ')}</p>` : ''}
              <p>${p.scope}</p>
            </div>
            <div class="pj-row__pkg">
              <p class="label" aria-hidden="true">Typical package</p>
              <ul class="tags" aria-label="Typical package">${p.materials.map((m) => html`<li>${m}</li>`)}</ul>
            </div>
            <div class="pj-row__svc">
              <p class="label" id="${p.mark.toLowerCase()}-svc">Services</p>
              <ul class="tags tags--ref" aria-labelledby="${p.mark.toLowerCase()}-svc">${p.services.map((id) => html`<li><a href="${ctx.u('services/')}#${id}"><span class="num">${svc(id).no}</span> ${svc(id).tag}</a></li>`)}</ul>
            </div>
          </article>`)}
        </section>`)}
        <a class="pj-ask" href="${ctx.u('quote/')}">
          <span class="pj-ask__no num" aria-hidden="true">+</span>
          <span><b>Not on the schedule?</b> Send the plans or a list and we will tell you what we can supply.</span>
          ${icon('arrow', { size: 18 })}
        </a>
      </div>
    </div>
  </div>
</section>

<section class="section section--panel" id="lines">
  <div class="wrap">
    ${sectionHead({ no: '02', eyebrow: 'Load-outs', title: 'The same nine lines, <em>loaded differently.</em>', lede: 'This is which product lines are named in each typical package. Yours will follow your plans.', action: html`<a class="link" href="${ctx.u('products/')}">All products ${icon('arrow', { size: 16 })}</a>` })}
    <div class="pj-mx" data-reveal>
      <div class="pj-mx__head">
        <span class="label" aria-hidden="true">Mark · Work</span>
        ${CATEGORIES.map((c, i) => html`<a class="pj-mx__col" href="${ctx.u('products/' + c.slug + '/')}"><span class="num">${lineNo(i)}</span>${glyph(c.slug, { size: 36 })}<span class="pj-mx__colname">${c.short}</span></a>`)}
      </div>
      <ol class="pj-mx__rows">
        ${all.map((p, r) => html`<li class="pj-mx__row${all[r + 1] && all[r + 1].sector !== p.sector ? ' is-last' : ''}">
          <p class="pj-mx__work"><b class="bub num">${p.mark}</b><span>${p.title}</span></p>
          <ul class="pj-mx__cells" aria-label="Product lines in the typical package">
            ${CATEGORIES.map((c, i) => (has(p, c)
              ? html`<li class="is-on" style="--c:${i}">${glyph(c.slug, { size: 36 })}<span class="sr-only">${lineNo(i)} ${c.short}</span></li>`
              : html`<li class="is-off" aria-hidden="true"></li>`))}
          </ul>
        </li>`)}
      </ol>
      <ol class="pj-mx__key" aria-label="Key to the product lines">
        ${CATEGORIES.map((c, i) => html`<li><a href="${ctx.u('products/' + c.slug + '/')}">${glyph(c.slug, { size: 28 })}<span class="num">${lineNo(i)}</span><span>${c.short}</span></a></li>`)}
      </ol>
      <p class="pj-mx__note">A filled cell is a line named in the typical package. A complete building package can draw on all nine.</p>
    </div>
  </div>
</section>

${quoteBand(ctx, { no: '03', eyebrow: 'Start a job', title: 'Have a job <em>like one of these?</em>', body: 'Send plans or a list. We will help with the take-off, quote the package and work out the freight with you.' })}
`,
    });
  },
};
