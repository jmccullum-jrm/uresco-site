# Uresco — direction C: YELLOW

The design system for the bold-poster direction. Read this before building a page in it.
Every page on the site is built from what this file describes: the chrome, the page hero, the
closing band and the components below, plus a small set of page pieces listed at the end.

## The idea in three lines

1. **Yellow is the brand.** Pages are built from three flat fields: UCM yellow, black and an
   off-white paper. Yellow is the only loud colour; photographs are black-and-white so it stays so.
2. **The U is a window.** The mark is the end grain of a board: growth rings that read as concentric Us. Every photograph sits in a U
   (hangs, flat top and round bottom), an arch (the U turned over, stands on its flat bottom) or a
   pill, and the mark's rings repeat around them at poster scale.
3. **One typeface, two voices.** Archivo at its wide, black end, in capitals, is the poster voice:
   set big enough to run edge to edge. Archivo at normal width is the reading voice.

Things flip between yellow and black when touched. Motion is quick and springy. Phone numbers are
never more than one tap away.

## Files

| What | Where |
|---|---|
| Tokens | `src/assets/css/00-tokens.css` |
| Reset, wrap, fields, type, buttons, stickers, windows, rings, section head, motion | `src/assets/css/10-base.css` |
| Utility strip, masthead, Products menu, phone menu, call sheet, action bar, footer | `src/assets/css/20-chrome.css` |
| Components (marquee, seal, yard pills, product index, tiles, arcade, yard cards, ticket, divider, map, page hero, photo caption, closing band, FAQ, snapshot, ask sticker, toggle pills) | `src/assets/css/30-components.css` |
| Forms (fields, the ticket, the freight tag, the file tray, notices) | `src/assets/css/40-forms.css` |
| Print (the credit application as a two-page paper form) | `src/assets/css/90-print.css` |
| Page styles, one file per page group | `src/assets/css/pages/*.css` |
| Behaviour the tests rely on: dialogs, masthead, hours, projects filter, forms, drafts | `src/assets/js/00-core.js` |
| Motion, word swap, product index on touch, route finder, products finder, the forms' live parts | `src/assets/js/modules/*.js` |
| Templates | `src/lib/layout.mjs` (chrome), `src/lib/components.mjs` (everything reusable), `src/lib/forms.mjs` (form fields and pieces), `src/lib/drawings.mjs` (the nine product-line signs), `src/lib/icons.mjs` (24px stroke icons and the mark) |
| Yards, products, services, projects | `src/data/locations.mjs`, `products.mjs`, `services.mjs`, `projects.mjs` |
| The places the route finder and the quote form know | `src/data/places.mjs` |
| Latitudes stated on the site | `src/data/destinations.mjs` |

CSS and JS are joined in filename order by `build.mjs`. Shipped: one CSS file, one JS file, one font file (52 KB).

## Tokens

### Colour

| Token | Value | Use |
|---|---|---|
| `--yellow` | `#F5B800` | Fields, fills, type on black. Never type on paper (1.6:1). |
| `--yellow-hi` | `#FFCC33` | Pressed/hover yellow on black |
| `--yellow-deep` | `#E5A900` | Tone-on-tone rings on a yellow field |
| `--black` | `#0E0E0C` | Type, fields, keylines |
| `--black-2` / `--black-3` | `#1B1A17` / `#2E2C27` | Raised surface / rules on black |
| `--paper` | `#F7F3EA` | Reading ground |
| `--paper-2` | `#ECE6D8` | Raised surface and hairlines on paper |
| `--white` | `#FFFDF7` | Cards and stickers |
| `--stone` | `#57524A` | Quiet text on paper (7.2:1) |
| `--ash` | `#BDB7AA` | Quiet text on black (9.6:1) |
| `--umber` | `#3A2C00` | Quiet text on yellow (8.6:1) |
| `--open` | `#7BE0A0` | The "open now" dot only |

Black on yellow is 11.5:1; yellow on black the same. A section sets its field with one class
(`.field-y`, `.field-k`, `.field-p`), which also sets `--on`, `--quiet` and `--rule` for children.

### Type

One family: `Archivo` (variable, width 100–125, weight 400–900), `src/assets/fonts/archivo-wide-var.woff2`,
built by `scripts/fonts.py`. Fallback faces in `00-tokens.css` are Arial scaled per width and
weight so the swap does not move the page.

