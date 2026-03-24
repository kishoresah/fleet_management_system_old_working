// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBfmxmL1A1mR3YSGooyaZbR8l1ZAY9tnFU",
  authDomain: "prakash-7c5c4.firebaseapp.com",
  projectId: "prakash-7c5c4",
  storageBucket: "prakash-7c5c4.firebasestorage.app",
  messagingSenderId: "250935373755",
  appId: "1:250935373755:web:cb1367681f1d064c669e9e",
  measurementId: "G-5RQ2ZY8M6P",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
