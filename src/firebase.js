// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyB1Dus76rTBSvBPnjKkjhzKltyJ6SIiErY",
  authDomain: "dogochat-app.firebaseapp.com",
  projectId: "dogochat-app",
  storageBucket: "dogochat-app.firebasestorage.app",
  messagingSenderId: "994333853658",
  appId: "1:994333853658:web:d3b05bea2d39c69ed6e2e3",
  measurementId: "G-33M2W1181D",
  databaseURL: "https://dogochat-app-default-rtdb.asia-southeast1.firebasedatabase.app/" // Corrected URL
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const realtimeDb = getDatabase(app);

export { app, auth }; 