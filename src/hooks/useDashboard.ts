import { useStudents } from './useStudents';
import { useClasses } from './useStudents'; // or from a separate classes hook

export const useDashboard = () => {
  const { students, isLoading: studentsLoading } = useStudents();
  const { data: classes, isLoading: classesLoading } = useClasses();

  // ✅ Safely ensure classes is an array
  const classesArray = Array.isArray(classes) ? classes : [];

  // Calculate metrics (students is assumed to be an array from useStudents)
  const totalStudents = students?.length ?? 0;
  const activeStudents = students?.filter(s => s.status === 'active').length ?? 0;
  const inactiveStudents = students?.filter(s => s.status === 'inactive').length ?? 0;

  // Students per class – safely map over classesArray
  const studentsPerClass = classesArray.map(cls => {
    const count = students?.filter(s => {
      // Adjust this logic to match your actual class matching criteria
      // For example, if s.class is "Class kg 2", strip prefix
      const studentClass = s.class?.replace('Class ', '') ?? '';
      return studentClass === cls.name;
    }).length ?? 0;
    return {
      className: cls.name,
      count,
    };
  });

  return {
    totalStudents,
    activeStudents,
    inactiveStudents,
    studentsPerClass,
    isLoading: studentsLoading || classesLoading,
  };
};