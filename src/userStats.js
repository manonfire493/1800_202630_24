import { db } from "./firebaseConfig.js";
import { onAuthReady } from "./authentication.js";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { collection, getDocs, query, where, documentId, setDoc, arrayUnion, arrayRemove } from "firebase/firestore";


let currentUser = null;

onAuthReady(async function (user) {
    if (!user) {
        location.href = "index.html";
    } else {
        currentUser = user;

        // 1. Read the document
        //const userDoc = await getDoc(doc(db, "users", user.uid));
        //const data = userDoc.data() || {};

        // 2. Header: avatar initial, name, email
        //showHeader(data.name || user.displayName || user.email, user.email);

        // 3. Pre-populate each input (empty string if the field doesn't exist yet)
        //fields.forEach(field => {
        //    document.getElementById(field + "Input").value = data[field] || "";
        //});
        // 4. NOW favourites is filled, so draw the cards
        displayStats();
    }
});

function displayStats() {

    const container = document.getElementById("user-stat");

    container.innerHTML = "<h1 class='user-name'></h1> <h2 class='create-date'></h2> <h2 class='quizzes-average-score'></h2> <h2 class='quizzes-started'></h2> <h2 class='quizzes-completed'></h2>";

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

        console.log(userDoc.data().created_at)
        const date_created = userDoc.exists()
            ? new Date(Number.parseInt(userDoc.data().created_at)).toString()
            : null

        container.querySelector('.user-name').textContent = `name: ${name}`;
        container.querySelector('.create-date').textContent = `created on: ${date_created}`;
        
        container.querySelector('.quizzes-average-score').textContent = `Quizzes Average Score: ${userDoc.data().quizzes_average_score}`;
        container.querySelector('.quizzes-started').textContent = `Quizzes Started: ${userDoc.data().quizzes_started}`;
        container.querySelector('.quizzes-completed').textContent = `Quizzes Completed: ${userDoc.data().quizzes_completed}`;
    });
}



