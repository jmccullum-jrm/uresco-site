# Uresco — direction C: YELLOW

The design system for the bold-poster direction. Read this before building a page in it.
Everything here is implemented in `src/` and used by the home page (`src/pages/home.mjs`) and
the Alaska page (`src/pages/alaska.mjs`); the other pages still build and inherit the chrome,
page hero, quote band, yard cards and forms.

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
| Reset, grid, fields, type, buttons, stickers, windows, rings, motion | `src/assets/css/10-base.css` |
| Utility strip, masthead, Products menu, phone menu, call sheet, action bar, footer | `src/assets/css/20-chrome.css` |
| Components (marquee, seal, yard pills, product index, tiles, arcade, yard cards, ticket, divider, map, page hero, quote band, FAQ) | `src/assets/css/30-components.css` |
| Forms (carried over, re-tokenised) | `src/assets/css/40-forms.css` |
| Styles for pages not rebuilt yet (delete block by block) | `src/assets/css/80-legacy.css` |
| Print (credit application) | `src/assets/css/90-print.css` |
| Page styles | `src/assets/css/pages/home.css`, `pages/alaska.css` (add `pages/<page>.css`) |
| Behaviour the tests rely on (dialogs, hours, forms, drafts) | `src/assets/js/00-core.js` |
| Motion (reveal, pause control), word swap, product index on touch, route finder | `src/assets/js/modules/*.js` |
| Templates | `src/lib/layout.mjs` (chrome), `src/lib/components.mjs` (everything reusable) |
| Route-finder data and latitudes | `src/data/destinations.mjs` |

CSS and JS are joined in filename order by `build.mjs`. Shipped: one CSS file (about 20 KB
gzipped), one JS file (about 6 KB gzipped), one font file (52 KB).

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
| `.d3` `--t-d3` | `clamp(1.3rem, 1rem + 1.3vw, 2.1rem)` | same, lh .96 |
| `.d4` `--t-d4` | `clamp(1.02rem, .95rem + .3vw, 1.2rem)` | wide, 800 |
| `.lede` `--t-lede` | `clamp(1.1rem, 1rem + .5vw, 1.4rem)` | normal width, 500, lh 1.42, max 46ch |
| body `--t-body` | `1.0625rem` | 400, lh 1.55 |
| `.eyebrow` `--t-label` | `.74rem` | wide, 750, caps, ls .09em, led by a small U |

- `--wide` is `125%`, eased to `116%` under 420px so headlines stay large on phones.
- `<em>` inside `.d1`/`.d2` is the same word in outline (hollow sign lettering). One per headline.
- Card titles use width 118, buttons and nav 112: the further from a headline, the less wide.
- Write headlines in short words. `INSTITUTIONAL.` does not fit a phone at this width; `SCHOOLS.` does.
- Numbers that line up (phones, latitudes) take `.nums` (tabular figures).

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

- `.wrap` is the one centred column (`--wrap` plus fluid gutters). `.grid` is a 12-column grid
  inside it; most sections use a two-column split written per section (7:4 for heads, 1:1.3 for
  copy and map).
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
`eyebrow(text)`, `sticker(text, { tone, rot })`, `seal(ctx, { around, big, small })` (the round
35+ badge with text running round it). Stickers are for true facts only (see FACTS).

### Buttons and links

```html
<a class="btn">Request a quote <svg class="i">…</svg></a>   <!-- black on yellow and paper; yellow on .field-k -->
<a class="btn btn--line">…</a>   <a class="btn btn--paper">…</a>   <a class="btn btn--yellow">…</a>
<a class="btn btn--sm">…</a>     <a class="btn btn--lg">…</a>
<div class="actions">…buttons…</div>     <a class="link">All products <svg class="i">…</svg></a>
```
Always pills. Inside a yellow card that sits on a black field, add `.on-y` to the card so its
buttons go back to black.

### Marquee — `marquee(items, { tone, tilt, slow })`

