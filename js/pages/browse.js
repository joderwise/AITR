/* 12 · Browse Tools — page behaviour.
   ?state=no-results | loading | search-loading forces a feedback state on load.
   Cards are rendered from the 84-tool mock registry (js/data/tools.js): 24 at a time, Load more adds the next 24.
   Filters: search (250 ms debounce, matches name / vendor / type / plan), type + rating selects (AND), live count
   ("Showing n of N"), Clear filters, URL mirroring via replaceState. */

import { TOOLS_DB, TYPE_LABELS } from '../data/tools.js';
import { toolIcon } from '../site.js';

const TOTAL = TOOLS_DB.length;   // 84
const PAGE = 24;                 // cards per page (Load more adds another 24)
let limit = PAGE;

const $ = (id) => document.getElementById(id);
const grid = $('browse-grid');
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const markHtml = (t) => toolIcon(t.icon, 36);
const cardHtml = (t) => `<article class="aitr-registry-card" data-name="${esc(t.name)}" data-vendor="${esc(t.vendor)}" data-category="${t.type}" data-verdict="${t.verdict}" data-slug="${t.slug}">
        <div class="aitr-registry-card__top">${markHtml(t)}
          <div>
            <a class="aitr-registry-card__name" href="tool.html?tool=${t.slug}" title="${esc(t.name)}">${esc(t.name)}</a>${t.agentic ? ' <wa-icon class="browse-card__agentic" library="lucide" name="zap" label="Agentic capabilities"></wa-icon>' : ''}
            <div class="aitr-registry-card__meta" title="${esc(t.vendor)} · ${esc(t.typeLabel)}">${esc(t.vendor)} · ${esc(t.typeLabel)}</div>
          </div>
          <wa-icon class="browse-card__open" library="lucide" name="chevron-right" aria-hidden="true"></wa-icon>
        </div>
        <div class="aitr-registry-card__footer">
          <wa-tag class="aitr-verdict-tag" data-verdict="${t.verdict}" size="small" pill>${t.verdictLabel}</wa-tag>
          <span class="aitr-registry-card__checked">${esc(t.plan)}</span>
        </div>
      </article>`;
const search = $('browse-q');
const searchWrap = search.closest('.browse-search');
const listbox = $('search-list');
const searchStatus = $('browse-search-status');
const typeSelect = $('browse-type');
const ratingSelect = $('browse-rating');
const count = $('browse-count');
const clearLink = $('browse-clear');
const empty = $('browse-empty');
const emptyBody = $('browse-empty-body');
const emptyClear = $('browse-empty-clear');
const loadMore = $('browse-load-more');
const loadMoreBtn = $('browse-load-more-btn');
const loadMoreCaption = $('browse-load-more-caption');

const params = new URLSearchParams(location.search);
const forcedState = params.get('state');
let interacted = false;

// Works before and after Web Awesome upgrades the elements (attribute fallback).
const valueOf = (el) => {
  const v = el.value !== undefined && el.value !== null ? el.value : el.getAttribute('value');
  return Array.isArray(v) ? (v[0] || '') : (v || '');
};
const setValue = (el, v) => {
  el.setAttribute('value', v);
  if ('value' in el) el.value = v;
};

function filters() {
  const q = (search.value || '').trim();
  const type = valueOf(typeSelect);
  const rating = valueOf(ratingSelect);
  return {
    q,
    type: type === 'all' ? '' : type,
    rating: rating === 'all' ? '' : rating,
  };
}

function matches(t, f) {
  if (f.type && t.type !== f.type) return false;
  if (f.rating && t.verdict !== f.rating) return false;
  if (f.q) {
    const hay = `${t.name} ${t.vendor} ${t.typeLabel} ${t.plan}`.toLowerCase();
    if (!hay.includes(f.q.toLowerCase())) return false;
  }
  return true;
}

function setCount(shown, total) {
  count.innerHTML = `Showing <strong>${shown}</strong> of ${total} tools`;
}

function emptyCopy(f) {
  const where = f.type ? ` in ${TYPE_LABELS[f.type]}` : '';
  const what = f.q ? `“${f.q}”` : 'these filters';
  return `Nothing${where} matches ${what}. Try a different search, or clear the type and rating filters.`;
}

function mirrorUrl(f) {
  const url = new URL(location.href);
  const p = url.searchParams;
  ['q', 'type', 'rating'].forEach((k) => (f[k] ? p.set(k, f[k]) : p.delete(k)));
  if (interacted) p.delete('state');
  history.replaceState(null, '', url);
}

