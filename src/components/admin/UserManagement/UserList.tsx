// components/admin/UserManagement/UserList.tsx
import React from 'react';
import type { User } from '../../../types/user';
import './UserList.css';

interface UserListProps {
  users: User[];
  loading: boolean;
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

const UserList: React.FC<UserListProps> = ({ 
  users, 
  loading, 
  onEdit, 
  onDelete,
  onRefresh 
}) => {
  const getRoleColor = (role: User['role']) => {
    const colors: Record<User['role'], string> = {
      admin: 'danger',
      teacher: 'warning',
      tutor: 'info',
      student: 'success',
      guest: 'secondary'
    };
    return colors[role];
  };

  const getStatusColor = (status: User['status']) => {
    const colors: Record<User['status'], string> = {
      active: 'success',
      inactive: 'secondary',
      suspended: 'danger'
    };
    return colors[status];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && users.length === 0) {
    return (
      <div className="user-list loading">
        <div className="spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="user-list empty">
        <p>No users found</p>
        <button onClick={onRefresh} className="btn btn-secondary">
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="user-list">
      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Username</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>
                  <div className="user-avatar-cell">
                    <div className={`avatar ${user.avatarType || 'default'}`}>
                      {user.gender === 'male' ? '👨' : '👩'}
                    </div>
                    <span>{user.username}</span>
                  </div>
                </td>
                <td>{user.fullName}</td>
                <td>
                  <a href={`mailto:${user.email}`}>{user.email}</a>
                </td>
                <td>
                  <span className={`badge badge-${getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`badge badge-${getStatusColor(user.status)}`}>
                    {user.status}
                  </span>
                </td>
                <td>{formatDate(user.createdAt)}</td>
                <td>
                  {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => onEdit(user)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => onDelete(user.id)}
                      disabled={user.role === 'admin'} // Нельзя удалить админа
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="user-list-footer">
        <div className="user-count">
          Showing {users.length} user{users.length !== 1 ? 's' : ''}
        </div>
        <button 
          onClick={onRefresh} 
          className="btn btn-outline-secondary btn-sm"
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
    </div>
  );
};

export default UserList;