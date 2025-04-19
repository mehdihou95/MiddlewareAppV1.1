import { useState, useCallback } from 'react';
import { api } from '../services/api';
import { ApiConfig } from '../types/api';

export const useApiConfig = () => {
    const [config, setConfig] = useState<ApiConfig | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchConfig = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get<ApiConfig>('/api/api-config');
            setConfig(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch API configuration');
            console.error('Error fetching API config:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const saveConfig = useCallback(async (newConfig: ApiConfig) => {
        setLoading(true);
        try {
            const response = await api.post<ApiConfig>('/api/api-config', newConfig);
            setConfig(response.data);
            setError(null);
            return response.data;
        } catch (err) {
            setError('Failed to save API configuration');
            console.error('Error saving API config:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const testConnection = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.post<{ success: boolean; message: string }>('/api/api-config/test');
            setError(null);
            return response.data;
        } catch (err) {
            const errorMessage = 'Failed to test API connection';
            setError(errorMessage);
            console.error('Error testing API connection:', err);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        config,
        loading,
        error,
        fetchConfig,
        saveConfig,
        testConnection
    };
}; 