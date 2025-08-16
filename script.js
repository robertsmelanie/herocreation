// ===== Utility: seeded RNG (Mulberry32) so seed produces deterministic heroes =====
function xmur3(str) {
    let h = 1779033703 ^ str.length; for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); } return () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); h ^= h >>> 16; return h >>> 0; };
}
function mulberry32(a) { return function () { let t = a += 0x6D2B79F5; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; } }
function seeded(seed) { return mulberry32(xmur3(seed)()); }

// ===== Data banks =====
const WORDS = {
    colors: ["Crimson", "Azure", "Emerald", "Violet", "Golden", "Obsidian", "Ivory", "Cobalt", "Scarlet", "Neon", "Silver", "Amber", "Sable", "Celestial", "Solar", "Lunar"],
    adjectives: ["Quantum", "Phantom", "Thunder", "Shadow", "Nova", "Iron", "Arc", "Echo", "Sonic", "Radiant", "Storm", "Star", "Hyper", "Night", "Solar", "Blaze", "Turbo", "Oracle", "Omega", "Vortex", "Mythic", "Nebula", "Cyber", "Aether"],
    nouns: ["Guardian", "Specter", "Sentinel", "Ranger", "Fury", "Paladin", "Warden", "Tempest", "Bolt", "Viper", "Titan", "Blade", "Wing", "Flux", "Surge", "Sprite", "Monarch", "Cipher", "Phoenix", "Revenant", "Ward", "Knight", "Spark"],
    villainTitles: ["Doctor", "Baron", "Count", "Overlord", "Master", "Duchess", "Prime", "Queen", "Lord", "Archon"],
    places: ["New Avalon", "Neo Harbor", "Starfall City", "Ironbridge", "Eclipse Bay", "Vanta Heights", "Aurora Point", "Hollow Reach", "Skyline District", "Arcadia"],
    techPowers: ["exo-armor with adaptive shielding", "railgun fists and drone swarm control", "nanobot reconstruction and morphing", "quantum teleport beacons", "gravity boots and singularity grenades", "neuro-link hacking and hardlight constructs"],
    magicPowers: ["elemental conjuration and rune casting", "time-loop hexes and mirror portals", "spirit binding and astral projection", "blood sigils and shadow familiars", "lightweaving and sanctified wards", "chaos magic and curse weaving"],
    mutantPowers: ["bioelectric discharge and feral agility", "bone plating with rapid regeneration", "psionic surge and mind shielding", "chameleonic skin and elastic limbs", "pheromone command and toxin immunity", "kinetic absorption and shockwave release"],
    alienPowers: ["starseed metamorph and cosmic breath", "voidstep wings and telepathy", "solar flare manipulation and plasma shaping", "gravity warping antennae", "photonic skin and vacuum glide", "dark-matter siphoning"],
    cosmicPowers: ["reality thread pulling and fate tuning", "constellation forging and comet rides", "black hole fingertips", "quasar lances and nebula cloaks", "chronal drift and superposition dodge"],
    martialPowers: ["pressure-point mastery and impossible parkour", "whip-chain artistry and smoke veil", "silent katana and bullet time focus", "mythic archery and wind steps", "shield-fu and ricochet tactics"],
    gadgetPowers: ["endless utility orbs and grapnel web", "pocket portal disks and holo decoys", "power gauntlet toolkit", "smart cape with auto-glide and stealth mesh", "micro-sentry network"],
    catchTemplates: [
        "I am {name}, and this city is under my watch.",
        "Justice isn’t a hobby—it’s my operating system.",
        "From {place} to the stars—hope never falls!",
        "Bad news, {nemesis}. I brought backup: me.",
        "I don’t break rules. I rewrite them.",
        "When the night screams, I answer.",
        "Forged in {place}, destined for legend.",
        "The future called. It asked for mercy.",
        "Villains run on fear. I cut the power.",
        "By light or by shadow, I end this."],
    costumeThemes: [
        "sleek neon lines, dark synthwave palette, visor helm",
        "mystic robes with luminous sigils, raven feathers",
        "tactical stealth suit, hex-panel armor, hooded cloak",
        "retro spandex with bold emblem and cape",
        "bioluminescent plating, iridescent edges, no cape",
        "streetwear armor: bomber jacket, reinforced gloves",
        "ceremonial armor with comet motifs, flowing sash",
        "desert nomad wrappings, goggles, layered pauldrons",
        "hardlight mantle and modular gauntlets",
        "eco-tech grown armor, leaf filigree, living cape"
    ]
};

const POWER_BANK = {
    tech: WORDS.techPowers, magic: WORDS.magicPowers, mutant: WORDS.mutantPowers,
    alien: WORDS.alienPowers, cosmic: WORDS.cosmicPowers, martial: WORDS.martialPowers,
    gadgeteer: WORDS.gadgetPowers
};

