import React from 'react'

interface AssignmentManagerProps {
  students?: Array<{
    id: number;
    name: string;
    grade: string;
  }>;
}

const AssignmentManager: React.FC<AssignmentManagerProps> = () => {
  return (
    <div>AssignmentManager</div>
  )
}
export default AssignmentManager;