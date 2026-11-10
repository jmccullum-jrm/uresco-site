// Technical drawings for the nine product lines, written as SVG by hand (no assets, no tracing).
//
//   drawing(slug)      full section drawing, viewBox 480 × 320, with dimensions and notes
//                      (the nine product lines, `package`, and the services: svc-takeoffs, svc-design, svc-shipping, svc-remote, svc-delivery)
//   keyElevation()     Dwg 000: one building with every product line in it (KEY_VIEW, KEY_TAGS place its numbered tags)
//   glyph(slug)        48 × 48 pictogram in the same line language, for menus and lists
//   sketch(name)       72 × 48 elevation for the schedule of work
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
const CENTRAL = ' dominant-baseline="central"';
// A straight member of width w between two points (a web, a boom, a rafter).
const member = (x1, y1, x2, y2, w) => {
  const L = Math.hypot(x2 - x1, y2 - y1), px = (-(y2 - y1) / L) * (w / 2), py = ((x2 - x1) / L) * (w / 2);
  return poly([[x1 + px, y1 + py], [x2 + px, y2 + py], [x2 - px, y2 - py], [x1 - px, y1 - py]]);
};

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
const arrow = (x, y, dx, dy, cls = 'dw-a') => { // tip at (x, y), pointing along (dx, dy)
  const px = -dy, py = dx;
  return `<path class="${cls}" d="${poly([[x, y], [x - dx * AH + px * AW, y - dy * AH + py * AW], [x - dx * AH - px * AW, y - dy * AH - py * AW]])}"/>`;
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
// A keyed reference: the circled number that ties a thing on one drawing to a line on another.
const keyed = (x, y, k) => `<circle class="dw-key" cx="${n(x)}" cy="${n(y)}" r="8.5"/>` + text(x, y + 0.5, k, 'dw-dt', 'middle', CENTRAL);

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

// 010 A package made up for freight: a unit on dunnage and a crate on skids, in elevation.
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
    + note(140, 74, 'PACKAGED UNIT', [112, top + 8])
    + note(124, ground + 34, 'DUNNAGE', [bx[0] + 6, bot + 15])
    + cap((cx0 + cx1) / 2, ground + 38, 'CRATE');
};

// ---- the service drawings (S-01 to S-06; S-03 is the package drawing above) ----

// S-01  A floor plan on the left, the take-off made from it on the right; each keyed item is a line on the list.
D['svc-takeoffs'] = () => {
  const x0 = 36, y0 = 72, w = 172, h = 164, t = 7; // the plan
  const walls = path(rect(x0, y0, w, h)) + path(rect(x0 + t, y0 + t, w - 2 * t, h - 2 * t));
  const parts = path(rect(124, y0 + t, 5, 46)) + path(rect(124, 150, 5, 13)) + path(rect(124, 158, w - 88 - t, 5));
  const win = path(rect(150, y0, 36, t)) + path(line(150, y0 + t / 2, 186, y0 + t / 2), 'dw-t') + path(rect(x0, 112, t, 40)) + path(line(x0 + t / 2, 112, x0 + t / 2, 152), 'dw-t');
  const door = `<path class="dw-f" d="${rect(64, y0 + h - t - 1.5, 28, t + 3)}"/>` + path(line(64, y0 + h - t, 64, y0 + h) + line(92, y0 + h - t, 92, y0 + h), 'dw-o dw-nf')
    + path(line(64, y0 + h - t, 64, y0 + h - t - 28), 'dw-t dw-t--o') + path(`M64 ${y0 + h - t - 28}A28 28 0 0 1 92 ${y0 + h - t}`, 'dw-t')
    + path(line(126.5, 150, 151.5, 150), 'dw-t dw-t--o') + path('M151.500 150A25 25 0 0 0 126.500 125', 'dw-t');
  const lx = 272, lw = 172, top = 96, rh = (y0 + h - top) / 3; // the list
  let rows = '', fills = '', words = '', keys = '';
  ['FRAMING', 'WINDOWS', 'DOORS'].forEach((wd, i) => {
    const y = top + i * rh;
    if (i) rows += line(lx, y, lx + lw, y);
    fills += rect(lx + lw - 50, y + 7, 43, rh - 14);
    words += text(lx + 34, y + rh / 2, wd, 'dw-nt', 'start', CENTRAL);
    keys += keyed(lx + 17, y + rh / 2, i + 1);
  });
  const list = path(rect(lx, y0, lw, h)) + path(fills, 'dw-o dw-h') + path(line(lx, top, lx + lw, top), 'dw-o dw-nf') + path(rows + line(lx + lw - 57, y0, lx + lw - 57, y0 + h), 'dw-t dw-t--o');
  const to = path(line(220, 154, 252, 154), 'dw-o dw-nf') + arrow(260, 154, 1, 0, 'dw-a dw-a--ink');
  dimH(x0, x0 + w, y0, 48, 'FROM YOUR PLANS');
  ann(keyed(84, 122, 1) + keyed(168, 104, 2) + keyed(106, 204, 3) + keys + words + text(lx + 34, 88, 'ITEM', 'dw-nt', 'start') + text(lx + lw - 28.5, 88, 'QTY', 'dw-nt'));
  cap(x0 + w / 2, 266, 'PLANS'); cap(lx + lw / 2, 266, 'TAKE-OFF');
  return walls + parts + win + door + list + to;
};

