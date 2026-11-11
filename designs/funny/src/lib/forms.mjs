import { html, raw } from './html.mjs';
import { icon, mark } from './icons.mjs';
import { openStatus } from './components.mjs';
import { SITE } from '../config.mjs';
import { LOCATIONS, tel } from '../data/locations.mjs';

// Form building blocks shared by the quote request and the credit application.
// site.js finds forms by [data-form] and handles validation, drafts, uploads and sending;
// modules/forms.js keeps the yard tag and the step list in step with what has been typed.

// The asterisk is for the eye. The input's own `required` is what a screen reader announces.
const star = html`<span class="req" aria-hidden="true">*</span>`;

// A row of boxes that only exists on paper, where a <select> cannot be ticked. `of` names the
// select whose choice gets ticked on a filled-in copy (modules/forms.js).
export const paperBoxes = (items, of) => html`<span class="pboxes print-only"${of ? html` data-boxes-of="${of}"` : ''} aria-hidden="true">${items.map((t) => html`<span class="pbox">${t}</span>`)}</span>`;

// `msg` is what the visitor reads when a required field is empty. `printHint: false` keeps a
// screen-only instruction ("type your full name") off the paper copy.
export const field = ({ id, label, type = 'text', required = false, full = false, hint, printHint = true, attrs = '', msg, cls = '', note = '' }) => html`
  <div class="field${full ? ' field--full' : ''}${cls ? ' ' + cls : ''}">
    <label for="${id}">${label}${required ? star : ''}${hint ? html` <span class="hint${printHint ? '' : ' hint--screen'}">${hint}</span>` : ''}</label>
    <input class="input" id="${id}" name="${id}" type="${type}"${required ? html` required aria-describedby="${id}-err"` : ''}${msg ? html` data-msg="${msg}"` : ''}${attrs}>
    ${required ? html`<span class="err" id="${id}-err" hidden></span>` : ''}
    ${note}
  </div>`;

export const select = ({ id, label, options, full = false, hint, boxes = false }) => html`
  <div class="field${full ? ' field--full' : ''}${boxes ? ' field--boxes' : ''}">
    <label for="${id}">${label}${hint ? html` <span class="hint">${hint}</span>` : ''}</label>
    <select id="${id}" name="${id}">${options.map((o) => html`<option>${o}</option>`)}</select>
    ${boxes ? paperBoxes(options, id) : ''}
  </div>`;

export const textarea = ({ id, label, hint, rows = 4, full = true }) => html`
  <div class="field${full ? ' field--full' : ''}">
    <label for="${id}">${label}${hint ? html` <span class="hint">${hint}</span>` : ''}</label>
    <textarea id="${id}" name="${id}" rows="${rows}"></textarea>
  </div>`;

// Radios drawn as pills. On paper the same inputs print as empty tick boxes.
export const radios = (name, legend, opts, { cls = '' } = {}) => html`
  <div class="field field--full${cls ? ' ' + cls : ''}" role="radiogroup" aria-labelledby="${name}-label">
    <span class="label" id="${name}-label">${legend}</span>
    <div class="seg">
      ${opts.map(([value, ic], i) => html`<label><input type="radio" name="${name}" value="${value}"${i === 0 ? html` checked` : ''}>${ic ? icon(ic, { size: 20 }) : ''}<span>${value}</span></label>`)}
    </div>
  </div>`;

// The yard select. Every option carries what the yard tag beside the form needs to name it.
export const yardSelect = ({ label = 'Send to', hint = 'the yard nearest the job', help = true } = {}) => html`
  <div class="field field--full fm-yard">
    <label for="yard">${label} <span class="hint">${hint}</span></label>
    <select id="yard" name="yard">
      ${LOCATIONS.map((l) => html`<option value="${l.city}" data-email="${l.email}" data-phone="${l.phone}" data-tel="${tel(l.phone)}" data-role="${l.role}">${l.city}, ${l.state}</option>`)}
    </select>
    <p class="fm-goes">${icon('phone', { size: 16 })}<span><b data-goes="city">${LOCATIONS[0].city}</b> answers: <a data-goes-tel class="nums" href="${tel(LOCATIONS[0].phone)}"><span data-goes="phone">${LOCATIONS[0].phone}</span></a></span></p>
    ${help ? html`<p class="fm-help">Puget Sound: Kent. Southcentral Alaska or a remote site: Anchorage. The Interior and points north: Fairbanks. Any yard can help.</p>` : ''}
    <span class="sr-only" role="status" data-goes-said></span>
  </div>`;

