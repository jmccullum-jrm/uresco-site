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
const place = new URLSearchParams(location.search).get('location');
const placeField = $('input[name=location]', form);
if (place && placeField && !placeField.value) placeField.value = place;
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
const box = document.querySelector('[data-finder]');
if (!box) return;
let data;
try { data = JSON.parse(box.querySelector('[data-finder-data]').textContent); } catch { return; }
const map = document.querySelector('.finder [data-map]');
const card = box.querySelector('[data-way]');
const part = (name) => card.querySelector(`[data-way-${name}]`);
const quote = part('quote');
const quoteBase = quote.getAttribute('href').split('?')[0];
const buttons = Array.from(box.querySelectorAll('.town'));
const pick = (id) => {
const t = data.towns[id], w = t && data.ways[t.way];
if (!w) return;
buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.town === id)));
part('label').textContent = w.label;
part('name').textContent = t.name;
part('text').textContent = w.text;
part('yard').textContent = t.yard;
part('phone').textContent = t.phone;
part('call').href = t.tel;
quote.href = `${quoteBase}?yard=${t.yardId}&location=${encodeURIComponent(t.name + ', AK')}`;
quote.firstChild.textContent = `Quote a job in ${t.name} `;
card.dataset.ico = w.icon;
card.classList.remove('is-new'); void card.offsetWidth; card.classList.add('is-new');
if (map) {
map.dataset.mode = w.lanes;
map.querySelectorAll('.dmap__town').forEach((el) => el.classList.toggle('is-on', el.dataset.town === id));
}
};
box.addEventListener('click', (e) => { const b = e.target.closest('.town'); if (b) pick(b.dataset.town); });
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
e.target.classList.add('is-in');
io.unobserve(e.target);
}), { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
targets.forEach((el) => io.observe(el));
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