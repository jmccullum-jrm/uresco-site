// Stock list: on wide screens, pointing at (or tabbing to) a product line shows its photograph
// in the frame beside the list. Pictures are fetched the first time they are asked for.
(() => {
  const wide = matchMedia('(min-width: 1000px)');
  $$('[data-stock]').forEach((root) => {
    const imgs = $$('.stock__frame img', root);
    const rows = $$('.stock__row', root);
    const show = (i) => {
      if (!wide.matches || !imgs[i]) return;
      const img = imgs[i];
      rows.forEach((r, j) => r.classList.toggle('is-on', j === i));
      const on = () => imgs.forEach((x) => x.classList.toggle('is-on', x === img));
      if (img.dataset.srcset) {
        img.srcset = img.dataset.srcset; img.src = img.dataset.src;
        delete img.dataset.srcset;
      }
      if (img.complete && img.naturalWidth > 1) on(); else img.addEventListener('load', on, { once: true });
    };
    rows.forEach((r, i) => {
      r.addEventListener('pointerenter', () => show(i));
      r.addEventListener('focus', () => show(i));
    });
  });
})();
