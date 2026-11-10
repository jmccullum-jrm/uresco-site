// The example destinations on the delivery map, and how freight generally reaches each one.
//
// This is ordinary Alaska geography, not a statement of Uresco's routes, carriers, schedules
// or prices: which towns are on the road system, which are reached by sea, and which rely on
// barge in the ice-free season and air year-round. `yard` follows the site's own "which yard
// should I call" guidance (remote sites: Anchorage; the Interior and points north: Fairbanks).
// Ids match the town names in src/data/map.json, lower-cased with accents removed.

export const WAYS = {
  road: {
    label: 'On the road system',
    icon: 'truck',
    lanes: 'road',
    text: 'On the road system. Job sites here are reached by truck from our Anchorage and Fairbanks yards.',
  },
  sea: {
    label: 'By sea',
    icon: 'ship',
    lanes: 'sea',
    text: 'Southeast Alaska is reached by sea. We coordinate the booking and get your package to the dock.',
  },
  coast: {
    label: 'By sea or air',
    icon: 'ship',
    lanes: 'barge',
    text: 'Off the road system. Freight arrives by sea or by air; we work out which suits the load and coordinate it.',
  },
  barge: {
    label: 'Barge or air',
    icon: 'plane',
    lanes: 'barge',
    text: 'Off the road system. Communities here receive freight by barge in the ice-free season and by air year-round, so the plan starts with the season.',
  },
};

export const DESTINATIONS = {
  ketchikan: { way: 'sea', yard: 'anchorage' },
  sitka: { way: 'sea', yard: 'anchorage' },
  juneau: { way: 'sea', yard: 'anchorage' },
  cordova: { way: 'coast', yard: 'anchorage' },
  valdez: { way: 'road', yard: 'anchorage' },
  homer: { way: 'road', yard: 'anchorage' },
  kodiak: { way: 'coast', yard: 'anchorage' },
  unalaska: { way: 'coast', yard: 'anchorage' },
  dillingham: { way: 'barge', yard: 'anchorage' },
  bethel: { way: 'barge', yard: 'anchorage' },
  nome: { way: 'barge', yard: 'anchorage' },
  galena: { way: 'barge', yard: 'fairbanks' },
  kotzebue: { way: 'barge', yard: 'anchorage' },
  deadhorse: { way: 'road', yard: 'fairbanks' },
  utqiagvik: { way: 'barge', yard: 'fairbanks' },
};

// Latitudes for the "tape" on the Alaska page (degrees north, to one decimal).
export const LATITUDES = [
  { name: 'Kent', lat: 47.4, yard: true },
  { name: 'Sitka', lat: 57.1 },
  { name: 'Anchorage', lat: 61.2, yard: true },
  { name: 'Fairbanks', lat: 64.8, yard: true },
  { name: 'Utqiaġvik', lat: 71.3 },
];
