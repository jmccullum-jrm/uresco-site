// Projects gallery.
//
// These entries describe the KINDS of work Uresco supplies (from the old site: institutional,
// commercial and residential builders, remote and export packages). They are deliberately
// not specific jobs: no names, places or dates were available, and none have been invented.
//
// To add a real project, add an entry with `real: true` and fill in title, place, year,
// scope and a photo key from data/photos.mjs. Real projects sort first and show their
// place and year; the generic entries can be deleted once there are six or more real ones.

export const SECTORS = ['Institutional', 'Commercial', 'Residential', 'Remote & export'];

export const PROJECTS = [
  {
    sector: 'Remote & export',
    title: 'Village housing packages',
    photo: 'framing-joists',
    scope: 'Complete building packages, crated for the trip, for communities off the road system.',
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
    scope: 'Framing lumber, engineered beams and truss packages for commercial and multifamily builders.',
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
    scope: 'Materials for custom builders, with take-off help and job-site delivery.',
    materials: ['Framing lumber', 'Glulam', 'Cedar siding', 'Cabinets'],
  },
  {
    sector: 'Residential',
    title: 'Decks, siding & exteriors',
    photo: 'deck',
    scope: 'Cedar and composite decking, Hardie siding and the trim, wraps and fasteners to finish the envelope.',
    materials: ['Cedar', 'Composite decking', 'James Hardie', 'House wrap'],
  },
  {
    sector: 'Remote & export',
    title: 'Interior & northern projects',
    photo: 'north-slope',
    scope: 'Materials for work across the Interior and points north.',
    materials: ['Timbers', 'Plywood', 'Insulation', 'Tarps & poly'],
  },
  {
    sector: 'Remote & export',
    title: 'Export building packages',
    photo: 'tacoma-port',
    scope: 'Complete building packages assembled and crated, with shipping coordinated for export.',
    materials: ['Full packages', 'Crating', 'Shipping coordination'],
  },
];
