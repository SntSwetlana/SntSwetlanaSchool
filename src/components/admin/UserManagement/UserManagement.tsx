import React from 'react'

interface UserManagementProps {
  students?: Array<{
    id: number;
    name: string;
    grade: string;
  }>;
}

const UserManagement: React.FC<UserManagementProps> = () => {
  return (
    <div>UserManagement</div>
  )
}
export default UserManagement;