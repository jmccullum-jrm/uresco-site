// Projects gallery.
//
// These entries describe the KINDS of work Uresco supplies (from the old site: institutional,
// commercial and residential builders, remote and export packages). They are deliberately
// not specific jobs: no names, places or dates were available, and none have been invented.
//
// To add a real project, add an entry with `real: true` and fill in title, place, year,
// scope and a photo key from data/photos.mjs. Real projects sort first and show their
// place and year; the generic entries can be deleted once there are six or more real ones.

export const SECTORS = ['Institutional', 'Commercial', 'Residential', 'Remote Alaska'];

export const PROJECTS = [
  {
    sector: 'Remote Alaska',
    title: 'Village housing packages',
    photo: 'remote-village',
    scope: 'Complete framing, envelope and finish packages, crated and shipped by barge for communities off the road system.',
    materials: ['Framing lumber', 'Sheathing', 'Rigid foam', 'Windows & doors'],
  },
  {
    sector: 'Institutional',
    title: 'Schools, clinics & public buildings',
    photo: 'institutional',
    scope: 'Engineered floor systems, fire-retardant-treated lumber and exterior sheathing for public and institutional work.',
    materials: ['I-joists', 'FRT lumber', 'DensGlass', 'Hardware'],
  },
  {
    sector: 'Commercial',
    title: 'Commercial & multifamily framing',
    photo: 'multifamily',
    scope: 'Phased framing deliveries, engineered beams and truss packages sequenced to the schedule.',
    materials: ['Dimensional lumber', 'LVL & PSL', 'Trusses', 'Simpson connectors'],
  },
  {
    sector: 'Commercial',
    title: 'Concrete & site work',
    photo: 'concrete-forms',
    scope: 'MDO and HDO forming panels, timbers and supplies for foundations and structural concrete.',
    materials: ['HDO / MDO', 'Timbers', 'Fasteners'],
  },
  {
    sector: 'Residential',
    title: 'Custom homes',
    photo: 'custom-home',
    scope: 'Framing through finish for custom builders, with take-offs from plans and delivery set by boom truck.',
    materials: ['Framing packages', 'Glulam', 'Cedar siding', 'Cabinets'],
  },
  {
    sector: 'Residential',
    title: 'Decks, siding & exteriors',
    photo: 'deck',
    scope: 'Cedar and composite decking, Hardie siding and the trim, wraps and fasteners to finish the envelope.',
    materials: ['Cedar', 'Composite decking', 'James Hardie', 'House wrap'],
  },
  {
    sector: 'Remote Alaska',
    title: 'Interior & northern projects',
    photo: 'north-slope',
    scope: 'Materials staged out of Fairbanks for work across the Interior and up the road north.',
    materials: ['Timbers', 'Plywood', 'Insulation', 'Tarps & poly'],
  },
  {
    sector: 'Institutional',
    title: 'Export building packages',
    photo: 'export',
    scope: 'Complete building packages assembled and crated, with shipping coordinated for export.',
    materials: ['Full packages', 'Crating', 'Shipping coordination'],
  },
];
