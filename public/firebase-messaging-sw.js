// Firebase Cloud Messaging Service Worker
// This handles push notifications received even when the app is closed

importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging.js');

// Initialize Firebase in the service worker
// Note: These values are public and safe to be here (they're in public folder)
const firebaseConfig = {
    apiKey: "AIzaSyCCKx91J1d_--8BuDIOAZCLHRG9o5224hs",
    authDomain: "react-project-1-30116.firebaseapp.com",
    projectId: "react-project-1-30116",
    storageBucket: "react-project-1-30116.appspot.com",
    messagingSenderId: "695385686838",
    appId: "1:695385686838:web:1020b9610a87085f7e6997",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('Background message received:', payload);

    const notificationTitle = payload.notification?.title || 'Notification';
    const notificationOptions = {
        body: payload.notification?.body || 'You have a new message',
        icon: payload.notification?.icon || '/ludo-icon.png',
        badge: payload.notification?.badge || '/ludo-badge.png',
        data: payload.data || {},
        tag: 'booking-notification',
        requireInteraction: true // Keep notification until user interacts
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event.notification);
    event.notification.close();

    // Open app or bring to focus
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Check if app is already open
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            // If not open, open new window
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});
