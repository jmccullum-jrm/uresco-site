// Site-wide settings. Everything a non-developer is likely to change lives here or in src/data/.
// For the live site build with: PREVIEW=0 BASE=/ node build.mjs   (or: npm run build:live)

export const SITE = {
  name: 'Uresco Construction Materials',
  short: 'Uresco',
  legal: 'Uresco Construction Materials, Inc.',
  tagline: 'Quality Materials, Trusted Service.',
  // Canonical address of the live site. Used for canonical links, sitemap and social cards.
  url: 'https://www.uresco.com',
  email: 'sales@uresco.com',
  // The path the site is served from. '/uresco-site/' for the GitHub Pages preview;
  // change to '/' when uresco.com points at it. Only the 404 page needs it — every
  // other link is relative.
  base: process.env.BASE || '/uresco-site/',
  years: '35',
  // While true, every page carries noindex and robots.txt blocks crawlers, so the preview
  // copy on github.io never competes with uresco.com in search. Set false at launch.
  preview: process.env.PREVIEW !== '0',
  // Where the quote form posts. Leave empty to fall back to a pre-filled email.
  // Any service that accepts multipart form posts works (Formspree, Basin, Getform…);
  // it must accept file uploads for the plan attachments to come through.
  formEndpoint: '',
};
