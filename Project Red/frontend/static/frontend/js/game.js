// Enhanced fishing game with progression and rarity influenced by store inventory
let count = parseInt(localStorage.getItem('castCount')) || 0;
let coins = parseInt(localStorage.getItem('fishCoins')) || 0;

const counterDisplay = document.getElementById('counter');
const castButton = document.getElementById('castButton');
const coinsDisplay = document.getElementById('coins') || createCoinsDisplay();
const streakEl = document.getElementById('streak');
const progressBar = document.getElementById('rewardProgress');
const progressLabel = document.getElementById('progressLabel');
const fishyTitle = document.querySelector('.game-title .fishy');
const fishyNameEl = document.getElementById('fishyName');

// Dynamic game title picker (avoids immediate repeats)
function pickGameTitle() {
    const options = [
        'Hooked on Chaos',
        'Reel Reaction',
        'Bite & Byte',
        'Cast of Mayhem',
        'Fish & Glitch',
        'Reely Annoying',
        'The One That Clicked Away',
        'Tug of Warters',
        'Baited Breath',
        'Click & Tackle'
    ];
    const last = localStorage.getItem('gameTitleLast') || '';
    let pick = options[Math.floor(Math.random() * options.length)];
    if (options.length > 1) {
        let guard = 0;
        while (pick === last && guard < 5) {
            pick = options[Math.floor(Math.random() * options.length)];
            guard++;
        }
    }
    localStorage.setItem('gameTitleLast', pick);
    return pick;
}

if (fishyNameEl) {
    fishyNameEl.textContent = pickGameTitle();
}

// if the subtract & reset buttons are wanted, go to game.html & uncomment lines 21-25
const decrementButton = document.getElementById('subtractButton');
const resetButton = document.getElementById('resetButton');
const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Create coins display if it doesn't exist
function createCoinsDisplay() {
    const display = document.createElement('div');
    display.id = 'coins';
    display.textContent = `Coins: ${coins}`;
    display.style.cssText = 'position: fixed; top: 10px; right: 10px; background: #0a8be0; color: white; padding: 10px; border-radius: 5px; font-weight: bold;';
    document.body.appendChild(display);
    return display;
}

// Update coins display
function updateCoinsDisplay() {
    coinsDisplay.textContent = `Coins: ${coins}`;
    localStorage.setItem('fishCoins', coins);
}

// Consolidated in-card message system
function setGameMessage(message, type = 'info') {
    const box = document.getElementById('gameMessage');
    if (!box) return;
    box.className = 'game-message show ' + type;
    box.textContent = message;
}

// Progression and rarity system
function getInventory() {
    try {
        return JSON.parse(localStorage.getItem('fishingInventory')) || [];
    } catch { return []; }
}

function hasItem(id) {
    const inv = getInventory();
    return inv.some(i => i.id === id && i.quantity > 0);
}

function getItemCount(id) {
    const inv = getInventory();
    const it = inv.find(i => i.id === id);
    return it ? it.quantity : 0;
}

function computePlayerStats() {
    // Base stats
    let catchChance = 0.25; // 25% base chance to catch
    const rarityWeights = { common: 70, uncommon: 20, rare: 8, epic: 1.9, legendary: 0.1 };
    let coinMultiplier = 1.0;

    // Map store upgrades to effects
    const magicWorms = getItemCount(1);       // rare boost
    const crystalLures = getItemCount(2);     // catch rate boost
    const rainbowFlies = getItemCount(3);     // epic/legendary boost
    const woodenRod = getItemCount(4);
    const steelRod = getItemCount(5);
    const mysticRod = getItemCount(6);
    const luckBooster = getItemCount(8);
    const speedEnhancer = getItemCount(9);    // not directly used yet
    const luckyAnchor = getItemCount(11);     // small luck boost

    // Catch chance bonuses
    catchChance += crystalLures * 0.07;      // +7% per Crystal Lure
    catchChance += luckBooster * 0.15;       // +15% per Luck Booster
    catchChance += luckyAnchor * 0.02;       // +2% per Lucky Anchor
    catchChance = Math.min(0.85, catchChance); // cap to avoid guaranteed catch

    // Rarity adjustments (multiplicative on weights)
    const rw = { ...rarityWeights };
    if (magicWorms > 0) {
        rw.rare *= (1 + 0.15 * magicWorms);
        rw.epic *= (1 + 0.08 * magicWorms);
        rw.legendary *= (1 + 0.02 * magicWorms);
    }
    if (rainbowFlies > 0) {
        rw.epic *= (1 + 0.2 * rainbowFlies);
        rw.legendary *= (1 + 0.05 * rainbowFlies);
    }
    if (mysticRod > 0) {
        rw.legendary *= 1.5; // Mystic rod favors legends
    }

    // Coin multiplier from best rod owned
    if (mysticRod > 0) coinMultiplier *= 1.3;
    else if (steelRod > 0) coinMultiplier *= 1.1;
    else if (woodenRod > 0) coinMultiplier *= 1.0;

    return { catchChance, rarityWeights: rw, coinMultiplier };
}

