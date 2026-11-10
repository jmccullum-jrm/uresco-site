// Projects Natural Earth land and US states into the data behind the Uresco map
// (src/data/map.json): simplified land outlines, the three yards, every place the finder knows,
// illustrative freight lanes and a labelled graticule.
//
//   node scripts/map.mjs <tools-dir> src/data/map.json
//
// <tools-dir> is a folder with d3-geo, topojson-client, world-atlas and us-atlas installed.
// The canvas is 1800 × 1000. Alaska and the lane to Puget Sound sit in the right-hand 55 %
// (the FOCUS box below); the left is open Bering Sea, which the home page puts its finder over.
import { createRequire } from 'module';
import { writeFileSync, readFileSync } from 'fs';
import { PLACES } from '../src/data/places.mjs';

const [toolsDir, outPath] = process.argv.slice(2);
const require = createRequire(toolsDir + '/package.json');
const d3 = require('d3-geo');
const topo = require('topojson-client');
const world = JSON.parse(readFileSync(toolsDir + '/node_modules/world-atlas/countries-50m.json', 'utf8'));
const us = JSON.parse(readFileSync(toolsDir + '/node_modules/us-atlas/states-10m.json', 'utf8'));

const W = 1800, H = 1000;
const FOCUS = [[790, 96], [1736, 884]];
const land = topo.feature(world, world.objects.land);
const states = topo.feature(us, us.objects.states);
const ak = states.features.find((f) => f.properties.name === 'Alaska');
const wa = states.features.find((f) => f.properties.name === 'Washington');

const projection = d3.geoConicConformal()
  .parallels([52, 68])
  .rotate([147, 0])
  .fitExtent(FOCUS, {
    type: 'MultiPoint',
    coordinates: [[-166.6, 53.6], [-122.0, 46.9], [-156.8, 71.4], [-166.9, 68.4], [-143.6, 70.2], [-166.2, 61.5], [-123.0, 47.0]],
  });
// Clip a little outside the canvas so coastline strokes never run along the frame.
projection.clipExtent([[-30, -30], [W + 30, H + 30]]);

// ---- Outlines: collect projected rings, simplify, drop specks, write compact relative paths ----
const rings = (geo) => {
  const out = []; let cur = null;
  const ctx = {
    moveTo: (x, y) => { cur = [[x, y]]; out.push(cur); },
    lineTo: (x, y) => cur.push([x, y]),
    closePath: () => { cur.closed = true; },
    arc: () => {},
  };
  d3.geoPath(projection, ctx)(geo);
  return out;
};
const area = (r) => Math.abs(r.reduce((a, p, i) => { const q = r[(i + 1) % r.length]; return a + p[0] * q[1] - q[0] * p[1]; }, 0) / 2);
// Douglas–Peucker
const simplify = (pts, tol) => {
  if (pts.length < 4) return pts;
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    const [ax, ay] = pts[a], [bx, by] = pts[b];
    const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy);
    let max = 0, at = -1;
    for (let i = a + 1; i < b; i++) {
      // A closed ring starts and ends on the same point: measure from that point, not from a line.
      const d = len < 1e-6 ? Math.hypot(pts[i][0] - ax, pts[i][1] - ay) : Math.abs(dy * (pts[i][0] - ax) - dx * (pts[i][1] - ay)) / len;
      if (d > max) { max = d; at = i; }
    }
    if (max > tol) { keep[at] = 1; stack.push([a, at], [at, b]); }
  }
  return pts.filter((_, i) => keep[i]);
};
const outline = (geo, { tol = 0.7, minArea = 5 } = {}) => rings(geo)
  .filter((r) => r.length > 3 && area(r) >= minArea)
  .map((r) => {
    // Whole pixels for coarse outlines; half pixels where the tolerance is finer than that.
    const q = tol < 0.5 ? 2 : 1;
    const s = simplify(r, tol).map(([x, y]) => [Math.round(x * q), Math.round(y * q)]).filter((p, i, a) => !i || p[0] !== a[i - 1][0] || p[1] !== a[i - 1][1]);
    if (s.length < 3) return '';
    const n = (v) => String(v / q);
    let d = `M${n(s[0][0])},${n(s[0][1])}l`;
    for (let i = 1; i < s.length; i++) d += `${i > 1 ? ' ' : ''}${n(s[i][0] - s[i - 1][0])},${n(s[i][1] - s[i - 1][1])}`;
    return d + 'z';
  }).join('');

