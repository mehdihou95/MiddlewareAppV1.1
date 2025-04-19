import { api } from './apiService';
import { handleApiError } from '../utils/errorHandler';
import { MappingRule, XsdElement, DatabaseField } from '../types';

export interface XsdAttribute {
    name: string;
    type: string;
    required: boolean;
}

export const xsdService = {
    getXsdStructure: async (xsdPath: string): Promise<XsdElement[]> => {
        try {
            const response = await api.get<XsdElement[]>('/api/mapping/xsd-structure', {
                params: { xsdPath }
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    getXsdStructureById: async (interfaceId: number): Promise<XsdElement[]> => {
        try {
            const response = await api.get<XsdElement[]>(`/api/mapping/xsd-structure/${interfaceId}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    getDatabaseFields: async (clientId: number, interfaceId: number): Promise<DatabaseField[]> => {
        try {
            const response = await api.get<DatabaseField[]>('/api/mapping/database-fields', {
                params: { clientId, interfaceId }
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    getMappingRules: async (clientId: number, interfaceId: number): Promise<MappingRule[]> => {
        try {
            const response = await api.get<MappingRule[]>(`/api/interfaces/${interfaceId}/mappings`, {
                params: { clientId }
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    createMappingRule: async (rule: Omit<MappingRule, 'id'>): Promise<MappingRule> => {
        try {
            const response = await api.post<MappingRule>('/api/mapping-rules', rule);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    deleteMappingRule: async (id: number): Promise<void> => {
        try {
            await api.delete(`/api/mapping/rules/${id}`);
        } catch (error) {
            throw handleApiError(error);
        }
    }
}; 