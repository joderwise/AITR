# 13 · How we assess — v2 "card style" lift-up (2 Oct 2026)

Rebuilt against the replaced Iteration 6 frames (page `2367:13`, nodes `2559:*`). The v1 documentation-style build
(vertical rail 2457:125 / horizontal tab row / Definition Rows) is gone; this page now implements the tabs bar + glass cards.

## Source frames

| Tab | Desktop | Tablet | Mobile | Panel content nodes (Desktop) |
|---|---|---|---|---|
| 13.1 What is ROAI | 2559:12613 | 2559:12769 | 2559:12915 | Intro card 2559:12743 (ROAI logo 56 + 2 paragraphs) · Card grid 2559:12756 (4 Method Cards) |
| 13.2 How we rate a tool | 2559:13029 | 2559:13121 | 2559:13210 | Intro card 2559:13120 |
| 13.3 Every pricing tier, separately | 2559:13265 | 2559:13369 | 2559:13470 | Intro card 2559:13368 · Tier Example 2559:13278 (Row / Stacked on Mobile) |
| 13.4 The four safety levels | 2559:13536 | 2559:13724 | 2559:13909 | Card grid 2559:13647 — Safety Level Cards 2559:13648 · 13667 · 13686 · 13705 |
| 13.5 What we check | 2559:14060 | 2559:14182 | 2559:14301 | Intro card 2559:14156 · Card grid 2559:14169 (4 Method Cards) · Note card 2560:13999 |
| 13.6 Where our facts come from | 2559:14386 | 2559:14477 | 2559:14565 | Intro card 2559:14476 |
| 13.7 How current it is | 2559:14619 | 2559:14709 | 2559:14797 | Intro card 2559:14708 |

Shared pieces: Header band 2559:12617 / 13125 / 13214 · Body 2559:12620 / 13128 / 13217 · Section Nav Layout=Tabs 2558:76
(Item 2558:52 Default · 2558:59 Current) · Tablet "Section Nav (horizontal scroll)" 2559:13129 · Mobile Dropdown 2559:13218 ·
Advisory Disclaimer 2415:107 · Method Card 2415:301 · Safety Level Card 2204:2011 · Tier Example 2430:148 / 2432:266.
Reference renders: `shots/figma/assess-v2-13-{1..7}-desktop.png`, `assess-v2-13-2-tablet.png`, `assess-v2-13-2-mobile.png`,
`assess-v2-13-4-tablet.png`, `assess-v2-13-5-tablet.png`, `assess-v2-13-1-mobile.png`, `assess-v2-13-3-mobile.png`.

## What was built

- **Layout**: header band 88/64 · 68/48 · 44/32 (gap 20/16/12) → body 64/112 · 48/84 · 32/56 as a single column: tabs bar, then
  article (gap 32 · 32 · 24). Article gap 32 on Desktop, 56 on Tablet/Mobile (as drawn). Section gap 24 (Mobile 20).
- **Section Nav**: `data-layout="tabs"` (site.css component rules) on Desktop + Tablet, `dropdown` (`<wa-select>` built by the page
  script, label "On this page" Caption/M Text/Subtle) on Mobile. Tablist semantics unchanged: manual activation, ← → Home End,
  roving tabindex, hash deep links (`#what-is-roai … #how-current`, `replaceState`), inactive panels `hidden`, panel swap
  Fast·Exit out / Reveal·Entrance in (cross-fade on Mobile). Desktop pills `flex: 1` fill the 1312 bar exactly like the frame.
- **Glass cards**: `.aitr-glass.assess-card` — radius 24, padding 40 / 32 / 20, gap 16, body copy measure 880 on Desktop
  (full width on T/M); `.assess-card--note` for the full-width 13.5 note card. Copy is verbatim from the frames.
- **Grids**: `.aitr-grid.aitr-grid--4` → 4 / 2 / 1 for Method Cards (`<article class="aitr-method-card aitr-glass">`, 130 tall) and
  Safety Level Cards (Code Connect markup from SPEC §5, same instances/counts as Home: 23 · 11 · 38 · 12, `data-count-up`).
- **Tier Example**: Row (padding 20 / 20 / 20 / 24, gap 24, label-beside-chip gap 10, 140 tall) and Stacked on Mobile (tool mark
  above the centred name, tier rows label left / chip right).
- Assets: `assets/brand/roai-logo-light.svg` (ROAI Logo 2408:2474, 56) and `assets/logos/chatgpt.png` already existed — no new downloads.

## Page-specific classes (css/pages/how-we-assess.css, `.assess-` prefix)

`.assess-header` · `.assess-body` · `.assess-layout` · `.assess-article` · `.assess-panel` · `.assess-panel__body` ·
`.assess-card` · `.assess-card--note` · `.assess-intro` · `.assess-text-normal`. Everything else is a shared class.
Scoped overrides of shared components (all under `.assess-…`): Tabs bar on ≤1279 — the `<nav>` becomes the horizontal scroller
and the pill hugs its items (`inline-size: max-content`, items `inline-size: auto`) so the whole bar scrolls under the page
margin as in 2559:13129 (site.css scrolls the items inside a full-width pill instead); Method Card title Body/M Strong 16/1.625
and body Caption/M 13/1.385 (component spec 2415:301; site.css uses 16/1.4 and 14/1.5); Safety Level Card `__unit` colour/size;
Tier Example metrics; label hidden for tabs/dropdown.

## Known mismatches / decisions

1. **Nav bottom padding (chrome, not touched)**: the Tablet/Mobile frames give the Nav wrapper 12 bottom padding; `.aitr-nav`
   in site.css has none, so everything below the header sits 12 px higher than the frame at 834 / 390 (Desktop frame has no
   bottom padding and matches). Header paddings were kept at the measured 68/48 · 44/32 rather than faking +12.
2. **Safety Level Card height**: Figma instance is 180 tall (padding 24, count line-height 42 = 34×1.235, gaps 16/16); the
   shared `.aitr-level-card` (aitr-components.css, do-not-edit, also used on Home) uses gap 12 and count line-height 1 → 168
   tall. Left as the shared component for consistency with Home; a component-level fix belongs in aitr-components.css.
3. **Figma Code Connect snippet** for Safety Level Card prints `{count}` and a chip label `ChatGPT Free`; implemented with the
   real labels/counts (Business Ready 23 · Internal Work Only 11 · Public Data Only 38 · Unsafe 12), `__unit` "tools" span as on Home.
4. **Tier Example chips** in the frame are instances labelled "ChatGPT Free" on both chips (Figma override artefact); the
   rendered frame shows "Public Data Only" / "Business Ready", which is what the page uses.
5. **Mobile text wrap**: the 13.2 Mobile frame wraps the second paragraph onto 5 lines; Chrome fits it in 4 at the same
   318 px measure and 16/1.625 type (font metrics), so the mobile intro card is ~26 px shorter than the frame.
6. The design-context flags animated nodes (Aurora / Site Nav entrance) — chrome motion already lives in site.js/site.css;
   no page motion beyond the documented panel swap and the Level Card count-up.
7. Web Awesome prints deprecation warnings for `size="small|large"` (long-form values) — inherited from the Code Connect
   snippets and shared chrome, left as is.

## Verified

`node tools/shot.mjs` renders at 1440 (13.1, 13.2, 13.4), 834 (13.2, 13.5) and 390 (13.2, 13.3) → `shots/assess-v2-*.png`;
page heights within ±5 px of the frames (1091 vs 1088 · 1275 vs 1271 · 1061 vs 1066 at 1440). No console errors.
