// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// 👇 replace with your Firebase project config (from Firebase console)
const firebaseConfig = {
  apiKey: "AIzaSyBEm1oRx4Oo8Lkj0tqfzdFV7NhBjv9Jg80",
  authDomain: "influencer-crm-28899.firebaseapp.com",
  projectId: "influencer-crm-28899",
  storageBucket: "influencer-crm-28899.firebasestorage.app",
  messagingSenderId: "268810903639",
  appId: "1:268810903639:web:dd1431d7b26ca24277c312",
  measurementId: "G-1HL5HT9SNC",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const db = getFirestore(app);
export const auth = getAuth(app);
