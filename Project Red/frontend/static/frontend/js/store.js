// Store JavaScript
// Enhanced Product Catalog & Inventory Management
// Product catalog (store items) with category, visuals, and unique effects
// Each object represents a purchasable store item

const products = [
    // Baits
    {
        id: 1,
        name: "Magic Worms",
        price: 15,
        category: "baits",
        description: "Enchanted earthworms that glow underwater",
        visual: "🪱✨",
        effect: "Attracts rare fish"
    },
    {
        id: 2,
        name: "Crystal Lures",
        price: 25,
        category: "baits",
        description: "Shimmering crystal that mesmerizes fish",
        visual: "💎🎣",
        effect: "Higher catch rate"
    },
    {
        id: 3,
        name: "Rainbow Flies",
        price: 35,
        category: "baits",
        description: "Colorful flies that change color mid-flight",
        visual: "🦟🌈",
        effect: "Attracts exotic species"
    },

    // Rods
    {
        id: 4,
        name: "Wooden Rod",
        price: 50,
        category: "rods",
        description: "A sturdy oak fishing rod for beginners",
        visual: "🎣🌳",
        effect: "Basic fishing capability"
    },
    {
        id: 5,
        name: "Steel Rod",
        price: 150,
        category: "rods",
        description: "Professional-grade steel rod with carbon fiber grip",
        visual: "🎣⚔️",
        effect: "Improved casting distance"
    },
    {
        id: 6,
        name: "Mystic Rod",
        price: 500,
        category: "rods",
        description: "Ancient rod imbued with ocean magic",
        visual: "🎣🔮",
        effect: "Can catch legendary fish"
    },

    // Upgrades
    {
        id: 7,
        name: "Auto-Clicker",
        price: 100,
        category: "upgrades",
        description: "Automatically clicks for you every 2 seconds",
        visual: "🤖👆",
        effect: "Passive income generation"
    },
    {
        id: 8,
        name: "Luck Booster",
        price: 200,
        category: "upgrades",
        description: "Increases your fishing luck by 25%",
        visual: "🍀📈",
        effect: "Better catch quality"
    },
    {
        id: 9,
        name: "Speed Enhancer",
        price: 300,
        category: "upgrades",
        description: "Reduces fishing time by 50%",
        visual: "⚡🏃‍♂️",
        effect: "Faster fishing cycles"
    },

    // Decorations
    {
        id: 10,
        name: "Fishing Gnome",
        price: 75,
        category: "decorations",
        description: "A cheerful gnome to watch over your fishing spot",
        visual: "🧙‍♂️🎣",
        effect: "Provides moral support"
    },
    {
        id: 11,
        name: "Lucky Anchor",
        price: 125,
        category: "decorations",
        description: "An ornate anchor that brings good fortune",
        visual: "⚓✨",
        effect: "Slight luck increase"
    },
    {
        id: 12,
        name: "Tropical Plants",
        price: 60,
        category: "decorations",
        description: "Beautiful plants to decorate your fishing area",
        visual: "🌺🌿",
        effect: "Aesthetic enhancement"
    }
];

// Retrieve player inventory from localStorage or initialize an empty one
let inventory = JSON.parse(localStorage.getItem('fishingInventory')) || [];

// Display a popup message overlay with title and message
function showPopup(title, message) {
    document.getElementById('popup-title').textContent = title;
    document.getElementById('popup-message').textContent = message;
    const overlay = document.getElementById('popup-overlay');
    overlay.style.display = 'flex';
    const dialog = overlay.querySelector('.popup-content'); // Focus the dialog for accessibility
    if (dialog) setTimeout(() => dialog.focus(), 0);
}

function closePopup() {
    document.getElementById('popup-overlay').style.display = 'none'; // Hide the popup overlay
}

// Initialize store
// Setup store once DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    updateCoinDisplay();
    displayProducts('all');
    displayInventory();
    setupCategoryFilters();
    setupSortAndFilters();
    wirePurchaseAnimationHelpers();
    // Popup backdrop and Escape handling
    (function setupPopupAccessibility() {
        const overlay = document.getElementById('popup-overlay');
        if (!overlay) return;
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closePopup();
        });
        document.addEventListener('keydown', (e) => {
            const open = overlay && getComputedStyle(overlay).display !== 'none';
            if (open && e.key === 'Escape') {
                e.preventDefault();
                closePopup();
            }
        });
    })();
});

// Update coin display from localStorage
function updateCoinDisplay() {
    const coins = parseInt(localStorage.getItem('fishCoins')) || 0;
    document.getElementById('store-coins').textContent = coins;
}

// Helpers: inventory and pricing
function getOwnedCount(productId) {
    const it = inventory.find(i => i.id === productId);
    return it ? it.quantity : 0;
}

function isNonStackable(product) {
    return product.category === 'rods';
}

