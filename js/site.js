import { TOOLS_DB, VERDICT_LABELS } from './data/tools.js';
/* AITR site behaviour — shared across every page.
   Renders the page chrome (Site Nav, Site Footer, Aurora Background) from placeholders, registers the Lucide icon
   library for <wa-icon>, and implements the generic behaviours specified in the library documentation:
   nav entrance / scrolled / mobile sheet · search combobox (Results · Plan · No results · Loading) · section reveal ·
   count-up · Score Meter fill + status · Chip toggles · Table tier selection · Citations · ?state= helper.
   Page-specific behaviour lives in js/pages/<page>.js. */

import { registerIconLibrary } from 'https://cdn.jsdelivr.net/npm/@awesome.me/webawesome@3.11.0/dist-cdn/webawesome.js';

document.documentElement.classList.remove('no-js');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const mqTablet = window.matchMedia('(max-width: 1279px)');
const mqMobile = window.matchMedia('(max-width: 767px)');
export const motion = { reduced: () => reduceMotion.matches, tablet: () => mqTablet.matches, mobile: () => mqMobile.matches };
export const tokens = {
  ms(name) { const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim(); return v.endsWith('ms') ? parseFloat(v) : v.endsWith('s') ? parseFloat(v) * 1000 : parseFloat(v) || 0; },
};

/* ---------- Icons: Lucide (Iconography page) + aliases for the Font Awesome names in the Code Connect snippets ---------- */
const LUCIDE_ALIASES = { 'magnifying-glass': 'search', bolt: 'zap', xmark: 'x', 'circle-xmark': 'circle-x', 'triangle-exclamation': 'triangle-alert', 'circle-info': 'info', 'circle-check': 'circle-check', 'lock': 'lock-keyhole', 'arrow-up-right-from-square': 'external-link' };
const lucide = {
  resolver: (name) => `https://cdn.jsdelivr.net/npm/lucide-static@0.544.0/icons/${LUCIDE_ALIASES[name] || name}.svg`,
  mutator: (svg) => { svg.setAttribute('fill', 'none'); svg.setAttribute('stroke', 'currentColor'); svg.setAttribute('stroke-width', '2'); svg.setAttribute('stroke-linecap', 'round'); svg.setAttribute('stroke-linejoin', 'round'); },
};
registerIconLibrary('lucide', lucide);
registerIconLibrary('default', lucide);

/* ---------- Page chrome ---------- */
const PAGES = [
  { key: 'browse', label: 'Browse Tools', href: 'browse.html' },
  { key: 'assess', label: 'How we assess', href: 'how-we-assess.html' },
  { key: 'business', label: 'For Business', href: 'for-business.html' },
  { key: 'contribute', label: 'Contribute', href: 'contribute.html' },
];

