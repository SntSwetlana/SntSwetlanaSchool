// components/editor/GradeManager.tsx
import React, { useState } from 'react';
import type { Grade } from './../../../types/editor';

interface GradeManagerProps {
  grades: Grade[];
  onAdd: (grade: Omit<Grade, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate: (id: string, updates: Partial<Grade>) => void;
  onDelete: (id: string) => void;
}

// K-12 grades configuration
const GRADE_LEVELS = [
  { level: 0, name: 'Kindergarten', defaultMinAge: 5, defaultMaxAge: 6 },
  { level: 1, name: '1st Grade', defaultMinAge: 6, defaultMaxAge: 7 },
  { level: 2, name: '2nd Grade', defaultMinAge: 7, defaultMaxAge: 8 },
  { level: 3, name: '3rd Grade', defaultMinAge: 8, defaultMaxAge: 9 },
  { level: 4, name: '4th Grade', defaultMinAge: 9, defaultMaxAge: 10 },
  { level: 5, name: '5th Grade', defaultMinAge: 10, defaultMaxAge: 11 },
  { level: 6, name: '6th Grade', defaultMinAge: 11, defaultMaxAge: 12 },
  { level: 7, name: '7th Grade', defaultMinAge: 12, defaultMaxAge: 13 },
  { level: 8, name: '8th Grade', defaultMinAge: 13, defaultMaxAge: 14 },
  { level: 9, name: '9th Grade (Freshman)', defaultMinAge: 14, defaultMaxAge: 15 },
  { level: 10, name: '10th Grade (Sophomore)', defaultMinAge: 15, defaultMaxAge: 16 },
  { level: 11, name: '11th Grade (Junior)', defaultMinAge: 16, defaultMaxAge: 17 },
  { level: 12, name: '12th Grade (Senior)', defaultMinAge: 17, defaultMaxAge: 18 },
];

const GradeManager: React.FC<GradeManagerProps> = ({ grades, onAdd, onUpdate, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [formData, setFormData] = useState({
    level: 0,
    name: '',
    description: '',
    ageRange: { min: 5, max: 6 },
  });

  // Available grade levels that haven't been added yet
  const availableGradeLevels = GRADE_LEVELS.filter(
    gradeLevel => !grades.some(grade => grade.level === gradeLevel.level)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      onUpdate(editingId, formData);
      setEditingId(null);
    } else {
      onAdd({
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    
    resetForm();
  };

  const handleQuickAdd = (gradeLevel: typeof GRADE_LEVELS[0]) => {
    onAdd({
      level: gradeLevel.level,
      name: gradeLevel.name,
      description: `Grade level ${gradeLevel.level === 0 ? 'Kindergarten' : `Grade ${gradeLevel.level}`}`,
      ageRange: { min: gradeLevel.defaultMinAge, max: gradeLevel.defaultMaxAge },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  const handleEdit = (grade: Grade) => {
    setEditingId(grade.id);
    setFormData({
      level: grade.level,
      name: grade.name,
      description: grade.description || '',
      ageRange: grade.ageRange,
    });
    setIsAdding(true);
    setShowQuickAdd(false);
  };

  const resetForm = () => {
    setFormData({
      level: 0,
      name: '',
      description: '',
      ageRange: { min: 5, max: 6 },
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleGradeLevelChange = (level: number) => {
    const gradeConfig = GRADE_LEVELS.find(g => g.level === level);
    if (gradeConfig) {
      setFormData({
        ...formData,
        level,
        name: gradeConfig.name,
        ageRange: { min: gradeConfig.defaultMinAge, max: gradeConfig.defaultMaxAge }
      });
    }
  };

  const getGradeDisplayName = (level: number) => {
    return level === 0 ? 'K' : level.toString();
  };

  const getGradeColor = (level: number) => {
    // Color gradient from kindergarten to high school
    const hue = (level / 12) * 360;
    return `hsl(${hue}, 70%, 65%)`;
  };

  return (
    <div className="grade-manager">
      <div className="manager-header">
        <div>
          <h2>Manage Grades (K-12)</h2>
          <p className="manager-subtitle">
            {grades.length} of {GRADE_LEVELS.length} grades configured
          </p>
        </div>
        <div className="header-actions">
          <button 
            className="btn-secondary"
            onClick={() => {
              setShowQuickAdd(!showQuickAdd);
              setIsAdding(false);
              resetForm();
            }}
          >
            {showQuickAdd ? 'Hide Quick Add' : 'Quick Add Grades'}
          </button>
          <button 
            className="btn-primary"
            onClick={() => {
              setIsAdding(true);
              setShowQuickAdd(false);
              setEditingId(null);
              setFormData({
                level: 0,
                name: '',
                description: '',
                ageRange: { min: 5, max: 6 },
              });
            }}
          >
            Add Custom Grade
          </button>
        </div>
      </div>

      {/* Quick Add Section */}
      {showQuickAdd && availableGradeLevels.length > 0 && (
        <div className="quick-add-section">
          <h3>Quick Add Available Grades</h3>
          <div className="quick-add-grid">
            {availableGradeLevels.map(gradeLevel => (
              <button
                key={gradeLevel.level}
                className="quick-add-btn"
                onClick={() => handleQuickAdd(gradeLevel)}
                style={{ backgroundColor: getGradeColor(gradeLevel.level) }}
              >
                <span className="grade-level-badge">
                  {getGradeDisplayName(gradeLevel.level)}
                </span>
                <span className="grade-name">{gradeLevel.name}</span>
                <span className="age-range">
                  Ages {gradeLevel.defaultMinAge}-{gradeLevel.defaultMaxAge}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-row">
            <div className="form-group">
              <label>Grade Level *</label>
              <select
                value={formData.level}
                onChange={(e) => handleGradeLevelChange(parseInt(e.target.value))}
                disabled={editingId !== null} // Can't change level when editing
                required
              >
                <option value="">Select grade level</option>
                {GRADE_LEVELS.map(grade => (
                  <option key={grade.level} value={grade.level}>
                    {grade.name} (Level {grade.level === 0 ? 'K' : grade.level})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Display Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Minimum Age</label>
              <input
                type="number"
                min="3"
                max="18"
                value={formData.ageRange.min}
                onChange={(e) => setFormData({
                  ...formData,
                  ageRange: { ...formData.ageRange, min: parseInt(e.target.value) }
                })}
              />
            </div>
            
            <div className="form-group">
              <label>Maximum Age</label>
              <input
                type="number"
                min={formData.ageRange.min + 1}
                max="19"
                value={formData.ageRange.max}
                onChange={(e) => setFormData({
                  ...formData,
                  ageRange: { ...formData.ageRange, max: parseInt(e.target.value) }
                })}
              />
            </div>
            
            <div className="form-group">
              <label>Age Range Preview</label>
              <div className="age-range-display">
                {formData.ageRange.min} - {formData.ageRange.max} years old
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g., Focus on basic literacy and numeracy skills..."
              rows={3}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {editingId ? 'Update Grade' : 'Create Grade'}
            </button>
            <button 
              type="button" 
              className="btn-secondary"
              onClick={resetForm}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Grades List */}
      <div className="grades-container">
        <h3>Configured Grades ({grades.length})</h3>
        
        {grades.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏫</div>
            <h4>No grades configured yet</h4>
            <p>Add grades using the Quick Add or Custom Add buttons above</p>
          </div>
        ) : (
          <div className="grades-list">
            {grades
              .sort((a, b) => a.level - b.level)
              .map(grade => (
                <div 
                  key={grade.id} 
                  className="grade-card"
                  style={{ borderLeftColor: getGradeColor(grade.level) }}
                >
                  <div className="grade-header">
                    <div className="grade-level-badge-large">
                      {getGradeDisplayName(grade.level)}
                    </div>
                    <div className="grade-info">
                      <h4>{grade.name}</h4>
                      <div className="grade-meta">
                        <span className="age-range">
                          📅 Ages {grade.ageRange.min}-{grade.ageRange.max}
                        </span>
                        <span className="grade-id">
                          ID: {grade.id.substring(0, 8)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {grade.description && (
                    <p className="grade-description">{grade.description}</p>
                  )}
                  
                  <div className="grade-footer">
                    <div className="created-date">
                      Created: {new Date(grade.createdAt).toLocaleDateString()}
                    </div>
                    <div className="grade-actions">
                      <button 
                        className="btn-icon"
                        onClick={() => handleEdit(grade)}
                        aria-label="Edit grade"
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        className="btn-icon btn-danger"
                        onClick={() => {
                          if (window.confirm(`Delete grade "${grade.name}"?`)) {
                            onDelete(grade.id);
                          }
                        }}
                        aria-label="Delete grade"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Progress Summary */}
      <div className="progress-summary">
        <h3>Grade Configuration Progress</h3>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${(grades.length / GRADE_LEVELS.length) * 100}%` }}
          />
        </div>
        <div className="progress-stats">
          <span>{grades.length} of {GRADE_LEVELS.length} grades configured</span>
          <span>{Math.round((grades.length / GRADE_LEVELS.length) * 100)}% complete</span>
        </div>
        
        <div className="grade-distribution">
          <h4>Distribution:</h4>
          <div className="distribution-grid">
            <div className="distribution-item elementary">
              Elementary (K-5): {grades.filter(g => g.level >= 0 && g.level <= 5).length}
            </div>
            <div className="distribution-item middle">
              Middle School (6-8): {grades.filter(g => g.level >= 6 && g.level <= 8).length}
            </div>
            <div className="distribution-item high">
              High School (9-12): {grades.filter(g => g.level >= 9 && g.level <= 12).length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradeManager;