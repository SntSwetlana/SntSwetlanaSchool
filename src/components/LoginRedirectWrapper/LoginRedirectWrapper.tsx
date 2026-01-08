// components/LoginRedirectWrapper.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from './../LoadingSpinner';

interface LoginRedirectWrapperProps {
  children: React.ReactNode;
}

const LoginRedirectWrapper: React.FC<LoginRedirectWrapperProps> = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
export default LoginRedirectWrapper;