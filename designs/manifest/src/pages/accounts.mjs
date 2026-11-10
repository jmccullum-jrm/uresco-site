import { html } from '../lib/html.mjs';
import { icon, mark } from '../lib/icons.mjs';
import { layout } from '../lib/layout.mjs';
import { pageHero, sectionHead, sequence, quoteBand, stub } from '../lib/components.mjs';
import { field, select, textarea, radios, yardSelect, fileDrop, group, sheetLayout } from '../lib/forms.mjs';
import { LOCATIONS, tel } from '../data/locations.mjs';
import { SITE } from '../config.mjs';

// Contractor charge accounts. Terms (limits, due dates) are set by Uresco per account
// and are deliberately not published here.
const TERMS = [
  ['01', 'Buy on account', 'Order by phone, email or quote and pay against a statement instead of at the counter.'],
  ['02', 'Job accounts', 'Track materials by project, so every invoice lands on the right job.'],
  ['03', 'Authorized buyers', 'Name the people on your crew who can pick up or order on your account.'],
  ['04', 'Tax-exempt & resale on file', 'Send your certificates once and we keep them on your account.'],
];

const OPENING = [
  { no: '01', name: 'Apply', body: 'Online here, or print a paper copy and return it to your home yard.' },
  { no: '02', name: 'We review', body: 'We check references and confirm your limit and terms.' },
  { no: '03', name: 'Start ordering', body: 'Your home yard sets up your account and authorized buyers.' },
];

const SECTIONS = [['business', 'A', 'Business'], ['contacts', 'B', 'Contacts'], ['account', 'C', 'Account'], ['references', 'D', 'References'], ['documents', 'E', 'Documents & signature']];

