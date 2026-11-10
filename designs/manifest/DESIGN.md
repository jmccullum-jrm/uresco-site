# MANIFEST — the Uresco design system

Direction B of the redesign. This file is everything needed to build the remaining pages
(products, services, locations, projects, quote, accounts, about) in the same system as the
home and Alaska pages, without asking the person who made them.

## 1. The idea

The site looks like it was made by people who read drawings for a living. Its language is the
take-off, the bill of lading and the shop drawing: exact, calm, dense with information.

Three things make it unmistakable. Every page should use at least one of them.

1. **The dispatch board.** Three yards on a departures board: local time (ticking), open or
   closed, the number. Every row is a `tel:` link. It is the first thing under the home headline.
2. **The manifest.** Products are a load manifest, lines 001 to 009. Each line opens a technical
   drawing of what is in it. There are no product photographs anywhere.
3. **The plate.** The delivery map is an engineer's sheet: graticule, lettered lanes, scale bar,
   title block. The same title block is the footer of every page.

Supporting motifs: the **latitude rule** (the company's reach as one dimension line, 47.4° N to
71.3° N), **detail bubbles** numbering each section, **highlighter** on the words that matter,
and **mono lettering** for every label and number.

Three colour roles, never mixed up: **ink draws, yellow highlights, blue annotates.**

## 2. Tokens

All tokens are custom properties in `src/assets/css/00-tokens.css`.

### Colour

| Token | Value | Role |
|---|---|---|
| `--paper` | `#F3F1EA` | Page ground: drafting paper |
| `--paper-2` | `#EAE7DC` | Recessed ground: alternate bands (`.section--panel`) |
| `--sheet` | `#FBFAF6` | Raised ground: plates, drawings, cards, the Products menu |
| `--ink` | `#121311` | Object lines, headlines, text |
| `--ink-2` | `#3A3C38` | Body text |
| `--ink-3` | `#62645D` | Labels and notes (5.4:1 on paper, 4.9:1 on paper-2) |
| `--rule` / `--rule-2` | `#D3D0C6` / `#A8A69C` | Hairlines, light and medium |
| `--yellow` | `#F5B800` | UCM yellow: highlighter, primary action, the highlighted member of a drawing |
| `--blue` | `#1F45C2` | Annotation only: dimensions, figure numbers, sea and air lanes, notes, focus rings |
| `--board`, `--tile`, `--board-rule`, `--board-mute` | `#121311`, `#20211E`, `#32342F`, `#A3A298` | Ink objects: board, footer, utility strip, take-off band, action bar |

Rules: yellow is never text on paper (it fails contrast); it is a fill behind ink text or text on
ink. Blue is never decoration: if it is blue, it is a measurement, a reference or a note. No
gradients, no tints of yellow except the map's service area (`#F8E7A6`). No third accent colour.

### Type

| Family | File | Use |
|---|---|---|
| **Geist** 400–700 (variable) | `fonts/geist-var.woff2`, 19 KB | Headlines, body, names |
| **Geist Mono** 400–600 (variable) | `fonts/geistmono-var.woff2`, 14 KB | Labels, numbers, phone numbers, data, drawing lettering, buttons |

Both are subset by `scripts/fonts.py` (Latin, `Ġ ġ`, fractions `⅛ ⅜ ⅝ ⅞`, arrows, primes, `● ○`)
and preloaded on every page. Metric-matched fallback faces keep text from moving while they load.

| Class / token | Size | Weight · tracking · leading | Use |
|---|---|---|---|
| `.display` `--fs-display` | 44 → 108 px (home hero 42 → 96, page hero 40 → 88) | 600 · −0.045em · 0.94 | The one `h1` |
| `.h2` `--fs-h2` | 32 → 62 px | 600 · −0.04em · 0.98 | Section headlines |
| `.h2--sm` | 26 → 40 px | 600 · −0.035em | Headline inside a card or band |
| `.h3` `--fs-h3` | 20 → 26 px | 600 · −0.02em · 1.12 | Item titles |
| `.lede` `--fs-lede` | 17 → 20 px | 400 · 1.45, `--ink-2`, max 34em | Supporting paragraph |
| body `--fs-body` | 17 px | 400 · 1.55 | |
| `.label` `--fs-label` | 12 px mono | 500 · +0.07em · uppercase, `--ink-3` | Every label (`.label--blue` for annotation) |
| `.num` | mono, tabular | | Any number set as data |

