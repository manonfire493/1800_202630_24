import { db, auth } from "./firebaseConfig.js";
import { doc, getDoc, getDocs, collection} from "firebase/firestore";
import { updateDoc, increment } from "firebase/firestore";
import { onAuthReady } from "./authentication.js";

import { userSession } from "./userSessions.js";
import { length } from "firebase/firestore/pipelines";

async function getUser() {
    // okay i dont think this works

    await auth.authStateReady();
    const user = auth.currentUser;
  return user;
}

async function increment_completion(userid) {
  try {
    const userRef = doc(db, "users", userid);
    await updateDoc(userRef, { quizzes_completed: increment(1) });
  } catch (error) {
    console.error("WARNING AN ERROR HAPPENED::", error);
  }
}

function finish_quiz() {
  onAuthReady(function (user) {
    if (user) {
      const uid = user.uid; //this gets user id?

      increment_completion(uid);

      console.log("HOPEFULLY NO ERRORS");
    } else {
      console.log("User not logged in, returning to home");
      location.href = "../index.html";
    }
  });
}

finish_quiz();

async function markUserAnswers() {

    await auth.authStateReady();
    const user = auth.currentUser;

    const session = await userSession(user);
    const userAnswers = session.get("question_answers");

    const questionsSnap = await getDocs(collection(db, "questions"));


    var userScore = 0;
    const maxScore = Object.keys(userAnswers).length;
    console.log("The maximum possible score is", maxScore)

    questionsSnap.forEach((question) => {
      const qID = question.id;
      const qAns = question.get("is_AI");

      console.log(qID);
      console.log(qAns);

      // userAnswers.forEach((answer) => {


      // })
      
    });

  


    // console.log("user:", user.uid);
    console.log("session:", session);
    // console.log(questionsSnap);
    
    console.log("answers: ", userAnswers);


    
}

markUserAnswers();
