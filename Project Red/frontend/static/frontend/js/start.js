function bounceToGame() {
  window.location.href = "/game";
}

document.getElementById("bouncingButton").addEventListener("click", bounceToGame);

document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('bouncingButton');
    let x = 0;
    let y = 0;
    let xSpeed = 3;
    let ySpeed = 3;

    function animateButton() {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const buttonWidth = button.offsetWidth;
        const buttonHeight = button.offsetHeight;

        x += xSpeed;
        y += ySpeed;

        if (x + buttonWidth > screenWidth || x < 0) {
            xSpeed *= -1;
        }
        if (y + buttonHeight > screenHeight || y < 0) {
            ySpeed *= -1;
        }
        button.style.left = `${x}px`;
        button.style.top = `${y}px`;
        requestAnimationFrame(animateButton);
    }
    animateButton(); 
});