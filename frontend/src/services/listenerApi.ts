import axios from 'axios';
import { LISTENER_API_URL, DEFAULT_TIMEOUT } from '../config/listenerApiConfig';

// Create axios instance for listener service
const listenerApi = axios.create({
    baseURL: LISTENER_API_URL,
    timeout: DEFAULT_TIMEOUT,
    withCredentials: true // Important for CSRF token
});

// Add request interceptor to include CSRF token
listenerApi.interceptors.request.use((config) => {
    // Get CSRF token from cookie
    const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];

    if (token) {
        config.headers['X-XSRF-TOKEN'] = decodeURIComponent(token);
    }

    // Get JWT token from localStorage
    const jwtToken = localStorage.getItem('token');
    if (jwtToken) {
        config.headers['Authorization'] = `Bearer ${jwtToken}`;
    }

    return config;
});

export { listenerApi }; 