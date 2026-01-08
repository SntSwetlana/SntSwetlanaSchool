// components/RoleBasedRedirect.tsx
import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from './../LoadingSpinner';

interface RoleBasedRedirectProps {
  fallbackPath?: string;
}

const RoleBasedRedirect: React.FC<RoleBasedRedirectProps> = ({ 
  fallbackPath = '/login' 
}) => {
  const { isLoggedIn, loading, getUserDashboardPath } = useAuth();
  const location = useLocation();

  // Логируем для отладки
  useEffect(() => {
    console.log('RoleBasedRedirect:', {
      isLoggedIn,
      loading,
      pathname: location.pathname
    });
  }, [isLoggedIn, loading, location.pathname]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isLoggedIn) {
    return <Navigate to={fallbackPath} replace />;
  }

  const dashboardPath = getUserDashboardPath();
  console.log('Redirecting to:', dashboardPath);
  return <Navigate to={dashboardPath} replace />;
};

export default RoleBasedRedirect;