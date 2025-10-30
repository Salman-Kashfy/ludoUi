import { createContext, useContext, useState, ReactNode } from 'react';

interface CategoryPrice {
    uuid: string;
    price: number;
    unit: string;
    duration: number;
    freeMins: number;
    currencyName: string;
}

interface BookingContextType {
    bookSessionDialog: boolean;
    tableUuid: string;
    categoryPrices: CategoryPrice[];
    openBookingDialog: (tableUuid: string, categoryPrices: CategoryPrice[]) => void;
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
    const [categoryPrices, setCategoryPrices] = useState<CategoryPrice[]>([]);
    const [rechargeSessionDialog, setRechargeSessionDialog] = useState(false);
    const [tableSessionUuid, setTableSessionUuid] = useState('');

    const openBookingDialog = (tableUuid: string, categoryPrices: CategoryPrice[]) => {
        setTableUuid(tableUuid);
        setCategoryPrices(categoryPrices);
        setBookSessionDialog(true);
    };

    const closeBookingDialog = () => {
        setBookSessionDialog(false);
        setTableUuid('');
        setCategoryPrices([]);
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
                categoryPrices,
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
