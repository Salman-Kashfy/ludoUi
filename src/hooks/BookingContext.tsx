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
    enablePersonCount: boolean;
    openBookingDialog: (tableUuid: string, categoryPrices: CategoryPrice[], enablePersonCount: boolean) => void;
    closeBookingDialog: () => void;
    rechargeSessionDialog: boolean;
    tableSessionUuid: string;
    rechargeCategoryPrices: CategoryPrice[];
    openRechargeDialog: (tableUuid: string, tableSessionUuid: string, categoryPrices: CategoryPrice[]) => void;
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
    const [enablePersonCount, setEnablePersonCount] = useState(false);
    const [rechargeSessionDialog, setRechargeSessionDialog] = useState(false);
    const [tableSessionUuid, setTableSessionUuid] = useState('');
    const [rechargeCategoryPrices, setRechargeCategoryPrices] = useState<CategoryPrice[]>([]);

    const openBookingDialog = (tableUuid: string, categoryPrices: CategoryPrice[], enablePersonCount: boolean) => {
        setTableUuid(tableUuid);
        setCategoryPrices(categoryPrices);
        setEnablePersonCount(enablePersonCount);
        setBookSessionDialog(true);
    };

    const closeBookingDialog = () => {
        setBookSessionDialog(false);
        setTableUuid('');
        setCategoryPrices([]);
        setEnablePersonCount(false);
    };

    const openRechargeDialog = (tableUuid: string, tableSessionUuid: string, categoryPrices: CategoryPrice[]) => {
        setTableUuid(tableUuid);
        setTableSessionUuid(tableSessionUuid);
        setRechargeCategoryPrices(categoryPrices);
        setRechargeSessionDialog(true);
    };

    const closeRechargeDialog = () => {
        setRechargeSessionDialog(false);
        setTableUuid('');
        setTableSessionUuid('');
        setRechargeCategoryPrices([]);
    };

    return (
        <BookingContext.Provider 
            value={{
                bookSessionDialog,
                tableUuid,
                categoryPrices,
                enablePersonCount,
                openBookingDialog,
                closeBookingDialog,
                rechargeSessionDialog,
                tableSessionUuid,
                rechargeCategoryPrices,
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
