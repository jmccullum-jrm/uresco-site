// A tiny tagged-template helper: interpolated strings are escaped, arrays are joined,
// and anything already built with `html` (or wrapped in `raw`) passes through as markup.

class Raw {
  constructor(s) { this.s = s; }
  toString() { return this.s; }
}
export const raw = (s) => new Raw(String(s));

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ESC[c]);

const val = (v) => {
  if (v == null || v === false || v === true) return '';
  if (v instanceof Raw) return v.s;
  if (Array.isArray(v)) return v.map(val).join('');
  return esc(v);
};

export const html = (strings, ...vals) =>
  raw(strings.reduce((out, s, i) => out + s + (i < vals.length ? val(vals[i]) : ''), ''));

export const attrs = (o) =>
  raw(Object.entries(o).filter(([, v]) => v != null && v !== false)
    .map(([k, v]) => (v === true ? ` ${k}` : ` ${k}="${esc(v)}"`)).join(''));
