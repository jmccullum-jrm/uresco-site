// Technical drawings for the nine product lines, written as SVG by hand (no assets, no tracing).
//
//   drawing(slug)      full section drawing, viewBox 480 × 320, with dimensions and notes
//   glyph(slug)        48 × 48 pictogram in the same line language, for menus and lists
//
// Conventions (one system for every drawing; see DESIGN.md → Drawings):
//   .dw-o   object line        ink, 1.5px, non-scaling            sheet fill
//   .dw-h   highlighted member the one yellow fill per drawing
//   .dw-t   thin line          grain, hatch, hidden edges         0.75px
//   .dw-c   dashed line        centre lines, membranes
//   .dw-s   stipple            dots for gypsum and concrete
//   .dw-d   dimension          blue; extension lines, arrowheads, text
//   .dw-n   note               ink text with a thin leader
// Sizes are actual (dressed) sizes a framer would recognise: a 2×6 is 1½″ × 5½″.
// Each drawing is two groups, .dw-obj (the thing) and .dw-ann (dimensions and notes), so the
// stylesheet can plot the object first and the annotation after it.
import { raw } from './html.mjs';

const W = 480, H = 320;
const n = (v) => String(Math.round(v * 10) / 10);
const rng = (seed) => () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);

// ---- primitives ----
const path = (d, cls = 'dw-o', extra = '') => `<path class="${cls}" d="${d}"${extra}/>`;
const open = (d, extra = '') => path(d, 'dw-o dw-nf', extra);
const rect = (x, y, w, h, r = 0) => (r
  ? `M${n(x + r)} ${n(y)}h${n(w - 2 * r)}a${r} ${r} 0 0 1 ${r} ${r}v${n(h - 2 * r)}a${r} ${r} 0 0 1 -${r} ${r}h-${n(w - 2 * r)}a${r} ${r} 0 0 1 -${r} -${r}v-${n(h - 2 * r)}a${r} ${r} 0 0 1 ${r} -${r}z`
  : `M${n(x)} ${n(y)}h${n(w)}v${n(h)}h${n(-w)}z`);
const poly = (pts, close = true) => 'M' + pts.map(([x, y]) => `${n(x)} ${n(y)}`).join('L') + (close ? 'z' : '');
const line = (x1, y1, x2, y2) => `M${n(x1)} ${n(y1)}L${n(x2)} ${n(y2)}`;
const circle = (cx, cy, r) => `M${n(cx - r)} ${n(cy)}a${n(r)} ${n(r)} 0 1 0 ${n(2 * r)} 0a${n(r)} ${n(r)} 0 1 0 ${n(-2 * r)} 0`;
const text = (x, y, s, cls, anchor = 'middle', extra = '') => `<text class="${cls}" x="${n(x)}" y="${n(y)}" text-anchor="${anchor}"${extra}>${s}</text>`;

let clipN = 0;
// Anything drawn inside `inner` is clipped to the outline `d` (grain inside a board, strands inside a panel).
const clipped = (id, d, inner) => { const c = `${id}c${++clipN}`; return `<clipPath id="${c}"><path d="${d}"/></clipPath><g clip-path="url(#${c})">${inner}</g>`; };

// Growth rings about a pith at (cx, cy): the end grain of sawn lumber. Spacing wanders a little, as in a real tree.
const rings = (cx, cy, r0, r1, step, seed = 7) => {
  const R = rng(seed); let d = '';
  for (let r = r0; r < r1; r += step * (0.72 + R() * 0.6)) d += circle(cx + (R() - 0.5) * 1.6, cy + (R() - 0.5) * 1.6, r);
  return path(d, 'dw-t');
};
// Short strokes scattered in a box: OSB strands on edge (angle ≈ 0) or PSL strands on end (any angle).
const strands = (x, y, w, h, count, [l0, l1], spread, seed) => {
  const R = rng(seed); let d = '';
  for (let i = 0; i < count; i++) {
    const px = x + R() * w, py = y + R() * h, len = l0 + R() * (l1 - l0), a = (R() - 0.5) * spread;
    d += `M${n(px - Math.cos(a) * len / 2)} ${n(py - Math.sin(a) * len / 2)}l${n(Math.cos(a) * len)} ${n(Math.sin(a) * len)}`;
  }
  return path(d, 'dw-t');
};
// Dots scattered in a box: gypsum core, concrete paste.
const stipple = (x, y, w, h, count, seed) => {
  const R = rng(seed); let d = '';
  for (let i = 0; i < count; i++) d += `M${Math.round(x + R() * w)} ${n(y + R() * h)}h0`;
  return `<path class="dw-s" d="${d}"/>`;
};
// Short break line across a member that continues: a straight cut with one zig-zag.
const breakV = (x, y1, y2, k = 5) => { const m = (y1 + y2) / 2; return poly([[x, y1 - 5], [x, m - k], [x - k, m - k / 3], [x + k, m + k / 3], [x, m + k], [x, y2 + 5]], false); };
const breakH = (y, x1, x2, k = 5) => { const m = (x1 + x2) / 2; return poly([[x1 - 5, y], [m - k, y], [m - k / 3, y - k], [m + k / 3, y + k], [m + k, y], [x2 + 5, y]], false); };

