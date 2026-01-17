// types/assignment.ts
export interface AssignmentFormData {
  templateId: string;
  title: string;
  description: string;
  subjectId: string;
  gradeLevel: number;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number;
  instructions: string;
  learningObjectives: string[];
  prerequisites: string[];
  tags: string[];
  isPublished: boolean;
  content: Record<string, any>;
}

export interface FieldValue {
  [key: string]: any;
}

export interface AssignmentPreview {
  title: string;
  description: string;
  subject: string;
  grade: string;
  difficulty: string;
  time: number;
  content: FieldValue;
}

// utils/assignmentUtils.ts
export const validateAssignmentForm = (data: AssignmentFormData): string[] => {
  const errors: string[] = [];

  if (!data.title.trim()) errors.push('Title is required');
  if (!data.description.trim()) errors.push('Description is required');
  if (!data.subjectId) errors.push('Subject is required');
  if (data.gradeLevel < 0 || data.gradeLevel > 12) errors.push('Invalid grade level');
  if (data.estimatedTime < 1) errors.push('Estimated time must be at least 1 minute');
  if (data.learningObjectives.length === 0) errors.push('At least one learning objective is required');
  if (!data.templateId) errors.push('Template must be selected');

  return errors;
};

export const generateAssignmentSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export const calculateAssignmentComplexity = (
  difficulty: 'easy' | 'medium' | 'hard',
  estimatedTime: number,
  fieldCount: number
): number => {
  const difficultyWeight = {
    easy: 1,
    medium: 2,
    hard: 3,
  };

  return (difficultyWeight[difficulty] * estimatedTime * fieldCount) / 10;
};