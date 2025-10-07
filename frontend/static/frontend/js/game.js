/**
 * Project Red - Sarcastic Fishing Clicker Game
 * Transformed from backend-heavy fishing sim to client-side clicker
 * Features: Anti-spam protection, tiered progression, sarcastic popups
 */

// ===== GAME CONFIGURATION =====
const GAME_CONFIG = {
    CLICK_COOLDOWN: 150,        // Minimum ms between clicks (prevents spamming)
    POPUP_AUTO_CLOSE: 5000,     // Auto-close popups after 5 seconds
    WELCOME_DELAY: 2000,        // Welcome message delay on page load
};

// Coin progression tiers (fish count → coins per click)
const COIN_TIERS = [
    { maxFish: 50, coins: 1 },      // Beginner: 1-50 fish = 1 coin each
    { maxFish: 200, coins: 2 },     // Novice: 51-200 fish = 2 coins each
    { maxFish: 500, coins: 3 },     // Intermediate: 201-500 fish = 3 coins each
    { maxFish: 1000, coins: 5 },    // Advanced: 501-1000 fish = 5 coins each
    { maxFish: 2000, coins: 8 },    // Expert: 1001-2000 fish = 8 coins each
    { maxFish: Infinity, coins: 10 } // Master: 2000+ fish = 10 coins each
];

// ===== GAME STATE VARIABLES =====
let currentSession = false;
let totalCoins = 0;
let totalFish = 0;
let lastClickTime = 0;
let isProcessing = false;

const counterDisplay = document.getElementById('counter');
const castButton = document.getElementById('castButton');

// Start clicker session (completely anonymous)
async function startFishing() {
    try {
        const response = await fetch('/api/start-fishing/', { method: 'POST' });
        const data = await response.json();
        if (data.success) {
            currentSession = true;
            castButton.textContent = 'Click to Fish! 🎣';
            updateClickerDisplay();
            // loadStats(); // Disabled to prevent reset
        }
    } catch (error) {
        console.error('Failed to start fishing:', error);
    }
}

// Clicker game - instant fishing with original popups
async function castLine() {
    // Prevent rapid clicking/key holding
    const now = Date.now();
    if (isProcessing || (now - lastClickTime) < GAME_CONFIG.CLICK_COOLDOWN) {
        return;
    }

    isProcessing = true;
    lastClickTime = now;

    if (!currentSession) {
        await startFishing();
        isProcessing = false;
        return;
    }

    // Instant visual feedback
    totalFish++;

    // Calculate coins based on current tier
    const coinsEarned = COIN_TIERS.find(tier => totalFish <= tier.maxFish).coins;

    totalCoins += coinsEarned;

    // Popup progression system - sarcastic milestone messages
    console.log('Current fish count:', totalFish);

    // Epic achievement popups
    if (totalFish == 3000) {
        showCustomPopup("3000 fish... Do you realize these aren't even real fish?", true);
    }
    if (totalFish == 7500) {
        showCustomPopup("🐟 7500+ FISH! Time to reevaluate your life choices! 🐟", true);
    }
    if (totalFish == 20000) {
        showCustomPopup("🎆 20,000 FISH! You've achieved peak procrastination! 🎆", true);
    }

    // Early game sarcastic messages
    if (totalFish == 25) {
        showCustomPopup("Wow, 25 whole fish. You're basically a marine biologist now.");
    }
    if (totalFish == 50) {
        showCustomPopup("Oh look, 50 fish. I'm sure your mom is SO proud.");
    }
    if (totalFish == 100) {
        showCustomPopup("Triple digits! Time to put this on your resume.");
    }
    if (totalFish == 150) {
        showCustomPopup("150 fish? You're like... really good at clicking things.");
    }
    if (totalFish == 200) {
        showCustomPopup("200 fish. Congratulations, you can count to 200.");
    }
    if (totalFish == 250) {
        showCustomPopup("Quarter thousand fish. What a life achievement.");
    }
    if (totalFish == 300) {
        showCustomPopup("300 fish. Your clicking finger must be EXHAUSTED.");
    }
    if (totalFish == 400) {
        showCustomPopup("Still here? Don't you have literally anything else to do?");
    }
    if (totalFish == 500) {
        showCustomPopup("500 fish. I bet you feel really accomplished right now.");
    }
    if (totalFish == 750) {
        showCustomPopup("750... Are you actually enjoying this mindless clicking?");
    }

    // Major milestone achievements (special popups)
    if (totalFish == 1000) {
        showCustomPopup("WOW! 1000 fish! Your prize is... more clicking!", true);
    }
    if (totalFish == 2500) {
        showCustomPopup("2500 fish. You've officially wasted a lot of your life.", true);
    }
    if (totalFish == 5000) {
        showCustomPopup("5000 fish?! Someone needs a hobby. Or therapy.", true);
    }
    if (totalFish == 10000) {
        showCustomPopup("10,000 FISH! Fishing Master? More like Clicking Disaster.", true);
    }
    if (totalFish == 15000) {
        showCustomPopup("15,000... At what point do you realize this isn't a real job?", true);
    }
    if (totalFish == 25000) {
        showCustomPopup("25,000 fish. Your dedication to pointless tasks is... concerning.", true);
    }

    // Show immediate feedback
    showInstantCatch(coinsEarned);
    updateClickerDisplay();

    // Reset processing flag
    isProcessing = false;

    // Note: Backend API integration disabled for pure clicker mode
    // Server-side fishing logic not needed for client-side clicker game
    // Can be re-enabled if backend integration is desired in the future
}

