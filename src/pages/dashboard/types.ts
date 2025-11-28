export interface TableSession {
    uuid: string;
    startTime: string;
    endTime: string | null;
    unit: string;
    duration: number;
    status: string;
}

export interface Table {
    uuid: string;
    name: string;
    status: string;
    tableSessions: TableSession[];
}

export interface CategoryPrice {
    uuid: string;
    price: number;
    unit: string;
    duration: number;
    freeMins: number;
    currencyName: string;
}

export interface Category {
    uuid: string;
    name: string;
    hourlyRate: number;
    currencyName: string;
    tables: Table[];
    categoryPrices?: CategoryPrice[];
}

export enum TournamentStatus {
    UPCOMING = 'UPCOMING',
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}