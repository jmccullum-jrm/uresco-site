# NORTHBOUND — the Uresco design system

Direction A of the redesign. This file is what you need to build the remaining pages (products,
services, locations, projects, quote, accounts, about) in the same system without asking anyone.

---

## 1. The idea, in three sentences

The site is a trip north. Uresco's story is distance: a load that leaves a yard on Puget Sound at
47.4°N and lands on the Arctic coast at 71.3°N, so **latitude is the organising device** — it names
the yards, heads the chapters, runs down the edge of the page as a scale, and sits in the caption of
every photograph. Everything else is a well-made magazine: warm paper, spruce-black ink, a display
serif set large and light, big photographs that read as one shoot, and UCM yellow used only as a
signal.

### The three things that make it unmistakable

1. **The latitude rail.** A scale fixed to the left margin (46°–72°N, north at the top) with a needle
   that climbs as the page scrolls. On phones it becomes a reading in the masthead (`61.2°N ANCHORAGE`)
   and a yellow progress line under it.
2. **Chapters that are places.** Each chapter opens with a ruled bar (number, place, latitudes) and the
   latitude it arrives at set at headline size (`47.4°N`). Products, services, the quote prompt and
   the yards live *inside* the chapter where they belong on the route.
3. **The route plate.** A real projection drawn like a printed chart: coastal vignette, graticule with
   degree ticks in the margin, Arctic Circle, compass corrected for the projection, scale bar, a title
   cartouche. The freight lanes draw themselves when the plate comes into view.

Supporting ideas: the quote prompt is a **freight manifest**; the product lines are a **stock list**
(a numbered index, not a grid of tiles); the first photograph's fog **dissolves into the paper**.

---

## 2. Tokens

All in `src/assets/css/00-tokens.css`. Reach for a token, not a raw value.

### Colour

| Token | Value | Use |
|---|---|---|
| `--paper` | `#F4EFE6` | The page. |
| `--paper-2` | `#EBE4D6` | A deeper sheet: bands (`.section--paper2`), hovers, drawer foot. |
| `--paper-3` | `#FBF8F2` | A brighter sheet: menus, the manifest, inputs, the map margin. |
| `--ink` | `#12201B` | Spruce-black. Text, rules, footer, dateline. |
| `--ink-2` | `#36443E` | Body copy and ledes on paper (8.9:1). |
| `--ink-3` | `#59645E` | Captions and labels. 4.8:1 or better on every light sheet. Do not go lighter. |
| `--rule` / `--rule-2` | ink at 16% / 34% | Hairlines. `--rule-2` where the line must hold a table together. |
| `--yellow` | `#F5B800` | UCM yellow. **Signal only**: primary button, the small square marker, the needle tick, the underline under a current link or a phone number, the manifest's offset. Never a section background, never text on paper (1.6:1). |
| `--yellow-2` | `#E0A600` | Yellow, pressed. |
| `--sea` | `#1E4A57` | The cold accent, deep. Map linework, sea names. |
| `--deep` / `--deep-2` | `#0F242C` / `#17323C` | The dark sheet: a crossing, water, night (`.section--deep`). |
| `--glacier` | `#A9C6C8` | The cold accent, light. Labels and emphasis on dark. |
| `--ice` | `#E2EAE8` | A pale cold sheet for the far north (`.section--ice`). |
| `--water` | `#DCE6E4` | Map water. |
| `--on-dark` / `--on-dark-2` | `#F4EFE6` / `#C4CFCC` | Text on `--deep` and `--ink`. |
| `--open` | `#1C6B45` | "Open now" on light sheets (`#8FD3AE` on dark). |

Sheets set their own custom properties, so components adapt without modifiers: inside
`.section--deep`, `--ink-2`, `--ink-3` and `--rule*` already point at the dark-sheet values.

**Sequence of sheets on a journey page:** paper → deep (the water) → paper → ice (the far north) →
paper → paper-2 → ink footer. One dark sheet per page is plenty; the site is light first.

### Type

Three families, four files, 114 KB, all self-hosted (`scripts/fonts.py`):

| Role | Family | Token | Notes |
|---|---|---|---|
| Display | **Fraunces** (variable, roman 300–560 and italic 300–500, optical size pinned at 144) | `--serif` | Headlines, city names, big figures, list names. Light weights (340–400) at large sizes; 440–480 below 1.5rem so the hairlines survive. |
| Text | **Instrument Sans** (variable 400–700) | `--sans` | Body, ledes, buttons, navigation, phone numbers (600, tabular). |
| Data | **DM Mono** 400 | `--mono` | Latitudes, captions, labels, table heads. Usually uppercase with `.1em` tracking. |

