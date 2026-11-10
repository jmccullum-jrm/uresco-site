# uresco.com — rebuilt

The new website for **Uresco Construction Materials, Inc.**: lumber and building materials from Kent, Anchorage and Fairbanks, delivered anywhere in Alaska and the Pacific Northwest.

It is a fast, static, mobile-first site. There is no CMS, database or plugin to patch: the build turns a few data files and templates into plain HTML in `docs/`, which any web host can serve (GitHub Pages, Netlify, Cloudflare Pages, or the current host).

## What's on the site

| Page | URL | Purpose |
|---|---|---|
| Home | `/` | Hero, the three yards' phone numbers, product lines and brands, delivery map, services, take-off prompt, who we build for, contractor accounts, yards |
| Products | `/products/` + 9 category pages | A searchable index of every product line and brand; each line page lists its products, each yard's number, and a load ticket that sends several lines to the quote form |
| Services | `/services/` | Take-offs and estimates, design, job-site delivery, remote and export packages, shipping, crating |
| Alaska delivery | `/alaska/` | Map, how a remote package works, road/sea/air, barge season, Anchorage and Fairbanks yards, FAQ |
| Pacific Northwest | `/pacific-northwest/` | The Kent yard |
| Projects | `/projects/` | The kinds of work Uresco supplies, by sector (see the note below) |
| Locations | `/locations/` | Which yard to call, then every detail for each: phone, toll-free, fax, email, address, directions and the (placeholder) hours |
| Request a quote | `/quote/` | Form with plan upload, routed to the yard the customer picks |
| Contractor accounts | `/accounts/` | Account benefits and an online credit application, routed to the chosen home yard and printable as a paper form |
| About | `/about/` | Who Uresco is, told through the tag on its loads: the remote specialty, the mission, who picks up |

On phones a bar fixed to the bottom of the screen gives **Call · Directions · Quote** on every page. Each yard shows a live **open/closed** status worked out in its own time zone. Both forms save a draft in the browser as people type. Product pages pass their product line into the quote form, and each yard card has a quote link that preselects that yard.

The old `/products-services/` URL redirects to `/products/`, `/contact/` redirects to `/locations/`, and `/credit/` redirects to `/accounts/`. `/alaska/`, `/pacific-northwest/` and `/locations/` keep their old addresses, so existing links and search results still work.

## Design

