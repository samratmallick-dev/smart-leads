import api from './api';
import type { ApiResponse, PaginatedResponse, Lead, CreateLeadInput, UpdateLeadInput, LeadFilters } from '@/types';

const buildParams = (filters: LeadFilters): Record<string, string> => {
  const params: Record<string, string> = {};
  if (filters.status) params.status = filters.status;
  if (filters.source) params.source = filters.source;
  if (filters.search) params.search = filters.search;
  if (filters.sort) params.sort = filters.sort;
  if (filters.page) params.page = String(filters.page);
  return params;
};

export const leadsService = {
  async getLeads(filters: LeadFilters = {}) {
    const { data } = await api.get<PaginatedResponse<Lead>>('/leads', { params: buildParams(filters) });
    return data;
  },

  async getLeadById(id: string) {
    const { data } = await api.get<ApiResponse<Lead>>(`/leads/${id}`);
    return data.data!;
  },

  async createLead(input: CreateLeadInput) {
    const { data } = await api.post<ApiResponse<Lead>>('/leads', input);
    return data.data!;
  },

  async updateLead(id: string, input: UpdateLeadInput) {
    const { data } = await api.put<ApiResponse<Lead>>(`/leads/${id}`, input);
    return data.data!;
  },

  async deleteLead(id: string) {
    await api.delete(`/leads/${id}`);
  },

  async exportCSV(filters: LeadFilters = {}) {
    const { data } = await api.get('/leads/export/csv', {
      params: buildParams(filters),
      responseType: 'blob',
    });
    return data as Blob;
  },
};
