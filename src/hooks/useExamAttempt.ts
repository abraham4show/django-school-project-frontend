import { useQuery, useMutation } from '@tanstack/react-query';
import { examService } from '@/services/examService';
import { toast } from 'sonner';

export const usePublishedExams = () => {
  return useQuery({
    queryKey: ['published-exams'],
    queryFn: () => examService.getPublishedExams(),
  });
};

export const useStartExam = () => {
  return useMutation({
    mutationFn: (examId: number) => examService.startExam(examId),
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to start exam');
    },
  });
};

export const useSubmitExam = () => {
  return useMutation({
    mutationFn: ({ attemptId, answers }: { attemptId: number; answers: any[] }) =>
      examService.submitExam(attemptId, answers),
    onSuccess: (data) => {
      toast.success(`Exam submitted! Score: ${data.score}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit exam');
    },
  });
};

export const useMyAttempts = () => {
  return useQuery({
    queryKey: ['my-attempts'],
    queryFn: () => examService.getMyAttempts(),
  });
};