import api from '../lib/api';

export interface Student {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  student_id: string;
  date_of_birth: string;
  current_class: number | null;
  enrollment_date: string;
  parent_name?: string;
  parent_phone?: string;
  address?: string;
  is_active: boolean;  // This is the only status field in your model
}

export interface StudentDisplay {
  id: number;
  name: string;
  class: string;
  gender: string;
  parentContact: string;
  email: string;
  avatar: string;
  status: 'active' | 'inactive';  // For display only, derived from is_active
}

export interface StudentFilters {
  search?: string;
  is_active?: boolean;  // Changed from status
  current_class?: number;
  page?: number;
}

export interface StudentFormData {
  first_name: string;
  last_name: string;
  email: string;
  date_of_birth: string;
  current_class: number;
  parent_name: string;
  parent_phone: string;
  address: string;
  is_active: boolean;  // Only is_active, no status field
  // Remove enrollment_date - it's auto_add_now
  // Remove status - it doesn't exist in your model
  // Remove student_id - it's auto-generated
}

export interface Class {
  id: number;
  name: string;
  section?: string;
  academic_year?: string;
}

export const studentService = {
  getAll: async (filters?: StudentFilters) => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString());
    if (filters?.current_class) params.append('current_class', filters.current_class.toString());
    if (filters?.page) params.append('page', filters.page.toString());

    const response = await api.get('/students/', { params });
    return response.data;
  },

  getOne: async (id: number) => {
    const response = await api.get(`/students/${id}/`);
    return response.data;
  },

  create: async (data: StudentFormData) => {
    const response = await api.post('/students/', data);
    return response.data;
  },

  update: async (id: number, data: Partial<StudentFormData>) => {
    const response = await api.put(`/students/${id}/`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/students/${id}/`);
    return response.data;
  },

  getClasses: async () => {
    const response = await api.get('/classes/');
    return response.data;
  }
};