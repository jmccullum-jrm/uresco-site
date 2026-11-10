#!/usr/bin/env node
// Builds the design preview into docs/:
//   docs/index.html            the chooser: a bar across the top and a frame showing the chosen design
//   docs/designs/<name>/…      each design in designs/ as a complete, separate site
//
//   node build.mjs                                   all four designs plus the chooser (the GitHub Pages preview)
//   ONLY=yellow node build.mjs                       just that design, straight into docs/, with no chooser
//   ONLY=yellow PREVIEW=0 BASE=/ node build.mjs      the same, built for the live domain
//
// Each design keeps its own build script, sources, checks and notes in designs/<name>/.
// designs/designs.json lists them and names the featured one.

import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const DOCS = join(ROOT, 'docs');
const { featured, designs } = JSON.parse(readFileSync(join(ROOT, 'designs/designs.json'), 'utf8'));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fail = (msg) => { console.error(msg); process.exit(1); };

if (!designs.some((d) => d.key === featured)) fail(`designs.json: featured "${featured}" is not one of the designs`);
for (const d of designs) if (!existsSync(join(ROOT, 'designs', d.key, 'build.mjs'))) fail(`designs/${d.key}/build.mjs is missing`);

// Run one design's own build into `out`. BASE is the path that design is served from (its 404 page needs it).
const buildDesign = (key, out, env = {}) => {
  const r = spawnSync(process.execPath, ['build.mjs'], {
    cwd: join(ROOT, 'designs', key), env: { ...process.env, ...env, OUT: out }, encoding: 'utf8',
  });
  if (r.status !== 0) fail(`designs/${key} failed to build:\n${r.stdout}\n${r.stderr}`);
  console.log(`  ${key}: ${r.stdout.trim().split('\n').pop()}`);
};

rmSync(DOCS, { recursive: true, force: true });
mkdirSync(DOCS, { recursive: true });

// One design on its own: this is how the others are hidden once the owner has picked.
const only = process.env.ONLY;
if (only) {
  if (!designs.some((d) => d.key === only)) fail(`ONLY=${only}: no such design. Choose one of ${designs.map((d) => d.key).join(', ')}`);
  buildDesign(only, DOCS);
  console.log(`Built the ${only} design on its own into docs/ (no chooser).`);
  process.exit(0);
}

// The preview is served from a project folder on GitHub Pages; each design sits two levels below it.
const base = (process.env.BASE || '/uresco-site/').replace(/\/*$/, '/');
for (const d of designs) buildDesign(d.key, join(DOCS, 'designs', d.key), { BASE: `${base}designs/${d.key}/`, PREVIEW: '1' });

// Which pages each design has, so the chooser can keep you on the same page when you switch.
const pagesOf = (dir) => {
  const out = [];
  const walk = (p) => {
    for (const f of readdirSync(p)) {
      const full = join(p, f);
      if (statSync(full).isDirectory()) walk(full);
      else if (f === 'index.html') out.push(relative(dir, p).split('\\').join('/').replace(/(.)$/, '$1/'));
    }
  };
  walk(dir);
  return out.sort();
};
const data = { featured, designs: designs.map((d) => ({ ...d, pages: pagesOf(join(DOCS, 'designs', d.key)) })) };
const feat = data.designs.find((d) => d.key === featured);

const read = (f) => readFileSync(join(ROOT, 'preview', f), 'utf8');
const minCss = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{};,>])\s*/g, '$1').replace(/;}/g, '}').trim();
const ICON = {
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M11 18.5h2"/></svg>',
  out: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
};

const picks = data.designs.map((d, i) => `
        <li><a class="pick" data-key="${d.key}" href="designs/${d.key}/" target="design"${d.key === featured ? ' aria-current="true"' : ''} title="${esc(d.blurb)}"><span class="pick__n" aria-hidden="true">${i + 1}</span><span class="pick__name">${esc(d.name)}</span>${d.key === featured ? '<span class="pick__tag">Featured</span>' : ''}</a></li>`).join('');

const shell = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#0c0c0d">
<title>${esc(feat.name)} · Uresco design preview</title>
<meta name="description" content="Four designs for the new Uresco Construction Materials website. Pick one from the bar at the top.">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<style>[hidden]{display:none!important}${minCss(read('shell.css'))}</style>
</head>
<body>
<a class="skip" href="#frame">Skip to the design</a>
<header class="bar">
  <p class="bar__title"><b>Uresco redesign</b><span>Four designs. Pick one.</span></p>
  <nav aria-label="Choose a design">
    <ul class="picks">${picks}
    </ul>
  </nav>
  <p class="bar__blurb" id="blurb">${esc(feat.blurb)}</p>
  <div class="bar__tools">
    <button class="tool tool--view" id="view" type="button" aria-pressed="false" hidden>${ICON.phone}<span>Phone view</span></button>
    <a class="tool" id="open" href="designs/${featured}/" target="_blank" rel="noopener">${ICON.out}<span>Open without this bar</span></a>
  </div>
</header>
<main class="stage">
  <noscript><p class="noscript">Choosing a design above opens its home page. Turn on JavaScript to stay on the same page when you switch.</p></noscript>
  <iframe id="frame" name="design" title="${esc(feat.name)} design" src="designs/${featured}/"></iframe>
</main>
<script type="application/json" id="designs">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>
<script>${read('shell.js')}</script>
</body>
</html>
`;
writeFileSync(join(DOCS, 'index.html'), shell);

// GitHub Pages serves this one file for every missing address. Inside a design, hand over to that design's own page.
writeFileSync(join(DOCS, '404.html'), `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Page not found · Uresco design preview</title>
<script>(function(){var m=location.pathname.match(/^(.*\\/designs\\/(?:${designs.map((d) => d.key).join('|')})\\/)(?!404\\.html)/);if(m)location.replace(m[1]+'404.html');})();</script>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0c0c0d;color:#ecebe7;font:500 16px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}main{padding:24px;text-align:center}h1{margin:0 0 8px;font-size:28px}a{color:#F5B800}</style>
</head>
<body>
<main>
<h1>Page not found</h1>
<p>That address is not part of the design preview.</p>
<p><a href="${base}">Back to the four designs</a></p>
</main>
</body>
</html>
`);
writeFileSync(join(DOCS, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
writeFileSync(join(DOCS, '.nojekyll'), '');
cpSync(join(DOCS, 'designs', featured, 'favicon.svg'), join(DOCS, 'favicon.svg'));

console.log(`Built the chooser and ${designs.length} designs into docs/ (featured: ${featured}).`);