Headlines are sentence case, never all caps. Emphasis in a headline is `<em>`: a stroke of
highlighter under the phrase (yellow text instead when the ground is ink). One `<em>` per headline.
Numerals are a feature: set them in mono, large, zero-padded where it reads as a count (`03`, `09`).

### Space, grid, shape

- 4 px module: `--s1` 4 … `--s9` 96. Section padding `--section` (68 → 136 px).
- `.wrap`: max 1328 px plus `--margin` (18 → 56 px) each side.
- 12 columns, `--gap` 16 → 24 px. Standard splits: **7 / 5** (headline / supporting text),
  **8 / 4** (drawing / title block), **5 / 7** (list / plate). Under 900–1000 px everything is one column.
- `--radius: 2px`. Nothing is rounder, except circles (bubbles, tags, status lamps).
- Line weights: `--line: 1.5px` for object lines and frames, `--hair: 1px` for rules. Same in the drawings.
- No soft shadows. A dialog and the take-off sheet may cast a hard, unblurred offset (`8px 8px 0`).

### Motion

Mechanical and exact: lines draw, numbers tick, rows slide on the grid.

| Token | Value | Use |
|---|---|---|
| `--t-ui` | 120 ms linear | Hover transforms (an arrow stepping, a rule rising) |
| `--t-row` | 220 ms `--ease` | Rows, dialogs |
| `--t-draw` | 520 ms linear | A rule or line drawing in |
| `--ease` | `cubic-bezier(.2,.6,.2,1)` | The only curve; never bounce or overshoot |

Only `transform`, `opacity`, `clip-path` and SVG stroke properties are animated. Colours never
fade: a button or a row switches state at once, like a lamp. A fill that appears on hover (the
arrow link, the yard number) is a pseudo-element scaled in. Everything completes within about
600 ms. See section 7.

## 3. Page anatomy and rhythm

```
utility strip   (≥1000px)  ink; three yards: number, local time, open/closed
masthead        sticky; brand, nav (Products opens the index), Call a yard, Request a quote
main
  hero          home: .hero · inner pages: .phero  (sheet bar, h1, lede, actions, one photograph)
  sections      .section, numbered 01…, alternating paper and .section--panel
  take-off band .takeoff (ink) — the quote call to action, last or second to last
footer          .footer: the title block
action bar      (<1000px) Call · Directions · Quote
```

- Sections alternate `--paper` and `--paper-2`. Two paper sections in a row: give the second
  `.section--flush` (no top padding) only if the first ends in a ruled object.
- At most **one ink band** inside `main` (the take-off band). The board is an ink object, not a band.
- At most **one photograph per page**, in the hero. Everything else is drawing, map or type.
- Every section starts with a **section head** and has one idea, not just a layout. If a section
  is "a grid of cards", ask what document it would be on a job (schedule, log, list, sheet) and
  build that instead.

## 4. Components

Helpers are in `src/lib/components.mjs` unless noted. Styles are in `30-components.css` unless noted.

### Section head — `sectionHead({ no, eyebrow, meta, title, lede, action })`

```html
<header class="shead" data-reveal>
  <div class="shead__bar">
    <span class="bub num" aria-hidden="true">02</span>
    <p class="label shead__label">The manifest</p>
    <p class="label shead__meta">Lines 001–009</p>
  </div>
  <div class="shead__grid">
    <h2 class="h2">Everything on the load, <em>line by line.</em></h2>
    <div class="shead__aside"><p class="lede">…</p><a class="link" href="…">All products →</a></div>
  </div>
</header>
```

