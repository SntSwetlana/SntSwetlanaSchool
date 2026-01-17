import { useCallback, useEffect, useState, type ReactNode } from "react";
import { AuthContext, type UserData, type UserRole } from "../contexts/AuthContext";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  console.log('AuthProvider render: isLoggedIn=', isLoggedIn, 'userData=', userData, 'loading=', loading);

  const checkAuth = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        console.log('Auth check response OK');
        const data = await response.json();
        setIsLoggedIn(true);
        setUserData({
          id: data.id || Date.now().toString(),
          username: data.username || 'User',
          avatarType: data.gender === 'male' ? 'boy' : 'girl',
          roles: data.roles || ['guest'],
          email: data.email,
          permissions: data.permissions || []
        });
      } else {
        setIsLoggedIn(false);
        setUserData(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsLoggedIn(false);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const hasRole = useCallback((role: UserRole): boolean => {
    return userData?.roles.includes(role) || false;
  }, [userData]);

  const hasAnyRole = useCallback((roles: UserRole[]): boolean => {
    return userData?.roles.some(role => roles.includes(role)) || false;
  }, [userData]);

  const hasPermission = useCallback((permission: string): boolean => {
    return userData?.permissions?.includes(permission) || false;
  }, [userData]);

  const getUserDashboardPath = useCallback((): string => {
    if (!userData) return '/login';
    
    if (hasRole('admin')) return '/admin';
    if (hasRole('teacher')) return '/teacher';
    if (hasRole('tutor')) return '/tutor';
    if (hasRole('student')) return '/student';
    if (hasRole('editor')) return '/editor';
    
    return '/'; // Для гостей и остальных
  }, [userData, hasRole]);

  const getUserDashboardName = useCallback((): string => {
    if (!userData) return 'Login';
    
    if (hasRole('admin')) return 'Admin Dashboard';
    if (hasRole('teacher')) return 'Teacher Dashboard';
    if (hasRole('tutor')) return 'Tutor Dashboard';
    if (hasRole('student')) return 'Student Dashboard';
    if (hasRole('editor')) return 'Editor Dashboard';
    
    return 'Home'; // Для гостей
  }, [userData, hasRole]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      console.log('Login response data:', data);

      if (!res.ok || !data.ok) {
        return false;
      }

      await checkAuth();

/*      setIsLoggedIn(true);
      setUserData({
        id: Date.now().toString(),
        username: data.username || 'User',
        avatarType: data.gender === 'male' ? 'boy' : 'girl',
        roles: data.roles || ['guest'],
        email: data.email,
        permissions: data.permissions || []
      });
*/
    return true;
  
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggedIn(false);
      setUserData(null);
      sessionStorage.clear();
    }
  };

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const value = {
    isLoggedIn,
    userData,
    loading,
    hasRole,
    hasAnyRole,
    hasPermission,
    getUserDashboardPath,
    getUserDashboardName,
    login,
    logout,
  };

  console.log('AuthProvider render END: isLoggedIn=', isLoggedIn, 'userData=', userData, 'loading=', loading);


  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};