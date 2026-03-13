import { useState } from 'react';
import { useTeachers } from '@/hooks/useTeachers';
import { useClasses } from '@/hooks/useStudents';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function BulkAssignTeachersToClass() {
  const { data: teachers } = useTeachers();
  const { data: classes } = useClasses();
  const [selectedTeachers, setSelectedTeachers] = useState<number[]>([]);
  const [targetClass, setTargetClass] = useState<string>('');

  const toggleTeacher = (id: number) => {
    setSelectedTeachers(prev =>
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    );
  };

  const handleAssign = async () => {
    if (!targetClass || selectedTeachers.length === 0) {
      toast.error('Select a class and at least one teacher');
      return;
    }

    try {
      const res = await api.post('/teachers/bulk_assign_to_class/', {
        teacher_ids: selectedTeachers,
        class_id: parseInt(targetClass),
      });
      toast.success(res.data.message);
      setSelectedTeachers([]);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Assignment failed');
    }
  };

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold">Bulk Assign Teachers to Class</h1>

      <div className="flex gap-4 items-center">
        <Select value={targetClass} onValueChange={setTargetClass}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select target class" />
          </SelectTrigger>
          <SelectContent>
            {classes?.map((cls: any) => (
              <SelectItem key={cls.id} value={cls.id.toString()}>
                {cls.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleAssign} disabled={!targetClass || selectedTeachers.length === 0}>
          Assign Selected
        </Button>
      </div>

      <div className="grid gap-2">
        {teachers?.map((teacher: any) => (
          <label key={teacher.id} className="flex items-center gap-3 p-2 border rounded">
            <Checkbox
              checked={selectedTeachers.includes(teacher.id)}
              onCheckedChange={() => toggleTeacher(teacher.id)}
            />
            <span>{teacher.first_name} {teacher.last_name} ({teacher.employee_id})</span>
          </label>
        ))}
      </div>
    </div>
  );
}