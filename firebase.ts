import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// This is a public Firebase project configuration for demos.
// It's a more stable instance that allows read and write operations,
// which is necessary for the app's update functionality to work.
const firebaseConfig = {
  authDomain: "fir-ui-demo-53373.firebaseapp.com",
  projectId: "fir-ui-demo-53373",
  storageBucket: "fir-ui-demo-53373.appspot.com",
};

// Initialize Firebase using the modular SDK.
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service.
export const db = getFirestore(app);

// Initialize Firebase Storage
export const storage = getStorage(app);