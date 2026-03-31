import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { AppToast } from '../components/AppToast';
import { notificationQueue, QueuedNotification } from './notificationQueue';

interface ToastContextType {
    successToast: (message: string, duration?: number) => void;
    errorToast: (message: string, duration?: number) => void;
    warningToast: (message: string, duration?: number) => void;
    infoToast: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

interface ToastProviderProps {
    children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
    const [notifications, setNotifications] = useState<QueuedNotification[]>([]);
    const [visibleId, setVisibleId] = useState<string | null>(null);

    // Subscribe to notification queue changes
    useEffect(() => {
        const unsubscribe = notificationQueue.subscribe((queue) => {
            setNotifications(queue);
            
            // Get current notification to display
            const current = notificationQueue.getCurrentNotification();
            if (current) {
                setVisibleId(current.id);
            } else {
                setVisibleId(null);
            }
        });

        return unsubscribe;
    }, []);

    const successToast = (message: string, duration = 3000) => {
        notificationQueue.enqueue(message, 'success', duration);
    };

    const errorToast = (message: string, duration = 4000) => {
        notificationQueue.enqueue(message, 'error', duration);
    };

    const warningToast = (message: string, duration = 3500) => {
        notificationQueue.enqueue(message, 'warning', duration);
    };

    const infoToast = (message: string, duration = 3000) => {
        notificationQueue.enqueue(message, 'info', duration);
    };

    const handleClose = () => {
        if (visibleId) {
            notificationQueue.dequeue(visibleId);
        }
    };

    const currentNotification = notifications.find(n => n.id === visibleId);

    return (
        <ToastContext.Provider value={{ successToast, errorToast, warningToast, infoToast }}>
            {children}
            {currentNotification && (
                <AppToast 
                    severity={currentNotification.severity as 'success' | 'error' | 'warning' | 'info'}
                    message={currentNotification.message}
                    snackOpen={true}
                    setSnackOpen={handleClose}
                />
            )}
        </ToastContext.Provider>
    );
};
