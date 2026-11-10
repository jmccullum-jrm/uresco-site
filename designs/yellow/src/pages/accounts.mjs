import { html } from '../lib/html.mjs';
import { icon, mark } from '../lib/icons.mjs';
import { layout } from '../lib/layout.mjs';
import { pageHero, quoteBand, sectionHead, callBtn } from '../lib/components.mjs';
import { field, select, textarea, radios, yardSelect, fileDrop, formOpen, formFoot, doneNotice, yardTag, letterhead, paperBoxes } from '../lib/forms.mjs';
import { LOCATIONS } from '../data/locations.mjs';
import { SITE } from '../config.mjs';

// The contractor credit application the owner asked for. Every field stays; the page says nothing
// about what an account includes, or about limits, terms or approval, because nobody has confirmed them.

// The fields that send people to a filing cabinet. Taken from the form itself: what it asks, not what Uresco requires.
const ON_HAND = ['Federal tax ID (EIN)', 'Contractor license #', 'Trade references', 'Bank and bank contact', 'Resale or tax-exempt certificate', 'W-9'];

// The five parts, for the step list beside the form.
const PARTS = [['biz', 'Business'], ['contacts', 'Contacts'], ['account', 'Account'], ['refs', 'References'], ['sign', 'Documents & signature']];

const ENTITIES = ['Corporation', 'LLC', 'Partnership', 'Sole proprietor', 'Other'];

const reference = (n) => html`
  <div class="ref">
    <p class="ref__title">Trade reference ${n}${n === 1 ? html`<span class="req" aria-hidden="true">*</span>` : ''}</p>
    ${field({ id: `ref${n}_company`, label: 'Company', required: n === 1, msg: n === 1 ? 'List at least one trade reference.' : undefined, attrs: html` data-label="Reference ${n} company"` })}
    ${field({ id: `ref${n}_contact`, label: 'Contact & phone or email', required: n === 1, msg: n === 1 ? 'How do we reach this reference?' : undefined, attrs: html` data-label="Reference ${n} contact"` })}
  </div>`;

// Drawn in place of a photograph: the paper copy, seen through the U.
const sheet = (ctx) => html`
  <div class="ac-sheet" aria-hidden="true">
    <div class="ac-sheet__top">${mark({ id: 'mks' + ctx.uid() })}<b>Credit application</b></div>
    <span class="ac-sheet__l" style="grid-column:1/-1">Legal business name</span>
    <span class="ac-sheet__l">Federal tax ID</span><span class="ac-sheet__l">Contractor license #</span>
    <span class="ac-sheet__l" style="grid-column:1/-1">Billing address</span>
    <span class="ac-sheet__l">Trade reference 1</span><span class="ac-sheet__l">Bank</span>
    <span class="ac-sheet__s">Signature</span>
  </div>`;

