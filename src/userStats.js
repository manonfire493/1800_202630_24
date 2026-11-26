import { db, auth} from "./firebaseConfig.js";
import { onAuthReady } from "./authentication.js";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
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
        
        container.querySelector('.quizzes-average-score').textContent = `Quizzes Average Score: ${userDoc.data().quizzes_average_score.toFixed(2)}%`;
        container.querySelector('.quizzes-started').textContent = `Quizzes Started: ${userDoc.data().quizzes_started}`;
        container.querySelector('.quizzes-completed').textContent = `Quizzes Completed: ${userDoc.data().quizzes_completed}`;
    });
}

export async function incrementUserStatsWith(
    {update_games_average_score=0, add_games_completed=0, add_games_started=0,
    add_quizzes_completed=0, add_quizzes_started=0, update_quizzes_average_score=0} = {}
){
    // Technically you can run this function with no parameters
    // It will just be a waste of time
    // IMPORTANT: Make sure to use keyword arguments when calling this function,
    // DO NOT USE POSITIONAL ARGUMENTS
    // Apparently JavaScript doesn't support this the same way python does, so use this format with example params:
    // incrementUserStatsBy({ add_games_average_score: 1, add_quizzes_completed: 1" } = {});
    // By passing an object = {} param, you can omit what you don't want to increment and only mention what you do want.
    // Or if you really don't want to do that you can just set all positional arguments except yours to 0

    // params update_..._score: must pass a float representing a PERCENTAGE OUT OF 100, NOT A RAW SCORE

    await auth.authStateReady();
    const user = auth.currentUser;
    const userid = user.uid;

     if (update_games_average_score>=0 || update_quizzes_average_score>=0){
      try {
        const userRef = doc(db, "users", userid);
        const userSnap = await getDoc(userRef);
        const currentQuizAvg = userSnap.get("quizzes_average_score");
        const quizzesCompleted = userSnap.get("quizzes_completed");
       
        const currentGameAvg = userSnap.get("games_average_score");
        const gamesCompleted = userSnap.get("games_completed");

        if (update_quizzes_average_score >= 0){
            console.log("Adding quiz score:", update_quizzes_average_score);
            console.log("Current quiz average:", currentQuizAvg);
            console.log("Quizzes completed:", quizzesCompleted);

            // Calculate new average also using quizzesCompleted+1 (+1 is for the new update)
            const newQuizAvg = (update_quizzes_average_score + (currentQuizAvg * quizzesCompleted)) / (quizzesCompleted + 1);
            // console.log("Calculated new quiz average:", newQuizAvg)
             await updateDoc(userRef, { 
            quizzes_average_score: newQuizAvg,

        });
        console.log("Updated users average quiz score with", update_quizzes_average_score, "% as", newQuizAvg);
        }
        if (update_games_average_score >= 0){

            // Calculate new average using gamesCompleted+1
            const newGameAvg = (update_games_average_score + (currentGameAvg * gamesCompleted)) / (gamesCompleted + 1);
            // console.log("Calculated new game average:", newGameAvg)
             await updateDoc(userRef, { 
            games_average_score: newGameAvg, 

        });
        console.log("Updated users average game score with", update_games_average_score, "% as", newGameAvg);
        }
      } catch (error){
        console.error("Encountered error while updating user stats:", error);
      }
    }

    if (add_games_completed>0 || add_games_started>0 || add_quizzes_completed>0 || add_quizzes_started>0){
      try {
        const userRef = doc(db, "users", userid);
        await updateDoc(userRef, { 
            games_completed: increment(add_games_completed), 
            games_started: increment(add_games_started),
            quizzes_completed: increment(add_quizzes_completed), 
            quizzes_started: increment(add_quizzes_started),

        });
        console.log(
            `Incremented: 
            games_started+= ${add_games_completed}, 
            games_completed+= ${add_games_completed}, 
            quizzes_started+= ${add_quizzes_started},
            quizzes_completed+= ${add_quizzes_completed}`
        )
      } catch (error) {
        console.error("Encountered error while incrementing user stats:", error);
      }
    }

}



