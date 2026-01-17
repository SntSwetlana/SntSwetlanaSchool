// types/editor.ts
export interface Subject {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Grade {
  id: string;
  level: number; // K=0, 1=1, 2=2, etc.
  name: string; // "Kindergarten", "1st Grade", etc.
  description?: string;
  ageRange: {
    min: number;
    max: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'richText';
  label: string;
  required: boolean;
  options?: string[];
  defaultValue?: any;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  subjectId: string;
  gradeLevels: number[]; // Reference to Grade levels
  fields: TemplateField[];
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number; // in minutes
  createdAt: Date;
  updatedAt: Date;
}

export interface Assignment {
  id: string;
  templateId: string;
  title: string;
  description: string;
  subjectId: string;
  gradeLevel: number;
  content: Record<string, any>; // Dynamic fields based on template
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number;
  instructions: string;
  learningObjectives: string[];
  prerequisites?: string[];
  tags: string[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}