/* 15 · Contribute — page behaviour
   · choice chips: single-select + arrow keys are handled by site.js (radiogroup → `aitr-change`); we mirror the value
   · validation on blur + submit (required, URL/email format), aria-invalid / aria-describedby
   · ≥ 2 errors → Danger wa-callout summary (role=alert) with links to the fields, focus → summary
     otherwise focus → first invalid field; on submit the first invalid field scrolls into view (block: center)
   · submitting = wa-button `loading`; success = form cross-fades (Transition/Normal) into the Confirmation,
     focus → heading (tabindex=-1); "Submit another" restores the empty form
   · ?state=error renders the design's error state exactly; ?state=success the confirmation */

const form = document.getElementById('contribute-form');
if (form) init();

function init() {
  const summary = document.getElementById('contribute-summary');
  const summaryCallout = document.getElementById('contribute-summary-callout');
  const summaryTitle = document.getElementById('contribute-summary-title');
  const summaryBody = document.getElementById('contribute-summary-body');
  const submitButton = document.getElementById('contribute-submit');
  const confirmation = document.getElementById('contribute-confirmation');
  const confirmationHeading = document.getElementById('contribute-confirmation-heading');
  const againButton = document.getElementById('contribute-again');
  const kindGroup = document.getElementById('contribute-kind-group');
  const kindInput = document.getElementById('contribute-kind');
  const chips = Array.from(kindGroup.querySelectorAll('wa-button.aitr-chip'));
  const kindSelect = document.getElementById('contribute-kind-select'); // Mobile dropdown (3 Oct frames)

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = window.matchMedia('(max-width: 767px)');

  /* ---------- field model (error copy verbatim from the Error frame 2478:9636) ---------- */
  const fields = [
    {
      key: 'toolName', label: 'Tool Name',
      validate: (v) => (v.trim() ? '' : 'Enter the tool’s name, e.g. ChatGPT.'),
    },
    {
      key: 'website', label: 'Website URL',
      validate: (v) => (!v.trim() || isHttpUrl(v.trim()) ? '' : 'Enter a full web address starting with https://, e.g. https://example.com.'),
    },
    {
      key: 'email', label: 'Email',
      validate: (v) => (!v.trim() || isEmail(v.trim()) ? '' : 'Enter a valid email address, e.g. you@company.com.'),
    },
    {
      key: 'details', label: 'Details',
      validate: (v) => (v.trim() ? '' : 'Tell us what to add or change — at least one sentence.'),
    },
  ];
  for (const f of fields) {
    f.wrapper = form.querySelector(`.aitr-form-field[data-field="${f.key}"]`);
    f.control = f.wrapper.querySelector('wa-input, wa-textarea');
    f.error = f.wrapper.querySelector('.aitr-form-field__error');
    f.errorText = f.error.querySelector('.contribute-field-error__text');
  }

  /* ---------- choice chips: site.js owns selection; mirror into the hidden input ---------- */
  kindGroup.addEventListener('aitr-change', (e) => { kindInput.value = e.detail; if (kindSelect) kindSelect.value = e.detail; });
  kindSelect?.addEventListener('change', () => { const i = chips.findIndex((c) => c.dataset.value === kindSelect.value); if (i >= 0) selectChip(i); });
  function selectChip(index) {
    chips.forEach((chip, i) => {
      const on = i === index;
      chip.setAttribute('aria-pressed', String(on));
      chip.setAttribute('aria-checked', String(on));
      chip.tabIndex = on ? 0 : -1;
    });
    kindInput.value = chips[index].dataset.value;
    if (kindSelect) kindSelect.value = kindInput.value;
  }

  /* ---------- validation ---------- */
  function setError(f, message) {
    f.wrapper.dataset.state = 'error';
    f.control.setAttribute('aria-invalid', 'true');
    f.control.setAttribute('aria-describedby', f.error.id);
    f.errorText.textContent = message;
    syncInnerAria(f, true);
  }
  function clearError(f) {
    f.wrapper.dataset.state = 'default';
    f.control.removeAttribute('aria-invalid');
    f.control.removeAttribute('aria-describedby');
    f.errorText.textContent = '';
    syncInnerAria(f, false);
  }
  /* Mirror aria state onto the native control inside the Web Awesome shadow root
     (IDREFs do not cross the shadow boundary; element reflection does, where supported). */
  function syncInnerAria(f, invalid) {
    const inner = f.control.shadowRoot?.querySelector('input, textarea');
    if (!inner) return;
    if (invalid) inner.setAttribute('aria-invalid', 'true');
    else inner.removeAttribute('aria-invalid');
    if ('ariaDescribedByElements' in inner) {
      try { inner.ariaDescribedByElements = invalid ? [f.error] : null; } catch { /* unsupported */ }
    }
  }
  function validateField(f) {
    const message = f.validate(String(f.control.value ?? ''));
    if (message) setError(f, message);
    else clearError(f);
    return message;
  }
  function showSummary(invalid) {
    summaryTitle.textContent = `${invalid.length} fields need attention`;
    summaryBody.replaceChildren();
    invalid.forEach((f, i) => {
      if (i > 0) summaryBody.append(' · ');
      const a = document.createElement('a');
      a.href = `#${f.control.id}`;
      a.textContent = f.label;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        f.control.scrollIntoView({ block: 'center', behavior: reduceMotion.matches ? 'auto' : 'smooth' });
        f.control.focus({ preventScroll: true });
      });
      summaryBody.append(a);
    });
    summaryBody.append(' — fix them and submit again.');
    summary.hidden = false;
  }
  function hideSummary() {
    summary.hidden = true;
    summaryTitle.textContent = '';
    summaryBody.replaceChildren();
  }
  function refreshSummary() {
    if (summary.hidden) return;
    const invalid = fields.filter((f) => f.wrapper.dataset.state === 'error');
    if (invalid.length >= 2) showSummary(invalid);
    else hideSummary();
  }

  for (const f of fields) {
    // validate on blur (focusout bubbles out of the shadow root); re-validate live once a field has shown an error
    f.control.addEventListener('focusout', () => { validateField(f); refreshSummary(); });
    f.control.addEventListener('input', () => {
      if (f.wrapper.dataset.state === 'error') { validateField(f); refreshSummary(); }
    });
  }

  /* ---------- submit ---------- */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (submitButton.hasAttribute('loading')) return;

    const invalid = fields.filter((f) => validateField(f));
    if (invalid.length) {
      const first = invalid[0];
      first.control.scrollIntoView({ block: 'center', behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      if (invalid.length >= 2) {
        showSummary(invalid);
        summaryCallout.focus({ preventScroll: true });
      } else {
        hideSummary();
        first.control.focus({ preventScroll: true });
      }
      return;
    }

    hideSummary();
    submitButton.setAttribute('loading', '');
    // mockup: no backend — simulate the round trip, then swap to the Confirmation
    window.setTimeout(() => {
      submitButton.removeAttribute('loading');
      showConfirmation();
    }, 900);
  });

  /* ---------- form ⇄ confirmation cross-fade (Transition/Normal) ---------- */
  function normalMs() {
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--aitr-transition-normal').trim();
    const n = parseFloat(raw);
    if (Number.isNaN(n)) return 200;
    return raw.endsWith('ms') ? n : n * 1000;
  }
  function applyResponsiveActions() {
    confirmation.dataset.actions = mobile.matches ? 'stacked' : 'inline';
  }
  mobile.addEventListener('change', applyResponsiveActions);
  applyResponsiveActions();

  function showConfirmation({ instant = false } = {}) {
    const reveal = () => {
      form.hidden = true;
      form.classList.remove('is-leaving');
      confirmation.hidden = false; // .aitr-confirmation fades in on display (site.css)
      confirmationHeading.focus({ preventScroll: true });
    };
    if (instant) { reveal(); return; }
    form.classList.add('is-leaving');
    window.setTimeout(reveal, normalMs());
  }
  function resetForm() {
    form.reset();
    for (const f of fields) { f.control.value = ''; clearError(f); }
    hideSummary();
    submitButton.removeAttribute('loading');
    selectChip(0);
  }
  againButton.addEventListener('click', () => {
    resetForm();
    confirmation.classList.add('is-leaving');
    window.setTimeout(() => {
      confirmation.hidden = true;
      confirmation.classList.remove('is-leaving');
      form.classList.add('contribute-is-entering');
      form.hidden = false;
      chips[0].focus({ preventScroll: true });
      window.setTimeout(() => form.classList.remove('contribute-is-entering'), normalMs());
    }, normalMs());
  });

  /* ---------- URL states (?state=error | success) ---------- */
  const state = new URLSearchParams(window.location.search).get('state');
  if (state === 'error') {
    // Exactly the Error (form) frame: Tool Name + Details invalid, Danger summary, focus → summary
    const toolName = fields.find((f) => f.key === 'toolName');
    const details = fields.find((f) => f.key === 'details');
    setError(toolName, 'Enter the tool’s name, e.g. ChatGPT.');
    setError(details, 'Tell us what to add or change — at least one sentence.');
    showSummary([toolName, details]);
    whenReady().then(() => {
      syncInnerAria(toolName, true);
      syncInnerAria(details, true);
      summaryCallout.focus({ preventScroll: true });
    });
  } else if (state === 'success') {
    showConfirmation({ instant: true });
  }

  function whenReady() {
    return Promise.allSettled(
      ['wa-input', 'wa-textarea', 'wa-button', 'wa-callout'].map((tag) => customElements.whenDefined(tag)),
    ).then(() => Promise.allSettled(fields.map((f) => f.control.updateComplete)));
  }
}

/* ---------- helpers ---------- */
function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return (url.protocol === 'http:' || url.protocol === 'https:') && url.hostname.includes('.');
  } catch {
    return false;
  }
}
function isEmail(value) {
  // pragmatic check: one @, non-empty local part, dotted domain, no whitespace
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
