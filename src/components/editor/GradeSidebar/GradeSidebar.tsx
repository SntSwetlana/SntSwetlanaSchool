import React from 'react';
import type { Grade } from './../../../types/editor';

interface GradeSidebarProps {
  grades: Grade[];
  selectedGrade: number;
  onGradeSelect: (gradeLevel: number) => void;
}

const GradeSidebar: React.FC<GradeSidebarProps> = ({
  grades,
  selectedGrade,
  onGradeSelect,
}) => {
  const sortedGrades = [...grades].sort((a, b) => a.level - b.level);

  const getGradeDisplay = (grade: Grade) => {
    if (grade.level === 0) return 'K';
    return grade.level.toString();
  };

  return (
    <div className="grade-sidebar">
      <div className="sidebar-header">
        <h3>Классы</h3>
        <button 
          className={`grade-button ${selectedGrade === -1 ? 'selected' : ''}`}
          onClick={() => onGradeSelect(-1)}
        >
          Все
        </button>
      </div>
      
      <div className="grades-list">
        {sortedGrades.map(grade => (
          <button
            key={grade.id}
            className={`grade-button ${selectedGrade === grade.level ? 'selected' : ''}`}
            onClick={() => onGradeSelect(grade.level)}
            title={`${grade.name} (${grade.ageRange.min}-${grade.ageRange.max} лет)`}
          >
            <div className="grade-level">{getGradeDisplay(grade)}</div>
            <div className="grade-name">{grade.name}</div>
            <div className="grade-age">{grade.ageRange.min}-{grade.ageRange.max}</div>
          </button>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="stats">
          <p>Всего классов: {grades.length}</p>
          <p>K-12 система</p>
        </div>
      </div>
    </div>
  );
};

export default GradeSidebar;