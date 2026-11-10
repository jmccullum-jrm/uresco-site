// Reveals: adds .is-in to .rv, .rv-img, .rv-line and the route plate as they enter the screen.
// The hidden states live in CSS behind .js and prefers-reduced-motion, so without this file,
// or with reduced motion, everything is simply visible.
(() => {
  const els = $$('.rv, .rv-img, .rv-line, [data-plate]');
  if (!els.length) return;
  const show = (el) => el.classList.add('is-in');
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) { els.forEach(show); return; }
  // A picture waiting to open is clipped to nothing, and a fully clipped element never counts
  // as on screen. So pictures are watched through their parent, which is not clipped.
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
  // The plate waits until a good part of it is on screen, so the lanes are seen drawing.
  const plates = make({ threshold: 0.3 });
  els.forEach((el) => watch(el.hasAttribute('data-plate') ? plates : io, el));
})();
