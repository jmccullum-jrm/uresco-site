import { html } from './html.mjs';
import { icon } from './icons.mjs';
import { SITE } from '../config.mjs';
import { LOCATIONS } from '../data/locations.mjs';

// Form building blocks shared by the quote request and the credit application.
// site.js finds forms by [data-form] and handles validation, drafts, uploads and sending.

export const field = ({ id, label, type = 'text', required = false, full = false, hint, attrs = '' }) => html`
  <div class="field${full ? ' field--full' : ''}">
    <label for="${id}">${label}${required ? html`<span class="req" aria-hidden="true">*</span>` : ''}${hint ? html` <span class="hint">${hint}</span>` : ''}</label>
    <input class="input" id="${id}" name="${id}" type="${type}"${required ? html` required aria-describedby="${id}-err"` : ''}${attrs}>
    ${required ? html`<span class="err" id="${id}-err" hidden></span>` : ''}
  </div>`;

export const select = ({ id, label, options, full = false, hint }) => html`
  <div class="field${full ? ' field--full' : ''}">
    <label for="${id}">${label}${hint ? html` <span class="hint">${hint}</span>` : ''}</label>
    <select id="${id}" name="${id}">${options.map((o) => html`<option>${o}</option>`)}</select>
  </div>`;

export const textarea = ({ id, label, hint, rows = 4, full = true }) => html`
  <div class="field${full ? ' field--full' : ''}">
    <label for="${id}">${label}${hint ? html` <span class="hint">${hint}</span>` : ''}</label>
    <textarea id="${id}" name="${id}" rows="${rows}"></textarea>
  </div>`;

export const radios = (name, legend, opts) => html`
  <div class="field field--full" role="radiogroup" aria-labelledby="${name}-label">
    <span class="label" id="${name}-label">${legend}</span>
    <div class="seg">
      ${opts.map(([value, ic], i) => html`<label><input type="radio" name="${name}" value="${value}"${i === 0 ? html` checked` : ''}>${ic ? icon(ic, { size: 18 }) : ''}${value}</label>`)}
    </div>
  </div>`;

export const yardSelect = ({ label = 'Send to', hint = 'the yard nearest the job' } = {}) => html`
  <div class="field field--full">
    <label for="yard">${label} <span class="hint">${hint}</span></label>
    <select id="yard" name="yard">
      ${LOCATIONS.map((l) => html`<option value="${l.city}" data-email="${l.email}">${l.city}, ${l.state} — ${l.email}</option>`)}
    </select>
  </div>`;

export const fileDrop = ({ id = 'files', name = 'files', label, hint, title = 'Drop files here or browse', note, accept }) => html`
  <div class="field field--full">
    <span class="label" id="${id}-label">${label}${hint ? html` <span class="hint">${hint}</span>` : ''}</span>
    <label class="drop" data-drop>
      <span class="drop__icon">${icon('upload', { size: 26 })}</span>
      <b>${title}</b>
      ${note ? html`<small>${note}</small>` : ''}
      <input class="sr-only" type="file" name="${name}" multiple accept="${accept}" aria-labelledby="${id}-label">
    </label>
    <ul class="files" data-files aria-live="polite"></ul>
    <p class="err" data-file-err hidden></p>
  </div>`;

export const formOpen = (kind, subject) => html`<form class="form" data-form="${kind}" data-subject="${subject}" data-endpoint="${SITE.formEndpoint}" data-email="${SITE.email}" action="${SITE.formEndpoint || 'mailto:' + SITE.email}" method="post" enctype="multipart/form-data" novalidate>`;

export const formFoot = (label) => html`
  <div class="form__foot">
    <button class="btn" type="submit">${label} ${icon('arrow', { size: 18 })}</button>
    <p>${SITE.formEndpoint ? 'We’ll confirm by email.' : 'This opens your email app with everything filled in. Attach any files there before you send.'}</p>
  </div>
  <div class="notice" data-failed hidden tabindex="-1" role="alert">
    ${icon('close', { size: 24 })}
    <div><h2>That didn’t go through</h2><p>Please try again, or email <a href="mailto:${SITE.email}">${SITE.email}</a> or call the yard directly.</p></div>
  </div>`;

export const doneNotice = ({ sent, almost }) => html`
  <div class="notice" data-done hidden tabindex="-1" role="status">
    ${icon('check', { size: 24 })}
    <div>
      <h2>${SITE.formEndpoint ? 'Sent' : 'Almost there'}</h2>
      <p>${SITE.formEndpoint ? sent : html`Your email app should have opened a message to <b data-mail-to>${SITE.email}</b> with ${almost} filled in. <span data-mail-note>Attach your files to that email, then send it.</span> If nothing opened, email us directly or call the yard.`}</p>
    </div>
  </div>`;