| Class / token | Size | Setting |
|---|---|---|
| Hero poster (`.hero__title`) | fills the column: `--F` | wide 125, 900, caps, lh .84, ls -.028em |
| `.d1` `--t-d1` | `clamp(2.7rem, 1.1rem + 6.6vw, 7.25rem)` | wide, 900, caps, lh .86, ls -.022em |
| `.d2` `--t-d2` | `clamp(2.05rem, 1.1rem + 4.1vw, 5rem)` | same, lh .9 |
| `.lede` `--t-lede` | `clamp(1.1rem, 1rem + .5vw, 1.4rem)` | normal width, 500, lh 1.42, max 46ch |
| body `--t-body` | `1.0625rem` | 400, lh 1.55 |
| `.eyebrow` `--t-label` | `.75rem` | wide, 750, caps, ls .09em, led by a small U |

- `--wide` is `125%`, eased to `116%` under 420px so headlines stay large on phones.
- `<em>` inside `.d1`/`.d2` is the same word in outline (hollow sign lettering). One per headline.
- Card titles use width 118, buttons and nav 112: the further from a headline, the less wide.
- Write headlines in short words. `INSTITUTIONAL.` does not fit a phone at this width; `SCHOOLS.` does.
- Numbers that line up (phones, latitudes) take `.nums` (tabular figures).
- Twelve pixels is the floor on a phone for anything a visitor needs to read (`tests/check.mjs` measures it). Card titles carry their own size from `--t-d4` upwards.

### Space, shape, shadow

| Token | Value |
|---|---|
| `--s1`…`--s8` | .25, .5, .75, 1, 1.5, 2, 3, 4 rem |
| `--gutter` | `clamp(1rem, .3rem + 3vw, 3.25rem)` |
| `--section` | `clamp(4.25rem, 2.6rem + 7vw, 9rem)` (vertical padding of a `.section`) |
| `--wrap` | `1400px` (`1640px` from 1900px wide, so the poster grows on very large screens) |
| `--r-s` / `--r-m` / `--r-l` | 10 / 20 / 32 px (inputs / cards on phones / cards) |
| `--r-pill` | 999px: buttons, pills, and the round end of every U and arch |
| `--line` | 2px: every border on the site is this keyline |
| `--sh-sticker` | `4px 4px 0 var(--black)`: hard offset, stickers only |
| `--sh-float` | soft lift for things that float (Products menu) |

### Motion

| Token | Value | Use |
|---|---|---|
| `--spring` | `cubic-bezier(.2, 1.4, .35, 1)` | Flips, pops, stickers: overshoots |
| `--out` | `cubic-bezier(.2, .7, .1, 1)` | Wipes, fades, drawers: settles |
| `--t-tap` / `--t-flip` / `--t-enter` | .14s / .28s / .55s | Colour change / hover movement / arrival |

## Grid and rhythm

- `.wrap` is the one centred column (`--wrap` plus fluid gutters). Sections write their own
  two-column split (7:4 for heads, 1:1.3 for copy and map).
- Full-bleed things sit outside `.wrap`: the product index rows, marquees, the tape, dividers.
- Section order alternates fields. Home runs Y · K(tape) · P · Y · K · P · Y(tape) · K · Y · P · K.
  Never put two sections of the same field together without a tape or a divider between them.
- Every section has: an `.eyebrow`, one `.d2` headline, at most one `.lede`, then its idea.
  Use `sectionHead({ eyebrow, title, lede, action })` (`.shead`) for headline left, lede and link right.

## Components

All of these are functions in `src/lib/components.mjs` unless marked CSS-only.

### Window — `win(ctx, photoKey, { shape, duo, sizes, eager, alt, tag, cls, thumb })`

```html
<div class="win win--u"><img …></div>            <!-- shape: 'u' | 'arch' | 'pill' | 'card' -->
<span class="win win--arch win--duo">…</span>   <!-- duo: prints the photo in yellow; black fields only -->
```
- Give the window its size (width and `aspect-ratio`) in the page's CSS; the image fills it.
- `sizes` is the width of the **window**. Windows are taller than wide, so `win()` uses the photo's
  3:4 crop (`"art": true` in `scripts/photos.json`) and asks for a wider file when only a landscape exists.
