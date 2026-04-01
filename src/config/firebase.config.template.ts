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
    measurementId: "G-MRZ0VE39KX",
    apiKey: "AIzaSyAJMTJ6xxSQwYp37OsyBgKsfGIRGgLs6zw",
    authDomain: "ludo-c1bc3.firebaseapp.com",
    projectId: "ludo-c1bc3",
    storageBucket: "ludo-c1bc3.firebasestorage.app",
    messagingSenderId: "268220915710",
    appId: "1:268220915710:web:e2a72accb3eed28a462aaf",
};

// Firebase Cloud Messaging - Web Push Certificate (VAPID Public Key)
// Get this from Firebase Console > Project Settings > Cloud Messaging > Web configuration
export const vapidPublicKey = "BIMQVOJyTL13-Q4uybSKJ_hZVw0mcn-Dn2rRAl_PVIsmj-jGi4edR9jzQ-Yy8y8tT5IqR32J19a-UeETNdH6tX0";

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