// The file tray: a shallow U you drop plans into.
export const fileDrop = ({ id = 'files', name = 'files', label, hint, title = 'Drop files here or browse', touch = 'Tap to add files or take a photo', note, accept }) => html`
  <div class="field field--full fm-filefield">
    <span class="label" id="${id}-label">${label}${hint ? html` <span class="hint">${hint}</span>` : ''}</span>
    <label class="drop" data-drop>
      <span class="drop__icon">${icon('upload', { size: 26 })}</span>
      <b class="drop__title"><span class="drop__mouse">${title}</span><span class="drop__touch">${touch}</span></b>
      ${note ? html`<small>${note}</small>` : ''}
      ${SITE.formEndpoint ? '' : html`<small class="drop__mail">Files can’t go through this page yet. Your email app opens when you send: attach them there.</small>`}
      <input class="sr-only" type="file" name="${name}" multiple accept="${accept}" aria-labelledby="${id}-label">
    </label>
    <ul class="files" data-files aria-live="polite"></ul>
    <p class="err" data-file-err hidden></p>
  </div>`;

// `name` titles the ticket; `saved` says what happens to what is typed, which is true of the
// script in 00-core.js: drafts stay in this browser, without the private fields.
export const formOpen = (kind, subject, { name, saved = 'Saved on this device as you type.' } = {}) => html`<form class="form fm-card" data-form="${kind}" data-subject="${subject}" data-endpoint="${SITE.formEndpoint}" data-email="${SITE.email}" action="${SITE.formEndpoint || 'mailto:' + SITE.email}" method="post" enctype="multipart/form-data">
      <div class="fm-card__head">
        <p class="fm-card__name">${name || subject}</p>
        <p class="fm-card__key">${star}<span>Required</span><span class="fm-card__saved">${saved}</span></p>
      </div>
      <p class="fm-restored" data-restored hidden>We kept what you typed last time: the director’s cut. <span data-restored-files hidden>Attach your files again. </span><button type="button" class="fm-textbtn" data-draft-clear>Start over</button></p>`;

const THREE = () => LOCATIONS.map((l) => html`<a class="fm-mini nums" href="${tel(l.phone)}"><b>${l.city}</b> ${l.phone}</a>`);

export const formFoot = (label, { goes = true } = {}) => html`
  <div class="form__foot">
    <div class="fm-errs" data-errs hidden tabindex="-1"></div>
    <button class="btn btn--lg" type="submit">${label} ${icon('arrow', { size: 20 })}</button>
    <p>${goes ? html`Goes to <b data-goes="city">${LOCATIONS[0].city}</b>. ` : ''}${SITE.formEndpoint ? 'We’ll confirm by email.' : 'This opens your email app with everything filled in. Attach any files there before you send. Yes, really.'}</p>
    <noscript><p class="fm-noscript">This form needs JavaScript to send. Call a yard, or email <a href="mailto:${SITE.email}">${SITE.email}</a>.</p></noscript>
  </div>
  <div class="notice notice--bad" data-failed hidden tabindex="-1" role="alert">
    <span class="notice__u">${icon('close', { size: 26 })}</span>
    <div class="notice__body">
      <h2 class="notice__title">That didn’t go through</h2>
      <p>That one fell off the truck. Please try again, or email <a href="mailto:${SITE.email}">${SITE.email}</a> or call the yard directly.</p>
      <div class="fm-minis">${THREE()}</div>
    </div>
  </div>`;

