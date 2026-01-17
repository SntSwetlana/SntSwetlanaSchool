import React from 'react';
import type { Assignment, Subject, Grade } from './../../../types/editor';

interface AssignmentTableProps {
  assignments: Assignment[];
  selectedAssignments: string[];
  subjects: Subject[];
  grades: Grade[];
  onSelectAssignment: (assignmentId: string) => void;
  onSelectAll: () => void;
  getSubjectName: (subjectId: string) => string;
  getGradeName: (gradeLevel: number) => string;
}

const AssignmentTable: React.FC<AssignmentTableProps> = ({
  assignments,
  selectedAssignments,
  subjects,
  grades,
  onSelectAssignment,
  onSelectAll,
  getSubjectName,
  getGradeName,
}) => {
  if (assignments.length === 0) {
    return (
      <div className="empty-assignments">
        <div className="empty-icon">📚</div>
        <h3>Заданий не найдено</h3>
        <p>Измените фильтры или создайте новое задание</p>
      </div>
    );
  }

  return (
    <div className="assignment-table-container">
      <table className="assignment-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={assignments.length > 0 && selectedAssignments.length === assignments.length}
                onChange={onSelectAll}
                className="select-all-checkbox"
              />
            </th>
            <th>Название</th>
            <th>Предмет</th>
            <th>Класс</th>
            <th>Сложность</th>
            <th>Время</th>
            <th>Статус</th>
            <th>Теги</th>
            <th>Создано</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {assignments.map(assignment => {
            const subject = subjects.find(s => s.id === assignment.subjectId);
            
            return (
              <tr 
                key={assignment.id} 
                className={`assignment-row ${selectedAssignments.includes(assignment.id) ? 'selected' : ''}`}
                onClick={() => onSelectAssignment(assignment.id)}
              >
                <td>
                  <input
                    type="checkbox"
                    checked={selectedAssignments.includes(assignment.id)}
                    onChange={() => onSelectAssignment(assignment.id)}
                    className="assignment-checkbox"
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
                <td className="assignment-title">
                  <div className="title-wrapper">
                    <strong>{assignment.title}</strong>
                    <p className="description">{assignment.description.substring(0, 100)}...</p>
                  </div>
                </td>
                <td className="assignment-subject">
                  <span 
                    className="subject-badge"
                    style={{ backgroundColor: subject?.color || '#ccc' }}
                  >
                    {getSubjectName(assignment.subjectId)}
                  </span>
                </td>
                <td className="assignment-grade">
                  <span className="grade-badge">
                    {getGradeName(assignment.gradeLevel)}
                  </span>
                </td>
                <td className="assignment-difficulty">
                  <span className={`difficulty-badge difficulty-${assignment.difficulty}`}>
                    {assignment.difficulty === 'easy' ? 'Легко' : 
                     assignment.difficulty === 'medium' ? 'Средне' : 'Сложно'}
                  </span>
                </td>
                <td className="assignment-time">
                  <span className="time-badge">
                    ⏱️ {assignment.estimatedTime} мин
                  </span>
                </td>
                <td className="assignment-status">
                  <span className={`status-badge ${assignment.isPublished ? 'published' : 'draft'}`}>
                    {assignment.isPublished ? 'Опубликовано' : 'Черновик'}
                  </span>
                </td>
                <td className="assignment-tags">
                  <div className="tags-list">
                    {assignment.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="tag">
                        #{tag}
                      </span>
                    ))}
                    {assignment.tags.length > 3 && (
                      <span className="tag-more">+{assignment.tags.length - 3}</span>
                    )}
                  </div>
                </td>
                <td className="assignment-date">
                  {new Date(assignment.createdAt).toLocaleDateString()}
                </td>
                <td className="assignment-actions" onClick={(e) => e.stopPropagation()}>
                  <button 
                    className="btn-action view"
                    title="Просмотреть"
                    onClick={() => window.open(`/assignment/${assignment.id}`, '_blank')}
                  >
                    👁️
                  </button>
                  <button 
                    className="btn-action duplicate"
                    title="Дублировать"
                    onClick={() => {/* TODO: Реализовать дублирование */}}
                  >
                    📋
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="table-footer">
        <div className="selection-info">
          Выбрано: {selectedAssignments.length} из {assignments.length}
        </div>
        <div className="pagination">
          <button disabled>←</button>
          <span>Страница 1</span>
          <button disabled>→</button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentTable;