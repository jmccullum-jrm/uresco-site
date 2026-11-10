# BOREAL — the Uresco design system

Direction D of the redesign: calm, premium, map-first. This file is everything needed to build the
remaining pages (products, services, locations, projects, quote, accounts, about) in the same system.

## 1. The idea

Uresco is a logistics product that happens to sell lumber. The first thing a visitor wants to know is
*can you get it to where I am building, and who do I call* — so the site opens by asking
**"Where are you building?"** over a live map of the Washington–Alaska corridor, and answers at once.

Three ideas make the direction unmistakable. Keep all three on every page you build.

1. **Surfaces.** The page is cool off-white ("snow"). The things that matter sit on it as large rounded
   *surfaces* inset 12px from the screen edge: dark "screens" (the map, the journey stage, the closing
   call to action, the footer), pale "ice" sections, and wide photographs. Dark means *instrument*:
   something live or interactive. Light means *page*.
2. **Product UI, not brochure.** Yards are live cards (open or closed, local time, one-tap call). A place
   gets a route card. Product lines are a list with a preview. Photographs carry small mono captions and
   glass panels of data, the way a product site mixes screenshots with pictures.
3. **Northern light.** One sans (Geist) at medium weight, sentence case, two-tone headlines; one mono
   (Geist Mono) for coordinates, labels and data. Colour comes from the north: spruce ink, glacier,
   a little aurora. **UCM yellow is only ever the primary action, the freight line and the eyebrow tick.**

## 2. Tokens (`src/assets/css/00-tokens.css`)

### Colour

| Token | Value | Use |
|---|---|---|
| `--snow` | `#F4F6F6` | page background |
| `--white` | `#FFFFFF` | cards on snow or ice |
| `--ice` | `#E8EEEF` | ice surfaces, insets, chips, photo placeholders |
| `--mist` | `#D9E1E3` | hairlines, input borders |
| `--fog` | `#B4C1C5` | stronger borders, decorative marks (never text) |
| `--slate` | `#51636A` | muted text on light (5.9:1 on snow) and the quiet half of a headline |
| `--ink` | `#0A1B20` | text, dark buttons |
| `--night` / `--night-2` / `--night-3` | `#071419` / `#0C2229` / `#14313A` | dark surfaces and things raised on them |
| `--night-line` | `rgba(207,234,241,.14)` | hairlines on night |
| `--frost` | `#CFEAF1` | body text on night |
| `--haze` | `#9DBCC5` | muted text on night (8.6:1) |
| `--glacier` / `--glacier-ink` | `#7FC4D9` / `#17657E` | accent on night / accent text on light |
| `--aurora` / `--aurora-ink` | `#5FE0B0` / `#0A7250` | "open" on night / "open" on light; the glow in gradients |
| `--yellow` / `--yellow-hi` | `#F5B800` / `#FFC829` | primary button, freight lane, eyebrow tick / hover |

Dark surfaces share one atmosphere: `--night` with two or three soft radial gradients of aurora and
glacier at 13–26% (see `.stage__sky`, `.cta__card`, `.jstage`, `.footer__card`). Never a flat black, never
a gradient on a light surface.

Any element that sits on a dark surface must set `--ring: var(--yellow)` (the surface classes already do);
focus rings are `2px solid var(--ring)`, ink on light and yellow on dark.

### Type

Geist (400–700 variable, 19 KB) and Geist Mono (400–600 variable, 15 KB), self-hosted, subset by
`scripts/fonts.py` to Latin plus `Ġ ġ`. Only Geist is preloaded.

| Token / class | Size | Setting |
|---|---|---|
| `--t-display` · `.display` | clamp(2.5rem → 4.5rem) | 500, line-height 1, tracking −.04em. One per page: the `h1`. |
| `--t-h2` · `.h2` | clamp(1.875rem → 3.25rem) | 500, 1.04, −.035em |
| `--t-h3` · `.h3` | clamp(1.25rem → 1.5rem) | 600, 1.2, −.02em |
| `--t-lede` · `.lede` | clamp(1.0625rem → 1.25rem) | 400, 1.5, `--slate` |
| `--t-body` | 1rem | 400, 1.6 |
| `--t-small` | .875rem | secondary lines |
| `--t-micro` | .75rem | mono labels: Geist Mono 500, uppercase, tracking .06em |

