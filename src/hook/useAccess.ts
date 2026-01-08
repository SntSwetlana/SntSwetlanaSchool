// hooks/useAccess.ts
import { useAuth, type UserRole } from '../contexts/AuthContext';

export function useAccess() {
  const { hasRole, hasAnyRole, hasPermission, userData } = useAuth();
  
  const canAccess = (resource: string, action: string): boolean => {
    // Проверка пермишенов
    if (userData?.permissions?.includes(`${resource}.${action}`)) {
      return true;
    }
    
    // Проверка по ролям
    const rolePermissions: Record<UserRole, Record<string, string[]>> = {
      admin: {
        users: ['create', 'read', 'update', 'delete'],
        courses: ['create', 'read', 'update', 'delete'],
      },
      teacher: {
        courses: ['create', 'read', 'update'],
        assignments: ['create', 'read', 'update', 'delete'],
      },
      tutor: {
        courses: ['create', 'read', 'update'],
        assignments: ['create', 'read', 'update', 'delete'],
      },
      student: {
        courses: ['read'],
        assignments: ['read'],
      },
      guest: {
        courses: ['read'],
      }
    };
    
    return userData?.roles.some(role => 
      rolePermissions[role]?.[resource]?.includes(action)
    ) || false;
  };
  
  return {
    canAccess,
    hasRole,
    hasAnyRole,
    hasPermission,
  };
}