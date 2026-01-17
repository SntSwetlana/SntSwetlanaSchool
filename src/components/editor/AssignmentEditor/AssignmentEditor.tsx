// components/editor/AssignmentEditor.tsx
import React, { useState, useEffect, useMemo } from 'react';
import type { Assignment, Template, Subject, Grade } from '../../../types/editor';

interface AssignmentEditorProps {
  templates: Template[];
  subjects: Subject[];
  grades: Grade[];
  assignments: Assignment[];
  onSave: (assignment: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate: (id: string, updates: Partial<Assignment>) => void;
}

const AssignmentEditor: React.FC<AssignmentEditorProps> = ({
  templates,
  subjects,
  grades,
  assignments,
  onSave,
  onUpdate,
}) => {
  const [mode, setMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState<string>('');
  const [filterGrade, setFilterGrade] = useState<number | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');

  const [formData, setFormData] = useState({
    templateId: '',
    title: '',
    description: '',
    subjectId: '',
    gradeLevel: 0,
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    estimatedTime: 30,
    instructions: '',
    learningObjectives: [''],
    prerequisites: [''],
    tags: [] as string[],
    isPublished: false,
    content: {} as Record<string, any>,
  });

  const [tempLearningObjective, setTempLearningObjective] = useState('');
  const [tempPrerequisite, setTempPrerequisite] = useState('');
  const [tempTag, setTempTag] = useState('');
  const [activeTab, setActiveTab] = useState<'basic' | 'content' | 'metadata'>('basic');
  const [showPreview, setShowPreview] = useState(false);

  // Get selected template
  const selectedTemplate = useMemo(() => {
    return templates.find(t => t.id === selectedTemplateId) || 
           (mode === 'edit' && selectedAssignmentId 
            ? templates.find(t => t.id === assignments.find(a => a.id === selectedAssignmentId)?.templateId)
            : null);
  }, [selectedTemplateId, templates, mode, selectedAssignmentId, assignments]);

  // Get selected assignment for editing
  const selectedAssignment = useMemo(() => {
    return assignments.find(a => a.id === selectedAssignmentId);
  }, [selectedAssignmentId, assignments]);

  // Filter assignments
  const filteredAssignments = useMemo(() => {
    return assignments.filter(assignment => {
      const matchesSearch = !searchQuery || 
        assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSubject = !filterSubject || assignment.subjectId === filterSubject;
      const matchesGrade = filterGrade === 'all' || assignment.gradeLevel === filterGrade;
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'published' && assignment.isPublished) ||
        (filterStatus === 'draft' && !assignment.isPublished);
      
      return matchesSearch && matchesSubject && matchesGrade && matchesStatus;
    });
  }, [assignments, searchQuery, filterSubject, filterGrade, filterStatus]);

  // Initialize form when template is selected
  useEffect(() => {
    if (selectedTemplate && mode === 'create') {
      // Initialize content based on template fields
      const initialContent: Record<string, any> = {};
      selectedTemplate.fields.forEach(field => {
        if (field.defaultValue !== undefined) {
          initialContent[field.name] = field.defaultValue;
        } else {
          switch (field.type) {
            case 'text':
            case 'richText':
              initialContent[field.name] = '';
              break;
            case 'number':
              initialContent[field.name] = 0;
              break;
            case 'boolean':
              initialContent[field.name] = false;
              break;
            case 'select':
            case 'multiselect':
              initialContent[field.name] = field.type === 'multiselect' ? [] : '';
              break;
            default:
              initialContent[field.name] = '';
          }
        }
      });

      setFormData(prev => ({
        ...prev,
        templateId: selectedTemplate.id,
        subjectId: selectedTemplate.subjectId,
        gradeLevel: selectedTemplate.gradeLevels[0] || 0,
        difficulty: selectedTemplate.difficulty,
        estimatedTime: selectedTemplate.estimatedTime,
        title: `New ${selectedTemplate.name}`,
        content: initialContent,
      }));
    }
  }, [selectedTemplate, mode]);

  // Load assignment data when editing
  useEffect(() => {
    if (selectedAssignment && mode === 'edit') {
      setFormData({
        templateId: selectedAssignment.templateId,
        title: selectedAssignment.title,
        description: selectedAssignment.description,
        subjectId: selectedAssignment.subjectId,
        gradeLevel: selectedAssignment.gradeLevel,
        difficulty: selectedAssignment.difficulty,
        estimatedTime: selectedAssignment.estimatedTime,
        instructions: selectedAssignment.instructions,
        learningObjectives: selectedAssignment.learningObjectives,
        prerequisites: selectedAssignment.prerequisites || [''],
        tags: selectedAssignment.tags,
        isPublished: selectedAssignment.isPublished,
        content: selectedAssignment.content,
      });
    }
  }, [selectedAssignment, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const assignmentData = {
      ...formData,
      learningObjectives: formData.learningObjectives.filter(obj => obj.trim()),
      prerequisites: formData.prerequisites.filter(pre => pre.trim()),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (mode === 'edit' && selectedAssignmentId) {
      onUpdate(selectedAssignmentId, assignmentData);
    } else {
      onSave(assignmentData);
    }

    resetForm();
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setSelectedAssignmentId(assignment.id);
    setMode('edit');
    setActiveTab('basic');
    setShowPreview(false);
  };

  const handleDuplicateAssignment = (assignment: Assignment) => {
    setFormData({
      templateId: assignment.templateId,
      title: `${assignment.title} (Copy)`,
      description: assignment.description,
      subjectId: assignment.subjectId,
      gradeLevel: assignment.gradeLevel,
      difficulty: assignment.difficulty,
      estimatedTime: assignment.estimatedTime,
      instructions: assignment.instructions,
      learningObjectives: [...assignment.learningObjectives],
      prerequisites: [...(assignment.prerequisites || [''])],
      tags: [...assignment.tags],
      isPublished: false,
      content: { ...assignment.content },
    });
    setMode('create');
    setActiveTab('basic');
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setMode('create');
    setActiveTab('basic');
  };

  const handleAddLearningObjective = () => {
    if (tempLearningObjective.trim()) {
      setFormData({
        ...formData,
        learningObjectives: [...formData.learningObjectives, tempLearningObjective.trim()],
      });
      setTempLearningObjective('');
    }
  };

  const handleRemoveLearningObjective = (index: number) => {
    setFormData({
      ...formData,
      learningObjectives: formData.learningObjectives.filter((_, i) => i !== index),
    });
  };

  const handleAddPrerequisite = () => {
    if (tempPrerequisite.trim()) {
      setFormData({
        ...formData,
        prerequisites: [...formData.prerequisites, tempPrerequisite.trim()],
      });
      setTempPrerequisite('');
    }
  };

  const handleRemovePrerequisite = (index: number) => {
    setFormData({
      ...formData,
      prerequisites: formData.prerequisites.filter((_, i) => i !== index),
    });
  };

  const handleAddTag = () => {
    if (tempTag.trim()) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tempTag.trim().toLowerCase()],
      });
      setTempTag('');
    }
  };

  const handleRemoveTag = (index: number) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((_, i) => i !== index),
    });
  };

  const handleContentChange = (fieldName: string, value: any) => {
    setFormData({
      ...formData,
      content: {
        ...formData.content,
        [fieldName]: value,
      },
    });
  };

  const resetForm = () => {
    setFormData({
      templateId: '',
      title: '',
      description: '',
      subjectId: '',
      gradeLevel: 0,
      difficulty: 'medium',
      estimatedTime: 30,
      instructions: '',
      learningObjectives: [''],
      prerequisites: [''],
      tags: [],
      isPublished: false,
      content: {},
    });
    setSelectedTemplateId('');
    setSelectedAssignmentId('');
    setMode('create');
    setActiveTab('basic');
    setShowPreview(false);
  };

  const getSubjectName = (subjectId: string) => {
    return subjects.find(s => s.id === subjectId)?.name || 'Unknown';
  };

  const getGradeName = (level: number) => {
    const grade = grades.find(g => g.level === level);
    return grade ? `${grade.name} (${level === 0 ? 'K' : level})` : `Grade ${level}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'hard': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const renderFieldInput = (field: any, value: any) => {
    const fieldConfig = selectedTemplate?.fields.find(f => f.name === field) || {
      name: field,
      type: 'text',
      label: field,
      required: false,
    };

    const handleChange = (newValue: any) => {
      handleContentChange(field, newValue);
    };

    switch (fieldConfig.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            className="field-input"
            placeholder={`Enter ${fieldConfig.label.toLowerCase()}...`}
            required={fieldConfig.required}
          />
        );

      case 'richText':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            className="field-textarea rich-text"
            placeholder={`Enter ${fieldConfig.label.toLowerCase()}...`}
            rows={6}
            required={fieldConfig.required}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || 0}
            onChange={(e) => handleChange(parseInt(e.target.value) || 0)}
            className="field-input"
            required={fieldConfig.required}
            min={fieldConfig.validation?.min}
            max={fieldConfig.validation?.max}
          />
        );

      case 'boolean':
        return (
          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleChange(e.target.checked)}
              required={fieldConfig.required}
            />
            <span>{fieldConfig.label}</span>
          </label>
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            className="field-select"
            required={fieldConfig.required}
          >
            <option value="">Select an option</option>
            {fieldConfig.options?.map((option: string, index: number) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        const selectedOptions = Array.isArray(value) ? value : [];
        return (
          <div className="multiselect-field">
            {fieldConfig.options?.map((option: string, index: number) => (
              <label key={index} className="checkbox-option">
                <input
                  type="checkbox"
                  checked={selectedOptions.includes(option)}
                  onChange={(e) => {
                    const newValue = e.target.checked
                      ? [...selectedOptions, option]
                      : selectedOptions.filter((opt: string) => opt !== option);
                    handleChange(newValue);
                  }}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            className="field-input"
            placeholder={`Enter ${fieldConfig.label}...`}
          />
        );
    }
  };

  const renderPreview = () => {
    if (!selectedTemplate) return null;

    return (
      <div className="preview-container">
        <div className="preview-header">
          <h2>{formData.title || 'Untitled Assignment'}</h2>
          <div className="preview-meta">
            <span className="subject-badge">
              {getSubjectName(formData.subjectId)}
            </span>
            <span className="grade-badge">
              {getGradeName(formData.gradeLevel)}
            </span>
            <span className="difficulty-badge" style={{
              backgroundColor: getDifficultyColor(formData.difficulty)
            }}>
              {formData.difficulty}
            </span>
            <span className="time-badge">
              ⏱️ {formData.estimatedTime} min
            </span>
          </div>
        </div>

        {formData.description && (
          <div className="preview-description">
            <h3>Description</h3>
            <p>{formData.description}</p>
          </div>
        )}

        {formData.instructions && (
          <div className="preview-instructions">
            <h3>Instructions</h3>
            <p>{formData.instructions}</p>
          </div>
        )}

        {formData.learningObjectives.length > 0 && (
          <div className="preview-objectives">
            <h3>Learning Objectives</h3>
            <ul>
              {formData.learningObjectives.map((obj, index) => (
                <li key={index}>{obj}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="preview-content">
          <h3>Assignment Content</h3>
          {selectedTemplate.fields.map((field, index) => (
            <div key={index} className="preview-field">
              <h4>{field.label}</h4>
              <div className="preview-field-content">
                {renderFieldInput(field.name, formData.content[field.name])}
              </div>
            </div>
          ))}
        </div>

        {formData.prerequisites.filter(p => p.trim()).length > 0 && (
          <div className="preview-prerequisites">
            <h3>Prerequisites</h3>
            <ul>
              {formData.prerequisites.filter(p => p.trim()).map((pre, index) => (
                <li key={index}>{pre}</li>
              ))}
            </ul>
          </div>
        )}

        {formData.tags.length > 0 && (
          <div className="preview-tags">
            <h3>Tags</h3>
            <div className="tags-list">
              {formData.tags.map((tag, index) => (
                <span key={index} className="tag-badge">#{tag}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="assignment-editor">
      <div className="editor-header">
        <div>
          <h2>Assignment Editor</h2>
          <p className="editor-subtitle">
            Create and edit assignments from templates
          </p>
        </div>
        <div className="editor-mode-switch">
          <button
            className={`mode-btn ${mode === 'create' ? 'active' : ''}`}
            onClick={() => setMode('create')}
          >
            Create New
          </button>
          <button
            className={`mode-btn ${mode === 'view' ? 'active' : ''}`}
            onClick={() => setMode('view')}
          >
            Browse
          </button>
        </div>
      </div>

      {/* Browse/View Mode */}
      {mode === 'view' && (
        <div className="browse-mode">
          {/* Search and Filters */}
          <div className="search-filter-bar">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search assignments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>
            <div className="filters-row">
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
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
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          {/* Assignments Grid */}
          <div className="assignments-grid">
            <div className="template-cards-section">
              <h3>Start from Template</h3>
              <div className="template-cards">
                {templates.map(template => (
                  <div
                    key={template.id}
                    className="template-card"
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <div className="template-icon">📝</div>
                    <h4>{template.name}</h4>
                    <p className="template-description">
                      {template.description || 'No description'}
                    </p>
                    <div className="template-stats">
                      <span>{template.fields.length} fields</span>
                      <span>•</span>
                      <span>{template.difficulty}</span>
                    </div>
                    <button className="btn-use-template">
                      Use This Template
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="assignments-list-section">
              <h3>Existing Assignments ({filteredAssignments.length})</h3>
              {filteredAssignments.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📚</div>
                  <h4>No assignments found</h4>
                  <p>Create your first assignment or adjust your search filters</p>
                </div>
              ) : (
                <div className="assignments-list">
                  {filteredAssignments.map(assignment => {
                    const template = templates.find(t => t.id === assignment.templateId);
                    return (
                      <div key={assignment.id} className="assignment-card">
                        <div className="assignment-header">
                          <div className="status-indicator">
                            <div className={`status-dot ${assignment.isPublished ? 'published' : 'draft'}`} />
                            {assignment.isPublished ? 'Published' : 'Draft'}
                          </div>
                          <div className="assignment-actions">
                            <button
                              onClick={() => handleEditAssignment(assignment)}
                              className="btn-icon"
                              title="Edit"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDuplicateAssignment(assignment)}
                              className="btn-icon"
                              title="Duplicate"
                            >
                              📋
                            </button>
                          </div>
                        </div>
                        <h4>{assignment.title}</h4>
                        <p className="assignment-description">
                          {assignment.description}
                        </p>
                        <div className="assignment-meta">
                          <span className="subject">
                            {getSubjectName(assignment.subjectId)}
                          </span>
                          <span className="grade">
                            {getGradeName(assignment.gradeLevel)}
                          </span>
                          <span className="template">
                            Template: {template?.name || 'Unknown'}
                          </span>
                          <span className="created">
                            {new Date(assignment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Mode */}
      {(mode === 'create' || mode === 'edit') && (
        <div className="edit-mode">
          <div className="editor-container">
            {/* Left Panel - Editor */}
            <div className="editor-panel">
              <div className="editor-tabs">
                <button
                  className={`editor-tab ${activeTab === 'basic' ? 'active' : ''}`}
                  onClick={() => setActiveTab('basic')}
                >
                  Basic Info
                </button>
                <button
                  className={`editor-tab ${activeTab === 'content' ? 'active' : ''}`}
                  onClick={() => setActiveTab('content')}
                >
                  Content
                </button>
                <button
                  className={`editor-tab ${activeTab === 'metadata' ? 'active' : ''}`}
                  onClick={() => setActiveTab('metadata')}
                >
                  Metadata
                </button>
              </div>

              <form onSubmit={handleSubmit} className="editor-form">
                {/* Basic Info Tab */}
                {activeTab === 'basic' && (
                  <div className="tab-content">
                    <div className="form-group">
                      <label>Assignment Title *</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Enter assignment title..."
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Description *</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe the assignment..."
                        rows={4}
                        required
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Subject *</label>
                        <select
                          value={formData.subjectId}
                          onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                          required
                        >
                          <option value="">Select subject</option>
                          {subjects.map(subject => (
                            <option key={subject.id} value={subject.id}>
                              {subject.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Grade Level *</label>
                        <select
                          value={formData.gradeLevel}
                          onChange={(e) => setFormData({ ...formData, gradeLevel: parseInt(e.target.value) })}
                          required
                        >
                          {grades.map(grade => (
                            <option key={grade.id} value={grade.level}>
                              {grade.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Difficulty</label>
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
                      <label>Instructions</label>
                      <textarea
                        value={formData.instructions}
                        onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                        placeholder="Provide instructions for students..."
                        rows={6}
                      />
                    </div>
                  </div>
                )}

                {/* Content Tab */}
                {activeTab === 'content' && selectedTemplate && (
                  <div className="tab-content">
                    <div className="template-info">
                      <h4>Template: {selectedTemplate.name}</h4>
                      <p className="template-description">
                        {selectedTemplate.description}
                      </p>
                    </div>

                    {selectedTemplate.fields.map((field, index) => (
                      <div key={index} className="field-editor">
                        <label className="field-label">
                          {field.label}
                          {field.required && <span className="required-star"> *</span>}
                        </label>
                        <div className="field-input-container">
                          {renderFieldInput(field.name, formData.content[field.name])}
                        </div>
                        <div className="field-help">
                          {field.type} field
                          {field.required && ' • Required'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Metadata Tab */}
                {activeTab === 'metadata' && (
                  <div className="tab-content">
                    <div className="metadata-section">
                      <h4>Learning Objectives</h4>
                      <p className="section-help">
                        What should students learn from this assignment?
                      </p>
                      <div className="list-input">
                        <input
                          type="text"
                          value={tempLearningObjective}
                          onChange={(e) => setTempLearningObjective(e.target.value)}
                          placeholder="Enter a learning objective..."
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLearningObjective())}
                        />
                        <button
                          type="button"
                          onClick={handleAddLearningObjective}
                          className="btn-add"
                        >
                          Add
                        </button>
                      </div>
                      {formData.learningObjectives.filter(obj => obj.trim()).length > 0 && (
                        <ul className="item-list">
                          {formData.learningObjectives.filter(obj => obj.trim()).map((obj, index) => (
                            <li key={index} className="list-item">
                              {obj}
                              <button
                                type="button"
                                onClick={() => handleRemoveLearningObjective(index)}
                                className="btn-remove-item"
                              >
                                ×
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="metadata-section">
                      <h4>Prerequisites</h4>
                      <p className="section-help">
                        What should students know before starting?
                      </p>
                      <div className="list-input">
                        <input
                          type="text"
                          value={tempPrerequisite}
                          onChange={(e) => setTempPrerequisite(e.target.value)}
                          placeholder="Enter a prerequisite..."
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPrerequisite())}
                        />
                        <button
                          type="button"
                          onClick={handleAddPrerequisite}
                          className="btn-add"
                        >
                          Add
                        </button>
                      </div>
                      {formData.prerequisites.filter(p => p.trim()).length > 0 && (
                        <ul className="item-list">
                          {formData.prerequisites.filter(p => p.trim()).map((pre, index) => (
                            <li key={index} className="list-item">
                              {pre}
                              <button
                                type="button"
                                onClick={() => handleRemovePrerequisite(index)}
                                className="btn-remove-item"
                              >
                                ×
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="metadata-section">
                      <h4>Tags</h4>
                      <p className="section-help">
                        Add keywords to help organize assignments
                      </p>
                      <div className="list-input">
                        <input
                          type="text"
                          value={tempTag}
                          onChange={(e) => setTempTag(e.target.value)}
                          placeholder="Enter a tag..."
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                        />
                        <button
                          type="button"
                          onClick={handleAddTag}
                          className="btn-add"
                        >
                          Add
                        </button>
                      </div>
                      {formData.tags.length > 0 && (
                        <div className="tags-container">
                          {formData.tags.map((tag, index) => (
                            <span key={index} className="tag-item">
                              #{tag}
                              <button
                                type="button"
                                onClick={() => handleRemoveTag(index)}
                                className="tag-remove"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="metadata-section">
                      <label className="checkbox-field large">
                        <input
                          type="checkbox"
                          checked={formData.isPublished}
                          onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                        />
                        <div>
                          <strong>Publish Assignment</strong>
                          <p className="checkbox-help">
                            Published assignments are visible to students
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {/* Form Actions */}
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    {showPreview ? 'Hide Preview' : 'Show Preview'}
                  </button>
                  <div className="action-buttons">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={resetForm}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary btn-large"
                    >
                      {mode === 'edit' ? 'Update Assignment' : 'Create Assignment'}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Right Panel - Preview */}
            {showPreview && (
              <div className="preview-panel">
                <div className="preview-header-bar">
                  <h3>Preview</h3>
                  <button
                    className="btn-icon"
                    onClick={() => setShowPreview(false)}
                  >
                    ✕
                  </button>
                </div>
                <div className="preview-content">
                  {renderPreview()}
                </div>
              </div>
            )}
          </div>

          {/* Template Info Bar */}
          {selectedTemplate && (
            <div className="template-info-bar">
              <div className="template-info-content">
                <span className="template-name">Template: {selectedTemplate.name}</span>
                <span className="template-stats">
                  {selectedTemplate.fields.length} fields • {selectedTemplate.difficulty} • {selectedTemplate.estimatedTime} min
                </span>
              </div>
              <button
                className="btn-outline"
                onClick={() => setSelectedTemplateId('')}
              >
                Change Template
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AssignmentEditor;