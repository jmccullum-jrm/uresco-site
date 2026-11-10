// Alaska route finder: pick an example destination and the map and the yellow card answer
// "how does freight get there, and which yard do I call". The card's first state, in the HTML,
// already says the general answer, so nothing is lost without this script.
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
