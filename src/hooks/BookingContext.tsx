import { createContext, useContext, useState, ReactNode } from 'react';

interface BookingContextType {
    bookSessionDialog: boolean;
    tableUuid: string;
    openBookingDialog: (tableUuid: string) => void;
    closeBookingDialog: () => void;
    rechargeSessionDialog: boolean;
    tableSessionUuid: string;
    openRechargeDialog: (tableUuid: string, tableSessionUuid: string) => void;
    closeRechargeDialog: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

interface BookingProviderProps {
    children: ReactNode;
}

export function BookingProvider({ children }: BookingProviderProps) {
    const [bookSessionDialog, setBookSessionDialog] = useState(false);
    const [tableUuid, setTableUuid] = useState('');
    const [rechargeSessionDialog, setRechargeSessionDialog] = useState(false);
    const [tableSessionUuid, setTableSessionUuid] = useState('');

    const openBookingDialog = (tableUuid: string) => {
        setTableUuid(tableUuid);
        setBookSessionDialog(true);
    };

    const closeBookingDialog = () => {
        setBookSessionDialog(false);
        setTableUuid('');
    };

    const openRechargeDialog = (tableUuid: string, tableSessionUuid: string) => {
        setTableUuid(tableUuid);
        setTableSessionUuid(tableSessionUuid);
        setRechargeSessionDialog(true);
    };

    const closeRechargeDialog = () => {
        setRechargeSessionDialog(false);
        setTableUuid('');
        setTableSessionUuid('');
    };

    return (
        <BookingContext.Provider 
            value={{
                bookSessionDialog,
                tableUuid,
                openBookingDialog,
                closeBookingDialog,
                rechargeSessionDialog,
                tableSessionUuid,
                openRechargeDialog,
                closeRechargeDialog,
            }}
        >
            {children}
        </BookingContext.Provider>
    );
}

export function useBooking() {
    const context = useContext(BookingContext);
    if (context === undefined) {
        throw new Error('useBooking must be used within a BookingProvider');
    }
    return context;
}
