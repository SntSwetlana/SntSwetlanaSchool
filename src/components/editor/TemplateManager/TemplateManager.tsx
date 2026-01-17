// components/editor/TemplateManager.tsx
import React, { useState } from 'react';
import type { Template, Subject, Grade, TemplateField } from './../../../types/editor';

interface TemplateManagerProps {
  templates: Template[];
  subjects: Subject[];
  grades: Grade[];
  onAdd: (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate: (id: string, updates: Partial<Template>) => void;
  onDelete: (id: string) => void;
}

// Predefined field types for templates
const FIELD_TYPES = [
  { value: 'text', label: 'Text Input', icon: '📝' },
  { value: 'number', label: 'Number Input', icon: '🔢' },
  { value: 'boolean', label: 'Checkbox (True/False)', icon: '✅' },
  { value: 'select', label: 'Dropdown Select', icon: '📋' },
  { value: 'multiselect', label: 'Multi Select', icon: '📑' },
  { value: 'richText', label: 'Rich Text Editor', icon: '📝' },
  { value: 'date', label: 'Date Picker', icon: '📅' },
  { value: 'file', label: 'File Upload', icon: '📎' },
  { value: 'code', label: 'Code Editor', icon: '💻' },
];

// Predefined template blueprints
const TEMPLATE_BLUEPRINTS = [
  {
    name: 'Multiple Choice Quiz',
    description: 'Create quizzes with multiple choice questions',
    icon: '❓',
    fields: [
      { name: 'question', type: 'richText', label: 'Question', required: true },
      { name: 'options', type: 'multiselect', label: 'Answer Options', required: true },
      { name: 'correctAnswer', type: 'select', label: 'Correct Answer', required: true },
      { name: 'explanation', type: 'richText', label: 'Explanation', required: false },
    ],
  },
  {
    name: 'Essay Assignment',
    description: 'Essay writing assignments with prompts',
    icon: '📝',
    fields: [
      { name: 'prompt', type: 'richText', label: 'Essay Prompt', required: true },
      { name: 'wordCount', type: 'number', label: 'Minimum Word Count', required: true },
      { name: 'format', type: 'select', label: 'Format', required: false, options: ['MLA', 'APA', 'Chicago', 'Other'] },
      { name: 'rubric', type: 'richText', label: 'Grading Rubric', required: false },
    ],
  },
  {
    name: 'Math Problem Set',
    description: 'Mathematics problems with step-by-step solutions',
    icon: '🧮',
    fields: [
      { name: 'problem', type: 'richText', label: 'Math Problem', required: true },
      { name: 'solution', type: 'richText', label: 'Solution Steps', required: false },
      { name: 'hint', type: 'text', label: 'Hint', required: false },
      { name: 'answer', type: 'text', label: 'Final Answer', required: true },
    ],
  },
  {
    name: 'Science Lab Report',
    description: 'Template for science experiment reports',
    icon: '🔬',
    fields: [
      { name: 'hypothesis', type: 'text', label: 'Hypothesis', required: true },
      { name: 'materials', type: 'multiselect', label: 'Materials List', required: true },
      { name: 'procedure', type: 'richText', label: 'Procedure', required: true },
      { name: 'observations', type: 'richText', label: 'Observations', required: true },
      { name: 'conclusion', type: 'richText', label: 'Conclusion', required: true },
    ],
  },
  {
    name: 'Reading Comprehension',
    description: 'Reading passages with comprehension questions',
    icon: '📖',
    fields: [
      { name: 'passage', type: 'richText', label: 'Reading Passage', required: true },
      { name: 'questions', type: 'richText', label: 'Comprehension Questions', required: true },
      { name: 'vocabulary', type: 'multiselect', label: 'Vocabulary Words', required: false },
    ],
  },
];

const TemplateManager: React.FC<TemplateManagerProps> = ({
  templates,
  subjects,
  grades,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showBlueprints, setShowBlueprints] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [filterGrade, setFilterGrade] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBlueprint, setSelectedBlueprint] = useState<typeof TEMPLATE_BLUEPRINTS[0] | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subjectId: '',
    gradeLevels: [] as number[],
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    estimatedTime: 30,
    fields: [] as Omit<TemplateField, 'id'>[],
  });

  const [fieldForm, setFieldForm] = useState({
    name: '',
    type: 'text' as TemplateField['type'],
    label: '',
    required: false,
    options: [] as string[],
    defaultValue: '',
  });

  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);
  const [tempOption, setTempOption] = useState('');

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSubject = !selectedSubject || template.subjectId === selectedSubject;
    const matchesGrade = filterGrade === 'all' || template.gradeLevels.includes(filterGrade);
    const matchesSearch = !searchQuery || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSubject && matchesGrade && matchesSearch;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const templateData = {
      ...formData,
      fields: formData.fields.map((field, index) => ({
        ...field,
        id: `${Date.now()}-${index}`,
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (editingId) {
      onUpdate(editingId, templateData);
      setEditingId(null);
    } else {
      onAdd(templateData);
    }
    
    resetForm();
  };

  const handleEdit = (template: Template) => {
    setEditingId(template.id);
    setFormData({
      name: template.name,
      description: template.description || '',
      subjectId: template.subjectId,
      gradeLevels: template.gradeLevels,
      difficulty: template.difficulty,
      estimatedTime: template.estimatedTime,
      fields: template.fields.map(({ id, ...field }) => field),
    });
    setIsAdding(true);
    setSelectedBlueprint(null);
  };

  const handleUseBlueprint = (blueprint: typeof TEMPLATE_BLUEPRINTS[0]) => {
    setSelectedBlueprint(blueprint);
    setFormData({
      ...formData,
      name: blueprint.name,
      description: blueprint.description,
      fields: blueprint.fields.map((field, index) => ({
        ...field,
        id: `${Date.now()}-${index}`,
      })),
    });
  };

  const handleAddField = () => {
    if (fieldForm.name && fieldForm.label) {
      const newField: Omit<TemplateField, 'id'> = {
        name: fieldForm.name,
        type: fieldForm.type,
        label: fieldForm.label,
        required: fieldForm.required,
        options: fieldForm.options.length > 0 ? [...fieldForm.options] : undefined,
        defaultValue: fieldForm.defaultValue || undefined,
      };

      if (editingFieldIndex !== null) {
        const updatedFields = [...formData.fields];
        updatedFields[editingFieldIndex] = newField;
        setFormData({ ...formData, fields: updatedFields });
        setEditingFieldIndex(null);
      } else {
        setFormData({
          ...formData,
          fields: [...formData.fields, newField],
        });
      }

      resetFieldForm();
    }
  };

  const handleEditField = (index: number) => {
    const field = formData.fields[index];
    setFieldForm({
      name: field.name,
      type: field.type,
      label: field.label,
      required: field.required,
      options: field.options || [],
      defaultValue: field.defaultValue || '',
    });
    setEditingFieldIndex(index);
  };

  const handleRemoveField = (index: number) => {
    const updatedFields = formData.fields.filter((_, i) => i !== index);
    setFormData({ ...formData, fields: updatedFields });
  };

  const handleAddOption = () => {
    if (tempOption.trim()) {
      setFieldForm({
        ...fieldForm,
        options: [...fieldForm.options, tempOption.trim()],
      });
      setTempOption('');
    }
  };

  const handleRemoveOption = (index: number) => {
    const updatedOptions = fieldForm.options.filter((_, i) => i !== index);
    setFieldForm({ ...fieldForm, options: updatedOptions });
  };

  const handleGradeLevelToggle = (level: number) => {
    if (formData.gradeLevels.includes(level)) {
      setFormData({
        ...formData,
        gradeLevels: formData.gradeLevels.filter(l => l !== level),
      });
    } else {
      setFormData({
        ...formData,
        gradeLevels: [...formData.gradeLevels, level],
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      subjectId: '',
      gradeLevels: [],
      difficulty: 'medium',
      estimatedTime: 30,
      fields: [],
    });
    resetFieldForm();
    setIsAdding(false);
    setEditingId(null);
    setSelectedBlueprint(null);
    setEditingFieldIndex(null);
  };

  const resetFieldForm = () => {
    setFieldForm({
      name: '',
      type: 'text',
      label: '',
      required: false,
      options: [],
      defaultValue: '',
    });
    setTempOption('');
  };

  const getSubjectName = (subjectId: string) => {
    return subjects.find(s => s.id === subjectId)?.name || 'Unknown Subject';
  };

  const getGradeNames = (gradeLevels: number[]) => {
    return gradeLevels.map(level => {
      const grade = grades.find(g => g.level === level);
      return grade ? `G${level === 0 ? 'K' : level}` : `Level ${level}`;
    }).join(', ');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'hard': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <div className="template-manager">
      <div className="manager-header">
        <div>
          <h2>Manage Templates</h2>
          <p className="manager-subtitle">
            {templates.length} template{templates.length !== 1 ? 's' : ''} created
          </p>
        </div>
        <div className="header-actions">
          <button
            className="btn-secondary"
            onClick={() => setShowBlueprints(!showBlueprints)}
          >
            {showBlueprints ? 'Hide Blueprints' : 'Show Blueprints'}
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              setIsAdding(true);
              setEditingId(null);
              setSelectedBlueprint(null);
            }}
          >
            Create Template
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="search-filter-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        <div className="filters">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="filter-select"
          >
            <option value="">All Subjects</option>
            {subjects.map(subject => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          <select
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            className="filter-select"
          >
            <option value="all">All Grades</option>
            {grades.map(grade => (
              <option key={grade.id} value={grade.level}>
                {grade.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Template Blueprints */}
      {showBlueprints && (
        <div className="blueprints-section">
          <h3>Start from a Blueprint</h3>
          <p className="section-description">
            Choose a pre-configured template to get started quickly
          </p>
          <div className="blueprints-grid">
            {TEMPLATE_BLUEPRINTS.map((blueprint, index) => (
              <div
                key={index}
                className={`blueprint-card ${selectedBlueprint?.name === blueprint.name ? 'selected' : ''}`}
                onClick={() => handleUseBlueprint(blueprint)}
              >
                <div className="blueprint-icon">{blueprint.icon}</div>
                <h4>{blueprint.name}</h4>
                <p className="blueprint-description">{blueprint.description}</p>
                <div className="blueprint-stats">
                  <span>{blueprint.fields.length} fields</span>
                  <span>•</span>
                  <span>Ready to customize</span>
                </div>
                <button className="btn-outline" onClick={() => handleUseBlueprint(blueprint)}>
                  Use This Template
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="edit-form template-form">
          <div className="form-header">
            <h3>{editingId ? 'Edit Template' : 'Create New Template'}</h3>
            {selectedBlueprint && (
              <div className="blueprint-badge">
                Based on: {selectedBlueprint.name}
              </div>
            )}
          </div>

          <div className="form-section">
            <h4>Basic Information</h4>
            <div className="form-grid">
              <div className="form-group">
                <label>Template Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Multiple Choice Quiz"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Subject *</label>
                <select
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  required
                >
                  <option value="">Select a subject</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Difficulty Level</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    difficulty: e.target.value as 'easy' | 'medium' | 'hard' 
                  })}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="form-group">
                <label>Estimated Time (minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="300"
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData({ ...formData, estimatedTime: parseInt(e.target.value) || 30 })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this template is used for..."
                rows={3}
              />
            </div>
          </div>

          <div className="form-section">
            <h4>Target Grades</h4>
            <p className="section-description">Select which grades this template applies to</p>
            <div className="grade-level-selector">
              {grades.map(grade => (
                <button
                  key={grade.id}
                  type="button"
                  className={`grade-level-btn ${formData.gradeLevels.includes(grade.level) ? 'selected' : ''}`}
                  onClick={() => handleGradeLevelToggle(grade.level)}
                >
                  {grade.level === 0 ? 'K' : grade.level}
                  <span className="grade-level-name">{grade.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <h4>Template Fields ({formData.fields.length})</h4>
              <p className="section-description">Define the fields that will appear in assignments</p>
            </div>

            {/* Field Form */}
            <div className="field-form">
              <h5>{editingFieldIndex !== null ? 'Edit Field' : 'Add New Field'}</h5>
              <div className="field-form-grid">
                <div className="form-group">
                  <label>Field Name *</label>
                  <input
                    type="text"
                    value={fieldForm.name}
                    onChange={(e) => setFieldForm({ ...fieldForm, name: e.target.value })}
                    placeholder="e.g., question, answer, options"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Display Label *</label>
                  <input
                    type="text"
                    value={fieldForm.label}
                    onChange={(e) => setFieldForm({ ...fieldForm, label: e.target.value })}
                    placeholder="e.g., Question, Answer, Options"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Field Type</label>
                  <select
                    value={fieldForm.type}
                    onChange={(e) => setFieldForm({ 
                      ...fieldForm, 
                      type: e.target.value as TemplateField['type'] 
                    })}
                  >
                    {FIELD_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={fieldForm.required}
                      onChange={(e) => setFieldForm({ ...fieldForm, required: e.target.checked })}
                    />
                    Required Field
                  </label>
                </div>

                <div className="form-group">
                  <label>Default Value</label>
                  <input
                    type="text"
                    value={fieldForm.defaultValue}
                    onChange={(e) => setFieldForm({ ...fieldForm, defaultValue: e.target.value })}
                    placeholder="Optional default value"
                  />
                </div>
              </div>

              {/* Options for select/multiselect */}
              {(fieldForm.type === 'select' || fieldForm.type === 'multiselect') && (
                <div className="options-section">
                  <label>Options</label>
                  <div className="options-input">
                    <input
                      type="text"
                      value={tempOption}
                      onChange={(e) => setTempOption(e.target.value)}
                      placeholder="Add an option..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddOption())}
                    />
                    <button type="button" onClick={handleAddOption} className="btn-small">
                      Add
                    </button>
                  </div>
                  {fieldForm.options.length > 0 && (
                    <div className="options-list">
                      {fieldForm.options.map((option, index) => (
                        <div key={index} className="option-item">
                          {option}
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(index)}
                            className="btn-remove"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="field-form-actions">
                <button type="button" onClick={handleAddField} className="btn-primary">
                  {editingFieldIndex !== null ? 'Update Field' : 'Add Field'}
                </button>
                {editingFieldIndex !== null && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingFieldIndex(null);
                      resetFieldForm();
                    }}
                    className="btn-secondary"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </div>

            {/* Fields List */}
            {formData.fields.length > 0 ? (
              <div className="fields-list">
                {formData.fields.map((field, index) => (
                  <div key={index} className="field-item">
                    <div className="field-header">
                      <span className="field-type-badge">
                        {FIELD_TYPES.find(t => t.value === field.type)?.icon} {field.type}
                      </span>
                      <span className="field-name">{field.name}</span>
                      {field.required && <span className="required-badge">Required</span>}
                    </div>
                    <div className="field-info">
                      <span className="field-label">Label: {field.label}</span>
                      {field.options && (
                        <span className="field-options">
                          Options: {field.options.length}
                        </span>
                      )}
                    </div>
                    <div className="field-actions">
                      <button
                        type="button"
                        onClick={() => handleEditField(index)}
                        className="btn-icon"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveField(index)}
                        className="btn-icon btn-danger"
                      >
                        🗑️ Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-fields">
                <p>No fields added yet. Add fields to define your template structure.</p>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary btn-large">
              {editingId ? 'Update Template' : 'Create Template'}
            </button>
            <button type="button" onClick={resetForm} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Templates List */}
      {!isAdding && (
        <div className="templates-list">
          <h3>Templates ({filteredTemplates.length})</h3>
          
          {filteredTemplates.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <h4>No templates found</h4>
              <p>Create your first template or adjust your search filters</p>
              <button
                className="btn-primary"
                onClick={() => setIsAdding(true)}
              >
                Create Template
              </button>
            </div>
          ) : (
            <div className="templates-grid">
              {filteredTemplates.map(template => (
                <div key={template.id} className="template-card">
                  <div className="template-header">
                    <div className="template-icon">📋</div>
                    <div className="template-title">
                      <h4>{template.name}</h4>
                      <div className="template-meta">
                        <span className="subject-badge">
                          {getSubjectName(template.subjectId)}
                        </span>
                        <span className="difficulty-badge" style={{ 
                          backgroundColor: getDifficultyColor(template.difficulty) 
                        }}>
                          {template.difficulty}
                        </span>
                        <span className="time-badge">
                          ⏱️ {template.estimatedTime} min
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {template.description && (
                    <p className="template-description">{template.description}</p>
                  )}
                  
                  <div className="template-details">
                    <div className="detail-item">
                      <strong>Target Grades:</strong>
                      <span>{getGradeNames(template.gradeLevels)}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Fields:</strong>
                      <span>{template.fields.length} field{template.fields.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Created:</strong>
                      <span>{new Date(template.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="template-actions">
                    <button
                      onClick={() => handleEdit(template)}
                      className="btn-outline"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete template "${template.name}"?`)) {
                          onDelete(template.id);
                        }
                      }}
                      className="btn-outline btn-danger"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stats Summary */}
      {!isAdding && templates.length > 0 && (
        <div className="stats-summary">
          <h3>Template Statistics</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{templates.length}</div>
              <div className="stat-label">Total Templates</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {Math.round(templates.reduce((acc, t) => acc + t.fields.length, 0) / templates.length)}
              </div>
              <div className="stat-label">Avg Fields per Template</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {new Set(templates.map(t => t.subjectId)).size}
              </div>
              <div className="stat-label">Subjects Covered</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {Math.round(templates.reduce((acc, t) => acc + t.estimatedTime, 0) / templates.length)} min
              </div>
              <div className="stat-label">Avg Time Required</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateManager;