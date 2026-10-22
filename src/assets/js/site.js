// Uresco site behaviour. No dependencies; everything degrades to plain links and forms.
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  /* Dialogs: [data-open="id"] opens, [data-close] or a backdrop click closes. */
  document.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-open]');
    if (opener) {
      const dlg = document.getElementById(opener.dataset.open);
      if (dlg && typeof dlg.showModal === 'function') {
        e.preventDefault();
        $$('dialog[open]').forEach((d) => d.close());
        dlg.showModal();
        opener.setAttribute('aria-expanded', 'true');
        dlg.addEventListener('close', () => opener.setAttribute('aria-expanded', 'false'), { once: true });
      }
      return;
    }
    if (e.target.closest('[data-close]')) { e.target.closest('dialog')?.close(); return; }
    if (e.target instanceof HTMLDialogElement) e.target.close();
  });
  // A link inside the drawer that points at this page would otherwise leave it open.
  $$('dialog a[href]').forEach((a) => a.addEventListener('click', () => a.closest('dialog').close()));

  /* Masthead: transparent over the home hero until the page scrolls. */
  const mast = $('[data-masthead]');
  if (mast) {
    const onScroll = () => mast.toggleAttribute('data-scrolled', window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* Projects filter */
  const filters = $('[data-filters]');
  if (filters) {
    filters.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-filter]');
      if (!b) return;
      const f = b.dataset.filter;
      $$('button', filters).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      $$('[data-sector]').forEach((card) => { card.hidden = f !== 'all' && card.dataset.sector !== f; });
    });
  }

  /* Quote form */
  const form = $('[data-quote]');
  if (!form) return;
  const input = $('input[type=file]', form);
  const drop = $('[data-drop]', form);
  const list = $('[data-files]', form);
  const done = $('[data-done]');
  const failed = $('[data-failed]');
  const MAX = 25 * 1024 * 1024;
  let bag = new DataTransfer();

  const size = (n) => (n > 1e6 ? (n / 1e6).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1e3)) + ' KB');
  const render = () => {
    list.innerHTML = '';
    Array.from(bag.files).forEach((f, i) => {
      const li = document.createElement('li');
      li.innerHTML = '<svg class="i" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/></svg>';
      const name = document.createElement('span'); name.textContent = f.name;
      const meta = document.createElement('small'); meta.textContent = size(f.size);
      const rm = document.createElement('button'); rm.type = 'button'; rm.textContent = 'Remove'; rm.setAttribute('aria-label', 'Remove ' + f.name);
      rm.addEventListener('click', () => {
        const next = new DataTransfer();
        Array.from(bag.files).forEach((g, j) => { if (j !== i) next.items.add(g); });
        bag = next; input.files = bag.files; render();
      });
      li.append(name, meta, rm);
      list.append(li);
    });
  };
  const add = (files) => {
    const tooBig = [];
    Array.from(files).forEach((f) => (f.size > MAX ? tooBig.push(f.name) : bag.items.add(f)));
    input.files = bag.files;
    render();
    const note = $('[data-file-err]', form);
    note.hidden = !tooBig.length;
    if (tooBig.length) note.textContent = `${tooBig.join(', ')} ${tooBig.length > 1 ? 'are' : 'is'} over 25 MB. Email large plan sets to the yard directly, or send a download link in the notes.`;
  };
  input.addEventListener('change', () => { const f = Array.from(input.files); bag = new DataTransfer(); add(f); });
  ['dragenter', 'dragover'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.add('is-over'); }));
  ['dragleave', 'drop'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.remove('is-over'); }));
  drop.addEventListener('drop', (e) => add(e.dataTransfer.files));

  const validate = () => {
    let first = null;
    $$('[required]', form).forEach((el) => {
      const err = document.getElementById(el.id + '-err');
      const bad = !el.checkValidity();
      el.setAttribute('aria-invalid', String(bad));
      if (err) { err.hidden = !bad; err.textContent = bad ? (el.validity.valueMissing ? 'Required.' : (el.type === 'email' ? 'Enter an email address like name@company.com.' : 'Check this field.')) : ''; }
      if (bad && !first) first = el;
    });
    if (first) first.focus();
    return !first;
  };
  $$('[required]', form).forEach((el) => el.addEventListener('blur', () => {
    if (el.getAttribute('aria-invalid') === 'true') validate();
  }));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const data = new FormData(form);
    const yard = $('select[name=yard]', form);
    const to = yard.selectedOptions[0]?.dataset.email || form.dataset.email;
    data.set('_to', to);
    const btn = $('button[type=submit]', form);
    const endpoint = form.dataset.endpoint;
    failed.hidden = true;

    if (endpoint) {
      btn.disabled = true; btn.dataset.label = btn.innerHTML; btn.textContent = 'Sending…';
      try {
        const r = await fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
        if (!r.ok) throw new Error(r.status);
        form.hidden = true; done.hidden = false; done.focus();
      } catch {
        failed.hidden = false; failed.focus();
      } finally {
        btn.disabled = false; if (btn.dataset.label) btn.innerHTML = btn.dataset.label;
      }
      return;
    }

    // No form service configured yet: hand the request to the visitor's email app.
    const lines = [
      ['Name', data.get('name')], ['Company', data.get('company')], ['Phone', data.get('phone')], ['Email', data.get('email')],
      ['I am a', data.get('role')], ['Project location', data.get('location')], ['Delivery', data.get('delivery')],
      ['Needed by', data.get('needed')], ['Nearest yard', yard.selectedOptions[0]?.textContent],
      ['', ''], ['Materials / scope', data.get('materials')], ['', ''], ['Notes', data.get('notes')],
    ].filter(([, v]) => v !== null && v !== undefined);
    const names = Array.from(bag.files).map((f) => f.name);
    if (names.length) lines.push(['', ''], ['Plans to attach', names.join(', ')]);
    const body = lines.map(([k, v]) => (k ? `${k}: ${v || '—'}` : '')).join('\n');
    const subject = `Quote request — ${data.get('company') || data.get('name')} — ${data.get('location')}`;
    window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const mailNote = $('[data-mail-note]');
    if (mailNote) mailNote.hidden = !names.length;
    $('[data-mail-to]').textContent = to;
    form.hidden = true; done.hidden = false; done.focus();
  });
})();
