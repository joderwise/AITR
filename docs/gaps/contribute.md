# Gaps — 15 · Contribute (`contribute.html`)

Built from Figma branch `Kn3dOyzTI5wL9zLHKAQdXr`.

## Node IDs used
| Frame | Node | Notes |
|---|---|---|
| Desktop | `2445:6807` | Body `2445:6847` (pt 88 · pb 112 · gap 96) · Intro `2445:6848` (gap 28, lead 440, note 400) · Form `2445:6852` (p 40 · gap 28 · r 28) · Choice `2445:6853` · Fields `2445:6895` / `6919` / `6936` / `6953` · Submit `2445:6871` |
| Tablet | `2445:6985` | Body `2445:7022` (pt 68 · pb 84 · gap 40) · Form `2445:7027` (p 32 · gap 24) |
| Mobile | `2445:7152` | Body `2445:7183` (pt 44 · pb 56 · gap 28) · Form `2445:7188` (p 20 · gap 20) |
| Error (form) D | `2478:9636` | Callout (component `2385:78`) "2 fields need attention" / "Tool Name · Details — fix them and submit again." · Tool Name error `I2478:9652;2386:82` · Details error `I2478:9655;2386:82` |
| Success D | `2477:10392` | Confirmation `2477:10497` (pt 24 · gap 16 · badge Label/S · actions gap 16 pt 8) |
| Error T/M, Success T/M | `2478:9809` · `2478:9960` · `2477:10513` · `2477:10590` | Not fetched (same content; reflow follows the base T/M frames) |

Screenshots: `shots/figma/contribute-{desktop,tablet,mobile,error-desktop,success-desktop}.png` vs `shots/contribute-*.png`.

## Mismatches not fixed (and why)
1. **Submit button 48 tall vs 52 in the Figma frame.** SPEC §5 Button = 48 (`size="large"`); the frame's Button instance measures 52. Token wins.
2. **Confirmation actions gap 24 vs 16 in the design** (`.aitr-confirmation__actions` is the lead's shared component, site.css). Also the shared `.aitr-badge-success` has a 1px Success/Border/Normal hairline; the design badge (`I2477:10497;2476:158`) is fill-only, 6/14 padding.
3. **Focus ring on the error summary** in `?state=error`: focus moves to the Danger callout (SPEC §9), so Chrome paints the global `:focus-visible` ring. The static frame has no ring. Kept — it is the required a11y behaviour.
4. **Nav links absent in some Desktop captures** (Desktop / Error) while present in Success — timing of the shared nav entrance animation under the shot tool, not page markup (`<header class="aitr-nav">` placeholder only). Lead's.
5. **`favicon.ico` 404** on every page — global.
6. **Web Awesome deprecation warnings** `size="large|small|medium"` → `l|s|m`. SPEC §2 mandates the long-form values; lead-level decision.
7. **Tablet/Mobile panel radius**: site.css `.aitr-form-panel` drops to r24 on mobile; the design keeps r28 — overridden back to `--aitr-border-radius-dialog` in `contribute.css` (page-level). Tablet panel padding 32 (design) vs 40 (shared default) also overridden in `contribute.css`.
8. **Required asterisk**: Web Awesome paints its own `*` in the control's internal label part when `required` is set; hidden via `.contribute-panel …::part(label) { display:none }`. The shared `.aitr-form-field` should probably do this globally (lead).
9. **`aria-describedby` across the shadow boundary**: set on the `wa-input`/`wa-textarea` host per the Code Connect snippet; additionally mirrored onto the inner native control via `ariaDescribedByElements` where the browser supports element reflection (progressive enhancement).
10. **Textarea resize grip** removed (`resize="none"`) to match the design; re-enable `resize="vertical"` if usability wins.

## Invented classes (page CSS, `css/pages/contribute.css`)
`.contribute-layout` (two-column body: padding 88/112 → 68/84 → 44/56, gap aside-gap → 2XL → section-inner) · `.contribute-intro`, `.contribute-intro__title|__lead|__note` · `.contribute-panel` (flex child; tablet/mobile padding + radius overrides) · `.contribute-choice`, `.contribute-choice__legend` (fieldset reset; legend floated so it joins the flex flow) · `.contribute-summary__title|__body` (callout copy colours) · `.contribute-field-error`, `.contribute-field-error__text` (circle-alert + message row) · `.contribute-form__actions` · motion hooks `.contribute-confirmation.is-leaving`, `.aitr-form.contribute-is-entering` (reverse cross-fade for "Submit another").

Shared classes consumed as-is: `.aitr-page`, `.aitr-glass`, `.aitr-form-panel`, `.aitr-form.aitr-form--contribute`, `.aitr-form__summary` (wrapping `wa-callout variant="danger" role="alert"`), `.aitr-chip-row[role=radiogroup]` + `wa-button.aitr-chip` (site.js owns single-select / arrow keys; page listens to `aitr-change`), `.aitr-form-field[data-state]` with `__label/__required/__optional/__error`, `.aitr-form__submit`, `.aitr-confirmation[data-layout][data-actions]` with `__heading/__actions`, `.aitr-badge-success`, `.aitr-link[data-arrow]`, `.aitr-visually-hidden`.

## Behaviour implemented (js/pages/contribute.js)
Validation on blur + submit (required; URL must be http(s) with a dotted host; pragmatic email regex) with how-to-fix messages; `aria-invalid` + `aria-describedby`; ≥ 2 errors → Danger `wa-callout` summary (`role="alert"`, `tabindex="-1"`) listing links to the fields, focus → summary, else focus → first invalid field; first invalid field scrolls into view `block: center`; submit → `loading` (900 ms mock) → form `.is-leaving` (Transition/Normal) → Confirmation shown, focus → heading; "Submit another" fades the confirmation out, resets fields/chips/summary and fades the form back in, focus → first chip. `?state=error` / `?state=success` render the frames directly.
