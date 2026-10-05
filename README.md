# AITR mockup — Iteration 6 · Library rebuild

Static HTML / CSS / JS mockup of the AI Trust Ratings site, built from the Figma branch
`Kn3dOyzTI5wL9zLHKAQdXr` (file `2kwR0KaJMl4j4DLdr6PyhR`), page **Iteration 6 · Library rebuild** (`2367:13`),
following every documentation page of the AITR Library (Getting Started › Screen build rules, Dev Handoff,
Accessibility, Motion, Breakpoints & Grid, Typography, the component pages' States & motion tables, the pattern
pages and the Fidelity audit). The digest of those rules is `docs/SPEC.md`.

## Run

```bash
cd ~/aitr
python3 -m http.server 8110        # module scripts need http://, not file://
open http://localhost:8110/
```
Fonts (Public Sans, IBM Plex Mono), Web Awesome 3.11 (`dist-cdn/` build) and Lucide icons load from CDNs.

## Pages and states

| Page | Figma screen | States (`?state=`) |
|---|---|---|
| `index.html` | 11 · Home (animated hero, 14 s loop, Pause control) | — |
| `browse.html` | 12 · Browse Tools | `no-results` · `loading` · `search-loading` |
| `how-we-assess.html` | 13.1–13.7 v2 card style (tabs bar; `#what-is-roai` … `#how-current`; 13.5 cards carry segmented meters) | — |
| `for-business.html` | 14 · For Business | `contact-success` |
| `contribute.html` | 15 · Contribute | `error` · `success` |
| `tool.html` | 16 · Tool detail · locked | `unlocked` (= 17) · `tier-error` · `tier-loading` · `unlock-error` (work email) · `tiers-open` ("See all tiers" modal / bottom sheet over the page) · `?tier=Pro` preselects a tier |

Every page is built at Desktop 1440, Tablet 834 and Mobile 390 (responsive, mobile reflow per the Screen build rules),
honours `prefers-reduced-motion` through the Motion tokens, and ships the documented keyboard / screen-reader behaviour
(combobox search with ⌘K, tabs, tier select + "See all tiers" dialog, form validation with error summaries, inline gate / bottom sheet,
focus management on feedback states).

## Structure

```
css/aitr-tokens.css        generated AITR tokens (from ~/aitr-handoff) — do not edit
css/aitr-components.css    Code Connect component CSS (from ~/aitr-handoff) — do not edit
css/site.css               page shell, glass, aurora, nav/footer, converted components (v1.4–v1.5), feedback, motion
css/pages/*.css            page-specific layout only
js/data/tools.js           mock registry: 84 tools (Browse, search, Tool detail ?tool=<slug>)
js/site.js                 chrome rendering, Lucide icons, search combobox, reveal, count-up, score meters, tables, states
js/pages/*.js              page behaviour (filters, tabs, forms, gate)
assets/brand|logos|icons   exact Figma exports (never redrawn); logos/browse/ = raw image fills behind the circular Browse / Related Tools marks
docs/SPEC.md               build contract (digest of all library documentation)
docs/GAPS.md               consolidated gaps + decisions; docs/gaps/*.md per-page logs
tools/shot.mjs             node tools/shot.mjs <url> <out.png> <width> [full|h]  (Playwright on system Chrome)
tools/audit-spacing.mjs    node tools/audit-spacing.mjs home assess1 … assess7  (section heights vs Figma, ±2 px)
tools/shoot-all.sh         every page × breakpoint × state → shots/review/
tools/figma-fingerprint.js use_figma script for the Figma watch; baseline in docs/watch/fingerprint.tsv
tools/figma-watch-diff.js  diff-only variant (height | text | geometry | style hash per frame) used by the watch loop
shots/figma/               Figma reference renders used for the side-by-side checks
```

> Serve with `python3 tools/serve.py 8110` (no-store headers) instead of `python3 -m http.server`; the plain server lets browsers keep stale CSS/JS, which hid style fixes.
