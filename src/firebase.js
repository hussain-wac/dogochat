// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB1Dus76rTBSvBPnjKkjhzKltyJ6SIiErY",
  authDomain: "dogochat-app.firebaseapp.com",
  projectId: "dogochat-app",
  storageBucket: "dogochat-app.firebasestorage.app",
  messagingSenderId: "994333853658",
  appId: "1:994333853658:web:d3b05bea2d39c69ed6e2e3",
  measurementId: "G-33M2W1181D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export {app, auth}