export default {
  path: 'accounts/',
  render: (ctx) => layout(ctx, {
    title: 'Contractor Accounts & Credit Application',
    description: 'Apply online for a contractor account with Uresco Construction Materials, or ask your yard.',
    body: html`
${pageHero(ctx, {
  cls: 'fm-hero ac-hero',
  eyebrow: 'Contractor accounts',
  title: 'Put it on <em>account.</em>',
  srTitle: 'Contractor credit application',
  lede: 'Apply online, or ask your yard about an account.',
  actions: html`<a class="btn" href="#apply">Start the application ${icon('arrow', { size: 18 })}</a><button type="button" class="btn btn--line" data-print>${icon('file', { size: 18 })} Print a paper copy</button>`,
  fill: sheet(ctx),
})}

<section class="section field-k ac-perks clip" aria-labelledby="ac-perks-h">
  <div class="wrap">
    ${sectionHead({
      id: 'ac-perks-h',
      eyebrow: 'Before you apply',
      title: 'Buying <em>regularly?</em>',
      lede: 'Ask your yard about limits, terms and who can order on an account.',
      action: callBtn(ctx),
    })}
  </div>
</section>

<section class="section field-p fm-sec ac-apply" id="apply">
  <div class="wrap">
    ${letterhead(ctx, { title: 'Credit application', sub: SITE.legal })}
    <div class="ac-apply__head">
      ${sectionHead({ eyebrow: 'Credit application', title: 'Apply <em>for credit.</em>', lede: 'Ask your yard about limits and terms.', action: html`<button type="button" class="link ac-print" data-print>Print a paper copy ${icon('file', { size: 16 })}</button>` })}
      <div class="ac-ready">
        <p class="ac-ready__k">The form asks for</p>
        <ul class="ac-ready__list">${ON_HAND.map((t) => html`<li>${t}</li>`)}</ul>
      </div>
    </div>
    <div class="fm-layout">
      <div class="fm-main">
        ${formOpen('credit', 'Credit application', { name: 'Application', saved: 'Saved on this device as you type, except your tax ID, bank details and signature.' })}
          <fieldset class="fieldset" id="biz">
            <legend><span>01</span>Business</legend>
            ${field({ id: 'company', label: 'Legal business name', required: true, full: true, msg: 'Enter the business’s legal name.', attrs: html` autocomplete="organization"` })}
            ${field({ id: 'dba', label: 'Doing business as', hint: 'if different' })}
            ${select({ id: 'entity', label: 'Business type', options: ENTITIES, boxes: true })}
            ${field({ id: 'ein', label: 'Federal tax ID (EIN)', hint: 'not your SSN', attrs: html` inputmode="numeric" autocomplete="off"` })}
            ${field({ id: 'license', label: 'Contractor license #', hint: 'WA L&I or AK', attrs: html` autocomplete="off"` })}
            ${SITE.formEndpoint ? '' : html`<p class="fm-help field--full">This form goes by ordinary email, tax ID and bank details included. To keep them out of the email, leave them blank and give them to your yard by phone.</p>`}
            ${field({ id: 'years', label: 'Years in business', type: 'number', attrs: html` min="0" inputmode="numeric"` })}
            ${field({ id: 'website', label: 'Website', type: 'url', attrs: html` autocomplete="url" placeholder="https://"` })}
            ${field({ id: 'address', label: 'Billing address', required: true, full: true, msg: 'Enter the address invoices go to.', attrs: html` autocomplete="street-address"` })}
          </fieldset>

          <fieldset class="fieldset" id="contacts">
            <legend><span>02</span>Contacts</legend>
            ${field({ id: 'name', label: 'Your name', required: true, msg: 'Enter your name.', attrs: html` autocomplete="name"` })}
            ${field({ id: 'title', label: 'Title', attrs: html` autocomplete="organization-title"` })}
            ${field({ id: 'phone', label: 'Phone', type: 'tel', required: true, msg: 'Add a number the yard can reach you on.', attrs: html` autocomplete="tel" inputmode="tel"` })}
            ${field({ id: 'email', label: 'Email', type: 'email', required: true, msg: 'Add an email address.', attrs: html` autocomplete="email" inputmode="email"` })}
            ${field({ id: 'ap_contact', label: 'Accounts payable contact', hint: 'name, phone, email', full: true })}
            ${textarea({ id: 'buyers', label: 'Authorized buyers', hint: 'names of people who can order or pick up', rows: 3 })}
          </fieldset>

          <fieldset class="fieldset" id="account">
            <legend><span>03</span>Account</legend>
            ${yardSelect({ label: 'Home yard', hint: 'where you’ll buy most', help: false })}
            <div class="field field--full print-only"><span class="label">Home yard</span>${paperBoxes(LOCATIONS.map((l) => l.city), 'yard')}</div>
            ${field({ id: 'limit', label: 'Requested credit limit', hint: 'USD', attrs: html` inputmode="numeric" placeholder="$"` })}
            ${field({ id: 'monthly', label: 'Expected monthly purchases', hint: 'USD', attrs: html` inputmode="numeric" placeholder="$"` })}
            ${radios('po', 'Purchase orders required on invoices?', [['No'], ['Yes']], { cls: 'fm-half' })}
            ${radios('tax', 'Tax status', [['Taxable'], ['Resale'], ['Tax-exempt']], { cls: 'fm-half' })}
          </fieldset>

          <fieldset class="fieldset fieldset--newpage" id="refs">
            <legend><span>04</span>References</legend>
            <div class="field field--full refs">
              ${reference(1)}${reference(2)}${reference(3)}
            </div>
            ${field({ id: 'bank', label: 'Bank', hint: 'name and branch', full: false })}
            ${field({ id: 'bank_contact', label: 'Bank contact & phone' })}
          </fieldset>

          <fieldset class="fieldset" id="sign">
            <legend><span>05</span>Documents &amp; signature</legend>
            ${fileDrop({ id: 'docs', name: 'documents', label: 'Certificates', hint: 'resale or tax-exempt certificate, contractor license, W-9', title: 'Attach documents', touch: 'Tap to attach documents or take a photo', note: 'PDF or photos, up to 25 MB each.', accept: '.pdf,.jpg,.jpeg,.png,.heic' })}
            <div class="field field--full print-only"><span class="label">Attach copies of</span>${paperBoxes(['Resale or tax-exempt certificate', 'Contractor license', 'W-9'])}</div>
            <div class="field field--full">
              <label class="check"><input type="checkbox" id="agree" name="agree" value="Yes" data-label="Certified true" required aria-describedby="agree-err"><span>I certify the information above is true.<span class="req" aria-hidden="true">*</span></span></label>
              <span class="err" id="agree-err" hidden></span>
            </div>
            ${field({ id: 'signature', label: 'Signature', hint: 'type your full name', printHint: false, required: true, msg: 'Type your full name to sign.', cls: 'fm-sign' })}
            ${field({ id: 'signed', label: 'Date', type: 'date', required: true, msg: 'Enter today’s date.', cls: 'fm-signdate' })}
          </fieldset>
          <div class="ac-return print-only">
            <p class="ac-return__k">Our yards</p>
            <div class="ac-return__yards">${LOCATIONS.map((l) => html`<p><b>${l.city}, ${l.state}</b><br>${l.street}<br>${l.city}, ${l.state} ${l.zip}<br>${l.phone}</p>`)}</div>
          </div>
          ${formFoot('Submit application')}
        </form>
        ${doneNotice({ sent: 'Thanks. Your application is in.', almost: 'your application', print: true })}
      </div>

      <div class="fm-aside" role="group" aria-label="Who this application goes to">
        ${yardTag({
          kicker: 'Your application goes to',
          ask: 'Questions about an account?',
          lines: html`<nav class="fm-steps" aria-label="Parts of the application">
            <ol>${PARTS.map(([id, name], i) => html`<li><a href="#${id}" data-step="${id}"><span class="fm-steps__no nums" aria-hidden="true">${i + 1}</span>${name}</a></li>`)}</ol>
          </nav>`,
        })}
      </div>
    </div>
  </div>
</section>

${quoteBand(ctx, { title: 'Got a job <em>to price?</em>', body: 'Send plans or a list. The yard you choose will help with the take-off and quote it.', photoKey: 'blueprints', caption: 'Marking up drawings', label: 'Estimates & take-offs' })}
`,
  }),
};
