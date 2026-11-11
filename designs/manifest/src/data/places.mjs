// Places the Alaska page's "Where are you building?" ticket knows about.
//
// This is a short list of well-known communities, not a service-area list: delivery is available
// anywhere in Alaska, and a place that is missing here gets the "ask a yard" answer, not a "no".
//
// access   how freight typically reaches the place (general Alaska geography, not a Uresco schedule):
//            local     Puget Sound, by truck from the Kent yard
//            road      on the Alaska road system, by truck from an Alaska yard
//            coastal   off the road system, reached by sea (Southeast and the Gulf coast) and by air
//            seasonal  off the road system: barge in the ice-free season, air year-round
// yard     who to call, following the guidance on the Locations page: Puget Sound → Kent;
//          Southcentral Alaska or a remote site → Anchorage; the Interior and points north → Fairbanks.
//
// scripts/map.mjs projects these onto the delivery plate. After editing, re-project:
//   node scripts/map.mjs <tools dir> src/data/map.json

const P = (name, st, lat, lon, region, access, yard) => ({ name, st, lat, lon, region, access, yard });

export const PLACES = [
  // Puget Sound
  P('Seattle', 'WA', 47.606, -122.332, 'Puget Sound', 'local', 'kent'),
  P('Tacoma', 'WA', 47.253, -122.444, 'Puget Sound', 'local', 'kent'),
  P('Kent', 'WA', 47.381, -122.235, 'Puget Sound', 'local', 'kent'),
  P('Bellevue', 'WA', 47.61, -122.201, 'Puget Sound', 'local', 'kent'),
  P('Everett', 'WA', 47.979, -122.202, 'Puget Sound', 'local', 'kent'),
  P('Olympia', 'WA', 47.038, -122.9, 'Puget Sound', 'local', 'kent'),
  P('Renton', 'WA', 47.483, -122.217, 'Puget Sound', 'local', 'kent'),
  P('Auburn', 'WA', 47.307, -122.228, 'Puget Sound', 'local', 'kent'),
  P('Puyallup', 'WA', 47.185, -122.293, 'Puget Sound', 'local', 'kent'),
  P('Federal Way', 'WA', 47.322, -122.313, 'Puget Sound', 'local', 'kent'),
  P('Redmond', 'WA', 47.674, -122.121, 'Puget Sound', 'local', 'kent'),
  P('Bremerton', 'WA', 47.567, -122.632, 'Puget Sound', 'local', 'kent'),

  // Southcentral Alaska, on the road system
  P('Anchorage', 'AK', 61.218, -149.9, 'Southcentral Alaska', 'road', 'anchorage'),
  P('Eagle River', 'AK', 61.321, -149.568, 'Southcentral Alaska', 'road', 'anchorage'),
  P('Wasilla', 'AK', 61.581, -149.439, 'Mat-Su Valley', 'road', 'anchorage'),
  P('Palmer', 'AK', 61.6, -149.113, 'Mat-Su Valley', 'road', 'anchorage'),
  P('Talkeetna', 'AK', 62.324, -150.109, 'Mat-Su Valley', 'road', 'anchorage'),
  P('Girdwood', 'AK', 60.942, -149.166, 'Southcentral Alaska', 'road', 'anchorage'),
  P('Kenai', 'AK', 60.554, -151.258, 'Kenai Peninsula', 'road', 'anchorage'),
  P('Soldotna', 'AK', 60.488, -151.058, 'Kenai Peninsula', 'road', 'anchorage'),
  P('Seward', 'AK', 60.104, -149.443, 'Kenai Peninsula', 'road', 'anchorage'),
  P('Homer', 'AK', 59.643, -151.548, 'Kenai Peninsula', 'road', 'anchorage'),
  P('Valdez', 'AK', 61.131, -146.348, 'Prince William Sound', 'road', 'anchorage'),
  P('Glennallen', 'AK', 62.109, -145.546, 'Copper River Basin', 'road', 'anchorage'),

  // The Interior and the road north
  P('Fairbanks', 'AK', 64.838, -147.716, 'Interior Alaska', 'road', 'fairbanks'),
  P('North Pole', 'AK', 64.751, -147.349, 'Interior Alaska', 'road', 'fairbanks'),
  P('Nenana', 'AK', 64.564, -149.093, 'Interior Alaska', 'road', 'fairbanks'),
  P('Healy', 'AK', 63.857, -148.966, 'Interior Alaska', 'road', 'fairbanks'),
  P('Delta Junction', 'AK', 64.038, -145.732, 'Interior Alaska', 'road', 'fairbanks'),
  P('Tok', 'AK', 63.337, -142.986, 'Interior Alaska', 'road', 'fairbanks'),
  P('Deadhorse', 'AK', 70.2, -148.46, 'North Slope', 'road', 'fairbanks'),

  // Southeast and the Gulf coast: off the road system, reached by sea
  P('Ketchikan', 'AK', 55.342, -131.646, 'Southeast Alaska', 'coastal', 'anchorage'),
  P('Wrangell', 'AK', 56.471, -132.377, 'Southeast Alaska', 'coastal', 'anchorage'),
  P('Petersburg', 'AK', 56.813, -132.956, 'Southeast Alaska', 'coastal', 'anchorage'),
  P('Sitka', 'AK', 57.053, -135.33, 'Southeast Alaska', 'coastal', 'anchorage'),
  P('Juneau', 'AK', 58.302, -134.42, 'Southeast Alaska', 'coastal', 'anchorage'),
  P('Hoonah', 'AK', 58.11, -135.436, 'Southeast Alaska', 'coastal', 'anchorage'),
  P('Craig', 'AK', 55.476, -133.148, 'Southeast Alaska', 'coastal', 'anchorage'),
  P('Yakutat', 'AK', 59.547, -139.727, 'Gulf of Alaska coast', 'coastal', 'anchorage'),
  P('Cordova', 'AK', 60.543, -145.757, 'Prince William Sound', 'coastal', 'anchorage'),
  P('Kodiak', 'AK', 57.79, -152.407, 'Kodiak Island', 'coastal', 'anchorage'),
  P('Seldovia', 'AK', 59.438, -151.711, 'Kenai Peninsula', 'coastal', 'anchorage'),
  P('Sand Point', 'AK', 55.34, -160.497, 'Shumagin Islands', 'coastal', 'anchorage'),
  P('Unalaska', 'AK', 53.874, -166.537, 'Aleutian Islands', 'coastal', 'anchorage'),

  // Western and Arctic Alaska: barge in the ice-free season, air year-round
  P('Dillingham', 'AK', 59.04, -158.458, 'Bristol Bay', 'seasonal', 'anchorage'),
  P('King Salmon', 'AK', 58.688, -156.649, 'Bristol Bay', 'seasonal', 'anchorage'),
  P('Naknek', 'AK', 58.728, -157.014, 'Bristol Bay', 'seasonal', 'anchorage'),
  P('Togiak', 'AK', 59.062, -160.376, 'Bristol Bay', 'seasonal', 'anchorage'),
  P('Bethel', 'AK', 60.792, -161.756, 'Yukon–Kuskokwim Delta', 'seasonal', 'anchorage'),
  P('Aniak', 'AK', 61.578, -159.522, 'Kuskokwim River', 'seasonal', 'anchorage'),
  P('Hooper Bay', 'AK', 61.531, -166.097, 'Yukon–Kuskokwim Delta', 'seasonal', 'anchorage'),
  P('Emmonak', 'AK', 62.777, -164.523, 'Yukon–Kuskokwim Delta', 'seasonal', 'anchorage'),
  P('St. Mary’s', 'AK', 62.053, -163.166, 'Lower Yukon', 'seasonal', 'anchorage'),
  P('Unalakleet', 'AK', 63.873, -160.788, 'Norton Sound', 'seasonal', 'anchorage'),
  P('Nome', 'AK', 64.501, -165.406, 'Seward Peninsula', 'seasonal', 'anchorage'),
  P('Kotzebue', 'AK', 66.898, -162.597, 'Northwest Arctic', 'seasonal', 'anchorage'),
  P('McGrath', 'AK', 62.956, -155.596, 'Kuskokwim River', 'seasonal', 'anchorage'),
  P('Galena', 'AK', 64.741, -156.931, 'Interior Alaska', 'seasonal', 'fairbanks'),
  P('Fort Yukon', 'AK', 66.565, -145.274, 'Interior Alaska', 'seasonal', 'fairbanks'),
  P('Point Hope', 'AK', 68.348, -166.808, 'North Slope', 'seasonal', 'fairbanks'),
  P('Wainwright', 'AK', 70.637, -160.038, 'North Slope', 'seasonal', 'fairbanks'),
  P('Utqiaġvik', 'AK', 71.291, -156.789, 'North Slope', 'seasonal', 'fairbanks'),
  P('Kaktovik', 'AK', 70.132, -143.624, 'North Slope', 'seasonal', 'fairbanks'),
];

