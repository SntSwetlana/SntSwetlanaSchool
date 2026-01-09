// types/user.ts
export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: 'admin' | 'teacher' | 'tutor' | 'student' | 'guest';
  gender: 'male' | 'female' | 'other';
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
  lastLogin?: string;
  avatarType?: 'boy' | 'girl';
}

export interface CreateUserData {
  username: string;
  email: string;
  full_name: string;
  password: string;
  role: User['role'];
  gender: User['gender'];
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  full_name?: string;
  role?: User['role'];
  gender?: User['gender'];
  status?: User['status'];
}