The site is built in the "Yellow" system: a bold brand poster. Every page uses it. **`DESIGN.md` is the full guide**
(tokens, grid, every component with its markup, motion rules, do and don't). In short:

- **Identity.** The mark is the end grain of a flat-sawn board: growth rings that read as a **U**.
  It keeps the UCM yellow and black. Files are in `src/assets/brand/` (SVG marks, PNG lockups, app
  icons, the social card; `npm run brand` redraws them). The original logo is in `originals/uresco/logo-original.png`.
- **Yellow first.** Pages are flat fields of UCM yellow `#F5B800`, black `#0E0E0C` and paper
  `#F7F3EA`. Yellow is the only colour; photographs are black-and-white.
- **The U is a window.** Every photograph sits in a U, an arch (the U turned over) or a pill, and
  the mark's rings repeat around them at poster scale.
- **Type.** One family, Archivo, self-hosted in one 52 KB file: wide and black in capitals for
  headlines, normal width for reading.
- **Home.** The headline says how the lumber travels (LUMBER BY TRUCK. BARGE. AIR. UCM.) and the
  photograph in the U changes with the word; the three yard numbers sit directly under it.
- **Alaska.** A question and a very large answer, a route finder over a real map (pick a town, see
  how freight reaches it and which yard to call), and latitude drawn as a tape measure.
- **Motion.** Quick and springy, never in the way of a phone number. Everything that moves by
  itself stops under reduced motion and with the Pause control.

## Working on it

Requirements: Node 18+ and Python 3 with Pillow (`pip install pillow`). Playwright and Chromium are needed only for `npm run brand` and `npm run check`.

```bash
npm run build       # src/ → docs/ (preview: noindex)
npm run build:live  # the same, for uresco.com: indexable, base '/', writes docs/CNAME
npm run serve       # http://localhost:8080
npm run check       # build + link/SEO/facts checks + every page in Chromium at 5 widths, the forms, the no-JavaScript paths and the phone floors
npm run images      # after changing scripts/photos.json
npm run brand       # after changing the logo
npm run fonts       # re-subset the fonts (needs: pip install fonttools brotli)
```

Every pull request runs `.github/workflows/check.yml`. It rebuilds the site, fails if `docs/` wasn't rebuilt and committed, and then runs the full check suite in Chromium.

### Where things live

- **Company facts** (phones, faxes, emails, addresses, hours): `src/data/locations.mjs`. Hours are a weekly table per yard, in the yard's own time zone. **The current hours (Mon–Fri 7:00–4:30, closed weekends) are placeholders; confirm them before launch.**
- **Products**: `src/data/products.mjs`.
- **Services**: `src/data/services.mjs`.
- **Projects**: `src/data/projects.mjs`.
- **Site settings** (preview mode, form endpoint, base path): `src/config.mjs`.
- **Photos**: `scripts/photos.json` lists every photo with its alt text and credit. Run `npm run images` after editing it. Credits are in `PHOTO-CREDITS.md`.
  - **To use Uresco's own photos:** put the originals in `originals/uresco/`. Point an entry's `src` at the file, for example `"yard-kent": { "src": "originals/uresco/kent-yard.jpg", "alt": "…" }`, then run `npm run images && npm run build`.
  - Large, unedited camera files are best; the script handles resizing.
  - A photo used as a full-width hero needs `"hero": true, "art": true`, which adds the larger sizes and the phone crop. Add `"focal": [x, y]` (0 to 1) if the crop misses the subject.
  - The first ones to replace: each yard's window (`photo` and `photoCaption` in `src/data/locations.mjs`), `framer` (projects and quote), `unloading` (job-site delivery) and `tug-barge` (remote packages).
- **Manufacturer literature links**: the `literature` field on each category in `src/data/products.mjs`.
- **Pages**: `src/pages/*.mjs`. **Styles**: `src/assets/css/*.css` then `src/assets/css/pages/*.css`, joined in name order. **Behavior**: `src/assets/js/*.js` then `src/assets/js/modules/*.js`, no frameworks. See `DESIGN.md`.

### Projects gallery

The gallery currently shows **kinds of work** (village housing packages, schools and clinics, multifamily framing and so on), not specific jobs. No project names, places or dates were available, and none were invented. To add real projects, add entries to `src/data/projects.mjs` with `real: true`, a title, place, year, scope and photo. Real projects sort first.

## Launch checklist

1. **Confirm the facts** in the open questions below, then update `src/data/locations.mjs`.
2. **Turn on the quote form.** Create a form endpoint that accepts file uploads, for example a free Formspree form pointed at sales@uresco.com, and paste its URL into `formEndpoint` in `src/config.mjs`. Until then the form opens the visitor's email app with the request filled in, and they attach plans there.
3. **Build for the live site.** Run `npm run build:live` and commit `docs/`. This switches off noindex, sets the base path to `/`, and writes `docs/CNAME`. To make it permanent, change `preview` and `base` in `src/config.mjs`, so a plain `npm run build` (and the CI check) produces the live site.
4. **Point the domain.** In the repo's **Settings → Pages**, set the custom domain to `www.uresco.com`. At the registrar, add a `CNAME` record for `www` to `jmccullum-jrm.github.io`, plus GitHub's apex `A` records. Keep the old WordPress site up until the new one serves on uresco.com.

While `preview` is on, every page is `noindex` and `robots.txt` blocks crawlers, so the github.io preview never competes with uresco.com in search.

## Open questions for Uresco

- **Phone and fax conflicts on the old site.** It shows Anchorage toll-free as both (800) and (888) 563-2500, and the Kent fax as both 872-8432 and 872-3693. The new site uses (800) and 872-8432.
- **Yard hours.** Placeholder hours are in place (Mon–Fri 7:00 a.m.–4:30 p.m. local time, closed weekends). Confirm or correct them per yard; the open/closed status depends on them.
- **Delivery area and minimums** per yard, if Uresco wants to publish them.
- **Credit terms.** The credit application asks for references and a requested limit, and promises nothing about terms. If Uresco has a standard credit agreement or a PDF application, link it from `/accounts/`.
- **Real photos.** Uresco has them, but none were found in the connected Google Drive. Upload them or share a folder (see **Photos** above for how they go in). The old site's photos of the printed "Lumber by UCM" tag and of a Uresco yard are on the About page, but they are only about 700 px wide.
- **Real projects** for the gallery, as described above.
- **Founding year**, if Uresco wants it shown ("35+ years" is used now).
- **Logo.** The new mark is a proposal. If Uresco keeps the classic UCM logo, swap it into `src/lib/layout.mjs` (`brand`).
