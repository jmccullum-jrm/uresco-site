// Uresco site behaviour: dialogs, the masthead, yard hours and the two forms.
// No dependencies; everything degrades to plain links and forms. Features that only decorate
// (motion, the hero, the product index, the route finder) live in modules/.
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
    if (e.target.closest('[data-print]')) window.print();
  });
  // A link inside the drawer that points at this page would otherwise leave it open.
  $$('dialog a[href]').forEach((a) => a.addEventListener('click', () => a.closest('dialog').close()));

  /* Masthead: gains its keyline once the page has scrolled. */
  const mast = $('[data-masthead]');
  if (mast) {
    const onScroll = () => mast.toggleAttribute('data-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* Products menu: opens on hover and focus (CSS). Escape dismisses it where it stands, and it comes
     back the next time the pointer or focus arrives. aria-expanded follows what is actually open. */
  const menuItem = $('.nav__item--menu');
  if (menuItem) {
    const link = $('.nav__link', menuItem);
    const menuOpen = () => !menuItem.classList.contains('is-dismissed') && (menuItem.matches(':hover') || menuItem.matches(':focus-within'));
    const sync = () => link.setAttribute('aria-expanded', String(menuOpen()));
    const undismiss = () => { if (!menuItem.matches(':hover') && !menuItem.matches(':focus-within')) { menuItem.classList.remove('is-dismissed'); sync(); } };
    sync();
    menuItem.addEventListener('mouseenter', sync);
    menuItem.addEventListener('focusin', sync);
    menuItem.addEventListener('mouseleave', () => { menuItem.classList.remove('is-dismissed'); setTimeout(sync, 0); });
    menuItem.addEventListener('focusout', () => setTimeout(undismiss, 0));
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape' || !menuOpen()) return;
      menuItem.classList.add('is-dismissed');
      // Focus inside the panel would otherwise be stranded in something no longer shown.
      if (menuItem.contains(document.activeElement)) link.focus();
      sync();
    });
  }

  /* The route finder's map: a town's label asks the finder about that town, the same way as typing it. */
  document.addEventListener('click', (e) => {
    const pick = e.target.closest('[data-place-pick]');
    const input = pick && $('.finder__input');
    if (!input) return;
    input.value = pick.dataset.placePick;
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  });

  /* The phone action bar steps aside while the keyboard is up. */
  const TYPING = 'input:not([type=radio],[type=checkbox],[type=file]), textarea, select';
  document.addEventListener('focusin', (e) => { if (e.target.matches?.(TYPING)) document.body.classList.add('is-typing'); });
  document.addEventListener('focusout', (e) => { if (e.target.matches?.(TYPING)) document.body.classList.remove('is-typing'); });

  /* Open / closed, computed in each yard's own time zone. Only the word is shown: the hours
     themselves are placeholders until the yards confirm them, so no closing time is ever printed.
     data-hours = {"tz":"America/Anchorage","week":[null,[420,990],…]}  (Sunday first, minutes after midnight) */
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const isOpen = ({ tz, week }) => {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' })
      .formatToParts(new Date()).map((p) => [p.type, p.value]));
    const today = week[DAYS.indexOf(parts.weekday)], now = +parts.hour * 60 + +parts.minute;
    return !!(today && now >= today[0] && now < today[1]);
  };
  const paintHours = () => $$('[data-hours]').forEach((el) => {
    try {
      const open = isOpen(JSON.parse(el.dataset.hours));
      el.textContent = open ? 'Open!' : 'Closed: napping';
      el.classList.toggle('is-open', open);
      el.hidden = false;
    } catch { /* leave hidden */ }
  });
  paintHours();
  setInterval(paintHours, 60 * 1000);

  /* Projects filter: a sector pill shows one sector. A link to a sector (#remote-alaska, from the
     hero or from another page) opens that sector's view. */
  const filters = $('[data-filters]');
  if (filters) {
    const status = $('[data-filter-status]');
    const sectors = $$('[data-sector]');
    const buttons = $$('button[data-filter]', filters);
    const choose = (b) => {
      const f = b.dataset.filter;
      buttons.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      sectors.forEach((s) => { s.hidden = f !== 'all' && s.dataset.sector !== f; });
      $('[data-filter-grid]').classList.toggle('is-filtered', f !== 'all');
      if (status) status.textContent = `Showing ${f === 'all' ? 'all work' : b.textContent.trim()}: ${sectors.filter((s) => !s.hidden).reduce((n, s) => n + s.querySelectorAll('[data-kind]').length, 0)} kinds of work.`;
    };
    filters.addEventListener('click', (e) => { const b = e.target.closest('button[data-filter]'); if (b) choose(b); });
    const open = () => {
      const sector = location.hash.length > 1 && document.getElementById(decodeURIComponent(location.hash.slice(1)));
      const b = sector && buttons.find((x) => x.dataset.filter === sector.dataset.sector);
      if (!b) return;
      choose(b);
      filters.scrollLeft = b.offsetLeft - 16;
      filters.scrollIntoView({ block: 'start' });
    };
    window.addEventListener('hashchange', open);
    open();
  }

  /* Forms: the quote request and the credit application share this. */
  $$('form[data-form]').forEach((form) => {
    const kind = form.dataset.form;
    const host = form.parentElement;
    const done = $('[data-done]', host);
    const failed = $('[data-failed]', host);
    const DRAFT = 'uresco.draft.' + kind;
    const MAX = 25 * 1024 * 1024;
    let bag = new DataTransfer();
    // Without this script the browser still checks required fields; with it, the inline messages take over.
    form.noValidate = true;

    // Drafts: a request half-typed on a job site survives a dropped signal or a closed tab.
    const fields = () => $$('input, select, textarea', form).filter((el) => el.name && el.type !== 'file' && el.type !== 'hidden');
    // Tax IDs, bank details and signatures are never left behind on a shared computer.
    const PRIVATE = /^(ein|bank|bank_contact|signature|signed|agree)$/;
    const save = () => {
      const d = {};
      fields().filter((el) => !PRIVATE.test(el.name)).forEach((el) => {
        if (el.type === 'radio') { if (el.checked) d[el.name] = el.value; } else if (el.type === 'checkbox') d[el.name] = el.checked; else d[el.name] = el.value;
      });
      if (bag.files.length) d._files = bag.files.length;
      try { localStorage.setItem(DRAFT, JSON.stringify(d)); } catch { /* private mode */ }
    };
    // A request handed to the email app is not known to have been sent, so its draft waits in this
    // tab (sessionStorage) instead of being thrown away: a reload brings it back into the form.
    const shelve = () => { try { const d = localStorage.getItem(DRAFT); if (d) sessionStorage.setItem(DRAFT, d); localStorage.removeItem(DRAFT); } catch { /* ignore */ } };
    const forget = () => { try { localStorage.removeItem(DRAFT); sessionStorage.removeItem(DRAFT); } catch { /* ignore */ } };
    const unshelve = () => { try { const d = sessionStorage.getItem(DRAFT); if (d && !localStorage.getItem(DRAFT)) localStorage.setItem(DRAFT, d); sessionStorage.removeItem(DRAFT); } catch { /* ignore */ } };
    unshelve();
    try {
      const d = JSON.parse(localStorage.getItem(DRAFT) || 'null');
      if (d) form.dataset.touched = '1';
      if (d) fields().forEach((el) => {
        if (!(el.name in d)) return;
        if (el.type === 'radio') el.checked = d[el.name] === el.value; else if (el.type === 'checkbox') el.checked = !!d[el.name]; else el.value = d[el.name];
      });
      // Tell a returning visitor what was kept, and let them clear it (a shared office computer, say).
      const kept = $('[data-restored]', form);
      if (d && kept && fields().some((el) => !el.matches('select, [type=radio], [type=checkbox]') && el.value.trim())) {
        kept.hidden = false;
        const filesNote = $('[data-restored-files]', kept);
        if (filesNote && d._files) filesNote.hidden = false;
        $('[data-draft-clear]', kept).addEventListener('click', () => { forget(); location.reload(); });
      }
    } catch { /* ignore */ }
    form.addEventListener('input', save);
    form.addEventListener('change', save);
    // On paper, a form that has been filled in prints its choices; a blank one stays blank (90-print.css).
    const touched = () => { form.dataset.touched = '1'; };
    form.addEventListener('input', touched);
    form.addEventListener('change', touched);

    // Arriving from a product page: start the materials list with that line. A line added on top
    // of a saved draft goes at the end, so what was already typed is kept.
    const params = new URLSearchParams(location.search);
    const product = params.get('product');
    const materials = $('textarea[name=materials]', form);
    if (product && materials) {
      if (!materials.value) materials.value = product + ':\n';
      else if (!materials.value.includes(product)) materials.value = materials.value.replace(/\s*$/, '\n\n') + product + ':\n';
    }
    // Arriving from the Alaska route finder: the place and how it ships are already known, and are newer than any draft.
    const place = params.get('location');
    const placeField = $('input[name=location]', form);
    if (place && placeField) placeField.value = place;
    const delivery = params.get('delivery');
    if (delivery) $$('input[name=delivery]', form).forEach((r) => { r.checked = r.value === delivery; });
    const yardParam = (params.get('yard') || '').toLowerCase();
    const yardSel = $('select[name=yard]', form);
    if (yardParam && yardSel) $$('option', yardSel).forEach((o) => { if (o.value.toLowerCase() === yardParam) yardSel.value = o.value; });
    // What a link carries only counts on arrival. Save it as the draft and take it off the address
    // (after the rest of this script has read it), so a reload keeps what the visitor corrected.
    if (product || place || delivery || yardParam) {
      touched();
      save();
      setTimeout(() => history.replaceState(history.state, '', location.pathname + location.hash), 0);
    }

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
          bag = next; input.files = bag.files; render(); save();
          // The button pressed is gone: keep the keyboard's place on the row that took its spot.
          const left = $$('[data-files] button', form);
          (left[i] || left[i - 1] || input).focus();
        });
        li.append(name, meta, rm);
        list.append(li);
      });
    };
    const add = (files) => {
      const tooBig = [];
      const same = (a, b) => a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;
      Array.from(files).forEach((f) => {
        if (f.size > MAX) tooBig.push(f.name);
        else if (!Array.from(bag.files).some((g) => same(f, g))) bag.items.add(f);
      });
      input.files = bag.files;
      render();
      save();
      const note = $('[data-file-err]', form);
      note.hidden = !tooBig.length;
      if (tooBig.length) note.textContent = `${tooBig.join(', ')} ${tooBig.length > 1 ? 'are' : 'is'} over 25 MB. Email large files to the yard directly, or send a download link in the notes.`;
    };
    if (input && drop) {
      // A second pick adds to the tray (phones often pick or shoot one file at a time).
      input.addEventListener('change', () => add(Array.from(input.files)));
      ['dragenter', 'dragover'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.add('is-over'); }));
      ['dragleave', 'drop'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.remove('is-over'); }));
      drop.addEventListener('drop', (e) => add(e.dataTransfer.files));
    }

    // What the visitor reads under a field: its own message if it has one, or a plain default.
    const message = (el) => (el.type === 'checkbox' ? el.dataset.msg || 'Please confirm to continue.'
      : el.validity.valueMissing ? el.dataset.msg || 'Required.'
      : el.type === 'email' ? 'Enter an email address like name@company.com.' : 'Check this field.');
    // Marks one field and returns whether it passes.
    const check = (el) => {
      const err = document.getElementById(el.id + '-err');
      const bad = !el.checkValidity();
      el.setAttribute('aria-invalid', String(bad));
      if (err) {
        err.hidden = !bad;
        err.textContent = bad ? message(el) : '';
      }
      return !bad;
    };
    const nameOf = (el) => el.dataset.label || form.querySelector(`label[for="${el.id}"]`)?.childNodes[0]?.textContent.trim() || el.name;
    // Beside the submit button: what is still missing, each one a link to the field.
    const errs = $('[data-errs]', form);
    const paintErrs = (bad) => {
      if (!errs) return;
      errs.hidden = !bad.length;
      errs.textContent = '';
      if (!bad.length) return;
      const lead = document.createElement('b');
      lead.textContent = bad.length === 1 ? 'One thing left:' : `${bad.length} things left:`;
      errs.append(lead);
      bad.forEach((el) => {
        const a = document.createElement('a');
        a.href = '#' + el.id; a.textContent = nameOf(el);
        a.addEventListener('click', (e) => { e.preventDefault(); el.focus(); });
        errs.append(' ', a);
      });
    };
    const stillBad = () => $$('[aria-invalid="true"]', form);
    // On submit: mark everything, then take the visitor to the first problem.
    const validate = () => {
      const bad = $$('[required]', form).filter((el) => !check(el));
      paintErrs(bad);
      if (bad.length) bad[0].focus();
      return !bad.length;
    };
    // Once a field has been flagged, re-check just that field as it is corrected.
    $$('[required]', form).forEach((el) => ['blur', 'change', 'input'].forEach((t) => el.addEventListener(t, () => {
      if (el.getAttribute('aria-invalid') === 'true') { check(el); paintErrs(stillBad()); }
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
        form.hidden = true; done.hidden = false; done.focus();
        window.scrollTo({ top: done.getBoundingClientRect().top + window.scrollY - 120 });
      };

      if (endpoint) {
        btn.disabled = true; btn.dataset.label = btn.innerHTML; btn.textContent = 'Sending…';
        try {
          const r = await fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
          if (!r.ok) throw new Error(r.status);
          forget();
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
      // If no email app opened, the form is gone by now: offer the same message again, or the text itself.
      const again = $('[data-mail-again]', done);
      if (again) again.href = mail;
      const toAttach = $('[data-mail-files]', done);
      if (toAttach) {
        toAttach.hidden = !files.length;
        toAttach.textContent = '';
        files.forEach((n) => { const li = document.createElement('li'); li.textContent = n; toAttach.append(li); });
      }
      const copy = $('[data-mail-copy]', done);
      if (copy) copy.onclick = async () => {
        const label = $('span', copy);
        try { await navigator.clipboard.writeText(`To: ${to}\nSubject: ${subject}\n\n${text}`); label.textContent = 'Copied'; }
        catch { label.textContent = 'Copy didn’t work'; }
      };
      // The site cannot know the email was sent. The form stays one tap away, and the draft in this tab.
      const back = $('[data-mail-back]', done);
      if (back) back.onclick = () => { unshelve(); done.hidden = true; form.hidden = false; form.scrollIntoView({ block: 'start' }); $('input:not([type=hidden]), select, textarea', form)?.focus(); };
      shelve();
      finish();
    });
  });
})();
