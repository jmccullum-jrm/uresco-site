import { html, raw } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';
import { layout, orgJsonLd } from '../lib/layout.mjs';
import { win, rings, eyebrow, sectionHead, sticker, pageHero, pageHeroPreload, quoteBand, deliveryMap, openStatus, pauseBtn, latPill, photoCaption } from '../lib/components.mjs';
import { LOCATIONS, byId, tel, mapsUrl, hoursLines, tzLabel } from '../data/locations.mjs';
import { CATEGORIES } from '../data/products.mjs';
import { LATITUDES } from '../data/destinations.mjs';

const kent = byId('kent');

// ================= Pacific Northwest =================

// The hero's question. Every word is a line in data/products.mjs.
const NEED = ['trusses?', 'plywood?', 'lumber?', 'siding?', 'timbers?', 'drywall?'];

// The two machines, drawn flat on a 520 × 340 sheet whose bottom edge is the road. The moving
// parts are grouped so they can arrive once: the boom lowers its load, the forks lift theirs.
const LOAD = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3"/><path class="pn-gap" d="M${x + 4} ${y + h / 3}H${x + w - 4}M${x + 4} ${y + (2 * h) / 3}H${x + w - 4}M${x + w * 0.24} ${y}v${h}M${x + w * 0.76} ${y}v${h}"/>`;
const WHEEL = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}"/><circle class="pn-hub" cx="${x}" cy="${y}" r="${r * 0.36}"/>`;
const BOOM_TRUCK = `
  ${LOAD(168, 174, 124, 50)}
  <rect x="140" y="224" width="204" height="22"/>
  <rect x="150" y="244" width="330" height="24"/>
  ${WHEEL(204, 302, 38)}${WHEEL(286, 302, 38)}${WHEEL(434, 302, 38)}
  <path d="M352 268V158q0-14 14-14h66q10 0 16 8l34 50q6 9 6 18v48z"/>
  <path class="pn-hub" d="M374 166h50l30 44h-80z"/>
  <rect x="486" y="246" width="22" height="22" rx="4"/>
  <rect x="298" y="168" width="44" height="56" rx="4"/>
  <path class="pn-arm" stroke-width="26" d="M320 192 198 72"/>
  <path class="pn-arm" stroke-width="10" d="M324 218 254 132"/>
  <g class="pn-boom">
    <path class="pn-arm" stroke-width="18" d="M198 72 88 112"/>
    <path class="pn-arm" stroke-width="5" d="M88 112v116M88 228 54 256M88 228l34 28"/>
    ${LOAD(30, 256, 116, 50)}
  </g>
  <circle cx="198" cy="72" r="21"/><circle class="pn-hub" cx="198" cy="72" r="8"/>`;
const MOFFETT = `
  <rect x="426" y="226" width="110" height="22"/>
  <rect x="436" y="246" width="100" height="22"/>
  <rect x="424" y="226" width="16" height="74"/>
  ${WHEEL(488, 302, 38)}
  <rect x="158" y="66" width="20" height="270" rx="3"/>
  <g class="pn-fork">
    <rect x="144" y="196" width="16" height="90" rx="3"/>
    <rect x="40" y="276" width="120" height="12" rx="3"/>
    ${LOAD(44, 216, 104, 60)}
  </g>
  <rect x="192" y="262" width="196" height="40" rx="10"/>
  <path class="pn-arm" stroke-width="13" d="M222 264V152q0-12 12-12h106q11 0 14 11l24 112"/>
  <rect x="292" y="212" width="40" height="50" rx="10"/>
  <path class="pn-arm" stroke-width="8" d="M256 264 266 218M250 216h34"/>
  ${WHEEL(226, 306, 34)}${WHEEL(352, 312, 28)}`;
const drawing = (body) => raw(`<svg class="pn-draw" viewBox="0 0 520 340" aria-hidden="true" focusable="false">${body}</svg>`);
const ROAD_TRUCK = raw(`<svg viewBox="0 0 150 64" aria-hidden="true" focusable="false"><rect x="16" y="10" width="78" height="20" rx="2"/><rect x="10" y="30" width="92" height="6"/><rect x="14" y="36" width="126" height="8"/><path d="M106 44V16q0-4 4-4h16q4 0 6 3l10 14q2 3 2 6v9z"/><circle cx="34" cy="52" r="10"/><circle cx="58" cy="52" r="10"/><circle cx="124" cy="52" r="10"/></svg>`);

