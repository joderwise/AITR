/* Tool detail page — "Rating for this tier" select → Verdict Card + four Factor Ratings (cross-fade, ?tier=), "See all tiers"
   modal (native dialog · bottom sheet on mobile), Unlock Teaser → lead gate, locked overlay + lead gate (panel · mobile bottom
   sheet), work-email validation, tier-error / tier-loading / unlock-error / tiers-open states, "Show source" ↔ citation linking.
   Shared behaviour (nav, aurora, footer, score pips, citations, reveal, factorRating) is in js/site.js. */
import { hydrateScore, factorRating, motion, state, toolIcon } from '../site.js';
import { toolBySlug, relatedTo, VERDICT_LABELS } from '../data/tools.js';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const body = document.body;
const ms = (name, fallback) => { const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)); return Number.isFinite(v) ? v : fallback; };

/* ───────── tier data (values read from the Figma "See all tiers open" table, 5 Oct) ───────── */
const VERDICTS = {
  'business-ready':   { name: 'Business Ready',   body: 'Approved for confidential data — business-grade controls verified.', trace: 'SAFE FOR PUBLIC, INTERNAL AND CONFIDENTIAL DATA', why: 'No blocking gaps — this tier meets our checks for handling confidential data.' },
  'internal-work-only': { name: 'Internal Work Only', body: 'Safe for internal business data — avoid confidential or client data.', trace: 'SAFE FOR PUBLIC AND INTERNAL DATA', why: 'Good controls, but not enough evidence yet for confidential or client data.' },
  'public-data-only': { name: 'Public Data Only', body: 'Only safe for information that’s already public.', trace: 'SAFE FOR PUBLIC DATA ONLY', why: 'Trains on your data by default — not cleared for internal or confidential data.' },
  'unsafe': { name: 'Unsafe', body: 'Not recommended for company data.', trace: 'NOT CLEARED FOR COMPANY DATA', why: 'Blocking gaps found — this tier is not cleared for company data.' }
};
const NOTES = { security: 'Encryption, testing and certifications', transparency: 'How clearly practices are documented', training: 'Does it train its AI on what you type?', location: 'No jurisdiction concerns' };
const TRAINING_TEXT = { never: 'No training on your data', 'opt-in': 'Trains on your data only if you opt in', 'opt-out': 'Trains on your data by default (opt-out available)', always: 'Always trains on your data' };
let TIERS = [
  { label: 'Free',       verdict: 'public-data-only', security: 5, transparency: 8, training: 'opt-out', location: 'safe', notes: NOTES },
  { label: 'Go',         verdict: 'public-data-only', security: 5, transparency: 8, training: 'opt-out', location: 'safe', notes: NOTES },
  { label: 'Plus',       verdict: 'public-data-only', security: 5, transparency: 8, training: 'opt-out', location: 'safe', notes: NOTES },
  { label: 'Pro',        verdict: 'public-data-only', security: 5, transparency: 9, training: 'opt-out', location: 'safe', notes: NOTES },
  { label: 'Business',   verdict: 'business-ready',   security: 9, transparency: 8, training: 'never',   location: 'safe', notes: NOTES },
  { label: 'Enterprise', verdict: 'business-ready',   security: 7, transparency: 8, training: 'never',   location: 'safe', notes: NOTES }
];
const FACTORS = [
  { key: 'security',     kind: 'score',    name: 'Security',        icon: 'shield-check' },
  { key: 'transparency', kind: 'score',    name: 'Transparency',    icon: 'eye' },
  { key: 'training',     kind: 'training', name: 'Data training',   icon: 'database' },
  { key: 'location',     kind: 'location', name: 'Company location', icon: 'map-pin' }
];
/* Meter spec shared with the modal's mini meters (same tones and level rules as the Factor Rating component) */
function meterSpec(kind, level) {
  if (kind === 'score') { if (level === null || level === undefined) return { segs: 10, on: 0, tone: 'none', value: 'Not disclosed' }; const on = Number(level); return { segs: 10, on, tone: on <= 4 ? 'danger' : on <= 7 ? 'warning' : 'success', value: `${on} out of 10` }; }
  if (kind === 'training') { const m = { never: [4, 'success', 'Never trains on your data'], 'opt-in': [3, 'warning', 'Only if you opt in'], 'opt-out': [2, 'danger', 'Trains unless you opt out'], always: [1, 'danger', 'Always trains'] }[level]; return m ? { segs: 4, on: m[0], tone: m[1], value: m[2] } : { segs: 4, on: 0, tone: 'none', value: 'Not disclosed' }; }
  const m = { safe: [2, 'success', `Safe · ${COUNTRY}`], concern: [1, 'danger', 'Concern'] }[level]; return m ? { segs: 2, on: m[0], tone: m[1], value: m[2] } : { segs: 2, on: 0, tone: 'none', value: 'Not disclosed' };
}
let COUNTRY = 'US';
let current = TIERS.length - 1;
const SLUG = new URLSearchParams(location.search).get('tool') || '';
const TOOL = SLUG && SLUG !== 'ai-tool' ? toolBySlug(SLUG) : null;
if (TOOL) hydrateTool(TOOL);

