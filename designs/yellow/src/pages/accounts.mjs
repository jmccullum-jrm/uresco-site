import { html } from '../lib/html.mjs';
import { icon, mark } from '../lib/icons.mjs';
import { layout } from '../lib/layout.mjs';
import { eyebrow, pageHero, quoteBand, sectionHead } from '../lib/components.mjs';
import { field, select, textarea, radios, yardSelect, fileDrop, formOpen, formFoot, doneNotice, yardTag, letterhead, paperBoxes } from '../lib/forms.mjs';
import { LOCATIONS } from '../data/locations.mjs';
import { SITE } from '../config.mjs';

// Contractor charge accounts. Terms (limits, due dates) are set by Uresco per account
// and are deliberately not published here.

// What an account does, read off the lines of a yard ticket.
const TICKET = [
  ['Charge to', 'Buy on account', 'Order by phone, email or quote and pay on account instead of at the counter.'],
  ['Job', 'Job accounts', 'Track materials by project, so every invoice lands on the right job.'],
  ['Picked up by', 'Authorized buyers', 'Name the people on your crew who can pick up or order on your account.'],
  ['Tax', 'Tax-exempt & resale on file', 'Send your certificates once and we keep them on your account.'],
];

const PATH = [
  ['Apply', 'Online here, or print a paper copy and drop it at any yard.'],
  ['We review', 'We check references and confirm your limit and terms.'],
  ['Start ordering', 'Your home yard sets up your account and authorized buyers.'],
];

// The fields that send people to a filing cabinet. Taken from the form itself.
const ON_HAND = ['Federal tax ID (EIN)', 'Contractor license #', 'Trade references', 'Bank and bank contact', 'Resale or tax-exempt certificate', 'W-9'];

// The five parts, for the step list beside the form.
const PARTS = [['biz', 'Business'], ['contacts', 'Contacts'], ['account', 'Account'], ['refs', 'References'], ['sign', 'Documents & signature']];

const ENTITIES = ['Corporation', 'LLC', 'Partnership', 'Sole proprietor', 'Tribal or Alaska Native corporation', 'Government or institution', 'Other'];

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
    description: 'Open a contractor charge account with Uresco Construction Materials. Apply online for credit to buy on account at our Kent, Anchorage and Fairbanks yards.',
    body: html`
${pageHero(ctx, {
  cls: 'fm-hero ac-hero',
  eyebrow: 'Contractor accounts',
  title: 'Put it on <em>account.</em>',
  srTitle: 'Open a contractor account',
  lede: 'Set up once, then order from any of our three yards on account. Apply online, or print it and drop it at any yard.',
  actions: html`<a class="btn" href="#apply">Start the application ${icon('arrow', { size: 18 })}</a><button type="button" class="btn btn--line" data-print>${icon('file', { size: 18 })} Print a paper copy</button>`,
  fill: sheet(ctx),
  art: html`<span class="sticker ac-hero__sticker" style="--rot:-5deg">Paper works too</span>`,
})}

<section class="section field-k ac-perks clip" aria-labelledby="ac-perks-h">
  <div class="wrap ac-perks__grid">
    <div class="ac-perks__head">
      ${eyebrow('What an account does')}
      <h2 class="d2" id="ac-perks-h">Your name <em>on the ticket.</em></h2>
      <ol class="ac-path">
        ${PATH.map(([name, text], i) => html`<li><span class="ac-path__no nums" aria-hidden="true">${i + 1}</span><div><b>${name}</b><span>${text}</span></div></li>`)}
      </ol>
    </div>
    <div class="ac-ticket" data-reveal>
      <div class="ac-ticket__head"><span>Yard ticket</span><i aria-hidden="true">${mark({ id: 'mkt' + ctx.uid(), tile: '#0E0E0C', ink: '#F5B800' })}</i></div>
      <dl class="ac-ticket__rows">
        ${TICKET.map(([k, name, text]) => html`<div><dt>${k}</dt><dd><b>${name}</b><span>${text}</span></dd></div>`)}
      </dl>
    </div>
  </div>
</section>

<section class="section field-p fm-sec ac-apply" id="apply">
  <div class="wrap">
    ${letterhead(ctx, { title: 'Credit application', sub: SITE.legal })}
    <div class="ac-apply__head">
      ${sectionHead({ eyebrow: 'Credit application', title: 'Apply <em>for credit.</em>', lede: 'We use this to review your account. Credit limits and terms are confirmed by your yard once it’s approved.', action: html`<button type="button" class="link ac-print" data-print>Print a paper copy ${icon('file', { size: 16 })}</button>` })}
      <div class="ac-ready">
        <p class="ac-ready__k">Have these on hand</p>
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
            <div class="field field--full print-only"><span class="label">Home yard</span>${paperBoxes(LOCATIONS.map((l) => l.city))}</div>
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
              <label class="check"><input type="checkbox" id="agree" name="agree" value="Yes" data-label="Certified and authorized credit check" required aria-describedby="agree-err"><span>I certify the information above is true and authorize Uresco Construction Materials, Inc. to contact the references listed and obtain credit information to evaluate this application.<span class="req" aria-hidden="true">*</span></span></label>
              <span class="err" id="agree-err" hidden></span>
            </div>
            ${field({ id: 'signature', label: 'Signature', hint: 'type your full name', printHint: false, required: true, msg: 'Type your full name to sign.', cls: 'fm-sign' })}
            ${field({ id: 'signed', label: 'Date', type: 'date', required: true, msg: 'Enter today’s date.', cls: 'fm-signdate' })}
          </fieldset>
          <div class="ac-return print-only">
            <p class="ac-return__k">Drop it at any yard</p>
            <div class="ac-return__yards">${LOCATIONS.map((l) => html`<p><b>${l.city}, ${l.state}</b><br>${l.street}<br>${l.city}, ${l.state} ${l.zip}<br>${l.phone}</p>`)}</div>
          </div>
          ${formFoot('Submit application')}
        </form>
        ${doneNotice({ sent: 'Thanks. Your application is in. Your home yard will contact you once it has been reviewed.', almost: 'your application' })}
      </div>

      <div class="fm-aside" role="group" aria-label="Who reviews this application">
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

${quoteBand(ctx, { title: 'Got a job <em>to price?</em>', body: 'Send plans or a list. The yard you choose gets back to you with a take-off and pricing.', photoKey: 'blueprints', caption: 'Marking up drawings', label: 'Estimates & take-offs' })}
`,
  }),
};