`no` is the detail bubble (`.bub`); number sections 01, 02… down the page. `meta` is a short
reference at the far end of the rule (a sheet number, a range). Keep it under about 14 characters
so it fits a phone. Without `lede` or `action` the head is `.shead--solo`.

### Sheet bar — `.sheetbar`

The strip of lettering under the masthead: breadcrumb or sheet name on the left, a short reference
on the right (`.sheetbar__meta`, hidden under 600 px). `pageHero()` writes it.

### Page hero — `pageHero(ctx, { sheet, eyebrow, title, lede, photoKey, caption, actions, crumbs, below })`

```html
<section class="phero"><div class="wrap">
  <div class="sheetbar"><nav class="crumbs">Home / Alaska Delivery</nav><p class="label sheetbar__meta">Sheet 04 · …</p></div>
  <div class="phero__grid">
    <div class="phero__inner"><h1 class="display">A whole building, to <em>anywhere in Alaska.</em></h1>
      <p class="lede phero__lede">…</p><div class="actions">…</div></div>
    <figure class="plate phero__media">…</figure>
  </div>
  <!-- `below`: something that belongs to the hero, e.g. latRule() -->
</div></section>
```

7 / 5 on wide screens with the plate at 4:3; one column under 1000 px with the plate at 3:2,
full-bleed on phones. Without `photoKey` the hero is type only (`.phero__grid--plain`): use that
for quote and accounts. `preloadFor(ctx, key)` gives the matching preload hint. The plate image is
the LCP element; keep it in the first screen.

### Plate (photograph) — `plate(ctx, key, { fig, caption, more, sizes, eager })`

```html
<figure class="plate">
  <div class="plate__img"><img …></div>
  <figcaption class="plate__cap"><span class="label label--blue">Fig. 1</span><span>Caption.</span><span class="plate__credit">Photo: Name / Unsplash</span></figcaption>
</figure>
```

Treatment (CSS only, in `.plate__img`): greyscale, contrast 1.2, then two blend layers — a
`lighten` layer of blueprint ink `#1A2C5E` so shadows print blue, and a `multiply` layer of paper
so highlights are the page. Crop marks at the corners. Always captioned as a numbered figure with
its credit, so a stock photograph is never read as Uresco's own yard. Choose photographs with a
light sky or ground and one clear subject; dark, busy pictures turn to mud in two inks.

### Latitude rule — `latRule({ highlight, note })`

`.latrule`: a blue dimension line from 46° to 72.5° N with a tick per degree and five labelled
points (Kent 47.4, Sitka 57.1, Anchorage 61.2, Fairbanks 64.8, Utqiaġvik 71.3), labels alternating
above and below so they fit a phone. `highlight: [57.1, 71.3]` fills a range in yellow; `note`
prints a keyed line under it. Only these five latitudes; they are the facts we have.

### Dispatch board — `board(ctx)`

```html
<section class="board" aria-labelledby="board-t">
  <div class="board__head"><h2 class="board__title" id="board-t">Dispatch <span>Three yards, one team</span></h2><p class="board__live js-only">Live · …</p></div>
  <div class="board__cols" aria-hidden="true">No. · Yard · Call this yard for · Local time · Status · Tap to call</div>
  <ol class="board__rows"><li><a class="board__row" href="tel:+1…">
    <span class="board__no num">01</span>
    <span class="board__yard">Kent<small>, WA</small></span>
    <span class="board__for">Puget Sound &amp; the Pacific Northwest</span>
    <span class="board__clock"><span class="board__time js-only" data-clock="America/Los_Angeles" data-seconds aria-hidden="true"><span class="fl">-</span>…</span><abbr class="board__tz">PT</abbr></span>
    <span class="board__status"><span class="status" data-hours="…" data-short hidden></span></span>
    <span class="board__num"><span class="sr-only">(253) 395-1211</span><span class="board__digits" data-flap aria-hidden="true"><span class="fl">(</span>…</span></span>
    <span class="board__go" aria-hidden="true">…</span>
  </a></li></ol>
</section>
```

