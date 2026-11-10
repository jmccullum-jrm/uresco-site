// Services, as described on uresco.com, in the order a job uses them.
//
//   no     the station number, S-01 to S-06, the same on every page
//   tag    a short name for indexes and cross-references
//   phase  where the job is at that station

export const SERVICES = [
  {
    id: 'takeoffs',
    no: 'S-01',
    tag: 'Take-offs',
    phase: 'On paper',
    name: 'Estimates & material take-offs',
    short: 'Send plans, get a complete, priced material list back.',
    body: 'Send drawings and we build the take-off: the materials list for the job, priced and ready to order. On a remote job it catches the gaps before they become a second freight bill.',
  },
  {
    id: 'design',
    no: 'S-02',
    tag: 'Design',
    phase: 'On paper',
    name: 'Design services',
    short: 'Help with layouts, members and packages for unique projects.',
    body: 'For projects that need more than a list, our team offers design services for your unique project needs, along with take-off assistance.',
  },
  {
    id: 'crating',
    no: 'S-03',
    tag: 'Crating',
    phase: 'In the yard',
    name: 'Crating & packaging',
    short: 'Crated, banded and wrapped to survive the trip.',
    body: 'Long hauls and multiple handoffs are hard on materials. We crate, band and wrap loads so they arrive the way they left.',
  },
  {
    id: 'shipping',
    no: 'S-04',
    tag: 'Shipping',
    phase: 'In transit',
    name: 'Shipping coordination',
    short: 'Shipping, dock delivery and rural Alaska delivery, worked out with you.',
    body: 'We can work with you on all aspects of shipping coordination, dock delivery and the last leg into rural Alaska.',
  },
  {
    id: 'remote',
    no: 'S-05',
    tag: 'Remote packages',
    phase: 'Beyond the road',
    name: 'Remote & export packages',
    short: 'Complete building packages for places without a lumber yard.',
    body: 'We are fully equipped to handle remote-location and export building packages, so the whole job ships together and nothing gets left on the dock.',
  },
  {
    id: 'delivery',
    no: 'S-06',
    tag: 'Delivery',
    phase: 'On site',
    name: 'Job-site delivery',
    short: 'Boom trucks and truck-mounted Moffett forklifts.',
    body: 'Our boom trucks and truck-mounted Moffett forklifts set materials where the crew needs them, not at the curb.',
  },
];
