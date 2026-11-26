import { doc, onSnapshot, getDoc, updateDoc, setDoc } from "firebase/firestore";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "/src/firebaseConfig.js";
import { auth } from "/src/firebaseConfig.js";
import { onAuthStateChanged } from "firebase/auth";
import { currentDocument } from "firebase/firestore/pipelines";

export async function userSession(user, id = true, strictActive=false) {
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
  var isActive = null;

  // We need this stuff to check the user's latest session
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  // CHECK IF SESSION ALREADY EXISTS FOR THIS USER BEFORE TRYING TO MAKE A NEW ONE
  // also get only the latest one
  const sessionExistsQuery = query(
    collection(db, "sessions"),
    where("userID", "==", user.uid),
  );

  const querySnapshot = await getDocs(sessionExistsQuery);

  querySnapshot.forEach((doc) => {
    // console.log("Searching sessions:")
    // console.log(doc.data())
    if (userSnap.data().latest_session_ID == doc.id) {
      // console.log("userID:",doc.data().userID)
      // console.log("loading into previous user session:", doc.id)
      previousSession = doc;
      previousSessionID = doc.id;
      sessionExists = true;
      isActive = doc.get("is_active");
      // console.log("session isActive:", isActive);
    }
  });
  if (sessionExists && (!strictActive || isActive === true)) {
    console.log(
      "in userSession(): previousSessionID returned as",
      previousSessionID,
    );
    if (id) {
      return previousSessionID;
    } else return previousSession;
  } else {
    return null;
  }
}

export async function createSession(override = false) {
  // console.log("ran createSessions")

  // once again, await turned out to be the fix here, otherwise it will return undefined for the sessionID, so beware
  await auth.authStateReady();
  const user = auth.currentUser;

  // If there is no ACTIVE session for that user already, then we can make a new one --------->
    const existingSessionID = await userSession(user, true, override);

    if (existingSessionID) {
        console.log("active session found:", existingSessionID);
        return existingSessionID;
    }

console.log("No active AND existing session. Creating a new one...");
  if (user) { 
    var sessions = collection(db, "sessions");

    const sessionRef = await addDoc(sessions, {
      userID: user.uid,
      created_at: serverTimestamp(),
      question_answers: {},

      is_active: true,

      // these will get updated/created once the session is closed
      session_type: null,
      final_score: null,
    });

    await updateDoc(doc(db, "users", user.uid), {
      latest_session_ID: sessionRef.id,
    });

    console.log("session created: ", sessionRef.id);

    return sessionRef.id;
  } else {
    console.log("no session created: user=null");

    return null;
  }
}

export async function endSession(final_score_percentage = null, type = null) {
  await auth.authStateReady();
  const user = auth.currentUser;

  const sessionDoc = await userSession(user, false);
  const sessionID = sessionDoc.id;

  await updateDoc(doc(db, "sessions", sessionID), {
    is_active: false,
    final_score: final_score_percentage,

    ended_at: serverTimestamp(),
  });

  console.log("Session with ID", sessionID, "was updated and ended.");
}