- Headlines are sentence case, medium weight, never bold, never all caps.
- **Two-tone headlines:** wrap the second half of the sentence in `<em>`. It is not italic; it is the
  quieter colour (`--slate` on light, `--haze` on dark). `Call the yard <em>nearest the job.</em>`
- Mono is for data only: coordinates, eyebrows, table labels, captions, counters. Never a sentence.
- Phone numbers use `font-variant-numeric: tabular-nums`.

### Space, radius, depth, motion

- Space: 4px base, `--s1`…`--s9` (.25, .5, .75, 1, 1.5, 2, 3, 4, 6rem). Section padding `--section`
  = clamp(4.5rem → 9rem).
- Radius: `--r-sm` 10 (small controls) · `--r-md` 14 (inputs, inner panels) · `--r-lg` 22 (finder, FAQ rows) ·
  `--r-xl` 28 (cards, photographs) · `--r-2xl` 32 (surfaces). A panel inset in a card uses
  `calc(var(--r-xl) - .5rem)` so the curves stay concentric. Buttons are 12px (10 small, 14 large): not pills.
  Pills (999px) are for chips and status only.
- Depth: fine borders first. `--sh-1` (a hairline and a whisper: every resting card), `--sh-2` (hover),
  `--sh-3` (things that float: the finder, the menu, dialogs). No shadow on dark surfaces; use
  `inset 0 0 0 1px rgba(255,255,255,.14)` instead.
- Motion: `--ease` cubic-bezier(.2,.7,.2,1) for UI, `--ease-map` cubic-bezier(.45,0,.15,1) for the camera.
  `--fast` .16s (hover) · `--ui` .32s (menus, dialogs) · `--slow` .7s (reveals) · `--camera` 1.1s.

## 3. Grid and rhythm

- Page column: `.wrap` — max 1280px (`--wrap`) plus a gutter of clamp(1rem → 2.5rem) (`--gutter`).
- Surfaces sit `--inset` (12px; 8px on phones) from the screen edge and never grow wider than 1900px
  (`--edge` does both). Inside a surface, `padding-inline: var(--column)` lines its content up with the
  page column at every width; a `.wrap` directly inside `.section--ice` or the footer is adjusted for you.
- Sections alternate: **plain section** (`.section`, padded top and bottom by `--section`) and **surface**.
  Two surfaces in a row are separated by a seam of `--inset`, not by a section's padding (the rule at the
  end of the Sections block in `10-base.css` handles neighbours, and the footer).
