# 11 · Home — build notes & gaps

Files: `index.html`, `css/pages/home.css` (page JS is an inline module at the end of `index.html`: Pause/Play toggle + trending chips → search).
Figma (branch `Kn3dOyzTI5wL9zLHKAQdXr`): Desktop `2433:4535` · Tablet `2433:5225` · Mobile `2433:5886` · Home Hero instance `2433:4542`
(component `2425:3198`; motion from `get_motion_context` recursive on the instance) · sections `2433:4831` Types · `2433:4910` Levels ·
`2433:4990` Method · `2433:5017` Methodology (+ Factor Grid `2433:5054`) · `2433:5082` Stats · `2433:5102` CTA · Site Nav `2433:5203` · Footer `2388:138`.
Brand nodes: Brand Lockup set `435:906` (Light `435:884`, Dark `594:3004`); ROAI Logo set (Light `2408:2474`, Dark `2408:2503`).
Reference shots: `shots/figma/home-{desktop,tablet,mobile}.png`; build shots: `shots/home-{desktop,tablet,mobile}.png`, `shots/home-hero-desktop.png` (hold state), `shots/home-hero-motion.png` (≈3 s into the loop).

## Assets downloaded (exact Figma exports, no redraws)
- `assets/logos/*.png` — 28 orbit/trending marks named after the Figma layers: landbot, kling-ai, julius, jam-dev, hugging-face, fathom-video, baidu, adobe-firefly, chatgpt, claude, gemini, deepseek, midjourney, grammarly, perplexity, synthesia, microsoft-copilot, github-copilot, heygen, elevenlabs, lovable, runway, notebooklm, fireflies-ai, otter-ai, descript, writesonic, krea (Figma serves these as PNG, so the spec’s `.svg` names are `.png`).
- `assets/icons/hero-ring-{1220,1010,770,510}.png` — the four orbit rings (2× PNG exports, drawn at 1220/1010/770/510).
- `assets/icons/hero-cursor-{ring,dot,ripple}.svg` — synthetic cursor parts.
- `assets/brand/aitr-lockup-{light,dark}.svg`, `assets/brand/roai-logo-{light,dark}.svg` — the lead rewrote these during the build (clean exports, Docs-page ids); verified free of the stage rect / dashed outline / foreignObject that `download_assets` adds, so left untouched. Clean `exportAsync` slices of all four were also pulled (`435:884`, `594:3004`, `2408:2474`, `2408:2503`) and match in path data.
- Hero aurora blobs and the Home aurora are CSS (site.js `renderAurora`), not the Figma SVG blobs — per SPEC §4.

## Could not match exactly / decisions
- **Headline wrap (desktop)**: Chrome renders “Know exactly what data” a few px wider than Figma’s 635 box, so the three Figma lines are forced with `<br class="home-hero__br">` (desktop only, title `white-space: nowrap`). Tablet/mobile wrap naturally like the frames.
- **Hero loop**: scene (orbit, demo, deck, cursor) loops every 14 s exactly as exported; the **copy intro** (headline → lead → search → trending, Reveal 630 / stagger 130) runs **once**, not every loop, so the live search field never blinks out while in use.
- **Step 1 results**: the Figma instance has a single result row (ChatGPT · OpenAI · 6 plans); SPEC §8 lists three (OpenAI API, OpenRouter). Built from the design.
- **Search hint**: the frame shows only the `/` kbd (no ⌘K) — built that way; ⌘K / `/` focus still works via site.js shortcuts.
- **Motion control**: see “2 Oct review” below — the Pause button was replaced by the shared Motion Toggle.
- **Reduced motion**: hero animations are removed entirely; base CSS = the 9.4–14 s hold state (deck visible, steps/labels/cursor hidden).
- **Tablet scene**: Figma places the full-size scene translated by (−664, +516) from the desktop coordinates, centred on the 834 frame; built as such (orbit static, cursor hidden). SPEC’s “max 560, 90 %” scaling is not what the frame shows.
- **Counts**: Figma frame shows 23 · 11 · 38 · 12 (SPEC §10 says 23 · 7 · 30 · 10). Built from the design; `data-count-up` on the numbers.
- **Factor Grid Card**: site.css draws it as separated bordered cells with mono uppercase labels; the Home frame has flush columns (hairline dividers, padding 24, sentence-case Caption/M labels, head row with bottom hairline, result row 18/24). Overridden under `.home-methodology .aitr-factor-grid …` — candidate for promotion into site.css. Tablet keeps 4 columns, mobile 2×2 (per the frames; site.css defaults were 2 / 1). Weakest value colour uses the Warning token (site.css) rather than the design’s `verdict-public-data-only-boundary`.
- **CTA band on tablet**: Home frame keeps the row layout at 834 (site.css stacks at ≤1279) — overridden for `.home-cta` only; mobile stacks with a full-width button.
- **Stats**: site.css pads 32 on all sides; the frame pads top/bottom/left only — right padding zeroed for Home.
- **Level card description** is Caption/M (13) in the frame; site.css sets 14 — overridden for `.home-levels`.
- **Trending chips** are the glass pills with logos drawn in the frame (not the neutral `.aitr-chip`); they are buttons that fill + focus the search.
- Hero search height is site.css’s 60 px large-pill; the frame draws ≈55 px.
- Logo tiles use `--aitr-shadow-l` / `--aitr-shadow-m` instead of the frame’s raw `0 10px 24px -6px rgb(26 26 89 / .14)`.
- Hidden Figma orbit layers (editpad, cohere, capcut, bolt, beyondwords, beautiful-ai, bardeen, article-fiesta, abacus-ai appear only in motion data) are not rendered.
- Page height 2972 vs frame 2953 (+19 px, spread across section rounding).

