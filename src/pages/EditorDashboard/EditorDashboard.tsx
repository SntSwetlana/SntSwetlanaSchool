import React, { useState, useEffect } from 'react';
import AssignmentTable from '../../components/editor/AssignmentTable';
import FilterPanel from '../../components/editor/FilterPanel';
import GradeSidebar from '../../components/editor/GradeSidebar';
import AssignmentModal from '../../components/editor/AssignmentModal';
import LibraryPanel from '../../components/editor/LibraryPanel';
import type { Publisher } from '../../types/libraries';
import './EditorDashboard.css';

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
  const [selectedGrade, setSelectedGrade] = useState<number>(0);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [publishers, setPublishers] = useState<Publisher[]>([]);  
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [libraryError, setLibraryError] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([
    // 
  ]);

  const [subjects, setSubjects] = useState<Subject[]>([
    // 
  ]);

  const [grades, setGrades] = useState<Grade[]>([
    { id: '1', level: 0, name: 'Pre-K', ageRange: { min: 4, max: 5 }, createdAt: new Date(), updatedAt: new Date() },
    { id: '2', level: 0, name: 'Kindergarten', ageRange: { min: 5, max: 6 }, createdAt: new Date(), updatedAt: new Date() },
    { id: '3', level: 1, name: '1st Grade', ageRange: { min: 6, max: 7 }, createdAt: new Date(), updatedAt: new Date() },
    { id: '4', level: 2, name: '2nd Grade', ageRange: { min: 7, max: 8 }, createdAt: new Date(), updatedAt: new Date() },
    { id: '5', level: 3, name: '3rd Grade', ageRange: { min: 8, max: 9 }, createdAt: new Date(), updatedAt: new Date() },
    { id: '6', level: 4, name: '4th Grade', ageRange: { min: 9, max: 10 }, createdAt: new Date(), updatedAt: new Date() },
    { id: '7', level: 5, name: '5th Grade', ageRange: { min: 10, max: 11 }, createdAt: new Date(), updatedAt: new Date() },
    { id: '8', level: 6, name: '6th Grade', ageRange: { min: 11, max: 12 }, createdAt: new Date(), updatedAt: new Date() },
    { id: '9', level: 7, name: '7th Grade', ageRange: { min: 12, max: 13 }, createdAt: new Date(), updatedAt: new Date() },
    { id: '10', level: 8, name: '8th Grade', ageRange: { min: 13, max: 14 }, createdAt: new Date(), updatedAt: new Date() },
    { id: '11', level: 9, name: '9th Grade', ageRange: { min: 14, max: 15 }, createdAt: new Date(), updatedAt: new Date() },
    { id: '12', level: 10, name: '10th Grade', ageRange: { min: 15, max: 16 }, createdAt: new Date(), updatedAt: new Date() },
    { id: '13', level: 11, name: '11th Grade', ageRange: { min: 16, max: 17 }, createdAt: new Date(), updatedAt: new Date() },
    { id: '14', level: 12, name: '12th Grade', ageRange: { min: 17, max: 18 }, createdAt: new Date(), updatedAt: new Date() },
  ]);

  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
  const [selectedAssignments, setSelectedAssignments] = useState<string[]>([]);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

