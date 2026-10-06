// Finds widows: running text whose last line holds a single word, and wrapped UI rows whose last line holds a single item.
// Usage: node tools/widows.mjs <page.html|all> [width ...]   (defaults: all pages · 390 834 1440)
import { chromium } from 'playwright-core';
const [target = 'all', ...ws] = process.argv.slice(2);
const pages = target === 'all' ? ['index', 'browse', 'how-we-assess', 'for-business', 'contribute', 'tool', 'tool.html?tool=claude', 'how-we-assess.html#every-tier', 'how-we-assess.html#what-we-check'] : [target];
const widths = ws.length ? ws.map(Number) : [390, 834, 1440];
const b = await chromium.launch({ channel: 'chrome', headless: true });
let total = 0;
for (const w of widths) for (const pg of pages) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  const url = `http://localhost:8110/${pg.includes('.html') ? pg : pg + '.html'}`;
  await p.goto(url, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.querySelectorAll('[data-reveal],[data-reveal-group]').forEach((el) => el.classList.add('is-in')));
  await p.addStyleTag({ content: '*{animation:none!important;transition:none!important}' });
  await p.waitForTimeout(700);
  const found = await p.evaluate(() => {
    const out = [];
    const visible = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 2 && r.height > 2 && cs.clipPath !== 'inset(50%)' && cs.visibility !== 'hidden' && cs.display !== 'none' && !el.closest('[hidden],[aria-hidden="true"],.aitr-visually-hidden,dialog:not([open])'); };
    // 1 · text blocks: elements whose own text nodes wrap onto 2+ lines with a single word on the last line
    const blocks = [...document.querySelectorAll('body *')].filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().split(/\s+/).length > 1) && visible(el));
    for (const el of blocks) {
      const words = [];
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) { const n = walker.currentNode; if (n.parentElement.closest('[aria-hidden="true"]') && !el.closest('[aria-hidden="true"]')) continue; const re = /\S+/g; let m; while ((m = re.exec(n.textContent))) { const r = document.createRange(); r.setStart(n, m.index); r.setEnd(n, m.index + m[0].length); const rect = [...r.getClientRects()].pop(); if (rect && rect.width) words.push({ w: m[0], top: Math.round(rect.top), bottom: Math.round(rect.bottom) }); } }
      if (words.length < 3) continue;
      const lines = []; for (const x of words) { const l = lines.find((l) => Math.abs(l.top - x.top) < 4); if (l) l.n++; else lines.push({ top: x.top, n: 1, w: x.w }); }
      if (lines.length < 2) continue;
      lines.sort((a, b) => a.top - b.top); const last = lines[lines.length - 1];
      if (last.n === 1 && Math.max(...lines.map((l) => l.n)) > 1 && !/^[\d.,%+·—–-]+$/.test(last.w)) out.push({ kind: 'text', tag: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/)[0] : ''), last: last.w, text: el.textContent.trim().replace(/\s+/g, ' ').slice(0, 70) });
    }
    // 2 · wrapped UI rows (flex/grid with wrap) whose last row is a single item
    for (const el of document.querySelectorAll('body *')) {
      const cs = getComputedStyle(el); if (!(cs.flexWrap === 'wrap' && cs.display.includes('flex')) || !visible(el)) continue;
      const kids = [...el.children].filter(visible); if (kids.length < 3) continue;
      const rows = []; for (const k of kids) { const kr = k.getBoundingClientRect(); const t = Math.round(kr.top + kr.height / 2); const r = rows.find((r) => Math.abs(r.t - t) < 12); if (r) r.n++; else rows.push({ t, n: 1, name: (k.textContent || k.tagName).trim().slice(0, 30) }); }
      rows.sort((a, b) => a.t - b.t);
      if (rows.length > 1 && rows[rows.length - 1].n === 1 && rows[0].n > 1) out.push({ kind: 'ui-row', tag: el.tagName.toLowerCase() + '.' + (typeof el.className === 'string' ? el.className.trim().split(/\s+/)[0] : ''), last: rows[rows.length - 1].name });
    }
    // de-dupe nested hits (keep innermost)
    return out.filter((x, i, a) => a.findIndex((y) => y.text === x.text && y.kind === x.kind && y.last === x.last) === i);
  });
  total += found.length;
  if (found.length) { console.log(`\n${pg} @${w}: ${found.length}`); found.slice(0, 25).forEach((f) => console.log(`  [${f.kind}] ${f.tag} — “…${f.last}”${f.text ? '  ← ' + f.text : ''}`)); }
  await p.close();
}
console.log(`\nTOTAL ${total}`);
await b.close();