// A specimen statement: what "every invoice on the right job" looks like. It carries no figures; the job column is the point.
const SPECIMEN = [['01', 'Job A'], ['02', 'Job A'], ['03', 'Job B'], ['04', 'Job B'], ['05', 'Job C']];
const statement = html`
  <div class="ac-stmt" aria-hidden="true" data-reveal>
    <div class="ac-stmt__head"><b>Statement</b><span>Specimen</span></div>
    <div class="ac-stmt__cols"><span>Ln</span><span>Job</span><span>Invoice</span><span>Amount</span></div>
    ${SPECIMEN.map(([ln, job]) => html`<div class="ac-stmt__row"><span>${ln}</span><span class="ac-stmt__job"><b>${job}</b></span><span class="ac-stmt__blank"></span><span class="ac-stmt__blank"></span></div>`)}
    <p class="ac-stmt__note">Every invoice on the right job</p>
  </div>`;

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
      <p class="fm-letterhead__label">Return to your home yard</p>
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
    description: 'Open a contractor charge account with Uresco Construction Materials. Apply online for credit to buy on account at our Kent, Anchorage and Fairbanks yards.',
    body: html`
${pageHero(ctx, {
  sheet: 'Contractor accounts',
  meta: 'Credit application',
  title: 'One account. <em>All three yards.</em>',
  lede: 'Set up once, then order from any of our three yards on account.',
  below: stub({
    tag: 'Credit application',
    title: 'Apply online or on paper.',
    body: 'The same form either way. On paper, sign it and return it to your home yard by fax, by email or in person.',
    actions: html`<a class="btn btn--dark" href="#apply">Start the application ${icon('arrow', { size: 18 })}</a><button type="button" class="btn btn--line js-only" data-print>${icon('file', { size: 18 })} Print a paper copy</button>`,
    cls: 'ac-stub',
  }),
})}

<section class="section section--panel" id="terms">
  <div class="wrap">
    ${sectionHead({ no: '01', eyebrow: 'What an account does', title: 'Pay on a statement, <em>not at the counter.</em>', lede: 'Credit limits and terms are confirmed by your yard once your account is approved.' })}
    <div class="ac-terms">
      <ul class="ac-sched">
        ${TERMS.map(([mk, t, b]) => html`<li class="ac-sched__row"><span class="ac-sched__mk num" aria-hidden="true">${mk}</span><h3 class="ac-sched__t">${t}</h3><p>${b}</p></li>`)}
      </ul>
      ${statement}
    </div>
  </div>
</section>

<section class="section" id="apply">
  <div class="wrap">
    ${sectionHead({ no: '02', eyebrow: 'Credit application', title: 'Apply <em>for credit.</em>', lede: 'Fill it in here, or print it and sign it on paper. We use it to review your account.', action: html`<button type="button" class="link js-only ac-print" data-print>Print a paper copy ${icon('arrow', { size: 16 })}</button>` })}
    ${sequence(OPENING, { cls: 'seq--four ac-seq' })}
    ${sheetLayout({
      kind: 'credit',
      cls: 'fm-layout--long',
      subject: 'Credit application',
      name: 'Credit application',
      head: 'Application for credit',
      lead: 'Goes to your home yard',
      steps: SECTIONS,
      send: 'Submit application',
      done: { sent: 'Thanks, your application is in. Your home yard will contact you once it has been reviewed.', almost: 'your application' },
      privacy: 'Tax ID, bank details and signature are never saved.',
      paper: letterhead,
      body: html`
        ${group({ id: 'business', letter: 'A', title: 'Business' }, html`
          ${field({ id: 'company', label: 'Legal business name', required: true, w: 'wide', msg: 'Enter the legal name of the business.', attrs: html` autocomplete="organization"` })}
          ${field({ id: 'dba', label: 'Doing business as', hint: 'if different', w: 'third' })}
          ${select({ id: 'entity', label: 'Business type', w: 'wide', paper: true, options: ['Corporation', 'LLC', 'Partnership', 'Sole proprietor', 'Tribal or Alaska Native corporation', 'Government or institution', 'Other'] })}
          ${field({ id: 'ein', label: 'Federal tax ID (EIN)', hint: 'not your SSN', w: 'third', m2: true, attrs: html` inputmode="numeric" autocomplete="off"` })}
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
          ${yardSelect({ label: 'Home yard', hint: 'where you’ll buy most', lead: 'Goes to your home yard' })}
          ${field({ id: 'limit', label: 'Requested credit limit', hint: 'USD', m2: true, attrs: html` inputmode="numeric" placeholder="$"` })}
          ${field({ id: 'monthly', label: 'Expected monthly purchases', hint: 'USD', m2: true, attrs: html` inputmode="numeric" placeholder="$"` })}
          ${radios('po', 'Purchase orders required on invoices?', [['No'], ['Yes']], { w: 'half' })}
          ${radios('tax', 'Tax status', [['Taxable'], ['Resale'], ['Tax-exempt']], { w: 'half' })}
        `)}
        ${pageTwo}
        ${group({ id: 'references', letter: 'D', title: 'References', cls: 'fm-set--newpage' }, html`
          <div class="fm-cell fm-cell--full fm-refs">${reference(1)}${reference(2)}${reference(3)}</div>
          ${field({ id: 'bank', label: 'Bank', hint: 'name and branch' })}
          ${field({ id: 'bank_contact', label: 'Bank contact & phone' })}
        `)}
        ${group({ id: 'documents', letter: 'E', title: 'Documents & signature' }, html`
          ${fileDrop({ id: 'docs', name: 'documents', label: 'Certificates', hint: 'resale or tax-exempt certificate, contractor license, W-9', title: 'Attach documents', tapTitle: 'Tap to attach documents', note: 'PDF or photos, up to 25 MB each.', accept: '.pdf,.jpg,.jpeg,.png,.heic' })}
          <div class="fm-paper fm-cell fm-cell--full fm-enclose">
            <p class="fm-label">Enclose with this form</p>
            <div class="fm-paperopts"><label><input type="checkbox" tabindex="-1"><span class="fm-opt__box"></span>Resale or tax-exempt certificate</label><label><input type="checkbox" tabindex="-1"><span class="fm-opt__box"></span>Contractor license</label><label><input type="checkbox" tabindex="-1"><span class="fm-opt__box"></span>W-9</label></div>
          </div>
          <div class="fm-cell fm-cell--full fm-cell--req fm-cell--agree">
            <label class="fm-check"><input type="checkbox" id="agree" name="agree" value="Yes" data-label="Certified and authorized credit check" required aria-describedby="agree-err"><span class="fm-opt__box fm-opt__box--sq"></span><span class="fm-check__t">I certify the information above is true and authorize Uresco Construction Materials, Inc. to contact the references listed and obtain credit information to evaluate this application.</span><span class="fm-req" aria-hidden="true"><span>Required</span></span></label>
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

${quoteBand(ctx, { no: '03', eyebrow: 'Have a job to price?' })}
`,
  }),
};
