/* Product lines on the home page: the photograph beside the list follows the row under the pointer
   or the keyboard focus. Photographs load the first time their row is visited. */
(() => {
  const { $$ } = UCM;
  $$('[data-lines]').forEach((root) => {
    const rows = $$('.line', root), shots = $$('.lines__shot', root);
    if (!shots.length) return;
    const items = rows.map((r) => r.closest('li'));
    let on = 0;
    items[0].classList.add('is-on');
    const show = (i) => {
      if (i === on || !shots[i]) return;
      on = i;
      items.forEach((li, j) => li.classList.toggle('is-on', j === i));
      shots[i].classList.add('is-ready');
      // Next frame, so the newly displayed photograph fades in rather than appearing.
      requestAnimationFrame(() => requestAnimationFrame(() => shots.forEach((s, j) => s.classList.toggle('is-on', j === on))));
    };
    shots.forEach((s, j) => s.addEventListener('transitionend', () => { if (j !== on) s.classList.remove('is-ready'); }));
    // The row and its quote link are one row to the pointer and the keyboard.
    items.forEach((li, i) => {
      li.addEventListener('pointerenter', () => show(i));
      li.addEventListener('focusin', () => show(i));
    });
  });
})();