function applyFilters({ animate = true, resetLimit = true } = {}) {
  const f = filters();
  const anyFilter = Boolean(f.q || f.type || f.rating);
  const prev = resetLimit ? 0 : grid.children.length;
  if (resetLimit) limit = PAGE;
  const all = TOOLS_DB.filter((t) => matches(t, f));
  const list = all.slice(0, limit);
  grid.innerHTML = list.map(cardHtml).join('');
  [...grid.children].forEach((card, i) => {
    card.style.setProperty('--i', Math.max(0, i - prev));
    if (animate && i >= prev) card.classList.add('is-entering');
  });

  grid.removeAttribute('aria-busy');
  setCount(list.length, all.length);
  clearLink.hidden = !anyFilter;

  const none = all.length === 0;
  grid.hidden = none;
  empty.hidden = !none;
  const remaining = all.length - list.length;
  loadMore.hidden = none || remaining <= 0;
  loadMoreBtn.removeAttribute('disabled');
  loadMoreCaption.textContent = `${remaining} more tool${remaining === 1 ? '' : 's'}`;
  if (none) emptyBody.textContent = emptyCopy(f);

  mirrorUrl(f);
}

function clearFilters() {
  interacted = true;
  setValue(search, '');
  setValue(typeSelect, 'all');
  setValue(ratingSelect, 'all');
  applyFilters();
  search.focus();
}

/* ---------- Feedback states ---------- */
function skeletonCard() {
  const el = document.createElement('article');
  el.className = 'aitr-registry-card';
  el.setAttribute('aria-busy', 'true');
  el.innerHTML =
    '<span class="aitr-bone" style="inline-size: 140px"></span>' +
    '<span class="aitr-bone" style="inline-size: 190px"></span>' +
    '<span class="aitr-bone" style="inline-size: 125px; block-size: 28px"></span>';
  return el;
}

function showLoading() {
  grid.setAttribute('aria-busy', 'true');
  grid.hidden = false;
  empty.hidden = true;
  loadMore.hidden = true;
  clearLink.hidden = true;
  grid.replaceChildren();
  const frag = document.createDocumentFragment();
  for (let i = 0; i < 6; i += 1) frag.appendChild(skeletonCard());
  grid.prepend(frag); // skeletons first so the mobile :nth-child(n+4) rule counts them
  count.textContent = 'Loading tools…';
}

function showSearchLoading() {
  // Results are "in flight": the query sits in the field, the grid stays as it was (Figma 2483:10510).
  setValue(search, 'micro');
  searchWrap.dataset.loading = 'true';
  search.setAttribute('aria-expanded', 'true');
  listbox.hidden = false;
  searchStatus.textContent = 'Searching…';
  search.focus();
}

function hideSearchLoading() {
  delete searchWrap.dataset.loading;
  search.setAttribute('aria-expanded', 'false');
  listbox.hidden = true;
  searchStatus.textContent = '';
}

/* ---------- Wiring ---------- */
let debounce;
search.addEventListener('input', () => {
  interacted = true;
  if (searchWrap.dataset.loading) hideSearchLoading();
  clearTimeout(debounce);
  debounce = setTimeout(() => applyFilters(), 250);
});
search.addEventListener('wa-clear', () => {
  interacted = true;
  hideSearchLoading();
  clearTimeout(debounce);
  applyFilters();
});
search.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { hideSearchLoading(); }
});
[typeSelect, ratingSelect].forEach((sel) => {
  sel.addEventListener('change', () => { interacted = true; applyFilters(); });
});
clearLink.addEventListener('click', clearFilters);
emptyClear.addEventListener('click', clearFilters);

loadMoreBtn.addEventListener('click', () => {
  limit += PAGE;
  const keepFocus = grid.children.length; // first new card receives focus so keyboard users land in the new results
  applyFilters({ resetLimit: false });
  const first = grid.children[keepFocus]?.querySelector('a');
  if (first) first.focus({ preventScroll: false });
});

// ⌘K / Ctrl K / "/" focus the page search (Query Field spec)
document.addEventListener('keydown', (e) => {
  const tag = (e.target.tagName || '').toLowerCase();
  const typing = ['input', 'textarea', 'wa-input', 'wa-textarea', 'wa-select'].includes(tag) || e.target.isContentEditable;
  if (((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') || (!typing && e.key === '/')) {
    e.preventDefault();
    search.focus();
  }
});

/* ---------- Init ---------- */
function init() {
  if (forcedState === 'loading') { showLoading(); return; }

  if (forcedState === 'no-results') {
    setValue(search, 'notion');
    setValue(typeSelect, 'writing');
    setValue(ratingSelect, 'all');
  } else {
    if (params.get('q')) setValue(search, params.get('q'));
    if (params.get('type') && TYPE_LABELS[params.get('type')]) setValue(typeSelect, params.get('type'));
    if (params.get('rating')) setValue(ratingSelect, params.get('rating'));
  }

  applyFilters({ animate: false });

  if (forcedState === 'search-loading') showSearchLoading();
}

init();
// Once Web Awesome upgrades the selects, re-sync (the upgraded element re-reads its value attribute).
Promise.allSettled([customElements.whenDefined('wa-select'), customElements.whenDefined('wa-input')]).then(() => {
  requestAnimationFrame(() => {
    if (forcedState === 'loading') return;
    if (forcedState === 'search-loading') { setValue(search, 'micro'); search.focus(); return; }
    applyFilters({ animate: false });
  });
});
