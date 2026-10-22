import { html } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';
import { layout } from '../lib/layout.mjs';
import { preloadFor, pageHero, stamp, sectionHead } from '../lib/components.mjs';
import { field, select, textarea, radios, yardSelect, fileDrop, formOpen, formFoot, doneNotice } from '../lib/forms.mjs';
import { LOCATIONS, tel } from '../data/locations.mjs';

// Contractor charge accounts. Terms (limits, due dates) are set by Uresco per account
// and are deliberately not published here.
const PERKS = [
  ['file', 'Buy on account', 'Order by phone, email or quote and pay against a monthly statement instead of at the counter.'],
  ['layers', 'Job accounts', 'Track materials by project, so every invoice lands on the right job.'],
  ['users', 'Authorized buyers', 'Name the people on your crew who can pick up or order on your account.'],
  ['shield', 'Tax-exempt & resale on file', 'Send your certificates once and we keep them on your account.'],
];

const reference = (n) => html`
  <div class="ref">
    <p class="ref__title">Trade reference ${n}${n === 1 ? html`<span class="req" aria-hidden="true">*</span>` : ''}</p>
    ${field({ id: `ref${n}_company`, label: 'Company', required: n === 1, attrs: html` data-label="Reference ${n} company"` })}
    ${field({ id: `ref${n}_contact`, label: 'Contact & phone or email', required: n === 1, attrs: html` data-label="Reference ${n} contact"` })}
  </div>`;

