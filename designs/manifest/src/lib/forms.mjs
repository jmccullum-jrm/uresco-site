import { html } from './html.mjs';
import { icon } from './icons.mjs';
import { SITE } from '../config.mjs';
import { LOCATIONS, tel } from '../data/locations.mjs';
import { openStatus, YARD_FOR } from './components.mjs';

// Form building blocks shared by the quote request and the credit application.
// 10-forms.js finds forms by [data-form] and handles validation, drafts, uploads, routing and sending.
//
// The form is a printed form: one ruled sheet of cells, each with its lettering on top and the entry under it,
// the way a title block is laid out. The same cells print on Letter paper as the credit application (90-print.css).
// A cell spans the whole sheet (`full`), or `w: 'half' | 'third' | 'wide'`. `m2` keeps it two-up on a phone.

const span = ({ full, w, m2 }) => (full || w === 'full' ? ' fm-cell--full' : ` fm-cell--${w || 'half'}`) + (m2 ? ' fm-cell--m2' : '');
const REQ = html`<span class="fm-req" aria-hidden="true"><span>Required</span></span>`;

// `held`: a tax ID or bank detail. With no form service the markup gives it no name, so a browser with the script off cannot
// write it into the email; the script names it again and leaves it out of the email itself.
export const field = ({ id, label, type = 'text', required = false, full = false, w, m2 = false, hint, screenHint = false, msg, attrs = '', held = false }) => html`
  <div class="fm-cell${span({ full, w, m2 })}${required ? ' fm-cell--req' : ''}">
    <label class="fm-label" for="${id}">${label}${required ? REQ : ''}${hint ? html` <span class="fm-hint${screenHint ? ' fm-screen' : ''}">${hint}</span>` : ''}</label>
    <input class="fm-input" id="${id}"${held && !SITE.formEndpoint ? html` data-held` : html` name="${id}"`} type="${type}"${required ? html` required aria-describedby="${id}-err"` : ''}${msg ? html` data-msg="${msg}"` : ''}${attrs}>
    ${required ? html`<span class="fm-err" id="${id}-err" hidden></span>` : ''}
  </div>`;

// `paper: true` also prints the options as tick boxes, because a drop-down means nothing on paper.
// `placeholder` starts the list on an empty choice, so an untouched default is never sent as an answer.
export const select = ({ id, label, options, full = false, w, m2 = false, hint, paper = false, placeholder }) => html`
  <div class="fm-cell${span({ full, w, m2 })}">
    <label class="fm-label" for="${id}">${label}${hint ? html` <span class="fm-hint">${hint}</span>` : ''}</label>
    <select class="fm-select" id="${id}" name="${id}">${placeholder ? html`<option value="">${placeholder}</option>` : ''}${options.map((o) => html`<option>${o}</option>`)}</select>
    ${paper ? html`<div class="fm-paper fm-paperopts" data-paper-for="${id}">${options.map((o) => html`<label><input type="checkbox" value="${o}" tabindex="-1"><span class="fm-opt__box"></span>${o}</label>`)}</div>` : ''}
  </div>`;

export const textarea = ({ id, label, hint, rows = 4, full = true, w }) => html`
  <div class="fm-cell${span({ full, w })}">
    <label class="fm-label" for="${id}">${label}${hint ? html` <span class="fm-hint">${hint}</span>` : ''}</label>
    <textarea class="fm-text" id="${id}" name="${id}" rows="${rows}"></textarea>
  </div>`;

export const radios = (name, legend, opts, { full = true, w } = {}) => html`
  <div class="fm-cell${span({ full, w })}" role="radiogroup" aria-labelledby="${name}-label">
    <span class="fm-label" id="${name}-label">${legend}</span>
    <div class="fm-seg fm-seg--${opts.length}">
      ${opts.map(([value, ic], i) => html`<label class="fm-opt"><input type="radio" name="${name}" value="${value}"${i === 0 ? html` checked` : ''}><span class="fm-opt__box"></span>${ic ? icon(ic, { size: 20 }) : ''}<span class="fm-opt__t">${value}</span></label>`)}
    </div>
  </div>`;

// Which yard will answer. All three are in the markup and the script shows the one chosen; each keeps its own live lamp.
const yardRoute = ({ lead, cls = '' }) => html`
  <div class="fm-route ${cls}" data-route>
    <p class="label fm-route__lead">${lead}</p>
    ${LOCATIONS.map((l, i) => html`<div class="fm-route__yard" data-route-yard="${l.city}"${i ? html` hidden` : ''}>
      <p class="fm-route__city">${l.city}<span>, ${l.state}</span></p>
      <span class="fm-route__lamp">${openStatus(l)}</span>
      <a class="fm-route__tel num" href="${tel(l.phone)}">${l.phone}</a>
      <a class="fm-route__mail" href="mailto:${l.email}">${l.email}</a>
    </div>`)}
  </div>`;