- `thumb: true` for windows never wider than ~120px (one 240px file).
- `winPreload(ctx, key, sizes)` returns the preload hint for a first-screen window.
- `after` puts extra markup inside the window, over the photograph (a `photoCaption`). Use it with `tag: 'div'`.

### Photo caption — `photoCaption(key, text, { credit, cls })` (`.wcap`)

```html
<p class="wcap"><span>A tug and a loaded freight barge</span><span class="wcap__by">Photo: Royce Fonseca / Unsplash</span></p>
```
A white label tied to the foot of a window. Nearly every photograph on the site is stock, so a
photograph says what it literally shows and who took it. It is the one way a photo is captioned:
`pageHero` and `quoteBand` take a `caption` option, and anywhere else you pass it as `after` to
`win()`. Keep `text` short and literal. Only where a window is too small to hold it (a thumbnail
under 120px wide) does a page hide the label. It is absolutely positioned (on the lowest point of a
U, inside the flat bottom of an arch), so it never moves anything. The home hero's cross-fading
caption (`.hero__cap`) and the small line under a yard card's window (`.yard__cap`) are the two exceptions, because of the slides and the card's size.

### Rings — `rings(n, { arch })`

```html
<div class="hero__art">          <!-- any positioned box the size of the window -->
  <div class="rings" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
  <div class="win win--u">…</div>
</div>
```
Concentric Us drawn as borders around the box. Tune with `--step` (spacing) and `--w` (weight);
colour is `currentColor` (`--yellow-deep` on yellow, `--black-2` on black). The parent section
needs `.clip` so rings can run off the edge.

### Eyebrow, sticker, seal

```html
<p class="eyebrow">Remote &amp; export delivery</p>
<span class="sticker sticker--y" style="--rot:-7deg">Sitka → Utqiaġvik</span>   <!-- '', --y, --k -->
```
`eyebrow(text)`, `sticker(text, { tone, rot })`, `seal(ctx, { around, big, small, cls })` (the round
badge with text running round it). Pass a seal to `pageHero` as `art` with `cls: 'phero__seal'` and it
sits on the window's left shoulder, as it does on the product lines and About. Stickers are for true facts only (see FACTS).

### Buttons and links

```html
<a class="btn">Request a quote <svg class="i">…</svg></a>   <!-- black on yellow and paper; yellow on .field-k -->
<a class="btn btn--line">…</a>   <a class="btn btn--paper">…</a>   <a class="btn btn--yellow">…</a>
<a class="btn btn--sm">…</a>     <a class="btn btn--lg">…</a>
<div class="actions">…buttons…</div>     <a class="link">All products <svg class="i">…</svg></a>
```
Always pills. Inside a yellow card that sits on a black field, add `.on-y` to the card so its
buttons and focus ring go back to black.

`callBtn(ctx, { cls, label, size, attrs })` is the one way to write "Call a yard": a link to
`locations/` carrying `data-open="call-sheet"`, so the script opens the sheet and, without the script, it
still goes somewhere. Never use a `<button>` to open the sheet or the menu. `pauseBtn({ cls })` is the
round Pause control; a hero with ambient motion on its first screen carries one, after its actions.

### Ask sticker — `.ask`, `.ask__q`, `.ask__swap`
The Alaska and Pacific Northwest question: a white speech sticker above the headline whose last
word changes (`data-swap`). Pass it to `pageHero` as `before`, with the question in a `.sr-only` span for screen readers.

### Marquee — `marquee(items, { tone, tilt, slow })`

