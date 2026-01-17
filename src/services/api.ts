// services/api.ts
import type { Subject, Grade, Template, Assignment } from '../types/editor';

// Mock data
const mockSubjects: Subject[] = [
  { id: '1', name: 'Mathematics', description: 'Numbers and calculations', color: '#3B82F6', createdAt: new Date(), updatedAt: new Date() },
  { id: '2', name: 'Science', description: 'Natural sciences', color: '#10B981', createdAt: new Date(), updatedAt: new Date() },
];

const mockGrades: Grade[] = [
  { id: '1', level: 0, name: 'Kindergarten', ageRange: { min: 5, max: 6 }, createdAt: new Date(), updatedAt: new Date() },
  { id: '2', level: 1, name: '1st Grade', ageRange: { min: 6, max: 7 }, createdAt: new Date(), updatedAt: new Date() },
];

const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'Multiple Choice Quiz',
    description: 'Standard multiple choice questions',
    subjectId: '1',
    gradeLevels: [0, 1, 2],
    difficulty: 'easy',
    estimatedTime: 15,
    fields: [
      { id: '1', name: 'question', type: 'richText', label: 'Question', required: true },
      { id: '2', name: 'options', type: 'multiselect', label: 'Answer Options', required: true, options: [] },
      { id: '3', name: 'correctAnswer', type: 'select', label: 'Correct Answer', required: true, options: [] },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockAssignments: Assignment[] = [];

// Mock API service
export const mockApi = {
  // Subject operations
  getSubjects: (): Promise<Subject[]> => {
    return new Promise(resolve => setTimeout(() => resolve([...mockSubjects]), 500));
  },
  
  addSubject: (subject: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>): Promise<Subject> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const newSubject: Subject = {
          ...subject,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockSubjects.push(newSubject);
        resolve(newSubject);
      }, 500);
    });
  },
  
  updateSubject: (id: string, updates: Partial<Subject>): Promise<Subject> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockSubjects.findIndex(s => s.id === id);
        if (index === -1) reject(new Error('Subject not found'));
        
        const updated = { ...mockSubjects[index], ...updates, updatedAt: new Date() };
        mockSubjects[index] = updated;
        resolve(updated);
      }, 500);
    });
  },
  
  deleteSubject: (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockSubjects.findIndex(s => s.id === id);
        if (index === -1) reject(new Error('Subject not found'));
        
        mockSubjects.splice(index, 1);
        resolve();
      }, 500);
    });
  },

  // Grade operations (similar pattern)
  getGrades: (): Promise<Grade[]> => {
    return new Promise(resolve => setTimeout(() => resolve([...mockGrades]), 500));
  },
  
  addGrade: (grade: Omit<Grade, 'id' | 'createdAt' | 'updatedAt'>): Promise<Grade> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const newGrade: Grade = {
          ...grade,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockGrades.push(newGrade);
        resolve(newGrade);
      }, 500);
    });
  },
  
  // ... аналогичные методы для updateGrade и deleteGrade
  
  // Template operations
  getTemplates: (): Promise<Template[]> => {
    return new Promise(resolve => setTimeout(() => resolve([...mockTemplates]), 500));
  },
  
  addTemplate: (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>): Promise<Template> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const newTemplate: Template = {
          ...template,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockTemplates.push(newTemplate);
        resolve(newTemplate);
      }, 500);
    });
  },
  
  // Assignment operations
  getAssignments: (): Promise<Assignment[]> => {
    return new Promise(resolve => setTimeout(() => resolve([...mockAssignments]), 500));
  },
  
  addAssignment: (assignment: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Assignment> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const newAssignment: Assignment = {
          ...assignment,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockAssignments.push(newAssignment);
        resolve(newAssignment);
      }, 500);
    });
  },
  
  updateAssignment: (id: string, updates: Partial<Assignment>): Promise<Assignment> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockAssignments.findIndex(a => a.id === id);
        if (index === -1) reject(new Error('Assignment not found'));
        
        const updated = { ...mockAssignments[index], ...updates, updatedAt: new Date() };
        mockAssignments[index] = updated;
        resolve(updated);
      }, 500);
    });
  },
};