// S-02  A roof truss in elevation: the kind of member that gets worked out before it is ordered.
D['svc-design'] = () => {
  const L = 48, R = 432, ap = [240, 92], by = 210, bh = 12, tc = 16; // bottom chord from L to R; apex; top chord depth
  const slope = (by - ap[1]) / (ap[0] - L), under = (x) => by - (x < 240 ? x - (L + tc / slope) : (R - tc / slope) - x) * slope; // underside of a top chord at x
  const walls = [62, 400].map((x) => path(rect(x, by + bh, 18, 44)) + path(line(x, by + bh + 6, x + 18, by + bh + 6) + line(x, by + bh + 12, x + 18, by + bh + 12), 'dw-t')).join('');
  const webs = [[176, 144], [304, 336]].map(([b, t]) => path(member(b, by + 2, t, under(t) - 2, 9)) + path(member(b, by + 2, 240, ap[1] + tc - 3, 9))).join('');
  const chords = path(poly([[L, by], ap, [240, ap[1] + tc], [L + tc / slope, by]])) + path(poly([[R, by], ap, [240, ap[1] + tc], [R - tc / slope, by]])) + path(rect(L, by, R - L, bh), 'dw-o dw-h');
  // Connector plates lie along the member they tie: square at the apex and on the bottom chord, raked on the top chords.
  const ux = 1 / Math.hypot(1, slope), uy = slope * ux, on = (x) => (by - (x < 240 ? x - L : R - x) * slope + under(x)) / 2; // centre line of a top chord at x
  const raked = (x, half, wd) => (x < 240 ? member(x - half * ux, on(x) + half * uy, x + half * ux, on(x) - half * uy, wd) : member(x - half * ux, on(x) - half * uy, x + half * ux, on(x) + half * uy, wd));
  const plates = path(raked(76, 15, 17) + raked(404, 15, 17) + raked(144, 11, 19) + raked(336, 11, 19) + rect(228, 92, 24, 23) + rect(164, 206, 24, 13) + rect(292, 206, 24, 13), 'dw-t dw-t--o');
  dimH(62, 418, by + bh + 44, 284, 'SPAN PER PLANS', { below: true });
  note(338, 62, 'TOP CHORD', [296, 134]); note(148, 62, 'PLATE', [232, 96], { anchor: 'end' });
  cap(240, 246, 'BOTTOM CHORD'); mid(240, 176, 'WEBS');
  return walls + webs + chords + plates;
};

