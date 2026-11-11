// Uresco site behaviour, part 2: the quote request and the credit application.
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  /* Forms: the quote request and the credit application share this. */
  $$('form[data-form]').forEach((form) => {
    const kind = form.dataset.form;
    const host = form.parentElement;
    const area = form.closest('.fm-layout') || document;
    const done = $('[data-done]', host);
    const failed = $('[data-failed]', host);
    const DRAFT = 'uresco.draft.' + kind;
    const MAX = 25 * 1024 * 1024;
    let bag = new DataTransfer();
    let lost = [];   // files named in a saved draft: a browser cannot keep the files themselves
    form.noValidate = true;   // this script checks the form; without it the browser does
    $$('input[data-held]', form).forEach((el) => { el.name = el.id; });   // named only while this script is here to keep them out of the email

    // The label a person sees for a field, for the email summary and the "still needed" line.
    const labelOf = (el) => el.dataset.label || (el.type === 'radio' ? $('#' + el.name + '-label', form) : form.querySelector(`label[for="${el.id}"]`))?.childNodes[0]?.textContent.trim() || el.name;

    // Drafts: a request half-typed on a job site survives a dropped signal or a closed tab.
    const fields = () => $$('input, select, textarea', form).filter((el) => el.name && el.type !== 'file' && el.type !== 'hidden');
    // Tax IDs, bank details and signatures are never left behind on a shared computer.
    const PRIVATE = /^(ein|bank|bank_contact|signature|signed|agree)$/;
    // An ordinary email is no place for a tax ID or bank details, so these stay out of the text it is handed.
    const NOT_EMAILED = /^(ein|bank|bank_contact)$/;
    const typed = () => fields().filter((el) => el.tagName !== 'SELECT' && el.type !== 'radio' && el.type !== 'checkbox');

    // The yard statement: every [data-route] shows the yard currently chosen.
    const yardSel = $('select[name=yard]', form);
    const showYard = () => {
      if (!yardSel) return;
      $$('[data-route-yard]', area).forEach((el) => { el.hidden = el.dataset.routeYard !== yardSel.value; });
    };

    // What is left to fill in: per section (bar and side index) and in one line above the send button.
    const leftAll = $('[data-left-all]', form);
    // A reply needs somewhere to go: a phone number with its area code, an email address with a real domain.
    const ruleFor = (el) => {
      const v = el.value.trim();
      if (!v) return '';
      if (el.type === 'tel' && v.replace(/\D/g, '').length < 10) return 'Enter the phone number with its area code.';
      if (el.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s.]{2,}$/.test(v)) return 'Enter an email address like name@company.com.';
      return '';
    };
    const applyRule = (el) => { if (el.required && (el.type === 'tel' || el.type === 'email')) el.setCustomValidity(ruleFor(el)); };
    const progress = () => {
      const missing = [];
      $$('fieldset', form).forEach((fs) => {
        const req = $$('[required]', fs);
        const left = req.filter((el) => !el.validity.valid);
        missing.push(...left);
        const word = !req.length ? 'Optional' : left.length ? `${left.length} to fill` : 'Done';
        $$(`[data-left="${fs.id}"]`, area).forEach((el) => {
          el.textContent = word;
          el.classList.toggle('is-open', left.length > 0);
          el.classList.toggle('is-done', req.length > 0 && !left.length);
        });
      });
      if (leftAll) {
        leftAll.textContent = missing.length ? `Still needed: ${missing.map(labelOf).join(', ')}.` : 'Everything required is filled in.';
        leftAll.classList.toggle('is-clear', !missing.length);
      }
    };

    // A form that has been typed into prints with its answers; a blank one prints as empty tick boxes.
    const paperCopy = () => {
      const filled = typed().some((el) => el.value.trim());
      form.classList.toggle('is-filled', filled);
      $$('[data-paper-for]', form).forEach((row) => {
        const sel = form.elements[row.dataset.paperFor];
        $$('input', row).forEach((box) => { box.checked = filled && !!sel && box.value === sel.value; });
      });
    };

    const clearBtn = $('[data-clear]', form);
    const draftState = $('[data-draft-state]', form);
    const hasFiles = !!$('input[type=file]', form);
    const showDraft = (has) => {
      if (clearBtn) clearBtn.hidden = !has;
      if (draftState) draftState.textContent = !has ? 'Saves on this device as you type' : hasFiles ? 'Typing saved on this device. Files are not.' : 'Draft saved on this device';
    };

    const save = () => {
      const d = {};
      fields().filter((el) => !PRIVATE.test(el.name)).forEach((el) => {
        if (el.type === 'radio') { if (el.checked) d[el.name] = el.value; } else if (el.type === 'checkbox') d[el.name] = el.checked; else d[el.name] = el.value;
      });
      const names = [...Array.from(bag.files).map((f) => f.name), ...lost];
      if (names.length) d.__files = names;
      try { localStorage.setItem(DRAFT, JSON.stringify(d)); } catch { /* private mode */ }
    };
    const refresh = () => { fields().forEach(applyRule); showYard(); progress(); paperCopy(); };
    let hadDraft = false;
    try {
      const d = JSON.parse(localStorage.getItem(DRAFT) || 'null');
      if (d) {
        hadDraft = true;
        fields().forEach((el) => {
          if (!(el.name in d)) return;
          if (el.type === 'radio') el.checked = d[el.name] === el.value; else if (el.type === 'checkbox') el.checked = !!d[el.name]; else el.value = d[el.name];
          if (el.tagName === 'SELECT' && el.selectedIndex < 0) el.selectedIndex = 0;   // a saved choice the list no longer offers
        });
        if (Array.isArray(d.__files)) lost = d.__files;
      }
    } catch { /* ignore */ }
    showDraft(hadDraft);
    form.addEventListener('input', () => { save(); refresh(); showDraft(true); });
    form.addEventListener('change', () => { save(); refresh(); showDraft(true); });

    // Arriving by a link: what the visitor just clicked beats an old draft, and says so.
    const params = new URLSearchParams(location.search);
    const replaced = [];
    // Arriving from a product page: add that line to the materials list.
    const product = params.get('product');
    const materials = $('textarea[name=materials]', form);
    if (product && materials && !materials.value.includes(product)) materials.value = (materials.value.trim() ? materials.value.trimEnd() + '\n' : '') + product + ':\n';
    // Arriving from a place on the map or a page about a region: start the job location with it.
    const place = params.get('location');
    const jobPlace = $('input[name=location]', form);
    if (place && jobPlace) {
      const next = place.slice(0, 120);
      if (jobPlace.value.trim() && jobPlace.value !== next) replaced.push(`location, ${jobPlace.value.trim()}`);
      jobPlace.value = next;
    }
    const yardParam = (params.get('yard') || '').toLowerCase();
    if (yardParam && yardSel) $$('option', yardSel).forEach((o) => {
      if (o.value.toLowerCase() !== yardParam) return;
      if (hadDraft && yardSel.value !== o.value) replaced.push(`yard, ${yardSel.value}`);
      yardSel.value = o.value;
    });
    // Arriving from a place off the road system: start Delivery on the matching choice.
    const how = (params.get('delivery') || '').toLowerCase();
    if (how) $$('input[type=radio][name=delivery]', form).forEach((r) => { if (r.value.toLowerCase() === how) r.checked = true; });
    if (replaced.length) {
      const note = $('[data-link-note]', form);
      if (note) { note.textContent = `Replaced your saved ${replaced.join(' and ')}.`; note.hidden = false; }
    }
    // The link has done its work: without this a reload would overrule what the person has since chosen.
    if (['product', 'location', 'yard', 'delivery'].some((k) => params.has(k))) {
      save();
      showDraft(true);
      history.replaceState(null, '', location.pathname + location.hash);
    }
    refresh();

    // File drop zone, if the form has one.
    const input = $('input[type=file]', form);
    const drop = $('[data-drop]', form);
    const list = $('[data-files]', form);
    const size = (n) => (n > 1e6 ? (n / 1e6).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1e3)) + ' KB');
    const render = () => {
      list.innerHTML = '';
      Array.from(bag.files).forEach((f, i) => {
        const li = document.createElement('li');
        const name = document.createElement('span'); name.textContent = f.name;
        const meta = document.createElement('small'); meta.textContent = size(f.size);
        const rm = document.createElement('button'); rm.type = 'button'; rm.textContent = 'Remove'; rm.setAttribute('aria-label', 'Remove ' + f.name);
        rm.addEventListener('click', () => {
          const next = new DataTransfer();
          Array.from(bag.files).forEach((g, j) => { if (j !== i) next.items.add(g); });
          bag = next; input.files = bag.files; render(); save();
        });
        li.append(name, meta, rm);
        list.append(li);
      });
    };
    const fileNote = $('[data-file-err]', form);
    const showLost = () => {
      if (!fileNote) return;
      fileNote.hidden = !lost.length;
      fileNote.textContent = lost.length ? `${lost.join(', ')} ${lost.length > 1 ? 'were' : 'was'} not kept. Add ${lost.length > 1 ? 'them' : 'it'} again.` : '';
    };
    const add = (files) => {
      const tooBig = [];
      Array.from(files).forEach((f) => (f.size > MAX ? tooBig.push(f.name) : bag.items.add(f)));
      input.files = bag.files;
      render();
      const have = Array.from(bag.files).map((f) => f.name);
      lost = lost.filter((n) => !have.includes(n));
      showLost();
      if (tooBig.length) { fileNote.hidden = false; fileNote.textContent = `${tooBig.join(', ')} ${tooBig.length > 1 ? 'are' : 'is'} over 25 MB. Email large files to the yard directly, or send a download link in the notes.`; }
      save();
    };
    if (input && drop) {
      input.addEventListener('change', () => { const f = Array.from(input.files); bag = new DataTransfer(); add(f); });
      ['dragenter', 'dragover'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.add('is-over'); }));
      ['dragleave', 'drop'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.remove('is-over'); }));
      drop.addEventListener('drop', (e) => add(e.dataTransfer.files));
      showLost();
    }

    // Marks one field and returns whether it passes.
    const check = (el) => {
      applyRule(el);
      const err = document.getElementById(el.id + '-err');
      const bad = !el.checkValidity();
      el.setAttribute('aria-invalid', String(bad));
      if (err) {
        err.hidden = !bad;
        err.textContent = !bad ? '' : el.type === 'checkbox' ? 'Please confirm to continue.' : el.validity.valueMissing ? (el.dataset.msg || 'Required.') : el.validity.customError ? el.validationMessage : el.type === 'email' ? 'Enter an email address like name@company.com.' : 'Check this field.';
      }
      return !bad;
    };
    // On submit: mark everything, then take the visitor to the first problem.
    const validate = () => {
      const bad = $$('[required]', form).filter((el) => !check(el));
      form.classList.toggle('was-checked', bad.length > 0);
      if (bad.length) bad[0].focus();
      return !bad.length;
    };
    // Once a field has been flagged, re-check just that field as it is corrected.
    $$('[required]', form).forEach((el) => ['blur', 'change', 'input'].forEach((t) => el.addEventListener(t, () => {
      if (el.getAttribute('aria-invalid') === 'true') check(el);
    })));

    // Start over. A draft on a shared computer is the next person's problem otherwise.
    if (clearBtn) clearBtn.addEventListener('click', () => {
      if (!window.confirm('Clear everything in this form?')) return;
      try { localStorage.removeItem(DRAFT); } catch { /* ignore */ }
      form.reset();
      bag = new DataTransfer();
      lost = [];
      if (input) input.files = bag.files;
      if (list) render();
      if (fileNote) { fileNote.hidden = true; fileNote.textContent = ''; }
      $$('[aria-invalid]', form).forEach((el) => el.removeAttribute('aria-invalid'));
      $$('.fm-err', form).forEach((el) => { el.hidden = true; el.textContent = ''; });
      form.classList.remove('was-checked');
      showDraft(false);
      refresh();
    });

    // Plain-text summary of everything filled in, labelled as on screen, for the email fallback.
    const summary = () => {
      const out = [];
      $$('fieldset', form).forEach((fs) => {
        const legend = fs.querySelector('legend')?.lastChild?.textContent.trim() || '';
        const rows = [];
        fields().filter((el) => fs.contains(el) && !NOT_EMAILED.test(el.name)).forEach((el) => {
          if (el.type === 'radio' && !el.checked) return;
          const v = el.type === 'checkbox' ? (el.checked ? 'Yes' : 'No') : el.tagName === 'SELECT' ? (el.value ? el.selectedOptions[0]?.textContent : '') : el.value.trim();
          if (v) rows.push([labelOf(el), v]);
        });
        if (rows.length) out.push('', `— ${legend.toUpperCase()} —`, ...rows.map(([k, v]) => `${k}: ${v}`));
      });
      const names = Array.from(bag.files).map((f) => f.name);
      if (names.length) out.push('', 'FILES TO ATTACH: ' + names.join(', '));
      const held = fields().some((el) => NOT_EMAILED.test(el.name));
      if (held) out.push('', 'Tax ID and bank details: give these to your yard by phone or fax, or use the paper copy.');
      return { text: out.join('\n').trim(), files: names, held };
    };

    const copyBtn = $('[data-copy]', host);
    if (copyBtn) copyBtn.addEventListener('click', async () => {
      const box = $('[data-mail-text]', host);
      try {
        await navigator.clipboard.writeText(box.textContent);
        copyBtn.textContent = 'Copied';
      } catch {
        box.closest('details').open = true;
        window.getSelection()?.selectAllChildren(box);
        copyBtn.textContent = 'Selected: press copy';
      }
    });

    // The form stays in the page after it is handed over, hidden on screen only, so it can still be printed or changed.
    const backBtn = $('[data-back]', host);
    if (backBtn) backBtn.addEventListener('click', () => {
      form.classList.remove('is-sent');
      done.hidden = true;
      form.tabIndex = -1;
      form.focus();
      form.scrollIntoView({ block: 'start', behavior: 'instant' });
    });

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

      // Only a form service can say a thing was sent. Handing over to an email app proves nothing, so the draft stays.
      const finish = (sent) => {
        if (sent) try { localStorage.removeItem(DRAFT); } catch { /* ignore */ }
        form.classList.add('is-sent'); done.hidden = false; done.focus();
        window.scrollTo({ top: done.getBoundingClientRect().top + window.scrollY - 120, behavior: 'instant' });
      };

      if (endpoint) {
        btn.disabled = true; btn.dataset.label = btn.innerHTML; btn.textContent = 'Sending…';
        try {
          const r = await fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
          if (!r.ok) throw new Error(r.status);
          finish(true);
        } catch {
          failed.hidden = false; failed.focus();
        } finally {
          btn.disabled = false; if (btn.dataset.label) btn.innerHTML = btn.dataset.label;
        }
        return;
      }

      // No form service configured yet: hand the request to the visitor's email app.
      const { text, files, held } = summary();
      const subject = `${form.dataset.subject} — ${data.get('company') || data.get('name')}${data.get('location') ? ' — ' + data.get('location') : ''}`;
      const href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
      window.location.href = href;
      const note = $('[data-mail-note]', done);
      if (note) note.hidden = !files.length;
      const heldNote = $('[data-held-note]', done);
      if (heldNote) heldNote.hidden = !held;
      $('[data-mail-to]', done).textContent = to;
      const again = $('[data-mail-again]', done);
      if (again) again.href = href;
      const box = $('[data-mail-text]', done);
      if (box) box.textContent = text;
      finish(false);
    });
  });
})();
