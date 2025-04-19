export interface ApiConfig {
    baseUrl: string;
    username: string;
    password: string;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
    headers?: Record<string, string>;
}

export interface ApiTestResponse {
    success: boolean;
    message: string;
    timestamp: string;
}

export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, any>;
}

export interface ApiResponse<T> {
    data: T;
    status: number;
    message?: string;
    error?: ApiError;
} 