useEffect(() => {
  const loadPublishers = async () => {
    try {
      setLibraryLoading(true);
      setLibraryError(null);

      const res = await fetch('/api/library/publishers', {
        method: 'GET',
        credentials: 'include',
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json: unknown = await res.json();

      // сервер может вернуть либо массив, либо объект { publishers: [...] }
      if (Array.isArray(json)) {
        setPublishers(json as Publisher[]);
      } else if (
        json &&
        typeof json === 'object' &&
        Array.isArray((json as any).publishers)
      ) {
        setPublishers((json as any).publishers as Publisher[]);
      } else {
        setPublishers([]);
        setLibraryError('Unexpected response shape from /api/library/publishers');
      }
    } catch (e) {
      setLibraryError(e instanceof Error ? e.message : 'Failed to load library');
      setPublishers([]);
    } finally {
      setLibraryLoading(false);
    }
  };

  loadPublishers();
}, []);
  // Определяем мобильное устройство
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // На мобильных всегда сворачиваем
      if (mobile && !isSidebarCollapsed) {
        setIsSidebarCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Инициализация
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarCollapsed]);

  // Восстанавливаем состояние из localStorage
  useEffect(() => {
    const savedGrade = localStorage.getItem('lastSelectedGrade');
    const savedCollapsed = localStorage.getItem('sidebarCollapsed');
    
    if (savedGrade) {
      setSelectedGrade(parseInt(savedGrade));
    }
    
    if (savedCollapsed && !isMobile) {
      setIsSidebarCollapsed(savedCollapsed === 'true');
    }
  }, [isMobile]);

  // Сохраняем состояние в localStorage
  useEffect(() => {
    localStorage.setItem('lastSelectedGrade', selectedGrade.toString());
  }, [selectedGrade]);

  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem('sidebarCollapsed', isSidebarCollapsed.toString());
    }
  }, [isSidebarCollapsed, isMobile]);

  // Фильтрация заданий
  useEffect(() => {
    let filtered = assignments;

    if (selectedGrade !== -1) {
      filtered = filtered.filter(assignment => assignment.gradeLevel === selectedGrade);
    }

    if (selectedSubject !== 'all') {
      filtered = filtered.filter(assignment => assignment.subjectId === selectedSubject);
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(assignment => assignment.difficulty === selectedDifficulty);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(assignment => {
        if (selectedStatus === 'published') return assignment.isPublished;
        if (selectedStatus === 'draft') return !assignment.isPublished;
        return true;
      });
    }

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

  const handleSidebarToggle = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
  };

  // Остальные обработчики остаются без изменений...

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
        onGradeSelect={setSelectedGrade}
        onToggleCollapse={handleSidebarToggle}
      />

      {/* Основное содержимое - автоматически расширяется */}
      <div className={`dashboard-main ${isSidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
        {/* Панель фильтров */}
        
        <LibraryPanel publishers={publishers} />

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
          onAddAssignment={() => {
            setEditingAssignment(null);
            setIsAssignmentModalOpen(true);
          }}
          onEditAssignment={() => {
            if (selectedAssignments.length === 1) {
              const assignment = assignments.find(a => a.id === selectedAssignments[0]);
              if (assignment) {
                setEditingAssignment(assignment);
                setIsAssignmentModalOpen(true);
              }
            }
          }}
          onDeleteAssignments={() => {
            if (selectedAssignments.length === 0) return;
            if (window.confirm(`Удалить ${selectedAssignments.length} задание(я)?`)) {
              setAssignments(prev => prev.filter(a => !selectedAssignments.includes(a.id)));
              setSelectedAssignments([]);
            }
          }}
          hasSelection={selectedAssignments.length > 0}
          canEdit={selectedAssignments.length === 1}
        />

        {/* Таблица заданий - занимает всю доступную ширину */}
        <div className="table-container">
          <AssignmentTable
            assignments={filteredAssignments}
            selectedAssignments={selectedAssignments}
            subjects={subjects}
            grades={grades}
            onSelectAssignment={(assignmentId) => {
              setSelectedAssignments(prev => {
                if (prev.includes(assignmentId)) {
                  return prev.filter(id => id !== assignmentId);
                } else {
                  return [...prev, assignmentId];
                }
              });
            }}
            onSelectAll={() => {
              if (selectedAssignments.length === filteredAssignments.length) {
                setSelectedAssignments([]);
              } else {
                setSelectedAssignments(filteredAssignments.map(a => a.id));
              }
            }}
            getSubjectName={getSubjectName}
            getGradeName={getGradeName}
          />
        </div>

        {/* Информация о выбранном классе */}
        <div className="grade-info">
          <div className="grade-info-header">
            <h3>{getGradeName(selectedGrade)}</h3>
            <button 
              className="expand-sidebar-button"
              onClick={() => setIsSidebarCollapsed(false)}
              title="Показать панель классов"
            >
              Показать классы
            </button>
          </div>
          <div className="grade-info-stats">
            <div className="stat-item">
              <span className="stat-label">Заданий:</span>
              <span className="stat-value">{filteredAssignments.length}</span>
            </div>
            {selectedGrade !== -1 && grades.find(g => g.level === selectedGrade) && (
              <>
                <div className="stat-item">
                  <span className="stat-label">Возраст:</span>
                  <span className="stat-value">
                    {grades.find(g => g.level === selectedGrade)?.ageRange.min}-
                    {grades.find(g => g.level === selectedGrade)?.ageRange.max} лет
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Уровень:</span>
                  <span className="stat-value">
                    {grades.find(g => g.level === selectedGrade)?.level === 0 ? 'K' : grades.find(g => g.level === selectedGrade)?.level}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Модальное окно для создания/редактирования задания */}
      {isAssignmentModalOpen && (
        <AssignmentModal
          assignment={editingAssignment}
          subjects={subjects}
          grades={grades}
          templates={[]}
          onSave={(assignmentData) => {
            if (editingAssignment) {
              setAssignments(prev => 
                prev.map(a => a.id === editingAssignment.id 
                  ? { ...a, ...assignmentData, updatedAt: new Date() }
                  : a
                )
              );
            } else {
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
          }}
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