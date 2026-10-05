/* Mock registry behind Browse, the nav / hero search and Tool detail (5 Oct 2026).
   The 84 tools, vendors, types, safety ratings, top plans and agentic flags are the real rows drawn in the Figma Browse frame
   (Iteration 6 › 12 · Browse Tools, cards "Tool / *"); logos are the exact Figma image fills where the frame has them, otherwise a brand tile with initials.
   Everything else (plan ladders, per-tier scores, country) is generated deterministically from the row so every page agrees. */

export const TYPE_LABELS = { 'chat-search': 'Chat & Search', 'writing': 'Writing', 'image': 'Image', 'video-audio': 'Video & Audio', 'code-dev': 'Code & Developer Tools', 'productivity-agents': 'Productivity & Agents' };
export const VERDICT_LABELS = { 'business-ready': 'Business Ready', 'internal-work-only': 'Internal Work Only', 'public-data-only': 'Public Data Only', 'unsafe': 'Unsafe' };
const RANK = { 'unsafe': 0, 'public-data-only': 1, 'internal-work-only': 2, 'business-ready': 3 };

/* [name, slug, vendor, type, verdict (of the top plan), top plan label, agentic, logo] */
const ROWS = [
  ['Abacus.AI', 'abacus-ai', 'Abacus.AI, Inc.', 'productivity-agents', 'internal-work-only', 'ENTERPRISE', true, 'assets/logos/abacus-ai.png'],
  ['Adobe Firefly', 'adobe-firefly', 'Adobe', 'image', 'business-ready', 'PREMIUM', false, 'assets/logos/adobe-firefly.png'],
  ['AI Image Enlarger', 'ai-image-enlarger', 'Sparklightforce Limited', 'image', 'unsafe', 'BUSINESS', false, 'assets/logos/ai-image-enlarger.png'],
  ['Anyword', 'anyword', 'Keywee Inc.', 'writing', 'internal-work-only', 'ENTERPRISE', false, 'assets/logos/anyword.png'],
  ['Article Fiesta', 'article-fiesta', 'Article Fiesta', 'writing', 'public-data-only', 'ENTERPRISE', false, 'assets/logos/article-fiesta.png'],
  ['Bardeen', 'bardeen', 'Bardeen, Inc.', 'productivity-agents', 'public-data-only', 'ENTERPRISE', true, 'assets/logos/bardeen.png'],
  ['Beautiful.ai', 'beautiful-ai', 'Beautiful Slides, Inc.', 'productivity-agents', 'business-ready', 'ENTERPRISE', false, 'assets/logos/beautiful-ai.png'],
  ['BeyondWords', 'beyondwords', 'Lstn Ltd', 'video-audio', 'business-ready', 'PILOT', false, 'assets/logos/beyondwords.png'],
  ['Bolt', 'bolt', 'StackBlitz, Inc.', 'code-dev', 'public-data-only', 'ENTERPRISE', true, 'assets/logos/bolt.png'],
  ['CapCut', 'capcut', 'CapCut', 'video-audio', 'unsafe', 'TEAM', false, 'assets/logos/capcut.png'],
  ['ChatGPT', 'chatgpt', 'OpenAI', 'chat-search', 'business-ready', 'ENTERPRISE', true, 'assets/logos/chatgpt.png'],
  ['Claude', 'claude', 'Anthropic', 'chat-search', 'business-ready', 'ENTERPRISE', true, 'assets/logos/claude.png'],
  ['Cohere', 'cohere', 'Cohere', 'code-dev', 'internal-work-only', 'ENTERPRISE', false, 'assets/logos/cohere.png'],
  ['DeepSeek', 'deepseek', 'DeepSeek', 'chat-search', 'unsafe', 'API (PAY-AS-YOU-GO)', false, 'assets/logos/deepseek.png'],
  ['Descript', 'descript', 'Descript, Inc.', 'video-audio', 'internal-work-only', 'ENTERPRISE', false, 'assets/logos/descript.png'],
  ['Editpad', 'editpad', 'Enzipe', 'writing', 'public-data-only', 'ALL-IN-ONE (YEARLY)', false, 'assets/logos/editpad.png'],
  ['ElevenLabs', 'elevenlabs', 'Eleven Labs Inc.', 'video-audio', 'internal-work-only', 'BUSINESS', false, 'assets/logos/elevenlabs.png'],
  ['ERNIE Bot (Baidu)', 'ernie-bot-baidu', 'Baidu', 'chat-search', 'unsafe', 'FREE', false, 'assets/logos/ernie-bot-baidu.png'],
  ['Fathom', 'fathom', 'Fathom Video, Inc.', 'productivity-agents', 'internal-work-only', 'ENTERPRISE', false, 'assets/logos/fathom.png'],
  ['Fireflies.ai', 'fireflies-ai', 'Fireflies.AI Corp.', 'video-audio', 'business-ready', 'ENTERPRISE', false, 'assets/logos/fireflies-ai.png'],
  ['FlexClip', 'flexclip', 'PearlMountain Limited', 'video-audio', 'unsafe', 'BUSINESS', false, 'assets/logos/flexclip.png'],
  ['Fotor', 'fotor', 'Chengdu Everimaging Science and Technology Co., Ltd.', 'image', 'unsafe', 'MAX', false, 'assets/logos/fotor.png'],
  ['Frase', 'frase', 'Frase, Inc.', 'writing', 'business-ready', 'ENTERPRISE', false, 'assets/logos/frase.png'],
  ['FreeConvert', 'freeconvert', 'TRMedia Inc.', 'productivity-agents', 'public-data-only', 'SCALE', false, 'assets/logos/freeconvert.png'],
  ['Gamma', 'gamma', 'Gamma Tech, Inc.', 'productivity-agents', 'business-ready', 'BUSINESS', false, ''],
  ['Gemini', 'gemini', 'Google', 'chat-search', 'business-ready', 'GOOGLE WORKSPACE ENTERPRISE', true, 'assets/logos/gemini.png'],
  ['GitHub Copilot', 'github-copilot', 'GitHub', 'code-dev', 'public-data-only', 'ENTERPRISE', true, 'assets/logos/github-copilot.png'],
  ['GliaCloud', 'gliacloud', 'GliaCloud Co., Ltd.', 'video-audio', 'public-data-only', 'ENTERPRISE (CONTACT SALES)', false, ''],
  ['Google Flow', 'google-flow', 'Google LLC', 'video-audio', 'public-data-only', 'GOOGLE AI ULTRA', false, ''],
  ['Google NotebookLM', 'google-notebooklm', 'Google', 'productivity-agents', 'business-ready', 'ENTERPRISE', false, 'assets/logos/notebooklm.png'],
  ['Grammarly', 'grammarly', 'Grammarly', 'writing', 'internal-work-only', 'ENTERPRISE', false, 'assets/logos/grammarly.png'],
  ['Granola', 'granola', 'Granola, Inc.', 'productivity-agents', 'internal-work-only', 'ENTERPRISE', false, ''],
  ['Hemingway Editor', 'hemingway-editor', 'Boondoggle Studio, LLC', 'writing', 'public-data-only', 'PLUS INDIVIDUAL 10K', false, ''],
  ['HeyGen', 'heygen', 'HeyGen', 'video-audio', 'business-ready', 'ENTERPRISE', false, 'assets/logos/heygen.png'],
  ['Hugging Face', 'hugging-face', 'Hugging Face', 'code-dev', 'public-data-only', 'ENTERPRISE', false, 'assets/logos/hugging-face.png'],
  ['jam.dev', 'jam-dev', 'Jam', 'productivity-agents', 'business-ready', 'ENTERPRISE', false, 'assets/logos/jam-dev.png'],
  ['Julius AI', 'julius-ai', 'Caesar Labs, Inc.', 'productivity-agents', 'business-ready', 'ENTERPRISE', false, 'assets/logos/julius.png'],
  ['Kling AI', 'kling-ai', 'Kuaishou Technology', 'video-audio', 'unsafe', 'ULTRA', false, 'assets/logos/kling-ai.png'],
  ['Krea', 'krea', 'Krea', 'image', 'public-data-only', 'ENTERPRISE', false, 'assets/logos/krea.png'],
  ['Landbot', 'landbot', 'Hello Umi, S.L.', 'chat-search', 'public-data-only', 'BUSINESS', false, 'assets/logos/landbot.png'],
  ['LanguageTool', 'languagetool', 'LanguageTooler GmbH', 'writing', 'public-data-only', 'TEAMS', false, ''],
  ['Lovable', 'lovable', 'Lovable', 'code-dev', 'public-data-only', 'ENTERPRISE', true, 'assets/logos/lovable.png'],
  ['Magic Patterns', 'magic-patterns', 'Magic Patterns', 'code-dev', 'business-ready', 'ENTERPRISE', false, ''],
  ['Magnific', 'magnific', 'Magnific', 'image', 'public-data-only', 'ENTERPRISE', false, ''],
  ['Manus', 'manus', 'Manus', 'productivity-agents', 'unsafe', 'TEAM', true, ''],
  ['Meta AI', 'meta-ai', 'Meta Platforms, Inc.', 'chat-search', 'public-data-only', 'META ONE PREMIUM', false, ''],
  ['Microsoft Copilot', 'microsoft-copilot', 'Microsoft', 'productivity-agents', 'business-ready', 'MICROSOFT 365 COPILOT', true, 'assets/logos/microsoft-copilot.png'],
  ['Microsoft Designer', 'microsoft-designer', 'Microsoft', 'image', 'public-data-only', 'MICROSOFT 365 PREMIUM', false, ''],
  ['Microsoft Security Copilot', 'microsoft-security-copilot', 'Microsoft', 'productivity-agents', 'internal-work-only', 'OVERAGE SCU', true, ''],
  ['Midjourney', 'midjourney', 'Midjourney', 'image', 'public-data-only', 'ENTERPRISE', false, 'assets/logos/midjourney.png'],
  ['Murf AI', 'murf-ai', 'Murf Inc.', 'video-audio', 'public-data-only', 'ENTERPRISE', false, ''],
  ['MXSPEECH', 'mxspeech', 'MXSPEECH', 'video-audio', 'public-data-only', 'ULTIMATE', false, ''],
  ['OpenAI API', 'openai-api', 'OpenAI', 'code-dev', 'business-ready', 'SCALE TIER', false, ''],
  ['OpenRouter', 'openrouter', 'OpenRouter, Inc.', 'code-dev', 'public-data-only', 'ENTERPRISE', false, ''],
  ['Otter.ai', 'otter-ai', 'Otter.ai', 'video-audio', 'internal-work-only', 'ENTERPRISE', false, 'assets/logos/otter-ai.png'],
  ['Paradox', 'paradox', 'Paradox', 'productivity-agents', 'public-data-only', 'ENTERPRISE', true, ''],
  ['Pepper Content', 'pepper-content', 'Pepper Content Private Limited', 'writing', 'public-data-only', 'ENTERPRISE (CUSTOM / BOOK A DEMO)', false, ''],
  ['Perplexity AI', 'perplexity-ai', 'Perplexity AI', 'chat-search', 'business-ready', 'ENTERPRISE MAX', true, 'assets/logos/perplexity.png'],
  ['Pixelcut', 'pixelcut', 'Pixelcut Inc', 'image', 'public-data-only', 'BUSINESS', false, ''],
  ['Pixlr', 'pixlr', 'Pixlr Pte. Ltd.', 'image', 'public-data-only', 'ULTRA MAX', false, ''],
  ['PopAi', 'popai', '01.AI', 'productivity-agents', 'unsafe', 'UNLIMITED', false, ''],
  ['Privado', 'privado', 'Privado Inc', 'productivity-agents', 'public-data-only', 'PRIVACY MANAGEMENT PLATFORM', false, ''],
  ['Quiq', 'quiq', 'Quiq', 'productivity-agents', 'business-ready', 'ENTERPRISE', true, ''],
  ['Quizlet', 'quizlet', 'Quizlet, Inc.', 'productivity-agents', 'unsafe', 'QUIZLET PLUS', false, ''],
  ['Read AI', 'read-ai', 'Read AI, Inc.', 'productivity-agents', 'internal-work-only', 'ENTERPRISE+', false, ''],
  ['ReadSpeaker', 'readspeaker', 'ReadSpeaker AB', 'video-audio', 'business-ready', 'CUSTOM VOICE & VOICE CLONING', false, ''],
  ['Runway', 'runway', 'Runway', 'video-audio', 'public-data-only', 'ENTERPRISE', false, 'assets/logos/runway.png'],
  ['Simplified', 'simplified', 'TLDR Technologies, Inc.', 'productivity-agents', 'public-data-only', 'ENTERPRISE', false, ''],
  ['Speechify', 'speechify', 'Speechify, Inc.', 'video-audio', 'public-data-only', 'STUDIO CREATOR', false, ''],
  ['Stability AI', 'stability-ai', 'Stability AI Ltd', 'image', 'public-data-only', 'ENTERPRISE LICENSE', false, ''],
  ['Synthesia', 'synthesia', 'Synthesia Limited', 'video-audio', 'business-ready', 'ENTERPRISE', false, 'assets/logos/synthesia.png'],
  ['Synthesys', 'synthesys', 'Nouveau Media Ltd', 'video-audio', 'public-data-only', 'ENTERPRISE', false, ''],
  ['Topaz Labs', 'topaz-labs', 'Topaz Labs', 'image', 'business-ready', 'ENTERPRISE', false, ''],
  ['Turbologo', 'turbologo', 'Turbologo LLC', 'image', 'public-data-only', 'BUSINESS', false, ''],
  ['Upscale.media', 'upscale-media', 'Shopsense Retail Technologies Limited', 'image', 'public-data-only', 'ENTERPRISE', false, ''],
  ['UX Pilot', 'ux-pilot', 'UX Pilot Inc.', 'productivity-agents', 'public-data-only', 'TEAMS', false, ''],
  ['v0', 'v0', 'Vercel', 'code-dev', 'public-data-only', 'ENTERPRISE', true, ''],
  ['Vidnoz AI', 'vidnoz-ai', 'Wise Reward Limited', 'video-audio', 'unsafe', 'ENTERPRISE', false, ''],
  ['Voicemod', 'voicemod', 'Voicemod, Inc., Sucursal en España', 'video-audio', 'public-data-only', 'PRO', false, ''],
  ['Windsurf', 'windsurf', 'Windsurf', 'code-dev', 'business-ready', 'ENTERPRISE', true, ''],
  ['Wondershare Filmora', 'wondershare-filmora', 'Shenzhen Wondershare Software Co., Ltd.', 'video-audio', 'unsafe', 'EDUCATION / STUDENT', false, ''],
  ['Writesonic', 'writesonic', 'Writesonic, Inc.', 'writing', 'business-ready', 'ENTERPRISE', false, 'assets/logos/writesonic.png'],
  ['Yellow.ai', 'yellow-ai', 'Yellow.ai', 'productivity-agents', 'public-data-only', 'ENTERPRISE', true, ''],
  ['You.com', 'you-com', 'SuSea, Inc.', 'chat-search', 'public-data-only', 'ENTERPRISE', false, ''],
]; 

