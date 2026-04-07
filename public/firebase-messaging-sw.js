importScripts('https://www.gstatic.com/firebasejs/10.1.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.1.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyAJMTJ6xxSQwYp37OsyBgKsfGIRGgLs6zw",
    authDomain: "ludo-c1bc3.firebaseapp.com",
    projectId: "ludo-c1bc3",
    storageBucket: "ludo-c1bc3.firebasestorage.app",
    messagingSenderId: "268220915710",
    appId: "1:268220915710:web:e2a72accb3eed28a462aaf",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

console.log('[SW] Firebase Service Worker Ready');

messaging.onBackgroundMessage((payload) => {
    console.log('[SW] 📨 Background message received:', payload);
    console.log('[SW] 📨 Notification data:', payload.notification);
    console.log('[SW] 📨 Custom data:', payload.data);

    const title = payload.notification?.title || 'New Notification';
    const options = {
        body: payload.notification?.body || '',
        icon: '/favicon.png',
        badge: '/favicon.png',
        data: payload.data || {},
        tag: 'fcm-notification',
        requireInteraction: true
    };

    console.log('[SW] 🔔 Showing notification:', title, options);

    self.registration.showNotification(title, options).then(() => {
        console.log('[SW] ✅ Notification shown successfully');
    }).catch((error) => {
        console.error('[SW] ❌ Failed to show notification:', error);
    });
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    const targetUrl = event.notification?.data?.link || event.notification?.data?.url || event.notification?.click_action || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
            for (var i = 0; i < clientList.length; i++) {
                var client = clientList[i];
                if (client.url === targetUrl && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});