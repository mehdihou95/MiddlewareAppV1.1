import { api } from './apiService';
import { 
    As2Config, 
    As2ConfigFormData, 
    As2ConfigListResponse,
    As2ConfigCreateResponse,
    As2ConfigUpdateResponse,
    As2ConfigDeleteResponse,
    As2ConfigToggleResponse
} from '../types/connectors';

const API_BASE_URL = '/api';

export const as2Service = {
    async getConfigs(): Promise<As2Config[]> {
        const response = await api.get<As2ConfigListResponse>(`${API_BASE_URL}/as2/configs`);
        return response.data.configs;
    },

    async getConfig(id: string): Promise<As2Config> {
        const response = await api.get<As2Config>(`${API_BASE_URL}/as2/configs/${id}`);
        return response.data;
    },

    async createConfig(config: As2ConfigFormData): Promise<As2Config> {
        const response = await api.post<As2ConfigCreateResponse>(
            `${API_BASE_URL}/as2/configs`,
            config
        );
        return response.data.config;
    },

    async updateConfig(id: string, config: As2ConfigFormData): Promise<As2Config> {
        const response = await api.put<As2ConfigUpdateResponse>(
            `${API_BASE_URL}/as2/configs/${id}`,
            config
        );
        return response.data.config;
    },

    async deleteConfig(id: string): Promise<void> {
        await api.delete<As2ConfigDeleteResponse>(`${API_BASE_URL}/as2/configs/${id}`);
    },

    async toggleConfig(id: string): Promise<As2Config> {
        const response = await api.post<As2ConfigToggleResponse>(
            `${API_BASE_URL}/as2/configs/${id}/toggle`
        );
        return response.data.config;
    },

    async getSupportedAlgorithms(): Promise<{
        encryption: string[];
        signing: string[];
    }> {
        const response = await api.get(`${API_BASE_URL}/as2/algorithms`);
        return response.data;
    }
}; 