| Token | Size | Class |
|---|---|---|
| `--t-display` | 2.9rem → 7.5rem | `.display` (cover) |
| `--t-h1` | 2.75rem → 6.5rem | `.phero__title` (inner-page h1) |
| `--t-h2` | 2.125rem → 4.375rem | `.h2` |
| `--t-h3` | 1.5rem → 2.25rem | `.h3` |
| `--t-h4` | 1.375rem | `.h4`, `.steps__title` |
| `--t-lede` | 1.125rem → 1.375rem | `.lede` |
| `--t-body` | 1.0625rem | body |
| `--t-small` | .9375rem | secondary copy |
| `--t-caption` | .8125rem | captions (mono) |
| `--t-label` | .75rem | `.label` (mono, uppercase) |

Rules of the voice:

- **One italic phrase per headline** (`<em>`), and it carries the point: "Down the road, or *across
  an ocean.*" In chapter heads the italic phrase breaks onto its own line.
- Headline leading is tight (.94–1.0), tracking negative (−.02 to −.03em). `text-wrap: balance` is on.
- Latitudes are written as the fact sheet gives them: one decimal, `47.4°N`. Use `deg()` and `LAT`
  from `components.mjs`; never type one by hand.
- Labels are mono, uppercase, `--ink-3`. A label that opens a block gets the yellow square
  (`.chead__no::before`, `.phero__eyebrow::before`).
- Numbers people dial are sans 600 with `font-variant-numeric: tabular-nums`.

### Space, shape, shadow

- Scale: `--s-1` … `--s-10` = 4, 8, 12, 16, 24, 32, 48, 64, 96, 128 px.
- `--section` (4.5rem → 10rem) is the gap between sections; use `.section` or `padding-block: var(--section)`.
- `--gutter` (18px → 56px) is the page margin; `--col-gap` (16px → 28px) the column gap.
- `--max` 82.5rem (1320px) of content; `--rail` 4rem margin column from 1000px up; `--mast` masthead
  height (3.75rem, 4.5rem from 1000px); `--bar` the phone action bar height.
- Radius: `--r-0` 0 for photographs, plates, cards; `--r-1` 2px for buttons and inputs; `--r-pill`
  only for dots. **Print has square corners.**
- Shadow: `--shadow-2` for things that sit above the page (menu, call sheet, the archive print). The
  manifest's "shadow" is a solid yellow offset, not a blur.

### Motion

| Token | Value | Use |
|---|---|---|
| `--ease` | `cubic-bezier(.2,.7,.2,1)` | Settling: reveals, hovers. |
| `--ease-io` | `cubic-bezier(.6,0,.25,1)` | Drawing: map lanes. |
| `--d-1` | .18s | Hover, press. |
| `--d-2` | .42s | Menus, sheets, arrows. |
| `--d-3` | .9s | Reveals. |
| `--d-4` | 1.5s | A lane drawing. |

Rules (see §8): slow and photographic; things settle, nothing bounces, nothing loops except the
quiet pulse on a yard mark. Only `transform`, `opacity`, `clip-path`, `translate`/`scale` and SVG
`stroke-dashoffset` are animated.

---

## 3. Grid and layout

- `.wrap` — the content column: `min(100% − 2 × gutter, 1320px)`, centred.
- `.grid` — 12 columns, `--col-gap`. Most spreads are asymmetric: 7 / 5, 6.2 / 5.8, 5 / 7, 8 / 4.
  Avoid 6 / 6 and avoid three equal cards as a default.
- **The margin column.** From 1000px up, `main` and `.footer` leave `--rail` (64px) on the left. It
  holds the rail; the yellow mark in the masthead sits exactly over it. The margin exists on every
  page so the chrome never shifts between pages.
- **Full bleed** means from the margin column to the right edge: put the element outside `.wrap`
  (`.fig--bleed`, `.phero__media`, `.interlude`).
- One breakpoint does the heavy lifting: **1000px** (phone/tablet chrome ↔ desktop chrome, rail on).
  Others: 600, 700, 760, 900, 1100, 1200, 1400 for local adjustments.
