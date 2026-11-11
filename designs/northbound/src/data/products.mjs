// Product categories. The item lists are the lines uresco.com says Uresco carries;
// the one-line notes describe what each product is, not specific stock or sizes.
// What is on the ground is for the yard to say, so pages tell people to call rather than promise.
// literature: manufacturer pages for spec sheets and installation guides (opened in a new tab).

export const CATEGORIES = [
  {
    slug: 'framing-lumber',
    name: 'Framing Lumber & Timbers',
    photo: 'lumber-stack',
    lede: 'Dimensional lumber and timbers for framing. Ask your yard about grades and treatments.',
    body: 'Framing lumber and timbers, from a single load for a Kent job site to a full house package crated for a barge.',
    items: [
      ['Dimensional lumber', 'Studs, joists and rafters for wall, floor and roof framing.'],
      ['Timbers', 'Heavy sawn sections for posts, beams and exposed structure.'],
      ['Pressure-treated lumber', 'Treated lumber. Ask your yard which treatment fits the job.'],
      ['Fire-retardant-treated lumber', 'For assemblies where code calls for FRT framing or sheathing.'],
    ],
    brands: [],
  },
  {
    slug: 'panels-sheathing',
    name: 'Plywood, OSB & Sheathing',
    photo: 'plywood',
    lede: 'Structural panels for floors, walls and roofs, plus exterior gypsum sheathing.',
    body: 'Plywood and OSB for subfloors, wall and roof sheathing, and DensGlass Gold where an exterior gypsum sheathing is specified.',
    items: [
      ['Plywood', 'Panels for floors, walls and roofs. Ask your yard for grades.'],
      ['Oriented strand board (OSB)', 'Sheathing and subfloor panels.'],
      ['DensGlass® Gold sheathing', 'Fiberglass-mat gypsum exterior sheathing by Georgia-Pacific.'],
    ],
    brands: ['Georgia-Pacific'],
    literature: [['DensGlass® sheathing — Georgia-Pacific', 'https://www.buildgp.com/densglass-sheathing']],
  },
  {
    slug: 'engineered-wood',
    name: 'Engineered Wood & Trusses',
    photo: 'framing-joists',
    lede: 'I-joist floor systems, engineered beams and truss packages.',
    body: 'I-joist floor systems, glulam, LVL and PSL beams, and truss packages, quoted from your plans.',
    items: [
      ['I-joist floor systems', 'Engineered joists for floor framing.'],
      ['Glulam beams (GLB)', 'Glued-laminated beams for headers, ridges and exposed spans.'],
      ['Laminated veneer lumber (LVL)', 'Engineered lumber for headers, beams and rim board.'],
      ['Parallam® PSL beams', 'Parallel strand lumber for beams and columns.'],
      ['Truss packages', 'Roof and floor truss packages, quoted from your plans.'],
    ],
    brands: ['Parallam®'],
    literature: [['Parallam® PSL — Weyerhaeuser', 'https://www.weyerhaeuser.com/woodproducts/engineered-lumber/parallam-psl/']],
  },
  {
    slug: 'concrete-forming',
    name: 'Concrete Forming Panels',
    photo: 'concrete-forms',
    lede: 'MDO and HDO overlaid plywood for concrete forming.',
    body: 'Medium- and high-density overlay panels for foundations, walls and commercial concrete work.',
    items: [
      ['MDO plywood', 'Medium-density overlay for forming, signs and paint-grade work.'],
      ['HDO plywood', 'High-density overlay plywood for concrete forming.'],
    ],
    brands: [],
  },
  {
    slug: 'cedar-decking',
    name: 'Cedar, Decking & Fencing',
    photo: 'cedar',
    lede: 'Cedar and composite for siding, trim, decks and fences.',
    body: 'Cedar siding and trims, cedar decking and fencing, and composite decking.',
    items: [
      ['Cedar siding & trim', 'Ask your yard for profiles.'],
      ['Cedar decking', 'Decking boards. Ask your yard for grades and sizes.'],
      ['Cedar fencing', 'Fencing lumber. Ask your yard for sizes.'],
      ['Composite decking', 'Composite boards for decks. Ask your yard for makes and colors.'],
    ],
    brands: [],
  },
  {
    slug: 'siding-exterior',
    name: 'Siding, Roofing & Wraps',
    photo: 'siding',
    lede: 'Fiber-cement siding, roofing and the weather barrier behind it.',
    body: 'James Hardie and CertainTeed siding, roofing, and house wraps.',
    items: [
      ['James Hardie® fiber-cement siding', 'Ask your yard for profiles and colors.'],
      ['CertainTeed siding', 'Ask your yard for profiles and colors.'],
      ['Roofing', 'Ask your yard for makes and colors.'],
      ['House wraps', 'Weather-resistive barriers for walls.'],
    ],
    brands: ['James Hardie', 'CertainTeed'],
    literature: [['James Hardie® siding & trim', 'https://www.jameshardie.com/'], ['CertainTeed siding & trim', 'https://www.certainteed.com/products/siding-trim']],
  },
  {
    slug: 'insulation-drywall',
    name: 'Insulation & Drywall',
    photo: 'insulation',
    lede: 'Rigid foam and batt insulation, and drywall for the interior.',
    body: 'Rigid foam and batt insulation for walls, roofs and foundations, and drywall for the interior.',
    items: [
      ['Rigid foam insulation (XPS & EPS)', 'Continuous insulation for foundations, slabs, walls and roofs.'],
      ['Fiberglass batt insulation', 'Cavity insulation for walls, floors and ceilings.'],
      ['Drywall', 'Gypsum board for walls and ceilings.'],
    ],
    brands: [],
  },
  {
    slug: 'windows-doors-cabinets',
    name: 'Windows, Doors & Cabinets',
    photo: 'windows',
    lede: 'Windows and doors, and custom cabinets.',
    body: 'Windows and doors, and custom cabinets, quoted with the rest of the job.',
    items: [
      ['Windows', 'Ask your yard for makes and sizes.'],
      ['Doors', 'Ask your yard for makes and sizes.'],
      ['Custom cabinets', 'Cabinetry built to your layout.'],
    ],
    brands: [],
  },
  {
    slug: 'hardware-supplies',
    name: 'Hardware, Fasteners & Job-Site Supplies',
    photo: 'hardware',
    lede: 'The connectors, fasteners and consumables that finish a load.',
    body: 'Simpson Strong-Tie connectors, fasteners, tarps, poly, caulking and adhesives.',
    items: [
      ['Simpson Strong-Tie® hardware', 'Hangers, ties, holdowns and structural connectors.'],
      ['Fasteners', 'Nails, screws and anchors.'],
      ['Tarps & poly sheeting', 'Weather protection for materials and work.'],
      ['Caulking & adhesives', 'Sealants and construction adhesives.'],
    ],
    brands: ['Simpson Strong-Tie'],
    literature: [['Simpson Strong-Tie® connectors & catalogs', 'https://www.strongtie.com/']],
  },
];

export const BRANDS = ['James Hardie', 'CertainTeed', 'Simpson Strong-Tie', 'Georgia-Pacific DensGlass', 'Parallam'];
