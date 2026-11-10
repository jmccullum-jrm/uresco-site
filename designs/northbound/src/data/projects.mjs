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

// Added for the projects page. On each entry below:
//   id          anchor on the page (/projects/#custom-homes)
//   caption     what the photograph shows. These are stock photographs of the KIND of work, so a
//               caption describes the picture and never calls it a Uresco job. A real project
//               (real: true) should caption its own photograph.
//   photoPlace  where the photograph was taken, when that is known; photoLat names its latitude
//               (a key of LAT in lib/components.mjs, or of the page's own short list).
//   pagePhoto   the photograph the projects page shows when it should differ from `photo`
//               (caption, photoPlace and photoLat then describe pagePhoto).
//   links       one per entry in `materials`, in the same order: the product line (or service) that
//               material belongs to, as a site path.
// SECTOR_NOTES: for each sector its anchor, a headline phrase, a sentence on the work, and the page
// that explains how such a job is handled.
export const SECTOR_NOTES = {
  Institutional: {
    id: 'institutional',
    tail: 'Built to the specification.',
    lede: 'Engineered floor systems, fire-retardant-treated lumber, exterior sheathing, and whole packages crated for export.',
    more: ['Remote & export packages', 'services/#remote'],
  },
  Commercial: {
    id: 'commercial',
    tail: 'Framing, beams and forms.',
    lede: 'Framing packages for larger jobs, the engineered beams and trusses that carry them, and the forming panels for the concrete underneath.',
    more: ['Job-site delivery', 'services/#delivery'],
  },
  Residential: {
    id: 'residential',
    tail: 'Framing through finish.',
    lede: 'A house from the framing package to the last deck board, with take-off help from your plans and job-site delivery by boom truck.',
    more: ['Estimates & take-offs', 'services/#takeoffs'],
  },
  'Remote Alaska': {
    id: 'remote-alaska',
    tail: 'No road in.',
    lede: 'Off the road system, a forgotten item can mean a second freight bill. A complete package is crated for the trip, and freight generally goes by barge in the ice-free season or by air.',
    more: ['How remote delivery works', 'alaska/'],
  },
};

export const PROJECTS = [
  {
    sector: 'Remote Alaska',
    title: 'Village housing packages',
    photo: 'remote-village',
    scope: 'Complete framing, envelope and finish packages, crated and shipped for communities off the road system.',
    materials: ['Framing lumber', 'Sheathing', 'Rigid foam', 'Windows & doors'],
    id: 'village-housing',
    caption: 'Snow-drifted buildings and a beached boat on the Arctic coast.',
    photoPlace: 'Utqiaġvik',
    photoLat: 'utqiagvik',
    links: ['products/framing-lumber/', 'products/panels-sheathing/', 'products/insulation-drywall/', 'products/windows-doors-cabinets/'],
  },
  {
    sector: 'Institutional',
    title: 'Schools, clinics & public buildings',
    photo: 'institutional',
    scope: 'Engineered floor systems, fire-retardant-treated lumber and exterior sheathing for public and institutional work.',
    materials: ['I-joists', 'FRT lumber', 'DensGlass', 'Hardware'],
    id: 'public-buildings',
    caption: 'A single-story building framed, trussed and sheathed behind site fencing.',
    links: ['products/engineered-wood/', 'products/framing-lumber/', 'products/panels-sheathing/', 'products/hardware-supplies/'],
  },
  {
    sector: 'Commercial',
    title: 'Commercial & multifamily framing',
    photo: 'multifamily',
    scope: 'Framing packages, engineered beams and truss packages for commercial and multifamily work.',
    materials: ['Dimensional lumber', 'LVL & PSL', 'Trusses', 'Simpson connectors'],
    id: 'multifamily-framing',
    caption: 'A four-story wood-frame apartment building in house wrap.',
    links: ['products/framing-lumber/', 'products/engineered-wood/', 'products/engineered-wood/', 'products/hardware-supplies/'],
  },
  {
    sector: 'Commercial',
    title: 'Concrete & site work',
    photo: 'concrete-forms',
    scope: 'MDO and HDO forming panels, timbers and supplies for foundations and structural concrete.',
    materials: ['HDO / MDO', 'Timbers', 'Fasteners'],
    id: 'concrete',
    caption: 'A crew guides a pump hose along freshly poured foundation walls.',
    links: ['products/concrete-forming/', 'products/framing-lumber/', 'products/hardware-supplies/'],
  },
  {
    sector: 'Residential',
    title: 'Custom homes',
    photo: 'custom-home',
    scope: 'Framing through finish for custom builders, with take-off help from plans and job-site delivery by boom truck.',
    materials: ['Framing packages', 'Glulam', 'Cedar siding', 'Cabinets'],
    id: 'custom-homes',
    caption: 'Looking up through new wall framing and roof trusses.',
    links: ['products/framing-lumber/', 'products/engineered-wood/', 'products/cedar-decking/', 'products/windows-doors-cabinets/'],
  },
  {
    sector: 'Residential',
    title: 'Decks, siding & exteriors',
    photo: 'cedar',
    scope: 'Cedar and composite decking, Hardie siding and the trim, wraps and fasteners to finish the envelope.',
    materials: ['Cedar', 'Composite decking', 'James Hardie', 'House wrap'],
    id: 'exteriors',
    caption: 'Vertical cedar siding under a deep roof overhang.',
    links: ['products/cedar-decking/', 'products/cedar-decking/', 'products/siding-exterior/', 'products/siding-exterior/'],
  },
  {
    sector: 'Remote Alaska',
    title: 'Interior & northern projects',
    photo: 'north-slope',
    scope: 'Materials from the Fairbanks yard for work across the Interior and up the road north.',
    materials: ['Timbers', 'Plywood', 'Insulation', 'Tarps & poly'],
    id: 'interior-north',
    caption: 'A loaded pickup under hoarfrost.',
    photoPlace: 'Interior Alaska',
    links: ['products/framing-lumber/', 'products/panels-sheathing/', 'products/insulation-drywall/', 'products/hardware-supplies/'],
  },
  {
    sector: 'Institutional',
    title: 'Export building packages',
    photo: 'export',
    scope: 'Complete building packages assembled and crated, with shipping coordinated for export.',
    materials: ['Full packages', 'Crating', 'Shipping coordination'],
    id: 'export-packages',
    pagePhoto: 'tacoma-port',
    caption: 'Container cranes across Commencement Bay.',
    photoPlace: 'Port of Tacoma',
    photoLat: 'tacoma',
    links: ['services/#remote', 'services/#crating', 'services/#shipping'],
  },
];
