/* How we assess v2 (13.1–13.7) — Section Nav tabs bar, responsive layout swap and hash deep links.
   Layout=Tabs (glass segmented pill bar) on Desktop and Tablet, Layout=Dropdown (<wa-select>) on Mobile.
   Generic behaviour (site nav, footer, reveal, count-up, tabpanel swap-in animation) comes from js/site.js + css/site.css. */

const nav = document.querySelector('.aitr-section-nav');
const label = nav?.querySelector('.aitr-section-nav__label');
const tablist = nav?.querySelector('[role="tablist"]');
const tabs = tablist ? [...tablist.querySelectorAll('[role="tab"]')] : [];
const panels = tabs.map((tab) => document.getElementById(tab.getAttribute('aria-controls')));
const tierExample = document.querySelector('.aitr-tier-example');

if (nav && tabs.length) init();

function init() {
  const mqMobile = matchMedia('(max-width: 767px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let current = Math.max(0, indexForHash(location.hash));
  let select = null;
  let swapToken = 0;

  // ----- initial state (no swap animation beyond the generic reveal; URL left as-is) -----
  panels.forEach((panel, i) => { panel.hidden = i !== current; });
  markSelected(current);
  applyLayout();

  // ----- Section Nav layout: tabs (desktop + tablet) · dropdown (mobile) -----
  function applyLayout() {
    const layout = mqMobile.matches ? 'dropdown' : 'tabs';
    nav.dataset.layout = layout;
    if (layout === 'dropdown') {
      if (!select) select = buildSelect();
      if (tablist.isConnected) tablist.remove();           // no hidden tabs left in the DOM
      if (!select.isConnected) nav.append(select);
      select.value = panels[current].id;
    } else {
      if (select?.isConnected) select.remove();
      if (!tablist.isConnected) nav.append(tablist);
      tablist.setAttribute('aria-orientation', 'horizontal');
      scrollTabIntoView(tabs[current], 'auto');
    }
    tierExample?.setAttribute('data-layout', layout === 'dropdown' ? 'stacked' : 'row');
  }
  mqMobile.addEventListener('change', applyLayout);

  function buildSelect() {
    const el = document.createElement('wa-select');
    el.className = 'aitr-field';
    el.setAttribute('size', 'large');
    el.setAttribute('label', label?.textContent.trim() || 'On this page');
    el.id = 'assess-section-select';
    tabs.forEach((tab, i) => {
      const opt = document.createElement('wa-option');
      opt.value = panels[i].id;
      opt.textContent = tab.textContent.trim();
      el.append(opt);
    });
    el.addEventListener('change', () => {
      const i = panels.findIndex((p) => p.id === el.value);
      if (i >= 0 && i !== current) activate(i, { focusHeading: true });
    });
    return el;
  }

  // ----- tabs: manual activation, roving tabindex, ← → / Home / End -----
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => { if (i !== current) activate(i); });
  });
  tablist.addEventListener('keydown', (event) => {
    const focused = tabs.indexOf(document.activeElement);
    if (focused < 0) return;
    let target = null;
    switch (event.key) {
      case 'ArrowRight': target = (focused + 1) % tabs.length; break;
      case 'ArrowLeft': target = (focused - 1 + tabs.length) % tabs.length; break;
      case 'Home': target = 0; break;
      case 'End': target = tabs.length - 1; break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (focused !== current) activate(focused);
        return;
      default: return;
    }
    event.preventDefault();
    tabs[target].focus();
    scrollTabIntoView(tabs[target]);
  });

  // ----- hash deep links (#what-is-roai … #how-current) -----
  addEventListener('hashchange', () => {
    const i = indexForHash(location.hash);
    if (i >= 0 && i !== current) activate(i, { hash: false });
  });

  async function activate(next, { hash = true, focusHeading = false } = {}) {
    const prev = current;
    current = next;
    markSelected(next);
    if (select) select.value = panels[next].id;
    if (hash) history.replaceState(null, '', `#${panels[next].id}`);
    scrollTabIntoView(tabs[next]);
    await swapPanels(panels[prev], panels[next]);
    if (focusHeading && current === next) {
      panels[next].querySelector('h2')?.focus();
    }
  }

  function markSelected(index) {
    tabs.forEach((tab, i) => {
      const selected = i === index;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
  }

  // out: Fast · Exit (data-exit keyframes in the page CSS); in: generic tabpanel reveal (Reveal · Entrance;
  // cross-fade on mobile) fires when `hidden` is removed.
  async function swapPanels(from, to) {
    const token = ++swapToken;
    if (from && from !== to && !from.hidden) {
      from.setAttribute('data-exit', '');
      await animationsSettled(from);
      from.removeAttribute('data-exit');
      if (token !== swapToken) return;
      from.hidden = true;
    }
    to.hidden = false;
  }

  function animationsSettled(el) {
    void el.offsetWidth; // flush styles so the keyframe animation exists
    return Promise.allSettled(el.getAnimations().map((a) => a.finished));
  }

  // the bar scrolls when it overflows (Tablet: the whole pill scrolls inside the nav; otherwise the list itself)
  function scrollTabIntoView(tab, behavior) {
    if (!tab?.isConnected) return;
    const scroller = nav.scrollWidth > nav.clientWidth ? nav : tablist;
    if (scroller.scrollWidth <= scroller.clientWidth) return;
    const tabRect = tab.getBoundingClientRect();
    const scrollerRect = scroller.getBoundingClientRect();
    const left = scroller.scrollLeft + (tabRect.left - scrollerRect.left) - (scroller.clientWidth - tabRect.width) / 2;
    scroller.scrollTo({ left: Math.max(0, left), behavior: behavior || (reduced.matches ? 'auto' : 'smooth') });
  }
}

function indexForHash(hash) {
  if (!hash) return -1;
  const id = decodeURIComponent(hash.slice(1));
  return panels.findIndex((panel) => panel.id === id);
}
