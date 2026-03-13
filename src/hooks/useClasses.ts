import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { classService, Class } from '../services/classServices';
import { toast } from 'sonner';

export const useClasses = () => {
  return useQuery({
    queryKey: ['classes'],
    queryFn: () => classService.getAll(),
  });
};

export const useClass = (id: number) => {
  return useQuery({
    queryKey: ['class', id],
    queryFn: () => classService.getOne(id),
    enabled: !!id,
  });
};

export const useCreateClass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Class>) => classService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success('Class created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create class');
    },
  });
};

export const useUpdateClass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Class> }) =>
      classService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success('Class updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update class');
    },
  });
};

export const useDeleteClass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => classService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success('Class deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete class');
    },
  });
};

// Hook for subjects (if you have a subjects endpoint)
export const useSubjects = () => {
  return useQuery({
    queryKey: ['subjects'],
    queryFn: () => classService.getSubjects(),
  });
};