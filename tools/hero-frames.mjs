// node tools/hero-frames.mjs <outDir> <pct,pct,...>   Freezes the hero loop at given % of the loop and crops the scene (diagnostic for timing).
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const out = process.argv[2] || 'shots/hero'; const pcts = (process.argv[3] || '20,22.5,24,30,34,36.5,38,42,47,55,65,80').split(',').map(Number);
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1440, height: 810 } });
await p.goto('http://localhost:8110/index.html', { waitUntil: 'networkidle' });
await p.waitForTimeout(1500);
const loopMs = await p.evaluate(() => { const v = getComputedStyle(document.querySelector('.aitr-home-hero')).getPropertyValue('--home-loop').trim(); return v.endsWith('ms') ? parseFloat(v) : parseFloat(v) * 1000; });
console.log('loop ms', loopMs);
for (const pct of pcts) {
  await p.evaluate(({ pct, loopMs }) => { for (const a of document.querySelectorAll('.home-hero__scene')[0].getAnimations({ subtree: true })) { a.pause(); a.currentTime = (pct / 100) * loopMs; } }, { pct, loopMs });
  await p.waitForTimeout(80);
  await p.screenshot({ path: `${out}/f-${String(pct).padStart(5, '0')}.png`, clip: { x: 760, y: 200, width: 680, height: 560 } });
}
await b.close();
