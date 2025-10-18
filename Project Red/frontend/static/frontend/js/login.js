/* Module: login.js 
Description: 
- Handles the gag-style login screen logic including invalid attempt tracking, cookie consent prompt, interactive animations (confetti, cookie rain, celebration banner), and keyboard accessibility.
 */

// Track the number of failed login attempts
let loginAttempts = 0;

// Utility: Display a message in the login message area
function setMessage(text, level = 'info') {
  const box = document.getElementById('loginMessage');
  if (!box) return;
  // Reset previous styles and apply new message level (info, warn, or error)
  box.classList.remove('info', 'warn', 'error');
  if (level) box.classList.add(level);
  box.textContent = text || '';
  box.style.display = text ? 'block' : 'none';
}

// Utility: Temporary notification (toast) popup
function showToast(text, level = 'info', timeout = 2500) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const el = document.createElement('div');
  el.className = `toast ${level}`;
  el.textContent = text;
  container.appendChild(el);
  // Fade out and remove the toast after a short delay
  setTimeout(() => {
    el.style.transition = 'opacity 250ms ease';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 260);
  }, timeout);
}

// Utility: Celebration banner for major actions (like "cookie unlocked")
function showCelebration(text = 'Cookies unlocked! 🎉', timeout = 1800) {
  const el = document.createElement('div');
  el.className = 'celebration-banner';
  el.textContent = text;
  document.body.appendChild(el);
  // Animate fade out and removal
  setTimeout(() => {
    el.style.transition = 'opacity 300ms ease, transform 300ms ease';
    el.style.opacity = '0';
    el.style.transform = 'translateX(-50%) translateY(-8px)';
    setTimeout(() => el.remove(), 320);
  }, timeout);
}

// Utility: Confetti burst animation for visual feedback
function confettiBurst(count = 80) {
  const colors = ['#f94144', '#f3722c', '#f8961e', '#f9c74f', '#90be6d', '#43aa8b', '#577590', '#4d96ff', '#6a4c93'];
  const max = Math.max(30, count);
  for (let i = 0; i < max; i++) {
    const el = document.createElement('div');
    el.className = 'confetti';
    const left = Math.random() * 100; // vw
    // Randomize placement, color, and animation properties
    el.style.left = left + 'vw';
    el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    el.style.opacity = String(0.85 + Math.random() * 0.15);
    el.style.transform = `translateY(-10px) rotate(${Math.floor(Math.random() * 360)}deg)`;
    el.style.animationDuration = (1.8 + Math.random() * 1.8) + 's';
    el.style.animationDelay = (Math.random() * 0.5) + 's';
    el.style.width = (6 + Math.random() * 5) + 'px';
    el.style.height = (10 + Math.random() * 8) + 'px';
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
}
 // Form Logic: Fake invalid login handling with incremental hints
function invalidLogin(e) {
  e.preventDefault(); // stop form submission refresh

  loginAttempts++;
  // Display escalating messages for each attempt
  if (loginAttempts === 1) {
    setMessage('Invalid username or password.', 'error');
  } else if (loginAttempts === 2) {
    setMessage("Invalid username or password. Maybe 3rd time's the charm?", 'warn');
  } else {
    setMessage('Hint: Look up ^', 'info');
  }
}

// Hook up fake login button and hidden shortcut
// Fake "Login" button triggers invalid login sequence
const realLoginBtn = document.getElementById('login-button');
if (realLoginBtn) {
  realLoginBtn.addEventListener('click', invalidLogin);
}


// Header LOGIN text acts as a hidden shortcut to proceed without credentials
const headerLogin = document.getElementById('headerLogin');
if (headerLogin) {
  const go = (e) => {
    if (e) e.preventDefault();
    window.location.href = '/start';
  };
  headerLogin.addEventListener('click', go);
  headerLogin.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') go(e);
  });
}

