// Uresco site behaviour. No dependencies; every feature degrades to plain links and forms.
// Files in this folder, then modules/, are joined in name order into one site.js (see build.mjs).
// Each file is its own closure; the few shared helpers live on window.UCM.
window.UCM = {
  $: (s, el = document) => el.querySelector(s),
  $$: (s, el = document) => Array.from(el.querySelectorAll(s)),
  calm: window.matchMedia('(prefers-reduced-motion: reduce)'),
};
