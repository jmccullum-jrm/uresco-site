// Projects Natural Earth land + US states into an SVG fragment for the Uresco delivery map.
// usage: node map.mjs <tools-dir> <out.json>
import { createRequire } from 'module';
import { writeFileSync, readFileSync } from 'fs';
const [toolsDir, outPath] = process.argv.slice(2);
const require = createRequire(toolsDir + '/package.json');
const d3 = require('d3-geo');
const topo = require('topojson-client');
const world = JSON.parse(readFileSync(toolsDir + '/node_modules/world-atlas/countries-50m.json', 'utf8'));
const us = JSON.parse(readFileSync(toolsDir + '/node_modules/us-atlas/states-10m.json', 'utf8'));

const W = 1200, H = 860;
const countries = topo.feature(world, world.objects.countries);
const states = topo.feature(us, us.objects.states);
const land = topo.feature(world, world.objects.land);
const ak = states.features.find((f) => f.properties.name === 'Alaska');
const wa = states.features.find((f) => f.properties.name === 'Washington');
const canada = countries.features.find((f) => f.properties.name === 'Canada');
const russia = countries.features.find((f) => f.properties.name === 'Russia');

const projection = d3.geoConicConformal()
  .parallels([52, 68])
  .rotate([145, 0])
  .fitExtent([[30, 30], [W - 30, H - 30]], {
    type: 'MultiPoint',
    coordinates: [[-169, 52.5], [-120.5, 45.8], [-141, 72.6], [-170, 66.5], [-121, 61]],
  });
projection.clipExtent([[0, 0], [W, H]]);
const path = d3.geoPath(projection).digits(0);
const clip = (g) => path(g) || '';

