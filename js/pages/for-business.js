/* 14 · For Business — page behaviour.
   Owns: Get in touch form validation (blur + submit), submitting state, cross-fade into the
   Confirmation component, ?state=contact-success, the mobile plan picker and the tablet table scroll hint.
   Shared behaviour (nav, reveal, count-up, icon library) lives in js/site.js. */

const form = document.getElementById('contact-form');
const success = document.getElementById('contact-success');
const summary = document.getElementById('contact-errors');
const resetButton = document.getElementById('contact-reset');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PERSONAL_DOMAINS = new Set([
  'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.co.uk', 'hotmail.com', 'hotmail.co.uk', 'outlook.com',
  'live.com', 'msn.com', 'icloud.com', 'me.com', 'mac.com', 'aol.com', 'proton.me', 'protonmail.com', 'gmx.com', 'mail.com',
]);

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const tokenMs = (name) => parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)) || 0;

/* ---------- validation ---------- */
function fields() {
  return [...form.querySelectorAll('.aitr-form-field')];
}
function controlOf(field) {
  return field.querySelector('wa-input, wa-select, wa-textarea');
}
function valueOf(control) {
  const v = control.value;
  return Array.isArray(v) ? v.join('') : String(v ?? '').trim();
}

function messageFor(control) {
  const value = valueOf(control);
  if (control.hasAttribute('required') && !value) return control.dataset.errorRequired || 'This field is required.';
  if (value && control.getAttribute('type') === 'email') {
    if (!EMAIL_RE.test(value)) return control.dataset.errorFormat || 'Enter a valid email address.';
    const domain = value.split('@')[1].toLowerCase();
    if (PERSONAL_DOMAINS.has(domain)) return control.dataset.errorWork || 'Use your work email address.';
  }
  return '';
}

function setError(field, control, message) {
  const error = field.querySelector('.aitr-form-field__error');
  if (message) {
    field.dataset.state = 'error';
    control.setAttribute('aria-invalid', 'true');
    if (error) {
      error.textContent = message;
      error.hidden = false;
      control.setAttribute('aria-describedby', error.id);
    }
  } else {
    field.dataset.state = 'default';
    control.removeAttribute('aria-invalid');
    control.removeAttribute('aria-describedby');
    if (error) {
      error.textContent = '';
      error.hidden = true;
    }
  }
}

function validateField(field) {
  const control = controlOf(field);
  if (!control) return '';
  const message = messageFor(control);
  setError(field, control, message);
  return message;
}

function renderSummary(errors) {
  if (!summary) return;
  if (errors.length < 2) {
    summary.hidden = true;
    return;
  }
  const count = summary.querySelector('[data-error-count]');
  if (count) count.textContent = String(errors.length);
  const list = summary.querySelector('.business-form__summary-list');
  if (list) {
    list.replaceChildren(
      ...errors.map(({ control, message }) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${control.id}`;
        a.textContent = `${control.dataset.label || control.name}: ${message}`;
        a.addEventListener('click', (event) => {
          event.preventDefault();
          control.focus();
        });
        li.append(a);
        return li;
      }),
    );
  }
  summary.hidden = false;
}

function validateAll() {
  const errors = [];
  for (const field of fields()) {
    const message = validateField(field);
    if (message) errors.push({ field, control: controlOf(field), message });
  }
  renderSummary(errors);
  return errors;
}

function clearErrors() {
  for (const field of fields()) {
    const control = controlOf(field);
    if (control) setError(field, control, '');
  }
  if (summary) summary.hidden = true;
}

/* ---------- form ⇄ confirmation cross-fade ---------- */
function setState(state) {
  const url = new URL(location.href);
  if (state) url.searchParams.set('state', state);
  else url.searchParams.delete('state');
  history.replaceState(history.state, '', url);
}

async function swap(outgoing, incoming) {
  const duration = tokenMs('--aitr-transition-normal');
  outgoing.classList.add('is-fading');
  if (duration) await wait(duration);
  outgoing.hidden = true;
  outgoing.classList.remove('is-fading');
  incoming.classList.add('is-fading');
  incoming.hidden = false;
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  incoming.classList.remove('is-fading');
  if (duration) await wait(duration);
}

async function showSuccess({ animate = true, focus = true } = {}) {
  if (animate) await swap(form, success);
  else {
    form.hidden = true;
    success.hidden = false;
  }
  setState('contact-success');
  if (focus) success.querySelector('.aitr-confirmation__heading')?.focus({ preventScroll: false });
}

async function showForm() {
  form.reset();
  for (const field of fields()) {
    const control = controlOf(field);
    if (control && 'value' in control) control.value = '';
  }
  clearErrors();
  await swap(success, form);
  setState(null);
  controlOf(fields()[0])?.focus();
}

if (form && success) {
  // Validate on blur. The summary callout reflects the last submit attempt only: hiding it here would
  // reflow the form under the pointer mid-click (mousedown blurs a field, mouseup misses the moved button).
  form.addEventListener('focusout', (event) => {
    const field = event.target.closest?.('.aitr-form-field');
    if (!field || !form.contains(field)) return;
    validateField(field);
  });

  form.addEventListener('input', (event) => {
    const field = event.target.closest?.('.aitr-form-field');
    if (field?.dataset.state === 'error') validateField(field);
  });
  form.addEventListener('change', (event) => {
    const field = event.target.closest?.('.aitr-form-field');
    if (field?.dataset.state === 'error') validateField(field);
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const errors = validateAll();
    if (errors.length) {
      errors[0].control.focus();
      return;
    }
    const button = form.querySelector('wa-button[type="submit"]');
    if (button) {
      button.loading = true;
      button.setAttribute('loading', '');
    }
    await wait(900); // simulated request
    if (button) {
      button.loading = false;
      button.removeAttribute('loading');
    }
    await showSuccess();
  });

  resetButton?.addEventListener('click', () => {
    showForm();
  });

  if (new URLSearchParams(location.search).get('state') === 'contact-success') {
    showSuccess({ animate: false, focus: false });
  }
}

/* ---------- What’s included: mobile plan picker (chips are a radiogroup handled by site.js; we only switch the column) ---------- */
const picker = document.querySelector('.business-plan-picker');
const tableWrap = document.querySelector('.business-table-wrap');
const showPlan = (plan) => {
  if (tableWrap && plan) tableWrap.dataset.plan = plan;
};
picker?.addEventListener('aitr-change', (event) => showPlan(event.detail));
picker?.addEventListener('click', (event) => showPlan(event.target.closest('.aitr-chip')?.dataset.value));
