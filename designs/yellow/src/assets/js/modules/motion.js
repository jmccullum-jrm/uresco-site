// Motion: reveal-on-scroll and the pause control.
// This file adds .js to <html>; until it runs nothing is hidden, so a failed download costs
// only the animation.
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