// S-04  One load, four ways it travels: road, ocean freight, then the last leg by air, road or barge.
D['svc-shipping'] = () => {
  const y = 152, yard = 62, port = 172, dock = 308, site = 396;
  const lanes = `<path class="dw-ln dw-ln--road" d="${line(yard + 12, y, port - 8, y)}"/><path class="dw-ln dw-ln--sea" d="${line(port + 9, y, dock - 9, y)}"/>`
    + `<path class="dw-ln dw-ln--air" d="M${dock + 7} ${y - 5}C${dock + 30} ${y - 40} ${site - 30} ${y - 62} ${site - 7} ${y - 66}"/>`
    + `<path class="dw-ln dw-ln--road" d="${line(dock + 9, y, site - 7, y)}"/>`
    + `<path class="dw-ln dw-ln--barge" d="M${dock + 7} ${y + 5}C${dock + 30} ${y + 40} ${site - 30} ${y + 62} ${site - 7} ${y + 66}"/>`;
  const nodes = path(circle(yard, y, 11), 'dw-o dw-h') + `<circle class="dw-a dw-a--ink" cx="${yard}" cy="${y}" r="3.5"/>`
    + path(circle(port, y, 6.5) + circle(dock, y, 6.5) + circle(site, y - 66, 5) + circle(site, y, 5) + circle(site, y + 66, 5));
  cap(yard, y - 24, 'YARD'); cap(port, y - 24, 'PORT'); cap(dock - 4, y - 24, 'DOCK');
  ann(text((yard + port) / 2 + 2, y + 26, 'ROAD', 'dw-nt') + text((port + dock) / 2, y + 26, 'OCEAN FREIGHT', 'dw-dt')
    + text(site + 13, y - 66, 'AIR', 'dw-dt', 'start', CENTRAL) + text(site + 13, y, 'ROAD', 'dw-nt', 'start', CENTRAL) + text(site + 13, y + 66, 'BARGE', 'dw-dt', 'start', CENTRAL)
    + path(line(site - 22, y - 96, site + 62, y - 96) + line(site - 22, y - 96, site - 22, y - 90) + line(site + 62, y - 96, site + 62, y - 90), 'dw-d') + text(site + 20, y - 102, 'THE LAST LEG', 'dw-dt')
    + keyed(port, y + 54, 1) + keyed(dock - 4, y + 54, 2) + path(line(port, y + 44, port, y + 10) + line(dock - 4, y + 44, dock - 2, y + 10), 'dw-d')
    + text((port + dock) / 2 - 2, y + 58, 'HANDOFFS', 'dw-dt', 'middle', CENTRAL));
  return lanes + nodes;
};

// S-05  The package on the left, the building it becomes on the right.
D['svc-remote'] = () => {
  const g = 252, kx = 46, kw = 146, names = ['HARDWARE', 'OPENINGS', 'ENVELOPE', 'FRAMING'];
  const units = names.map((wd, i) => path(rect(kx, 96 + i * 35, kw, 31)) + path(line(kx + 14, 96 + i * 35, kx + 14, 127 + i * 35) + line(kx + kw - 14, 96 + i * 35, kx + kw - 14, 127 + i * 35), 'dw-t')).join('');
  const dun = path(rect(kx + 16, 232, 16, g - 232) + rect(kx + kw - 32, 232, 16, g - 232));
  const hx = 276, hw = 156, wt = 148, fl = 208;
  const house = [hx + 12, hx + 56, hx + 100, hx + 144].map((x) => path(rect(x - 3, fl + 8, 6, g - fl - 8))).join('') + path(line(hx + 15, g - 6, hx + 53, fl + 12) + line(hx + 103, g - 6, hx + 141, fl + 12), 'dw-t')
    + path(rect(hx - 6, fl, hw + 12, 8)) + path(rect(hx, wt, hw, fl - wt), 'dw-o dw-h') + path(poly([[hx - 14, wt], [hx + hw / 2, 100], [hx + hw + 14, wt]]))
    + path(rect(hx + 100, 168, 24, 40)) + path(rect(hx + 22, 164, 38, 24)) + path(line(hx + 41, 164, hx + 41, 188), 'dw-t');
  const to = path(line(206, 172, 238, 172), 'dw-o dw-nf') + arrow(246, 172, 1, 0, 'dw-a dw-a--ink');
  dimH(kx, kx + kw, 96, 74, 'ONE SHIPMENT');
  names.forEach((wd, i) => mid(kx + kw / 2, 112 + i * 35, wd));
  cap(kx + kw / 2, g + 28, 'THE PACKAGE'); cap(hx + hw / 2, g + 28, 'THE BUILDING');
  return units + dun + house + to + path(line(30, g, 456, g), 'dw-t');
};

