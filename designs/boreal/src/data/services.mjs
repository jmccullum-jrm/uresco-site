// Services, as described on uresco.com. Icons refer to symbols in lib/icons.mjs.
// `seq` is where a service falls on the line from plans to the delivered load, `leg` is the part of
// the line it belongs to and `step` is its one-word label on a rail (services and projects pages).

export const SERVICES = [
  {
    id: 'takeoffs',
    seq: 1, leg: 'On paper', step: 'Take-off',
    icon: 'ruler',
    name: 'Estimates & material take-offs',
    short: 'Send plans or a list for take-off help and an estimate.',
    body: 'Send drawings or a materials list and we will help with the take-off and the estimate. On a remote job, a complete list is what keeps a missing box of hangers from becoming a second freight bill.',
  },
  {
    id: 'design',
    seq: 2, leg: 'On paper', step: 'Design',
    icon: 'pencil',
    name: 'Design services',
    short: 'Design help for your unique project needs.',
    body: 'For projects that need more than a list, we offer design services for your unique project needs, along with take-off assistance.',
  },
  {
    id: 'delivery',
    seq: 6, leg: 'On the way', step: 'Delivery',
    icon: 'truck',
    name: 'Job-site delivery',
    short: 'Boom trucks and truck-mounted Moffett forklifts.',
    body: 'Dependable site delivery to job sites down the road, utilizing Moffett fork unload and boom trucks.',
  },
  {
    id: 'remote',
    seq: 3, leg: 'In the yard', step: 'Package',
    icon: 'ship',
    name: 'Remote & export packages',
    short: 'Complete building packages for places without a lumber yard.',
    body: 'We are fully equipped to handle remote-location and export building packages, and we specialize in remote location delivery, from Sitka to Utqiaġvik.',
  },
  {
    id: 'shipping',
    seq: 5, leg: 'On the way', step: 'Freight',
    icon: 'route',
    name: 'Shipping coordination',
    short: 'Shipping coordination, dock delivery and rural Alaska delivery.',
    body: 'We can work with you on all aspects of shipping coordination, dock delivery and rural Alaska delivery.',
  },
  {
    id: 'crating',
    seq: 4, leg: 'In the yard', step: 'Crate',
    icon: 'crate',
    name: 'Crating & packaging',
    short: 'Crating and packaging for the trip.',
    body: 'Long hauls and multiple handoffs are hard on materials, so we crate and package loads for the trip.',
  },
];
