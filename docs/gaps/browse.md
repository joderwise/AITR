# Gaps · 12 · Browse Tools (`browse.html`)

Files: `browse.html`, `css/pages/browse.css`, `js/pages/browse.js`, `assets/logos/*.png` (24), `shots/browse-*.png`, `shots/figma/browse-*.png`.

## Figma node IDs used
- Desktop `2437:5107` (Header `2437:5141`, Filters `2437:5143`, Results `2437:5167`, Grid `2437:5169`, Load more `2437:5254`) · Tablet `2437:5675` · Mobile `2437:6260`
- No results D `2477:7522` (Empty State `2477:7676`) · Loading D `2477:8021` (skeleton card `2477:8588`) · Search loading D `2483:10510` (Query Field State=Loading `2483:10664`)
- Tablet/Mobile feedback frames (`2477:7690`, `2477:7861`, `2477:8660`, `2477:9302`, `2483:10696`, `2483:10885`) were not fetched individually: their layout follows the main T/M frames (filters wrap/stack, 2-up/1-up grid, 3 skeletons on mobile), which is what the CSS implements.

## Assets saved (exact Figma exports, PNG as published in the file)
`assets/logos/`: abacus-ai, adobe-firefly, ai-image-enlarger, anyword, article-fiesta, bardeen, beautiful-ai, beyondwords, bolt, capcut, chatgpt, claude, cohere, deepseek, descript, editpad, elevenlabs, ernie-bot-baidu, fathom, fireflies-ai, flexclip, fotor, frase, freeconvert (`.png`, 128–512 px, all non-empty).
Note: another builder saved overlapping marks under other names (`baidu.png`, `ernie-bot.png`, `fathom-video.png`, `adobe-firefly.svg` referenced by site.js…). Browse uses the slugs above; dedupe later if wanted.
The two card icons in the design are Lucide (`zap` 16 and `chevron-right` 20) → rendered with `<wa-icon library="lucide">`, no files.

## Invented classes (all `.browse-` prefixed, page-scoped)
`.browse-header .browse-title .browse-filters .browse-search .browse-kbd .browse-listbox(__label|__skeleton|__logo|__text|__name) .browse-results .browse-count-row .browse-count .browse-clear .browse-grid .browse-card__agentic .browse-card__open .browse-empty(__actions) .browse-load-more(__caption)`.

## Mismatches not fixed here (and why)
1. **Registry Card internals are component-level (aitr-components.css / site.css, not editable from a page):**
   - design card: padding 20, radius 20, glass fill; component: padding 24, radius 16, Surface/Raised.
   - design meta line "Vendor · Category" is 13 px Public Sans sentence-case Text/Subtle; component renders `.aitr-registry-card__meta` as 12 px mono UPPERCASE (SPEC "VENDOR · PLAN mono").
   - design Tool Mark tile is 36 with the logo filling the tile; component is 40 with 9 px padding.
   - design footer: verdict pill 28 tall semibold 13 + tier in IBM Plex Mono 12. Close, kept.
   - The "Open" chevron (right) is in the design but not in the Code Connect markup; added as `<wa-icon class="browse-card__open">` inside `__top`.
2. **Skeleton Registry Card**: Code Connect snippet = 3 stacked bones (140 / 190 / 125×28). The Figma skeleton is mark-bone + 2 lines, footer rating-bone + checked-bone. Snippet kept (binding); visual differs slightly.
3. **Verdict tag colours**: WA 3.11 `wa-tag` has no `part="base"` (only `content`), so `wa-tag.aitr-verdict-tag::part(base)` in aitr-components.css never applied. Lead patched site.css during this build; tags now show verdict tones. Keep an eye on it.
4. **Heading size**: SPEC §10 says Heading/4XL; the Figma frame uses style AITR/Heading/5XL (76 / 56 / 40). Built with `.aitr-heading-5xl` to match the design; flag if SPEC should win.
5. **Glass fields**: Code Connect snippet carries `pill`; the Glass appearance in Figma is radius 16 (search 60 tall, selects 64). Built without `pill`, radius `--aitr-border-radius-l`, height 64 for both (`--aitr-space-4xl`).
6. **Loading state count line**: Figma shows "Loading tools…" visibly in the count position (not just a hidden status). Rendered visibly in the `aria-live` count paragraph.
7. **Browse search is a filter, not the site combobox**: the header field filters the 24 cards (250 ms debounce) and does not bind `initCombobox`; the `search-loading` listbox is page markup matching Figma `2483:10664` (logo + name/vendor + plans bones) instead of `scope.searchApi.renderLoading()` whose bones differ from the design.
8. **Web Awesome deprecations**: console warns `size="large"` → `size="l"`, `size="small"` → `size="s"` (SPEC markup kept).
9. **Mobile grid gap**: design 16; token `--aitr-layout-gutter` is 12 on mobile → token used.
10. `/favicon.ico` 404 on every page (site-level).
11. Generic chrome (nav brand entrance, aurora, footer) is the lead's; nav links animate in so full-page Playwright shots sometimes catch them mid-entrance.

## Verification
Rendered with `node tools/shot.mjs` at 1440 / 834 / 390 plus `?state=no-results|loading|search-loading` (desktop + mobile) → `shots/browse-*.png`. Filters, Clear filters, Empty State copy, URL mirroring and Load more exercised via CDP (see report).
