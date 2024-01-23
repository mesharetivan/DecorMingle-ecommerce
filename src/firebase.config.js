import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCFHAMqG1JEYdSYaaRolRfe9SC7bolpxHE",
  authDomain: "decormingle-d2e57.firebaseapp.com",
  projectId: "decormingle-d2e57",
  storageBucket: "decormingle-d2e57.appspot.com",
  messagingSenderId: "349467574450",
  appId: "1:349467574450:web:38b8330307a833589b89ab",
  measurementId: "G-W8WQB93P1G",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
