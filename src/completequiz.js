import { db, auth } from "./firebaseConfig.js";
import { doc, getDoc, getDocs, collection } from "firebase/firestore";
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

  const session = await userSession(user, false);
  const userAnswers = session.get("question_answers");

  const questionsSnap = await getDocs(collection(db, "questions"));

  var userScore = 0;
  const maxScore = Object.keys(userAnswers).length;
  console.log("The maximum possible score is", maxScore);

  questionsSnap.forEach((question) => {
    const qID = question.id;
    const qAns = question.get("is_AI");
    console.log(question.get("name"), "is ", qAns);
    console.log(qID);

    // Had to look up how to iterate thrugh an Object map because for some reason userAnswers is returned as an Object and not a dict/map

    Object.entries(userAnswers).forEach(([userAnsID, userAnsBool]) => {
      // console.log("key", userAnsID, "value", userAnsBool);

      if (userAnsID == qID) {
        if (userAnsBool == qAns) {
          userScore++;
        }
      }

      // console.log("pass in the Object forEach");
    });
    // console.log("pass in the snap.forEach");
  });

  // console.log("user:", user.uid);
  // console.log("session:", session);
  // console.log(questionsSnap);
  // console.log("answers: ", userAnswers);

  console.log("User's final score: ", userScore, "/", maxScore);
  showScore(userScore, maxScore);

}

function showScore(score, max){
  // Select the elements on "quiz_complete.html"
  const headerDisplay = document.getElementById("completed-header");
  const titleDisplay = document.getElementById("score-percentage");
  const userScoreDisplay = document.getElementById("quiz-score");
  const maxScoreDisplay = document.getElementById("quiz-max");

  const results = document.getElementsByClassName("result");

  // Show the final result stats

  const scorePercentage = score/max * 100;

  titleDisplay.textContent = scorePercentage + "%";
  userScoreDisplay.textContent = score;
  maxScoreDisplay.textContent = max;

  // Determine what to show based on what the user scored:
  // i may have made too many thresholds ngl

  if (scorePercentage == 100){
  // PERFECT SCORE!
  headerDisplay.textContent += "Perfect score!"

  headerDisplay.classList.add("score-S")

  }
  else if (scorePercentage >= 95){
  // A+
  headerDisplay.textContent += "A+"

  headerDisplay.classList.add("score-A")

  }
  else if (scorePercentage >= 90){
  // A
  headerDisplay.textContent += "A+"

  headerDisplay.classList.add("score-A")

  }
  else if (scorePercentage >= 85){
  // A-
  headerDisplay.textContent += "A-"

  headerDisplay.classList.add("score-A")

  }
  else if (scorePercentage >= 80){
  // B+
  headerDisplay.textContent += "B+"

  headerDisplay.classList.add("score-B")
  }
  else if (scorePercentage >= 75){
  // B
  headerDisplay.textContent += "B"

  headerDisplay.classList.add("score-B")
  
  }
  else if (scorePercentage >= 70){
  // B-
  headerDisplay.textContent += "B-"

  headerDisplay.classList.add("score-B")

  }
  else if (scorePercentage >= 65){
  // C+
  headerDisplay.textContent += "C+"

  headerDisplay.classList.add("score-C")
  }
  else if (scorePercentage >= 60){
  // C
  headerDisplay.textContent += "C"

  headerDisplay.classList.add("score-C")
  }
  else if (scorePercentage >= 55){
  // C-
  headerDisplay.textContent += "C-"

  headerDisplay.classList.add("score-C")
  }
  else if (scorePercentage >= 50){
  // D
  headerDisplay.textContent += "Well, you passed..."

  headerDisplay.classList.add("score-D")
  }
  else if (0 < scorePercentage < 50){
  // F
  headerDisplay.textContent = "Better luck next time..."

  headerDisplay.classList.add("score-F")
  }
  else {
    console.error("No score margin for likely invalid value: ", scorePercentage)
  }

  

}

markUserAnswers();
