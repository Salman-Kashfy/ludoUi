export enum ROLE {
    ADMIN = 'ADMIN',
    EMPLOYEE = 'EMPLOYEE',

}

export enum ROLE_NAMES {
    ADMIN = 'Admin',
    EMPLOYEE = 'Employee',
}

export const constants = {
    PER_PAGE: 10,
    LOCAL_STORAGE_TOKEN: 'AUTH_ACCESS_TOKEN',
    LOCAL_STORAGE_USER: 'USER_DATA',
    LOCAL_STORAGE_COMPANY: 'COMPANY_UUID',
    LOCAL_STORAGE_PERMISSIONS: 'USER_PERMISSIONS',
    DARK_MODE: 'DARK_MODE',
    DOC_SIDEBAR: 'DOC_SIDEBAR',
    APP_URL: import.meta.env.VITE_APP_URL,
    BASE_URL: import.meta.env.VITE_BASE_URL,
    API_URL: import.meta.env.VITE_BASE_URL + '/api',
    GRAPHQL_SERVER: import.meta.env.VITE_BASE_URL + '/graphql',
};

export const ROUTES = {
    DASHBOARD: '/dashboard',
    FORBIDDEN: '/access-forbidden',
    AUTH: {
        LOGIN: '/',
        FORGOT_PASSWORD: '/forgot-password',
    },
    CATEGORY: {
        LIST: '/categories',
        CREATE: '/category/create',
        EDIT: ((id = null) => '/category/'+(id || ':id')+'/edit'),
        VIEW: ((id = null) => '/category/'+(id || ':id')),
    },
    TABLE: {
        LIST: '/tables',
        CREATE: '/table/create',
        EDIT: ((id = null) => '/table/'+(id || ':id')+'/edit'),
        VIEW: ((id = null) => '/table/'+(id || ':id')),
    }
}

export const PERMISSIONS = {
    CATEGORY: {
        LIST: 'category:view',
        CREATE: 'category:create',
        UPDATE: 'category:update',
    },
    TABLE: {
        LIST: 'table:view',
        CREATE: 'table:create',
        UPDATE: 'table:update',
    },

}

export enum OTP_CHANNEL {
    EMAIL = 'EMAIL',
    PHONE = 'PHONE'
}

export const apiUrl = {
    adminLogin: '/login',
    refreshToken: '/refresh-token',
    logout: '/logout',
    userPermissions: '/user-permissions',
    createOtp: '/create-otp',
    verifyOtp: '/verify-otp',
    resetPassword: '/reset-password',
    invite: '/invite',
    validateInvite: '/validate-invite',
    tableStats: '/table-stats',
    tableSessionBilling: '/table-session-billing',
}

export enum ERROR_CODES {
    NOT_ALLOWED = 'NOT_ALLOWED',
    UNAUTHENTICATED = 'UNAUTHENTICATED',
}

export const emptyListResponse = {
    list: [],
    paging: {
        totalPages: 0,
        totalResultCount: 0
    }
}

export const PAYMENT_METHOD = {
    CASH: 'Cash',
    CARD: 'Card',
    BANK_TRANSFER: 'Bank Transfer',
}