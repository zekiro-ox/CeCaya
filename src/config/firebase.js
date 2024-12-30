import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAEqDjffrLm41jsGlrj55vBIKpmBadoDjs",
  authDomain: "cecaya-586fd.firebaseapp.com",
  projectId: "cecaya-586fd",
  storageBucket: "cecaya-586fd.firebasestorage.app",
  messagingSenderId: "390783143419",
  appId: "1:390783143419:web:26ab048626073ca6b40f5e",
  measurementId: "G-5WFHJFXV2E",
};

// Initialize Firebase
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
