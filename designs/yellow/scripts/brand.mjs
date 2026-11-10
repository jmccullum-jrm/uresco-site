// Renders the brand files into src/assets/brand/: logo SVGs, PNG icons and the social card.
//   node scripts/brand.mjs        (needs Playwright + Chromium; see README)
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { createRequire } from 'module';
import { markSvg } from '../src/lib/icons.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'src/assets/brand');
mkdirSync(OUT, { recursive: true });

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const INK = '#0E0E0C', YELLOW = '#F5B800', DEEP = '#E5A900', PAPER = '#F7F3EA';
const fontCss = `
@font-face{font-family:Archivo;src:url(${pathToFileURL(join(ROOT, 'src/assets/fonts/archivo-wide-var.woff2'))}) format('woff2');font-weight:400 900;font-stretch:100% 125%}
*{margin:0;box-sizing:border-box}`;
const WIDE = 'font-family:Archivo;font-weight:900;font-stretch:125%;text-transform:uppercase;letter-spacing:-.022em';
const LABEL = 'font-family:Archivo;font-weight:750;font-stretch:125%;text-transform:uppercase;letter-spacing:.075em';

// Vector files for print, signage and anyone who needs the logo.
writeFileSync(join(OUT, 'uresco-mark.svg'), markSvg());
writeFileSync(join(OUT, 'uresco-mark-small.svg'), markSvg({ rings: [11, 22], w: 8 }));
writeFileSync(join(OUT, 'uresco-mark-ink.svg'), markSvg({ tile: INK, ink: YELLOW }));

const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : { executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage();
const shot = async (file, w, h, body, css = '') => {
  await page.setViewportSize({ width: w, height: h });
  // Rendered from a file so the page may load the local fonts and photo.
  const tmp = join(ROOT, 'tests', '.out', 'brand.html');
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

// Horizontal lockups: the mark beside the wide wordmark, as in the masthead.
const lockup = (fg, bg, mark) => `<div style="display:flex;align-items:center;gap:24px;padding:40px 48px;background:${bg};color:${fg};width:max-content">
  <div style="width:112px;height:112px">${mark.replace('<svg ', '<svg width="112" height="112" ')}</div>
  <div><div style="${WIDE};font-size:78px;line-height:.86">Uresco</div>
  <div style="${LABEL};font-size:16.5px;margin-top:12px">Construction Materials</div></div></div>`;
await shot('uresco-lockup-dark.png', 760, 192, lockup(PAPER, INK, markSvg()));
await shot('uresco-lockup-light.png', 760, 192, lockup(INK, YELLOW, markSvg({ tile: INK, ink: YELLOW })));

// Social card: the home page poster.
const photo = pathToFileURL(join(ROOT, 'src/assets/img/hero-truck-denali-p-960.webp'));
const ring = (n) => `<i style="position:absolute;inset:0 ${-n * 52}px ${-n * 52}px;border:24px solid ${DEEP};border-top:0;border-radius:0 0 999px 999px"></i>`;
await shot('og.jpg', 1200, 630, `
<div style="position:relative;width:1200px;height:630px;background:${YELLOW};color:${INK};overflow:hidden;font-family:Archivo">
  <div style="position:absolute;right:86px;top:0;width:330px;height:500px">
    ${[1, 2, 3, 4].map(ring).join('')}
    <div style="position:absolute;inset:0;border-radius:0 0 999px 999px;overflow:hidden;background:${INK}"><img src="${photo}" style="width:100%;height:100%;object-fit:cover;filter:grayscale(1) contrast(1.12)"></div>
  </div>
  <div style="position:absolute;left:64px;top:56px;display:flex;align-items:center;gap:16px">
    <div style="width:64px;height:64px">${markSvg({ tile: INK, ink: YELLOW }).replace('<svg ', '<svg width="64" height="64" ')}</div>
    <div><div style="${WIDE};font-size:40px;line-height:.86">Uresco</div>
    <div style="${LABEL};font-size:10.5px;margin-top:7px">Construction Materials</div></div>
  </div>
  <div style="position:absolute;left:60px;bottom:118px;${WIDE};font-size:122px;line-height:.84;letter-spacing:-.028em;white-space:nowrap">Lumber<br>by UCM.</div>
  <div style="position:absolute;left:64px;bottom:58px;${LABEL};font-size:19px">Kent / Anchorage / Fairbanks</div>
</div>`);

await browser.close();
console.log('Brand files written to src/assets/brand/');
