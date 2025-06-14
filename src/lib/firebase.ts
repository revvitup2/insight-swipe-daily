// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { browserLocalPersistence, getAuth, GoogleAuthProvider, onAuthStateChanged, User } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDb-4a3ePeZjin7FE4Ge-s-fz3Yc3Muscg",
  authDomain: "byteme-ac990.firebaseapp.com",
  projectId: "byteme-ac990",
  storageBucket: "byteme-ac990.appspot.com",
  messagingSenderId: "724857146432",
  appId: "1:724857146432:web:970942d8c422bc49e723a5",
  measurementId: "G-14NN6QNCDY"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Helper function to get current user token with automatic refresh
const getCurrentUserToken = async (): Promise<string | null> => {
  try {
    const user = auth.currentUser;
    if (!user) return null;
    
    // Force refresh the token if it's expired or about to expire
    const tokenResult = await user.getIdTokenResult();
    const expirationTime = new Date(tokenResult.expirationTime).getTime();
    const currentTime = Date.now();
    const bufferTime = 5 * 60 * 1000; // 5 minutes buffer
    
    if (expirationTime - currentTime <= bufferTime) {
      // Token is expired or about to expire, force refresh
      return await user.getIdToken(true);
    }
    
    return tokenResult.token;
  } catch (error) {
    console.error("Error getting user token:", error);
    return null;
  }
};

// Add auth state persistence
const setPersistence = async () => {
  try {
    await auth.setPersistence(browserLocalPersistence);
  } catch (error) {
    console.error("Error setting auth persistence:", error);
  }
};

setPersistence();

export { auth, provider, getCurrentUserToken };