/*import React, { useEffect, useState } from 'react';*/
import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate  } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
//import { ProtectedRoute } from '@/components/ProtectedRoute/';
import AppHeader from './components/AppHeader';
import LoadingSpinner from './components/LoadingSpinner';
import '@/App.css';

import { 
  HomePage, 
  PlaceValueNamesPage, 
  ValueOfDigitPage, 
  ConvertToFromNumberPage 
} from './components/Pages';
import NotLoggedMenu from './components/NotLoggedMenu';
import LoggedMenu from './components/LoggedMenu';
type MeResp = { ok: boolean; roles?: string[] };
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

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

// Role-based Route компонент (еще более оптимизированный)
const RoleBasedRoute: React.FC<{
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
const AdminDashboard = lazy(() => import('./pages/AdminDashboard/AdminDashboard'));
const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard/TeacherDashboard'));
const TutorDashboard = lazy(() => import('./pages/TutorDashboard/TutorDashboard'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard/StudentDashboard'));
const GuestDashboard = lazy(() => import('./pages/GuestDashboard/GuestDashboard'));
const ProfilePage = lazy(() => import('./pages/ProfilePage/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage/SettingsPage'));
const LoginPage = lazy(() => import('./pages/LoginPage/LoginPage'));
//const UnauthorizedPage = lazy(() => import('./pages/UnauthorizedPage/UnauthorizedPage'));

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected routes с lazy loading */}
        <Route path="/" element={
          <ProtectedRoute>
            <RoleBasedRoute
              admin={<AdminDashboard />}
              teacher={<TeacherDashboard />}
              tutor={<TutorDashboard />}
              student={<StudentDashboard />}
              guest={<GuestDashboard />}
            />
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute allowedRoles={['admin', 'teacher', 'student']}>
            <ProfilePage />
          </ProtectedRoute>
        } />
        
        <Route path="/settings" element={
          <ProtectedRoute allowedRoles={['admin', 'teacher', 'student']}>
            <SettingsPage />
          </ProtectedRoute>
        } />
        
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
        
        {/* Fallback routes */}
        <Route path="/unauthorized" element={<div>Access Denied</div>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Замените на реальную логику аутентификации
  const [, setRoles] = useState<string[]>([]);

  // 1) при старте проверяем сессию
  useEffect(() => {
    fetch('http://localhost:3000/api/auth/me', {
      credentials: 'include',
    })
      .then(async (r) => (r.ok ? (await r.json()) as MeResp : null))
      .then((data) => {
        if (data?.ok) {
          setIsLoggedIn(true);
          setRoles(data.roles ?? []);
        } else {
          setIsLoggedIn(false);
          setRoles([]);
        }
      })
      .catch(() => {
        setIsLoggedIn(false);
        setRoles([]);
      });
  }, []);

  const handleLoginSuccess = (newRoles: string[]) => {
    setIsLoggedIn(true);
    setRoles(newRoles);
  };

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppHeader />
          <AppRoutes />

          <nav className="main-nav">
          {/* Навигационная панель (опционально) */}
          {!isLoggedIn &&  (
            <NotLoggedMenu onLoginSuccess={handleLoginSuccess} />
          )}            
          {isLoggedIn &&  (
            <LoggedMenu userAvatarType="girl" userName="Irma" onProfileClick={() => {}} onSettingsClick={() => {}} onLogoutClick={() => {}} onSearch={() => {}} />
          )}
            <div className="nav-container">
                <Link to="/" className="nav-logo">
                  Math Grade 3
                </Link>
                  <div className="nav-links">
                    <Link to="/math/grade3/place_value_names_up_to_ten_thousands">
                      Place Value Names
                    </Link>
                    <Link to="/math/grade3/value_of_a_digit_up_to_ten_thousands">
                      Value of a Digit
                    </Link>
                    <Link to="/math/grade3/convert_to_from_a_number">
                      Convert Numbers
                    </Link>
                  </div>
                </div>
            </nav>
            <Routes>
                <Route path="/" element={<HomePage />} />
                  <Route
                    path="/math/grade3/place_value_names_up_to_ten_thousands"
                    element={<PlaceValueNamesPage />} />
                  <Route
                    path="/math/grade3/value_of_a_digit_up_to_ten_thousands"
                    element={<ValueOfDigitPage />} />
                  <Route
                    path="/math/grade3/convert_to_from_a_number"
                    element={<ConvertToFromNumberPage />} />
            </Routes>
            {/* Футер (опционально) */}
              <footer className="main-footer">
                <div className="footer-container">
                  <p>© 2024 Grade 3 Math Practice. Educational materials for learning place value.</p>
                </div>
              </footer>
            </div>
          </Router>
        </AuthProvider>
  );
}
export default App;