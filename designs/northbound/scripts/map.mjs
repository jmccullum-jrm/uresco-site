// Projects Natural Earth land and US states into the data behind the route plate
// (src/data/map.json). The plate itself is drawn by plateSvg() and routePlate() in
// src/lib/components.mjs.
//
// usage: node scripts/map.mjs <tools-dir> src/data/map.json
//   <tools-dir> is a folder with d3-geo, topojson-client, world-atlas and us-atlas installed.
import { createRequire } from 'module';
import { writeFileSync, readFileSync } from 'fs';
const [toolsDir, outPath] = process.argv.slice(2);
const require = createRequire(toolsDir + '/package.json');
const d3 = require('d3-geo');
const topo = require('topojson-client');
const world = JSON.parse(readFileSync(toolsDir + '/node_modules/world-atlas/countries-50m.json', 'utf8'));
const us = JSON.parse(readFileSync(toolsDir + '/node_modules/us-atlas/states-10m.json', 'utf8'));

// The sheet. FRAME is the neatline: the map is clipped to it, and the margin outside carries
// the degree labels.
const W = 1200, H = 880, M = 44;
const FRAME = [[M, M], [W - M, H - M]];
const states = topo.feature(us, us.objects.states);
const land = topo.feature(world, world.objects.land);
const ak = states.features.find((f) => f.properties.name === 'Alaska');
const wa = states.features.find((f) => f.properties.name === 'Washington');

const projection = d3.geoConicConformal()
  .parallels([52, 68])
  .rotate([146, 0])
  .fitExtent([[M + 34, M + 30], [W - M - 40, H - M - 34]], {
    type: 'MultiPoint',
    coordinates: [[-168.6, 53.0], [-121.2, 46.4], [-141, 72.3], [-169.5, 66.5], [-121, 61]],
  });
projection.clipExtent(FRAME);
const path = d3.geoPath(projection).digits(0);
const clip = (g) => path(g) || '';
const P = (lon, lat) => projection([lon, lat]).map((n) => +n.toFixed(1));

const yards = [
  { id: 'kent', name: 'Kent', st: 'WA', lon: -122.2335, lat: 47.4277, side: 'w' },
  { id: 'anchorage', name: 'Anchorage', st: 'AK', lon: -149.859, lat: 61.1105, side: 'w' },
  { id: 'fairbanks', name: 'Fairbanks', st: 'AK', lon: -147.784, lat: 64.8326, side: 'e' },
];
// Example destinations. region groups them for the "find your region" list on the Alaska page;
// mode is how freight generally reaches them (road system, sea, or barge and air).
const towns = [
  ['Utqiaġvik', -156.79, 71.29, 'n', 'arctic', 'barge', 1],
  ['Deadhorse', -148.46, 70.2, 'w', 'arctic', 'road', 2],
  ['Kotzebue', -162.6, 66.9, 'e', 'western', 'barge', 1],
  ['Nome', -165.41, 64.5, 'n', 'western', 'barge', 1],
  ['Galena', -156.93, 64.74, 'n', 'interior', 'barge', 3],
  ['Tok', -142.99, 63.34, 'e', 'interior', 'road', 3],
  ['Bethel', -161.76, 60.79, 'w', 'western', 'barge', 1],
  ['Dillingham', -158.46, 59.04, 'n', 'western', 'barge', 2],
  ['Unalaska', -166.54, 53.87, 'n', 'southwest', 'sea', 1],
  ['Kodiak', -152.41, 57.79, 'w', 'southwest', 'sea', 2],
  ['Valdez', -146.35, 61.13, 'e', 'southcentral', 'road', 2],
  ['Cordova', -145.76, 60.54, 'e', 'southcentral', 'sea', 3],
  ['Juneau', -134.42, 58.3, 'e', 'southeast', 'sea', 2],
  ['Sitka', -135.33, 57.05, 'w', 'southeast', 'sea', 1],
  ['Ketchikan', -131.64, 55.34, 'e', 'southeast', 'sea', 2],
];

