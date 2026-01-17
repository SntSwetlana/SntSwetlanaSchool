import React, { useState, useEffect } from 'react';
import AssignmentTable from '../../components/editor/AssignmentTable';
import FilterPanel from '../../components/editor/FilterPanel';
import GradeSidebar from '../../components/editor/GradeSidebar';
import AssignmentModal from '../../components/editor/AssignmentModal';

// Временные типы для разработки
type Assignment = {
  id: string;
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
  createdAt: Date;
  updatedAt: Date;
};

type Subject = {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
};

type Grade = {
  id: string;
  level: number;
  name: string;
  ageRange: { min: number; max: number };
  createdAt: Date;
  updatedAt: Date;
};

const EditorDashboard: React.FC = () => {
  // Состояния для фильтров
  const [selectedGrade, setSelectedGrade] = useState<number>(0);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Временные данные для разработки
  const [assignments, setAssignments] = useState<Assignment[]>([
    {
      id: '1',
      title: 'Математика: Сложение чисел',
      description: 'Базовые задачи на сложение для начальных классов',
      subjectId: '1',
      gradeLevel: 1,
      difficulty: 'easy',
      estimatedTime: 15,
      instructions: 'Решите примеры на сложение',
      learningObjectives: ['Освоить базовое сложение', 'Развить навыки счета'],
      prerequisites: ['Знание чисел от 1 до 10'],
      tags: ['математика', 'сложение', 'начальная школа'],
      isPublished: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      title: 'Английский: Основные глаголы',
      description: 'Изучение основных английских глаголов',
      subjectId: '2',
      gradeLevel: 2,
      difficulty: 'medium',
      estimatedTime: 25,
      instructions: 'Заполните пропуски правильными формами глаголов',
      learningObjectives: ['Изучить основные английские глаголы', 'Научиться их использовать в предложениях'],
      prerequisites: ['Базовое знание английского алфавита'],
      tags: ['английский', 'глаголы', 'язык'],
      isPublished: false,
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-12'),
    },
  ]);

  const [subjects, setSubjects] = useState<Subject[]>([
    { id: '1', name: 'Математика', color: '#3B82F6', createdAt: new Date(), updatedAt: new Date() },
    { id: '2', name: 'Английский язык', color: '#10B981', createdAt: new Date(), updatedAt: new Date() },
    { id: '3', name: 'Наука', color: '#EF4444', createdAt: new Date(), updatedAt: new Date() },
    { id: '4', name: 'История', color: '#F59E0B', createdAt: new Date(), updatedAt: new Date() },
  ]);

  const [grades, setGrades] = useState<Grade[]>([
    { id: '1', level: 0, name: 'Kindergarten', ageRange: { min: 5, max: 6 }, createdAt: new Date(), updatedAt: new Date() },
    { id: '2', level: 1, name: '1st Grade', ageRange: { min: 6, max: 7 }, createdAt: new Date(), updatedAt: new Date() },
    { id: '3', level: 2, name: '2nd Grade', ageRange: { min: 7, max: 8 }, createdAt: new Date(), updatedAt: new Date() },
    { id: '4', level: 3, name: '3rd Grade', ageRange: { min: 8, max: 9 }, createdAt: new Date(), updatedAt: new Date() },
    { id: '5', level: 4, name: '4th Grade', ageRange: { min: 9, max: 10 }, createdAt: new Date(), updatedAt: new Date() },
  ]);

  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
  const [selectedAssignments, setSelectedAssignments] = useState<string[]>([]);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  // Фильтрация заданий
  useEffect(() => {
    let filtered = assignments;

    // Фильтр по классу
    if (selectedGrade !== -1) {
      filtered = filtered.filter(assignment => assignment.gradeLevel === selectedGrade);
    }

    // Фильтр по предмету
    if (selectedSubject !== 'all') {
      filtered = filtered.filter(assignment => assignment.subjectId === selectedSubject);
    }

    // Фильтр по сложности
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(assignment => assignment.difficulty === selectedDifficulty);
    }

    // Фильтр по статусу
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(assignment => {
        if (selectedStatus === 'published') return assignment.isPublished;
        if (selectedStatus === 'draft') return !assignment.isPublished;
        return true;
      });
    }

    // Поиск
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(assignment =>
        assignment.title.toLowerCase().includes(query) ||
        assignment.description.toLowerCase().includes(query) ||
        assignment.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredAssignments(filtered);
  }, [assignments, selectedGrade, selectedSubject, selectedDifficulty, selectedStatus, searchQuery]);

  const handleGradeSelect = (gradeLevel: number) => {
    setSelectedGrade(gradeLevel);
    localStorage.setItem('lastSelectedGrade', gradeLevel.toString());
  };

  const handleAssignmentSelect = (assignmentId: string) => {
    setSelectedAssignments(prev => {
      if (prev.includes(assignmentId)) {
        return prev.filter(id => id !== assignmentId);
      } else {
        return [...prev, assignmentId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedAssignments.length === filteredAssignments.length) {
      setSelectedAssignments([]);
    } else {
      setSelectedAssignments(filteredAssignments.map(a => a.id));
    }
  };

  const handleAddAssignment = () => {
    setEditingAssignment(null);
    setIsAssignmentModalOpen(true);
  };

  const handleEditAssignment = () => {
    if (selectedAssignments.length === 1) {
      const assignment = assignments.find(a => a.id === selectedAssignments[0]);
      if (assignment) {
        setEditingAssignment(assignment);
        setIsAssignmentModalOpen(true);
      }
    }
  };

  const handleDeleteAssignments = () => {
    if (selectedAssignments.length === 0) return;
    
    if (window.confirm(`Удалить ${selectedAssignments.length} задание(я)?`)) {
      setAssignments(prev => prev.filter(a => !selectedAssignments.includes(a.id)));
      setSelectedAssignments([]);
    }
  };

  const handleSaveAssignment = (assignmentData: any) => {
    if (editingAssignment) {
      // Обновление существующего задания
      setAssignments(prev => 
        prev.map(a => a.id === editingAssignment.id 
          ? { ...a, ...assignmentData, updatedAt: new Date() }
          : a
        )
      );
    } else {
      // Создание нового задания
      const newAssignment: Assignment = {
        id: Date.now().toString(),
        ...assignmentData,
        prerequisites: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setAssignments(prev => [...prev, newAssignment]);
    }
    
    setIsAssignmentModalOpen(false);
    setEditingAssignment(null);
  };

  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'Unknown';
  };

  const getGradeName = (gradeLevel: number) => {
    const grade = grades.find(g => g.level === gradeLevel);
    return grade ? grade.name : `Grade ${gradeLevel}`;
  };

  return (
    <div className="editor-dashboard admin-layout">
      {/* Боковая панель с классами */}
      <GradeSidebar
        grades={grades}
        selectedGrade={selectedGrade}
        onGradeSelect={handleGradeSelect}
      />

      {/* Основное содержимое */}
      <div className="dashboard-main">
        {/* Панель фильтров */}
        <FilterPanel
          subjects={subjects}
          selectedSubject={selectedSubject}
          selectedDifficulty={selectedDifficulty}
          selectedStatus={selectedStatus}
          searchQuery={searchQuery}
          onSubjectChange={setSelectedSubject}
          onDifficultyChange={setSelectedDifficulty}
          onStatusChange={setSelectedStatus}
          onSearchChange={setSearchQuery}
          onAddAssignment={handleAddAssignment}
          onEditAssignment={handleEditAssignment}
          onDeleteAssignments={handleDeleteAssignments}
          hasSelection={selectedAssignments.length > 0}
          canEdit={selectedAssignments.length === 1}
        />

        {/* Таблица заданий */}
        <AssignmentTable
          assignments={filteredAssignments}
          selectedAssignments={selectedAssignments}
          subjects={subjects}
          grades={grades}
          onSelectAssignment={handleAssignmentSelect}
          onSelectAll={handleSelectAll}
          getSubjectName={getSubjectName}
          getGradeName={getGradeName}
        />

        {/* Информация о выбранном классе */}
        <div className="grade-info">
          <h3>{getGradeName(selectedGrade)}</h3>
          <p>Заданий: {filteredAssignments.length}</p>
          {selectedGrade !== -1 && grades.find(g => g.level === selectedGrade)?.name && (
            <p className="grade-description">
              Возраст: {grades.find(g => g.level === selectedGrade)?.ageRange.min}-
              {grades.find(g => g.level === selectedGrade)?.ageRange.max} лет
            </p>
          )}
        </div>
      </div>

      {/* Модальное окно для создания/редактирования задания */}
      {isAssignmentModalOpen && (
        <AssignmentModal
          assignment={editingAssignment}
          subjects={subjects}
          grades={grades}
          templates={[]}
          onSave={handleSaveAssignment}
          onClose={() => {
            setIsAssignmentModalOpen(false);
            setEditingAssignment(null);
          }}
          selectedGrade={selectedGrade}
        />
      )}
    </div>
  );
};

export default EditorDashboard;