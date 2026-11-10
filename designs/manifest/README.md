# uresco.com — rebuilt

The new website for **Uresco Construction Materials, Inc.**: lumber and building materials from Kent, Anchorage and Fairbanks, delivered anywhere in Alaska and the Pacific Northwest.

It is a fast, static, mobile-first site. There is no CMS, database or plugin to patch: the build turns a few data files and templates into plain HTML in `docs/`, which any web host can serve (GitHub Pages, Netlify, Cloudflare Pages, or the current host).

## What's on the site

| Page | URL | Purpose |
|---|---|---|
| Home | `/` | Dispatch board (three yards, live), the product manifest with drawings, delivery map, services, take-off prompt, who we build for, yards, contractor accounts |
| Products | `/products/` + 9 category pages | Every product line, brands, and a price/availability panel with each yard's number |
| Services | `/services/` | Take-offs and estimates, design, job-site delivery, remote and export packages, shipping, crating |
| Alaska delivery | `/alaska/` | Delivery map, road/sea/air, barge season, how a remote package works, what ships, Anchorage and Fairbanks yards, questions |
| Pacific Northwest | `/pacific-northwest/` | The Kent yard |
| Projects | `/projects/` | Filterable gallery by sector (see the note below) |
| Locations | `/locations/` | All three yards, with call and directions buttons |
| Request a quote | `/quote/` | Form with plan upload, routed to the yard the customer picks |
| Contractor accounts | `/accounts/` | Account benefits and an online credit application, routed to the chosen home yard and printable as a paper form |
| About | `/about/` | Mission, values, photos from Uresco's own yards |

On phones a bar fixed to the bottom of the screen gives **Call · Directions · Quote** on every page. Each yard shows a live **open/closed** status worked out in its own time zone. Both forms save a draft in the browser as people type. Product pages pass their product line into the quote form, and each yard card has a quote link that preselects that yard.

The old `/products-services/` URL redirects to `/products/`, `/contact/` redirects to `/locations/`, and `/credit/` redirects to `/accounts/`. `/alaska/`, `/pacific-northwest/` and `/locations/` keep their old addresses, so existing links and search results still work.

## Design

The design system is called **Manifest** and is documented in full in [`DESIGN.md`](DESIGN.md): tokens, grid, every component with its markup, motion rules and how to build a page in it. In short:

- **Idea.** The site looks like it was made by people who read drawings for a living: the take-off, the bill of lading and the shop drawing. Drafting-paper ground, ink lines, UCM yellow as highlighter, blue for dimensions and notes only.
- **Identity.** The mark is the end grain of a flat-sawn board. When a board is cut below the log's heart, its growth rings show as U shapes, so the mark is literally wood and literally a **U**. It keeps the UCM yellow and black. Files are in `src/assets/brand/` (run `npm run brand` to regenerate them). The original logo is kept in `originals/uresco/logo-original.png`.
- **Type.** Geist for headlines and text, Geist Mono for labels, numbers and drawing lettering. Both are self-hosted and subset (33 KB together), with no Google request.
- **Dispatch board.** The home page opens with the three yards on a departures board: local time, open or closed, the number. Every row is a tap-to-call link.
- **Manifest.** Products are a load manifest, lines 001 to 009; each line opens a section drawing of what is in it (`src/lib/drawings.mjs`). There are no product photographs.
- **Map.** A real projection of Natural Earth data (`scripts/map.mjs`) drawn as an engineer's plate: graticule, lettered lanes, a scale bar and a title block. Each yard name links to its details.
- **Photographs.** One per page, in the hero, printed in two inks by the stylesheet and captioned as a figure with its credit.

**Status.** Chrome, Home and Alaska delivery are built in Manifest. The other pages still use their earlier markup, restyled through `src/assets/css/90-legacy.css` until each is rebuilt (see DESIGN.md, section 9).

## Working on it

Requirements: Node 18+ and Python 3 with Pillow (`pip install pillow`). Playwright and Chromium are needed only for `npm run brand` and `npm run check`.

```bash
npm run build       # src/ → docs/ (preview: noindex)
npm run build:live  # the same, for uresco.com: indexable, base '/', writes docs/CNAME
npm run serve       # http://localhost:8080
npm run check       # build + link/SEO checks + every page in Chromium at 5 widths, plus the forms
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
  - A photo used in a page hero needs `"hero": true` (larger sizes) and `"plate": true` (stored in greyscale, because hero plates are printed in two inks). Add `"focal": "x% y%"` if the crop misses the subject, or `"crop": [left, top, right, bottom]` to trim it first.
  - The first ones to replace: `yard-kent`, `framer` (accounts and design), `unloading` (job-site delivery) and `tug-barge` (remote packages).
- **Manufacturer literature links**: the `literature` field on each category in `src/data/products.mjs`.
- **Pages**: `src/pages/*.mjs`. **Styles**: `src/assets/css/*.css` then `src/assets/css/pages/*.css`, joined in name order into one `site.css`. **Behavior**: `src/assets/js/*.js` then `src/assets/js/modules/*.js`, joined into one `site.js`. No frameworks.
- **Drawings**: `src/lib/drawings.mjs` (section drawings, menu glyphs and building sketches, written as SVG).

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
- **Real photos.** Uresco has them, but none were found in the connected Google Drive. Upload them or share a folder (see **Photos** above for how they go in). The old site's "Lumber by UCM" truck and yard photos are on the About page, but they are only 714 px wide.
- **Real projects** for the gallery, as described above.
- **Founding year**, if Uresco wants it shown ("35+ years" is used now).
- **Logo.** The new mark is a proposal. If Uresco keeps the classic UCM logo, swap it into `src/lib/layout.mjs` (`brand`).
