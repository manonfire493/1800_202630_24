import { db } from "./firebaseConfig.js";
import { doc, onSnapshot, getDoc, updateDoc } from "firebase/firestore";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import { createSession } from "./userSessions.js";

/* Difficulty levels for questions: Easy, Medium, Hard, Insane 
FIELDS 

type*:
name:
difficulty:
question*:
isAI*:
author:
theme:
source:

* = required
 */

export function addQuizQuestions() {
  const questions = collection(db, "questions");

  console.log("Adding preset quiz data... ");

  // Quiz-Text Questions

  addDoc(questions, {
    type: "Quiz-Text",
    name: "Question 1",
    difficulty: "Hard",
    question: `By my troth, thou hast an open hand. These wise
              men that give Fools money get themselves a good
              report—after fourteen years’ purchase.`,
    is_AI: false,
    author: "William Shakespeare",
    theme: "Shakespeare",
    source:
      "https://www.folger.edu/explore/shakespeares-works/twelfth-night/read/4/1/",
    user_answer: null,
  });
  addDoc(questions, {
    type: "Quiz-Text",
    name: "Question 2",
    difficulty: "Hard",
    question: `Upon the silver moon, my heart doth wander, 
                seeking the fair light of thy countenance.
              For in thy absence, every star doth weep, 
              and all the heavens mourn the loss of thee.`,
    is_AI: true,
    author: "ChatGPT",
    theme: "Shakespeare",
    source: "https://chatgpt.com/",
    user_answer: null,
  });
  addDoc(questions, {
    type: "Quiz-Text",
    name: "Question 3",
    difficulty: "Medium",
    question: `This was the noblest Roman of them all.
              All the conspirators save only he
              Did that they did in envy of great Caesar.
              He only in a general honest thought
              And common good to all made one of them.`,
    is_AI: false,
    author: "William Shakespeare",
    theme: "Shakespeare",
    source:
      "https://www.folger.edu/explore/shakespeares-works/julius-caesar/read/5/5/",
    user_answer: null,
  });
  addDoc(questions, {
    type: "Quiz-Text",
    name: "Question 4",
    difficulty: "Medium",
    question: `Hark! What sudden tempest stirs the quiet night, 
              and wakes the dormant passions of my soul?
              By yonder bleeding moon, 
              I swear thy heart shall answer for this cruel, untimely theft.`,
    is_AI: true,
    author: "Google Gemini",
    theme: "Shakespeare",
    source: "https://gemini.google.com",
    user_answer: null,
  });
  addDoc(questions, {
    type: "Quiz-Text",
    name: "Question 5",
    difficulty: "Easy",
    question: `Hark, the digital oracle doth spin its glowing web, 
    wherein thy weary soul seeketh solace from the endless toil. 
    Yet lo, upon closer gaze, the modern cadence betrays the mummer's ghost, 
    revealing naught but silicon and binary breath.`,
    is_AI: true,
    author: "Google Gemini",
    theme: "Shakespeare",
    user_answer: null,
  });
}

export async function seedQuestions() {
  //make reference to the questions collection
  const questions = collection(db, "questions");

  //read this hikesRef to go through checks later:
  const questionsSnapshot = await getDocs(questions);

  //if questions collection does not exist, then write
  if (questionsSnapshot.empty) {
    console.log("Seeding the questions collection...");
    addQuizQuestions();
  } else {
    //else do nothing
    console.log("Pre-existing questions collection detected.");
  }
}

async function updateAnswer(sessionID, questionID, answer) {
  // "inspiration" taken from demos as usual (aka i just copied and restructured where necessary)

    // Find the session document
    const sessionRef = await doc(db, "sessions", sessionID);

    // updates the answer for the specific question, presumably linked to an event listener
    // square brackets to get the specific question as an object and not just a string,
    // and access that key to update its value with `answer` as a boolean from param
    await updateDoc(sessionRef, {
        [`question_answers.${questionID}`]: answer
    });

    console.log("Answer updated:", answer)
  }

async function setupAnswerButton(newQuestion, questionID, sessionID) {

   // Find the true/false button inside this specific questionID associated block
    const humanWrittenButton = newQuestion.querySelector(".question-answer-false");
    const AIWrittenButton = newQuestion.querySelector(".question-answer-true");

    console.log("Added question with ID:", questionID);

    humanWrittenButton.addEventListener("click", async () => {

        if(humanWrittenButton.classList.contains("btn-secondary")){

          // If the question was already selected, make it appear unselected
          // And also unselected it in the DB by changing answer to null again
          humanWrittenButton.classList.replace("btn-secondary", "btn-success")
          await updateAnswer(sessionID, questionID, null);
          console.log("Unselected 'Human written'");
        }
        else {
          // If the question was unselected
          humanWrittenButton.classList.replace("btn-success", "btn-secondary")
          await updateAnswer(sessionID, questionID, false);
           console.log("User selected 'Human written'");
        }

        if (AIWrittenButton.classList.contains("btn-secondary")){
          // Change the other button to unselected
          AIWrittenButton.classList.replace("btn-secondary", "btn-warning")
        }
       

    });

    AIWrittenButton.addEventListener("click", async () => {

        if(AIWrittenButton.classList.contains("btn-secondary")){
          // If the question was already selected, make it appear unselected
          // And also unselected it in the DB by changing answer to null again
          AIWrittenButton.classList.replace("btn-secondary", "btn-warning")
          await updateAnswer(sessionID, questionID, null);
          console.log("Unselected 'This is AI!'");
        }
        else { 
          // If the question was unselected
          AIWrittenButton.classList.replace("btn-warning", "btn-secondary")
          await updateAnswer(sessionID, questionID, true);
          console.log("User selected 'This is AI!'");
        }

        if (humanWrittenButton.classList.contains("btn-secondary")){
          // Change the other button to unselected
          humanWrittenButton.classList.replace("btn-secondary", "btn-success")
        }

        

    });

}


export async function displayTextQuestions(sessionID) {
  // reference to the hikes colleciton
  const questions = collection(db, "questions");

  // get the template from front-end
  let questionTemplate = document.getElementById("textQuestionTemplate");

  // read the questions colelciton
  const querySnapshot = await getDocs(questions);

  //loop through the questions, and update the question number
  var questionNumber = 1;
  querySnapshot.forEach((doc) => {
    // create the copy of the template
    let newQuestion = questionTemplate.content.cloneNode(true);

    //read this question in the loop
    const question = doc.data();

    //populate data in the template
    newQuestion.querySelector(".question-number").textContent = questionNumber;
    newQuestion.querySelector(".question-text").textContent = question.question;
    setupAnswerButton(newQuestion, doc.id, sessionID);

    document.getElementById("questions-go-here").appendChild(newQuestion);

    questionNumber++;
  });
}

// new and improved way to display text questions, now accounting for sessionID
// also added await to everything because it seemed to mess some stuff up without it
async function initializeQuiz() {

    const sessionID = await createSession();

    // debug log incase the sessionID doesn't come through, check if it makes it through initializeQuiz()
    //  console.log("sessionID received:", sessionID); 

    await displayTextQuestions(sessionID);

}

initializeQuiz();
