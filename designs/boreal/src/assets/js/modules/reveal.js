/* Scroll reveal: .reveal elements ease in once as they arrive. CSS hides them only under html.reveal-on,
   which this script sets just before it starts watching: a script that never arrives hides nothing.
   Whatever is already on screen when the script runs stays as it is, so nothing blinks out and back. */
(() => {
  const { $$, calm } = UCM;
  const els = $$('.reveal');
  if (!els.length) return;
  if (calm.matches || !('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('is-in')); return; }
  const height = window.innerHeight;
  els.forEach((el) => { const r = el.getBoundingClientRect(); if (r.top < height && r.bottom > 0) el.classList.add('is-in'); });
  document.documentElement.classList.add('reveal-on');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  els.forEach((el) => io.observe(el));
})();
