//document.addEventListener("DOMContentLoaded", function () {

document.addEventListener("DOMContentLoaded", () => {
  const cookieBox = document.getElementById("cookieConsentBox");
  const acceptBtn = document.getElementById("acceptCookies");
  const rejectBtn = document.getElementById("rejectCookies");

  // Always force it to show
  cookieBox.style.display = "block";

  acceptBtn.addEventListener("click", () => {
    cookieBox.style.display = "none"; // allow login
  });

  rejectBtn.addEventListener("click", () => {
    location.reload(); // gag: refresh page so it's stuck
  });
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
            setCookie("userConsent", "accepted", 0); // Consent for 0 days
            consentBox.style.display = "none";
        };

        rejectBtn.onclick = function() {
            window.location.href = "", // page refreshes upon declining cookies
            consentBox.style.display = "none";
            alert("Big Mistake. We told you we wanted your cookies.");
        };
    };