// S-06  A boom truck with a piggyback forklift, setting a unit on the deck. How far it can reach is the yard's to say.
D['svc-delivery'] = () => {
  const g = 262, curb = 318, lx = 348, lw = 52, ly = 128;
  const truck = path(rect(40, 233, 238, 6)) + path(rect(84, 221, 194, 10))
    + path(poly([[40, 233], [40, 200], [52, 176], [82, 176], [82, 233]])) + path(poly([[47, 200], [56, 183], [74, 183], [74, 200]]), 'dw-t dw-t--o')
    + [64, 212, 246].map((x) => path(circle(x, g - 15, 15)) + path(circle(x, g - 15, 4.5), 'dw-t dw-t--o')).join('');
  const moffett = path(rect(278, 196, 5, 46)) + path(poly([[283, 210], [300, 210], [307, 224], [307, 240], [283, 240]])) + path(poly([[285, 210], [285, 194], [300, 194], [300, 210]], false), 'dw-t dw-t--o') + path(circle(296, 244, 9));
  const crane = path(line(106, 200, 128, 132), 'dw-t dw-t--o') + path(rect(92, 182, 16, 39)) + path(member(100, 184, 150, 86, 11)) + path(member(150, 86, 374, 66, 8)) + path(circle(100, 184, 4) + circle(150, 86, 4.5));
  const load = path(line(374, 66, 374, 112) + line(374, 112, lx + 8, ly) + line(374, 112, lx + lw - 8, ly), 'dw-t dw-t--o')
    + path(rect(lx, ly, lw, 26), 'dw-o dw-h') + path(line(lx, ly + 8.7, lx + lw, ly + 8.7) + line(lx, ly + 17.3, lx + lw, ly + 17.3), 'dw-t') + path(rect(lx + 9, ly - 2, 5, 30) + rect(lx + lw - 14, ly - 2, 5, 30), 'dw-o dw-o--hole');
  // The job site: a framed ground floor with its deck on, and the first wall of the next storey going up.
  const frame = [332, 362, 392, 422, 452].map((x) => path(rect(x - 3, 174, 6, g - 180))).join('') + path(rect(326, 166, 132, 8)) + path(rect(326, g - 6, 132, 6))
    + [434, 452].map((x) => path(rect(x - 3, 112, 6, 54))).join('') + path(rect(426, 106, 32, 6));
  dimH(curb, lx + lw, 122, 42, 'ASK YOUR YARD');
  note(214, 44, 'BOOM', [246, 77], { anchor: 'end' }); note(246, 168, 'MOFFETT', [290, 204], { anchor: 'end' });
  cap(160, g + 28, 'BOOM TRUCK'); cap(curb, g + 28, 'CURB'); cap(398, g + 28, 'JOB SITE');
  return truck + moffett + crane + frame + load + path(line(24, g, 462, g), 'dw-t') + path(line(curb, 96, curb, g + 12), 'dw-c');
};

