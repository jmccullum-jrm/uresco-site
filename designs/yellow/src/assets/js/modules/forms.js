// The form pages' live parts: who answers, what is on the ticket, which part you are on.
// The HTML already names the default yard and lists every part, so nothing is lost without this.
(() => {
  const form = document.querySelector('form[data-form]');
  if (!form) return;
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const set = (name, value) => $$(`[data-goes="${name}"]`).forEach((el) => { el.textContent = value; });

  /* Who answers follows the yard select: the tag, the row, the line under the select, the button. */
  const yard = form.elements.yard;
  const said = document.querySelector('[data-goes-said]');
  const paintYard = (announce) => {
    const o = yard.selectedOptions[0];
    if (!o) return;
    set('city', o.value); set('role', o.dataset.role); set('email', o.dataset.email); set('phone', o.dataset.phone);
    $$('[data-goes-tel]').forEach((a) => { a.href = o.dataset.tel; });
    $$('[data-goes-mail]').forEach((a) => { a.href = 'mailto:' + o.dataset.email; });
    $$('[data-goes-row]').forEach((a) => a.classList.toggle('is-goes', a.dataset.goesRow === o.value));
    if (announce) {
      if (said) said.textContent = `This goes to the ${o.value} yard.`;
      $$('.fm-tag__city').forEach((el) => { el.classList.remove('is-new'); void el.offsetWidth; el.classList.add('is-new'); });
    }
  };
  if (yard) { paintYard(false); yard.addEventListener('change', () => paintYard(true)); }

  /* The lines on the tag repeat what has been typed. */
  const live = (k, v) => { const el = document.querySelector(`[data-live="${k}"]`); if (el) el.textContent = v; };
  const where = form.elements.location;
  const syncLines = () => {
    if (where) live('location', where.value.trim() || 'Not filled in yet');
    const d = form.querySelector('input[name=delivery]:checked');
    if (d) live('delivery', d.value);
  };
  syncLines();
  form.addEventListener('input', syncLines);
  form.addEventListener('change', syncLines);
  const files = form.querySelector('[data-files]');
  if (files && document.querySelector('[data-live="files"]')) {
    new MutationObserver(() => { const n = files.children.length; live('files', n ? `${n} attached` : 'None yet'); }).observe(files, { childList: true });
  }

  /* Typing one of the Alaska page's places says how freight generally reaches it. */
  const wayNote = form.querySelector('[data-way-note]');
  const placesEl = form.querySelector('[data-places]');
  if (wayNote && placesEl && where) {
    let known = {};
    try { known = JSON.parse(placesEl.textContent); } catch { /* the note simply never shows */ }
    const fold = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[’'.]/g, '').toLowerCase().trim();
    const paintWay = () => {
      const p = known[fold(where.value.split(',')[0])];
      wayNote.hidden = !p;
      if (p) wayNote.textContent = `${p[0]}: ${p[1]}. Typical for the region, not a schedule or a price.`;
    };
    paintWay();
    where.addEventListener('input', paintWay);
  }

  /* The sticker over the headline says what the link that brought you here was about. */
  const carried = document.querySelector('[data-carried]');
  if (carried) {
    const q = new URLSearchParams(location.search);
    const lines = (q.get('product') || '').split(/:?\n/).map((s) => s.trim()).filter(Boolean);
    const text = lines.length ? lines[0] + (lines.length > 1 ? ` +${lines.length - 1} more` : '')
      : q.get('location') ? `Job in ${q.get('location')}` : yard && q.get('yard') ? `For the ${yard.value} yard` : q.get('delivery') || '';
    if (text) carried.textContent = text;
  }

  /* The list of parts beside a long form: ticked when its required fields are done, marked while on screen. */
  const steps = $$('[data-step]');
  if (steps.length) {
    const part = (a) => document.getElementById(a.dataset.step);
    const tick = () => steps.forEach((a) => {
      const req = $$('[required]', part(a));
      a.classList.toggle('is-done', req.length > 0 && req.every((el) => el.checkValidity()));
    });
    tick();
    form.addEventListener('input', tick);
    form.addEventListener('change', tick);
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => entries.forEach((e) => {
        if (!e.isIntersecting) return;
        steps.forEach((a) => { if (part(a) === e.target) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current'); });
      }), { rootMargin: '-25% 0px -65% 0px' });
      steps.forEach((a) => io.observe(part(a)));
    }
  }
})();
