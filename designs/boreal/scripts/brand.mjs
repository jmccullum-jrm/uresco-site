// Renders the brand files into src/assets/brand/: logo SVGs, PNG icons and the social card.
//   node scripts/brand.mjs        (needs Playwright + Chromium; see README)
import { writeFileSync, mkdirSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { createRequire } from 'module';
import { markSvg } from '../src/lib/icons.mjs';
import { mapSvg } from '../src/lib/components.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'src/assets/brand');
mkdirSync(OUT, { recursive: true });
const MAP = JSON.parse(readFileSync(join(ROOT, 'src/data/map.json'), 'utf8'));

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

// Boreal: the black and yellow of the mark, Geist for the words and Geist Mono for labels.
const INK = '#0E0E0C', YELLOW = '#F5B800', SNOW = '#F4F6F6', HAZE = '#A9B3B3', SLATE = '#51636A', FROST = '#E3E7E6';
const fontCss = `
@font-face{font-family:Geist;src:url(${pathToFileURL(join(ROOT, 'src/assets/fonts/geist-var.woff2'))}) format('woff2');font-weight:400 700}
@font-face{font-family:'Geist Mono';src:url(${pathToFileURL(join(ROOT, 'src/assets/fonts/geistmono-var.woff2'))}) format('woff2');font-weight:400 600}
*{margin:0;box-sizing:border-box}`;

// Vector files for print, signage and anyone who needs the logo.
writeFileSync(join(OUT, 'uresco-mark.svg'), markSvg());
writeFileSync(join(OUT, 'uresco-mark-small.svg'), markSvg({ rings: [11, 22], w: 8 }));
writeFileSync(join(OUT, 'uresco-mark-ink.svg'), markSvg({ tile: INK, ink: YELLOW }));

const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : { executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage();
const shot = async (file, w, h, body, css = '') => {
  await page.setViewportSize({ width: w, height: h });
  // Rendered from a file so the page may load the local fonts and photo.
  const tmp = join(ROOT, '.cache', 'brand.html');
  mkdirSync(dirname(tmp), { recursive: true });
  writeFileSync(tmp, `<!doctype html><html><head><meta charset="utf-8"><style>${fontCss}${css}</style></head><body>${body}</body></html>`);
  await page.goto(pathToFileURL(tmp).href, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  // Capture the drawing itself, not the viewport around it.
  await page.locator('body > *').first().screenshot({ path: join(OUT, file), omitBackground: true, ...(file.endsWith('.jpg') ? { type: 'jpeg', quality: 86 } : {}) });
};

// Icons: full-bleed tile (iOS and Android mask it themselves), small-size mark under 64px.
const icon = (size, small) => `<div style="width:${size}px;height:${size}px;background:${YELLOW}">${markSvg({ rings: small ? [11, 22] : [10, 19, 28], w: small ? 8 : 5.5 }).replace('<svg ', `<svg width="${size}" height="${size}" `).replace(/rx="8"/g, 'rx="0"')}</div>`;
await shot('favicon-32.png', 32, 32, icon(32, true));
await shot('apple-touch-icon.png', 180, 180, icon(180));
await shot('icon-192.png', 192, 192, icon(192));
await shot('icon-512.png', 512, 512, icon(512));
await shot('uresco-mark-512.png', 512, 512, `<div style="width:512px;height:512px">${markSvg().replace('<svg ', '<svg width="512" height="512" ')}</div>`, 'body{background:transparent}');

// Horizontal lockups: the masthead's, at print size.
const lockup = (fg, sub, bg) => `<div style="display:flex;align-items:center;gap:26px;padding:40px 52px 40px 44px;background:${bg};color:${fg};width:max-content;font-family:Geist">
  <div style="width:112px;height:112px">${markSvg().replace('<svg ', '<svg width="112" height="112" ')}</div>
  <div><div style="font-weight:600;font-size:80px;line-height:.9;letter-spacing:-.035em">Uresco</div>
  <div style="font-weight:500;font-size:32px;line-height:1;letter-spacing:-.005em;margin-top:14px;color:${sub}">Construction Materials</div></div></div>`;
await shot('uresco-lockup-dark.png', 640, 192, lockup('#FFFFFF', HAZE, INK));
await shot('uresco-lockup-light.png', 640, 192, lockup(INK, SLATE, SNOW));

// Social card: the map, the freight lane, three yards, and the company's own line.
const yard = ([x, y]) => `<circle cx="${x}" cy="${y}" r="17" fill="${INK}"/><circle cx="${x}" cy="${y}" r="13" fill="none" stroke="${YELLOW}" stroke-opacity=".55" stroke-width="2"/><circle cx="${x}" cy="${y}" r="9" fill="${YELLOW}"/>`;
await shot('og.jpg', 1200, 630, `
<div style="position:relative;width:1200px;height:630px;background:${INK};color:#fff;overflow:hidden;font-family:Geist">
  <div style="position:absolute;inset:0;background:radial-gradient(52% 60% at 66% -6%,rgba(227,231,230,.12),transparent 72%)"></div>
  <div style="position:absolute;left:-250px;top:-100px;width:1460px;height:811px">
    ${mapSvg().replace('<svg ', '<svg style="position:absolute;inset:0;width:100%;height:100%" ').replace(/width="1800" height="1000"/, '')}
    <svg viewBox="0 0 ${MAP.width} ${MAP.height}" style="position:absolute;inset:0;width:100%;height:100%" fill="none" stroke-linecap="round">
      <path d="${MAP.sea}" stroke="${YELLOW}" stroke-width="5"/>
      ${MAP.yards.map((y) => yard(y.xy)).join('')}
    </svg>
  </div>
  <div style="position:absolute;inset:0;background:linear-gradient(90deg,${INK} 20%,rgba(14,14,12,.82) 50%,rgba(14,14,12,0) 72%)"></div>
  <div style="position:absolute;left:72px;top:60px;display:flex;align-items:center;gap:16px">
    <div style="width:64px;height:64px">${markSvg().replace('<svg ', '<svg width="64" height="64" ')}</div>
    <div><div style="font-weight:600;font-size:40px;line-height:1;letter-spacing:-.035em">Uresco</div>
    <div style="font-weight:500;font-size:19px;line-height:1;margin-top:6px;color:${HAZE}">Construction Materials</div></div>
  </div>
  <div style="position:absolute;left:72px;bottom:66px;width:820px">
    <div style="font-weight:500;font-size:80px;line-height:1.02;letter-spacing:-.04em">Down the road,<br><span style="color:${HAZE}">or across an ocean.</span></div>
    <div style="display:flex;align-items:center;gap:12px;font-family:'Geist Mono';font-weight:500;font-size:19px;letter-spacing:.06em;text-transform:uppercase;margin-top:30px;color:${FROST}"><span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:${YELLOW}"></span>Kent · Anchorage · Fairbanks</div>
  </div>
</div>`);

await browser.close();
console.log('Brand files written to src/assets/brand/');
