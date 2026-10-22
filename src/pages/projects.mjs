import { html } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';
import { layout } from '../lib/layout.mjs';
import { picture, preloadFor, pageHero, quoteBand } from '../lib/components.mjs';
import { PROJECTS, SECTORS } from '../data/projects.mjs';

export default {
  path: 'projects/',
  render: (ctx) => {
    const list = [...PROJECTS].sort((a, b) => (b.real ? 1 : 0) - (a.real ? 1 : 0));
    return layout(ctx, {
      title: 'Projects',
      description: 'The work Uresco materials go into: village housing packages, schools and clinics, commercial and multifamily framing, concrete work, custom homes and export packages.',
      preload: [preloadFor(ctx, 'cranes-dusk')],
      body: html`
${pageHero(ctx, {
  eyebrow: 'Projects',
  title: 'What our materials <em>become.</em>',
  lede: 'Institutional, commercial and residential builders across the Northwest and Alaska — from a custom home in Kent to a full package on a barge.',
  photoKey: 'cranes-dusk',
  crumbs: [['Projects']],
})}
<section class="section section--bone">
  <div class="wrap">
    <div class="filters" data-filters role="group" aria-label="Filter projects by sector">
      <button type="button" data-filter="all" aria-pressed="true">All work</button>
      ${SECTORS.map((s) => html`<button type="button" data-filter="${s}" aria-pressed="false">${s}</button>`)}
    </div>
    <div class="proj-grid">
      ${list.map((p) => html`
        <article class="proj" data-sector="${p.sector}">
          <div class="proj__media">${picture(ctx, p.photo, { sizes: '(min-width: 1100px) 25vw, (min-width: 600px) 50vw, 100vw' })}<span class="proj__tag">${p.sector}</span></div>
          <div class="proj__body">
            <h2 class="h3">${p.title}</h2>
            ${p.real && (p.place || p.year) ? html`<p class="kicker">${[p.place, p.year].filter(Boolean).join(' · ')}</p>` : ''}
            <p>${p.scope}</p>
            <ul class="chips">${p.materials.map((m) => html`<li>${m}</li>`)}</ul>
          </div>
        </article>`)}
    </div>
  </div>
</section>
${quoteBand(ctx, { title: 'Have a project <em>like these?</em>' })}
`,
    });
  },
};
