import { html, raw } from './html.mjs';

// 24px stroke icons, drawn for this site. currentColor throughout.
const P = {
  phone: '<path d="M5 3.5h3.2l1.6 4.2-2.1 1.4a11 11 0 0 0 5.2 5.2l1.4-2.1 4.2 1.6V17a2 2 0 0 1-2 2A15.5 15.5 0 0 1 3 5.5a2 2 0 0 1 2-2Z"/>',
  pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21Z"/><circle cx="12" cy="10" r="2.4"/>',
  arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
  'arrow-up-right': '<path d="M7 17 17 7M8 7h9v9"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  truck: '<path d="M2.5 6.5h11v9h-11zM13.5 9.5h4l3 3.2v2.8h-7"/><circle cx="6.5" cy="17" r="1.8"/><circle cx="17" cy="17" r="1.8"/>',
  ship: '<path d="M3 15.5 4.5 20h15l1.5-4.5H3Z"/><path d="M5.5 15.5V11h13v4.5M8 11V7h8v4M12 4v3"/>',
  plane: '<path d="M10.5 13.5 3 11l1.2-1.4 7.8.6 4.4-5.1c.9-1 2.4-1 2.9-.5s.5 2-.5 2.9l-5.1 4.4.6 7.8L13 21l-2.5-7.5Z"/>',
  road: '<path d="M8 3 4 21M16 3l4 18M12 4v3M12 10.5v3M12 17v3"/>',
  route: '<circle cx="6" cy="18" r="2.2"/><circle cx="18" cy="6" r="2.2"/><path d="M8 18h7.5a3.5 3.5 0 0 0 0-7h-7a3.5 3.5 0 0 1 0-7H16"/>',
  upload: '<path d="M12 15V4m-4.5 4.5L12 4l4.5 4.5"/><path d="M4 15v3.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15"/>',
  file: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  directions: '<path d="M12 2.8 21.2 12 12 21.2 2.8 12z"/><path d="M9 14v-2.5a1.5 1.5 0 0 1 1.5-1.5H15m-2-2 2 2-2 2"/>',
};

export const icon = (name, { size = 20, cls = '' } = {}) =>
  html`<svg class="i ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${raw(P[name] || '')}</svg>`;

// The mark: end grain of a flat-sawn board. Rings centred above the board read as a U.
// `rings` drops to two at favicon sizes so the U survives at 16px.
export const markSvg = ({ tile = '#F5B800', ink = '#0E0E0C', rings = [10, 19, 28], w = 5.5, id = 'm' } = {}) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><clipPath id="${id}"><rect width="64" height="64" rx="8"/></clipPath></defs><rect width="64" height="64" rx="8" fill="${tile}"/><g clip-path="url(#${id})" fill="none" stroke="${ink}" stroke-width="${w}">${rings.map((r) => `<path d="M${32 - r} 10V26A${r} ${r} 0 0 0 ${32 + r} 26V10"/>`).join('')}</g></svg>`;

export const mark = (opts) => raw(markSvg(opts).replace('<svg ', '<svg aria-hidden="true" focusable="false" '));

