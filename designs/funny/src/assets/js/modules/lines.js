// Product index on touch screens: there is no hover, so the row crossing the middle of the
// screen flips to black instead. Desktop uses :hover and :focus-visible in CSS.
(() => {
  const list = document.querySelector('[data-lines]');
  if (!list || !('IntersectionObserver' in window) || !matchMedia('(hover: none)').matches) return;
  const io = new IntersectionObserver((entries) => entries.forEach((e) => e.target.classList.toggle('is-on', e.isIntersecting)),
    { rootMargin: '-49.5% 0px -49.5% 0px' });
  list.querySelectorAll('.line').forEach((row) => io.observe(row));
})();