// ---- annotation ----
// Annotation is collected here while a drawing is built, then written out as its own group.
let ANN = '';
const ann = (svg) => { ANN += svg; return ''; };
const AH = 7, AW = 2.4; // arrowhead length and half-width
const arrow = (x, y, dx, dy) => { // tip at (x, y), pointing along (dx, dy)
  const px = -dy, py = dx;
  return `<path class="dw-a" d="${poly([[x, y], [x - dx * AH + px * AW, y - dy * AH + py * AW], [x - dx * AH - px * AW, y - dy * AH - py * AW]])}"/>`;
};
// Horizontal dimension from x1 to x2. y0 is the object edge the extension lines leave from, y the dimension line.
const dimH = (x1, x2, y0, y, label, { out = false, below = false } = {}) => {
  const s = y < y0 ? -1 : 1;
  const ext = line(x1, y0 + s * 3, x1, y + s * 4) + line(x2, y0 + s * 3, x2, y + s * 4);
  const body = out
    ? line(x1 - 16, y, x1, y) + line(x2, y, x2 + 16, y)
    : line(x1, y, x2, y);
  const heads = out ? arrow(x1, y, 1, 0) + arrow(x2, y, -1, 0) : arrow(x1, y, -1, 0) + arrow(x2, y, 1, 0);
  const t = below ? text((x1 + x2) / 2, y + 5, label, 'dw-dt', 'middle', ' dominant-baseline="hanging"') : text((x1 + x2) / 2, y - 5, label, 'dw-dt');
  return ann(path(ext + body, 'dw-d') + heads + t);
};
// Vertical dimension from y1 to y2. x0 is the object edge, x the dimension line; the label sits outside it, upright.
const dimV = (y1, y2, x0, x, label, { out = false } = {}) => {
  const s = x < x0 ? -1 : 1;
  const ext = line(x0 + s * 3, y1, x + s * 4, y1) + line(x0 + s * 3, y2, x + s * 4, y2);
  const body = out ? line(x, y1 - 16, x, y1) + line(x, y2, x, y2 + 16) : line(x, y1, x, y2);
  const heads = out ? arrow(x, y1, 0, 1) + arrow(x, y2, 0, -1) : arrow(x, y1, 0, -1) + arrow(x, y2, 0, 1);
  return ann(path(ext + body, 'dw-d') + heads + text(x + s * 7, (y1 + y2) / 2, label, 'dw-dt', s < 0 ? 'end' : 'start', ' dominant-baseline="central"'));
};
// A note with a leader. The leader runs from beside the text to the thing it names and ends in a dot.
const note = (x, y, label, [tx, ty], { anchor = 'start', elbow = true } = {}) => {
  const s = anchor === 'start' ? -1 : 1;
  const sx = x + s * 5, ex = x + s * 15;
  const d = elbow ? poly([[sx, y], [ex, y], [tx, ty]], false) : line(sx, y, tx, ty);
  return ann(path(d, 'dw-l') + `<circle class="dw-a dw-a--ink" cx="${n(tx)}" cy="${n(ty)}" r="2"/>` + text(x, y, label, 'dw-nt', anchor, ' dominant-baseline="central"'));
};
const cap = (x, y, label, anchor = 'middle') => ann(text(x, y, label, 'dw-nt', anchor));
const mid = (x, y, label) => ann(text(x, y, label, 'dw-nt', 'middle', ' dominant-baseline="central"'));

// ---- the nine drawings ----
const D = {};

// 001 Framing lumber & timbers: three sawn sections on one datum.
D['framing-lumber'] = (id) => {
  const base = 232, s = 30; // 30 units to the inch
  const stud = { x: 76, w: 1.5 * s, h: 3.5 * s }, joist = { x: 170, w: 1.5 * s, h: 5.5 * s }, post = { x: 276, w: 5.5 * s, h: 5.5 * s };
  const a = rect(stud.x, base - stud.h, stud.w, stud.h, 3.5), b = rect(joist.x, base - joist.h, joist.w, joist.h, 3.5), c = rect(post.x, base - post.h, post.w, post.h, 2.5);
  const checks = path(line(post.x + 66, base - 104, post.x + 22, base - 148) + line(post.x + 78, base - 84, post.x + 124, base - 70) + line(post.x + 62, base - 78, post.x + 50, base - 34), 'dw-t');
  return path(a) + clipped(id, a, rings(stud.x - 46, base - 30, 20, 190, 8.5, 11))
    + path(b, 'dw-o dw-h') + clipped(id, b, rings(joist.x + 108, base - 208, 60, 280, 8.5, 5))
    + path(c) + clipped(id, c, rings(post.x + 70, base - 92, 5, 150, 8.5, 3) + checks)
    + path(line(46, base, 458, base), 'dw-t')
    + dimH(joist.x, joist.x + joist.w, base - joist.h, 44, '1½″')
    + dimV(base - joist.h, base, joist.x + joist.w, joist.x + joist.w + 16, '5½″')
    + dimH(post.x, post.x + post.w, base, base + 22, '5½″ SQ.', { below: true })
    + cap(stud.x + stud.w / 2, base + 30, '2×4') + cap(joist.x + joist.w / 2, base + 30, '2×6')
    + cap(post.x + post.w / 2, 44, '6×6 TIMBER');
};

