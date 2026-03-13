import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: Array<'admin' | 'teacher' | 'student'>;
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user, isLoading } = useAuth();
console.log('ProtectedRoute: user=', user, 'allowedRoles=', allowedRoles);
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

 if (allowedRoles && user && !allowedRoles.includes(user.role)) {
  if (user.role === 'admin') return <Navigate to="/dashboard" replace />;
  if (user.role === 'teacher') return <Navigate to="/teacher-dashboard" replace />;
  if (user.role === 'student') return <Navigate to="/student-dashboard" replace />;
  return <Navigate to="/" replace />;
}

  return <>{children}</>;
};