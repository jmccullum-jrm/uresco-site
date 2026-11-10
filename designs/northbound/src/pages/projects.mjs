import { html } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';
import { layout } from '../lib/layout.mjs';
import { preloadFor, pageHero, sectionHead, figure, interlude, closing, callLink, LAT } from '../lib/components.mjs';
import { PROJECTS, SECTORS, SECTOR_NOTES } from '../data/projects.mjs';

// The projects page describes KINDS of work, sector by sector: no real project list exists, and
// none is invented. Photographs are captioned as what they show, never as Uresco jobs. When real
// projects are added to the data (real: true) they sort first in their sector and show their
// place and year.
// The sector filter is in modules/projects.js: [data-filters] holds the buttons and every
// [data-sector] that does not match is hidden.
const two = (n) => String(n).padStart(2, '0');
// A job off the road system starts with the yard that handles it: Anchorage for remote sites,
// Fairbanks for the Interior. Quote links carry the kind of work, and the yard where there is one.
const YARD = { 'village-housing': 'anchorage', 'interior-north': 'fairbanks' };
const quoteUrl = (ctx, p) => `${ctx.u('quote/')}?product=${encodeURIComponent(p.title)}${YARD[p.id] ? `&yard=${YARD[p.id]}` : ''}`;
const WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'];
const count = (n, word = false) => `${word ? WORDS[n] ?? n : n} ${n === 1 ? 'kind' : 'kinds'} of work`;

// The number on a filter chip, with the words a screen reader needs around it.
const tally = (n) => html`<b><span class="sr-only">, </span>${n}<span class="sr-only"> ${n === 1 ? 'kind' : 'kinds'} of work</span></b>`;
const ALL = `${count(PROJECTS.length, true)} in ${WORDS[SECTORS.length].toLowerCase()} sectors`;

const GROUPS = SECTORS.map((name, i) => ({
  name,
  no: two(i + 1),
  ...SECTOR_NOTES[name],
  kinds: PROJECTS.filter((p) => p.sector === name).sort((a, b) => (b.real ? 1 : 0) - (a.real ? 1 : 0)),
}));

// Kinds of work sit in pairs: one wide photograph, one tall. A mirrored sector puts the tall one
// first, so the order on screen is always the order in the page (for keyboards and screen readers).
const MIRRORED = ['Commercial'];
// The sector past the end of the road system: it sits on the cold sheet, after a photograph of the road.
const OFF_ROAD = 'Remote Alaska';
// Where each photograph is cropped to in the frame it gets. `key` shows a different photograph here
// than the data's, with `caption`, `place` and `lat` describing that one; big photographs stay off
// more than one page.
const CROP = {
  'village-housing': { key: 'juneau-freight', caption: 'Containers in a freight yard.', place: 'Juneau, Alaska', lat: LAT.juneau, pos: '50% 62%' },
  'interior-north': { pos: '66% 60%' },
  'export-packages': { key: 'export', caption: 'A container ship berthed beneath gantry cranes.', pos: '62% 62%' },
  'multifamily-framing': { pos: '58% 45%' },
  'concrete': { pos: '60% 40%' },
  'exteriors': { key: 'cedar', caption: 'Vertical cedar siding under a deep roof overhang.', pos: '65% 50%' },
};

// One kind of work: the photograph (what such work looks like), what it is, and what goes on the list.
const kind = (ctx, p, i, mirrored) => {
  const wide = i % 2 === (mirrored ? 1 : 0);
  const c = CROP[p.id] || {};
  return html`
  <article class="pjx-kind ${wide ? 'pjx-kind--wide' : 'pjx-kind--tall'}" id="${p.id}">
    ${figure(ctx, c.key || p.pagePhoto || p.photo, {
      ratio: wide ? 'land' : 'port',
      sizes: wide ? '(min-width: 900px) min(52vw, 48rem), 100vw' : '(min-width: 900px) min(30vw, 27rem), (min-width: 600px) 22rem, 72vw',
      caption: c.caption || p.caption, place: c.key ? c.place : p.photoPlace, lat: c.key ? c.lat : (p.photoLat ? LAT[p.photoLat] : null), pos: c.pos,
    })}
    <div class="pjx-kind__body">
      ${p.real && (p.place || p.year) ? html`<p class="label pjx-kind__real">${[p.place, p.year].filter(Boolean).join(' · ')}</p>` : ''}
      <h3 class="pjx-kind__title rv">${p.title}</h3>
      <p class="pjx-kind__scope rv" style="--i:1">${p.scope}</p>
      <div class="pjx-kind__list rv" style="--i:2">
        <p class="label">On the list</p>
        <ol>${p.materials.map((m, n) => {
          const row = html`<span class="pjx-kind__item">${m}</span>`;
          return html`<li>${p.links?.[n] ? html`<a href="${ctx.u(p.links[n])}">${row}${icon('arrow', { size: 16, cls: 'pjx-kind__go' })}</a>` : html`<span>${row}</span>`}</li>`;
        })}</ol>
      </div>
      <a class="link pjx-kind__quote rv" style="--i:3" href="${quoteUrl(ctx, p)}">Quote a job like this ${icon('arrow', { size: 16 })}</a>
    </div>
  </article>`;
};

