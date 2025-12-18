import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBeooQ92rmAvRd6_tFYow8nfdopz3aYGzQ",
  authDomain: "printamom.firebaseapp.com",
  projectId: "printamom",
  storageBucket: "printamom.firebasestorage.app",
  messagingSenderId: "8660568974",
  appId: "1:8660568974:web:0bce3ad92cfccd122172df",
  measurementId: "G-K4EWVMKM1W",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
