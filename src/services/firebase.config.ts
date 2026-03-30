// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyCCKx91J1d_--8BuDIOAZCLHRG9o5224hs",
  authDomain: "react-project-1-30116.firebaseapp.com",
  projectId: "react-project-1-30116",
  storageBucket: "react-project-1-30116.firebasestorage.app",
  messagingSenderId: "695385686838",
  appId: "1:695385686838:web:1020b9610a87085f7e6997",
  measurementId: "G-MRZ0VE39KX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// VAPID public key for FCM
export const vapidPublicKey = "BE7VjJKfspyz0I08a4XYhgmyUu5Ye1P2eAVS7OeXVi-8QO68eB2JedL3p-wXrmFhESIXmv99a95Ddhh7Fz0UmPw";