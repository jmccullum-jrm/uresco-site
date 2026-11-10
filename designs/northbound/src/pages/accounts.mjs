import { html } from '../lib/html.mjs';
import { icon, mark } from '../lib/icons.mjs';
import { layout } from '../lib/layout.mjs';
import { picture, figure, sectionHead, pageHero, deg, latOf } from '../lib/components.mjs';
import { field, select, textarea, radios, yardSelect, fileDrop, formOpen, formFoot, doneNotice, sheetHead, slip, dial, callList, closingYards } from '../lib/forms.mjs';
import { LOCATIONS, byId, tel } from '../data/locations.mjs';
import { SITE } from '../config.mjs';

// Contractor charge accounts. Terms (limits, due dates) are set by Uresco per account
// and are deliberately not published here.
const PERKS = [
  ['Buy on account', 'Order by phone, email or quote and pay against a monthly statement instead of at the counter.'],
  ['Job accounts', 'Track materials by project, so every invoice lands on the right job.'],
  ['Authorized buyers', 'Name the people on your crew who can pick up or order on your account.'],
  ['Tax-exempt & resale on file', 'Send your certificates once and we keep them on your account.'],
];

const ROWS = [
  [null, 'Apply', 'Online here, or print a paper copy and drop it at any yard.'],
  [null, 'Review', 'We check references and confirm your limit and terms.'],
  [null, 'Order', 'Your home yard sets up your account and authorized buyers.'],
  ['to', 'To', 'The home yard you choose'],
];

const NEED = '10 required fields to go.';

const ENTITIES = ['Corporation', 'LLC', 'Partnership', 'Sole proprietor', 'Government or institution', 'Other'];

// On paper a select cannot be read or ticked, so its options print as boxes.
const paperChoice = (id, label, options) => html`
  <div class="field field--full field--paper print-only">
    <span class="label">${label}</span>
    <div class="fp-paper-opts">${options.map(([value, text = value]) => html`<span class="fp-paper-opt" data-paper-for="${id}" data-value="${value}"><i></i>${text}</span>`)}</div>
  </div>`;

const reference = (n) => html`
  <div class="ref">
    <p class="ref__title"><span>${n}</span>Trade reference</p>
    ${field({ id: `ref${n}_company`, label: 'Company', required: n === 1, msg: 'Add at least one company we can check with.', attrs: html` data-label="Reference ${n} company"` })}
    ${field({ id: `ref${n}_contact`, label: 'Contact & phone or email', required: n === 1, msg: 'Add someone we can reach there.', attrs: html` data-label="Reference ${n} contact"` })}
  </div>`;

