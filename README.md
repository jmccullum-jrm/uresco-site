# Uresco website: four designs and a chooser

This branch holds four complete candidate designs for the new Uresco Construction Materials website,
plus a chooser that shows them side by side so the owner can pick one.

| # | Design | Idea |
|---|---|---|
| 1 | **Northbound** | Editorial and cinematic. A serif headline, big photography and a latitude ruler that follows you north from Kent to the Arctic coast. |
| 2 | **Manifest** | Engineered and precise. Drawn like a shipping document, with technical drawings of the products and a live dispatch board for the three yards. |
| 3 | **Yellow** | Bold poster branding. UCM yellow and black, very large type, and the yard phone numbers right under the headline. |
| 4 | **Boreal** | Calm and map-first. Opens on a map of Alaska that asks where you are building and names the yard to call. |

## Looking at the designs

Open the preview and use the bar across the top:

- **1 to 4** switch designs. You stay on the same page, so you can compare the Alaska page, the quote form and
  so on like for like.
- **Phone view** (on a computer) shows the design at phone width.
- **Open without this bar** opens the design you are looking at on its own, exactly as visitors would see it.
- The address remembers where you are (`…/#yellow/alaska/`), so a link can be sent to someone else.

The design marked *Featured* is the one that loads first. Change it with `"featured"` in
[`designs/designs.json`](designs/designs.json).

The preview is the `docs/` folder of this branch. To serve it from GitHub Pages: repository **Settings → Pages →
Build and deployment → Branch**, choose this branch and the `/docs` folder.

## Choosing one and hiding the others

When a design has been chosen, build it on its own. The chooser and the other three disappear:

```sh
ONLY=yellow node build.mjs                     # that design alone in docs/, still marked as a preview
ONLY=yellow PREVIEW=0 BASE=/ node build.mjs    # the same, built for uresco.com (indexable, with docs/CNAME)
```

After that the other folders in `designs/` can be deleted.

## How it is put together

```
build.mjs            builds every design into docs/designs/<name>/ and writes the chooser to docs/index.html
preview/             the chooser bar (shell.css, shell.js)
designs/designs.json the list of designs and which one is featured
designs/<name>/      one complete site per design: its own build.mjs, src/, tests/, scripts/, DESIGN.md, PHOTO-CREDITS.md
tests/chooser.mjs    checks for the chooser
tests/all.mjs        runs the chooser checks and each design's own checks
docs/                the built preview (committed, because GitHub Pages serves it)
```

Each design is a zero-dependency static site: `node build.mjs` inside `designs/<name>/` turns `src/` into
plain HTML, one stylesheet and one script. Content that all four share (yards, phone numbers, products,
services) lives in each design's `src/data/`; a design's `DESIGN.md` documents its type, colour, components
and rules, and its `README.md` covers its build details.

```sh
npm run build        # all four designs plus the chooser, into docs/
npm run check        # build, then every check (needs Playwright's Chromium)
node tests/all.mjs yellow chooser   # only the named parts
npm run serve        # http://localhost:8080
```

`docs/` is committed, so rebuild and commit it after any change; CI fails if it is stale.

## Still needed from Uresco

The designs use only facts from the current uresco.com. These are placeholders or open questions:

- **Yard hours.** Monday to Friday, 7:00 to 4:30 is a placeholder; it drives the open/closed indicators.
- **Photographs.** Most photos are stock (credited in each design's `PHOTO-CREDITS.md`) and are never captioned
  as Uresco's own. Real photos of the yards, trucks, loads and finished projects would improve every design.
- **Projects.** No real project list was supplied, so the projects pages describe kinds of work only.
- **Phone and fax details.** Confirm the Anchorage toll-free number (800 or 888) and the Kent fax number.
- **Credit terms** for the contractor account application.
- **Where the quote form should send.** Until a form service is set up, it opens a pre-filled email.