// 002 Plywood, OSB & sheathing: three panel edges, enlarged.
D['panels-sheathing'] = (id) => {
  const x0 = 150, x1 = 436, wd = x1 - x0;
  const strip = (y, h, cls = 'dw-o') => `<path class="dw-f${cls.includes('dw-h') ? ' dw-h' : ''}" d="${rect(x0, y, wd, h)}"/>` + open(poly([[x1, y], [x0, y], [x0, y + h], [x1, y + h]], false)) + open(breakV(x1, y, y + h, 4.5));
  // Plywood, 23/32″: five plies; the cross plies are highlighted and hatched across the grain.
  const py = 52, plies = [8, 10, 10, 10, 8]; let y = py, ply = '', hatch = '', fill = '';
  plies.forEach((t, i) => {
    if (i % 2) { fill += rect(x0, y, wd, t); for (let x = x0 + 5; x < x1 - 4; x += 5.5) hatch += line(x, y + 1.6, x, y + t - 1.6); }
    else hatch += line(x0 + 14 + i * 22, y + t / 2, x0 + 120 + i * 20, y + t / 2) + line(x0 + 150 + i * 14, y + t / 2, x1 - 40 - i * 16, y + t / 2);
    y += t; if (i < 4) ply += line(x0, y, x1, y);
  });
  const ph = 46;
  const plywood = `<path class="dw-f" d="${rect(x0, py, wd, ph)}"/><path class="dw-f dw-h" d="${fill}"/>` + path(ply + hatch, 'dw-t') + open(poly([[x1, py], [x0, py], [x0, py + ph], [x1, py + ph]], false)) + open(breakV(x1, py, py + ph, 4.5));
  // OSB, 7/16″
  const oy = 148, oh = 28;
  const osb = strip(oy, oh) + clipped(id, rect(x0, oy, wd, oh), strands(x0, oy, wd, oh, 100, [10, 30], 0.42, 21));
  // Gypsum sheathing, 5/8″: stippled core between glass-mat facers.
  const gy = 226, gh = 40;
  const gyp = strip(gy, gh) + path(line(x0, gy + 3, x1, gy + 3) + line(x0, gy + gh - 3, x1, gy + gh - 3), 'dw-t') + stipple(x0 + 3, gy + 6, wd - 8, gh - 12, 170, 9);
  return plywood + osb + gyp
    + dimV(py, py + ph, x0, x0 - 16, '23/32″')
    + dimV(oy, oy + oh, x0, x0 - 16, '7/16″')
    + dimV(gy, gy + gh, x0, x0 - 16, '5/8″')
    + cap(x0, py - 9, 'PLYWOOD · 5 PLY', 'start') + cap(x0, oy - 9, 'OSB', 'start') + cap(x0, gy - 9, 'GYPSUM SHEATHING', 'start');
};

// 003 Engineered wood: I-joist, glulam, LVL and PSL at one depth.
D['engineered-wood'] = (id) => {
  const s = 17, base = 250, dep = 11.875 * s, top = base - dep;
  // I-joist: 2½″ × 1½″ flanges, 3/8″ web let into both.
  const ix = 86, fw = 2.5 * s, fh = 1.5 * s, ww = 0.375 * s, wx = ix + fw / 2 - ww / 2;
  const tf = rect(ix, top, fw, fh, 1.5), bf = rect(ix, base - fh, fw, fh, 1.5), web = rect(wx, top + fh, ww, dep - 2 * fh);
  const ij = path(web) + clipped(id, web, strands(wx, top + fh, ww, dep - 2 * fh, 26, [5, 11], 0.5, 4))
    + path(tf, 'dw-o dw-h') + path(bf, 'dw-o dw-h')
    + path(line(wx, top + fh, wx, top + fh - 9) + line(wx + ww, top + fh, wx + ww, top + fh - 9) + line(wx, top + fh - 9, wx + ww, top + fh - 9) + line(wx, base - fh, wx, base - fh + 9) + line(wx + ww, base - fh, wx + ww, base - fh + 9) + line(wx, base - fh + 9, wx + ww, base - fh + 9), 'dw-t');
  // Glulam: 3⅛″ × 12″, eight 1½″ laminations.
  const gx = 178, gw = 3.125 * s, gd = 12 * s, gt = base - gd, lam = gd / 8;
  let lams = '', grain = '';
  for (let i = 1; i < 8; i++) lams += line(gx, gt + i * lam, gx + gw, gt + i * lam);
  for (let i = 0; i < 8; i++) {
    const up = i % 2 ? 1 : -1, cy = gt + i * lam + lam / 2 + up * (30 + (i * 5) % 9), cx = gx + gw * (0.25 + 0.5 * ((i * 7) % 5) / 4);
    grain += clipped(id, rect(gx, gt + i * lam, gw, lam), path(circle(cx, cy, 22) + circle(cx, cy, 29) + circle(cx, cy, 36) + circle(cx, cy, 43), 'dw-t'));
  }
  const gl = path(rect(gx, gt, gw, gd)) + grain + path(lams, 'dw-t dw-t--o');
  // LVL: 1¾″ × 11⅞″, veneers on edge.
  const lx = 282, lw = 1.75 * s; let ven = '';
  for (let i = 1; i < 7; i++) ven += line(lx + i * lw / 7, top + 1, lx + i * lw / 7, base - 1);
  const lvl = path(rect(lx, top, lw, dep)) + path(ven, 'dw-t');
  // PSL: 3½″ × 11⅞″, strands seen on end.
  const px = 364, pw = 3.5 * s;
  const psl = path(rect(px, top, pw, dep)) + clipped(id, rect(px, top, pw, dep), strands(px, top, pw, dep, 170, [3.5, 9], 3.1, 17));
  const dy = 30;
  return ij + gl + lvl + psl + path(line(60, base, 446, base), 'dw-t')
    + dimV(top, base, ix, ix - 18, '11⅞″')
    + dimH(ix, ix + fw, top, dy, '2½″') + dimH(gx, gx + gw, gt, dy, '3⅛″') + dimH(lx, lx + lw, top, dy, '1¾″') + dimH(px, px + pw, top, dy, '3½″')
    + cap(ix + fw / 2, base + 28, 'I-JOIST') + cap(gx + gw / 2, base + 28, 'GLULAM') + cap(lx + lw / 2, base + 28, 'LVL') + cap(px + pw / 2, base + 28, 'PSL');
};

