import { createContext, useContext, ReactNode } from 'react';

interface DashboardContextType {
    loadDashboardStats: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

interface DashboardProviderProps {
    children: ReactNode;
    loadDashboardStats: () => void;
}

export function DashboardProvider({ children, loadDashboardStats }: DashboardProviderProps) {
    return (
        <DashboardContext.Provider value={{ loadDashboardStats }}>
            {children}
        </DashboardContext.Provider>
    );
}

export function useDashboard() {
    const context = useContext(DashboardContext);
    if (context === undefined) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
}