// Instant clicker feedback
function showInstantCatch(coins) {
    // Create floating +coins animation
    const floatingCoins = document.createElement('div');
    floatingCoins.textContent = `+${coins}`;
    floatingCoins.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: gold;
        font-size: 24px;
        font-weight: bold;
        pointer-events: none;
        z-index: 1000;
        animation: floatUp 1s ease-out forwards;
    `;
    document.body.appendChild(floatingCoins);
    setTimeout(() => floatingCoins.remove(), 1000);
}

// Show fish reward from API
function showFishReward(fish) {
    if (fish && fish.name) {
        const fishNotification = document.createElement('div');
        fishNotification.innerHTML = `🎉 Special: ${fish.name}`;
        fishNotification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-size: 14px;
            z-index: 1000;
        `;
        document.body.appendChild(fishNotification);
        setTimeout(() => fishNotification.remove(), 3000);
    }
}

// Custom in-page popup system
function showCustomPopup(message, isSpecial = false) {
    // Create popup overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
        animation: fadeIn 0.3s ease;
    `;

    // Create popup box
    const popup = document.createElement('div');
    popup.style.cssText = `
        background: ${isSpecial ? 'linear-gradient(45deg, #ff6b6b, #feca57)' : 'white'};
        padding: 30px;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        max-width: 400px;
        text-align: center;
        font-family: Arial, sans-serif;
        animation: popIn 0.3s ease;
        ${isSpecial ? 'color: white; border: 3px solid gold;' : 'color: #333;'}
    `;

    // Add message and close button
    popup.innerHTML = `
        <div style="font-size: 18px; margin-bottom: 20px; ${isSpecial ? 'font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);' : ''}">${message}</div>
        <button onclick="this.parentElement.parentElement.remove()" style="
            background: ${isSpecial ? '#ff4757' : '#007bff'};
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.2s ease;
        " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
            ${isSpecial ? '🎉 Awesome!' : 'Got it!'}
        </button>
    `;

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    // Auto-close after configured delay
    setTimeout(() => {
        if (overlay.parentElement) {
            overlay.remove();
        }
    }, GAME_CONFIG.POPUP_AUTO_CLOSE);
}

// Update clicker display
function updateClickerDisplay() {
    counterDisplay.innerHTML = `
        <div style="font-size: 24px;">🐟 ${totalFish} Fish</div>
        <div style="font-size: 20px; color: gold;">💰 ${totalCoins} Coins</div>
        <div style="font-size: 14px; margin-top: 10px;">Keep clicking to fish!</div>
    `;
}

// Load current stats from server
async function loadStats() {
    try {
        const response = await fetch('/api/stats/');
        const data = await response.json();
        if (!data.error) {
            totalCoins = data.total_coins;
            totalFish = data.total_fish_caught;
            document.title = `Fishing Game - ${totalCoins} coins`;
        }
    } catch (error) {
        // Silently handle
    }
}

// Initialize clicker game
castButton.addEventListener('click', castLine);
castButton.textContent = 'Start Clicking! 🎣';

// Prevent Enter key spamming
let enterKeyPressed = false;
document.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' && !enterKeyPressed) {
        enterKeyPressed = true;
        castLine();
    }
});

document.addEventListener('keyup', function (event) {
    if (event.key === 'Enter') {
        enterKeyPressed = false;
    }
});

// Prevent any form submission on Enter
document.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault();
    }
});

// Initial welcome popup removed - players can start immediately without interruption

// Add CSS for animations and popups
const style = document.createElement('style');
style.textContent = `
    @keyframes floatUp {
        0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        100% { transform: translate(-50%, -150px) scale(1.2); opacity: 0; }
    }
    @keyframes fadeIn {
        0% { opacity: 0; }
        100% { opacity: 1; }
    }
    @keyframes popIn {
        0% { transform: scale(0.8); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
    }
    #castButton {
        font-size: 18px;
        padding: 15px 30px;
        background: linear-gradient(45deg, #007bff, #0056b3);
        border: none;
        border-radius: 10px;
        color: white;
        cursor: pointer;
        transition: all 0.1s ease;
    }
    #castButton:hover {
        transform: scale(1.05);
        background: linear-gradient(45deg, #0056b3, #004085);
    }
    #castButton:active {
        transform: scale(0.95);
    }
`;
document.head.appendChild(style);

// Auto-sync disabled to maintain clicker game progress
// Re-enable if server integration is needed: setInterval(loadStats, 30000);