// ---- Lanes (illustrative, not carrier routes or schedules) ----
const xy = (p) => projection(p).map((n) => +n.toFixed(1));
const curve = (pts) => {
  const P = pts.map((p) => projection(p));
  let d = `M${P[0][0].toFixed(1)},${P[0][1].toFixed(1)}`;
  for (let i = 1; i < P.length - 1; i++) {
    const mx = (P[i][0] + P[i + 1][0]) / 2, my = (P[i][1] + P[i + 1][1]) / 2;
    d += `Q${P[i][0].toFixed(1)},${P[i][1].toFixed(1)} ${mx.toFixed(1)},${my.toFixed(1)}`;
  }
  const L = P[P.length - 1];
  return d + `L${L[0].toFixed(1)},${L[1].toFixed(1)}`;
};
// Ocean freight: Puget Sound to Southcentral Alaska across the Gulf.
const sea = [[-122.42, 47.3], [-122.75, 48.1], [-123.6, 48.25], [-124.9, 48.45], [-128.5, 50.6], [-134, 53.6], [-141, 56.6], [-148, 58.4], [-151.6, 59.3], [-151.4, 60.4], [-149.89, 61.24]];
// The Inside Passage spur to Southeast Alaska.
const inside = [[-128.5, 50.6], [-130.2, 53.4], [-131.4, 55.0], [-132.9, 56.4], [-134.42, 58.3]];
// Road system, simplified: Parks and Dalton highways north; Seward and Sterling south;
// Glenn and Richardson east to Valdez, Tok and back to Fairbanks.
const roads = [
  [[-149.86, 61.2], [-149.3, 61.6], [-150.1, 62.3], [-149.1, 63.4], [-148.9, 64.1], [-147.78, 64.83], [-148.6, 65.6], [-149.9, 66.6], [-150.1, 67.4], [-149.7, 68.4], [-148.8, 69.4], [-148.46, 70.2]],
  [[-149.86, 61.2], [-149.2, 60.9], [-149.6, 60.5], [-150.8, 60.5], [-151.4, 60.1], [-151.55, 59.64]],
  [[-149.6, 60.5], [-149.44, 60.1]],
  [[-149.3, 61.6], [-147.5, 61.8], [-145.55, 62.11], [-145.4, 61.6], [-146.35, 61.13]],
  [[-145.55, 62.11], [-145.5, 63.0], [-145.73, 64.04], [-147.0, 64.6], [-147.78, 64.83]],
  [[-145.55, 62.11], [-143.6, 62.9], [-142.99, 63.34], [-144.6, 63.8], [-145.73, 64.04]],
];
// Seasonal barge lanes to western and Arctic Alaska.
const barges = [
  [[-151.6, 59.3], [-153.2, 57.4], [-158.5, 55.0], [-163.5, 54.3], [-166.54, 53.87], [-167.5, 55.6], [-163.5, 58.2], [-162.3, 59.9], [-161.76, 60.79]],
  [[-167.5, 55.6], [-168.4, 60.5], [-166.6, 63.7], [-165.41, 64.5], [-167.4, 65.5], [-166.6, 66.4], [-162.6, 66.9]],
  [[-167.4, 65.5], [-168.6, 66.6], [-167.6, 68.6], [-163.5, 70.4], [-156.79, 71.29]],
];

const yards = [
  { id: 'kent', name: 'Kent', st: 'WA', lon: -122.2335, lat: 47.4277, side: 'w' },
  { id: 'anchorage', name: 'Anchorage', st: 'AK', lon: -149.859, lat: 61.1105, side: 'e' },
  { id: 'fairbanks', name: 'Fairbanks', st: 'AK', lon: -147.784, lat: 64.8326, side: 'e' },
];

// Graticule labels: parallels named along one meridian, meridians along one parallel.
const LABEL_LON = -127.2, LABEL_LAT = 51.6;
const gratLabels = [
  ...[55, 60, 65, 70].map((lat) => ({ t: `${lat}° N`, xy: xy([LABEL_LON, lat]) })),
  ...[-170, -160, -150, -140].map((lon) => ({ t: `${-lon}° W`, xy: xy([lon, LABEL_LAT]) })),
];

const out = {
  width: W, height: H, focus: FOCUS,
  // Tolerances are in canvas pixels. The camera zooms to about 3×, so they are finer than one pixel.
  land: outline(land, { tol: 0.6, minArea: 5 }),
  alaska: outline(ak, { tol: 0.45, minArea: 2 }),
  washington: outline(wa, { tol: 0.15, minArea: 0.5 }),
  graticule: d3.geoPath(projection).digits(0)(d3.geoGraticule().step([10, 5]).extent([[-200, 40], [-100, 80.001]])()) || '',
  gratLabels,
  sea: curve(sea), inside: curve(inside),
  roads: roads.map(curve), barges: barges.map(curve),
  yards: yards.map((y) => ({ ...y, xy: xy([y.lon, y.lat]) })),
  places: PLACES.map((p) => ({ name: p.name, xy: xy([p.lon, p.lat]) })),
};
writeFileSync(outPath, JSON.stringify(out));
const size = (k) => (out[k].length / 1024).toFixed(1) + ' KB';
console.log(`map.json ${(JSON.stringify(out).length / 1024).toFixed(0)} KB — land ${size('land')}, alaska ${size('alaska')}, washington ${size('washington')}`);
console.log('yards', out.yards.map((y) => `${y.name} ${y.xy}`).join(' · '));
const xs = out.places.map((p) => p.xy[0]), ys = out.places.map((p) => p.xy[1]);
console.log(`places x ${Math.min(...xs)}–${Math.max(...xs)}, y ${Math.min(...ys)}–${Math.max(...ys)}`);