- Section rhythm: opener (`.chead` or `.shead`) → one large photograph or the main object → detail
  in an asymmetric split → a closing line or action. Do not stack more than two text-only blocks
  without a photograph, a figure or a ruled list between them.

---

## 4. Files

```
src/assets/css/00-tokens.css     fonts and custom properties
src/assets/css/10-base.css       reset, type classes, .wrap/.grid/.section, buttons, links, status, reveal states
src/assets/css/20-chrome.css     brand, dateline, masthead, product menu, rail, phone menu, call sheet, action bar, footer
src/assets/css/30-components.css everything shared between pages (this file's §6)
src/assets/css/pages/home.css    cover, prologue, chapter-specific pieces, coda, directory
src/assets/css/pages/alaska.css  region finder, modes, questions
src/assets/js/00-core.js         $ and $$, dialogs, typing class, live yard hours
src/assets/js/10-forms.js        projects filter, quote and credit forms
src/assets/js/modules/*.js       reveal, rail, parallax, menu, stock, plate
```

`build.mjs` joins CSS and JS in name order. **A new page gets `pages/<name>.css`** for anything not in
§6, and a module in `js/modules/` if it needs behaviour. JS files share only `$` and `$$`; each is its
own closure and must do nothing when its elements are absent.

Templates: `src/lib/layout.mjs` (chrome), `src/lib/components.mjs` (every function named below),
`src/lib/icons.mjs`, `src/lib/forms.mjs`.

---

## 5. Chrome

### Dateline — `.dateline`
Ink strip above the masthead from 1000px: the three yards with phone links and live status; latitudes
join at 1400px. The links on the right wrap out of sight before a phone number is ever cut.

### Masthead — `.masthead`
Sticky, paper, hairline under. Mark over the margin column, wordmark "Uresco" in Fraunces 560 with a
mono descriptor. Desktop: navigation, `Call a yard` (opens the sheet, from 1280px), `Request a quote`.
Below 1000px: wordmark, the latitude reading (`.latchip`, journey pages only), menu button.

### Products menu — `.mega`
A full-width index of the nine lines (number, thumbnail, name, first three items). Opens on hover
with CSS; the caret button (`.nav__toggle`, `aria-expanded`) opens it for keyboard and touch;
Escape closes. Without JavaScript the Products link goes to `/products/`.

### The rail — `.rail` (see §7)

### Phone menu — `dialog.drawer#drawer`
A full sheet of paper: numbered links in the display serif, minor links, then a `--paper-2` foot with
the quote button and all three numbers.

### Call sheet — `dialog.sheet#call-sheet`
Opened by any `[data-open="call-sheet"]`. Each yard: latitude, live status, city, street, a full-width
yellow number and a directions button. Bottom sheet on phones, centred card from 700px.

### Action bar — `.actionbar`
Below 1000px, fixed to the bottom: **Call** (opens the sheet) · **Directions** · **Quote** (yellow).
It slides away while a form field has focus (`body.is-typing`).

### Footer — `.footer`
Ink. The tagline at display size, two buttons, the three yards and the index, then the legal line.
On phones each yard is one row: name, number, status.

---

## 6. Components

Each is a function in `src/lib/components.mjs` unless marked "markup only".

### Type and small pieces

```html
<p class="label">Brands we carry</p>
<p class="lede">…</p>
<a class="btn" href="…">Request a quote <svg class="i">…</svg></a>   <!-- yellow; the one primary action -->
<a class="btn btn--line" href="…">Send plans</a>                      <!-- secondary -->
<a class="btn btn--dark" href="…">Apply for an account</a>            <!-- when yellow is already on screen -->
<a class="btn btn--sm" …>   <a class="btn btn--block" …>
<a class="link" href="…">The Kent yard <svg class="i">…</svg></a>     <!-- text link with a rule and an arrow -->
<div class="actions">…buttons…</div>
```
`openStatus(l)` prints the live open/closed badge (`.status`, filled in by `00-core.js`); pass
`{ short: true }` for "Open"/"Closed" only.

### Photograph — `figure(ctx, key, opts)` → `.fig`

