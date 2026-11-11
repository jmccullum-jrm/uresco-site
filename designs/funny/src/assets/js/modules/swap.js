// Swapping words. Any [data-swap] holds a stack of <span>s and shows one at a time.
// Inside a [data-hero], a [data-slides] stack of the same length changes with the word
// (home: TRUCK. BARGE. AIR. UCM. and the photograph in the U window).
// Without this script, or with reduced motion, the first word and photo simply stay.
(() => {
  const calm = matchMedia('(prefers-reduced-motion: reduce)');
  const run = (swap) => {
    const words = Array.from(swap.children);
    if (words.length < 2) return;
    const host = swap.closest('[data-hero]');
    const stack = host && host.querySelector('[data-slides]');
    const slides = stack && stack.children.length === words.length ? Array.from(stack.children) : null;
    let i = 0, inView = true;
    const still = () => calm.matches || document.documentElement.dataset.motion === 'off' || !inView || document.hidden;

    // Later photographs have no src in the HTML, so they never compete with the first one.
    const arm = () => slides && slides.forEach((el) => {
      if (!el.dataset.srcset) return;
      el.srcset = el.dataset.srcset; el.src = el.dataset.src;
      el.removeAttribute('data-srcset'); el.removeAttribute('data-src');
    });
    const ready = (el) => !el || el.tagName !== 'IMG' || (el.complete && el.naturalWidth > 0);

    const show = (n) => {
      const all = slides ? words.concat(slides) : words;
      const was = slides ? [words[i], slides[i]] : [words[i]];
      i = n;
      all.forEach((el) => el.classList.remove('was-on'));
      was.forEach((el) => { el.classList.remove('is-on'); el.classList.add('was-on'); });
      words[i].classList.add('is-on');
      if (slides) slides[i].classList.add('is-on');
      setTimeout(() => was.forEach((el) => el.classList.remove('was-on')), 850);
    };
    const loop = () => setTimeout(() => {
      const next = (i + 1) % words.length;
      if (!still() && ready(slides && slides[next])) show(next);
      loop();
    }, slides && i === words.length - 1 ? 3800 : 2500);

    const start = () => setTimeout(() => { if (!calm.matches) { arm(); loop(); } }, 900);
    if (document.readyState === 'complete') start(); else window.addEventListener('load', start);
    if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { inView = e.isIntersecting; }).observe(host || swap);
  };
  document.querySelectorAll('[data-swap]').forEach(run);
})();