function getDynamicPrice(product) {
    if (isNonStackable(product)) return product.price;
    const owned = getOwnedCount(product.id);
    const scale = 1.25; // 25% more per tier
    const price = Math.round(product.price * Math.pow(scale, owned));
    return price;
}

// Display products by category
function displayProducts(category = 'all') {
    const productsGrid = document.getElementById('products-grid');
    productsGrid.innerHTML = '';

    // base filter by category
    let filteredProducts = category === 'all'
        ? products.slice()
        : products.filter(product => product.category === category);

    // optional owned-only filter
    const ownedOnly = document.getElementById('owned-only-toggle');
    if (ownedOnly && ownedOnly.checked) {
        const ownedIds = new Set(inventory.map(i => i.id));
        filteredProducts = filteredProducts.filter(p => ownedIds.has(p.id));
    }

    // sort
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        const val = sortSelect.value;
        filteredProducts.sort((a, b) => {
            switch (val) {
                case 'price-asc': return getDynamicPrice(a) - getDynamicPrice(b);
                case 'price-desc': return getDynamicPrice(b) - getDynamicPrice(a);
                case 'name-asc': return a.name.localeCompare(b.name);
                case 'name-desc': return b.name.localeCompare(a.name);
                default: return 0;
            }
        });
    }

    filteredProducts.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

