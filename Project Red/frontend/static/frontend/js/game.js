let count = 0;
const counterDisplay = document.getElementById('counter');
const castButton = document.getElementById('castButton');

// if the subtract & reset buttons are wanted, go to game.html & uncomment lines 21-25
const decrementButton = document.getElementById('subtractButton');
const resetButton = document.getElementById('resetButton');

castButton.addEventListener('click', () => {
    count++;
    counterDisplay.textContent = count;
    if (count == 5) {
        alert("wonder what happens if you do this 10x?")
    }
    if (count == 10) {
        alert("No, not 10x in total, 5 x 10")
    }
    if (count == 15) {
        alert("No, not 5 PLUS 10, 5 TIMES 10")
    }
    if (count == 20) {
        alert("No pun here, just keep clicking cast...")
    }
    if (count == 25) {
        alert("Glad you listened! Keep going!!")
    }
    if (count == 30) {
        alert("If it helps, you reached the halfway point at the last message.")
    }
    if (count == 35) {
        alert("....70%")
    }
    if (count == 40) {
        alert("You're actually still clicking cast?")
    }
    if (count == 45) {
        alert("You've come this far, bring it on home!")
    }
    if (count == 50) {
        alert("TIME FOR A PRIZE!")
    }
});

subtractButton.addEventListener('click', () => {
    count--;
    counterDisplay.textContent = count;
});

resetButton.addEventListener('click', () => {
    count = 0;
    counterDisplay.textContent = count;
});