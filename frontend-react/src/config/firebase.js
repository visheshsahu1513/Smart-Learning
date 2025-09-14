import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration from the Firebase console
const firebaseConfig = {
  apiKey: "googleapikey",
  authDomain: "smartlearning-300c0.firebaseapp.com",
  projectId: "smartlearning-300c0",
  storageBucket: "smartlearning-300c0.firebasestorage.app", // Corrected from your .env file
  messagingSenderId: "868519363199",
  appId: "1:868519363199:web:a3695372e12a0439efb54a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the services we need in other parts of our app
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