const RIGS = [
  { id: 'boom', name: 'Boom truck', draw: BOOM_TRUCK, text: 'A crane on the truck lifts the load off the deck and sets it down on site.' },
  { id: 'moffett', name: 'Moffett forklift', draw: MOFFETT, text: 'A forklift that rides on the back of the truck, then carries the load across the site.' },
];

// Boards in the stack do not end evenly: --cut is how far each one stops short of the longest.
const CUT = [0, 2.2, .7, 3, 1.2, 2.6, .3, 1.8, 2.4];
const itemsOf = (c) => c.items.map(([n]) => n.replace(/[®™]/g, '').replace(/ \(.*\)$/, '')).join(' · ');

// The tape from the Alaska page, stood on end: north is up, and Kent is where it starts.
const T0 = 46, T1 = 72;
const tapePos = (lat) => (((lat - T0) / (T1 - T0)) * 100).toFixed(2);

const pnw = {
  path: 'pacific-northwest/',
  render: (ctx) => layout(ctx, {
    title: 'Pacific Northwest — Kent, WA',
    description: 'Uresco’s Kent, Washington headquarters and Pacific Northwest distribution center: a full range of building materials with job-site delivery around the Puget Sound region by boom truck and Moffett forklift.',
    preload: [pageHeroPreload(ctx, 'rainier-tacoma')],
    body: html`
${pageHero(ctx, {
  cls: 'pn-hero',
  eyebrow: 'Pacific Northwest · Kent, WA',
  before: html`<p class="ask">
    <span class="sr-only">Building around Puget Sound? Need materials on site?</span>
    <span class="ask__q" aria-hidden="true">Building around Puget Sound? Need</span>
    <span class="ask__swap" aria-hidden="true" data-swap>${NEED.map((w, i) => html`<span${i === 0 ? html` class="is-on"` : ''}>${w}</span>`)}</span>
  </p>`,
  title: '<span class="pn-title__strap">Down the</span> <span class="pn-title__big">road.</span>',
  lede: 'Our Kent distribution center has a full range of building products and services for the commercial and residential builder, delivered to your job site by boom truck and Moffett forklift.',
  photoKey: 'rainier-tacoma',
  caption: kent.photoCaption,
  actions: html`<a class="btn nums" href="${tel(kent.phone)}">${icon('phone', { size: 18 })} ${kent.phone}</a><a class="btn btn--line" href="${ctx.u('quote/')}?yard=kent">Quote from Kent ${icon('arrow', { size: 18 })}</a>${pauseBtn()}`,
  after: html`<p class="pn-facts">
    <span class="pn-facts__yard"><b>Kent yard</b>${openStatus(kent)}</span>
    <a href="${mapsUrl(kent)}" target="_blank" rel="noopener">${icon('directions', { size: 16 })}${kent.street}<span class="sr-only">, ${kent.city} (opens a map)</span></a>
    <a class="nums" href="${tel(kent.tollFree)}">${icon('phone', { size: 16 })}${kent.tollFree}<span class="pn-facts__k">toll-free</span></a>
  </p>`,
})}

<section class="section field-k pn-rigs clip" id="delivery">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Job-site delivery', title: 'Two ways <em>off the truck.</em>', lede: 'To job sites around the Puget Sound region, with materials set where the crew needs them, not at the curb.' })}
    <div class="pn-rigs__grid">
      ${RIGS.map((r) => html`<div class="pn-arch pn-arch--${r.id}" data-reveal>${rings(1, { arch: true })}<div class="pn-arch__win">${drawing(r.draw)}</div></div>`)}
      <div class="pn-road" aria-hidden="true"><i class="pn-road__truck">${ROAD_TRUCK}</i></div>
      ${RIGS.map((r) => html`<div class="pn-rig pn-rig--${r.id}"><h3 class="pn-rig__name">${r.name}</h3><p>${r.text}</p></div>`)}
    </div>
    <div class="pn-rigs__foot">
      <a class="btn nums" href="${tel(kent.phone)}">${icon('phone', { size: 18 })} Call Kent: ${kent.phone}</a>
      <a class="link" href="${ctx.u('services/')}#delivery">Job-site delivery ${icon('arrow', { size: 16 })}</a>
    </div>
  </div>
</section>

<section class="section field-p pn-load" id="range">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'The full range', title: 'What’s on <em>the truck.</em>', lede: 'Nine product lines, from framing packages to the last box of fasteners, for the commercial and residential builder.', action: html`<a class="link" href="${ctx.u('products/')}">All products ${icon('arrow', { size: 16 })}</a>` })}
    <div class="pn-stack">
      <i class="pn-strap pn-strap--a" aria-hidden="true"></i>
      <i class="pn-strap pn-strap--b" aria-hidden="true"></i>
      ${sticker('Lumber by UCM', { tone: 'k', rot: -6, cls: 'pn-stack__tag' })}
      <ol class="pn-boards">
        ${CATEGORIES.map((c, i) => html`<li><a class="pn-board" style="--cut:${CUT[i]}%" href="${ctx.u('products/' + c.slug + '/')}">
          <span class="pn-board__no nums" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
          <span class="pn-board__name">${c.short}</span>
          <span class="pn-board__items">${itemsOf(c)}</span>
          <span class="pn-board__end" aria-hidden="true"></span>
        </a></li>`)}
      </ol>
    </div>
    <div class="pn-load__foot">
      <p>We also carry a large variety of other building materials: tarps, polyurethane rolls, caulking, adhesives, house wraps and more. If it’s not listed, ask Kent.</p>
      <a class="btn" href="${ctx.u('quote/')}?yard=kent">Quote from Kent ${icon('arrow', { size: 18 })}</a>
    </div>
  </div>
</section>

<section class="field-y pn-north clip" id="north">
  <div class="wrap pn-north__grid">
    <div class="pn-north__copy">
      ${eyebrow('The lane north')}
      <h2 class="pn-north__big"><span>47°</span> <span>north.</span></h2>
      <p class="lede">Kent is where our map starts. The lane north runs from Puget Sound to Southcentral Alaska, then on by road, barge or air, as far as Utqiaġvik.</p>
      <div class="actions">
        <a class="btn" href="${ctx.u('alaska/')}">Alaska delivery ${icon('arrow', { size: 18 })}</a>
        <a class="btn btn--line" href="${ctx.u('services/')}#remote">Remote &amp; export packages</a>
      </div>
      <p class="pn-note">Typical for the region, not a schedule or a price. Any yard can help.</p>
    </div>
    <div class="pn-north__fig">
      ${rings(2, { arch: true })}
      ${win(ctx, 'tacoma-port', { shape: 'arch', cls: 'pn-north__win', sizes: '(min-width: 900px) 22vw, 56vw', after: photoCaption('tacoma-port', 'Port of Tacoma') })}
    </div>
    <div class="pn-tape" role="img" aria-label="Latitude scale running north from Kent at 47.4 degrees, through Sitka 57.1, Anchorage 61.2 and Fairbanks 64.8, to Utqiaġvik 71.3.">
      <div class="pn-tape__track" aria-hidden="true"><i class="pn-tape__fill"></i>${[50, 55, 60, 65, 70].map((d) => html`<span style="--at:${tapePos(d)}%">${d}°</span>`)}</div>
      ${LATITUDES.map((p) => html`<span class="pn-stop${p.yard ? ' pn-stop--yard' : ''}${p.name === 'Kent' ? ' pn-stop--start' : ''}" aria-hidden="true" style="--at:${tapePos(p.lat)}%"><b>${p.name}</b><i class="nums">${p.lat.toFixed(1)}°</i></span>`)}
    </div>
  </div>
</section>

<section class="section field-k pn-yard clip" id="yard">
  <div class="wrap pn-yard__grid">
    <article class="pn-tag" aria-labelledby="pn-tag-city" data-reveal>
      <div class="pn-tag__head">
        <i class="pn-tag__hole" aria-hidden="true"></i>
        ${latPill(kent, 'pn-tag__lat')}
        <h2 class="pn-tag__city" id="pn-tag-city">Kent<span class="sr-only">, Washington</span></h2>
        <p class="pn-tag__role">${kent.role}</p>
        <p class="pn-tag__st">${openStatus(kent)}</p>
      </div>
      <div class="pn-tag__body">
        <dl class="pn-tag__rows">
          <div><dt>Visit</dt><dd><address>${kent.street}<br>${kent.city}, ${kent.state} ${kent.zip}</address></dd></div>
          <div><dt>Mail</dt><dd>${kent.mailing}</dd></div>
          <div><dt>Toll-free</dt><dd><a class="nums" href="${tel(kent.tollFree)}">${kent.tollFree}</a></dd></div>
          <div><dt>Fax</dt><dd class="nums">${kent.fax}</dd></div>
          <div><dt>Email</dt><dd><a href="mailto:${kent.email}">${kent.email}</a></dd></div>
        </dl>
        <div class="pn-tag__acts">
          <a class="btn nums" href="${tel(kent.phone)}">${icon('phone', { size: 18 })} ${kent.phone}</a>
          <a class="btn btn--line" href="${mapsUrl(kent)}" target="_blank" rel="noopener">${icon('directions', { size: 18 })} Directions<span class="sr-only"> to the Kent yard (opens a map)</span></a>
        </div>
      </div>
    </article>
    <div class="pn-also">
      ${eyebrow('Also from Kent')}
      <p class="lede">Our friendly, knowledgeable sales staff is here to help. Give us a call, email or stop by.</p>
      <ul class="pn-also__list">
        <li><a href="${ctx.u('services/')}#takeoffs">Take-offs &amp; estimates ${icon('arrow', { size: 18 })}</a></li>
        <li><a href="${ctx.u('services/')}#design">Design services ${icon('arrow', { size: 18 })}</a></li>
        <li><a href="${ctx.u('services/')}#remote">Remote &amp; export packages ${icon('arrow', { size: 18 })}</a></li>
        <li><a href="${ctx.u('accounts/')}">Contractor accounts ${icon('arrow', { size: 18 })}</a></li>
      </ul>
    </div>
  </div>
</section>

${quoteBand(ctx, {
  title: 'Building around <em>Puget Sound?</em>',
  body: 'Send plans or a list and tell us where the job is. Kent will help with the take-off and quote it.',
  photoKey: 'framing-joists',
  caption: 'Roof trusses and wall framing',
  label: 'Kent, WA',
  href: `${ctx.u('quote/')}?yard=kent`,
  call: html`<a class="btn btn--lg btn--line nums" href="${tel(kent.phone)}">${icon('phone', { size: 20 })} ${kent.phone}</a>`,
})}
`,
  }),
};