// Illustrative lanes, not carrier routes or schedules.
const LANES = {
  // Puget Sound to Cook Inlet, across the Gulf of Alaska.
  sea: [[-122.42, 47.3], [-122.7, 48.15], [-123.6, 48.3], [-125.2, 48.5], [-129.2, 50.4], [-134.5, 53.3], [-141, 56.4], [-147.5, 58.3], [-151.2, 58.75], [-152.5, 59.3], [-152.5, 60.1], [-151.7, 60.7], [-150.6, 61.05], [-150.0, 61.2]],
  // The Inside Passage to Southeast Alaska.
  passage: [[-129.2, 50.4], [-130.9, 53.3], [-131.6, 54.6], [-131.9, 55.3], [-133.5, 56.1], [-134.9, 56.7], [-135.45, 57.0]],
  passage2: [[-133.5, 56.1], [-133.6, 57.3], [-134.5, 58.2]],
  // The road system: Parks and Dalton highways north, Glenn and Richardson east, Seward and Sterling south.
  road: [[-149.86, 61.11], [-149.11, 61.6], [-150.1, 62.3], [-149.1, 63.4], [-148.9, 64.1], [-147.78, 64.83], [-148.4, 66.1], [-150.1, 67.2], [-149.6, 68.4], [-148.8, 69.4], [-148.46, 70.2]],
  road2: [[-149.11, 61.6], [-147.2, 61.8], [-145.55, 62.11], [-145.3, 61.6], [-146.35, 61.13]],
  road3: [[-145.55, 62.11], [-144.4, 62.7], [-142.99, 63.34], [-144.6, 63.8], [-145.73, 64.04], [-147.78, 64.83]],
  road4: [[-149.86, 61.11], [-149.2, 60.85], [-149.9, 60.5], [-151.06, 60.49], [-151.55, 59.64]],
  // Seasonal barge lanes west and north.
  barge: [[-151.2, 58.75], [-151.6, 57.6], [-153.6, 56.2], [-158.2, 54.6], [-163.2, 53.9], [-166.0, 53.6], [-167.6, 54.3], [-166.8, 56.4], [-164.4, 58.1], [-162.8, 59.5], [-162.0, 60.4], [-161.76, 60.79]],
  barge2: [[-164.4, 58.1], [-161.0, 58.2], [-158.9, 58.6], [-158.46, 59.0]],
  barge3: [[-166.8, 56.4], [-169.4, 60.0], [-168.4, 62.8], [-166.6, 64.1], [-165.41, 64.45]],
  barge4: [[-168.4, 62.8], [-169.6, 65.0], [-169.0, 66.1], [-166.4, 66.9], [-164.3, 66.72], [-162.75, 66.88]],
  barge5: [[-166.4, 66.9], [-167.9, 68.2], [-167.2, 69.1], [-164.4, 70.1], [-161.4, 70.85], [-158.4, 71.3], [-156.9, 71.33]],
};
// Air: straight hops from the Alaska yards' cities to places with no road. Illustrative.
const AIR = [[[-149.86, 61.11], [-161.76, 60.79]], [[-147.78, 64.83], [-156.93, 64.74]], [[-147.78, 64.83], [-156.79, 71.29]], [[-149.86, 61.11], [-165.41, 64.5]]];

const curve = (pts) => {
  const Q = pts.map(([lon, lat]) => projection([lon, lat]));
  let d = `M${Q[0][0].toFixed(1)},${Q[0][1].toFixed(1)}`;
  for (let i = 1; i < Q.length - 1; i++) {
    const mx = (Q[i][0] + Q[i + 1][0]) / 2, my = (Q[i][1] + Q[i + 1][1]) / 2;
    d += `Q${Q[i][0].toFixed(1)},${Q[i][1].toFixed(1)} ${mx.toFixed(1)},${my.toFixed(1)}`;
  }
  const L = Q[Q.length - 1];
  return d + `L${L[0].toFixed(1)},${L[1].toFixed(1)}`;
};
// A shallow arc between two places, bowed to the north-west.
const arc = ([a, b]) => {
  const A = projection(a), B = projection(b);
  const mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2;
  const dx = B[0] - A[0], dy = B[1] - A[1], k = 0.16;
  return `M${A[0].toFixed(1)},${A[1].toFixed(1)}Q${(mx + dy * k).toFixed(1)},${(my - dx * k).toFixed(1)} ${B[0].toFixed(1)},${B[1].toFixed(1)}`;
};

