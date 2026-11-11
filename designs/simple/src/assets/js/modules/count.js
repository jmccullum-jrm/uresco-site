// Numerals tick up to their value the first time they are seen.  <dt data-count>35+</dt>
// The first text node holds the number; anything after it (a plus sign, a degree mark) is kept.
// The numerals are monospaced, so nothing moves while they count.
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
