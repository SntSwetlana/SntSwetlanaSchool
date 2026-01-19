// src/components/editor/GradeSidebar.tsx
import React, { useState, useEffect } from 'react';
import type { Grade } from './../../../types/editor';
import './GradeSidebar.css';

interface GradeSidebarProps {
  grades: Grade[];
  selectedGrade: number;
  onGradeSelect: (gradeLevel: number) => void;
  onToggleCollapse?: (isCollapsed: boolean) => void;
}

const GradeSidebar: React.FC<GradeSidebarProps> = ({
  grades,
  selectedGrade,
  onGradeSelect,
  onToggleCollapse,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // При инициализации проверяем localStorage
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isHovered, setIsHovered] = useState(false);
  
  const sortedGrades = [...grades].sort((a, b) => a.level - b.level);

  // Определяем мобильное устройство
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // На мобильных всегда сворачиваем
      if (mobile && !isCollapsed) {
        setIsCollapsed(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Инициализация
    return () => window.removeEventListener('resize', handleResize);
  }, [isCollapsed]);

  // Сохраняем состояние в localStorage
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  // Сообщаем родителю об изменении состояния
  useEffect(() => {
    if (onToggleCollapse) {
      onToggleCollapse(isCollapsed);
    }
  }, [isCollapsed, onToggleCollapse]);

  const getGradeDisplay = (grade: Grade) => {
    if (grade.level === 0) return 'K';
    return grade.level.toString();
  };

  const getGradeColor = (level: number) => {
    // Цветовая градация от K до 12
    const hue = (level / 12) * 360;
    return `hsl(${hue}, 70%, 55%)`;
  };

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleGradeClick = (gradeLevel: number) => {
    onGradeSelect(gradeLevel);
    // На мобильных закрываем sidebar после выбора
    if (isMobile) {
      setIsCollapsed(true);
    }
  };

  return (
    <>
      {/* Sidebar Container */}
      <div 
        className={`grade-sidebar ${isCollapsed ? 'collapsed' : 'expanded'} ${isMobile ? 'mobile' : ''}`}
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
      >
        {/* Toggle Button - всегда виден */}
        <button 
          className="sidebar-toggle"
          onClick={handleToggleCollapse}
          title={isCollapsed ? 'Развернуть панель' : 'Свернуть панель'}
          aria-label={isCollapsed ? 'Развернуть боковую панель' : 'Свернуть боковую панель'}
        >
          {isCollapsed ? '→' : '←'}
        </button>

        {/* Все классы кнопка */}
        <div className="all-grades-section">
          <button 
            className={`all-grades-button ${selectedGrade === -1 ? 'selected' : ''}`}
            onClick={() => handleGradeClick(-1)}
          >
            <span className="all-grades-icon">🏫</span>
            <span className="all-grades-text">Все классы</span>
            <span className="all-grades-count">{grades.length}</span>
          </button>
        </div>

        {/* Список классов */}
        <div className="grades-list">
          {sortedGrades.map(grade => {
            const isSelected = selectedGrade === grade.level;
            const gradeColor = getGradeColor(grade.level);
            
            return (
              <button
                key={grade.id}
                className={`grade-item ${isSelected ? 'selected' : ''}`}
                onClick={() => handleGradeClick(grade.level)}
                title={`${grade.name} (${grade.ageRange.min}-${grade.ageRange.max} лет)`}
              >
                {/* Круг с номером класса - ВСЕГДА ВИДЕН */}
                <div 
                  className="grade-circle"
                  style={{ backgroundColor: gradeColor }}
                >
                  {getGradeDisplay(grade)}
                  {isSelected && (
                    <div className="grade-selected-indicator"></div>
                  )}
                </div>

                {/* Детали класса */}
                <div className="grade-details">
                  <div className="grade-name">{grade.name}</div>
                  <div className="grade-age">{grade.ageRange.min}-{grade.ageRange.max} лет</div>
                  <div className="grade-status">
                    {isSelected ? 'Выбран' : 'Не выбрано'}
                  </div>
                </div>

                {/* Маленький индикатор для свернутого состояния */}
                {isSelected && (
                  <div 
                    className="collapsed-selected-indicator"
                    style={{ backgroundColor: gradeColor }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Footer с информацией */}
        <div className="sidebar-footer">
          <div className="grade-system-info">
            <div className="system-label">Система K-12</div>
            <div className="age-range">Возраст: 5-18 лет</div>
          </div>
          <div className="active-grade-info">
            {selectedGrade !== -1 && (
              <>
                <div className="active-grade">
                  Выбран: {sortedGrades.find(g => g.level === selectedGrade)?.name || 'Все'}
                </div>
                <div className="assignments-count">
                  Заданий: {sortedGrades.filter(g => g.level === selectedGrade).length}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Toggle Handle - только для мобильных */}
      {isMobile && isCollapsed && (
        <div className="mobile-handle" onClick={() => setIsCollapsed(false)}>
          <div className="handle-icon">≡</div>
          <div className="handle-text">Классы</div>
        </div>
      )}
    </>
  );
};

export default GradeSidebar;