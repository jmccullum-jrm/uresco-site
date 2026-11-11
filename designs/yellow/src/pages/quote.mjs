import { html, raw } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';
import { layout } from '../lib/layout.mjs';
import { eyebrow, pageHero, quoteBand } from '../lib/components.mjs';
import { field, select, textarea, radios, yardSelect, fileDrop, formOpen, formFoot, doneNotice, callU, yardTag } from '../lib/forms.mjs';
import { PLACES, ALIASES } from '../data/places.mjs';

// What happens after Send. Freight is worked out with the visitor, never promised as part of the price.
const NEXT = [
  ['We go through it', 'The yard you chose reads your plans or list and helps with the take-off.'],
  ['We quote it', 'We’ll quote the package and work out the freight with you.'],
  ['You order', 'We arrange job-site delivery, or crate it and work out the shipping with you.'],
];

// The Alaska page's places, so typing one of them says how freight generally gets there.
const HOW = { local: 'by truck', road: 'by truck on the road system', coastal: 'by sea or air', seasonal: 'barge in the ice-free season, air year-round' };
const fold = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[’'.]/g, '').toLowerCase().trim();
const placesData = () => {
  const known = Object.fromEntries(PLACES.map((p) => [fold(p.name), [p.name, HOW[p.access]]]));
  for (const [alias, name] of Object.entries(ALIASES)) known[fold(alias)] = known[fold(name)];
  return JSON.stringify(known).replace(/</g, '\\u003c');
};

export default {
  path: 'quote/',
  render: (ctx) => layout(ctx, {
    title: 'Request a Quote',
    description: 'Send plans or a materials list to Uresco Construction Materials for help with the take-off and a quote, with delivery to your job site or anywhere in Alaska.',
    body: html`
${pageHero(ctx, {
  cls: 'fm-hero qt-hero',
  eyebrow: 'Estimates & take-offs',
  before: html`<p class="qt-carried"><span class="sticker sticker--k" style="--rot:-3deg" data-carried>Plans, a list or a sketch</span></p>`,
  title: 'Quote <em>this job.</em>',
  srTitle: 'Request a quote',
  lede: 'Send whatever you have. The yard you choose will help with the take-off and quote it.',
  actions: html`<a class="btn" href="#request">Start the request ${icon('arrow', { size: 18 })}</a><a class="btn btn--line" href="#plans">${icon('upload', { size: 18 })} Send plans</a>`,
  fill: callU(),
})}

<section class="section field-p fm-sec" id="request" aria-label="Quote request form">
  <div class="wrap fm-layout">
    <div class="fm-main">
      ${formOpen('quote', 'Quote request')}
        <fieldset class="fieldset">
          <legend><span>01</span>About you</legend>
          ${field({ id: 'name', label: 'Name', required: true, msg: 'Tell us who to ask for.', attrs: html` autocomplete="name"` })}
          ${field({ id: 'company', label: 'Company', attrs: html` autocomplete="organization"` })}
          ${field({ id: 'phone', label: 'Phone', type: 'tel', required: true, msg: 'Add a number the yard can reach you on.', attrs: html` autocomplete="tel" inputmode="tel"` })}
          ${field({ id: 'email', label: 'Email', type: 'email', required: true, msg: 'Add an email for the quote to go to.', attrs: html` autocomplete="email" inputmode="email"` })}
          ${select({ id: 'role', label: 'I am a', full: true, options: ['Contractor / builder', 'Architect or engineer', 'Institution', 'Other'] })}
        </fieldset>

        <fieldset class="fieldset">
          <legend><span>02</span>The job</legend>
          ${field({ id: 'location', label: 'Project location', required: true, hint: 'City or community, state', msg: 'Tell us where the job is, even roughly.', attrs: html` placeholder="e.g. Bethel, AK"`, note: html`<p class="fm-way" data-way-note hidden></p>` })}
          ${field({ id: 'needed', label: 'Needed by', type: 'date' })}
          ${radios('delivery', 'Delivery', [['Job-site delivery', 'truck'], ['Remote Alaska shipping', 'ship'], ['Export', 'route']], { cls: 'fm-delivery' })}
          ${yardSelect()}
          <script type="application/json" data-places>${raw(placesData())}</script>
        </fieldset>

        <fieldset class="fieldset" id="plans">
          <legend><span>03</span>Plans &amp; materials</legend>
          ${fileDrop({ id: 'plans', name: 'plans', label: 'Plans, lists or photos', hint: 'PDF, DWG, images or spreadsheets, up to 25 MB each', note: 'Drawings help most with the take-off.', accept: '.pdf,.dwg,.dxf,.jpg,.jpeg,.png,.heic,.xls,.xlsx,.csv,.doc,.docx' })}
          ${textarea({ id: 'materials', label: 'Materials or scope', hint: 'a list, quantities, or a description of the build', rows: 6 })}
          ${textarea({ id: 'notes', label: 'Anything else?', rows: 3 })}
        </fieldset>
        ${formFoot(html`Send to <span data-goes="city">Kent</span>`, { goes: false })}
      </form>
      ${doneNotice({ sent: 'Thanks. The yard has your request and will be in touch.', almost: 'your request' })}
    </div>

    <div class="fm-aside" role="group" aria-label="Who answers this request">
      ${yardTag({
        kicker: 'This request goes to',
        lines: html`<dl class="fm-tag__lines">
          <div><dt>Job</dt><dd data-live="location">Not filled in yet</dd></div>
          <div><dt>Delivery</dt><dd data-live="delivery">Job-site delivery</dd></div>
          <div><dt>Files</dt><dd data-live="files">None yet</dd></div>
        </dl>`,
      })}
    </div>
  </div>
</section>

<section class="section field-k qt-next clip">
  <div class="wrap">
    <div class="qt-next__head">
      ${eyebrow('What happens next')}
      <h2 class="d2">Then <em>what?</em></h2>
    </div>
    <ol class="qt-arches">
      ${NEXT.map(([name, text], i) => html`<li class="qt-arch" style="--i:${i}" data-reveal>
        <span class="qt-arch__no nums" aria-hidden="true">${i + 1}</span>
        <h3 class="qt-arch__name">${name}</h3>
        <p>${text}</p>
      </li>`)}
    </ol>
  </div>
</section>

${quoteBand(ctx, { title: 'Buying <em>regularly?</em>', body: 'Ask your yard about a contractor account, or apply online.', photoKey: 'framer', caption: 'A framer nailing a wall frame', label: 'Contractor accounts', primary: 'Open an account', href: ctx.u('accounts/') })}
`,
  }),
};