```html
<div class="marquee marquee--k marquee--tilt" aria-hidden="true"><div class="marquee__track">
  <span>Kent</span><i></i><span>Anchorage</span><i></i>…(the run twice)…
</div></div>
```
Tones `k`, `y`, `p`. `tilt` lays it across the join between two sections like tape. Decorative:
only use words that are also in the page, and only real places (the map's) or real product lines.

### Yard pills — `yardsStrip(ctx, { stacked })` (`.ystrip`, `.ystrip--stack`)
The three numbers as large pills with live open/closed status. One row on desktop, stacked under
1000px. This is the first thing to tap on the home page; do not put anything between it and the headline but the lede.
`stacked: true` keeps one column with the city over the number at every width, for a card or an aside
(the yellow "Ask your yard" card on a product line).

### Product index — `lineIndex(ctx)` (`.lines` > `.line`)

```html
<ol class="lines" data-lines><li><a class="line" href="…">
  <span class="line__no">01</span><span class="line__name">Framing &amp; Timbers</span>
  <span class="line__items">Dimensional lumber · Timbers · …</span>
  <span class="win win--u line__win line__win--sign"><svg class="sign">…</svg></span><span class="line__go">→</span>
</a></li>…</ol>
```
Full-bleed rows on a yellow field. A row flips to black on hover and focus; its U springs larger.
On touch screens `modules/lines.js` flips the row crossing mid-screen instead (on phones the U
swells only slightly and away from the name, so it never covers the title).
Every product stays in the list: no clamping, and the trade abbreviations (LVL, GLB, OSB, XPS) stay in.

### Product-line sign — `lineWin(c, { cls })`, `lineSign(slug)` (`src/lib/drawings.mjs`)
A bold cut-paper sign for each of the nine lines, in a small U: a stud wall, a stack of sheets, an
I-joist, form panels, pickets, a gable in lap siding, the batt-insulation symbol, a window, a joist
hanger. At thumbnail size a sign reads and a grey photograph does not, so these replace photographs
wherever a list needs a picture of a line (`.line__win`, `.pl-pager__win`). They take `currentColor`:
black U with a yellow sign on yellow rows, flipped on hover and focus.

### Service tiles — `.svcs` > `.svc` (CSS-only; markup in `home.mjs`)
White keyline cards. The icon hangs from the top edge in a small yellow U (`.svc__icon`); the
whole card flips to black on hover. Rows with the U on the left on phones.

### Arcade — `.arcade` > `.arc` (CSS-only)
A row of arch windows (`win--arch win--duo` on black) with a tag, a title and a line of text.
Four across, two across, then on phones each arch stands at the left of its own row (no sideways
scrolling), as the kinds of work do on Projects.

### Yard card — `yardCard(ctx, location, { compact, photoSizes })` (`.yard`)
A freight tag: yellow head with state and latitude (`latPill(location, cls)`, the `.latpill` also used on
Locations and the Kent tag), the city, a U window of the *place* (`photo` and `photoCaption` in
`data/locations.mjs`: scenery near the yard, never the yard), then address, live status, the number as a
full pill, directions, and a link to the quote form carrying `?yard=`. `compact` is the home version (email
and fax only). `.yards` lays out three, `.yards--2` two. A yard shows only Open or Closed, never times: the
hours in the data are placeholders, and the Locations page's own markup is the only place that prints them.

### Snapshot — `snapshot(ctx, key, { caption, rot, sizes, cls, winCls })` (`.snap`)
Uresco's own small photographs (`uresco-*`), shown at their native size: a card with a keyline, the
sticker shadow, a few degrees of tilt and a yellow caption sticker. `.snap__win--tag` crops the printed tag on a load of plywood.

### Ticket — `.ticket` (CSS-only)
One wide black pill that is a single link (contractor accounts). Flips to yellow.

### Ring divider — CSS-only

```html
<section class="section field-k reach clip">
  <div class="divider divider--u" aria-hidden="true"><i class="plx"></i><i class="plx"></i><i class="plx"></i></div>
  …
```
The round bottom of a very large U in the previous field's colour (`.divider` yellow,
`.divider--p` paper, `.divider--k` black), with two rings that drift apart as the page scrolls.
Give the section extra top padding (see `.reach`, `.finder`).

### Delivery map — `deliveryMap(ctx, { compact })` (`.dmap`)
A real projection (`scripts/map.mjs`), drawn flat: yellow Alaska and Washington, seen through
an arch. Land is a cached image; lanes are a small inline SVG (they wipe in from Kent and the sea
lanes march); names are HTML pills; yards carry the mark. Under 700px it zooms to Alaska and a
chip points to Kent, with every label inside the map (Juneau and Fairbanks sit above their marks).
`compact` hides minor towns. Setting `data-mode="road|sea|barge|local"` on the figure and `.is-on` on a
`.dmap__town` or `.dmap__yard` highlights a destination (see the route finder). The legend always carries
the line that the lanes show how freight generally moves, not carrier routes or schedules.

