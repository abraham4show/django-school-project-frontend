import api from '../lib/api';

export interface Notification {
  id: number;
  title: string;
  message: string;
  link?: string;
  type: 'exam' | 'result' | 'holiday' | 'general';
  is_read: boolean;
  created_at: string;
  event_date?: string;
}

export const notificationService = {
  getAll: async (): Promise<Notification[]> => {
    const response = await api.get('/notifications/');
    return response.data;
  },
  markRead: async (id: number): Promise<void> => {
    await api.post(`/notifications/${id}/mark_read/`);
  },
  markAllRead: async (): Promise<void> => {
    await api.post('/notifications/mark_all_read/');
  },
};