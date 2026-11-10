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
if (e.target instanceof HTMLDialogElement) {
const r = e.target.getBoundingClientRect();
if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) e.target.close();
}
if (e.target.closest('[data-print]')) window.print();
});
$$('dialog a[href]:not([href^="tel:"], [href^="mailto:"], [target="_blank"])').forEach((a) => a.addEventListener('click', () => a.closest('dialog').close()));
/* The phone action bar steps aside while the keyboard is up. */
const TYPING = 'input:not([type=radio],[type=checkbox],[type=file]), textarea, select';
document.addEventListener('focusin', (e) => { if (e.target.matches?.(TYPING)) document.body.classList.add('is-typing'); });
document.addEventListener('focusout', (e) => { if (e.target.matches?.(TYPING)) document.body.classList.remove('is-typing'); });
/* Open / closed, computed in each yard's own time zone. The hours are placeholders, so the badge
says only "Open" or "Closed" and never prints a time.
data-hours = {"tz":"America/Anchorage","week":[null,[420,990],…]}  (Sunday first, minutes after midnight) */
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const isOpen = ({ tz, week }) => {
const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' })
.formatToParts(new Date()).map((p) => [p.type, p.value]));
const today = week[DAYS.indexOf(parts.weekday)], now = +parts.hour * 60 + +parts.minute;
return !!today && now >= today[0] && now < today[1];
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
})();
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
const fields = () => $$('input, select, textarea', form).filter((el) => el.name && el.type !== 'file' && el.type !== 'hidden');
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
const query = new URLSearchParams(location.search);
const product = query.get('product');
const materials = $('textarea[name=materials]', form);
if (product && materials && !materials.value) materials.value = product + ':\n';
const yardParam = query.get('yard');
const yardSel = $('select[name=yard]', form);
if (yardParam && yardSel) $$('option', yardSel).forEach((o) => { if (o.value.toLowerCase() === yardParam.toLowerCase()) yardSel.value = o.value; });
const place = query.get('location');
const job = $('input[name=location]', form);
if (place && job && !job.value) job.value = place;
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
const draftText = $('[data-draft-text]', form);
const draftClear = $('[data-draft-clear]', form);
if (draftText) draftText.dataset.text = draftText.textContent;
if (draftText && restored) { draftText.textContent = 'Your draft from last time is filled in.'; draftClear.hidden = false; }
form.addEventListener('input', () => { if (draftClear) draftClear.hidden = false; });
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
window.addEventListener('beforeprint', () => {
$$('.seg label', form).forEach((l) => { const r = $('input', l); l.classList.toggle('is-marked', r.checked && !r.defaultChecked); });
$$('[data-paper-for]', form).forEach((o) => { const s = named(o.dataset.paperFor); o.classList.toggle('is-marked', !!s && s.selectedIndex > 0 && s.value === o.dataset.value); });
$$('[data-paper-copy]', form).forEach((o) => { o.textContent = val(o.dataset.paperCopy); });
});
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
const validate = () => {
const bad = $$('[required]', form).filter((el) => !check(el));
if (bad.length) bad[0].focus();
return !bad.length;
};
$$('[required]', form).forEach((el) => ['blur', 'change', 'input'].forEach((t) => el.addEventListener(t, () => {
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
(() => {
const clocks = $$('[data-clock]');
if (!clocks.length) return;
const paint = () => clocks.forEach((el) => {
try {
const now = new Intl.DateTimeFormat('en-US', { timeZone: el.dataset.clock, hour: 'numeric', minute: '2-digit' }).format(new Date());
el.textContent = `${now.replace('AM', 'a.m.').replace('PM', 'p.m.')} there now`;
} catch { /* leave it empty */ }
});
paint();
setInterval(paint, 30 * 1000);
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
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && item.matches(':hover')) item.setAttribute('data-shut', ''); });
item.addEventListener('mouseleave', () => item.removeAttribute('data-shut'));
})();
(() => {
const plates = $$('[data-plate]').filter((p) => $('.yardmark__pulse', p));
if (!plates.length || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
const KEY = 'uresco-still', root = document.documentElement;
const remembered = () => { try { return localStorage.getItem(KEY) === '1'; } catch { return false; } };
const remember = (still) => { try { localStorage.setItem(KEY, still ? '1' : '0'); } catch { /* private window */ } };
const buttons = plates.map((plate) => {
const b = document.createElement('button');
b.type = 'button';
b.className = 'still';
($('.plate__legend', plate) || plate).append(b);
return b;
});
const paint = (still) => {
root.classList.toggle('is-still', still);
buttons.forEach((b) => { b.textContent = still ? 'Resume motion' : 'Pause motion'; });
};
buttons.forEach((b) => b.addEventListener('click', () => {
const still = !root.classList.contains('is-still');
paint(still);
remember(still);
}));
paint(remembered());
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
const finder = $('[data-placefinder]');
if (!finder) return;
const data = JSON.parse($('[data-finder-data]', finder).textContent);
const calm = matchMedia('(prefers-reduced-motion: reduce)');
const coarse = matchMedia('(pointer: coarse)');
const fold = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’'.]/g, '').toLowerCase().trim();
const places = data.places.map(([name, st, lat, xy, region, access, yard, group, label]) => ({ name, st, lat, xy, region, access, yard, group, label, key: fold(name) }));
const byName = new Map(places.map((p) => [p.name, p]));
const aliases = Object.entries(data.aliases).map(([alias, name]) => ({ alias, key: fold(alias), place: byName.get(name) }));
const SUGGEST = ['Bethel', 'Nome', 'Kotzebue', 'Utqiaġvik', 'Juneau', 'Sitka', 'Anchorage', 'Fairbanks'].map((name) => ({ p: byName.get(name) }));
const input = $('.finder__input', finder), list = $('.finder__list', finder), clear = $('[data-clear]', finder);
const answer = $('[data-answer]', finder), live = $('[data-live]', finder);
const section = finder.closest('[data-lat]');
const field = (k) => $(`[data-a="${k}"]`, answer);
let active = -1, options = [];
/* ---- The answer ---- */
const quoteUrl = (where, yard) => `${data.quote}?location=${encodeURIComponent(where)}${yard ? '&yard=' + yard : ''}`;
const showYard = (id) => $$('[data-y]', answer).forEach((el) => { el.hidden = el.dataset.y !== id; });
const swap = () => {
if (calm.matches) return;
answer.classList.add('is-swapping');
requestAnimationFrame(() => requestAnimationFrame(() => answer.classList.remove('is-swapping')));
};
const fill = (p) => {
const acc = data.access[p.access], yard = data.yards[p.yard];
const modes = acc.modes.map((m) => m[1].replace('{yard}', yard.name));
field('eg').hidden = true;
field('lat').hidden = false; field('latnum').textContent = p.lat.toFixed(1);
field('region').textContent = p.region;
field('name').textContent = `${p.name}, ${data.states[p.st]}`;
field('tag').textContent = acc.tag; field('tag').hidden = false;
showYard(p.yard);
[0, 1].forEach((i) => {
const m = acc.modes[i];
field('m' + i).textContent = m ? modes[i] : '';
field('m' + i).parentElement.hidden = !m;
$$(`[data-ic^="${i}-"]`, answer).forEach((ic) => { ic.hidden = !m || ic.dataset.ic !== `${i}-${m[0]}`; });
});
field('how').hidden = false; field('else').hidden = true; field('note').hidden = false;
field('short').textContent = p.name;
field('quote').href = quoteUrl(`${p.name}, ${p.st}`, p.yard);
live.textContent = `${p.name}, ${data.states[p.st]}. ${acc.tag}. How freight typically gets there: ${modes.join('; ')}. Yard to call: ${yard.name}, ${yard.phone}. Typical for the region, not a schedule or a price. Any yard can help.`;
};
const fillUnknown = (text) => {
field('eg').hidden = true;
field('lat').hidden = true;
field('region').textContent = 'Not on our short list';
field('name').textContent = text;
field('tag').hidden = true;
showYard('any');
field('how').hidden = true; field('else').hidden = false; field('note').hidden = true;
field('short').textContent = text;
field('quote').href = quoteUrl(text);
live.textContent = `${text} is not on our short list, which does not mean we cannot get there. Any yard can help. Use the quote button, or call a yard.`;
};
/* ---- The route plate ---- */
const plate = $('[data-plate]', finder);
const layer = plate && $('.plate__labels', plate);
let mark = null;
if (layer) {
mark = document.createElement('span');
mark.className = 'plate__dest'; mark.setAttribute('aria-hidden', 'true');
mark.innerHTML = '<i></i><b></b>';
layer.append(mark);
}
const preferred = (p, town) => town?.dataset.side || p.label || (p.xy[0] > data.w * 0.72 ? 'w' : 'e');
let frameFor = null;
const placeName = () => {
const pref = frameFor;
if (!pref || mark.hidden) return;
const frame = $('.plate__scroll', plate).getBoundingClientRect(), name = $('b', mark);
for (const s of [pref, ...['e', 'w', 's', 'n'].filter((k) => k !== pref)]) {
mark.dataset.side = s;
const r = name.getBoundingClientRect();
if (r.left >= frame.left + 3 && r.right <= frame.right - 3 && r.top >= frame.top + 3 && r.bottom <= frame.bottom - 3) return;
}
mark.dataset.side = pref;
};
if (mark) window.addEventListener('resize', placeName);
const paint = (p, { spotlight = true } = {}) => {
if (!mark) return;
$$('.plate__town.is-dest', layer).forEach((t) => t.classList.remove('is-dest'));
if (!p) {
mark.hidden = true;
plate.removeAttribute('data-show'); plate.removeAttribute('data-access');
return;
}
const town = $$('.plate__town', layer).find((t) => t.textContent === p.name);
if (town) town.classList.add('is-dest');
mark.hidden = false;
mark.style.left = (p.xy[0] / data.w * 100).toFixed(2) + '%';
mark.style.top = (p.xy[1] / data.h * 100).toFixed(2) + '%';
$('b', mark).textContent = p.name;
frameFor = preferred(p, town);
placeName();
if (spotlight && p.group) plate.setAttribute('data-show', p.group); else plate.removeAttribute('data-show');
if (spotlight) plate.setAttribute('data-access', p.access); else plate.removeAttribute('data-access');
};
paint(byName.get(data.example), { spotlight: false });
const setRail = (p) => {
if (!section || !p) return;
section.dataset.lat = p.lat.toFixed(1);
section.dataset.place = p.name;
window.dispatchEvent(new Event('resize'));
};
/* ---- Choosing ---- */
const dropKeyboard = () => { if (coarse.matches) input.blur(); };
const choose = (p) => {
close();
input.value = p.name; clear.hidden = false;
swap(); fill(p); paint(p); setRail(p);
dropKeyboard();
};
const chooseUnknown = (text) => {
const name = text.slice(0, 60);
close(); clear.hidden = false;
swap(); fillUnknown(name); paint(null);
dropKeyboard();
};
/* ---- The combobox ---- */
const search = (q) => {
const k = fold(q);
if (!k) return SUGGEST;
const out = [];
places.forEach((p) => {
const i = p.key.indexOf(k);
if (i === 0) out.push({ p, rank: 0 });
else if (i > 0) out.push({ p, rank: p.key[i - 1] === ' ' ? 1 : 2 });
});
aliases.forEach((a) => { if (a.key.startsWith(k) && !out.some((o) => o.p === a.place)) out.push({ p: a.place, rank: 0, alias: a.alias }); });
return out.sort((a, b) => a.rank - b.rank || a.p.name.localeCompare(b.p.name)).slice(0, 8);
};
const setActive = (i) => {
active = i;
Array.from(list.children).forEach((el, j) => el.setAttribute('aria-selected', String(j === i)));
const el = list.children[i];
if (el) { input.setAttribute('aria-activedescendant', el.id); el.scrollIntoView({ block: 'nearest' }); } else input.removeAttribute('aria-activedescendant');
};
const addOption = (i) => {
const li = document.createElement('li');
li.setAttribute('role', 'option'); li.id = `place-opt-${i}`; li.setAttribute('aria-selected', 'false');
list.append(li);
return li;
};
const open = () => {
const typed = input.value.trim();
options = search(input.value);
list.textContent = '';
options.forEach((o, i) => {
const li = addOption(i);
const name = document.createElement('span');
name.textContent = o.alias ? `${o.p.name} (${o.alias})` : o.p.name;
const meta = document.createElement('small');
meta.textContent = `${o.p.lat.toFixed(1)}°N · ${o.p.st === 'WA' ? 'Washington' : o.p.region}`;
li.append(name, meta);
});
if (!options.length) {
options = [{ unknown: true }];
const li = addOption(0);
li.className = 'is-none';
li.textContent = `${typed} is not on our short list. Press Enter or tap here and we will still point you to a yard.`;
}
list.hidden = false;
input.setAttribute('aria-expanded', 'true');
setActive(typed ? 0 : -1);
};
function close() {
list.hidden = true;
input.setAttribute('aria-expanded', 'false');
input.removeAttribute('aria-activedescendant');
active = -1;
}
const pick = (o) => { if (o.unknown) chooseUnknown(input.value.trim()); else choose(o.p); };
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
setActive((active + (e.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length);
} else if (e.key === 'Enter') {
e.preventDefault();
if (list.hidden) open();
const o = options[active] || (input.value.trim() ? options[0] : null);
if (o) pick(o);
} else if (e.key === 'Escape') {
if (!list.hidden) { e.preventDefault(); close(); } else if (input.value) { e.preventDefault(); input.value = ''; clear.hidden = true; }
}
});
list.addEventListener('mousedown', (e) => e.preventDefault());
list.addEventListener('click', (e) => {
const li = e.target.closest('[role=option]');
const o = li && options[Array.prototype.indexOf.call(list.children, li)];
if (o) pick(o);
});
clear.addEventListener('click', () => { input.value = ''; clear.hidden = true; input.focus(); });
finder.addEventListener('click', (e) => {
const eg = e.target.closest('[data-place]');
if (eg && byName.has(eg.dataset.place)) choose(byName.get(eg.dataset.place));
});
})();
(() => {
const root = $('[data-prod-ledger]');
if (!root) return;
const rows = $$('.prod-row', root);
const imgs = $$('.stock__frame img', root);
const cap = $('[data-prod-cap]', root);
const wide = matchMedia('(min-width: 1000px)');
const show = (i) => {
if (!wide.matches || !imgs[i]) return;
const img = imgs[i];
rows.forEach((r, j) => r.classList.toggle('is-on', j === i));
const on = () => {
imgs.forEach((x) => x.classList.toggle('is-on', x === img));
if (cap) cap.textContent = rows[i].dataset.cap;
};
if (img.dataset.srcset) {
img.srcset = img.dataset.srcset; img.src = img.dataset.src;
delete img.dataset.srcset;
}
if (img.complete && img.naturalWidth > 1) on(); else img.addEventListener('load', on, { once: true });
};
rows.forEach((r, i) => {
r.addEventListener('pointerenter', () => show(i));
r.addEventListener('focusin', () => show(i));
});
const input = $('[data-prod-q]', root);
const count = $('[data-prod-count]', root);
const clear = $('[data-prod-clear]', root);
const none = $('[data-prod-none]', root);
if (!input) return;
const fold = (s) => s.replace(/[®™]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const left = () => rows.filter((r) => !r.hidden);
const apply = () => {
const words = fold(input.value).split(' ').filter(Boolean);
rows.forEach((r) => {
r.hidden = !words.every((w) => r.dataset.terms.includes(w));
$$('.prod-row__items li', r).forEach((li) => li.classList.toggle('is-hit', words.length > 0 && words.some((w) => li.dataset.t.includes(w))));
});
const n = left().length;
count.textContent = !words.length ? `${rows.length} lines` : n === 1 ? '1 line · Enter opens it' : n ? `${n} of ${rows.length} lines` : 'No match';
none.hidden = n > 0;
clear.hidden = !input.value;
if (n && !left().some((r) => r.classList.contains('is-on'))) show(rows.indexOf(left()[0]));
};
input.addEventListener('input', apply);
input.addEventListener('keydown', (e) => {
if (e.key === 'Enter' && input.value && left().length === 1) { e.preventDefault(); $('a', left()[0]).click(); }
if (e.key === 'Escape' && input.value) { e.preventDefault(); input.value = ''; apply(); }
});
clear.addEventListener('click', () => { input.value = ''; apply(); input.focus(); });
if (input.value) apply();
window.addEventListener('pageshow', () => { if (input.value) apply(); });
})();
(() => {
const filters = $('[data-filters]');
if (!filters) return;
const status = $('[data-pjx-status]');
const kinds = $$('.pjx-kind');
filters.addEventListener('click', (e) => {
const b = e.target.closest('button[data-filter]');
if (!b) return;
const f = b.dataset.filter;
$$('button', filters).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
$$('[data-sector]').forEach((el) => { el.hidden = f !== 'all' && el.dataset.sector !== f; });
const shown = kinds.filter((k) => !k.closest('[hidden]')).length;
status.textContent = f === 'all' ? status.dataset.all : `${f}: showing ${shown} of ${kinds.length} kinds of work`;
});
const land = () => {
const target = location.hash.length > 1 && document.getElementById(location.hash.slice(1));
if (!target || !target.closest('[hidden]')) return;
$('button[data-filter="all"]', filters).click();
target.scrollIntoView();
};
window.addEventListener('hashchange', land);
})();
(() => {
const secs = $$('[data-lat]');
if (!secs.length) return;
const rail = $('[data-rail]');
const needle = $('[data-needle]');
const reads = $$('.rail [data-read], .latchip [data-read]');
const places = $$('.rail [data-place], .latchip [data-place]');
const progress = $('[data-progress]');
const masthead = $('[data-masthead]');
const stops = $$('[data-stop]');
const lo = rail ? +rail.dataset.lo : 46, hi = rail ? +rail.dataset.hi : 72;
let boxes = [], first = 0, last = 1, shownLat = '', shownPlace = '', queued = false;
const measure = () => {
boxes = secs.map((s) => {
const r = s.getBoundingClientRect();
return { top: r.top + window.scrollY, h: r.height, a: +s.dataset.lat, b: +(s.dataset.latTo || s.dataset.lat), place: s.dataset.place || '', end: s.dataset.placeEnd, off: s.matches('.coda') || !!$('[data-finder]', s) };
});
first = boxes[0].a;
last = Math.max(...boxes.map((b) => Math.max(b.a, b.b)));
};
const update = () => {
queued = false;
const y = window.scrollY + window.innerHeight * 0.5;
let lat = boxes[0].a, place = boxes[0].place, reading = false;
for (const b of boxes) {
if (y < b.top) break;
const t = Math.min(1, Math.max(0, (y - b.top) / Math.max(1, b.h)));
const k = Math.min(1, Math.max(0, (t - 0.1) / 0.75));
lat = b.a + (b.b - b.a) * k;
place = b.end && k >= 0.98 ? b.end : b.place;
reading = !b.off && y < b.top + b.h;
}
if (masthead) masthead.classList.toggle('is-reading', reading && window.scrollY > window.innerHeight * 0.5);
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