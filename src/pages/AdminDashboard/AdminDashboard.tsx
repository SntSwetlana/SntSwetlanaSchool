// pages/AdminDashboard.tsx
import React, { Suspense } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const UserManagement = React.lazy(() => import('../../components/admin/UserManagement/UserManagement'));

const AdminDashboard: React.FC = () => {
  const { userData } = useAuth();

  return (
    <div className="dashboard admin-dashboard">
      <div className="dashboard-content">
        <Suspense fallback={<LoadingSpinner />}>
          <UserManagement />
        </Suspense>
      </div>
    </div>
  );
};

export default AdminDashboard;