import { html } from '../lib/html.mjs';
import { SITE } from '../config.mjs';

// Short and legacy addresses that forward to their page. Static hosts can't send a 301,
// so each is a tiny page with a canonical link and an instant refresh.
const ROUTES = [
  ['products-services/', 'products/', 'Products'],   // the old site's URL
  ['contact/', 'locations/', 'Locations'],
  ['credit/', 'accounts/', 'Contractor accounts'],
];

export default ROUTES.map(([from, to, label]) => ({
  path: from,
  redirect: true,
  render: (ctx) => html`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${label}</title>
<meta name="robots" content="noindex"><link rel="canonical" href="${SITE.url}/${to}">
<meta http-equiv="refresh" content="0; url=${ctx.u(to)}"></head>
<body><p>This page moved to <a href="${ctx.u(to)}">${label}</a>.</p></body></html>`,
}));
