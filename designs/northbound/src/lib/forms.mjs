import { html } from './html.mjs';
import { icon } from './icons.mjs';
import { SITE } from '../config.mjs';
import { LOCATIONS, tel } from '../data/locations.mjs';
import { openStatus, deg, latOf } from './components.mjs';

// Form building blocks shared by the quote request and the credit application.
// 10-forms.js finds forms by [data-form] and handles validation, drafts, uploads and sending.
// The form is drawn as the manifest itself: a sheet of ruled cells, one control to a cell.

const REQ = html`<span class="req" aria-hidden="true">Required</span>`;

// `msg` is what the visitor reads when a required field is left empty.
export const field = ({ id, label, type = 'text', required = false, full = false, hint, msg, cls = '', attrs = '' }) => html`
  <div class="field${full ? ' field--full' : ''}${cls ? ' ' + cls : ''}">
    <label for="${id}">${label}${required ? REQ : ''}${hint ? html` <span class="hint">${hint}</span>` : ''}</label>
    <input class="input" id="${id}" name="${id}" type="${type}"${required ? html` required aria-describedby="${id}-err"` : ''}${msg ? html` data-msg="${msg}"` : ''}${attrs}>
    ${required ? html`<span class="err" id="${id}-err" hidden></span>` : ''}
  </div>`;

export const select = ({ id, label, options, full = false, hint, cls = '' }) => html`
  <div class="field${full ? ' field--full' : ''}${cls ? ' ' + cls : ''}">
    <label for="${id}">${label}${hint ? html` <span class="hint">${hint}</span>` : ''}</label>
    <select id="${id}" name="${id}">${options.map((o) => html`<option>${o}</option>`)}</select>
  </div>`;

export const textarea = ({ id, label, hint, rows = 4, full = true, cls = '' }) => html`
  <div class="field${full ? ' field--full' : ''}${cls ? ' ' + cls : ''}">
    <label for="${id}">${label}${hint ? html` <span class="hint">${hint}</span>` : ''}</label>
    <textarea id="${id}" name="${id}" rows="${rows}"></textarea>
  </div>`;

export const radios = (name, legend, opts, { cls = '' } = {}) => html`
  <div class="field field--full${cls ? ' ' + cls : ''}" role="radiogroup" aria-labelledby="${name}-label">
    <span class="label" id="${name}-label">${legend}</span>
    <div class="seg" style="--n:${opts.length}">
      ${opts.map(([value, ic], i) => html`<label${ic ? html` class="seg__tile"` : ''}><input type="radio" name="${name}" value="${value}"${i === 0 ? html` checked` : ''}>${ic ? icon(ic, { size: 20 }) : ''}<span>${value}</span></label>`)}
    </div>
  </div>`;

// The select stays a real select (a phone's own picker is the best control there is). Under it,
// a line that says which yard will answer, and on the quote form how to choose.
export const yardSelect = ({ label = 'Send to', hint = 'the yard nearest the job', answers = (city) => `${city} answers this request.`, guide = '', cls = '' } = {}) => html`
  <div class="field field--full field--yard${cls ? ' ' + cls : ''}">
    <label for="yard">${label} <span class="hint">${hint}</span></label>
    <select id="yard" name="yard">
      ${LOCATIONS.map((l) => html`<option value="${l.city}" data-email="${l.email}">${l.city}, ${l.state}</option>`)}
    </select>
    ${LOCATIONS.map((l, i) => html`<p class="fp-yardnote" data-yard-note="${l.city}"${i ? html` hidden` : ''}>
      <span class="fp-yardnote__who"><b>${answers(l.city)}</b>${openStatus(l, { short: true })}</span>
      <span class="fp-yardnote__line"><span>${l.email}</span><a href="${tel(l.phone)}">${l.phone}</a></span>
    </p>`)}
    ${guide ? html`<p class="fp-yardguide">${guide}</p>` : ''}
  </div>`;

export const fileDrop = ({ id = 'files', name = 'files', label, hint, title = 'Drop files here or browse', touch = 'Tap to add files', note, accept, cls = '' }) => html`
  <div class="field field--full field--files${cls ? ' ' + cls : ''}">
    <span class="label" id="${id}-label">${label}${hint ? html` <span class="hint">${hint}</span>` : ''}</span>
    <label class="drop" data-drop>
      <span class="drop__icon">${icon('upload', { size: 24 })}</span>
      <span class="drop__text">
        <b class="drop__fine">${title}</b><b class="drop__touch">${touch}</b>
        ${note ? html`<small>${note}</small>` : ''}
        ${SITE.formEndpoint ? '' : html`<small>You will attach these to the email in the last step.</small>`}
      </span>
      <input class="sr-only" type="file" name="${name}" multiple accept="${accept}" aria-labelledby="${id}-label">
    </label>
    <ul class="files" data-files aria-live="polite"></ul>
    <p class="err" data-file-err hidden></p>
  </div>`;

// Without a form service, a browser with no script posts plain text to the mail app, and its own
// checks hold back an empty form. 10-forms.js sets noValidate when it takes over.
// The first line under the opening tag says when a saved draft was restored (10-forms.js fills it in).
export const formOpen = (kind, subject) => html`<form class="form" data-form="${kind}" data-subject="${subject}" data-endpoint="${SITE.formEndpoint}" data-email="${SITE.email}" action="${SITE.formEndpoint || 'mailto:' + SITE.email}" method="post" enctype="${SITE.formEndpoint ? 'multipart/form-data' : 'text/plain'}">
  <p class="form__restored" data-restored hidden><span data-restored-text></span> <button type="button" data-draft-clear>Start over</button></p>
  ${kind === 'credit' && !SITE.formEndpoint ? html`<p class="form__warn">This form opens in your email app, so your tax ID and bank details would travel by email. Rather not? Leave those fields blank and give them to your yard by phone.</p>` : ''}`;

