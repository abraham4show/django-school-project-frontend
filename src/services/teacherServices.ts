import api from '../lib/api';
import { Teacher } from '@/types';

export const teacherService = {
  getAll: async (filters?: { search?: string; is_active?: boolean; class?: number }) => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString());
    if (filters?.class) params.append('classes', filters.class.toString());

    const response = await api.get('/teachers/', { params });
    return response.data;
  },

  getOne: async (id: number) => {
    const response = await api.get(`/teachers/${id}/`);
    return response.data;
  },

  create: async (data: Partial<Teacher>) => {
    const response = await api.post('/teachers/', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Teacher>) => {
    const response = await api.put(`/teachers/${id}/`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/teachers/${id}/`);
    return response.data;
  },
};