function showAlert() {
  alert("This is your alert window!");
}
document.getElementById("alert-btn").addEventListener("click", showAlert);


function randomBackground() {
  const colors = ["red", "blue", "green", "yellow", "purple", "pink"];
  document.body.style.backgroundColor = 
    colors[Math.floor(Math.random() * colors.length)];
}


function randomMessage() {
  const messages = [
    "You win absolutely nothing!",
    "Surprise! It's another popup.",
    "Click again if you dare...",
    "Did you expect a prize?"
  ];
  document.getElementById("game-area").innerText =
    messages[Math.floor(Math.random() * messages.length)];
}

// BEGIN RANDOM UI ADDITION FUNCTIONS //

// click to win, you lost button //
function changeText() {
  var x = document.getElementById("youLost");
  if (x.innerHTML === "CLICK HERE TO WIN!") {
    x.innerHTML = "YOU LOST!";
  } else {
    x.innerHTML = "beep beep";
  }
}

// END RANDOM UI ADDITION FUNCTIONS //
