# BOREAL — the Uresco design system

Direction D of the redesign: calm, premium, map-first. Every page is built in this system. This file is the
system itself and the map of what exists: tokens, the grid, every component with its markup, and, in
section 4, where to find each page and its parts.

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
3. **Black, yellow and one cool steel.** One sans (Geist) at medium weight, sentence case, two-tone
   headlines; one mono (Geist Mono) for coordinates, labels and data. UCM black is the screen and the
   type. **UCM yellow is the primary action, the freight line, the eyebrow tick, the yard numbers on black
   and one large surface per page (the band at the top of the footer).** The only other colour is the
   cool steel of the map's land and the green of "open".

## 2. Tokens (`src/assets/css/00-tokens.css`)

### Colour

| Token | Value | Use |
|---|---|---|
| `--snow` | `#F4F6F6` | page background |
| `--white` | `#FFFFFF` | cards on snow or ice |
| `--ice` | `#E8EEEF` | ice surfaces, insets, chips, photo placeholders |
| `--mist` | `#D9E1E3` | hairlines |
| `--fog` | `#B4C1C5` | stronger borders, decorative marks (never text) |
| `--field-line` | `#7E8F96` | the edge of a control at rest: inputs, selects, textareas, radios, choice tiles, the drop zone (3.36:1 on white, 3.09:1 on snow; WCAG 1.4.11) |
| `--field-hint` | `#5C6D74` | placeholder text (4.97:1 on snow) |
| `--slate` | `#51636A` | muted text on light (5.79:1 on snow, 6.28:1 on white) and the quiet half of a headline |
| `--ink` / `--ink-hi` | `#0E0E0C` / `#2C2C27` | text, dark buttons / a dark button under the pointer |
| `--night` / `--night-2` / `--night-3` | `#0E0E0C` / `#1A1A17` / `#272823` | dark surfaces and things raised on them |
| `--night-line` | `rgba(255,255,255,.14)` | hairlines on night |
| `--frost` | `#E3E7E6` | body text and drawing strokes on night |
| `--haze` | `#A9B3B3` | muted text on night (9:1) |
| `--glacier` / `--glacier-ink` | `#7FC4D9` / `#17657E` | accent on night / accent text on light |
| `--aurora` / `--aurora-ink` | `#5FE0B0` / `#0A7250` | the word "open" and its dot, on night / on light. Never a gradient. |
| `--yellow` / `--yellow-hi` | `#F5B800` / `#FFC829` | primary button, freight lane, eyebrow tick, numbers on black, the footer band / hover |

Dark surfaces are true black with at most one faint cool light on them
(`radial-gradient(…, rgba(227,231,230,.1), transparent 70%), var(--night)`; see `.cta__card`, `.pline-ask`).
The stage adds a slow-breathing light and `--night-2` at the top. No teal, no green in a gradient, and never a
gradient on a light surface. The map's own colours are in `mapSvg()`: land `#1A1C1A`, Alaska and Washington
in steel `#32444A` to `#262F31`.

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
| `--t-micro` | .75rem | mono labels: Geist Mono 500, uppercase, tracking .06em. **No page text is smaller than this**, on any surface. Words drawn inside an SVG figure scale with the drawing (about 6 to 8 px on a phone); they are part of a picture hidden from assistive technology, and nothing a visitor needs is only there. |

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
- Touch: controls are at least 40px on a touch screen, tablets and touch laptops included. Under `(pointer: coarse)` `.link`,
  `.crumbs a`, the utility strip's numbers (the strip is 40px tall there) and `.nav__toggle` grow on their own; `.map__tag`
  carries an invisible 40px target at every width; chips grow in the finder and the product filter.

## 3. Grid and rhythm

- Page column: `.wrap` — max 1280px (`--wrap`) plus a gutter of clamp(1rem → 2.5rem) (`--gutter`).
- Surfaces sit `--inset` (12px; 8px on phones) from the screen edge and never grow wider than 1900px
  (`--edge` does both). Inside a surface, `padding-inline: var(--column)` lines its content up with the
  page column at every width; a `.wrap` directly inside `.section--ice` or the footer is adjusted for you.
- Sections alternate: **plain section** (`.section`, padded top and bottom by `--section`) and **surface**.
  Two surfaces in a row are separated by a seam of `--inset`, not by a section's padding (the rule at the
  end of the Sections block in `10-base.css` handles neighbours, and the footer).
