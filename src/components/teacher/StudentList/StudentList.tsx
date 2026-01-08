import React from 'react'

interface StudentListProps {
  students?: Array<{
    id: number;
    name: string;
    grade: string;
  }>;
}

const StudentList: React.FC<StudentListProps> = () => {
  return (
    <div>StudentList</div>
  )
}
export default StudentList;