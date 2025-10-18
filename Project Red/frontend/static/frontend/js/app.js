//  Module: app.js
 // Description: 
// - Global behavior script for the gag game site. 
// - Includes simulated ad popups, coin synchronization across pages, global toast notifications, and  an easter egg (Konami code → Aquarium Mode).
(function () {
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const adLayer = document.getElementById('adLayer');
  if (!adLayer) return;

  // Image pool for fake advertisements
  const ads = [
    '/static/images/AD1.png', '/static/images/AD2.png', '/static/images/AD3.png', '/static/images/AD4.png',
    '/static/images/AD5.png', '/static/images/AD6.png', '/static/images/AD7.png', '/static/images/AD8.png'
  ];

  let live = 0; // number of currently active ads
  const MAX_LIVE = 3; // cap concurrent ads
  const MIN_DELAY = 20000; // 20s
  const MAX_DELAY = 45000; // 45s
  const MIN_SIZE = 180, MAX_SIZE = 360;

  // Helper: random integer within range
  function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

  // schedule next ad spawn
  function scheduleNext() {
    const delay = rand(MIN_DELAY, MAX_DELAY);
    setTimeout(spawnAd, delay);
  }

  // create new ad
  function spawnAd() {
    if (live >= MAX_LIVE) { scheduleNext(); return; }
    const imgPath = ads[rand(0, ads.length - 1)];
    const imgEl = new Image();
    imgEl.alt = 'Advertisement';
    imgEl.src = imgPath;

    // Once loaded, calculate size and render on screen
    const mountAd = (naturalW, naturalH) => {
      const aspect = (naturalW > 0 && naturalH > 0) ? (naturalW / naturalH) : (4 / 3);
      let w = rand(MIN_SIZE, MAX_SIZE);
      let h = Math.round(w / aspect);
      const vpW = window.innerWidth, vpH = window.innerHeight;
      // Prevent exceeding viewport size
      const maxW = Math.max(160, vpW - 40);
      const maxH = Math.max(140, vpH - 100);
      if (w > maxW) { w = maxW; h = Math.round(w / aspect); }
      if (h > maxH) { h = maxH; w = Math.round(h * aspect); }

      // Create popup container
      const el = document.createElement('div');
      el.className = 'popup-ad';
      el.style.width = w + 'px';
      el.style.height = h + 'px';
      // Randomize position within viewport
      const left = rand(10, Math.max(10, vpW - w - 10));
      const top = rand(50, Math.max(50, vpH - h - 50));
      el.style.left = left + 'px';
      el.style.top = top + 'px';
      // add close button
      const closeBtn = document.createElement('button');
      closeBtn.className = 'close';
      closeBtn.setAttribute('aria-label', 'Close');
      closeBtn.setAttribute('title', 'Close');
      closeBtn.textContent = '×';
      closeBtn.addEventListener('click', () => { el.remove(); live--; scheduleNext(); });

      el.appendChild(closeBtn);
      el.appendChild(imgEl);

      // optional gentle float
      if (!reduceMotion) {
        el.animate([
          { transform: 'translateY(0)' },
          { transform: 'translateY(-6px)' },
          { transform: 'translateY(0)' }
        ], { duration: 5000 + rand(0, 2000), iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
      }

      adLayer.appendChild(el);
      live++;
      // auto-despawn after ~25-40s
      setTimeout(() => { if (el.isConnected) { el.remove(); live--; } }, 25000 + rand(0, 15000));
      scheduleNext();
    };

    imgEl.addEventListener('load', () => mountAd(imgEl.naturalWidth, imgEl.naturalHeight));
    imgEl.addEventListener('error', () => mountAd(0, 0));
  }

  // start after an initial delay
  scheduleNext();
})();

// Global coin chip sync across pages
(function () {
  function refresh() {
    const el = document.getElementById('global-coins');
    if (!el) return;
    const coins = parseInt(localStorage.getItem('fishCoins')) || 0;
    el.textContent = coins;
  }
  window.addEventListener('storage', (e) => { if (e.key === 'fishCoins') refresh(); });
  window.addEventListener('inventoryChanged', refresh);
  document.addEventListener('DOMContentLoaded', refresh);
  refresh();
})();

// Tiny toast helper (global, non-blocking)
(function () {
  function ensureContainer() {
    let c = document.getElementById('toastContainer');
    if (!c) {
      c = document.createElement('div');
      c.id = 'toastContainer';
      document.body.appendChild(c);
    }
    return c;
  }
  window.showToast = function (msg, type = 'info', timeout = 2200) {
    const c = ensureContainer();
    const t = document.createElement('div');
    t.className = 'toast ' + (type || 'info');
    t.textContent = msg;
    c.appendChild(t);
    setTimeout(() => t.remove(), timeout);
  };
})();

// Konami code easter egg: spawn aquarium mode
(function () {
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const seq = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let idx = 0;
  function onKey(e) {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    const expect = seq[idx];
    if (key === expect || (expect === 'b' && key === 'b') || (expect === 'a' && key === 'a')) {
      idx++;
      if (idx === seq.length) {
        idx = 0;
        if (!reduceMotion) spawnAquarium();
        if (window.showToast) showToast('Gag unlocked: Aquarium Mode 🐟', 'info', 2600);
      }
    } else {
      idx = (key === seq[0]) ? 1 : 0;
    }
  }

  // Create floating aquatic emoji animations
  function spawnAquarium() {
    const emojis = ['🐟', '🐠', '🦈', '🐡', '🦑', '🦀'];
    const n = Math.min(24, Math.max(12, Math.round(window.innerWidth / 80)));
    for (let i = 0; i < n; i++) {
      const s = document.createElement('span');
      s.className = 'aquarium-fish';
      s.textContent = emojis[(Math.random() * emojis.length) | 0];
      // Randomized movement parameters
      const top = Math.random() * 80 + 5; // vh
      const size = 16 + Math.random() * 18; // px
      const duration = 8000 + Math.random() * 7000;
      const delay = Math.random() * 1200;
      const fromLeft = Math.random() < 0.5;
      // Position fish and flip horizontally depending on direction
      s.style.top = top + 'vh';
      s.style.fontSize = size + 'px';
      s.style.left = fromLeft ? '-5vw' : '105vw';
      s.style.transform = fromLeft ? 'scaleX(1)' : 'scaleX(-1)';
      document.body.appendChild(s);
      // Smooth horizontal swim animation across the screen
      const keyframes = [
        { transform: s.style.transform + ' translateX(0)', opacity: 0.0 },
        { opacity: 1, offset: 0.1 },
        { transform: s.style.transform + (fromLeft ? ' translateX(110vw)' : ' translateX(-110vw)'), opacity: 0.0 }
      ];
      const anim = s.animate(keyframes, { duration, delay, easing: 'linear', fill: 'forwards' });
      setTimeout(() => s.remove(), duration + delay + 200);
    }
  }
  document.addEventListener('keydown', onKey);
})();
