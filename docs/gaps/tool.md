# tool.html — gaps & notes (16 · Tool detail · locked / 17 · unlocked / tier-error / tier-loading / unlock-error)

## Figma node IDs used
- Locked: D `2447:6838` · T `2447:7729` · M `2447:8480` — Lead Gate instance `I2447:7548;2419:9192` (panel) / `I2447:9091;2419:9236` (sheet)
- Unlocked: D `2447:9277` (full assessment, Inline Notice `2415:112`)
- Error (tier data): D `2477:9898` (Inline Error `2477:10070`) · Loading (tier data): D `2483:9916` (table `2483:9924`)
- Tool mark `I2447:9332;2390:34` (logo image), Related cards `2447:9949`
- **2 Oct 2026 update (P0 review):** locked frames re-fetched (D 2447:6838 now 1440×2827 · T 2963 · M 3370; unlocked D 3769). Unlock Teaser set `2574:250` — instances `2574:12828` (D, Layout=Row), `2574:12898` (M, Stacked). Scores Card `2419:9188` rows `2419:9157` (Data training) + `2574:13027` (Company location). Unlock error section `2579:13006`: D `2579:13008` · T `2579:13566` · M `2579:14060`, Lead Gate error instance `I2579:13110;2419:9192` → `?state=unlock-error`.

## Assets saved (exact Figma exports, never redrawn)
- `assets/logos/chatgpt.png` (128×128 — Figma supplies a PNG image fill, so the canonical file is `.png`, not the `.svg` named in SPEC §1), `claude.png`, `deepseek.png`, `gemini.png`, `ernie-bot.png` (512/128 px).
- All icons in the frames (arrow-left/right, check, x, lock, chevron-right, bolt) are Lucide glyphs → rendered with `<wa-icon library="lucide">`; nothing saved to `assets/icons/`.