function renderNav(header) {
  const current = header.dataset.current || '';
  const withSearch = header.dataset.search === 'true';
  const links = PAGES.map((p, i) => `<a class="aitr-nav-link" href="${p.href}" style="--i:${i}"${current === p.key ? ' aria-current="page"' : ''}>${p.label}</a>`).join('');
  const sheetLinks = PAGES.map((p) => `<a class="aitr-nav__sheet-link" href="${p.href}"${current === p.key ? ' aria-current="page"' : ''}>${p.label}<wa-icon library="lucide" name="chevron-right" aria-hidden="true"></wa-icon></a>`).join('');
  header.innerHTML = `
    <div class="aitr-nav__bar aitr-glass aitr-glass--raised">
      <a class="aitr-brand" href="index.html" aria-label="AI Trust Ratings — home"><img src="assets/brand/aitr-lockup-light.svg" alt="" height="31" width="179"></a>
      ${withSearch ? `<form class="aitr-nav__search aitr-combobox" role="search" aria-label="Search AI tools" data-search-scope="nav">
        <wa-input class="aitr-field" appearance="filled" type="search" placeholder="Search AI tools…" size="medium" with-clear
          role="combobox" aria-label="Search AI tools" aria-expanded="false" aria-controls="nav-search-list" aria-autocomplete="list" autocomplete="off">
          <wa-icon slot="start" library="lucide" name="search" aria-hidden="true"></wa-icon>
        </wa-input>
        <ul id="nav-search-list" role="listbox" class="aitr-search-listbox" aria-label="Matching tools" hidden></ul>
        <p class="aitr-visually-hidden" aria-live="polite" data-search-status></p>
      </form>` : ''}
      <nav class="aitr-nav__links" aria-label="Main">${links}</nav>
      <div class="aitr-nav__actions">
        <wa-button class="aitr-icon-button aitr-nav__search-button" appearance="plain" pill aria-label="Search AI tools"><wa-icon library="lucide" name="search" label="Search"></wa-icon></wa-button>
        <wa-button class="aitr-icon-button aitr-nav__menu-button" appearance="plain" pill aria-expanded="false" aria-controls="nav-sheet" aria-label="Open menu"><wa-icon library="lucide" name="menu" label="Menu"></wa-icon></wa-button>
      </div>
    </div>
    <div class="aitr-nav__sheet aitr-glass aitr-glass--raised" id="nav-sheet" hidden>
      <form class="aitr-combobox" role="search" aria-label="Search AI tools" data-search-scope="sheet">
        <wa-input class="aitr-field" appearance="filled" type="search" placeholder="Search AI tools…" size="large" with-clear data-shortcut="false"
          role="combobox" aria-label="Search AI tools" aria-expanded="false" aria-controls="sheet-search-list" aria-autocomplete="list" autocomplete="off" enterkeyhint="search" autocapitalize="off" autocorrect="off">
          <wa-icon slot="start" library="lucide" name="search" aria-hidden="true"></wa-icon>
        </wa-input>
        <ul id="sheet-search-list" role="listbox" class="aitr-search-listbox" aria-label="Matching tools" hidden></ul>
        <p class="aitr-visually-hidden" aria-live="polite" data-search-status></p>
      </form>
      <nav aria-label="Main (menu)">${sheetLinks}</nav>
      <div class="aitr-nav__sheet-footer"><a href="#">Privacy Policy</a><a href="how-we-assess.html#what-is-roai">Advisory Disclaimer</a></div>
    </div>`;

  // Scrolled state (Navigation pattern): shadow Card → Float once scrollY > 8
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu sheet
  const menuButton = header.querySelector('.aitr-nav__menu-button');
  const sheet = header.querySelector('.aitr-nav__sheet');
  const sheetIcon = menuButton.querySelector('wa-icon');
  let lastFocus = null;
  const closeSheet = () => {
    if (sheet.hidden) return;
    sheet.hidden = true; menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Open menu');
    sheetIcon.setAttribute('name', 'menu'); document.body.classList.remove('aitr-scroll-lock'); (lastFocus || menuButton).focus();
  };
  const openSheet = () => {
    lastFocus = document.activeElement; sheet.hidden = false; menuButton.setAttribute('aria-expanded', 'true'); menuButton.setAttribute('aria-label', 'Close menu');
    sheetIcon.setAttribute('name', 'x'); document.body.classList.add('aitr-scroll-lock');
    const field = sheet.querySelector('wa-input'); customElements.whenDefined('wa-input').then(() => field.focus());
  };
  menuButton.addEventListener('click', () => (sheet.hidden ? openSheet() : closeSheet()));
  sheet.addEventListener('click', (e) => { if (e.target.closest('a')) closeSheet(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !sheet.hidden) closeSheet(); });
  sheet.addEventListener('keydown', (e) => { // focus trap
    if (e.key !== 'Tab') return;
    const f = [...sheet.querySelectorAll('wa-input, a, wa-button, button')].filter((el) => !el.hidden);
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); menuButton.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); menuButton.focus(); }
  });
  mqMobile.addEventListener('change', () => { if (!mqMobile.matches) closeSheet(); });

  // Search icon button: focus the page-header field when one exists, otherwise open the sheet search / search view
  header.querySelector('.aitr-nav__search-button').addEventListener('click', () => {
    const pageField = document.querySelector('main [data-search-scope] wa-input, main wa-input[type="search"]');
    if (pageField && !mqMobile.matches) { pageField.scrollIntoView({ block: 'center', behavior: motion.reduced() ? 'auto' : 'smooth' }); pageField.focus(); return; }
    if (pageField && mqMobile.matches) { openSearchView(pageField.closest('[data-search-scope]') || pageField.parentElement); return; }
    openSheet();
  });
}

function renderFooter(footer) {
  footer.innerHTML = `<div class="aitr-footer__inner">
    <p>Powered by ROAI · © 2026 RAB2B Operational AI</p>
    <nav aria-label="Legal"><a href="#">Privacy Policy</a><span aria-hidden="true">·</span><a href="how-we-assess.html#what-is-roai">Advisory Disclaimer</a></nav>
  </div>`;
}