- Section heads are a spread: headline left, lede and link right (`sectionHead()`).
- Breakpoints: 700px (phone below: `--inset` 8px, action bar appears, radii step down), 900px (journey and
  remote photo stack), 1000px (utility bar, inner-page hero and product preview), 1100px (desktop nav and
  the map's side-by-side layout).

A typical inner page: `pageHero` → plain section → ice surface → plain section → `interlude` (optional)
→ plain section → ice surface (FAQ or details) → `quoteBand` → footer.

## 4. Files

```
src/assets/css/00-tokens.css          fonts, custom properties
src/assets/css/10-base.css            reset, type, eyebrow, link, buttons, chips, status, sections, frames, reveal
src/assets/css/20-chrome.css          utility bar, masthead, products menu, drawer, call sheet, action bar, footer
src/assets/css/30-components.css      stage + map + finder, yard cards, page hero, CTA, steps, modes, FAQ, interlude
src/assets/css/80-pages-pending.css   the old markup of pages not yet rebuilt, dressed in the new tokens
src/assets/css/pages/home.css         statement, product lines, journey, remote photo, sectors, closing
src/assets/css/pages/alaska.css       two small adjustments: the page is otherwise built from shared components
src/assets/js/00-core.js              window.UCM helpers ($, $$, calm)
src/assets/js/10-chrome.js            dialogs, masthead, products menu, action bar, projects filter
src/assets/js/20-hours.js             open/closed status and local clocks
src/assets/js/site.js                 forms (kept under its old name)
src/assets/js/modules/finder.js       the combobox, route card and map camera
src/assets/js/modules/journey.js      pinned stage
src/assets/js/modules/lines.js        product list preview
src/assets/js/modules/reveal.js       scroll reveal
src/lib/components.mjs                every shared component named below
src/lib/journey.mjs                   the five line drawings and the journey markup
src/data/places.mjs                   places the finder knows, and what the route card says
```

When you rebuild a page: create `pages/<page>.css`, move what you still need out of
`80-pages-pending.css`, and delete the rest of that page's rules from it.

## 5. Components

Function names are exports of `src/lib/components.mjs` unless noted. Class names are the contract.

### Eyebrow — `eyebrow(text)` (alias `stamp`)
`<p class="eyebrow">Product lines</p>` — mono label with the yellow tick. Use `<i>·</i>` for a separator.
One above every `h1`/`h2`. It is the only decorative yellow on the page.

### Section head — `sectionHead({ eyebrow, title, lede, action, level })`
```html
<div class="shead">
  <div class="shead__main"><p class="eyebrow">…</p><h2 class="h2">The whole load, <em>from one supplier.</em></h2></div>
  <div class="shead__aside"><p class="lede">…</p><a class="link" href="…">All products →</a></div>
</div>
```
Without lede and action it becomes `.shead--solo`.

### Buttons, links, chips, status
- `.btn` primary (yellow, ink text) · `.btn--dark` (ink) · `.btn--line` (outline, on light) ·
  `.btn--glass` (on dark) · sizes `.btn--sm` 38px, default 44px, `.btn--lg` 52px · `.btn--block`.
  One primary per view. An arrow icon last in a button nudges 3px on hover.
- `.link` text link with a hairline and an arrow; `.link--light` on dark.
- `.chip` quiet pill; a `<button class="chip" aria-pressed>` toggles; `.chip--glass` over photographs.
- `.status[data-hours]` — `openStatus(location, { short })`. The hours script fills it ("Open" /
  "Open now · until 4:30 p.m.") and adds `.is-open`. It is hidden until then. `clock(location)` renders
  `<span class="clock" data-clock="America/Anchorage">` with the yard's local time.
  Hours in the data are placeholders: show the status, never advertise the hours.

### Photographs — `.frame` and `picture(ctx, key, { sizes, art, eager, alt })`
```html
<figure class="frame"><img …><figcaption class="frame__cap">Chugach Mountains, Alaska <span>61° N</span></figcaption></figure>
```
Every photograph is in a `.frame`: radius `--r-xl` (surfaces `--r-2xl`), graded cool
(`saturate(.86) contrast(1.03)` plus a faint blue-to-night veil), with a hairline inside the edge.
Captions are mono chips naming the **place**, with a latitude where it is known. No stock photograph is
ever captioned or implied to be a Uresco yard, truck, person or project; yard cards use regional
landscapes captioned as such. Set the aspect ratio on the frame.

### Inner-page hero — `pageHero(ctx, { eyebrow, title, lede, photoKey, caption, actions, crumbs })`
```html
<section class="phero"><div class="wrap phero__grid">
  <div class="phero__copy">[crumbs] <p class="eyebrow">…</p><h1 class="display">Anywhere <em>in Alaska.</em></h1>
    <p class="phero__lede">…</p><div class="actions">…</div></div>
  <figure class="phero__media frame"><img …><figcaption class="frame__cap">…</figcaption></figure>
</div></section>
```
Words left (5 columns), one photograph right (6 columns, 5:4, `--r-2xl`); below 1000px the photograph
(3:2) follows the words. The photograph is the page's largest paint: pass
`preload: [preloadFor(ctx, photoKey)]` to `layout()`. Pages without a photograph (quote, accounts) use
`<section class="phero phero--plain">`. Only the home page opens on the map.

### The stage: map and finder — `routeStage(ctx, { variant, copy, label, labelledby, eager })`
The signature component. `variant: 'hero'` fills the first screen (home); `'embed'` is a section
(Alaska). It contains:

- `.stage__sky` — the night and its aurora.
- `.stage__map` › `mapPlate()` → `.map[data-map]` › `.map__cam[data-cam]` holding, in one 1800 × 1000
  space: `img.map__base` (`assets/map.svg`, written by `mapSvg()`), `svg.map__lanes` (roads, barge lanes,
  the ocean lane, the route arc) and `.map__pins` (graticule labels, a `.map__dot` button per place, a
  `.map__yard` link per yard with a `.map__tag`, and the `.map__dest` marker).
- `.stage__ui` › `.stage__copy` (your headline) and `finder()` → `.finder[data-finder]`: the combobox
  (`.finder__input`, `.finder__list`), example chips, and the route card `.route[data-route]` whose
  fields are `data-r="name|region|tag|coords|m0|m1|quote|short|else|note"`.
- `.legend`.

Layouts: ≥1100px words and finder left over open sea, map filling the rest; 700–1099px the map as a band
with the words on its sea and the finder below in two columns; <700px words, the map cropped to Alaska
and the lane south, then the finder. The crop numbers in `30-components.css` come from the canvas: if
you regenerate the map with a different projection, update them.

Behaviour (`modules/finder.js`): the route card is rendered at build time for the example place, so
nothing shifts when the script starts; choosing a place fills the card, draws an arc from the yard to
the place, flips labels out of each other's way and flies the camera (`--tx`, `--ty`, `--z` on
`.map__cam`; pins counter-scale with `--z`). Unknown places get "any yard can help". The quote button
carries `?location=…&yard=…`, which the quote form reads. Without JavaScript the panel is a list of the
three yards (`.finder__nojs`).

