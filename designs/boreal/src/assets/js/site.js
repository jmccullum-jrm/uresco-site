// Forms: the quote request and the credit application.
// (This file keeps the name of the old single script; dialogs, the masthead and the hours
// status now live in 10-chrome.js and 20-hours.js.)
(() => {
  const { $, $$, calm } = UCM;
  const query = new URLSearchParams(location.search);
  const fold = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’'.]/g, '').toLowerCase().trim();
  const put = (k, v) => $$(`[data-s="${k}"]`).forEach((el) => { if (el.textContent !== v) el.textContent = v; });

  // Same curve as arcPath() in components.mjs, so a route looks the same here as on the home map.
  const arcPath = ([x1, y1], [x2, y2]) => {
    const dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy) || 1;
    const lift = Math.min(90, d * 0.22);
    const nx = -dy / d, ny = dx / d, s = ny > 0 ? -1 : 1;
    const cx = (x1 + x2) / 2 + nx * lift * s, cy = (y1 + y2) / 2 + ny * lift * s;
    return `M${x1.toFixed(1)},${y1.toFixed(1)}Q${cx.toFixed(1)},${cy.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`;
  };

  /* Forms: the quote request and the credit application share this. */
  $$('form[data-form]').forEach((form) => {
    const kind = form.dataset.form;
    const host = form.parentElement;
    const done = $('[data-done]', host);
    const failed = $('[data-failed]', host);
    const DRAFT = 'uresco.draft.' + kind;
    const MAX = 25 * 1024 * 1024;
    let bag = new DataTransfer();

    const yardSel = $('select[name=yard]', form);
    // A yard's id lives on its <option>; the option's value stays the name people read.
    const yardId = () => yardSel?.selectedOptions[0]?.dataset.id || '';
    const yardOf = (id) => (yardSel ? $$('option', yardSel).find((o) => o.dataset.id === id) : null);
    const yardName = (id) => yardOf(id)?.value || '';
    const placeField = $('input[name=location]', form);
    const materials = $('textarea[name=materials]', form);
    // Once a yard or a delivery has been picked (by hand or by the link that brought them here) the form never changes it.
    let yardPicked = false, deliveryPicked = false;
    const carried = $('[data-carried]');

    const draftText = $('[data-draft-text]', form);
    const draftClear = $('[data-draft-clear]', form);
    const draftUndo = $('[data-draft-undo]', form);
    const draftSays = (t) => { if (draftText) draftText.textContent = t + (lost.length ? ' Your files need attaching again.' : ''); if (draftClear) draftClear.hidden = false; };
    // Names of files a restored draft had attached. A file itself cannot be kept in a draft, so the visitor is told.
    let lost = [];

    // Drafts: a request half-typed on a job site survives a dropped signal or a closed tab.
    const fields = () => $$('input, select, textarea', form).filter((el) => el.name && el.type !== 'file' && el.type !== 'hidden');
    const typed = () => fields().some((el) => el.matches('input:not([type=radio],[type=checkbox]), textarea') && el.value.trim());
    // Tax IDs, bank details and signatures are never left behind on a shared computer.
    const PRIVATE = /^(ein|bank|bank_contact|signature|signed|agree)$/;
    // Ordinary email is not private: without a form service these stay out of the message and go by phone or on paper.
    const HELD = /^(ein|bank|bank_contact)$/;
    const save = () => {
      const d = {};
      fields().filter((el) => !PRIVATE.test(el.name)).forEach((el) => {
        if (el.type === 'radio') { if (el.checked) d[el.name] = el.value; } else if (el.type === 'checkbox') d[el.name] = el.checked; else d[el.name] = el.value;
      });
      if (yardPicked) d._yard = true;
      if (deliveryPicked) d._delivery = true;
      if (location.search) d._q = location.search;
      const names = [...Array.from(bag.files).map((f) => f.name), ...lost];
      if (names.length) d._files = names;
      try { localStorage.setItem(DRAFT, JSON.stringify(d)); if (typed()) draftSays('Draft saved on this device.'); } catch { /* private mode */ }
    };
    // The link's values go in once. A draft saved under the same link already holds them, plus anything changed since.
    let linkApplied = false;
    try {
      // sessionStorage holds the copy kept after the hand-off to email (see finish).
      const d = JSON.parse(localStorage.getItem(DRAFT) || sessionStorage.getItem(DRAFT) || 'null');
      if (d) {
        fields().forEach((el) => {
          if (!(el.name in d)) return;
          if (el.type === 'radio') el.checked = d[el.name] === el.value; else if (el.type === 'checkbox') el.checked = !!d[el.name]; else el.value = d[el.name];
        });
        yardPicked = !!d._yard;
        deliveryPicked = !!d._delivery;
        lost = Array.isArray(d._files) ? d._files : [];
        linkApplied = !!location.search && d._q === location.search;
        if (typed()) draftSays('Draft picked up from this device.');
      }
    } catch { /* ignore */ }
    form.addEventListener('input', save);
    form.addEventListener('change', save);

    // What the visitor was looking at when they followed the link here.
    const prefill = () => {
      // Arriving from a product page: add that line, or each picked line, to the materials list.
      const product = query.get('product');
      if (product && materials) {
        const have = materials.value;
        const fresh = product.split('\n').map((l) => l.trim()).filter((l) => l && !have.includes(l)).map((l) => l + ':');
        if (fresh.length) materials.value = (have.trim() ? have.trimEnd() + '\n' : '') + fresh.join('\n') + '\n';
      }
      const yardParam = (query.get('yard') || '').toLowerCase();
      if (yardOf(yardParam)) { yardSel.value = yardOf(yardParam).value; yardPicked = true; }
      // Arriving from the finder: the place is already known.
      const placeParam = query.get('location');
      if (placeParam && placeField) placeField.value = placeParam.slice(0, 80);
    };
    if (!linkApplied) prefill();

    /* ---- The side panel: answers the place, names the yard, keeps count ---- */
    const yardHint = $('#yard-hint', form);
    const yardHintDefault = yardHint ? yardHint.textContent : '';
    const geo = (() => { try { return JSON.parse($('[data-form-places]').textContent); } catch { return null; } })();
    const index = new Map();
    if (geo) {
      const places = geo.places.map(([name, st, x, y, region, access, yard]) => ({ name, st, xy: [x, y], region, access, yard }));
      places.forEach((p) => index.set(fold(p.name), p));
      Object.entries(geo.aliases).forEach(([alias, name]) => index.set(fold(alias), places.find((p) => p.name === name)));
    }
    const lookup = (v) => index.get(fold(v.split(',')[0]).replace(/\s+(ak|alaska|wa|washington)$/, '')) || null;

    const slipMap = $('[data-slip-map]');
    const arc = slipMap && $('[data-arc]', slipMap);
    const dest = slipMap && $('[data-map-dest]', slipMap);
    let drawn = '';
    // Names on the map are ordinary text laid over the drawing, placed from the map's own scale.
    const labels = { yard: null, dest: null };
    const placeLabels = () => {
      if (!slipMap) return;
      const m = slipMap.getScreenCTM();
      const box = slipMap.getBoundingClientRect();
      Object.entries(labels).forEach(([k, l]) => {
        const el = $(`[data-map-tag="${k}"]`, slipMap.parentElement);
        el.hidden = !l || !m;
        if (!l || !m) return;
        el.textContent = l.text;
        const x = m.a * l.xy[0] + m.e - box.left, y = m.d * l.xy[1] + m.f - box.top;
        el.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px) translate(${l.west ? 'calc(-100% - 11px)' : '11px'}, -50%)`;
      });
    };
    if (slipMap && 'ResizeObserver' in window) new ResizeObserver(placeLabels).observe(slipMap);
    const paintMap = (p, yard) => {
      if (!slipMap) return;
      $$('[data-map-yard]', slipMap).forEach((g) => g.classList.toggle('is-on', g.dataset.mapYard === yard));
      const home = $(`[data-map-yard="${yard}"]`, slipMap);
      labels.yard = home && { text: yardName(yard), xy: geo.yards[yard], west: home.dataset.side === 'w' };
      const d = p && geo.yards[yard] ? arcPath(geo.yards[yard], p.xy) : '';
      labels.dest = d ? { text: p.name, xy: p.xy, west: p.xy[0] < geo.yards[yard][0] } : null;
      placeLabels();
      if (!d) {
        dest.setAttribute('visibility', 'hidden'); arc.setAttribute('visibility', 'hidden');
        drawn = ''; return;
      }
      dest.setAttribute('visibility', 'visible');
      dest.setAttribute('transform', `translate(${p.xy[0]} ${p.xy[1]})`);
      arc.setAttribute('visibility', 'visible');
      if (d === drawn) return;
      drawn = d;
      arc.setAttribute('d', d);
      if (!calm.matches) { arc.classList.remove('is-drawing'); arc.getBoundingClientRect(); arc.classList.add('is-drawing'); }
    };

    const paintPlace = () => {
      if (!geo || !placeField) return;
      const text = placeField.value.trim();
      const p = text ? lookup(text) : null;
      if (p && !yardPicked && yardId() !== p.yard && yardOf(p.yard)) yardSel.value = yardOf(p.yard).value;
      // A known place off the road system starts on remote shipping; anywhere else on job-site delivery.
      if (p && !deliveryPicked) {
        const want = p.access === 'coastal' || p.access === 'seasonal' ? 'Remote Alaska shipping' : 'Job-site delivery';
        $$('input[name=delivery]', form).forEach((r) => { r.checked = r.value === want; });
      }
      if (yardHint) yardHint.textContent = p && !yardPicked ? `Picked for ${p.name}. Change it if you work with another yard.` : yardHintDefault;
      const yard = yardId();
      const acc = p && geo.access[p.access];
      // Say what the link carried over (product, place, yard) on the first screen.
      if (carried) {
        const what = [query.get('product')?.replace(/\n+/g, '; '), query.get('location') && text].filter(Boolean).join(' · ');
        const from = (query.get('yard') || (query.get('location') && text)) && yardName(yard) ? `${yardName(yard)} yard` : '';
        carried.hidden = !(what || from);
        carried.textContent = what ? `Quote for ${what}${from ? ' · ' + from : ''}` : `Quote for the ${from}`;
      }
      put('place', p ? `${p.name}, ${geo.states[p.st]}` : text || 'Where is the job?');
      put('meta', p ? `${p.region} · ${acc.tag}` : text ? 'Not on our short list, which does not mean we cannot get there. We will work out the freight with you.' : 'Add the project location and this fills in.');
      $$('[data-s-modes]').forEach((el) => el.classList.toggle('is-empty', !acc));
      $$('[data-ic]').forEach((el) => { const [i, k] = el.dataset.ic.split('-'); el.hidden = !(acc && acc.modes[i]?.[0] === k); });
      [0, 1].forEach((i) => put('m' + i, acc && acc.modes[i] ? acc.modes[i][1].replace('{yard}', yardName(yard)) : ''));
      paintMap(p, yard);
    };

    const live = $('[data-live]', form);
    let lastYard = '';
    const paintYard = () => {
      if (!yardSel) return;
      const id = yardId();
      $$('[data-y]').forEach((el) => { el.hidden = el.dataset.y !== id; });
      if (live && lastYard && lastYard !== id) live.textContent = `${yardSel.value} will answer this.`;
      lastYard = id;
    };

    const stateOf = (el) => (el.type === 'checkbox' ? el.checked : el.value.trim() !== '');
    const leftLine = $('[data-left]', form);
    const paintProgress = () => {
      $$('[data-step]', form).forEach((fs) => {
        const need = $$('[required]', fs);
        const left = need.filter((el) => !el.validity.valid).length;
        const some = fields().some((el) => fs.contains(el) && el.type !== 'radio' && el.tagName !== 'SELECT' && stateOf(el)) || Array.from(bag.files).length > 0 && fs.contains(input);
        const text = need.length ? (left ? `${left} required` : 'Complete') : (some ? 'Added' : 'Optional');
        $$(`[data-step-state="${fs.id}"]`).forEach((el) => {
          el.textContent = text;
          el.classList.toggle('is-done', need.length ? !left : some);
        });
      });
      if (leftLine) {
        const left = $$('[required]', form).filter((el) => !el.validity.valid).length;
        const text = left ? `${left} required ${left === 1 ? 'field' : 'fields'} still to fill in.` : 'Everything required is filled in.';
        if (!leftLine.dataset.hold && leftLine.textContent !== text) leftLine.textContent = text;
        leftLine.classList.toggle('is-ready', !left);
      }
    };

    const paintDetails = () => {
      const when = $('input[name=needed]', form)?.value;
      put('needed', when ? new Date(when + 'T12:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No date yet');
      const delivery = $('input[name=delivery]:checked', form);
      if (delivery) put('delivery', delivery.value);
      const files = Array.from(bag.files);
      // The row reads the materials box, so it can never disagree with it.
      const listed = materials ? materials.value.split('\n').map((l) => l.trim()).filter(Boolean) : [];
      put('attached', files.length ? (files.length === 1 ? files[0].name : `${files.length} files attached`) : listed.length ? listed[0].replace(/:$/, '') + (listed.length > 1 ? ' and more' : '') : 'Nothing attached yet');
    };

    const paint = () => { paintPlace(); paintYard(); paintProgress(); paintDetails(); };
    // On the select itself, so it runs before the form's own listener repaints.
    if (yardSel) yardSel.addEventListener('input', () => { yardPicked = true; });
    if (yardSel) yardSel.addEventListener('change', () => { yardPicked = true; save(); });
    $$('input[name=delivery]', form).forEach((r) => r.addEventListener('input', () => { deliveryPicked = true; }));
    form.addEventListener('input', paint);
    form.addEventListener('change', paint);

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
          bag = next; input.files = bag.files; render(); paint(); save();
          // Focus stays with the list: on the next file's Remove button, or back on the picker when none are left.
          const left = $$('button', list);
          (left[i] || left[left.length - 1] || input).focus();
        });
        li.append(name, meta, rm);
        list.append(li);
      });
    };
    const lostNote = $('[data-files-lost]', form);
    const paintLost = () => {
      if (!lostNote) return;
      lostNote.hidden = !lost.length;
      lostNote.textContent = lost.length ? `You had attached ${lost.join(', ')}. Choose ${lost.length > 1 ? 'them' : 'it'} again: files cannot be kept in a draft.` : '';
    };
    const add = (files) => {
      const tooBig = [];
      const held = Array.from(bag.files);
      Array.from(files).forEach((f) => {
        if (f.size > MAX) tooBig.push(f.name);
        else if (!held.some((g) => g.name === f.name && g.size === f.size)) { bag.items.add(f); held.push(f); }
      });
      input.files = bag.files;
      lost = lost.filter((n) => !held.some((g) => g.name === n));
      paintLost();
      render();
      const note = $('[data-file-err]', form);
      note.hidden = !tooBig.length;
      if (tooBig.length) note.textContent = `${tooBig.join(', ')} ${tooBig.length > 1 ? 'are' : 'is'} over 25 MB. Email large files to the yard directly, or send a download link in the notes.`;
      paint();
    };
    if (input && drop) {
      // A new choice adds to the list, as a drop does; the list keeps what is already on it.
      input.addEventListener('change', () => add(Array.from(input.files)));
      ['dragenter', 'dragover'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.add('is-over'); }));
      ['dragleave', 'drop'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.remove('is-over'); }));
      drop.addEventListener('drop', (e) => add(e.dataTransfer.files));
    }

    // Marks one field and returns whether it passes.
    const check = (el) => {
      const err = document.getElementById(el.id + '-err');
      const bad = !el.checkValidity();
      el.setAttribute('aria-invalid', String(bad));
      if (err) {
        err.hidden = !bad;
        err.textContent = !bad ? '' : el.type === 'checkbox' ? 'Please confirm to continue.' : el.validity.valueMissing ? (el.dataset.missing || 'Required.') : el.type === 'email' ? 'Enter an email address like name@company.com.' : 'Check this field.';
      }
      return !bad;
    };
    const labelOf = (el) => (el.dataset.label || form.querySelector(`label[for="${el.id}"]`)?.childNodes[0]?.textContent.trim() || el.name);
    // On submit: mark everything, then take the visitor to the first problem.
    const validate = () => {
      const bad = $$('[required]', form).filter((el) => !check(el));
      if (bad.length) bad[0].focus();
      if (leftLine) {
        leftLine.dataset.hold = bad.length ? '1' : '';
        if (bad.length) leftLine.textContent = `${bad.length} ${bad.length === 1 ? 'field needs' : 'fields need'} your attention: ${bad.map(labelOf).join(', ')}.`;
      }
      return !bad.length;
    };
    // Once a field has been flagged, re-check just that field as it is corrected.
    $$('[required]', form).forEach((el) => ['blur', 'change'].forEach((t) => el.addEventListener(t, () => {
      if (el.getAttribute('aria-invalid') === 'true') {
        check(el);
        if (leftLine && leftLine.dataset.hold) { leftLine.dataset.hold = ''; paintProgress(); }
      }
    })));

    // Start over: forget the draft, the files and any errors, but keep what the link brought with it.
    // One stray tap must not cost a whole application, so Undo is offered until the visitor starts typing again.
    // The snapshot lives in this page's memory only.
    let undo = null;
    const offerUndo = (on) => { if (draftUndo) draftUndo.hidden = !on; };
    const clearMarks = () => {
      $$('[aria-invalid]', form).forEach((el) => { el.removeAttribute('aria-invalid'); });
      $$('.err', form).forEach((el) => { el.hidden = true; el.textContent = ''; });
      if (leftLine) leftLine.dataset.hold = '';
    };
    if (draftClear) draftClear.addEventListener('click', () => {
      undo = { values: fields().map((el) => [el, el.type === 'radio' || el.type === 'checkbox' ? el.checked : el.value]), bag, lost, yardPicked, deliveryPicked };
      try { localStorage.removeItem(DRAFT); sessionStorage.removeItem(DRAFT); } catch { /* ignore */ }
      form.reset();
      lost = [];
      bag = new DataTransfer(); if (input) { input.files = bag.files; render(); paintLost(); }
      yardPicked = false; deliveryPicked = false;
      prefill();
      clearMarks();
      draftText.textContent = 'Form cleared.';
      draftClear.hidden = true;
      paint();
      offerUndo(true);
      (draftUndo || $('input, select, textarea', form)).focus();
    });
    if (draftUndo) draftUndo.addEventListener('click', () => {
      undo.values.forEach(([el, v]) => { if (el.type === 'radio' || el.type === 'checkbox') el.checked = v; else el.value = v; });
      bag = undo.bag; lost = undo.lost; yardPicked = undo.yardPicked; deliveryPicked = undo.deliveryPicked; undo = null;
      if (input) { input.files = bag.files; render(); paintLost(); }
      offerUndo(false);
      save();
      if (typed()) draftSays('Draft saved on this device.');
      draftClear.hidden = false;
      paint();
      draftClear.focus();
    });
    form.addEventListener('input', () => { if (undo) { undo = null; offerUndo(false); } });

    // Plain-text summary of everything filled in, labelled as on screen, for the email fallback.
    const summary = () => {
      const out = [];
      $$('fieldset', form).forEach((fs) => {
        const legend = fs.querySelector('legend')?.textContent.replace(/^\d+/, '').trim();
        const rows = [];
        fields().filter((el) => fs.contains(el) && !HELD.test(el.name)).forEach((el) => {
          if (el.type === 'radio' && !el.checked) return;
          if (el.type === 'checkbox' && el.closest('.seg')) { if (el.checked) rows.push(['', '• ' + el.value]); return; }
          const label = el.dataset.label || (el.type === 'radio' ? $('#' + el.name + '-label', form) : form.querySelector(`label[for="${el.id}"]`))?.childNodes[0]?.textContent.trim() || el.name;
          const v = el.type === 'checkbox' ? (el.checked ? 'Yes' : 'No') : el.tagName === 'SELECT' ? el.selectedOptions[0]?.textContent : el.value.trim();
          if (v) rows.push([label, v]);
        });
        if (rows.length) out.push('', `— ${legend.toUpperCase()} —`, ...rows.map(([k, v]) => (k ? `${k}: ${v}` : v)));
      });
      const held = fields().some((el) => HELD.test(el.name) && el.value.trim());
      if (held) out.push('', 'TAX ID AND BANK DETAILS: left out of this email. I will give them to the yard by phone or on a printed copy.');
      const names = [...Array.from(bag.files).map((f) => f.name), ...lost];
      if (names.length) out.push('', 'FILES TO ATTACH: ' + names.join(', '));
      return { text: out.join('\n').trim(), files: names, held };
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

      // handedOff: the email app was asked to send, and nobody knows yet whether it did. The saved draft leaves this
      // browser's long-term storage, but this tab keeps a copy (still without the private fields) until it closes,
      // so a reload or a mail app that never opened costs nothing.
      const finish = (handedOff) => {
        try {
          if (handedOff) { save(); sessionStorage.setItem(DRAFT, localStorage.getItem(DRAFT)); } else sessionStorage.removeItem(DRAFT);
          localStorage.removeItem(DRAFT);
          if (kind === 'quote') sessionStorage.removeItem('uresco.picks');
        } catch { /* ignore */ }
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
      const { text, files, held } = summary();
      const subject = `${form.dataset.subject} — ${data.get('company') || data.get('name')}${data.get('location') ? ' — ' + data.get('location') : ''}`;
      const link = (body) => `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      // Mail apps cut off or refuse very long links. A long request is copied and pasted instead of being trimmed.
      const long = link(text).length > 1800;
      const mail = long ? link('The details are too long for an email link, so they are pasted below.\n\n') : link(text);
      if (!long) window.location.href = mail;
      $$('[data-mail-note]', done).forEach((n) => { n.hidden = !files.length; });
      $$('[data-mail-held]', done).forEach((n) => { n.hidden = !held; });
      $$('[data-mail-to]', done).forEach((n) => { n.textContent = to; });
      $$('[data-mail-short]', done).forEach((n) => { n.hidden = long; });
      $$('[data-mail-long]', done).forEach((n) => { n.hidden = !long; });
      // Not everyone has an email app set up: they can try again, or paste the text into webmail.
      const again = $('[data-mail-again]', done);
      const copy = $('[data-copy]', done);
      if (again) {
        again.href = mail;
        again.classList.toggle('btn--line', long);
        $('[data-again-label]', again).textContent = long ? 'Open the email' : 'Open the email again';
      }
      if (copy) {
        copy.classList.toggle('btn--line', !long);
        if (long && again) copy.after(again);
        const label = $('[data-copy-label]', copy);
        label.textContent = long ? 'Copy the details' : 'Copy it instead';
        copy.onclick = async () => {
          try { await navigator.clipboard.writeText(`To: ${to}\nSubject: ${subject}\n\n${text}`); label.textContent = 'Copied'; } catch { label.textContent = 'Could not copy. Please call the yard.'; }
        };
      }
      finish(true);
    });

    // Back from the notice with everything as it was, if the email never opened or something needs changing.
    const back = $('[data-back]', host);
    if (back) back.addEventListener('click', () => {
      done.hidden = true; form.hidden = false;
      save();
      try { sessionStorage.removeItem(DRAFT); } catch { /* ignore */ }
      form.tabIndex = -1;
      form.focus({ preventScroll: true });
      window.scrollTo({ top: form.getBoundingClientRect().top + window.scrollY - 120 });
    });

    // Paper: a blank form prints blank; one that has been started prints what has been entered.
    window.addEventListener('beforeprint', () => {
      const filled = typed();
      form.classList.toggle('is-filled', filled);
      $$('input[type=date]', form).forEach((el) => el.classList.toggle('has-date', !!el.value));
      $$('[data-print-for]', form).forEach((box) => { box.checked = filled && form.elements[box.dataset.printFor]?.value === box.value; });
    });
    window.addEventListener('afterprint', () => form.classList.remove('is-filled'));

    paintLost();
    paint();
  });
})();
