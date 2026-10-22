import { html } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';
import { layout } from '../lib/layout.mjs';
import { stamp, openStatus } from '../lib/components.mjs';
import { field, select, textarea, radios, yardSelect, fileDrop, formOpen, formFoot, doneNotice } from '../lib/forms.mjs';
import { LOCATIONS, tel } from '../data/locations.mjs';

export default {
  path: 'quote/',
  render: (ctx) => layout(ctx, {
    title: 'Request a Quote',
    description: 'Send plans or a materials list to Uresco Construction Materials for a take-off and quote, with delivery to your job site or anywhere in Alaska.',
    body: html`
<section class="phero phero--plain">
  <div class="wrap phero__inner">
    <nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="${ctx.u('')}">Home</a></li><li><span aria-current="page">Request a quote</span></li></ol></nav>
    ${stamp('Estimates & take-offs', { dark: true })}
    <h1 class="display">Request <em>a quote.</em></h1>
    <p class="phero__lede">Tell us about the job and attach plans or a list. The yard you choose will get back to you with a take-off and pricing.</p>
  </div>
</section>
<section class="section">
  <div class="wrap qlayout">
    <div>
      ${formOpen('quote', 'Quote request')}
        <fieldset class="fieldset">
          <legend><span>01</span>About you</legend>
          ${field({ id: 'name', label: 'Name', required: true, attrs: html` autocomplete="name"` })}
          ${field({ id: 'company', label: 'Company', attrs: html` autocomplete="organization"` })}
          ${field({ id: 'phone', label: 'Phone', type: 'tel', required: true, attrs: html` autocomplete="tel" inputmode="tel"` })}
          ${field({ id: 'email', label: 'Email', type: 'email', required: true, attrs: html` autocomplete="email" inputmode="email"` })}
          ${select({ id: 'role', label: 'I am a', full: true, options: ['Contractor / builder', 'Owner-builder', 'Architect or engineer', 'Agency, tribe or institution', 'Other'] })}
        </fieldset>

        <fieldset class="fieldset">
          <legend><span>02</span>The job</legend>
          ${field({ id: 'location', label: 'Project location', required: true, hint: 'City or community, state', attrs: html` placeholder="e.g. Bethel, AK"` })}
          ${field({ id: 'needed', label: 'Needed by', type: 'date' })}
          ${radios('delivery', 'Delivery', [['Job-site delivery', 'truck'], ['Remote Alaska shipping', 'ship'], ['Export', 'route'], ['Pick up at the yard', 'pin']])}
          ${yardSelect()}
        </fieldset>

        <fieldset class="fieldset" id="plans">
          <legend><span>03</span>Plans & materials</legend>
          ${fileDrop({ id: 'plans', name: 'plans', label: 'Plans, lists or photos', hint: 'PDF, DWG, images or spreadsheets, up to 25 MB each', note: 'Drawings get the most accurate take-off.', accept: '.pdf,.dwg,.dxf,.jpg,.jpeg,.png,.heic,.xls,.xlsx,.csv,.doc,.docx' })}
          ${textarea({ id: 'materials', label: 'Materials or scope', hint: 'a list, quantities, or a description of the build', rows: 6 })}
          ${textarea({ id: 'notes', label: 'Anything else?', rows: 3 })}
        </fieldset>
        ${formFoot('Send request')}
      </form>
      ${doneNotice({ sent: 'Thanks — the yard has your request and will be in touch.', almost: 'your request' })}
    </div>

    <div class="aside">
      ${stamp('What happens next', { dark: true })}
      <h2>From plans to price</h2>
      <ol class="steps" style="margin-top:1.25rem">
        <li><b>We review your plans</b><span>The yard you chose builds the take-off.</span></li>
        <li><b>We quote it</b><span>Materials, and delivery or freight to your site.</span></li>
        <li><b>You order</b><span>We schedule delivery, or package and ship it.</span></li>
      </ol>
      <p style="margin-top:1.5rem">Rather talk it through?</p>
      <ul>
        ${LOCATIONS.map((l) => html`<li><a href="${tel(l.phone)}"><span>${l.city} ${openStatus(l, { short: true })}</span><span>${l.phone}</span></a></li>`)}
      </ul>
      <a class="aside__more" href="${ctx.u('accounts/')}">${icon('file', { size: 18 })} Buying regularly? Open a contractor account ${icon('arrow', { size: 16 })}</a>
    </div>
  </div>
</section>
`,
  }),
};