const ALIGN_COLORS = {
    hero: ["#6ee7ff", "#22c55e"],
    antihero: ["#f59e0b", "#8b5cf6"],
    villain: ["#ef4444", "#8b5cf6"]
};

// ===== Helpers =====
function pick(arr, rng) { return arr[Math.floor(rng() * arr.length)] }
function chance(p, rng) { return rng() < p }
function titleCase(str) { return str.replace(/\b(\w)/g, s => s.toUpperCase()) }
function slugify(str) { return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }

function makeName(rng, align) {
    const pattern = rng() < .5 ? "The {adj} {noun}" : "{color} {noun}";
    let adj = pick(WORDS.adjectives, rng), color = pick(WORDS.colors, rng), noun = pick(WORDS.nouns, rng);
    if (align === 'villain' && rng() < .6) { adj = ["Sinister", "Savage", "Vile", "Ruinous", "Malevolent", "Grim"][Math.floor(rng() * 6)]; }
    if (align === 'hero' && rng() < .5) { adj = ["Valiant", "Noble", "Gallant", "Radiant", "True"][Math.floor(rng() * 5)]; }
    if (align === 'antihero' && rng() < .5) { adj = ["Rogue", "Grey", "Lone", "Brooding", "Wayward"][Math.floor(rng() * 5)]; }
    return pattern.replace('{adj}', adj).replace('{color}', color).replace('{noun}', noun);
}

function makePowers(rng, type) {
    if (type === 'any') { const keys = Object.keys(POWER_BANK); type = pick(keys, rng); }
    return { type, text: pick(POWER_BANK[type], rng) };
}

function makeNemesis(rng, heroName) {
    const title = pick(WORDS.villainTitles, rng);
    const noun = pick(WORDS.nouns, rng);
    const adj = pick(WORDS.adjectives, rng);
    let name = `${title} ${adj} ${noun}`;
    if (slugify(name) === slugify(heroName)) name = `${title} ${noun}`; // avoid exact collision
    return name;
}

function makeOrigin(rng, place, type, align, notes) {
    const templates = [
        `Born in ${place}, ${align === 'villain' ? 'twisted by' : 'forged by'} ${type} forces, they unlocked ${pick(POWER_BANK[type] || [], rng) || 'impossible potential'} after a night the sky split open.`,
        `A ${type} accident in ${place} rewrote their fate; vows were made in the rubble, and a symbol was chosen.`,
        `Raised in the alleys of ${place}, they bargained with destiny and paid in scars—now power answers when they call.`,
        `On the run from shadows in ${place}, they found a relic that would never stop whispering.`,
        `Mentored in secret beneath ${place}'s old tunnels, they trained until fear learned their name.`
    ];
    let base = pick(templates, rng);
    if (notes && notes.trim()) base += ` They carry a reminder: ${notes.trim()}.`;
    return base;
}

function makeCatchphrase(rng, name, place, nemesis) {
    const t = pick(WORDS.catchTemplates, rng)
        .replace('{name}', name)
        .replace('{place}', place)
        .replace('{nemesis}', nemesis);
    return t;
}

function makeCostume(rng) { return pick(WORDS.costumeThemes, rng); }

function makePlace(rng) { return pick(WORDS.places, rng); }

function randomAlignment(rng) { return pick(['hero', 'antihero', 'villain'], rng); }

function pickAlignmentTag(align) {
    const el = document.getElementById('alignmentTag');
    el.classList.remove('align-hero', 'align-antihero', 'align-villain');
    el.classList.add(`align-${align}`);
    el.textContent = `Alignment: ${titleCase(align)}`;
}

// ===== Core generation =====
function generateHero(opts = {}) {
    const { seed, powerType = 'any', alignment = 'any', notes = '' } = opts;
    const rng = seed ? seeded(seed) : Math.random;

    const align = alignment === 'any' ? randomAlignment(rng) : alignment;
    const place = makePlace(rng);
    const name = makeName(rng, align);
    const pow = makePowers(rng, powerType);
    const nemesis = makeNemesis(rng, name);
    const origin = makeOrigin(rng, place, pow.type, align, notes);
    const catchphrase = makeCatchphrase(rng, name, place, nemesis);
    const costume = makeCostume(rng);

    return { name, alignment: align, powerType: pow.type, powers: pow.text, nemesis, origin, catchphrase, costume, place, seed };
}

