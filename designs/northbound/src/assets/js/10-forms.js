// The forms: the quote request and the credit application share one handler
// (validation, drafts kept in the browser, file list, hand-off to a form service or to email).
(() => {
  /* Forms: the quote request and the credit application share this. */
  $$('form[data-form]').forEach((form) => {
    const kind = form.dataset.form;
    const host = form.parentElement;
    const done = $('[data-done]', host);
    const failed = $('[data-failed]', host);
    const DRAFT = 'uresco.draft.' + kind;
    const MAX = 25 * 1024 * 1024;
    let bag = new DataTransfer();

    // Drafts: a request half-typed on a job site survives a dropped signal or a closed tab.
    const fields = () => $$('input, select, textarea', form).filter((el) => el.name && el.type !== 'file' && el.type !== 'hidden');
    // Tax IDs, bank details and signatures are never left behind on a shared computer.
    const PRIVATE = /^(ein|bank|bank_contact|signature|signed|agree)$/;
    const save = () => {
      const d = {};
      fields().filter((el) => !PRIVATE.test(el.name)).forEach((el) => {
        if (el.type === 'radio') { if (el.checked) d[el.name] = el.value; } else if (el.type === 'checkbox') d[el.name] = el.checked; else d[el.name] = el.value;
      });
      try { localStorage.setItem(DRAFT, JSON.stringify(d)); } catch { /* private mode */ }
    };
    let restored = false;
    try {
      const d = JSON.parse(localStorage.getItem(DRAFT) || 'null');
      if (d) fields().forEach((el) => {
        if (!(el.name in d)) return;
        if (el.type === 'radio') el.checked = d[el.name] === el.value; else if (el.type === 'checkbox') el.checked = !!d[el.name]; else { el.value = d[el.name]; if (el.tagName !== 'SELECT' && d[el.name]) restored = true; }
      });
    } catch { /* ignore */ }
    form.addEventListener('input', save);
    form.addEventListener('change', save);

    // Arriving from a product page: start the materials list with that line.
    const query = new URLSearchParams(location.search);
    const product = query.get('product');
    const materials = $('textarea[name=materials]', form);
    if (product && materials && !materials.value) materials.value = product + ':\n';
    const yardParam = query.get('yard');
    const yardSel = $('select[name=yard]', form);
    if (yardParam && yardSel) $$('option', yardSel).forEach((o) => { if (o.value.toLowerCase() === yardParam.toLowerCase()) yardSel.value = o.value; });
    // A link that names a place fills the job location. The delivery choice stays with the visitor.
    const place = query.get('location');
    const job = $('input[name=location]', form);
    if (place && job && !job.value) job.value = place;

    // The manifest beside the form: each row reads as an instruction until the form fills it in.
    // Also the line under the yard select that says who will answer, and the mark on that yard's number.
    const named = (n) => form.elements.namedItem(n);
    const val = (n) => (named(n)?.value || '').trim();
    const needName = (el) => el.dataset.need || el.dataset.label || form.querySelector(`label[for="${el.id}"]`)?.childNodes[0]?.textContent.trim() || el.name;
    const slips = $$('[data-slip]');
    let painted = false;
    const setSlot = (slot, text) => slips.forEach((s) => {
      const dd = $(`[data-slot="${slot}"]`, s);
      if (!dd) return;
      if (dd.dataset.blank === undefined) dd.dataset.blank = dd.textContent;
      const next = text || dd.dataset.blank;
      if (dd.textContent !== next) {
        dd.textContent = next;
        if (painted) { dd.classList.remove('is-new'); void dd.offsetWidth; dd.classList.add('is-new'); }
      }
      dd.classList.toggle('is-set', !!text);
    });
    const paint = () => {
      setSlot('from', [val('name'), val('company')].filter(Boolean).join(', '));
      const count = bag.files.length;
      const first = (val('materials').split('\n')[0] || '').replace(/:$/, '').trim();
      setSlot('send', [count ? (count === 1 ? bag.files[0].name : `${count} files`) : '', first].filter(Boolean).join(' · '));
      if (yardSel) {
        const opt = yardSel.selectedOptions[0];
        setSlot('to', opt ? `The ${yardSel.value} yard` : '');
        $$('[data-yard-note]', form).forEach((n) => { n.hidden = n.dataset.yardNote !== yardSel.value; });
        $$('[data-yard-row]').forEach((n) => n.classList.toggle('is-on', n.dataset.yardRow === yardSel.value));
      }
      const how = val('delivery');
      if (how) {
        const where = val('location');
        const when = val('needed') ? new Date(val('needed') + 'T12:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
        const line = how === 'Pick up at the yard' ? `Pick up at the ${yardSel?.value} yard` : where ? `${how} to ${where}` : how;
        setSlot('ships', when ? `${line}, by ${when}` : line);
      }
      const missing = $$('[required]', form).filter((el) => !el.checkValidity()).map(needName);
      $$('[data-need]').forEach((n) => {
        n.classList.toggle('is-ready', !missing.length);
        n.textContent = !missing.length ? 'Ready to send.' : missing.length > 4 ? `${missing.length} required fields to go.` : 'Still needed: ' + missing.join(', ') + '.';
      });
      painted = true;
    };
    form.addEventListener('input', paint);
    form.addEventListener('change', paint);

    // The draft note: what is kept, and a way to throw it away.
    const draftText = $('[data-draft-text]', form);
    const draftClear = $('[data-draft-clear]', form);
    if (draftText) draftText.dataset.text = draftText.textContent;
    if (draftText && restored) { draftText.textContent = 'Your draft from last time is filled in.'; draftClear.hidden = false; }
    form.addEventListener('input', () => { if (draftClear) draftClear.hidden = false; });

    // File drop zone, if the form has one.
    const input = $('input[type=file]', form);
    const drop = $('[data-drop]', form);
    const list = $('[data-files]', form);
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
      paint();
    };
    const add = (files) => {
      const tooBig = [];
      Array.from(files).forEach((f) => (f.size > MAX ? tooBig.push(f.name) : bag.items.add(f)));
      input.files = bag.files;
      render();
      const note = $('[data-file-err]', form);
      note.hidden = !tooBig.length;
      if (tooBig.length) note.textContent = `${tooBig.join(', ')} ${tooBig.length > 1 ? 'are' : 'is'} over 25 MB. Email large files to the yard directly, or send a download link in the notes.`;
    };
    if (input && drop) {
      input.addEventListener('change', () => { const f = Array.from(input.files); bag = new DataTransfer(); add(f); });
      ['dragenter', 'dragover'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.add('is-over'); }));
      ['dragleave', 'drop'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.remove('is-over'); }));
      drop.addEventListener('drop', (e) => add(e.dataTransfer.files));
    }

    draftClear?.addEventListener('click', () => {
      try { localStorage.removeItem(DRAFT); } catch { /* ignore */ }
      form.reset();
      bag = new DataTransfer();
      if (input) input.files = bag.files;
      render();
      $$('[aria-invalid]', form).forEach((el) => el.removeAttribute('aria-invalid'));
      $$('.err', form).forEach((el) => { el.hidden = true; });
      draftClear.hidden = true;
      if (draftText) draftText.textContent = draftText.dataset.text;
      paint();
      form.querySelector('input:not([type=file]), select, textarea')?.focus();
    });
    paint();

    // Paper: a choice left at its default prints blank, so it can be ticked by hand.
    window.addEventListener('beforeprint', () => {
      $$('.seg label', form).forEach((l) => { const r = $('input', l); l.classList.toggle('is-marked', r.checked && !r.defaultChecked); });
      $$('[data-paper-for]', form).forEach((o) => { const s = named(o.dataset.paperFor); o.classList.toggle('is-marked', !!s && s.selectedIndex > 0 && s.value === o.dataset.value); });
      $$('[data-paper-copy]', form).forEach((o) => { o.textContent = val(o.dataset.paperCopy); });
    });

    // Marks one field and returns whether it passes.
    const check = (el) => {
      const err = document.getElementById(el.id + '-err');
      const bad = !el.checkValidity();
      el.setAttribute('aria-invalid', String(bad));
      if (err) {
        err.hidden = !bad;
        err.textContent = !bad ? '' : el.type === 'checkbox' ? el.dataset.msg || 'Please confirm to continue.' : el.validity.valueMissing ? el.dataset.msg || 'Required.' : el.type === 'email' ? 'Enter an email address like name@company.com.' : 'Check this field.';
      }
      return !bad;
    };
    // On submit: mark everything, then take the visitor to the first problem.
    const validate = () => {
      const bad = $$('[required]', form).filter((el) => !check(el));
      if (bad.length) bad[0].focus();
      return !bad.length;
    };
    // Once a field has been flagged, re-check just that field as it is corrected.
    $$('[required]', form).forEach((el) => ['blur', 'change', 'input'].forEach((t) => el.addEventListener(t, () => {
      if (el.getAttribute('aria-invalid') === 'true') check(el);
    })));

    // Plain-text summary of everything filled in, labelled as on screen, for the email fallback.
    const summary = () => {
      const out = [];
      $$('fieldset', form).forEach((fs) => {
        const legend = fs.querySelector('legend')?.textContent.replace(/^\d+/, '').trim();
        const rows = [];
        fields().filter((el) => fs.contains(el)).forEach((el) => {
          if (el.type === 'radio' && !el.checked) return;
          if (el.type === 'checkbox' && el.closest('.seg')) { if (el.checked) rows.push(['', '• ' + el.value]); return; }
          const label = el.dataset.label || (el.type === 'radio' ? $('#' + el.name + '-label', form) : form.querySelector(`label[for="${el.id}"]`))?.childNodes[0]?.textContent.trim() || el.name;
          const v = el.type === 'checkbox' ? (el.checked ? 'Yes' : 'No') : el.tagName === 'SELECT' ? el.selectedOptions[0]?.textContent : el.value.trim();
          if (v) rows.push([label, v]);
        });
        if (rows.length) out.push('', `— ${legend.toUpperCase()} —`, ...rows.map(([k, v]) => (k ? `${k}: ${v}` : v)));
      });
      const names = Array.from(bag.files).map((f) => f.name);
      if (names.length) out.push('', 'FILES TO ATTACH: ' + names.join(', '));
      return { text: out.join('\n').trim(), files: names };
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validate()) return;
      const yard = $('select[name=yard]', form);
      const to = yard?.selectedOptions[0]?.dataset.email || form.dataset.email;
      const data = new FormData(form);
      data.set('_to', to);
      data.set('_subject', form.dataset.subject + ' — ' + (data.get('company') || data.get('name') || ''));
      const btn = $('button[type=submit]', form);
      const endpoint = form.dataset.endpoint;
      if (failed) failed.hidden = true;

      const finish = () => {
        try { localStorage.removeItem(DRAFT); } catch { /* ignore */ }
        form.hidden = true; done.hidden = false; done.focus();
        window.scrollTo({ top: done.getBoundingClientRect().top + window.scrollY - 120 });
      };

      if (endpoint) {
        btn.disabled = true; btn.dataset.label = btn.innerHTML; btn.textContent = 'Sending…';
        try {
          const r = await fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
          if (!r.ok) throw new Error(r.status);
          finish();
        } catch {
          failed.hidden = false; failed.focus();
        } finally {
          btn.disabled = false; if (btn.dataset.label) btn.innerHTML = btn.dataset.label;
        }
        return;
      }

      // No form service configured yet: hand the request to the visitor's email app.
      const { text, files } = summary();
      const subject = `${form.dataset.subject} — ${data.get('company') || data.get('name')}${data.get('location') ? ' — ' + data.get('location') : ''}`;
      const mail = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
      window.location.href = mail;
      const note = $('[data-mail-note]', done);
      if (note) note.hidden = !files.length;
      $('[data-mail-to]', done).textContent = to;
      const again = $('[data-mail-link]', done);
      if (again) again.href = mail;
      const copy = $('[data-copy]', done);
      if (copy) {
        const label = copy.textContent;
        const full = `To: ${to}\nSubject: ${subject}\n\n${text}`;
        copy.addEventListener('click', async () => {
          try { await navigator.clipboard.writeText(full); copy.textContent = 'Copied'; } catch { copy.textContent = 'Copy failed. Email us instead.'; }
          setTimeout(() => { copy.textContent = label; }, 2400);
        });
      }
      finish();
    });
  });
})();