function sampleRarity(weights) {
    const entries = Object.entries(weights);
    const total = entries.reduce((s, [, w]) => s + w, 0);
    let r = Math.random() * total;
    for (const [k, w] of entries) {
        if ((r -= w) <= 0) return k;
    }
    return 'common';
}

const fishCatalog = {
    common: {
        names: ['Minnow', 'Puddle Bass', 'Tin Carp', 'Street Trout', 'Bubble Guppy', 'Pond Perch', 'Brook Stickleback'],
        coins: [1, 5]
    },
    uncommon: {
        names: ['Shimmer Perch', 'Spotty Pike', 'Neon Guppy', 'Copper Sunfish', 'Jade Barb', 'Amber Tetra'],
        coins: [4, 10]
    },
    rare: {
        names: ['Azure Snapper', 'Crystal Cod', 'Gilded Sunfish', 'Prism Angelfish', 'Sapphire Bass', 'Moonstone Trout'],
        coins: [10, 25]
    },
    epic: {
        names: ['Phantom Koi', 'Storm Barracuda', 'Crimson Swordfish', 'Void Shark', 'Thunder Pike'],
        coins: [25, 60]
    },
    legendary: {
        names: ['Mythic Leviathan', 'Golden Marlin', 'Celestial Dragon Fish', 'Prismatic Whale Shark', 'Astral Manta'],
        coins: [60, 150]
    }
};

function roll(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

// Simple seeded RNG for deterministic variant based on name + count
function hashString(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
    }
    return h >>> 0;
}

function seededRandom(seed) {
    let x = seed || 123456789;
    return () => {
        // xorshift32
        x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return ((x >>> 0) / 0xFFFFFFFF);
    };
}

function pick(arr, rnd) { return arr[Math.floor(rnd() * arr.length)]; }

// Fish generator and related functions removed

function updateStreakAndProgress() {
    if (streakEl) {
        streakEl.textContent = `Streak x${count}`;
        if (!reduceMotion) {
            streakEl.classList.remove('pulse');
            void streakEl.offsetWidth; // reflow to restart animation
            streakEl.classList.add('pulse');
        }
    }
    if (progressBar && progressLabel) {
        const goal = 10; // next bonus at 10 casts
        const pct = Math.min(100, Math.round((count % goal) / goal * 100));
        progressBar.style.width = pct + '%';
        const castsToGo = goal - (count % goal);
        progressLabel.textContent = castsToGo === 0 ? 'Bonus ready!' : `Next bonus at ${goal} casts (${castsToGo} to go)`;
    }
    localStorage.setItem('castCount', count);
}

// Flair: bubble trail near the button on cast
function spawnBubbles(x, y) {
    if (reduceMotion) return; // respect reduced motion
    const count = 4 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
        const b = document.createElement('span');
        b.className = 'bubble';
        const size = 6 + Math.random() * 10;
        b.style.cssText = `
            position: fixed;
            left: ${x + (Math.random() * 30 - 15)}px;
            top: ${y + (Math.random() * 10 - 5)}px;
            width: ${size}px; height: ${size}px;
            border-radius: 50%;
            background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(173,216,230,0.5));
            box-shadow: inset -2px -2px 6px rgba(255,255,255,0.8);
            opacity: 0.9;
            z-index: 80;
            pointer-events: none;`;
        document.body.appendChild(b);
        const dx = (Math.random() - 0.5) * 40;
        const dy = -60 - Math.random() * 80;
        const rot = (Math.random() - 0.5) * 30;
        b.animate([
            { transform: 'translate(0,0) scale(1) rotate(0deg)', opacity: 0.9 },
            { transform: `translate(${dx}px, ${dy}px) scale(0.7) rotate(${rot}deg)`, opacity: 0 }
        ], { duration: 1600 + Math.random() * 700, easing: 'ease-out', fill: 'forwards' });
        setTimeout(() => b.remove(), 2400);
    }
}

