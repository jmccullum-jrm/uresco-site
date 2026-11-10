// Services, as described on uresco.com. Icons refer to symbols in lib/icons.mjs.
// `step` is each service's place in the order a job meets them, from plans to the delivered load
// (the services page tells them in that order); `label` is the one-word name used where space is short.

export const SERVICES = [
  {
    id: 'takeoffs',
    step: 1,
    label: 'Take-offs',
    icon: 'ruler',
    name: 'Estimates & take-offs',
    short: 'Send plans or a list. We’ll help with the take-off and the estimate.',
    body: 'Send drawings and we’ll help with the take-off and the estimate. On a remote job, a complete list can save a second freight bill.',
  },
  {
    id: 'design',
    step: 2,
    label: 'Design',
    icon: 'pencil',
    name: 'Design services',
    short: 'Design services for your unique project needs.',
    body: 'We offer design services for your unique project needs, along with material take-off assistance.',
  },
  {
    id: 'delivery',
    step: 6,
    label: 'Delivery',
    icon: 'truck',
    name: 'Job-site delivery',
    short: 'To the job site by boom truck and Moffett forklift.',
    body: 'We deliver to the job site by boom truck and Moffett forklift.',
  },
  {
    id: 'remote',
    step: 3,
    label: 'Packages',
    icon: 'ship',
    name: 'Remote & export packages',
    short: 'Complete building packages for remote and export jobs.',
    body: 'We are fully equipped to handle remote-location and export building packages. One complete package beats a second freight bill.',
  },
  {
    id: 'shipping',
    step: 5,
    label: 'Shipping',
    icon: 'route',
    name: 'Shipping coordination',
    short: 'Shipping coordination, dock delivery and rural Alaska delivery, worked out with you.',
    body: 'We can work with you on all aspects of shipping coordination, dock delivery and rural Alaska delivery.',
  },
  {
    id: 'crating',
    step: 4,
    label: 'Crating',
    icon: 'crate',
    name: 'Crating & packaging',
    short: 'Crating and packaging for the trip.',
    body: 'Long hauls and multiple handoffs are hard on materials. We offer crating and packaging for the trip.',
  },
];