// ===== Rendering to DOM =====
function renderHero(hero) {
    document.getElementById('heroName').textContent = hero.name;
    pickAlignmentTag(hero.alignment);
    document.getElementById('typeTag').textContent = `Type: ${titleCase(hero.powerType)}`;
    document.getElementById('powers').textContent = titleCase(hero.powers);
    document.getElementById('nemesis').textContent = hero.nemesis;
    document.getElementById('origin').textContent = hero.origin;
    document.getElementById('catchphrase').textContent = `“${hero.catchphrase}”`;
    document.getElementById('costume').textContent = titleCase(hero.costume);

    localStorage.setItem('heroforge:last', JSON.stringify(hero));
    updateStatus('Generated hero.');
}

// ===== Copy & Share =====
function heroToText(hero) {
    return `Hero Name: ${hero.name}\nAlignment: ${titleCase(hero.alignment)}\nPower Type: ${titleCase(hero.powerType)}\nPowers: ${hero.powers}\nOrigin: ${hero.origin}\nNemesis: ${hero.nemesis}\nCatchphrase: ${hero.catchphrase}\nCostume Theme: ${hero.costume}`;
}
async function copyAll(hero) {
    const text = heroToText(hero);
    await navigator.clipboard.writeText(text);
    updateStatus('Copied to clipboard.');
}
async function copyJSON(hero) {
    await navigator.clipboard.writeText(JSON.stringify(hero, null, 2));
    updateStatus('JSON copied.');
}
async function shareHero(hero) {
    const text = heroToText(hero);
    const url = buildPermalink(hero);
    if (navigator.share) {
        try { await navigator.share({ title: `${hero.name} – HeroForge AI`, text, url }); }
        catch (e) { console.warn(e); }
    } else {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        updateStatus('Share API not supported. Copied text+link');
    }
}

// ===== Permalink =====
function buildPermalink(hero) {
    const payload = btoa(unescape(encodeURIComponent(JSON.stringify(hero))));
    const base = location.origin + location.pathname;
    return `${base}#data=${payload}`;
}
function parsePermalink() {
    const m = location.hash.match(/data=([^&]+)/);
    if (!m) return null;
    try { return JSON.parse(decodeURIComponent(escape(atob(m[1])))); }
    catch (e) { console.warn('Permalink parse failed', e); return null; }
}

// ===== Canvas Card Renderer (no external libs) =====
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' '); let line = ''; let yy = y; const lines = [];
    for (let n = 0; n < words.length; n++) {
        const test = line + words[n] + ' ';
        const w = ctx.measureText(test).width;
        if (w > maxWidth && n > 0) { lines.push(line.trim()); line = words[n] + ' '; yy += lineHeight; }
        else line = test;
    }
    lines.push(line.trim());
    lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight));
    return y + (lines.length - 1) * lineHeight;
}

function pickEmoji(type) {
    const map = { tech: '🤖', magic: '🪄', mutant: '🧬', alien: '👽', cosmic: '🌌', martial: '🥷', gadgeteer: '🧰' };
    return map[type] || '🦸';
}

function drawCardCanvas(hero, sizeStr) {
    const [w, h] = sizeStr.split('x').map(n => parseInt(n, 10));
    const canvas = document.getElementById('cardCanvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');

    // Background gradient based on alignment
    const [c1, c2] = ALIGN_COLORS[hero.alignment] || ['#6ee7ff', '#8b5cf6'];
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, c1);
    grad.addColorStop(1, c2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Subtle dark overlay for readability
    const overlay = ctx.createLinearGradient(0, 0, 0, h);
    overlay.addColorStop(0, 'rgba(0,0,20,0.25)');
    overlay.addColorStop(1, 'rgba(0,0,20,0.55)');
    ctx.fillStyle = overlay; ctx.fillRect(0, 0, w, h);

    // Frame
    const pad = Math.round(w * 0.06);
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = Math.max(4, Math.round(w * 0.004));
    ctx.strokeRect(pad / 2, pad / 2, w - pad, h - pad);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 12;
    ctx.font = `700 ${Math.round(w * 0.07)}px system-ui, -apple-system, Segoe UI, Roboto`;
    const title = hero.name;
    ctx.fillText(title, pad, pad + Math.round(w * 0.09));

    // Sub tags
    ctx.shadowBlur = 0;
    ctx.font = `600 ${Math.round(w * 0.03)}px system-ui`;
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    const tag = `${pickEmoji(hero.powerType)}  ${titleCase(hero.powerType)}  •  ${titleCase(hero.alignment)}`;
    ctx.fillText(tag, pad, pad + Math.round(w * 0.13));

    // Sections
    let y = pad + Math.round(w * 0.18);
    const x = pad;
    const lineH = Math.round(w * 0.038);

    function section(label, text) {
        ctx.font = `800 ${Math.round(w * 0.032)}px system-ui`; ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.fillText(label.toUpperCase(), x, y);
        y += Math.round(w * 0.025);
        ctx.font = `500 ${Math.round(w * 0.035)}px system-ui`; ctx.fillStyle = 'rgba(255,255,255,0.98)';
        y = wrapText(ctx, text, x, y, w - pad * 2, lineH) + lineH;
    }

    section('Powers', titleCase(hero.powers));
    section('Origin', hero.origin);
    section('Nemesis', hero.nemesis);
    section('Catchphrase', '“' + hero.catchphrase + '”');
    section('Costume', titleCase(hero.costume));

    // Footer
    ctx.font = `600 ${Math.round(w * 0.028)}px system-ui`;
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    const footer = `Made with HeroForge AI • ${new Date().getFullYear()}`;
    ctx.fillText(footer, pad, h - pad / 2);
}

