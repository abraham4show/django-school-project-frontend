import api from '../lib/api';

export interface AttendanceRecord {
  id: number;
  student: number;
  student_name: string;
  student_id: string;
  class_obj: number;
  class_name: string;
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent' | 'late';
  remarks?: string;
  created_at: string;
  updated_at: string;
}

export interface BulkAttendancePayload {
  class_id: number;
  date: string;
  records: {
    student_id: number;
    status: 'present' | 'absent' | 'late';
    remarks?: string;
  }[];
}

export const attendanceService = {
  // Get all attendance records with optional filters
  getAll: async (params?: { class?: number; date?: string; student?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.class) queryParams.append('class', params.class.toString());
    if (params?.date) queryParams.append('date', params.date);
    if (params?.student) queryParams.append('student', params.student.toString());
    
    const response = await api.get(`/attendance/?${queryParams.toString()}`);
    return response.data;
  },

  // Get single attendance record
  getById: async (id: number) => {
    const response = await api.get(`/attendance/${id}/`);
    return response.data;
  },

  // Create single attendance record
  create: async (data: Partial<AttendanceRecord>) => {
    const response = await api.post('/attendance/', data);
    return response.data;
  },

  // Update attendance record
  update: async (id: number, data: Partial<AttendanceRecord>) => {
    const response = await api.put(`/attendance/${id}/`, data);
    return response.data;
  },

  // Delete attendance record
  delete: async (id: number) => {
    const response = await api.delete(`/attendance/${id}/`);
    return response.data;
  },

  // Bulk mark attendance for a class on a date
  markBulk: async (payload: BulkAttendancePayload) => {
    const response = await api.post('/attendance/mark_bulk/', payload);
    return response.data;
  },
};