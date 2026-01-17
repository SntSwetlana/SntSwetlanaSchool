// src/utils/assignmentFilters.ts
export const filterAssignments = (
  assignments: Assignment[],
  filters: {
    grade?: number;
    subject?: string;
    difficulty?: string;
    status?: string;
    search?: string;
  }
): Assignment[] => {
  let filtered = [...assignments];

  if (filters.grade !== undefined && filters.grade !== -1) {
    filtered = filtered.filter(a => a.gradeLevel === filters.grade);
  }

  if (filters.subject && filters.subject !== 'all') {
    filtered = filtered.filter(a => a.subjectId === filters.subject);
  }

  if (filters.difficulty && filters.difficulty !== 'all') {
    filtered = filtered.filter(a => a.difficulty === filters.difficulty);
  }

  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter(a => {
      if (filters.status === 'published') return a.isPublished;
      if (filters.status === 'draft') return !a.isPublished;
      return true;
    });
  }

  if (filters.search) {
    const query = filters.search.toLowerCase();
    filtered = filtered.filter(a =>
      a.title.toLowerCase().includes(query) ||
      a.description.toLowerCase().includes(query) ||
      a.instructions?.toLowerCase().includes(query) ||
      a.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }

  return filtered;
};

