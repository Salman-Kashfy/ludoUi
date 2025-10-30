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
        EDIT: ((uuid = null) => '/category/'+(uuid || ':uuid')+'/edit'),
        VIEW: ((uuid = null) => '/category/'+(uuid || ':uuid')),
    },
    TABLE: {
        LIST: '/tables',
        CREATE: '/table/create',
        EDIT: ((uuid = null) => '/table/'+(uuid || ':uuid')+'/edit'),
        VIEW: ((uuid = null) => '/table/'+(uuid || ':uuid')),
    }
}

export const PERMISSIONS = {
    CATEGORY: {
        LIST: 'category:view',
        UPSERT: 'category:upsert'
    },
    TABLE: {
        LIST: 'table:view',
        UPSERT: 'table:upsert',
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

export const HOURS = {
    '0.25': '15 mins',
    '0.5': '30 mins',
    '0.75': '45 mins',
    '1': '1 hr',
}

export const emptyMutationResponse = {
    data: null,
    status: false,
    errorMessage: null
}