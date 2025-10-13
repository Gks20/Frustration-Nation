// Store JavaScript - Enhanced Product Catalog and Inventory Management

// Product catalog with enhanced visual representations
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

// Inventory management
let inventory = JSON.parse(localStorage.getItem('fishingInventory')) || [];

// Custom popup system
function showPopup(title, message) {
    document.getElementById('popup-title').textContent = title;
    document.getElementById('popup-message').textContent = message;
    document.getElementById('popup-overlay').style.display = 'flex';
}

function closePopup() {
    document.getElementById('popup-overlay').style.display = 'none';
}

// Initialize store
document.addEventListener('DOMContentLoaded', function () {
    updateCoinDisplay();
    displayProducts('all');
    displayInventory();
    setupCategoryFilters();
});

// Update coin display from localStorage
function updateCoinDisplay() {
    const coins = parseInt(localStorage.getItem('fishCoins')) || 0;
    document.getElementById('store-coins').textContent = coins;
}

// Display products by category
function displayProducts(category = 'all') {
    const productsGrid = document.getElementById('products-grid');
    productsGrid.innerHTML = '';

    const filteredProducts = category === 'all'
        ? products
        : products.filter(product => product.category === category);

    filteredProducts.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

// Create product card element
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <div class="product-visual">${product.visual}</div>
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <p class="product-effect">${product.effect}</p>
            <div class="product-footer">
                <span class="product-price">🪙 ${product.price}</span>
                <button class="buy-btn" onclick="purchaseItem(${product.id})">
                    Buy Now
                </button>
            </div>
        </div>
    `;
    return card;
}

// Purchase item
function purchaseItem(productId) {
    const product = products.find(p => p.id === productId);
    const currentCoins = parseInt(localStorage.getItem('fishCoins')) || 0;

    if (currentCoins >= product.price) {
        // Deduct coins
        const newCoinTotal = currentCoins - product.price;
        localStorage.setItem('fishCoins', newCoinTotal);

        // Add to inventory
        addToInventory(product);

        // Update displays
        updateCoinDisplay();
        displayInventory();

        showPopup('Purchase Successful!',
            `You bought ${product.name} for ${product.price} coins!`);
    } else {
        const needed = product.price - currentCoins;
        showPopup('Insufficient Funds',
            `You need ${needed} more coins to buy ${product.name}.`);
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

// Export functions for game integration
window.storeManager = {
    updateCoinDisplay,
    addToInventory,
    displayInventory,
    showPopup,
    closePopup
};