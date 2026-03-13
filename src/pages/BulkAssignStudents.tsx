import { useState } from 'react';
import { useStudents } from '@/hooks/useStudents';
import { useClasses } from '@/hooks/useStudents';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function BulkAssignStudents() {
  const { data: students, refetch } = useStudents();
  const { data: classes } = useClasses();
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [targetClass, setTargetClass] = useState<string>('');

  const toggleStudent = (id: number) => {
    setSelectedStudents(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleAssign = async () => {
    if (!targetClass || selectedStudents.length === 0) {
      toast.error('Select a class and at least one student');
      return;
    }

    try {
      const res = await api.post('/students/bulk_assign_class/', {
        student_ids: selectedStudents,
        class_id: parseInt(targetClass),
      });
      toast.success(res.data.message);
      setSelectedStudents([]);
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Assignment failed');
    }
  };

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold">Bulk Assign Students to Class</h1>

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
        <Button onClick={handleAssign} disabled={!targetClass || selectedStudents.length === 0}>
          Assign Selected
        </Button>
      </div>

      <div className="grid gap-2">
        {students?.map((student: any) => (
          <label key={student.id} className="flex items-center gap-3 p-2 border rounded">
            <Checkbox
              checked={selectedStudents.includes(student.id)}
              onCheckedChange={() => toggleStudent(student.id)}
            />
            <span>{student.name} (ID: {student.student_id})</span>
          </label>
        ))}
      </div>
    </div>
  );
}