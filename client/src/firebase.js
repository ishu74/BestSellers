// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "e-state-bfe7c.firebaseapp.com",
  projectId: "e-state-bfe7c",
  storageBucket: "e-state-bfe7c.appspot.com",
  messagingSenderId: "765701162433",
  appId: "1:765701162433:web:814473766d3d0a4a965b40"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);