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

const INK = '#0E0E0C', YELLOW = '#F5B800', BONE = '#F2EEE5';
const fontCss = `
@font-face{font-family:Archivo;src:url(${pathToFileURL(join(ROOT, 'src/assets/fonts/archivo-100-900-latin.woff2'))}) format('woff2');font-weight:100 900;font-stretch:62% 125%}
@font-face{font-family:Plex;src:url(${pathToFileURL(join(ROOT, 'src/assets/fonts/ibmplexmono-500-latin.woff2'))}) format('woff2');font-weight:500}
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

// Horizontal lockups.
const lockup = (fg, bg) => `<div style="display:flex;align-items:center;gap:26px;padding:40px 48px;background:${bg};color:${fg};width:max-content">
  <div style="width:112px;height:112px">${markSvg().replace('<svg ', '<svg width="112" height="112" ')}</div>
  <div><div style="font:860 92px/0.86 Archivo;font-stretch:70%;text-transform:uppercase;letter-spacing:.01em">Uresco</div>
  <div style="font:500 19px Plex;letter-spacing:.21em;text-transform:uppercase;margin-top:10px;opacity:.75">Construction Materials</div></div></div>`;
await shot('uresco-lockup-dark.png', 640, 192, lockup(BONE, INK));
await shot('uresco-lockup-light.png', 640, 192, lockup(INK, BONE));

// Social card.
const photo = pathToFileURL(join(ROOT, 'src/assets/img/hero-truck-denali-1600.webp'));
await shot('og.jpg', 1200, 630, `
<div style="position:relative;width:1200px;height:630px;background:${INK};color:${BONE};overflow:hidden;font-family:Archivo">
  <img src="${photo}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:60% 50%">
  <div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(14,14,12,.95) 0%,rgba(14,14,12,.8) 45%,rgba(14,14,12,.15) 100%)"></div>
  <div style="position:absolute;left:72px;top:64px;display:flex;align-items:center;gap:16px">
    <div style="width:64px;height:64px">${markSvg().replace('<svg ', '<svg width="64" height="64" ')}</div>
    <div><div style="font:860 46px/0.86 Archivo;font-stretch:70%;text-transform:uppercase">Uresco</div>
    <div style="font:500 12px Plex;letter-spacing:.21em;text-transform:uppercase;margin-top:6px;opacity:.75">Construction Materials</div></div>
  </div>
  <div style="position:absolute;left:72px;bottom:72px;right:400px">
    <div style="font:850 108px/0.9 Archivo;font-stretch:68%;text-transform:uppercase;letter-spacing:-.01em">From Puget Sound to the <span style="color:${YELLOW}">North Slope.</span></div>
    <div style="font:500 17px Plex;letter-spacing:.18em;text-transform:uppercase;margin-top:28px;color:${YELLOW}">Kent · Anchorage · Fairbanks</div>
  </div>
</div>`);

await browser.close();
console.log('Brand files written to src/assets/brand/');
