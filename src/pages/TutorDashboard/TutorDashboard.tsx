// pages/TutorDashboard.tsx
import React from 'react';

const TutorDashboard: React.FC = () => {
  const StudentList = React.lazy(() => import('./../../components/tutor/StudentList/StudentList'));
  const AssignmentManager = React.lazy(() => import('./../../components/tutor/AssignmentManager/AssignmentManager'));

  return (
    <div className="tutor-dashboard">
      <h1>Tutor Dashboard</h1>
      <React.Suspense fallback={<div>Loading tutor modules...</div>}>
        <StudentList />
        <AssignmentManager />
      </React.Suspense>
    </div>
  );
};

export default TutorDashboard;