// Other names people type for the same place.
export const ALIASES = { Barrow: 'Utqiaġvik', Utqiagvik: 'Utqiaġvik', 'Dutch Harbor': 'Unalaska', 'Prudhoe Bay': 'Deadhorse', 'Saint Marys': 'St. Mary’s', "St. Mary's": 'St. Mary’s' };

// The place the ticket shows before anyone has typed anything. Marked as an example on the page.
export const EXAMPLE = 'Bethel';

// One-tap examples beside the field, and what the list offers before anything is typed.
export const CHIPS = ['Bethel', 'Nome', 'Utqiaġvik', 'Juneau'];
export const SUGGEST = ['Anchorage', 'Fairbanks', 'Bethel', 'Nome', 'Kotzebue', 'Utqiaġvik', 'Juneau', 'Seattle'];

// What the ticket says for each kind of access: [lane letter on the plate, wording]. An empty letter
// means no lane is drawn for it. General Alaska geography, labelled "typically" on the page.
// No carriers, schedules, transit times or prices. "Moffett or boom-truck unload" is the old site's
// job-site delivery wording.
export const ACCESS = {
  local: { tag: 'On the road system', modes: [['', 'Truck from {yard}'], ['', 'Moffett or boom-truck unload']] },
  road: { tag: 'On the road system', modes: [['B', 'Truck from {yard}'], ['', 'Moffett or boom-truck unload']] },
  coastal: { tag: 'Off the road system', modes: [['A', 'By sea to the dock'], ['D', 'Air cargo']] },
  seasonal: { tag: 'Off the road system', modes: [['C', 'Barge in season'], ['D', 'Air year-round']] },
};
