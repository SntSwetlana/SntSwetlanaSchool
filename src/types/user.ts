// types/user.ts
export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'admin' | 'teacher' | 'tutor' | 'student' | 'guest';
  gender: 'male' | 'female' | 'other';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  avatarType?: 'boy' | 'girl';
}

export interface CreateUserData {
  username: string;
  email: string;
  fullName: string;
  password: string;
  role: User['role'];
  gender: User['gender'];
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  fullName?: string;
  role?: User['role'];
  gender?: User['gender'];
  status?: User['status'];
}