/* Aurora Background — Density Page / Home / Hero (Aurora Background page: blobs, blur, opacity, 14 s drift) */
const AURORA = {
  page: { blobs: Array.from({ length: 10 }, (_, i) => { const pair = Math.floor(i / 2), left = i % 2 === 0; return { x: left ? -260 : 720, y: -120 + pair * 742 + (left ? 0 : 200), size: left ? 980 : 900, c: left ? 'var(--aitr-color-aurora-indigo-bright)' : (pair % 2 ? 'var(--aitr-color-aurora-cyan-deep)' : 'var(--aitr-color-green-50)'), o: pair === 0 ? 0.16 : 0.11, blur: 260, d: -(i * 1.4) }; }) },
  home: { blobs: [
    { x: -160, y: 120, size: 760, c: 'var(--aitr-color-aurora-indigo-bright)', o: 0.08, blur: 344, d: 0 },
    { x: 900, y: 420, size: 640, c: 'var(--aitr-color-aurora-cyan-deep)', o: 0.06, blur: 300, d: -3 },
    { x: 120, y: 1240, size: 700, c: 'var(--aitr-color-green-50)', o: 0.04, blur: 320, d: -6 },
    { x: 860, y: 1760, size: 620, c: 'var(--aitr-color-aurora-violet)', o: 0.05, blur: 240, d: -9 },
    { x: -80, y: 2380, size: 720, c: 'var(--aitr-color-aurora-indigo-bright)', o: 0.03, blur: 300, d: -11 },
  ] },
  hero: { wash: true, blobs: [
    { x: 760, y: -140, size: 760, c: 'var(--aitr-color-aurora-indigo-bright)', o: 0.28, d: 0 },
    { x: 1040, y: 220, size: 640, c: 'var(--aitr-color-aurora-violet)', o: 0.2, d: -4.67 },
    { x: 560, y: 380, size: 560, c: 'var(--aitr-color-aurora-cyan-deep)', o: 0.18, d: -9.33 },
    { x: -200, y: 160, size: 680, c: 'var(--aitr-color-indigo-80)', o: 0.22, d: -2.3 },
  ], highlights: [ { x: 980, y: 40, size: 320, o: 0.55, d: 0 }, { x: 700, y: 520, size: 260, o: 0.4, d: -7 } ] },
};
function renderAurora(el) {
  const d = el.dataset.density || 'page'; const spec = AURORA[d] || AURORA.page;
  const blob = (b, extra = '') => `<span class="aitr-aurora__blob" style="--x:${b.x}px;--y:${b.y}px;--size:${b.size}px;--c:${b.c};--o:${b.o};--blur:${b.blur || 260}px;--d:${b.d}s;--dx:${(b.size % 3) * 18 + 24}px;--dy:${-((b.size % 5) * 8 + 16)}px;--dy2:${(b.size % 4) * 7 + 12}px${extra}"></span>`;
  el.innerHTML = `<div class="aitr-aurora__field">${spec.wash ? '<span class="aitr-aurora__wash"></span>' : ''}${spec.blobs.map((b) => blob(b)).join('')}${(spec.highlights || []).map((h) => `<span class="aitr-aurora__highlight" style="--x:${h.x}px;--y:${h.y}px;--size:${h.size}px;--o:${h.o};--d:${h.d}s"></span>`).join('')}</div>`;
  if (motion.reduced()) el.dataset.motion = 'still';
}

/* ---------- Search combobox (Search Flow pattern · Query Field states) ---------- */
/* Search data = the 84-tool mock registry (js/data/tools.js) + the Figma example tool "AI Tool" that the hero demo and Tool detail frames use. */
export const TOOLS = [
  { name: 'AI Tool', vendor: 'Example Inc.', category: 'Chat & Search', plans: 6, slug: 'ai-tool', initial: 'AI', tiers: [['Free', 'public-data-only', 'Public Data Only'], ['Go', 'public-data-only', 'Public Data Only'], ['Plus', 'public-data-only', 'Public Data Only'], ['Pro', 'public-data-only', 'Public Data Only'], ['Business', 'business-ready', 'Business Ready'], ['Enterprise', 'business-ready', 'Business Ready']] },
  ...TOOLS_DB.map((t) => ({ name: t.name, vendor: t.vendor, category: t.typeLabel, plans: t.tiers.length, slug: t.slug, logo: t.logo || undefined, initial: t.logo ? undefined : t.initials,
    tiers: t.tiers.map((x) => [x.label, x.verdict, VERDICT_LABELS[x.verdict]]) }))
];

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const toolMark = (t, size = 32) => t.initial ? `<span class="aitr-tool-mark aitr-tool-mark--generic" style="--size:${size}px" aria-hidden="true">${esc(t.initial)}</span>` : `<img class="aitr-tool-mark${size === 32 ? ' aitr-tool-mark--s' : ''}" src="${t.logo}" alt="" width="${size}" height="${size}" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'aitr-tool-mark aitr-tool-mark--s aitr-search-listbox__fallback',textContent:'${esc(t.name[0])}'}))">`;