- Section heads are a spread: headline left, lede and link right (`sectionHead()`).
- Breakpoints are written in em (the px values below ÷ 16), so a larger default text size in the browser collapses the layout
  the way a narrower window does (WCAG 1.4.4; `tests/check.mjs` fails on a px breakpoint). `pages/zz-large-text.css` is the last stop: at 150 to 200%
  browser text on a phone, what normally stays on one line wraps instead of pushing the page sideways. 700px (phone below: `--inset` 8px, action bar appears, radii step down), 900px (journey and
  remote photo stack), 1000px (utility bar, inner-page hero and product preview), 1100px (desktop nav and
  the map's side-by-side layout), 1200px (services and projects lay out in columns), 1360px (the A–Z's third
  column).

Every page opens one of three ways:

- **On the map:** the place pages (home, Alaska, Pacific Northwest, Locations), the `h1` in `.stage__copy`.
  The home page's question is a size larger; the other three share `.stage--embed .display`.
- **On `pageHero`:** the pages about what Uresco sells or does (products, a product line, services, projects, about).
- **On words and an instrument:** the two forms (quote, accounts), where the working panel takes the photograph's place.

After that a typical page runs: plain section → ice surface → plain section → `interlude` (optional) → plain
section → ice surface (FAQ or details) → `quoteBand` → footer. Every page but the home page ends on `quoteBand`.

## 4. Files, and where each page's parts are

```
src/assets/css/00-tokens.css          fonts, custom properties
src/assets/css/10-base.css            reset, type, eyebrow, link, buttons, chips, status, sections, frames, reveal
src/assets/css/20-chrome.css          utility bar, masthead, products menu, drawer, call sheet, action bar, footer
src/assets/css/30-components.css      stage + map + finder, yard cards, page hero, CTA, steps, modes, FAQ, interlude, .fig, .glyph, .glass, .go
src/assets/css/40-forms.css           the shared form: fieldsets, fields, choices, drop zone, side panel (.fm-*)
src/assets/css/90-print.css           the credit application as a paper form; chrome never prints
src/assets/css/pages/<page>.css       one file per page type (below)
src/assets/css/pages/zz-large-text.css  very large browser text on a narrow screen; loads last
src/assets/js/00-core.js              window.UCM helpers ($, $$, calm)
src/assets/js/10-chrome.js            dialogs, masthead, products menu, generic quote links, Pause motion, action bar
src/assets/js/20-hours.js             open/closed status and local clocks
src/assets/js/site.js                 forms (kept under its old name)
src/assets/js/modules/finder.js       the combobox, route card and map camera
src/assets/js/modules/journey.js      pinned stage
src/assets/js/modules/lines.js        the home page's product list and its preview
src/assets/js/modules/reveal.js       scroll reveal
src/assets/js/modules/products.js     the index filter, and the picks on a line page
src/assets/js/modules/projects.js     the sector filter
src/assets/js/modules/locations.js    Puget Sound town chips, the About ruler, pausing maps off screen
src/lib/layout.mjs                    the page shell and the chrome
src/lib/components.mjs                every shared component named below
src/lib/forms.mjs                     field, select, textarea, radios, yardSelect, fileDrop, whoAnswers, yardLines, callStrip
src/lib/drawings.mjs                  asFig, figBody, FLOOR_FRAMING, BOOM_TRUCK, MOFFETT_TRUCK, the nine product glyphs
src/lib/journey.mjs                   the five journey drawings and the journey markup
src/data/*.mjs                        locations, places, products, services, projects: every fact the pages print
```

Each page type's own classes carry one prefix, so a selector tells you where its rule lives.

