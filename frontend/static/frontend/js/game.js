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
        names: ['Minnow', 'Puddle Bass', 'Tin Carp', 'Street Trout'],
        coins: [1, 5]
    },
    uncommon: {
        names: ['Shimmer Perch', 'Spotty Pike', 'Neon Guppy'],
        coins: [4, 10]
    },
    rare: {
        names: ['Azure Snapper', 'Crystal Cod', 'Gilded Sunfish'],
        coins: [10, 25]
    },
    epic: {
        names: ['Phantom Koi', 'Storm Barracuda'],
        coins: [25, 60]
    },
    legendary: {
        names: ['Mythic Leviathan', 'Golden Marlin'],
        coins: [60, 150]
    }
};

function roll(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

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
    if (coinsDisplay && !reduceMotion) {
        coinsDisplay.classList.remove('bump');
        void coinsDisplay.offsetWidth;
        coinsDisplay.classList.add('bump');
    }
    const rarityLabel = rarity.charAt(0).toUpperCase() + rarity.slice(1);
    const type = rarity === 'common' ? 'success' : (rarity === 'uncommon' ? 'success' : (rarity === 'rare' ? 'warn' : 'info'));
    setGameMessage(`${rarityLabel}! Caught ${name} +${reward} coins`, type);
}


// Enhanced cast button with fishing integration
castButton.addEventListener('click', (e) => {
    count++;
    counterDisplay.textContent = count;
    updateStreakAndProgress();

    // Trigger fishing on every cast
    startFishing();

    // Spawn bubbles near the button
    const rect = castButton.getBoundingClientRect();
    spawnBubbles(rect.left + rect.width / 2, rect.top + rect.height / 2);

    // Ripple effect
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
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
});

// Initialize coins display
updateCoinsDisplay();
updateStreakAndProgress();

if (decrementButton) {
    decrementButton.addEventListener('click', () => {
        count--;
        counterDisplay.textContent = count;
    });
}

if (resetButton) {
    resetButton.addEventListener('click', () => {
        count = 0;
        counterDisplay.textContent = count;
    });
}