## 2 Oct 2026 changes (what moved, and how it was built)
- **Unlock Teaser** (`.tool-teaser*`, page-scoped) sits in the Tier comparison block (gap 14) under the table / Tier Card: Brand/Fill/Quiet panel + Brand/Border/Quiet hairline, radius 24, padding 32, gap 40, Elevation Card; lock-keyhole 24 + Heading/XL + Body/M copy (330 col) · "What you get" 2×2 benefits (200-wide, gap 12/24, check 18 Brand, Label/M title + Caption/M line) · Primary Button "Unlock for free" + Caption/M note. Copy verbatim (placeholder until the copywriter's text lands). All icons are Lucide glyphs (`wa-icon library="lucide"`), nothing saved to `assets/`.
- Teaser CTA opens the Lead Gate: Desktop/Tablet scroll the inline panel into view + focus its first field; Mobile `showModal()` on the bottom-sheet dialog (focus returns to the teaser button on close).
- **Tablet (834)** Figma Row clips the benefits column (overflow-clip artefact in the frame) — built instead as copy + CTA on the first row and the 2-up benefits below (padding 24 = ×0.75). **Mobile** = Stacked as drawn (padding 20, gap 20, one benefit column, full-width button).
- Teaser is hidden on `unlocked` (not drawn on 17) and on `tier-error` / `tier-loading` — those Feedback frames (`2477:9898`, `2483:9916`) were **not** updated on 2 Oct (no teaser, old heading); the renamed heading is kept page-wide since it follows the selected tier.
- Details heading renamed **"Enterprise tier · full assessment"** (`<span data-field="tier-name">` + " tier · full assessment"), all breakpoints.
- Scores Card: title **"The four factors"**, policy rows **Data training** (was "Training policy") + new **Company location** (`data-field="jurisdiction"`, follows the tier). Uses shared `.aitr-scores-card__policy` twice — no new CSS.
- Lead Gate **State=Error (work email)**: Work Email field `aria-invalid` + circle-alert 16 + Caption/M Danger "Please use your work email. Personal addresses (Gmail, Outlook…) aren’t accepted." (`.tool-field-error` mirrors contribute.css; error `<p>` now icon + `<span>`). Real validation: format check → "Enter a valid work email."; known personal-mailbox domains (gmail, outlook, hotmail, yahoo, icloud, proton…) → the Figma copy. `?state=unlock-error` pre-fills `jane@gmail.com` in both gate forms (Figma shows it as placeholder text; a real value is used so the field is genuinely invalid).
- **Score=Not disclosed**: no frame draws it, so no tier data uses it, but `applyTier` supports `security`/`transparency: null` → shared `.aitr-score[data-status="not-disclosed"]` (dashed pips, "Not disclosed", no `aria-valuenow`, `aria-valuetext`) and the Tier Card prints "Not disclosed".
- Teaser title opts out of Web Awesome's default `text-wrap: balance` so it wraps as Figma draws ("…rated this / way?").
- **17 · unlocked v3** (D `2447:9277` 1440×3909 · T `2447:10028` 4487 · M `2447:10711` 5249; locked unchanged): "Official documentation" replaced by **"Sources by topic"** — `<dl class="tool-sources">` rows (Security · Data training · Transparency · Location), topic Label/M 140 col + grouped Code Connect Citations (`.aitr-citation-list` › `a.aitr-citation`), gap 16, padding 12, bottom hairline; Mobile stacks topic over citations (gap 8). Security = 3 + 4 SECURITY PAGE · Data training = 1 PRIVACY POLICY + 5 DATA PROCESSING AGREEMENT · Transparency = 2 TERMS OF SERVICE · Location = 1 PRIVACY POLICY. Citation 1 is drawn twice: only its first occurrence (Data training) carries `id="cite-1"` ("Show source" target); the Location copy has `data-cite="1"` only. Refs `shots/figma/tool-v3-unlocked-{1440,834,390}.png`; builds `shots/tool-v3-unlocked-*.png` (3855 / 4470 / 5493 vs 3909 / 4487 / 5249 — mobile taller from the picker + wrapped text, pre-existing).
- **Details heading differs per frame**: locked = "Enterprise tier · full assessment", unlocked = "Details for the Enterprise tier" — both rendered in the `h2` as `[data-when="locked|unlocked"]` spans toggled by `body[data-state="unlocked"]` (tier name still live in both).
- Reference renders: `shots/figma/tool-v2-locked-{1440,834,390}.png`, `tool-v2-unlocked-1440.png`, `tool-v2-unlock-error-1440.png`, `tool-v2-tier-{error,loading}-1440.png`; builds `shots/tool-v2-*.png` (heights 2780 / 3002 / 3320 / unlocked 3715 vs Figma 2827 / 2963 / 3370 / 3769).

## Design facts that differ from the brief / SPEC §10 (Figma followed)
- **6 tiers**, not 5: Free · Go · Plus · Pro · Business · Enterprise (Go = Public Data Only · 5 / 8).
- Verdict Card copy is the Code Connect/design text: `DATA CLEARANCE` · Business Ready · "Approved for confidential data — business-grade controls verified." · `SAFE FOR PUBLIC, INTERNAL AND CONFIDENTIAL DATA` (SPEC §10 lists "VERDICT · ENTERPRISE PLAN … SRC-05 · HUMAN VERIFIED").
- **5 citations** (two "SECURITY PAGE"), not 4. Score numerals read "7 out of 10" (design/Code Connect), not "7 / 10".
- In the locked frames the **whole** assessment incl. Verdict + Scores cards sits inside the 820-tall blurred overlay (SPEC text implies they sit outside). Reproduced as drawn; Figma uses blur 6 + 50% opacity — built with the token rule blur(12px) + 50% opacity.
- Only layout difference 16 → 17: the Inline Notice row is inserted between the title and the assessment and the Unlock Teaser disappears; everything else is in place.
- Loading frame shows **bones in the header row too** (no chips) and the hint "Loading the tier comparison…"; reproduced (brief said keep chips).
- Figma Tablet shows the tier picker + Tier Card (not a scrolling table) and Figma Mobile pins the sheet-styled gate inside the overlay. Built per SPEC/site.css instead: tablet = scroll table with sticky factor column + "Scroll for more tiers →", mobile = collapsed teaser + `<dialog>` bottom sheet. Mobile overlay height is site.css's 520 (Figma 760).
- Provenance block ("Powered by the ROAI Governance Framework." + meta + "How we assess →") precedes the disclaimer in all frames; included although not listed in the brief.

## Not fixable here (shared / library)
- Score pips, verdict reveal, table tier selection and citation highlight come from site.js/site.css; the tier highlight cross-fades per column (site.js toggles `.is-highlighted`) rather than sliding a single block.
- `wa-*` size attribute names (`small/large`) are what SPEC §5 prescribes; Web Awesome 3.11 logs deprecation warnings for them.
- Registry Card chevron ("Open") and agentic bolt are in the design but not in the Code Connect markup; added as page-scoped extras (`.tool-related__open`, `.tool-related__agentic`).

## Page-scoped overrides of shared styles (documented intent)
- Compact tier table: white header row, only the selected `th[aria-selected]`/`.is-highlighted` cells are Surface/Lowered; 48-tall rows, factor column 200.
- `.aitr-verdict-card__title` at Heading/4XL (component sheet default is 5XL); `.aitr-scores-card__title` at Heading/XL.
- Fact Row laid out as flex so value + "Show source" sit on the right (site.css grid puts the source under the text).
- Explicit z-index/isolation on `.aitr-locked` children — Chrome painted the blurred content over the gate otherwise.
- Verdict copy for non-Enterprise tiers (Public Data Only body/why text) is placeholder live data.

## Invented classes (all `.tool-` prefixed)
`.tool-page`, `.tool-section--header|--compare|--details|--provenance|--related`, `.tool-header__title|__description`, `.tool-compare`, `.tool-compare__hint|__corner|__card|__card-identity`, `.tool-details`, `.tool-details__title`, `.tool-assessment`, `.tool-assessment__clearance|__section|__heading|__content`, `.tool-citations`, `.tool-provenance`, `.tool-provenance__meta`, `.tool-related`, `.tool-related__open|__agentic`, `.tool-teaser`, `.tool-teaser__copy|__icon|__title|__body|__benefits|__benefit|__benefit-text|__benefit-title|__benefit-line|__cta|__note`, `.tool-field-error`, `.tool-field-error__text`, `.tool-sources`, `.tool-sources__row|__topic|__cites`.

## Verification
`shots/tool-desktop.png`, `tool-desktop-top.png`, `tool-unlocked-desktop.png`, `tool-desktop-after-unlock.png`, `tool-tablet.png`, `tool-mobile.png`, `tool-mobile-sheet.png`, `tool-unlocked-mobile.png`, `tool-error-desktop.png`, `tool-error-mobile.png`, `tool-loading-desktop.png`, `tool-loading-mobile.png` vs `shots/figma/tool-*.png`. Playwright flow checks passed: tier switch (table ↔ picker sync, live region, score status), gate validation (summary alert at ≥2 errors, focus first invalid), unlock in place, sheet open/Esc/focus-return/submit. No horizontal overflow at 390.
- 2 Oct (v3): heading toggles locked/unlocked; "Show source" → `#cite-1` lands on the Data training row (highlight + focus, in view); `#cite-5` → `#src-5` (Zero Training); no duplicate ids.
- 2 Oct: Playwright flow re-checked — teaser CTA focuses `#gate-name` with the panel in view (1440) / opens `#gate-sheet` and returns focus on Esc (390); `jane@gmail.com` → Form Field error with the Figma copy, `aria-invalid`, focus on the field; `jane@mail.acme.com` unlocks in place (teaser hidden, notice focused); tier switch updates the heading ("Free tier · full assessment") and both Scores Card rows; `?state=unlock-error` sets both gate forms' email to error. Note: a pointer click on the submit button right after editing an errored field can miss (blur re-validation collapses the 3-line error and shifts the button) — pre-existing blur-validate behaviour, keyboard submit unaffected.
