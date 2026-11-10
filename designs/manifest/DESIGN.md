# MANIFEST — the Uresco design system

Direction B of the redesign, built out on every page. This file describes what exists and is
everything needed to add a page or change one in the same system without asking the person who
made them. Section 10 is the page-by-page map of what is where.

## 1. The idea

The site looks like it was made by people who read drawings for a living. Its language is the
take-off, the bill of lading and the shop drawing: exact, calm, dense with information.

Three things make it unmistakable. Every page should use at least one of them.

1. **The dispatch board.** Three yards on a departures board: local time (ticking), open or
   closed, the number. Every row is a `tel:` link. It is the first thing under the home headline on a phone.
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
| `--go`, `--go-ink` | `#1B7F45`, `#46D98A` | The open-status lamp only, on paper and on ink. Never a text colour, a fill or an accent |

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
| `.h3` `--fs-h3` | 20 → 26 px | 600 · −0.02em · 1.12 | Item titles |
| `.lede` `--fs-lede` | 17 → 20 px | 400 · 1.45, `--ink-2`, max 34em | Supporting paragraph |
| body `--fs-body` | 17 px | 400 · 1.55 | |
| `.label` `--fs-label` | 13 px mono | 500 · +0.06em · uppercase, `--ink-3` | Every label (`.label--blue` for annotation) |
| Buttons | 14 px mono (`--sm` 13 px) | 600 · +0.04em · uppercase | |
| `.num` | mono, tabular | | Any number set as data |

Headlines are sentence case, never all caps. Emphasis in a headline is `<em>`: a stroke of
highlighter under the phrase (yellow text instead when the ground is ink). One `<em>` per headline.
Numerals are a feature: set them in mono, large, zero-padded where it reads as a count (`03`, `09`).
Nothing a visitor needs is under 12 px on a phone: map and drawing lettering stops at 12 px, and only the
word-mark's descriptor is smaller (11 px, and it repeats what the logo says).

### Space, grid, shape

- Section padding `--section` (68 → 136 px).
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
- **Photographs**: one in the hero, or none (the products pages use a drawing there). The only other photograph on a
  page is one of Uresco's own, small and captioned as such (Home Fig. 2, About Fig. 1). Everything else is drawing, map or type.
- **How a page ends.** Every page ends on the take-off band, except three: Home goes on to the yards after it,
  Quote is the form itself so it ends on the three numbers and the account stub, and the 404 ends on the three numbers.
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
reference at the far end of the rule, only when it tells the reader something (`05 items`, `A–Z`).
Do not fill it with ranges that decorate (`Lines 001–009`, `S-01 to S-06`, `Marks A1–D2`): a label
has to earn its place. Without `lede` or `action` the head is `.shead--solo`.

### Sheet bar — `.sheetbar`

The strip of lettering under the masthead: the breadcrumb on the left, a short reference on the right
(`.sheetbar__meta`, hidden under 600 px): a place (`Kent, Washington`), a scope (`Six services`) or a position
(`Line 003 of 009`). It is never a sheet number: the review round ruled out invented drawing-control data, and
the numbering could not agree with itself. `pageHero()` writes it.

### Page hero — `pageHero(ctx, { sheet, meta, title, lede, photoKey, media, cls, pre, after, caption, fig, actions, crumbs, below })`

```html
<section class="phero"><div class="wrap">
  <div class="sheetbar"><nav class="crumbs">Home / Alaska delivery</nav><p class="label sheetbar__meta">Anchorage · Fairbanks</p></div>
  <div class="phero__grid">
    <div class="phero__inner"><h1 class="display">Everything between the plans <em>and the pad.</em></h1>
      <p class="lede phero__lede">…</p><div class="actions">…</div></div>
    <figure class="plate phero__media">…</figure>
  </div>
  <!-- `below`: something that belongs to the hero, e.g. latRule() -->
</div></section>
```

7 / 5 on wide screens with the plate at 4:3; one column under 1000 px with the plate at 3:2,
full-bleed on phones. Without `photoKey` or `media` the hero is type only (`.phero__grid--plain`): use
that for quote and accounts. `preloadFor(ctx, key)` gives the matching preload hint. The plate image is
the LCP element; keep it in the first screen.

| Option | What it does |
|---|---|
| `media` | Any object in place of the photograph; the products pages pass a `.dwg` plate |
| `cls` | Added to the `section.phero`, for a page's own sizing |
| `pre` | Above the headline (the line mark on a product page) |
| `after` | Under the actions (the three ways in on the products index) |
| `sheet` | The page's name in the breadcrumb, sentence case (`crumbs` replaces it on the products pages) |
| `meta` | Right-hand lettering of the sheet bar |
| `below` | Something that belongs to the hero, under the grid: `latRule()`, `.sv-index`, `.pj-index`, a stub |

