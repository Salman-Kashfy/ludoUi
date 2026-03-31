import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported, Messaging } from 'firebase/messaging';
import { firebaseConfig, vapidPublicKey } from './firebase.config';

let messaging: Messaging | null = null;

const isNotificationPromptSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return false;

  if (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '0.0.0.0'
  ) {
    return true;
  }

  return window.isSecureContext;
};

export const initializeFirebase = async () => {
  try {
    console.log('🔥 Firebase initialization starting...');

    const app = initializeApp(firebaseConfig);

    // Register Service Worker
    if ('serviceWorker' in navigator) {
      console.log('⏳ Registering Service Worker...');
      const swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      await navigator.serviceWorker.ready;
      console.log('✅ Service Worker ready');
    }

    const supported = await isSupported();
    if (!supported) {
      console.warn('⚠️ FCM not supported in this browser');
      return null;
    }

    messaging = getMessaging(app);
    console.log('✅ Firebase Messaging initialized');
    return messaging;
  } catch (error) {
    console.error('❌ Firebase init error:', error);
    return null;
  }
};

export const getFCMToken = async (shouldRequestPermission = true): Promise<string | null> => {
  if (!messaging) {
    console.error('❌ Messaging not initialized');
    return null;
  }

  if (!isNotificationPromptSupported()) {
    console.warn('⚠️ HTTPS or localhost required');
    return null;
  }

  try {
    console.log('🔑 Checking notification permission...');
    if (Notification.permission !== 'granted') {
      if (!shouldRequestPermission) {
        console.log('⚠️ Permission not granted and not requesting');
        return null;
      }
      console.log('🔑 Requesting permission...');
      const perm = await Notification.requestPermission();
      console.log('🔑 Permission result:', perm);
      if (perm !== 'granted') {
        console.log('❌ Permission denied');
        return null;
      }
    }

    console.log('⏳ Waiting for service worker ready...');
    const registration = await navigator.serviceWorker.ready;
    console.log('✅ Service worker ready, scope:', registration.scope);

    console.log('🔑 Getting FCM token...');
    const token = await getToken(messaging, {
      vapidKey: vapidPublicKey,
      serviceWorkerRegistration: registration
    });

    if (token) {
      console.log('✅ FCM Token retrieved successfully');
      return token;
    } else {
      console.warn('⚠️ No token received from FCM');
      return null;
    }
  } catch (err) {
    console.error('❌ Error getting FCM token:', err);
    return null;
  }
};

// Foreground messages
export const listenForMessages = (callback: (message: any) => void) => {
  if (!messaging) return;

  onMessage(messaging, (payload) => {
    console.log('📨 Foreground message:', payload);

    callback(payload);

    if (payload.notification) {
      new Notification(payload.notification.title || 'Notification', {
        body: payload.notification.body,
        icon: payload.notification.icon
      });
    }
  });
};