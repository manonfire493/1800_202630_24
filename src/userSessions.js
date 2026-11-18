import { doc, onSnapshot, getDoc, updateDoc, setDoc } from "firebase/firestore";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "/src/firebaseConfig.js";
import { auth } from "/src/firebaseConfig.js";
import { onAuthStateChanged } from "firebase/auth";

export async function createSession() {

  // once again, await turned out to be the fix here, otherwise it will return undefined for the sessionID, so beware
  await auth.authStateReady();

  const user = auth.currentUser;

  if (user) {
    var sessions = collection(db, "sessions");

    const sessionRef = await addDoc(sessions, {
      userID: user.uid,
      created_at: serverTimestamp(),
      question_answers: {},
    });

    console.log("session created: ", sessionRef.id);

    return sessionRef.id;
  } 
  else {
    console.log("no session created: user=null");

    return null;
}}