// 004 Concrete forming: section through an overlaid panel with the pour against it.
D['concrete-forming'] = (id) => {
  const y1 = 44, y2 = 276, cx0 = 44, px = 176, ov = 6, core = 75, plies = [9, 11.5, 11.5, 11, 11.5, 11.5, 9];
  const R = rng(31); let agg = '';
  for (let i = 0; i < 34; i++) { const x = cx0 + 8 + R() * (px - cx0 - 22), y = y1 + 8 + R() * (y2 - y1 - 20), k = 3 + R() * 4.5, a = R() * 6.28; agg += poly([[x + Math.cos(a) * k, y + Math.sin(a) * k], [x + Math.cos(a + 2.2) * k, y + Math.sin(a + 2.2) * k], [x + Math.cos(a + 4.1) * k * 0.9, y + Math.sin(a + 4.1) * k * 0.9]]); }
  const conc = `<path class="dw-f dw-f--tone" d="${rect(cx0, y1, px - cx0, y2 - y1)}"/>` + stipple(cx0 + 2, y1 + 3, px - cx0 - 4, y2 - y1 - 6, 210, 13) + path(agg, 'dw-t') + path(breakV(cx0, y1, y2, 6), 'dw-t');
  let x = px + ov, lines = '', hatch = '';
  plies.forEach((t, i) => {
    if (i % 2) for (let y = y1 + 6; y < y2 - 3; y += 6) hatch += line(x + 1.8, y, x + t - 1.8, y);
    else hatch += line(x + t / 2, y1 + 16 + i * 9, x + t / 2, y1 + 96 + i * 6) + line(x + t / 2, y1 + 120 + i * 7, x + t / 2, y2 - 22 - i * 5);
    x += t; if (i < 6) lines += line(x, y1, x, y2);
  });
  const pr = px + ov + core + ov;
  const panel = `<path class="dw-f" d="${rect(px + ov, y1, core, y2 - y1)}"/>` + path(lines + hatch, 'dw-t')
    + path(rect(px, y1, ov, y2 - y1), 'dw-o dw-h') + path(rect(pr - ov, y1, ov, y2 - y1), 'dw-o dw-h')
    + path(breakH(y1, cx0 + 4, pr, 5) + breakH(y2, cx0 + 4, pr, 5), 'dw-t dw-t--o');
  const nx = 300;
  return conc + panel
    + dimH(px, pr, y1, 24, '¾″ PANEL')
    + note(nx, 96, 'OVERLAY FACE', [pr - ov / 2, 110]) + note(nx, 160, 'PLYWOOD CORE', [px + ov + core / 2 + 6, 174]) + note(nx, 224, 'CLEAN RELEASE', [px + ov / 2, 238])
    + cap((cx0 + px) / 2, y2 + 22, 'CONCRETE') + cap(px + ov + core / 2, y2 + 22, 'MDO / HDO');
};

// 005 Cedar: three profiles in section.
D['cedar-decking'] = (id) => {
  const s = 44, x0 = 122, wd = 5.5 * s, x1 = x0 + wd;
  // Bevel siding ½ × 6: ½″ butt tapering to 3/16″.
  const by = 46, bt = 0.5 * s, tip = 0.1875 * s;
  const bevel = poly([[x0, by + bt - tip], [x1, by], [x1, by + bt], [x0, by + bt]]);
  // Channel siding 1 × 6: ¾″ thick, rabbeted to lap with a shadow channel.
  const cy = 122, ct = 0.75 * s, rb = 0.5 * s, half = ct / 2;
  const chan = poly([[x0, cy], [x1 - rb, cy], [x1 - rb, cy + half], [x1, cy + half], [x1, cy + ct], [x0 + rb * 1.6, cy + ct], [x0 + rb * 1.6, cy + half], [x0, cy + half]]);
  // Decking 5/4 × 6: 1″ × 5½″ with radius edges.
  const dy = 208, dt = 1 * s;
  const deck = rect(x0, dy, wd, dt, 9);
  return path(bevel, 'dw-o dw-h') + clipped(id, bevel, rings(x0 + 150, by + 300, 250, 330, 6, 8))
    + path(chan) + clipped(id, chan, rings(x0 + 90, cy - 250, 240, 330, 7, 14))
    + path(deck) + clipped(id, deck, rings(x0 + 120, dy + 150, 96, 220, 7.5, 2))
    + dimH(x0, x1, dy + dt, dy + dt + 22, '5½″', { below: true })
    + dimV(by, by + bt, x1, x1 + 18, '½″', { out: true }) + dimV(cy, cy + ct, x1, x1 + 18, '¾″', { out: true }) + dimV(dy, dy + dt, x1, x1 + 18, '1″')
    + cap(x0, by - 8, 'BEVEL SIDING', 'start') + cap(x0, cy - 10, 'CHANNEL SIDING', 'start') + cap(x0, dy - 10, '5/4 × 6 DECKING', 'start');
};

