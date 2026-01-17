// utils/gradeUtils.ts
export const getGradeName = (level: number): string => {
  switch (level) {
    case 0: return 'Kindergarten';
    case 1: return '1st Grade';
    case 2: return '2nd Grade';
    case 3: return '3rd Grade';
    case 4: return '4th Grade';
    case 5: return '5th Grade';
    case 6: return '6th Grade';
    case 7: return '7th Grade';
    case 8: return '8th Grade';
    case 9: return '9th Grade (Freshman)';
    case 10: return '10th Grade (Sophomore)';
    case 11: return '11th Grade (Junior)';
    case 12: return '12th Grade (Senior)';
    default: return `Grade ${level}`;
  }
};

export const getDefaultAgeRange = (level: number): { min: number; max: number } => {
  const defaultAges: { [key: number]: { min: number; max: number } } = {
    0: { min: 5, max: 6 },
    1: { min: 6, max: 7 },
    2: { min: 7, max: 8 },
    3: { min: 8, max: 9 },
    4: { min: 9, max: 10 },
    5: { min: 10, max: 11 },
    6: { min: 11, max: 12 },
    7: { min: 12, max: 13 },
    8: { min: 13, max: 14 },
    9: { min: 14, max: 15 },
    10: { min: 15, max: 16 },
    11: { min: 16, max: 17 },
    12: { min: 17, max: 18 },
  };
  
  return defaultAges[level] || { min: level + 5, max: level + 6 };
};

export const validateAgeRange = (min: number, max: number): string | null => {
  if (min < 3) return 'Minimum age cannot be less than 3';
  if (max > 19) return 'Maximum age cannot be more than 19';
  if (min >= max) return 'Minimum age must be less than maximum age';
  if (max - min > 3) return 'Age range should not exceed 3 years';
  return null;
};