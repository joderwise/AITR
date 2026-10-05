// Usage: node tools/eval.mjs <url> "<js expression returning JSON-able value>" [width]
import { chromium } from 'playwright-core';
const [url, expr, w = '1440'] = process.argv.slice(2);
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: +w, height: 900 } });
await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(800);
console.log(JSON.stringify(await page.evaluate(expr), null, 1));
await browser.close();
