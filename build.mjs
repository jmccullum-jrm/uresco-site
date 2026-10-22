// Builds the static site from src/ into docs/ (what GitHub Pages, or any static host, serves).
//   node build.mjs
// Pages are modules in src/pages that export { path, render(ctx) } or an array of them.
// Every link is written relative to the page, so the same output works on
// jmccullum-jrm.github.io/uresco-site/, on uresco.com, or from a local server.
import { readdirSync, mkdirSync, writeFileSync, rmSync, cpSync, existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { createHash } from 'crypto';
import { SITE } from './src/config.mjs';
import { markSvg } from './src/lib/icons.mjs';
import { mapSvg } from './src/lib/components.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, 'docs');
const SRC = join(ROOT, 'src');

// Cache-busting token for CSS and JS: changes whenever either file does.
const version = createHash('sha1')
  .update(readFileSync(join(SRC, 'assets/css/site.css')))
  .update(readFileSync(join(SRC, 'assets/js/site.js')))
  .digest('hex').slice(0, 8);

const makeCtx = (path) => {
  let n = 0;
  const depth = path.split('/').filter(Boolean).length;
  return {
    path,
    version,
    base: SITE.base,
    u: (to) => ('../'.repeat(depth) + to) || './',
    uid: () => ++n,
  };
};

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
cpSync(join(SRC, 'assets'), join(OUT, 'assets'), { recursive: true });
writeFileSync(join(OUT, 'assets', 'map.svg'), mapSvg());
// Light minification of the shipped CSS and JS (sources stay readable in src/).
const minCss = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{};,>])\s*/g, '$1').replace(/;}/g, '}').trim();
const minJs = (js) => js.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('//')).join('\n');
writeFileSync(join(OUT, 'assets/css/site.css'), minCss(readFileSync(join(SRC, 'assets/css/site.css'), 'utf8')));
writeFileSync(join(OUT, 'assets/js/site.js'), minJs(readFileSync(join(SRC, 'assets/js/site.js'), 'utf8')));

const pages = [];
for (const file of readdirSync(join(SRC, 'pages')).filter((f) => f.endsWith('.mjs')).sort()) {
  const mod = (await import(pathToFileURL(join(SRC, 'pages', file)))).default;
  pages.push(...(Array.isArray(mod) ? mod : [mod]));
}

for (const page of pages) {
  const ctx = makeCtx(page.path);
  const out = String(page.render(ctx));
  const file = page.file ? join(OUT, page.file) : join(OUT, page.path, 'index.html');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, out);
}

// Icons and manifest. PNG icons are rendered by scripts/brand.mjs into src/assets/brand
// and copied to the root here, where browsers look for them.
writeFileSync(join(OUT, 'favicon.svg'), markSvg({ rings: [11, 22], w: 8 }));
for (const [name, to] of [['favicon-32.png', 'favicon-32.png'], ['apple-touch-icon.png', 'apple-touch-icon.png'], ['icon-192.png', 'icon-192.png'], ['icon-512.png', 'icon-512.png']]) {
  const from = join(SRC, 'assets/brand', name);
  if (existsSync(from)) cpSync(from, join(OUT, to));
}
writeFileSync(join(OUT, 'site.webmanifest'), JSON.stringify({
  name: SITE.name, short_name: SITE.short, start_url: './', scope: './', display: 'standalone',
  background_color: '#0E0E0C', theme_color: '#0E0E0C',
  icons: [
    { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
}, null, 2));

// Search engines: blocked entirely while the site is a preview.
const listed = pages.filter((p) => !p.file && !p.redirect);
writeFileSync(join(OUT, 'robots.txt'), SITE.preview
  ? 'User-agent: *\nDisallow: /\n'
  : `User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap.xml\n`);
writeFileSync(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${listed.map((p) => `  <url><loc>${SITE.url}/${p.path}</loc></url>`).join('\n')}
</urlset>
`);
// The live build also tells GitHub Pages which domain it serves.
if (!SITE.preview) writeFileSync(join(OUT, 'CNAME'), new URL(SITE.url).host + '\n');
// GitHub Pages runs Jekyll unless told not to; we ship finished HTML.
writeFileSync(join(OUT, '.nojekyll'), '');

console.log(`Built ${pages.length} pages into docs/ (assets v${version})${SITE.preview ? ' — PREVIEW: noindex' : ''}`);