```html
<figure class="fig fig--cine fig--bleed">
  <div class="fig__frame rv-img" data-parallax><img …></div>
  <figcaption class="fig__cap"><span>A tug and a loaded barge under way.</span><span class="fig__place">Utqiaġvik · 71.3°N</span></figcaption>
</figure>
```
Options: `ratio` = `cine` (21:9, 4:3 on phones) · `wide` (16:9) · `land` (3:2) · `sq` · `port` (4:5) ·
`tall` (3:4); `caption` (what it shows); `place` + `lat` (where; prints the yellow square and the
latitude); `parallax`; `reveal` (default on); `art` (use the 3:4 phone crop); `pos` (object-position
for this placement); `sizes`; `cls: 'fig--bleed'` for edge to edge.

### Chapter opener — `chapterHead({ no, kicker, lat, to, title, lede, id, tag })` → `.chead`
For journey pages. A ruled bar (`01 · KENT, WASHINGTON ……… 47.4°N`), then the latitude the chapter
arrives at set at up to 13.5rem beside the headline and standfirst. `to` makes it a travelling chapter
(`From 47.4°N to` / `61.2`). The big figure is decorative (`aria-hidden`); the bar carries the same
information as text.

### Section opener — `sectionHead({ no, eyebrow, title, lede, action, id })` → `.shead`
For inner pages and codas: the same ruled bar, headline left, lede and an optional `.link` right.

### Page hero — `pageHero(ctx, { crumbs, eyebrow, title, lede, actions, photoKey, caption, place, lat, pos, attrs })` → `.phero`
**The inner-page pattern: type on paper first, then the photograph.** Breadcrumb (mono), eyebrow with
the yellow square, an `h1` at `--t-h1` with one italic phrase, then a row with the lede on the left and
up to two buttons on the right, then a full-bleed band (`.phero__frame`, 16rem → 40rem tall, parallax)
with a caption under it. Use `heroSizes(key)` / `preloadFor(ctx, key)` so the preload matches the image.
A panorama should not set `"art": true` in `photos.json`. `.phero--plain` is the variant without a
photograph, for pages that open on a form (quote, accounts).

### Yard strip — `yardsStrip(ctx)` → `.ystrip`
Three ruled cells, each a phone link: latitude and role, live status, city in the serif, number.
Used under the cover; fine under any hero where calling is the point.

### Yard spread — `yardSpread(ctx, location, { photoKey, caption, place, flip, pos, attrs })` → `.spread`
A yard as a magazine spread: a 5:4 photograph of the *place* (never captioned as the yard) and, beside
it, latitude and role, the city at up to 7rem, blurb, a ruled list (`.yard__lines`: yard, phone and
status, toll-free, email), `Call` and `Directions` buttons and a quote link that preselects the yard.
Alternate `flip`. On phones: photograph, then details, with a rule between spreads.

### Yard card — `yardCard(ctx, location, { compact, showPhoto, headingLevel })` → `.yard`
The full record (adds fax, hours, mailing address) for the locations and region pages, in a
`.yards` grid (`.yards--2` for two).

### Steps — `steps([[title, body], …])` → `ol.steps`
Numbered in mono, titles in the serif, a rule above each. Four across from 900px, a ruled list below.

### Manifest — `manifest(ctx, { title, body, rows, id })` → `.manifest`
The quote prompt, drawn as a freight form: a head strip (`Estimates & take-offs` / `Form 01 · Request
for quote`), the pitch with `Request a quote` and `Send plans`, and a ruled list of what goes in and
what comes back (`Send / To / Returns / Ships`). Bright paper, ink border, solid yellow offset. One per
page, near the end of the argument it closes. `quoteBand(ctx, opts)` wraps it in a deep section for
pages that only need the band.

### Stock list — markup only, see `home.mjs` → `.stock`
The product lines as a numbered index. From 1000px a sticky frame on the left shows the photograph of
the line being pointed at or focused (`modules/stock.js`; pictures are fetched on demand). On phones
each row carries a 60px thumbnail instead. Follow it with `.brandline` (brands in italic serif).

### Route plate — `routePlate(ctx, { no, title, id })` → `figure.plate`
`assets/map.svg` (the base sheet, written by `plateSvg()` at build) with an inline SVG of lanes and
marks and HTML labels over it. Lanes: ocean freight (solid sea), road system (cased double line),
barge (dashed), air (dotted). Yard marks are yellow discs ringed in ink; yard labels are links to
`/locations/#id`. Below 47rem of width the sheet keeps its size and pans sideways inside its frame
(`modules/plate.js` starts it on mainland Alaska and makes the frame focusable). Add
`data-show="<region>"` on the figure to bring one region's places forward (see `pages/alaska.css`).
To change geography edit `scripts/map.mjs` and regenerate `src/data/map.json`.

