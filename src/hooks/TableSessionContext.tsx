import { createContext, useContext, ReactNode } from 'react';

interface TableSessionContextType {
    updateTableSession: (tableUuid: string, updatedSession: any) => void;
    addTableSession: (tableUuid: string, newSession: any) => void;
    rechargeTableSession: (tableUuid: string, rechargedSession: any) => void;
}

const TableSessionContext = createContext<TableSessionContextType | undefined>(undefined);

interface TableSessionProviderProps {
    children: ReactNode;
    updateTableSession: (tableUuid: string, updatedSession: any) => void;
    addTableSession: (tableUuid: string, newSession: any) => void;
    rechargeTableSession: (tableUuid: string, rechargedSession: any) => void;
}

export function TableSessionProvider({ children, updateTableSession, addTableSession, rechargeTableSession }: TableSessionProviderProps) {
    return (
        <TableSessionContext.Provider value={{ updateTableSession, addTableSession, rechargeTableSession }}>
            {children}
        </TableSessionContext.Provider>
    );
}

export function useTableSession() {
    const context = useContext(TableSessionContext);
    if (context === undefined) {
        throw new Error('useTableSession must be used within a TableSessionProvider');
    }
    return context;
}