const TITLES = {
  'framing-lumber': 'Section drawing: a 2×4, a 2×6 measuring one and a half by five and a half inches, and a 6×6 timber, each showing end grain.',
  'panels-sheathing': 'Edge details of three panels: five-ply plywood, oriented strand board and gypsum sheathing.',
  'engineered-wood': 'Sections of an I-joist, a glulam beam, laminated veneer lumber and parallel strand lumber, all about twelve inches deep.',
  'concrete-forming': 'Section through an overlaid plywood form panel with concrete poured against its face.',
  'cedar-decking': 'Profiles of bevel cedar siding, channel siding and a five-quarter by six deck board.',
  'siding-exterior': 'Wall section and elevation showing lap siding with a seven inch exposure over house wrap, sheathing and a 2×6 stud.',
  'insulation-drywall': 'Plan section of a 2×6 wall at sixteen inches on center with batt insulation, sheathing, rigid foam outside and drywall inside.',
  'windows-doors-cabinets': 'Elevations of a door, a single-hung window with its head at door height, and a base cabinet.',
  'hardware-supplies': 'A face-mount joist hanger carrying a joist on a header, with a nail and a structural screw below.',
  package: 'A unit of lumber packaged for freight and set on dunnage, beside a braced plywood crate on skids.',
  'svc-takeoffs': 'A floor plan with its walls, a window and a door keyed one, two and three, and beside it the take-off: framing, windows and doors, each with its quantity filled in.',
  'svc-design': 'Elevation of a roof truss: two top chords, webs, connector plates and a highlighted bottom chord spanning between two walls.',
  'svc-shipping': 'A route diagram: from a yard by road to a port, by ocean freight to a dock, then the last leg by air, road or barge. The port and the dock are marked as handoffs.',
  'svc-remote': 'Four stacked units marked framing, envelope, openings and hardware, bracketed as one shipment, with an arrow to a small house raised on piles.',
  'svc-delivery': 'A boom truck carrying a truck-mounted forklift lowers a unit of lumber onto the floor deck of a framed building at a job site.',
};

export const drawing = (slug, { id = 'dw' } = {}) => {
  const make = D[slug];
  if (!make) throw new Error(`No drawing for "${slug}"`);
  const uid = `${id}-${slug}`;
  ANN = '';
  const obj = make(uid);
  return raw(`<svg class="dw" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="${uid}-t"><title id="${uid}-t">${TITLES[slug]}</title><g class="dw-obj">${obj}</g><g class="dw-ann">${ANN}</g></svg>`);
};