Data: add places in `src/data/places.mjs`, then run
`node scripts/map.mjs <tools dir> src/data/map.json`. What the card says about freight is general Alaska
geography, labelled "typical": never a carrier, schedule, transit time or price.

`deliveryMap(ctx)` is the same map as a plain figure with no finder (Locations).

### Live yard card — `yardCard(ctx, location, { compact, showPhoto, headingLevel, photoSizes })`
```html
<article class="ycard" id="anchorage">
  <div class="ycard__media"><img …><span class="ycard__note">Anchorage and the Chugach</span><span class="ycard__lat">61.11° N</span></div>
  <div class="ycard__body">
    <div class="ycard__top"><h3 class="ycard__city">Anchorage<span>, AK</span></h3><span class="status" data-hours="…" data-short></span></div>
    <p class="ycard__role">…</p>
    <a class="ycard__phone" href="tel:…">(907) 563-2500</a>
    <dl class="ycard__facts"><div><dt>Local time</dt><dd>…</dd></div> …</dl>
    <div class="ycard__acts"><a class="btn">Call Anchorage</a><a class="btn btn--line">Directions</a></div>
    <a class="ycard__quote link">Get a quote from Anchorage →</a>
  </div>
</article>
```
Lay them out in `.ycards` (three up) or `.ycards--2`. `compact` drops fax, email, hours and mail.

### Steps — `<ol class="steps">`
`<li><span class="steps__no">01</span><h3 class="h3">…</h3><p>…</p></li>` — four across on a rail, a
vertical rail on phones. For a pinned, illustrated sequence use `journey(ctx)` from `src/lib/journey.mjs`
(home only: one pinned sequence per site is enough).

### Modes and callout
`.modes` › `article.mode` (`.mode__icon`, `h3.h3`, `.mode__where` mono line, paragraph): three white cards.
`.callout` (`.callout__icon`, paragraph, optional `.link`): one pale-glacier note per page at most.

### FAQ
`.faq-wrap` (sticky head left, list right) › `.faq` › `<details><summary>…</summary><p>…</p></details>`.
Open the first one. Add FAQPage JSON-LD as the Alaska page does.

### Interlude — `interlude(ctx, photoKey, { line, note })`
A photograph as a surface (21:9; 4:5 portrait crop on phones) with one line over its lower edge. In the
line, `<em>` is yellow. At most one per page.

