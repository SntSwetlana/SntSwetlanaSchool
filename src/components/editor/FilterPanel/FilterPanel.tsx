import React from 'react';
import type { Subject } from './../../../types/editor';
import './FilterPanel.css';

interface FilterPanelProps {
  subjects: Subject[];
  selectedSubject: string;
  selectedDifficulty: string;
  selectedStatus: string;
  searchQuery: string;
  onSubjectChange: (subjectId: string) => void;
  onDifficultyChange: (difficulty: string) => void;
  onStatusChange: (status: string) => void;
  onSearchChange: (query: string) => void;
  onAddAssignment: () => void;
  onEditAssignment: () => void;
  onDeleteAssignments: () => void;
  hasSelection: boolean;
  canEdit: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  subjects,
  selectedSubject,
  selectedDifficulty,
  selectedStatus,
  searchQuery,
  onSubjectChange,
  onDifficultyChange,
  onStatusChange,
  onSearchChange,
  onAddAssignment,
  onEditAssignment,
  onDeleteAssignments,
  hasSelection,
  canEdit,
}) => {
  return (
    <div className="filter-panel">
      {/* Строка поиска */}
      <div className="search-row">
        <div className="search-box">
          <input
            type="text"
            placeholder="Поиск заданий..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        {/* Кнопки действий */}
        <div className="action-buttons">
          <button className="btn-add" onClick={onAddAssignment}>
            + Добавить задание
          </button>
          
          <button 
            className="btn-edit" 
            onClick={onEditAssignment}
            disabled={!canEdit}
          >
            ✏️ Редактировать
          </button>
          
          <button 
            className="btn-delete" 
            onClick={onDeleteAssignments}
            disabled={!hasSelection}
          >
            🗑️ Удалить
          </button>
        </div>
      </div>

      {/* Фильтры как radio-buttons */}
      <div className="filter-options">
        {/* Фильтр по предметам */}
        <div className="filter-group">
          <label>Предмет:</label>
          <div className="radio-group">
            <label className="radio-option">
              <input
                type="radio"
                name="subject"
                value="all"
                checked={selectedSubject === 'all'}
                onChange={() => onSubjectChange('all')}
              />
              <span>Все</span>
            </label>
            
            {subjects.map(subject => (
              <label 
                key={subject.id} 
                className="radio-option"
                style={{ '--subject-color': subject.color } as React.CSSProperties}
              >
                <input
                  type="radio"
                  name="subject"
                  value={subject.id}
                  checked={selectedSubject === subject.id}
                  onChange={() => onSubjectChange(subject.id)}
                />
                <span className="subject-color-dot"></span>
                <span>{subject.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Фильтр по сложности */}
        <div className="filter-group">
          <label>Сложность:</label>
          <div className="radio-group">
            <label className="radio-option">
              <input
                type="radio"
                name="difficulty"
                value="all"
                checked={selectedDifficulty === 'all'}
                onChange={() => onDifficultyChange('all')}
              />
              <span>Все</span>
            </label>
            <label className="radio-option difficulty-easy">
              <input
                type="radio"
                name="difficulty"
                value="easy"
                checked={selectedDifficulty === 'easy'}
                onChange={() => onDifficultyChange('easy')}
              />
              <span>Легко</span>
            </label>
            <label className="radio-option difficulty-medium">
              <input
                type="radio"
                name="difficulty"
                value="medium"
                checked={selectedDifficulty === 'medium'}
                onChange={() => onDifficultyChange('medium')}
              />
              <span>Средне</span>
            </label>
            <label className="radio-option difficulty-hard">
              <input
                type="radio"
                name="difficulty"
                value="hard"
                checked={selectedDifficulty === 'hard'}
                onChange={() => onDifficultyChange('hard')}
              />
              <span>Сложно</span>
            </label>
          </div>
        </div>

        {/* Фильтр по статусу */}
        <div className="filter-group">
          <label>Статус:</label>
          <div className="radio-group">
            <label className="radio-option">
              <input
                type="radio"
                name="status"
                value="all"
                checked={selectedStatus === 'all'}
                onChange={() => onStatusChange('all')}
              />
              <span>Все</span>
            </label>
            <label className="radio-option status-draft">
              <input
                type="radio"
                name="status"
                value="draft"
                checked={selectedStatus === 'draft'}
                onChange={() => onStatusChange('draft')}
              />
              <span>Черновик</span>
            </label>
            <label className="radio-option status-published">
              <input
                type="radio"
                name="status"
                value="published"
                checked={selectedStatus === 'published'}
                onChange={() => onStatusChange('published')}
              />
              <span>Опубликовано</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;