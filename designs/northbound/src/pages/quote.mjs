import { html } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';
import { layout } from '../lib/layout.mjs';
import { sectionHead, pageHero } from '../lib/components.mjs';
import { field, select, textarea, radios, yardSelect, fileDrop, formOpen, formFoot, doneNotice, sheetHead, slip, dial, callList, closingYards } from '../lib/forms.mjs';

// The quote request is the freight manifest the rest of the site keeps pointing at, for real.
// A sheet of ruled cells on the left; on the right the manifest's own rows, which read as
// instructions until the form fills them in with this job.
const ROWS = [
  ['from', 'From', 'You and your company'],
  ['send', 'Send', 'Plans or a materials list'],
  ['to', 'To', 'The yard you choose'],
  [null, 'Returns', 'A take-off and a quote. We work out the freight with you.'],
  ['ships', 'Ships', 'To the site or the dock'],
];
const NEED = 'Still needed: Name, Phone, Email, Project location.';

const GUIDE = 'Puget Sound: Kent. Southcentral Alaska or a remote site: Anchorage. The Interior and points north: Fairbanks. Any yard can help.';

export default {
  path: 'quote/',
  render: (ctx) => layout(ctx, {
    title: 'Request a quote',
    description: 'Send plans or a materials list to Uresco Construction Materials for a take-off and quote, with delivery to your job site or anywhere in Alaska.',
    body: html`
${pageHero(ctx, {
  crumbs: [['Request a quote']],
  eyebrow: 'Estimates & take-offs',
  title: 'Send the plans. <em>We’ll price the list.</em>',
  lede: 'Tell us where the job is and attach drawings or a materials list. The yard you choose builds the take-off and quotes it.',
  actions: html`<a class="btn btn--line" href="#plans">${icon('upload', { size: 18 })} Attach plans</a>`,
  cls: 'fp-hero fp-hero--quote',
  tail: dial(),
})}

<section class="fp-band" aria-label="Quote request form">
  <div class="wrap fp-grid">
    <div class="fp-sheet">
      ${sheetHead('Request for quote', 'Estimates & take-offs')}
      ${formOpen('quote', 'Quote request')}
        <fieldset class="fieldset">
          <legend><span>01</span>About you</legend>
          ${field({ id: 'name', label: 'Name', required: true, msg: 'Add your name so the yard knows who to ask for.', attrs: html` autocomplete="name"` })}
          ${field({ id: 'company', label: 'Company', attrs: html` autocomplete="organization"` })}
          ${field({ id: 'phone', label: 'Phone', type: 'tel', required: true, msg: 'Add a number the yard can reach you on.', attrs: html` autocomplete="tel" inputmode="tel"` })}
          ${field({ id: 'email', label: 'Email', type: 'email', required: true, msg: 'Add an email address for the quote.', attrs: html` autocomplete="email" inputmode="email"` })}
          ${select({ id: 'role', label: 'I am a', full: true, options: ['Contractor / builder', 'Owner-builder', 'Architect or engineer', 'Agency, tribe or institution', 'Other'] })}
        </fieldset>

        <fieldset class="fieldset">
          <legend><span>02</span>The job</legend>
          ${field({ id: 'location', label: 'Project location', required: true, hint: 'City or community, state', msg: 'Tell us where the job is. The nearest town will do.', attrs: html` placeholder="e.g. Bethel, AK"` })}
          ${field({ id: 'needed', label: 'Needed by', type: 'date' })}
          ${radios('delivery', 'Delivery', [['Job-site delivery', 'truck'], ['Remote Alaska shipping', 'ship'], ['Export', 'route'], ['Pick up at the yard', 'pin']])}
          ${yardSelect({ guide: GUIDE })}
        </fieldset>

        <fieldset class="fieldset" id="plans">
          <legend><span>03</span>Plans &amp; materials</legend>
          ${fileDrop({ id: 'plans', name: 'plans', label: 'Plans, lists or photos', hint: 'PDF, DWG, images or spreadsheets, up to 25 MB each', touch: 'Tap to add plans or photos', note: 'Drawings get the most accurate take-off.', accept: '.pdf,.dwg,.dxf,.jpg,.jpeg,.png,.heic,.xls,.xlsx,.csv,.doc,.docx' })}
          ${textarea({ id: 'materials', label: 'Materials or scope', hint: 'a list, quantities, or a description of the build', rows: 6, cls: 'field--lined' })}
          ${textarea({ id: 'notes', label: 'Anything else?', rows: 3, cls: 'field--lined' })}
        </fieldset>
        ${formFoot('Send request', { slip: slip({ head: 'Check before you send', rows: ROWS, need: NEED, cls: 'fp-slip--foot' }) })}
      </form>
      ${doneNotice({ sent: 'Thanks. The yard has your request and will be in touch.', almost: 'your request' })}
    </div>

    <div class="fp-side" role="group" aria-label="Your request at a glance">
      ${slip({ head: 'Manifest', note: 'Fills in as you go', rows: ROWS, need: NEED })}
      ${callList()}
    </div>
  </div>
</section>

<section class="section fp-close" aria-labelledby="close-title">
  <div class="wrap">
    ${sectionHead({
      eyebrow: 'Rather talk it through?',
      id: 'close-title',
      title: 'Three yards. <em>One team.</em>',
      lede: 'Any yard can help. Call the one nearest the job.',
      action: html`<a class="link" href="${ctx.u('accounts/')}">Buying regularly? Open an account ${icon('arrow', { size: 16 })}</a>`,
    })}
    ${closingYards()}
  </div>
</section>
`,
  }),
};