### Interlude — `interlude(ctx, key, { line, note, place, lat, pos })` → `.interlude`
One photograph edge to edge, its caption, and one line at `--t-h2` under it. Use it once a page, where
the argument needs air.

### Pull line — markup only → `p.pull`
One sentence at up to 5rem with a short yellow rule above. It is the site talking, **never a quotation
or a testimonial**; no quotation marks, no attribution.

### FAQ — `faq([[q, a], …])` → `.faq`
Native `<details>`; questions in the serif, a chevron that turns.

### Callout — markup only → `.callout`
An icon and a paragraph in a ruled box with a yellow left edge. For one caveat that matters (the barge
season).

### Forms — `src/lib/forms.mjs` → `.form`, `.fieldset`, `.field`, `.seg`, `.drop`, `.notice`
Restyled, not yet designed in detail: bright-paper inputs with an ink-3 border, serif legends with a
mono number, segmented radios that invert when chosen. The quote and accounts pages need a proper pass.

### Left for the page builders
`.tiles`, `.catalog`, `.proj-grid`, `.split`, `.chips`, `.aside`, `.qlayout` and friends at the bottom
of `30-components.css` only keep the unbuilt pages legible. Replace them page by page (suggestions in §10).

---

## 7. The latitude rail

Turn it on by passing stops to `layout()` and marking sections:

```js
layout(ctx, { …, rail: [{ id: 'kent', lat: LAT.kent, name: 'Kent' }, …] })
```
```html
<section id="kent" data-lat="47.4" data-place="Kent">…</section>
<section id="crossing" data-lat="47.4" data-lat-to="61.2" data-place="At sea" data-place-end="Anchorage">…</section>
```

- `data-lat` is where the section sits; `data-lat-to` makes the reading travel across the middle 75%
  of the section's height; `data-place` is the word under the reading (keep it to nine characters or
  fewer: it has to fit beside the wordmark on a phone); `data-place-end` replaces it on arrival.
- Stops are links to section ids, so the rail is also chapter navigation (`nav[aria-label]`).
- Without stops a page still gets the margin column; add a rail only where the page really runs
  south to north. Good candidates: Locations (the three yards, 47.4 → 64.8), Projects if ordered by
  place. Poor candidates: quote, accounts.
- `modules/rail.js` moves one element with `transform` and rewrites two short strings; it measures
  on load, resize and when `main` changes height.
- Without JavaScript the scale and stops remain and the needle is hidden. Nothing depends on it.

---

## 8. Photography

Photography is the star, and it has to look like one shoot.

- **The house grade** is applied in the pipeline (`scripts/images.py`, `GRADE`): saturation to 82%,
  cool shadows, faintly warm highlights, a soft film curve. Loud originals get a lower `sat` in
  `photos.json` (`"grade": {"sat": 0.6}`); `"grade": false` opts a photo out. Never grade with CSS filters.
- **Choose** overcast, dusk, snow, fog, water, raw wood, working equipment. Avoid blue-sky stock,
  posed people, saturated product shots. If a bright photo is unavoidable, grade it down and use it small.
- **Crop generously.** `cine` for landscapes and water; `port` and `tall` for equipment and stacks.
  Let a photograph run off the edge (`fig--bleed`) at least once per chapter.
- **Caption like a magazine:** what it shows, then where and how far north —
  `A working pier under fog and new snow.` · `▪ VALDEZ, ALASKA · 61.1°N`. If the place is not known,
  give only the description. **Never caption a stock photograph as Uresco's own** yard, truck, staff or
  job. Uresco's own photos are the `uresco-*` keys; they are small, so show them as an archive print
  (`figure.print`: white border, slight tilt, mono caption "From the Uresco archive: …").
- Every image goes through `picture()` (responsive `srcset`, dimensions, average-colour placeholder).
  `sizes` must describe the drawn width, including what `object-fit: cover` adds in a tall frame.
- Adding a photo: entry in `scripts/photos.json` (honest `alt`, `credit`, `page`), `npm run images`;
  `PHOTO-CREDITS.md` regenerates.

---

## 9. Motion

