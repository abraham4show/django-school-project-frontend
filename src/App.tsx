import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";

// Public pages
import Login from './pages/Login';
import Register from './pages/Register';

// Role‑specific dashboards
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';

// Management pages
import StudentList from './pages/Students';
import TeacherList from './pages/TeacherList';
import Classes from './pages/Classes';
import Exams from './pages/Exams';
import Attendance from './pages/Attendance';
import Reports from './pages/Reports';
import BulkAssignStudents from './pages/BulkAssignStudents';
import BulkAssignTeachersToClass from './pages/BulkAssignTeachersToClass';
import SendNotification from './pages/SendNotification';

// Student pages
import TakeExam from './pages/TakeExam';

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Root redirect – could go to dashboard based on role, but we handle after login */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* All protected routes share the AppLayout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              {/* Role‑specific dashboards as index routes (optional) */}
              <Route
                index
                element={
                  <ProtectedRoute allowedRoles={['admin', 'teacher', 'student']}>
                    {/* Choose a default dashboard based on role – you can use a component that redirects, or handle in code */}
                    <Navigate to="/dashboard" replace />
                  </ProtectedRoute>
                }
              />
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="teacher-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <TeacherDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="student-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
<Route path="student" element={<Navigate to="student-dashboard" replace />} />
              {/* Management pages (accessible to admin and teachers where appropriate) */}
              <Route
                path="students"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                    <StudentList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="teachers"
                element={
                  <ProtectedRoute allowedRoles={['admin','teacher']}>
                    <TeacherList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="classes"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                    <Classes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="exams"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                    <Exams />
                  </ProtectedRoute>
                }
              />
              <Route
  path="send-notification"
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <SendNotification />
    </ProtectedRoute>
  }
/>
              <Route
                path="attendance"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                    <Attendance />
                  </ProtectedRoute>
                }
              />
              <Route
                path="reports"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                    <Reports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="bulk/students"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                    <BulkAssignStudents />
                  </ProtectedRoute>
                }
              />
              <Route
                path="bulk/teachers-to-class"
                element={
                  <ProtectedRoute allowedRoles={['admin','teacher']}>
                    <BulkAssignTeachersToClass />
                  </ProtectedRoute>
                }
              />
              <Route
                path="take-exam/:examId"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <TakeExam />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;