export function initCombobox(scope) {
  const input = scope.querySelector('wa-input[role="combobox"]');
  const list = scope.querySelector('[role="listbox"]');
  const status = scope.querySelector('[data-search-status]');
  if (!input || !list) return;
  let timer, active = -1, step = 'results', selectedTool = null, items = [];
  const open = () => { list.hidden = false; list.classList.remove('is-closing'); input.setAttribute('aria-expanded', 'true'); };
  const close = (clear = false) => {
    if (list.hidden) { if (clear) input.value = ''; return; }
    list.classList.add('is-closing'); input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant');
    const done = () => { list.hidden = true; list.classList.remove('is-closing'); list.removeAttribute('aria-busy'); };
    motion.reduced() ? done() : setTimeout(done, tokens.ms('--aitr-transition-fast') || 100);
    step = 'results'; selectedTool = null; active = -1; if (clear) input.value = '';
  };
  const setActive = (i) => {
    const opts = [...list.querySelectorAll('[role="option"]')]; if (!opts.length) return;
    active = (i + opts.length) % opts.length;
    opts.forEach((o, k) => o.setAttribute('aria-selected', String(k === active)));
    input.setAttribute('aria-activedescendant', opts[active].id); opts[active].scrollIntoView({ block: 'nearest' });
  };
  const renderResults = (q) => {
    items = TOOLS.filter((t) => [t.name, t.vendor, t.category].some((v) => v.toLowerCase().includes(q.toLowerCase()))).slice(0, 6);
    if (!items.length) {
      list.setAttribute('role', 'listbox');
      list.innerHTML = `<li class="aitr-search-listbox__empty" role="status">No assessed tool matches “${esc(q)}”.<br><a class="aitr-link" href="contribute.html">Suggest this tool<wa-icon library="lucide" name="arrow-right" aria-hidden="true"></wa-icon></a></li>`;
      status.textContent = `No results for “${q}”`; open(); return;
    }
    list.innerHTML = `<li class="aitr-search-listbox__label" aria-hidden="true">Matching tools</li>` + items.map((t, i) => `<li role="option" id="${list.id}-opt-${i}" style="--i:${i}" aria-selected="${i === 0}" data-index="${i}">${toolMark(t)}<span class="aitr-search-listbox__name">${esc(t.name)} <span class="aitr-search-listbox__meta">${esc(t.vendor)}</span></span><span class="aitr-search-listbox__meta">${t.plans} plan${t.plans === 1 ? '' : 's'}</span></li>`).join('') +
      `<li class="aitr-search-listbox__hints" aria-hidden="true"><span>↑↓ to move</span><span>↵ to select</span><span>Esc to close</span></li>`;
    status.textContent = `${items.length} result${items.length === 1 ? '' : 's'}`; open(); setActive(0); step = 'results';
  };
  const renderPlan = (tool) => {
    selectedTool = tool; step = 'plan';
    list.innerHTML = `<li class="aitr-search-selected" aria-hidden="true">${toolMark(tool)}<span>${esc(tool.name)}</span><wa-button appearance="filled" size="small" pill data-change>Change</wa-button></li>
      <li class="aitr-search-listbox__label" aria-hidden="true">Which plan are you on?</li>` +
      tool.tiers.map(([plan, verdict, label], i) => `<li role="option" id="${list.id}-plan-${i}" class="aitr-search-listbox__plan" style="--i:${i}" aria-selected="${i === 0}" data-index="${i}"><span>${esc(plan)}</span><wa-tag class="aitr-verdict-tag" data-verdict="${verdict}" size="small" pill>${label}</wa-tag></li>`).join('');
    list.setAttribute('aria-label', 'Which plan are you on?'); status.textContent = `${tool.name}: which plan are you on? ${tool.tiers.length} plans`; open(); setActive(0);
    list.querySelector('[data-change]').addEventListener('click', (e) => { e.stopPropagation(); renderResults(input.value || tool.name); input.focus(); });
  };
  const renderLoading = () => { list.setAttribute('aria-busy', 'true'); list.innerHTML = `<li class="aitr-visually-hidden" role="status">Searching…</li>` + [0, 1, 2].map((i) => `<li role="option" id="${list.id}-skel-${i}" aria-hidden="true"><span class="aitr-bone" style="inline-size:40%"></span><span class="aitr-bone" style="inline-size:70%"></span></li>`).join(''); open(); };
  const choose = () => {
    const opts = [...list.querySelectorAll('[role="option"]')]; const opt = opts[active]; if (!opt) return;
    if (step === 'results') { const t = items[Number(opt.dataset.index)]; if (t.tiers.length > 1) renderPlan(t); else location.href = `tool.html?tool=${t.slug}`; }
    else if (step === 'plan') { const tier = selectedTool.tiers[Number(opt.dataset.index)][0]; location.href = `tool.html?tool=${selectedTool.slug}&tier=${encodeURIComponent(tier)}`; }
  };
  input.addEventListener('input', () => {
    clearTimeout(timer); const q = input.value.trim();
    if (!q) { close(); return; }
    timer = setTimeout(() => renderResults(q), 150); // 150 ms debounce (Search Flow)
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (list.hidden && input.value.trim()) renderResults(input.value.trim()); else setActive(active + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active - 1); }
    else if (e.key === 'Enter') { if (!list.hidden) { e.preventDefault(); choose(); } }
    else if (e.key === 'Escape') { e.preventDefault(); if (!list.hidden) close(); else if (input.value) input.value = ''; }
    else if (e.key === 'Tab') close();
  });
  list.addEventListener('mousedown', (e) => e.preventDefault());
  list.addEventListener('click', (e) => { const opt = e.target.closest('[role="option"]'); if (!opt) return; active = [...list.querySelectorAll('[role="option"]')].indexOf(opt); choose(); });
  input.addEventListener('wa-clear', () => close(true));
  document.addEventListener('click', (e) => { if (!e.composedPath().includes(scope)) close(); }); // composedPath: the clicked option may already be re-rendered (Results → Plan)
  scope.addEventListener('submit', (e) => { e.preventDefault(); if (!list.hidden) choose(); else if (input.value.trim()) location.href = `browse.html?q=${encodeURIComponent(input.value.trim())}`; });
  scope.querySelectorAll('wa-button.aitr-chip[data-search]').forEach((chip) => chip.addEventListener('click', () => { input.value = chip.dataset.search; input.focus(); renderResults(chip.dataset.search); }));
  scope.searchApi = { renderResults, renderPlan, renderLoading, close };
  if (scope.dataset.searchState === 'loading') renderLoading();
}
export function openSearchView(scope) { // Mobile full-screen search view (Search Flow › Mobile)
  if (!scope) return; let view = document.querySelector('.aitr-search-view');
  if (!view) {
    view = document.createElement('div'); view.className = 'aitr-search-view'; view.setAttribute('role', 'dialog'); view.setAttribute('aria-modal', 'true'); view.setAttribute('aria-label', 'Search AI tools');
    view.innerHTML = `<div class="aitr-search-view__head"><h2 class="aitr-heading-l">Search</h2><wa-button variant="brand" appearance="plain" size="medium" data-cancel>Cancel</wa-button></div>
      <form class="aitr-combobox" role="search" data-search-scope="view"><wa-input class="aitr-field" type="search" placeholder="Search AI tools…" size="large" with-clear data-shortcut="false" role="combobox" aria-label="Search AI tools" aria-expanded="false" aria-controls="view-search-list" aria-autocomplete="list" autocomplete="off" enterkeyhint="search" autocapitalize="off" autocorrect="off"><wa-icon slot="start" library="lucide" name="search" aria-hidden="true"></wa-icon></wa-input>
      <ul id="view-search-list" role="listbox" class="aitr-search-listbox" aria-label="Matching tools" hidden></ul><p class="aitr-visually-hidden" aria-live="polite" data-search-status></p></form>`;
    document.body.append(view); initCombobox(view.querySelector('form'));
    const trigger = document.activeElement;
    const closeView = () => { view.removeAttribute('open'); document.body.classList.remove('aitr-scroll-lock'); trigger?.focus?.(); };
    view.querySelector('[data-cancel]').addEventListener('click', closeView);
    view.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeView(); });
  }
  view.setAttribute('open', ''); document.body.classList.add('aitr-scroll-lock'); customElements.whenDefined('wa-input').then(() => view.querySelector('wa-input').focus());
}

