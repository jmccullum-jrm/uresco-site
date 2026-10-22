import { html } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';
import { layout } from '../lib/layout.mjs';
import { stamp } from '../lib/components.mjs';
import { LOCATIONS, tel } from '../data/locations.mjs';
import { SITE } from '../config.mjs';

const field = ({ id, label, type = 'text', required = false, full = false, hint, attrs = '' }) => html`
  <div class="field${full ? ' field--full' : ''}">
    <label for="${id}">${label}${required ? html`<span class="req" aria-hidden="true">*</span>` : ''}${hint ? html` <span class="hint">${hint}</span>` : ''}</label>
    <input class="input" id="${id}" name="${id}" type="${type}"${required ? html` required aria-describedby="${id}-err"` : ''}${attrs}>
    ${required ? html`<span class="err" id="${id}-err" hidden></span>` : ''}
  </div>`;

const radios = (name, legend, opts) => html`
  <div class="field field--full" role="radiogroup" aria-labelledby="${name}-label">
    <span class="label" id="${name}-label">${legend}</span>
    <div class="seg">
      ${opts.map(([value, ic], i) => html`<label><input type="radio" name="${name}" value="${value}"${i === 0 ? html` checked` : ''}>${icon(ic, { size: 18 })}${value}</label>`)}
    </div>
  </div>`;

export default {
  path: 'quote/',
  render: (ctx) => layout(ctx, {
    title: 'Request a Quote',
    description: 'Send plans or a materials list to Uresco Construction Materials for a take-off and quote, with delivery to your job site or anywhere in Alaska.',
    body: html`
<section class="phero" style="min-height:auto">
  <div class="phero__media" style="background:var(--ink)"></div>
  <div class="wrap phero__inner" style="padding-block:clamp(3.5rem,3rem + 3vw,6rem) clamp(2.5rem,2rem + 2vw,4rem)">
    <nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="${ctx.u('')}">Home</a></li><li><span aria-current="page">Request a quote</span></li></ol></nav>
    ${stamp('Estimates & take-offs', { dark: true })}
    <h1 class="display">Request <em>a quote.</em></h1>
    <p class="phero__lede">Tell us about the job and attach plans or a list. The yard you choose will get back to you with a take-off and pricing.</p>
  </div>
</section>
<section class="section">
  <div class="wrap qlayout">
    <div>
      <form class="form" data-quote data-endpoint="${SITE.formEndpoint}" data-email="${SITE.email}" action="${SITE.formEndpoint || 'mailto:' + SITE.email}" method="post" enctype="multipart/form-data" novalidate>
        <fieldset class="fieldset">
          <legend><span>01</span>About you</legend>
          ${field({ id: 'name', label: 'Name', required: true, attrs: html` autocomplete="name"` })}
          ${field({ id: 'company', label: 'Company', attrs: html` autocomplete="organization"` })}
          ${field({ id: 'phone', label: 'Phone', type: 'tel', required: true, attrs: html` autocomplete="tel" inputmode="tel"` })}
          ${field({ id: 'email', label: 'Email', type: 'email', required: true, attrs: html` autocomplete="email" inputmode="email"` })}
          <div class="field field--full">
            <label for="role">I am a</label>
            <select id="role" name="role">
              ${['Contractor / builder', 'Owner-builder', 'Architect or engineer', 'Agency, tribe or institution', 'Other'].map((r) => html`<option>${r}</option>`)}
            </select>
          </div>
        </fieldset>

        <fieldset class="fieldset">
          <legend><span>02</span>The job</legend>
          ${field({ id: 'location', label: 'Project location', required: true, hint: 'City or community, state', attrs: html` placeholder="e.g. Bethel, AK"` })}
          ${field({ id: 'needed', label: 'Needed by', type: 'date' })}
          ${radios('delivery', 'Delivery', [['Job-site delivery', 'truck'], ['Remote Alaska shipping', 'ship'], ['Export', 'route'], ['Pick up at the yard', 'pin']])}
          <div class="field field--full">
            <label for="yard">Send to <span class="hint">the yard nearest the job</span></label>
            <select id="yard" name="yard">
              ${LOCATIONS.map((l) => html`<option value="${l.city}" data-email="${l.email}">${l.city}, ${l.state} — ${l.email}</option>`)}
            </select>
          </div>
        </fieldset>

        <fieldset class="fieldset" id="plans">
          <legend><span>03</span>Plans & materials</legend>
          <div class="field field--full">
            <span class="label" id="files-label">Plans, lists or photos <span class="hint">PDF, DWG, images or spreadsheets, up to 25 MB each</span></span>
            <label class="drop" data-drop>
              <span class="drop__icon">${icon('upload', { size: 26 })}</span>
              <b>Drop files here or browse</b>
              <small>Drawings get the most accurate take-off.</small>
              <input class="sr-only" type="file" name="plans" multiple accept=".pdf,.dwg,.dxf,.jpg,.jpeg,.png,.heic,.xls,.xlsx,.csv,.doc,.docx" aria-labelledby="files-label">
            </label>
            <ul class="files" data-files aria-live="polite"></ul>
            <p class="err" data-file-err hidden></p>
          </div>
          <div class="field field--full">
            <label for="materials">Materials or scope <span class="hint">a list, quantities, or a description of the build</span></label>
            <textarea id="materials" name="materials" rows="6"></textarea>
          </div>
          <div class="field field--full">
            <label for="notes">Anything else?</label>
            <textarea id="notes" name="notes" rows="3" style="min-height:100px"></textarea>
          </div>
        </fieldset>

        <div class="form__foot">
          <button class="btn" type="submit">Send request ${icon('arrow', { size: 18 })}</button>
          <p>${SITE.formEndpoint ? 'We’ll confirm by email.' : 'This opens your email app with the request filled in. Attach your plans there before you send.'}</p>
        </div>
        <div class="notice" data-failed hidden tabindex="-1" role="alert">
          ${icon('close', { size: 24 })}
          <div><h2>That didn’t go through</h2><p>Please try again, or email <a href="mailto:${SITE.email}">${SITE.email}</a> or call the yard directly.</p></div>
        </div>
      </form>

      <div class="notice" data-done hidden tabindex="-1" role="status">
        ${icon('check', { size: 24 })}
        <div>
          <h2>${SITE.formEndpoint ? 'Request sent' : 'Almost there'}</h2>
          <p>${SITE.formEndpoint
            ? 'Thanks — the yard has your request and will be in touch.'
            : html`Your email app should have opened a message to <b data-mail-to>${SITE.email}</b> with your request filled in. <span data-mail-note>Attach your plans to that email, then send it.</span> If nothing opened, email us directly or call the yard.`}</p>
        </div>
      </div>
    </div>

    <aside class="aside">
      ${stamp('What happens next', { dark: true })}
      <h2>From plans to price</h2>
      <ol class="steps" style="margin-top:1.25rem">
        <li><b>We review your plans</b><span>The yard you chose builds the take-off.</span></li>
        <li><b>We quote it</b><span>Materials, and delivery or freight to your site.</span></li>
        <li><b>You order</b><span>We schedule delivery, or package and ship it.</span></li>
      </ol>
      <p style="margin-top:1.5rem">Rather talk it through?</p>
      <ul>
        ${LOCATIONS.map((l) => html`<li><a href="${tel(l.phone)}"><span>${l.city}</span><span>${l.phone}</span></a></li>`)}
      </ul>
    </aside>
  </div>
</section>
`,
  }),
};
