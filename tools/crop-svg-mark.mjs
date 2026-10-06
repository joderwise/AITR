// Crops a logo lockup to its mark and squares the viewBox (used to curate tools/tool-icons-src/).
// Usage: node tools/crop-svg-mark.mjs in.svg out.svg [left|right|all]  — left/right keep the side of the widest horizontal gap; all keeps everything
import { chromium } from 'playwright-core';
import { readFileSync, writeFileSync } from 'node:fs';
const [inp, out, mode = 'left'] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome', headless: true });
const p = await b.newPage();
await p.setContent(`<div id=h>${readFileSync(inp, 'utf8').replace(/<\?xml[^>]*>/, '').replace(/<!DOCTYPE[^>]*>/i, '')}</div>`);
const res = await p.evaluate((mode) => {
  const svg = document.querySelector('#h svg');
  svg.querySelectorAll('script,foreignObject').forEach((e) => e.remove());
  const vb = svg.viewBox.baseVal && svg.viewBox.baseVal.width ? svg.viewBox.baseVal : { x: 0, y: 0, width: svg.width.baseVal.value, height: svg.height.baseVal.value };
  const inv = svg.getScreenCTM().inverse();
  const leaves = [...svg.querySelectorAll('path,rect,circle,ellipse,polygon,polyline,line,use,image,text')].filter((e) => !e.closest('defs,clipPath,mask,pattern,symbol,linearGradient,radialGradient'));
  const boxes = [];
  for (const e of leaves) {
    let bb; try { bb = e.getBBox(); } catch { continue; }
    if (!bb.width && !bb.height) continue;
    const m = inv.multiply(e.getScreenCTM());
    const pts = [[bb.x, bb.y], [bb.x + bb.width, bb.y], [bb.x, bb.y + bb.height], [bb.x + bb.width, bb.y + bb.height]].map(([x, y]) => new DOMPoint(x, y).matrixTransform(m));
    const r = { e, x0: Math.min(...pts.map((q) => q.x)), x1: Math.max(...pts.map((q) => q.x)), y0: Math.min(...pts.map((q) => q.y)), y1: Math.max(...pts.map((q) => q.y)) };
    if (r.x1 - r.x0 > vb.width * 0.97 && r.y1 - r.y0 > vb.height * 0.97) continue; // full-bleed background
    const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) continue;
    boxes.push(r);
  }
  boxes.sort((a, b) => a.x0 - b.x0);
  let keep = boxes;
  if (mode !== 'all' && boxes.length > 1) {
    let best = -1, gap = -Infinity, maxR = boxes[0].x1;
    for (let i = 1; i < boxes.length; i++) { const g = boxes[i].x0 - maxR; if (g > gap) { gap = g; best = i; } maxR = Math.max(maxR, boxes[i].x1); }
    keep = mode === 'left' ? boxes.slice(0, best) : boxes.slice(best);
    const drop = new Set((mode === 'left' ? boxes.slice(best) : boxes.slice(0, best)).map((r) => r.e));
    drop.forEach((e) => e.remove());
  }
  const x0 = Math.min(...keep.map((r) => r.x0)), x1 = Math.max(...keep.map((r) => r.x1)), y0 = Math.min(...keep.map((r) => r.y0)), y1 = Math.max(...keep.map((r) => r.y1));
  const s = Math.max(x1 - x0, y1 - y0), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const f = (n) => +n.toFixed(3);
  svg.setAttribute('viewBox', `${f(cx - s / 2)} ${f(cy - s / 2)} ${f(s)} ${f(s)}`);
  ['width', 'height', 'class', 'style'].forEach((a) => svg.removeAttribute(a));
  if (!svg.getAttribute('xmlns')) svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  return { svg: svg.outerHTML, kept: keep.length, total: boxes.length };
}, mode);
writeFileSync(out, res.svg + '\n');
console.log(inp.split('/').pop(), '→', out.split('/').pop(), `kept ${res.kept}/${res.total}`);
await b.close();
