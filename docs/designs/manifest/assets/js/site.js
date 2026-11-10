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
$$('a[data-open]').forEach((a) => {
a.setAttribute('role', 'button');
a.addEventListener('keydown', (e) => { if (e.key === ' ') { e.preventDefault(); a.click(); } });
});
$$('dialog a[href]').forEach((a) => a.addEventListener('click', () => a.closest('dialog').close()));
/* The phone action bar steps aside while the keyboard is up. */
const TYPING = 'input:not([type=radio],[type=checkbox],[type=file]), textarea, select';
document.addEventListener('focusin', (e) => { if (e.target.matches?.(TYPING)) document.body.classList.add('is-typing'); });
document.addEventListener('focusout', (e) => { if (e.target.matches?.(TYPING)) document.body.classList.remove('is-typing'); });
/* Open / closed, computed in each yard's own time zone.
data-hours = {"tz":"America/Anchorage","week":[null,[420,990],…]}  (Sunday first, minutes after midnight) */
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const clock = (m) => {
const h = Math.floor(m / 60), mm = m % 60, ap = h < 12 ? 'a.m.' : 'p.m.';
return `${((h + 11) % 12) + 1}${mm ? ':' + String(mm).padStart(2, '0') : ''} ${ap}`;
};
const yardStatus = ({ tz, week }) => {
const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' })
.formatToParts(new Date()).map((p) => [p.type, p.value]));
const day = DAYS.indexOf(parts.weekday), now = +parts.hour * 60 + +parts.minute;
const today = week[day];
if (today && now >= today[0] && now < today[1]) return { open: true, text: `Open now · until ${clock(today[1])}` };
for (let i = 0; i < 8; i++) {
const d = (day + i) % 7, h = week[d];
if (h && (i > 0 || now < h[0])) return { open: false, text: `Closed · opens ${i === 0 ? 'today' : i === 1 ? 'tomorrow' : DAYS[d]} ${clock(h[0])}` };
}
return { open: false, text: 'Closed' };
};
const paintHours = () => $$('[data-hours]').forEach((el) => {
try {
const s = yardStatus(JSON.parse(el.dataset.hours));
el.textContent = el.hasAttribute('data-short') ? (s.open ? 'Open' : 'Closed') : s.text;
el.classList.toggle('is-open', s.open);
el.hidden = false;
} catch { /* leave hidden */ }
});
paintHours();
setInterval(paintHours, 60 * 1000);
/* Projects filter */
const filters = $('[data-filters]');
if (filters) {
filters.addEventListener('click', (e) => {
const b = e.target.closest('button[data-filter]');
if (!b) return;
const f = b.dataset.filter;
$$('button', filters).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
$$('[data-sector]').forEach((card) => { card.hidden = f !== 'all' && card.dataset.sector !== f; });
$('.proj-grid').classList.toggle('is-filtered', f !== 'all');
});
}
})();
(() => {
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
/* Forms: the quote request and the credit application share this. */
$$('form[data-form]').forEach((form) => {
const kind = form.dataset.form;
const host = form.parentElement;
const done = $('[data-done]', host);
const failed = $('[data-failed]', host);
const DRAFT = 'uresco.draft.' + kind;
const MAX = 25 * 1024 * 1024;
let bag = new DataTransfer();
const fields = () => $$('input, select, textarea', form).filter((el) => el.name && el.type !== 'file' && el.type !== 'hidden');
const PRIVATE = /^(ein|bank|bank_contact|signature|signed|agree)$/;
const save = () => {
const d = {};
fields().filter((el) => !PRIVATE.test(el.name)).forEach((el) => {
if (el.type === 'radio') { if (el.checked) d[el.name] = el.value; } else if (el.type === 'checkbox') d[el.name] = el.checked; else d[el.name] = el.value;
});
try { localStorage.setItem(DRAFT, JSON.stringify(d)); } catch { /* private mode */ }
};
try {
const d = JSON.parse(localStorage.getItem(DRAFT) || 'null');
if (d) fields().forEach((el) => {
if (!(el.name in d)) return;
if (el.type === 'radio') el.checked = d[el.name] === el.value; else if (el.type === 'checkbox') el.checked = !!d[el.name]; else el.value = d[el.name];
});
} catch { /* ignore */ }
form.addEventListener('input', save);
form.addEventListener('change', save);
const product = new URLSearchParams(location.search).get('product');
const materials = $('textarea[name=materials]', form);
if (product && materials && !materials.value) materials.value = product + ':\n';
const yardParam = new URLSearchParams(location.search).get('yard');
const yardSel = $('select[name=yard]', form);
if (yardParam && yardSel) $$('option', yardSel).forEach((o) => { if (o.value.toLowerCase() === yardParam) yardSel.value = o.value; });
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
const check = (el) => {
const err = document.getElementById(el.id + '-err');
const bad = !el.checkValidity();
el.setAttribute('aria-invalid', String(bad));
if (err) {
err.hidden = !bad;
err.textContent = !bad ? '' : el.type === 'checkbox' ? 'Please confirm to continue.' : el.validity.valueMissing ? 'Required.' : el.type === 'email' ? 'Enter an email address like name@company.com.' : 'Check this field.';
}
return !bad;
};
const validate = () => {
const bad = $$('[required]', form).filter((el) => !check(el));
if (bad.length) bad[0].focus();
return !bad.length;
};
$$('[required]', form).forEach((el) => ['blur', 'change'].forEach((t) => el.addEventListener(t, () => {
if (el.getAttribute('aria-invalid') === 'true') check(el);
})));
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
const { text, files } = summary();
const subject = `${form.dataset.subject} — ${data.get('company') || data.get('name')}${data.get('location') ? ' — ' + data.get('location') : ''}`;
window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
const note = $('[data-mail-note]', done);
if (note) note.hidden = !files.length;
$('[data-mail-to]', done).textContent = to;
finish();
});
});
})();
(() => {
const clocks = Array.from(document.querySelectorAll('[data-clock]'));
if (!clocks.length) return;
const still = window.matchMedia('(prefers-reduced-motion: reduce)');
const formats = {};
const timeIn = (tz, seconds) => {
const key = tz + (seconds ? 's' : '');
formats[key] = formats[key] || new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: seconds ? '2-digit' : undefined, hourCycle: 'h23' });
return formats[key].format(new Date());
};
const flip = (cell) => { cell.classList.remove('is-flip'); void cell.offsetWidth; cell.classList.add('is-flip'); };
const write = (el, text) => {
const cells = el.querySelectorAll('.fl');
if (!cells.length) { if (el.textContent !== text) el.textContent = text; return; }
cells.forEach((cell, i) => {
const ch = text[i] || ' ';
if (cell.textContent === ch) return;
cell.textContent = ch;
if (!still.matches) flip(cell);
});
};
const tick = () => clocks.forEach((el) => {
try { write(el, timeIn(el.dataset.clock, el.hasAttribute('data-seconds') && !still.matches)); } catch { /* unknown zone: leave the dashes */ }
});
const loop = () => { tick(); setTimeout(loop, 1000 - (Date.now() % 1000) + 5); };
loop();
if (still.matches) return;
document.querySelectorAll('[data-flap] .fl').forEach((cell, i) => {
const final = cell.textContent;
if (!/\d/.test(final)) return;
let n = 2 + (i % 4);
const step = () => {
if (n-- > 0) { cell.textContent = String((+final + n * 3 + i) % 10); setTimeout(step, 42); } else { cell.textContent = final; flip(cell); }
};
setTimeout(step, 60 + (i % 14) * 10);
});
})();
(() => {
const els = Array.from(document.querySelectorAll('[data-count]'));
if (!els.length || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
const STEPS = 12, EVERY = 40;
const run = (el) => {
const node = el.firstChild;
const m = node && node.nodeType === 3 && node.nodeValue.match(/^(\d+)(\.\d+)?/);
if (!m) return;
const final = node.nodeValue, target = parseFloat(m[0]), decimals = m[2] ? m[2].length - 1 : 0, rest = final.slice(m[0].length);
let i = 0;
const tick = () => {
i += 1;
node.nodeValue = i >= STEPS ? final : ((target * i) / STEPS).toFixed(decimals).padStart(m[0].length, '0') + rest;
if (i < STEPS) setTimeout(tick, EVERY);
};
tick();
};
const io = new IntersectionObserver((entries) => entries.forEach((e) => {
if (!e.isIntersecting) return;
io.unobserve(e.target);
run(e.target);
}), { threshold: 0.6 });
els.forEach((el) => io.observe(el));
})();
(() => {
document.querySelectorAll('[data-manifest]').forEach((root) => {
const lines = Array.from(root.querySelectorAll('details.mline'));
if (!lines.length) return;
const wide = window.matchMedia('(min-width: 1000px)');
const pointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const open = (d) => { if (d.open) return; lines.forEach((x) => { if (x !== d) x.open = false; }); d.open = true; };
let timer;
lines.forEach((d, i) => {
const row = d.querySelector('summary');
row.addEventListener('click', (e) => { if (wide.matches && d.open) e.preventDefault(); });
row.addEventListener('mouseenter', () => { if (!wide.matches || !pointer.matches) return; clearTimeout(timer); timer = setTimeout(() => open(d), 80); });
row.addEventListener('mouseleave', () => clearTimeout(timer));
row.addEventListener('focus', () => { if (wide.matches && row.matches(':focus-visible')) open(d); });
row.addEventListener('keydown', (e) => {
const to = e.key === 'ArrowDown' ? lines[i + 1] : e.key === 'ArrowUp' ? lines[i - 1] : null;
if (to) { e.preventDefault(); to.querySelector('summary').focus(); }
});
d.addEventListener('toggle', () => {
if (!d.open) return;
lines.forEach((x) => { if (x !== d) x.open = false; });
if (wide.matches) return;
const top = row.getBoundingClientRect().top, mast = (document.querySelector('.masthead')?.offsetHeight || 0) + 8;
if (top < mast) window.scrollTo({ top: window.scrollY + top - mast, behavior: 'instant' });
});
});
wide.addEventListener('change', () => { if (wide.matches && !lines.some((d) => d.open)) lines[0].open = true; });
});
})();
(() => {
const item = document.querySelector('.nav__item--menu');
const menu = item && item.querySelector('.mega');
if (!menu) return;
item.addEventListener('keydown', (e) => {
if (e.key !== 'Escape') return;
menu.setAttribute('data-closed', '');
item.querySelector('.nav__link').focus();
});
item.addEventListener('mouseleave', () => menu.removeAttribute('data-closed'));
item.addEventListener('focusout', (e) => { if (!item.contains(e.relatedTarget)) menu.removeAttribute('data-closed'); });
})();
(() => {
const els = Array.from(document.querySelectorAll('[data-reveal]'));
if (!els.length) return;
if (!('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('is-in')); return; }
const io = new IntersectionObserver((entries) => entries.forEach((e) => {
if (!e.isIntersecting) return;
e.target.classList.add('is-in');
io.unobserve(e.target);
}), { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
els.forEach((el) => io.observe(el));
})();