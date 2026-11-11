// Reveal: anything marked [data-reveal] gets .is-in the first time it is seen, and the stylesheet draws it in.
// The hidden states exist only under html.js and only when motion is allowed, so without this file nothing is lost.
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
