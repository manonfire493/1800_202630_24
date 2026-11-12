import { db } from "./firebaseConfig.js";
import { doc, onSnapshot, getDoc, updateDoc } from "firebase/firestore";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

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

async function setupAnswerButton(question, qname) {
  // Read questions collection

  // [FRONT END] Find the answer buttons (there are 2)
  const buttons = document.querySelectorAll(".btn-ans");
  // const answered = question.querySelector('.answer');

  // [FRONT END] Already selected? Do the thing
  //             (favourites was read from Firestore in Step 2.3)
  // if (answered !== null) {
  //     button.classList.replace("btn-success", "btn-info");
  // }

  // Connect it: "for each answer button, when you are clicked, do the thing"
  buttons.forEach((button) => {
    button.addEventListener("click", function () {
      if (button.classList.contains("question-answer-true")) {
        var answer = true;
      } else {
        var answer = false;
      }

      question.querySelector.user_answer = answer;
      console.log("User decided that " + question.name + " is " + answer);
    });
  });
}

export async function displayTextQuestions() {
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
    setupAnswerButton(newQuestion, question.name);

    document.getElementById("questions-go-here").appendChild(newQuestion);

    questionNumber++;
  });
}

displayTextQuestions();