Characters sit in fixed cells (`.fl`) so the script (`js/modules/board.js`) can flip only the ones
that change. Without script the numbers are simply there and the clock is hidden (`.js-only`).
Three layouts: a seven-column table ≥1320 px, two lines per row to 860 px, three lines per row on
phones (yard + clock / number + status / what to call for). Use it on Home and Locations. The
compact version of the same information is the utility strip and the call sheet.

`[data-clock="<IANA zone>"]` works on any element (the utility strip uses it without seconds).
`.status[data-hours]` is the live open/closed lamp (`00-core.js`); it is the only way hours appear
on the site. Never print hours as a feature: they are placeholders.

### Manifest — `manifest(ctx)`

```html
<div class="mfwrap"><div class="manifest" data-manifest>
  <div class="manifest__cols label" aria-hidden="true">Line · Product line · Items</div>
  <details class="mline" name="mf" open>
    <summary class="mline__row">
      <span class="mline__no num">001</span><span class="mline__glyph"><svg class="gl">…</svg></span>
      <h3 class="mline__name">Framing Lumber &amp; Timbers</h3><span class="mline__qty num">04</span><span class="mline__mark"></span>
    </summary>
    <div class="mline__panel">
      <div class="dwg"><p class="dwg__bar label">Dwg 001 · … · Typical · not to scale</p><div class="dwg__canvas"><svg class="dw">…</svg></div></div>
      <div class="mline__body"><p class="mline__lede">…</p><ul class="mline__items">…</ul><div class="mline__links">…</div></div>
    </div>
  </details>
  … <a class="mline__ask" href="quote/">Not on the list? …</a>
  <p class="brandline">Brands on the manifest …</p>
</div></div>
```

One markup for every width and no script required: on a phone each `<details>` opens in place; from
1000 px the open line's panel is positioned in the right-hand seven columns, so the list reads as
a table with a plate beside it (the plate is out of the flow there, so `.manifest` reserves its
height from the width of `.mfwrap`). `js/modules/manifest.js` adds hover and focus preview, arrow keys,
and keeps exactly one line open on wide screens. The open row is highlighted yellow.

For product pages: `.dwg` is the product hero (use it instead of a photograph), and the item list
is `.mline__items`. `packingList(ctx)` (`.plist`) is the compact nine-line index for other pages.

### Drawings — `src/lib/drawings.mjs`

- `drawing(slug)` → `<svg class="dw" viewBox="0 0 480 320">`: the nine section drawings, plus `package`
  (a banded, wrapped lumber unit and a crate, used on the Alaska page).
- `glyph(slug, { size })` → 48 × 48 pictogram (`.gl`) for menus, lists and rows.
- `sketch(name)` → 72 × 48 building elevation (`village`, `public`, `multi`, `home`) for schedules.

One convention for all of them:

| Class | Meaning | Style |
|---|---|---|
| `.dw-o` | Object line | ink, 1.5 px, sheet fill |
| `.dw-h` | **The** highlighted member: one per drawing | yellow fill |
| `.dw-t` | Grain, hatch, hidden edges | ink, 0.75 px |
| `.dw-c` | Centre lines, membranes, projection | dashed |
| `.dw-s` | Stipple (gypsum, concrete) | dots |
| `.dw-d`, `.dw-a`, `.dw-dt` | Dimension lines, arrowheads, dimension text | blue |
| `.dw-l`, `.dw-nt` | Leaders and notes | ink, mono |

Every stroke is `vector-effect: non-scaling-stroke`, so line weight is the same at any size.
Lettering size is set by container query on `.dwg__canvas` (`--dw-fs`), so it stays about 11 px on
screen whether the drawing is 300 or 700 px wide: when adding a drawing, leave room for labels at
15.5 units and keep them short. Sizes are actual dressed sizes (a 2×6 is 1½″ × 5½″); a drawing
shows a typical section, not stock, and says so in its bar ("Typical · not to scale"). Helpers:
`rect`, `poly`, `line`, `circle`, `rings` (end grain), `strands`, `stipple`, `breakV/H`,
`dimH`, `dimV`, `note`, `cap`. Each drawing is two groups, `.dw-obj` and `.dw-ann`, so the object
is plotted before its annotation.