| Page | Module | Stylesheet | Prefix | Its parts, in order |
|---|---|---|---|---|
| Home `/` | `pages/home.mjs` | `pages/home.css` | none | `.hero` (`routeStage`, `.dial` the three numbers on a phone) · `#yards` · `.about` (`.statement`, `.own`, `.stats`) · `.lines` (`li.rowcard` › `a.line`, `.line__add`, `.lines__preview`) · `journey()` · `.remote` · `.sectors` (`.scard`) · `.closing` (`.closing__quote`, `.closing__account`) |
| Alaska `/alaska/` | `pages/alaska.mjs` | `pages/alaska.css` | `ak-` | `#finder.ak-open` (`routeStage`, its own 700–1099 layout) · `.modes`, `.callout` · `.steps` · `interlude` · `#yards` · `.faq-wrap` + FAQPage JSON-LD · `quoteBand` |
| Products `/products/` | `pages/products.mjs` | `pages/products.css` | `pidx-` | `.pidx-top` (`pageHero`) · `.pidx-find` · `.pidx-list` › `.pidx-row.rowcard` · `.pidx-none`, `.pidx-more` · `.pidx-brand` · `.pidx-az` · `quoteBand` |
| A product line `/products/<slug>/` | `pages/products.mjs` | `pages/products.css` | `pline-` | `pageHero.pline-hero` (`.pline-step`, `.glass.pline-hero__panel`) · `.pline-list` › `.pline-item` · `.pline-brands` · `.pline-ask` · `.mode.pline-svc` · `.pline-rel` · `.pline-pager` · `quoteBand` carrying the line |
| Services `/services/` | `pages/services.mjs` | `pages/services.css` | `sv-` | `pageHero` · `.sv-line` (`.sv-map`) · `.sv-leg` › `article.sv-stop#<service id>` (`.sv-spec`, `.sv-kit`, `.sv-proof`) · `interlude` · `quoteBand` |
| Projects `/projects/` | `pages/projects.mjs` | `pages/projects.css` | `pj-` | `pageHero` · `.pj-bar`, `.pj-filter` · `section.pj-sector#<sector>` › `.pj-kind` (`.glass--over`, `.pj-route`) · `.pj-legs` · `quoteBand` |
| Pacific Northwest `/pacific-northwest/` | `pages/regions.mjs` | `pages/pacific-northwest.css` | `pn-` | `#sound.pn-open` (Puget Sound close-up, `.pn-panel`) · `.pn-gear` › `.pn-unit` · `.pn-load` (`.pn-bill`, `.pn-row`) · `#north.pn-north` (corridor map) · `.pn-yard` · `quoteBand` |
| Locations `/locations/` | `pages/regions.mjs` | `pages/locations.css` | `lc-` | `.lc-open` (`.lc-board` › `.lc-row`, the switchboard) · `.lc-yards` › `yardCard` · `.callout` · `quoteBand` |
| Quote `/quote/` | `pages/quote.mjs` | `40-forms.css`, `pages/quote.css` | `fm-`, `qt-` | `.phero--plain.fm-page` › `.fm-page__head` (`.qt-carried`), `.fm-page__form` (`#you`, `#job`, `#plans`), `.fm-rail` (`.qt-slip`) · `.qt-next` · `quoteBand` with the numbers |
| Accounts `/accounts/` | `pages/accounts.mjs` | `40-forms.css`, `pages/accounts.css`, `90-print.css` | `fm-`, `ac-` | `.ac-hero` (`.ac-card`) · `.ac-how` · `.fm-page--apply` (`#apply`, five fieldsets, `.fm-rail` › `.ac-index`) · `quoteBand` |
| About `/about/` | `pages/about.mjs` | `pages/about.css` | `ab-` | `pageHero` · `.ab-sheet` (`.ab-own`, `.ab-card`) · `.ab-promises` · `.ab-reach` (`.ab-ruler`) · `yardCard`s · `quoteBand` |
| Not found `404.html` | `pages/about.mjs` | `pages/about.css` | `nf-` | `.nf__grid` (`mapPlate` with a `marker`) · `.nf__yards` · `.nf__links`. Links are absolute to `SITE.base`. |

## 5. Components

Function names are exports of `src/lib/components.mjs` unless noted. Class names are the contract.

### Eyebrow — `eyebrow(text)`
`<p class="eyebrow">Product lines</p>` — mono label with the yellow tick. Use `<i>·</i>` for a separator.
One above every `h1`/`h2`. It is the only decorative yellow on the page.

### Section head — `sectionHead({ eyebrow, title, lede, action, level, id })`
`id` goes on the heading, for a section's `aria-labelledby`.
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
- `callLink(ctx, { cls, label, size })` — the button that opens the call sheet: `<a class="btn …"
  href="locations/" data-open="call-sheet">`. A link underneath, so it still works without the script. Use it
  instead of a bare `<button data-open="call-sheet">` anywhere in the page body.
