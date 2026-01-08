import React from 'react'

interface AdminStatsProps {
  students?: Array<{
    id: number;
    name: string;
    grade: string;
  }>;
}

const AdminStats: React.FC<AdminStatsProps> = () => {
  return (
    <div>AdminStats</div>
  )
}
export default AdminStats;