const GUIDE = [['Puget Sound', 'Kent'], ['Southcentral Alaska or a remote site', 'Anchorage'], ['The Interior and points north', 'Fairbanks']];

export const yardSelect = ({ label = 'Send to', hint = 'the yard nearest the job', lead = 'Answered by', guide = true } = {}) => html`
  <div class="fm-cell fm-cell--full fm-cell--yard">
    <label class="fm-label" for="yard">${label} <span class="fm-hint">${hint}</span></label>
    <select class="fm-select" id="yard" name="yard" data-paper>
      ${LOCATIONS.map((l) => html`<option value="${l.city}" data-email="${l.email}">${l.city}, ${l.state}</option>`)}
    </select>
    <div class="fm-paper fm-paperopts" data-paper-for="yard">${LOCATIONS.map((l) => html`<label><input type="checkbox" value="${l.city}" tabindex="-1"><span class="fm-opt__box"></span>${l.city}, ${l.state}</label>`)}</div>
    ${yardRoute({ lead, cls: 'fm-route--cell' })}
    ${guide ? html`<div class="fm-guide"><p class="label">Which yard?</p><ul>${GUIDE.map(([from, to]) => html`<li><span>${from}</span><b>${to}</b></li>`)}</ul><p class="fm-guide__any">Any yard can help. They work as one team.</p></div>` : ''}
  </div>`;

export const fileDrop = ({ id = 'files', name = 'files', label, hint, title = 'Drop files here or browse', tapTitle = 'Tap to add files', note, accept }) => html`
  <div class="fm-cell fm-cell--full fm-cell--drop">
    <span class="fm-label" id="${id}-label">${label}${hint ? html` <span class="fm-hint">${hint}</span>` : ''}</span>
    <label class="fm-drop" data-drop>
      <span class="fm-drop__icon">${icon('upload', { size: 22 })}</span>
      <span class="fm-drop__text">
        <b><span class="fm-drop__mouse">${title}</span><span class="fm-drop__touch">${tapTitle}</span></b>
        ${note ? html`<small>${note}</small>` : ''}
        ${SITE.formEndpoint ? '' : html`<small>Files do not send from this page. You add them to the email on the next step.</small>`}
      </span>
      <input class="sr-only" type="file" name="${name}" multiple accept="${accept}" aria-labelledby="${id}-label">
    </label>
    <ul class="fm-files" data-files aria-live="polite"></ul>
    <p class="fm-err fm-err--file" data-file-err hidden></p>
  </div>`;

// One lettered section of the sheet: a bar with a detail bubble, then its cells.
// The script writes what is left to fill in into [data-left]; the side index shows the same.
export const group = ({ id, letter, title, cls = '' }, body) => html`
  <fieldset class="fm-set ${cls}" id="${id}" data-reveal>
    <legend class="fm-legend"><span class="bub num">${letter}</span>${title}</legend>
    <p class="fm-left" data-left="${id}"></p>
    <div class="fm-grid">${body}</div>
  </fieldset>`;

// Without the script the browser checks the required fields and writes the email; plain text keeps that email readable.
// The script adds novalidate and does both better.
const formOpen = (kind, subject) => html`<form class="fm-sheet" data-form="${kind}" data-subject="${subject}" data-endpoint="${SITE.formEndpoint}" data-email="${SITE.email}" action="${SITE.formEndpoint || 'mailto:' + SITE.email}" method="post" enctype="${SITE.formEndpoint ? 'multipart/form-data' : 'text/plain'}">`;

const formFoot = (label, { lead = 'Answered by', held = false } = {}) => html`
  <div class="fm-foot">
    <div class="fm-foot__info">
      ${yardRoute({ lead, cls: 'fm-route--foot' })}
      <p class="fm-foot__left js-only" data-left-all></p>
    </div>
    <div class="fm-foot__act">
      <button class="btn fm-send" type="submit">${label} ${icon('arrow', { size: 18 })}</button>
      <p class="fm-foot__note js-only">${SITE.formEndpoint ? 'We’ll confirm by email.' : html`This opens your email app with your answers filled in. Attach any files there before you send.${held ? ' Tax ID and bank details are left out of the email.' : ''}`}</p>
      ${SITE.formEndpoint ? '' : html`<noscript><p class="fm-foot__note">This opens an email to ${SITE.email}, whichever yard you chose above.${held ? ' Tax ID and bank details are left out of it: give those to your yard by phone or fax, or use the paper copy.' : ''} Rather call? ${LOCATIONS.map((l, i) => html`${i ? ' · ' : ''}${l.city} <a href="${tel(l.phone)}">${l.phone}</a>`)}</p></noscript>`}
    </div>
  </div>
  <div class="fm-notice fm-notice--bad" data-failed hidden tabindex="-1" role="alert">
    <span class="fm-notice__mark" aria-hidden="true">${icon('close', { size: 22 })}</span>
    <div class="fm-notice__body"><h2 class="fm-notice__t">That didn’t go through</h2><p>Please try again, or email <a href="mailto:${SITE.email}">${SITE.email}</a> or call the yard directly.</p></div>
  </div>`;

