import { collection, addDoc, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "./firebase.js";

async function addTransaction(amount, type, description) {
  const docRef = await addDoc(collection(db, "transactions"), {
    amount: Number(amount),
    type: type, // "depense" ou "revenu"
    description: description,
    createdAt: new Date()
  });
  console.log("✅ Transaction ajoutée:", docRef.id);
}

async function getTransactions() {
  const q = query(collection(db, "transactions"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  const transactions = snapshot.docs.map(doc => ({
    id: doc.id, 
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate()
  }));
  console.log("📊 Tes transactions:", transactions);
}

// TEST : on ajoute 2 transactions
console.log("Ajout des transactions...");
await addTransaction(5000, "depense", "Taxi Dounia");
await addTransaction(15000, "revenu", "Vente marché");
await getTransactions();
