// hoc/withRole.tsx
import React from 'react';
import { useAuth, type UserRole } from '../contexts/AuthContext';

interface WithRoleProps {
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

export function withRole<P extends object>(
  Component: React.ComponentType<P>,
  options: WithRoleProps
): React.FC<P> {
  const { allowedRoles, fallback = null } = options;
  
  return function WithRoleComponent(props: P) {
    const { hasAnyRole, loading } = useAuth();
    
    if (loading) {
      return <div>Loading...</div>;
    }
    
    if (!hasAnyRole(allowedRoles)) {
      return <>{fallback}</>;
    }
    
    return <Component {...props} />;
  };
}

// Использование:
// const AdminOnlyComponent = withRole(SomeComponent, { allowedRoles: ['admin'] });