export default {
  path: 'projects/',
  render: (ctx) => layout(ctx, {
    title: 'Projects',
    description: 'The kinds of work Uresco materials go into: schools and public buildings, commercial and multifamily framing, concrete work, custom homes, exteriors, export packages and village housing in remote Alaska.',
    preload: [preloadFor(ctx, 'cranes-dusk')],
    body: html`
${pageHero(ctx, {
  crumbs: [['Projects']],
  eyebrow: 'Projects · The kinds of work we supply',
  title: 'The work <em>we supply.</em>',
  lede: 'Uresco supplies institutional, commercial and residential builders across the Pacific Northwest and all of Alaska.',
  photoKey: 'cranes-dusk',
  caption: 'Tower cranes over a construction site at dusk.',
  actions: html`<a class="btn" href="${ctx.u('quote/')}">Request a quote ${icon('arrow', { size: 18 })}</a>${callLink(ctx)}`,
})}

<section class="section pjx-intro" aria-labelledby="sectors-title">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Kinds of work', id: 'sectors-title', title: `${WORDS[SECTORS.length]} sectors. <em>Find yours.</em>`, lede: 'These are kinds of work, not a list of jobs. The photographs show what such work looks like; none of them is a Uresco project.' })}
    <div class="pjx-tools">
      <div class="pjx-filters" data-filters role="group" aria-label="Filter kinds of work by sector">
        <button type="button" data-filter="all" aria-pressed="true"><span>All work</span>${tally(PROJECTS.length)}</button>
        ${GROUPS.map((g) => html`<button type="button" data-filter="${g.name}" aria-pressed="false"><span>${g.name}</span>${tally(g.kinds.length)}</button>`)}
      </div>
      <ol class="pjx-jump">
        ${GROUPS.map((g) => html`<li><a href="#${g.id}"><span class="pjx-jump__no">${g.no}</span>${g.name}</a></li>`)}
      </ol>
      <p class="pjx-status" data-pjx-status role="status" aria-live="polite" data-all="${ALL}">${ALL}</p>
    </div>
  </div>
</section>

<div class="pjx-sectors">
  ${GROUPS.map((g) => html`${g.name === OFF_ROAD ? html`
  <div class="pjx-turn" data-sector="${g.name}">
    ${interlude(ctx, 'winter-road', { line: 'Then the road <em>runs out.</em>', note: 'A winter highway through the spruce.', pos: '52% 66%' })}
  </div>` : ''}
  <section class="pjx-sector${MIRRORED.includes(g.name) ? ' pjx-sector--flip' : ''}${g.name === OFF_ROAD ? ' section--ice' : ''}" id="${g.id}" data-sector="${g.name}" aria-labelledby="${g.id}-title">
    <div class="wrap">
      <p class="shead__bar pjx-sector__bar rv-line"><span class="chead__no">${g.no}</span><span>Sector</span><span class="pjx-sector__n">${count(g.kinds.length)}</span></p>
      <header class="pjx-sector__head">
        <div class="pjx-sector__title rv">
          <h2 class="pjx-sector__name" id="${g.id}-title">${g.name}</h2>
          <p class="pjx-sector__tail">${g.tail}</p>
        </div>
        <div class="pjx-sector__side rv" style="--i:1">
          <p class="lede">${g.lede}</p>
          <a class="link" href="${ctx.u(g.more[1])}">${g.more[0]} ${icon('arrow', { size: 16 })}</a>
        </div>
      </header>
      <div class="pjx-kinds">
        ${g.kinds.map((p, n) => kind(ctx, p, n, MIRRORED.includes(g.name)))}
      </div>
    </div>
  </section>`)}
</div>

${closing(ctx, {
  title: 'Have a job <em>like these?</em>',
  body: 'Send plans or a materials list and tell us where it is going. The yard nearest your project helps with the take-off and gives you an estimate.',
  more: html`<a class="link" href="${ctx.u('services/')}">How a job gets from plans to site ${icon('arrow', { size: 16 })}</a>`,
})}
`,
  }),
};
