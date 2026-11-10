// Product index: the Find field narrows the nine lines to the ones that carry what was typed and marks
// the items that matched. Without this file the field is not shown and the whole list is.
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
  // On a phone the keyboard takes the lower half of the screen: bring the field up under the masthead
  // so the lines it finds stay in view while typing.
  const narrow = window.matchMedia('(max-width: 43.6875em)');
  input.addEventListener('focus', () => {
    if (!narrow.matches) return;
    const mast = (document.querySelector('.masthead')?.offsetHeight || 0) + 10, top = form.getBoundingClientRect().top;
    if (top > mast + 4) window.scrollTo({ top: window.scrollY + top - mast, behavior: 'instant' });
  });
  form.addEventListener('reset', () => setTimeout(() => { run(); input.focus(); }));
  // Enter moves to the first line that matched, so the keyboard can open it.
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const first = rows.find(({ row }) => !row.hidden);
    if (first) first.row.querySelector('a').focus();
  });
  if (input.value) run();
})();
