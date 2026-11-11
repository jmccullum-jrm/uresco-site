import { html } from '../lib/html.mjs';
import { layout, orgJsonLd } from '../lib/layout.mjs';
import { openStatus, quoteHref } from '../lib/components.mjs';
import { CATEGORIES } from '../data/products.mjs';
import { LOCATIONS, tel } from '../data/locations.mjs';
import { SITE } from '../config.mjs';

export default {
  path: '',
  render: (ctx) => layout(ctx, {
    title: 'Lumber & building materials for Alaska and the Pacific Northwest',
    description: 'Uresco Construction Materials supplies lumber, engineered wood, siding and complete building packages from Kent, Anchorage and Fairbanks, with job-site delivery and remote shipping anywhere in Alaska.',
    jsonLd: orgJsonLd(ctx),
    body: html`
<section class="simple-top">
  <div class="wrap">
    <h1 class="display hero__title">Wholesale building materials for Alaska and the Pacific Northwest.</h1>
    <p class="lede">For more than ${SITE.years} years, delivered to job sites down the road or across an ocean.</p>
    <div class="actions">
      <a class="btn" href="${ctx.u('quote/')}">Request a quote</a>
      <a class="btn btn--line" href="${ctx.u('quote/#plans')}">Send plans</a>
    </div>
    <h2 class="h3 simple-h">Call a yard</h2>
    <ol class="board__rows">
      ${LOCATIONS.map((l) => html`<li>
        <a class="board__row" href="${tel(l.phone)}">
          <span class="board__yard">${l.city}, ${l.state}</span>
          <span class="board__status">${openStatus(l)}</span>
          <span class="board__num num">${l.phone}</span>
        </a>
      </li>`)}
    </ol>
  </div>
</section>

<section class="simple-sec">
  <div class="wrap">
    <h2 class="h3 simple-h">Nine product lines</h2>
    <ul class="simple-list">
      ${CATEGORIES.map((c) => html`<li><a href="${ctx.u('products/' + c.slug + '/')}">${c.name}</a></li>`)}
    </ul>
    <p><a class="link" href="${ctx.u('products/')}">All products</a></p>
  </div>
</section>

<section class="simple-sec">
  <div class="wrap">
    <h2 class="h3 simple-h">Alaska</h2>
    <p>Delivery is available anywhere in Alaska, from Sitka to Utqiaġvik. Off the road system, freight generally moves by sea, barge or air. We can work with you on all of it.</p>
    <p><a class="link" href="${ctx.u('alaska/')}">How Alaska delivery works</a></p>
  </div>
</section>

<section class="simple-sec">
  <div class="wrap">
    <h2 class="h3 simple-h">Buying regularly?</h2>
    <p>Apply online for a contractor account.</p>
    <p><a class="btn btn--line" href="${ctx.u('accounts/')}">Open an account</a></p>
  </div>
</section>
`,
  }),
};