/* Known plan ladders (from the search data the mockup already had) — everything else gets a generated ladder */
const LADDERS = {
  'chatgpt': ['Free', 'Go', 'Plus', 'Pro', 'Business', 'Enterprise'],
  'claude': ['Free', 'Pro', 'Max', 'Team', 'Enterprise'],
  'gemini': ['Free', 'AI Pro', 'Business', 'Workspace Enterprise'],
  'microsoft-copilot': ['Free', 'Microsoft 365 Premium', 'Microsoft 365 Copilot Chat', 'Microsoft 365 Copilot Business', 'Microsoft 365 Copilot'],
  'deepseek': ['Free', 'API (pay-as-you-go)'],
  'midjourney': ['Basic', 'Standard', 'Pro', 'Mega'],
  'adobe-firefly': ['Premium', 'Enterprise'],
  'perplexity-ai': ['Free', 'Pro', 'Enterprise Pro'],
  'grammarly': ['Free', 'Pro', 'Enterprise'],
  'github-copilot': ['Individual', 'Business', 'Enterprise'],
  'runway': ['Free', 'Pro', 'Enterprise'],
  'google-notebooklm': ['Free', 'Workspace Enterprise']
};
const NON_US = { 'deepseek': ['CN', 1], 'ernie-bot-baidu': ['CN', 1], 'kling-ai': ['CN', 1], 'wondershare-filmora': ['CN', 1], 'fotor': ['CN', 1], 'popai': ['CN', 1], 'vidnoz-ai': ['HK', 1],
  'beyondwords': ['UK'], 'synthesia': ['UK'], 'stability-ai': ['UK'], 'synthesys': ['UK'], 'flexclip': ['HK'], 'landbot': ['ES'], 'voicemod': ['ES'], 'languagetool': ['DE'], 'readspeaker': ['SE'], 'cohere': ['CA'], 'pepper-content': ['IN'], 'upscale-media': ['IN'], 'pixlr': ['SG'], 'glia-cloud': ['TW'], 'gliacloud': ['TW'], 'freeconvert': ['US'], 'ai-image-enlarger': ['US', 0], 'elevenlabs': ['US'], 'sparklightforce': ['US'] };