/* ---------- Section reveal (IntersectionObserver, once) ---------- */
function initReveal() {
  const targets = document.querySelectorAll('[data-reveal], [data-reveal-group]');
  if (motion.reduced() || !('IntersectionObserver' in window)) { targets.forEach((t) => t.classList.add('is-in')); return; }
  const io = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
  targets.forEach((t) => io.observe(t));
}

/* ---------- Count-up (Duration/Count Up 2 s · Easing Emphasized · once · final value in DOM) ---------- */
function initCountUp() {
  const els = document.querySelectorAll('[data-count-up]');
  if (!els.length) return;
  const duration = motion.reduced() ? 0 : tokens.ms('--aitr-duration-count-up') || 2000;
  const ease = (t) => 1 - Math.pow(1 - t, 3) * (1 - 0.3 * Math.sin(t * Math.PI)); // emphasized-ish, ends at 1
  const run = (el) => {
    const target = parseFloat(el.dataset.countUp); const suffix = el.dataset.countSuffix || (el.textContent.trim().replace(/[\d,.\s]/g, '') || '');
    if (!duration || Number.isNaN(target)) return;
    const start = performance.now(); el.setAttribute('aria-hidden', 'true'); const label = el.cloneNode(true); label.className = 'aitr-visually-hidden'; label.removeAttribute('data-count-up'); label.removeAttribute('aria-hidden'); el.after(label);
    const tick = (now) => { const p = Math.min(1, (now - start) / duration); el.textContent = Math.round(target * ease(p)).toLocaleString() + suffix; if (p < 1) requestAnimationFrame(tick); else { el.textContent = target.toLocaleString() + suffix; el.removeAttribute('aria-hidden'); label.remove(); } };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver((entries) => { if (entries.some((e) => e.isIntersecting)) { els.forEach(run); io.disconnect(); } }, { threshold: 0.3 }); // shared window
  els.forEach((el) => io.observe(el));
}

/* ---------- Score Meter: pips, status by score, fill on first view (40 ms stagger) ---------- */
export function hydrateScore(score) {
  const valueText = score.querySelector('.aitr-score__value')?.textContent.trim() || '';
  const notDisclosed = score.dataset.status === 'not-disclosed' || /not disclosed/i.test(valueText) || (!score.hasAttribute('aria-valuenow') && !score.style.getPropertyValue('--value'));
  const value = notDisclosed ? 0 : Number(score.getAttribute('aria-valuenow') ?? score.style.getPropertyValue('--value') ?? 0);
  const track = score.querySelector('.aitr-score__track'); if (!track) return;
  if (notDisclosed) { score.dataset.status = 'not-disclosed'; score.removeAttribute('aria-valuenow'); score.setAttribute('aria-valuetext', 'Not disclosed'); }
  if (!track.children.length) track.innerHTML = Array.from({ length: 10 }, (_, i) => `<span class="aitr-score__pip${i < value ? ' is-on' : ''}" style="--i:${i}"></span>`).join('');
  else [...track.children].forEach((p, i) => { p.style.setProperty('--i', i); p.classList.toggle('is-on', i < value); });
  score.style.setProperty('--value', value);
  if (score.getAttribute('aria-busy') !== 'true' && !notDisclosed) score.dataset.status = value <= 4 ? 'low' : value <= 7 ? 'medium' : 'good';
}
function initScores() {
  const scores = document.querySelectorAll('.aitr-score'); scores.forEach(hydrateScore);
  if (motion.reduced()) { scores.forEach((s) => s.classList.add('is-filled')); return; }
  const io = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { const delay = en.target.closest('[data-after-verdict]') ? 200 : 0; setTimeout(() => en.target.classList.add('is-filled'), delay); io.unobserve(en.target); } }), { threshold: 0.4 });
  scores.forEach((s) => io.observe(s));
}

