import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDYEoDose_VZX_wcFgeLfjB0A7Nn8FgyfI",
  authDomain: "xpress-car-bike-care-cad1d.firebaseapp.com",
  projectId: "xpress-car-bike-care-cad1d",
  storageBucket: "xpress-car-bike-care-cad1d.firebasestorage.app",
  messagingSenderId: "1099318442377",
  appId: "1:1099318442377:web:f53d5cd8d73da37a81c958",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Force the Google account chooser to appear every time, instead of
// silently reusing whichever Google account is already signed in.
googleProvider.setCustomParameters({ prompt: "select_account" });