- `.brands` › `li` — outline pills for brand names (32px); `.brands--sm` 28px, `.brands--ink` dark text.
- `.status[data-hours]` — `openStatus(location)`. The hours script fills it with the word "Open" or "Closed", and
  never a time, and adds `.is-open`. It is hidden until then. `clock(location)` renders
  `<span class="clock" data-clock="America/Anchorage">` with the yard's local time.
  Hours in the data are placeholders: show the status, never advertise the hours. `closedDates` (`locations.mjs`, yard-local ISO dates, also placeholders) makes the status say Closed whatever the weekly table says.

### Photographs — `.frame` and `picture(ctx, key, { sizes, art, eager, alt })`
```html
<figure class="frame"><img …><figcaption class="frame__cap">Chugach Mountains, Alaska <span>61° N</span></figcaption></figure>
```
Every photograph is in a `.frame`: radius `--r-xl` (surfaces `--r-2xl`), graded cool
(`saturate(.86) contrast(1.03)` plus a faint blue-to-night veil), with a hairline inside the edge.
Captions are mono chips saying what the picture **literally shows**. No stock photograph is ever
captioned or implied to be a Uresco yard, truck, person or project, and none carries a yard's name or
latitude. `pageHero` and `interlude` add the photographer's credit themselves (`photoCredit(key)` →
`<small class="frame__credit">Photo: Name / Unsplash</small>`); do the same in any caption you write by
hand. Uresco's own photographs are about 300px wide, so they appear small, labelled "From Uresco", and the
tag on the load is captioned "The tag on a Uresco load". Set the aspect ratio on the frame.

