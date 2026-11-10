# uresco.com — rebuilt

The new website for **Uresco Construction Materials, Inc.**: lumber and building materials from Kent, Anchorage and Fairbanks, delivered anywhere in Alaska and the Pacific Northwest.

It is a fast, static, mobile-first site. There is no CMS, database or plugin to patch: the build turns a few data files and templates into plain HTML in `docs/`, which any web host can serve (GitHub Pages, Netlify, Cloudflare Pages, or the current host).

## What's on the site

| Page | URL | Purpose |
|---|---|---|
| Home | `/` | The "Where are you building?" finder on a live map, the three yards, product lines and brands, how a package travels, remote Alaska, who we supply, take-off prompt and contractor accounts |
| Products | `/products/` + 9 category pages | A filterable ledger of the nine product lines, brands and an A–Z; each line page has every product, an "Add to quote" toggle, and the three yards' numbers |
| Services | `/services/` | The six services as one line from plans to delivered load: take-offs and estimates, design, remote and export packages, crating, shipping, job-site delivery |
| Alaska delivery | `/alaska/` | Opens on the finder, then road/sea/air, barge season, how a remote package works, Anchorage and Fairbanks yards, FAQ |
| Pacific Northwest | `/pacific-northwest/` | A close-up map of the Puget Sound region around the Kent yard, boom truck and Moffett delivery, the full range as a load sheet, the lane north, the Kent yard |
| Projects | `/projects/` | Kinds of work by sector, each shown as a load, with the services it typically uses (see the note below) |
| Locations | `/locations/` | A "which yard should I call?" switchboard over the map, then every detail for all three yards; the only page that prints hours |
| Request a quote | `/quote/` | Form with plan upload, routed to the yard the customer picks |
| Contractor accounts | `/accounts/` | Account benefits and an online credit application, routed to the chosen home yard and printable as a paper form |
| About | `/about/` | The company on one sheet, the mission line by line, the yards on a ruler of latitude, photos from Uresco's own yards |

On phones a bar fixed to the bottom of the screen gives **Call · Directions · Quote** on every page. Each yard shows a live **open/closed** status worked out in its own time zone; printed hours appear only on the Locations page. Both forms save a draft in the browser as people type. Product pages pass their product line, and any products picked, into the quote form; each yard card has a quote link that preselects that yard.

The old `/products-services/` URL redirects to `/products/`, `/contact/` redirects to `/locations/`, and `/credit/` redirects to `/accounts/`. `/alaska/`, `/pacific-northwest/` and `/locations/` keep their old addresses, so existing links and search results still work.

## Design

This branch is the **Boreal** direction: calm, cool and map-first. The system is written up in
[`DESIGN.md`](DESIGN.md): tokens, grid, every component with its markup, motion rules and do/don't.
Every page is built in it.

- **Identity.** The mark is the end grain of a flat-sawn board. When a board is cut below the log's heart, its growth rings show as U shapes, so the mark is literally wood and literally a **U**. It keeps the UCM yellow and black. Files are in `src/assets/brand/`. The original logo is kept in `originals/uresco/logo-original.png`.
- **The finder.** The home page opens on a live map of the Washington–Alaska corridor and asks *Where are you building?* Naming a place shows which yard to call (with its number and live open status), how freight typically reaches it, and a quote button that carries the place into the quote form. Places live in `src/data/places.mjs`; what the card says is general Alaska geography, never a schedule, carrier or price.
- **Type.** Geist for text and headlines, Geist Mono for coordinates, labels and data. Both are self-hosted and subset (`npm run fonts`), with no Google request.
- **Color.** UCM black `#0E0E0C` for type, the map and other dark surfaces; UCM yellow `#F5B800` for the primary action, the freight line and one large surface per page (the footer band); snow `#F4F6F6` for the page, and a cool steel on the map's land.
- **Map.** A real projection of Natural Earth data. `scripts/map.mjs` writes `src/data/map.json`: land outlines, yards, places, illustrative freight lanes and a labelled graticule. After editing places or lanes, re-run it (it needs `d3-geo`, `topojson-client`, `world-atlas` and `us-atlas` installed in the folder you pass it).

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
  - A photo used as a full-width hero needs `"hero": true, "art": true`, which adds the larger sizes and the phone crop. Add `"focal": [x, y]` (0 to 1) if the crop misses the subject.
  - The first ones to replace: `unloading` (the services page), `tug-barge` (remote packages) and the sector photographs on the home and projects pages. Yard cards carry no photograph at all, because a stock picture beside a yard's name reads as that yard; once Uresco has real ones, add a picture back in `yardCard` in `src/lib/components.mjs`.
- **Manufacturer literature links**: the `literature` field on each category in `src/data/products.mjs`.
- **Pages**: `src/pages/*.mjs`. **Styles**: `src/assets/css/*.css` then `src/assets/css/pages/*.css`, joined in name order into one `site.css`. **Behavior**: `src/assets/js/*.js` then `src/assets/js/modules/*.js`, joined the same way; no frameworks.

### Projects page

The page shows **kinds of work** (village housing packages, schools and clinics, multifamily framing and so on), not specific jobs. No project names, places or dates were available, and none were invented. To add real projects, add entries to `src/data/projects.mjs` with `real: true`, a title, place, year, scope and photo. Real projects sort first.

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