// Flair: occasional jumping fish near the title
function jumpFishNearTitle() {
    if (reduceMotion || !fishyTitle) return;
    const rect = fishyTitle.getBoundingClientRect();
    const f = document.createElement('span');
    f.setAttribute('aria-hidden', 'true');
    f.style.cssText = `
      position: fixed; left: ${rect.left + rect.width / 2}px; top: ${rect.top}px;
      width: 28px; height: 16px; z-index: 85; pointer-events: none;
      background: radial-gradient(circle at 30% 50%, #9fe1ff 0 35%, transparent 36%),
                  radial-gradient(circle at 60% 50%, #7fd4ff 0 40%, transparent 41%),
                  radial-gradient(circle at 95% 50%, #7fd4ff 0 25%, transparent 26%);
      border-radius: 10px 12px 12px 10px / 50% 60% 40% 50%;`;
    const tail = document.createElement('span');
    tail.style.cssText = `position:absolute; right:-8px; top:50%; width:0; height:0;
      border-top:8px solid transparent; border-bottom:8px solid transparent; border-left:10px solid #5fc7ff; transform: translateY(-50%);`;
    f.appendChild(tail);
    document.body.appendChild(f);
    f.animate([
        { transform: 'translate(-20px,0) rotate(-10deg)', opacity: 0 },
        { transform: 'translate(0,-30px) rotate(-20deg)', opacity: 1, offset: 0.4 },
        { transform: 'translate(20px,0) rotate(-10deg)', opacity: 0 }
    ], { duration: 1400, easing: 'ease-in-out', fill: 'forwards' });
    setTimeout(() => f.remove(), 1600);
}

// Fishing roll using progression and rarity
function startFishing() {
    const { catchChance, rarityWeights, coinMultiplier } = computePlayerStats();
    const rollCatch = Math.random();
    if (rollCatch > catchChance) {
        const missMsgs = [
            'Nothing bit this time…',
            'Ripples only. Try again!',
            'The fish swiped left.',
            'Something tugged… and fled.'
        ];
        setGameMessage(missMsgs[roll(0, missMsgs.length - 1)], 'info');
        return;
    }

    const rarity = sampleRarity(rarityWeights);
    const cat = fishCatalog[rarity];
    const name = cat.names[roll(0, cat.names.length - 1)];
    const base = roll(cat.coins[0], cat.coins[1]);
    const reward = Math.max(1, Math.round(base * coinMultiplier));
    coins += reward;
    updateCoinsDisplay();
    // Visual: coin fly-out trail to the coin counter
    try { spawnCoinFlyouts(reward); } catch { }
    if (coinsDisplay && !reduceMotion) {
        coinsDisplay.classList.remove('bump');
        void coinsDisplay.offsetWidth;
        coinsDisplay.classList.add('bump');
    }
    // Bump the cast button on success
    if (castButton && !reduceMotion) {
        castButton.classList.remove('btn-bump');
        void castButton.offsetWidth;
        castButton.classList.add('btn-bump');
        setTimeout(() => castButton.classList.remove('btn-bump'), 300);
    }
    const rarityLabel = rarity.charAt(0).toUpperCase() + rarity.slice(1);
    let type = 'success';
    if (rarity === 'rare') type = 'rare';
    else if (rarity === 'epic') type = 'epic';
    else if (rarity === 'legendary') type = 'legendary';
    setGameMessage(`${rarityLabel}! Caught ${name} +${reward} coins`, type);
    // Visual: celebratory banner on epic/legendary
    if (!reduceMotion && (rarity === 'epic' || rarity === 'legendary')) {
        try { showRarityBanner(rarity, name); } catch { }
    }

    // Fish preview generator removed — focus on pill and particles

    // Render catch display pill
    try {
        const cd = document.getElementById('catchDisplay');
        if (cd) {
            const emojiMap = {
                common: '🐟',
                uncommon: '🐠',
                rare: '🦈',
                epic: '🐡',
                legendary: '🐉'
            };
            const pill = document.createElement('div');
            pill.className = `catch-pill ${rarity}`;
            pill.innerHTML = `
              <span class="catch-emoji">${emojiMap[rarity] || '🐟'}</span>
              <span class="catch-name">${name} <strong>(${rarityLabel})</strong></span>
              <span class="catch-amount">+${reward}🪙</span>
            `;
            cd.innerHTML = '';
            cd.appendChild(pill);

            // optional shimmer on legendary
            if (!reduceMotion && rarity === 'legendary') {
                pill.animate([
                    { filter: 'brightness(1)' },
                    { filter: 'brightness(1.2)' },
                    { filter: 'brightness(1)' }
                ], { duration: 900, iterations: 1, easing: 'ease-in-out' });
            }
            // Sparkles for rare+
            if (!reduceMotion && (rarity === 'rare' || rarity === 'epic' || rarity === 'legendary')) {
                for (let i = 0; i < 8; i++) {
                    const s = document.createElement('span');
                    s.className = 'sparkle';
                    s.style.left = (Math.random() * 80 + 10) + '%';
                    s.style.top = (Math.random() * 60 + 10) + '%';
                    s.style.opacity = '0';
                    pill.appendChild(s);
                    const dx = (Math.random() - 0.5) * 30;
                    const dy = (Math.random() - 0.5) * 20 - 10;
                    const dur = 600 + Math.random() * 400;
                    s.animate([
                        { transform: 'translate(0,0) scale(0.6)', opacity: 0 },
                        { transform: `translate(${dx / 2}px, ${dy / 2}px) scale(1)`, opacity: 1, offset: 0.4 },
                        { transform: `translate(${dx}px, ${dy}px) scale(0.4)`, opacity: 0 }
                    ], { duration: dur, easing: 'ease-out', fill: 'forwards' });
                    setTimeout(() => s.remove(), dur + 60);
                }
            }
        }
    } catch { }
}

