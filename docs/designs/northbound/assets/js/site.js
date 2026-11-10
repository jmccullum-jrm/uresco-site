const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
(() => {
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
})();
(() => {
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
const item = $('[data-menu]');
if (!item) return;
const btn = $('.nav__toggle', item);
const set = (open) => {
item.toggleAttribute('data-open', open);
btn.setAttribute('aria-expanded', String(open));
};
btn.addEventListener('click', () => set(!item.hasAttribute('data-open')));
item.addEventListener('keydown', (e) => {
if (e.key === 'Escape' && item.hasAttribute('data-open')) { set(false); btn.focus(); }
});
item.addEventListener('focusout', (e) => { if (!item.contains(e.relatedTarget)) set(false); });
document.addEventListener('click', (e) => { if (!item.contains(e.target)) set(false); });
})();
(() => {
const frames = $$('[data-parallax]');
if (!frames.length || !('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
const live = new Set();
let queued = false;
const run = () => {
queued = false;
const vh = window.innerHeight;
live.forEach((frame) => {
const r = frame.getBoundingClientRect();
const c = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2); // -1 below … 1 above
const img = $('img', frame);
if (img) img.style.translate = `0 ${(c * -0.06 * r.height).toFixed(1)}px`;
});
};
const queue = () => { if (!queued) { queued = true; requestAnimationFrame(run); } };
const io = new IntersectionObserver((entries) => {
entries.forEach((e) => (e.isIntersecting ? live.add(e.target) : live.delete(e.target)));
queue();
}, { rootMargin: '12% 0px' });
frames.forEach((f) => io.observe(f));
window.addEventListener('scroll', queue, { passive: true });
window.addEventListener('resize', queue);
})();
(() => {
$$('[data-plate]').forEach((plate) => {
const frame = $('.plate__scroll', plate), sheet = $('.plate__sheet', plate);
let placed = false;
const fit = () => {
const pans = frame.scrollWidth - frame.clientWidth > 4;
if (pans) {
frame.tabIndex = 0;
frame.setAttribute('role', 'group');
frame.setAttribute('aria-label', 'Map. Scroll sideways to see the whole route.');
if (!placed) { frame.scrollLeft = Math.max(0, sheet.offsetWidth * 0.39 - frame.clientWidth / 2); placed = true; }
} else {
frame.removeAttribute('tabindex'); frame.removeAttribute('role'); frame.removeAttribute('aria-label');
}
plate.classList.toggle('is-pannable', pans);
};
fit();
window.addEventListener('resize', fit);
});
$$('[data-finder]').forEach((finder) => {
const plate = document.getElementById(finder.dataset.finder);
if (!plate) return;
const frame = $('.plate__scroll', plate), sheet = $('.plate__sheet', plate);
const buttons = $$('button[data-region]', finder);
let pinned = '';
const paint = (region) => {
if (region) plate.setAttribute('data-show', region); else plate.removeAttribute('data-show');
};
const pin = (region, from) => {
pinned = pinned === region ? '' : region;
buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.region === pinned)));
paint(pinned);
if (!pinned) return;
const x = +from.dataset.x || 0.4;
if (frame.scrollWidth - frame.clientWidth > 4) frame.scrollTo({ left: Math.max(0, sheet.offsetWidth * x - frame.clientWidth / 2), behavior: 'smooth' });
const r = plate.getBoundingClientRect();
if (r.top < 60 || r.top > window.innerHeight * 0.55) window.scrollTo({ top: window.scrollY + r.top - 110, behavior: 'smooth' });
};
buttons.forEach((b) => {
b.addEventListener('click', () => pin(b.dataset.region, b));
b.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') paint(b.dataset.region); });
b.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') paint(pinned); });
b.addEventListener('focus', () => paint(b.dataset.region));
b.addEventListener('blur', () => paint(pinned));
});
finder.classList.add('is-live');
});
})();
(() => {
const secs = $$('[data-lat]');
if (!secs.length) return;
const rail = $('[data-rail]');
const needle = $('[data-needle]');
const reads = $$('.rail [data-read], .latchip [data-read]');
const places = $$('.rail [data-place], .latchip [data-place]');
const progress = $('[data-progress]');
const stops = $$('[data-stop]');
const lo = rail ? +rail.dataset.lo : 46, hi = rail ? +rail.dataset.hi : 72;
let boxes = [], first = 0, last = 1, shownLat = '', shownPlace = '', queued = false;
const measure = () => {
boxes = secs.map((s) => {
const r = s.getBoundingClientRect();
return { top: r.top + window.scrollY, h: r.height, a: +s.dataset.lat, b: +(s.dataset.latTo || s.dataset.lat), place: s.dataset.place || '', end: s.dataset.placeEnd };
});
first = boxes[0].a;
last = Math.max(...boxes.map((b) => Math.max(b.a, b.b)));
};
const update = () => {
queued = false;
const y = window.scrollY + window.innerHeight * 0.5;
let lat = boxes[0].a, place = boxes[0].place;
for (const b of boxes) {
if (y < b.top) break;
const t = Math.min(1, Math.max(0, (y - b.top) / Math.max(1, b.h)));
const k = Math.min(1, Math.max(0, (t - 0.1) / 0.75));
lat = b.a + (b.b - b.a) * k;
place = b.end && k >= 0.98 ? b.end : b.place;
}
const text = lat.toFixed(1) + '°N';
if (text !== shownLat) { reads.forEach((el) => { el.textContent = text; }); shownLat = text; }
if (place !== shownPlace) { places.forEach((el) => { el.textContent = place; }); shownPlace = place; }
if (needle) {
const p = (hi - lat) / (hi - lo);
needle.style.transform = `translateY(${(p * 100).toFixed(2)}%)`;
needle.classList.toggle('is-low', p > 0.62);
}
if (progress) progress.style.setProperty('--p', ((lat - first) / Math.max(0.1, last - first)).toFixed(3));
stops.forEach((s) => {
const at = +s.dataset.stop;
s.classList.toggle('is-past', lat > at + 0.05);
if (Math.abs(lat - at) <= 0.05) s.setAttribute('aria-current', 'true'); else s.removeAttribute('aria-current');
});
};
const queue = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
const remeasure = () => { measure(); queue(); };
measure(); update();
window.addEventListener('scroll', queue, { passive: true });
window.addEventListener('resize', remeasure);
window.addEventListener('load', remeasure);
if ('ResizeObserver' in window) new ResizeObserver(remeasure).observe($('main'));
})();
(() => {
const els = $$('.rv, .rv-img, .rv-line, [data-plate]');
if (!els.length) return;
const show = (el) => el.classList.add('is-in');
if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) { els.forEach(show); return; }
const watched = new Map();
const watch = (io, el) => {
const target = el.classList.contains('rv-img') ? el.parentElement : el;
watched.set(target, (watched.get(target) || []).concat(el));
io.observe(target);
};
const make = (opts) => {
const io = new IntersectionObserver((entries) => entries.forEach((e) => {
if (!e.isIntersecting) return;
(watched.get(e.target) || []).forEach(show);
watched.delete(e.target);
io.unobserve(e.target);
}), opts);
return io;
};
const io = make({ rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
const plates = make({ threshold: 0.3 });
els.forEach((el) => watch(el.hasAttribute('data-plate') ? plates : io, el));
})();
(() => {
const wide = matchMedia('(min-width: 1000px)');
$$('[data-stock]').forEach((root) => {
const imgs = $$('.stock__frame img', root);
const rows = $$('.stock__row', root);
const show = (i) => {
if (!wide.matches || !imgs[i]) return;
const img = imgs[i];
rows.forEach((r, j) => r.classList.toggle('is-on', j === i));
const on = () => imgs.forEach((x) => x.classList.toggle('is-on', x === img));
if (img.dataset.srcset) {
img.srcset = img.dataset.srcset; img.src = img.dataset.src;
delete img.dataset.srcset;
}
if (img.complete && img.naturalWidth > 1) on(); else img.addEventListener('load', on, { once: true });
};
rows.forEach((r, i) => {
r.addEventListener('pointerenter', () => show(i));
r.addEventListener('focus', () => show(i));
});
});
})();