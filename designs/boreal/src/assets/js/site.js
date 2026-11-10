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
    const placeField = $('input[name=location]', form);
    const materials = $('textarea[name=materials]', form);
    // Once a yard or a delivery has been picked (by hand or by the link that brought them here) the form never changes it.
    let yardPicked = false, deliveryPicked = false;
    const carried = $('[data-carried]');

    const draftText = $('[data-draft-text]', form);
    const draftClear = $('[data-draft-clear]', form);
    const draftSays = (t) => { if (draftText) draftText.textContent = t; if (draftClear) draftClear.hidden = false; };

    // Drafts: a request half-typed on a job site survives a dropped signal or a closed tab.
    const fields = () => $$('input, select, textarea', form).filter((el) => el.name && el.type !== 'file' && el.type !== 'hidden');
    const typed = () => fields().some((el) => el.matches('input:not([type=radio],[type=checkbox]), textarea') && el.value.trim());
    // Tax IDs, bank details and signatures are never left behind on a shared computer.
    const PRIVATE = /^(ein|bank|bank_contact|signature|signed|agree)$/;
    const save = () => {
      const d = {};
      fields().filter((el) => !PRIVATE.test(el.name)).forEach((el) => {
        if (el.type === 'radio') { if (el.checked) d[el.name] = el.value; } else if (el.type === 'checkbox') d[el.name] = el.checked; else d[el.name] = el.value;
      });
      if (yardPicked) d._yard = true;
      if (deliveryPicked) d._delivery = true;
      try { localStorage.setItem(DRAFT, JSON.stringify(d)); if (typed()) draftSays('Draft saved on this device.'); } catch { /* private mode */ }
    };
    try {
      const d = JSON.parse(localStorage.getItem(DRAFT) || 'null');
      if (d) {
        fields().forEach((el) => {
          if (!(el.name in d)) return;
          if (el.type === 'radio') el.checked = d[el.name] === el.value; else if (el.type === 'checkbox') el.checked = !!d[el.name]; else el.value = d[el.name];
        });
        yardPicked = !!d._yard;
        deliveryPicked = !!d._delivery;
        if (typed()) draftSays('Draft picked up from this device.');
      }
    } catch { /* ignore */ }
    form.addEventListener('input', save);
    form.addEventListener('change', save);

    // What the visitor was looking at when they followed the link here.
    const prefill = () => {
      // Arriving from a product page: start the materials list with that line.
      const product = query.get('product');
      if (product && materials && !materials.value) materials.value = product + ':\n';
      const yardParam = (query.get('yard') || '').toLowerCase();
      if (yardParam && yardSel) $$('option', yardSel).forEach((o) => { if (o.value.toLowerCase() === yardParam) { yardSel.value = o.value; yardPicked = true; } });
      // Arriving from the finder: the place is already known.
      const placeParam = query.get('location');
      if (placeParam && placeField) placeField.value = placeParam.slice(0, 80);
    };
    prefill();

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
    const cityOf = (id) => id && id[0].toUpperCase() + id.slice(1);

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
    const paintMap = (p, yardId) => {
      if (!slipMap) return;
      $$('[data-map-yard]', slipMap).forEach((g) => g.classList.toggle('is-on', g.dataset.mapYard === yardId));
      const home = $(`[data-map-yard="${yardId}"]`, slipMap);
      labels.yard = home && { text: cityOf(yardId), xy: geo.yards[yardId], west: home.dataset.side === 'w' };
      const d = p && geo.yards[yardId] ? arcPath(geo.yards[yardId], p.xy) : '';
      labels.dest = d ? { text: p.name, xy: p.xy, west: p.xy[0] < geo.yards[yardId][0] } : null;
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
      if (p && !yardPicked && yardSel.value !== cityOf(p.yard)) yardSel.value = cityOf(p.yard);
      // A known place off the road system starts on remote shipping; anywhere else on job-site delivery.
      if (p && !deliveryPicked) {
        const want = p.access === 'coastal' || p.access === 'seasonal' ? 'Remote Alaska shipping' : 'Job-site delivery';
        $$('input[name=delivery]', form).forEach((r) => { r.checked = r.value === want; });
      }
      if (yardHint) yardHint.textContent = p && !yardPicked ? `Picked for ${p.name}. Change it if you work with another yard.` : yardHintDefault;
      const yardId = yardSel.value.toLowerCase();
      const acc = p && geo.access[p.access];
      // Say what the link carried over, on the first screen.
      if (carried && query.get('location')) { carried.hidden = !text; carried.textContent = `Quote for ${text} · ${cityOf(yardId)} yard`; }
      put('place', p ? `${p.name}, ${geo.states[p.st]}` : text || 'Where is the job?');
      put('meta', p ? `${p.region} · ${acc.tag}` : text ? 'Not on our short list, which does not mean we cannot get there. A yard will work out the route.' : 'Add the project location and this fills in.');
      $$('[data-s-modes]').forEach((el) => el.classList.toggle('is-empty', !acc));
      $$('[data-ic]').forEach((el) => { const [i, k] = el.dataset.ic.split('-'); el.hidden = !(acc && acc.modes[i]?.[0] === k); });
      [0, 1].forEach((i) => put('m' + i, acc && acc.modes[i] ? acc.modes[i][1].replace('{yard}', cityOf(yardId)) : ''));
      paintMap(p, yardId);
    };

    const live = $('[data-live]', form);
    let lastYard = '';
    const paintYard = () => {
      if (!yardSel) return;
      const id = yardSel.value.toLowerCase();
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
      const product = query.get('product');
      put('attached', files.length ? (files.length === 1 ? files[0].name : `${files.length} files attached`) : product || (materials && materials.value.trim() ? 'Listed in the request' : 'Nothing attached yet'));
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
          bag = next; input.files = bag.files; render(); paint();
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
      if (tooBig.length) note.textContent = `${tooBig.join(', ')} ${tooBig.length > 1 ? 'are' : 'is'} over 25 MB. Email large files to the yard directly, or send a download link in the notes.`;
      paint();
    };
    if (input && drop) {
      input.addEventListener('change', () => { const f = Array.from(input.files); bag = new DataTransfer(); add(f); });
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
    if (draftClear) draftClear.addEventListener('click', () => {
      try { localStorage.removeItem(DRAFT); } catch { /* ignore */ }
      form.reset();
      bag = new DataTransfer(); if (input) { input.files = bag.files; render(); }
      yardPicked = false; deliveryPicked = false;
      prefill();
      $$('[aria-invalid]', form).forEach((el) => { el.removeAttribute('aria-invalid'); });
      $$('.err', form).forEach((el) => { el.hidden = true; el.textContent = ''; });
      if (leftLine) leftLine.dataset.hold = '';
      draftText.textContent = 'Saved on this device as you type.';
      draftClear.hidden = true;
      paint();
      $('input, select, textarea', form).focus();
    });

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
      // Not everyone has an email app set up: they can try again, or paste the text into webmail.
      const again = $('[data-mail-again]', done);
      if (again) again.href = mail;
      const copy = $('[data-copy]', done);
      if (copy) copy.onclick = async () => {
        const label = $('[data-copy-label]', copy);
        try { await navigator.clipboard.writeText(`To: ${to}\nSubject: ${subject}\n\n${text}`); label.textContent = 'Copied'; } catch { label.textContent = 'Could not copy. Please call the yard.'; }
      };
      finish();
    });

    // Paper: a blank form prints blank; one that has been started prints what has been entered.
    window.addEventListener('beforeprint', () => {
      const filled = typed();
      form.classList.toggle('is-filled', filled);
      $$('input[type=date]', form).forEach((el) => el.classList.toggle('has-date', !!el.value));
      $$('[data-print-for]', form).forEach((box) => { box.checked = filled && form.elements[box.dataset.printFor]?.value === box.value; });
    });
    window.addEventListener('afterprint', () => form.classList.remove('is-filled'));

    paint();
  });
})();
