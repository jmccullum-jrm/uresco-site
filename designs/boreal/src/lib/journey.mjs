import { html, raw } from './html.mjs';
import { icon } from './icons.mjs';

// "How a building package travels": five steps, each with a line drawing.
// The drawings share one 560 × 360 canvas and the stroke classes of .fig (see 30-components.css).
const fig = (n, body) => `<svg class="fig jfig" data-fig="${n}" viewBox="0 0 560 360" aria-hidden="true" focusable="false">${body}</svg>`;

const plans = fig(1, `
<rect class="f d" x="108" y="64" width="330" height="236" rx="12" transform="rotate(-5 273 182)"/>
<rect class="f" x="118" y="54" width="330" height="236" rx="12"/>
<path class="d" d="M150 84h200M150 78v12M350 78v12"/>
<path class="l w" d="M150 104h200v124h-200z"/>
<path class="l" d="M238 104v62M238 190v38M238 150h112M300 150v-46"/>
<path class="d" d="M150 190a24 24 0 0 1 24-24M174 166v24"/>
<path class="d" d="M368 104h56M368 120h40M368 136h48"/>
<rect class="l" x="368" y="226" width="62" height="44" rx="4"/><path class="d" d="M378 240h42M378 252h28"/>
<circle class="yf" cx="448" cy="60" r="26"/><path class="k" d="M448 72V49m-9 9 9-9 9 9"/>`);

const takeoff = fig(2, `
<rect class="f" x="104" y="34" width="352" height="292" rx="14"/>
<text class="t" x="130" y="68">TAKE-OFF</text><path class="d" d="M130 84h300"/>
${[['Framing lumber', 76], ['Sheathing & panels', 52], ['I-joists & beams', 60], ['Windows & doors', 34], ['Hardware & fasteners', 68]].map(([label, w], i) => {
    const y = 114 + i * 42;
    return `<g class="row" style="--i:${i}"><rect class="l" x="130" y="${y - 11}" width="22" height="22" rx="6"/><path class="y tick" d="m135.5 ${y + 0.5} 4 4 8-9"/><text class="tx" x="166" y="${y + 5}">${label}</text><rect class="bar" x="${430 - w}" y="${y - 4}" width="${w}" height="8" rx="4"/></g>`;
  }).join('')}`);

const slat = (t) => `M${150 + 130 * t} ${245 + 55 * t}V${135 + 55 * t}M${280 + 130 * t} ${300 - 55 * t}V${190 - 55 * t}`;
const crate = fig(3, `
<path class="f d" d="M60 214l52 22 52-22v-44l-52-22-52 22zM60 170l52 22 52-22M112 192v44"/>
<path class="f" d="M150 245 280 300 410 245V135L280 80 150 135z"/>
<path class="l" d="M150 135 280 190 410 135M280 190v110"/>
<path class="d" d="${[0.25, 0.5, 0.75].map(slat).join('')}"/>
<path class="d" d="${[0.25, 0.5, 0.75].map((t) => `M${150 + 130 * t} ${135 - 55 * t}l130 55`).join('')}"/>
<path class="y w" d="M150 207 280 262 410 207M150 169 280 224 410 169"/>
<path class="d" d="M410 135C440 110 440 84 452 76"/>
<rect class="yf" x="414" y="44" width="124" height="34" rx="8"/><text class="tk" x="476" y="66" text-anchor="middle">→ YOUR SITE</text>`);