// Where a parallel meets the left and right neatline, and a meridian the top and bottom: the
// positions of the degree labels in the margin.
const solve = (f, lo, hi, target) => { for (let i = 0; i < 60; i++) { const mid = (lo + hi) / 2; ((f(mid) < target) === (f(lo) < target)) ? (lo = mid) : (hi = mid); } return (lo + hi) / 2; };
const raw = d3.geoConicConformal().parallels([52, 68]).rotate([146, 0]).scale(projection.scale()).translate(projection.translate());
const edges = { lat: [], lon: [] };
for (const lat of [50, 55, 60, 65, 70]) {
  const lonL = solve((lon) => raw([lon, lat])[0], -200, -146, M), lonR = solve((lon) => raw([lon, lat])[0], -146, -100, W - M);
  const yl = raw([lonL, lat])[1], yr = raw([lonR, lat])[1];
  edges.lat.push({ deg: lat, left: yl > M && yl < H - M ? +yl.toFixed(1) : null, right: yr > M && yr < H - M ? +yr.toFixed(1) : null });
}
for (const lon of [-170, -160, -150, -140, -130]) {
  const latT = solve((lat) => raw([lon, lat])[1], 89, 40, M), latB = solve((lat) => raw([lon, lat])[1], 89, 30, H - M);
  const xt = raw([lon, latT])[0], xb = raw([lon, latB])[0];
  edges.lon.push({ deg: -lon, top: xt > M && xt < W - M ? +xt.toFixed(1) : null, bottom: xb > M && xb < W - M ? +xb.toFixed(1) : null });
}
const parallel = (lat) => clip({ type: 'LineString', coordinates: Array.from({ length: 181 }, (_, i) => [-215 + i * 0.75, lat]) });
// North at a point on the sheet, in degrees clockwise from straight up (meridians converge).
const northAt = (lon, lat) => { const a = raw([lon, lat]), b = raw([lon, lat + 0.5]); return +(Math.atan2(b[0] - a[0], a[1] - b[1]) * 180 / Math.PI).toFixed(1); };
// 100 statute miles on the ground at 60°N, in sheet units.
const mile100 = Math.abs(raw([-146, 60 + 100 / 69.05])[1] - raw([-146, 60])[1]);

const out = {
  width: W, height: H, margin: M,
  land: clip(land),
  graticule: clip(d3.geoGraticule().step([10, 5])()),
  arcticCircle: parallel(66.56),
  alaska: clip(ak), washington: clip(wa),
  borders: clip(topo.mesh(world, world.objects.countries, (a, b) => a !== b)),
  lanes: Object.fromEntries(Object.entries(LANES).map(([k, v]) => [k, curve(v)])),
  air: AIR.map(arc),
  yards: yards.map((y) => ({ ...y, xy: P(y.lon, y.lat) })),
  towns: towns.map(([name, lon, lat, side, region, mode, rank]) => ({ name, side, region, mode, rank, lat, xy: P(lon, lat) })),
  seas: [
    { name: 'Gulf of Alaska', xy: P(-144.6, 58.1) }, { name: 'Bering Sea', xy: P(-171.5, 58.6) },
    { name: 'Arctic Ocean', xy: P(-152, 72.55) }, { name: 'Pacific Ocean', xy: P(-140.5, 50.2) },
    { name: 'Chukchi Sea', xy: P(-168.3, 69.6) },
  ],
  lands: [{ name: 'Canada', xy: P(-131.5, 62.6) }, { name: 'Alaska', xy: P(-155.2, 68.2) }],
  arcticLabel: P(-134.5, 66.56),
  edges,
  compass: { xy: P(-161.5, 50.6), north: northAt(-161.5, 50.6) },
  mile100: +mile100.toFixed(1),
};
writeFileSync(outPath, JSON.stringify(out));
console.log('bytes', JSON.stringify(out).length, 'yards', out.yards.map((y) => y.xy), 'mile100', out.mile100, 'compass', out.compass, JSON.stringify(out.edges));
