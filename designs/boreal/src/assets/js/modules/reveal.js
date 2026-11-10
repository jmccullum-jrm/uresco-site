/* Scroll reveal: .reveal elements ease in once as they arrive. CSS hides them only when this script
   is present and motion is welcome, so nothing depends on it. */
(() => {
  const { $$, calm } = UCM;
  const els = $$('.reveal');
  if (!els.length) return;
  if (calm.matches || !('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('is-in')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  els.forEach((el) => io.observe(el));
})();
