import { useState, useCallback } from 'react';
import { listenerApi } from '../services/listenerApi';
import { SftpConfig } from '../types/connectors';
import { LISTENER_ENDPOINTS } from '../config/listenerApiConfig';

export const useSftpConfig = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getAllConfigurations = useCallback(async () => {
        setLoading(true);
        try {
            const response = await listenerApi.get<SftpConfig[]>(LISTENER_ENDPOINTS.SFTP.BASE);
            setError(null);
            return response.data;
        } catch (err) {
            setError('Failed to fetch SFTP configurations');
            console.error('Error fetching SFTP configs:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const getConfiguration = useCallback(async (id: number) => {
        setLoading(true);
        try {
            const response = await listenerApi.get<SftpConfig>(LISTENER_ENDPOINTS.SFTP.BY_ID(id));
            setError(null);
            return response.data;
        } catch (err) {
            setError('Failed to fetch SFTP configuration');
            console.error('Error fetching SFTP config:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const createConfiguration = useCallback(async (config: SftpConfig) => {
        setLoading(true);
        try {
            const response = await listenerApi.post<SftpConfig>(LISTENER_ENDPOINTS.SFTP.BASE, config);
            setError(null);
            return response.data;
        } catch (err) {
            setError('Failed to create SFTP configuration');
            console.error('Error creating SFTP config:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateConfiguration = useCallback(async (id: number, config: SftpConfig) => {
        setLoading(true);
        try {
            const response = await listenerApi.put<SftpConfig>(LISTENER_ENDPOINTS.SFTP.BY_ID(id), config);
            setError(null);
            return response.data;
        } catch (err) {
            setError('Failed to update SFTP configuration');
            console.error('Error updating SFTP config:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteConfiguration = useCallback(async (id: number) => {
        setLoading(true);
        try {
            await listenerApi.delete(LISTENER_ENDPOINTS.SFTP.BY_ID(id));
            setError(null);
        } catch (err) {
            setError('Failed to delete SFTP configuration');
            console.error('Error deleting SFTP config:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const toggleActive = useCallback(async (id: number) => {
        setLoading(true);
        try {
            const response = await listenerApi.post<SftpConfig>(LISTENER_ENDPOINTS.SFTP.TOGGLE(id));
            setError(null);
            return response.data;
        } catch (err) {
            setError('Failed to toggle SFTP configuration status');
            console.error('Error toggling SFTP config:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getConfigurationsByClient = useCallback(async (clientId: number) => {
        setLoading(true);
        try {
            const response = await listenerApi.get<SftpConfig[]>(LISTENER_ENDPOINTS.SFTP.BY_CLIENT(clientId));
            setError(null);
            return response.data;
        } catch (err) {
            setError('Failed to fetch SFTP configurations for client');
            console.error('Error fetching SFTP configs:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const getConfigurationsByInterface = useCallback(async (interfaceId: number) => {
        setLoading(true);
        try {
            const response = await listenerApi.get<SftpConfig[]>(LISTENER_ENDPOINTS.SFTP.BY_INTERFACE(interfaceId));
            setError(null);
            return response.data;
        } catch (err) {
            setError('Failed to fetch SFTP configurations for interface');
            console.error('Error fetching SFTP configs:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const testConnection = useCallback(async (config: SftpConfig) => {
        setLoading(true);
        try {
            const response = await listenerApi.post<{ success: boolean; message: string }>(
                LISTENER_ENDPOINTS.SFTP.TEST,
                config
            );
            setError(null);
            return response.data;
        } catch (err) {
            const errorMessage = 'Failed to test SFTP connection';
            setError(errorMessage);
            console.error('Error testing SFTP connection:', err);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        getAllConfigurations,
        getConfiguration,
        createConfiguration,
        updateConfiguration,
        deleteConfiguration,
        toggleActive,
        getConfigurationsByClient,
        getConfigurationsByInterface,
        testConnection
    };
}; 