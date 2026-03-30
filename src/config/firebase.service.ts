import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { firebaseConfig, vapidPublicKey } from '../services/firebase.config';

let messaging: Messaging | null = null;

export const initializeFirebase = () => {
    try {
        const app = initializeApp(firebaseConfig);
        messaging = getMessaging(app);
        console.log('Firebase initialized successfully');
        return messaging;
    } catch (error) {
        console.error('Failed to initialize Firebase:', error);
        return null;
    }
};

/**
 * Get FCM token for the device
 * This token represents this browser/device in Firebase
 */
export const getFCMToken = async (): Promise<string | null> => {
    try {
        if (!messaging) {
            console.warn('Firebase messaging not initialized');
            return null;
        }

        // Request notification permission if not already granted
        const permission = Notification.permission;
        if (permission !== 'granted') {
            const result = await Notification.requestPermission();
            if (result !== 'granted') {
                console.warn('Notification permission denied');
                return null;
            }
        }

        // Get FCM token
        const token = await getToken(messaging, {
            vapidKey: vapidPublicKey
        });

        console.log('FCM Token:', token);
        return token || null;
    } catch (error) {
        console.error('Failed to get FCM token:', error);
        return null;
    }
};

/**
 * Listen for incoming messages (foreground notifications)
 * These are notifications received while the app/tab is open
 */
export const listenForMessages = (callback: (message: any) => void) => {
    try {
        if (!messaging) {
            console.warn('Firebase messaging not initialized');
            return;
        }

        onMessage(messaging, (payload) => {
            console.log('Message received:', payload);
            callback(payload);

            // Show notification if it came from backend
            if (payload.notification) {
                new Notification(payload.notification.title || 'Notification', {
                    body: payload.notification.body,
                    icon: payload.notification.icon,
                    data: payload.data
                });
            }
        });
    } catch (error) {
        console.error('Failed to listen for messages:', error);
    }
};

/**
 * Handle background notifications
 * These are handled by the service worker (see public/firebase-messaging-sw.js)
 */
export const setupBackgroundMessageHandler = () => {
    // Background notifications are handled by service worker
    // See: public/firebase-messaging-sw.js
    console.log('Background message handler is managed by service worker');
};

export const isFCMSupported = async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
    try {
        const { isSupported } = await import('firebase/messaging');
        return await isSupported();
    } catch (error) {
        console.warn('FCM support check failed:', error);
        return false;
    }
};

export const refreshFCMToken = async (onUpdate: (token: string) => void): Promise<void> => {
    if (!messaging) {
        console.warn('Firebase messaging not initialized');
        return;
    }

    const permission = Notification.permission;
    if (permission !== 'granted') return;

    // If token refreshing is required by browser policy, re-call getToken periodically
    try {
        const token = await getToken(messaging, {
            vapidKey: vapidPublicKey
        });

        if (token) {
            onUpdate(token);
        }
    } catch (error) {
        console.warn('Failed to refresh FCM token:', error);
    }
};