// 006 Siding & wraps: lap siding over house wrap, in section and in elevation.
D['siding-exterior'] = (id) => {
  const s = 12, y1 = 36, y2 = 276, sx = 40, sw = 5.5 * s, shx = sx + sw, sh = 7, wx = shx + sh + 4, face = wx + 3.5;
  const exp = 7 * s, len = 8.25 * s, th = 7;
  const stud = rect(sx, y1, sw, y2 - y1);
  const grain = path(line(sx + 14, y1 + 8, sx + 14, y2 - 60) + line(sx + 30, y1 + 50, sx + 30, y2 - 10) + line(sx + 47, y1 + 14, sx + 47, y2 - 90) + line(sx + 56, y1 + 120, sx + 56, y2 - 24), 'dw-t');
  const plank = (butt) => poly([[face, butt - len], [face + th, butt - len], [face + th * 2, butt], [face + th, butt]]);
  const A = 264, B = A - exp, out = face + th * 2;
  const starter = rect(face, A - 16, th, 16);
  const nail = (y) => line(face + th + 3, y - 1.4, shx - 18, y + 3.4);
  // Elevation, projected across from the section.
  const ex0 = 336, ex1 = 448;
  const courses = [A, B, B - exp].map((y) => line(ex0, y, ex1, y)).join('');
  const elev = `<path class="dw-f" d="${rect(ex0, y1 + 14, ex1 - ex0, A - y1 - 14)}"/><path class="dw-f dw-h" d="${rect(ex0, B, ex1 - ex0, exp)}"/>`
    + open(poly([[ex0, y1 + 14], [ex0, A], [ex1, A], [ex1, y1 + 14]], false) + courses + line(ex0 + 70, B, ex0 + 70, B - exp)) + path(breakH(y1 + 14, ex0 + 4, ex1 - 4, 5), 'dw-t dw-t--o');
  const proj = path(line(out + 6, A, ex0 - 6, A) + line(out + 6, B, ex0 - 6, B), 'dw-c');
  return path(stud) + grain + path(rect(shx, y1, sh, y2 - y1)) + path(breakH(y1, sx + 4, shx + sh, 5) + breakH(y2, sx + 4, shx + sh, 5), 'dw-t dw-t--o')
    + path(line(wx, y1 + 4, wx, y2 - 6), 'dw-c dw-c--wrap')
    + path(starter) + path(plank(A), 'dw-o dw-h') + path(plank(B)) + path(nail(A - len + 12) + nail(B - len + 12), 'dw-t dw-t--o')
    + proj + elev
    + dimV(B, A, out, out + 22, '7″')
    + note(206, 56, 'HOUSE WRAP', [wx, 64]) + note(206, 100, 'BLIND NAIL', [face + th + 3, B - len + 10.6])
    + cap(sx + sw / 2 + 10, y2 + 26, 'SECTION') + cap((ex0 + ex1) / 2, y2 + 26, 'ELEVATION') + mid(sx + sw / 2, 168, '2×6');
};

// 007 Insulation & drywall: plan section of a 2×6 wall with batts and continuous foam.
D['insulation-drywall'] = (id) => {
  const s = 13, x0 = 64, x1 = 448, yf = 96, foam = 1.5 * s, shh = 6.5, cav = 5.5 * s, dw = 6.5;
  const ys = yf + foam, yc = ys + shh, yd = yc + cav, yb = yd + dw;
  const sw = 1.5 * s, oc = 16 * s, c1 = 132, c2 = c1 + oc;
  const stud = (c) => rect(c - sw / 2, yc, sw, cav, 2);
  // The drafting symbol for batt insulation: one continuous looping line.
  const batt = (a, b) => { const p = 15, top = yc + 5, bot = yd - 5; let d = `M${n(a)} ${n(bot)}`, up = true; for (let x = a; x + p <= b + 0.1; x += p, up = !up) d += `C${n(x + p * 1.35)} ${n(up ? bot : top)} ${n(x - p * 0.35)} ${n(up ? top : bot)} ${n(x + p)} ${n(up ? top : bot)}`; return d; };
  const bays = [[x0 + 2, c1 - sw / 2 - 2], [c1 + sw / 2 + 2, c2 - sw / 2 - 2], [c2 + sw / 2 + 2, x1 - 2]];
  const fit = ([a, b]) => { const k = Math.max(1, Math.round((b - a) / 15)); return [a + ((b - a) - k * 15) / 2, a + ((b - a) - k * 15) / 2 + k * 15]; };
  const fl = `<path class="dw-f dw-h" d="${rect(x0, yf, x1 - x0, foam)}"/><path class="dw-f" d="${rect(x0, ys, x1 - x0, yb - ys)}"/>`;
  const layers = open(line(x0, yf, x1, yf) + line(x0, ys, x1, ys) + line(x0, yc, x1, yc) + line(x0, yd, x1, yd) + line(x0, yb, x1, yb));
  return fl + stipple(x0 + 2, yd + 1.5, x1 - x0 - 4, dw - 3, 170, 5) + path(bays.map((b) => batt(...fit(b))).join(''), 'dw-t dw-t--o')
    + layers + [c1, c2].map((c, i) => path(stud(c)) + clipped(id, stud(c), rings(c + (i ? 40 : -44), yc + 90, 30, 150, 6.5, 3 + i))).join('')
    + path(breakV(x0, yf, yb, 5) + breakV(x1, yf, yb, 5), 'dw-t dw-t--o')
    + path(line(c1, yc - 16, c1, yb + 14) + line(c2, yc - 16, c2, yb + 14), 'dw-c')
    + dimH(c1, c2, yb + 6, yb + 34, '16″ O.C.', { below: true })
    + dimV(yc, yd, x0 - 4, x0 - 20, '5½″')
    + note(150, 52, 'RIGID FOAM', [116, yf + foam / 2]) + note(336, 52, 'SHEATHING', [302, ys + shh / 2])
    + note(352, yb + 46, 'DRYWALL', [322, yd + dw / 2])
    + mid((c1 + c2) / 2, (yc + yd) / 2, 'BATT');
};

