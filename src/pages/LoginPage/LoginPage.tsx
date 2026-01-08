// pages/LoginPage.tsx
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoginForm from '../../components/LoginForm';

const LoginPage: React.FC = () => {
  const { isLoggedIn, loading } = useAuth();

  // Если уже залогинен, редиректим на дашборд
  if (!loading && isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="login-page">
      <h1>Login</h1>
      <LoginForm />
    </div>
  );
};

export default LoginPage;