export const doneNotice = ({ sent, almost, print = false }) => html`
  <div class="notice notice--done" data-done hidden tabindex="-1" role="status">
    <span class="notice__u">${icon('check', { size: 30 })}</span>
    <div class="notice__body">
      <h2 class="notice__title">${SITE.formEndpoint ? 'Sent. Cue the applause.' : 'Almost there. Final scene.'}</h2>
      <p class="notice__lede">${SITE.formEndpoint ? sent : html`Your email app should have opened a message to <b data-mail-to>${SITE.email}</b> with ${almost} filled in. <span data-mail-note>Attach your files to that email, then send it.</span> If nothing opened, email us directly or call the yard.`}</p>
      ${SITE.formEndpoint ? '' : html`
      <ul class="fm-tolist" data-mail-files hidden></ul>
      <div class="actions">
        <a class="btn" data-mail-again href="mailto:${SITE.email}">${icon('mail', { size: 18 })} Open the email again</a>
        <button type="button" class="btn btn--line" data-mail-copy>${icon('file', { size: 18 })} <span>Copy the text</span></button>
        <button type="button" class="btn btn--line" data-mail-back>Back to the form</button>
        ${print ? html`<button type="button" class="btn btn--line" data-print>${icon('file', { size: 18 })} Print what you filled in</button>` : ''}
      </div>`}
      ${SITE.formEndpoint && print ? html`<div class="actions"><button type="button" class="btn btn--line" data-print>${icon('file', { size: 18 })} Print what you filled in</button></div>` : ''}
      <div class="fm-minis">${THREE()}</div>
    </div>
  </div>`;

// ---- The page pieces both forms share -------------------------------------------------------

// The three numbers as a stack of rows. The one that answers this form is filled in.
export const callRows = ({ marked = false } = {}) => html`
  <ul class="fm-calls">
    ${LOCATIONS.map((l, i) => html`<li><a class="fm-call${marked && i === 0 ? ' is-goes' : ''}" ${marked ? raw(`data-goes-row="${l.city}"`) : ''} href="${tel(l.phone)}">
      <span class="fm-call__city"><b>${l.city}</b>${openStatus(l)}</span>
      <span class="fm-call__num nums">${l.phone}</span>
      <span class="fm-call__go">${icon('phone', { size: 18 })}</span>
    </a></li>`)}
  </ul>`;

// Black U in the hero: the numbers, for anyone who would rather not type.
export const callU = ({ title = 'Rather call? A phone is a form with better manners.' } = {}) => html`
  <div class="fm-u field-k">
    <p class="fm-u__k">${title}</p>
    ${callRows()}
  </div>`;

// The yellow freight tag beside the form: who answers, and the three numbers.
export const yardTag = ({ kicker, lines = '', after = '', ask = 'Rather call?' }) => {
  const k = LOCATIONS[0];
  return html`
  <div class="fm-tag on-y">
    <p class="fm-tag__k">${kicker}</p>
    <p class="fm-tag__city" data-goes="city">${k.city}</p>
    <p class="fm-tag__role" data-goes="role">${k.role}</p>
    <a class="fm-tag__mail" data-goes-mail href="mailto:${k.email}"><span data-goes="email">${k.email}</span></a>
    ${lines}
    <p class="fm-tag__ask">${ask}</p>
    ${callRows({ marked: true })}
    ${after}
  </div>`;
};

// Paper copy only: the block at the top of the printed application.
export const letterhead = (ctx, { title, sub }) => html`
  <div class="letterhead print-only">
    <div class="letterhead__brand">${mark({ id: 'mkp' + ctx.uid() })}<div><p class="letterhead__title">${title}</p><p>${sub}</p></div></div>
    <div class="letterhead__return"><b>Ask your yard where to send this.</b><br>
      ${LOCATIONS.map((l) => html`${l.city}: fax ${l.fax} · ${l.email}<br>`)}
    </div>
  </div>`;