// Success, and the handoff to the visitor's email app. Webmail users often get no email app at all, so the
// finished request is kept on the page to open again or copy.
// A tick only when something has really been sent: handing over to an email app proves nothing.
const doneNotice = ({ sent, almost }, { printable = false, held = false } = {}) => html`
  <div class="fm-notice fm-notice--done${SITE.formEndpoint ? ' fm-notice--sent' : ''}" data-done hidden tabindex="-1" role="status">
    <span class="fm-notice__mark" aria-hidden="true">${icon(SITE.formEndpoint ? 'check' : 'file', { size: 22 })}</span>
    <div class="fm-notice__body">
      <h2 class="fm-notice__t">${SITE.formEndpoint ? 'Sent' : 'Almost there'}</h2>
      <p>${SITE.formEndpoint ? sent : html`Your email app should have opened a message to <b data-mail-to>${SITE.email}</b> with ${almost} filled in. <span data-mail-note>Attach your files to that email, then send it.</span> If nothing opened, email us directly or call the yard.`}</p>
      ${held && !SITE.formEndpoint ? html`<p class="fm-notice__held" data-held-note hidden>Tax ID and bank details are not in that email. Give these to your yard by phone or fax, or use the paper copy.</p>` : ''}
      <div class="fm-notice__acts">
        ${SITE.formEndpoint ? '' : html`<a class="btn" href="#" data-mail-again>Open the email again ${icon('arrow', { size: 18 })}</a>
        <button type="button" class="btn btn--line" data-copy>Copy the text</button>`}
        ${printable ? html`<button type="button" class="btn btn--line" data-print>Print this application</button>` : ''}
        <button type="button" class="btn btn--line" data-back>Back to the form</button>
      </div>
      ${SITE.formEndpoint ? '' : html`
      <details class="fm-notice__text"><summary>See what you are sending</summary><pre data-mail-text></pre></details>`}
    </div>
  </div>`;

// The three numbers, for people who would rather call. `fm-calls--top` shows above the sheet when there is no room beside it.
const yardCalls = ({ cls = '', title = 'Rather call?' } = {}) => html`
  <div class="fm-calls ${cls}">
    <p class="label fm-calls__t">${title}</p>
    <ul class="fm-calls__list">
      ${LOCATIONS.map((l) => html`<li><a class="fm-call" href="${tel(l.phone)}">
        <span class="fm-call__yard">${l.city}</span>
        <span class="fm-call__for">${YARD_FOR[l.id]}</span>
        <span class="fm-call__lamp">${openStatus(l)}</span>
        <span class="fm-call__num num">${l.phone}</span>
        <span class="fm-call__go" aria-hidden="true">${icon('phone', { size: 18 })}</span>
      </a></li>`)}
    </ul>
  </div>`;

// The whole form area: the sheet on the left, its title block beside it, the way a drawing is laid out.
export const sheetLayout = ({ kind, subject, name, lead, steps, paper = '', head, privacy = '', body, send, done, cls = '' }) => html`
  <div class="fm-layout ${cls}">
    <div class="fm-main">
      ${yardCalls({ cls: 'fm-calls--top' })}
      ${formOpen(kind, subject)}
        ${paper}
        <div class="fm-sheet__head">
          <p class="fm-sheet__title">${head}</p>
          <p class="fm-sheet__save js-only"><span data-draft-state>Saves on this device as you type</span> <button type="button" class="fm-clear" data-clear hidden>Clear form</button></p>
          ${privacy ? html`<p class="fm-sheet__private js-only">${privacy}</p>` : ''}
          <p class="fm-sheet__replaced js-only" data-link-note role="status" hidden></p>
        </div>
        ${body}
        ${formFoot(send, { lead, held: kind === 'credit' })}
      </form>
      ${doneNotice(done, { printable: !!paper, held: kind === 'credit' })}
    </div>
    <div class="fm-side">
      <div class="tblock fm-side__block">
        <p class="tblock__firm"><b>Uresco Construction Materials, Inc.</b><span>Kent · Anchorage · Fairbanks</span></p>
        <p class="tblock__title"><span>Title</span><b>${name}</b></p>
      </div>
      ${yardRoute({ lead, cls: 'fm-route--side' })}
      <nav class="fm-steps" aria-label="Sections of this form"><ol>
        ${steps.map(([id, letter, title]) => html`<li><a href="#${id}"><span class="bub bub--sm num">${letter}</span><span class="fm-steps__t">${title}</span><span class="fm-left fm-left--side" data-left="${id}"></span></a></li>`)}
      </ol></nav>
      ${yardCalls({ cls: 'fm-calls--side' })}
    </div>
  </div>`;
