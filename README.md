# Uresco website: six designs and a chooser

This branch holds six complete candidate designs for the new Uresco Construction Materials website,
plus a chooser that shows them side by side so the owner can pick one.

| # | Design | Idea |
|---|---|---|
| 1 | **Northbound** | Editorial and cinematic. A serif headline, big photography and a latitude ruler that follows you north from Kent to the Arctic coast. |
| 2 | **Manifest** | Engineered and precise. Drawn like a shipping document, with technical drawings of the products and a live dispatch board for the three yards. |
| 3 | **Yellow** | Bold poster branding. UCM yellow and black, very large type, and the yard phone numbers right under the headline. |
| 4 | **Boreal** | Calm and map-first. Opens on a map of Alaska that asks where you are building and names the yard to call. |
| 5 | **Simple** | Plain and fast. Big phone numbers, one clear next step, no decoration. Built for developers who just want to place the order. |
| 6 | **Funny** | The same company and facts with jokes on every page. |

## Looking at the designs

Open the preview and use the bar across the top:

- **The design names** switch designs. You stay on the same page, so you can compare the Alaska page, the quote
  form and so on like for like.
- **About** shows or hides a one-line description of the design you are looking at.
- **Phone view** (on a computer) shows the design on a 390 by 844 phone screen.
- **Open without this bar** opens the design on its own, exactly as visitors would see it.
- **Send my pick** shares (on a phone) or copies (on a computer) a sentence naming the design and a link to it.
- The address remembers where you are (`…/#yellow/alaska/`), so a link can be sent to someone else.

[`designs/designs.json`](designs/designs.json) controls the preview:

- `"featured"` is the design that loads first.
- `"hide"` lists designs to leave out, for example `["boreal"]` to narrow the choice to three. With only one
  left, the chooser goes away and that design becomes the whole site.

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
plain HTML, one stylesheet and one script. Content that every design shares (yards, phone numbers, products,
services) lives in each design's `src/data/`; a design's `DESIGN.md` documents its type, colour, components
and rules, and its `README.md` covers its build details.

```sh
npm run build        # all six designs plus the chooser, into docs/
npm run check        # build, then every check (needs Playwright's Chromium)
node tests/all.mjs yellow chooser   # only the named parts
npm run serve        # http://localhost:8080
```

`docs/` is committed, so rebuild and commit it after any change; CI fails if it is stale.

## Still needed from Uresco

The designs state only what the current uresco.com says. These are placeholders or open questions, and each one changes
some wording on the site:

- **Credit application.** Is there a real Uresco form? Please supply or confirm its fields and the wording for the
  certification, any authorization to check references and credit, and the signature. It now says only "I certify the
  information above is true."
- **Contractor accounts.** What does an account include (limits, terms, statements, authorized buyers), and does it work at
  all three yards? Until then the site says "Ask your yard."
- **Form service.** Until one is connected, quote requests and credit applications go through the visitor's own email app,
  so plans are attached by hand. It must be suitable for tax IDs and bank details, which is why most designs keep those out
  of the email.
- **Yard hours and closed days.** Monday to Friday, 7:00 to 4:30 is a placeholder. It appears on the Locations page and
  drives the open/closed indicators, which hide on federal holidays until closed days are supplied.
- **Remote northern places.** Which yard should Nome, Kotzebue, Galena, Fort Yukon, Point Hope, Wainwright, Utqiaġvik and
  Kaktovik call?
- **What the yards do.** Are boom truck and Moffett deliveries run from Kent specifically? Does Uresco band or wrap loads,
  and can customers pick up at a yard?
- **Photographs and projects.** Most photos are stock (credited in each design's `PHOTO-CREDITS.md`) and are never captioned
  as Uresco's own. Real photos of the yards, trucks and loads, and a real project list, would improve every design.
- **Phone and fax details.** Confirm the Anchorage toll-free number (800 or 888) and the Kent fax number.
