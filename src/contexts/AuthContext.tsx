// contexts/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, type ReactNode, useCallback } from 'react';

export type UserRole = 'admin' | 'teacher' | 'tutor' | 'student' | 'guest';

interface UserData {
  id: string;
  username: string;
  avatarType: 'boy' | 'girl';
  roles: UserRole[];
  email?: string;
  permissions?: string[];
}

interface AuthContextType {
  isLoggedIn: boolean;
  userData: UserData | null;
  loading: boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  hasPermission: (permission: string) => boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const checkAuth = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/auth/verify', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
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

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        return false;
      }

      await checkAuth();
      return true;

    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch('http://localhost:3000/api/auth/logout', {
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
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};