import React, { useEffect, useMemo, useState } from 'react';
import type { Publisher } from '../../../types/libraries';
import './LibraryPanel.css';

interface LibraryPanelProps {
  publishers: Publisher[];
}

const LibraryPanel: React.FC<LibraryPanelProps> = ({ publishers }) => {
  const [activePublisherId, setActivePublisherId] = useState<string>('');

  // если publishers пришли асинхронно — выставим активного издателя один раз
  useEffect(() => {
    if (!activePublisherId && publishers.length > 0) {
      setActivePublisherId(publishers[0].id);
    }
  }, [publishers, activePublisherId]);

  const activePublisher = useMemo(
    () => publishers.find(p => p.id === activePublisherId) ?? publishers[0],
    [activePublisherId, publishers]
  );

  const courses = activePublisher?.courses ?? [];

  return (
    <div className="library-panel">
      <div className="library-header">ESL Library</div>

      {/* Tabs */}
      <div className="library-tabs">
        {(publishers ?? []).map(pub => (
          <button
            key={pub.id}
            className={`library-tab ${pub.id === activePublisherId ? 'active' : ''}`}
            onClick={() => setActivePublisherId(pub.id)}
            type="button"
          >
            {pub.name}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="library-card">
        <div className="library-card-title">
          {activePublisher?.name ?? '—'} — Курсы и уровни
        </div>

        {courses.length === 0 ? (
          <div className="library-empty">Нет курсов</div>
        ) : (
          <div className="library-courses-grid">
            {courses.map(course => (
              <div key={course.id} className="library-course-block">
                <div className="library-course-title">{course.title}</div>

                <div className="library-umk-list">
                  {(course.levels ?? []).map(level => (
                    <button
                      key={level.id}
                      className="library-umk-btn"
                      onClick={() => console.log('Selected level:', level.title)}
                      type="button"
                    >
                      {level.title}
                    </button>
                  ))}
                </div>

                {(course.levels ?? []).map(level => (
                  <div key={level.id} style={{ marginTop: 8 }}>
                    <div style={{ fontWeight: 600 }}>{level.title}</div>
                    <div>
                      {(level.units ?? []).map(unit => (
                        <div key={unit.id} style={{ marginTop: 4 }}>
                          <div>{unit.unit_code ? `${unit.unit_code}. ` : ''}{unit.title}</div>
                          <div style={{ opacity: 0.8, fontSize: 12 }}>
                            {(unit.modules ?? []).map(m => m.title).join(' • ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryPanel;
