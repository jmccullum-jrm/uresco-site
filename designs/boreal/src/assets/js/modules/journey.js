/* "How a building package travels": the step crossing the middle of the screen sets the stage's
   drawing and progress rail. Without this script the stage shows all five drawings. */
(() => {
  const { $, $$ } = UCM;
  $$('[data-journey]').forEach((root) => {
    const stage = $('.jstage', root), count = $('[data-jcount]', root), steps = $$('.jstep', root);
    if (!stage || !steps.length || !('IntersectionObserver' in window)) { steps.forEach((s) => s.classList.add('is-on')); return; }
    const set = (n) => {
      stage.dataset.step = n;
      if (count) count.textContent = '0' + n;
      steps.forEach((s) => s.classList.toggle('is-on', s.dataset.step === String(n)));
    };
    set(1);
    // A thin line a little below the middle of the screen: whichever step it crosses is the current one.
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) set(+en.target.dataset.step); });
    }, { rootMargin: '-56% 0px -43% 0px' });
    steps.forEach((s) => io.observe(s));
  });
})();
