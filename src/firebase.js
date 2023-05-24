// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAIHv06jUlv9ngx4iGN70WIDZ_yJ4vGdB4",
  authDomain: "project01-cfdc9.firebaseapp.com",
  projectId: "project01-cfdc9",
  storageBucket: "project01-cfdc9.appspot.com",
  messagingSenderId: "534970389297",
  appId: "1:534970389297:web:9269613a760f5dc3751610",
  measurementId: "G-HQY99BP8M6",
};

export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