// ===== UI Wiring =====
const $ = (id) => document.getElementById(id);
const state = { hero: null };
function updateStatus(msg) { $('status').textContent = msg; }

function getInputs() {
    const powerType = $('powerType').value;
    const alignment = $('alignment').value;
    const seedRaw = $('customSeed').value.trim();
    const notes = $('notes').value;
    const seed = seedRaw || `${powerType}-${alignment}-${Math.random().toString(36).slice(2, 8)}`;
    return { powerType, alignment, seed, notes };
}

function doGenerate(fromPermalink) {
    const inputs = getInputs();
    const hero = fromPermalink || generateHero(inputs);
    state.hero = hero;
    renderHero(hero);
    drawCardCanvas(hero, $('cardSize').value);
    history.replaceState(null, '', buildPermalink(hero));
}

// ===== Buttons =====
$('btn-generate').addEventListener('click', () => doGenerate());
$('btn-reroll-all').addEventListener('click', () => doGenerate());
$('btn-reroll-name').addEventListener('click', () => { if (!state.hero) return doGenerate(); state.hero.name = makeName(Math.random, state.hero.alignment); renderHero(state.hero); drawCardCanvas(state.hero, $('cardSize').value); updateStatus('Rerolled name.'); });
$('btn-reroll-power').addEventListener('click', () => { if (!state.hero) return doGenerate(); const p = makePowers(Math.random, $('powerType').value === 'any' ? state.hero.powerType : $('powerType').value); state.hero.powerType = p.type; state.hero.powers = p.text; renderHero(state.hero); drawCardCanvas(state.hero, $('cardSize').value); updateStatus('Rerolled powers.'); });

$('btn-copy').addEventListener('click', () => state.hero && copyAll(state.hero));
$('btn-copy-json').addEventListener('click', () => state.hero && copyJSON(state.hero));
$('btn-share').addEventListener('click', () => state.hero && shareHero(state.hero));
$('btn-permalink').addEventListener('click', () => { if (!state.hero) return; const url = buildPermalink(state.hero); navigator.clipboard.writeText(url); updateStatus('Permalink copied to clipboard.'); });
$('btn-reset').addEventListener('click', () => {
    localStorage.removeItem('heroforge:last'); location.hash = ''; state.hero = null;['heroName', 'powers', 'nemesis', 'origin', 'catchphrase', 'costume'].forEach(id => $(id).textContent = '—'); $('alignmentTag').textContent = 'Alignment: —'; $('typeTag').textContent = 'Type: —'; updateStatus('Reset.');
});
$('cardSize').addEventListener('change', () => { if (state.hero) drawCardCanvas(state.hero, $('cardSize').value); });
$('powerType').addEventListener('change', () => updateStatus('Power type set to ' + $('powerType').value));
$('alignment').addEventListener('change', () => updateStatus('Alignment set to ' + $('alignment').value));
$('btn-download').addEventListener('click', () => {
    if (!state.hero) return doGenerate();
    const link = document.createElement('a');
    const canvas = $('cardCanvas');
    link.href = canvas.toDataURL('image/png');
    link.download = slugify(state.hero.name) + '-card.png';
    link.click();
    updateStatus('Downloaded PNG card.');
});

// Keyboard shortcuts
window.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;
    if (e.key.toLowerCase() === 'g') { e.preventDefault(); doGenerate(); }
    if (e.key.toLowerCase() === 'c') { e.preventDefault(); state.hero && copyAll(state.hero); }
    if (e.key.toLowerCase() === 's') { e.preventDefault(); $('btn-download').click(); }
});

// ===== Boot: load permalink or localStorage or first generate =====
(function init() {
    const fromLink = parsePermalink();
    if (fromLink) { renderHero(fromLink); state.hero = fromLink; drawCardCanvas(fromLink, $('cardSize').value); updateStatus('Loaded from link.'); return; }
    const stored = localStorage.getItem('heroforge:last');
    if (stored) { try { const hero = JSON.parse(stored); state.hero = hero; renderHero(hero); drawCardCanvas(hero, $('cardSize').value); updateStatus('Loaded last hero.'); return; } catch { } }
    doGenerate();
})();