import { html } from '../lib/html.mjs';
import { icon, mark } from '../lib/icons.mjs';
import { layout } from '../lib/layout.mjs';
import { pageHero, sectionHead, sequence, quoteBand, stub } from '../lib/components.mjs';
import { field, select, textarea, radios, yardSelect, fileDrop, group, sheetLayout } from '../lib/forms.mjs';
import { LOCATIONS } from '../data/locations.mjs';
import { SITE } from '../config.mjs';

// The contractor credit application. What an account includes (limits, terms, statements) is not stated
// here until the owner confirms it: the page says to ask your yard.
const OPENING = [
  { no: '01', name: 'Apply', body: 'Online here, or print a paper copy and send it to your yard.' },
  { no: '02', name: 'We review', body: 'Your yard reviews the application and tells you what happens next.' },
];

const SECTIONS = [['business', 'A', 'Business'], ['contacts', 'B', 'Contacts'], ['account', 'C', 'Account'], ['references', 'D', 'References'], ['documents', 'E', 'Documents & signature']];

const reference = (n) => html`
  <div class="fm-ref" role="group" aria-labelledby="ref${n}-t">
    <p class="fm-ref__t" id="ref${n}-t">Trade reference ${n}</p>
    ${field({ id: `ref${n}_company`, label: 'Company', required: n === 1, full: true, msg: 'Enter at least one trade reference.', attrs: html` data-label="Reference ${n} company"` })}
    ${field({ id: `ref${n}_contact`, label: 'Contact & phone or email', required: n === 1, full: true, msg: 'Enter a contact for this reference.', attrs: html` data-label="Reference ${n} contact"` })}
  </div>`;

// The top of the printed form. It says what the form is and where to send it; on screen the title block beside the sheet does that job.
const letterhead = html`
  <div class="fm-paper fm-letterhead">
    <div class="fm-letterhead__brand">${mark({ id: 'mkp' })}<div><p class="fm-letterhead__title">Credit application</p><p class="fm-letterhead__firm">${SITE.legal}</p></div></div>
    <div class="fm-letterhead__return">
      <p class="fm-letterhead__label">Return to your yard</p>
      <ul>${LOCATIONS.map((l) => html`<li><b>${l.city}</b><span>Fax ${l.fax}</span><span>${l.email}</span></li>`)}</ul>
    </div>
    <p class="fm-letterhead__page">Page 1 of 2</p>
  </div>`;

const pageTwo = html`
  <div class="fm-paper fm-pagehead">
    <span>Credit application · ${SITE.legal}</span>
    <span>Page 2 of 2</span>
  </div>`;

