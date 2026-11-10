import { html } from '../lib/html.mjs';
import { icon, mark } from '../lib/icons.mjs';
import { layout } from '../lib/layout.mjs';
import { eyebrow, sectionHead, quoteBand, openStatus } from '../lib/components.mjs';
import { field, select, textarea, radios, yardSelect, fileDrop, formOpen, formFoot, doneNotice, draftLine, whoAnswers, yardLines, callStrip } from '../lib/forms.mjs';
import { LOCATIONS, tel } from '../data/locations.mjs';
import { SITE } from '../config.mjs';

// What the application covers: each line is something the form below asks for. Terms (limits, due dates)
// are set by Uresco per account and are deliberately not published here.
const PERKS = [
  ['file', 'Buy on account', 'Apply once to buy on account at any of the three yards.'],
  ['users', 'Authorized buyers', 'List the people who can order or pick up on your account.'],
  ['layers', 'Purchase orders', 'Tell us if your invoices need a purchase order number.'],
  ['shield', 'Tax-exempt & resale', 'Attach your resale or tax-exempt certificate with the application.'],
];

const STEPS = [
  ['Apply', 'Online here, or print a paper copy and drop it at any yard.'],
  ['We review', 'We check references and confirm your limit and terms.'],
  ['Start ordering', 'Your home yard sets up your account and authorized buyers.'],
];

const READY = ['Federal tax ID (EIN)', 'Contractor license #', 'Trade references', 'Bank name and contact', 'Resale or tax-exempt certificate', 'W-9'];

const SECTIONS = [
  ['ac-business', 'Business'],
  ['ac-contacts', 'Contacts'],
  ['ac-account', 'Account'],
  ['ac-references', 'References'],
  ['ac-sign', 'Documents & signature'],
];

const stepHead = (i) => html`
  <legend><span>0${i + 1}</span>${SECTIONS[i][1]}</legend>
  <p class="fm-state jsonly" data-step-state="${SECTIONS[i][0]}" aria-hidden="true"></p>`;

const reference = (n) => html`
  <div class="ref">
    <p class="ref__title">Trade reference ${n}${n === 1 ? html`<span class="req" aria-hidden="true">Required</span>` : ''}</p>
    ${field({ id: `ref${n}_company`, label: 'Company', required: n === 1, missing: 'Add at least one trade reference.', attrs: html` data-label="Reference ${n} company"` })}
    ${field({ id: `ref${n}_contact`, label: 'Contact & phone or email', required: n === 1, missing: 'Add a phone number or email for this reference.', attrs: html` data-label="Reference ${n} contact"` })}
  </div>`;