### Small shared pieces (`30-components.css`)
- `.rowcard` — a list row that lights up as a white card under the pointer, on its own layer (`.pidx-row`, the
  home page's product rows). Add `.is-on` to hold it lit, arrow and all.
- `.go` — the arrow circle, 36px. Quiet at rest; yellow and nudged 2px on when the link or `.rowcard` it is in is
  pointed at or focused (mark any other parent `.has-go`). A link can be one itself. `.go--raised` a white
  button on snow, `.go--lg` 44px, `.go--back` points left.
- `.glass` — a panel of data over a photograph: `.glass__lab` (mono) and a `<ul>` of chips. `.glass--over` pins it to
  the bottom of a `.frame`.
- `.fig` — the line-drawing language, shared by the journey, services, the Pacific Northwest trucks and anything
  added later. `asFig(svg, 'more classes')` adds a page's classes to any drawing; `figBody` strips its `<svg>` so two
  can share a canvas. The stroke classes (`.l .d .f .y .yf .w .k .t .tx .tk .bar`) are listed at the top of
  `drawings.mjs`. Always on a dark surface.
- `glyph(slug, cls)` — a product line as a small drawing on a dark tile, readable at 56px, where a photograph of
  lumber is only a brown square. The same drawing wherever a line is named: products menu, home rows, the ledger,
  related lines. Size it with your own class. One yellow stroke each.
- `takeoffSheet(items)` — the blank material list with its Qty column marked "We help fill in this column". Five rows
  at most. Decorative (`aria-hidden`).
- Hover depth (`--sh-2`) goes on a `::after` layer whose opacity animates, not on `box-shadow` itself (see `.ycard`).

### Inner-page hero — `pageHero(ctx, { eyebrow, title, lede, photoKey, caption, actions, crumbs, cls, eyebrowAside, note, figure })`
```html
<section class="phero"><div class="wrap phero__grid">
  <div class="phero__copy">[crumbs] <p class="eyebrow">…</p><h1 class="display">Anywhere <em>in Alaska.</em></h1>
    <p class="phero__lede">…</p><div class="actions">…</div></div>
  <figure class="phero__media frame"><img …><figcaption class="frame__cap">…</figcaption></figure>
</div></section>
```
Slots: `eyebrowAside` sits beside the eyebrow in `.phero__row` (the arrows on a line page), `note` goes after the
lede, `figure` goes inside the photograph and replaces the caption (bring your own `<figcaption>`), and `cls`
lands on the section. Words left (5 columns), one photograph right (6 columns, 5:4, `--r-2xl`); below 1000px the
photograph (3:2) follows the words. The photograph is the page's largest paint: pass
`preload: [preloadFor(ctx, photoKey)]` to `layout()`. The forms write the same `.phero` shape by hand, with a dark
panel where the photograph would be. The place pages open on a stage instead (section 3).

### The stage: map and finder — `routeStage(ctx, { variant, copy, label, labelledby, eager })`
The signature component. `variant: 'hero'` fills the first screen (home); `'embed'` opens the Alaska page, with the
`h1` in `copy`. Pacific Northwest and Locations build the same `.stage.stage--embed` shell by hand around their
own white panel (`.finder.pn-panel`, `.finder.lc-board`), because they have no combobox. The stage contains:

- `.stage__sky` — the night and its aurora.
- `.stage__map` (after `.stage__ui` in the markup, so the keyboard reaches the words and finder before the pins; `order` puts the map first on screen below 1100px) › `mapPlate()` → `.map[data-map]` › `.map__cam[data-cam]` holding, in one 1800 × 1000
  space: `img.map__base` (`assets/map.svg`, written by `mapSvg()`), `svg.map__lanes` (roads, barge lanes,
  the ocean lane, the route arc) and `.map__pins` (graticule labels, a `.map__dot` button per place, a
  `.map__yard` link per yard with a `.map__tag`, and the `.map__dest` marker).
- `.stage__ui` › `.stage__copy` (your headline) and `finder()` → `.finder[data-finder]`: the combobox
  (`.finder__input`, `.finder__list`), example chips, and the route card `.route[data-route]` whose
  fields are `data-r="name|region|tag|coords|m0|m1|quote|short|else|note"`. A place not on the list
  (`.route__y--any`) shows the site's guidance with all three yards' numbers. `.finder__go` is a visible
  submit button, shown while the field holds something not yet answered. A place not on the list is a real row in
  the suggestions ("Use Kwethluk").
- `legend({ items, note })` → `ul.legend`: `items` are `[swatch, label]` (swatches `yard sea inside road barge arc`, classes
  `.lg--*`), and the default is the yards, the four lanes (Southeast by sea included) plus "Lanes are illustrative". On the finder it adds **Yard to call**,
  the white dashed arc from the yard to the chosen place. The arc says who to call; it is never a route.

Layouts: ≥1100px words and finder left over open sea, map filling the rest; 700–1099px the map as a band
with the words on its sea and the finder below in two columns (degree labels hidden under 1000px, the chosen
place's label above its dot); <700px words, the map cropped to Alaska and the lane south, then the finder. The crop numbers in `30-components.css` come from the canvas: if
you regenerate the map with a different projection, update them.

Behaviour (`modules/finder.js`): the route card is rendered at build time for the example place, so
nothing shifts when the script starts. While it is marked Example the card's button is a plain "Request a quote" that carries
nothing; choosing a place names it on the button, fills the card, draws an arc from the yard to
the place, flips labels out of each other's way and flies the camera (`--tx`, `--ty`, `--z` on
`.map__cam`; pins counter-scale with `--z`). Unknown places get "any yard can help". After a choice the quote button
carries `?location=…&yard=…`, and every generic quote link on the page (`[data-quote-link]`: the action bar, the masthead,
the closing band) follows it, as they follow the picks on a line page. The quote form reads those parameters (it also starts a known off-road place on Remote Alaska
shipping and says what carried over in `.qt-carried`). Without JavaScript the panel is a list of the three
yards (`.finder__nojs`).

Data: add places in `src/data/places.mjs`, then run
`node scripts/map.mjs <tools dir> src/data/map.json`. Every place off the road system names Anchorage ("or a remote site"),
Galena, Fort Yukon and the Arctic coast included, until the owner rules on places that also fit "the Interior and points north". What the card says about freight is general Alaska
geography, labelled "typical": never a carrier, schedule, transit time or price.

`mapPlate(ctx, { dots, eager, example, marker })` is the map on its own. `marker: { left, top, name }` drops the
destination marker somewhere that is not a place (the 404 page's "This page").

### Live yard card — `yardCard(ctx, location, { compact, contact, headingLevel, hours })`
```html
<article class="ycard" id="anchorage">
  <div class="ycard__body">
    <div class="ycard__top"><h3 class="ycard__city">Anchorage<span>, AK</span></h3><span class="status" data-hours="…"></span></div>
    <p class="ycard__role">…</p>
    <a class="ycard__phone" href="tel:…">(907) 563-2500</a>
    <dl class="ycard__facts"><div><dt>Local time</dt><dd>…</dd></div> …</dl>
    <div class="ycard__acts"><a class="btn">Call Anchorage</a><a class="btn btn--line">Directions</a></div>
    <div class="ycard__links"><a class="ycard__quote link">Request a quote from Anchorage →</a> [<a class="ycard__more link">Email and fax →</a>]</div>
  </div>
</article>
```
Lay them out in `.ycards` (three up) or `.ycards--2`; one card to a row (700 to 1180px) puts the facts beside the number, with the
number, its buttons and the quote link together at the top of the left column. Live details (Local time) are `.jsonly`.
`compact` drops toll-free, fax, email and mail and links to the card on Locations instead (`.ycard__more`); `contact`
keeps the fax and email on a compact card. Yard cards have no photograph: every picture we have of those places is a
stock postcard, and none may sit beside a yard's name. The hours are placeholders: the Hours row prints on the
Locations page and nowhere else (`hours`, on by default only there). Every other card has the live status and the
local time.

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
line, `<em>` is yellow. The note carries the photo credit. At most one per page.

### Closing call to action — `quoteBand(ctx, { eyebrow, title, body, href, label, actions, call, items, media })`
A primary button with no `href` is `data-quote-link`. A dark surface (`.cta` › `.cta__card`): eyebrow, two-tone `h2`, one paragraph, primary and glass buttons and
a **take-off sheet** (`takeoffSheet`), so the band shows what a take-off is. `items` are its rows (five at most; a
product line passes its own), `href` and `label` change the primary button, `actions` replaces it outright, `call: false`
drops Call a yard for a band that shows the numbers, and `media` swaps the sheet for your own element (the quote
page puts the three yards there). Every inner page ends with it. The home page ends with its own pair
(`.closing__grid`: the quote card, with the same sheet, and the contractor-account card).

### Products (`pages/products.css`, `modules/products.js`)
- **Filter** `.pidx-find` — the finder's field asking what you need. It narrows the ledger as you type, across
  names, notes, brands and trade abbreviations (`data-pidx-*`).
- **Ledger** `.pidx-list` › `li.pidx-row.rowcard` — number, glyph, the line, *every* product in it (never cut
  short), a `.go`, and "Quote this line" (`?product=<line>`). The whole row is a link except that one. "Add to quote" has
  one meaning across the site: the toggle on a line page.
- **Brands** `.pidx-brand` inside `.faq-wrap`; **A–Z** `.pidx-az`, set like a book's index, each entry deep-linking to
  its row on the line page.
- **Line page** — `pageHero` with `.pline-step` beside the eyebrow and a `.glass.pline-hero__panel` in the photograph;
  `.pline-list` › `.pline-item` with an "Add to quote" toggle (`data-pline-pick`, kept for the visit in sessionStorage `uresco.picks`
  so several lines reach one request); `.pline-tray` right under the list with the status and the link to the quote; `.pline-ask`, the sticky dark
  card with the three yards' numbers; `.mode.pline-svc.has-go` link cards; `.pline-rel` related lines (glyph, name,
  every item); `.pline-pager`. Every `[data-pline-quote]` link carries the line and the picks to the quote form.
- Breakpoints 700, 900, 1000, 1200 and 1360.

### Services (`pages/services.css`)
The six services are one freight line, in the order a job meets them (`seq`, `leg`, `step` on each service in
`src/data/services.mjs`). `.sv-line` is the dark line map: `.sv-map__stop` per service, ending at a white "Your site"
tag. Below it `article.sv-stop`, built like the yard card: a drawing (`.fig.sv-fig`), the service,
a facts list `.sv-spec` or checklist `.sv-kit`, one action, and small prints of Uresco's own photographs
(`.sv-proof`). A link to `services/#crating` rings that card.

### Projects (`pages/projects.css`, `modules/projects.js`)
Kinds of work, never jobs. `.pj-bar` › `.pj-filter` chips (plain links without the script). `section.pj-sector`, one per
sector: a sticky head (`.pj-yards` where a sector has yards to call) and `article.pj-kind` cards: photograph
with `.glass.glass--over` ("Often needed for this work"), the scope, `.pj-route` (the services line in small, the stops to
ask about filled in; `services` on each entry in `src/data/projects.mjs`) and a quote link carrying the
kind of work. `[data-pj-count]` stays empty until a filter is applied. Each sector's `id` is its name in lower case with hyphens (the home page's sector cards link to them).

