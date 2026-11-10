// The latitude rail. Sections carry data-lat (and data-lat-to when the chapter travels); as the
// page scrolls, the reading moves between them. It drives three things: the needle on the rail
// (wide screens), the reading in the masthead and the progress line under it (small screens).
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
      // A travelling chapter moves across the middle of its height and holds at both ends.
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
