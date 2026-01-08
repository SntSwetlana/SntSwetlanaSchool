// pages/AdminDashboard.tsx
import React from 'react';

const AdminDashboard: React.FC = () => {
  // Тяжелый компонент загружается только для админов
  const AdminStats = React.lazy(() => import('./../../components/admin/AdminStats/AdminStats'));
  const UserManagement = React.lazy(() => import('./../../components/admin/UserManagement/UserManagement'));

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <React.Suspense fallback={<div>Loading admin modules...</div>}>
        <AdminStats />
        <UserManagement />
      </React.Suspense>
    </div>
  );
};

export default AdminDashboard;