### Pacific Northwest (`pages/pacific-northwest.css`)
The Alaska page's sibling, one zoom level in. `#sound` is a close-up of Puget Sound (Natural Earth 10 m coastline, held in
`SOUND` in `regions.mjs`): Kent as a live beacon, dashed "yard to call" lines to eleven towns, `.pn-panel` with the Kent number
and town chips that start a quote. Then `.pn-gear` (`BOOM_TRUCK` and `MOFFETT_TRUCK` as `.fig.pn-fig`), the product lines (`.pn-bill`), the corridor map (`#north`) and the Kent yard.

### Locations (`pages/locations.css`)
One screen answers "which yard, and what is the number?": the map behind `.lc-board`, whose `.lc-row`s are the guidance and the
tap-to-call numbers at once. Each yard then has a wide card with every detail. This is the only page that prints hours.

### About and 404 (`pages/about.css`)
`.ab-card` is the company on one sheet; `.ab-promises` the mission a line at a time, each with what it means on a job; `.ab-ruler`
the yards by latitude with Sitka to Utqiaġvik marked. `.nf-*` is the not-found page: every link is absolute to `SITE.base`,
so check it in a build with `BASE=/`.

### Forms (`40-forms.css`, `90-print.css`, `src/lib/forms.mjs`)
White step cards (`.fieldset[data-step]`) on the left, a sticky dark panel (`.fm-rail`) on the right that answers as the form is
filled in, and the three yards' numbers always in reach (`.fm-rail__call` beside the form, `.fm-page__call` above it where
the panel does not fit). Every field is label, then hint, then control, then error. `site.js` finds forms by `[data-form]`
and handles validation, drafts (never tax IDs, bank details or signatures), uploads, the email hand-off and the printed
application. The rules that matter:
- A link's values (`?product=`, `?location=`, `?yard=`) go in once. A draft saved under the same link keeps what was changed since; a different link fills in over it. Products from a link are added to the materials box, never swapped in, and the panel's Materials row reads the box. `.qt-carried` says what came with the link.
- Files add up, and an oversized one costs nothing already on the list. A file cannot be kept in a draft, so a restored draft names what must be chosen again (`[data-files-lost]`) and the email still says which files to attach.
- Start over is undoable (`[data-draft-undo]`) until the visitor types again. The snapshot stays in the page's memory, never in storage.
- After the hand-off to the email app the draft leaves localStorage, but the tab keeps a copy in sessionStorage (without the private fields) until it closes, because nobody knows yet whether the email went. `[data-back]` reopens the form. A form service's success clears both.
- Email is not private, so `ein`, `bank` and `bank_contact` stay out of the message (`HELD` in `site.js`) and go by phone or on paper; the page and the notice both say so. They still post to a form service once there is one.
- A mailto over 1,800 characters is not opened: Copy becomes the main action (`[data-mail-long]`).