const WORD_KEEP = new Set(['AI', 'API', 'SCU', 'SLA', 'UX']);
const titleCase = (s) => s.toLowerCase().replace(/\b[a-z0-9][a-z0-9+.]*/g, (w) => (WORD_KEEP.has(w.toUpperCase()) ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1)));

function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
const span = (seed, lo, hi) => lo + (hash(seed) % (hi - lo + 1));

const NOTES = {
  security: { 'business-ready': 'SSO, audit logs and independent certifications', 'internal-work-only': 'Encryption and testing; certifications partly disclosed', 'public-data-only': 'Encryption, testing and certifications', unsafe: 'Few security controls are disclosed' },
  transparency: 'How clearly practices are documented'
};

function buildTiers(row) {
  const [name, slug, , type, verdict, plan] = row;
  const top = (LADDERS[slug] && LADDERS[slug][LADDERS[slug].length - 1]) || titleCase(plan);
  let ladder = LADDERS[slug];
  if (!ladder) {
    const lower = top.toLowerCase();
    ladder = [];
    if (verdict !== 'unsafe' || lower !== 'free') ladder.push('Free');
    if (!/^(free|pro|plus|premium|pilot|team|teams)\b/.test(lower) && type !== 'video-audio' && ladder.length) ladder.push(type === 'code-dev' ? 'Pro' : 'Plus');
    if (/enterprise/.test(lower) && type !== 'image' && ladder.length > 1) ladder.splice(ladder.length, 0, 'Business');
    ladder.push(top);
    ladder = [...new Set(ladder)];
  }
  const n = ladder.length;
  return ladder.map((label, i) => {
    // verdict climbs towards the rating of the top plan: lower plans are one step lower (never below Public Data Only unless the tool is Unsafe)
    const steps = n - 1 - i;
    let v = verdict;
    if (verdict === 'business-ready' && steps >= 1) v = steps >= 2 || n <= 3 ? 'public-data-only' : 'internal-work-only';
    else if (verdict === 'internal-work-only' && steps >= 1) v = 'public-data-only';
    const seed = slug + ':' + label;
    const base = { 'business-ready': [7, 9, 'never'], 'internal-work-only': [6, 8, 'opt-in'], 'public-data-only': [4, 6, 'opt-out'], unsafe: [1, 4, 'always'] }[v];
    const security = Math.min(10, span(seed + 's', base[0], base[1]));
    const transparency = Math.min(10, span(seed + 't', Math.max(1, base[0] - (v === 'unsafe' ? 0 : 1)), Math.min(10, base[1] + 1)));
    const country = NON_US[slug] || ['US', 0];
    return { label, verdict: v, security, transparency, training: base[2], location: country[1] ? 'concern' : 'safe', country: country[0],
      notes: { security: NOTES.security[v], transparency: NOTES.transparency, training: 'Does it train its AI on what you type?', location: country[1] ? 'Data may be accessed under local law' : 'No jurisdiction concerns' } };
  });
}

