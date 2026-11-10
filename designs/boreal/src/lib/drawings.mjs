import { raw } from './html.mjs';
import { FIGURES } from './journey.mjs';

// Line drawings: one language for the whole site, styled by .fig and .glyph in 30-components.css.
//   .l  line   .f  filled panel   .y  yellow line   .yf  yellow fill   .d  dim line   .w  heavier line
//   .k  ink line on yellow   .t  small mono text   .tx  body text   .tk  ink text on yellow   .bar  grey bar
//
// FIGURES (the five journey drawings on a 560 × 360 canvas) live in journey.mjs with the home page
// that animates them. Anything else that draws in this language lives here.

export { FIGURES };

// A journey figure as a plain drawing, with the shared .fig class and whatever else the page needs.
export const asFig = (svg, cls = '') => String(svg).replace(/class="fig( jfig)?"/, `class="fig${cls ? ' ' + cls : ''}"`);
// The drawing's contents without its <svg> wrapper, for composing two drawings on one canvas.
export const figBody = (svg) => String(svg).replace(/^\s*<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');

// Design services: a floor-framing layout, with the beam picked out.
export const FLOOR_FRAMING = `<svg class="fig" viewBox="0 0 560 360" aria-hidden="true" focusable="false">
<rect class="f d" x="86" y="46" width="368" height="284" rx="14" transform="rotate(-4 270 188)"/>
<rect class="f" x="96" y="36" width="368" height="288" rx="14"/>
<text class="t" x="122" y="70">FLOOR FRAMING</text><path class="d" d="M122 84h316"/>
<path class="d" d="M146 106h268M146 100v12M414 100v12"/>
<path class="d" d="${[170, 194, 218, 242, 266, 290, 314].map((x) => `M${x} 126v166`).join('')}${[354, 378, 402].map((x) => `M${x} 126v88`).join('')}"/>
<path class="l w" d="M146 126h268v88h-84v78H146z"/>
<path class="y w" d="M146 209h184"/>
<circle class="yf" cx="146" cy="209" r="5.5"/><circle class="yf" cx="238" cy="209" r="5.5"/><circle class="yf" cx="330" cy="209" r="5.5"/>
<path class="d" d="M334 214c18 6 30 16 36 32"/>
<rect class="yf" x="346" y="248" width="88" height="32" rx="8"/><text class="tk" x="390" y="269" text-anchor="middle">GLULAM</text>
</svg>`;

// Job-site delivery: a boom truck sets a bundle in place.
export const BOOM_TRUCK = `<svg class="fig" viewBox="0 0 560 360" aria-hidden="true" focusable="false">
<path class="l w" d="M24 300h512"/>
<path class="d" d="M70 182v118M96 182v118M122 182v118M148 182v118M174 182v118"/>
<path class="l" d="M48 182v118M198 182v118"/>
<path class="l w" d="M36 182h174"/>
<path class="l" d="M48 182v-76h52v76"/><path class="d" d="M66 182v-76M84 182v-76M40 106h68"/>
<path class="y" d="M160 158v14m-6-6 6 6 6-6"/>
<rect class="f" x="118" y="126" width="84" height="26" rx="3"/><path class="y w" d="M138 126v26M182 126v26"/><path class="d" d="M128 139h64"/>
<path class="l" d="M160 80v26M160 106l-30 20M160 106l30 20"/>
<path class="f" d="M250 244h194v14H250z"/><path class="l w" d="M250 262h268"/>
<path class="f" d="M448 262v-68h46l36 36v32z"/><path class="d" d="M460 206h30l26 26h-56z"/>
<circle class="f" cx="296" cy="282" r="18"/><circle class="f" cx="338" cy="282" r="18"/><circle class="f" cx="492" cy="282" r="18"/><circle class="d" cx="296" cy="282" r="6"/><circle class="d" cx="338" cy="282" r="6"/><circle class="d" cx="492" cy="282" r="6"/>
<rect class="f" x="262" y="212" width="84" height="32" rx="3"/><rect class="f" x="350" y="212" width="74" height="32" rx="3"/><rect class="f" x="274" y="186" width="72" height="26" rx="3"/>
<path class="y" d="M284 212v32M324 212v32M370 212v32M404 212v32M294 186v26M326 186v26"/>
<path class="l w" d="M434 244v-70"/><path class="d" d="M422 244h24"/>
<path class="l w" d="M434 174 330 72"/><path class="l w" d="M330 72 160 80"/><circle class="f" cx="330" cy="72" r="8"/><circle class="f" cx="434" cy="174" r="7"/>
<path class="d" d="M420 208 372 116"/>
<path class="d" d="M260 262v38m-12 0h24M426 262v38m-12 0h24"/>
<path class="d" d="M214 139h22"/>
<rect class="yf" x="236" y="124" width="116" height="30" rx="8"/><text class="tk" x="294" y="144" text-anchor="middle">SET IN PLACE</text>
</svg>`;

// Job-site delivery: a truck-mounted Moffett forklift carries a bundle across the site.
export const MOFFETT_TRUCK = `<svg class="fig" viewBox="0 0 560 360" aria-hidden="true" focusable="false">
<path class="l w" d="M24 300h512"/>
<path class="d" d="M56 322h42M126 332h70M226 322h48M338 332h76M446 322h50" stroke-dasharray="14 10"/>
<path class="f" d="M34 262v-46l30-34h44v80z"/><path class="d" d="M46 228l22-24h30v24z"/>
<path class="f" d="M112 244h172v14H112z"/><path class="l w" d="M34 262h262"/>
<circle class="f" cx="66" cy="282" r="18"/><circle class="f" cx="212" cy="282" r="18"/><circle class="f" cx="254" cy="282" r="18"/><circle class="d" cx="66" cy="282" r="6"/><circle class="d" cx="212" cy="282" r="6"/><circle class="d" cx="254" cy="282" r="6"/>
<rect class="f" x="122" y="212" width="78" height="32" rx="3"/><rect class="f" x="204" y="212" width="72" height="32" rx="3"/>
<path class="y" d="M142 212v32M182 212v32M224 212v32M258 212v32"/>
<path class="d" d="M284 244h18v42M302 258h-18"/>
<path class="f" d="M332 288v-30q0-10 10-10h42v-8h20v48z"/>
<path class="l w" d="M384 240v-66M436 262v-88"/><path class="l w" d="M376 174h66"/>
<path class="d" d="M396 240v-22h14M410 262l14-20"/>
<path class="l" d="M404 288h32v-22"/>
<path class="l w" d="M444 132v168"/><path class="d" d="M454 132v168M444 132h10"/>
<circle class="f" cx="352" cy="286" r="14"/><circle class="f" cx="420" cy="286" r="14"/><circle class="d" cx="352" cy="286" r="5"/><circle class="d" cx="420" cy="286" r="5"/>
<path class="l w" d="M454 262h72"/>
<rect class="f" x="458" y="226" width="72" height="36" rx="3"/><path class="y w" d="M476 226v36M512 226v36"/><path class="d" d="M466 244h56"/>
<path class="y" d="M322 322h168" stroke-dasharray="7 9"/><path class="y" d="m486 311 13 11-13 11"/>
<path class="d" d="M400 174v-34"/>
<rect class="yf" x="322" y="110" width="156" height="30" rx="8"/><text class="tk" x="400" y="130" text-anchor="middle">ACROSS THE SITE</text>
</svg>`;

// The nine product lines as small drawings, on a 48-unit grid: what the line is, in the fewest strokes.
// Each has one yellow stroke, the part that says which line it is. Keyed by the line's slug.
const GLYPHS = {
  // A stud wall on its plates, with the let-in brace picked out.
  'framing-lumber': '<path class="l" d="M5 9h38M5 13h38M5 39h38M9 13v26M19 13v26M29 13v26M39 13v26"/><path class="y" d="M9 39 39 13"/>',
  // A stack of panels seen from the corner, the top sheet picked out.
  'panels-sheathing': '<path class="l" d="M7 25v5l17 9 17-9v-5M7 31v5l17 9 17-9v-5"/><path class="y" d="M7 22 24 13l17 9-17 9z"/><path class="d" d="m13.5 22.5 9-4.8M19 25.3l10-5.3M24.8 28l9-4.8"/>',
  // A roof truss: chords in line, the web picked out.
  'engineered-wood': '<path class="l" d="M3 36h42M3 36 24 12l21 24"/><path class="y" d="M24 12v24M13.5 24 24 36l10.5-12"/>',
  // A wall form in section: two panels, the ties through them, the brace and the footing.
  'concrete-forming': '<path class="l" d="M14 6v34M19 6v34M29 6v34M34 6v34M14 6h5M29 6h5M6 42h36"/><path class="y" d="M9 15h30M9 30h30"/><path class="d" d="M14 12 5 26M34 12l9 14"/>',
  // Fence pickets on a rail.
  'cedar-decking': '<path class="l" d="M8 42V13l4-5 4 5v29M20 42V13l4-5 4 5v29M32 42V13l4-5 4 5v29M5 42h38"/><path class="y" d="M5 20h38M5 33h38"/>',
  // A gable in lap siding, the roof picked out.
  'siding-exterior': '<path class="l" d="M9 22v20h30V22"/><path class="d" d="M9 27h30M9 32h30M9 37h30"/><path class="y" d="M4 25 24 7l20 18"/>',
  // A batt between two studs: the insulation draftsman's loop.
  'insulation-drywall': '<path class="l" d="M7 5v38M12 5v38M36 5v38M41 5v38"/><path class="y" d="M15 10h15a3.5 3.5 0 0 1 0 7H18a3.5 3.5 0 0 0 0 7h12a3.5 3.5 0 0 1 0 7H18a3.5 3.5 0 0 0 0 7h15"/>',
  // A window with a sill.
  'windows-doors-cabinets': '<path class="l" d="M10 6h28v32H10zM24 6v32M10 22h28"/><path class="y" d="M6 42h36"/><path class="d" d="m14 11 6 6M28 11l6 6"/>',
  // A construction screw.
  'hardware-supplies': '<path class="l" d="M16 7h16l-2 6H18zM22 13v24l2 6 2-6V13"/><path class="y" d="m17 19 14 3M17 25l14 3M18 31l12 2.6"/>',
};

// A line's drawing on a dark tile. Decorative: the line's name is always next to it.
export const glyph = (slug, cls = '') => raw(`<span class="glyph${cls ? ' ' + cls : ''}" aria-hidden="true"><svg viewBox="0 0 48 48" focusable="false">${GLYPHS[slug] || GLYPHS['framing-lumber']}</svg></span>`);
