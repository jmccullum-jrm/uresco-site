import { html } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';
import { layout } from '../lib/layout.mjs';
import { picture, preloadFor, pageHero, quoteBand, stamp } from '../lib/components.mjs';
import { SERVICES } from '../data/services.mjs';

// Photo and the points under each service row. Points restate what uresco.com says.
const DETAIL = {
  takeoffs: { photo: 'blueprints', points: ['Send drawings, a list or a sketch', 'Material take-offs and estimates', 'Quoted by the yard nearest your job'] },
  design: { photo: 'framer', points: ['Design help for unique project needs', 'Take-off assistance', 'Engineered floor, beam and truss packages'] },
  delivery: { photo: 'unloading', points: ['Boom trucks', 'Truck-mounted Moffett forklifts', 'Materials set where the crew needs them'] },
  remote: { photo: 'tug-barge', points: ['Complete building packages', 'Remote sites anywhere in Alaska', 'Export packages'] },
  shipping: { photo: 'juneau-freight', points: ['Carrier coordination', 'Dock delivery', 'Rural Alaska delivery'] },
  crating: { photo: 'timber-weathered', points: ['Crating', 'Packaging for long hauls', 'Export and remote-site loads'] },
};

export default {
  path: 'services/',
  render: (ctx) => layout(ctx, {
    title: 'Services',
    description: 'Material take-offs and estimates, design services, job-site delivery by boom truck and Moffett forklift, remote and export building packages, shipping coordination and crating from Uresco.',
    preload: [preloadFor(ctx, 'unloading')],
    body: html`
${pageHero(ctx, {
  eyebrow: 'Services',
  title: 'The service is <em>the product.</em>',
  lede: 'A knowledgeable and resourceful sales staff, committed to professional and prompt service — from the first take-off to the last delivery.',
  photoKey: 'unloading',
  crumbs: [['Services']],
  actions: html`<a class="btn" href="${ctx.u('quote/')}">Request a quote ${icon('arrow', { size: 18 })}</a>`,
})}
<section class="section">
  <div class="wrap">
    ${SERVICES.map((s, i) => html`
      <div class="split ${i % 2 ? 'split--flip' : ''} reveal" id="${s.id}">
        <div class="split__media">${picture(ctx, DETAIL[s.id].photo, { sizes: '(min-width: 860px) 50vw, 100vw' })}${stamp(String(i + 1).padStart(2, '0') + ' · ' + s.name.split(' ')[0])}</div>
        <div>
          <div class="svc__icon">${icon(s.icon, { size: 26 })}</div>
          <h2 class="h2">${s.name}</h2>
          <p class="lede">${s.body}</p>
          <ul class="ticks">${DETAIL[s.id].points.map((pt) => html`<li>${icon('check', { size: 16 })}${pt}</li>`)}</ul>
        </div>
      </div>`)}
  </div>
</section>
${quoteBand(ctx)}
`,
  }),
};