/* ---------- Chip groups (aria-pressed toggles · radiogroup = single choice with arrow keys) ---------- */
function initChips() {
  document.querySelectorAll('[role="radiogroup"]').forEach((group) => {
    const chips = [...group.querySelectorAll('wa-button.aitr-chip')];
    const select = (chip) => chips.forEach((c) => { const on = c === chip; c.setAttribute('aria-pressed', String(on)); c.setAttribute('aria-checked', String(on)); c.tabIndex = on ? 0 : -1; });
    chips.forEach((c, i) => { c.setAttribute('role', 'radio'); c.addEventListener('click', () => { select(c); group.dispatchEvent(new CustomEvent('aitr-change', { detail: c.dataset.value ?? c.textContent.trim() })); });
      c.addEventListener('keydown', (e) => { const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]; if (!d) return; e.preventDefault(); const n = chips[(i + d + chips.length) % chips.length]; select(n); n.focus(); group.dispatchEvent(new CustomEvent('aitr-change', { detail: n.dataset.value ?? n.textContent.trim() })); }); });
  });
  document.querySelectorAll('wa-button.aitr-chip[data-toggle]').forEach((chip) => chip.addEventListener('click', () => chip.setAttribute('aria-pressed', String(chip.getAttribute('aria-pressed') !== 'true'))));
}

