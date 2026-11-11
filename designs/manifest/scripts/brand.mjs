// Renders the brand files into src/assets/brand/: logo SVGs, PNG icons and the social card.
//   node scripts/brand.mjs        (needs Playwright + Chromium; see README)
import { writeFileSync, mkdirSync, mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { dirname, join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { createRequire } from 'module';
import { markSvg } from '../src/lib/icons.mjs';
import { LOCATIONS } from '../src/data/locations.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'src/assets/brand');
mkdirSync(OUT, { recursive: true });

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const INK = '#121311', YELLOW = '#F5B800', PAPER = '#F3F1EA', BLUE = '#1F45C2';
const fontCss = `
@font-face{font-family:Geist;src:url(${pathToFileURL(join(ROOT, 'src/assets/fonts/geist-var.woff2'))}) format('woff2');font-weight:400 700}
@font-face{font-family:Mono;src:url(${pathToFileURL(join(ROOT, 'src/assets/fonts/geistmono-var.woff2'))}) format('woff2');font-weight:400 600}
*{margin:0;box-sizing:border-box}`;
const TMP = join(mkdtempSync(join(tmpdir(), 'uresco-brand-')), 'brand.html');

// Vector files for print, signage and anyone who needs the logo.
writeFileSync(join(OUT, 'uresco-mark.svg'), markSvg());
writeFileSync(join(OUT, 'uresco-mark-small.svg'), markSvg({ rings: [11, 22], w: 8 }));
writeFileSync(join(OUT, 'uresco-mark-ink.svg'), markSvg({ tile: INK, ink: YELLOW }));

const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : { executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage();
const shot = async (file, w, h, body, css = '') => {
  await page.setViewportSize({ width: w, height: h });
  // Rendered from a file so the page may load the local fonts and photo.
  const tmp = TMP;
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

// Horizontal lockups: the mark, the name in Geist, the descriptor in mono.
const lockup = (fg, bg) => `<div style="display:flex;align-items:center;gap:24px;padding:40px 48px;background:${bg};color:${fg};width:max-content">
  <div style="width:112px;height:112px">${markSvg().replace('<svg ', '<svg width="112" height="112" ')}</div>
  <div><div style="font:700 84px/0.9 Geist;letter-spacing:-.045em">Uresco</div>
  <div style="font:500 18px Mono;letter-spacing:.1em;text-transform:uppercase;margin-top:12px;opacity:.75">Construction Materials</div></div></div>`;
await shot('uresco-lockup-dark.png', 640, 192, lockup(PAPER, INK));
await shot('uresco-lockup-light.png', 640, 192, lockup(INK, PAPER));

// Social card: the home headline on drafting paper, with the three yards on an ink strip.
const yards = LOCATIONS.map((l) => [l.city, l.phone]);
await shot('og.jpg', 1200, 630, `
<div style="position:relative;width:1200px;height:630px;background:${PAPER};color:${INK};overflow:hidden;font-family:Geist">
  <div style="position:absolute;inset:0;background:linear-gradient(to right,rgba(18,19,17,.07) 1px,transparent 1px) 72px 0/88px 100%"></div>
  <div style="position:absolute;left:72px;right:72px;top:56px;display:flex;align-items:center;justify-content:space-between;padding-bottom:22px;border-bottom:1.5px solid ${INK}">
    <div style="display:flex;align-items:center;gap:16px">
      <div style="width:60px;height:60px">${markSvg().replace('<svg ', '<svg width="60" height="60" ')}</div>
      <div><div style="font:700 40px/0.9 Geist;letter-spacing:-.045em">Uresco</div>
      <div style="font:500 12px Mono;letter-spacing:.1em;text-transform:uppercase;margin-top:6px;color:#62645D">Construction Materials</div></div>
    </div>
    <div style="font:500 14px Mono;letter-spacing:.08em;text-transform:uppercase;color:#62645D">Quality Materials, Trusted Service.</div>
  </div>
  <div style="position:absolute;left:72px;top:190px;right:72px;font:600 118px/0.94 Geist;letter-spacing:-.045em">The whole building,<br>on <span style="background:linear-gradient(transparent 0 58%,${YELLOW} 58% 93%,transparent 93%);padding:0 8px;margin:0 -8px">one manifest.</span></div>
  <div style="position:absolute;left:72px;top:446px;font:500 15px Mono;letter-spacing:.07em;text-transform:uppercase;color:${BLUE}">Lumber and complete building packages · 47.4° N to 71.3° N</div>
  <div style="position:absolute;left:0;right:0;bottom:0;height:112px;background:${INK};color:${PAPER};display:flex;align-items:center;gap:56px;padding:0 72px">
    ${yards.map(([c, n]) => `<div><div style="font:500 13px Mono;letter-spacing:.1em;text-transform:uppercase;color:#A3A298">${c}</div><div style="font:600 27px Mono;color:${YELLOW};margin-top:6px">${n}</div></div>`).join('')}
  </div>
</div>`);

await browser.close();
console.log('Brand files written to src/assets/brand/');
