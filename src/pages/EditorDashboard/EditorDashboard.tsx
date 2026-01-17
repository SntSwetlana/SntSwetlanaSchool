// pages/EditorDashboard.tsx
import React, { useState, useEffect } from 'react';

import SubjectManager from './../../components/editor/SubjectManager';
import GradeManager from './../../components/editor/GradeManager';
import TemplateManager from './../../components/editor/TemplateManager';
import AssignmentEditor from './../../components/editor/AssignmentEditor';

import type { Subject, Grade, Template, Assignment } from './../../types/editor';
import { mockApi } from './../../services/api';

const EditorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'subjects' | 'grades' | 'templates' | 'assignments'>('subjects');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);

  // Загрузка данных при монтировании
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [subjectsData, gradesData, templatesData, assignmentsData] = await Promise.all([
        mockApi.getSubjects(),
        mockApi.getGrades(),
        mockApi.getTemplates(),
        mockApi.getAssignments()
      ]);
      
      setSubjects(subjectsData);
      setGrades(gradesData);
      setTemplates(templatesData);
      setAssignments(assignmentsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Обработчики для Subject
  const handleAddSubject = async (subject: Omit<Subject, 'id'>) => {
    try {
      const newSubject = await mockApi.addSubject(subject);
      setSubjects([...subjects, newSubject]);
    } catch (error) {
      console.error('Error adding subject:', error);
    }
  };

  const handleUpdateSubject = async (id: string, updates: Partial<Subject>) => {
    try {
      const updatedSubject = await mockApi.updateSubject(id, updates);
      setSubjects(subjects.map(s => s.id === id ? updatedSubject : s));
    } catch (error) {
      console.error('Error updating subject:', error);
    }
  };

  const handleDeleteSubject = async (id: string) => {
    try {
      await mockApi.deleteSubject(id);
      setSubjects(subjects.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting subject:', error);
    }
  };

  // Обработчики для Grade
  const handleAddGrade = async (grade: Omit<Grade, 'id'>) => {
    try {
      const newGrade = await mockApi.addGrade(grade);
      setGrades([...grades, newGrade]);
    } catch (error) {
      console.error('Error adding grade:', error);
    }
  };

  const handleUpdateGrade = async (id: string, updates: Partial<Grade>) => {
    try {
      const updatedGrade = await mockApi.updateGrade(id, updates);
      setGrades(grades.map(g => g.id === id ? updatedGrade : g));
    } catch (error) {
      console.error('Error updating grade:', error);
    }
  };

  const handleDeleteGrade = async (id: string) => {
    try {
      await mockApi.deleteGrade(id);
      setGrades(grades.filter(g => g.id !== id));
    } catch (error) {
      console.error('Error deleting grade:', error);
    }
  };

  // Обработчики для Template
  const handleAddTemplate = async (template: Omit<Template, 'id'>) => {
    try {
      const newTemplate = await mockApi.addTemplate(template);
      setTemplates([...templates, newTemplate]);
    } catch (error) {
      console.error('Error adding template:', error);
    }
  };

  const handleUpdateTemplate = async (id: string, updates: Partial<Template>) => {
    try {
      const updatedTemplate = await mockApi.updateTemplate(id, updates);
      setTemplates(templates.map(t => t.id === id ? updatedTemplate : t));
    } catch (error) {
      console.error('Error updating template:', error);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      await mockApi.deleteTemplate(id);
      setTemplates(templates.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  // Обработчики для Assignment
  const handleSaveAssignment = async (assignment: Omit<Assignment, 'id'>) => {
    try {
      const newAssignment = await mockApi.addAssignment(assignment);
      setAssignments([...assignments, newAssignment]);
    } catch (error) {
      console.error('Error saving assignment:', error);
    }
  };

  const handleUpdateAssignment = async (id: string, updates: Partial<Assignment>) => {
    try {
      const updatedAssignment = await mockApi.updateAssignment(id, updates);
      setAssignments(assignments.map(a => a.id === id ? updatedAssignment : a));
    } catch (error) {
      console.error('Error updating assignment:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="editor-dashboard">
      <div className="dashboard-header">
        <h1>Editor Dashboard</h1>
        <p className="subtitle">Manage your educational content</p>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab-button ${activeTab === 'subjects' ? 'active' : ''}`}
          onClick={() => setActiveTab('subjects')}
        >
          Subjects
        </button>
        <button 
          className={`tab-button ${activeTab === 'grades' ? 'active' : ''}`}
          onClick={() => setActiveTab('grades')}
        >
          Grades (K-12)
        </button>
        <button 
          className={`tab-button ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => setActiveTab('templates')}
        >
          Templates
        </button>
        <button 
          className={`tab-button ${activeTab === 'assignments' ? 'active' : ''}`}
          onClick={() => setActiveTab('assignments')}
        >
          Assignment Editor
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'subjects' && (
          <SubjectManager
            subjects={subjects}
            onAdd={handleAddSubject}
            onUpdate={handleUpdateSubject}
            onDelete={handleDeleteSubject}
          />
        )}

        {activeTab === 'grades' && (
          <GradeManager
            grades={grades}
            onAdd={handleAddGrade}
            onUpdate={handleUpdateGrade}
            onDelete={handleDeleteGrade}
          />
        )}

        {activeTab === 'templates' && (
          <TemplateManager
            templates={templates}
            subjects={subjects}
            grades={grades}
            onAdd={handleAddTemplate}
            onUpdate={handleUpdateTemplate}
            onDelete={handleDeleteTemplate}
          />
        )}

        {activeTab === 'assignments' && (
          <AssignmentEditor
            templates={templates}
            subjects={subjects}
            grades={grades}
            assignments={assignments}
            onSave={handleSaveAssignment}
            onUpdate={handleUpdateAssignment}
          />
        )}
      </div>
    </div>
  );
};

export default EditorDashboard;