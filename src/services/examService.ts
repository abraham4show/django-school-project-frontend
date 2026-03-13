import api from '../lib/api';
import { Exam, ExamFormData } from '@/types';

export interface ExamAttempt {
  id: number;
  student: number;
  exam: number;
  started_at: string;
  submitted_at: string | null;
  score: number | null;
  passed: boolean;
}

export interface Answer {
  question: number;
  answer_text?: string;
  selected_option?: string;
}



export const examService = {
  // Get all exams with optional filters
  getAll: async (filters?: { status?: string; subject?: number; class_group?: number }): Promise<Exam[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.subject) params.append('subject', filters.subject.toString());
    if (filters?.class_group) params.append('class_group', filters.class_group.toString());

    const response = await api.get('/exams/', { params });
    return response.data; // backend returns array of Exam objects
  },

  // Get single exam
  getOne: async (id: number): Promise<Exam> => {
    const response = await api.get(`/exams/${id}/`);
    return response.data;
  },

  // Create exam
  create: async (data: ExamFormData): Promise<Exam> => {
    const response = await api.post('/exams/', data);
    return response.data;
  },

  // Update exam
update: async (id: number, data: Partial<ExamFormData>) => {
  const response = await api.patch(`/exams/${id}/`, data); // <-- use PATCH
  return response.data;
},

  // Delete exam
  delete: async (id: number): Promise<void> => {
    await api.delete(`/exams/${id}/`);
  },
  
  // Get published exams for student
  getPublishedExams: async () => {
    const response = await api.get('/exams/?status=published');
    return response.data;
  },

  // Start an exam attempt
  startExam: async (examId: number): Promise<ExamAttempt> => {
    const response = await api.post(`/exams/${examId}/start/`);
    return response.data;
  },

  // Submit answers
 submitExam: async (attemptId: number, answers: Answer[]): Promise<{ score: number; passed: boolean }> => {
  const response = await api.post(`/exams/attempts/${attemptId}/submit/`, { answers });
  return response.data;
},

  // Get student's attempts (for results)
  getMyAttempts: async () => {
    const response = await api.get('/exams/attempts/');
    return response.data;
  },
};