// ---- the key elevation (Dwg 000) ----
// One small building, gable end on, drawn part-way through being built so that every product line shows:
// forms at the footing, bare framing with batts going in, sheathing, wrap and siding, a deck at the side.
// Each part carries kx-p<n> so the page can highlight the line asked for; the numbered tags are HTML over the drawing.
export const KEY_VIEW = { x: 0, y: 26, w: 480, h: 294 };
// Where each numbered tag sits and the point its leader runs to (drawing units), in product-line order.
export const KEY_TAGS = [
  { at: [34, 176], to: [118, 181] },   // 1 framing
  { at: [318, 46], to: [271, 117] },   // 2 sheathing
  { at: [150, 46], to: [182, 121] },   // 3 trusses and I-joists
  { at: [34, 270], to: [106, 276] },   // 4 forms
  { at: [452, 246], to: [433, 236] },  // 5 deck and rail
  { at: [452, 150], to: [331, 173] },  // 6 siding
  { at: [34, 224], to: [140, 214] },   // 7 insulation
  { at: [452, 198], to: [322, 215] },  // 8 door and window
  { at: [34, 124], to: [120, 141] },   // 9 hardware
];
// Short strokes at loose angles: the face of a strand panel. `ok` keeps them off whatever crosses the panel.
const flecks = (x, y, w, h, count, seed, ok = () => true) => {
  const R = rng(seed); let d = '';
  for (let i = 0; i < count; i++) {
    const px = x + R() * w, py = y + R() * h, a = (R() - 0.5) * 1.3, l = 2.5 + R() * 3;
    if (ok(px, py)) d += line(px - Math.cos(a) * l, py - Math.sin(a) * l, px + Math.cos(a) * l, py + Math.sin(a) * l);
  }
  return path(d, 'dw-t');
};
export const keyElevation = () => {
  const L = 118, R = 342, MID = 230, T = 146, F = 252, RIM = 268, G = 292, PEAK = 58, K = 7.6;
  const sl = (T - PEAK) / (MID - L);
  const yl = (x) => T - (x - L) * sl, yr = (x) => PEAK + (x - MID) * sl;
  const p = (no, d, cls = 'dw-o dw-o--hole') => path(d, `${cls} kx-p kx-p${no}`);

  // Ground, the footing below it (hidden), the foundation wall.
  const earth = [30, 62, 384, 446].map((x) => [0, 5, 10].map((i) => line(x + i, G + 2.5, x + i - 5, G + 8.5)).join('')).join('');
  const ground = path(line(20, G, 462, G), 'dw-t dw-t--o') + path(earth, 'dw-t')
    + path(poly([[L, G + 1], [L, G + 8], [L - 8, G + 8], [L - 8, G + 15], [R + 8, G + 15], [R + 8, G + 8], [R, G + 8], [R, G + 1]], false), 'dw-c');
  const found = path(rect(L, RIM, R - L, G - RIM), 'dw-f dw-f--tone') + stipple(L + 3, RIM + 3, R - L - 6, G - RIM - 6, 150, 5) + path(rect(L, RIM, R - L, G - RIM), 'dw-o dw-nf');

  // 4 Forming: a panel still up against the end of the wall, strongback, kicker and stake.
  const forms = p(4, rect(112, 262, 4, 32)) + path(rect(107, 262, 5, 32), 'dw-o dw-o--hole') + p(4, member(106, 270, 88, 290, 3.6)) + path(rect(83, 281, 4, 17), 'dw-o dw-o--hole');

  // 3 Engineered wood: I-joists on the sill, a truss in the gable.
  const ij = (c) => rect(c - 4, F + 1.5, 8, 3) + rect(c - 4, RIM - 4.5, 8, 3) + rect(c - 1, F + 4.5, 2, RIM - F - 9);
  const floor = path(line(L, F, 196, F) + line(L, RIM, 196, RIM), 'dw-t dw-t--o') + path(rect(L, F, 3.5, RIM - F), 'dw-o dw-o--hole') + p(3, [134, 150, 166, 182].map(ij).join(''));
  const truss = p(3, rect(L, T - 6, R - L, 6)) + p(3, member(174, yl(174) + 2, 190.5, T - 6, 4.4)) + p(3, member(196.5, T - 6, 225.5, yl(225.5) + 4, 4.4))
    + p(3, poly([[102, yl(102)], [MID, PEAK], [MID, PEAK - K], [102, yl(102) - K]]));
  const rightRoof = path(poly([[358, yr(358)], [MID, PEAK], [MID, PEAK - K], [358, yr(358) - K]]), 'dw-o dw-o--hole');
  const roofing = p(6, poly([[361, yr(361) - K], [MID, PEAK - K], [MID, PEAK - K - 3], [361, yr(361) - K - 3]]));

  // 1 Framing: plates and studs at sixteen inches.
  const studs = p(1, rect(L, F - 5, 96, 5)) + p(1, rect(L, T, 96, 5) + rect(L, T + 5, 96, 5)) + p(1, [118, 134, 150, 166, 182, 198].map((x) => rect(x, T + 10, 4, F - T - 15)).join(''));
  // 7 Insulation: batts in two bays, in the drafting symbol for them.
  const batt = (x) => { let d = `M${x + 6} ${T + 12}`; for (let y = T + 12, i = 0; y + 9.6 <= F - 6; y += 9.6, i++) d += `q${i % 2 ? -11 : 11} 4.8 0 9.6`; return d; };
  const batts = p(7, rect(138, T + 10, 12, F - T - 15) + rect(154, T + 10, 12, F - T - 15), 'dw-f') + path(batt(138) + batt(154), 'dw-t dw-t--o');
  // 9 Hardware: a tie at the truss heel, a holdown at the corner, a cap on the deck post.
  const hardware = p(9, rect(119.5, 136.5, 5.5, 14) + rect(123, 228, 4.5, 19) + rect(420, 270, 10, 8)) + path(line(125.2, 247, 125.2, 262), 'dw-t dw-t--o');

  // 2 Sheathing: panels up the wall and into the gable, joints staggered.
  const sheath = p(2, poly([[190, RIM], [190, 199], [206, 199], [206, T], [R, T], [R, RIM]])) + p(2, poly([[218, T], [218, 93], [226, 93], [226, yl(226)], [MID, PEAK], [R, T]]))
    + path(line(190, 199, 250, 199) + line(232, 199, 232, RIM) + line(218, 93, MID + (93 - PEAK) / sl, 93) + line(266, 93, 266, T) + line(218, T, R, T), 'dw-t dw-t--o')
    + flecks(194, 203, 52, 61, 26, 7) + flecks(222, 97, 112, 45, 46, 3, (x, y) => y > yr(x) + 9 && !(x > 262 && x < 270));
  // 6 Wrap, then lap siding going on from the corner.
  const wrap = path(rect(250, T, R - 250, RIM - T), 'dw-f') + path(line(250, T, 250, RIM), 'dw-c dw-c--wrap') + path(line(250, 187, R, 187) + line(250, 228, R, 228), 'dw-c');
  const ch = (RIM - T) / 15, sx = (k) => 264 + k * 2.4;
  const stair = [[sx(0), RIM]]; let laps = '';
  for (let k = 0; k < 15; k++) { const y = RIM - (k + 1) * ch; stair.push([sx(k), y]); if (k < 14) { stair.push([sx(k + 1), y]); laps += line(sx(k + 1), y, 336, y); } }
  stair.push([336, T], [336, RIM]);
  const siding = p(6, poly(stair)) + path(laps, 'dw-t dw-t--o') + p(6, rect(336, T, 6, RIM - T));

  // 8 Window and door.
  const windowDoor = path(rect(207, 161, 36, 56) + rect(205, 217, 40, 3.5), 'dw-o dw-o--hole') + p(8, rect(210.5, 164.5, 29, 49)) + path(line(210.5, 189, 239.5, 189), 'dw-t dw-t--o') + path(line(216, 181, 223, 172) + line(227, 208, 234, 199), 'dw-t')
    + path(rect(288, 196, 34, F - 196), 'dw-o dw-o--hole') + p(8, rect(291, 199, 28, F - 199)) + path(rect(295, 204, 20, 17) + rect(295, 226, 20, 21) + 'M313.5 224a1.3 1.3 0 1 0 2.6 0a1.3 1.3 0 1 0 -2.6 0', 'dw-t')
    + path(rect(283, F, 44, G - F), 'dw-o dw-o--hole') + path([10, 20, 30].map((d) => line(283, F + d, 327, F + d)).join(''), 'dw-t dw-t--o');

  // 5 Cedar and decking: boards on a joist, a post on a pier, and a rail.
  let boards = '', pickets = '';
  for (let x = 345; x < 432; x += 8.9) boards += rect(x, F, 7.9, 3.5);
  for (let x = 353; x < 428; x += 6.3) pickets += line(x, 217, x, 246);
  const deck = path(rect(342, F + 3.5, 3, 9) + rect(345, F + 3.5, 88, 9) + rect(419, F + 12.5, 12, 9) + rect(422, F + 21.5, 6, G - F - 25.5), 'dw-o dw-o--hole')
    + path(rect(417, G - 4, 16, 8), 'dw-f dw-f--tone') + path(rect(417, G - 4, 16, 8), 'dw-o dw-o--hole dw-nf')
    + p(5, boards) + path(pickets + line(347, 246, 430, 246), 'dw-t dw-t--o') + p(5, rect(344, 216, 3, F - 216) + rect(430, 216, 3, F - 216)) + p(5, rect(342.5, 213, 92, 3.5));

  const leaders = KEY_TAGS.map(({ at, to }) => path(line(at[0], at[1], to[0], to[1]), 'dw-d') + `<path class="dw-a" d="M${n(to[0] - 2)} ${n(to[1])}a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/>`).join('');
  const V = KEY_VIEW;
  return raw(`<svg class="dw" viewBox="${V.x} ${V.y} ${V.w} ${V.h}" aria-hidden="true" focusable="false"><g class="dw-obj">${ground}${found}${forms}${floor}${studs}${batts}${truss}${hardware}${sheath}${wrap}${siding}${windowDoor}${rightRoof}${roofing}${deck}</g><g class="dw-ann">${leaders}</g></svg>`);
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
  // A run of form panels set on a footing, walers across them and rebar standing out of the top.
  forms: '<path class="dw-h" d="M14 14h44v27H14z"/><path d="M14 14h44v27H14zM9 41h54v5H9zM11 21h50M11 34h50M4 46h64"/><path class="t" d="M25 14v27M36 14v27M47 14v27M19.500 14V7M30.500 14V7M41.500 14V7M52.500 14V7"/>',
  // Lap siding on a gable wall, and a deck with its railing.
  deck: '<path class="dw-h" d="M7 15h27v31H7z"/><path d="M3 15 20 5l17 10zM7 15h27v31H7zM34 29h33v5H34zM43 34v12M64 34v12M36 18h31M66 18v11M51 18v11M4 46h64"/><path class="t" d="M7 21h27M7 27h27M7 33h27M7 39h27M40 18v11M44 18v11M47.500 18v11M55 18v11M58.500 18v11M62 18v11M43 40h21"/>',
  // A shop on a gravel pad between spruce.
  north: '<path class="dw-h" d="M23 27h30v17H23z"/><path d="M20 27 38 16l18 11zM23 27h30v17H23zM31 33h11v11H31zM12 7 7 18h3L5 29h3L4 40h16l-4-11h3l-5-11h3zM12 40v6M63 17l-4 8h2.500l-4 8h2.500l-3 7h12l-3-7h2.500l-4-8h2.500zM63 40v6M4 46h64"/><path class="t" d="M31 37h11M31 40.500h11M47 31h3v4h-3z"/>',
  // A braced crate on the hook, a container behind it.
  crate: '<path class="dw-h" d="M6 24h24v18H6z"/><path d="M6 24h24v18H6zM9 42v4M27 42v4M18 4v8M18 12 8 24M18 12l10 12M36 18h32v24H36zM4 46h64"/><path class="t" d="M9 39 27 27M9 27h18v12H9zM42 18v24M47.500 18v24M53 18v24M58.500 18v24M64 18v24"/>',
};
export const sketch = (name, { size = 72 } = {}) =>
  raw(`<svg class="gl gl--wide" width="${size}" height="${Math.round(size * 2 / 3)}" viewBox="0 0 72 48" aria-hidden="true" focusable="false">${B[name] || ''}</svg>`);

