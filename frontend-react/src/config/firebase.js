import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration from the Firebase console
const firebaseConfig = {
  apiKey: "googleapikey",
  authDomain: "your domain",
  projectId: "id",
  storageBucket: "buket id", // Corrected from your .env file
  messagingSenderId: "sender id",
  appId: "appid"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the services we need in other parts of our app
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;

