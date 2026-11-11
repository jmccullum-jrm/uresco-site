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
/* Open / closed, computed in each yard's own time zone. The words are all a visitor sees: the hours are placeholders.
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
/* Paper has no scrolling, so whatever draws in on first sight is drawn before it prints. */
window.addEventListener('beforeprint', () => $$('[data-reveal]').forEach((el) => el.classList.add('is-in')));
})();
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
const labelOf = (el) => el.dataset.label || (el.type === 'radio' ? $('#' + el.name + '-label', form) : form.querySelector(`label[for="${el.id}"]`))?.childNodes[0]?.textContent.trim() || el.name;
const fields = () => $$('input, select, textarea', form).filter((el) => el.name && el.type !== 'file' && el.type !== 'hidden');
const PRIVATE = /^(ein|bank|bank_contact|signature|signed|agree)$/;
const NOT_EMAILED = /^(ein|bank|bank_contact)$/;
const typed = () => fields().filter((el) => el.tagName !== 'SELECT' && el.type !== 'radio' && el.type !== 'checkbox');
const yardSel = $('select[name=yard]', form);
const showYard = () => {
if (!yardSel) return;
$$('[data-route-yard]', area).forEach((el) => { el.hidden = el.dataset.routeYard !== yardSel.value; });
};
const leftAll = $('[data-left-all]', form);
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
const params = new URLSearchParams(location.search);
const replaced = [];
const product = params.get('product');
const materials = $('textarea[name=materials]', form);
if (product && materials && !materials.value.includes(product)) materials.value = (materials.value.trim() ? materials.value.trimEnd() + '\n' : '') + product + ':\n';
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
const how = (params.get('delivery') || '').toLowerCase();
if (how) $$('input[type=radio][name=delivery]', form).forEach((r) => { if (r.value.toLowerCase() === how) r.checked = true; });
if (replaced.length) {
const note = $('[data-link-note]', form);
if (note) { note.textContent = `Replaced your saved ${replaced.join(' and ')}.`; note.hidden = false; }
}
if (['product', 'location', 'yard', 'delivery'].some((k) => params.has(k))) {
save();
showDraft(true);
history.replaceState(null, '', location.pathname + location.hash);
}
refresh();
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
const validate = () => {
const bad = $$('[required]', form).filter((el) => !check(el));
form.classList.toggle('was-checked', bad.length > 0);
if (bad.length) bad[0].focus();
return !bad.length;
};
$$('[required]', form).forEach((el) => ['blur', 'change', 'input'].forEach((t) => el.addEventListener(t, () => {
if (el.getAttribute('aria-invalid') === 'true') check(el);
})));
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
(() => {
const clocks = Array.from(document.querySelectorAll('[data-clock]'));
if (!clocks.length) return;
const still = window.matchMedia('(prefers-reduced-motion: reduce)');
const formats = {};
const timeIn = (tz) => {
formats[tz] = formats[tz] || new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
return formats[tz].format(new Date());
};
const write = (el, text) => {
const cells = el.querySelectorAll('.fl');
if (!cells.length) { if (el.textContent !== text) el.textContent = text; return; }
cells.forEach((cell, i) => {
const ch = text[i] || ' ';
if (cell.textContent !== ch) cell.textContent = ch;
});
};
const tick = () => clocks.forEach((el) => {
try { write(el, timeIn(el.dataset.clock)); } catch { /* unknown zone: leave the dashes */ }
});
let paused = false;
try { paused = localStorage.getItem('uresco.clocks.paused') === '1'; } catch { /* storage blocked: start running */ }
const nextMinute = () => 60000 - (Date.now() % 60000) + 50;
const loop = () => { if (!paused) tick(); setTimeout(loop, nextMinute()); };
tick();
setTimeout(loop, nextMinute());
document.querySelectorAll('.board__head').forEach((head) => {
const board = head.closest('.board');
const btn = document.createElement('button');
btn.type = 'button';
btn.className = 'board__pause';
const paint = () => {
board.classList.toggle('is-paused', paused);
btn.innerHTML = (paused ? 'Resume' : 'Pause') + '<span class="sr-only"> the clocks</span>';
};
btn.addEventListener('click', () => {
paused = !paused;
try { localStorage.setItem('uresco.clocks.paused', paused ? '1' : '0'); } catch { /* not remembered, still works */ }
if (!paused) tick();
document.querySelectorAll('.board__pause').forEach((b) => b.dispatchEvent(new Event('uresco:paint')));
});
btn.addEventListener('uresco:paint', paint);
paint();
head.appendChild(btn);
});
if (still.matches) return;
const flip = (cell) => { cell.classList.remove('is-flip'); void cell.offsetWidth; cell.classList.add('is-flip'); };
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
/* Alaska page: "Where are you building?" The combobox, the ship-to ticket and the pin on the plate.
Markup and data come from finder() in src/pages/alaska.mjs. The ticket is already rendered for the
example place; this script only fills its fields, so nothing moves on load. Without it the three
yards are shown instead (alaska.css). */
(() => {
const root = document.querySelector('[data-finder]');
if (!root) return;
const $ = (s, el = root) => el.querySelector(s);
const $$ = (s, el = root) => Array.from(el.querySelectorAll(s));
const calm = matchMedia('(prefers-reduced-motion: reduce)');
const touch = matchMedia('(pointer: coarse)');
const fold = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’'.]/g, '').toLowerCase().trim();
const data = JSON.parse($('[data-finder-data]').textContent);
const places = data.places.map(([name, st, region, access, yard, x, y, both]) => ({ name, st, region, access, yard, x, y, both, key: fold(name) }));
const byName = new Map(places.map((p) => [p.name, p]));
const aliases = Object.entries(data.aliases).map(([alias, name]) => ({ alias, key: fold(alias), place: byName.get(name) }));
const SUGGEST = data.suggest.map((name) => ({ p: byName.get(name) }));
const input = $('.shipto__input'), list = $('.shipto__list'), clear = $('[data-clear]');
const route = $('[data-route]'), live = $('[data-live]'), searchEl = $('.shipto__search');
const field = (k) => $(`[data-r="${k}"]`, route);
let active = -1, options = [], settled = '';   // settled: the text the ticket last answered for
/* ---- The ticket ---- */
const quoteUrl = (where, yard, remote) => `${data.quote}?location=${encodeURIComponent(where)}${yard ? '&yard=' + yard : ''}${remote ? '&delivery=' + encodeURIComponent(data.delivery) : ''}`;
const quoteLinks = Array.from(document.querySelectorAll('a[href*="quote/"]')).filter((a) => !a.closest('.yard, [data-route]'));
quoteLinks.forEach((a) => { if (!a.search) a.search = '?yard=anchorage'; });
const carry = (url) => { field('quote').href = url; quoteLinks.forEach((a) => { a.href = url + a.hash; }); };
const showYard = (ids) => $$('[data-y]', route).forEach((el) => { el.hidden = !ids.includes(el.dataset.y); });
const plot = () => {
if (calm.matches) return;
const el = field('name');
el.classList.remove('is-new');
void el.offsetWidth;
el.classList.add('is-new');
};
const fill = (p) => {
const acc = data.access[p.access], yard = data.yards[p.yard];
const modes = acc.modes.map(([lane, text]) => [lane, text.replace('{yard}', yard.name)]);
field('name').textContent = `${p.name}, ${data.states[p.st]}`;
field('eg').hidden = true;
field('region').textContent = p.region;
field('tag').textContent = acc.tag;
field('tag').hidden = !acc.tag;
const start = p.both ? ['anchorage', 'fairbanks'] : [p.yard];
showYard(start);
modes.forEach(([lane, text], i) => {
field(`m${i}`).textContent = text;
field(`t${i}`).textContent = lane ? `Lane ${lane}` : '';
field(`t${i}`).hidden = !lane;
});
field('season').textContent = acc.note || '';
field('season').hidden = !acc.note;
field('how').hidden = false;
field('else').hidden = true;
field('note').hidden = false;
field('short').textContent = p.name;
carry(quoteUrl(`${p.name}, ${p.st}`, p.yard, acc.remote));
live.textContent = `${p.name}, ${data.states[p.st]}. ${acc.tag ? acc.tag + '. ' : ''}Start with ${start.map((id) => `${data.yards[id].name}, ${data.yards[id].phone}`).join(', or ')}. How freight typically gets there: ${modes.map((m) => m[1]).join('; ')}. ${acc.note ? acc.note + ' ' : ''}Typical for the region, not a schedule or a price. Any yard can help.`;
};
const fillUnknown = (text) => {
field('name').textContent = text;
field('eg').hidden = true;
field('region').textContent = 'Not on our short list';
field('tag').hidden = true;
showYard(['any']);
field('how').hidden = true;
field('else').hidden = false;
field('note').hidden = true;
field('short').textContent = text.length > 22 ? 'this job' : text;
carry(quoteUrl(text, 'anchorage'));
live.textContent = `${text} is not on our short list, which does not mean we cannot get there. Any yard can help. Use the quote button, or call a yard.`;
};
/* ---- The pin on the delivery plate ---- */
const labels = document.querySelector('.pmap__labels');
let pin = null, covered = null;
const pinOn = (p) => {
if (!labels) return;
if (covered) { covered.classList.remove('is-pinned'); covered = null; }
const show = p && p.st === 'AK' && !Object.values(data.yards).some((y) => y.name === p.name);
if (!show) { if (pin) pin.hidden = true; return; }
if (!pin) {
pin = document.createElement('span');
pin.className = 'pmap__pin';
pin.setAttribute('aria-hidden', 'true');
pin.innerHTML = '<i></i><b></b>';
labels.append(pin);
}
pin.hidden = false;
pin.style.left = `${p.x}%`;
pin.style.top = `${p.y}%`;
pin.lastChild.textContent = p.name;
covered = Array.from(labels.querySelectorAll('.pmap__town')).find((t) => t.textContent === p.name) || null;
if (covered) covered.classList.add('is-pinned');
pin.lastChild.dataset.side = p.y < 14 ? 'e' : covered ? covered.dataset.side : p.x > 66 ? 'w' : 'e';
};
/* ---- Choosing ---- */
const press = (name) => $$('.shipto__chip').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.place === name)));
const settle = () => { if (touch.matches) input.blur(); };
const show = () => route.scrollIntoView({ block: 'nearest', behavior: calm.matches ? 'auto' : 'smooth' });
const choose = (p, quiet) => {
close();
input.value = settled = p.name;
clear.hidden = false;
press(p.name);
fill(p);
plot();
pinOn(p);
if (!quiet) show();
};
const chooseUnknown = (text, quiet) => {
close();
settled = text;
clear.hidden = false;
press('');
fillUnknown(text.slice(0, 60));
plot();
pinOn(null);
if (!quiet) show();
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
const hits = out.sort((a, b) => a.rank - b.rank || a.p.name.localeCompare(b.p.name)).slice(0, 8);
return hits.length ? hits : [{ unknown: q.trim() }];
};
const setActive = (i) => {
active = i;
$$('[role=option]', list).forEach((el, j) => el.setAttribute('aria-selected', String(j === i)));
const el = list.children[i];
if (el) { input.setAttribute('aria-activedescendant', el.id); el.scrollIntoView({ block: 'nearest' }); } else input.removeAttribute('aria-activedescendant');
};
const open = () => {
options = search(input.value);
list.textContent = '';
options.forEach((o, i) => {
const li = document.createElement('li');
li.id = `${list.id}-${i}`;
li.setAttribute('role', 'option');
li.setAttribute('aria-selected', 'false');
if (o.unknown) {
li.className = 'is-none';
li.textContent = `Not on our short list. See what to do for ${o.unknown}.`;
} else {
const name = document.createElement('span');
name.textContent = o.alias ? `${o.p.name} (${o.alias})` : o.p.name;
const meta = document.createElement('small');
meta.textContent = `${o.p.region}, ${o.p.st}`;
li.append(name, meta);
}
list.append(li);
});
list.hidden = false;
searchEl.classList.add('is-open');
input.setAttribute('aria-expanded', 'true');
setActive(input.value.trim() ? 0 : -1);
};
function close() {
list.hidden = true;
searchEl.classList.remove('is-open');
input.setAttribute('aria-expanded', 'false');
input.removeAttribute('aria-activedescendant');
active = -1;
}
const take = (o, quiet) => {
if (o.unknown) chooseUnknown(o.unknown, quiet); else choose(o.p, quiet);
settle();
};
input.addEventListener('input', () => { clear.hidden = !input.value; open(); });
input.addEventListener('focus', () => {
input.select();
open();
if (window.innerWidth < 700) input.scrollIntoView({ block: 'start', behavior: calm.matches ? 'auto' : 'smooth' });
});
input.addEventListener('click', () => { if (list.hidden) open(); });
input.addEventListener('blur', () => setTimeout(() => {
close();
const text = input.value.trim();
if (text && text !== settled && document.activeElement !== input) take(search(text)[0], true);
}, 120));
input.addEventListener('keydown', (e) => {
if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
e.preventDefault();
if (list.hidden) return open();
if (e.altKey) return close();
if (options.length) setActive((active + (e.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length);
} else if (e.key === 'Enter') {
e.preventDefault();
if (list.hidden) open();
const pick = options[active] || (input.value.trim() ? options[0] : null);
if (pick) take(pick);
} else if (e.key === 'Escape') {
if (!list.hidden) { e.preventDefault(); close(); } else if (input.value) { input.value = ''; clear.hidden = true; }
}
});
list.addEventListener('mousedown', (e) => e.preventDefault());
list.addEventListener('click', (e) => {
const li = e.target.closest('[role=option]');
const o = li && options[Array.prototype.indexOf.call(list.children, li)];
if (o) take(o);
});
clear.addEventListener('click', () => { input.value = ''; clear.hidden = true; input.focus(); });
root.addEventListener('click', (e) => {
const chip = e.target.closest('.shipto__chip');
if (chip && byName.has(chip.dataset.place)) choose(byName.get(chip.dataset.place));
});
})();
(() => {
document.querySelectorAll('[data-manifest]').forEach((root) => {
const lines = Array.from(root.querySelectorAll('details.mline'));
if (!lines.length) return;
const wide = window.matchMedia('(min-width: 62.5em)');
const pointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const open = (d) => { if (d.open) return; lines.forEach((x) => { if (x !== d) x.open = false; }); d.open = true; };
if (!wide.matches) lines.forEach((d) => { d.open = false; });
let timer;
lines.forEach((d, i) => {
const row = d.querySelector('summary');
row.addEventListener('click', (e) => { if (wide.matches && d.open) e.preventDefault(); });
row.addEventListener('mousemove', () => { if (!wide.matches || !pointer.matches) return; clearTimeout(timer); timer = setTimeout(() => open(d), 200); });
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
document.addEventListener('keydown', (e) => {
if (e.key !== 'Escape' || !item.matches(':hover, :focus-within')) return;
const inside = item.matches(':focus-within');
menu.setAttribute('data-closed', '');
if (inside) item.querySelector('.nav__link').focus();
});
item.addEventListener('mouseleave', () => menu.removeAttribute('data-closed'));
item.addEventListener('focusout', (e) => { if (!item.contains(e.relatedTarget)) menu.removeAttribute('data-closed'); });
})();
(() => {
const form = document.querySelector('[data-find]');
if (!form) return;
const input = form.querySelector('input');
const clear = form.querySelector('[type=reset]');
const status = document.querySelector('[data-find-status]');
const none = document.querySelector('[data-find-none]');
const idle = status.textContent;
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, ' ').trim();
const rows = Array.from(document.querySelectorAll('[data-find-row]')).map((row) => {
const items = Array.from(row.querySelectorAll('[data-k]')).map((el) => ({ el, text: norm(el.dataset.k) }));
return { row, items, text: norm(row.dataset.findRow) + ' ' + items.map((i) => i.text).join(' ') };
});
const run = () => {
const words = norm(input.value).split(' ').filter(Boolean);
let shown = 0;
rows.forEach(({ row, items, text }) => {
const hit = words.every((w) => text.includes(w));
items.forEach((i) => i.el.classList.toggle('hl', hit && words.length > 0 && words.every((w) => i.text.includes(w))));
row.hidden = !hit;
if (hit) shown++;
});
clear.hidden = !words.length;
none.hidden = shown > 0;
if (!shown) none.querySelector('q').textContent = input.value.trim();
status.textContent = !words.length ? idle : shown ? shown + ' of ' + rows.length + ' lines' : 'Nothing listed';
};
input.addEventListener('input', run);
const narrow = window.matchMedia('(max-width: 43.6875em)');
input.addEventListener('focus', () => {
if (!narrow.matches) return;
const mast = (document.querySelector('.masthead')?.offsetHeight || 0) + 10, top = form.getBoundingClientRect().top;
if (top > mast + 4) window.scrollTo({ top: window.scrollY + top - mast, behavior: 'instant' });
});
form.addEventListener('reset', () => setTimeout(() => { run(); input.focus(); }));
form.addEventListener('submit', (e) => {
e.preventDefault();
const first = rows.find(({ row }) => !row.hidden);
if (first) first.row.querySelector('a').focus();
});
if (input.value) run();
})();
(() => {
const key = document.querySelector('[data-pj-filters]');
const out = document.querySelector('[data-pj-count]');
const sched = document.querySelector('.pj-sched');
if (!key || !out || !sched) return;
const all = out.textContent;
const buttons = Array.from(key.querySelectorAll('button[data-filter]'));
const groups = Array.from(sched.querySelectorAll('[data-sector]'));
key.addEventListener('click', (e) => {
const b = e.target.closest('button[data-filter]');
if (!b) return;
const f = b.dataset.filter;
buttons.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
groups.forEach((g) => { g.hidden = f !== 'all' && g.dataset.sector !== f; });
const n = sched.querySelectorAll('[data-sector]:not([hidden]) .pj-row').length;
out.textContent = f === 'all' ? all : `${f}: ${n} ${n === 1 ? 'kind' : 'kinds'} of work`;
const box = sched.getBoundingClientRect();
if (box.top < 0 || box.top > window.innerHeight * 0.8) sched.scrollIntoView({ block: 'start' });
});
document.querySelectorAll('.pj-index a').forEach((a) => a.addEventListener('click', () => {
const group = document.getElementById(a.hash.slice(1));
if (group && group.hidden) key.querySelector('[data-filter="all"]').click();
}));
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