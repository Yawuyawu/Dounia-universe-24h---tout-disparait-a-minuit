import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBcOxcvIBxV5Nxi4sh3Za0m9CVzrS1VHd4",
  authDomain: "dounia-universe.firebaseapp.com",
  projectId: "dounia-universe",
  storageBucket: "dounia-universe.firebasestorage.app",
  messagingSenderId: "487792681622",
  appId: "1:487792681622:web:f67122fa2348c3724358b7",
  measurementId: "G-X5MJ1MZSKH"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
