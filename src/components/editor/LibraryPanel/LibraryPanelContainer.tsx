import React, { useEffect, useState } from 'react';
import LibraryPanel from './LibraryPanel';
import type { Publisher, LibraryResponse } from '../../../types/libraries';

const LibraryPanelContainer: React.FC = () => {
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLibrary = async () => {
      try {
        const res = await fetch('/api/library', {
          credentials: 'include',
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data: LibraryResponse = await res.json();
        setPublishers(data.publishers || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load library');
      } finally {
        setLoading(false);
      }
    };

    loadLibrary();
  }, []);

  if (loading) return <div className="library-panel">Загрузка библиотеки…</div>;
  if (error) return <div className="library-panel">Ошибка: {error}</div>;

  return <LibraryPanel publishers={publishers} />;
};

export default LibraryPanelContainer;
