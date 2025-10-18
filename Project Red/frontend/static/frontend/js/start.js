// Navigate to the main game screen
function bounceToGame() {
    window.location.href = "/game";
}

// Primary control: clicking the bouncing button starts the game
document.getElementById("bouncingButton").addEventListener("click", bounceToGame);

document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('bouncingButton');
    let x = 0;           // current left position (px)
    let y = 0;           // current top position (px)
    let xSpeed = 3;      // horizontal velocity (px per frame)
    let ySpeed = 3;      // vertical velocity (px per frame)
    let paused = false;  // pause flag (used on hover to make clicking easier)

    function headerHeight() {
        // Try to detect header element height; fallback to 120
        const header = document.querySelector('header');
        return header ? header.offsetHeight : 120;
    }

    function footerHeight() {
        // If pretty waves footer exists, reserve ~110px; else small buffer
        const footer = document.querySelector('.site-footer');
        return footer ? Math.max(90, footer.offsetHeight) : 40;
    }

    // Calculate current motion bounds based on viewport, button size, and UI padding
    function bounds() {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const buttonWidth = button.offsetWidth;
        const buttonHeight = button.offsetHeight;

        // Soft margins to avoid hugging edges/overlapping header/footer
        const leftPadding = 20;
        const rightPadding = 10; // small buffer on the right
        const topPadding = Math.max(20, headerHeight());
        const bottomPadding = Math.max(20, footerHeight());
        return {
            leftPadding,
            rightPadding,
            topPadding,
            bottomPadding,
            maxX: screenWidth - buttonWidth - rightPadding, // right-most allowed x
            maxY: screenHeight - buttonHeight - bottomPadding, // bottom-most allowed y
            minX: leftPadding, // left-most allowed x
            minY: topPadding, // top-most allowed y
            // Screen center (within safe area) for initial placement
            midX: Math.max(leftPadding, (screenWidth - buttonWidth) / 2),
            midY: Math.max(topPadding, (screenHeight - buttonHeight) / 2)
        };
    }

    // Place the button at the visual center once sizes are known
    function initPosition() {
        const { midX, midY } = bounds();
        x = midX;
        y = midY;
        button.style.left = `${x}px`;
        button.style.top = `${y}px`;
    }

    // Main animation loop: update position, bounce off edges, and pain
    function animateButton() {
        const { minX, minY, maxX, maxY } = bounds();

        // Only move when not paused (paused on hover)
        if (!paused) {
            x += xSpeed;
            y += ySpeed;
        }

        // Horizontal wall collision: flip x velocity and clamp inside bounds
        if (x >= maxX || x <= minX) {
            xSpeed *= -1;
            x = Math.max(minX, Math.min(maxX, x));
        }
        // Vertical wall collision: flip y velocity and clamp inside bounds
        if (y >= maxY || y <= minY) {
            ySpeed *= -1;
            y = Math.max(minY, Math.min(maxY, y));
        }
        // Paint new position (CSS absolutely/fixed-positioned element expected)
        button.style.left = `${x}px`;
        button.style.top = `${y}px`;
        requestAnimationFrame(animateButton);
    }

    // Schedule next frame
    initPosition();
    requestAnimationFrame(animateButton);

    // Recenter within bounds on resize without jarring
    window.addEventListener('resize', () => {
        const { minX, minY, maxX, maxY } = bounds();
        x = Math.max(minX, Math.min(maxX, x));
        y = Math.max(minY, Math.min(maxY, y));
        button.style.left = `${x}px`;
        button.style.top = `${y}px`;
    });

    // Hover pause to make clicking easier
    button.addEventListener('mouseenter', () => { paused = true; });
    button.addEventListener('mouseleave', () => { paused = false; });

    // Slow down when cursor gets near the button (proximity assist)
    document.addEventListener('mousemove', (e) => {
        const rect = button.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy);
        const near = 150; // px
        if (dist < near) {
            xSpeed = Math.sign(xSpeed) * 1.2;
            ySpeed = Math.sign(ySpeed) * 1.2;
        } else {
            xSpeed = Math.sign(xSpeed) * 3;
            ySpeed = Math.sign(ySpeed) * 3;
        }
    });

    // Keyboard accessibility: pressing Enter on focused button starts game
    button.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            bounceToGame();
        }
    });
});
