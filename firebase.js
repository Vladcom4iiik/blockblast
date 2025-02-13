import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCRyvHxTZGzi_RyWy7MJNALk0CNLtYaN4Q",
  authDomain: "blockblast-f52e5.firebaseapp.com",
  projectId: "blockblast-f52e5",
  storageBucket: "blockblast-f52e5.firebasestorage.app",
  messagingSenderId: "903306608380",
  appId: "1:903306608380:web:591ebe5db4e9f9f9d0a179",
  measurementId: "G-7GFWNTRDDH"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function saveScore(userId, name, score) {
  await addDoc(collection(db, "scores"), { userId, name, score });
}

export async function getLeaderboard() {
  const q = query(collection(db, "scores"), orderBy("score", "desc"), limit(10));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data());
}