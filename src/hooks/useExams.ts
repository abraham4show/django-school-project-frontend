import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { examService } from '@/services/examService';
import { Exam, ExamFormData } from '@/types';
import { toast } from 'sonner';

export const useExams = (filters?: { status?: string; subject?: number; class_group?: number }) => {
  return useQuery({
    queryKey: ['exams', filters],
    queryFn: () => examService.getAll(filters),
  });
};

export const useExam = (id: number) => {
  return useQuery({
    queryKey: ['exam', id],
    queryFn: () => examService.getOne(id),
    enabled: !!id,
  });
};

export const useCreateExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ExamFormData) => examService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('Exam created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create exam');
    },
  });
};

export const useUpdateExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ExamFormData> }) =>
      examService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('Exam updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update exam');
    },
  });
};

export const useDeleteExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => examService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('Exam deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete exam');
    },
  });
};



export const useToggleExamStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'draft' | 'published' }) =>
      examService.update(id, { status }),  // reuse update service
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('Exam status updated');
    },
  });
};

