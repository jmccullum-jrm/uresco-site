import { html } from './html.mjs';
import { icon } from './icons.mjs';
import { openStatus } from './components.mjs';
import { SITE } from '../config.mjs';
import { LOCATIONS, tel } from '../data/locations.mjs';

// Form building blocks shared by the quote request and the credit application.
// site.js finds forms by [data-form] and handles validation, drafts, uploads and sending.
//
// Every control is a label, then a hint (when there is one), then the control, then its error line,
// in that order: the hint is read before typing and is never hidden by a phone keyboard.

const REQ = html`<span class="req" aria-hidden="true">Required</span>`;
const by = (...ids) => {
  const list = ids.filter(Boolean).join(' ');
  return list ? html` aria-describedby="${list}"` : '';
};
const hintFor = (id, hint) => (hint ? html`<span class="hint" id="${id}-hint">${hint}</span>` : '');

export const field = ({ id, label, type = 'text', required = false, full = false, hint, missing, attrs = '' }) => html`
  <div class="field${full ? ' field--full' : ''}">
    <label for="${id}">${label}${required ? REQ : ''}</label>
    ${hintFor(id, hint)}
    <input class="input" id="${id}" name="${id}" type="${type}"${required ? html` required` : ''}${by(hint && `${id}-hint`, required && `${id}-err`)}${missing ? html` data-missing="${missing}"` : ''}${attrs}>
    ${required ? html`<span class="err" id="${id}-err" hidden></span>` : ''}
  </div>`;

// On paper a drop-down cannot be opened, so `boxes` adds a row of tick boxes that only prints.
const printBoxes = (id, label, values, hint) => html`
  <div class="field field--full print-only">
    <span class="label">${label}${hint ? html` <span class="hint">${hint}</span>` : ''}</span>
    <div class="seg">${values.map(([v, text]) => html`<label><input type="checkbox" tabindex="-1" data-print-for="${id}" value="${v}">${text}</label>`)}</div>
  </div>`;

export const select = ({ id, label, options, full = false, hint, boxes = false }) => html`
  <div class="field${full ? ' field--full' : ''}${boxes ? ' no-print' : ''}">
    <label for="${id}">${label}</label>
    ${hintFor(id, hint)}
    <select id="${id}" name="${id}"${by(hint && `${id}-hint`)}>${options.map((o) => html`<option>${o}</option>`)}</select>
  </div>
  ${boxes ? printBoxes(id, label, options.map((o) => [o, o]), hint) : ''}`;

export const textarea = ({ id, label, hint, rows = 4, full = true }) => html`
  <div class="field${full ? ' field--full' : ''}">
    <label for="${id}">${label}</label>
    ${hintFor(id, hint)}
    <textarea id="${id}" name="${id}" rows="${rows}"${by(hint && `${id}-hint`)}></textarea>
  </div>`;

export const radios = (name, legend, opts) => html`
  <div class="field field--full" role="radiogroup" aria-labelledby="${name}-label">
    <span class="label" id="${name}-label">${legend}</span>
    <div class="seg${opts.some(([, ic]) => ic) ? ' seg--tiles' : ''}">
      ${opts.map(([value, ic], i) => html`<label><input type="radio" name="${name}" value="${value}"${i === 0 ? html` checked` : ''}>${ic ? icon(ic, { size: 22 }) : ''}<span>${value}</span></label>`)}
    </div>
  </div>`;

export const yardSelect = ({ label = 'Send to', hint = 'The yard nearest the job', boxes = false } = {}) => html`
  <div class="field field--full${boxes ? ' no-print' : ''}">
    <label for="yard">${label}</label>
    ${hintFor('yard', hint)}
    <select id="yard" name="yard"${by(hint && 'yard-hint')}>
      ${LOCATIONS.map((l) => html`<option value="${l.city}" data-id="${l.id}" data-email="${l.email}">${l.city}, ${l.state}</option>`)}
    </select>
  </div>
  ${boxes ? printBoxes('yard', label, LOCATIONS.map((l) => [l.city, l.city]), hint) : ''}`;

export const fileDrop = ({ id = 'files', name = 'files', label, hint, title = 'Drop files here or browse', titleTouch = 'Choose files or take a photo', note, accept }) => html`
  <div class="field field--full no-print">
    <span class="label" id="${id}-label">${label}</span>
    ${hintFor(id, hint)}
    <label class="drop" data-drop>
      <span class="drop__icon">${icon('upload', { size: 24 })}</span>
      <b class="drop__title"><span class="drop__fine">${title}</span><span class="drop__touch">${titleTouch}</span></b>
      ${note ? html`<small>${note}</small>` : ''}
      <input class="sr-only" type="file" name="${name}" multiple accept="${accept}" aria-labelledby="${id}-label"${by(hint && `${id}-hint`)}>
    </label>
    ${SITE.formEndpoint ? '' : html`<p class="fm-mailnote jsonly">Your email app does the sending, so you will attach these files to that email.</p>`}
    <ul class="files" data-files aria-live="polite"></ul>
    <p class="fm-files-lost" data-files-lost role="status" hidden></p>
    <p class="err" data-file-err hidden></p>
  </div>`;

export const formOpen = (kind, subject) => html`<form class="form" data-form="${kind}" data-subject="${subject}" data-endpoint="${SITE.formEndpoint}" data-email="${SITE.email}" action="${SITE.formEndpoint || 'mailto:' + SITE.email}" method="post" enctype="multipart/form-data" novalidate>`;