### Page hero — `pageHero(ctx, { eyebrow, title, srTitle, lede, photoKey, caption, alt, fill, art, artCls, actions, crumbs, before, after, cls, style })`

```html
<section class="phero field-y clip">
  <div class="wrap phero__grid">
    <div class="phero__copy"> crumbs · eyebrow · [before] · <h1 class="d1 phero__title"> · lede · actions · [after] </div>
    <div class="phero__art"> rings + <div class="win win--u phero__media"> + [art] + caption </div>
  </div>
</section>
```
The start of every inner page: a yellow poster, headline left, a U hanging from the masthead on the
right inside the rings. Under 900px the U turns over and stands at the bottom as an arch. Titles over 30
characters get `.phero__title--long`. Pass `preload: [pageHeroPreload(ctx, key)]` to `layout()`.

| Option | Use |
|---|---|
| `photoKey` + `caption` | A photograph in the U and what it shows. |
| `fill` | Markup that stands in the U instead of a photograph: the forms' phone numbers (`callU()`), the paper application (`.ac-sheet`), the Locations mark. |
| `art` | Stuck on the window: a seal, a sticker. |
| `artCls` | A class on `.phero__art` for a page's own sizing (`.lc-mark`). |
| `before` / `after` | Above the headline (the ask sticker) / below the actions (the sectors, the Kent facts, the Locations dial). |
| `srTitle` | Read out ahead of a poster headline: "Request a quote: Quote this job." |
| `cls`, `style` | A page can restyle the title (Alaska's `.phero--yes` and its very large YES) and set custom properties (a line page's `--pl-fit`). |