export default {
  path: 'accounts/',
  render: (ctx) => layout(ctx, {
    title: 'Contractor accounts & credit application',
    description: 'Open a contractor charge account with Uresco Construction Materials. Apply online for credit to buy on account at our Kent, Anchorage and Fairbanks yards.',
    body: html`
${pageHero(ctx, {
  crumbs: [['Contractor accounts']],
  eyebrow: 'Credit application',
  title: 'One account, <em>three yards.</em>',
  after: html`<ol class="ac-ladder" aria-label="The three yards, north to south">
      ${[...LOCATIONS].reverse().map((l) => html`<li style="--d:${(latOf(byId('fairbanks')) - latOf(l)).toFixed(1)}"><a href="${tel(l.phone)}">
        <span class="ac-ladder__lat">${deg(latOf(l))}</span>
        <span class="ac-ladder__city">${l.city}</span>
        <span class="ac-ladder__num">${l.phone}</span>
      </a></li>`)}
    </ol>`,
  lede: 'Set up once, then order on account from Kent, Anchorage or Fairbanks.',
  actions: html`<a class="btn" href="#apply">Start the application ${icon('arrow', { size: 18 })}</a>
        <button type="button" class="btn btn--line" data-print>${icon('file', { size: 18 })} Print a paper copy</button>`,
  cls: 'fp-hero',
  tail: dial(),
})}

<section class="section ac-what" aria-labelledby="what-title">
  <div class="wrap ac-what__grid">
    <div class="ac-what__media">
      ${figure(ctx, 'combilift', { ratio: 'port', sizes: '(min-width: 1000px) min(36vw, 33rem), 86vw', caption: 'A forklift operator moving lumber in a warehouse.', pos: '50% 22%' })}
      <figure class="print print--over ac-print rv" style="--i:2">
        ${picture(ctx, 'uresco-woodpile', { sizes: '190px' })}
        <figcaption>From the Uresco archive: timber ends stacked in a Uresco yard.</figcaption>
      </figure>
    </div>
    <div class="ac-what__text">
      ${sectionHead({ eyebrow: 'What an account does', id: 'what-title', title: 'Pay by statement, <em>not at the counter.</em>' })}
      <ol class="ac-ledger">
        ${PERKS.map(([t, b], i) => html`<li class="rv" style="--i:${i}">
          <span class="ac-ledger__no" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
          <h3 class="ac-ledger__name">${t}</h3>
          <p>${b}</p>
        </li>`)}
      </ol>
      <a class="link ac-what__go" href="#apply">Start the application ${icon('arrow', { size: 16 })}</a>
    </div>
  </div>
</section>

<section class="fp-band fp-band--apply" id="apply" aria-labelledby="apply-title">
  <div class="wrap">
    <div class="letterhead print-only">
      <div class="letterhead__brand">${mark({ id: 'mkp' })}<div><p class="letterhead__title">Credit application</p><p>${SITE.legal}</p><p class="letterhead__note">Fields marked * are required.</p></div></div>
      <div class="letterhead__return"><b>Return to your home yard:</b><br>
        ${LOCATIONS.map((l) => html`${l.city}: fax ${l.fax} · ${l.email}<br>`)}
      </div>
    </div>
    <div class="ac-applyhead">
      ${sectionHead({ eyebrow: 'Credit application', id: 'apply-title', title: 'Apply <em>for credit.</em>', lede: 'We use this to review your account. Credit limits and terms are confirmed by your yard once it’s approved.' })}
    </div>
    <div class="fp-grid">
      <div class="fp-sheet">
        ${sheetHead('Credit application', 'Contractor accounts')}
        ${formOpen('credit', 'Credit application')}
          <fieldset class="fieldset">
            <legend><span>01</span>Business</legend>
            ${field({ id: 'company', label: 'Legal business name', required: true, full: true, msg: 'Add the name the business is registered under.', attrs: html` autocomplete="organization"` })}
            ${field({ id: 'dba', label: 'Doing business as', hint: 'if different' })}
            ${select({ id: 'entity', label: 'Business type', options: ENTITIES, cls: 'fp-screen-only' })}
            ${field({ id: 'ein', label: 'Federal tax ID (EIN)', hint: 'not your SSN', attrs: html` inputmode="numeric" autocomplete="off"` })}
            ${field({ id: 'license', label: 'Contractor license #', hint: 'WA L&I or AK', cls: 'field--third', attrs: html` autocomplete="off"` })}
            ${field({ id: 'years', label: 'Years in business', type: 'number', cls: 'field--third', attrs: html` min="0" inputmode="numeric"` })}
            ${field({ id: 'website', label: 'Website', type: 'url', cls: 'field--third', attrs: html` autocomplete="url" placeholder="https://"` })}
            ${paperChoice('entity', 'Business type', ENTITIES.map((e) => [e]))}
            ${field({ id: 'address', label: 'Billing address', required: true, full: true, msg: 'Add the address invoices go to.', attrs: html` autocomplete="street-address"` })}
          </fieldset>

          <fieldset class="fieldset">
            <legend><span>02</span>Contacts</legend>
            ${field({ id: 'name', label: 'Your name', required: true, msg: 'Add your name.', attrs: html` autocomplete="name"` })}
            ${field({ id: 'title', label: 'Title', attrs: html` autocomplete="organization-title"` })}
            ${field({ id: 'phone', label: 'Phone', type: 'tel', required: true, msg: 'Add a number we can reach you on.', attrs: html` autocomplete="tel" inputmode="tel"` })}
            ${field({ id: 'email', label: 'Email', type: 'email', required: true, msg: 'Add an email address.', attrs: html` autocomplete="email" inputmode="email"` })}
            ${field({ id: 'ap_contact', label: 'Accounts payable contact', hint: 'name, phone, email', full: true })}
            ${textarea({ id: 'buyers', label: 'Authorized buyers', hint: 'names of people who can order or pick up', rows: 3, cls: 'field--lined' })}
          </fieldset>

          <fieldset class="fieldset">
            <legend><span>03</span>Account</legend>
            ${yardSelect({ label: 'Home yard', hint: 'where you’ll buy most', answers: (city) => `${city} would set up your account.`, cls: 'fp-screen-only' })}
            ${paperChoice('yard', 'Home yard', LOCATIONS.map((l) => [l.city]))}
            ${field({ id: 'limit', label: 'Requested credit limit', hint: 'USD', attrs: html` inputmode="numeric" placeholder="$"` })}
            ${field({ id: 'monthly', label: 'Expected monthly purchases', hint: 'USD', attrs: html` inputmode="numeric" placeholder="$"` })}
            ${radios('po', 'Purchase orders required on invoices?', [['No'], ['Yes']], { cls: 'field--paperline' })}
            ${radios('tax', 'Tax status', [['Taxable'], ['Resale'], ['Tax-exempt']], { cls: 'field--paperline' })}
          </fieldset>

          <fieldset class="fieldset fieldset--newpage">
            <legend><span>04</span>References</legend>
            <p class="ac-cont print-only">Credit application, continued. Legal business name: <i data-paper-copy="company"></i></p>
            <div class="field field--full refs">
              ${reference(1)}${reference(2)}${reference(3)}
            </div>
            ${field({ id: 'bank', label: 'Bank', hint: 'name and branch' })}
            ${field({ id: 'bank_contact', label: 'Bank contact & phone' })}
          </fieldset>

          <fieldset class="fieldset">
            <legend><span>05</span>Documents &amp; signature</legend>
            ${fileDrop({ id: 'docs', name: 'documents', label: 'Certificates', hint: 'resale or tax-exempt certificate, contractor license, W-9', title: 'Attach documents', touch: 'Tap to attach documents', note: 'PDF or photos, up to 25 MB each.', accept: '.pdf,.jpg,.jpeg,.png,.heic', cls: 'fp-screen-only' })}
            <div class="field field--full field--paper print-only">
              <span class="label">Attach copies</span>
              <div class="fp-paper-opts"><span class="fp-paper-opt"><i></i>Resale or tax-exempt certificate</span><span class="fp-paper-opt"><i></i>Contractor license</span><span class="fp-paper-opt"><i></i>W-9</span></div>
            </div>
            <div class="field field--full field--check">
              <label class="check"><input type="checkbox" id="agree" name="agree" value="Yes" data-label="Certified and authorized credit check" data-need="Certification" data-msg="Please confirm to continue." required aria-describedby="agree-err"><span>I certify the information above is true and authorize Uresco Construction Materials, Inc. to contact the references listed and obtain credit information to evaluate this application.</span>${html`<span class="req" aria-hidden="true">Required</span>`}</label>
              <span class="err" id="agree-err" hidden></span>
            </div>
            ${field({ id: 'signature', label: 'Signature', hint: 'type your full name', required: true, msg: 'Type your full name to sign.', cls: 'field--sign' })}
            ${field({ id: 'signed', label: 'Date', type: 'date', required: true, msg: 'Add today’s date.', cls: 'field--signdate' })}
          </fieldset>
          ${formFoot('Submit application', { draft: 'Saved in this browser as you type, except your tax ID, bank details and signature.', slip: slip({ head: 'Check before you send', rows: ROWS.slice(-1), need: NEED, cls: 'fp-slip--foot' }) })}
        </form>
        ${doneNotice({ sent: 'Thanks. Your application is in. Your home yard will contact you once it has been reviewed.', almost: 'your application' })}
      </div>

      <div class="fp-side" role="group" aria-label="How the application works">
        ${slip({ head: 'How it works', rows: ROWS, need: NEED })}
        ${callList({ lead: 'Questions about an account?', mark: 'Your home yard' })}
        <button type="button" class="link fp-side__print" data-print>${icon('file', { size: 16 })} Print a paper copy</button>
      </div>
    </div>
  </div>
</section>

<section class="section fp-close" aria-labelledby="close-title">
  <div class="wrap">
    ${sectionHead({
      eyebrow: 'Questions about an account?',
      id: 'close-title',
      title: 'Three yards. <em>One team.</em>',
      lede: 'Any yard can help. Call the one you’ll buy from most.',
      action: html`<a class="link" href="${ctx.u('quote/')}">Need a price first? Request a quote ${icon('arrow', { size: 16 })}</a>`,
    })}
    ${closingYards()}
  </div>
</section>
`,
  }),
};
