window.UCM = {
$: (s, el = document) => el.querySelector(s),
$$: (s, el = document) => Array.from(el.querySelectorAll(s)),
calm: window.matchMedia('(prefers-reduced-motion: reduce)'),
};
(() => {
const { $, $$ } = UCM;
/* Dialogs: [data-open="id"] opens, [data-close] or a backdrop click closes.
Openers are links wherever they can be, so without this script (or a browser without <dialog>)
they still lead to the locations page or the footer index. */
const onBackdrop = (e, d) => {
const r = d.getBoundingClientRect();
return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
};
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
if (e.target instanceof HTMLDialogElement && onBackdrop(e, e.target)) e.target.close();
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
/* Products menu. Hover opens it in CSS; the button makes it work by touch and keyboard, and is the only
way in from the keyboard. aria-expanded always says what is on screen, and Escape closes the menu
wherever the pointer or the focus happens to be. data-shut holds it closed under a resting pointer. */
$$('[data-menu]').forEach((item) => {
const btn = $('.nav__toggle', item);
const showing = () => item.hasAttribute('data-open') || (item.matches(':hover') && !item.hasAttribute('data-shut'));
const paint = () => btn.setAttribute('aria-expanded', String(showing()));
const shut = () => { item.removeAttribute('data-open'); item.toggleAttribute('data-shut', item.matches(':hover')); paint(); };
btn.addEventListener('click', () => {
if (showing()) return shut();
item.removeAttribute('data-shut'); item.setAttribute('data-open', ''); paint();
});
document.addEventListener('keydown', (e) => {
if (e.key !== 'Escape' || !showing()) return;
const inside = item.contains(document.activeElement);
shut();
if (inside) btn.focus();
});
item.addEventListener('mouseenter', paint);
item.addEventListener('mouseleave', () => { item.removeAttribute('data-shut'); paint(); });
item.addEventListener('focusout', (e) => { if (!item.contains(e.relatedTarget)) { item.removeAttribute('data-open'); paint(); } });
document.addEventListener('click', (e) => { if (!item.contains(e.target)) { item.removeAttribute('data-open'); paint(); } });
});
/* The generic quote buttons (action bar, masthead, closing band) follow the page's own quote link, so the
yellow button in view always carries what was just chosen on the map or ticked on a product line. */
const carried = $$('[data-quote-link]');
const source = $('[data-r="quote"], [data-pline-quote]');
if (carried.length && source) {
const copy = () => carried.forEach((a) => a.setAttribute('href', source.href));
copy();
new MutationObserver(copy).observe(source, { attributes: true, attributeFilter: ['href'] });
}
/* Motion that runs on its own can be paused. One setting for the whole site, remembered between pages.
html.is-still pauses only the endless animations (see 30-components.css), so a line that is still
drawing itself finishes, and a loop that starts later obeys the same setting. */
const root = document.documentElement;
const toggles = $$('[data-motion]');
const STILL = 'ucm-still';
const isLoop = (a) => { try { return a.effect.getComputedTiming().iterations === Infinity; } catch { return false; } };
if (toggles.length && document.getAnimations) {
let still = false;
try { still = localStorage.getItem(STILL) === '1'; } catch { /* no storage: lasts for this page */ }
const label = () => {
root.classList.toggle('is-still', still);
toggles.forEach((b) => { $('span', b).textContent = still ? 'Play motion' : 'Pause motion'; });
};
if (document.getAnimations().some(isLoop)) toggles.forEach((b) => { b.hidden = false; });
label();
toggles.forEach((b) => b.addEventListener('click', () => {
still = !still;
label();
try { still ? localStorage.setItem(STILL, '1') : localStorage.removeItem(STILL); } catch { /* fine */ }
}));
}
/* The phone action bar steps aside while the keyboard is up. */
const TYPING = 'input:not([type=radio],[type=checkbox],[type=file]), textarea, select';
document.addEventListener('focusin', (e) => { if (e.target.matches?.(TYPING)) document.body.classList.add('is-typing'); });
document.addEventListener('focusout', (e) => { if (e.target.matches?.(TYPING)) document.body.classList.remove('is-typing'); });
})();
(() => {
const { $$ } = UCM;
/* Open / closed, computed in each yard's own time zone. The word and nothing more: the hours in the
data are placeholders, so no opening or closing time is ever written out.
data-hours = {"tz":"America/Anchorage","week":[null,[420,990],…],"closedDates":["2026-11-26",…]}
(week is Sunday first, in minutes after midnight; closedDates are in the yard's own calendar) */
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const partsIn = (tz) => Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' })
.formatToParts(new Date()).map((p) => [p.type, p.value]));
const isOpen = ({ tz, week, closedDates = [] }) => {
const parts = partsIn(tz);
if (closedDates.includes(`${parts.year}-${parts.month}-${parts.day}`)) return false;
const today = week[DAYS.indexOf(parts.weekday)], now = +parts.hour * 60 + +parts.minute;
return !!today && now >= today[0] && now < today[1];
};
/* The local clock beside a yard: "10:42 a.m." */
const clockText = (m) => {
const h = Math.floor(m / 60);
return `${((h + 11) % 12) + 1}:${String(m % 60).padStart(2, '0')} ${h < 12 ? 'a.m.' : 'p.m.'}`;
};
const paint = () => {
$$('[data-hours]').forEach((el) => {
try {
const open = isOpen(JSON.parse(el.dataset.hours));
const text = open ? 'Open' : 'Closed';
if (el.textContent !== text) el.textContent = text;
el.classList.toggle('is-open', open);
el.hidden = false;
} catch { /* leave hidden */ }
});
$$('[data-clock]').forEach((el) => {
try {
const p = partsIn(el.dataset.clock);
const text = clockText(+p.hour * 60 + +p.minute);
if (el.textContent !== text) el.textContent = text;
} catch { /* leave empty */ }
});
};
paint();
setInterval(paint, 15 * 1000);
})();
(() => {
const { $, $$, calm } = UCM;
const query = new URLSearchParams(location.search);
const fold = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’'.]/g, '').toLowerCase().trim();
const put = (k, v) => $$(`[data-s="${k}"]`).forEach((el) => { if (el.textContent !== v) el.textContent = v; });
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
const yardId = () => yardSel?.selectedOptions[0]?.dataset.id || '';
const yardOf = (id) => (yardSel ? $$('option', yardSel).find((o) => o.dataset.id === id) : null);
const yardName = (id) => yardOf(id)?.value || '';
const placeField = $('input[name=location]', form);
const materials = $('textarea[name=materials]', form);
let yardPicked = false, deliveryPicked = false;
const carried = $('[data-carried]');
const draftText = $('[data-draft-text]', form);
const draftClear = $('[data-draft-clear]', form);
const draftUndo = $('[data-draft-undo]', form);
const draftSays = (t) => { if (draftText) draftText.textContent = t + (lost.length ? ' Your files need attaching again.' : ''); if (draftClear) draftClear.hidden = false; };
let lost = [];
const fields = () => $$('input, select, textarea', form).filter((el) => el.name && el.type !== 'file' && el.type !== 'hidden');
const typed = () => fields().some((el) => el.matches('input:not([type=radio],[type=checkbox]), textarea') && el.value.trim());
const PRIVATE = /^(ein|bank|bank_contact|signature|signed|agree)$/;
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
let linkApplied = false;
try {
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
const prefill = () => {
const product = query.get('product');
if (product && materials) {
const have = materials.value;
const fresh = product.split('\n').map((l) => l.trim()).filter((l) => l && !have.includes(l)).map((l) => l + ':');
if (fresh.length) materials.value = (have.trim() ? have.trimEnd() + '\n' : '') + fresh.join('\n') + '\n';
}
const yardParam = (query.get('yard') || '').toLowerCase();
if (yardOf(yardParam)) { yardSel.value = yardOf(yardParam).value; yardPicked = true; }
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
if (p && !deliveryPicked) {
const want = p.access === 'coastal' || p.access === 'seasonal' ? 'Remote Alaska shipping' : 'Job-site delivery';
$$('input[name=delivery]', form).forEach((r) => { r.checked = r.value === want; });
}
if (yardHint) yardHint.textContent = p && !yardPicked ? `Picked for ${p.name}. Change it if you work with another yard.` : yardHintDefault;
const yard = yardId();
const acc = p && geo.access[p.access];
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
const listed = materials ? materials.value.split('\n').map((l) => l.trim()).filter(Boolean) : [];
put('attached', files.length ? (files.length === 1 ? files[0].name : `${files.length} files attached`) : listed.length ? listed[0].replace(/:$/, '') + (listed.length > 1 ? ' and more' : '') : 'Nothing attached yet');
};
const paint = () => { paintPlace(); paintYard(); paintProgress(); paintDetails(); };
if (yardSel) yardSel.addEventListener('input', () => { yardPicked = true; });
if (yardSel) yardSel.addEventListener('change', () => { yardPicked = true; save(); });
$$('input[name=delivery]', form).forEach((r) => r.addEventListener('input', () => { deliveryPicked = true; }));
form.addEventListener('input', paint);
form.addEventListener('change', paint);
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
input.addEventListener('change', () => add(Array.from(input.files)));
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
err.textContent = !bad ? '' : el.type === 'checkbox' ? 'Please confirm to continue.' : el.validity.valueMissing ? (el.dataset.missing || 'Required.') : el.type === 'email' ? 'Enter an email address like name@company.com.' : 'Check this field.';
}
return !bad;
};
const labelOf = (el) => (el.dataset.label || form.querySelector(`label[for="${el.id}"]`)?.childNodes[0]?.textContent.trim() || el.name);
const validate = () => {
const bad = $$('[required]', form).filter((el) => !check(el));
if (bad.length) bad[0].focus();
if (leftLine) {
leftLine.dataset.hold = bad.length ? '1' : '';
if (bad.length) leftLine.textContent = `${bad.length} ${bad.length === 1 ? 'field needs' : 'fields need'} your attention: ${bad.map(labelOf).join(', ')}.`;
}
return !bad.length;
};
$$('[required]', form).forEach((el) => ['blur', 'change'].forEach((t) => el.addEventListener(t, () => {
if (el.getAttribute('aria-invalid') === 'true') {
check(el);
if (leftLine && leftLine.dataset.hold) { leftLine.dataset.hold = ''; paintProgress(); }
}
})));
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
const { text, files, held } = summary();
const subject = `${form.dataset.subject} — ${data.get('company') || data.get('name')}${data.get('location') ? ' — ' + data.get('location') : ''}`;
const link = (body) => `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
const long = link(text).length > 1800;
const mail = long ? link('The details are too long for an email link, so they are pasted below.\n\n') : link(text);
if (!long) window.location.href = mail;
$$('[data-mail-note]', done).forEach((n) => { n.hidden = !files.length; });
$$('[data-mail-held]', done).forEach((n) => { n.hidden = !held; });
$$('[data-mail-to]', done).forEach((n) => { n.textContent = to; });
$$('[data-mail-short]', done).forEach((n) => { n.hidden = long; });
$$('[data-mail-long]', done).forEach((n) => { n.hidden = !long; });
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
const back = $('[data-back]', host);
if (back) back.addEventListener('click', () => {
done.hidden = true; form.hidden = false;
save();
try { sessionStorage.removeItem(DRAFT); } catch { /* ignore */ }
form.tabIndex = -1;
form.focus({ preventScroll: true });
window.scrollTo({ top: form.getBoundingClientRect().top + window.scrollY - 120 });
});
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
const SUGGEST = ['Anchorage', 'Fairbanks', 'Bethel', 'Nome', 'Kotzebue', 'Utqiaġvik', 'Juneau', 'Seattle'].map((s) => byName.get(s)).filter(Boolean).map((p) => ({ p }));
const input = $('.finder__input', finder), list = $('.finder__list', finder), clear = $('[data-clear]', finder), go = $('[data-go]', finder);
const route = $('[data-route]', finder), live = $('[data-live]', finder);
const cam = $('[data-cam]', map), arc = $('[data-arc]', map), dest = $('[data-dest]', map), destName = $('[data-dest-name]', map);
const reset = $('[data-reset]', stage);
const field = (k) => $(`[data-r="${k}"]`, route);
let active = -1, options = [], current = byName.get(data.example), zoomed = false;
/* ---- The card ---- */
const quoteQuery = (where, yard) => `?location=${encodeURIComponent(where)}${yard ? '&yard=' + yard : ''}`;
const quoteUrl = (where, yard) => data.quote + quoteQuery(where, yard);
const generic = $$('a[href]:not([data-quote-link])').filter((a) => a !== field('quote') && a.host === location.host && /\/quote\/$/.test(a.pathname) && !a.search);
const carry = (where, yard) => generic.forEach((a) => a.setAttribute('href', data.quote + quoteQuery(where, yard) + a.hash));
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
carry(`${p.name}, ${p.st}`, p.yard);
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
carry(text);
live.textContent = `${text} is not on our short list. Any yard can help: Kent for Puget Sound and the Pacific Northwest, Anchorage for Southcentral and remote Alaska, Fairbanks for the Interior and points north.`;
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
const W = map.offsetWidth, H = map.offsetHeight, k = W / data.w, phone = matchMedia('(max-width: 43.6875em)').matches;
const mr = map.getBoundingClientRect(), cr = map.parentElement.getBoundingClientRect(), sr = stage.getBoundingClientRect(), fr = finder.getBoundingClientRect();
let left = Math.max(0, cr.left - mr.left, sr.left - mr.left), right = Math.min(W, cr.right - mr.left, sr.right - mr.left);
let top = Math.max(0, cr.top - mr.top, sr.top - mr.top), bottom = Math.min(H, cr.bottom - mr.top, sr.bottom - mr.top);
const slideX = left, slideY = top;
const beside = fr.top < mr.top + bottom - 40 && fr.bottom > mr.top + top + 40 && fr.right < mr.left + (left + right) / 2;
if (beside) left = Math.max(left, fr.right - mr.left + 16);          // wide: the finder sits over the map's left
else if (fr.top < mr.top + bottom) bottom = Math.max(top + 80, fr.top - mr.top); // band, phone: it overlaps the bottom edge
const east = place[0] >= yard[0], yardTag = 150, placeTag = phone ? 8 + name.length * 4.5 : 44 + name.length * 8;
const roomL = 20 + (east ? yardTag : placeTag), roomR = 20 + (east ? placeTag : yardTag);
const roomT = phone ? 64 : 48, roomB = phone ? 52 : 64;
const x0 = Math.min(yard[0], place[0]) * k, x1 = Math.max(yard[0], place[0]) * k, y0 = Math.min(yard[1], place[1]) * k, y1 = Math.max(yard[1], place[1]) * k;
const fw = Math.max(40, right - left - roomL - roomR), fh = Math.max(40, bottom - top - roomT - roomB);
const z = Math.max(1, Math.min(MAX_ZOOM, fw / Math.max(1, x1 - x0), fh / Math.max(1, y1 - y0)));
let tx = left + roomL + fw / 2 - z * (x0 + x1) / 2;
if (phone) { const px = place[0] * k * z; tx = Math.min(right - placeTag - 10 - px, Math.max(left + placeTag + 10 - px, tx)); }
tx = Math.min(slideX, Math.max(W - z * W, tx));
const ty = Math.min(slideY, Math.max(H - z * H, top + roomT + fh / 2 - z * (y0 + y1) / 2));
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
let answered = '';
const syncButtons = () => { clear.hidden = !input.value; go.hidden = !input.value.trim() || input.value === answered; };
const dismissKeyboard = () => { if (matchMedia('(pointer: coarse)').matches) input.blur(); };
const choose = (p, { typed = false } = {}) => {
current = p;
close();
input.value = p.name; answered = p.name; syncButtons();
press(p.name); swap(); fill(p); draw(p);
if (typed) dismissKeyboard();
};
const showCard = () => {
if (!matchMedia('(max-width: 43.6875em)').matches) return;
const bar = $('.actionbar'), mast = $('[data-masthead]');
const floor = (bar ? bar.getBoundingClientRect().top : window.innerHeight) - 12;
const ceiling = (mast ? mast.offsetHeight : 0) + 12;
const box = route.getBoundingClientRect(), by = Math.min(box.bottom - floor, box.top - ceiling);
if (by > 0) window.scrollBy({ top: by, behavior: calm.matches ? 'auto' : 'smooth' });
};
const chooseUnknown = (text) => {
current = null;
answered = input.value; syncButtons();
close(); press(''); swap(); fillUnknown(text.slice(0, 60)); draw(null);
dismissKeyboard();
};
const submit = () => {
const text = input.value.trim();
const pick = (!list.hidden && options[active]) || (text ? search(text)[0] : null);
if (pick && pick.p) choose(pick.p, { typed: true });
else if (text) chooseUnknown(text);
};
/* ---- The combobox ---- */
const search = (q) => {
const k = fold(q).split(',')[0].replace(/\s+(ak|alaska|wa|washington)$/, '').trim();
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
const meta = document.createElement('small'); meta.textContent = /Alaska|Washington/.test(o.p.region) ? o.p.region : `${o.p.region}, ${o.p.st}`;
li.append(name, meta);
list.append(li);
});
if (!options.length) {
const text = input.value.trim();
options = [{ unknown: text }];
const li = document.createElement('li');
li.setAttribute('role', 'option'); li.id = `${list.id}-0`; li.setAttribute('aria-selected', 'false');
const name = document.createElement('span'); name.textContent = `Use ${text}`;
const meta = document.createElement('small'); meta.textContent = 'Any yard can help';
li.append(name, meta);
list.append(li);
}
list.hidden = false;
input.setAttribute('aria-expanded', 'true');
setActive(input.value.trim() ? 0 : -1);
};
function close() { list.hidden = true; input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); active = -1; }
input.addEventListener('input', () => { syncButtons(); open(); });
input.addEventListener('focus', () => {
input.select(); open();
if (matchMedia('(max-width: 43.6875em)').matches) input.scrollIntoView({ block: 'start', behavior: calm.matches ? 'auto' : 'smooth' });
});
input.addEventListener('blur', () => setTimeout(close, 120));
input.addEventListener('keydown', (e) => {
if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
e.preventDefault();
if (list.hidden) return open();
setActive((active + (e.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length);
} else if (e.key === 'Enter') {
e.preventDefault();
submit();
} else if (e.key === 'Escape') {
if (!list.hidden) { e.preventDefault(); close(); }
}
});
list.addEventListener('mousedown', (e) => e.preventDefault());
list.addEventListener('click', (e) => {
const li = e.target.closest('[role=option]');
const o = li && options[Array.prototype.indexOf.call(list.children, li)];
if (o && o.p) choose(o.p, { typed: true }); else if (o) chooseUnknown(o.unknown);
});
clear.addEventListener('click', () => { input.value = ''; syncButtons(); input.focus(); });
go.addEventListener('mousedown', (e) => e.preventDefault());
go.addEventListener('click', submit);
finder.addEventListener('click', (e) => {
const chip = e.target.closest('.chip[data-place]');
if (chip && byName.has(chip.dataset.place)) { choose(byName.get(chip.dataset.place)); showCard(); }
});
map.addEventListener('click', (e) => {
const dot = e.target.closest('.map__dot');
if (dot && byName.has(dot.dataset.place)) { choose(byName.get(dot.dataset.place)); showCard(); }
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
const items = rows.map((r) => r.closest('li'));
let on = 0;
items[0].classList.add('is-on');
const show = (i) => {
if (i === on || !shots[i]) return;
on = i;
items.forEach((li, j) => li.classList.toggle('is-on', j === i));
shots[i].classList.add('is-ready');
requestAnimationFrame(() => requestAnimationFrame(() => shots.forEach((s, j) => s.classList.toggle('is-on', j === on))));
};
shots.forEach((s, j) => s.addEventListener('transitionend', () => { if (j !== on) s.classList.remove('is-ready'); }));
items.forEach((li, i) => {
li.addEventListener('pointerenter', () => show(i));
li.addEventListener('focusin', () => show(i));
});
});
})();
/* The Pacific Northwest and Locations pages: small things around the maps. Everything here is an extra:
without it the town chips are plain links to a pre-filled quote and the lanes simply keep moving. */
(() => {
const { $, $$, calm } = UCM;
/* The Puget Sound close-up: a town chip under the pointer or the keyboard picks out its line and its
name on the map, so the list and the map read as one thing. */
const sound = $('[data-sound]');
if (sound) {
const mark = (name, on) => $$(`.pn-spoke[data-town="${name}"], .pn-town[data-town="${name}"]`, sound).forEach((el) => el.toggleAttribute('data-on', on));
$$('.chip[data-town]', sound).forEach((chip) => {
const on = () => mark(chip.dataset.town, true), off = () => mark(chip.dataset.town, false);
chip.addEventListener('mouseenter', on);
chip.addEventListener('mouseleave', off);
chip.addEventListener('focus', on);
chip.addEventListener('blur', off);
});
}
/* The ruler on the About page draws its line once, when it arrives. */
$$('.ab-ruler').forEach((ruler) => {
if (calm.matches || !('IntersectionObserver' in window)) { ruler.classList.add('is-in'); return; }
const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { ruler.classList.add('is-in'); io.disconnect(); } }, { threshold: 0.2 });
io.observe(ruler);
});
/* A map without a finder still pauses its repainting lanes when it is off screen. */
$$('[data-map]').forEach((map) => {
if (map.closest('[data-stage]') || !('IntersectionObserver' in window)) return;
new IntersectionObserver(([en]) => map.classList.toggle('is-paused', !en.isIntersecting)).observe(map);
});
})();
/* Products.
1. The index (/products/): a field that narrows the nine lines as you type. It searches product
names, what each is for, brands and trade abbreviations; matching products show their note.
2. A line page: "Add to quote" on any product. The list is kept for the visit (sessionStorage),
so products from several lines can reach one request, and every quote link on the page carries
it to the quote form. The button says which state it is in ("Add to quote" / "On the quote"),
so it carries no pressed state of its own.
Both are extras: without this script the index is the full list and the buttons carry the line. */
(() => {
const { $, $$ } = UCM;
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
/* ---- The list of picks, shared by the line pages and the index ---- */
const KEY = 'uresco.picks';
const readPicks = () => { try { return JSON.parse(sessionStorage.getItem(KEY)) || []; } catch { return []; } };
const writePicks = (list) => { try { if (list.length) sessionStorage.setItem(KEY, JSON.stringify(list)); else sessionStorage.removeItem(KEY); } catch { /* storage blocked: the list still works on this page */ } };
const productText = (list, own) => {
const byLine = new Map();
list.forEach(({ line, item }) => byLine.set(line, [...(byLine.get(line) || []), item]));
if (own && !byLine.has(own)) byLine.set(own, []);
return [...byLine].map(([line, items]) => line + (items.length ? ' — ' + items.join(', ') : '')).join('\n');
};
const carrier = (lineLinks) => {
const bare = $$('a[href]').filter((a) => a.host === location.host && /\/quote\/$/.test(a.pathname) && !a.search && !a.hash).map((a) => [a, null]);
const links = [...lineLinks, ...bare].map(([a, own]) => ({ a, own, was: a.getAttribute('href') }));
return (list) => links.forEach(({ a, own, was }) => a.setAttribute('href', list.length ? was.split('?')[0] + '?product=' + encodeURIComponent(productText(list, own)) : was));
};
const root = $('[data-pidx]');
if (root) {
const input = $('[data-pidx-q]', root), clear = $('[data-pidx-clear]', root), count = $('[data-pidx-count]', root), none = $('[data-pidx-none]', root), more = $('[data-pidx-more]', root);
const tries = $$('[data-pidx-try]', root);
const rows = $$('[data-pidx-row]', root).map((el) => ({
el, text: norm(el.dataset.s),
items: $$('[data-pidx-item]', el).map((li) => ({ li, note: $('small', li), text: norm(li.dataset.s) })),
}));
const all = count.innerHTML;
const STOP = new Set(['a', 'an', 'and', 'for', 'in', 'of', 'on', 'the', 'to', 'with']);
const has = (text, words) => words.every((w) => (' ' + text).includes(' ' + w));
const apply = () => {
const words = norm(input.value).replace(/(\d) (?:x|by) (\d)/g, '$1x$2').split(' ').filter(Boolean);
const on = words.length > 0;
const exact = !on || rows.some((r) => has(r.text, words) || r.items.some((it) => has(it.text, words)));
const wide = words.filter((w) => w.length > 1 && !STOP.has(w));
const test = exact ? (t) => has(t, words) : (t) => wide.some((w) => (' ' + t).includes(' ' + w));
let lines = 0, products = 0;
rows.forEach((r) => {
let hits = 0;
r.items.forEach((it) => {
const hit = on && test(it.text);
it.li.classList.toggle('is-hit', hit);
it.note.hidden = !hit;
if (hit) hits++;
});
const show = !on || hits > 0 || test(r.text);
r.el.hidden = !show;
r.el.classList.toggle('is-narrowed', on && hits > 0);
if (on) r.el.classList.add('is-in');
if (show) { lines++; products += hits; }
});
root.classList.toggle('is-filtered', on);
clear.hidden = !on;
none.hidden = !on || lines > 0;
if (more) more.hidden = on && !lines;
tries.forEach((b) => b.setAttribute('aria-pressed', String(on && norm(b.dataset.pidxTry) === words.join(' '))));
if (!on) count.innerHTML = all;
else if (!lines) count.textContent = 'No match on the list';
else if (products) count.textContent = `${exact ? '' : 'Closest: '}${products} product${products === 1 ? '' : 's'} in ${lines} line${lines === 1 ? '' : 's'}`;
else count.textContent = `${exact ? '' : 'Closest: '}${lines === 1 ? '1 line matches' : `${lines} lines match`}`;
};
const lift = () => {
const bar = input.closest('.pidx-find'), top = bar.getBoundingClientRect().top;
const mast = $('[data-masthead]'), want = (mast ? mast.offsetHeight : 0) + 16;
if (top > want + 40) window.scrollBy({ top: top - want, behavior: UCM.calm.matches ? 'auto' : 'smooth' });
};
input.addEventListener('focus', lift);
input.addEventListener('input', apply);
input.addEventListener('keydown', (e) => {
if (e.key === 'Escape' && input.value) { input.value = ''; apply(); }
if (e.key === 'Enter' && matchMedia('(pointer: coarse)').matches) input.blur();
});
input.addEventListener('search', apply);
clear.addEventListener('click', () => { input.value = ''; apply(); input.focus(); });
tries.forEach((b) => b.addEventListener('click', () => {
input.value = b.getAttribute('aria-pressed') === 'true' ? '' : b.dataset.pidxTry;
apply();
lift();
}));
const carry = carrier($$('.pidx-row__quote', root).map((a) => [a, new URL(a.href).searchParams.get('product')]));
carry(readPicks());
window.addEventListener('pageshow', () => { if (input.value) apply(); carry(readPicks()); });
}
const line = $('[data-pline]');
if (line) {
const here = line.dataset.line;
const picks = $$('[data-pline-pick]', line), statuses = $$('[data-pline-status]', line).map((el) => ({ el, idle: el.textContent }));
const acts = $('[data-pline-acts]', line), clear = $('[data-pline-clear]', line);
const carry = carrier($$('[data-pline-quote]').map((a) => [a, here]));
let list = readPicks();
const sync = () => {
picks.forEach((b) => {
const on = list.some((p) => p.line === here && p.item === b.dataset.plinePick);
b.toggleAttribute('data-on', on);
b.closest('li').classList.toggle('is-picked', on);
});
const names = list.map((p) => p.item);
statuses.forEach(({ el, idle }) => {
el.textContent = names.length ? `${names.length} on the quote: ${names.join(', ')}.` : idle;
el.classList.toggle('is-on', names.length > 0);
});
if (acts) acts.hidden = !names.length;
carry(list);
};
picks.forEach((b) => b.addEventListener('click', () => {
const item = b.dataset.plinePick, on = list.some((p) => p.line === here && p.item === item);
list = on ? list.filter((p) => !(p.line === here && p.item === item)) : [...list, { line: here, item }];
writePicks(list);
sync();
}));
if (clear) clear.addEventListener('click', () => { list = []; writePicks(list); sync(); if (picks[0]) picks[0].focus(); });
window.addEventListener('pageshow', () => { list = readPicks(); sync(); });
sync();
}
})();
/* Kinds of work (projects page): the chips show one sector at a time and say how much is showing.
Without this script the chips are links to each sector and everything is on the page. */
(() => {
const { $, $$ } = UCM;
const bar = $('[data-pj-filter]');
if (!bar) return;
const chips = $$('button[data-pj]', bar), sectors = $$('[data-pj-sector]'), count = $('[data-pj-count]');
const all = count ? count.textContent : '';
const mast = $('[data-masthead]');
bar.addEventListener('click', (e) => {
const chip = e.target.closest('button[data-pj]');
if (!chip) return;
const f = chip.dataset.pj;
let n = 0;
chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
sectors.forEach((s) => {
const on = f === 'all' || s.id === f;
s.hidden = !on;
if (on) n += $$('.pj-kind', s).length;
});
if (count) count.textContent = f === 'all' ? all : `${n} ${n === 1 ? 'kind' : 'kinds'} of work in ${chip.textContent}`;
if (matchMedia('(max-width: 43.6875em)').matches) {
const first = sectors.find((s) => !s.hidden);
if (first) window.scrollBy({ top: first.getBoundingClientRect().top - (mast ? mast.offsetHeight : 0) - 8, behavior: UCM.calm.matches ? 'auto' : 'smooth' });
}
});
})();
/* Scroll reveal: .reveal elements ease in once as they arrive. CSS hides them only under html.reveal-on,
which this script sets just before it starts watching: a script that never arrives hides nothing.
Whatever is already on screen when the script runs stays as it is, so nothing blinks out and back. */
(() => {
const { $$, calm } = UCM;
const els = $$('.reveal');
if (!els.length) return;
if (calm.matches || !('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('is-in')); return; }
const height = window.innerHeight;
els.forEach((el) => { const r = el.getBoundingClientRect(); if (r.top < height && r.bottom > 0) el.classList.add('is-in'); });
document.documentElement.classList.add('reveal-on');
const io = new IntersectionObserver((entries) => {
entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
}, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
els.forEach((el) => io.observe(el));
})();