// 008 Windows, doors & cabinets: three elevations on one floor line, heads aligned.
D['windows-doors-cabinets'] = (id) => {
  const s = 2.6, floor = 258, head = floor - 80 * s, tr = 5.5;
  // Door 3068
  const dx = 84, dwd = 36 * s;
  const door = path(rect(dx - tr, head - tr, dwd + 2 * tr, floor - head + tr)) + path(rect(dx, head, dwd, floor - head))
    + path(rect(dx + 13, head + 14, dwd - 26, 88) + rect(dx + 13, head + 114, dwd - 26, floor - head - 128), 'dw-t dw-t--o')
    + path(circle(dx + dwd - 9, floor - 36 * s, 2.6) + line(dx + dwd - 9, floor - 36 * s, dx + dwd - 20, floor - 36 * s));
  // Window 3050, single-hung, head at door height
  const wx = 212, wwd = 36 * s, wh = 60 * s, sill = head + wh, mid = head + wh / 2;
  const win = path(rect(wx - tr, head - tr, wwd + 2 * tr, wh + 2 * tr)) + path(rect(wx, head, wwd, wh))
    + path(rect(wx + 6, head + 6, wwd - 12, wh / 2 - 9), 'dw-o dw-h') + path(rect(wx + 6, mid + 3, wwd - 12, wh / 2 - 9), 'dw-o dw-h')
    + path(line(wx + 22, head + 44, wx + 46, head + 20) + line(wx + 30, head + 56, wx + 62, head + 24) + line(wx + 22, mid + 44, wx + 46, mid + 20), 'dw-t')
    + path(poly([[wx - tr - 4, sill + tr], [wx + wwd + tr + 4, sill + tr], [wx + wwd + tr + 4, sill + tr + 5], [wx - tr - 4, sill + tr + 5]]));
  // Base cabinet, 36″ wide, 36″ to the counter
  const cx = 340, cw = 36 * s, ctop = floor - 36 * s, kick = 4 * s;
  const cab = path(rect(cx - 3, ctop, cw + 6, 4)) + path(rect(cx, ctop + 4, cw, floor - ctop - 4 - kick)) + path(rect(cx + 7, floor - kick, cw - 7, kick), 'dw-t dw-t--o')
    + path(rect(cx + 6, ctop + 10, cw - 12, 16) + rect(cx + 6, ctop + 32, cw / 2 - 8, floor - kick - ctop - 38) + rect(cx + cw / 2 + 2, ctop + 32, cw / 2 - 8, floor - kick - ctop - 38), 'dw-t dw-t--o')
    + path(line(cx + cw / 2 - 8, ctop + 18, cx + cw / 2 + 8, ctop + 18) + line(cx + cw / 2 - 5, ctop + 40, cx + cw / 2 - 5, ctop + 52) + line(cx + cw / 2 + 5, ctop + 40, cx + cw / 2 + 5, ctop + 52));
  return open(line(48, floor, 452, floor)) + door + win + cab
    + path(line(dx + dwd + tr + 6, head, wx - tr - 6, head) + line(wx + wwd + tr + 6, head, 446, head), 'dw-c')
    + dimV(head, floor, dx - tr, dx - tr - 16, '6′-8″')
    + dimH(wx, wx + wwd, head - tr, head - 26, '3′-0″')
    + dimV(head, sill, wx + wwd + tr, wx + wwd + tr + 16, '5′-0″')
    + cap(dx + dwd / 2, floor + 26, 'DOOR') + cap(wx + wwd / 2, floor + 26, 'WINDOW') + cap(cx + cw / 2, floor + 26, 'CABINET');
};

// 009 Hardware: a face-mount joist hanger on a header, joist in section; fasteners below.
D['hardware-supplies'] = (id) => {
  const s = 18, top = 52, dep = 9.25 * s, bot = top + dep, hx0 = 52, hx1 = 428;
  const jw = 1.5 * s, jx = 240 - jw / 2, fl = 1.5 * s, ht = bot - 7.75 * s;
  const header = rect(hx0, top, hx1 - hx0, dep);
  const hg = path(line(hx0 + 10, top + 26, 196, top + 22) + line(290, top + 30, hx1 - 12, top + 24) + line(hx0 + 30, top + 70, 180, top + 74) + line(318, top + 96, hx1 - 40, top + 90) + line(hx0 + 8, top + 118, 190, top + 114) + line(288, top + 126, hx1 - 10, top + 120) + line(hx0 + 50, top + 150, 150, top + 152) + line(310, top + 152, hx1 - 60, top + 150), 'dw-t');
  const flange = (x, dir) => poly([[x, ht + 10], [x + dir * 10, ht], [x + dir * fl, ht], [x + dir * fl, bot - 6], [x + dir * (fl - 6), bot], [x, bot]]);
  const holes = (x, dir) => [0, 1, 2, 3, 4].map((i) => circle(x + dir * (i % 2 ? 9 : 18), ht + 18 + i * 25, 2.7)).join('');
  const joist = rect(jx, top, jw, dep, 3);
  const seat = poly([[jx - 2.5, bot - 4], [jx - 2.5, bot + 2.5], [jx + jw + 2.5, bot + 2.5], [jx + jw + 2.5, bot - 4]], false);
  // Fasteners: a nail and a structural screw
  const fy = bot + 44;
  const nail = path(line(92, fy - 6, 92, fy + 6) + poly([[92, fy - 1.6], [176, fy - 1.6], [186, fy], [176, fy + 1.6], [92, fy + 1.6]]));
  let thr = ''; for (let x = 330; x < 396; x += 5) thr += line(x, fy - 3.4, x + 3, fy + 3.4);
  const screw = path(poly([[280, fy - 6.5], [287, fy - 6.5], [287, fy - 9], [290, fy - 9], [290, fy + 9], [287, fy + 9], [287, fy + 6.5], [280, fy + 6.5]]) + poly([[290, fy - 2.6], [396, fy - 2.6], [406, fy], [396, fy + 2.6], [290, fy + 2.6]])) + path(thr, 'dw-t');
  return path(header) + hg + path(breakV(hx0, top, bot, 5) + breakV(hx1, top, bot, 5), 'dw-t dw-t--o')
    + path(flange(jx, -1), 'dw-o dw-h') + path(flange(jx + jw, 1), 'dw-o dw-h') + path(holes(jx, -1) + holes(jx + jw, 1), 'dw-o dw-o--hole')
    + path(joist) + clipped(id, joist, rings(jx - 60, top + 60, 30, 240, 7.5, 6)) + path(seat, 'dw-o dw-o--seat')
    + dimH(jx, jx + jw, top, 28, '1½″')
    + note(318, top + 66, 'HANGER', [jx + jw + fl - 8, top + 80]) + note(160, top + 132, 'JOIST', [jx + 8, top + 140], { anchor: 'end' })
    + cap(hx0 + 14, top + 48, 'HEADER', 'start')
    + nail + screw + cap(139, fy + 24, 'NAIL') + cap(343, fy + 24, 'STRUCTURAL SCREW');
};