/* Tool detail for any of the 84 registry tools (?tool=<slug>): header, plan ladder, per-tier ratings and related tools come from js/data/tools.js.
   Without ?tool= (or with ai-tool) the page is the Figma example "AI Tool". The long-form assessment text below is the same sample for every tool. */
function hydrateTool(t) {
  document.title = `${t.name} · AI Trust Ratings`;
  document.querySelector('meta[name="description"]')?.setAttribute('content', `Safety rating for ${t.name} by pricing tier — data training, security, transparency and jurisdiction, assessed with the ROAI Governance Framework.`);
  $('.tool-header__title').textContent = t.name;
  $('.aitr-tool-header__vendor').textContent = `${t.vendor} · ${t.typeLabel}`;
  $('.tool-header__description').textContent = t.description;
  const trace = $('.aitr-trace', $('.aitr-tool-header__name')); if (trace) trace.hidden = !t.agentic;
  const logo = $('.aitr-tool-header__logo');
  logo.innerHTML = toolIcon(t.icon, 80);
  COUNTRY = t.tiers[0].country || 'US';
  TIERS = t.tiers;
  $('#tier-select').innerHTML = TIERS.map((x, i) => `<wa-option value="${i}">${x.label}</wa-option>`).join('');
  $('#tier-select').setAttribute('value', String(TIERS.length - 1));
  const sub = $('#tiers-sub'); if (sub) sub.textContent = `${t.name} · the same four checks for every plan`;
  const cards = relatedTo(t, 4);
  const esc = (v) => String(v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const html = cards.map((r) => `<article class="aitr-registry-card"><div class="aitr-registry-card__top">${toolIcon(r.icon, 36)}<div><a class="aitr-registry-card__name" href="tool.html?tool=${r.slug}" title="${esc(r.name)}">${esc(r.name)}</a>${r.agentic ? ' <wa-icon library="lucide" name="bolt" label="Agentic capabilities" class="tool-related__agentic"></wa-icon>' : ''}<div class="aitr-registry-card__meta" title="${esc(r.vendor)} · ${esc(r.typeLabel)}">${esc(r.vendor)} · ${esc(r.typeLabel)}</div></div><wa-icon library="lucide" name="chevron-right" class="tool-related__open" aria-hidden="true"></wa-icon></div><div class="aitr-registry-card__footer"><wa-tag class="aitr-verdict-tag" data-verdict="${r.verdict}" size="small" pill>${r.verdictLabel}</wa-tag><span class="aitr-registry-card__checked">${esc(r.plan)}</span></div></article>`).join('');
  const relGrid = $('.tool-related .aitr-grid');
  if (relGrid) relGrid.innerHTML = html;
}
let loading = false;

const select = $('#tier-select');
const seeAll = $('#see-all-tiers');
const card = $('#rating-summary');
const verdictCard = $('#verdict-card');
const grid = $('#factor-grid');
const status = $('#rating-status');

function renderFactors(tier) {
  grid.innerHTML = FACTORS.map((f) => factorRating({ kind: f.kind, name: f.name, level: tier[f.key], note: tier.notes[f.key], icon: f.icon, country: COUNTRY })).join('');
}
function renderVerdict(tier) {
  const verdict = VERDICTS[tier.verdict];
  verdictCard.dataset.verdict = tier.verdict;
  $('.aitr-verdict-card__eyebrow', verdictCard).textContent = `DATA CLEARANCE · ${tier.label.toUpperCase()} TIER`;
  $('.aitr-verdict-card__title', verdictCard).textContent = verdict.name;
  $('.aitr-verdict-card__body', verdictCard).textContent = verdict.body;
  $('.aitr-verdict-card__trace', verdictCard).textContent = verdict.trace;
}

function applyTier(idx, { animate = true, fromUser = false } = {}) {
  const tier = TIERS[idx]; if (!tier) return;
  const changed = idx !== current; current = idx;
  const verdict = VERDICTS[tier.verdict];
  if (select && select.value !== String(idx)) select.value = String(idx);
  $$('[data-field="tier-name"]').forEach((el) => (el.textContent = tier.label));
  $$('[data-field="training"]').forEach((el) => (el.textContent = TRAINING_TEXT[tier.training]));
  $$('[data-field="verdict-name"]').forEach((el) => (el.textContent = verdict.name));
  $('#why-body').textContent = verdict.why;
  if (fromUser) { const u = new URL(location.href); u.searchParams.set('tier', tier.label); history.replaceState(null, '', u); }
  $$('#tiers-list .tool-tier-row').forEach((b, i) => { if (i === idx) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
  if (loading) return; // the Loading state keeps its skeletons; the data renders once loading ends
  const paint = () => { renderVerdict(tier); renderFactors(tier); status.textContent = `${tier.label} tier: ${verdict.name}`; };
  if (changed && animate && !motion.reduced()) { // cross-fade (Motion › content swap, Duration/Normal)
    card.classList.add('is-swapping');
    setTimeout(() => { paint(); card.classList.remove('is-swapping'); }, ms('--aitr-transition-normal', 200));
  } else paint();
}
select.addEventListener('change', () => { const i = Number(select.value); if (Number.isInteger(i) && i !== current) applyTier(i, { fromUser: true }); });

/* ───────── tier-error / tier-loading ───────── */
const errorBox = $('#compare-error');
const retry = $('#compare-retry');
const stash = [];
const bone = () => Object.assign(document.createElement('span'), { className: 'aitr-bone' });

function setLoading(on) {
  loading = on;
  card.setAttribute('aria-busy', String(on));
  seeAll.disabled = on;
  if (on) {
    body.dataset.state = body.dataset.state || 'tier-loading';
    verdictCard.setAttribute('aria-busy', 'true');
    stash.push([verdictCard, [...verdictCard.childNodes]]);
    verdictCard.replaceChildren(Object.assign(document.createElement('div'), { className: 'tool-rating__bones', innerHTML: '<span class="aitr-bone"></span><span class="aitr-bone"></span><span class="aitr-bone"></span><span class="aitr-bone"></span><span class="aitr-bone"></span><span class="aitr-bone"></span>' }));
    renderFactors(TIERS[current]);
    $$('.aitr-factor-rating', grid).forEach((f) => {
      f.setAttribute('aria-busy', 'true'); f.dataset.tone = 'none';
      $('.aitr-factor-rating__value', f).replaceChildren(bone());
      $('.aitr-factor-rating__note', f).replaceChildren(bone());
      $$('.aitr-factor-rating__meter > i', f).forEach((i) => i.classList.remove('is-on'));
      $('.aitr-factor-rating__meter', f).removeAttribute('role'); $('.aitr-factor-rating__meter', f).removeAttribute('aria-label');
    });
  } else {
    const [, nodes] = stash.pop() || [];
    if (nodes) verdictCard.replaceChildren(...nodes);
    verdictCard.removeAttribute('aria-busy');
    body.dataset.state = '';
    applyTier(current, { animate: false });
  }
}

function setError(on) {
  errorBox.hidden = !on;
  errorBox.dataset.layout = motion.mobile() ? 'stacked' : 'row';
  if (on) { body.dataset.state = 'tier-error'; requestAnimationFrame(() => retry.focus()); }
  else { body.dataset.state = ''; requestAnimationFrame(() => select.focus()); }
}
retry.addEventListener('click', () => setError(false));
window.matchMedia('(max-width: 767px)').addEventListener('change', (e) => { if (!errorBox.hidden) errorBox.dataset.layout = e.matches ? 'stacked' : 'row'; });

/* ───────── "See all tiers" modal · Tier Comparison (2685:14735) ───────── */
const dlg = $('#tiers-dialog');
const list = $('#tiers-list');
const miniMeter = (f, tier) => {
  const s = meterSpec(f.kind, tier[f.key]);
  return { s, html: `<span class="tool-mini" data-kind="${f.kind}" data-tone="${s.tone}"><span class="tool-mini__head"><wa-icon library="lucide" name="${f.icon}" aria-hidden="true"></wa-icon><span>${f.name === 'Company location' ? 'Location' : f.name}</span></span><span class="tool-mini__meter" aria-hidden="true">${Array.from({ length: s.segs }, (_, i) => `<i${i < s.on ? ' class="is-on"' : ''}></i>`).join('')}</span></span>` };
};
list.innerHTML = TIERS.map((tier, i) => {
  const parts = FACTORS.map((f) => miniMeter(f, tier));
  const label = `${tier.label}: ${VERDICTS[tier.verdict].name}. ${FACTORS.map((f, k) => `${f.name === 'Company location' ? 'Location' : f.name} ${parts[k].s.value}`).join(', ')}. Select this tier.`;
  return `<li><button type="button" class="tool-tier-row" data-index="${i}" data-verdict="${tier.verdict}" aria-label="${label}"><span class="tool-tier-row__grid"><span class="tool-tier-row__tier"><span class="tool-tier-row__name">${tier.label}</span><span class="tool-tier-row__now">Showing now</span></span><span class="tool-tier-row__rating"><wa-tag class="aitr-verdict-tag" data-verdict="${tier.verdict}" size="small" pill>${VERDICTS[tier.verdict].name}</wa-tag></span>${parts.map((p) => p.html).join('')}</span></button></li>`;
}).join('');

let closing = false;
function openTiers({ animate = true } = {}) {
  if (dlg.open) return;
  if (!animate) { dlg.dataset.static = ''; dlg.addEventListener('keydown', () => dlg.removeAttribute('data-static'), { once: true }); } // static frame: no focus ring until the keyboard is used
  document.documentElement.classList.add('tool-modal-open'); // scroll lock (+ scrollbar gutter kept by CSS)
  dlg.classList.toggle('is-instant', !animate || motion.reduced());
  dlg.showModal();
  $('.tool-tier-row[aria-current="true"]', dlg)?.focus({ preventScroll: true });
  seeAll.setAttribute('aria-expanded', 'true');
}
function closeTiers({ restoreFocus = true } = {}) {
  if (!dlg.open || closing) return;
  const done = () => { closing = false; dlg.classList.remove('is-closing'); dlg.close(); };
  closing = true;
  if (motion.reduced() || dlg.classList.contains('is-instant')) return done();
  dlg.classList.add('is-closing');
  setTimeout(done, ms('--aitr-transition-fast', 100) + 100);
  void restoreFocus;
}
dlg.addEventListener('close', () => {
  document.documentElement.classList.remove('tool-modal-open');
  seeAll.removeAttribute('aria-expanded');
  if (state === 'tiers-open') { const u = new URL(location.href); u.searchParams.delete('state'); history.replaceState(null, '', u); }
  requestAnimationFrame(() => seeAll.focus()); // focus returns to the opener
});
dlg.addEventListener('cancel', (e) => { e.preventDefault(); closeTiers(); }); // Esc
$('#tiers-close').addEventListener('click', () => closeTiers());
dlg.addEventListener('click', (e) => { // scrim click (the dialog box itself is the click target outside its content)
  if (e.target !== dlg) return;
  const r = dlg.getBoundingClientRect();
  if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closeTiers();
});
list.addEventListener('click', (e) => { // choosing a row selects that tier and closes the modal
  const row = e.target.closest('.tool-tier-row'); if (!row) return;
  applyTier(Number(row.dataset.index), { fromUser: true });
  closeTiers();
});
/* Bottom sheet: swipe the grabber / header down to dismiss */
{
  let startY = null;
  const zone = $('.tool-tiers__grabber', dlg), head = $('.tool-tiers__header', dlg);
  [zone, head].forEach((el) => {
    el.addEventListener('pointerdown', (e) => { if (motion.mobile() && !e.target.closest('button')) startY = e.clientY; });
    el.addEventListener('pointermove', (e) => { if (startY !== null && e.clientY - startY > 60) { startY = null; closeTiers(); } });
    el.addEventListener('pointerup', () => (startY = null));
  });
}
seeAll.addEventListener('click', () => openTiers());

/* ───────── locked overlay + lead gate (panel · sheet) ───────── */
const lock = $('#assessment-lock');
const assessment = $('#assessment');
const notice = $('#unlock-notice');
const sheet = $('#gate-sheet');
const openSheetButton = $('#gate-open');
const teaser = $('#unlock-teaser');
const panelForm = $('#lead-gate');

function unlock({ animate = true } = {}) {
  const finish = () => {
    lock.classList.remove('is-unlocking'); lock.classList.add('is-unlocked');
    body.dataset.state = 'unlocked';
    assessment.removeAttribute('inert'); assessment.removeAttribute('aria-hidden');
    notice.hidden = false;
    teaser.hidden = true; // the Unlock Teaser is not drawn on 17 · unlocked
    if (animate) { notice.setAttribute('tabindex', '-1'); notice.focus({ preventScroll: true }); }
    $$('.aitr-score', assessment).forEach((s) => s.classList.add('is-filled'));
  };
  if (sheet.open) sheet.close();
  if (!animate || motion.reduced()) return finish();
  lock.classList.add('is-unlocking');
  setTimeout(finish, ms('--aitr-transition-slow', 300));
}

/* Personal mailbox providers are rejected — the gate needs a work email (Lead Gate State=Error, 2 Oct review) */
const PERSONAL_DOMAINS = new Set(['gmail.com', 'googlemail.com', 'outlook.com', 'hotmail.com', 'live.com', 'msn.com', 'yahoo.com', 'ymail.com', 'icloud.com', 'me.com', 'mac.com', 'aol.com', 'proton.me', 'protonmail.com', 'pm.me', 'gmx.com', 'gmx.de', 'mail.com', 'yandex.com', 'zoho.com', 'fastmail.com']);
const WORK_EMAIL_ERROR = 'Please use your work email. Personal addresses (Gmail, Outlook…) aren’t accepted.';
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
const RULES = {
  name:    { check: (v) => (v.trim().length > 1 ? '' : 'Enter your name.') },
  email:   { check: (v) => { const e = v.trim(); if (!isEmail(e)) return 'Enter a valid work email.'; return PERSONAL_DOMAINS.has(e.split('@')[1].toLowerCase()) ? WORK_EMAIL_ERROR : ''; } },
  company: { check: (v) => (v.trim().length > 1 ? '' : 'Enter your company.') }
};
function validate(input) {
  const rule = RULES[input.name]; if (!rule) return true;
  const message = rule.check(input.value ?? '');
  const ok = !message;
  const field = input.closest('.aitr-form-field');
  field.dataset.state = ok ? 'default' : 'error';
  input.setAttribute('aria-invalid', String(!ok));
  const error = $('.aitr-form-field__error', field);
  ($('.tool-field-error__text', error) || error).textContent = message || '';
  return ok;
}
$$('form[data-gate-form]').forEach((form) => {
  const inputs = $$('wa-input', form);
  inputs.forEach((i) => i.addEventListener('blur', () => { if (i.value) validate(i); }));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const invalid = inputs.filter((i) => !validate(i));
    const summary = $('[data-gate-summary]', form);
    if (invalid.length) {
      summary.hidden = invalid.length < 2;
      summary.textContent = invalid.length >= 2 ? `Please fix ${invalid.length} fields to continue.` : '';
      invalid[0].focus();
      return;
    }
    summary.hidden = true;
    const submit = $('wa-button[type="submit"]', form);
    submit.loading = true;
    setTimeout(() => { submit.loading = false; unlock(); }, 900);
  });
});

/* Mobile bottom sheet: showModal · Esc / scrim / swipe close · focus returns to the opener */
let sheetOpener = openSheetButton;
function openSheet(opener) {
  sheetOpener = opener || openSheetButton;
  sheet.showModal();
  $('wa-input', sheet)?.focus();
}
openSheetButton.addEventListener('click', () => openSheet(openSheetButton));
/* Unlock Teaser → Lead Gate (teaser "opens the Lead Gate") */
$('#teaser-unlock').addEventListener('click', (e) => {
  if (motion.mobile()) return openSheet(e.currentTarget);
  panelForm.scrollIntoView({ behavior: motion.reduced() ? 'auto' : 'smooth', block: 'center' });
  $('wa-input', panelForm)?.focus({ preventScroll: true });
});
sheet.addEventListener('click', (e) => { if (e.target === sheet) sheet.close(); });
sheet.addEventListener('close', () => { if (body.dataset.state !== 'unlocked') sheetOpener.focus(); });
let dragY = null;
sheet.addEventListener('pointerdown', (e) => { if (!e.target.closest('wa-input, wa-button, a')) dragY = e.clientY; });
sheet.addEventListener('pointermove', (e) => { if (dragY !== null && e.clientY - dragY > 80) { dragY = null; sheet.close(); } });
sheet.addEventListener('pointerup', () => (dragY = null));

/* ───────── "Show source" → citation (site.js handles citation → evidence) ───────── */
document.addEventListener('click', (e) => {
  const link = e.target.closest('a.aitr-fact__source[href^="#"]'); if (!link) return;
  const target = $(link.getAttribute('href')); if (!target) return;
  e.preventDefault();
  target.scrollIntoView({ behavior: motion.reduced() ? 'auto' : 'smooth', block: 'center' });
  target.classList.add('aitr-evidence'); target.classList.remove('is-highlighted'); void target.offsetWidth; target.classList.add('is-highlighted');
  target.focus({ preventScroll: true });
});

/* ───────── initial state ───────── */
/* Initial tier: ?tier= from the search plan step (Search Flow › "Picking one goes to Tool detail with ?tier= pre-selected"), else Enterprise */
{
  const wanted = (new URLSearchParams(location.search).get('tier') || '').trim().toLowerCase();
  const idx = TIERS.findIndex((t) => t.label.toLowerCase() === wanted);
  const start = idx >= 0 ? idx : TIERS.length - 1;
  current = -1; applyTier(start, { animate: false });
  if (idx >= 0) requestAnimationFrame(() => card.scrollIntoView({ block: 'center', behavior: motion.reduced() ? 'auto' : 'smooth' }));
}
if (state === 'unlocked') unlock({ animate: false });
else if (state === 'tier-error') setError(true);
else if (state === 'tier-loading') setLoading(true);
else if (state === 'tiers-open') customElements.whenDefined('wa-button').then(() => openTiers({ animate: false }));
else if (state === 'unlock-error') {
  /* Feedback · 16 Tool detail · Unlock error (work email): the Work Email field holds a personal address and shows the error */
  customElements.whenDefined('wa-input').then(() => {
    $$('form[data-gate-form] wa-input[name="email"]').forEach((input) => { input.value = 'jane@gmail.com'; validate(input); });
  });
}