## Classes invented (prefix `home-`) and small additions on generic classes
- `.home-hero__{page,copy,title,accent,lead,search-wrap,search,trending,trending-label,trend,pause,mobile-card,scene,br}`
- `.home-orbit`, `.home-orbit__{ring,type}` (+ `data-type`, `data-grow`, inline `--x --y --o`) — v3; the v1 `__item/__logo/__badge` nodes are gone
- `.home-label(--search|--plan|--rating)`, `.home-step(--search|--plan)`, `.home-step__{field,icon,list,listlabel,option,mark,text,plans,keys,selected,change,plan}`, `.home-typing`, `.home-caret`
- `.home-deck__card(--free|--business|--enterprise)`, `.home-cursor`, `.home-cursor__{ring,dot,ripple}`
- `.home-section` + `--home-pt/--home-pb` (per-section paddings ×0.75 / ×0.5), `.home-types/levels/method/methodology/cta`, `.home-methodology__{split,copy,body}`, `.home-stats-section`
- On generic classes: `.aitr-level-card__unit` (the “tools” unit next to the count — kept outside the count so count-up doesn’t clobber it); hero-scoped metrics for `.aitr-tier-card` (`__head`, `__title > small`, `__rows/__row`, `__note`) — the hero deck uses the lead’s Tier Card names with the Figma 400/18-20-20/gap 14/radius 22/Glass-Raised metrics.
- Keyframes: `home-rise`, `home-orbit-{fade,spin,counter,grow}`, `home-label-*` ×3, `home-step-*` ×2, `home-typing`, `home-caret`, `home-listbox`, `home-deck-*` ×3, `home-cursor{,-ring,-ripple}`.

## Open items for the lead
- `--aitr-font-size-hero` token referenced by the Figma text style does not exist in `aitr-tokens.css` (site.css hard-codes 60/52/40).
- Promote the Home Factor Grid styling (flush columns) and `.aitr-level-card__unit` into site.css if other pages need them.
- Code Connect mapping prompt from `get_design_context` was declined (left `disableCodeConnect:false`), as SPEC fixes the mapping.
- Not verified: live interaction of the search combobox on this page (relies on site.js `initCombobox`), and the lead’s hero aurora blob positions vs the frame.

