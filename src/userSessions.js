import { doc, onSnapshot, getDoc, updateDoc, setDoc } from "firebase/firestore";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  where
} from "firebase/firestore";
import { db } from "/src/firebaseConfig.js";
import { auth } from "/src/firebaseConfig.js";
import { onAuthStateChanged } from "firebase/auth";
import { currentDocument } from "firebase/firestore/pipelines";

export async function userSession(user, id=true) {

  // NOTE: Assign this function to a variable using await otherwise it will return a broken promise!
  // ex. const session = >>await<< userSession(user);

  // :param id: return either the session ID (id=true, default when omitted) or the session document object (id=false)


  // Guards for if the user object passed in as null, and then double check if the user is even logged in at all
  if (!user) {
    await auth.authStateReady();
    user = auth.currentUser;
    
    if (!user) {
      console.log("User is not logged in; no session available.");
      return false;
    }
  }

  var sessionExists = false;
  var previousSession = null;
  var previousSessionID = null;

    // CHECK IF SESSION ALREADY EXISTS FOR THIS USER BEFORE TRYING TO MAKE A NEW ONE
    const sessionExistsQuery = query(collection(db, "sessions"), where("userID", "==", user.uid));
    const querySnapshot = await(getDocs(sessionExistsQuery))

      querySnapshot.forEach((doc) => {
        // console.log("Searching sessions:")
        // console.log(doc.data())
        if (doc.data().userID == user.uid){
          // console.log("userID:",doc.data().userID)
          console.log("loading into previous user session:", doc.id)
          previousSession = doc;
          previousSessionID = doc.id;
          sessionExists = true;
        }
      });
      if (sessionExists) {
        // console.log("in userSession(): previousSessionID returned as", previousSessionID)
        if (id) {
        return previousSessionID;
        }
        else return previousSession;
      }
      else {return null;}
}

export async function createSession() {
  // console.log("ran createSessions")

  // once again, await turned out to be the fix here, otherwise it will return undefined for the sessionID, so beware
   await auth.authStateReady();
   const user = auth.currentUser;
      
    // If there is no session for that user already, then we can make a new one --------->
  if (await userSession(user)){
    const previousSessionID = await userSession(user);
    // console.log("createSession skipped, returned previousSession.id:", previousSessionID);
    return previousSessionID;
  }

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