const freight = fig(4, `
<path class="d" d="M24 176 96 112l34 30 62-66 64 76 54-46 52 46 66-58 84 82"/>
<path class="d" d="m176 93 16-17 14 17M296 119l14-13 14 13M414 100l14-12 16 14"/>
<path class="d" d="M388 78c-60 4-110 30-150 64" stroke-dasharray="2 8"/>
<path class="l" d="m392 66 44-8c8-1 14 2 14 6s-6 7-14 7l-44-2zM410 61l-14-17M412 70l-10 14"/>
<path class="f" d="M24 234h110v40H24z"/><path class="d" d="M36 274l20-40M66 274l20-40M96 274l20-40"/>
<rect class="l" x="44" y="210" width="50" height="20" rx="2"/><rect class="l" x="94" y="200" width="26" height="30" rx="4"/><path class="y w" d="M52 204h34"/><rect class="f" x="50" y="192" width="38" height="18" rx="2"/><path class="y" d="M62 192v18M76 192v18"/>
<circle class="f" cx="60" cy="232" r="6"/><circle class="f" cx="108" cy="232" r="6"/>
<path class="l w" d="M134 252h394"/>
<path class="f" d="M166 236h236l-14 30H184z"/>
${[[190, 208], [240, 208], [290, 208], [340, 208], [214, 180], [264, 180], [314, 180]].map(([x, y]) => `<rect class="f" x="${x}" y="${y}" width="46" height="28" rx="3"/><path class="y" d="M${x + 14} ${y}v28M${x + 32} ${y}v28"/>`).join('')}
<path class="d" d="M402 242h28"/>
<path class="f" d="M428 238h70l-10 28h-50z"/><rect class="l" x="444" y="214" width="30" height="24" rx="3"/><path class="l" d="M480 238v-18h8v18"/><path class="d" d="M452 222h14"/>
<path class="d" d="M150 290h60M240 304h80M350 290h70M450 304h50" stroke-dasharray="14 10"/>`);

const delivered = fig(5, `
<path class="l w" d="M40 288h480"/>
<path class="l w" d="M128 172 252 92l124 80"/>
<path class="l" d="M148 172v116M356 172v116M148 172h208"/>
<path class="d" d="${[174, 200, 226, 278, 304, 330].map((x) => `M${x} 172v116`).join('')}M252 92v80M200 126v46M304 126v46M200 172l52-80 52 80"/>
<path class="l" d="M226 212h52M252 212v-40"/>
<rect class="f" x="396" y="250" width="92" height="38" rx="3"/><rect class="f" x="408" y="218" width="68" height="32" rx="3"/>
<path class="y" d="M420 250v38M464 250v38M428 218v32M456 218v32"/>
<path class="yf" d="M442 96c-17 0-30 13-30 29 0 22 30 49 30 49s30-27 30-49c0-16-13-29-30-29z"/><path class="k" d="m430 125 9 9 16-18"/>
<path class="d" d="M60 288l-8 14M90 288l-8 14M500 288l-8 14"/>`);

export const FIGURES = [plans, takeoff, crate, freight, delivered];

export const STEPS = [
  { rail: 'Plans', title: 'Send plans or a list', body: 'Drawings, a materials list or a rough scope. For projects that need more than a list, design services are available.', link: ['Design services', 'services/#design'] },
  { rail: 'Take-off', title: 'We help with the take-off', body: 'We help with the take-off and the estimate. On a remote job, a complete list is what keeps a missing box of hangers from becoming a second freight bill.', link: ['Estimates & take-offs', 'services/#takeoffs'] },
  { rail: 'Package', title: 'We package and crate it', body: 'The complete package comes together, with crating and packaging for the trip.', link: ['Crating & packaging', 'services/#crating'] },
  { rail: 'Freight', title: 'We coordinate the freight', body: 'Truck, ocean freight, barge or air. We work with you on all aspects of shipping coordination.', link: ['Shipping coordination', 'services/#shipping'] },
  { rail: 'Delivered', title: 'It lands where you build', body: 'Dock delivery for a village off the road system, or a boom truck and Moffett forklift setting the load on a Puget Sound job site.', link: ['Job-site delivery', 'services/#delivery'] },
];

// The pinned stage (drawings + progress rail) and the steps that drive it.
export const journey = (ctx) => html`
  <div class="journey" data-journey>
    <div class="journey__stage" aria-hidden="true">
      <div class="jstage" data-step="1">
        <div class="jstage__bar"><span>Building package</span><span><b data-jcount>01</b> / 05</span></div>
        <div class="jstage__figs">${raw(FIGURES.join(''))}</div>
        <ol class="jstage__rail">${STEPS.map((s, i) => html`<li data-node="${i + 1}"><i></i><span>${s.rail}</span></li>`)}</ol>
      </div>
    </div>
    <ol class="journey__steps">
      ${STEPS.map((s, i) => html`<li class="jstep" data-step="${i + 1}">
        <span class="jstep__no">0${i + 1}</span>
        <h3 class="h3">${s.title}</h3>
        <p>${s.body}</p>
        <a class="link" href="${ctx.u(s.link[1])}">${s.link[0]} ${icon('arrow', { size: 16 })}</a>
      </li>`)}
    </ol>
  </div>`;
