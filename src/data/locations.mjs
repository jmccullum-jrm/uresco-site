// The three distribution centers. Numbers are from uresco.com as of October 2026.
// Where the old site disagreed with itself the value used here is noted; confirm before launch.
//
// hours: tz is the yard's IANA time zone; week runs Sunday→Saturday as [open, close] in minutes
// after midnight, or null when closed. The site shows a live open/closed status from these.
// HOURS ARE PLACEHOLDERS (typical yard hours, not confirmed by Uresco) — confirm before launch.

const weekdays = (open, close) => [null, [open, close], [open, close], [open, close], [open, close], [open, close], null];

export const LOCATIONS = [
  {
    id: 'kent',
    city: 'Kent',
    state: 'WA',
    region: 'Pacific Northwest',
    role: 'Headquarters & Pacific Northwest distribution center',
    street: '8246 S 194th St',
    zip: '98032',
    mailing: 'PO Box 1778, Kent, WA 98035-1778',
    tollFree: '(800) 275-8333',
    phone: '(253) 395-1211',
    // The old Pacific Northwest page listed (253) 872-3693; the footer and Locations page list 872-8432.
    fax: '(253) 872-8432',
    email: 'sales@uresco.com',
    hours: { tz: 'America/Los_Angeles', week: weekdays(7 * 60, 16 * 60 + 30) },
    page: 'pacific-northwest/',
    photo: 'yard-kent',
    blurb: 'Our headquarters and Pacific Northwest distribution center, delivering to Puget Sound job sites by boom truck and Moffett forklift.',
    geo: { lat: 47.4277, lng: -122.2335 },
  },
  {
    id: 'anchorage',
    city: 'Anchorage',
    state: 'AK',
    region: 'Alaska',
    role: 'Southcentral Alaska distribution center',
    street: '12790 Old Seward Hwy',
    zip: '99515',
    // The old sidebar showed (888) 563-2500; the Alaska and Locations pages show (800) 563-2500.
    tollFree: '(800) 563-2500',
    phone: '(907) 563-2500',
    fax: '(907) 561-2076',
    email: 'anchorage@uresco.com',
    hours: { tz: 'America/Anchorage', week: weekdays(7 * 60, 16 * 60 + 30) },
    page: 'alaska/',
    photo: 'anchorage',
    blurb: 'Our Southcentral Alaska distribution center on the Old Seward Highway, with remote-site delivery anywhere in the state.',
    geo: { lat: 61.1105, lng: -149.859 },
  },
  {
    id: 'fairbanks',
    city: 'Fairbanks',
    state: 'AK',
    region: 'Alaska',
    role: 'Interior Alaska distribution center',
    street: '1077 Aspen St',
    zip: '99709',
    tollFree: null,
    phone: '(907) 456-1550',
    fax: '(907) 456-5519',
    email: 'fairbanks@uresco.com',
    hours: { tz: 'America/Anchorage', week: weekdays(7 * 60, 16 * 60 + 30) },
    page: 'alaska/',
    photo: 'fairbanks',
    blurb: 'Our Interior Alaska distribution center, serving Fairbanks and the communities beyond it.',
    geo: { lat: 64.8326, lng: -147.784 },
  },
];

export const byId = (id) => LOCATIONS.find((l) => l.id === id);
export const tel = (n) => 'tel:+1' + n.replace(/\D/g, '');
export const address = (l) => `${l.street}, ${l.city}, ${l.state} ${l.zip}`;
export const mapsUrl = (l) => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(`Uresco Construction Materials, ${address(l)}`);

// "Mon–Fri 7 a.m.–4:30 p.m." from the week table, grouping consecutive days with the same hours.
const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const clock = (m) => {
  const h = Math.floor(m / 60), mm = m % 60;
  return `${((h + 11) % 12) + 1}${mm ? ':' + String(mm).padStart(2, '0') : ''} ${h < 12 ? 'a.m.' : 'p.m.'}`;
};
export const hoursLines = (l) => {
  if (!l.hours) return [];
  const order = [1, 2, 3, 4, 5, 6, 0];
  const runs = [];
  for (const d of order) {
    const h = l.hours.week[d];
    const key = h ? h.join('-') : 'closed';
    const last = runs[runs.length - 1];
    if (last && last.key === key) last.to = d; else runs.push({ key, from: d, to: d, h });
  }
  return runs.map((r) => `${DAY[r.from]}${r.to !== r.from ? '–' + DAY[r.to] : ''}: ${r.h ? `${clock(r.h[0])}–${clock(r.h[1])}` : 'Closed'}`);
};
export const tzLabel = (l) => (l.hours?.tz === 'America/Los_Angeles' ? 'Pacific time' : 'Alaska time');
export const hoursAttr = (l) => (l.hours ? JSON.stringify({ tz: l.hours.tz, week: l.hours.week }) : null);
// schema.org openingHoursSpecification
export const openingHoursLd = (l) => {
  if (!l.hours) return undefined;
  const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const hhmm = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  return l.hours.week.map((h, i) => (h ? { '@type': 'OpeningHoursSpecification', dayOfWeek: names[i], opens: hhmm(h[0]), closes: hhmm(h[1]) } : null)).filter(Boolean);
};
