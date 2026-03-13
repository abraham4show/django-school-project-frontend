import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentService, StudentFilters, StudentFormData, StudentDisplay } from '../services/studentService';
import { toast } from 'sonner';

// Helper to transform API student to display format
const transformStudent = (student: any): StudentDisplay => ({
  id: student.id,
  name: `${student.first_name} ${student.last_name}`,
  class: student.class_name || `Class ${student.current_class}`, // fallback if class_name missing
  gender: 'Not specified', // you can add gender to your model later
  parentContact: student.parent_phone || 'No contact',
  email: student.email,
  avatar: `${student.first_name[0]}${student.last_name[0]}`.toUpperCase(),
  status: student.is_active ? 'active' : 'inactive',
});

export function useStudents(filters?: StudentFilters) {
  const queryClient = useQueryClient();

   const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['students', filters],
    queryFn: () => studentService.getAll(filters),
  });

  const createStudent = useMutation({
    mutationFn: (data: StudentFormData) => studentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create student');
    },
  });

  const updateStudent = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<StudentFormData> }) => 
      studentService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update student');
    },
  });

  const deleteStudent = useMutation({
    mutationFn: (id: number) => studentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete student');
    },
  });

  // ✅ FIX: data is the array directly (not data.results)
  const students: StudentDisplay[] = data?.map(transformStudent) || [];
  const totalCount = data?.length || 0;

  return {
    students,
    totalCount,
    isLoading,
    error,
    refetch,
    createStudent: createStudent.mutate,
    updateStudent: updateStudent.mutate,
    deleteStudent: deleteStudent.mutate,
    isCreating: createStudent.isPending,
    isUpdating: updateStudent.isPending,
    isDeleting: deleteStudent.isPending,
  };
}

export function useStudent(id: number) {
  return useQuery({
    queryKey: ['student', id],
    queryFn: () => studentService.getOne(id),
    enabled: !!id,
  });
}

export function useClasses() {
  return useQuery({
    queryKey: ['classes'],
    queryFn: () => studentService.getClasses(),
  });
}