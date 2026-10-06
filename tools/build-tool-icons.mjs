// Builds the AI tool icon library: one square SVG per tool in assets/tool-icons/<slug>.svg (registered as the Web Awesome
// icon library "aitr-tools" in js/site.js). Usage: node tools/build-tool-icons.mjs
//
// Sources (pinned, open licences — see assets/tool-icons/SOURCES.md, written by this script):
//   lobe:<name>  LobeHub Icons  @lobehub/icons-static-svg 1.95.1 (MIT). "-color" variants keep their brand colours;
//                single-colour marks (fill="currentColor") are filled with the brand ink given in INK.
//   si:<slug>    Simple Icons   simple-icons 16.34.0 (CC0 1.0) — filled with the official hex from its data file.
//   local        tools/tool-icons-src/<slug>.svg — curated per tool (LOCAL below records where each one came from):
//                the vendor's own SVG (favicon / app icon / header logo, cropped to the mark when it sat beside a wordmark),
//                svgl.app or gilbarbara/logos (CC0), or a vector trace of the vendor's official favicon / App Store icon when
//                no SVG is published anywhere reachable. Run it through the same clean-up as the CDN sources.
//   (no entry)   Monogram       generated here: brand-neutral circle + the tool's initials (same rule as js/data/tools.js).
import { mkdir, writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';

const LOBE = 'https://cdn.jsdelivr.net/npm/@lobehub/icons-static-svg@1.95.1/icons/';
const SI = 'https://cdn.jsdelivr.net/npm/simple-icons@16.34.0/';
const OUT = new URL('../assets/tool-icons/', import.meta.url);

// slug → source. Only marks that are the tool's own logo (or its product family's, noted) — near-name matches that belong
// to other brands were rejected: Simple Icons "Fathom" (Fathom Analytics), "Magic" (magic.link), "StackBlitz" (≠ Bolt).
const SOURCES = {
  'adobe-firefly': 'lobe:adobefirefly-color',
  'capcut': 'lobe:capcut',
  'chatgpt': 'lobe:openai',                         // ChatGPT uses the OpenAI blossom
  'claude': 'lobe:claude-color',
  'cohere': 'lobe:cohere-color',
  'deepseek': 'lobe:deepseek-color',
  'elevenlabs': 'lobe:elevenlabs',
  'ernie-bot-baidu': 'lobe:wenxin-color',           // ERNIE Bot = Wenxin Yiyan
  'gemini': 'lobe:gemini-color',
  'github-copilot': 'lobe:githubcopilot',
  'google-notebooklm': 'lobe:notebooklm',
  'grammarly': 'si:grammarly',
  'hugging-face': 'lobe:huggingface-color',
  'kling-ai': 'lobe:kling-color',
  'krea': 'lobe:krea',
  'languagetool': 'si:languagetool',
  'lovable': 'lobe:lovable-color',
  'manus': 'lobe:manus',
  'meta-ai': 'lobe:metaai-color',
  'microsoft-copilot': 'lobe:copilot-color',
  'microsoft-security-copilot': 'lobe:copilot-color', // Security Copilot ships under the Copilot mark
  'midjourney': 'lobe:midjourney',
  'openai-api': 'lobe:openai',
  'openrouter': 'lobe:openrouter-color',
  'perplexity-ai': 'lobe:perplexity-color',
  'pixlr': 'si:pixlr',
  'quizlet': 'si:quizlet',
  'runway': 'lobe:runway',
  'stability-ai': 'lobe:stability-color',
  'topaz-labs': 'lobe:topazlabs',
  'v0': 'lobe:v0',
  'windsurf': 'lobe:windsurf',
  'wondershare-filmora': 'si:wondersharefilmora',
};
// Curated local sources: slug → [how it was obtained, origin]. Files live in tools/tool-icons-src/.
const T = (o) => ['Traced', o], V = (o) => ['Vendor SVG', o], C = (o) => ['Vendor SVG, mark cropped from the logo lockup', o];
const LOCAL = {
  'abacus-ai': T('abacus.ai favicon (192 px)'), 'ai-image-enlarger': T('imglarger.com favicon (48 px)'), 'anyword': T('anyword.com favicon (256 px)'),
  'article-fiesta': T('articlefiesta.com favicon (180 px)'), 'bardeen': V('bardeen.ai favicon'), 'beautiful-ai': T('beautiful.ai favicon (256 px)'),
  'beyondwords': T('beyondwords.io favicon (180 px)'), 'bolt': T('bolt.new favicon (192 px)'), 'descript': ['gilbarbara/logos (CC0) via Iconify', 'logos:descript-icon'],
  'editpad': T('editpad.org favicon (180 px) — the I ❤ NOTE heart, Editpad\'s current brand'), 'fathom': V('fathom.video favicon'), 'fireflies-ai': V('fireflies.ai site logo'),
  'flexclip': T('flexclip.com favicon (32 px)'), 'fotor': T('fotor.com favicon (128 px)'), 'frase': T('frase.io favicon (192 px)'), 'freeconvert': T('freeconvert.com favicon (128 px)'),
  'gamma': T('gamma.app favicon (192 px)'), 'gliacloud': V('gliacloud.com favicon'), 'google-flow': ['Redrawn', 'labs.google/flow icon (653 px): shape + horizontal fade rebuilt as a vector'],
  'granola': ['svgl.app', 'granola-light.svg'], 'hemingway-editor': T('hemingwayapp.com favicon (64 px)'), 'heygen': T('HeyGen App Store icon (512 px, HeyGen Technology Inc.)'),
  'jam-dev': V('jam.dev favicon'), 'julius-ai': T('julius.ai favicon (196 px)'), 'landbot': C('landbot.io logo'), 'magic-patterns': V('magicpatterns.com favicon'),
  'magnific': V('magnific.ai favicon'), 'microsoft-designer': ['svgl.app', 'microsoft-designer.svg'], 'murf-ai': C('murf.ai logo'), 'mxspeech': V('mxspeech.com favicon'),
  'otter-ai': V('otter.ai header logo'), 'paradox': T('paradox.ai favicon (256 px)'), 'pepper-content': C('peppercontent.io logo'), 'pixelcut': T('pixelcut.ai favicon (192 px)'),
  'popai': T('PopAi App Store icon (512 px, 01.AI)'), 'privado': T('privado.ai favicon (256 px)'), 'quiq': C('quiq.com logo'), 'read-ai': C('read.ai logo'),
  'readspeaker': T('readspeaker.com favicon (256 px)'), 'simplified': T('Simplified AI App Store icon (512 px, TLDR Technologies)'), 'speechify': T('speechify.com favicon (180 px)'),
  'synthesia': C('synthesia.io logo'), 'synthesys': T('synthesys.io favicon (256 px)'), 'turbologo': C('turbologo.com logo'), 'upscale-media': T('upscale.media web-app icon (512 px)'),
  'ux-pilot': T('uxpilot.ai favicon (192 px)'), 'vidnoz-ai': T('vidnoz.com favicon (180 px)'), 'voicemod': ['svgl.app, mark cropped from the lockup', 'voicemod_light.svg'],
  'writesonic': V('writesonic.com app icon'), 'yellow-ai': T('yellow.ai web-app icon (300 px)'), 'you-com': T('You.com App Store icon (512 px, SuSea, Inc.)'),
};
for (const k of Object.keys(LOCAL)) SOURCES[k] = 'local';

// Brand ink for LobeHub single-colour marks (all of these brands use a black mark on light backgrounds)
const INK = '#000000';
// Monogram fills: mid/dark hues, every one ≥ 4.5:1 against white initials
const MONO_FILLS = ['#4338CA', '#0F766E', '#B45309', '#BE185D', '#1D4ED8', '#6D28D9', '#047857', '#9F1239', '#374151', '#0E7490'];

// Same registry rows and initials rule as js/data/tools.js
const rows = [...readFileSync(new URL('../js/data/tools.js', import.meta.url), 'utf8').matchAll(/^  \['([^']*)', '([^']*)'/gm)].map((m) => ({ name: m[1], slug: m[2] }));
const initialsOf = (name) => name.replace(/\(.*?\)/g, '').split(/[\s.]+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || name[0].toUpperCase();
function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Normalise a fetched SVG: 24×24 viewBox kept, no fixed size/inline style/title (the label lives on <wa-icon>)
const clean = (svg) => svg
  .replace(/<title>[\s\S]*?<\/title>/g, '')
  .replace(/<svg\b([^>]*)>/, (_, a) => `<svg${a.replace(/\s(width|height|style)="[^"]*"/g, '')}>`)
  .trim() + '\n';

// Web Awesome styles the root <svg> with fill: currentColor, which beats a fill attribute there — so a single brand fill
// goes on an inner <g> instead (presentation attributes on descendants are untouched by that rule).
const fillGroup = (svg, fill) => svg.replace(/<svg\b[^>]*>/, (tag) => tag.replace(/\sfill="[^"]*"/, '')).replace(/(<svg\b[^>]*>)([\s\S]*)(<\/svg>)/, `$1<g fill="${fill}">$2</g>$3`);

// Pad a non-square viewBox to a square one (centred) so every icon fills the same --size box
const squareViewBox = (svg) => svg.replace(/viewBox="([^"]+)"/, (m, v) => {
  const [x, y, w, h] = v.trim().split(/[\s,]+/).map(Number); if (Math.abs(w - h) < 1e-6) return m;
  const s = Math.max(w, h), f = (n) => +n.toFixed(3); return `viewBox="${f(x - (s - w) / 2)} ${f(y - (s - h) / 2)} ${f(s)} ${f(s)}"`;
});
// Local sources come from websites: drop anything executable or external, then the shared clean-up
const sanitize = (svg) => svg
  .replace(/<\?xml[^>]*>|<!DOCTYPE[^>]*>|<!--[\s\S]*?-->/gi, '')
  .replace(/<(script|foreignObject|style)\b[\s\S]*?<\/\1>/gi, '')
  .replace(/\son[a-z]+="[^"]*"/gi, '')
  .replace(/\s(xlink:)?href="(https?:|javascript:)[^"]*"/gi, '');

async function get(url) { const r = await fetch(url); if (!r.ok) throw new Error(`${r.status} ${url}`); return r.text(); }

let siData;
async function fromSource(src) {
  const [kind, id] = src.split(':');
  if (kind === 'local') {
    let svg = clean(sanitize(readFileSync(new URL(`tool-icons-src/${id}.svg`, import.meta.url), 'utf8')));
    const rootFill = (svg.match(/<svg\b[^>]*?\sfill="([^"]*)"/) || [])[1] || '#000000'; // SVG default black, not WA's currentColor
    return squareViewBox(fillGroup(svg, rootFill));
  }
  if (kind === 'lobe') {
    const svg = clean(await get(`${LOBE}${id}.svg`));
    return id.endsWith('-color') ? svg : fillGroup(svg.replace(/currentColor/g, INK), INK);
  }
  siData ??= JSON.parse(await get(`${SI}data/simple-icons.json`));
  const meta = siData.find((x) => (x.slug || '') === id);
  if (!meta) throw new Error(`simple-icons: no data for ${id}`);
  return fillGroup(clean(await get(`${SI}icons/${id}.svg`)), `#${meta.hex}`);
}

const monogram = (name, slug) => {
  const ini = initialsOf(name), fill = MONO_FILLS[hash(slug) % MONO_FILLS.length];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img"><circle cx="12" cy="12" r="12" fill="${fill}"/>` +
    `<text x="12" y="12" fill="#FFFFFF" font-family="'Public Sans', system-ui, sans-serif" font-weight="700" font-size="${ini.length > 1 ? 9.5 : 11}" ` +
    `letter-spacing="-0.2" text-anchor="middle" dominant-baseline="central">${esc(ini)}</text></svg>\n`;
};

await mkdir(OUT, { recursive: true });
const log = [];
for (const { name, slug } of rows) {
  const src = SOURCES[slug];
  const svg = src ? await fromSource(src === 'local' ? `local:${slug}` : src) : monogram(name, slug);
  await writeFile(new URL(`${slug}.svg`, OUT), svg);
  log.push(`| ${name} | \`${slug}\` | ${!src ? 'Monogram' : src === 'local' ? `${LOCAL[slug][0]} — ${LOCAL[slug][1]}` : src.startsWith('lobe:') ? `LobeHub \`${src.slice(5)}\`` : `Simple Icons \`${src.slice(3)}\``} |`);
}
const extra = Object.keys(SOURCES).filter((s) => !rows.some((r) => r.slug === s));
if (extra.length) throw new Error(`SOURCES has unknown slugs: ${extra.join(', ')}`);

await writeFile(new URL('SOURCES.md', OUT), `# AI tool icon library

One square SVG per tool in \`js/data/tools.js\`, served to \`<wa-icon library="aitr-tools" name="<slug>">\`.
Generated by \`node tools/build-tool-icons.mjs\` — edit the script, not these files.

- **LobeHub Icons**, \`@lobehub/icons-static-svg@1.95.1\`, MIT licence (https://github.com/lobehub/lobe-icons). Colour variants as published; single-colour marks filled with ${INK}.
- **Simple Icons**, \`simple-icons@16.34.0\`, CC0 1.0 (https://simpleicons.org). Filled with the official brand hex.
- **Vendor SVG**: the tool's own SVG from its website (favicon, app icon or header logo); "mark cropped" means the symbol was cut out of a logo + wordmark lockup. Curated copies in \`tools/tool-icons-src/\`.
- **svgl.app** / **gilbarbara/logos** (CC0, via Iconify): community SVG logo collections.
- **Traced**: no SVG was published or reachable, so the vendor's official favicon / App Store icon (size noted) was vector-traced (vtracer, quantised palette). Faithful at icon sizes; replace with an official SVG when the vendor provides one.
- **Redrawn**: rebuilt by hand from the official icon.
- **Monogram**: generated circle with the tool's initials, for tools with no usable logo.

Brand marks remain trademarks of their owners and are shown only to identify each tool.

${rows.filter((r) => SOURCES[r.slug]).length} brand marks · ${rows.filter((r) => !SOURCES[r.slug]).length} monograms

| Tool | Slug | Source |
| --- | --- | --- |
${log.join('\n')}
`);
console.log(`wrote ${rows.length} icons (${rows.filter((r) => SOURCES[r.slug]).length} brand, ${rows.filter((r) => !SOURCES[r.slug]).length} monogram)`);
