import { initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBcOxcvIBxV5Nxi4sh3Za0m9CVzrS1VHd4",
  authDomain: "dounia-universe.firebaseapp.com",
  projectId: "dounia-universe",
  storageBucket: "dounia-universe.firebasestorage.app",
  messagingSenderId: "487792681622",
  appId: "1:487792681622:web:f67122fa2348c3724358b7"
};

const app = initializeApp(firebaseConfig);

export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false
});
