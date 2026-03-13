import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceService, AttendanceRecord, BulkAttendancePayload } from '../services/attendanceService';
import { toast } from 'sonner';

export const useAttendance = (filters?: { class?: number; date?: string; student?: number }) => {
  return useQuery({
    queryKey: ['attendance', filters],
    queryFn: () => attendanceService.getAll(filters),
  });
};

export const useAttendanceById = (id: number) => {
  return useQuery({
    queryKey: ['attendance', id],
    queryFn: () => attendanceService.getById(id),
    enabled: !!id,
  });
};

export const useCreateAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AttendanceRecord>) => attendanceService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast.success('Attendance record created');
    },
    onError: (error: any) => {
      toast.error('Failed to create attendance record', { description: error.message });
    },
  });
};

export const useUpdateAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AttendanceRecord> }) =>
      attendanceService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast.success('Attendance record updated');
    },
    onError: (error: any) => {
      toast.error('Failed to update attendance record', { description: error.message });
    },
  });
};

export const useDeleteAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => attendanceService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast.success('Attendance record deleted');
    },
    onError: (error: any) => {
      toast.error('Failed to delete attendance record', { description: error.message });
    },
  });
};

export const useMarkBulkAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BulkAttendancePayload) => attendanceService.markBulk(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast.success('Attendance marked successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to mark attendance', { description: error.message });
    },
  });
};