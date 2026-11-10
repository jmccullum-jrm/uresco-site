// Gentle parallax: the picture inside a [data-parallax] frame drifts up to 6% of the frame's
// height as the frame crosses the screen. Only `translate` changes; nothing happens off screen
// or when the visitor has asked for reduced motion.
(() => {
  const frames = $$('[data-parallax]');
  if (!frames.length || !('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const live = new Set();
  let queued = false;
  const run = () => {
    queued = false;
    const vh = window.innerHeight;
    live.forEach((frame) => {
      const r = frame.getBoundingClientRect();
      const c = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2); // -1 below … 1 above
      const img = $('img', frame);
      if (img) img.style.translate = `0 ${(c * -0.06 * r.height).toFixed(1)}px`;
    });
  };
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(run); } };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => (e.isIntersecting ? live.add(e.target) : live.delete(e.target)));
    queue();
  }, { rootMargin: '12% 0px' });
  frames.forEach((f) => io.observe(f));
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue);
})();
