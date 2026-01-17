export const storage = {
  getLastSelectedGrade: (): number => {
    const saved = localStorage.getItem('lastSelectedGrade');
    return saved ? parseInt(saved) : 0; // По умолчанию Kindergarten
  },

  setLastSelectedGrade: (grade: number) => {
    localStorage.setItem('lastSelectedGrade', grade.toString());
  },

  getFilters: () => {
    const saved = localStorage.getItem('assignmentFilters');
    return saved ? JSON.parse(saved) : null;
  },

  saveFilters: (filters: any) => {
    localStorage.setItem('assignmentFilters', JSON.stringify(filters));
  }
};