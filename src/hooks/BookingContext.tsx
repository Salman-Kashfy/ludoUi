import { createContext, useContext, useState, ReactNode } from 'react';

interface BookingContextType {
    bookSessionDialog: boolean;
    tableUuid: string;
    openBookingDialog: (tableUuid: string) => void;
    closeBookingDialog: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

interface BookingProviderProps {
    children: ReactNode;
}

export function BookingProvider({ children }: BookingProviderProps) {
    const [bookSessionDialog, setBookSessionDialog] = useState(false);
    const [tableUuid, setTableUuid] = useState('');

    const openBookingDialog = (tableUuid: string) => {
        setTableUuid(tableUuid);
        setBookSessionDialog(true);
    };

    const closeBookingDialog = () => {
        setBookSessionDialog(false);
        setTableUuid('');
    };

    return (
        <BookingContext.Provider 
            value={{
                bookSessionDialog,
                tableUuid,
                openBookingDialog,
                closeBookingDialog,
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