// ---- The kit, for a drawing that belongs to one page ----
// The primitives above, plus an arrow, a dimension and a leader note that return their own markup instead of
// going through the annotation collector. pages/regions.mjs (the unloading details) and pages/about.mjs
// (the end grain, the dock) use it. Same conventions, same line classes.
const kitArrow = (x, y, dx) => `<path class="dw-a" d="${poly([[x, y], [x - dx * AH, y + AW], [x - dx * AH, y - AW]])}"/>`;
// Horizontal dimension. y0 is the object edge the extension lines leave from; pass [left, right] when the two edges differ.
const kitDimH = (x1, x2, y0, y, s) => {
  const [a, b] = Array.isArray(y0) ? y0 : [y0, y0];
  return path(line(x1, a - 3, x1, y - 4) + line(x2, b - 3, x2, y - 4) + line(x1, y, x2, y), 'dw-d') + kitArrow(x1, y, -1) + kitArrow(x2, y, 1) + text((x1 + x2) / 2, y - 5, s, 'dw-dt');
};
const kitNote = (x, y, s, [tx, ty], anchor = 'start') => {
  const k = anchor === 'start' ? -1 : 1;
  return path(poly([[x + k * 5, y], [x + k * 15, y], [tx, ty]], false), 'dw-l') + `<circle class="dw-a dw-a--ink" cx="${n(tx)}" cy="${n(ty)}" r="2"/>` + text(x, y, s, 'dw-nt', anchor, CENTRAL);
};
export const kit = { n, rng, P: path, rect, poly, seg: line, circ: circle, member, label: text, dimH: kitDimH, note: kitNote };