// Helpers: positions and visual flourishes
function getCenter(el) {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

function spawnCoinFlyouts(amount) {
    if (reduceMotion) return;
    const target = coinsDisplay;
    if (!target) return;
    const castSrc = document.getElementById('catchDisplay') || castButton || document.body;
    const start = getCenter(castSrc);
    const end = getCenter(target);
    const n = Math.min(10, Math.max(4, Math.ceil(Math.log2(amount + 1)) + 3));
    for (let i = 0; i < n; i++) {
        const span = document.createElement('span');
        span.textContent = '🪙';
        span.setAttribute('aria-hidden', 'true');
        span.style.cssText = `
            position: fixed; left: ${start.x}px; top: ${start.y}px; pointer-events: none; z-index: 120;
            font-size: 16px; filter: drop-shadow(0 1px 1px rgba(0,0,0,0.25));`;
        document.body.appendChild(span);
        const dx = (Math.random() - 0.5) * 80;
        const dy = (Math.random() - 0.5) * 60;
        const mid = { x: start.x + dx, y: start.y + dy };
        const duration = 650 + Math.random() * 500;
        span.animate([
            { transform: 'translate(-50%, -50%) scale(0.8)', opacity: 0 },
            { transform: `translate(${mid.x - start.x - 8}px, ${mid.y - start.y - 8}px) scale(1)`, opacity: 1, offset: 0.45 },
            { transform: `translate(${end.x - start.x - 8}px, ${end.y - start.y - 8}px) scale(0.8)`, opacity: 0.15 }
        ], { duration, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' });
        setTimeout(() => span.remove(), duration + 80);
    }
}

function showRarityBanner(rarity, name) {
    const card = document.querySelector('.game-card') || document.body;
    const banner = document.createElement('div');
    const emojis = { epic: '✨', legendary: '👑' };
    const label = rarity === 'legendary' ? 'Legendary Catch!' : 'Epic Catch!';
    banner.className = `rare-banner ${rarity}`;
    banner.innerHTML = `<span class="rb-emoji">${emojis[rarity]}</span> <strong>${label}</strong> <span class="rb-name">${name}</span>`;
    banner.style.cssText = `
        position: absolute; left: 50%; top: 12px; transform: translateX(-50%) translateY(-12px);
        background: ${rarity === 'legendary' ? 'linear-gradient(90deg,#ffe08a,#ffd14d,#ffb300,#ffd14d,#ffe08a)' : 'linear-gradient(90deg,#f7b2ff,#d98cff,#b45ce6,#d98cff,#f7b2ff)'};
        color: #1b2530; padding: 8px 14px; border-radius: 999px; box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        font-weight: 700; letter-spacing: .2px; z-index: 110; white-space: nowrap; border: 1px solid rgba(255,255,255,0.6);`;
    const mount = card;
    mount.style.position = mount === document.body ? 'relative' : (getComputedStyle(mount).position === 'static' ? 'relative' : getComputedStyle(mount).position);
    mount.appendChild(banner);
    banner.animate([
        { transform: 'translateX(-50%) translateY(-18px)', opacity: 0 },
        { transform: 'translateX(-50%) translateY(0)', opacity: 1, offset: 0.25 },
        { transform: 'translateX(-50%) translateY(0)', opacity: 1, offset: 0.8 },
        { transform: 'translateX(-50%) translateY(-10px)', opacity: 0 }
    ], { duration: 1400, easing: 'ease-out', fill: 'forwards' });
    setTimeout(() => banner.remove(), 1500);
}


// Shared cast logic so both manual and auto-cast use the same flow
function performCast(e, { auto = false } = {}) {
    count++;
    counterDisplay.textContent = count;
    updateStreakAndProgress();

    // Trigger fishing on every cast
    startFishing();

    // Spawn bubbles near the button
    const rect = castButton.getBoundingClientRect();
    spawnBubbles(rect.left + rect.width / 2, rect.top + rect.height / 2);

    // Ripple effect (use click position if provided, else center)
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const rx = e ? (e.clientX - rect.left) : (rect.width / 2);
    const ry = e ? (e.clientY - rect.top) : (rect.height / 2);
    ripple.style.left = rx + 'px';
    ripple.style.top = ry + 'px';
    ripple.style.width = ripple.style.height = Math.max(rect.width, rect.height) + 'px';
    castButton.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);

    // 1-in-5 chance: a little fish jumps by the title
    if (!reduceMotion && Math.random() < 0.2) {
        jumpFishNearTitle();
    }

    // Sarcastic messages at specific intervals
    const messages = {
        5: "wonder what happens if you do this 10x?",
        10: "No, not 10x in total, 5 x 10",
        15: "No, not 5 PLUS 10, 5 TIMES 10",
        20: "No pun here, just keep clicking cast...",
        25: "Glad you listened! Keep going!!",
        30: "If it helps, you reached the halfway point at the last message.",
        35: "....70%",
        40: "You're actually still clicking cast?",
        45: "You've come this far, bring it on home!",
        50: "TIME FOR A PRIZE! Check the store!"
    };

    if (messages[count]) {
        setGameMessage(messages[count], 'info');
    }

    // Milestone chest bonus every 10 casts
    const goal = 10;
    if (count % goal === 0) {
        const { coinMultiplier } = computePlayerStats();
        const bonusBase = roll(8, 20);
        const bonus = Math.max(1, Math.round(bonusBase * coinMultiplier));
        coins += bonus;
        updateCoinsDisplay();
        setGameMessage(`Milestone chest opened! Bonus +${bonus} coins`, 'success');
        // Gold sweep over progress bar
        try {
            const progress = document.querySelector('.progress');
            if (progress) {
                progress.classList.remove('sweep');
                let sweep = progress.querySelector('.gold-sweep');
                if (!sweep) {
                    sweep = document.createElement('div');
                    sweep.className = 'gold-sweep';
                    progress.appendChild(sweep);
                }
                void progress.offsetWidth;
                progress.classList.add('sweep');
                setTimeout(() => progress.classList.remove('sweep'), 950);
            }
        } catch { }
    }
}

// Enhanced cast button with fishing integration
castButton.addEventListener('click', (e) => performCast(e));

// Add splash ring on cast click
if (castButton) {
    castButton.addEventListener('click', (e) => {
        try {
            if (reduceMotion) return;
            const splash = document.createElement('span');
            splash.className = 'cast-splash animate';
            castButton.appendChild(splash);
            setTimeout(() => splash.remove(), 600);
        } catch { }
    }, { capture: true });
}

// Initialize coins display
updateCoinsDisplay();
updateStreakAndProgress();

// Auto-cast implementation tied to Auto-Clicker (id=7) and Speed Enhancer (id=9)
const autoBtn = document.getElementById('autoToggle');
let autoIntervalId = null;

function getAutoIntervalMs() {
    const base = 2000; // 2 seconds base
    const speedCount = getItemCount(9); // Speed Enhancer halves per item
    const ms = base * Math.pow(0.5, Math.min(3, speedCount));
    return Math.max(400, Math.floor(ms));
}

function updateAutoButtonLabel() {
    if (!autoBtn) return;
    const pressed = autoBtn.getAttribute('aria-pressed') === 'true';
    autoBtn.textContent = pressed ? `Auto: ON (${getAutoIntervalMs()}ms)` : 'Auto';
}

function stopAutoCasting(showMsg = false) {
    if (autoIntervalId) {
        clearInterval(autoIntervalId);
        autoIntervalId = null;
    }
    if (autoBtn) {
        autoBtn.setAttribute('aria-pressed', 'false');
        updateAutoButtonLabel();
    }
    if (showMsg) setGameMessage('Auto casting disabled.', 'info');
}

function startAutoCasting() {
    const hasAuto = getItemCount(7) > 0;
    if (!hasAuto) {
        setGameMessage('Auto requires the Auto-Clicker upgrade from the Store.', 'warn');
        stopAutoCasting(false);
        return;
    }
    stopAutoCasting(false); // ensure only one interval
    if (autoBtn) autoBtn.setAttribute('aria-pressed', 'true');
    updateAutoButtonLabel();
    const intervalMs = getAutoIntervalMs();
    autoIntervalId = setInterval(() => performCast(undefined, { auto: true }), intervalMs);
    setGameMessage(`Auto casting enabled (every ${intervalMs}ms).`, 'info');
}

if (autoBtn) {
    autoBtn.addEventListener('click', () => {
        const pressed = autoBtn.getAttribute('aria-pressed') === 'true';
        if (pressed) {
            stopAutoCasting(true);
        } else {
            startAutoCasting();
        }
    });
}

// If inventory changes while auto is on (e.g., buy Speed Enhancer), keep interval responsive
window.addEventListener('storage', (e) => {
    if (e.key === 'fishingInventory' && autoIntervalId) {
        // Restart auto with new interval
        startAutoCasting();
    }
});

// Same-tab inventory changes
window.addEventListener('inventoryChanged', () => {
    if (autoIntervalId) startAutoCasting();
    updateAutoButtonLabel();
});

// Cleanup
window.addEventListener('beforeunload', () => stopAutoCasting(false));

if (decrementButton) {
    decrementButton.addEventListener('click', () => {
        count--;
        counterDisplay.textContent = count;
    });
}

// Ambient bubbles drifting in the game card background
(function initAmbientBubbles() {
    try {
        if (reduceMotion) return;
        const layer = document.getElementById('ambientBubbles');
        if (!layer) return;
        let active = 0;
        function spawnOne() {
            if (!layer || active > 8) return;
            active++;
            const b = document.createElement('span');
            const size = 6 + Math.random() * 10;
            const left = Math.random() * 92 + 4; // percent
            const dur = 5000 + Math.random() * 6000;
            b.style.cssText = `
                position: absolute; bottom: -${size}px; left: ${left}%; width: ${size}px; height: ${size}px;
                border-radius: 50%; background: radial-gradient(circle at 40% 35%, rgba(255,255,255,0.8) 0 50%, rgba(173,216,230,0.35) 52%);
                filter: blur(0.2px); opacity: 0.0;`;
            layer.appendChild(b);
            const driftX = (Math.random() - 0.5) * 30;
            b.animate([
                { transform: 'translate(0, 0)', opacity: 0 },
                { transform: `translate(${driftX / 2}px, -50%)`, opacity: 0.6, offset: 0.4 },
                { transform: `translate(${driftX}px, -110%)`, opacity: 0 }
            ], { duration: dur, easing: 'ease-out', fill: 'forwards' });
            setTimeout(() => { b.remove(); active--; }, dur + 50);
        }
        const id = setInterval(spawnOne, 1200);
        window.addEventListener('beforeunload', () => clearInterval(id));
    } catch { }
})();

// Ambient parallax tilt on mouse move
(function initParallax() {
    try {
        if (reduceMotion) return;
        const ambient = document.querySelector('.water-ambient');
        if (!ambient) return;
        const caustics = ambient.querySelector('.caustics');
        const gradient = ambient.querySelector('.water-gradient');
        let raf = null;
        let targetX = 0, targetY = 0, curX = 0, curY = 0;
        function onMove(e) {
            const r = ambient.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            targetX = x; targetY = y;
            if (!raf) step();
        }
        function step() {
            raf = requestAnimationFrame(step);
            curX += (targetX - curX) * 0.06;
            curY += (targetY - curY) * 0.06;
            const tx = curX * 8;
            const ty = curY * 6;
            if (gradient) gradient.style.transform = `translate(${tx}px, ${ty}px)`;
            if (caustics) caustics.style.transform = `translate(${tx * 1.2}px, ${ty * 1.2}px)`;
        }
        ambient.addEventListener('mousemove', onMove);
        window.addEventListener('beforeunload', () => { if (raf) cancelAnimationFrame(raf); ambient.removeEventListener('mousemove', onMove); });
    } catch { }
})();

if (resetButton) {
    resetButton.addEventListener('click', () => {
        count = 0;
        counterDisplay.textContent = count;
    });
}