// ================= Locations =================

// "Which yard should I call?", answered in the first screen.
const WHERE = { kent: 'Building around Puget Sound?', anchorage: 'Southcentral Alaska or a remote site?', fairbanks: 'The Interior and points north?' };
// Each yard's name runs the full width of the page. --em is the width of the word's ink in ems at
// the display setting (measured in the browser), --lsb how far the first letter sits in from its
// box, so the name lands exactly on both edges of the column.
const NAME_FIT = { kent: [3.57, .07], anchorage: [8.38, 0], fairbanks: [7.46, .07] };
const FIELD = { kent: 'k', anchorage: 'p', fairbanks: 'y' };

// The mark at poster size: the three rings, one to a yard. Drawn on a 400 × 530 sheet.
const THREE_RINGS = raw(`<svg class="lc-mark__u" viewBox="0 0 400 530" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false"><g fill="none" stroke="#0E0E0C" stroke-width="38">${[58, 124, 190].map((r, i) => `<path pathLength="1" style="--n:${i}" d="M${200 - r} -20V320A${r} ${r} 0 0 0 ${200 + r} 320V-20"/>`).join('')}</g></svg>`);

const yardBandFull = (ctx, l) => {
  const field = FIELD[l.id];
  return html`
<section class="lc-band field-${field} clip" id="${l.id}" aria-labelledby="lc-h-${l.id}">
  <article class="yard lc-yard wrap" style="--em:${NAME_FIT[l.id][0]};--lsb:${NAME_FIT[l.id][1]}">
    <div class="lc-yard__meta">
      ${latPill(l, 'lc-yard__lat')}
      <p class="lc-yard__role">${l.role}</p>
      ${openStatus(l)}
    </div>
    <h2 class="lc-yard__city" id="lc-h-${l.id}" data-reveal="wipe">${l.city}<span class="sr-only">, ${l.state}</span></h2>
    <div class="lc-yard__grid">
      <div class="lc-yard__call">
        <a class="btn btn--lg lc-yard__num nums" href="${tel(l.phone)}">${icon('phone', { size: 20 })} ${l.phone}</a>
        ${l.tollFree ? html`<a class="btn btn--line lc-yard__toll nums" href="${tel(l.tollFree)}">${l.tollFree} <span>Toll-free</span></a>` : ''}
        <a class="btn btn--line lc-yard__dir" href="${mapsUrl(l)}" target="_blank" rel="noopener">${icon('directions', { size: 18 })} Directions<span class="sr-only"> to the ${l.city} yard (opens a map)</span></a>
      </div>
      <dl class="lc-rows">
        <div><dt>Visit</dt><dd><address>${l.street}<br>${l.city}, ${l.state} ${l.zip}</address></dd></div>
        ${l.mailing ? html`<div><dt>Mail</dt><dd>${l.mailing}</dd></div>` : ''}
      </dl>
      <dl class="lc-rows">
        <div><dt>Fax</dt><dd class="nums">${l.fax}</dd></div>
        <div><dt>Email</dt><dd><a href="mailto:${l.email}">${l.email}</a></dd></div>
        <div><dt>Hours</dt><dd>${hoursLines(l).map((h) => html`${h}<br>`)}<small>${tzLabel(l)}</small></dd></div>
      </dl>
      <div class="lc-yard__foot">
        <a class="link" href="${ctx.u('quote/')}?yard=${l.id}">Get a quote from ${l.city} ${icon('arrow', { size: 16 })}</a>
      </div>
      <div class="lc-yard__fig">
        ${rings(3)}
        ${win(ctx, l.photo, { duo: field === 'k', cls: 'lc-yard__win', sizes: '(min-width: 900px) 21vw, 96px', after: photoCaption(l.photo, l.photoCaption) })}
      </div>
    </div>
  </article>
</section>`;
};

