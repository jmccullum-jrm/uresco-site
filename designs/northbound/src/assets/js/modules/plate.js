// The route plate. On small screens the sheet is wider than its frame and pans sideways: start it
// on mainland Alaska and make the frame reachable by keyboard. On the Alaska page, the region list
// lights up its places on the plate.
(() => {
  $$('[data-plate]').forEach((plate) => {
    const frame = $('.plate__scroll', plate), sheet = $('.plate__sheet', plate);
    let placed = false;
    const fit = () => {
      const pans = frame.scrollWidth - frame.clientWidth > 4;
      if (pans) {
        frame.tabIndex = 0;
        frame.setAttribute('role', 'group');
        frame.setAttribute('aria-label', 'Map. Scroll sideways to see the whole route.');
        if (!placed) { frame.scrollLeft = Math.max(0, sheet.offsetWidth * 0.39 - frame.clientWidth / 2); placed = true; }
      } else {
        frame.removeAttribute('tabindex'); frame.removeAttribute('role'); frame.removeAttribute('aria-label');
      }
      plate.classList.toggle('is-pannable', pans);
    };
    fit();
    window.addEventListener('resize', fit);
  });

  $$('[data-finder]').forEach((finder) => {
    const plate = document.getElementById(finder.dataset.finder);
    if (!plate) return;
    const frame = $('.plate__scroll', plate), sheet = $('.plate__sheet', plate);
    const buttons = $$('button[data-region]', finder);
    let pinned = '';
    const paint = (region) => {
      if (region) plate.setAttribute('data-show', region); else plate.removeAttribute('data-show');
    };
    const pin = (region, from) => {
      pinned = pinned === region ? '' : region;
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.region === pinned)));
      paint(pinned);
      if (!pinned) return;
      // Pan a wide sheet to the region, and bring the plate back on screen if the list is below it.
      const x = +from.dataset.x || 0.4;
      if (frame.scrollWidth - frame.clientWidth > 4) frame.scrollTo({ left: Math.max(0, sheet.offsetWidth * x - frame.clientWidth / 2), behavior: 'smooth' });
      const r = plate.getBoundingClientRect();
      if (r.top < 60 || r.top > window.innerHeight * 0.55) window.scrollTo({ top: window.scrollY + r.top - 110, behavior: 'smooth' });
    };
    buttons.forEach((b) => {
      b.addEventListener('click', () => pin(b.dataset.region, b));
      b.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') paint(b.dataset.region); });
      b.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') paint(pinned); });
      b.addEventListener('focus', () => paint(b.dataset.region));
      b.addEventListener('blur', () => paint(pinned));
    });
    finder.classList.add('is-live');
  });
})();