### Closing call to action — `quoteBand(ctx, { eyebrow, title, body })`
A dark surface (`.cta` › `.cta__card`): eyebrow, two-tone `h2`, one paragraph, primary and glass buttons,
the plans photograph. Every inner page ends with it. The home page ends with its own pair
(`.closing__grid`: the quote card and the contractor-account card).

### Chrome (`src/lib/layout.mjs`)
- `.utility` — desktop only: the three yards with number and live status, in mono.
- `.masthead` — sticky, translucent snow. `.brand` (the end-grain U, "Uresco", mono descriptor), `.nav`
  (`.nav__link`, current page gets a white pill), the Products menu, `.masthead__call` (opens the call
  sheet), `.masthead__cta`.
- Products menu `.mega` — opens on hover, on focus, and from `.nav__toggle` (`aria-expanded`); Escape
  closes. Nine lines with thumbnails, and a dark side panel for "not on the list".
- `dialog.drawer#drawer` — the phone menu: large links, product-line pills, and a sticky foot with
  *Call a yard* and *Get a quote*.
- `dialog.sheet#call-sheet` — all three yards: status, number as a yellow button, directions. Any element
  with `data-open="call-sheet"` opens it.
- `.actionbar` — phones only, floating: Call (opens the sheet) · Directions · Quote. It slides away while
  a field has focus.
- `.footer` › `.footer__card` — a dark surface with the map faint behind it: yards, links, latitudes.

## 6. Motion rules

- Animate only `transform`, `opacity`, `clip-path` and SVG stroke properties.
- Quiet and one-directional: things ease in once (`.reveal`, add `style="--i:n"` or an nth-child rule to
  stagger by 70ms), the map's lane draws once, beacons pulse slowly, the camera flies on request.
- Nothing loops on a phone except the yard beacons (transform and opacity only). Dash animations repaint,
  so they run from 700px up and pause when the map is off screen (`.is-paused`).
- Everything is visible and still under `prefers-reduced-motion` (a global rule in `10-base.css` plus
  `UCM.calm` in scripts), and without JavaScript (`.js` is set on `<html>` in the head; `.jsonly` and
  `.nojs` switch content with no flash or shift).
- State is never shown by motion or colour alone: the current journey step has a filled chip and a rail,
  "open" has a word beside its dot.

## 7. Performance and accessibility notes

- The home page's largest paint is `assets/map.svg` (about 14 KB compressed), preloaded; inner pages
  preload their hero photograph. No layout shift: every image has dimensions, the route card and status
  rows reserve their space.
- Fonts 34 KB, CSS about 17 KB compressed, JS about 9.5 KB compressed. No frameworks, no external requests.
- Checks: `node build.mjs && node tests/check.mjs` (static, five widths, finder, forms, the fold),
  the axe scan, and Lighthouse on a phone profile.
- Combobox follows the ARIA 1.2 pattern (`role="combobox"`, `aria-controls`, `aria-activedescendant`,
  a polite live region for the answer). Map dots are a pointer shortcut and are hidden from assistive
  technology; every place is reachable from the field.

## 8. Do and don't

Do
- Start each section from an idea a visitor can use (find, call, compare, follow), then pick components.
- Keep one `h1`, two-tone headlines, an eyebrow above each headline, a mono caption on each photograph.
- Put phone numbers within one tap everywhere; on inner pages the masthead Call button, the action bar and
  a yard card or the closing call to action cover it.
- Write plainly and only from `FACTS.md` and `src/data/`. "Typical", not "guaranteed".

Don't
- Don't use yellow for text, borders, icons on light, or decoration. Don't add a second accent colour.
- Don't set headlines in caps, bold or italic. Don't use mono for sentences.
- Don't put a photograph on the page without a frame, or full-bleed to the screen edge.
- Don't caption stock photographs as Uresco's yards, trucks, staff or jobs. Don't state hours as a benefit,
  or schedules, carriers, prices, transit times, customers or counts.
- Don't nest surfaces (no ice inside night), and don't put shadows on dark surfaces.
- Don't add a second map hero or a second pinned sequence; link to the home finder
  (`/#hero-title`) or embed `routeStage({ variant: 'embed' })` once, as the Alaska page does.