### Delivery plate — `deliveryMap(ctx, { compact, sheet, action })`

`.pmap`: eight columns of map (`.pmap__canvas`) and four of title block (`.pmap__side`): firm,
sheet number, title in a yellow cell (`.tblock`), the lane schedule A–D (`.pmap__legend`), keys,
an optional action and the projection note. The base map is a cached file (`assets/map.svg`,
written from `mapSvg()`); lanes and markers are a small inline SVG over it (`.pmap__lanes`, classes
`pm-lane--sea|road|barge|air`, `pm-yard`, `pm-town`); names are HTML (`.pmap__town`, `.pmap__yard`,
`.pmap__tag`, `.pmap__grat`) placed in percent, so they stay legible. The scale bar is true at
60° N. Data: `src/data/map.json` from `scripts/map.mjs`. `compact` shows six key towns. Lanes are
illustrative and the plate says so; do not add carriers, sailings or transit times.

### Sequence — `sequence(steps, { cls })`

`.seq`: stations on one line (`--n` columns; `.seq--six`, `.seq--four`). Each `.seq__step` has a
blue mono number, a name, a sentence and an optional link. On phones the line runs down the left.
Use it for any process (how a quote works, how an account is opened).

### Take-off band — `quoteBand(ctx, { no, eyebrow, title, body })`

`.takeoff` (ink) with `.tsheet`: a blank material take-off whose quantity column is highlighted,
with a blue note, "We fill in this column". It is the site's quote call to action; end pages with it.

### Yard card — `yardCard(ctx, location, { compact, headingLevel })`

`.yard`: label, city, "Call for: …", the number as a large mono link (`.yard__phone`), a ruled
`dl.yard__lines`, then Call, Directions and "Quote from <city>". `compact` drops fax, mail and the
anchor id. Lay out in `.yards` (three) or `.yards--2`.

### Smaller pieces

| Piece | Class | Notes |
|---|---|---|
| Buttons | `.btn`, `--line`, `--dark`, `--sm`, `--block` | Mono, uppercase, 48 px high, yellow with an ink frame; hover inverts. One primary per group. |
| Arrow link | `.link` | Mono, ruled underneath; on hover the rule rises into a block of highlighter (`::before`, scaleY) |
| Status lamp | `.status[data-hours]` | Add `data-short` for "Open" / "Closed" |
| General note | `.gnote` | Blue-edged box with a `.label--blue` number: "Note 1 · Season" |
| Schedule (home.css) | `.sched`, `.sched__row`, `.sched__mark`, `.sched__pkg i` | A door-schedule table: mark, sector, work, typical package |
| Stub (home.css) | `.stub`, `.stub__tag` | The one solid yellow block: contractor accounts |
| Ways (alaska.css) | `.ways`, `.way`, `.way__tag` | Three ruled cells keyed to map lanes |
| RFI log (alaska.css) | `.rfi`, `.rfi__item`, `.rfi__q`, `.rfi__a` | Questions as a request-for-information log: `<details>` with "RFI 01" and "Response" |
| Drawing with a note (alaska.css) | `.pack`, `.pack__dwg`, `.pack__note`, `.pack__list` | A `.dwg` plate (7 columns) beside a blue-edged note (5): the pattern for showing any drawing outside the manifest |
| Notes numerals (home.css) | `.notes__grid`, `dt.num[data-count]` | Four large mono numerals; they count up once |

### Chrome (`src/lib/layout.mjs`, `20-chrome.css`)

- `.utility` — yards as `tel:` links with `[data-clock]` and `.status`. ≥1000 px only.
- `.masthead` — `.brand`, `.nav`, `.masthead__call` (opens `#call-sheet`), `.masthead__cta`, `.masthead__menu` (opens `#drawer`).
- `.mega` — the Products menu: an index of the nine lines with glyphs. Opens on hover and on
  keyboard focus (CSS); Escape closes it (`modules/nav.js`). The Products link still goes to `/products/`.
