import api from '../lib/api';

export interface Class {
  id: number;
  name: string; // e.g., "kg 2"
  section: string; // e.g., "kindergarten"
  academic_year: string; // e.g., "2025/2026"
  teacher?: number; // teacher id
  teacher_name?: string;
  subjects?: number[]; // subject ids
  subject_names?: string[];
}

export interface Subject {
  id: number;
  name: string;
  code?: string;
}

export const classService = {
  // Get all classes
getAll: async () => {
  const response = await api.get('/classes/');          // now returns array ✅
  return response.data;
},

  // Get single class
  getOne: async (id: number) => {
    const response = await api.get(`/classes/${id}/`);
    return response.data;
  },

  // Create class
  create: async (data: Partial<Class>) => {
    const response = await api.post('/classes/', data);
    return response.data;
  },

  // Update class
  update: async (id: number, data: Partial<Class>) => {
    const response = await api.put(`/classes/${id}/`, data);
    return response.data;
  },

  // Delete class
  delete: async (id: number) => {
    const response = await api.delete(`/classes/${id}/`);
    return response.data;
  },

  // Get subjects (if you have a subjects endpoint)
  getSubjects: async () => {
    const response = await api.get('/classes/subjects/');
    return response.data;
  },
};