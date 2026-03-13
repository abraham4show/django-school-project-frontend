import { motion } from 'framer-motion';
import { Users, UserCheck, UserX, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboard } from '@/hooks/useDashboard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { SendNotificationDialog } from '../components/SendNotificationDialog'; // <-- import

const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#a4de6c', '#d0ed57', '#ffc0cb'];

export default function AdminDashboard() {
  const { user } = useAuth();
  const { totalStudents, activeStudents, inactiveStudents, studentsPerClass, isLoading } = useDashboard();

  const metrics = [
    {
      title: 'Total Students',
      value: totalStudents,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Active Students',
      value: activeStudents,
      icon: UserCheck,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
      textColor: 'text-green-600 dark:text-green-400',
    },
    {
      title: 'Inactive Students',
      value: inactiveStudents,
      icon: UserX,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50 dark:bg-red-950',
      textColor: 'text-red-600 dark:text-red-400',
    },
    {
      title: 'Classes',
      value: studentsPerClass.length,
      icon: BookOpen,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
      textColor: 'text-purple-600 dark:text-purple-400',
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-80 w-full rounded-xl" />
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Welcome back, {user?.first_name || 'Admin'} <span className="text-sm font-normal text-muted-foreground ml-2">(Role: {user?.role})</span>
        </h1>
        <SendNotificationDialog /> {/* <-- Button to send announcements */}
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, i) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="overflow-hidden border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                    <p className="text-3xl font-bold">{metric.value}</p>
                  </div>
                  <div className={`rounded-full ${metric.bgColor} p-3`}>
                    <metric.icon className={`h-6 w-6 ${metric.textColor}`} />
                  </div>
                </div>
                <div className={`mt-4 h-1.5 w-full rounded-full bg-gradient-to-r ${metric.color}`} />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Students per Class</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={studentsPerClass}>
                <XAxis dataKey="className" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8">
                  {studentsPerClass.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Active Rate</span>
                <span className="font-bold text-lg">
                  {totalStudents ? ((activeStudents / totalStudents) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-green-500 to-green-600"
                  style={{ width: `${totalStudents ? (activeStudents / totalStudents) * 100 : 0}%` }}
                />
              </div>

              <div className="pt-4">
                <h4 className="font-medium mb-2">Class Distribution</h4>
                {studentsPerClass.map((item) => (
                  <div key={item.className} className="flex justify-between text-sm py-1">
                    <span>Class {item.className}</span>
                    <span className="font-medium">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}