// cookies consent & logic
document.addEventListener("DOMContentLoaded", () => {
  const cookieBox = document.getElementById("cookieConsentBox");
  const acceptBtn = document.getElementById("acceptCookies");
  //const rejectBtn = document.getElementById("rejectCookies");
  const headerLoginBtn = document.querySelector(".login-btn"); // true login button
  // global guard for accept handling
  window.__cookieAccepted = window.__cookieAccepted || false;

  // header login button logic
  if (headerLoginBtn) {
    headerLoginBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "/start"; // redirects user to start.html
    });
  }

  // Cookie rain helper
  window.cookieRain = function cookieRain(count = 24) {
    const max = Math.max(8, count);
    for (let i = 0; i < max; i++) {
      const el = document.createElement('span');
      el.className = 'cookie-emoji';
      el.textContent = '🍪';
      // Randomize animation position, speed, and delay
      el.style.left = Math.floor(Math.random() * 100) + 'vw';
      el.style.fontSize = (18 + Math.random() * 18) + 'px';
      el.style.animationDuration = (2.5 + Math.random() * 2.5) + 's';
      el.style.animationDelay = (Math.random() * 0.8) + 's';
      document.body.appendChild(el);
      el.addEventListener('animationend', () => el.remove());
    }
  }

  // begin cookies consent logic
  cookieBox.style.display = "block";
  acceptBtn.addEventListener("click", () => {
    if (window.__cookieAccepted) return;
    performAccept();
  });

  function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 1 * 1 * 1 * 1));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }

  function getCookie(cname) {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

  window.onload = function () {
    const consentBox = document.getElementById('cookieConsentBox');
    const acceptBtn = document.getElementById('acceptCookies');
    const rejectBtn = document.getElementById('rejectCookies');

    if (getCookie("userConsent") !== "accepted") {
      consentBox.style.display = "block";
    }

    acceptBtn.onclick = function () {
      if (window.__cookieAccepted) return;
      performAccept();
    };

    //rejectBtn.onclick = function() {
    //  window.location.href = "", // page refreshes upon declining cookies
    //consentBox.style.display = "none";
    //alert("Big Mistake. We told you we wanted your cookies.");

    const rejectMessages = [
      "🍪 Cookies? Never heard of 'em.",
      "🍪 This site runs on cookies and sarcasm. You're killing half of it.",
      "🥛 No cookies? Bold choice. Got milk for that?",
      "🙅‍♂️ We accept your rejection. The cookies do not.",
      "🍇 Tell you what, you can reject the raisins.",
      "🥦 Without cookies, this site becomes broccoli.",
      "🧹 Fine. No cookies. More crumbs for us.",
      "🍫 Our cookies are 100% gluten-free… because they're imaginary.",
      "🍪 If cookies were a scam, they'd be oatmeal raisin.",
      "🫠 Your anti-cookie stance has been noted by the Dough Council.",
      "🥠 Fortune cookie says: ‘You will reconsider this.’",
      "✨ Pro tip: Cookies make buttons 11% shinier.",
    ];

    rejectBtn.onclick = function () {
      let rejectCount = localStorage.getItem("rejectCount");
      if (rejectCount === null) {
        rejectCount = 0;
      } else {
        rejectCount = parseInt(rejectCount, 10);
      }
      rejectCount++;
      localStorage.setItem("rejectCount", rejectCount);

      console.log("Reject button pressed " + rejectCount + " times");
      // Choose a message avoiding immediate repeats
      const lastIndex = parseInt(localStorage.getItem('lastRejectMsg') || '-1', 10);
      let msgIndex = Math.floor(Math.random() * rejectMessages.length);
      if (rejectMessages.length > 1 && msgIndex === lastIndex) {
        msgIndex = (msgIndex + 1) % rejectMessages.length;
      }
      localStorage.setItem('lastRejectMsg', String(msgIndex));
      const poolMsg = rejectMessages[msgIndex];
      let extra = '';
      if (rejectCount < 5) {
        extra = ` (Rejections so far: ${rejectCount})`;
      } else if (rejectCount === 5) {
        extra = ' (Achievement unlocked: Cookie Denier)';
      }
      showToast(poolMsg + extra, 'error');
      // Keep the consent box visible and avoid immediate reload
      consentBox.style.display = 'block';
    };

  };
}
)
// end cookies consent logic

// shared accept behavior
function performAccept() {
  try {
    // set cookie if helper exists
    if (typeof setCookie === 'function') {
      setCookie("userConsent", "accepted", 0);
    }
  } catch (_) { /* noop */ }
  const box = document.getElementById('cookieConsentBox');
  if (box) box.style.display = 'none';
  showToast('🍪 Accepted! The crumb gods approve. Submitting unlocked.', 'info');
  // cookie rain celebration
  if (typeof window.cookieRain === 'function') {
    window.cookieRain(28);
  }
  // top-center little celebration banner
  showCelebration('Cookie power activated! 🎉');
  // confetti for extra flair
  confettiBurst(100);
  // mark handled to avoid duplicate handlers firing
  window.__cookieAccepted = true;
}