// 010 A package made up for freight: a banded, wrapped unit on dunnage and a crate on skids, in elevation.
D['package'] = (id) => {
  const ground = 250, ux0 = 58, ux1 = 300, top = 112, bot = 224, rows = 8, rh = (bot - top) / rows;
  // The unit: courses of lumber seen from the side.
  let courses = '';
  for (let i = 1; i < rows; i++) courses += line(ux0, top + i * rh, ux1, top + i * rh);
  const butts = [[1, 96], [1, 214], [2, 150], [3, 78], [3, 236], [4, 176], [5, 118], [5, 262], [6, 198], [7, 90], [7, 244]].map(([r, x]) => line(ux0 + x - 58 + 20, top + r * rh, ux0 + x - 58 + 20, top + (r + 1) * rh)).join('');
  const unit = path(rect(ux0, top, ux1 - ux0, bot - top)) + path(courses + butts, 'dw-t');
  // Wrap over the top and part-way down the sides.
  const wrap = path(poly([[ux0 - 4, top + 34], [ux0 - 4, top - 5], [ux1 + 4, top - 5], [ux1 + 4, top + 34], [ux1 - 26, top + 30], [ux1 - 70, top + 35], [ux0 + 120, top + 30], [ux0 + 60, top + 35], [ux0 + 22, top + 30]]), 'dw-o dw-h');
  // Three steel bands with seals, each over a block of dunnage.
  const bx = [ux0 + 38, (ux0 + ux1) / 2 - 3, ux1 - 44];
  const bands = bx.map((x) => path(rect(x, top - 7, 6, bot - top + 7)) + path(rect(x - 2, top + 48, 10, 7), 'dw-o dw-o--hole')).join('');
  const dun = bx.map((x, i) => { const d = rect(x - 10, bot, 26, 26, 2); return path(d) + clipped(id, d, rings(x + (i % 2 ? 22 : -8), bot + 34, 8, 60, 6, 4 + i)); }).join('');
  // A crate on skids: framed plywood with a diagonal brace.
  const cx0 = 346, cx1 = 448, ct = 142, cb = 238;
  const crate = path(rect(cx0, ct, cx1 - cx0, cb - ct)) + path(rect(cx0 + 10, ct + 10, cx1 - cx0 - 20, cb - ct - 20), 'dw-o dw-nf')
    + path(poly([[cx0 + 10, cb - 20], [cx0 + 10, cb - 10], [cx0 + 20, cb - 10], [cx1 - 10, ct + 20], [cx1 - 10, ct + 10], [cx1 - 20, ct + 10]]), 'dw-o')
    + path(line(cx0 + 4, ct + 5, cx0 + 6, ct + 5) + line(cx1 - 6, ct + 5, cx1 - 4, ct + 5) + line(cx0 + 4, cb - 5, cx0 + 6, cb - 5) + line(cx1 - 6, cb - 5, cx1 - 4, cb - 5), 'dw-s')
    + path(rect(cx0 + 8, cb, 16, ground - cb) + rect(cx1 - 24, cb, 16, ground - cb));
  return unit + wrap + bands + dun + crate + path(line(34, ground, 460, ground), 'dw-t')
    + note(140, 74, 'WRAP', [112, top + 8]) + note(232, 74, 'STEEL BANDING', [bx[1] + 3, top + 20])
    + note(124, ground + 34, 'DUNNAGE', [bx[0] + 6, bot + 15])
    + cap((cx0 + cx1) / 2, ground + 38, 'CRATE');
};

const TITLES = {
  'framing-lumber': 'Section drawing: a 2×4, a 2×6 measuring one and a half by five and a half inches, and a 6×6 timber, each showing end grain.',
  'panels-sheathing': 'Edge details of three panels: five-ply plywood, oriented strand board and gypsum sheathing.',
  'engineered-wood': 'Sections of an I-joist, a glulam beam, laminated veneer lumber and parallel strand lumber, all about twelve inches deep.',
  'concrete-forming': 'Section through an overlaid plywood form panel with concrete poured against its face.',
  'cedar-decking': 'Profiles of bevel cedar siding, channel siding and a five-quarter by six deck board.',
  'siding-exterior': 'Wall section and elevation showing lap siding with a seven inch exposure over house wrap, sheathing and a 2×6 stud.',
  'insulation-drywall': 'Plan section of a 2×6 wall at sixteen inches on centre with batt insulation, sheathing, rigid foam outside and drywall inside.',
  'windows-doors-cabinets': 'Elevations of a door, a single-hung window with its head at door height, and a base cabinet.',
  'hardware-supplies': 'A face-mount joist hanger carrying a joist on a header, with a nail and a structural screw below.',
  package: 'A lumber unit wrapped across the top, held by three steel bands and set on dunnage, beside a braced plywood crate on skids.',
};

