/* The Pacific Northwest and Locations pages: small things around the maps. Everything here is an extra:
   without it the town chips are plain links to a pre-filled quote and the lanes simply keep moving. */
(() => {
  const { $, $$, calm } = UCM;

  /* The Puget Sound close-up: a town chip under the pointer or the keyboard picks out its line and its
     name on the map, so the list and the map read as one thing. */
  const sound = $('[data-sound]');
  if (sound) {
    const mark = (name, on) => $$(`.pn-spoke[data-town="${name}"], .pn-town[data-town="${name}"]`, sound).forEach((el) => el.toggleAttribute('data-on', on));
    $$('.chip[data-town]', sound).forEach((chip) => {
      const on = () => mark(chip.dataset.town, true), off = () => mark(chip.dataset.town, false);
      chip.addEventListener('mouseenter', on);
      chip.addEventListener('mouseleave', off);
      chip.addEventListener('focus', on);
      chip.addEventListener('blur', off);
    });
  }

  /* The ruler on the About page draws its line once, when it arrives. */
  $$('.ab-ruler').forEach((ruler) => {
    if (calm.matches || !('IntersectionObserver' in window)) { ruler.classList.add('is-in'); return; }
    const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { ruler.classList.add('is-in'); io.disconnect(); } }, { threshold: 0.2 });
    io.observe(ruler);
  });

  /* A map without a finder still pauses its repainting lanes when it is off screen. */
  $$('[data-map]').forEach((map) => {
    if (map.closest('[data-stage]') || !('IntersectionObserver' in window)) return;
    new IntersectionObserver(([en]) => map.classList.toggle('is-paused', !en.isIntersecting)).observe(map);
  });
})();
