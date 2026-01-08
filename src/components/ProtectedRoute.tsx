// components/ProtectedRoute.tsx
import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth }from './../contexts/AuthContext';
import type { UserRole }  from './../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
  fallback?: ReactNode;
}

export const ProtectedRoute = ({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/login',
  fallback 
}: ProtectedRouteProps) => {
  const { isLoggedIn, userData, loading } = useAuth();

  if (loading) {
    return fallback || <div>Loading...</div>;
  }

  if (!isLoggedIn) {
    return <Navigate to={redirectTo} replace />;
  }

  if (allowedRoles.length > 0 && userData) {
    const hasAccess = userData.roles.some(role => 
      allowedRoles.includes(role)
    );
    
    if (!hasAccess) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};