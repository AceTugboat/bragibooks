import axios, { AxiosError, type AxiosInstance } from 'axios';
import type { ApiError } from '../types';

// Create axios instance with defaults
const apiClient: AxiosInstance = axios.create({
    baseURL: '/',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Important for CSRF cookies
});

// Get CSRF token from cookie
function getCsrfToken(): string | null {
    const name = 'csrftoken';
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop()?.split(';').shift() || null;
    }
    return null;
}

// Add CSRF token to requests
apiClient.interceptors.request.use((config) => {
    const csrfToken = getCsrfToken();
    if (csrfToken && config.headers) {
        config.headers['X-CSRFToken'] = csrfToken;
    }
    return config;
});

// Error handling interceptor
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiError>) => {
        if (error.response?.data?.error) {
            console.error('API Error:', error.response.data.error);
        }
        return Promise.reject(error);
    }
);

export default apiClient;

// Helper function for error messages
export function getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.error || error.message;
    }
    return 'An unexpected error occurred';
}