The credit application (accounts page) is the real form: company details, contacts, tax details, trade and bank references, certification and signature. It says what the form does and sends every question about limits, terms, approvals or statements to the yard. On paper it is two Letter pages (`90-print.css`) under the legal name, a form someone can sign by hand; a form that has been started prints what was typed, except the signature. While there is no `SITE.formEndpoint` the drop zone says the email app does the sending, `formFoot(label, note)` can say more about
how the form travels, and without JavaScript the send button gives way to a note with the phone and email route. Quote parts are `.qt-*`, account parts `.ac-*`.

### Chrome (`src/lib/layout.mjs`)
- `.utility` — desktop only: a black strip hanging from the top edge with the three yards, numbers in yellow, live status,
  and items that hide whole below 1300 and 1100px rather than clip.
- `.masthead` — sticky, translucent snow. `.brand` (the end-grain U, "Uresco", mono descriptor), `.nav`
  (`.nav__link`, current page gets a white pill), the Products menu, `.masthead__call` (opens the call
  sheet; a link to Locations without the script), `.masthead__cta`.
- Products menu `.mega` — opens on hover and from `.nav__toggle` (the keyboard's only way in; it does not open on focus).
  `aria-expanded` follows what is on screen, a second press closes it, and Escape closes it wherever the pointer or focus is. Nine lines with thumbnails, and a dark side panel for "not on the list".
- `dialog.drawer#drawer` — the phone menu: large links, product-line pills, and a sticky foot with
  *Call a yard* and *Get a quote*.
- `dialog.sheet#call-sheet` — all three yards: status, number as a yellow button, directions. Any element
  with `data-open="call-sheet"` opens it.
- `.actionbar` — phones only, floating: Call (opens the sheet) · Directions · Quote (on the quote page, Send plans,
  to `#plans`, gone once the form has been handed off). It slides away while a field has focus.
- `.footer` › `.footer__band` (the page's one large yellow surface: the tagline and the two ways to start) and
  `.footer__card` (a black surface with the map faint behind it: yards, links, latitudes). On a phone each yard is one row of name,
  status and number, with toll-free, email and address one tap away on Yard details, and the band drops its sentence.
- `[data-motion]` — Pause motion, in the utility bar, the phone menu and the footer, shown only where something loops.
  It sets `html.is-still`, which pauses endless animations and nothing that draws once, and is remembered between pages.
- Every opener is a link underneath (`locations/`, or `#site-index` for the menu), so Call, Directions and Menu lead
  somewhere without JavaScript.

## 6. Motion rules

- Animate only `transform`, `opacity`, `clip-path` and SVG stroke properties.
- Quiet and one-directional: things ease in once (`.reveal`, add `style="--i:n"` or an nth-child rule to
  stagger by 70ms), the map's lane draws once, beacons pulse slowly, the camera flies on request.
- Nothing loops on a phone except the beacons on the map (transform and opacity only); the sky's breathing light runs from 700px up. Dash animations repaint on every
  frame, so all of them, the lane's one-time draw included, run from 700px up (on a phone the lane is simply there) and
  the loops pause when the map is off screen (`.is-paused`). On a throttled phone the draw alone took the home page's
  Lighthouse score from 98 to 75.
- Everything is visible and still under `prefers-reduced-motion` (a global rule in `10-base.css` plus
  `UCM.calm` in scripts), and without JavaScript (`.js` is set on `<html>` in the head; `.jsonly` and
  `.nojs` switch content with no flash or shift). `.reveal` hides things only under `html.reveal-on`, which the reveal script sets
  just before it starts watching, so a script that never arrives hides nothing. Whatever is already on screen at that moment stays put and does not animate.
- State is never shown by motion or colour alone: the current journey step has a filled chip and a rail,
  "open" has a word beside its dot.

## 7. Performance and accessibility notes

- The home page's largest paint is `assets/map.svg` (about 14 KB compressed), preloaded, as it is on Alaska and
  Locations; pages on `pageHero` preload their photograph. No layout shift: every image has dimensions, the route card
  and status rows reserve their space.
- Fonts 34 KB, CSS about 32 KB compressed, JS about 17 KB compressed. No frameworks, no external requests.
- Checks: `node build.mjs && node tests/check.mjs`: static (links and anchors, aria references, the claims the facts do
  not allow, hours only on Locations and never in JSON-LD, every phone, email and address against the facts, photo
  captions), five widths on every page, finder, forms, the fold (plain and with font hinting), filters, Pause motion,
  the 12px and 40px floors on every page type on a phone, the no-JavaScript fallbacks, and the design review's serious findings
  (`reviewFindings`, `reviewOnPhone`: form drafts and hand-off, the two-page printed application, larger browser text, a missing script, closed dates). Then the axe scan, and
  Lighthouse on a phone profile.
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
- Don't use yellow for text on light, borders, icons on light, or decoration. Don't add a second accent colour.
  One large yellow surface a page, and the footer has it.
- Don't set headlines in caps, bold or italic. Don't use mono for sentences.
- Don't put a photograph on the page without a frame, or full-bleed to the screen edge.
- Don't caption stock photographs as Uresco's yards, trucks, staff or jobs. Don't state hours as a benefit,
  or schedules, carriers, prices, transit times, customers or counts.
- Don't nest surfaces (no ice inside night), and don't put shadows on dark surfaces.
- Don't add a second pinned sequence, or a second finder to a page; link to the home finder (`/#hero-title`) or
  use `routeStage({ variant: 'embed' })` once, as the Alaska page does. A map stage opens a place page and no other kind.
