export const LISTENER_API_URL = process.env.REACT_APP_LISTENER_API_URL || 'http://localhost:8081';

// Default request timeout
export const DEFAULT_TIMEOUT = 30000; // 30 seconds

// Listener API endpoints
export const LISTENER_ENDPOINTS = {
    SFTP: {
        BASE: '/api/sftp/config',
        BY_ID: (id: number) => `/api/sftp/config/${id}`,
        TEST: '/api/sftp/config/test',
        TOGGLE: (id: number) => `/api/sftp/config/${id}/toggle`,
        BY_CLIENT: (clientId: number) => `/api/sftp/config/client/${clientId}`,
        BY_INTERFACE: (interfaceId: number) => `/api/sftp/config/interface/${interfaceId}`,
    },
    AS2: {
        BASE: '/api/as2/config',
        BY_ID: (id: number) => `/api/as2/config/${id}`,
        TEST: '/api/as2/config/test',
        TOGGLE: (id: number) => `/api/as2/config/${id}/toggle`,
        BY_CLIENT: (clientId: number) => `/api/as2/config/client/${clientId}`,
        BY_INTERFACE: (interfaceId: number) => `/api/as2/config/interface/${interfaceId}`,
        ALGORITHMS: '/api/as2/algorithms'
    },
    API: {
        BASE: '/api/api/config',
        BY_ID: (id: number) => `/api/api/config/${id}`,
        TEST: '/api/api/config/test',
        TOGGLE: (id: number) => `/api/api/config/${id}/toggle`
    }
}; 