export const drawing = (slug, { id = 'dw' } = {}) => {
  const make = D[slug];
  if (!make) throw new Error(`No drawing for "${slug}"`);
  const uid = `${id}-${slug.split('-')[0]}`;
  ANN = '';
  const obj = make(uid);
  return raw(`<svg class="dw" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="${uid}-t"><title id="${uid}-t">${TITLES[slug]}</title><g class="dw-obj">${obj}</g><g class="dw-ann">${ANN}</g></svg>`);
};

// ---- glyphs: 48 × 48 pictograms ----
const G = {
  'framing-lumber': `<path class="dw-h" d="M9 8h9v32H9z"/><path d="M9 8h9v32H9zM24 20h16v20H24z"/><path class="t" d="M9 30a14 14 0 0 1 9-13M9 38a22 22 0 0 1 9-16M32 30m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0M32 30m-7 0a7 7 0 1 0 14 0a7 7 0 1 0-14 0"/>`,
  'panels-sheathing': `<path class="dw-h" d="M6 20h36v8H6z"/><path d="M6 12h36v24H6zM6 20h36M6 28h36"/><path class="t" d="M11 22v4M16 22v4M21 22v4M26 22v4M31 22v4M36 22v4M10 16h12M26 16h12M10 32h14M28 32h10"/>`,
  'engineered-wood': `<path class="dw-h" d="M12 7h24v7H12zM12 34h24v7H12z"/><path d="M12 7h24v7H12zM12 34h24v7H12zM22 14h4v20h-4z"/>`,
  'concrete-forming': `<path class="dw-tone" d="M5 6h19v36H5z"/><path class="dw-h" d="M24 6h6v36h-6z"/><path d="M24 6h6v36h-6zM30 6h11v36H30z"/><path class="t" d="M34 6v36M37.500 6v36M10 13l4 1-3 3zM16 24l3 3-4 1zM9 33l4-2 0 4zM17 37l2 2-3 0zM18 12l2 1-2 2zM5 6v36"/>`,
  'cedar-decking': `<path class="dw-h" d="M6 15 42 10v7H6z"/><path d="M6 15 42 10v7H6zM6 27 42 22v7H6zM6 39 42 34v7H6z"/>`,
  'siding-exterior': `<path class="dw-h" d="M10 19h30l2 9H12z"/><path d="M10 10h30l2 9H12zM10 19h30l2 9H12zM10 28h30l2 9H12z"/><path class="t" d="M7 6v36"/>`,
  'insulation-drywall': `<path class="dw-h" d="M5 9h38v6H5z"/><path d="M5 9h38M5 15h38M5 37h38M5 41h38"/><path class="t" d="M7 34C17 34 4 18 12 18S9 34 17 34 14 18 22 18s-3 16 5 16-3-16 5-16-3 16 5 16-1-12 4-15"/>`,
  'windows-doors-cabinets': `<path class="dw-h" d="M13 9h22v14H13zM13 25h22v14H13z"/><path d="M10 6h28v36H10zM13 9h22v14H13zM13 25h22v14H13z"/><path class="t" d="M17 19l6-6M19 36l6-6"/>`,
  'hardware-supplies': `<path class="dw-h" d="M9 10h9v30H9zM30 10h9v30h-9z"/><path d="M9 14l4-4h5v30H9zM39 14l-4-4h-5v30h9zM18 6h12v34H18z"/><path class="t" d="M13.500 18h.01M13.500 25h.01M13.500 32h.01M34.500 18h.01M34.500 25h.01M34.500 32h.01" style="stroke-width:2.5px;stroke-linecap:round"/>`,
};
export const glyph = (slug, { size = 40 } = {}) =>
  raw(`<svg class="gl" width="${size}" height="${size}" viewBox="0 0 48 48" aria-hidden="true" focusable="false">${G[slug] || ''}</svg>`);

// ---- building types: small elevations for the schedule of work ----
const B = {
  // A house raised on piles, the way it is built off the road system.
  village: `<path class="dw-h" d="M14 20h44v16H14z"/><path d="M9 20 36 7l27 13zM14 20h44v16H14zM42 26h7v10h-7zM21 25h9v6h-9zM4 46h64"/><path class="t" d="M19 36v10M36 36v10M53 36v10M49 36l7 10M25.500 25v6M51 39.500h2M53 42.500h2"/>`,
  public: `<path class="dw-h" d="M8 26h50v20H8z"/><path d="M4 26 33 13l29 13zM8 26h50v20H8zM28 34h10v12H28zM4 46h66M65 46V8"/><path class="t" d="M13 31h9v7h-9zM44 31h9v7h-9zM33 34v12M65 9h-8v5h8"/>`,
  multi: `<path class="dw-h" d="M12 8h40v38H12z"/><path d="M10 8h44M12 8h40v38H12zM52 16h10v30H52zM4 46h66"/><path class="t" d="M17 13h7v6h-7zM28.500 13h7v6h-7zM40 13h7v6h-7zM17 24h7v6h-7zM28.500 24h7v6h-7zM40 24h7v6h-7zM17 35h7v6h-7zM40 35h7v6h-7zM28.500 35h7v11h-7zM55 21h4v5h-4zM55 31h4v5h-4zM12 20.500h40M12 31.500h40"/>`,
  home: `<path class="dw-h" d="M10 24h30v22H10z"/><path d="M6 24 25 9l19 15zM10 24h30v22H10zM40 30l24-5v21H40zM31 14V7h5v11M4 46h66"/><path class="t" d="M16 30h9v8h-9zM30 33h6v13h-6zM46 34h12v6H46zM20.500 30v8M52 34v6"/>`,
};
export const sketch = (name, { size = 72 } = {}) =>
  raw(`<svg class="gl gl--wide" width="${size}" height="${Math.round(size * 2 / 3)}" viewBox="0 0 72 48" aria-hidden="true" focusable="false">${B[name] || ''}</svg>`);
