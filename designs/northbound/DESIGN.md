# NORTHBOUND — the Uresco design system

Direction A of the redesign. Every page is built; this file is what you need to change one or add
another in the same system without asking anyone. §13 maps each page's parts by selector and file.

---

## 1. The idea, in three sentences

The site is a trip north. Uresco's story is distance: a load that leaves a yard in the Puget Sound region at
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
| `--ink` | `#12201B` | Spruce-black. Text and rules. |
| `--black` | `#0E0E0C` | UCM black, the mark's: the dateline, the footer and the Call control. |
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
- Fraunces is pinned at its 144-point optical size, so below 1.5rem it must be at weight 480 (roman) or
  460 (italic), or the hairlines break up.
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
- There is no grid class: each layout writes its own `grid-template-columns` with `--col-gap`. Most
  spreads are asymmetric: 7 / 5, 6.2 / 5.8, 5 / 7, 8 / 4. Avoid 6 / 6 and three equal cards as a default.
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
src/assets/css/10-base.css       reset, type classes, .wrap/.section, buttons, links, status, reveal states
src/assets/css/20-chrome.css     brand, dateline, masthead, product menu, rail, dialogs, phone menu, call sheet, action bar, footer
src/assets/css/30-components.css everything shared between pages (§6)
src/assets/css/40-forms.css      the quote request and the credit application, on screen
src/assets/css/90-print.css      the paper copy of the credit application
src/assets/css/pages/*.css       one file a page (§13); a prefix each, so nothing leaks
src/assets/js/00-core.js         $ and $$, dialogs, typing class, live yard status
src/assets/js/10-forms.js        the two forms: validation, drafts, file list, hand-off
src/assets/js/modules/*.js       reveal, rail, parallax, menu, stock, motion (pause), placefinder (Alaska), products (finder), projects (filter), locations (clocks)
```

`build.mjs` joins CSS and JS in name order. **A new page gets `pages/<name>.css`** for anything not in
§6, and a module in `js/modules/` if it needs behaviour. JS files share only `$` and `$$`; each is its
own closure and must do nothing when its elements are absent.

Templates: `src/lib/layout.mjs` (chrome), `src/lib/components.mjs` (every function named below),
`src/lib/icons.mjs`, `src/lib/forms.mjs`.

---

## 5. Chrome

### Dateline — `.dateline`
Black strip above the masthead from 1000px: the three yards with phone links and live status; latitudes
join at 1400px, `Open an account` at 1100px. Nothing is clipped: what will not fit is not shown.

### Masthead — `.masthead`
Sticky, paper, hairline under. Mark over the margin column, wordmark "Uresco" in Fraunces 560 with a
mono descriptor. The Call control (`.masthead__call`) shows at every width, black with a yellow handset:
`Call` to 599px, `Call a yard` to 999px, `Call` to 1279px, `Call a yard` from there (`.masthead__more`).
`Request a quote` from 1000px, shortened to `Quote` up to 1099px. Below 1000px: wordmark, Call, Menu.
The quote links in the chrome carry the page's context (`?product=` on a line page, `?yard=kent` on
Pacific Northwest, `?yard=anchorage` on Alaska).

The latitude reading (`.latchip`) sits in the descriptor's slot on journey pages below 1000px. It takes
over only inside a chapter, past the first screen (`.masthead.is-reading`), and never over the region
map, the home coda or the yard directory.

### Products menu — `.mega`
A full-width index of the nine lines (number, thumbnail, name, first three items). Opens on hover
with CSS; the caret button (`.nav__toggle`, `aria-expanded`) opens it for keyboard and touch and is
hidden without JavaScript; Escape closes. Without JavaScript the Products link goes to `/products/`.

### The rail — `.rail` (see §7)

### Phone menu — `dialog.drawer#drawer`
A full sheet of paper: numbered links in the display serif, Products as an expanding row (native
`<details>` with all nine lines, open by default on product pages), minor links, then a `--paper-2` foot
with `Request a quote`, `Open an account` and all three numbers.

### Call sheet — `dialog.sheet#call-sheet`
Titled `Call or visit a yard`. Opened by any `[data-open="call-sheet"]`. Each yard: latitude and who it
is for (`callFor` in `locations.mjs`), live status, city and street, the number beside a labelled
Directions button, then email, fax and a Details link. Bottom sheet on phones, centred card from
700px. Fits 390x844 without scrolling. Tel, mail and map links leave it open; a click on the backdrop
closes it, a click on its own padding does not. On the Alaska page Kent moves to the end.

**Every dialog opener is a link**: `callLink(ctx)` writes `<a href="locations/" data-open="call-sheet">`,
and Menu is `<a href="#footer-index" data-open="drawer">`. `00-core.js` opens the dialog when it can;
without JavaScript the link is followed. `tests/check.mjs` fails on a `<button data-open>`.

### Action bar — `.actionbar`
Below 1000px, fixed to the bottom: **Call** and **Directions** (both open the sheet; both links to
`locations/` without JavaScript) · **Quote** (yellow, with the page's context). It slides away while a
form field has focus (`body.is-typing`).

### Footer — `.footer`
Black, under a 4px yellow rule. The tagline at display size, two buttons, the three yards (status,
number, toll-free, email, fax, address at every width) and the index (`#footer-index`), then the
legal line. On phones each yard is one row: name, number, status.

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
`callLink(ctx, { text, cls, size, attrs })` is the Call control for any page body: a link to the yards
that opens the call sheet. `openStatus(l)` prints the live open/closed badge (`.status`, filled in by
`00-core.js`). It only ever says `Open` or `Closed`, never a time.

### Photograph — `figure(ctx, key, opts)` → `.fig`

```html
<figure class="fig fig--cine fig--bleed">
  <div class="fig__frame rv-img" data-parallax><img …></div>
  <figcaption class="fig__cap"><span>A tug and a loaded barge under way.</span><span class="fig__place">Utqiaġvik · 71.3°N</span></figcaption>
</figure>
```
Options: `ratio` = `cine` (21:9, 4:3 on phones) · `wide` (16:9, the default) · `land` (3:2) · `port` (4:5) ·
`tall` (3:4); `caption` (what it shows); `place` + `lat` (where; prints the yellow square and the
latitude); `parallax`; `reveal` (default on); `art` (use the 3:4 phone crop); `pos` (object-position
for this placement); `sizes`; `cls: 'fig--bleed'` for edge to edge; `credit` (default on).
Every stock photograph with a caption prints its photographer after it (`Photo: Joseph Corl / Unsplash`,
from `photos.json`, in `.fig__credit`), so none can be taken for Uresco's own. `pageHero()` and
`interlude()` take the same option. Uresco's own `uresco-*` keys print no credit.

### Chapter opener — `chapterHead({ no, kicker, lat, to, title, lede, id, tag })` → `.chead`
For journey pages. A ruled bar (`01 · KENT, WASHINGTON ……… 47.4°N`), then the latitude the chapter
arrives at set at up to 13.5rem beside the headline and standfirst. `to` makes it a travelling chapter
(`From 47.4°N to` / `61.2`). The big figure is decorative (`aria-hidden`); the bar carries the same
information as text.

### Section opener — `sectionHead({ no, eyebrow, title, lede, action, id })` → `.shead`
For inner pages and codas: the same ruled bar, headline left, lede and an optional `.link` right.

### Page hero — `pageHero(ctx, { crumbs, eyebrow, title, lede, actions, photoKey, caption, place, lat, pos, attrs, cls, after, tail })` → `.phero`
**The inner-page pattern: type on paper first, then the photograph.** Breadcrumb (mono; `crumbs` is
`[[text, href?], …]`, Home is added), eyebrow with the yellow square, an `h1` at `--t-h1` with one italic
phrase, then a row with the lede on the left and up to two buttons on the right, then a full-bleed band
(`.phero__frame`, 16rem → 40rem tall, parallax) with a caption under it (the photographer's name
follows automatically; `credit: false` drops it). Pass `preloadFor(ctx, key)` to `layout()` so the
preload matches the image. A panorama should not set `"art": true` in `photos.json`.
Without `photoKey` it is the plain variant `.phero--plain`, for pages that open on a form or a tool
(quote, accounts, Alaska). `after` adds something between the headline and that row (the accounts
ladder, Alaska's lede); `tail` adds something after it (the phone numbers on the two form pages).

### Yard strip — `yardsStrip(ctx)` → `.ystrip`
Three ruled cells, each a phone link: latitude and role, live status, city in the serif, number.
Used under the cover; fine under any hero where calling is the point. Stacked below 760px, three
across from there. Each cell is its own container, so it answers to its own width, not the
screen's: as it narrows, the state and the handset go (20.5rem), the type comes down a size (17.5rem),
and finally the number takes its own row and the role drops from the latitude line (15.75rem). A
yard's name must never run into its number; `tests/check.mjs` holds it to that at every width that
has ever broken it. Do not patch it per page.

### Yard spread — `yardSpread(ctx, location, { photoKey, caption, place, flip, pos, attrs })` → `.spread`
A yard as a magazine spread: a 5:4 photograph of the *place* (never captioned as the yard) and, beside
it, latitude and role, the city at up to 7rem, blurb, a ruled list (`.yard__lines`: yard, phone with
the live status and the clock it runs on (`Alaska time`), toll-free, fax, email), `Call` and
`Directions` buttons and a quote link that preselects the yard. Alternate `flip`. On phones:
photograph, then details, with a rule between spreads. Numbers and addresses are at least 44px tall
on touch screens. The live status is the short one (`Open`, `Closed`): no times here.

### A yard's details — `.yard__lines`, `.yard__tel`, `.yard__actions`, `.yard__quote`
The ruled address, phone, toll-free, fax and email rows used by `yardSpread()` and by the Kent record on
Pacific Northwest. **Hours are placeholders and appear only on the Locations page**, in its own
`.lcx-hours` block; everywhere else a yard shows its live status alone.

### Steps — `steps([[title, body], …])` → `ol.steps`
Numbered in mono, titles in the serif, a rule above each. Four across from 900px, a ruled list below.

### Manifest — `manifest(ctx, { title, body, rows, id, query, cta, headingLevel })` → `.manifest`
The quote prompt, drawn as a freight form: a head strip (`Estimates & take-offs` / `Request for
quote`), the pitch with the primary button and `Send plans`, and a ruled list of what goes in and what
comes back (`Send / To / Returns / Ships`). Bright paper, ink border, solid yellow offset. One per
page, near the end of the argument it closes.

Options: `query` is added to both buttons, so the form opens knowing what the visitor was looking at
(`?product=<URL-encoded line>`, `?yard=kent`, `?location=<place>`). `cta` is the primary button's
wording (`Quote this line`). `headingLevel` (default 3) keeps the outline right: pass 2 when the
manifest opens its own section. Never number it: the company has no "Form 01".

### Closing — `closing(ctx, { ...manifest options, lead, more, label })` → `section.closing`
How most pages end: the manifest (at `h2`), then a mono line (`Or call the yard nearest the job`), an
optional link beside it (`more`), and the yard strip, on `--paper-2`. Alaska, Products, every line page,
Services, Projects, Pacific Northwest and Locations all end on it; `tests/check.mjs` holds them to that.
The two form pages have the form instead, and close on the three numbers at headline size
(`closingYards()` in `forms.mjs`); Home closes on the directory, About on its own call to action with
the strip.

### Stock list — `stockFrame(ctx, { sizes, caption })` and `stockList(ctx, { extra })` → `.stock`
The product lines as a numbered index, inside `<div class="stock" data-stock>`. From 1000px a sticky frame
on the left shows the photograph of the line being pointed at or focused (`modules/stock.js`; pictures
are fetched on demand); it is decoration, so it is `aria-hidden`. Every row shows the number, the name
and every item in the line on as many lines as it takes: a product list never ends in an ellipsis. Beside
each row `.stock__add` (`+ Quote`) goes to the form with that line on it; `extra` adds to those links
(`&yard=kent`). On hover or focus a band fades in behind the row and its text slides by `translate`;
nothing changes size. Follow the list with `.brandline` (brands in italic serif) and `.stocknote` (what
else the yard carries).

`stockRow(ctx, c)` inside `<ol class="stock__list stock__list--thumbs">` is the short version for a
page's related lines: thumbnail, name, items, no frame beside it.

### Service rows — markup only → `.svc__list`, `.svc__list--lg`, `.svc__go`
Links on the dark sheet: icon, name and one line in `<span>`, an arrow. `--lg` for a short list with the
width to itself (the line pages).

### Archive print — markup only → `figure.print`
A Uresco photograph at the size it deserves: white border, mono caption, a slight tilt set where it is
used. `.print--over` hangs it over a corner of a larger photograph; `.print--inline` sits in the flow;
`.print--archive` (home), `.pnw-print` and `.abt-print` only add size and tilt. Caption by what it
shows, usually starting `From the Uresco archive:`. The photo of the printed tag is captioned `The tag
on a Uresco load`, never as truck lettering, and its alt text in `photos.json` says the same.

### Route plate — `routePlate(ctx, { no, title, id })` → `figure.plate`
`assets/map.svg` (the base sheet, written by `plateSvg()` at build) with an inline SVG of lanes and
marks and HTML labels over it. Lanes: ocean freight (solid sea), road system (cased double line),
barge (dashed), air (dotted). Yard marks are yellow discs ringed in ink; yard labels are links to
`/locations/#id`. The plate never pans. In a frame under 54rem wide (container query on
`.plate__scroll`, so it also applies to a narrow column on a wide screen) the sheet is **re-cut** to
Kent-to-Utqiaġvik: its three layers are enlarged and shifted, the blank margin and the edge marks
go, and the line weights come up. Under 39rem it is the **phone cut**: heavier again, only the
places a load is named to, the title short, and a few labels on a different side of their marks
(`PHONE_SIDE` in `components.mjs`, read through `data-pside`). Below 700px of screen it runs edge to
edge. The yard labels are small to read and at least 44px tall to tap. Add `data-show="<region>"`
on the figure to bring one region's places forward (see `pages/alaska.css`). To change geography
edit `scripts/map.mjs` and regenerate `src/data/map.json`. Pacific Northwest uses the same sheet cut close
to Kent (`.pnw-chart`, Plate IV). `modules/motion.js` adds `Pause motion` beside the plate.

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

### Forms — `src/lib/forms.mjs` → `.fp-sheet`, `.fieldset`, `.field`, `.seg`, `.drop`, `.notice`
The quote request and the credit application are drawn as the manifest itself: a bright ruled sheet,
one control to a cell, `Required` written out, `data-msg` on each input for its own message.
`field`, `select`, `textarea`, `radios`, `yardSelect`, `fileDrop`, `formOpen`, `formFoot`, `doneNotice`.
Around the form: `sheetHead` (the head strip, never a form number), `slip` (`.fp-slip`, the manifest that
fills in as the visitor types, and `Check before you send` above the button on screens with no side
column), `callList` (`.fp-call`, the three numbers beside the form, one marked as answering), `dial`
(`.fp-dial`, the three numbers in one row above the form on phones), `closingYards` (`.fp-yards`). On
paper the credit application prints as a two-page Letter form (`90-print.css`, `.print-only`,
`.fp-screen-only`, `.field--paper`).

### Patterns built on the finished pages
Page-level, so they live in `pages/<page>.css`; lift one into `30-components.css` the second time it
is needed.

| Pattern | Page | What it is |
|---|---|---|
| `.prod-find`, `.prod-row` | products | The stock list with a finder (`[data-prod-q]`): typing narrows the rows and underlines the matching items; Enter opens a single match; a miss falls back to the three yard numbers. Each row is a link, and `.prod-row__quote` beside it (`Add to a quote`) goes straight to the form with that line on it. |
| `.prod-az` | products | An A to Z set like the back of a book: dot leaders, the line's number at the right. |
| `.prod-ask` | line pages | The yard slip, sticky beside the item list: what the page cannot know, and who does. Three numbers with live status. |
| `.prod-items`, `.prod-items--few` | line pages | A ruled name-and-note list; lines of two or three items are set larger. |
| `.prod-pager` | line pages | Previous and next line, wrapping round all nine. |
| `.svx-run`, `.is-sea`, `.has-leg` | services | Six stops on one line (vertical on phones, across from 900px); `.is-sea` puts a stop on map water; `.has-leg` opens a leg of the run. Each stop links to its anchor. |
| `.svx-bar` | services | A chapter bar whose service name is the `h2`, in the bar's own size and tracking. |
| `.svx-io` | services | The handoff: `You bring` / `You get`, in manifest rows. |
| `.svx-sheet` | services | A take-off sheet of the nine lines, each a link: numbered 010 to 090 like take-off lines, listing every item. |
| `.finder`, `.answer`, `.plate__dest` | alaska | "Where are you building?": an ARIA combobox over `PLACES` (`data/places.mjs`) with aliases, the typical way in and the yard to call for the chosen place, and its mark on the plate (`modules/placefinder.js`). Without JavaScript the three numbers show instead (`.finder__nojs`). Unlisted places get a graceful answer. |
| `.regions`, `.region` | alaska | The six regions as a static ruled ledger: what is there, how freight typically gets there, who to call, a quote link carrying the place. |
| `.pnw-record`, `.pnw-rig`, `.pnw-chart` | Pacific Northwest | The Kent record under a giant latitude, the two blueprint plates of the machines (they ink themselves in), the chart cut close to Kent. |
| `.lcx-board`, `.lcx-yard`, `.lcx-book` | locations | The which-yard switchboard above the photograph; each yard sorted into Call, Visit and Write, the only place the hours appear. |
| `.fp-sheet`, `.fp-slip`, `.fp-call`, `.fp-dial`, `.fp-yards`, `.ac-ladder`, `.ac-ledger` | quote, accounts | See Forms above. |
| `.abt-rings`, `.abt-form`, `.abt-promise` | about | 35 drawn growth rings, the one-sheet company record, the mission line by line with what backs each line. |
| `.pjx-filters` | projects | Sector filter as mono chips with counts, filled with `aria-pressed`, and a live status line; `.pjx-jump` replaces it without JavaScript. |
| `.pjx-sector` | projects | Sector opener: the name set large, a tail line in italic, a lede and one link. |
| `.pjx-kind--wide` / `--tall`, `.pjx-kind__list` | projects | An asymmetric pair of photographs with `On the list` as numbered take-off lines linking to the product line or service, and `Quote a job like this`, which carries the kind of work to the form. |

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
  south to north.
- `modules/rail.js` moves one element with `transform` and rewrites two short strings; it measures
  on load, resize and when `main` changes height.
- Without JavaScript the scale and stops remain and the needle is hidden. Nothing depends on it.
- Below 1000px the same reading sits under the wordmark, only inside a chapter past the first screen
  (see §5). A section marked `.coda`, or one holding `[data-finder]`, turns it off.
- Pages with a rail: Home, Alaska, Pacific Northwest, Locations. Everything else keeps the empty margin.

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
| Row settles | a band fades in behind a stock row (`opacity`) and the text slides (`translate`) | Stock list |
| Link arrow | `translate` on the icon | `.link`, buttons |

Rules:

- Anything that moves on its own can be stopped: `modules/motion.js` adds `Pause motion` beside the
  plate, wherever its yard marks pulse (and not under reduced motion). The choice sets `html.is-still`.
- Hidden states exist only under `html.js` **and** `prefers-reduced-motion: no-preference`. With
  reduced motion, or with no JavaScript, everything is visible and still. Check both before you ship.
- The LCP image is never hidden: no opacity, no full clip. The cover photograph is on screen from the
  first frame and only eases its scale.
- A reveal finishes within about a second of entering the screen. No scroll-jacking, no pinned
  sections, no autoplay, no bounce, no spin.
- Nothing is conveyed by motion or hover alone: the stock list's photographs are decoration (the rows
  are complete links), the region list reads without the map, the rail's stops are ordinary links.

---

## 10. Adding a page

- Start with `pageHero()` and pass a photograph unless the page opens on a form or a tool.
- `.section`, `sectionHead()` or `.shead__bar` for each block; a dark sheet once at most, and sheets in
  the §2 sequence.
- End on `closing()` unless the page is itself a form.
- Quote links carry what the visitor was looking at: `?product=<line name, URL-encoded>`,
  `?yard=<kent|anchorage|fairbanks>`, `?location=<place>`.
- Every Call control is `callLink()`, never a button.
- Yellow for one primary action per screen; a phone number within one tap (the dateline, the masthead
  Call, the action bar and the call sheet already guarantee it); a caption on every photograph, by what
  it literally shows.

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
- Number a form ("Form 01"), or say stock varies by yard, name one point of contact, quote a duration
  or promise the freight is priced. Print hours, or a time, anywhere but Locations. `tests/check.mjs`
  fails on the phrases the reviewers caught, in the text, the alt text and the structured data.
- Write `<button data-open>`. A control that opens something is a link to where that thing is.
- Cut a list of products with an ellipsis, or a label at the edge of the map.
- Hide content behind motion or JavaScript.

---

## 12. Checks before you call a page done

```bash
node build.mjs                                   # builds docs/
node tests/check.mjs                             # everything below
CHECK=pieces node tests/check.mjs                # the static pass and the shared pieces only
node <tools>/shots.cjs http://localhost:PORT/ <dir> <page>/   # then look at every frame, phone first
node <tools>/axe.mjs http://localhost:PORT/ <page>/
<tools>/lighthouse.sh http://localhost:PORT/<page>/ out.json
```

`tests/check.mjs`, in order: static page checks (title, description, one `h1`, alt text, unique ids,
every link, asset and `#anchor` resolves, the phrases that must never appear, no hours or times outside
Locations, no `openingHours`, every stock photo credited and none captioned as Uresco's, every number
and email from the fact sheet, no `button[data-open]`); every page at five widths in Chromium (console
errors, sideways scroll, stretched hero); the forms and dialogs; the yard numbers at the fold on ten
common screens, in the default browser and in the headless shell with
`--font-render-hinting=full`; JavaScript off (nothing dead, nothing waiting for a reveal, Call,
Directions and Menu each go somewhere); the closing band; the shared pieces (yard strip, stock list,
route plate crops, interlude, finder, pager, services anchors, projects filter).

Also: 320px to 2560px with no sideways scroll; keyboard through the masthead, menu, any dialog;
JavaScript off; reduced motion on.

---

## 13. Page map: how to pick out each page's parts

Every page starts with `.masthead` and ends with `.footer`; `.actionbar`, `#call-sheet` and `#drawer` are
on every page. Page CSS is prefixed, so a selector tells you where to look.

| Page | Source | CSS | Parts, top to bottom |
|---|---|---|---|
| Home `/` | `pages/home.mjs` | `pages/home.css` | `.cover` (`.cover__calls` numbers below 1000px, `.cover__strip` from there, `.hero__media` the LCP image) · `.prologue`, `.facts` · `.chapter--kent` `#kent`, `.kent__prints`, `#lines`, `[data-stock]`, `.account` · `.chapter--crossing` `#crossing`, `.steps`, `.svc__list`, `#manifest` · `.chapter--landfall` (two `.spread`, `#anchorage`, `#fairbanks`) · `.chapter--last` `#last-mile`, `[data-plate]` · `.coda`, `.sectors` · `.directory` `#yards`, `.dir` |
| Alaska `/alaska/` | `pages/alaska.mjs`, `data/places.mjs` | `pages/alaska.css` | `.phero--ask` · `#reach`: `.finder` (`#place-input`, `#place-list`, `[data-answer]`, `.finder__nojs`), `[data-plate]`, `.regions` · `.ask__photo` · `.legs`, `.steps` · `.modes`, `.callout` · `.yardsec` (`#anchorage`, `#fairbanks`) · `#north`, `.faq` · `.interlude` · `.closing` |
| Products `/products/` | `pages/products.mjs` | `pages/products.css` | `.phero` · `#lines`: `[data-prod-ledger]`, `#prod-q`, `[data-prod-count]`, `.prod-row` (id = line slug), `.prod-row__quote`, `[data-prod-none]` · `.prod-brands` · `#a-z`, `.prod-az__cols` · `.interlude` · `.closing` |
| A line `/products/<slug>/` | `pages/products.mjs` | `pages/products.css` | `.phero[data-prod-line]` · `.prod-in`, `.prod-items`, `.prod-makers`, `.prod-ask` · `.prod-svc`, `.svc__list--lg`, `.prod-svc__print` · `.prod-rest`, `.stock__list--thumbs`, `.prod-pager` · `.closing` (both buttons carry `?product=`) |
| Services `/services/` | `pages/services.mjs`, `data/services.mjs` | `pages/services.css` | `.phero` · `.svx-index`, `.svx-run` · `.svx-yard`: `#takeoffs`, `.svx-sheet`, `#design` · `.svx-sea`: `#remote`, `#crating`, `#shipping` · `.svx-site`: `#delivery` · `.closing` |
| Projects `/projects/` | `pages/projects.mjs`, `data/projects.mjs` | `pages/projects.css` | `.phero` · `.pjx-intro`, `[data-filters]`, `[data-pjx-status]`, `.pjx-jump` (no JavaScript) · `.pjx-sector` (`#institutional`, `#commercial`, `#residential`, `#remote-alaska`), `.pjx-kind` (id = kind) · `.pjx-turn` · `.pjx-pull-sec` · `.closing` |
| Pacific Northwest `/pacific-northwest/` | `pages/regions.mjs` | `pages/pacific-northwest.css` | `.phero[data-page=pnw]` · `#kent`, `.pnw-record`, `.pnw-prints` · `#delivery`, `.pnw-rig` · `#stock`, `[data-stock]` · `#north`, `.pnw-chart`, `.pnw-legs` · `.closing` |
| Locations `/locations/` | `pages/regions.mjs` | `pages/locations.css` | `.phero[data-page=locations]` with `.lcx-board` · `.lcx-sec` `article.yard#kent`, `.lcx-book`, `.lcx-hours` · `.lcx-chart`, `[data-plate]` · `#anchorage` · `#fairbanks` · `.closing` |
| Quote `/quote/` | `pages/quote.mjs`, `lib/forms.mjs` | `40-forms.css`, `pages/quote.css` | `.phero--plain.fp-hero`, `.fp-dial` · `.fp-band`: `form[data-form=quote]`, `#plans`, `[data-done]`, `.fp-side` · `.fp-close`, `.fp-yards` |
| Accounts `/accounts/` | `pages/accounts.mjs`, `lib/forms.mjs` | `40-forms.css`, `90-print.css`, `pages/accounts.css` | `.phero--plain.fp-hero`, `.ac-ladder`, `.fp-dial` · `.ac-what`, `.ac-ledger` · `#apply`: `form[data-form=credit]`, `[data-done]`, `.fp-side`, `.letterhead` (print) · `.fp-close`, `.fp-yards` |
| About `/about/` | `pages/about.mjs` | `pages/about.css` | `.phero` · `.abt-stand` · `.abt-years`, `.abt-rings` · `.abt-sheet`, `.abt-form` · `.abt-mission`, `.abt-promise` · `.abt-far` · `.abt-archive`, `.abt-prints` · `.abt-close` |
| Not found `404.html` | `pages/about.mjs` | `pages/about.css` | `.lost`: `.lost__head`, `.lost__fix`, `.lost__nav`, `.lost__call` (built with absolute links to the site base) |

Hooks the suite and the scripts rely on: `.ystrip__item/__city/__num/__lat`, `[data-plate]`, `.plate__scroll`,
`.manifest`, `.manifest__title`, `.closing`, `.stock__row`, `.stock__add`, `#call-sheet`, `#drawer`, `.actionbar`,
`.masthead__menu`, `.yard [data-hours]` (three on Locations), `form[data-form]`, `[data-mail-to]`, `.phero__media img`.
