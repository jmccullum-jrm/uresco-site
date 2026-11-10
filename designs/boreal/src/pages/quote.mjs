import { readFileSync } from 'fs';
import { html, raw } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';
import { layout } from '../lib/layout.mjs';
import { eyebrow, sectionHead, quoteBand } from '../lib/components.mjs';
import { field, select, textarea, radios, yardSelect, fileDrop, formOpen, formFoot, doneNotice, draftLine, whoAnswers, yardLines, callStrip } from '../lib/forms.mjs';
import { PLACES, ALIASES, ACCESS } from '../data/places.mjs';

const MAP = JSON.parse(readFileSync(new URL('../data/map.json', import.meta.url), 'utf8'));
const xyOf = (name) => MAP.places.find((p) => p.name === name).xy;

// What the side panel needs to answer a place as it is typed: the same data and the same wording as
// the home page's route card. Typical freight is general Alaska geography, never a schedule or price.
const placeData = () => JSON.stringify({
  aliases: ALIASES,
  states: { AK: 'Alaska', WA: 'Washington' },
  access: Object.fromEntries(Object.entries(ACCESS).map(([k, v]) => [k, { tag: v.tag, modes: v.modes }])),
  yards: Object.fromEntries(MAP.yards.map((y) => [y.id, y.xy])),
  places: PLACES.map((p) => [p.name, p.st, ...xyOf(p.name), p.region, p.access, p.yard]),
}).replace(/</g, '\\u003c');

const MODE_ICONS = ['truck', 'ship', 'plane', 'pin'];
const modes = () => html`
  <ul class="qt-modes" data-s-modes>
    ${[0, 1].map((i) => html`<li>${MODE_ICONS.map((k) => html`<span class="qt-modes__ic" data-ic="${i}-${k}" hidden>${icon(k, { size: 16 })}</span>`)}<span data-s="m${i}"></span></li>`)}
  </ul>`;

// The route, small: the home page's map cropped to the corridor, with the chosen yard and the place.
const CROP = '382 60 1418 860';
const slipMap = (ctx) => html`
  <svg class="qt-map" data-slip-map viewBox="${CROP}" preserveAspectRatio="xMaxYMid meet" aria-hidden="true" focusable="false">
    <image href="${ctx.u('assets/map.svg')}?v=${ctx.version}" width="1800" height="1000"/>
    <g class="qt-map__road">${MAP.roads.map((d) => raw(`<path d="${d}"/>`))}</g>
    <g class="qt-map__barge">${MAP.barges.map((d) => raw(`<path d="${d}"/>`))}</g>
    <path class="qt-map__sea" d="${MAP.sea}"/>
    <path class="qt-map__arc" data-arc pathLength="1" d="M0,0"/>
    ${MAP.yards.map((y) => html`<g class="qt-map__yard" data-map-yard="${y.id}" data-side="${y.side}" transform="translate(${y.xy[0]} ${y.xy[1]})"><circle class="qt-map__halo" r="34"/><circle class="qt-map__dot" r="15"/></g>`)}
    <g class="qt-map__dest" data-map-dest visibility="hidden"><circle r="14"/></g>
  </svg>
  <span class="qt-map__tag" data-map-tag="yard" hidden></span>
  <span class="qt-map__tag qt-map__tag--dest" data-map-tag="dest" hidden></span>`;

const STEPS = [
  ['The yard reviews it', 'Your plans or list go to the yard you chose, and it builds the take-off.'],
  ['We quote it', 'We will quote the package and work out the freight with you.'],
  ['You order', 'We schedule delivery, or package and ship it.'],
];