- `dialog.drawer#drawer` — phone menu: numbered links, quote button, three numbers on ink.
- `dialog.sheet#call-sheet` — "Call a yard": opened by any `[data-open="call-sheet"]`. Write openers as
  links whose `href` makes sense without script (`locations/`, `#yards`, `#index`); the script turns
  them into buttons that open the dialog.
- `.actionbar` — Call (opens the sheet) · Directions · Quote. It slides away while a field has focus.
- `.footer .tb` — the title block: firm, start-here actions, three yards, index, legal line and
  three stamps (Sheet / Yards / Rev.). The sheet name comes from `SHEETS` in `layout.mjs`: add new pages there.

## 5. Photography

One photograph per page, in the hero, as a `.plate`. Home uses `barge-strip` (a panoramic crop of
`tug-barge`), Alaska uses `port-alsworth` (a landscape crop of `floatplane`). In
`scripts/photos.json` a hero plate has `"hero": true, "plate": true`: `plate` stores it in greyscale
at a lower quality, which the two-ink treatment hides, so the file is about a third smaller. Suggested for the rest: locations `anchorage` or
`rainier-tacoma`; services `unloading`; projects `institutional`; about `uresco-woodpile` (Uresco's
own, small: show it at its natural size, uncropped, as a plate). Products: no photograph; the hero
is the line's drawing. Never use a photograph as a tile, a card background or a divider.

## 6. Writing

Plain, specific, short. Say what happens to the customer's materials. Use the vocabulary of the
trade (take-off, package, crate, dock, sailing, line, sheet). Facts only from `FACTS.md` and
`src/data`: no customers, counts, prices, schedules or awards. "More than 35 years" / "35+", never
a founding year. Utqiaġvik (mention Barrow once per page at most). Do not advertise hours.

## 7. Motion rules

| What | How | Where |
|---|---|---|
| Clock | Cells flip (`.fl.is-flip`, 120 ms scaleY in three steps) once a second | `modules/board.js` |
| Board arrival | Phone-number cells clatter for about 0.6 s on load | `modules/board.js` |
| Drawing | `.dw-obj` then `.dw-ann` wipe in left to right (`@keyframes plot`, clip-path) each time a line opens | CSS |
| Section rule, sequence line | Draws left to right (`scaleX`, `--t-draw`) on first view | `[data-reveal]` |
| Map lanes | Stroke draws along each lane, staggered; yard markers switch on | `[data-reveal]` |
| Take-off quantities | Cells fill one after another | `[data-reveal]` |
| Numerals | Count up in 12 steps | `modules/count.js` |
| Menu | Wipes down from the masthead rule (clip-path, 160 ms) | CSS |