export default {
  path: 'accounts/',
  render: (ctx) => layout(ctx, {
    title: 'Contractor accounts & credit application',
    description: 'Apply for a contractor account with Uresco Construction Materials, online or on paper, at our Kent, Anchorage or Fairbanks yard.',
    body: html`
${pageHero(ctx, {
  sheet: 'Contractor accounts',
  meta: 'Credit application',
  title: 'Open a <em>contractor account.</em>',
  lede: 'One form, and the name of the yard you buy from most.',
  below: stub({
    tag: 'Credit application',
    title: 'Apply online or on paper.',
    body: 'The same form either way. Questions? Ask your yard.',
    actions: html`<a class="btn btn--dark" href="#business">Start the application ${icon('arrow', { size: 18 })}</a><button type="button" class="btn btn--line js-only" data-print>${icon('file', { size: 18 })} Print a paper copy</button>`,
    cls: 'ac-stub',
  }),
})}

<section class="section section--flush" id="apply">
  <div class="wrap">
    ${sectionHead({ no: '01', eyebrow: 'Credit application', title: 'Apply <em>for&nbsp;credit.</em>', lede: 'For credit limits, terms and how an account works, ask your yard.', action: html`<button type="button" class="link js-only ac-print" data-print>Print a paper copy ${icon('arrow', { size: 16 })}</button>` })}
    ${sequence(OPENING, { cls: 'seq--four ac-seq' })}
    ${sheetLayout({
      kind: 'credit',
      cls: 'fm-layout--long',
      subject: 'Credit application',
      name: 'Credit application',
      head: 'Application for credit',
      lead: 'Goes to',
      steps: SECTIONS,
      send: 'Submit application',
      done: { sent: 'Thanks. Your application has gone to the yard you chose.', almost: 'your application' },
      privacy: SITE.formEndpoint ? 'Tax ID, bank details and signature are not kept on this device.' : 'Tax ID, bank details and signature are not kept on this device. Tax ID and bank details do not go in the email: give those to your yard by phone or fax, or use the paper copy.',
      paper: letterhead,
      body: html`
        ${group({ id: 'business', letter: 'A', title: 'Business' }, html`
          ${field({ id: 'company', label: 'Legal business name', required: true, w: 'wide', msg: 'Enter the legal name of the business.', attrs: html` autocomplete="organization"` })}
          ${field({ id: 'dba', label: 'Doing business as', hint: 'if different', w: 'third' })}
          ${select({ id: 'entity', label: 'Business type', w: 'wide', paper: true, options: ['Corporation', 'LLC', 'Partnership', 'Sole proprietor', 'Other'] })}
          ${field({ id: 'ein', label: 'Federal tax ID (EIN)', hint: 'not your SSN', w: 'third', m2: true, held: true, attrs: html` inputmode="numeric" autocomplete="off"` })}
          ${field({ id: 'license', label: 'Contractor license #', hint: 'WA L&I or AK', w: 'third', m2: true, attrs: html` autocomplete="off"` })}
          ${field({ id: 'years', label: 'Years in business', type: 'number', w: 'third', m2: true, attrs: html` min="0" inputmode="numeric"` })}
          ${field({ id: 'website', label: 'Website', type: 'url', w: 'third', m2: true, attrs: html` autocomplete="url" placeholder="https://"` })}
          ${field({ id: 'address', label: 'Billing address', required: true, full: true, msg: 'Enter the billing address.', attrs: html` autocomplete="street-address"` })}
        `)}
        ${group({ id: 'contacts', letter: 'B', title: 'Contacts' }, html`
          ${field({ id: 'name', label: 'Your name', required: true, msg: 'Enter your name.', attrs: html` autocomplete="name"` })}
          ${field({ id: 'title', label: 'Title', attrs: html` autocomplete="organization-title"` })}
          ${field({ id: 'phone', label: 'Phone', type: 'tel', required: true, msg: 'Enter a number the yard can call you on.', attrs: html` autocomplete="tel" inputmode="tel"` })}
          ${field({ id: 'email', label: 'Email', type: 'email', required: true, msg: 'Enter your email so the yard can reply.', attrs: html` autocomplete="email" inputmode="email"` })}
          ${field({ id: 'ap_contact', label: 'Accounts payable contact', hint: 'name, phone, email', full: true })}
          ${textarea({ id: 'buyers', label: 'Authorized buyers', hint: 'names of people who can order or pick up', rows: 3 })}
        `)}
        ${group({ id: 'account', letter: 'C', title: 'Account' }, html`
          ${yardSelect({ label: 'Your yard', hint: 'the one you buy from most', lead: 'Goes to' })}
          ${field({ id: 'limit', label: 'Requested credit limit', hint: 'USD', m2: true, attrs: html` inputmode="numeric" placeholder="$"` })}
          ${field({ id: 'monthly', label: 'Expected monthly purchases', hint: 'USD', m2: true, attrs: html` inputmode="numeric" placeholder="$"` })}
          ${radios('po', 'Purchase orders required on invoices?', [['No'], ['Yes']], { w: 'half' })}
          ${radios('tax', 'Tax status', [['Taxable'], ['Resale'], ['Tax-exempt']], { w: 'half' })}
        `)}
        ${pageTwo}
        ${group({ id: 'references', letter: 'D', title: 'References', cls: 'fm-set--newpage' }, html`
          <div class="fm-cell fm-cell--full fm-refs">${reference(1)}${reference(2)}${reference(3)}</div>
          ${field({ id: 'bank', label: 'Bank', hint: 'name and branch', held: true })}
          ${field({ id: 'bank_contact', label: 'Bank contact & phone', held: true })}
        `)}
        ${group({ id: 'documents', letter: 'E', title: 'Documents & signature' }, html`
          ${fileDrop({ id: 'docs', name: 'documents', label: 'Certificates', hint: 'resale or tax-exempt certificate, contractor license, W-9', title: 'Attach documents', tapTitle: 'Tap to attach documents', note: 'PDF or photos, up to 25 MB each.', accept: '.pdf,.jpg,.jpeg,.png,.heic' })}
          <div class="fm-paper fm-cell fm-cell--full fm-enclose">
            <p class="fm-label">Enclose with this form</p>
            <div class="fm-paperopts"><label><input type="checkbox" tabindex="-1"><span class="fm-opt__box"></span>Resale or tax-exempt certificate</label><label><input type="checkbox" tabindex="-1"><span class="fm-opt__box"></span>Contractor license</label><label><input type="checkbox" tabindex="-1"><span class="fm-opt__box"></span>W-9</label></div>
          </div>
          <div class="fm-cell fm-cell--full fm-cell--req fm-cell--agree">
            <label class="fm-check"><input type="checkbox" id="agree" name="agree" value="Yes" data-label="Certification" required aria-describedby="agree-err"><span class="fm-opt__box fm-opt__box--sq"></span><span class="fm-check__t">I certify the information above is true.</span><span class="fm-req" aria-hidden="true"><span>Required</span></span></label>
            <span class="fm-err" id="agree-err" hidden></span>
          </div>
          ${field({ id: 'signature', label: 'Signature', hint: 'type your full name', screenHint: true, required: true, w: 'wide', msg: 'Type your full name to sign.' })}
          ${field({ id: 'signed', label: 'Date', type: 'date', required: true, w: 'third', msg: 'Enter the date you are signing.' })}
        `)}
        <p class="fm-paper fm-yards-line"><b>Questions? Call your yard:</b>${LOCATIONS.map((l) => html`<span>${l.city} ${l.phone}</span>`)}</p>
      `,
    })}
  </div>
</section>

${quoteBand(ctx, { no: '02', eyebrow: 'Have a job to price?' })}
`,
  }),
};
