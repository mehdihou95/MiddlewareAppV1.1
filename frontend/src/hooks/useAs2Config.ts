import { useState, useEffect } from 'react';
import { As2Config } from '../types/connectors';
import { api } from '../services/api';

export function useAs2Config() {
    const [configs, setConfigs] = useState<As2Config[]>([]);
    const [config, setConfig] = useState<As2Config | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        try {
            setLoading(true);
            const response = await api.get<As2Config[]>('/api/as2/configs');
            setConfigs(response.data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch AS2 configurations'));
        } finally {
            setLoading(false);
        }
    };

    const saveConfig = async (config: As2Config) => {
        try {
            if (config.id) {
                return await updateConfig(config.id, config);
            } else {
                return await createConfig(config);
            }
        } catch (err) {
            throw err instanceof Error ? err : new Error('Failed to save AS2 configuration');
        }
    };

    const testConnection = async () => {
        try {
            const response = await api.post<{ success: boolean; message: string }>('/api/as2/test-connection');
            return response.data;
        } catch (err) {
            throw err instanceof Error ? err : new Error('Failed to test AS2 connection');
        }
    };

    const createConfig = async (config: Omit<As2Config, 'id'>) => {
        try {
            const response = await api.post<As2Config>('/api/as2/configs', config);
            setConfigs(prev => [...prev, response.data]);
            setConfig(response.data);
            return response.data;
        } catch (err) {
            throw err instanceof Error ? err : new Error('Failed to create AS2 configuration');
        }
    };

    const updateConfig = async (id: string, config: Partial<As2Config>) => {
        try {
            const response = await api.put<As2Config>(`/api/as2/configs/${id}`, config);
            setConfigs(prev => prev.map(c => c.id === id ? response.data : c));
            setConfig(response.data);
            return response.data;
        } catch (err) {
            throw err instanceof Error ? err : new Error('Failed to update AS2 configuration');
        }
    };

    const deleteConfig = async (id: string) => {
        try {
            await api.delete(`/api/as2/configs/${id}`);
            setConfigs(prev => prev.filter(c => c.id !== id));
            if (config?.id === id) {
                setConfig(null);
            }
        } catch (err) {
            throw err instanceof Error ? err : new Error('Failed to delete AS2 configuration');
        }
    };

    const toggleConfig = async (id: string) => {
        try {
            const config = configs.find(c => c.id === id);
            if (!config) throw new Error('Configuration not found');
            
            const response = await api.put<As2Config>(`/api/as2/configs/${id}`, {
                active: !config.active
            });
            
            setConfigs(prev => prev.map(c => c.id === id ? response.data : c));
            if (config.id === id) {
                setConfig(response.data);
            }
            return response.data;
        } catch (err) {
            throw err instanceof Error ? err : new Error('Failed to toggle AS2 configuration');
        }
    };

    return {
        configs,
        config,
        loading,
        error,
        saveConfig,
        testConnection,
        createConfig,
        updateConfig,
        deleteConfig,
        toggleConfig,
        refreshConfigs: fetchConfigs
    };
} 