export default {
  path: 'quote/',
  render: (ctx) => layout(ctx, {
    title: 'Request a Quote',
    description: 'Send plans or a materials list to Uresco Construction Materials for a take-off and quote, with delivery to your job site or anywhere in Alaska.',
    bodyClass: 'pg-quote',
    body: html`
<section class="phero phero--plain fm-page">
  <div class="wrap fm-page__grid">
    <div class="phero__copy fm-page__head">
      ${eyebrow('Estimates & take-offs')}
      <h1 class="display">Send the job. <em>Get a quote.</em></h1>
      <p class="phero__lede">Attach plans or a list and say where you are building. The yard you choose reviews it and gets back to you with a take-off and pricing.</p>
      <p class="qt-carried" data-carried hidden></p>
      <a class="link qt-jump" href="#plans">${icon('upload', { size: 16 })} Already have plans? Attach them</a>
    </div>

    ${callStrip('Rather call? Any yard can help.')}

    <div class="fm-page__form">
      ${formOpen('quote', 'Quote request')}
        ${draftLine()}
        <fieldset class="fieldset" id="you" data-step>
          <legend><span>01</span>About you</legend>
          <p class="fm-state jsonly" data-step-state="you" aria-hidden="true"></p>
          ${field({ id: 'name', label: 'Name', required: true, missing: 'Add your name so the yard knows who to ask for.', attrs: html` autocomplete="name"` })}
          ${field({ id: 'company', label: 'Company', attrs: html` autocomplete="organization"` })}
          ${field({ id: 'phone', label: 'Phone', type: 'tel', required: true, missing: 'Add a phone number the yard can reach you on.', attrs: html` autocomplete="tel" inputmode="tel"` })}
          ${field({ id: 'email', label: 'Email', type: 'email', required: true, missing: 'Add an email address so the yard can reply.', attrs: html` autocomplete="email" inputmode="email"` })}
          ${select({ id: 'role', label: 'I am a', full: true, options: ['Contractor / builder', 'Owner-builder', 'Architect or engineer', 'Agency, tribe or institution', 'Other'] })}
        </fieldset>

        <fieldset class="fieldset" id="job" data-step>
          <legend><span>02</span>The job</legend>
          <p class="fm-state jsonly" data-step-state="job" aria-hidden="true"></p>
          ${field({ id: 'location', label: 'Project location', required: true, hint: 'City or community, state', missing: 'Add the town or community where you are building.', attrs: html` placeholder="e.g. Bethel, AK"` })}
          ${field({ id: 'needed', label: 'Needed by', type: 'date' })}
          ${radios('delivery', 'Delivery', [['Job-site delivery', 'truck'], ['Remote Alaska shipping', 'ship'], ['Export', 'route'], ['Pick up at the yard', 'pin']])}
          ${yardSelect()}
          <div class="field field--full qt-route jsonly">
            <div class="qt-route__place">
              <p class="fm-lab">Job site</p>
              <p class="qt-route__name" data-s="place">Where is the job?</p>
              <p class="qt-route__meta" data-s="meta">Add the project location and this fills in.</p>
            </div>
            ${modes()}
            ${whoAnswers()}
            <p class="qt-route__note">Typical for the region, not a schedule or a price. Any yard can help.</p>
          </div>
        </fieldset>

        <fieldset class="fieldset" id="plans" data-step>
          <legend><span>03</span>Plans &amp; materials</legend>
          <p class="fm-state jsonly" data-step-state="plans" aria-hidden="true"></p>
          ${fileDrop({ id: 'plans', name: 'plans', label: 'Plans, lists or photos', hint: 'PDF, DWG, images or spreadsheets, up to 25 MB each', note: 'Drawings get the most accurate take-off.', accept: '.pdf,.dwg,.dxf,.jpg,.jpeg,.png,.heic,.xls,.xlsx,.csv,.doc,.docx' })}
          ${textarea({ id: 'materials', label: 'Materials or scope', hint: 'A list, quantities, or a description of the build', rows: 6 })}
          ${textarea({ id: 'notes', label: 'Anything else?', rows: 3 })}
        </fieldset>
        ${formFoot('Send request')}
        <p class="sr-only" data-live aria-live="polite"></p>
      </form>
      ${doneNotice({ sent: 'Thanks. The yard has your request and will be in touch.', almost: 'your request' })}
    </div>

    <aside class="fm-rail" aria-label="Your request and the yards’ phone numbers">
      <div class="fm-rail__card">
        <div class="qt-slip jsonly">
          <p class="fm-lab qt-slip__title">Your request</p>
          <div class="qt-slip__map">${slipMap(ctx)}</div>
          <div class="qt-slip__body">
            <p class="fm-lab">Job site</p>
            <p class="qt-slip__name" data-s="place">Where is the job?</p>
            <p class="qt-slip__meta" data-s="meta">Add the project location and this fills in.</p>
            ${modes()}
          </div>
          ${whoAnswers({ onDark: true })}
          <dl class="qt-slip__rows">
            <div><dt>Delivery</dt><dd data-s="delivery">Job-site delivery</dd></div>
            <div><dt>Needed by</dt><dd data-s="needed">No date yet</dd></div>
            <div><dt>Materials</dt><dd data-s="attached">Nothing attached yet</dd></div>
          </dl>
        </div>
        <div class="fm-rail__call">
          <h2 class="fm-rail__h">Rather call?</h2>
          ${yardLines()}
        </div>
      </div>
    </aside>
    <script type="application/json" data-form-places>${raw(placeData())}</script>
  </div>
</section>

<section class="section section--ice qt-next">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'What happens next', title: 'From plans <em>to a price.</em>', lede: 'Drawings get the most accurate take-off. A list with quantities works too, and so does a description of the build.' })}
    <ol class="steps fm-steps3">
      ${STEPS.map(([t, b], i) => html`<li class="reveal" style="--i:${i}"><span class="steps__no">0${i + 1}</span><h3 class="h3">${t}</h3><p>${b}</p></li>`)}
    </ol>
  </div>
</section>

${quoteBand(ctx, {
  eyebrow: 'Any yard can help',
  title: 'Rather talk it <em>through?</em>',
  body: 'Our friendly, knowledgeable sales staff is here to help. Give us a call, email or stop by.',
  call: false,
  actions: html`<a class="link link--light" href="${ctx.u('accounts/')}">Buying regularly? Open a contractor account ${icon('arrow', { size: 16 })}</a>`,
  media: html`<div class="fm-cta__yards">${yardLines()}</div>`,
})}
`,
  }),
};