## 2 Oct review (frames re-fetched; shots `shots/figma/home-v2-{desktop,tablet,mobile}.png`)
Diffed the refreshed Desktop `2433:4535` (1440×2953), Tablet `2433:5225` (3965) and Mobile `2433:5886` (now 5025) contexts + hero instance `2433:4542` motion context against the build:
- **Orbit artwork unchanged**: the hero instance still carries the same 28 product-logo PNGs (all 28 asset md5s identical to `assets/logos/*.png`), same positions/opacities/blur, same six verdict badges with Lucide `check` / `x` / `triangle-alert` / `building-2` (already `<wa-icon library="lucide">`). No symbolic tool-type icons exist in the current frames, so nothing was swapped; if that decision lands in Figma later the orbit items only need new `src`s.
- **Demo cards, deck, copy, keyframes, section paddings**: identical to v1 (motion context re-fetched; only addition is the toggle’s `Indicator (loop progress)` track, which site.js animates).
- **Motion Toggle** (set `2524:102`, instance `2524:307`): replaces the Pause button. Markup is now `<button type="button" class="home-hero__toggle" data-motion-toggle aria-pressed="false">` hydrated by site.js (ring, arc, icon, tooltip, aria-label). A tiny classic inline script right after it sets `aria-pressed="true"` under `prefers-reduced-motion` *before* the module scripts run, so site.js hydrates it as Paused. Placement from the frames: Desktop bottom 32 / right 64 (56 px), Tablet top 1032 / right 32, Mobile top 554 / right 16. The page listens for the bubbling `aitr-motion` event and maps `detail.paused` → `.aitr-home-hero.is-paused` (pauses every hero animation) + `sessionStorage` `aitr:hero-paused`; a stored choice is replayed through `toggle.click()` so the shared control and the hero stay in sync. Old `.home-hero__pause` / `.aitr-home-hero__pause` removed.
- **Back to Top** (`2524:17502/17506/17510`): rendered by site.js, no page markup.
- **Mobile hero**: 983 → 919 tall (card still at y 622, toggle above it at 554); mobile page 4782 vs frame 5025 — the delta is the lead’s stacked CTA/stat metrics, not hero.
- **Lead edits to `css/pages/home.css` kept**: hero `overflow: visible` + `z-index: 5`, `.home-hero__search-wrap z-index: 6`, scene `overflow: hidden`, trending logos unmasked. Side effect to be aware of: the hero aurora (`.aitr-aurora[data-density="hero"]`, 1440-wide field) is now unclipped, so `scrollWidth` reports 1429 at 834 and 1202 at 390 — `body { overflow-x: clip }` hides it visually (no scrollbar), but Playwright full-page captures come out 1377 / 1191 wide.
- Verified with `tools/shot.mjs` at 1440/834/390 (end state) plus `MOTION=1` mid-loop: toggle ring/arc/pause icon render at the frame coordinates; no console errors from this page (404s: favicon + site.js logo refs).

## 2 Oct, v3 orbit (frames re-fetched; shots `shots/figma/home-v3-{desktop,tablet}.png`)
Desktop `2433:4535` / Tablet `2433:5225` re-fetched with hero instance `2433:4542` design + motion contexts (Mobile unchanged, not re-fetched). Text hash identical; only the Orbit group changed.
- **Orbit = 4 rings + six `Type / …` circles** (60 px, Bubble: fill rgba(255,255,255,.88) → `--aitr-glass-fill-strong`, 1 px rim rgba(255,255,255,.95), radius 30, Elevation/Card → `--aitr-shadow-card`; Icon 26 px Lucide, stroke #4D4FEF → `--aitr-color-brand-on-quiet`). Rendered as `<span class="home-orbit__type" data-type="…"><wa-icon library="lucide" name="…">` at the exported orbit coordinates: video-audio `video` (913,907), chat-search `message-square` (509,603), code `code-xml` (1111,784), writing `pen-line` (555,387), image `image` (919,262, opacity .42), agents `bot` (419,956, opacity .42). Icons come from the site.js Lucide registration, so no SVGs were downloaded.
- **Motion**: the orbit keeps its fade 1.5–9 % + 24°→0 spin; every circle counter-rotates (−24°→0, `home-orbit-counter`); Video & audio and Chat & search additionally scale .8→1 over 9–13.5 % with Entrance easing (`data-grow` → `home-orbit-grow`). Tablet still freezes the orbit at the hold state (`animation: none`). Same Motion Toggle / `.is-paused` wiring as before.
- **Removed**: the 28 logo `span.home-orbit__item` nodes, six `i.home-orbit__badge` verdict badges, `home-badge-*` keyframes and `[data-tool]` grow selectors. `assets/logos/*.png` are now only used by the trending chips, the step/demo cards and the deck (chatgpt, claude, midjourney); the other 25 PNGs are unreferenced and can be deleted by the lead.
- **Clip note**: the Image circle (orbit y 262 → scene y −43) sits above the scene top. The Desktop frame hides it too, but the Tablet frame shows it fully (at ≈ y 471–531 above the scene); the lead's `.home-hero__scene { overflow: hidden }` clips its top half there. Left as is — removing the clip re-exposes the 1520 px orbit outside the hero.
- Verified with `tools/shot.mjs` at 1440 (hold + `MOTION=1` mid-loop: circles at the frame positions, counter-rotating with the orbit, grow visible on video/chat) and 834 full page (3896 tall; circles match `home-v3-tablet.png`). No console errors from this page.
