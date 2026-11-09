import { db } from "./firebaseConfig.js";
import { doc, getDoc } from "firebase/firestore";
import { updateDoc, increment } from "firebase/firestore";
import { onAuthReady } from "./authentication.js";

async function increment_completion(userid){
    try{
        const userRef = doc(db, "users", userid);
        await updateDoc(userRef, { quizzes_completed: increment(1) });
    } catch (error){
        console.error("WARNING AN ERROR HAPPENED::", error);
    }
}

function finish_quiz() {
    onAuthReady(function(user) {
        if (user) {
            const uid = user.uid; //this gets user id?
            increment_completion(uid);
            console.log("HOPEFULLY NO ERRORS");
        } else {
            location.href = "../index.html";
        }
    });
}

finish_quiz()