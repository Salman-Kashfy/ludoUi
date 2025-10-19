import { createContext, useContext, useState, ReactNode } from 'react';
import { AppToast } from '../components/AppToast';

interface ToastContextType {
    successToast: (message: string) => void;
    errorToast: (message: string) => void;
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
    const [toastOpen, setToastOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastSeverity, setToastSeverity] = useState<'success' | 'error'>('success');

    const successToast = (message: string) => {
        setToastMessage(message);
        setToastSeverity('success');
        setToastOpen(true);
    };

    const errorToast = (message: string) => {
        setToastMessage(message);
        setToastSeverity('error');
        setToastOpen(true);
    };

    return (
        <ToastContext.Provider value={{ successToast, errorToast }}>
            {children}
            <AppToast 
                severity={toastSeverity}
                message={toastMessage}
                snackOpen={toastOpen}
                setSnackOpen={setToastOpen}
            />
        </ToastContext.Provider>
    );
};
