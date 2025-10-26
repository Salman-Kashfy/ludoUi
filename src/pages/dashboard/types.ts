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

export interface Category {
    uuid: string;
    name: string;
    hourlyRate: number;
    currencyName: string;
    tables: Table[];
}