export default {
  path: 'accounts/',
  render: (ctx) => layout(ctx, {
    title: 'Contractor Accounts & Credit Application',
    description: 'Open a contractor charge account with Uresco Construction Materials. Apply online for credit to buy on account at our Kent, Anchorage and Fairbanks yards.',
    preload: [preloadFor(ctx, 'framer')],
    body: html`
${pageHero(ctx, {
  eyebrow: 'Contractor accounts',
  title: 'Open a contractor <em>account.</em>',
  lede: 'Set up once, then order from any of our three yards on account. Apply online in about ten minutes.',
  photoKey: 'framer',
  crumbs: [['Contractor accounts']],
  actions: html`<a class="btn" href="#apply">Start the application ${icon('arrow', { size: 18 })}</a><button type="button" class="btn btn--line" data-print>${icon('file', { size: 18 })} Print a paper copy</button>`,
})}
<section class="section section--bone">
  <div class="wrap">
    <div class="perks">
      ${PERKS.map(([ic, t, b]) => html`<div class="perk reveal"><div class="svc__icon">${icon(ic, { size: 24 })}</div><h2 class="h3">${t}</h2><p>${b}</p></div>`)}
    </div>
  </div>
</section>
<section class="section" id="apply">
  <div class="wrap qlayout">
    <div>
      ${sectionHead({ eyebrow: 'Credit application', no: '01', title: 'Apply <em>for credit.</em>', lede: 'Fields marked * are required. We use this to review your account; credit limits and terms are confirmed by your yard once it’s approved.' })}
      ${formOpen('credit', 'Credit application')}
        <fieldset class="fieldset">
          <legend><span>01</span>Business</legend>
          ${field({ id: 'company', label: 'Legal business name', required: true, full: true, attrs: html` autocomplete="organization"` })}
          ${field({ id: 'dba', label: 'Doing business as', hint: 'if different' })}
          ${select({ id: 'entity', label: 'Business type', options: ['Corporation', 'LLC', 'Partnership', 'Sole proprietor', 'Tribal or Alaska Native corporation', 'Government or institution', 'Other'] })}
          ${field({ id: 'ein', label: 'Federal tax ID (EIN)', hint: 'not your SSN', attrs: html` inputmode="numeric" autocomplete="off"` })}
          ${field({ id: 'license', label: 'Contractor license #', hint: 'WA L&I or AK', attrs: html` autocomplete="off"` })}
          ${field({ id: 'years', label: 'Years in business', type: 'number', attrs: html` min="0" inputmode="numeric"` })}
          ${field({ id: 'website', label: 'Website', type: 'url', attrs: html` autocomplete="url" placeholder="https://"` })}
          ${field({ id: 'address', label: 'Billing address', required: true, full: true, attrs: html` autocomplete="street-address"` })}
        </fieldset>

        <fieldset class="fieldset">
          <legend><span>02</span>Contacts</legend>
          ${field({ id: 'name', label: 'Your name', required: true, attrs: html` autocomplete="name"` })}
          ${field({ id: 'title', label: 'Title', attrs: html` autocomplete="organization-title"` })}
          ${field({ id: 'phone', label: 'Phone', type: 'tel', required: true, attrs: html` autocomplete="tel" inputmode="tel"` })}
          ${field({ id: 'email', label: 'Email', type: 'email', required: true, attrs: html` autocomplete="email" inputmode="email"` })}
          ${field({ id: 'ap_contact', label: 'Accounts payable contact', hint: 'name, phone, email', full: true })}
          ${textarea({ id: 'buyers', label: 'Authorized buyers', hint: 'names of people who can order or pick up', rows: 3 })}
        </fieldset>

        <fieldset class="fieldset">
          <legend><span>03</span>Account</legend>
          ${yardSelect({ label: 'Home yard', hint: 'where you’ll buy most' })}
          ${field({ id: 'limit', label: 'Requested credit limit', hint: 'USD', attrs: html` inputmode="numeric" placeholder="$"` })}
          ${field({ id: 'monthly', label: 'Expected monthly purchases', hint: 'USD', attrs: html` inputmode="numeric" placeholder="$"` })}
          ${radios('po', 'Purchase orders required on invoices?', [['No'], ['Yes']])}
          ${radios('tax', 'Tax status', [['Taxable'], ['Resale'], ['Tax-exempt']])}
        </fieldset>

        <fieldset class="fieldset">
          <legend><span>04</span>References</legend>
          <div class="field field--full refs">
            ${reference(1)}${reference(2)}${reference(3)}
          </div>
          ${field({ id: 'bank', label: 'Bank', hint: 'name and branch', full: false })}
          ${field({ id: 'bank_contact', label: 'Bank contact & phone' })}
        </fieldset>

        <fieldset class="fieldset">
          <legend><span>05</span>Documents & signature</legend>
          ${fileDrop({ id: 'docs', name: 'documents', label: 'Certificates', hint: 'resale or tax-exempt certificate, contractor license, W-9', title: 'Attach documents', note: 'PDF or photos, up to 25 MB each.', accept: '.pdf,.jpg,.jpeg,.png,.heic' })}
          <div class="field field--full">
            <label class="check"><input type="checkbox" id="agree" name="agree" value="Yes" data-label="Certified and authorized credit check" required aria-describedby="agree-err"><span>I certify the information above is true and authorize Uresco Construction Materials, Inc. to contact the references listed and obtain credit information to evaluate this application.<span class="req" aria-hidden="true">*</span></span></label>
            <span class="err" id="agree-err" hidden></span>
          </div>
          ${field({ id: 'signature', label: 'Signature', hint: 'type your full name', required: true })}
          ${field({ id: 'signed', label: 'Date', type: 'date', required: true })}
        </fieldset>
        ${formFoot('Submit application')}
      </form>
      ${doneNotice({ sent: 'Thanks — your application is in. Your home yard will contact you once it has been reviewed.', almost: 'your application' })}
    </div>

    <div class="aside">
      ${stamp('How it works', { dark: true })}
      <h2>Three steps to an account</h2>
      <ol class="steps" style="margin-top:1.25rem">
        <li><b>Apply</b><span>Online here, or print a paper copy and drop it at any yard.</span></li>
        <li><b>We review</b><span>We check references and confirm your limit and terms.</span></li>
        <li><b>Start ordering</b><span>Your home yard sets up your account and authorized buyers.</span></li>
      </ol>
      <p style="margin-top:1.5rem">Questions about an account?</p>
      <ul>
        ${LOCATIONS.map((l) => html`<li><a href="${tel(l.phone)}"><span>${l.city}</span><span>${l.phone}</span></a></li>`)}
      </ul>
    </div>
  </div>
</section>
`,
  }),
};