export default {
  path: 'accounts/',
  render: (ctx) => layout(ctx, {
    title: 'Contractor Accounts & Credit Application',
    description: 'Open a contractor charge account with Uresco Construction Materials. Apply online for credit to buy on account at our Kent, Anchorage and Fairbanks yards.',
    bodyClass: 'pg-accounts',
    body: html`
<section class="phero ac-hero">
  <div class="wrap phero__grid">
    <div class="phero__copy">
      ${eyebrow('Contractor accounts')}
      <h1 class="display">One account. <em>Three yards.</em></h1>
      <p class="phero__lede">Set up once, then order from Kent, Anchorage or Fairbanks on account.</p>
      <div class="actions">
        <a class="btn btn--lg" href="#apply">Start the application ${icon('arrow', { size: 18 })}</a>
        <button type="button" class="btn btn--lg btn--line jsonly" data-print>${icon('file', { size: 18 })} Print a paper copy</button>
      </div>
    </div>
    <div class="ac-card">
      <div class="ac-card__top">
        <p class="fm-lab">Contractor account</p>
        <span class="ac-card__mark">${mark({ id: 'mkac' })}</span>
      </div>
      <ol class="ac-line">
        ${LOCATIONS.map((l) => html`<li>
          <i aria-hidden="true"></i>
          <a href="${tel(l.phone)}">
            <span class="ac-line__city">${l.city}${openStatus(l)}</span>
            <span class="ac-line__num"><span class="sr-only">Call ${l.city}: </span>${l.phone}</span>
            <span class="ac-line__lat" aria-hidden="true">${l.latShort}</span>
          </a>
        </li>`)}
      </ol>
      <ul class="ac-perks">
        ${PERKS.map(([ic, t, b]) => html`<li>
          <span class="ac-perks__ic">${icon(ic, { size: 18 })}</span>
          <div><h2 class="ac-perks__t">${t}</h2><p>${b}</p></div>
        </li>`)}
      </ul>
    </div>
  </div>
</section>

<section class="section section--ice ac-how">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'How it works', title: 'Three steps <em>to an account.</em>', action: html`<div class="ac-ready"><p class="fm-lab">Have these ready</p><ul>${READY.map((r) => html`<li>${r}</li>`)}</ul></div>` })}
    <ol class="steps fm-steps3">
      ${STEPS.map(([t, b], i) => html`<li class="reveal" style="--i:${i}"><span class="steps__no">0${i + 1}</span><h3 class="h3">${t}</h3><p>${b}</p></li>`)}
    </ol>
  </div>
</section>

<section class="fm-page fm-page--apply">
  <div class="wrap fm-page__grid">
    <div class="fm-page__head" id="apply">
      <div class="letterhead print-only">
        <div class="letterhead__brand">${mark({ id: 'mkp' })}<div><p class="letterhead__title">Credit application</p><p>${SITE.legal}</p><p class="letterhead__key">Fields marked * are required.</p></div></div>
        <div class="letterhead__return"><b>Return to your home yard</b>
          <table>${LOCATIONS.map((l) => html`<tr><th scope="row">${l.city}</th><td>Fax ${l.fax}</td><td>${l.email}</td></tr>`)}</table>
        </div>
      </div>
      <div class="fm-page__intro">
        ${eyebrow('Credit application')}
        <h2 class="h2">Apply <em>for credit.</em></h2>
        <p class="lede">We use this to review your account. Credit limits and terms are confirmed by your yard once it’s approved.</p>
      </div>
    </div>

    ${callStrip('Questions about an account?')}

    <div class="fm-page__form">
      ${formOpen('credit', 'Credit application')}
        ${draftLine('Tax IDs, bank details and signatures are never saved.')}
        <fieldset class="fieldset" id="ac-business" data-step>
          ${stepHead(0)}
          ${field({ id: 'company', label: 'Legal business name', required: true, full: true, missing: 'Add the legal name of the business.', attrs: html` autocomplete="organization"` })}
          ${field({ id: 'dba', label: 'Doing business as', hint: 'If different' })}
          ${select({ id: 'entity', label: 'Business type', boxes: true, options: ['Corporation', 'LLC', 'Partnership', 'Sole proprietor', 'Tribal or Alaska Native corporation', 'Government or institution', 'Other'] })}
          ${field({ id: 'ein', label: 'Federal tax ID (EIN)', hint: 'Not your SSN', attrs: html` inputmode="numeric" autocomplete="off"` })}
          ${field({ id: 'license', label: 'Contractor license #', hint: 'WA L&I or AK', attrs: html` autocomplete="off"` })}
          ${field({ id: 'years', label: 'Years in business', type: 'number', attrs: html` min="0" inputmode="numeric"` })}
          ${field({ id: 'website', label: 'Website', type: 'url', attrs: html` autocomplete="url" placeholder="https://"` })}
          ${field({ id: 'address', label: 'Billing address', required: true, full: true, missing: 'Add the billing address.', attrs: html` autocomplete="street-address"` })}
        </fieldset>

        <fieldset class="fieldset" id="ac-contacts" data-step>
          ${stepHead(1)}
          ${field({ id: 'name', label: 'Your name', required: true, missing: 'Add your name.', attrs: html` autocomplete="name"` })}
          ${field({ id: 'title', label: 'Title', attrs: html` autocomplete="organization-title"` })}
          ${field({ id: 'phone', label: 'Phone', type: 'tel', required: true, missing: 'Add a phone number the yard can reach you on.', attrs: html` autocomplete="tel" inputmode="tel"` })}
          ${field({ id: 'email', label: 'Email', type: 'email', required: true, missing: 'Add an email address so the yard can reply.', attrs: html` autocomplete="email" inputmode="email"` })}
          ${field({ id: 'ap_contact', label: 'Accounts payable contact', hint: 'Name, phone, email', full: true })}
          ${textarea({ id: 'buyers', label: 'Authorized buyers', hint: 'Names of people who can order or pick up', rows: 3 })}
        </fieldset>

        <fieldset class="fieldset" id="ac-account" data-step>
          ${stepHead(2)}
          ${yardSelect({ label: 'Home yard', hint: 'Where you’ll buy most', boxes: true })}
          <div class="field field--full fm-inline-who jsonly">${whoAnswers({ label: 'Reviewed by' })}</div>
          ${field({ id: 'limit', label: 'Requested credit limit', hint: 'USD', attrs: html` inputmode="numeric" placeholder="$"` })}
          ${field({ id: 'monthly', label: 'Expected monthly purchases', hint: 'USD', attrs: html` inputmode="numeric" placeholder="$"` })}
          ${radios('po', 'Purchase orders required on invoices?', [['No'], ['Yes']])}
          ${radios('tax', 'Tax status', [['Taxable'], ['Resale'], ['Tax-exempt']])}
        </fieldset>

        <fieldset class="fieldset fieldset--newpage" id="ac-references" data-step>
          ${stepHead(3)}
          <div class="field field--full refs">
            ${reference(1)}${reference(2)}${reference(3)}
          </div>
          ${field({ id: 'bank', label: 'Bank', hint: 'Name and branch', full: false })}
          ${field({ id: 'bank_contact', label: 'Bank contact & phone' })}
        </fieldset>

        <fieldset class="fieldset" id="ac-sign" data-step>
          ${stepHead(4)}
          ${fileDrop({ id: 'docs', name: 'documents', label: 'Certificates', hint: 'Resale or tax-exempt certificate, contractor license, W-9', title: 'Attach documents', titleTouch: 'Attach documents or take a photo', note: 'PDF or photos, up to 25 MB each.', accept: '.pdf,.jpg,.jpeg,.png,.heic' })}
          <div class="field field--full print-only">
            <span class="label">Attach copies</span>
            <div class="seg"><label><input type="checkbox" tabindex="-1">Resale or tax-exempt certificate</label><label><input type="checkbox" tabindex="-1">Contractor license</label><label><input type="checkbox" tabindex="-1">W-9</label></div>
          </div>
          <div class="field field--full">
            <label class="check"><input type="checkbox" id="agree" name="agree" value="Yes" data-label="Certified and authorized credit check" required aria-describedby="agree-err"><span>I certify the information above is true and authorize Uresco Construction Materials, Inc. to contact the references listed and obtain credit information to evaluate this application.<span class="req" aria-hidden="true">Required</span></span></label>
            <span class="err" id="agree-err" hidden></span>
          </div>
          ${field({ id: 'signature', label: 'Signature', hint: 'Type your full name', required: true, missing: 'Type your full name to sign.' })}
          ${field({ id: 'signed', label: 'Date', type: 'date', required: true, missing: 'Add today’s date.' })}
        </fieldset>
        ${formFoot('Submit application')}
        <p class="sr-only" data-live aria-live="polite"></p>
      </form>
      ${doneNotice({ sent: 'Thanks. Your application is in. Your home yard will contact you once it has been reviewed.', almost: 'your application' })}
    </div>

    <aside class="fm-rail" aria-label="Your application and the yards’ phone numbers">
      <div class="fm-rail__card">
        <div class="ac-index jsonly">
          <p class="fm-lab">Your application</p>
          <ol>
            ${SECTIONS.map(([id, name], i) => html`<li><a href="#${id}"><span class="ac-index__no">0${i + 1}</span><b>${name}</b><small data-step-state="${id}"></small></a></li>`)}
          </ol>
        </div>
        ${whoAnswers({ label: 'Reviewed by', onDark: true })}
        <div class="fm-rail__call">
          <h2 class="fm-rail__h">Questions about an account?</h2>
          ${yardLines()}
          <button type="button" class="btn btn--glass btn--block ac-rail__print jsonly" data-print>${icon('file', { size: 17 })} Print a paper copy</button>
        </div>
      </div>
    </aside>
  </div>
</section>

${quoteBand(ctx, { eyebrow: 'Estimates & take-offs', title: 'Need a price <em>first?</em>', body: 'Send plans or a list and the yard you choose will get back to you with a take-off and pricing.' })}
`,
  }),
};
