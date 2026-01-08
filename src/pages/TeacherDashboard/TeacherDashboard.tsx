// pages/TeacherDashboard.tsx
import React from 'react';

const TeacherDashboard: React.FC = () => {
  const StudentList = React.lazy(() => import('./../../components/teacher/StudentList/StudentList'));
  const AssignmentManager = React.lazy(() => import('./../../components/teacher/AssignmentManager/AssignmentManager'));

  return (
    <div className="teacher-dashboard">
      <h1>Teacher Dashboard</h1>
      <React.Suspense fallback={<div>Loading teacher modules...</div>}>
        <StudentList />
        <AssignmentManager />
      </React.Suspense>
    </div>
  );
};

export default TeacherDashboard;