import { html } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';
import { layout } from '../lib/layout.mjs';
import { pageHero, sectionHead, sequence, yardStrip, stub } from '../lib/components.mjs';
import { field, select, textarea, radios, yardSelect, fileDrop, group, sheetLayout } from '../lib/forms.mjs';

const SECTIONS = [['you', 'A', 'About you'], ['job', 'B', 'The job'], ['plans', 'C', 'Plans & materials']];

const NEXT = [
  { no: '01', name: 'We read the job', body: 'The yard you chose goes through your plans or list and builds the take-off.' },
  { no: '02', name: 'We quote it', body: 'We quote the package and work out the freight with you.' },
  { no: '03', name: 'You order', body: 'We schedule delivery, or package and ship it.' },
];

export default {
  path: 'quote/',
  render: (ctx) => layout(ctx, {
    title: 'Request a quote',
    description: 'Send plans or a materials list to Uresco Construction Materials for a take-off and quote, with delivery to your job site or anywhere in Alaska.',
    body: html`
${pageHero(ctx, {
  sheet: 'Request a quote',
  meta: 'Goes to the yard you choose',
  title: 'Request a quote.<br><em>A list or a sketch will do.</em>',
  lede: 'Tell us about the job and attach plans or a list. The yard you choose gets back to you with a take-off and pricing.',
})}

<section class="fm-area" aria-label="Quote request form">
  <div class="wrap">
    ${sheetLayout({
      kind: 'quote',
      subject: 'Quote request',
      name: 'Quote request',
      head: 'Request for quote',
      lead: 'Answered by',
      steps: SECTIONS,
      send: 'Send request',
      done: { sent: 'Thanks. The yard has your request and will be in touch.', almost: 'your request' },
      body: html`
        ${group({ id: 'you', letter: 'A', title: 'About you' }, html`
          ${field({ id: 'name', label: 'Name', required: true, msg: 'Enter your name.', attrs: html` autocomplete="name"` })}
          ${field({ id: 'company', label: 'Company', attrs: html` autocomplete="organization"` })}
          ${field({ id: 'phone', label: 'Phone', type: 'tel', required: true, msg: 'Enter a number the yard can call you on.', attrs: html` autocomplete="tel" inputmode="tel"` })}
          ${field({ id: 'email', label: 'Email', type: 'email', required: true, msg: 'Enter your email so the yard can reply.', attrs: html` autocomplete="email" inputmode="email"` })}
          ${select({ id: 'role', label: 'I am a', full: true, options: ['Contractor / builder', 'Owner-builder', 'Architect or engineer', 'Agency, tribe or institution', 'Other'] })}
        `)}
        ${group({ id: 'job', letter: 'B', title: 'The job' }, html`
          ${field({ id: 'location', label: 'Project location', required: true, w: 'wide', hint: 'City or community, state', msg: 'Enter the city or community where the job is.', attrs: html` placeholder="e.g. Bethel, AK"` })}
          ${field({ id: 'needed', label: 'Needed by', type: 'date', w: 'third' })}
          ${radios('delivery', 'Delivery', [['Job-site delivery', 'truck'], ['Remote Alaska shipping', 'ship'], ['Export', 'route'], ['Pick up at the yard', 'pin']])}
          ${yardSelect()}
        `)}
        ${group({ id: 'plans', letter: 'C', title: 'Plans & materials' }, html`
          ${fileDrop({ id: 'plans', name: 'plans', label: 'Plans, lists or photos', hint: 'PDF, DWG, images or spreadsheets, up to 25 MB each', tapTitle: 'Tap to add plans, lists or photos', note: 'Drawings get the most accurate take-off.', accept: '.pdf,.dwg,.dxf,.jpg,.jpeg,.png,.heic,.xls,.xlsx,.csv,.doc,.docx' })}
          ${textarea({ id: 'materials', label: 'Materials or scope', hint: 'a list, quantities, or a description of the build', rows: 6 })}
          ${textarea({ id: 'notes', label: 'Anything else?', rows: 3 })}
        `)}
      `,
    })}
  </div>
</section>

<section class="section section--panel" id="next">
  <div class="wrap">
    ${sectionHead({ no: '01', eyebrow: 'What happens next', title: 'From plans <em>to a price.</em>', lede: 'You send the job. The yard you chose takes it from there.' })}
    ${sequence(NEXT, { cls: 'seq--four' })}
  </div>
</section>

<section class="section" id="call">
  <div class="wrap">
    ${sectionHead({ no: '02', eyebrow: 'Rather talk it through?', title: 'Call <em>the nearest yard.</em>', lede: 'Our friendly, knowledgeable sales staff is here to help. Any of the three can take it from there.', action: html`<a class="link" href="${ctx.u('locations/')}">Addresses, fax &amp; directions ${icon('arrow', { size: 16 })}</a>` })}
    ${yardStrip(ctx)}
    ${stub({
      tag: 'Contractor accounts',
      title: 'Buying regularly? Open an account.',
      body: 'Set up once, then order from any of our three yards on account.',
      actions: html`<a class="btn btn--dark" href="${ctx.u('accounts/')}">Open an account ${icon('arrow', { size: 18 })}</a>`,
      cls: 'q-stub',
    })}
  </div>
</section>
`,
  }),
};