| Thing | How | Where |
|---|---|---|
| Text settles | `.rv` — fades up 18px over .9s; stagger with `style="--i:n"` (70ms steps) | Headlines, ledes, list items |
| Photograph opens | `.rv-img` on the frame — `clip-path` from the bottom over 1.1s while the image eases from 110% | Every `figure()` |
| Rule draws | `.rv-line` — the bar's underline scales in from the left | Chapter and section bars |
| Parallax | `[data-parallax]` — the image drifts ±6% of the frame's height (`translate`) | Bleed figures, page hero, spreads |
| Lanes draw | `.plate.is-in .lane` — `stroke-dashoffset`, staggered by `--d` | The route plate |
| Cover settles | CSS keyframes, once, no JavaScript | Home cover |
| Needle | `transform` on scroll | The rail |

Rules:

- Hidden states exist only under `html.js` **and** `prefers-reduced-motion: no-preference`. With
  reduced motion, or with no JavaScript, everything is visible and still. Check both before you ship.
- The LCP image is never hidden: no opacity, no full clip. The cover photograph is on screen from the
  first frame and only eases its scale.
- A reveal finishes within about a second of entering the screen. No scroll-jacking, no pinned
  sections, no autoplay, no bounce, no spin.
- Nothing is conveyed by motion or hover alone: the stock list's photographs are decoration (the rows
  are complete links), the region list reads without the map, the rail's stops are ordinary links.

---

## 10. Building the remaining pages

- **Products** (`/products/`): page hero with a wood texture (`lumber-stickered`, `pine-racking`);
  the stock list at full width as the index; brands as `.brandline`. Category pages: `pageHero`, the
  items as a ruled two-column list (name in serif, note in sans), manufacturer literature as `.link`s,
  then the manifest with the product line passed through to the quote form.
- **Services**: six services as alternating 7/5 spreads (`figure` + text), each numbered like a
  chapter bar; job-site delivery and remote packages get the largest photographs; end on the manifest.
- **Locations**: a journey page. Rail on, three `yardSpread`s south to north with full details
  (`yardCard` fields), the route plate between Kent and Anchorage, "Which yard should I call?" as a
  three-row ruled table.
- **Pacific Northwest**: Kent's `yardSpread` at hero scale, job-site delivery (boom trucks, Moffett
  forklifts), the stock list.
- **Projects**: kinds of work only (no real project list exists). Use the `.sectors` card pattern from
  the home coda at larger scale, with the sector filter as mono chips.
- **Quote / Accounts**: `.phero--plain`, the form in a 7/4 split with a sticky aside styled as the
  manifest's rows (what happens next), the three numbers beside it. Design the form fields properly.
- **About**: the standfirst treatment from the home prologue (`.prologue__text`), the mission as a pull
  line, the archive prints at larger scale, `35+ years` as a big figure in the chapter-head style.

Every page: one `h1`; yellow for one primary action per screen; a phone number within one tap
(the dateline, the action bar and the call sheet already guarantee it); captions on every photograph.

---

## 11. Do and don't

**Do**
- Set headlines large and light, with one italic phrase.
- Put a latitude wherever a place is named.
- Use rules, numbers and mono labels to organise; let lists be lists.
- Keep sections asymmetric and let photographs bleed.
- Write like a person who ships lumber: short, concrete, no superlatives.

**Don't**
- Fill a section with yellow, or set yellow text on paper.
- Round corners, add drop shadows to cards, or put text over the dark part of a photograph.
- Use three equal cards with icons as a default layout, or a grid of photo tiles for navigation.
- Add a second dark section, a carousel, a counter that counts up, or a quotation that reads like a
  testimonial.
- State a fact that is not in `src/data/*.mjs` or the fact sheet: no customers, projects, awards,
  staff, prices, transit times, tonnage. Hours are placeholders; show live status, never sell hours.
- Hide content behind motion or JavaScript.

---

## 12. Checks before you call a page done

```bash
node build.mjs                                   # builds docs/
node tests/check.mjs                             # links, one h1, alt text, 5 widths, forms, dialogs, the fold
node <tools>/shots.cjs http://localhost:PORT/ <dir> <page>/   # then look at every frame, phone first
node <tools>/axe.mjs http://localhost:PORT/ <page>/
<tools>/lighthouse.sh http://localhost:PORT/<page>/ out.json
```

Also: 320px to 2560px with no sideways scroll; keyboard through the masthead, menu, any dialog;
JavaScript off; reduced motion on.
