import { motion } from "framer-motion";
import { Download, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useAttendance } from "@/hooks/useAttendance";
import { useClasses } from "@/hooks/useStudents";
import { useState, useMemo } from "react";
import { Loader2 } from "lucide-react";

// Colors for charts
const COLORS = ["hsl(152, 60%, 45%)", "hsl(0, 72%, 51%)", "hsl(48, 96%, 53%)"];

export default function Reports() {
  const { data: classes, isLoading: classesLoading } = useClasses();
  const { data: attendance, isLoading: attendanceLoading } = useAttendance(); // fetch all attendance

  // Compute attendance summary
  const attendanceSummary = useMemo(() => {
    if (!attendance || attendance.length === 0) return null;

    let present = 0,
      absent = 0,
      late = 0;
    attendance.forEach((record: any) => {
      if (record.status === "present") present++;
      else if (record.status === "absent") absent++;
      else if (record.status === "late") late++;
    });
    const total = present + absent + late;
    return {
      present: total ? Math.round((present / total) * 100) : 0,
      absent: total ? Math.round((absent / total) * 100) : 0,
      late: total ? Math.round((late / total) * 100) : 0,
      raw: { present, absent, late, total },
    };
  }, [attendance]);

  // Attendance per class (for bar chart)
  const classAttendance = useMemo(() => {
    if (!attendance || !classes) return [];
    const classMap: Record<number, { present: number; total: number }> = {};
    attendance.forEach((record: any) => {
      const classId = record.class_obj;
      if (!classMap[classId]) {
        classMap[classId] = { present: 0, total: 0 };
      }
      classMap[classId].total++;
      if (record.status === "present") classMap[classId].present++;
    });
    return classes
      .map((cls: any) => {
        const stats = classMap[cls.id] || { present: 0, total: 0 };
        return {
          class: cls.name,
          attendanceRate: stats.total ? Math.round((stats.present / stats.total) * 100) : 0,
        };
      })
      .filter((item: any) => item.attendanceRate > 0); // only show classes with data
  }, [attendance, classes]);

  const isLoading = classesLoading || attendanceLoading;

  // Mock top students – until exams are implemented
  const topStudents = [
    { name: "Sarah Johnson", class: "10A", avg: 95 },
    { name: "Olivia Miller", class: "8A", avg: 93 },
    { name: "Daniel Wilson", class: "8A", avg: 91 },
    { name: "Emily Brown", class: "9B", avg: 89 },
    { name: "James Williams", class: "10A", avg: 87 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">Analytics and performance summaries</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export PDF
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export Excel
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Attendance Pie */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-card p-6 shadow-card"
            >
              <h3 className="mb-4 text-lg font-semibold text-card-foreground">
                Overall Attendance
              </h3>
              {attendanceSummary && attendanceSummary.raw.total > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Present", value: attendanceSummary.present },
                        { name: "Absent", value: attendanceSummary.absent },
                        { name: "Late", value: attendanceSummary.late },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      <Cell fill={COLORS[0]} />
                      <Cell fill={COLORS[1]} />
                      <Cell fill={COLORS[2]} />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[220px] items-center justify-center text-muted-foreground">
                  No attendance data yet
                </div>
              )}
            </motion.div>

            {/* Class Attendance Performance */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl bg-card p-6 shadow-card"
            >
              <h3 className="mb-4 text-lg font-semibold text-card-foreground">
                Attendance by Class
              </h3>
              {classAttendance.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={classAttendance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(228, 20%, 88%)" />
                    <XAxis dataKey="class" stroke="hsl(228, 12%, 50%)" fontSize={12} />
                    <YAxis stroke="hsl(228, 12%, 50%)" fontSize={12} domain={[0, 100]} />
                    <Tooltip />
                    <Bar
                      dataKey="attendanceRate"
                      fill="hsl(289, 80%, 40%)"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[220px] items-center justify-center text-muted-foreground">
                  No class attendance data yet
                </div>
              )}
            </motion.div>
          </div>

          {/* Top Students (still mock until exams are implemented) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl bg-card p-6 shadow-card"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-card-foreground">
                Top Performing Students
              </h3>
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-left font-medium text-muted-foreground">Rank</th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">Student</th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">Class</th>
                    <th className="pb-3 text-right font-medium text-muted-foreground">Average</th>
                  </tr>
                </thead>
                <tbody>
                  {topStudents.map((s, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="py-3">
                        <span
                          className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-primary-foreground ${
                            i === 0
                              ? "bg-gradient-to-r from-yellow-500 to-amber-500"
                              : i === 1
                              ? "bg-gradient-to-r from-gray-400 to-gray-500"
                              : i === 2
                              ? "bg-gradient-to-r from-amber-700 to-amber-800"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {i + 1}
                        </span>
                      </td>
                      <td className="py-3 font-medium text-card-foreground">{s.name}</td>
                      <td className="py-3 text-muted-foreground">{s.class}</td>
                      <td className="py-3 text-right font-semibold text-success">{s.avg}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}