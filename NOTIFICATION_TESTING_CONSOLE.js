/**
 * NOTIFICATION TESTING GUIDE
 * 
 * Use this script in the browser console to test notifications
 * Copy and paste the commands below in your browser console (F12 → Console)
 */

// ============ 1. VERIFY SETUP ============

// Check notification permission status
console.log('Current notification permission:', Notification.permission);

// Get FCM token from localStorage
const fcmToken = localStorage.getItem('LRCL_FCM_TOKEN');
console.log('FCM Token:', fcmToken ? fcmToken.substring(0, 30) + '...' : 'NOT FOUND');

// Check service worker status
navigator.serviceWorker.getRegistrations().then(registrations => {
    console.log('Service Workers registered:', registrations.length);
    registrations.forEach(reg => console.log('- Scope:', reg.scope));
});

// ============ 2. TEST FOREGROUND NOTIFICATIONS ============

// Import and trigger a test notification
import { triggerNotification } from './components/NotificationCenter';

triggerNotification({
    title: '🎉 Test Notification',
    body: 'This is a test notification in foreground',
    type: 'success',
    duration: 5000
});

// Test different notification types
// Success
triggerNotification({
    title: '✅ Success!',
    body: 'This is a success notification',
    type: 'success'
});

// Warning
triggerNotification({
    title: '⚠️ Warning!',
    body: 'This is a warning notification',
    type: 'warning'
});

// Error
triggerNotification({
    title: '❌ Error!',
    body: 'This is an error notification',
    type: 'error'
});

// Info
triggerNotification({
    title: 'ℹ️ Info',
    body: 'This is an info notification',
    type: 'info'
});

// ============ 3. TEST BACKGROUND NOTIFICATIONS ============

// To test background notifications:
// 1. Keep this script/console open
// 2. Minimize or switch away from the browser tab
// 3. Book a table or trigger an action that sends a notification
// 4. You should see a system notification appear
// 5. Click it to return to the app

// ============ 4. SIMULATE FCM MESSAGE ============

// This simulates receiving an FCM message (for testing)
// Note: This only works if Firebase Messaging is initialized
const simulateFCM = async () => {
    try {
        const { messaging } = await import('firebase/messaging');
        const { onMessage } = await import('firebase/messaging');
        
        // This would trigger the foreground message listener
        console.log('FCM listener is active. Send a real FCM message to test.');
    } catch (error) {
        console.error('Cannot simulate FCM:', error);
    }
};

// ============ 5. QUICK VERIFICATION CHECKLIST ============

const verifySetup = () => {
    const checks = {
        '✅ Notification API': 'Notification' in window,
        '✅ Service Worker': 'serviceWorker' in navigator,
        '✅ Secure Context': window.isSecureContext || window.location.hostname === 'localhost',
        '✅ Permission Granted': Notification.permission === 'granted',
        '✅ FCM Token': !!localStorage.getItem('LRCL_FCM_TOKEN')
    };
    
    console.table(checks);
    
    const allPass = Object.values(checks).every(v => v === true);
    if (allPass) {
        console.log('✅ All checks passed! Notifications should work.');
    } else {
        console.warn('⚠️ Some checks failed. Check the table above.');
    }
};

// Run verification
verifySetup();

// ============ 6. REQUEST PERMISSION (IF NEEDED) ============

// If permission is not granted, run this:
const requestNotificationPermission = async () => {
    try {
        const permission = await Notification.requestPermission();
        console.log('Permission result:', permission);
        if (permission === 'granted') {
            console.log('✅ Permission granted!');
        }
    } catch (error) {
        console.error('Error requesting permission:', error);
    }
};

// Uncomment to request permission:
// requestNotificationPermission();

// ============ 7. DEBUG INFO ============

console.log('=== NOTIFICATION SETUP DEBUG INFO ===');
console.log('Browser:', navigator.userAgent);
console.log('Secure Context:', window.isSecureContext);
console.log('Hostname:', window.location.hostname);
console.log('Protocol:', window.location.protocol);
console.log('Firebase Config available:', !!window.firebaseConfig);
console.log('================================');
