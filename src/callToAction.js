// Import Firebase authentication tools
import { logoutUser } from "./authentication.js"; // Our function to log out the user
import { onAuthReady } from "./authentication.js"; // Our function co get authenticated user

class SiteCTA extends HTMLElement {
  constructor() {
    super();
  }
}

function CTAscriptLoaded() {
  console.log("callToAction.js loaded!");
}
document.addEventListener("DOMContentLoaded", CTAscriptLoaded);

export function renderAuthControls() {
  const CTAsection = document.getElementById("CTA-section"); // Get entire CTA <section>
  const authCTA = document.getElementById("CTA-auth-btn"); // Find #authControls inside this navbar


  // Invisible placeholder prevents layout shifting while Firebase checks login status
  // authCTA.outerHTML = `<div class="btn btn-outline-light" style="visibility: hidden; min-width: 80px;">Log out</div>`;

  // Pass a callback that runs when Firebase reports the login status
  onAuthReady(function (user) {
    // Receives the user object (or null)

    if (user) {
      // User is logged in
      authCTA.innerHTML = `<button class="btn btn-outline-light" id="signOutBtn" type="button" style="min-width: 80px;">Log out</button>`;

      const signOutBtn = document.getElementById("signOutBtn");
      signOutBtn.addEventListener("click", logoutUser);

      // Optional segment: just hide the entire hero if the user is logged in:
      CTAsection.outerHTML = `<section class="newsletter-cta py-5 bg-light" id="CTA-section" style="display:none"></section>`

      console.log("User is logged in. Call-to-action hidden.");

    } else {
      // User is NOT logged in, and gets redirected to login page if user clicks the login button
      console.log("User is not logged in");
      authCTA.innerHTML = `<a class="btn btn-outline-light" id="loginBtn" href="login.html" style="min-width: 80px;">Log in</a>`;
      
      
    }
  });
}
