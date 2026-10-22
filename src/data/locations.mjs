// The three distribution centers. Numbers are from uresco.com as of October 2026.
// Where the old site disagreed with itself the value used here is noted; confirm before launch.
//
// hours: leave null until confirmed; the site hides the line rather than guess.

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
    hours: null,
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
    hours: null,
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
    hours: null,
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
