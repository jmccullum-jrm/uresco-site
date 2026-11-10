// The Projects page: the kinds of work, by sector.
//
// These entries describe the KINDS of work Uresco supplies (from the old site: institutional,
// commercial and residential builders, remote and export packages). They are deliberately
// not specific jobs: no names, places or dates were available, and none have been invented.
//
// To add a real project, add an entry with `real: true` and fill in title, place, year and
// scope. Real projects come first in their sector and show their place and year; the
// generic entries can be deleted once there are enough real ones.

// Fields for the Projects page (the schedule of work):
//   sketch    which small elevation marks the line (lib/drawings.mjs sketch())
//   lines     product lines (category slugs) named in the typical package; 'all' for a complete building package
//   services  service ids (data/services.mjs) this kind of work usually calls on, taken from its scope

// One sentence on each sector, summarising the kinds of work listed under it below.
export const SECTOR_NOTES = {
  'Remote Alaska': 'Building where there is no lumber yard: packages for communities off the road system, materials for the Interior and the road north, and building packages made up for export.',
  Institutional: 'Public and institutional work: schools, clinics and public buildings.',
  Commercial: 'Commercial and multifamily framing, and the forming panels, timbers and supplies that go into concrete and site work.',
  Residential: 'Custom homes from framing through finish, and the decks, siding and exteriors that complete them.',
};

export const PROJECTS = [
  {
    sector: 'Remote Alaska',
    title: 'Village housing packages',
    scope: 'Complete framing, envelope and finish packages, crated and shipped by barge for communities off the road system.',
    materials: ['Framing lumber', 'Sheathing', 'Rigid foam', 'Windows & doors'],
    sketch: 'village',
    lines: ['framing-lumber', 'panels-sheathing', 'insulation-drywall', 'windows-doors-cabinets'],
    services: ['takeoffs', 'crating', 'shipping', 'remote'],
  },
  {
    sector: 'Institutional',
    title: 'Schools, clinics & public buildings',
    scope: 'Engineered floor systems, fire-retardant-treated lumber and exterior sheathing for public and institutional work.',
    materials: ['I-joists', 'FRT lumber', 'DensGlass', 'Hardware'],
    sketch: 'public',
    lines: ['framing-lumber', 'panels-sheathing', 'engineered-wood', 'hardware-supplies'],
    services: ['takeoffs', 'design'],
  },
  {
    sector: 'Commercial',
    title: 'Commercial & multifamily framing',
    scope: 'Framing lumber, engineered beams and truss packages for commercial and multifamily work.',
    materials: ['Dimensional lumber', 'LVL & PSL', 'Trusses', 'Simpson connectors'],
    sketch: 'multi',
    lines: ['framing-lumber', 'engineered-wood', 'hardware-supplies'],
    services: ['takeoffs', 'delivery'],
  },
  {
    sector: 'Commercial',
    title: 'Concrete & site work',
    scope: 'MDO and HDO forming panels, timbers and supplies for foundations and structural concrete.',
    materials: ['HDO / MDO', 'Timbers', 'Fasteners'],
    sketch: 'forms',
    lines: ['framing-lumber', 'concrete-forming', 'hardware-supplies'],
    services: ['takeoffs', 'delivery'],
  },
  {
    sector: 'Residential',
    title: 'Custom homes',
    scope: 'Framing through finish for custom builders, with take-off help and job-site delivery.',
    materials: ['Framing packages', 'Glulam', 'Cedar siding', 'Cabinets'],
    sketch: 'home',
    lines: ['framing-lumber', 'engineered-wood', 'cedar-decking', 'windows-doors-cabinets'],
    services: ['takeoffs', 'design', 'delivery'],
  },
  {
    sector: 'Residential',
    title: 'Decks, siding & exteriors',
    scope: 'Cedar and composite decking, Hardie siding and the trim, wraps and fasteners to finish the envelope.',
    materials: ['Cedar', 'Composite decking', 'James Hardie', 'House wrap'],
    sketch: 'deck',
    lines: ['cedar-decking', 'siding-exterior'],
    services: ['takeoffs', 'delivery'],
  },
  {
    sector: 'Remote Alaska',
    title: 'Interior & northern projects',
    scope: 'Materials for work across the Interior and up the road north.',
    materials: ['Timbers', 'Plywood', 'Insulation', 'Tarps & poly'],
    sketch: 'north',
    lines: ['framing-lumber', 'panels-sheathing', 'insulation-drywall', 'hardware-supplies'],
    services: ['takeoffs', 'shipping'],
  },
  {
    // Remote and export packages are one line of work on the old site, so export is filed beside remote.
    sector: 'Remote Alaska',
    title: 'Export building packages',
    scope: 'Complete building packages assembled and crated, with shipping coordinated for export.',
    materials: ['Full packages', 'Crating', 'Shipping coordination'],
    sketch: 'crate',
    lines: 'all',
    services: ['crating', 'shipping', 'remote'],
  },
];
