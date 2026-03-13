import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, X, Calendar, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useClasses } from "@/hooks/useStudents";
import { useStudents } from "@/hooks/useStudents";
import { useAttendance, useMarkBulkAttendance } from "@/hooks/useAttendance";
import { format } from "date-fns";
import { toast } from "sonner";

export default function Attendance() {
 const { data: classes, isLoading: classesLoading } = useClasses();
const [selectedClass, setSelectedClass] = useState<string>("");
const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
const [attendance, setAttendance] = useState<Record<number, "present" | "absent" | "late">>({});

const { students, isLoading: studentsLoading } = useStudents(
  selectedClass ? { current_class: parseInt(selectedClass) } : undefined
);

const { data: existingAttendance, isLoading: attendanceLoading, refetch } = useAttendance(
  selectedClass && date ? { class: parseInt(selectedClass), date } : undefined
);

  const markBulkMutation = useMarkBulkAttendance();

  // When existing attendance loads, populate statuses
  useEffect(() => {
    if (existingAttendance && Array.isArray(existingAttendance) && existingAttendance.length > 0) {
      const statusMap: Record<number, "present" | "absent" | "late"> = {};
      existingAttendance.forEach((record: any) => {
        statusMap[record.student] = record.status;
      });
      setAttendance(statusMap);
    } else if (students && students.length > 0 && !attendanceLoading) {
      // No attendance for this day yet – default to present
      const defaultStatus: Record<number, "present" | "absent" | "late"> = {};
      students.forEach((student: any) => {
        defaultStatus[student.id] = "present";
      });
      setAttendance(defaultStatus);
    }
  }, [existingAttendance, students, attendanceLoading]);

  const toggle = (id: number) => {
     console.log('Toggling student', id);
    setAttendance((prev) => {
      const current = prev[id] || "present";
      const next = current === "present" ? "absent" : current === "absent" ? "late" : "present";
       console.log(`Current: ${current}, Next: ${next}`);
      return { ...prev, [id]: next };
    });
  };

  const markAll = (status: "present" | "absent" | "late") => {
    if (!students) return;
    const all: Record<number, "present" | "absent" | "late"> = {};
    students.forEach((s: any) => (all[s.id] = status));
    setAttendance(all);
  };

  const handleSave = async () => {
    if (!selectedClass || !date) {
      toast.error("Please select class and date");
      return;
    }
    if (!students || students.length === 0) {
      toast.error("No students in this class");
      return;
    }

    const records = students.map((student: any) => ({
      student_id: student.id,
      status: attendance[student.id] || "present",
      remarks: "",
    }));

    markBulkMutation.mutate(
      {
        class_id: parseInt(selectedClass),
        date,
        records,
      },
      {
        onSuccess: () => {
          refetch();
        },
      }
    );
  };

  const presentCount = students
    ? students.filter((s: any) => attendance[s.id] === "present").length
    : 0;
  const absentCount = students
    ? students.filter((s: any) => attendance[s.id] === "absent").length
    : 0;
  const lateCount = students
    ? students.filter((s: any) => attendance[s.id] === "late").length
    : 0;

  const isLoading = classesLoading || studentsLoading || attendanceLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Attendance</h1>
        <p className="text-muted-foreground">Mark daily attendance for each class</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select value={selectedClass} onValueChange={setSelectedClass} disabled={isLoading}>
          <SelectTrigger className="w-full sm:w-40 bg-card">
            <SelectValue placeholder="Select class" />
          </SelectTrigger>
          <SelectContent>
            {classes?.map((cls: any) => (
              <SelectItem key={cls.id} value={cls.id.toString()}>
                {cls.name} {cls.section && `(${cls.section})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-10 rounded-lg border border-input bg-card pl-9 pr-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={isLoading}
          />
        </div>

        <div className="flex gap-2 sm:ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAll("present")}
            className="text-success"
            disabled={isLoading || !students}
          >
            <Check className="mr-1 h-4 w-4" /> All Present
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAll("absent")}
            className="text-destructive"
            disabled={isLoading || !students}
          >
            <X className="mr-1 h-4 w-4" /> All Absent
          </Button>
        </div>
      </div>

      {/* Summary */}
      {students && students.length > 0 && (
        <div className="flex gap-4">
          <div className="rounded-lg bg-success/10 px-4 py-2 text-sm font-medium text-success">
            Present: {presentCount}
          </div>
          <div className="rounded-lg bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive">
            Absent: {absentCount}
          </div>
          <div className="rounded-lg bg-yellow-500/10 px-4 py-2 text-sm font-medium text-yellow-600 dark:text-yellow-400">
            Late: {lateCount}
          </div>
          <div className="rounded-lg bg-muted px-4 py-2 text-sm font-medium text-muted-foreground">
            Total: {students.length}
          </div>
        </div>
      )}

      {/* Student Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !selectedClass ? (
        <div className="text-center py-12 text-muted-foreground">Please select a class</div>
      ) : !students || students.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No students in this class</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {students.map((student: any, i: number) => {
            const status = attendance[student.id] || "present";
            return (
              <motion.button
                key={student.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => toggle(student.id)}
                className={`flex items-center gap-3 rounded-xl p-4 text-left transition-all duration-200 shadow-card hover:shadow-card-hover border-2 ${
                  status === "present"
                    ? "bg-success/10 border-success"
                    : status === "absent"
                    ? "bg-destructive/10 border-destructive"
                    : "bg-yellow-500/10 border-yellow-500"
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-primary-foreground ${
                    status === "present"
                      ? "bg-success"
                      : status === "absent"
                      ? "bg-destructive"
                      : "bg-yellow-500"
                  }`}
                >
                  {status === "present" ? (
                    <Check className="h-5 w-5" />
                  ) : status === "absent" ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <span>L</span>
                  )}
                </div>
                <div>
                  <p className="font-medium text-card-foreground text-sm">{student.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{status}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      <Button
        className="gradient-primary text-primary-foreground border-0 hover:opacity-90 w-full sm:w-auto"
        onClick={handleSave}
        disabled={isLoading || !selectedClass || !students || students.length === 0 || markBulkMutation.isPending}
      >
        {markBulkMutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Attendance"
        )}
      </Button>
    </div>
  );
}