/* ---------- Tables: tier selection, scroll shadow + hint ---------- */
function initTables() {
  document.querySelectorAll('.aitr-table-scroll').forEach((sc) => {
    const update = () => { sc.classList.toggle('is-scrolled', sc.scrollLeft > 4); sc.classList.toggle('is-end', sc.scrollLeft + sc.clientWidth >= sc.scrollWidth - 4); };
    sc.addEventListener('scroll', update, { passive: true }); update(); if (!sc.hasAttribute('tabindex')) sc.tabIndex = 0;
  });
  document.querySelectorAll('.aitr-table[data-tier-select]').forEach((table) => {
    const headers = [...table.querySelectorAll('thead th[scope="col"]')];
    const live = document.getElementById(table.dataset.tierSelect);
    const select = (idx) => {
      headers.forEach((th, i) => { const on = i === idx; th.toggleAttribute('aria-selected', on); th.setAttribute('aria-selected', String(on)); th.querySelector('wa-button')?.setAttribute('aria-pressed', String(on)); });
      table.querySelectorAll('tbody tr').forEach((tr) => [...tr.children].slice(1).forEach((td, i) => td.classList.toggle('is-highlighted', i === idx)));
      const tier = headers[idx]?.textContent.trim(); table.dispatchEvent(new CustomEvent('aitr-tier', { detail: { index: idx, tier } }));
      if (live) live.textContent = `Showing details for the ${tier} tier`;
      try { const u = new URL(location); u.searchParams.set('tier', tier); history.replaceState(null, '', u); } catch {}
    };
    headers.forEach((th, i) => th.querySelector('wa-button')?.addEventListener('click', () => select(i)));
    table.tierSelect = select;
  });
}

/* ---------- Citations: scroll to evidence + 1.5 s highlight (mobile: sheet is page-specific) ---------- */
function initCitations() {
  document.querySelectorAll('a.aitr-citation[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href')); if (!target) return; e.preventDefault();
    document.querySelectorAll('.aitr-citation.is-active').forEach((c) => c.classList.remove('is-active')); a.classList.add('is-active');
    target.scrollIntoView({ behavior: motion.reduced() ? 'auto' : 'smooth', block: 'center' });
    target.classList.add('aitr-evidence'); target.classList.remove('is-highlighted'); void target.offsetWidth; target.classList.add('is-highlighted');
    target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true });
  }));
}

/* ---------- Keyboard: ⌘K / Ctrl K / "/" focus the first search field ---------- */
function initShortcuts() {
  document.addEventListener('keydown', (e) => {
    const typing = /^(INPUT|TEXTAREA|WA-INPUT|WA-TEXTAREA|WA-SELECT)$/.test(document.activeElement?.tagName || '') || document.activeElement?.isContentEditable;
    if (((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') || (e.key === '/' && !typing)) {
      const field = document.querySelector('main wa-input[role="combobox"]') || document.querySelector('.aitr-nav wa-input[role="combobox"]');
      if (!field) return; e.preventDefault(); if (motion.mobile() && !field.closest('.aitr-nav__sheet')) openSearchView(field.closest('[data-search-scope]')); else field.focus();
    }
  });
}

/* ---------- State helper: ?state=… → data-state on <body> (pages branch on it) ---------- */
export const params = new URLSearchParams(location.search);
export const state = params.get('state') || '';
document.body.dataset.state = state;

/* ---------- Page Controls: Back to Top (2524:133) · Motion Toggle (2524:102) ---------- */
function initBackToTop() {
  if (document.body.dataset.backToTop === 'false' || document.querySelector('.aitr-back-to-top')) return;
  if (document.documentElement.scrollHeight < window.innerHeight * 1.5) return; // short pages (Contribute, confirmations) have none
  const a = document.createElement('a'); a.className = 'aitr-back-to-top'; a.href = '#top'; a.setAttribute('aria-label', 'Back to top');
  a.innerHTML = '<wa-icon library="lucide" name="arrow-up" aria-hidden="true"></wa-icon><span>Back to top</span>';
  document.body.append(a);
  const update = () => a.classList.toggle('is-visible', window.scrollY > window.innerHeight && window.scrollY > 200);
  window.addEventListener('scroll', update, { passive: true }); update();
  a.addEventListener('click', (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: motion.reduced() ? 'auto' : 'smooth' }); const target = document.querySelector('.aitr-skip') || document.querySelector('h1'); if (target) { target.setAttribute('tabindex', target.matches('a') ? '0' : '-1'); target.focus({ preventScroll: true }); } });
}
export function hydrateMotionToggle(btn) {
  if (btn.dataset.hydrated) return; btn.dataset.hydrated = '1';
  const paused = btn.getAttribute('aria-pressed') === 'true';
  btn.classList.add('aitr-motion-toggle'); btn.setAttribute('aria-label', paused ? 'Play animation' : 'Pause animation');
  btn.innerHTML = `<svg class="aitr-motion-toggle__ring" viewBox="0 0 56 56" aria-hidden="true"><circle class="aitr-motion-toggle__track" cx="28" cy="28" r="26.5"/><circle class="aitr-motion-toggle__arc" cx="28" cy="28" r="26.5"/></svg><span class="aitr-motion-toggle__button"><wa-icon library="lucide" name="${paused ? 'play' : 'pause'}" aria-hidden="true"></wa-icon></span><span class="aitr-motion-toggle__tip" aria-hidden="true">${paused ? 'Play animation' : 'Pause animation'}</span>`;
  btn.addEventListener('click', () => {
    const now = btn.getAttribute('aria-pressed') !== 'true';
    btn.setAttribute('aria-pressed', String(now)); btn.setAttribute('aria-label', now ? 'Play animation' : 'Pause animation');
    btn.querySelector('wa-icon').setAttribute('name', now ? 'play' : 'pause'); btn.querySelector('.aitr-motion-toggle__tip').textContent = now ? 'Play animation' : 'Pause animation';
    btn.dispatchEvent(new CustomEvent('aitr-motion', { bubbles: true, detail: { paused: now } }));
  });
}

