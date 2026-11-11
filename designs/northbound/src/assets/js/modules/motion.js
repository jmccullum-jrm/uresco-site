// Anything that moves on its own can be stopped. Today that is the pulse on the route plate's yard
// marks, so the control sits with the plate and exists only where the pulse runs. The choice is
// remembered for the visit's browser; html.is-still (20-chrome.css) does the stopping.
(() => {
  const plates = $$('[data-plate]').filter((p) => $('.yardmark__pulse', p));
  if (!plates.length || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const KEY = 'uresco-still', root = document.documentElement;
  const remembered = () => { try { return localStorage.getItem(KEY) === '1'; } catch { return false; } };
  const remember = (still) => { try { localStorage.setItem(KEY, still ? '1' : '0'); } catch { /* private window */ } };
  const buttons = plates.map((plate) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'still';
    ($('.plate__legend', plate) || plate).append(b);
    return b;
  });
  const paint = (still) => {
    root.classList.toggle('is-still', still);
    buttons.forEach((b) => { b.textContent = still ? 'Resume motion' : 'Pause motion'; });
  };
  buttons.forEach((b) => b.addEventListener('click', () => {
    const still = !root.classList.contains('is-still');
    paint(still);
    remember(still);
  }));
  paint(remembered());
})();
