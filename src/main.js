import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import { renderAuthControls } from "./callToAction.js";
import { seedQuestions } from "./addQuestions.js";

// If you have custom global styles, import them as well:
// import '../styles/style.css';

import { db } from "./firebaseConfig.js";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

// Import the file that has the authentication helper function we want to use.
// The function we want to use is called "onAuthReady" which returns the login state
import { onAuthReady } from "/src/authentication.js";

function sayHello() {
  console.log("Hello! (main.js loaded)");
}
document.addEventListener("DOMContentLoaded", sayHello);

// Function to fetch the signed-in user's name and display it in the UI
function showName() {
  // Get the DOM element where the user's name will be displayed
  // Example: <h1 id="name-goes-here"></h1>
  const nameElement = document.getElementById("name-goes-here");

  // Wait until Firebase Auth finishes checking the user's auth state
  onAuthReady(async (user) => {
    // If no user is logged in, redirect to the login page
    if (!user) {
      //   location.href = "login.html";     //Do we have to redirect them away if they are logged out?
      console.log("No user logged in.");

      return; // Stop execution
    }

    // Get the user's Firestore document from the "users" collection
    // Document ID is the user's unique UID
    const userDoc = await getDoc(doc(db, "users", user.uid));

    // Determine which name to display:
    const name = userDoc.exists() // 1️⃣ Use Firestore name if document exists
      ? userDoc.data().name // 2️⃣ Otherwise fallback to Firebase displayName
      : user.displayName || user.email; // 3️⃣ Otherwise fallback to email

    // If the DOM element exists, update its text using a template literal to add "!"
    if (nameElement) {
      nameElement.textContent = `${name}!`;
    }
  });
}
showName();

seedQuestions();

renderAuthControls();

console.log("Main.js finished executing!");