/* ---------- Boot ---------- */
document.querySelectorAll('.aitr-aurora').forEach(renderAurora);
document.querySelectorAll('header.aitr-nav').forEach(renderNav);
document.querySelectorAll('footer.aitr-footer').forEach(renderFooter);
document.querySelectorAll('[data-search-scope]').forEach(initCombobox);
initReveal(); initCountUp(); initScores(); initChips(); initTables(); initCitations(); initShortcuts();
document.querySelectorAll('[data-motion-toggle]').forEach(hydrateMotionToggle);
requestAnimationFrame(initBackToTop);
document.dispatchEvent(new CustomEvent('aitr-ready'));

/* ---------- Factor Rating (component 2678:499): returns the card markup for { kind: 'score'|'training'|'location', name, level, note } ---------- */
const FR_ICONS = { score: 'shield-check', training: 'database', location: 'map-pin' };
export function factorRating({ kind = 'score', name, level, note = '', icon, showNote = true, country = 'US' }) {
  let segs = 10, on = 0, tone = 'success', value = '';
  if (kind === 'score') { segs = 10; if (level === null || level === 'not-disclosed') { tone = 'none'; value = 'Not disclosed'; } else { on = Number(level); tone = on <= 4 ? 'danger' : on <= 7 ? 'warning' : 'success'; value = `${on} out of 10`; } }
  else if (kind === 'training') { segs = 4; const m = { never: [4, 'success', 'Never trains on your data'], 'opt-in': [3, 'warning', 'Only if you opt in'], 'opt-out': [2, 'danger', 'Trains unless you opt out'], always: [1, 'danger', 'Always trains'] }[level]; if (!m) { tone = 'none'; value = 'Not disclosed'; } else { [on, tone, value] = m; } }
  else { segs = 2; const m = { safe: [2, 'success', `Safe · ${country}`], concern: [1, 'danger', 'Concern'] }[level]; if (!m) { tone = 'none'; value = 'Not disclosed'; } else { [on, tone, value] = m; } }
  const e = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  return `<div class="aitr-factor-rating" data-kind="${kind}" data-tone="${tone}"><div class="aitr-factor-rating__head"><wa-icon library="lucide" name="${icon || FR_ICONS[kind]}" aria-hidden="true"></wa-icon><span>${e(name)}</span></div><div class="aitr-factor-rating__value">${e(value)}</div><div class="aitr-factor-rating__meter" role="img" aria-label="${e(name)}: ${e(value)}">${Array.from({ length: segs }, (_, i) => `<i${i < on ? ' class="is-on"' : ''}></i>`).join('')}</div>${showNote ? `<p class="aitr-factor-rating__note">${e(note)}</p>` : ''}</div>`;
}