Headline size is `.phero .display` (40 → 88 px) on every page, with three reasons to differ: the question heroes
(`.phero--ask`, which carry a sentence above the answer), a product line (the names are long) and Locations (the board
has to clear the fold).

**The hero that asks and answers** (`.phero--ask`, 30-components.css; Alaska and Pacific Northwest): the question small
(`.phero__q`) inside the one `h1`, the answer as the headline, direct `tel:` cells under the lede (`.phero__calls`),
and a yellow-fronted ticket across the sheet (`.shipto`, `.shipto__ask`, `.shipto__title`, `.shipto__field`,
`.shipto__prefix`, `.shipto__input`). Alaska's ticket is the finder; Pacific Northwest's is a plain GET form.

### Plate (photograph) — `plate(ctx, key, { fig, caption, more, sizes, eager, alt })`

```html
<figure class="plate">
  <div class="plate__img"><img …></div>
  <figcaption class="plate__cap"><span class="label label--blue">Fig. 1</span><span>Caption.</span><span class="plate__credit">Photo: Name / Unsplash</span></figcaption>
</figure>
```

Treatment (CSS only, in `.plate__img`): greyscale, contrast 1.2, then two blend layers — a
`lighten` layer of blueprint ink `#1A2C5E` so shadows print blue, and a `multiply` layer of paper
so highlights are the page. Crop marks at the corners. Always captioned as a numbered figure with
its credit, so a stock photograph is never read as Uresco's own yard. Caption by what it literally
shows. Where it could be mistaken, say so: "A stock photograph, not a Uresco truck." `alt` replaces the
stored alt text for one use; prefer fixing it in `scripts/photos.json`. Choose photographs with a light sky or ground and one clear subject; dark,
busy pictures turn to mud in two inks.

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
    <span class="board__clock js-only"><span class="board__time" data-clock="America/Los_Angeles" aria-hidden="true"><span class="fl">-</span>…</span><abbr class="board__tz">PT</abbr></span>
    <span class="board__status"><span class="status" data-hours="…" hidden></span></span>
    <span class="board__num"><span class="sr-only">(253) 395-1211</span><span class="board__digits" data-flap aria-hidden="true"><span class="fl">(</span>…</span></span>
    <span class="board__go" aria-hidden="true">…</span>
  </a></li></ol>
</section>
```

Characters sit in fixed cells (`.fl`) so the script (`js/modules/board.js`) can write only the ones
that change. The clock shows hours and minutes and changes on the minute; `.board__pause` (added by
the script, from 860 px where the board has a head) stops it and the lamp. A phone number is set tight
(`.board__digits .fl`), so it reads as a number and not as fourteen tiles. Without script the numbers are
simply there and the clock is hidden (`.js-only`). Three layouts: a seven-column table ≥1320 px, two lines per row to 860 px, three lines per
row on phones (yard + clock / number + status / what to call for). It is on Home and Locations; Home adds a fourth
row under it, `.hero__acct` (Open an account), which is deliberately not a `.board__row`. The
compact version of the same information is the utility strip and the call sheet.

`[data-clock="<IANA zone>"]` works on any element (the utility strip and yard cards use it).
`.status[data-hours]` is the live lamp (`00-core.js`), and it says only "Open" or "Closed", with a green dot (`--go`)
or a hollow grey ring. Hours are placeholders: they print in one place, the yard directory on the Locations page, and
never in structured data.

### Manifest — `manifest(ctx)`

```html
<div class="mfwrap"><div class="manifest" data-manifest>
  <div class="manifest__cols label" aria-hidden="true">Line · Product line · Items</div>
  <details class="mline" name="mf" open>
    <summary class="mline__row">
      <span class="mline__no num">001</span><span class="mline__glyph"><svg class="gl">…</svg></span>
      <h3 class="mline__name">Framing Lumber &amp; Timbers</h3><span class="mline__sum">Dimensional lumber · Timbers · …every item</span><span class="mline__qty num">04</span><span class="mline__mark"></span>
    </summary>
    <div class="mline__panel">
      <div class="dwg"><p class="dwg__bar label">Dwg 001 · … · Typical · not to scale</p><div class="dwg__canvas"><svg class="dw">…</svg></div><p class="dwg__note">Typical sizes shown. Ask your yard what is in stock.</p></div>
      <div class="mline__body"><p class="mline__lede">…</p><ul class="mline__items">…</ul><div class="mline__links">…</div></div>
    </div>
  </details>
  … <a class="mline__ask" href="quote/">Not on the list? …</a>
  <p class="brandline">Brands we carry …</p>
</div></div>
```

One markup for every width and no script required: on a phone each `<details>` opens in place; from
1000 px the open line's panel is positioned in the right-hand seven columns, so the list reads as
a table with a plate beside it (the plate is out of the flow there, so `.manifest` reserves its
height from the width of `.mfwrap`). `js/modules/manifest.js` adds hover and focus preview, arrow keys,
and keeps exactly one line open on wide screens. The open row is highlighted yellow. On a phone a closed
row names everything on the line under its title (`.mline__sum`), never the first few and an ellipsis.
A line's links are "See <short name>" and "Quote this line". The ® sign appears only on the products
pages, which are the full list.

For product pages: `.dwg` is the product hero (use it instead of a photograph, with `.dwg__note` under
it), and the item list is `.mline__items`. `packingList(ctx, { only, cls })` (`.plist`) is the compact
index for other pages; `only` is a list of categories, and every item on a line is always listed.

### Drawings — `src/lib/drawings.mjs`

- `drawing(slug)` → `<svg class="dw" viewBox="0 0 480 320">`: the nine section drawings; `package`
  (a banded, wrapped lumber unit and a crate); and the service drawings `svc-takeoffs`, `svc-design`,
  `svc-shipping`, `svc-remote`, `svc-delivery`.
- `keyElevation()` → Dwg 000, one building part-way through being built with every product line in it.
  `KEY_VIEW` and `KEY_TAGS` place the numbered links over it; parts carry `.kx-p1` to `.kx-p9`.
- `glyph(slug, { size })` → 48 × 48 pictogram (`.gl`) for menus, lists and rows.
- `sketch(name)` → 72 × 48 elevation for schedules: `village`, `public`, `multi`, `home`, `forms`, `deck`, `north`, `crate`.

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
| `.dw-key` | A keyed reference: the circled number that ties a thing on one drawing to a line on another | blue circle, sheet fill |
| `.dw-ln--road`, `--sea`, `--barge`, `--air` | Freight lanes inside a drawing, in the delivery plate's line styles | ink or blue |

Every stroke is `vector-effect: non-scaling-stroke`, so line weight is the same at any size.
Lettering size is set by container query on `.dwg__canvas` (`--dw-fs`), so it stays about 11 px on
screen whether the drawing is 300 or 700 px wide: when adding a drawing, leave room for labels at
17.5 units and keep them short. Sizes are actual dressed sizes (a 2×6 is 1½″ × 5½″); a drawing
shows a typical section, not stock, and says so in its bar ("Typical · not to scale"). A drawing that is
not of a product carries no invented figure: write "SPAN PER PLANS", not "24′-0″". Helpers:
`rect`, `poly`, `line`, `circle`, `member`, `rings` (end grain), `strands`, `stipple`, `breakV/H`,
`dimH`, `dimV`, `note`, `cap`, `mid`, `keyed`. A drawing that belongs to one page (the unloading details, the end grain, the
dock on the 404) uses the exported `kit` of the same primitives. Each drawing is two groups, `.dw-obj` and `.dw-ann`, so the object
is plotted before its annotation.

### Delivery plate — `deliveryMap(ctx, { compact, action })`

`.pmap`: eight columns of map (`.pmap__canvas`) and four of title block (`.pmap__side`): the three
yards, the title in a yellow cell (`.tblock`, `.tblock__firm`, `.tblock__title`), the
lane schedule A–D (`.pmap__legend`), keys, an optional action and the note that lanes show how freight
generally moves. The base map is a cached file (`assets/map.svg`,
written from `mapSvg()`); lanes and markers are a small inline SVG over it (`.pmap__lanes`, classes
`pm-lane--sea|road|barge|air`, `pm-yard`, `pm-town`); names are HTML (`.pmap__town`, `.pmap__yard`,
`.pmap__tag`, `.pmap__grat`) placed in percent, so they stay legible. The scale bar is true at
60° N. Data: `src/data/map.json` from `scripts/map.mjs`. `compact` draws and names six key towns. Every
dot the plate draws has a name beside it at every width: under 700 px Homer, Valdez and Cordova give way
(`.pm-town--*`, `.pmap__town--*`), the graticule figures go, Anchorage's tag moves east of its marker and
Utqiaġvik's name goes beside its dot so it stays on the sheet. Yard tags have a clear border that makes
a 40 px touch target. Lanes are illustrative and the plate says so; do not add carriers, sailings or
transit times.

### Sequence — `sequence(steps, { cls })`

`.seq`: stations on one line (`--n` columns; `.seq--six`, `.seq--four`). Each `.seq__step` has a
blue mono number, a name, a sentence and an optional link. A step with an `href` is one link, edge to
edge, with the focus ring on the whole step (the heading's link is stretched with `::after`, and the visible "Details"
link is `aria-hidden`). On phones the line runs down the left. Use it for any process (how a quote works, how an
account is opened). Service stations are numbered from the data, `S-01` to `S-06`, the same on every page.

### Take-off band — `quoteBand(ctx, { no, eyebrow, title, body, product, yard, location })`

`.takeoff` (ink) with `.tsheet`: a blank material take-off whose quantity column is highlighted,
with a blue note, "We fill in this column". It is the site's quote call to action; end pages with it.
`product`, `yard` and `location` go on both buttons. Every quote link carries what the visitor was
looking at: write it with `quoteHref(ctx, { product, yard, location, hash })`. Never say the quote
includes freight: "We will quote the package and work out the freight with you."

### Yard card — `yardCard(ctx, location, { compact, headingLevel })`

`.yard`: label, city, "Call for: …", the number as a large mono link (`.yard__phone`), a ruled
`dl.yard__lines` (toll-free, email, address, fax, mail, local time with the open/closed lamp), then
Call, Directions and "Quote from <city>". Email and fax stay at every width. The card carries the yard's id as its
anchor (`#kent`, `#anchorage`, `#fairbanks`), so use it at most once per yard on a page. Lay out in `.yards` (three) or
`.yards--2`. When a card has a row to itself on a tablet it goes two-up inside (640–1099 px, to 859 px for `.yards--2`).

### Yard strip — `yardStrip(ctx, { cls })`

`.ystrip`: three yards as three cells, each one `tel:` link (yard, lamp, what to call for, the number,
"Call <city>"). The light alternative to three yard cards on an inner page; Services, About, Quote and the
404 use it. Three across from 860 px, three rows under that, with a yellow call button at the end of each.

### Stub — `stub({ tag, title, body, actions, level, cls })`

`.stub`: the perforated yellow ticket, the one solid yellow block on a page: a turned tag (`.stub__tag`), a title
(`.stub__t`, a heading at `level`, or a paragraph without it), a line of text and its actions (`.stub__acts`).
Under the take-off band on Home, in the Accounts hero (`below`), and with the numbers at the end of Quote.

### The form — `src/lib/forms.mjs`, `40-forms.css`, print in `90-print.css`

A form is a printed form: one ruled sheet of cells with the lettering on top and the entry under it. `sheetLayout({ kind,
subject, name, lead, steps, paper, head, privacy, body, send, done, cls })` lays it out: the sheet (`.fm-sheet`) on the
left and a title block beside it (`.fm-side`: which yard answers, a section index with what is left to fill in, and the
three numbers). Under 1100 px the numbers go above the sheet (`.fm-calls--top`) and the yard statement into its cell.

| Piece | Helper | Classes |
|---|---|---|
| Section | `group({ id, letter, title, cls }, body)` | `.fm-set`, `.fm-legend`, `.fm-grid`, `.bub` with a letter A to E (page sections are numbered, so letters do not clash), `.fm-left` |
| Text field | `field({ id, label, type, required, full, w, m2, hint, msg, attrs })` | `.fm-cell` + `--full`, `--half`, `--third`, `--wide`, `--m2` (stays two-up on a phone), `.fm-label`, `.fm-input`, `.fm-hint`, `.fm-req`, `.fm-err` |
| Drop-down, text area | `select(…)`, `textarea(…)` | `.fm-select` (`paper: true` also prints tick boxes), `.fm-text` |
| Options | `radios(name, legend, opts)` | `.fm-seg`, `.fm-opt`, `.fm-opt__box` |
| Yard | `yardSelect({ label, hint, lead, guide })` | `.fm-cell--yard`, `.fm-route`, `.fm-guide` |
| Files | `fileDrop({ id, name, label, hint, title, tapTitle, note, accept })` | `.fm-drop`, `.fm-files` |
| Certification | written in `accounts.mjs` | `.fm-check` |
| Foot, notices | inside `sheetLayout` | `.fm-foot`, `.fm-notice--done`, `.fm-notice--bad` |
| Paper only | | `.fm-paper`, `.fm-letterhead`, `.fm-pagehead`, `.fm-paperopts` |

`10-forms.js` finds forms by `[data-form]`. Yellow marks what is left to do (a required tag turns into a tick); errors are
stamped in ink with yellow lettering. `?product=`, `?yard=` and `?location=` fill the form. The credit application prints on
two Letter pages as a form to sign. The quote form has no paper version.

### Smaller pieces

| Piece | Class | Notes |
|---|---|---|
| Buttons | `.btn`, `--line`, `--dark`, `--sm`, `--block` | Mono, uppercase, 48 px high, yellow with an ink frame; hover inverts. One primary per group. |
| Arrow link | `.link` | Mono, ruled underneath; on hover the rule rises into a block of highlighter (`::before`, scaleY) |
| Status lamp | `.status[data-hours]` | Add `data-short` for "Open" / "Closed" |
| General note | `.gnote` | Blue-edged box with a `.label--blue` number: "Note 1 · Season" |
| Small bubble | `.bub.bub--sm` | 26 px detail bubble for a lettered key (a sector, a mark) |
| Tags | `ul.tags`, `.tags--ref` | Mono chips for what is in a package; `--ref` is a blue cross-reference, each one a link, 40 px high on touch |
| Drawing note | `.dwg__note` | One line under a `.dwg` canvas: "Typical sizes shown. Ask your yard what is in stock." |
| Schedule (home.css) | `.sched`, `.sched__row`, `.sched__mark`, `.sched__pkg` | A door-schedule table: mark, sector, work, typical package (`ul.tags`) |
| Ways (alaska.css) | `.ways`, `.way`, `.way__tag` | Three ruled cells keyed to map lanes |
| Finder ticket (alaska.css) | `[data-finder]`, `.shipto__list`, `.shipto__card`, `[data-r]`, `.pmap__pin` | Type a place, get the yard to call and how freight typically gets there, and a yellow pin on the plate. `modules/finder.js`, places in `data/places.mjs`. Without script the three yards show instead |
| Questions (alaska.css) | `.faq`, `.faq__item`, `.faq__q`, `.faq__a` | `<details>`, Q1–Q5 and "Answer"; the answers are also the page's FAQ structured data |
| Drawing with a note (alaska.css) | `.pack`, `.pack__dwg`, `.pack__note`, `.pack__list` | A `.dwg` plate (7 columns) beside a blue-edged note (5): the pattern for showing any drawing outside the manifest |
| Notes numerals (home.css) | `.notes__grid`, `dt.num[data-count]` | Four large mono numerals; they count up once |
| Station line (services.css) | `.sv-line`, `.sv-st`, `.sv-spec`, `.sv-dwg` | A rail down the left; each service is a station with a "You bring / We do / You get" spec, its actions and a drawing |
| Service index (services.css) | `.sv-index` | The six stations on one line under the hero; a two-across contents list on phones |
| Sector index (projects.css) | `.pj-index` | Four sectors under the hero; hidden on phones when the key is there |
| Schedule (projects.css) | `.pj-sched`, `.pj-group`, `.pj-row` | Sectors as ruled groups of marked lines: bubble, `sketch()`, work, `ul.tags`, cross-references |
| Sector key (projects.css) | `.pj-side`, `.pj-filter[data-pj-filters]`, `.pj-status` | Title cell and filter buttons, sticky from 1200 px; `modules/projects.js` filters and announces. Not shown without script |
| Load-outs (projects.css) | `.pj-mx`, `.pj-mx__head`, `.pj-mx__cells`, `.pj-mx__key` | Kinds of work against the nine lines; the column heads and the key are the links, the cells are not |
| Products index (products.css) | `.pidx-toc`, `.pidx-key`, `.pidx-line`, `.pidx-az`, `.pidx-brand`, `.pidx-find` | Three ways in: by line (with Find), by name (book index), by brand |
| Product line (products.css) | `.pln-rule`, `.pln-item`, `.pln-ask`, `.pln-pager`, `.pln-mark` | The line's sheet: drawing, line rule (two rows of five under 600 px), numbered items, "Ask your yard" note with the three numbers; a line's related lines leave out its previous and next |
| Unloading details (pacific-northwest.css) | `.pn-unload`, `.pn-way`, `.pn-dwg` | Two drawings side by side, each with a headline and a sentence |
| Delivery ticket (pacific-northwest.css) | `.pn-ticket`, `.pn-ticket__card`, `.pn-ticket__rows` | The `.shipto` frame as a plain GET form to the quote page |
| Build schedule (pacific-northwest.css) | `.pn-gantt`, `.pn-gantt__row`, `.pn-gantt__track` | The nine lines against four stages of a building; each row a link |
| Lane detail (pacific-northwest.css) | `.pn-detail` | A crop of the delivery plate's own base drawing |
| Yard directory (locations.css) | `.lo-dir`, `.lo-yard`, `.lo-ways`, `.lo-way--call`, `--visit`, `--fax`, `--email` | A yard as one row of the four ways to reach it. The only place hours print (`.lo-hours`) |
| Key plan (locations.css) | `.lo-key` | A corner of the plate with the yard marked |
| Routing slip (locations.css) | `.lo-route` | "Which yard should I call?" as a table of tel: rows |
| Jump strip (locations.css) | `.lo-jump` | The three yards, under the board |
| End grain, data sheet (about.css) | `.ab-rings`, `.ab-data` | The hero drawing and the vendor's details with the one photograph |
| Notes, mission (about.css) | `.ab-notes`, `.ab-spec` | Six numbered notes; the mission clause by clause, each with what backs it |
| Account schedule (accounts.css) | `.ac-sched`, `.ac-stmt` | What an account does, beside a specimen statement with no figures |
| Sheet index (about.css) | `.nf-index` | The 404's list of pages |

### Chrome (`src/lib/layout.mjs`, `20-chrome.css`)

- `.utility` — yards as `tel:` links with `[data-clock]` and `.status`. ≥1000 px only.
- `.masthead` — `.brand`, `.nav`, `.masthead__call` (opens `#call-sheet`), `.masthead__cta`, `.masthead__menu` (opens `#drawer`).
- `.masthead__call` is on screen at every width from 320 to 2560 ("Call" with a phone icon where space is tight, "Call a yard"
  where it fits; the hidden words stay in the accessible name). Quote shortens to "Quote" at 1000–1199 px.
- `.mega` — the Products menu: an index of the nine lines with glyphs. Opens on hover and on
  keyboard focus (CSS); Escape closes it (`modules/nav.js`). The Products link still goes to `/products/`.
- `dialog.drawer#drawer` — phone menu: numbered links, the nine product lines in an expandable row, quote and account buttons,
  three numbers on ink.
- `dialog.sheet#call-sheet` — "Call or visit a yard": opened by any `[data-open="call-sheet"]`. Each yard has Call (tel:) and
  Directions side by side, street address, email, fax and a Details link. The Alaska yards come first on the Alaska page. Write openers as
  links whose `href` makes sense without script (`locations/`, `#yards`, `#index`); the script turns
  them into buttons that open the dialog. Never write one as a `<button>`.
- `.actionbar` — Call and Directions (both open the sheet) · Quote. It slides away while a field has focus.
- `.footer .tb` — the title block: firm, start-here actions, three yards (each with number, toll-free, address, email, fax, lamp),
  index, legal line and two stamps (Sheet / Yards). The sheet name comes from `SHEETS` in `layout.mjs`: add new pages there.

## 5. Photography

One photograph in the hero, as a `.plate`, or none.

| Page | Photograph | Note |
|---|---|---|
| Home | `barge-strip` (a panoramic crop of `tug-barge`) | Stock. Fig. 2 is `uresco-truck`, Uresco's own, cropped to the printed tag on a load of plywood and captioned "The tag on a Uresco load." The key is an old name: it is not a truck |
| Alaska | `port-alsworth` (a landscape crop of `floatplane`) | Stock, captioned by place |
| Pacific Northwest | `rainier-tacoma` | Stock, and says so |
| Services | `hero-truck-denali` (`unloading` turned to mud in two inks) | Stock, and says so |
| Projects | `institutional` | Stock, and says so |
| Locations | `anchorage` | Stock, and says so |
| About | none in the hero; `uresco-woodpile` in the data sheet at its natural size | Uresco's own |
| Products, Quote, Accounts, 404 | none | The products pages use a drawing; the forms are type only |

In `scripts/photos.json` a hero plate has `"hero": true, "plate": true`: `plate` stores it in greyscale at a lower quality,
which the two-ink treatment hides, so the file is about a third smaller. Never use a photograph as a tile, a card background
or a divider, and never stamp a yard's name or latitude on a photo that was not taken there.

## 6. Writing

Plain, specific, short. Say what happens to the customer's materials. Use the vocabulary of the
trade (take-off, package, crate, dock, sailing, line, sheet). Facts only from `FACTS.md` and
`src/data`: no customers, counts, prices, schedules or awards. "More than 35 years" / "35+", never
a founding year. Utqiaġvik (mention Barrow once per page at most). Do not advertise hours.

Lines the review round ruled out, here and everywhere: "one point of contact"; anything that says freight
is included in a quote; any duration, turnaround or lead time; "stock varies by yard" or anything else
about Uresco's stock or carriers; lists of staff roles; who is allowed to buy. Kent is in the Puget Sound
region, not on the Sound. Say how freight "generally" or "typically" moves, never as Uresco's schedule.
Where a visitor would want a size, a grade or stock: "Ask your yard." No list ends in an ellipsis when
the cut-off text is what the visitor needs.

## 7. Motion rules

| What | How | Where |
|---|---|---|
| Clock | Hours and minutes, written on the minute; the board's Pause button stops it | `modules/board.js` |
| Board arrival | Phone-number cells clatter for about 0.6 s on load | `modules/board.js` |
| Drawing | `.dw-obj` then `.dw-ann` wipe in left to right (`@keyframes plot`, clip-path) each time a line opens | CSS |
| Section rule, sequence line | Draws left to right (`scaleX`, `--t-draw`) on first view | `[data-reveal]` |
| Map lanes | Stroke draws along each lane, staggered; yard markers switch on | `[data-reveal]` |
| Take-off quantities | Cells fill one after another | `[data-reveal]` |
| Drawing outside the manifest | `.dwg[data-reveal]` plotted the same way the first time it is seen | `30-components.css` |
| Service stations | Rule draws across, rail draws down, lamp on | `[data-reveal]`, services.css |
| Load-outs | Filled cells fill a column at a time | `[data-reveal]`, projects.css |
| Build schedule, statement, end grain | Bars and highlights fill; the rings grow from the pith | `[data-reveal]`, page styles |
| Numerals | Count up in 12 steps | `modules/count.js` |
| Menu | Wipes down from the masthead rule (clip-path, 160 ms) | CSS |

`modules/reveal.js` adds `.is-in` to any `[data-reveal]` the first time it is seen. Hidden
starting states exist only under `html.js` **and** `prefers-reduced-motion: no-preference`, and
only ever hide a line or a fill, never text. With reduced motion nothing moves: the clock shows
hours and minutes and updates each minute; `10-base.css` also zeroes every transition and animation. Do not add fade-and-rise on text blocks, parallax,
scroll-jacking or anything that loops (the board's lamp is the one exception, and Pause stops it).

## 8. Accessibility and performance, as built

- One `h1`; sections use `h2`; items `h3`. Decorative lettering is `aria-hidden`.
- Focus ring: 3 px blue on paper, yellow on ink.
- Contrast: `--ink-3` is the lightest text on paper; `--board-mute` the lightest on ink.
- Everything interactive is a link, a button, a `<details>` or a `<dialog>`; all of it works from the keyboard.
  Without script: the manifest, questions and Products menu still open, the board shows names and numbers
  (no clock or status), every Call and Directions control goes to the Locations page or the yards on the page, Menu goes to the
  footer index, and the Alaska finder gives the three yards.
- Touch targets are 40 px or more; a stretched link (`.seq__name a`, `.pidx-line__name a`) has its 40 px in `::after`, so a
  bounding-box audit will flag it wrongly.
- No external requests. Fonts 33 KB, CSS about 32 KB and JS about 10 KB gzipped, one file of each for the whole site.
- Hero image is the LCP element, preloaded, with exact `sizes`, except on the Alaska and Pacific Northwest phone layouts, where the
  ticket comes first on purpose. No layout shift: board cells and numerals are monospaced, images carry dimensions.
- `tools/axe.mjs` reports no violations on any page type. `tests/check.mjs` covers every page: see the README.

## 9. Building a new page

Each page: `layout(ctx, { title, description, preload, body })` → `pageHero(…)` → numbered sections with `sectionHead(…)` →
`quoteBand(ctx, { no })`. Put page-only styles in `src/assets/css/pages/<page>.css`, add the page to `SHEETS` in `layout.mjs`, and
add it to `SWEEP_PAGES` in `tests/check.mjs`. If two pages need the same piece, it goes in `30-components.css` and `components.mjs`,
not in the second page's stylesheet.

## 10. Page map: how to pick out each page's parts

Every page opens `section.phero` (`.hero` on Home) and closes `.takeoff` unless noted. Section ids are link targets and test hooks.
Numbers are the section bubbles.

| Page | Source | Hero | Sections, in order |
|---|---|---|---|
| Home `/` | `pages/home.mjs`, `pages/home.css` | `.hero`, `.hero__title`, `latRule()`, `.hero__media` (`barge-strip`), `board()`, `.hero__acct` | 01 `.notes` · 02 `#manifest` (`manifest()`) · 03 `#delivery` (`deliveryMap({ compact })`) · 04 `#services` (`sequence`) · 05 `.takeoff` then `.stubrow` · 06 `#work` (`.sched`) · 07 `#yards` (`yardCard` × 3) |
| Alaska `/alaska/` | `pages/alaska.mjs`, `pages/alaska.css`, `modules/finder.js`, `data/places.mjs` | `.phero--ask`, `.phero__calls`, `[data-finder]` (`#ship-to`), plate `port-alsworth`, `latRule` | 01 `#area` (map) · 02 `#ways` · 03 `#how` (`sequence`, `.pack`) · 04 `#package` (`packingList`) · 05 `#yards` (Anchorage, Fairbanks) · 06 `#questions` (`.faq`) · 07 `.takeoff` |
| Pacific Northwest `/pacific-northwest/` | `pages/regions.mjs`, `pages/pacific-northwest.css` | `.phero--ask.pn-hero`, `.phero__calls`, `.pn-ticket`, plate `rainier-tacoma` | 01 `#delivery` (`.pn-unload`) · 02 `#range` (`.pn-gantt`) · 03 `#yard` (`yardCard`, `.pn-also`) · 04 `#north` (`latRule`, `.pn-detail`) · 05 `.takeoff` (`yard: 'kent'`) |
| Products `/products/` | `pages/products.mjs`, `pages/products.css`, `modules/products.js` | `.pidx-hero`, `.pidx-toc`, `.pidx-key--hero` (key drawing from 1000 px; `.pidx-key--after` follows the list under that) | 01 `#by-line` (`#find`, `#lines`, `.pidx-line`) · 02 `#by-name` (`.pidx-az`) · 03 `#by-brand` (`.pidx-brand`) · 04 `.takeoff` |
| Product line `/products/<slug>/` | same file, `category()` | `.pln-hero`, `.pln-mark`, `.dwg.pln-hero__dwg`, `.pln-rule` | 01 `#items` (`.pln-item`, each with its anchor; `.pln-ask`) · 02 `#services` (`sequence`) · 03 `#load` (`packingList`, `.pln-pager`) · 04 `.takeoff` (`product: c.name`) |
| Services `/services/` | `pages/services.mjs`, `pages/services.css`; copy in `data/services.mjs` | plate `hero-truck-denali`, `.sv-index` | 01 `#line` (`.sv-line`, stations `#takeoffs`, `#design`, `#crating`, `#shipping`, `#remote`, `#delivery`) · 02 `#yards` (`yardStrip`) · 03 `.takeoff` |
| Projects `/projects/` | `pages/projects.mjs`, `pages/projects.css`, `modules/projects.js`; copy in `data/projects.mjs` | plate `institutional`, `.pj-index` | 01 `#schedule` (`.pj-sched`, groups `#remote-alaska`, `#institutional`, `#commercial`, `#residential`, `.pj-side`) · 02 `#lines` (`.pj-mx`) · 03 `.takeoff` |
| Locations `/locations/` | `pages/regions.mjs`, `pages/locations.css` | `.lo-hero`, `board({ id: 'lo-board' })`, `.lo-jump`, plate `anchorage` | 01 `#directory` (`.lo-dir`, yards `#kent`, `#anchorage`, `#fairbanks`; hours in `.lo-hours`) · 02 `#which` (`.lo-route`, map) · 03 `.takeoff` |
| Quote `/quote/` | `pages/quote.mjs`, `pages/quote.css`, `lib/forms.mjs`, `10-forms.js` | Type only | Form `.fm-area` (`#you`, `#job`, `#plans`) · 01 `#next` (`sequence`) · 02 `#call` (`yardStrip`, `stub`). No take-off band |
| Accounts `/accounts/` | `pages/accounts.mjs`, `pages/accounts.css`, same forms | Type only, `stub` below | 01 `#terms` (`.ac-sched`, `.ac-stmt`) · 02 `#apply` (`sequence`, form: `#business`, `#contacts`, `#account`, `#references`, `#documents`) · 03 `.takeoff` |
| About `/about/` | `pages/about.mjs`, `pages/about.css` | `.ab-hero`, `.ab-rings`, `.ab-data` | 01 `#notes` · 02 `#reach` (`latRule`, `.ab-reach`) · 03 `#mission` (`.ab-spec`) · 04 `#yards` (`yardStrip`) · 05 `.takeoff` |
| 404 `/404.html` | `pages/about.mjs`, about.css | `.nf-hero`, drawing | 01 `#sheets` (`.nf-index`) · 02 `#yards` (`yardStrip`). Its links are absolute from the site base |

## 11. Do and don't

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

## 12. File map

```
src/assets/css/00-tokens.css      fonts, colour, type scale, space, grid, motion
src/assets/css/10-base.css        reset, type classes, buttons, links, status, sections
src/assets/css/20-chrome.css      brand, utility strip, masthead, Products menu, dialogs, action bar, footer, board pause
src/assets/css/30-components.css  everything in section 4 except the form
src/assets/css/40-forms.css       the form sheet (fm-)
src/assets/css/90-print.css       chrome off paper; the credit application as a form to sign
src/assets/css/pages/home.css     hero, account row, notes, schedule
src/assets/css/pages/alaska.css   finder ticket, ways, questions, the package drawing
src/assets/css/pages/pacific-northwest.css  ticket, unloading details, build schedule, lane detail (pn-)
src/assets/css/pages/products.css index and line pages (pidx-, pln-)
src/assets/css/pages/services.css station line, service index (sv-)
src/assets/css/pages/projects.css schedule, sector key, load-outs (pj-)
src/assets/css/pages/locations.css  board under the headline, directory, key plan, routing slip (lo-)
src/assets/css/pages/quote.css    the hero's spacing, the account stub's spacing
src/assets/css/pages/accounts.css account schedule, specimen statement (ac-)
src/assets/css/pages/about.css    end grain, data sheet, notes, mission (ab-), 404 (nf-)
src/assets/js/00-core.js          dialogs, typing state, open/closed status
src/assets/js/10-forms.js         quote request and credit application
src/assets/js/modules/*.js        board, count, finder, manifest, nav, reveal, products, projects
src/lib/drawings.mjs              drawing(), keyElevation(), glyph(), sketch(), kit (for a drawing that belongs to one page)
src/lib/components.mjs            every helper named above except the form's
src/lib/forms.mjs                 the form's helpers
src/lib/layout.mjs                chrome, title block, SHEETS, structured data
src/data/*.mjs                    locations, products, services, projects, places; map.json from scripts/map.mjs
scripts/fonts.py · images.py · map.mjs · brand.mjs (lockups and the social card, in this system)
```
