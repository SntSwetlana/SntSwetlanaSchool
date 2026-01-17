// components/editor/SubjectManager.tsx
import React, { useState } from 'react';
import type { Subject } from '../../../types/editor';

interface SubjectManagerProps {
  subjects: Subject[];
  onAdd: (subject: Omit<Subject, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<Subject>) => void;
  onDelete: (id: string) => void;
}

const SubjectManager: React.FC<SubjectManagerProps> = ({ subjects, onAdd, onUpdate, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
  });

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
    setFormData({ name: '', description: '', color: '#3B82F6' });
    setIsAdding(false);
  };

  const handleEdit = (subject: Subject) => {
    setEditingId(subject.id);
    setFormData({
      name: subject.name,
      description: subject.description || '',
      color: subject.color || '#3B82F6',
    });
    setIsAdding(true);
  };

  return (
    <div className="subject-manager">
      <div className="manager-header">
        <h2>Manage Subjects</h2>
        <button 
          className="btn-primary"
          onClick={() => {
            setIsAdding(true);
            setEditingId(null);
            setFormData({ name: '', description: '', color: '#3B82F6' });
          }}
        >
          Add New Subject
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
          
          <div className="form-group">
            <label>Color</label>
            <input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            />
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {editingId ? 'Update' : 'Create'}
            </button>
            <button 
              type="button" 
              className="btn-secondary"
              onClick={() => {
                setIsAdding(false);
                setEditingId(null);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="items-grid">
        {subjects.map(subject => (
          <div key={subject.id} className="item-card">
            <div 
              className="item-color" 
              style={{ backgroundColor: subject.color }}
            />
            <div className="item-content">
              <h3>{subject.name}</h3>
              {subject.description && (
                <p className="item-description">{subject.description}</p>
              )}
              <div className="item-meta">
                <span>Created: {new Date(subject.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="item-actions">
              <button 
                className="btn-icon"
                onClick={() => handleEdit(subject)}
                aria-label="Edit"
              >
                ✏️
              </button>
              <button 
                className="btn-icon btn-danger"
                onClick={() => onDelete(subject.id)}
                aria-label="Delete"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubjectManager;