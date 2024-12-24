// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
