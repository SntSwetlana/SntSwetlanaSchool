import { createContext, useContext } from 'react';

export interface UserData {
  id: string;
  username: string;
  avatarType: string;
  roles: string[];
  email?: string;
  permissions: string[];
}

export type UserRole = 'admin' | 'teacher' | 'tutor' | 'student' | 'editor' | 'guest';

export interface AuthContextType {
  isLoggedIn: boolean;
  userData: UserData | null;
  loading: boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  hasPermission: (permission: string) => boolean;
  getUserDashboardPath: () => string;
  getUserDashboardName: () => string;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};