export const TOOLS_DB = ROWS.map((row) => {
  const [name, slug, vendor, type, verdict, plan, agentic, logo] = row;
  const initials = name.replace(/\(.*?\)/g, '').split(/[\s.]+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || name[0].toUpperCase();
  const tiers = buildTiers(row);
  return { name, slug, vendor, type, typeLabel: TYPE_LABELS[type], verdict, verdictLabel: VERDICT_LABELS[verdict], plan, agentic, logo, initials, tiers,
    description: DESCRIBE(name, type, vendor) };
});

function DESCRIBE(name, type, vendor) {
  const d = { 'chat-search': 'AI assistant for conversation, research and search.', 'writing': 'AI writing and editing assistant.', 'image': 'AI image generation and editing.', 'video-audio': 'AI video, voice and audio creation.', 'code-dev': 'AI tooling for developers and builders.', 'productivity-agents': 'AI assistant for work: notes, slides, agents and automation.' };
  return d[type];
}
export const toolBySlug = (slug) => TOOLS_DB.find((t) => t.slug === slug);
export const relatedTo = (tool, n = 4) => TOOLS_DB.filter((t) => t.type === tool.type && t.slug !== tool.slug).sort((a, b) => (RANK[b.verdict] - RANK[a.verdict]) || a.name.localeCompare(b.name)).slice(0, n);
