// use_figma script for the Figma watch — returns only frames whose height / text hash / geometry hash / style hash differ from BASE
// (fill BASE from docs/watch/fingerprint.tsv: id -> "h|textHash|geoHash|styleHash"). Added / removed frames are reported too.
// styleHash (added 3 Oct 2026) covers what geometry misses: image fills (imageHash), solid fill colours, visibility, radius and instance variant props —
// the Browse logo swap (Tool=Generic + per-instance image fill, same geometry) went undetected without it.
const BASE = {/* id: "h|textHash|geoHash|styleHash" */};
const page = await figma.getNodeByIdAsync('2367:13'); await figma.setCurrentPageAsync(page);
const hash = (str) => { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16); };
const seen = new Set(); const changed = [], added = [];
for (const sec of page.children) { const list = sec.type === 'SECTION' ? sec.children : [sec];
  for (const f of list) { if (f.type !== 'FRAME') continue; seen.add(f.id);
    const texts = f.findAllWithCriteria({ types: ['TEXT'] }).map(t => t.characters).join('\u0001');
    const geo = f.findAllWithCriteria({ types: ['FRAME','INSTANCE','RECTANGLE','TEXT'] }).map(n => `${n.name}:${Math.round(n.x)},${Math.round(n.y)},${Math.round(n.width)},${Math.round(n.height)}`).join('|');
    const col = (p) => (!Array.isArray(p) || p === figma.mixed) ? '' : p.map(q => q.type === 'IMAGE' ? 'IMG:' + q.imageHash : q.type === 'SOLID' ? `${Math.round(q.color.r*255)},${Math.round(q.color.g*255)},${Math.round(q.color.b*255)},${q.opacity ?? 1},${q.visible !== false}` : q.type).join(';');
    let style = '';
    for (const n of f.findAll(() => true)) { let props = ''; if (n.type === 'INSTANCE') { try { props = Object.entries(n.componentProperties).map(([k, v]) => `${k.split('#')[0]}=${v.value}`).join(','); } catch (e) {} }
      style += `${n.type}:${n.name}:${n.visible}:${n.opacity === figma.mixed ? 'm' : n.opacity}:${'cornerRadius' in n && n.cornerRadius !== figma.mixed ? n.cornerRadius : ''}:${col(n.fills)}:${col(n.strokes)}:${props}|`; }
    const now = `${Math.round(f.height)}|${hash(texts)}|${hash(geo)}|${hash(style)}`;
    if (!BASE[f.id]) added.push(`${f.id} ${f.name} ${Math.round(f.width)}x${Math.round(f.height)} ${now}`);
    else if (BASE[f.id] !== now) changed.push(`${f.id} ${f.name} ${BASE[f.id]} -> ${now}`); } }
const removed = Object.keys(BASE).filter(id => !seen.has(id));
return { frames: seen.size, changed, added, removed };
