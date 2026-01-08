import { useState } from 'react';
import './FontViewer.css';

interface Font {
  cssVar: string;
  name: string;
  category: 'sans-serif' | 'serif' | 'monospace';
  example: string;
}

const FontViewer = () => {
  const [fonts] = useState<Font[]>([
    { cssVar: '--font-alegreya-sans', name: 'Alegreya Sans', category: 'sans-serif', example: 'The quick brown fox jumps over the lazy dog' },
    { cssVar: '--font-amaranth', name: 'Amaranth', category: 'sans-serif', example: 'Amaranth font preview' },
    { cssVar: '--font-amatic', name: 'Amatic', category: 'sans-serif', example: 'Amatic handwriting style' },
    { cssVar: '--font-ammys-handwriting', name: 'Ammys Handwriting', category: 'sans-serif', example: 'Handwriting example text' },
    { cssVar: '--font-arial', name: 'Arial', category: 'sans-serif', example: 'Standard Arial font sample' },
    { cssVar: '--font-arialroundedmtbold', name: 'Arial Rounded MT Bold', category: 'sans-serif', example: 'Rounded bold letters' },
    { cssVar: '--font-atkinson-longread ', name: 'Atkinson Hyperlegible', category: 'sans-serif', example: 'Rounded bold letters' },
    { cssVar: '--font-bevan', name: 'Bevan', category: 'sans-serif', example: 'Bold display font' },
    { cssVar: '--font-bree-serif', name: 'Bree Serif', category: 'serif', example: 'Serif typeface example' },
    { cssVar: '--font-cantata-one', name: 'Cantata One', category: 'serif', example: 'Elegant serif font' },
    { cssVar: '--font-century-schoolbook', name: 'Century Schoolbook', category: 'serif', example: 'Classic textbook font' },
    { cssVar: '--font-chalkduster', name: 'Chalkduster', category: 'sans-serif', example: 'Chalkboard style writing' },
    { cssVar: '--font-changa-one', name: 'Changa One', category: 'sans-serif', example: 'Modern geometric font' },
    { cssVar: '--font-courier-new', name: 'Courier New', category: 'monospace', example: 'Monospace typewriter font' },
    { cssVar: '--font-damion', name: 'Damion', category: 'sans-serif', example: 'Casual script font' },
    { cssVar: '--font-delius', name: 'Delius', category: 'sans-serif', example: 'Handwritten script style' },
    { cssVar: '--font-fredericka-the-great', name: 'Fredericka the Great', category: 'sans-serif', example: 'Decorative display font' },
    { cssVar: '--font-georgia', name: 'Georgia', category: 'serif', example: 'Web optimized serif font' },
    { cssVar: '--font-hammersmith-one', name: 'Hammersmith One', category: 'sans-serif', example: 'Strong sans-serif type' },
    { cssVar: '--font-helvetica-neue', name: 'Helvetica Neue', category: 'sans-serif', example: 'Modern Helvetica variant' },
    { cssVar: '--font-snt-verdana', name: 'snt Verdana', category: 'sans-serif', example: 'snt customized Verdana' },
    { cssVar: '--font-jolly-good', name: 'Jolly Good', category: 'sans-serif', example: 'Playful display font' },
    { cssVar: '--font-kelly-slab', name: 'Kelly Slab', category: 'sans-serif', example: 'Slab serif typeface' },
    { cssVar: '--font-lato-bold', name: 'Lato Bold', category: 'sans-serif', example: 'Bold Lato font weight' },
    { cssVar: '--font-lato', name: 'Lato', category: 'sans-serif', example: 'Popular sans-serif font' },
    { cssVar: '--font-lemon', name: 'Lemon', category: 'sans-serif', example: 'Fresh citrus-inspired font' },
    { cssVar: '--font-linotte', name: 'Linotte', category: 'sans-serif', example: 'Light rounded font' },
    { cssVar: '--font-lobster', name: 'Lobster', category: 'sans-serif', example: 'Popular script font' },
    { cssVar: '--font-magra', name: 'Magra', category: 'sans-serif', example: 'Clean modern sans-serif' },
    { cssVar: '--font-monospace', name: 'Monospace', category: 'monospace', example: 'Generic monospace font' },
    { cssVar: '--font-montserrat', name: 'Montserrat', category: 'sans-serif', example: 'Geometric sans-serif' },
    { cssVar: '--font-museo-slab', name: 'Museo Slab', category: 'serif', example: 'Slab serif with curves' },
    { cssVar: '--font-neucha', name: 'Neucha', category: 'sans-serif', example: 'Handwritten style font' },
    { cssVar: '--font-open-sans', name: 'Open Sans', category: 'sans-serif', example: 'Humanist sans-serif' },
    { cssVar: '--font-podkova', name: 'Podkova', category: 'serif', example: 'Serif with slab characteristics' },
    { cssVar: '--font-raleway', name: 'Raleway', category: 'sans-serif', example: 'Elegant sans-serif' },
    { cssVar: '--font-roboto', name: 'Roboto', category: 'sans-serif', example: 'Android system font' },
    { cssVar: '--font-roboto-slab', name: 'Roboto Slab', category: 'serif', example: 'Roboto with serifs' },
    { cssVar: '--font-sans-serif', name: 'Sans Serif', category: 'sans-serif', example: 'Generic sans-serif family' },
    { cssVar: '--font-schoolbell', name: 'Schoolbell', category: 'sans-serif', example: 'School handwriting font' },
    { cssVar: '--font-serif', name: 'Serif', category: 'serif', example: 'Generic serif family' },
    { cssVar: '--font-shadows-into-light', name: 'Shadows Into Light', category: 'sans-serif', example: 'Casual handwriting' },
    { cssVar: '--font-short-stack', name: 'Short Stack', category: 'sans-serif', example: 'Handwritten print font' },
    { cssVar: '--font-signika', name: 'Signika', category: 'sans-serif', example: 'Friendly sans-serif' },
    { cssVar: '--font-trebuchet-ms', name: 'Trebuchet MS', category: 'sans-serif', example: 'Web-safe sans-serif' },
    { cssVar: '--font-troika', name: 'Troika', category: 'sans-serif', example: 'Decorative display font' },
    { cssVar: '--font-ttnorms', name: 'TT Norms', category: 'sans-serif', example: 'Geometric sans-serif' },
    { cssVar: '--font-umbrage', name: 'Umbrage', category: 'sans-serif', example: 'Ornamental script font' },
    { cssVar: '--font-verdana', name: 'Verdana', category: 'sans-serif', example: 'Web-safe sans-serif font' },
    { cssVar: '--font-yellowtail', name: 'Yellowtail', category: 'sans-serif', example: 'Elegant script font' },
    { cssVar: '--font-viaoda-libre', name: 'Viaoda Libre', category: 'sans-serif', example: 'Calligraphic script' },

    { cssVar: '--font-reading', name: 'Open Sans', category: 'sans-serif', example: 'Основной текст для чтения' },
    { cssVar: '--font-reading1', name: 'Verdana', category: 'sans-serif', example: 'Основной текст для чтения' },
    { cssVar: '--font-heading', name: 'Roboto Slab', category: 'serif', example: 'Заголовки и акценты' },
    { cssVar: '--font-heading1', name: 'Verdana', category: 'serif', example: 'Заголовки и акценты' },
    { cssVar: '--font-math', name: 'Fira Code', category: 'monospace', example: 'Математика и код' },
    { cssVar: '--font-math1', name: 'Cascadia Code', category: 'monospace', example: ' Математика и код' },
    { cssVar: '--font-ui', name: 'Inter', category: 'sans-serif', example: 'Интерфейс и кнопки' },
    { cssVar: '--font-ui1', name: 'Segoe UI', category: 'sans-serif', example: 'Интерфейс и кнопки' },
    { cssVar: '--font-kids', name: 'Comic Sans MS', category: 'sans-serif', example: 'Для детей и начинающих' },
    { cssVar: '--font-kids1', name: 'Chalkboard SE', category: 'sans-serif', example: 'Для детей и начинающих' },
    { cssVar: '--font-accessible', name: 'Atkinson Hyperlegible', category: 'sans-serif', example: 'Максимальная доступность' },
    { cssVar: '--font-accessible1', name: 'Segoe UI', category: 'sans-serif', example: 'Максимальная доступность' },
  ]);

  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedFont, setSelectedFont] = useState<Font | null>(null);
  const [fontSize, setFontSize] = useState(20);
  const [customText, setCustomText] = useState('The quick brown fox jumps over the lazy dog');

  const categories = ['all', 'sans-serif', 'serif', 'monospace'];

  const filteredFonts = fonts.filter(font => {
    const matchesCategory = filter === 'all' || font.category === filter;
    const matchesSearch = font.name.toLowerCase().includes(search.toLowerCase()) || 
                         font.cssVar.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getFontStyle = (cssVar: string) => {
    const font = fonts.find(f => f.cssVar === cssVar);
    return { 
      fontFamily: `"${font?.name || 'Arial'}", ${font?.category || 'sans-serif'}` 
    };
  };


  const handleFontSelect = (font: Font) => {
    setSelectedFont(font);
  };

  const handleCopyCSS = (cssVar: string) => {
    const cssText = `var(${cssVar})`;
    navigator.clipboard.writeText(cssText)
      .then(() => alert(`Copied: ${cssText}`))
      .catch(err => console.error('Failed to copy:', err));
  };

  const handleCopyFontFamily = (font: Font) => {
    const fontFamily = `"${font.name}", ${font.category}`;
    navigator.clipboard.writeText(fontFamily)
      .then(() => alert(`Copied: ${fontFamily}`))
      .catch(err => console.error('Failed to copy:', err));
  };

  return (
    <div className="font-viewer-container">
      <header className="font-viewer-header">
        <h1>Font Library Viewer</h1>
        <p>Preview and test {fonts.length} available fonts</p>
      </header>

      <div className="controls-panel">
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search fonts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          
          <div className="category-filter">
            {categories.map(category => (
              <button
                key={category}
                className={`category-btn ${filter === category ? 'active' : ''}`}
                onClick={() => setFilter(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="preview-controls">
          <div className="font-size-control">
            <label>Font Size:</label>
            <input
              type="range"
              min="12"
              max="48"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
            />
            <span>{fontSize}px</span>
          </div>
          
          <div className="custom-text-control">
            <label>Preview Text:</label>
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Enter custom text"
            />
          </div>
        </div>
      </div>

      {selectedFont && (
        <div className="selected-font-preview">
          <h2>Selected Font: {selectedFont.name}</h2>
          <div 
            className="selected-font-display"
            style={{
              ...getFontStyle(selectedFont.cssVar),
              fontSize: `${fontSize}px`
            }}
          >
            {customText || selectedFont.example}
          </div>
          <div className="font-info">
            <p><strong>CSS Variable:</strong> var({selectedFont.cssVar})</p>
            <p><strong>Category:</strong> {selectedFont.category}</p>
            <p><strong>Font Family:</strong> "{selectedFont.name}", {selectedFont.category}</p>
            <div className="action-buttons">
              <button onClick={() => handleCopyCSS(selectedFont.cssVar)}>
                Copy CSS Variable
              </button>
              <button onClick={() => handleCopyFontFamily(selectedFont)}>
                Copy Font Family
              </button>
              <button onClick={() => setSelectedFont(null)}>
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="font-grid">
        {filteredFonts.map(font => (
          <div 
            key={font.cssVar} 
            className={`font-card ${selectedFont?.cssVar === font.cssVar ? 'selected' : ''}`}
            onClick={() => handleFontSelect(font)}
          >
            <div className="font-header">
              <h3 className="font-name">{font.name}</h3>
              <span className="font-category">{font.category}</span>
            </div>
            
            <div 
              className="font-preview"
              style={{
                ...getFontStyle(font.cssVar),
                fontSize: `${fontSize}px`
              }}
            >
              {customText || font.example}
            </div>
            
            <div className="font-meta">
              <code className="css-var">var({font.cssVar})</code>
              <div className="font-actions">
                <button 
                  className="copy-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyCSS(font.cssVar);
                  }}
                  title="Copy CSS variable"
                >
                  Copy CSS
                </button>
                <button 
                  className="copy-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyFontFamily(font);
                  }}
                  title="Copy font family"
                >
                  Copy Family
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredFonts.length === 0 && (
        <div className="no-results">
          <p>No fonts found matching your search criteria.</p>
        </div>
      )}

      <div className="font-stats">
        <p>Showing {filteredFonts.length} of {fonts.length} fonts</p>
        <div className="category-stats">
          {categories.slice(1).map(category => (
            <span key={category} className="stat-badge">
              {category}: {fonts.filter(f => f.category === category).length}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FontViewer;