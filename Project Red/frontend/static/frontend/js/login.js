let loginAttempts = 0;

function invalidLogin(e) {
  e.preventDefault(); // stop form submission refresh

  loginAttempts++;

  if (loginAttempts == 1) {
    alert("Invalid Username or Password");
  } else if (loginAttempts == 2) {
    alert("Invalid Username or Password\nMaybe 3rd time's the charm..?");
  } else {
    alert("Hint: Look Up ^");
  }
}

document.getElementById("login-button").addEventListener("click", invalidLogin);

document.addEventListener("DOMContentLoaded", () => {
  const cookieBox = document.getElementById("cookieConsentBox");
  const acceptBtn = document.getElementById("acceptCookies");
  //const rejectBtn = document.getElementById("rejectCookies");
  const headerLoginBtn = document.querySelector(".login-btn"); // true login button
  
  // header login button logic
  if (headerLoginBtn) {
    headerLoginBtn.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "/start"; // redirects user to start.html
         });
        }

    // begin cookies consent logic
  cookieBox.style.display = "block";
  acceptBtn.addEventListener("click", () => {
    cookieBox.style.display = "none"; // allow login
  });

    function setCookie(cname, cvalue, exdays) {
        const d = new Date();
        d.setTime(d.getTime() + (exdays * 1 * 1 * 1 * 1));
        let expires = "expires="+d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    function getCookie(cname) {
        let name = cname + "=";
        let ca = document.cookie.split(';');
        for(let i = 0; i < ca.length; i++) {
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

    window.onload = function() {
        const consentBox = document.getElementById('cookieConsentBox');
        const acceptBtn = document.getElementById('acceptCookies');
        const rejectBtn = document.getElementById('rejectCookies');

        if (getCookie("userConsent") !== "accepted") {
            consentBox.style.display = "block";
        }

        acceptBtn.onclick = function() {
            setCookie("userConsent", "accepted", 0); // Consent for 0 days, so that the user is always prompted with cookies consent message
            consentBox.style.display = "none";
            alert("OMNOMNOM COOKIES OMNOMNOM");
        };

        //rejectBtn.onclick = function() {
          //  window.location.href = "", // page refreshes upon declining cookies
            //consentBox.style.display = "none";
            //alert("Big Mistake. We told you we wanted your cookies.");
        
            rejectBtn.onclick = function() {
                let rejectCount = localStorage.getItem("rejectCount");
                if (rejectCount === null) {
                    rejectCount = 0;
                } else {
                    rejectCount = parseInt(rejectCount, 10);
                }
                rejectCount++;
                localStorage.setItem("rejectCount", rejectCount);
                
                console.log("Reject button pressed " + rejectCount + " times");
                if (rejectCount < 5) {
                    alert("Big Mistake. We told you we wanted your cookies.\nRejections so far: " + rejectCount);
                }
                if (rejectCount >= 5) {
                    alert("At some point, you're going to have to accept this.");
                }
                window.location.reload();
            };

        };
    }
)
// end cookies consent logic


