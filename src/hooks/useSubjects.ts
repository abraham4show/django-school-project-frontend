// src/hooks/useSubjects.ts
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export const useSubjects = () => {
  return useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const response = await api.get('/classes/subjects/');
      return response.data;
    },
  });
};

