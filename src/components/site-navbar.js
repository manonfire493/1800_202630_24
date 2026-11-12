// Import Firebase authentication tools
import { logoutUser , onAuthReady} from '/src/authentication.js';   // Our function to log out the user

class SiteNavbar extends HTMLElement {
    constructor() {
        super();
        this.renderNavbar();
        this.renderAuthControls(); 
    }

    renderNavbar() {
        this.innerHTML = `
            <!-- Navbar: single source of truth -->
            <nav class="navbar navbar-expand-lg navbar-light bg-info">
                <div class="container-fluid">
                    <a class="navbar-brand" href="/">
                        <img src="/images/evilrobot.png" height="36">
                        Am I Sure?
                    </a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent"
                        aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul class="navbar-nav me-auto">
                            <li class="nav-item">
                                <a class="nav-link" href="../index.html">Home</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="../stats.html">Stats</a>
                            </li>
                        </ul>
                        <div class="d-flex align-items-center gap-2 ms-lg-2" id="rightControls">
                            <div id="authControls" class="auth-controls d-flex align-items-center gap-2 my-2 my-lg-0">
                                <!-- populated by JS in renderAuthControls(), change it from there -rayyan-->
                            </div>
                        </div>

                    </div>
                </div>
            </nav>
        `;
    }
    /**
 * Displays Log in or Log out button in the navbar based on Firebase authentication status.
 * Updates automatically when the user's login status changes.
 * Uses callbacks to detect auth changes and handle the Log out button click.
 */
renderAuthControls() {
    const authControls = this.querySelector('#authControls'); // Find #authControls inside this navbar

    // Invisible placeholder prevents layout shifting while Firebase checks login status
    authControls.innerHTML = `<div class="btn btn-outline-light" style="visibility: hidden; min-width: 80px;">Log out</div>`;

    // Pass a callback that runs when Firebase reports the login status
    onAuthReady(function(user) { // Receives the user object (or null)

        if (user) { // User is logged in
            authControls.innerHTML = `<button class="btn btn-outline-light" id="signOutBtn" type="button" style="min-width: 80px;">Log out</button>`;

            const signOutBtn = authControls.querySelector('#signOutBtn');
            signOutBtn.addEventListener('click', logoutUser); // Callback: runs when Log out is clicked

        } else { // User is NOT logged in, and gets redirected to login page if user clicks the login button
            authControls.innerHTML = `<a class="btn btn-outline-light" id="loginBtn" href="/login.html" style="min-width: 80px;">Log in</a>`;
        }
    });
}
}

customElements.define('site-navbar', SiteNavbar);
console.log("site-navbar.js loaded")






// Old navbar:
/* <nav class="navbar bg-body-tertiary fixed-top">
        <div class="container-fluid">
            <a class="navbar-brand" href="index.html">App name</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar"
                aria-controls="offcanvasNavbar" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasNavbar"
                aria-labelledby="offcanvasNavbarLabel">
                <div class="offcanvas-header">
                    <h5 class="offcanvas-title" id="offcanvasNavbarLabel">Menu</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                </div>
                <div class="offcanvas-body">
                    <ul class="navbar-nav justify-content-end flex-grow-1 pe-3">
                        <li class="nav-item">
                            <a class="nav-link" href="#"> <img src="./images/settings.png" alt="Bootstrap" width="30"
                                    height="30"> Settings</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#"> <img src="./images/help.png" alt="Bootstrap" width="30"
                                    height="30"> How to play</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="stats.html"> <img src="./images/stats.png" alt="Bootstrap"
                                    width="30" height="30"> Stats</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#"> <img src="./images/theme.png" alt="Bootstrap" width="30"
                                    height="30"> Theme</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#"> <img src="./images/about-us.png" alt="Bootstrap" width="30"
                                    height="30"> About Us</a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </nav>

*/