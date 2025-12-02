// -------------------- Firebase Setup --------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInAnonymously,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "AIzaSyC-Swj7pnY-v6Uju0UWEL5LIh44-lKPVVo",
  authDomain: "budget-tracker-f4f60.firebaseapp.com",
  projectId: "budget-tracker-f4f60",
  storageBucket: "budget-tracker-f4f60.firebasestorage.app",
  messagingSenderId: "202551880192",
  appId: "1:202551880192:web:7db9fdece7747fd0ac86e5",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInAnonymously,
  doc,
  setDoc,
  onSnapshot,
  serverTimestamp,
};

// Helper: user document path
export function userBudgetDocRef(uid) {
  return doc(db, "users", uid, "budget", "data");
}