const locations = {
  path: 'locations/',
  render: (ctx) => layout(ctx, {
    title: 'Locations',
    description: 'Uresco distribution centers in Kent, Washington, and Anchorage and Fairbanks, Alaska: which yard to call, with phone, fax, email, addresses and directions for each.',
    jsonLd: orgJsonLd(ctx),
    body: html`
${pageHero(ctx, {
  cls: 'lc-hero',
  artCls: 'lc-mark',
  eyebrow: 'Locations',
  title: 'Who do <em>I call?</em>',
  after: html`<ol class="lc-dial">
    ${LOCATIONS.map((l) => html`<li class="lc-dial__row">
      <p class="lc-dial__where">${WHERE[l.id]}</p>
      <a class="lc-dial__call" href="${tel(l.phone)}">
        <span class="lc-dial__city"><b>${l.city}</b>${openStatus(l)}</span>
        <span class="lc-dial__num nums">${l.phone}</span>
        <span class="lc-dial__go">${icon('phone', { size: 18 })}</span>
      </a>
    </li>`)}
  </ol>
  <p class="lc-hero__foot"><b>Not sure? Call any of us.</b> We work as one team. <a class="link" href="#kent">Fax, email &amp; directions ${icon('arrow', { size: 16 })}</a></p>`,
  fill: html`<div class="lc-mark__rings">
    ${THREE_RINGS}
    ${LOCATIONS.map((l) => html`<a class="lc-mark__pin lc-mark__pin--${l.id}" href="#${l.id}">${l.city}<span class="sr-only"> yard details</span></a>`)}
  </div>`,
})}

${LOCATIONS.map((l) => yardBandFull(ctx, l))}

<section class="section field-k lc-map clip" id="map">
  <div class="divider" aria-hidden="true"><i class="plx"></i><i class="plx"></i><i class="plx"></i></div>
  <div class="wrap lc-map__grid">
    <div class="lc-map__copy">
      ${eyebrow('The map')}
      <h2 class="d2">Any yard <em>can help.</em></h2>
      <p class="lede">Call the yard nearest the job. If you can’t tell which that is, call any of us. The three yards work as one team, from Puget Sound to Utqiaġvik.</p>
      <div class="actions">
        <a class="btn" href="${ctx.u('quote/')}">Request a quote ${icon('arrow', { size: 18 })}</a>
        <a class="btn btn--line" href="${ctx.u('alaska/')}#route">Find your way in</a>
      </div>
    </div>
    <div class="lc-map__fig">${deliveryMap(ctx, { compact: true })}</div>
  </div>
</section>

${quoteBand(ctx, { title: 'Know the yard? <em>Send the plans.</em>', body: 'Send drawings or a list and the yard nearest your project will help with the take-off. Or just pick up the phone.', label: 'Estimates & take-offs' })}
`,
  }),
};

export default [pnw, locations];
