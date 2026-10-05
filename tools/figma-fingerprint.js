// use_figma script for the watch loop — paste as `code`; compare the TSV it returns with docs/watch/fingerprint.tsv
const page = await figma.getNodeByIdAsync('2367:13'); await figma.setCurrentPageAsync(page);
const hash = (str) => { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16); };
const rows = [];
for (const sec of page.children) { const list = sec.type === 'SECTION' ? sec.children : [sec];
  for (const f of list) { if (f.type !== 'FRAME') continue;
    const texts = f.findAllWithCriteria({ types: ['TEXT'] }).map(t => t.characters).join('\u0001');
    const inst = f.findAllWithCriteria({ types: ['INSTANCE'] }).length;
    const geo = f.findAllWithCriteria({ types: ['FRAME','INSTANCE','RECTANGLE','TEXT'] }).map(n => `${n.name}:${Math.round(n.x)},${Math.round(n.y)},${Math.round(n.width)},${Math.round(n.height)}`).join('|');
    rows.push([f.id, f.name, Math.round(f.width), Math.round(f.height), f.children.length, hash(texts), inst, hash(geo)].join('\t')); } }
return rows.join('\n');