`modules/reveal.js` adds `.is-in` to any `[data-reveal]` the first time it is seen. Hidden
starting states exist only under `html.js` **and** `prefers-reduced-motion: no-preference`, and
only ever hide a line or a fill, never text. With reduced motion nothing moves: the clock shows
hours and minutes and updates each minute. Do not add fade-and-rise on text blocks, parallax,
scroll-jacking or anything that loops (the board's lamp is the one exception).

## 8. Accessibility and performance, as built

- One `h1`; sections use `h2`; items `h3`. Decorative lettering is `aria-hidden`.
- Focus ring: 3 px blue on paper, yellow on ink.
- Contrast: `--ink-3` is the lightest text on paper; `--board-mute` the lightest on ink.
- Everything interactive is a link, a button, a `<details>` or a `<dialog>`; all of it works from the keyboard.
  Without script: the manifest, questions and Products menu still open, the board shows names and numbers
  (no clock or status), and the menu and call buttons fall back to the footer index and the yards.
- No external requests. Fonts 33 KB, CSS about 18 KB and JS about 6 KB gzipped.
- Hero image is the LCP element, preloaded, with exact `sizes`. No layout shift: board cells and numerals are monospaced, images carry dimensions.
- Measured on the built pages (mobile Lighthouse): Home 100 performance, 100 accessibility, 100 best practices; Alaska 99 / 100 / 100;
  CLS 0 on both. `tools/axe.mjs` reports no violations on either. `tests/check.mjs` passes for all pages, including the
  check that all three board numbers are above the fold from 1024 × 768 to 1920 × 1080.

## 9. Building the remaining pages

Each page: `layout(ctx, { title, description, preload, body })` → `pageHero(…)` → numbered
sections with `sectionHead(…)` → `quoteBand(ctx, { no })`. Put page-only styles in
`src/assets/css/pages/<page>.css` and delete the page's block from `90-legacy.css`.

| Page | Hero | Sections, in this system |
|---|---|---|
| Products index | Type-only hero, or the first drawing | `manifest(ctx)` as the whole page; brands as `.brandline` |
| Product line | `.dwg` with `drawing(slug)` beside the title (5 / 7) | Items as a ruled spec list; literature as `.link`s; "what ships with it" as `packingList`; `quoteBand` |
| Services | Plate `unloading` | `sequence` of the six services as stations, then one ruled block per service (S-01 …) |
| Locations | Plate `anchorage` | `board(ctx)` directly under the hero, `yards` with full `yardCard`s, `deliveryMap` |
| Projects | Plate `institutional` | The `.sched` schedule with all eight rows and `sketch()` marks; filters as `.btn--sm.btn--line` |
| Quote | Type-only | The form on a `.tsheet`-like sheet; fieldsets numbered with `.bub`; yard status beside it |
| Accounts | Type-only, `.stub` under it | `sequence` for how an account is opened; the application as a ruled form; print styles stay |
| About | Plate `uresco-woodpile` | General notes (`.notes__grid`), `latRule()`, mission as a single large statement |

`90-legacy.css` holds the old rules those pages still use, re-pointed at the new tokens, so they
are usable (and pass `tests/check.mjs`) until rebuilt. `components.mjs` keeps the old helper
signatures (`stamp`, `sectionHead`, `pageHero`, `quoteBand`, `yardCard`, `deliveryMap`,
`interlude`) so the old page modules still build.

## 10. Do and don't

Do
- Start from the document it would be on a job site: a schedule, a log, a list, a sheet.
- Rule things. A 1.5 px ink line above a block and hairlines between rows.
- Number things: sections, lines, yards, steps, figures, notes.
- Give every drawing exactly one yellow member and blue dimensions.
- Keep phone numbers as `tel:` links in mono, large.
- Check 390 px first. The phone layout is designed, not stacked.

Don't
- No product photographs, photo tiles, card grids with images, or stock people.
- No all-caps condensed headlines (that was the previous site), no centred text blocks.
- No rounded corners over 2 px, no drop shadows, no gradients, no glass.
- No yellow text on paper; no blue as decoration; no third accent.
- No invented facts, quantities, times or names — in copy or in drawings.
- No motion that is not a line drawing, a number ticking or a row moving on the grid.

## 11. File map

```
src/assets/css/00-tokens.css      fonts, colour, type scale, space, grid, motion
src/assets/css/10-base.css        reset, type classes, buttons, links, status, sections
src/assets/css/20-chrome.css      brand, utility strip, masthead, Products menu, dialogs, action bar, footer
src/assets/css/30-components.css  everything in section 4
src/assets/css/90-legacy.css      old rules for pages not yet rebuilt
src/assets/css/pages/home.css     hero, notes, schedule, stub
src/assets/css/pages/alaska.css   ways, RFI log
src/assets/js/00-core.js          dialogs, typing state, open/closed status, projects filter
src/assets/js/10-forms.js         quote request and credit application
src/assets/js/modules/*.js        board, count, manifest, nav, reveal
src/lib/drawings.mjs              drawing(), glyph(), sketch()
src/lib/components.mjs            every helper named above
src/lib/layout.mjs                chrome, title block, SHEETS
scripts/fonts.py · images.py · map.mjs · brand.mjs (lockups and the social card, in this system)
```
