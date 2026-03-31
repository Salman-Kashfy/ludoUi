import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { initializeFirebase } from './config/firebase.service.ts';

async function startApp() {
    if ('serviceWorker' in navigator) {
        try {
            await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            console.log('Service Worker registered');

            await initializeFirebase();
            console.log('Firebase initialized');
        } catch (error) {
            console.warn('SW or Firebase init failed:', error);
        }
    }

    createRoot(document.getElementById('root')!).render(
        <StrictMode>
            <App />
        </StrictMode>
    );
}

startApp();