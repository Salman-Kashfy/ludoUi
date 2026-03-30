// Firebase configuration (required for FCM push notifications).
// Replace the values below with your Firebase project settings.

export const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// VAPID public key (Web Push certificate) from Firebase Cloud Messaging settings
export const vapidPublicKey = "YOUR_VAPID_PUBLIC_KEY";
