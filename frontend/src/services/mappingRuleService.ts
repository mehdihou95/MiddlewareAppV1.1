import axios from 'axios';
import { MappingRule, PageResponse } from '../types';
import { API_URL } from '../config/apiConfig';

export const mappingRuleService = {
  getAllMappingRules: async (
    page: number = 0,
    size: number = 10,
    sortBy: string = 'name',
    direction: string = 'asc'
  ): Promise<PageResponse<MappingRule>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    params.append('sortBy', sortBy);
    params.append('direction', direction);

    const response = await axios.get<PageResponse<MappingRule>>(`${API_URL}/api/mapping-rules?${params.toString()}`);
    return response.data;
  },

  getMappingRuleById: async (id: number): Promise<MappingRule> => {
    const response = await axios.get<MappingRule>(`${API_URL}/api/mapping-rules/${id}`);
    return response.data;
  },

  createMappingRule: async (mappingRuleData: Omit<MappingRule, 'id'>): Promise<MappingRule> => {
    const response = await axios.post<MappingRule>(`${API_URL}/api/mapping-rules`, mappingRuleData);
    return response.data;
  },

  updateMappingRule: async (id: number, mappingRuleData: Partial<MappingRule>): Promise<MappingRule> => {
    const response = await axios.put<MappingRule>(`${API_URL}/api/mapping-rules/${id}`, mappingRuleData);
    return response.data;
  },

  deleteMappingRule: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/api/mapping-rules/${id}`);
  },

  getMappingRulesByInterface: async (
    interfaceId: number,
    page: number = 0,
    size: number = 10,
    sortBy: string = 'name',
    direction: string = 'asc'
  ): Promise<PageResponse<MappingRule>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    params.append('sortBy', sortBy);
    params.append('direction', direction);

    const response = await axios.get<PageResponse<MappingRule>>(
      `${API_URL}/interfaces/${interfaceId}/mapping-rules?${params.toString()}`
    );
    return response.data;
  }
}; 