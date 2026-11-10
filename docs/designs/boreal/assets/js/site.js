window.UCM = {
$: (s, el = document) => el.querySelector(s),
$$: (s, el = document) => Array.from(el.querySelectorAll(s)),
calm: window.matchMedia('(prefers-reduced-motion: reduce)'),
};
(() => {
const { $, $$ } = UCM;
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
/* Masthead: a hairline appears once the page has scrolled. */
const mast = $('[data-masthead]');
if (mast) {
const onScroll = () => mast.toggleAttribute('data-scrolled', window.scrollY > 8);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });
}
/* Products menu. Hover and focus open it in CSS; the button makes it work by touch and keyboard,
and Escape closes it wherever the pointer happens to be. */
$$('[data-menu]').forEach((item) => {
const btn = $('.nav__toggle', item);
const set = (open) => { item.toggleAttribute('data-open', open); btn.setAttribute('aria-expanded', String(open)); };
btn.addEventListener('click', () => { item.removeAttribute('data-shut'); set(!item.hasAttribute('data-open')); });
item.addEventListener('keydown', (e) => {
if (e.key !== 'Escape') return;
set(false); item.setAttribute('data-shut', ''); btn.focus();
});
item.addEventListener('mouseleave', () => item.removeAttribute('data-shut'));
item.addEventListener('focusout', (e) => { if (!item.contains(e.relatedTarget)) { set(false); item.removeAttribute('data-shut'); } });
document.addEventListener('click', (e) => { if (!item.contains(e.target)) set(false); });
});
/* The phone action bar steps aside while the keyboard is up. */
const TYPING = 'input:not([type=radio],[type=checkbox],[type=file]), textarea, select';
document.addEventListener('focusin', (e) => { if (e.target.matches?.(TYPING)) document.body.classList.add('is-typing'); });
document.addEventListener('focusout', (e) => { if (e.target.matches?.(TYPING)) document.body.classList.remove('is-typing'); });
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
const { $$ } = UCM;
/* Open / closed, computed in each yard's own time zone.
data-hours = {"tz":"America/Anchorage","week":[null,[420,990],…]}  (Sunday first, minutes after midnight) */
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const clock = (m, always) => {
const h = Math.floor(m / 60), mm = m % 60, ap = h < 12 ? 'a.m.' : 'p.m.';
return `${((h + 11) % 12) + 1}${mm || always ? ':' + String(mm).padStart(2, '0') : ''} ${ap}`;
};
const partsIn = (tz) => Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' })
.formatToParts(new Date()).map((p) => [p.type, p.value]));
const yardStatus = ({ tz, week }) => {
const parts = partsIn(tz);
const day = DAYS.indexOf(parts.weekday), now = +parts.hour * 60 + +parts.minute;
const today = week[day];
if (today && now >= today[0] && now < today[1]) return { open: true, text: `Open now · until ${clock(today[1])}` };
for (let i = 0; i < 8; i++) {
const d = (day + i) % 7, h = week[d];
if (h && (i > 0 || now < h[0])) return { open: false, text: `Closed · opens ${i === 0 ? 'today' : i === 1 ? 'tomorrow' : DAYS[d]} ${clock(h[0])}` };
}
return { open: false, text: 'Closed' };
};
const paint = () => {
$$('[data-hours]').forEach((el) => {
try {
const s = yardStatus(JSON.parse(el.dataset.hours));
const text = el.hasAttribute('data-short') ? (s.open ? 'Open' : 'Closed') : s.text;
if (el.textContent !== text) el.textContent = text;
el.classList.toggle('is-open', s.open);
el.hidden = false;
} catch { /* leave hidden */ }
});
/* The yard's local time: "10:42 a.m." */
$$('[data-clock]').forEach((el) => {
try {
const p = partsIn(el.dataset.clock);
const text = clock(+p.hour * 60 + +p.minute, true);
if (el.textContent !== text) el.textContent = text;
} catch { /* leave empty */ }
});
};
paint();
setInterval(paint, 15 * 1000);
})();
(() => {
const { $, $$ } = UCM;
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
const placeParam = new URLSearchParams(location.search).get('location');
const placeField = $('input[name=location]', form);
if (placeParam && placeField) placeField.value = placeParam.slice(0, 80);
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
/* "Where are you building?" — the combobox, the route card and the map camera.
Markup and data come from finder() and mapPlate() in src/lib/components.mjs. The card is already
rendered for the example place; this script only fills its fields, so nothing shifts on load. */
(() => {
const { $, $$, calm } = UCM;
const fold = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’'.]/g, '').toLowerCase().trim();
const MAX_ZOOM = 2.8;
$$('[data-stage]').forEach((stage, n) => {
const finder = $('[data-finder]', stage);
const map = $('[data-map]', stage);
if (!finder || !map) return;
const data = JSON.parse($('[data-finder-data]', finder).textContent);
const places = data.places.map(([name, st, xy, lat, lon, region, access, yard]) => ({ name, st, xy, lat, lon, region, access, yard, key: fold(name) }));
const byName = new Map(places.map((p) => [p.name, p]));
const aliases = Object.entries(data.aliases).map(([alias, name]) => ({ alias, key: fold(alias), place: byName.get(name) }));
const SUGGEST = ['Anchorage', 'Fairbanks', 'Bethel', 'Nome', 'Kotzebue', 'Utqiaġvik', 'Juneau', 'Seattle'].map((s) => ({ p: byName.get(s) }));
const input = $('.finder__input', finder), list = $('.finder__list', finder), clear = $('[data-clear]', finder);
const route = $('[data-route]', finder), live = $('[data-live]', finder);
const cam = $('[data-cam]', map), arc = $('[data-arc]', map), dest = $('[data-dest]', map), destName = $('[data-dest-name]', map);
const reset = $('[data-reset]', stage);
const field = (k) => $(`[data-r="${k}"]`, route);
let active = -1, options = [], current = byName.get(data.example), zoomed = false;
/* ---- The card ---- */
const quoteUrl = (where, yard) => `${data.quote}?location=${encodeURIComponent(where)}${yard ? '&yard=' + yard : ''}`;
const showYard = (id) => $$('[data-y]', route).forEach((el) => { el.hidden = el.dataset.y !== id; });
const swap = () => {
if (calm.matches) return;
route.classList.add('is-swapping');
setTimeout(() => route.classList.remove('is-swapping'), 140);
};
let shown = [current.lat, current.lon], ticking = 0;
const fmt = (lat, lon) => `${Math.abs(lat).toFixed(2)}° N, ${Math.abs(lon).toFixed(2)}° W`;
const tick = (p) => {
const el = field('coords'), from = shown.slice(), t0 = performance.now(), id = ++ticking;
shown = [p.lat, p.lon];
if (calm.matches || !from[0]) { el.textContent = fmt(p.lat, p.lon); return; }
const step = (now) => {
if (id !== ticking) return;
const t = Math.min(1, (now - t0) / 700), e = 1 - Math.pow(1 - t, 3);
el.textContent = fmt(from[0] + (p.lat - from[0]) * e, from[1] + (p.lon - from[1]) * e);
if (t < 1) requestAnimationFrame(step);
};
requestAnimationFrame(step);
};
const fill = (p) => {
const acc = data.access[p.access], yard = data.yards[p.yard];
field('name').textContent = `${p.name}, ${data.states[p.st]}`;
field('eg').hidden = true;
field('region').textContent = p.region;
field('tag').textContent = acc.tag; field('tag').hidden = false;
tick(p);
showYard(p.yard);
[0, 1].forEach((i) => {
const m = acc.modes[i];
field('m' + i).textContent = m ? m[1].replace('{yard}', yard.name) : '';
field('m' + i).parentElement.hidden = !m;
$$(`[data-ic^="${i}-"]`, route).forEach((ic) => { ic.hidden = !m || ic.dataset.ic !== `${i}-${m[0]}`; });
});
field('how').hidden = false; field('else').hidden = true; field('note').hidden = false;
field('short').textContent = p.name;
field('quote').href = quoteUrl(`${p.name}, ${p.st}`, p.yard);
live.textContent = `${p.name}, ${data.states[p.st]}. ${acc.tag}. Yard to call: ${yard.name}, ${yard.phone}. ${acc.modes.map((m) => m[1].replace('{yard}', yard.name)).join('; ')}.`;
};
const fillUnknown = (text) => {
field('name').textContent = text;
field('eg').hidden = true;
field('region').textContent = 'Not on our short list';
field('tag').hidden = true;
ticking++; shown = [0, 0]; field('coords').textContent = '';
showYard('any');
field('how').hidden = true; field('else').hidden = false; field('note').hidden = true;
field('short').textContent = text;
field('quote').href = quoteUrl(text);
live.textContent = `${text} is not on our short list. Any yard can help. Use the quote button, or call a yard.`;
};
/* ---- The map ---- */
const arcPath = ([x1, y1], [x2, y2]) => {
const dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy) || 1;
const lift = Math.min(90, d * 0.22), nx = -dy / d, ny = dx / d, s = ny > 0 ? -1 : 1;
return `M${x1.toFixed(1)},${y1.toFixed(1)}Q${((x1 + x2) / 2 + nx * lift * s).toFixed(1)},${((y1 + y2) / 2 + ny * lift * s).toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`;
};
const setCam = (tx, ty, z) => {
cam.classList.add('is-flying');
cam.style.setProperty('--tx', tx.toFixed(1) + 'px');
cam.style.setProperty('--ty', ty.toFixed(1) + 'px');
cam.style.setProperty('--z', z.toFixed(3));
zoomed = z > 1.02;
map.toggleAttribute('data-zoomed', zoomed);
if (reset) reset.hidden = !zoomed;
};
const fly = (yard, place, name = '') => {
if (!yard) return setCam(0, 0, 1);
const W = map.offsetWidth, H = map.offsetHeight, k = W / data.w, phone = window.innerWidth < 700;
const mr = map.getBoundingClientRect(), cr = map.parentElement.getBoundingClientRect(), sr = stage.getBoundingClientRect(), fr = finder.getBoundingClientRect();
let left = Math.max(0, cr.left - mr.left, sr.left - mr.left), right = Math.min(W, cr.right - mr.left, sr.right - mr.left);
let top = Math.max(0, cr.top - mr.top, sr.top - mr.top), bottom = Math.min(H, cr.bottom - mr.top, sr.bottom - mr.top);
const beside = fr.top < mr.top + bottom - 40 && fr.bottom > mr.top + top + 40 && fr.right < mr.left + (left + right) / 2;
if (beside) left = Math.max(left, fr.right - mr.left + 16);          // wide: the finder sits over the map's left
else if (fr.top < mr.top + bottom) bottom = Math.max(top + 80, fr.top - mr.top); // band, phone: it overlaps the bottom edge
const east = place[0] >= yard[0], yardTag = 150, placeTag = phone ? 56 : 44 + name.length * 8;
const roomL = 20 + (east ? yardTag : placeTag), roomR = 20 + (east ? placeTag : yardTag);
const roomT = phone ? 64 : 48, roomB = phone ? 52 : 64;
const x0 = Math.min(yard[0], place[0]) * k, x1 = Math.max(yard[0], place[0]) * k, y0 = Math.min(yard[1], place[1]) * k, y1 = Math.max(yard[1], place[1]) * k;
const fw = Math.max(40, right - left - roomL - roomR), fh = Math.max(40, bottom - top - roomT - roomB);
const z = Math.max(1, Math.min(MAX_ZOOM, fw / Math.max(1, x1 - x0), fh / Math.max(1, y1 - y0)));
const tx = Math.min(0, Math.max(W - z * W, left + roomL + fw / 2 - z * (x0 + x1) / 2));
const ty = Math.min(0, Math.max(H - z * H, top + roomT + fh / 2 - z * (y0 + y1) / 2));
setCam(tx, ty, z);
};
const yardPins = $$('[data-yard]', map);
const draw = (p, { move = true } = {}) => {
yardPins.forEach((y) => { y.dataset.side = y.dataset.home || (y.dataset.home = y.dataset.side); y.removeAttribute('data-on'); });
if (!p) { dest.hidden = true; arc.setAttribute('d', 'M0,0'); map.removeAttribute('data-mode'); $$('.map__dot.is-dest', map).forEach((d) => d.classList.remove('is-dest')); if (move) fly(); return; }
$$('.map__dot.is-dest', map).forEach((d) => d.classList.remove('is-dest'));
$(`.map__dot[data-place="${CSS.escape(p.name)}"]`, map)?.classList.add('is-dest');
const yard = data.yards[p.yard], east = p.xy[0] >= yard.xy[0];
const same = Math.hypot(p.xy[0] - yard.xy[0], p.xy[1] - yard.xy[1]) < 5;
map.dataset.mode = p.access;
dest.hidden = same;
dest.style.left = (p.xy[0] / data.w * 100).toFixed(2) + '%';
dest.style.top = (p.xy[1] / data.h * 100).toFixed(2) + '%';
dest.dataset.side = east ? 'e' : 'w';            // wide screens: beside the dot, away from the yard
dest.dataset.vside = p.xy[1] > yard.xy[1] + 12 ? 's' : 'n'; // phones: above or below it
destName.textContent = p.name;
const pin = yardPins.find((y) => y.dataset.yard === p.yard);
if (pin) pin.setAttribute('data-on', '');
if (pin && !same) pin.dataset.side = east ? 'w' : 'e';
arc.setAttribute('d', same ? 'M0,0' : arcPath(yard.xy, p.xy));
arc.classList.remove('is-drawing');
void arc.getBoundingClientRect();
arc.classList.add('is-drawing');
if (move) fly(yard.xy, p.xy, p.name);
};
/* ---- Choosing ---- */
const press = (name) => $$('.chip[data-place]', finder).forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.place === name)));
const choose = (p, { typed = false } = {}) => {
current = p;
close();
input.value = p.name; clear.hidden = false;
press(p.name); swap(); fill(p); draw(p);
if (typed) input.blur();
};
const chooseUnknown = (text) => {
current = null;
close(); clear.hidden = false; press(''); swap(); fillUnknown(text.slice(0, 60)); draw(null);
};
/* ---- The combobox ---- */
const search = (q) => {
const k = fold(q);
if (!k) return SUGGEST;
const out = [];
places.forEach((p) => { const i = p.key.indexOf(k); if (i === 0) out.push({ p, rank: 0 }); else if (i > 0) out.push({ p, rank: p.key[i - 1] === ' ' ? 1 : 2 }); });
aliases.forEach((a) => { if (a.key.startsWith(k) && !out.some((o) => o.p === a.place)) out.push({ p: a.place, rank: 0, alias: a.alias }); });
return out.sort((a, b) => a.rank - b.rank || a.p.name.localeCompare(b.p.name)).slice(0, 8);
};
const setActive = (i) => {
active = i;
$$('[role=option]', list).forEach((el, j) => el.setAttribute('aria-selected', String(j === i)));
const el = list.children[i];
if (el && el.id) { input.setAttribute('aria-activedescendant', el.id); el.scrollIntoView({ block: 'nearest' }); } else input.removeAttribute('aria-activedescendant');
};
const open = () => {
options = search(input.value);
list.textContent = '';
options.forEach((o, i) => {
const li = document.createElement('li');
li.setAttribute('role', 'option'); li.id = `${list.id}-${i}`; li.setAttribute('aria-selected', 'false');
const name = document.createElement('span'); name.textContent = o.alias ? `${o.p.name} (${o.alias})` : o.p.name;
const meta = document.createElement('small'); meta.textContent = `${o.p.region}, ${o.p.st}`;
li.append(name, meta);
list.append(li);
});
if (!options.length) {
const li = document.createElement('li');
li.className = 'is-none'; li.setAttribute('role', 'option'); li.setAttribute('aria-disabled', 'true'); li.setAttribute('aria-selected', 'false');
li.textContent = 'Not on our short list. Press Enter and we will still point you to a yard.';
list.append(li);
}
list.hidden = false;
input.setAttribute('aria-expanded', 'true');
setActive(options.length && input.value.trim() ? 0 : -1);
};
function close() { list.hidden = true; input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); active = -1; }
input.addEventListener('input', () => { clear.hidden = !input.value; open(); });
input.addEventListener('focus', () => {
input.select(); open();
if (window.innerWidth < 700) input.scrollIntoView({ block: 'start', behavior: calm.matches ? 'auto' : 'smooth' });
});
input.addEventListener('blur', () => setTimeout(close, 120));
input.addEventListener('keydown', (e) => {
if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
e.preventDefault();
if (list.hidden) return open();
if (!options.length) return;
setActive((active + (e.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length);
} else if (e.key === 'Enter') {
e.preventDefault();
if (list.hidden) open();
const pick = options[active] || (input.value.trim() ? options[0] : null);
if (pick) choose(pick.p, { typed: true });
else if (input.value.trim()) chooseUnknown(input.value.trim());
} else if (e.key === 'Escape') {
if (!list.hidden) { e.preventDefault(); close(); }
}
});
list.addEventListener('mousedown', (e) => e.preventDefault());
list.addEventListener('click', (e) => {
const li = e.target.closest('[role=option]');
const o = li && options[Array.prototype.indexOf.call(list.children, li)];
if (o) choose(o.p, { typed: true });
});
clear.addEventListener('click', () => { input.value = ''; clear.hidden = true; input.focus(); });
finder.addEventListener('click', (e) => {
const chip = e.target.closest('.chip[data-place]');
if (chip && byName.has(chip.dataset.place)) choose(byName.get(chip.dataset.place));
});
map.addEventListener('click', (e) => {
const dot = e.target.closest('.map__dot');
if (dot && byName.has(dot.dataset.place)) choose(byName.get(dot.dataset.place));
});
if (reset) reset.addEventListener('click', () => fly());
if (!calm.matches) setTimeout(() => arc.classList.add('is-drawing'), 350);
/* Keep the framing through rotation and resize; rest the animations while the map is off screen. */
let t;
window.addEventListener('resize', () => {
clearTimeout(t);
t = setTimeout(() => { if (zoomed && current) fly(data.yards[current.yard].xy, current.xy, current.name); else if (zoomed) fly(); }, 150);
});
if ('IntersectionObserver' in window) {
new IntersectionObserver(([en]) => map.classList.toggle('is-paused', !en.isIntersecting)).observe(stage);
}
});
})();
/* "How a building package travels": the step crossing the middle of the screen sets the stage's
drawing and progress rail. Without this script the stage shows all five drawings. */
(() => {
const { $, $$ } = UCM;
$$('[data-journey]').forEach((root) => {
const stage = $('.jstage', root), count = $('[data-jcount]', root), steps = $$('.jstep', root);
if (!stage || !steps.length || !('IntersectionObserver' in window)) { steps.forEach((s) => s.classList.add('is-on')); return; }
const set = (n) => {
stage.dataset.step = n;
if (count) count.textContent = '0' + n;
steps.forEach((s) => s.classList.toggle('is-on', s.dataset.step === String(n)));
};
set(1);
const io = new IntersectionObserver((entries) => {
entries.forEach((en) => { if (en.isIntersecting) set(+en.target.dataset.step); });
}, { rootMargin: '-56% 0px -43% 0px' });
steps.forEach((s) => io.observe(s));
});
})();
/* Product lines on the home page: the photograph beside the list follows the row under the pointer
or the keyboard focus. Photographs load the first time their row is visited. */
(() => {
const { $$ } = UCM;
$$('[data-lines]').forEach((root) => {
const rows = $$('.line', root), shots = $$('.lines__shot', root);
if (!shots.length) return;
let on = 0;
rows[0].classList.add('is-on');
const show = (i) => {
if (i === on || !shots[i]) return;
on = i;
rows.forEach((r, j) => r.classList.toggle('is-on', j === i));
shots[i].classList.add('is-ready');
requestAnimationFrame(() => requestAnimationFrame(() => shots.forEach((s, j) => s.classList.toggle('is-on', j === on))));
};
shots.forEach((s, j) => s.addEventListener('transitionend', () => { if (j !== on) s.classList.remove('is-ready'); }));
rows.forEach((r, i) => {
r.addEventListener('pointerenter', () => show(i));
r.addEventListener('focus', () => show(i));
});
});
})();
/* Scroll reveal: .reveal elements ease in once as they arrive. CSS hides them only when this script
is present and motion is welcome, so nothing depends on it. */
(() => {
const { $$, calm } = UCM;
const els = $$('.reveal');
if (!els.length) return;
if (calm.matches || !('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('is-in')); return; }
const io = new IntersectionObserver((entries) => {
entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
}, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
els.forEach((el) => io.observe(el));
})();