// Services, as described on uresco.com. Icons refer to symbols in lib/icons.mjs.
// stage, line, brings and gets are for the services page: the name of the stop on the way from
// plans to site, its headline, and what the customer hands over and gets back at that stop.

export const SERVICES = [
  {
    id: 'takeoffs',
    icon: 'ruler',
    name: 'Estimates & material take-offs',
    short: 'Send plans for take-off help and an estimate.',
    body: 'Send drawings and we will help with the take-off and the estimate.',
    stage: 'The list',
    line: 'Know the list <em>before anything ships.</em>',
    brings: 'Drawings, a materials list or a sketch',
    gets: 'A take-off and an estimate',
  },
  {
    id: 'design',
    icon: 'pencil',
    name: 'Design services',
    short: 'Design services for your unique project needs.',
    body: 'For projects that need more than a list, our team offers design services for your unique project needs, along with take-off assistance.',
    stage: 'The design',
    line: 'Not every job is <em>off the shelf.</em>',
    brings: 'A project with needs of its own',
    gets: 'Design help for your unique project needs',
  },
  {
    id: 'delivery',
    icon: 'truck',
    name: 'Job-site delivery',
    short: 'Boom trucks and truck-mounted Moffett forklifts.',
    body: 'We deliver to the job site with boom trucks and truck-mounted Moffett forklifts. Ask your yard what it can bring to your site.',
    stage: 'The drop',
    line: 'The truck brings <em>its own forklift.</em>',
    brings: 'A job-site address',
    gets: 'Materials delivered to your job site',
  },
  {
    id: 'remote',
    icon: 'ship',
    name: 'Remote & export packages',
    short: 'Complete building packages for places without a lumber yard.',
    body: 'We are fully equipped to handle remote-location and export building packages.',
    stage: 'The package',
    line: 'For places <em>without a lumber yard.</em>',
    brings: 'The take-off, and where it is going',
    gets: 'A complete building package, packed for the trip',
  },
  {
    id: 'shipping',
    icon: 'route',
    name: 'Shipping coordination',
    short: 'We work with you on shipping coordination, dock delivery and rural Alaska delivery.',
    body: 'We work with you on all aspects of shipping coordination, dock delivery and rural Alaska delivery.',
    stage: 'The freight',
    line: 'The freight, <em>leg by leg.</em>',
    brings: 'A destination and a schedule',
    gets: 'Help with shipping coordination, dock delivery and rural Alaska delivery',
  },
  {
    id: 'crating',
    icon: 'crate',
    name: 'Crating & packaging',
    short: 'Crating and packaging for the trip.',
    body: 'Long hauls and multiple handoffs are hard on materials. We crate and package loads for the trip.',
    stage: 'The crate',
    line: 'Packed for <em>every handoff.</em>',
    brings: 'A package with a long way to go',
    gets: 'Loads crated and packaged for the trip',
  },
];

// The order a load meets the services in, from the plans to the ground. The services page tells
// them in this order (it lays the six stops out by hand, so change the page with the order);
// SEA marks the stops only a job across an ocean needs.
export const SEQUENCE = ['takeoffs', 'design', 'remote', 'crating', 'shipping', 'delivery'];
export const SEA = ['remote', 'crating', 'shipping'];