const yards = [
  { id: 'kent', name: 'Kent', st: 'WA', lon: -122.2335, lat: 47.4277, side: 'w' },
  { id: 'anchorage', name: 'Anchorage', st: 'AK', lon: -149.859, lat: 61.1105, side: 'w' },
  { id: 'fairbanks', name: 'Fairbanks', st: 'AK', lon: -147.784, lat: 64.8326 },
];
const towns = [
  ['Utqiaġvik', -156.79, 71.29, 'n'], ['Deadhorse', -148.46, 70.2, 'e'], ['Kotzebue', -162.6, 66.9, 'w'],
  ['Nome', -165.41, 64.5, 'w'], ['Galena', -156.93, 64.74, 'n'], ['Bethel', -161.76, 60.79, 'w'],
  ['Dillingham', -158.46, 59.04, 'w'], ['Unalaska', -166.54, 53.87, 'n'], ['Kodiak', -152.41, 57.79, 'w'],
  ['Homer', -151.55, 59.64, 'w'], ['Valdez', -146.35, 61.13, 'e'], ['Cordova', -145.76, 60.54, 's'],
  ['Juneau', -134.42, 58.3, 'e'], ['Sitka', -135.33, 57.05, 'w'], ['Ketchikan', -131.64, 55.34, 'e'],
];
// Illustrative lanes, not carrier schedules.
const sea = [[-122.42, 47.27], [-122.75, 48.1], [-123.6, 48.25], [-124.9, 48.45], [-128.5, 50.6], [-134, 53.6], [-141, 56.6], [-148, 58.4], [-151.6, 59.3], [-151.4, 60.4], [-149.89, 61.24]];
const road = [[-149.86, 61.11], [-149.11, 61.6], [-150.1, 62.3], [-149.1, 63.4], [-148.9, 64.1], [-147.78, 64.83], [-148.4, 66.1], [-150.1, 67.2], [-149.6, 68.4], [-148.8, 69.4], [-148.46, 70.2]];
const barge = [[-151.6, 59.3], [-153.2, 57.4], [-158.5, 55.0], [-163.5, 54.3], [-166.54, 53.87], [-167.5, 55.6], [-163.5, 58.2], [-162.3, 59.9], [-161.76, 60.79]];
const barge2 = [[-167.5, 55.6], [-168.4, 60.5], [-166.6, 63.7], [-165.41, 64.5], [-167.4, 65.5], [-163.6, 66.6], [-162.6, 66.9]];
const line = (pts) => 'M' + pts.map((p) => projection(p).map((n) => n.toFixed(1)).join(',')).join('L');
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
// Where each graticule line leaves the sheet, so the plate can label it in the margin like a chart.
const edgeHit = (pts, test) => {
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    if (!a || !b) continue;
    const t = test(a, b);
    if (t != null && t >= 0 && t <= 1) return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  }
  return null;
};
const free = d3.geoConicConformal().parallels([52, 68]).rotate([145, 0]).scale(projection.scale()).translate(projection.translate());
const cross = (k, v) => (a, b) => ((a[k] - v) * (b[k] - v) <= 0 && a[k] !== b[k] ? (v - a[k]) / (b[k] - a[k]) : null);
const gratLabels = [];
for (const lat of [50, 55, 60, 65, 70]) {
  const pts = []; for (let lon = -200; lon <= -100; lon += 0.1) pts.push(free([lon, lat]));
  const hit = edgeHit(pts, cross(0, 0));
  if (hit && hit[1] > 20 && hit[1] < H - 20) gratLabels.push({ text: `${lat}° N`, edge: 'w', xy: hit.map((n) => +n.toFixed(1)) });
}
for (const lon of [-170, -160, -150, -140, -130]) {
  const pts = []; for (let lat = 80; lat >= 40; lat -= 0.05) pts.push(free([lon, lat]));
  const hit = edgeHit(pts, cross(1, H));
  if (hit && hit[0] > 30 && hit[0] < W - 30) gratLabels.push({ text: `${-lon}° W`, edge: 's', xy: hit.map((n) => +n.toFixed(1)) });
}
// Scale bar: 250 statute miles along the 60th parallel near the middle of the sheet.
const MI_PER_DEG = 69.172;
const dLon = 250 / (MI_PER_DEG * Math.cos((60 * Math.PI) / 180));
const s0 = free([-150, 60]), s1 = free([-150 + dLon, 60]);
const scale250 = +Math.hypot(s1[0] - s0[0], s1[1] - s0[1]).toFixed(1);
// Air: straight hops from the two Alaska yards to communities off the road system. Illustrative.
const AIR = [[[-149.86, 61.11], [-161.76, 60.79]], [[-149.86, 61.11], [-158.46, 59.04]], [[-147.78, 64.83], [-156.93, 64.74]], [[-147.78, 64.83], [-162.6, 66.9]], [[-147.78, 64.83], [-156.79, 71.29]]];
// Letter tags for the lanes, set beside each line.
const TAGS = [['A', -137.2, 54.2], ['B', -152.6, 67.9], ['C', -169.6, 58.2], ['D', -155.3, 62.9]];
const out = {
  width: W, height: H,
  gratLabels, scale250,
  air: AIR.map((seg) => line(seg)).join(''),
  tags: TAGS.map(([id, lon, lat]) => ({ id, xy: projection([lon, lat]).map((n) => +n.toFixed(1)) })),
  land: clip(land),
  graticule: clip(d3.geoGraticule().step([10, 5])()),
  alaska: clip(ak), washington: clip(wa),
  borders: clip(topo.mesh(world, world.objects.countries, (a, b) => a !== b)) + clip(topo.mesh(us, us.objects.states, (a, b) => a !== b)),
  sea: curve(sea), road: curve(road), barge: curve(barge), barge2: curve(barge2),
  yards: yards.map((y) => ({ ...y, xy: projection([y.lon, y.lat]).map((n) => +n.toFixed(1)) })),
  towns: towns.map(([name, lon, lat, side]) => ({ name, side, xy: projection([lon, lat]).map((n) => +n.toFixed(1)) })),
};
writeFileSync(outPath, JSON.stringify(out));
console.log('bytes', JSON.stringify(out).length, 'yards', out.yards.map((y) => y.xy));
