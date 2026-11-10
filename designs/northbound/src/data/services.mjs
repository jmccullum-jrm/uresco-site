// Services, as described on uresco.com. Icons refer to symbols in lib/icons.mjs.
// stage, line, brings and gets are for the services page: the name of the stop on the way from
// plans to site, its headline, and what the customer hands over and gets back at that stop.

export const SERVICES = [
  {
    id: 'takeoffs',
    icon: 'ruler',
    name: 'Estimates & material take-offs',
    short: 'Send plans, get a complete, priced material list back.',
    body: 'Send drawings and we build the take-off: the materials list for the job, priced and ready to order. On a remote job it catches the gaps before they become a second freight bill.',
    stage: 'The list',
    line: 'Every stick counted, <em>before anything ships.</em>',
    brings: 'Drawings, a materials list or a sketch',
    gets: 'The take-off: the complete list for the job, priced',
  },
  {
    id: 'design',
    icon: 'pencil',
    name: 'Design services',
    short: 'Help with layouts, members and packages for unique projects.',
    body: 'For projects that need more than a list, our team offers design services for your unique project needs, along with take-off assistance.',
    stage: 'The design',
    line: 'Not every job is <em>off the shelf.</em>',
    brings: 'A project with needs of its own',
    gets: 'Help with layouts, members and packages',
  },
  {
    id: 'delivery',
    icon: 'truck',
    name: 'Job-site delivery',
    short: 'Boom trucks and truck-mounted Moffett forklifts.',
    body: 'Our boom trucks and truck-mounted Moffett forklifts set materials where the crew needs them, not at the curb.',
    stage: 'The drop',
    line: 'The truck brings <em>its own forklift.</em>',
    brings: 'A site, and where on it you want the load',
    gets: 'Materials set down where the crew needs them',
  },
  {
    id: 'remote',
    icon: 'ship',
    name: 'Remote & export packages',
    short: 'Complete building packages for places without a lumber yard.',
    body: 'We are fully equipped to handle remote-location and export building packages, so the whole job ships together and nothing gets left on the dock.',
    stage: 'The package',
    line: 'For places <em>without a lumber yard.</em>',
    brings: 'The take-off, and where it is going',
    gets: 'One complete building package, shipped together',
  },
  {
    id: 'shipping',
    icon: 'route',
    name: 'Shipping coordination',
    short: 'Barge, freight and dock delivery, coordinated for you.',
    body: 'We work with you on all aspects of shipping coordination, dock delivery and rural Alaska delivery.',
    stage: 'The freight',
    line: 'The freight, <em>leg by leg.</em>',
    brings: 'A destination and a schedule',
    gets: 'Coordination through to the dock or the last leg in',
  },
  {
    id: 'crating',
    icon: 'crate',
    name: 'Crating & packaging',
    short: 'Crated, banded and wrapped to survive the trip.',
    body: 'Long hauls and multiple handoffs are hard on materials. We crate, band and wrap loads for the trip and every handoff on it.',
    stage: 'The crate',
    line: 'Packed for <em>every handoff.</em>',
    brings: 'A package with a long way to go',
    gets: 'Loads crated, banded and wrapped for the trip',
  },
];

// The order a load meets the services in, from the plans to the ground. The services page tells
// them in this order (it lays the six stops out by hand, so change the page with the order);
// SEA marks the stops only a job across an ocean needs.
export const SEQUENCE = ['takeoffs', 'design', 'remote', 'crating', 'shipping', 'delivery'];
export const SEA = ['remote', 'crating', 'shipping'];
