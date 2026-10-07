// Section-height audit: demo vs Figma Iteration 6 (heights read from the frames on 5 Oct 2026).
// node tools/audit-spacing.mjs [page ...]   (server on :8110)
import { chromium } from 'playwright-core';
const W = { D: [1440, 900], T: [834, 1100], M: [390, 844] };
const PAGES = {
  home: { url: 'index.html', fig: { D: [810, 374, 362, 320, 436, 142, 410, 75], T: [1314, 453, 521, 429, 570, 137, 442, 75], M: [598, 755, 875, 679, 742, 401, 511, 101] } },
  business: { url: 'for-business.html', fig: { D: [846, 325, 751, 450, 276, 669, 75], T: [1187, 330, 698, 513, 337, 708, 75], M: [1307, 366, 675, 631, 440, 914, 101] } },
  contribute: { url: 'contribute.html', fig: { D: [968, 75], T: [1114, 75], M: [1050, 101] } },
  browse: { url: 'browse.html', fig: { D: [276, 1580, 75], T: [296, 2192, 75], M: [324, 4104, 101] } },
  tool: { url: 'tool.html', fig: { D: [301, 535, 1015, 241, 390, 75], M: [257, 1056, 876, 337, 776, 101], T: [261, 752, 974, 279, 500, 75] } },
  unlocked: { url: 'tool.html?state=unlocked', fig: { D: [301, 535, 1969, 241, 390, 75], M: [257, 1056, 2618, 337, 776, 101], T: [261, 752, 2223, 279, 500, 75] } },
  loading: { url: 'tool.html?state=tier-loading', fig: { D: [301, 535, 1015, 241, 390, 75], T: [261, 752, 974, 279, 500, 75], M: [257, 1020, 876, 337, 776, 101] } },
  toolerror: { url: 'tool.html?state=tier-error', fig: { D: [301, 182, 1015, 241, 390, 75], T: [261, 189, 974, 279, 500, 75], M: [257, 211, 876, 337, 776, 101] } },
  assess1: { url: 'how-we-assess.html', fig: { D: [206, 801, 75], T: [162, 965, 75], M: [152, 1459, 101] } },
  assess4: { url: 'how-we-assess.html#safety-levels', fig: { D: [206, 596, 75], T: [162, 803, 75], M: [152, 1243, 101] } },
  assess2: { url: 'how-we-assess.html#how-we-rate', fig: { D: [206, 618, 75], T: [162, 639, 75], M: [152, 819, 101] } },
  assess3: { url: 'how-we-assess.html#every-tier', fig: { D: [206, 958, 75], T: [162, 1285, 75], M: [152, 1667, 101] } },
  assess6: { url: 'how-we-assess.html#our-facts', fig: { D: [206, 576, 75], T: [162, 571, 75], M: [152, 673, 101] } },
  assess7: { url: 'how-we-assess.html#how-current', fig: { D: [206, 524, 75], T: [162, 519, 75], M: [152, 571, 101] } },
  assess5: { url: 'how-we-assess.html#what-we-check', fig: { D: [206, 896, 75], T: [162, 1036, 75], M: [152, 1518, 101] } },
};
const only = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
let bad = 0;
for (const [pk, { url, fig }] of Object.entries(PAGES)) {
  if (only.length && !only.includes(pk)) continue;
  for (const [wk, exp] of Object.entries(fig)) {
    const [w, h] = W[wk];
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.goto('http://localhost:8110/' + url, { waitUntil: 'networkidle' });
    await p.addStyleTag({ content: '*{animation:none!important;transition:none!important}[data-reveal]{opacity:1!important;transform:none!important}' });
    await p.waitForTimeout(400);
    const got = await p.evaluate(() => [...document.querySelectorAll('body > section, body > main > section, body > main > .aitr-page, body > footer')].map(e => Math.round(e.getBoundingClientRect().height)));
    const line = exp.map((e, i) => { const g = got[i]; const d = g - e; if (Math.abs(d) > 2) bad++; return `${e}${g === undefined ? '?' : (Math.abs(d) > 2 ? `→${g}(${d > 0 ? '+' : ''}${d})` : '✓')}`; }).join('  ');
    console.log(`${pk}-${wk}: ${line}${got.length !== exp.length ? `   [demo has ${got.length} blocks: ${got.join(',')}]` : ''}`);
    await p.close();
  }
}
await b.close();
console.log(bad ? `\n${bad} blocks differ by > 2px` : '\nall match');