### Closing band — `quoteBand(ctx, { title, body, label, photoKey, caption, primary, href, call, cls })` (`.qband`)
The end of every page: yellow field, an arch standing on the bottom edge inside arch rings, a `.d2`, two
large buttons. Without `photoKey` the arch holds the take-off sheet (`.tsheet`): the materials down the left,
the Qty column yellow and blank, and a "We fill in this column" sticker. Pass `caption` with a `photoKey`. `href` is where
the first button goes, for a link that carries what the visitor was looking at (`quote/?product=…`,
`?yard=kent`); `primary` relabels it ("Open an account"); `call` replaces "Call a yard" (Pacific Northwest puts Kent's number there).

### FAQ — `.faq` (CSS-only)
`<details>` rows between keylines with a round plus that turns. No script.

### Toggle pills — `.toggle` (CSS-only)
```html
<button type="button" class="toggle" aria-pressed="true">All work</button>
```
Pick one of several, on a black field: a keyline pill that turns yellow when `aria-pressed="true"`.
Used by the project sectors; the route finder's towns are the same control.

### Chrome (`layout.mjs`)
- **Utility strip** (`.utility`, 1000px and up): the three numbers with open/closed status.
- **Masthead** (`.masthead`): a yellow bar on every page; the mark in a black tile; nav links
  flip to black pills. Full nav from 1100px; below that a black `Menu` pill. A Call pill stays in the
  bar at every width (`.masthead__call`, opening the call sheet); its label and the quote button's
  shorten to "Call" and "Quote" between 1100 and 1399px, and from 1400/1520px they read in full.
- **Products menu** (`.megamenu`): a black panel hanging from the bar with a round bottom, the
  nine lines numbered as in the index. Opens on hover and on keyboard focus; no script.
- **Phone menu** (`dialog.drawer`): a full-screen yellow poster, numbered links with Products as a
  disclosure of the nine lines, the three numbers, Request a quote and Open an account. `.masthead__menu` is a link to `#site-index` (the footer's index) when the script is missing.
- **Call sheet** (`dialog.sheet`, titled "Call or visit a yard", opened by any `[data-open="call-sheet"]`): a card for each yard with its address and fax, Call and Directions side by side, email and a Details link. From the Alaska page the Alaska yards come first.
- **Action bar** (`.actionbar`, under 1000px): a floating black capsule, Call · Directions · Quote. Call and Directions open the sheet, and are links to `locations/` without the script.
- **Footer** (`.footer`): tagline, yards with live status and fax (no hours), the Explore index (`#site-index`), the product lines, and the wordmark standing on the bottom rule.

## Photography

- Black-and-white everywhere (`filter: grayscale(1) contrast(1.12)` on `.win > img`). On black
  fields use `duo` so the photo prints in yellow. Never full colour: yellow is the only colour.
- Fewer and larger. One window per section at most; tight crops; faces and subjects centred
  because the round end eats the corners.
- Add `"art": true` (and a `focal`) in `scripts/photos.json` for any photo used in a window, then
  `python3 scripts/images.py`.
- Stock photographs show places and materials. Never caption one as Uresco's yard, trucks or staff.
- Stock photographs carry a `photoCaption` saying what they literally show. Never stamp a yard's
  name or latitude on a photograph that was not taken there.
- Uresco's own archive photographs (`uresco-*`) are small. Show them at their native size with
  `snapshot()`, never enlarged into a window.

## Motion rules

- Animate only `transform`, `opacity`, `clip-path` and SVG stroke properties.
- **Arrive once:** add `data-reveal` (rise), `data-reveal="pop"` (stickers; honours `--rot`) or
  `data-reveal="wipe"`. Stagger siblings with `style="--i:n"`. Nothing is hidden without JS.
- **Flip:** hover and focus swap yellow and black in `--t-tap`; movement uses `--spring`.
- **Drift:** `.plx` ties a slow vertical drift to scroll (CSS scroll-driven; static where unsupported).
- **Ambient:** marquees, the seal, the hero ripple, the map lanes and swapping words
  (`[data-swap]`, `modules/swap.js`). They run only while on screen, stop under
  `prefers-reduced-motion`, and stop when the visitor presses a `[data-motion-toggle]` button
  (`pauseBtn()` in a hero whose first screen moves, and always in the footer; remembered across pages). Any new ambient motion must be added
  to the pause selectors at the end of `10-base.css`.
- With reduced motion every element is visible and still; words and photos stay on their first state.

## Do

- Start each page with `pageHero()` and end it with `quoteBand()`. (The home page has its own hero and ends on the three yards.)
- Keep a phone number or the call sheet within one tap in every section that asks for action.
- Let one thing per section be very large: a headline, a numeral, a window, the tape.
- Use outline `<em>` for the second half of a two-part headline.
- Give every new interactive thing the flip.
- Check 390px first: three lines of headline, then the action, then the picture.

## Don't

- Don't set yellow type on paper, or grey type on yellow (use `--umber`).
- Don't use a photograph outside a window, in colour, or with a gradient over it.
- Don't open the call sheet or the menu from a `<button>`: use `callBtn()` or a link with `data-open`.
- Don't print the yard hours anywhere but the Locations page's yard details, or claim anything the facts do not (`RULES` in the handover; `tests/check.mjs` greps the built pages).
- Don't add a fourth field colour, a second typeface, drop shadows other than the two tokens, or
  borders other than the 2px keyline.
- Don't use long words in display type, or more than one outlined phrase per headline.
- Don't rotate anything but stickers and the tape.
- Don't state anything that is not in `FACTS.md` or `src/data/`. Latitudes, the nine lines and
  the map's towns are the only numbers and places the graphics use.

## Page pieces, and how to find them

Each page group has one stylesheet and one class prefix, so anything on a page can be picked out by its
prefix. Everything else on a page comes from the shared components above.

| Page | Source | Styles | Prefix |
|---|---|---|---|
| Home | `pages/home.mjs` | `pages/home.css` | `.hero`, `.about`, `.products`, `.reach`, `.services`, `.sectors`, `.yardsec` |
| Alaska delivery | `pages/alaska.mjs` | `pages/alaska.css` | `.finder`, `.way`, `.towns`, `.legs`, `.north`, `.tape`, `.modes`, `.season`, `.faqsec` |
| Products and the nine lines | `pages/products.mjs` | `pages/products.css` | `pl-` |
| Services | `pages/services.mjs` | `pages/services.css` | `sv-` |
| Projects | `pages/projects.mjs` | `pages/projects.css` | `pj-` |
| Pacific Northwest | `pages/regions.mjs` | `pages/pacific-northwest.css` | `pn-` |
| Locations | `pages/regions.mjs` | `pages/locations.css` | `lc-` |
| About | `pages/about.mjs` | `pages/about.css` | `ab-` |
| 404 | `pages/about.mjs` | `pages/about.css` | `nf-` |
| Quote request | `pages/quote.mjs` | `pages/quote.css`, `40-forms.css` | `qt-`, `fm-` |
| Contractor accounts | `pages/accounts.mjs` | `pages/accounts.css`, `40-forms.css` | `ac-`, `fm-` |

### Home (`home.mjs`)
`.hero` is the only hero that is not `pageHero`: `.hero__title` with the swapping word (`data-swap`), the U
with its slides (`data-slides`, one photograph per word, the mark on the last), `.hero__cap`, the pause
control and `yardsStrip`. Then `.about` (the sentence with `.chip-win` thumbnails, a `snapshot` of the tag, the
`.proof` shapes and the accounts ticket), `lineIndex` under `.products`, `.askrow`, `.brands`, `.reach` (the map),
`.svcs`, `.arcade` under `.sectors`, `quoteBand`, and `.yardsec` (three compact `yardCard`s).

### Alaska (`alaska.mjs`, `modules/finder.js`)
The route finder (`section.finder#route`): a combobox over `data/places.mjs` (`#finder-input`, `#finder-list`),
seven quick chips (`.town.toggle[data-town]`), one yellow answer card (`.way`, `[data-way-*]`) and the lit
map. A place's card says how freight typically gets there and which yard to call; `[data-way-quote]` carries
`?yard=&location=` and, off the road system, `&delivery=Remote Alaska shipping`. Without the script a
`<noscript>` block shows the three yards instead. Below it: `.legs` (the four legs), `.north` and `.tape` (latitude
as a tape measure), `.modes`, `.season`, two full `yardCard`s, `.faq` (also the page's FAQPage data).

### Products (`products.mjs`, `modules/products.js`), classes `pl-`

| Piece | What it is |
|---|---|
| `.pl-find` | The Find-a-product field in a `sectionHead` action: narrows the nine rows as you type, Enter opens the first hit. Hidden (space kept) without script. |
| `.pl-line` | An index row (`li.line`) with every product as its own link; the name's `::after` covers the row. |
| `.pl-more` | The tenth row: everything that is not on the list, with a call button. |
| `.pl-brand` | Full-bleed brand rows on black, each linking to its product. |
| `--pl-fit` | A line page's hero: the widest headline line, in em, sets the title to fill its column (`FIT` in `products.mjs`). The seal is `.phero__seal`. |
| `.pl-items`, `.pl-item` | The list as keyline rows; `:target` flips the row you arrived for. |
| `.pl-makers` | The line's brand stickers and manufacturer links. |
| `.pl-send` | One wide keyline link on black ("Working from plans?"). |
| `.pl-ask.on-y` | The yellow "Ask your yard" card, with `yardsStrip(ctx, { stacked: true })`. |
| `.pl-load`, `.pl-pick` | The load ticket: tick pills that add other lines to the quote form. A plain button without script. |
| `.pl-pager` | Previous/next halves on black with a round "All 9 lines". |

### Services (`services.mjs`), classes `sv-`

One sequence, in the order a job meets the six services (`step` in the data).

| Piece | What it is |
|---|---|
| `.sv-rack`, `.sv-hook` | The six hooks under the hero, grouped On paper / Packed / On the way. |
| `.sv-stop`, `.sv-rail` | One section per service; the rail hangs the same six hooks from its top edge with the load one hook further along. Each keeps its id (`#takeoffs` …). |
| `.sv-sheet` | The take-off sheet listing the nine lines as links. |
| `.sv-pack` | A U built from the four layers of a package. |
| `.sv-wraps` | CRATED / BANDED / WRAPPED, each drawn as what it says. |
| `.sv-legs` | Three legs on a dashed lane. |
| `.sv-rig` | Boom truck and Moffett cards with a hanging icon. |

### Projects (`projects.mjs`), classes `pj-`

Kinds of work, not a list of jobs. The filter lives in `00-core.js`.

| Piece | What it is |
|---|---|
| `.pj-jump` | The four sectors as links under the hero's buttons. |
| `.pj-filter` | `.toggle` pills (`[data-filter]`) that show one sector; `/projects/#commercial` opens it. Hooks: `[data-filters]`, `[data-filter-grid]`, `[data-sector]`, `[data-kind]`, `[data-filter-status]`. |
| `.pj-sector`, `.pj-kind` | A sector and its yellow-printed arches; rows with the arch on the left on phones. |
| `.pj-yard` | Full-bleed one-tap call rows, using the site's which-yard guidance. |

### Pacific Northwest (`regions.mjs`), classes `pn-`

The sibling of the Alaska page: `.ask` over the headline, then `.pn-rigs` (a boom truck and a Moffett drawn flat in arches standing on `.pn-road`, `.pn-boom` and `.pn-fork` arriving once), `.pn-stack` (the nine lines as a strapped stack of boards, `.pn-board`), `.pn-north` with `.pn-tape` (the Alaska tape stood on end), `.pn-tag` (the Kent freight tag) and `.pn-also`. The closing band carries `?yard=kent` and Kent's number.

### Locations (`regions.mjs`), classes `lc-`

`pageHero` with the three-number `.lc-dial` as `after` and the poster mark (`.lc-mark__rings`, one labelled ring per yard) as `fill`. Then one `section.lc-band` per yard in its own field (`#kent`, `#anchorage`, `#fairbanks`), the name running edge to edge (`.lc-yard__city`, sized by `--em` and `--lsb`), and every detail in `.lc-rows`. **This is the only place the yard hours are printed.**

### About and 404 (`about.mjs`), classes `ab-`, `nf-`

Built around Uresco's real tag: a `snapshot` of it beside `.ab-card` ("LUMBER BY: UCM URESCO" with the blanks filled in), `.ab-remote`, the mission as three `.line` rows (`.ab-lines`), and `.ab-ring` (who picks up: `yardsStrip`, the emails, the accounts ticket). The 404 is a `pageHero` with `yardsStrip` as `after` and `.nf-list`; its links are absolute to `SITE.base`.

### Quote and accounts (`quote.mjs`, `accounts.mjs`, `lib/forms.mjs`, `modules/forms.js`), classes `fm-`, `qt-`, `ac-`

| Piece | What it is |
|---|---|
| `field`, `select`, `textarea`, `radios`, `yardSelect`, `fileDrop` | The fields. Radios are pills (`.seg`); on paper they print as tick boxes. |
| `.fm-card` | The ticket: black head (`formOpen`), white numbered rows (`fieldset`/`legend`), yellow foot (`formFoot`). The fieldset's line is drawn by `legend::before`, because browsers paint a fieldset's border and background from the middle of its legend. |
| `.fm-tag.on-y`, `yardTag()` | The sticky yellow freight tag beside the form: which yard answers, what has been typed, the three numbers (`callRows()`, `.fm-call`). |
| `callU()`, `.fm-u` | The black U of three numbers in the quote hero, passed to `pageHero` as `fill`. |
| `.fm-way`, `[data-way-note]` | Under Project location: how freight generally reaches a place the form knows (`data/places.mjs`). |
| `[data-goes]`, `[data-goes-*]`, `[data-carried]` | Live parts in `modules/forms.js`: the yard that answers, and the sticker saying what the link that brought you here was about. |
| `.ac-sheet` | The paper application, drawn inside the accounts hero's U. |
| `.ac-ticket`, `.ac-path` | The account's benefits as a yard ticket, and the three steps. |
| `.qt-arches` | "Then what?": three rising arches. |
| `.print-only`, `.letterhead`, `.pbox` | Exist only on paper; the application prints as a signable two-page form (`90-print.css`). |

The forms keep what `00-core.js` needs: `form[data-form]`, the ids the tests use, `?product=`, `?yard=`, `?location=` and `?delivery=` prefills, drafts in this browser only, and `[data-done]`/`[data-failed]`.

### Things a test or another page depends on
- The product index's `[data-lines]` and `.line` classes (`modules/lines.js`) are shared by the home page, Products and About.
- Yard anchors `#kent`, `#anchorage`, `#fairbanks` (Locations), service anchors `#takeoffs`, `#design`, `#remote`, `#crating`, `#shipping`, `#delivery`, project anchors `#remote-alaska` and the like.
- `tests/check.mjs` is the list of promises: reveal, captions, the 12px and 40px floors on phones, the facts and rules greps, no-JavaScript links, the route finder and map, the forms, the fold.