// The line at the top of a form that says drafts are kept, and lets someone clear one.
export const draftLine = (note) => html`
  <p class="fm-draft jsonly" data-draft>
    ${icon('check', { size: 16 })}
    <span data-draft-text>Saved on this device as you type.</span>
    ${note ? html`<span class="fm-draft__note">${note}</span>` : ''}
    <button type="button" class="fm-draft__clear" data-draft-clear hidden>Start over</button>
    <button type="button" class="fm-draft__clear" data-draft-undo aria-label="Undo start over" hidden>Undo</button>
  </p>`;

// Which yard will answer. One row per yard; the form script shows the chosen one.
export const whoAnswers = ({ label = 'Who answers', onDark = false } = {}) => html`
  <div class="fm-who jsonly">
    <p class="fm-lab">${label}</p>
    ${LOCATIONS.map((l, i) => html`<div class="fm-who__y" data-y="${l.id}"${i ? html` hidden` : ''}>
      <p class="fm-who__name"><b>${l.city}</b> ${openStatus(l)}</p>
      <a class="btn ${onDark ? 'btn--glass' : 'btn--dark'}" href="${tel(l.phone)}">${icon('phone', { size: 16 })}<span class="sr-only">Call ${l.city}: </span>${l.phone}</a>
    </div>`)}
  </div>`;

// The three yards as one-tap rows. Always beside a form, for people who would rather call.
export const yardLines = () => html`
  <ul class="fm-lines">
    ${LOCATIONS.map((l) => html`<li>
      <a class="fm-line" href="${tel(l.phone)}">
        <span class="fm-line__city">${l.city}, ${l.state} ${openStatus(l)}</span>
        <span class="fm-line__num"><span class="sr-only">Call ${l.city}: </span>${l.phone}</span>
      </a>
    </li>`)}
  </ul>`;

// Above the form on anything narrower than the side panel.
export const callStrip = (title) => html`
  <div class="fm-page__call fm-call">
    <h2 class="fm-call__title">${title}</h2>
    ${yardLines()}
  </div>`;

// `note` replaces the line under the button, for a form that needs to say more about how it travels.
export const formFoot = (label, note) => html`
  <div class="form__foot">
    <div class="fm-send">
      <div class="fm-send__to jsonly">
        <p class="fm-lab">Goes to</p>
        ${LOCATIONS.map((l, i) => html`<p class="fm-send__y" data-y="${l.id}"${i ? html` hidden` : ''}><b>${l.city}</b> ${openStatus(l)} <span class="fm-send__mail">${l.email}</span></p>`)}
      </div>
      <button class="btn btn--lg${SITE.formEndpoint ? '' : ' jsonly'}" type="submit">${label} ${icon('arrow', { size: 18 })}</button>
    </div>
    <p class="fm-send__left jsonly" data-left role="status"></p>
    <p class="fm-send__note jsonly">${note || (SITE.formEndpoint ? 'We’ll confirm by email.' : 'This opens your email app with everything filled in. Attach any files there before you send.')}</p>
    ${SITE.formEndpoint ? '' : html`<p class="fm-send__note nojs">This form needs JavaScript to send. Call the yard or email <a href="mailto:${SITE.email}">${SITE.email}</a> with your plans or list.</p>`}
  </div>
  <div class="notice notice--bad" data-failed hidden tabindex="-1" role="alert">
    <span class="notice__icon">${icon('close', { size: 22 })}</span>
    <div class="notice__body"><h2>That didn’t go through</h2><p>Please try again, or email <a href="mailto:${SITE.email}">${SITE.email}</a> or call the yard directly.</p></div>
  </div>`;

// `held` is the sentence shown when a form leaves something out of the email; `print` adds a Print a copy button.
export const doneNotice = ({ sent, almost, held, print = false }) => html`
  <div class="notice" data-done hidden tabindex="-1" role="status">
    <span class="notice__icon">${icon('check', { size: 22 })}</span>
    <div class="notice__body">
      <h2>${SITE.formEndpoint ? 'Sent' : 'Almost there'}</h2>
      ${SITE.formEndpoint ? html`<p>${sent}</p>` : html`
      <p data-mail-short>Your email app should have opened a message to <b data-mail-to>${SITE.email}</b> with ${almost} filled in. <span data-mail-note>Attach your files to that email, then send it.</span> If nothing opened, email us directly or call the yard.</p>
      <p data-mail-long hidden>This is too long to fill in by itself. Copy the details, open the email to <b data-mail-to>${SITE.email}</b>, paste them in and send it. <span data-mail-note>Attach your files to that email too.</span> Or call the yard.</p>
      ${held ? html`<p data-mail-held hidden>${held}</p>` : ''}
      <div class="notice__acts">
        <a class="btn" data-mail-again href="mailto:${SITE.email}">${icon('mail', { size: 18 })} <span data-again-label>Open the email again</span></a>
        <button type="button" class="btn btn--line" data-copy>${icon('file', { size: 18 })} <span data-copy-label>Copy it instead</span></button>
        ${print ? html`<button type="button" class="btn btn--line" data-print>${icon('file', { size: 18 })} Print a copy</button>` : ''}
        <button type="button" class="btn btn--line" data-back>Back to the form</button>
      </div>`}
      <div class="notice__yards">
        ${yardLines()}
      </div>
    </div>
  </div>`;
