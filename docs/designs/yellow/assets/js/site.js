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
el.textContent = open ? 'Open' : 'Closed';
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
form.noValidate = true;
const fields = () => $$('input, select, textarea', form).filter((el) => el.name && el.type !== 'file' && el.type !== 'hidden');
const PRIVATE = /^(ein|bank|bank_contact|signature|signed|agree)$/;
const save = () => {
const d = {};
fields().filter((el) => !PRIVATE.test(el.name)).forEach((el) => {
if (el.type === 'radio') { if (el.checked) d[el.name] = el.value; } else if (el.type === 'checkbox') d[el.name] = el.checked; else d[el.name] = el.value;
});
if (bag.files.length) d._files = bag.files.length;
try { localStorage.setItem(DRAFT, JSON.stringify(d)); } catch { /* private mode */ }
};
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
const touched = () => { form.dataset.touched = '1'; };
form.addEventListener('input', touched);
form.addEventListener('change', touched);
const params = new URLSearchParams(location.search);
const product = params.get('product');
const materials = $('textarea[name=materials]', form);
if (product && materials) {
if (!materials.value) materials.value = product + ':\n';
else if (!materials.value.includes(product)) materials.value = materials.value.replace(/\s*$/, '\n\n') + product + ':\n';
}
const place = params.get('location');
const placeField = $('input[name=location]', form);
if (place && placeField) placeField.value = place;
const delivery = params.get('delivery');
if (delivery) $$('input[name=delivery]', form).forEach((r) => { r.checked = r.value === delivery; });
const yardParam = (params.get('yard') || '').toLowerCase();
const yardSel = $('select[name=yard]', form);
if (yardParam && yardSel) $$('option', yardSel).forEach((o) => { if (o.value.toLowerCase() === yardParam) yardSel.value = o.value; });
if (product || place || delivery || yardParam) {
touched();
save();
setTimeout(() => history.replaceState(history.state, '', location.pathname + location.hash), 0);
}
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
input.addEventListener('change', () => add(Array.from(input.files)));
['dragenter', 'dragover'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.add('is-over'); }));
['dragleave', 'drop'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.remove('is-over'); }));
drop.addEventListener('drop', (e) => add(e.dataTransfer.files));
}
const message = (el) => (el.type === 'checkbox' ? el.dataset.msg || 'Please confirm to continue.'
: el.validity.valueMissing ? el.dataset.msg || 'Required.'
: el.type === 'email' ? 'Enter an email address like name@company.com.' : 'Check this field.');
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
const validate = () => {
const bad = $$('[required]', form).filter((el) => !check(el));
paintErrs(bad);
if (bad.length) bad[0].focus();
return !bad.length;
};
$$('[required]', form).forEach((el) => ['blur', 'change', 'input'].forEach((t) => el.addEventListener(t, () => {
if (el.getAttribute('aria-invalid') === 'true') { check(el); paintErrs(stillBad()); }
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
const { text, files } = summary();
const subject = `${form.dataset.subject} — ${data.get('company') || data.get('name')}${data.get('location') ? ' — ' + data.get('location') : ''}`;
const mail = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
window.location.href = mail;
const note = $('[data-mail-note]', done);
if (note) note.hidden = !files.length;
$('[data-mail-to]', done).textContent = to;
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
const back = $('[data-mail-back]', done);
if (back) back.onclick = () => { unshelve(); done.hidden = true; form.hidden = false; form.scrollIntoView({ block: 'start' }); $('input:not([type=hidden]), select, textarea', form)?.focus(); };
shelve();
finish();
});
});
})();
(() => {
const box = document.querySelector('[data-finder]');
if (!box) return;
let data;
try { data = JSON.parse(box.querySelector('[data-finder-data]').textContent); } catch { return; }
const $ = (s, el = box) => el.querySelector(s);
const $$ = (s, el = box) => Array.from(el.querySelectorAll(s));
const calm = matchMedia('(prefers-reduced-motion: reduce)');
const fold = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’'.]/g, '').toLowerCase().trim();
const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[^a-z]/g, '');
const bare = (s) => fold(s).split(',')[0].replace(/\s+(ak|alaska|wa|washington)(\s+\d{5}(-\d{4})?)?$/, '').trim();
const inWashington = (s) => /[,\s]\s*(wa|washington)\b/i.test(s);
const touch = matchMedia('(hover: none)');
const places = data.places.map(([name, st, region, access, yard, lanes, xy]) => ({ name, st, region, access, yard, lanes, xy, key: fold(name) }));
const byName = new Map(places.map((p) => [p.name, p]));
const aliases = Object.entries(data.aliases).map(([alias, name]) => ({ alias, key: fold(alias), place: byName.get(name) }));
const SUGGEST = ['Anchorage', 'Fairbanks', 'Juneau', 'Sitka', 'Bethel', 'Nome', 'Kotzebue', 'Utqiaġvik'].map((n) => ({ p: byName.get(n) }));
const STATE = { AK: 'Alaska', WA: 'Washington' };
const input = $('.finder__input'), list = $('.finder__list'), clear = $('[data-clear]');
const chips = $$('.town');
const card = $('[data-way]'), live = $('[data-live]');
const part = (name) => card.querySelector(`[data-way-${name}]`);
const quote = part('quote'), call = part('call'), how = part('how');
const NOTE = 'Typical for the region, not a schedule or a price. Any yard can help.';
const quoteBase = quote.getAttribute('href').split('?')[0];
const map = document.querySelector('.finder [data-map]');
const labels = map && map.querySelector('.dmap__labels');
const [mapW, mapH] = data.size;
let marker = null; // for a chosen place with no label of its own
let active = -1, options = [];
/* ---- The card ---- */
const pop = () => { card.classList.remove('is-new'); void card.offsetWidth; card.classList.add('is-new'); };
const showQuote = (label, href) => { part('short').textContent = label; quote.href = href; };
const showYard = (yard) => { part('yard').textContent = yard.name; part('phone').textContent = yard.phone; call.href = yard.tel; };
const fill = (p) => {
const acc = data.access[p.access], yard = data.yards[p.yard];
const modes = acc.modes.map(([ic, text]) => [ic, text.replace('{yard}', yard.name)]);
part('label').textContent = acc.tag;
part('name').textContent = p.name;
part('region').textContent = /Alaska/.test(p.region) ? p.region : `${p.region}, ${STATE[p.st]}`;
part('region').hidden = false;
const offRoad = p.access === 'coastal' || p.access === 'seasonal';
const line = acc.note || '';
part('text').textContent = line;
part('text').hidden = !line;
how.hidden = false;
modes.forEach(([ic, text], i) => {
card.querySelector(`[data-way-m="${i}"]`).textContent = text;
card.querySelectorAll(`[data-ic^="${i}-"]`).forEach((el) => { el.hidden = el.dataset.ic !== `${i}-${ic}`; });
});
showYard(yard);
showQuote(`Get a quote for ${p.name}`, `${quoteBase}?yard=${p.yard}&location=${encodeURIComponent(`${p.name}, ${p.st}`)}${offRoad ? '&delivery=Remote%20Alaska%20shipping' : ''}`);
part('note').textContent = NOTE;
card.dataset.ico = acc.icon;
live.textContent = `${p.name}, ${STATE[p.st]}. ${acc.tag}. ${line ? `${line} ` : ''}How freight typically gets there: ${modes.map((m) => m[1]).join(', ')}. Yard to call: ${yard.name}, ${yard.phone}. Typical for the region, not a schedule or a price.`;
pop();
};
const fillUnknown = (text) => {
const wa = inWashington(text);
const id = wa ? 'kent' : 'anchorage';
const say = 'We don’t have that one listed, but that doesn’t rule it out. Send the details and a yard will work out the way in.';
part('label').textContent = wa ? 'Not listed' : 'Delivery anywhere in Alaska';
part('name').textContent = text;
part('region').hidden = true;
part('text').textContent = say;
part('text').hidden = false;
how.hidden = true;
showYard(data.yards[id]);
showQuote(`Get a quote for ${text}`, `${quoteBase}?yard=${id}&location=${encodeURIComponent(text)}${wa ? '' : '&delivery=Remote%20Alaska%20shipping'}`);
part('note').textContent = 'Any yard can help.';
delete card.dataset.ico;
live.textContent = `${text}. ${say} Yard to call: ${data.yards[id].name}, ${data.yards[id].phone}. Any yard can help.`;
pop();
};
/* ---- The map: light the lanes, the place and the yard to call ---- */
const draw = (p) => {
if (!map) return;
map.querySelectorAll('.dmap__town.is-on').forEach((el) => el.classList.remove('is-on'));
map.querySelectorAll('.dmap__yard.is-on').forEach((el) => el.classList.remove('is-on'));
if (marker) { marker.remove(); marker = null; }
if (!p) { delete map.dataset.mode; return; }
map.dataset.mode = p.lanes;
const yard = map.querySelector(`.dmap__yard[href$="#${p.yard}"]`);
if (yard) yard.classList.add('is-on');
const own = map.querySelector(`.dmap__town[data-town="${slug(p.name)}"]`);
if (own) { own.classList.add('is-on'); return; }
if (p.access === 'local' || !p.xy || !labels || samePlaceAsYard(p, yard)) return;
marker = document.createElement('span');
marker.className = 'dmap__town is-on';
marker.setAttribute('aria-hidden', 'true');
marker.dataset.side = p.xy[0] > mapW * 0.45 ? 'w' : 'e';
marker.style.left = `${(p.xy[0] / mapW * 100).toFixed(2)}%`;
marker.style.top = `${(p.xy[1] / mapH * 100).toFixed(2)}%`;
const dot = document.createElement('i'), name = document.createElement('b');
name.textContent = p.name;
marker.append(dot, name);
labels.append(marker);
};
const samePlaceAsYard = (p, pin) => {
if (!pin) return false;
const x = parseFloat(pin.style.left) / 100 * mapW, y = parseFloat(pin.style.top) / 100 * mapH;
return Math.hypot(p.xy[0] - x, p.xy[1] - y) < 12;
};
/* ---- Choosing ---- */
const press = (name) => chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.place === name)));
const reveal = () => {
setTimeout(() => {
const bar = document.querySelector('.actionbar'), mast = document.querySelector('.masthead');
const low = (bar && bar.getClientRects().length ? bar.getBoundingClientRect().top : window.innerHeight) - 14;
const high = (mast ? mast.getBoundingClientRect().bottom : 0) + 12;
const r = card.getBoundingClientRect();
let dy = r.bottom > low ? r.bottom - low : 0;
if (r.top - dy < high) dy = r.top - high;
if (Math.abs(dy) > 1) window.scrollBy({ top: dy, behavior: calm.matches ? 'auto' : 'smooth' });
}, 60);
};
const choose = (p, { typed = false } = {}) => {
close();
input.value = p.name; clear.hidden = false;
press(p.name); fill(p); draw(p);
if (typed && touch.matches) input.blur();
reveal();
};
const chooseUnknown = (text) => {
close();
clear.hidden = false; press(''); fillUnknown(text.slice(0, 60)); draw(null);
if (touch.matches) input.blur();
reveal();
};
/* ---- The combobox ---- */
const search = (q) => {
const k = bare(q);
if (!k) return SUGGEST;
const out = [];
places.forEach((p) => { const i = p.key.indexOf(k); if (i === 0) out.push({ p, rank: 0 }); else if (i > 0) out.push({ p, rank: p.key[i - 1] === ' ' ? 1 : 2 }); });
aliases.forEach((a) => { if (a.key.startsWith(k) && !out.some((o) => o.p === a.place)) out.push({ p: a.place, rank: 0, alias: a.alias }); });
return out.sort((a, b) => a.rank - b.rank || a.p.name.localeCompare(b.p.name)).slice(0, 8);
};
const setActive = (i) => {
active = i;
Array.from(list.children).forEach((el, j) => el.setAttribute('aria-selected', String(j === i)));
const el = list.children[i];
if (el && el.id) { input.setAttribute('aria-activedescendant', el.id); el.scrollIntoView({ block: 'nearest' }); } else input.removeAttribute('aria-activedescendant');
};
const open = () => {
options = search(input.value);
list.textContent = '';
options.forEach((o, i) => {
const li = document.createElement('li');
li.setAttribute('role', 'option'); li.id = `finder-opt-${i}`; li.setAttribute('aria-selected', 'false');
const name = document.createElement('span'); name.textContent = o.alias ? `${o.p.name} (${o.alias})` : o.p.name;
const meta = document.createElement('small'); meta.textContent = o.p.region;
li.append(name, meta);
list.append(li);
});
if (!options.length) {
const li = document.createElement('li');
li.className = 'is-none'; li.id = 'finder-opt-0'; li.setAttribute('role', 'option'); li.setAttribute('aria-selected', 'false');
li.textContent = `Not listed, but we can still help. ${touch.matches ? 'Tap here or Search' : 'Press Enter'} and we’ll point you to a yard.`;
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
if (window.innerWidth < 700) $('.finder__field').scrollIntoView({ block: 'start', behavior: calm.matches ? 'auto' : 'smooth' });
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
if (!list.hidden) { e.preventDefault(); close(); } else if (input.value) { input.value = ''; clear.hidden = true; }
}
});
list.addEventListener('mousedown', (e) => e.preventDefault());
list.addEventListener('click', (e) => {
const li = e.target.closest('[role=option]');
if (li && li.classList.contains('is-none')) return chooseUnknown(input.value.trim());
const o = li && options[Array.prototype.indexOf.call(list.children, li)];
if (o) choose(o.p, { typed: true });
});
clear.addEventListener('click', () => { input.value = ''; clear.hidden = true; input.focus(); });
box.addEventListener('click', (e) => {
const chip = e.target.closest('.town');
if (chip && byName.has(chip.dataset.place)) choose(byName.get(chip.dataset.place));
});
if (map) map.addEventListener('click', (e) => {
if (e.target.closest('[data-place-pick]')) return;
const town = e.target.closest('.dmap__town[data-town]');
const p = town && places.find((x) => slug(x.name) === town.dataset.town);
if (p) choose(p);
});
})();
(() => {
const form = document.querySelector('form[data-form]');
if (!form) return;
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
const set = (name, value) => $$(`[data-goes="${name}"]`).forEach((el) => { el.textContent = value; });
/* Who answers follows the yard select: the tag, the row, the line under the select, the button. */
const yard = form.elements.yard;
const said = document.querySelector('[data-goes-said]');
const paintYard = (announce) => {
const o = yard.selectedOptions[0];
if (!o) return;
set('city', o.value); set('role', o.dataset.role); set('email', o.dataset.email); set('phone', o.dataset.phone);
$$('[data-goes-tel]').forEach((a) => { a.href = o.dataset.tel; });
$$('[data-goes-mail]').forEach((a) => { a.href = 'mailto:' + o.dataset.email; });
$$('[data-goes-row]').forEach((a) => a.classList.toggle('is-goes', a.dataset.goesRow === o.value));
if (announce) {
if (said) said.textContent = `This goes to the ${o.value} yard.`;
$$('.fm-tag__city').forEach((el) => { el.classList.remove('is-new'); void el.offsetWidth; el.classList.add('is-new'); });
}
};
if (yard) { paintYard(false); yard.addEventListener('change', () => paintYard(true)); }
/* The lines on the tag repeat what has been typed. */
const live = (k, v) => { const el = document.querySelector(`[data-live="${k}"]`); if (el) el.textContent = v; };
const where = form.elements.location;
const syncLines = () => {
if (where) live('location', where.value.trim() || 'Not filled in yet');
const d = form.querySelector('input[name=delivery]:checked');
if (d) live('delivery', d.value);
};
syncLines();
form.addEventListener('input', syncLines);
form.addEventListener('change', syncLines);
const files = form.querySelector('[data-files]');
if (files && document.querySelector('[data-live="files"]')) {
new MutationObserver(() => { const n = files.children.length; live('files', n ? `${n} attached` : 'None yet'); }).observe(files, { childList: true });
}
/* Typing one of the Alaska page's places says how freight generally reaches it. */
const wayNote = form.querySelector('[data-way-note]');
const placesEl = form.querySelector('[data-places]');
if (wayNote && placesEl && where) {
let known = {};
try { known = JSON.parse(placesEl.textContent); } catch { /* the note simply never shows */ }
const fold = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[’'.]/g, '').toLowerCase().trim();
const paintWay = () => {
const p = known[fold(where.value.split(',')[0])];
wayNote.hidden = !p;
if (p) wayNote.textContent = `${p[0]}: ${p[1]}. Typical for the region, not a schedule or a price.`;
};
paintWay();
where.addEventListener('input', paintWay);
}
/* The sticker over the headline says what the link that brought you here was about. */
const carried = document.querySelector('[data-carried]');
if (carried) {
const q = new URLSearchParams(location.search);
const lines = (q.get('product') || '').split(/:?\n/).map((s) => s.trim()).filter(Boolean);
const text = lines.length ? lines[0] + (lines.length > 1 ? ` +${lines.length - 1} more` : '')
: q.get('location') ? `Job in ${q.get('location')}` : yard && q.get('yard') ? `For the ${yard.value} yard` : q.get('delivery') || '';
if (text) carried.textContent = text;
}
/* On paper a select is a row of boxes: a copy someone has filled in ticks the one chosen, a blank one stays blank. */
const boxRows = $$('[data-boxes-of]', form);
if (boxRows.length) {
const tickBoxes = () => boxRows.forEach((row) => {
const sel = form.elements[row.dataset.boxesOf];
$$('.pbox', row).forEach((b) => b.classList.toggle('is-on', !!form.dataset.touched && !!sel && b.textContent.trim() === sel.value));
});
tickBoxes();
form.addEventListener('input', tickBoxes);
form.addEventListener('change', tickBoxes);
}
/* The list of parts beside a long form: ticked when its required fields are done, marked while on screen. */
const steps = $$('[data-step]');
if (steps.length) {
const part = (a) => document.getElementById(a.dataset.step);
const tick = () => steps.forEach((a) => {
const req = $$('[required]', part(a));
a.classList.toggle('is-done', req.length > 0 && req.every((el) => el.checkValidity()));
});
tick();
form.addEventListener('input', tick);
form.addEventListener('change', tick);
if ('IntersectionObserver' in window) {
const io = new IntersectionObserver((entries) => entries.forEach((e) => {
if (!e.isIntersecting) return;
steps.forEach((a) => { if (part(a) === e.target) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current'); });
}), { rootMargin: '-25% 0px -65% 0px' });
steps.forEach((a) => io.observe(part(a)));
}
}
})();
(() => {
const list = document.querySelector('[data-lines]');
if (!list || !('IntersectionObserver' in window) || !matchMedia('(hover: none)').matches) return;
const io = new IntersectionObserver((entries) => entries.forEach((e) => e.target.classList.toggle('is-on', e.isIntersecting)),
{ rootMargin: '-49.5% 0px -49.5% 0px' });
list.querySelectorAll('.line').forEach((row) => io.observe(row));
})();
(() => {
const root = document.documentElement;
const KEY = 'uresco.motion';
root.classList.add('js');
/* Pause control: stops everything that moves by itself (marquees, the seal, the hero swap,
the map's lanes) on every page, and remembers the choice. */
const buttons = Array.from(document.querySelectorAll('[data-motion-toggle]'));
const paint = () => {
const off = root.dataset.motion === 'off';
buttons.forEach((b) => { (b.querySelector('.sr-only') || b).textContent = off ? 'Play motion' : 'Pause motion'; b.toggleAttribute('data-off', off); });
};
buttons.forEach((b) => b.addEventListener('click', () => {
const off = root.dataset.motion !== 'off';
if (off) root.dataset.motion = 'off'; else delete root.dataset.motion;
try { if (off) localStorage.setItem(KEY, 'off'); else localStorage.removeItem(KEY); } catch { /* private mode */ }
paint();
document.dispatchEvent(new CustomEvent('uresco:motion', { detail: { off } }));
}));
paint();
/* Things that move by themselves only run while they are on screen. */
if ('IntersectionObserver' in window) {
const live = new IntersectionObserver((entries) => entries.forEach((e) => e.target.classList.toggle('is-live', e.isIntersecting)), { rootMargin: '80px 0px' });
document.querySelectorAll('.marquee, .seal, .dmap, .hero__art').forEach((el) => live.observe(el));
} else document.querySelectorAll('.marquee, .seal, .dmap, .hero__art').forEach((el) => el.classList.add('is-live'));
/* Reveal: [data-reveal] elements and maps get .is-in the first time they come into view. */
const targets = document.querySelectorAll('[data-reveal], [data-map]');
if (!('IntersectionObserver' in window)) { targets.forEach((el) => el.classList.add('is-in')); return; }
const io = new IntersectionObserver((entries) => entries.forEach((e) => {
if (!e.isIntersecting) return;
if (e.target.matches('[data-reveal], [data-map]')) e.target.classList.add('is-in');
e.target.querySelectorAll(':scope > [data-reveal="wipe"]').forEach((el) => el.classList.add('is-in'));
io.unobserve(e.target);
}), { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
targets.forEach((el) => io.observe(el.dataset.reveal === 'wipe' ? el.parentElement : el));
})();
(() => {
/* ---- 1. Finder ---- */
const form = document.querySelector('[data-find]');
if (form) {
const input = form.querySelector('input');
const clear = form.querySelector('[data-find-clear]');
const status = form.querySelector('[data-find-status]');
const more = document.querySelector('[data-find-more]');
const idle = status.textContent;
const rows = Array.from(document.querySelectorAll('[data-find-row]')).map((row) => ({
row, hay: row.dataset.findRow, link: row.querySelector('.pl-line__link'),
items: Array.from(row.querySelectorAll('[data-find]')).map((el) => ({ el, hay: el.dataset.find, link: el.querySelector('a') })),
}));
const words = (q) => q.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().split(' ').filter(Boolean)
.map((w) => (w.length > 3 ? w.replace(/(es|s)$/, '') : w));
const has = (hay, ws) => ws.every((w) => hay.includes(w));
const touch = matchMedia('(hover: none)').matches;
let first = null;
const run = () => {
const ws = words(input.value);
const on = ws.length > 0;
const phrase = ' ' + ws.join(' ');
const tight = on && rows.some((r) => r.items.some((it) => (' ' + it.hay).includes(phrase)));
const hit = (it) => (tight ? (' ' + it.hay).includes(phrase) : has(it.hay, ws));
let lines = 0, products = 0;
first = null;
rows.forEach((r) => {
const hits = on ? r.items.filter(hit) : [];
const byName = on && has(r.hay, ws);
const show = !on || byName || hits.length > 0;
r.row.hidden = !show;
r.items.forEach((it) => { const h = hits.includes(it); it.el.hidden = on && (hits.length ? !h : !byName); it.el.classList.toggle('is-hit', h); });
if (on && show) { lines++; products += hits.length; if (!first) first = hits.length ? hits[0].link : r.link; }
});
clear.hidden = !input.value;
if (more) more.classList.toggle('is-up', on && !lines);
const enter = touch ? '' : (lines === 1 && products < 2 ? ' Enter opens it.' : ' Enter opens the first.');
status.textContent = !on ? idle
: !lines ? 'Not on the list by that name. Ask your yard: we carry more than fits here.'
: products ? `${products} ${products === 1 ? 'product' : 'products'} in ${lines} ${lines === 1 ? 'line' : 'lines'}.${enter}`
: `${lines} ${lines === 1 ? 'line' : 'lines'} by that name.${enter}`;
};
input.addEventListener('input', run);
form.addEventListener('submit', (e) => { e.preventDefault(); if (first) location.href = first.href; });
clear.addEventListener('click', () => { input.value = ''; run(); input.focus(); });
input.addEventListener('keydown', (e) => { if (e.key === 'Escape' && input.value) { e.preventDefault(); input.value = ''; run(); } });
const go = document.querySelector('[data-find-go]');
if (go) go.addEventListener('click', (e) => { e.preventDefault(); input.focus(); });
input.addEventListener('focus', () => { if (matchMedia('(max-width: 899px)').matches) form.scrollIntoView({ block: 'start' }); });
window.addEventListener('pageshow', run);
run();
}
/* ---- 2. Load ticket ---- */
const load = document.querySelector('[data-load]');
if (load) {
const field = load.querySelector('input[name=product]');
const own = field.value;
const picks = Array.from(load.querySelectorAll('input[type=checkbox]'));
const label = load.querySelector('[data-load-label]');
const count = load.querySelector('[data-load-count]');
const unit = load.querySelector('[data-load-unit]');
const paint = () => {
const on = picks.filter((p) => p.checked);
field.value = [own, ...on.map((p) => p.value)].join(':\n');
count.textContent = on.length + 1;
unit.textContent = on.length ? 'lines on the load' : 'line on the load';
label.textContent = on.length ? label.dataset.many : label.dataset.one;
};
picks.forEach((p) => p.addEventListener('change', paint));
window.addEventListener('pageshow', paint);
paint();
}
})();
(() => {
const calm = matchMedia('(prefers-reduced-motion: reduce)');
const run = (swap) => {
const words = Array.from(swap.children);
if (words.length < 2) return;
const host = swap.closest('[data-hero]');
const stack = host && host.querySelector('[data-slides]');
const slides = stack && stack.children.length === words.length ? Array.from(stack.children) : null;
let i = 0, inView = true;
const still = () => calm.matches || document.documentElement.dataset.motion === 'off' || !inView || document.hidden;
const arm = () => slides && slides.forEach((el) => {
if (!el.dataset.srcset) return;
el.srcset = el.dataset.srcset; el.src = el.dataset.src;
el.removeAttribute('data-srcset'); el.removeAttribute('data-src');
});
const ready = (el) => !el || el.tagName !== 'IMG' || (el.complete && el.naturalWidth > 0);
const show = (n) => {
const all = slides ? words.concat(slides) : words;
const was = slides ? [words[i], slides[i]] : [words[i]];
i = n;
all.forEach((el) => el.classList.remove('was-on'));
was.forEach((el) => { el.classList.remove('is-on'); el.classList.add('was-on'); });
words[i].classList.add('is-on');
if (slides) slides[i].classList.add('is-on');
setTimeout(() => was.forEach((el) => el.classList.remove('was-on')), 850);
};
const loop = () => setTimeout(() => {
const next = (i + 1) % words.length;
if (!still() && ready(slides && slides[next])) show(next);
loop();
}, slides && i === words.length - 1 ? 3800 : 2500);
const start = () => setTimeout(() => { if (!calm.matches) { arm(); loop(); } }, 900);
if (document.readyState === 'complete') start(); else window.addEventListener('load', start);
if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { inView = e.isIntersecting; }).observe(host || swap);
};
document.querySelectorAll('[data-swap]').forEach(run);
})();