// `slip` repeats the manifest above the button on screens that have no side column.
// The Print button is the credit application's; 10-forms.js takes it off forms with no paper copy.
export const formFoot = (label, { slip = '', draft = 'Saved in this browser as you type.' } = {}) => html`
  <div class="form__foot">
    ${slip}
    <div class="form__send">
      <button class="btn" type="submit">${label} ${icon('arrow', { size: 18 })}</button>
      <div class="form__how">
        <p>${SITE.formEndpoint ? 'We’ll confirm by email.' : 'This opens your email app with everything filled in. Attach any files there before you send.'}</p>
        <p class="form__draft" data-draft><span data-draft-text>${draft}</span> <button type="button" data-draft-clear hidden>Start over</button></p>
        <p class="form__print"><button type="button" data-print>Print a paper copy</button></p>
      </div>
    </div>
  </div>
  <div class="notice" data-failed hidden tabindex="-1" role="alert">
    ${icon('close', { size: 24 })}
    <div><h2>That didn’t go through</h2><p>Please try again, or email <a href="mailto:${SITE.email}">${SITE.email}</a> or call the yard directly.</p></div>
  </div>`;

export const doneNotice = ({ sent, almost }) => html`
  <div class="notice notice--done" data-done hidden tabindex="-1" role="status">
    <p class="notice__stamp" aria-hidden="true">${SITE.formEndpoint ? 'Sent' : 'Filled in'}</p>
    ${icon('check', { size: 24 })}
    <div>
      <h2>${SITE.formEndpoint ? 'Sent' : 'Almost there'}</h2>
      <p>${SITE.formEndpoint ? sent : html`<span data-mail-usual>Your email app should have opened a message to <b data-mail-to>${SITE.email}</b> with ${almost} filled in. <span data-mail-note>Attach your files to that email, then send it.</span> If nothing opened, copy it below and email it yourself, or call the yard.</span><span data-mail-long hidden>That is too long for an email link. Copy ${almost} below and paste it into a new email to <b data-mail-to>${SITE.email}</b>, or call the yard. Your form is still here.</span>`}</p>
      <div class="notice__acts">
        ${SITE.formEndpoint ? '' : html`<a class="btn btn--sm" href="mailto:${SITE.email}" data-mail-link>Open the email again</a>
        <button type="button" class="btn btn--sm btn--line" data-copy>Copy ${almost}</button>`}
        <button type="button" class="btn btn--sm btn--line" data-print>Print a copy</button>
      </div>
    </div>
  </div>`;

/* ---------- The pieces around a form ---------- */

// The head strip of the sheet, in the manifest's voice: what it is on the left, the desk it goes to on the right.
export const sheetHead = (title, form) => html`
  <div class="fp-sheet__head">
    <h2 class="label">${title}</h2>
    <p class="label fp-sheet__form" aria-hidden="true">${form}</p>
  </div>`;

// The manifest beside the form. Each row reads as an instruction until the form fills it in.
// rows: [slot, label, text]; a row whose slot is null never changes.
export const slip = ({ head, note, rows, need = true, cls = '' }) => html`
  <div class="fp-slip${cls ? ' ' + cls : ''}" data-slip>
    <p class="fp-slip__head"><span class="label">${head}</span>${note ? html`<span class="label fp-slip__note">${note}</span>` : ''}</p>
    <dl class="fp-slip__rows">
      ${rows.map(([slot, k, v]) => html`<div><dt>${k}</dt><dd${slot ? html` data-slot="${slot}"` : html` class="is-fixed"`}>${v}</dd></div>`)}
    </dl>
    ${need ? html`<p class="fp-slip__need" data-need>${need === true ? '' : need}</p>` : ''}
  </div>`;

// Phones and tablets, above the form: all three numbers in one ruled row, one tap each.
export const dial = () => html`
  <div class="fp-dial">
    <p class="label fp-dial__label">Rather call?</p>
    <ul aria-label="Call a yard">
      ${LOCATIONS.map((l) => html`<li><a href="${tel(l.phone)}">
        <span class="fp-dial__lat">${deg(latOf(l))}</span>
        <span class="fp-dial__city">${l.city}</span>
        <span class="fp-dial__num">${l.phone}</span>
      </a></li>`)}
    </ul>
  </div>`;

// The side column's numbers. The yard the form is addressed to wears a mark that says so.
export const callList = ({ lead = 'Rather call?', mark = 'Answers this request' } = {}) => html`
  <div class="fp-call">
    <p class="label fp-call__lead">${lead}</p>
    <ul>
      ${LOCATIONS.map((l) => html`<li data-yard-row="${l.city}"><a href="${tel(l.phone)}">
        <span class="fp-call__lat">${deg(latOf(l))} ${openStatus(l, { short: true })}</span>
        <span class="fp-call__mark">${mark}</span>
        <span class="fp-call__city">${l.city}</span>
        <span class="fp-call__num">${icon('phone', { size: 16 })}${l.phone}</span>
      </a></li>`)}
    </ul>
  </div>`;

// The end of the page: the three numbers at the size of a headline.
export const closingYards = () => html`
  <ul class="fp-yards" aria-label="Call a yard">
    ${LOCATIONS.map((l, i) => html`<li class="rv" style="--i:${i}"><a href="${tel(l.phone)}">
      <span class="fp-yards__lat">${deg(latOf(l))}</span>
      ${openStatus(l, { short: true })}
      <span class="fp-yards__city">${l.city}</span>
      <span class="fp-yards__num">${l.phone}</span>
    </a></li>`)}
  </ul>`;
