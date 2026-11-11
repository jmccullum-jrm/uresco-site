// The nine product lines as bold cut-paper signs, one per line, keyed by the slug in
// data/products.mjs. They replace the tiny stock thumbnails in the product lists: at 60px a sign
// reads and a grey photograph does not. Each sits in a U (`.line__win--sign`) and takes its colour
// from `currentColor`, so the row's yellow/black flip needs nothing extra.
//
//   lineSign('engineered-wood')   an <svg>, 64 × 64, decorative (aria-hidden)
//
// Drawn on a 64 grid with the weight of the mark's rings: heavy strokes, square ends, solid shapes.
import { raw } from './html.mjs';

const SIGNS = {
  // A stud wall: double top plate, three studs, a bottom plate.
  'framing-lumber': '<path d="M6 10h52M6 19h52M6 54h52M13 19v35M32 19v35M51 19v35"/>',
  // Sheets in a stack, the top one solid.
  'panels-sheathing': '<path class="s" d="M32 7 60 21 32 35 4 21Z"/><path d="m4 32 28 14 28-14M4 43l28 14 28-14"/>',
  // An I-joist cut through.
  'engineered-wood': '<path class="s" d="M8 7h48v11H38v28h18v11H8V46h18V18H8Z"/>',
  // Two form panels, tied across the pour.
  'concrete-forming': '<path class="s" d="M6 6h12v52H6zM46 6h12v52H46z"/><path d="M18 18h28M18 32h28M18 46h28"/>',
  // Fence pickets.
  'cedar-decking': '<path class="s" d="M4 58V19l6-11 6 11v39ZM18 58V19l6-11 6 11v39ZM34 58V19l6-11 6 11v39ZM48 58V19l6-11 6 11v39Z"/>',
  // A gable end in lap siding.
  'siding-exterior': '<path d="M32 7 58 27v30H6V27ZM6 37h52M6 47h52M12.5 27h39"/>',
  // The drawing sign for batt insulation, between two faces of a wall.
  'insulation-drywall': '<path d="M6 8h52M6 56h52"/><path class="r" d="m7 46 8.3-28 8.3 28L32 18l8.3 28 8.3-28 8.4 28"/>',
  // A window with its sill.
  'windows-doors-cabinets': '<path d="M12 7h40v44H12ZM32 7v44M12 29h40"/><path class="b" d="M5 56h54"/>',
  // A joist hanger: a U with flanges and nail holes.
  'hardware-supplies': '<path class="b" d="M18 12v24a14 14 0 0 0 28 0V12M6 12h19M39 12h19"/><path class="d" d="M12 21h0M52 21h0M32 40h0"/>',
};

export const lineSign = (slug) => {
  const body = SIGNS[slug];
  if (!body) throw new Error(`No sign for product line "${slug}" in src/lib/drawings.mjs`);
  return raw(`<svg class="sign" viewBox="0 0 64 64" aria-hidden="true" focusable="false">${body}</svg>`);
};
