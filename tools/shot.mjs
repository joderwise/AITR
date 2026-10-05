// Usage: node tools/shot.mjs <url> <out.png> [width] [height|full]
import { chromium } from 'playwright-core';
const [url, out, w = '1440', h = 'full'] = process.argv.slice(2);
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: +w, height: h === 'full' ? 900 : +h }, reducedMotion: 'no-preference' });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(`[${m.type()}] ${m.text()}`); });
page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`));
page.on('response', (r) => { if (r.status() >= 400) errors.push(`[${r.status()}] ${r.url()}`); });
page.on('requestfailed', (r) => errors.push(`[requestfailed] ${r.url()} ${r.failure()?.errorText}`));
await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(1200);
// reveal everything (IntersectionObserver targets below the fold) so full-page shots are complete
await page.evaluate(() => { document.querySelectorAll('[data-reveal],[data-reveal-group]').forEach((el) => el.classList.add('is-in')); document.querySelectorAll('.aitr-score').forEach((el) => el.classList.add('is-filled')); });
await page.addStyleTag({ content: '.aitr-nav__bar, .aitr-nav .aitr-brand, .aitr-nav__links > * { animation: none !important; opacity: 1 !important; transform: none !important; }' });
if (!process.env.MOTION) await page.addStyleTag({ content: '*, *::before, *::after { animation-duration: 0s !important; animation-delay: 0s !important; transition-duration: 0s !important; }' }); // deterministic end-state captures (MOTION=1 keeps animations)
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(800);
await page.screenshot({ path: out, fullPage: h === 'full' });
const size = await page.evaluate(() => ({ w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight }));
console.log(JSON.stringify({ out, size, errors: errors.slice(0, 12) }, null, 1));
await browser.close();
