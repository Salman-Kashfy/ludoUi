/* 
  FIREBASE CONFIGURATION TEMPLATE
  ================================
  
  Copy this file as firebase.config.ts and fill in your Firebase credentials.
  You can get these from Firebase Console > Project Settings > Your apps > Web app
  
  For FCM (Push Notifications):
  1. Go to Firebase Console > Cloud Messaging
  2. Copy the "Server API Key" (for backend)
  3. Generate Web Push Certificate (VAPID key) from Web configuration
  4. Use the Public Key here
  
  Steps:
  1. Rename this file to: firebase.config.ts
  2. Fill in your Firebase config
  3. Keep this file in ludoUi/src/config/
*/

export const firebaseConfig = {
    apiKey: "AIzaSyCCKx91J1d_--8BuDIOAZCLHRG9o5224hs",
    authDomain: "react-project-1-30116.firebaseapp.com",
    projectId: "react-project-1-30116",
    storageBucket: "react-project-1-30116.firebasestorage.app",
    messagingSenderId: "695385686838",
    appId: "1:695385686838:web:1020b9610a87085f7e6997",
    measurementId: "G-MRZ0VE39KX"
};

// Firebase Cloud Messaging - Web Push Certificate (VAPID Public Key)
// Get this from Firebase Console > Project Settings > Cloud Messaging > Web configuration
export const vapidPublicKey = "qCkXGn2-jGcJkOkW6I05qfx_7lQz_LJPxE5xC4usMlU";

/*
  Backend Configuration for Firebase Admin SDK:
  
  The backend needs firebase-admin to send FCM messages.
  On the backend:
  
  1. Install: npm install firebase-admin
  2. Download Service Account Key from Firebase Console > Project Settings > Service Accounts
  3. Save as ludo/src/config/firebase-service-account.json
  4. Backend will use this for server-side FCM notifications
  
  Example usage in backend:
  - Fetch customer's FCM tokens from customer_devices table
  - Send message to those tokens via Firebase Admin SDK
  - Customer receives notification on web/mobile
*/