// Create the visual card for each product
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    const invCount = getOwnedCount(product.id);
    const isRod = isNonStackable(product);
    const nonStackable = isRod; // rods are non-stackable
    const disabled = nonStackable && invCount > 0;
    const tooltip = `${product.effect} — ${nonStackable ? 'Single item' : 'Stacks'}`;
    const nextTier = nonStackable ? (invCount > 0 ? 'Max' : 'Tier 1') : `Tier ${invCount + 1}`;
    const priceNow = getDynamicPrice(product);
    
    // Template literal for HTML structure of product card
    card.innerHTML = `
        <div class="product-visual" title="${tooltip}">${product.visual}</div>
        <div class="product-info">
            <div class="product-headline">
              <h3 class="product-name">${product.name}</h3>
              ${invCount > 0 ? `<span class=\"owned-badge\" title=\"Owned\">Owned ×${invCount}</span>` : ''}
              <span class="tier-badge" title="Next tier">${nextTier}</span>
            </div>
            <p class="product-description">${product.description}</p>
            <p class="product-effect" aria-label="Effect">${product.effect}</p>
            <div class="stack-hint" aria-hidden="true">${nonStackable ? 'Single Item' : 'Stacks with quantity'}</div>
            <div class="product-footer">
                <span class="product-price">🪙 ${priceNow}</span>
                <button class="buy-btn" ${disabled ? 'disabled' : ''} data-product-id="${product.id}" title="${disabled ? 'Already owned' : 'Buy now'}">
                    ${disabled ? 'Owned' : 'Buy'}
                </button>
            </div>
        </div>
    `;
    
    // Attach buy event if item is available
    const btn = card.querySelector('.buy-btn');
    if (btn && !disabled) {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const id = parseInt(btn.getAttribute('data-product-id'));
            purchaseItem(id, btn);
        });
    }
    return card;
}

// Handle the purchase of an item
function purchaseItem(productId, sourceButton) {
    const product = products.find(p => p.id === productId);
    const currentCoins = parseInt(localStorage.getItem('fishCoins')) || 0;
    const priceNow = getDynamicPrice(product);

    // Check if player can afford the item
    if (currentCoins >= priceNow) {
        // Deduct coins
        const newCoinTotal = currentCoins - priceNow;
        localStorage.setItem('fishCoins', newCoinTotal);

        // Animations BEFORE re-render/popup (sourceButton is still in DOM)
        try {
            launchConfetti(sourceButton);
            animateCoinFlyout(sourceButton);
        } catch { }

        // Add to inventory
        addToInventory(product);

        // Update relevant UI
        updateCoinDisplay();
        displayInventory();
        // Re-render products to update badges/disabled states keeping current filters
        const activeCatBtn = document.querySelector('.store-nav .category-btn.active');
        const currentCat = activeCatBtn ? activeCatBtn.getAttribute('data-category') : 'all';
        displayProducts(currentCat);

        // Slight delay so animations are visible before popup overlay
        setTimeout(() => {
            showPopup('Purchase Successful!',
                `You bought ${product.name} ( ${nonStackable(product) ? 'Single' : `Tier ${getOwnedCount(product.id)}`} ) for ${priceNow} coins!`);
        }, 650);
    } else {
        const needed = priceNow - currentCoins;
        showPopup('Insufficient Funds',
            `You need ${needed} more coins to buy ${product.name}.`);
        // gentle shake on button if provided
        if (sourceButton) {
            sourceButton.classList.add('btn-shake');
            setTimeout(() => sourceButton.classList.remove('btn-shake'), 450);
        }
    }
}

// Add item to inventory
function addToInventory(product) {
    const existingItem = inventory.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        inventory.push({
            ...product,
            quantity: 1,
            purchaseDate: new Date().toISOString()
        });
    }

    localStorage.setItem('fishingInventory', JSON.stringify(inventory));
    // Notify listeners (same-tab) that inventory changed
    try {
        window.dispatchEvent(new CustomEvent('inventoryChanged', { detail: { inventory } }));
    } catch { }
}

// Display inventory
function displayInventory() {
    const inventoryGrid = document.getElementById('inventory-grid');
    inventoryGrid.innerHTML = '';

    if (inventory.length === 0) {
        inventoryGrid.innerHTML = '<p class="empty-inventory">Your inventory is empty. Buy some items from the store!</p>';
        return;
    }

    inventory.forEach(item => {
        const inventoryCard = createInventoryCard(item);
        inventoryGrid.appendChild(inventoryCard);
    });
}

// Create inventory card element
function createInventoryCard(item) {
    const card = document.createElement('div');
    card.className = 'inventory-card';
    card.innerHTML = `
        <div class="inventory-visual">${item.visual}</div>
        <div class="inventory-info">
            <h4 class="inventory-name">${item.name}</h4>
            <p class="inventory-quantity">Quantity: ${item.quantity}</p>
            <p class="inventory-effect">${item.effect}</p>
        </div>
    `;
    return card;
}

// Setup category filter buttons
function setupCategoryFilters() {
    const categoryButtons = document.querySelectorAll('.category-btn');

    categoryButtons.forEach(button => {
        button.addEventListener('click', function () {
            // Remove active class from all buttons
            categoryButtons.forEach(btn => btn.classList.remove('active'));

            // Add active class to clicked button
            this.classList.add('active');

            // Display products for selected category
            const category = this.getAttribute('data-category');
            displayProducts(category);
        });
    });
}

// Sorting and owned-only filter wiring
function setupSortAndFilters() {
    const sortSelect = document.getElementById('sort-select');
    const ownedToggle = document.getElementById('owned-only-toggle');
    const refresh = () => {
        const activeCatBtn = document.querySelector('.store-nav .category-btn.active');
        const currentCat = activeCatBtn ? activeCatBtn.getAttribute('data-category') : 'all';
        displayProducts(currentCat);
    };
    if (sortSelect) sortSelect.addEventListener('change', refresh);
    if (ownedToggle) ownedToggle.addEventListener('change', refresh);
}

// Placeholder function for initializing animation helpers
function wirePurchaseAnimationHelpers() {
}

// Confetti burst animation upon purchase
function launchConfetti(originEl) {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const container = document.body;
    const rect = originEl ? originEl.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 };
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;
    for (let i = 0; i < 18; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = `${originX}px`;
        piece.style.top = `${originY}px`;
        piece.style.backgroundColor = randomConfettiColor();
        container.appendChild(piece);
        const angle = Math.random() * Math.PI * 2;
        const speed = 3 + Math.random() * 4;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed - 2;
        const rot = (Math.random() * 360) | 0;
        piece.animate([
            { transform: `translate(0,0) rotate(0deg)`, opacity: 1 },
            { transform: `translate(${vx * 40}px, ${vy * 40}px) rotate(${rot}deg)`, opacity: 0 }
        ], { duration: 900 + Math.random() * 500, easing: 'cubic-bezier(.25,.46,.45,.94)', fill: 'forwards' });
        setTimeout(() => piece.remove(), 1500);
    }
}

// Randomized confetti color palette
function randomConfettiColor() {
    const palette = ['#ffd54f', '#4fc3f7', '#ff8a65', '#81c784', '#ba68c8'];
    return palette[(Math.random() * palette.length) | 0];
}

// Coin animation flying toward the coin counter after purchase
function animateCoinFlyout(originEl) {
    if (!originEl) return;
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coinTarget = document.querySelector('.store-hero .coin-display, .coin-chip');
    if (!coinTarget || reduced) return;
    const from = originEl.getBoundingClientRect();
    const to = coinTarget.getBoundingClientRect();
    const coin = document.createElement('div');
    coin.className = 'coin-fly';
    coin.textContent = '🪙';
    coin.style.left = `${from.left + from.width / 2}px`;
    coin.style.top = `${from.top + from.height / 2}px`;
    document.body.appendChild(coin);
    const dx = to.left + to.width / 2 - (from.left + from.width / 2);
    const dy = to.top + to.height / 2 - (from.top + from.height / 2);
    coin.animate([
        { transform: `translate(0,0) scale(1)`, opacity: 0.9 },
        { transform: `translate(${dx * 0.6}px, ${dy * 0.6}px) scale(1.15)`, opacity: 1, offset: 0.6 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.6)`, opacity: 0 }
    ], { duration: 700, easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'forwards' });
    setTimeout(() => coin.remove(), 900);
}

// Export functions for game integration
window.storeManager = {
    updateCoinDisplay,
    addToInventory,
    displayInventory,
    showPopup,
    closePopup
};
