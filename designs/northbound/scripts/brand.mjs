// Renders the brand files into src/assets/brand/: logo SVGs, PNG icons and the social card.
//   node scripts/brand.mjs        (needs Playwright + Chromium; see README)
import { writeFileSync, mkdirSync, existsSync } from 'fs';
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

// Northbound's palette and type: see the tokens in src/assets/css/00-tokens.css.
const BLACK = '#0E0E0C', INK = '#12201B', INK3 = '#59645E', YELLOW = '#F5B800', PAPER = '#F4EFE6', GLACIER = '#A9C6C8';
const font = (f) => pathToFileURL(join(ROOT, 'src/assets/fonts', f));
const fontCss = `
@font-face{font-family:Fraunces;src:url(${font('fraunces-var.woff2')}) format('woff2');font-weight:300 560;font-style:normal}
@font-face{font-family:Fraunces;src:url(${font('fraunces-italic-var.woff2')}) format('woff2');font-weight:300 500;font-style:italic}
@font-face{font-family:'DM Mono';src:url(${font('dm-mono-400.woff2')}) format('woff2');font-weight:400}
*{margin:0;box-sizing:border-box}`;

// Vector files for print, signage and anyone who needs the logo.
writeFileSync(join(OUT, 'uresco-mark.svg'), markSvg());
writeFileSync(join(OUT, 'uresco-mark-small.svg'), markSvg({ rings: [11, 22], w: 8 }));
writeFileSync(join(OUT, 'uresco-mark-ink.svg'), markSvg({ tile: BLACK, ink: YELLOW }));

const pinned = process.env.CHROMIUM || (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : '');
const browser = await chromium.launch(pinned ? { executablePath: pinned } : {});
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

// Horizontal lockups: the mark, the wordmark in the display serif, the descriptor in mono.
const word = (fg, size, sub) => `<div style="color:${fg}"><div style="font:560 ${size}px/0.9 Fraunces;letter-spacing:-.03em">Uresco</div>
  <div style="font:400 ${sub}px 'DM Mono';letter-spacing:.14em;text-transform:uppercase;margin-top:${Math.round(sub * 0.7)}px;opacity:.72">Construction Materials</div></div>`;
const lockup = (fg, bg) => `<div style="display:flex;align-items:center;gap:26px;padding:40px 48px;background:${bg};width:max-content">
  <div style="width:112px;height:112px">${markSvg().replace('<svg ', '<svg width="112" height="112" ')}</div>
  ${word(fg, 96, 18)}</div>`;
await shot('uresco-lockup-dark.png', 640, 192, lockup(PAPER, BLACK));
await shot('uresco-lockup-light.png', 640, 192, lockup(INK, PAPER));

// Social card: the home page's cover in one frame. Type on paper, the fog of the photograph
// dissolving into it, and the three yards by latitude along the foot.
const photo = pathToFileURL(join(ROOT, 'src/assets/img/valdez-pier-1920.webp'));
const yard = (lat, city) => `<span style="display:inline-flex;gap:12px"><span style="color:${INK3}">${lat}</span><span>${city}</span></span>`;
await shot('og.jpg', 1200, 630, `
<div style="position:relative;width:1200px;height:630px;background:${PAPER};color:${INK};overflow:hidden">
  <img src="${photo}" style="position:absolute;right:0;top:0;width:690px;height:630px;object-fit:cover;object-position:58% 72%">
  <div style="position:absolute;inset:0;background:linear-gradient(90deg,${PAPER} 47%,rgba(244,239,230,.86) 54%,rgba(244,239,230,.42) 63%,rgba(244,239,230,0) 76%),linear-gradient(180deg,${PAPER} 0%,rgba(244,239,230,.45) 12%,rgba(244,239,230,0) 30%)"></div>
  <div style="position:absolute;left:64px;top:56px;display:flex;align-items:center;gap:16px">
    <div style="width:60px;height:60px">${markSvg().replace('<svg ', '<svg width="60" height="60" ')}</div>
    ${word(INK, 44, 11)}
  </div>
  <div style="position:absolute;left:64px;top:186px;width:760px">
    <div style="display:flex;align-items:center;gap:12px;font:400 15px 'DM Mono';letter-spacing:.12em;text-transform:uppercase"><span style="width:12px;height:12px;background:${YELLOW}"></span>Wholesale building materials</div>
    <div style="font:350 106px/.98 Fraunces;letter-spacing:-.035em;margin-top:26px">Down the road,<br>or <em style="font-style:italic;font-weight:330">across</em><br><em style="font-style:italic;font-weight:330">an ocean.</em></div>
  </div>
  <div style="position:absolute;left:0;right:0;bottom:0;display:flex;justify-content:space-between;align-items:center;height:62px;padding:0 64px;border-top:1px solid ${INK};font:400 15px 'DM Mono';letter-spacing:.06em;text-transform:uppercase;background:${PAPER}">
    ${yard('47.4°N', 'Kent')}${yard('61.2°N', 'Anchorage')}${yard('64.8°N', 'Fairbanks')}
    <span style="color:${INK3}">For more than 35 years</span>
  </div>
</div>`);

await browser.close();
console.log('Brand files written to src/assets/brand/');
