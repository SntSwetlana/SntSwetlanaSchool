/*import React, { useEffect, useState } from 'react';*/
import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate  } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { AuthProvider } from './providers/AuthProvider';
//import { ProtectedRoute } from '@/components/ProtectedRoute/';
import AppHeader from './components/AppHeader';
import LoadingSpinner from './components/LoadingSpinner';
import RoleBasedRedirect from './components/RoleBasedRedirect';
import LoginRedirectWrapper from './components/LoginRedirectWrapper';


import { 
  HomePage, 
  PlaceValueNamesPage, 
  ValueOfDigitPage, 
  ConvertToFromNumberPage 
} from './components/Pages';

import '@/App.css';
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard'));
const TutorDashboard = lazy(() => import('./pages/TutorDashboard'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const GuestDashboard = lazy(() => import('./pages/GuestDashboard'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
//const UnauthorizedPage = lazy(() => import('./pages/UnauthorizedPage'));


const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/login' 
}) => {
  const { isLoggedIn, userData, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isLoggedIn) {
    return <Navigate to={redirectTo} replace />;
  }

  if (allowedRoles.length > 0 && userData) {
    const hasAccess = allowedRoles.some(role => 
      userData.roles.includes(role as any)
    );
    
    if (!hasAccess) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

const HomePageWithRedirect: React.FC = () => {
  const { isLoggedIn, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isLoggedIn) {
      // Если залогинен, редиректим на дашборд
      navigate('/dashboard');
    }
  }, [isLoggedIn, loading, navigate]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (isLoggedIn) {
    return <LoadingSpinner />; // Или null пока редирект
  }

  return <HomePage />;
};
// Role-based Route компонент (еще более оптимизированный)
/*const RoleBasedRoute: React.FC<{
  admin?: React.ReactNode;
  teacher?: React.ReactNode;
  tutor?: React.ReactNode;
  student?: React.ReactNode;
  guest?: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ admin, teacher, tutor, student, guest, fallback }) => {
  const { userData, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!userData) {
    return <>{fallback || <Navigate to="/login" replace />}</>;
  }

  // Проверяем роли в порядке приоритета
  if (userData.roles.includes('admin') && admin) {
    return <>{admin}</>;
  }
  
  if (userData.roles.includes('teacher') && teacher) {
    return <>{teacher}</>;
  }
  
  if (userData.roles.includes('tutor') && tutor) {
    return <>{tutor}</>;
  }

  if (userData.roles.includes('student') && student) {
    return <>{student}</>;
  }
  
  if (userData.roles.includes('guest') && guest) {
    return <>{guest}</>;
  }

  return <>{fallback || <Navigate to="/unauthorized" replace />}</>;
};
*/
function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={
           <LoginRedirectWrapper>
            <LoginPage />
            </LoginRedirectWrapper>} />
        <Route path="/unauthorized" element={<div>Access Denied</div>} />
        
        {/* Автоматический редирект на дашборд по роли */}
        <Route path="/dashboard" element={<RoleBasedRedirect />} />
        
        {/* Дашборды для разных ролей */}
        <Route path="/admin/*" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/teacher/*" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/tutor/*" element={
          <ProtectedRoute allowedRoles={['tutor']}>
            <TutorDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/student/*" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/guest/*" element={<GuestDashboard />} />
        
        {/* Общие защищенные маршруты */}
        <Route path="/profile" element={
          <ProtectedRoute allowedRoles={['admin', 'teacher', 'tutor', 'student']}>
            <ProfilePage />
          </ProtectedRoute>
        } />
        
        <Route path="/settings" element={
          <ProtectedRoute allowedRoles={['admin', 'teacher', 'tutor', 'student']}>
            <SettingsPage />
          </ProtectedRoute>
        } />
        
        {/* Страницы математики (публичные) */}
        <Route path="/" element={<HomePageWithRedirect />} />
        <Route path="/math/grade3/place_value_names_up_to_ten_thousands" 
               element={<PlaceValueNamesPage />} />
        <Route path="/math/grade3/value_of_a_digit_up_to_ten_thousands" 
               element={<ValueOfDigitPage />} />
        <Route path="/math/grade3/convert_to_from_a_number" 
               element={<ConvertToFromNumberPage />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppHeader />
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;