# Gaps — 14 · For Business (`for-business.html`)

Figma file `Kn3dOyzTI5wL9zLHKAQdXr` · frames Desktop `2442:6724` (1440×3492) · Tablet `2442:7246` · Mobile `2442:7756` · Success Desktop `2477:10657`.
Verified with `tools/shot.mjs` at 1440 / 834 / 390 and `?state=contact-success`; shots in `shots/business-*.png`, Figma references in `shots/figma/business-*.png`.

## Mismatches not fixed (and why)

| # | Observation | Why left |
|---|---|---|
| 1 | **"ROAI Impact Assessment™" block (SPEC §10) does not exist in Figma.** Zero matches in Desktop, Tablet, Mobile or Success design context; the screens go Hero → The Security Illusion → What's included → AI governance & security → We ran it on ourselves first → Get in touch → Footer. | Not invented. Note: Figma has a **"The Security Illusion"** section instead (built, copy verbatim) and a **hero "Registry preview"** column of 3 Registry Cards (ChatGPT · Microsoft Copilot · DeepSeek) — both built. SPEC §10 should be updated. |
| 2 | Mobile "What's included": Figma `2442:7941` draws a compressed **3-column table** (121/117/117, 14/13px text). Built as the briefed **chip picker (Free / Enterprise) + single plan column** instead. | Explicit brief + SPEC §6 Table rule. Flip by removing `.aitr-tier-picker` + the `[data-col]` hide rules in `css/pages/for-business.css` if the Figma behaviour is preferred. |
| 3 | List Item check: Figma shows a plain 18px dark check glyph; `site.css .aitr-list-item__check` renders a green circular badge. Plain items are Text/Normal in Figma, `site.css` makes them Text/Quiet. | Pattern CSS is the lead's (`site.css`). |
| 4 | Registry Card meta "OpenAI · Chat & Search" is mixed-case Caption in Figma; `aitr-components.css .aitr-registry-card__meta` renders mono uppercase. | Code Connect CSS is binding. |
| 5 | Hero headline wraps "governance for / your whole team" (Figma: "governance for your / whole team"). | Heading/5XL letter-spacing token (−0.025em) vs Figma −3.42px (−0.045em). Token wins. |
| 6 | Web Awesome native styles give every `li` `margin-inline-start: 18px`; reset in page CSS (`.business-list > li`). Also WA draws its own required `*` in the control's `::part(label)` when `required` is set; hidden in page CSS (`.business-form … ::part(label)`). | Both are generic — suggest moving the resets to `site.css` (`.aitr-list-item`, `.aitr-form-field`) so Contribute / Lead Gate get them too. |
| 7 | Compact Stat in Figma (`2418:322`) has padding 24 top / 16 right; `site.css .aitr-stat[data-size="compact"]` has none. Added on `.business-stats > .aitr-stat`. | Possibly belongs in `site.css`. |
| 8 | Table header "Feature" cell has padding-inline 14 in Figma vs 28 for the row labels (design inconsistency). Built with 28 so labels align. | Deliberate. |
| 9 | Nav search field renders without the ⌘K hint and the nav links were missing in one capture (nav bar renders from `site.js`). One `404` console error on every load (no local asset missing — likely `favicon.ico`). | Lead's chrome. |
| 10 | `wa-select` options (1–10 … 1,000+ people) are not in the design (Code Connect: "wa-option per choice"). | Invented sensible choices. |

## Behaviour implemented (`js/pages/for-business.js`)
- Validation on blur + submit: required Name / Work Email / Company / Team Size; email format; personal-domain check ("Use your work email address…"); `aria-invalid` + `aria-describedby` → `.aitr-form-field__error`; `wa-callout variant="danger" role="alert"` summary with links when ≥ 2 errors; focus first invalid control. Summary updates only on submit (hiding it on blur reflowed the form under the pointer and swallowed the click — fixed).
- Submit → `loading` on the wa-button (900 ms) → form cross-fades (`--aitr-transition-normal`) into `.aitr-confirmation` (`Message sent` badge · heading focused via `tabindex="-1"`); URL gets `?state=contact-success` via `replaceState`. "Send another message" resets and fades the form back. `?state=contact-success` on load shows the confirmation directly (no focus steal).
- Mobile plan picker: `.aitr-tier-picker[role="radiogroup"]` chips (site.js handles aria/arrow keys) → `aitr-change` sets `data-plan` on `.business-table-wrap`; CSS hides the other `[data-col]`. Tablet scroll/sticky/hint are the lead's `.aitr-table-scroll` + `.aitr-table--sticky` + `.aitr-table-scroll__hint`.

## Assets saved
- `assets/brand/roai-logo-light.svg` — ROAI Logo (component `2408:2474`, instance `2442:6870`). The MCP SVG export wrapped the logo in its ancestors (grey 36/80px backdrop rect, page background, dashed component outline, glass rect + filter); those export wrappers were stripped, the `ROAI Logo` group, masks, pattern and embedded raster are untouched. (Lead reports the same canonical file; not overwritten after that.)
- `assets/logos/chatgpt.png` (128², from `2442:6809` raw image 1) · `assets/logos/microsoft-copilot.png` (512²) · `assets/logos/deepseek.png` (128²).
- Icons: Lucide `check`, `chevron-right`, `circle-alert` via `wa-icon library="lucide"`; `bolt` via default library per Code Connect. No non-Lucide icons needed.

## Node IDs used
Hero `2442:6764` (Product `2442:6766`, Included `2442:6798`, Registry preview `2442:6809`) · Security Illusion `2442:6911` · What's included `2442:6917` / Table `2442:6919` (Tablet `2442:7437`, Mobile `2442:7941`) · AI governance `2442:7038` · We ran it `2442:7059` (Stats `2442:7063`) · Get in touch `2442:7088` / Panel `2442:7089` · Success Panel `2477:10737` / Confirmation `2477:10928` · Table Cell `2384:71` · Stat `2418:323` · List Item `2415:323` · Form Field `2386:83`.

## Invented classes (all `.business-` prefixed, `css/pages/for-business.css`)
`business-section` (per-section padding with ×0.75 / ×0.5 multipliers) · `business-hero`, `__inner`, `__copy`, `__title`, `__lead`, `__cta` · `business-product`, `__logo` · `business-list` · `business-registry`, `__chevron` · `business-split`, `__inner`, `__head`, `__body`, `__lead` · `business-illusion`, `__body`, `__note` · `business-included`, `__inner` · `business-plan-picker` · `business-table-wrap`, `business-table-scroll`, `business-table`, `__feature`, `__plan`, `__tier` · `business-governance` · `business-proof` · `business-stats` · `business-contact`, `__panel`, `__intro`, `__body` · `business-form`, `__summary`, `__summary-list`, `__submit`, `__note`, `__privacy` · state classes `is-fading`.
