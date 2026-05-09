import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase.js";

console.log("Test Firestore...");

addDoc(collection(db, "test"), {
  message: "Ça marche depuis Termux",
  date: new Date()
})
.then((docRef) => {
  console.log("✅ Doc créé dans Firestore:", docRef.id);
  process.exit(0);
})
.catch((err) => {
  console.log("❌ Erreur Firestore:", err.code, err.message);
  process.exit(1);
});