```html
<div class="marquee marquee--k marquee--tilt" aria-hidden="true"><div class="marquee__track">
  <span>Kent</span><i></i><span>Anchorage</span><i></i>…(the run twice)…
</div></div>
```
Tones `k`, `y`, `p`. `tilt` lays it across the join between two sections like tape. Decorative:
only use words that are also in the page, and only real places (the map's) or real product lines.

### Yard pills — `yardsStrip(ctx)` (`.ystrip`)
The three numbers as large pills with live open/closed status. One row on desktop, stacked under
1000px. This is the first thing to tap on the home page; do not put anything between it and the headline but the lede.

### Product index — `lineIndex(ctx)` (`.lines` > `.line`)

```html
<ol class="lines" data-lines><li><a class="line" href="…">
  <span class="line__no">01</span><span class="line__name">Framing &amp; Timbers</span>
  <span class="line__items">Dimensional lumber · Timbers · …</span>
  <span class="win win--u line__win"><img …></span><span class="line__go">→</span>
</a></li>…</ol>
```
Full-bleed rows on a yellow field. A row flips to black on hover and focus; its U photo springs
to twice its size. On touch screens `modules/lines.js` flips the row crossing mid-screen instead.

### Service tiles — `.svcs` > `.svc` (CSS-only; markup in `home.mjs`)
White keyline cards. The icon hangs from the top edge in a small yellow U (`.svc__icon`); the
whole card flips to black on hover. Rows with the U on the left on phones.

### Arcade — `.arcade` > `.arc` (CSS-only)
A row of arch windows (`win--arch win--duo` on black) with a tag, a title and a line of text.
Four across, two across, then a sideways snap row on phones.

### Yard card — `yardCard(ctx, location, { compact, showPhoto, headingLevel })` (`.yard`)
A freight tag: yellow head with state and latitude, the city, a U window of the *place* (never a
stand-in for the yard itself), then address, live status, the number as a full pill, directions.
`compact` is the home version. `.yards` lays out three, `.yards--2` two.

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
chip points to Kent. `compact` hides minor towns. Setting `data-mode="road|sea|barge"` on the
figure and `.is-on` on a `.dmap__town` highlights a destination (see the route finder).

### Page hero — `pageHero(ctx, { eyebrow, title, lede, photoKey, actions, crumbs, before, after, cls, alt })`

```html
<section class="phero field-y clip">
  <div class="wrap phero__grid">
    <div class="phero__copy"> crumbs · eyebrow · [before] · <h1 class="d1 phero__title"> · lede · actions · [after] </div>
    <div class="phero__art"> rings + <div class="win win--u phero__media"> </div>
  </div>
</section>
```
The pattern for every inner page: a yellow poster, headline left, a U hanging from the masthead
on the right inside the rings. Under 900px the U turns over and stands at the bottom as an arch.
Titles over 30 characters get `.phero__title--long`. Without `photoKey` the art is a solid black U.
Pass `preload: [pageHeroPreload(ctx, key)]` to `layout()`. A page may restyle the title through
`cls` (Alaska: `.phero--yes`, a question sticker in `before` and a very large YES).

### Quote band — `quoteBand(ctx, { title, body, photoKey, label })` (`.qband`)
The closing call to action on every page: yellow field, an arch standing on the bottom edge
inside arch rings, a `.d2`, two large buttons.

### FAQ — `.faq` (CSS-only)
`<details>` rows between keylines with a round plus that turns. No script.

### Chrome (`layout.mjs`)
- **Utility strip** (`.utility`, 1000px and up): the three numbers with open/closed status.
- **Masthead** (`.masthead`): a yellow bar on every page; the mark in a black tile; nav links
  flip to black pills. Full nav from 1100px; below that a black `Menu` pill.
- **Products menu** (`.megamenu`): a black panel hanging from the bar with a round bottom, the
  nine lines numbered as in the index. Opens on hover and on keyboard focus; no script.
- **Phone menu** (`dialog.drawer`): a full-screen yellow poster, numbered links, the three numbers.
- **Call sheet** (`dialog.sheet`, opened by any `[data-open="call-sheet"]`): three yards, one tap each.
- **Action bar** (`.actionbar`, under 1000px): a floating black capsule, Call · Directions · Quote.
- **Footer** (`.footer`): tagline, yards, links, and the wordmark as wide as the page.

## Photography

- Black-and-white everywhere (`filter: grayscale(1) contrast(1.12)` on `.win > img`). On black
  fields use `duo` so the photo prints in yellow. Never full colour: yellow is the only colour.
- Fewer and larger. One window per section at most; tight crops; faces and subjects centred
  because the round end eats the corners.
- Add `"art": true` (and a `focal`) in `scripts/photos.json` for any photo used in a window, then
  `python3 scripts/images.py`.
- Stock photographs show places and materials. Never caption one as Uresco's yard, trucks or staff.
- Uresco's own archive photographs (`uresco-*`) are small. Show them at their native size as a
  snapshot stuck to the page (`.tagshot` on the home page: a `win--card` with a keyline, the
  sticker shadow, a few degrees of tilt and a caption sticker), never enlarged into a window.

## Motion rules

- Animate only `transform`, `opacity`, `clip-path` and SVG stroke properties.
- **Arrive once:** add `data-reveal` (rise), `data-reveal="pop"` (stickers; honours `--rot`) or
  `data-reveal="wipe"`. Stagger siblings with `style="--i:n"`. Nothing is hidden without JS.
- **Flip:** hover and focus swap yellow and black in `--t-tap`; movement uses `--spring`.
- **Drift:** `.plx` ties a slow vertical drift to scroll (CSS scroll-driven; static where unsupported).
- **Ambient:** marquees, the seal, the hero ripple, the map lanes and swapping words
  (`[data-swap]`, `modules/swap.js`). They run only while on screen, stop under
  `prefers-reduced-motion`, and stop when the visitor presses a `[data-motion-toggle]` button
  (in each hero and in the footer; remembered across pages). Any new ambient motion must be added
  to the pause selectors at the end of `10-base.css`.
- With reduced motion every element is visible and still; words and photos stay on their first state.

## Do

- Start each page with `pageHero()` and end it with `quoteBand()`.
- Keep a phone number or the call sheet within one tap in every section that asks for action.
- Let one thing per section be very large: a headline, a numeral, a window, the tape.
- Use outline `<em>` for the second half of a two-part headline.
- Give every new interactive thing the flip.
- Check 390px first: three lines of headline, then the action, then the picture.

## Don't

- Don't set yellow type on paper, or grey type on yellow (use `--umber`).
- Don't use a photograph outside a window, in colour, or with a gradient over it.
- Don't add a fourth field colour, a second typeface, drop shadows other than the two tokens, or
  borders other than the 2px keyline.
- Don't use long words in display type, or more than one outlined phrase per headline.
- Don't rotate anything but stickers and the tape.
- Don't state anything that is not in `FACTS.md` or `src/data/`. Latitudes, the nine lines and
  the map's towns are the only numbers and places the graphics use.

## Building the remaining pages

- **Products index:** `pageHero` + `lineIndex(ctx)` on a yellow field (it is already the home
  component) + brand stickers + `quoteBand`.
- **Product line:** `pageHero` with crumbs; the spec list as keyline rows; related lines as three
  `.line` rows or an `.arcade`.
- **Services:** `pageHero`; six sections alternating fields, each one U or arch window and a
  `.d2`; the `.svc` U-badge for icons.
- **Locations:** `pageHero`; `.yards` with three full `yardCard`s; `deliveryMap(ctx, { compact: true })` on black.
- **Projects:** `pageHero`; `.arcade` on black, eight arches, filters as `.town`-style pills.
- **Quote / accounts:** `pageHero` without a photo; the forms in `40-forms.css` need a pass
  (pill inputs are done; the aside should become a yellow `.on-y` card).
- **About:** `pageHero`; the `.about__big` statement; `.proof` stickers; Uresco's own small
  photos in `win--card` at their native size.
