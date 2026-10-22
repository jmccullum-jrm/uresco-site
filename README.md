# uresco.com — rebuilt

The new website for **Uresco Construction Materials, Inc.**: lumber and building materials from Kent, Anchorage and Fairbanks, delivered anywhere in Alaska and the Pacific Northwest.

It is a fast, static, mobile-first site. There is no CMS, database or plugin to patch: the build turns a few data files and templates into plain HTML in `docs/`, which any web host can serve (GitHub Pages, Netlify, Cloudflare Pages, or the current host).

## What's on the site

| Page | URL | Purpose |
|---|---|---|
| Home | `/` | Hero, the three yards' phone numbers, product lines, delivery map, services, take-off prompt, who we build for, brands, yards |
| Products | `/products/` + 9 category pages | Every product line, brands, and a price/availability panel with each yard's number |
| Services | `/services/` | Take-offs and estimates, design, job-site delivery, remote and export packages, shipping, crating |
| Alaska delivery | `/alaska/` | Map, how a remote package works, road/sea/air, barge season, Anchorage and Fairbanks yards, FAQ |
| Pacific Northwest | `/pacific-northwest/` | The Kent yard |
| Projects | `/projects/` | Filterable gallery by sector (see the note below) |
| Locations | `/locations/` | All three yards, with call and directions buttons |
| Request a quote | `/quote/` | Form with plan upload, routed to the yard the customer picks |
| About | `/about/` | Mission, values, photos from Uresco's own yards |

On phones a bar fixed to the bottom of the screen gives **Call · Directions · Quote** on every page. The old `/products-services/` URL redirects to `/products/`, and `/alaska/`, `/pacific-northwest/` and `/locations/` keep their old addresses so existing links and search results still work.

## Design

- **Identity.** The new mark is the end grain of a flat-sawn board. When a board is cut below the log's heart, its growth rings show as U shapes, so the mark is literally wood and literally a **U**. It keeps the UCM yellow and black. Files are in `src/assets/brand/`: SVG marks, PNG lockups, app icons and the social-share card. The original logo is kept in `originals/uresco/logo-original.png`.
- **Type.** Archivo (condensed, heavy) for headlines; IBM Plex Mono for the "grade stamp" labels, set like the ink stamp on a stick of lumber. Both are self-hosted, with no Google request.
- **Color.** Ink `#0E0E0C`, bone `#F2EEE5`, UCM yellow `#F5B800`. Yellow is used for fills and on dark backgrounds only; on light backgrounds emphasis is a yellow underline, so text contrast stays above WCAG AA.
- **Map.** A real projection of Natural Earth data (`scripts/map.mjs`): the three yards, the freight lanes, and example destinations from Ketchikan to Utqiaġvik.

## Working on it

Requirements: Node 18+ and Python 3 with Pillow (`pip install pillow`). Playwright and Chromium are needed only for `npm run brand` and `npm run check`.

```bash
npm run build     # src/ → docs/
npm run serve     # http://localhost:8080
npm run check     # build + link/SEO checks + every page in Chromium at phone and desktop width
npm run images    # after changing scripts/photos.json
npm run brand     # after changing the logo
```

### Where things live

- **Company facts** (phones, faxes, emails, addresses, hours): `src/data/locations.mjs`. Each yard has an `hours` field; it stays hidden until it is filled in.
- **Products**: `src/data/products.mjs`.
- **Services**: `src/data/services.mjs`.
- **Projects**: `src/data/projects.mjs`.
- **Site settings** (preview mode, form endpoint, base path): `src/config.mjs`.
- **Photos**: `scripts/photos.json` lists every photo with its alt text and credit. Run `npm run images` after editing it. Credits are in `PHOTO-CREDITS.md`.
- **Pages**: `src/pages/*.mjs`. **Styles**: `src/assets/css/site.css`. **Behavior**: `src/assets/js/site.js`, no frameworks.

### Projects gallery

The gallery currently shows **kinds of work** (village housing packages, schools and clinics, multifamily framing and so on), not specific jobs. No project names, places or dates were available, and none were invented. To add real projects, add entries to `src/data/projects.mjs` with `real: true`, a title, place, year, scope and photo. Real projects sort first.

## Launch checklist

1. **Confirm the facts** in the open questions below, then update `src/data/locations.mjs`.
2. **Turn on the quote form.** Create a form endpoint that accepts file uploads, for example a free Formspree form pointed at sales@uresco.com, and paste its URL into `formEndpoint` in `src/config.mjs`. Until then the form opens the visitor's email app with the request filled in, and they attach plans there.
3. **Switch off preview mode.** In `src/config.mjs` set `preview: false` and `base: '/'`.
4. **Point the domain.** Add a `docs/CNAME` file containing `www.uresco.com`, set the custom domain in the repo's **Settings → Pages**, and update DNS at the registrar: a `CNAME` record for `www` to `jmccullum-jrm.github.io`, plus GitHub's apex `A` records. Keep the old WordPress site up until the new one serves on uresco.com.
5. `npm run check`, commit, push.

While `preview` is on, every page is `noindex` and `robots.txt` blocks crawlers, so the github.io preview never competes with uresco.com in search.

## Open questions for Uresco

- **Phone and fax conflicts on the old site.** It shows Anchorage toll-free as both (800) and (888) 563-2500, and the Kent fax as both 872-8432 and 872-3693. The new site uses (800) and 872-8432.
- **Yard hours** for Kent, Anchorage and Fairbanks: the most-requested fact on a supplier site, and missing from the old one.
- **Delivery area and minimums** per yard, if Uresco wants to publish them.
- **Contractor accounts.** Is there a credit application to link?
- **Real photos.** Yards, trucks, crews and finished jobs. The best ones from the old site (the "Lumber by UCM" truck, the yard) are used on the About page, but they are only 714 px wide. `yard-kent` is a stand-in.
- **Real projects** for the gallery, as described above.
- **Founding year**, if Uresco wants it shown ("35+ years" is used now).
- **Logo.** The new mark is a proposal. If Uresco keeps the classic UCM logo, swap it into `src/lib/layout.mjs` (`brand`).
