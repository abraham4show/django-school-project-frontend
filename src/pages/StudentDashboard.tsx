import { motion } from "framer-motion";
import { useAuth } from '@/contexts/AuthContext';
import { usePublishedExams, useMyAttempts } from '../hooks/useExamAttempt';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Loader2, Sparkles, Clock, TrendingUp, Award, BookOpen, Calendar, ChevronRight } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from "recharts";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

export default function StudentDashboard() {
  const { user } = useAuth();
  const { data: exams, isLoading: examsLoading, error: examsError } = usePublishedExams();
  const { data: attempts, isLoading: attemptsLoading, error: attemptsError } = useMyAttempts();

  // Safely handle arrays
  const examsList = Array.isArray(exams) ? exams : exams?.results || [];
  const attemptsList = Array.isArray(attempts) ? attempts : attempts?.results || [];

  // Compute stats from attempts
  const totalExamsTaken = attemptsList.length;
  const averageScore = totalExamsTaken > 0
    ? (attemptsList.reduce((sum, a) => sum + (a.score || 0), 0) / totalExamsTaken).toFixed(1)
    : 0;
  const bestScore = totalExamsTaken > 0
    ? Math.max(...attemptsList.map(a => a.score || 0))
    : 0;

  // Prepare data for performance chart (mock if not enough attempts)
  const performanceData = attemptsList
    .map((a: any) => ({
      date: a.submitted_at ? new Date(a.submitted_at).toLocaleDateString() : '',
      score: a.score,
      exam: a.exam_title,
    }))
    .reverse(); // show most recent last

  // If no attempts, use placeholder
  const chartData = performanceData.length > 0
    ? performanceData
    : [{ date: 'No data', score: 0 }];

  if (examsLoading || attemptsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (examsError || attemptsError) {
    return (
      <div className="text-center text-red-500 p-4">
        Error loading data. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <motion.div
        {...fadeUp(0)}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 p-8 text-white"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-5 w-5 opacity-80" />
            <span className="text-sm font-medium opacity-80">Welcome back</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {user?.first_name || user?.username || 'Student'}! 👋
          </h1>
          <p className="mt-2 max-w-lg text-sm opacity-80">
            You have {examsList.length} available exam(s) and have taken {totalExamsTaken} exam(s).
            Keep up the great work!
          </p>
          <div className="mt-4 flex gap-3">
            <button className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur-sm transition hover:bg-white/30">
              <BookOpen className="h-4 w-4" /> View Available Exams
            </button>
            <button className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm transition hover:bg-white/20">
              <Calendar className="h-4 w-4" /> Schedule
            </button>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10" />
        <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-white/5" />
        <div className="absolute right-32 top-4 h-20 w-20 rounded-full bg-white/10" />
      </motion.div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div {...fadeUp(0.1)}>
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Available Exams</p>
                  <p className="text-3xl font-bold">{examsList.length}</p>
                </div>
                <div className="rounded-full bg-primary/10 p-3 text-primary">
                  <BookOpen className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...fadeUp(0.2)}>
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Exams Taken</p>
                  <p className="text-3xl font-bold">{totalExamsTaken}</p>
                </div>
                <div className="rounded-full bg-green-500/10 p-3 text-green-600">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...fadeUp(0.3)}>
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                  <p className="text-3xl font-bold">{averageScore}%</p>
                </div>
                <div className="rounded-full bg-yellow-500/10 p-3 text-yellow-600">
                  <Award className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...fadeUp(0.4)}>
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Best Score</p>
                  <p className="text-3xl font-bold">{bestScore}%</p>
                </div>
                <div className="rounded-full bg-purple-500/10 p-3 text-purple-600">
                  <Award className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Performance Chart */}
        <motion.div
          {...fadeUp(0.5)}
          className="lg:col-span-2 rounded-2xl bg-card p-6 shadow-card hover:shadow-card-hover transition-shadow"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-card-foreground">Performance Trend</h3>
              <p className="text-sm text-muted-foreground">Your scores over time</p>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-1.5">
              <TrendingUp className="h-4 w-4 text-success" />
              <span className="text-sm font-semibold text-success">
                {averageScore}% avg
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(231, 90%, 58%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(231, 90%, 58%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(228, 20%, 88%)" vertical={false} />
              <XAxis dataKey="date" stroke="hsl(228, 12%, 50%)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(228, 12%, 50%)" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 8px 32px -4px hsl(231 90% 58% / 0.15)",
                  fontSize: "13px",
                }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="hsl(231, 90%, 58%)"
                strokeWidth={3}
                fill="url(#scoreGrad)"
                dot={{ fill: "hsl(231, 90%, 58%)", r: 4, strokeWidth: 2, stroke: "white" }}
              />
            </AreaChart>
          </ResponsiveContainer>
          {performanceData.length === 0 && (
            <p className="text-center text-muted-foreground mt-4">No attempts yet – take an exam to see your progress!</p>
          )}
        </motion.div>

        {/* Upcoming Exams (existing card) */}
        <motion.div {...fadeUp(0.6)}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Available Exams
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {examsList.length === 0 ? (
                <p className="text-muted-foreground">No exams available.</p>
              ) : (
                examsList.map((exam: any) => (
                  <div key={exam.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                    <div>
                      <p className="font-medium">{exam.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {exam.subject_name} · {exam.duration} · {exam.total_marks} marks
                      </p>
                    </div>
                    <Button asChild size="sm">
                      <Link to={`/take-exam/${exam.id}`}>Start</Link>
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Past Attempts (existing card, maybe full width) */}
      <motion.div {...fadeUp(0.7)}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-warning" />
              My Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {attemptsList.length === 0 ? (
              <p className="text-muted-foreground">No attempts yet.</p>
            ) : (
              attemptsList.map((attempt: any) => (
                <div key={attempt.id} className="border-b pb-2 last:border-0">
                  <p className="font-medium">{attempt.exam_title}</p>
                  <p className="text-sm">
                    Score: {attempt.score} / {attempt.total_marks} · {attempt.passed ? 'Passed' : 'Failed'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Submitted: {attempt.submitted_at ? new Date(attempt.submitted_at).toLocaleString() : 'Not submitted'}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}