import { db, auth } from "./firebaseConfig.js";
import { doc, getDoc, getDocs, collection } from "firebase/firestore";
import { updateDoc, increment } from "firebase/firestore";
import { onAuthReady } from "./authentication.js";

import { userSession } from "./userSessions.js";
import { length } from "firebase/firestore/pipelines";

import { incrementUserStatsWith } from "./userStats.js";

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
  // B+f
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

async function displayCompletedTextQuestions(){

  console.log("Attempting to display quiz answers...")

  // Get user
  await auth.authStateReady();
  const user = auth.currentUser;

  // Get session
  const session = await userSession(user, false);
  console.log("current session id:", await userSession(user, true))
  const userAnswers = session.get("question_answers");
  

  // Get snapshot of questions collection so we can interact with it
  const questionsSnap = await getDocs(collection(db, "questions"));

  // Select the front-facing template
  let completeTemplate = document.getElementById("questionCompleteTemplate");

  // Loop through questions just like in displayTextQuestions(), 
  // only this time we will not add any answer buttons or event listeners.
  // It is only to display to the user their already completed quiz.

  var questionNumber = 1;
  questionsSnap.forEach((question) => {
    // create the copy of the template
    let nextAnswer = completeTemplate.content.cloneNode(true);

    var userIsCorrect = null

    //read this question in the loop

    const qID = question.id;
    const qAns = question.get("is_AI");

    var uAnsText = null
    var qAnsText = null
    // Had to look up how to iterate thrugh an Object map because for some reason userAnswers is returned as an Object and not a dict/map

    Object.entries(userAnswers).forEach(([userAnsID, userAnsBool]) => {

      if (userAnsBool){uAnsText="You thought this was AI"}
      else if (userAnsBool==false){uAnsText="You thought this was human written"}
      else {uAnsText="You did not select an answer."}

      if (qAns){qAnsText="This text was AI generated"}
      else if (qAns==false){qAnsText="This text was written by a human"}
   

    

      // console.log("key", userAnsID, "value", userAnsBool);

      if (userAnsID == qID) {
        if (userAnsBool == qAns && (userAnsBool == true || userAnsBool == false)
        ) {
          userIsCorrect = true
          console.log("user was correct, uAns==qAns:", userAnsBool, "==", qAns)
        }
        else if (userAnsBool != qAns && userAnsBool != null) {
          userIsCorrect = false
          console.log("user was incorrect, uAns!=qAns:", userAnsBool, "!=", qAns)
        }
        else {
          userIsCorrect = null;
          console.log("User did not select an answer for question with ID", qID);
        }
      }

      // console.log("pass in the Object forEach");
    });


    var userIsCorrectText = null
    if (userIsCorrect==true){ userIsCorrectText = "Correct!"}
    else{ userIsCorrectText = "Incorrect!"}

    const questionSnap = question.data();

    //populate data in the template
    nextAnswer.querySelector(".question-number").textContent = questionNumber;
    nextAnswer.querySelector(".question-text").textContent = questionSnap.question;

    nextAnswer.getElementById("user-answer").textContent += uAnsText;
    nextAnswer.getElementById("question-answer").textContent += qAnsText;
    nextAnswer.getElementById("user-result").textContent += userIsCorrectText;

    if (userIsCorrect==true){
      nextAnswer.querySelector(".question-container").classList.add("answer-correct");
      console.log(question.get("name"), "is correct.");
    }
    else if (userIsCorrect==false){
      nextAnswer.querySelector(".question-container").classList.add("answer-incorrect");
      console.log(question.get("name"), "is incorrect.");
    }
    else {
      // if answer is null
      nextAnswer.querySelector(".question-container").classList.add("answer-null");
      console.log(question.get("name"), "is unanswered and thus incorrect.");
    }


    document.getElementById("answers-go-here").appendChild(nextAnswer);

    questionNumber++;

  });
}

displayCompletedTextQuestions();