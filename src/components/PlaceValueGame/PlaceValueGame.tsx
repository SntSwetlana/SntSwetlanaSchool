import { useState, useEffect } from 'react';
import './PlaceValueGame.css';

interface PlaceValueGameProps {
  targetNumber?: number;
}

interface Option {
  id: number;
  value: number;
  formattedValue: string;
  position: number;
  positionName: string;
  placeValue: number;
  targetIndex: number;
  formattedIndex: number;
}

const PlaceValueGame: React.FC<PlaceValueGameProps> = ({ targetNumber = 4 }) => {
  // Проверяем, что число от 1 до 9 (единственная ненулевая цифра)
  const normalizedTarget = Math.min(9, Math.max(1, Math.abs(targetNumber))) || 1;
  
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [options, setOptions] = useState<Option[]>([]);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(0);

  // Генерируем варианты ответов при монтировании или изменении targetNumber
  useEffect(() => {
    generateOptions();
  }, [normalizedTarget]);

  const generateOptions = () => {
    // Доступные позиции (0 - единицы, 1 - десятки, 2 - сотни, 3 - тысячи, 4 - десятки тысяч)
    const allPositions = [0, 1, 2, 3, 4];
    
    // Выбираем 4 уникальные позиции
    const selectedPositions: number[] = [];
    while (selectedPositions.length < 4) {
      const randomPos = allPositions[Math.floor(Math.random() * allPositions.length)];
      if (!selectedPositions.includes(randomPos)) {
        selectedPositions.push(randomPos);
      }
    }
    
    // Создаем числа для каждой позиции
    const generatedOptions = selectedPositions.map((position, index) => {
      // Создаем число с искомой цифрой в нужной позиции
      let numberValue = 0;
      
      // Устанавливаем искомую цифру в нужную позицию
      numberValue += normalizedTarget * Math.pow(10, position);
      
      // Добавляем случайные нули в другие позиции (чтобы цифра была единственной ненулевой)
      // Или добавляем небольшие случайные значения (0-9) в другие позиции для разнообразия
      for (let i = 0; i < 5; i++) {
        if (i !== position) {
          // С небольшой вероятностью добавляем другие цифры, но делаем их маленькими
          if (Math.random() > 0.7) {
            numberValue += Math.floor(Math.random() * 9) * Math.pow(10, i);
          }
        }
      }
      
      // Форматируем число с запятыми
      const formattedNumber = numberValue.toLocaleString('en-US');
      
      // Находим позицию подчеркнутой цифры в отформатированной строке
      const numberStr = numberValue.toString();
      const targetIndex = numberStr.length - 1 - position;
      const formattedIndex = formattedNumber.length - 1 - 
                           formattedNumber.split('').reverse().findIndex((_char, idx) => {
                             const originalIdx = numberStr.length - 1 - idx;
                             return originalIdx === position;
                           });
      
      return {
        id: index,
        value: numberValue,
        formattedValue: formattedNumber,
        position: position,
        positionName: getPositionName(position),
        placeValue: normalizedTarget * Math.pow(10, position),
        targetIndex: targetIndex,
        formattedIndex: formattedIndex
      };
    });
    
    // Случайно выбираем правильный ответ
    const correctIndex = Math.floor(Math.random() * 4);
    setCorrectAnswerIndex(correctIndex);
    setOptions(generatedOptions);
  };

  const getPositionName = (position: number): string => {
    const names = ['единиц', 'десятков', 'сотен', 'тысяч', 'десятков тысяч'];
    return names[position] || 'единиц';
  };

  const getPlaceValueDescription = (value: number): string => {
    if (value >= 10000) return `${value.toLocaleString()}`;
    if (value >= 1000) return `${(value/1000).toFixed(0)} тысячи`;
    if (value >= 100) return `${value} сотни`;
    if (value >= 10) return `${value} десятка`;
    return `${value}`;
  };

  const handleSelect = (id: number) => {
    if (!isSubmitted) {
      setSelectedAnswer(id);
    }
  };

  const handleSubmit = () => {
    if (selectedAnswer !== null) {
      setIsSubmitted(true);
    }
  };

  const handleNewQuestion = () => {
    generateOptions();
    setSelectedAnswer(null);
    setIsSubmitted(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent, id: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleSelect(id);
    }
  };

  const renderNumberWithUnderline = (option: Option) => {
    const formatted = option.formattedValue;
    const targetPos = option.position;
    
    // Находим индекс подчеркнутой цифры в отформатированной строке
    let digitCount = 0;
    let underlinedFound = false;
    
    return (
      <div className="number-display">
        {formatted.split('').map((char, index) => {
          if (char === ',') {
            return <span key={index} className="comma">,</span>;
          }
          
          const isUnderlined = !underlinedFound && digitCount === targetPos;
          if (char.match(/\d/)) {
            digitCount++;
          }
          if (isUnderlined) {
            underlinedFound = true;
          }
          
          return (
            <span 
              key={index} 
              className={`digit ${isUnderlined ? 'underlined' : ''}`}
            >
              {char}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="place-value-game">
      <div className="game-header">
        <h2>Найди разряд числа</h2>
        <div className="target-info">
          Ищем цифру: <span className="target-digit">{normalizedTarget}</span>
        </div>
      </div>

      <div className="question-section">
        <div className="question-text">
          В каком числе подчеркнутая цифра <span className="highlight-text">{normalizedTarget}</span> 
          обозначает значение <strong>{getPlaceValueDescription(options[correctAnswerIndex]?.placeValue || 0)}</strong>?
        </div>

        <div className="options-grid" role="radiogroup" aria-label="Варианты ответов">
          {options.map((option) => (
            <div
              key={option.id}
              className={`option-card 
                ${selectedAnswer === option.id ? 'selected' : ''}
                ${isSubmitted ? (option.id === correctAnswerIndex ? 'correct' : selectedAnswer === option.id ? 'incorrect' : '') : ''}`}
              onClick={() => handleSelect(option.id)}
              onKeyPress={(e) => handleKeyPress(e, option.id)}
              role="radio"
              aria-checked={selectedAnswer === option.id}
              tabIndex={0}
            >
              <div className="option-content">
                {renderNumberWithUnderline(option)}
                
                {isSubmitted && option.id === correctAnswerIndex && (
                  <div className="value-explanation">
                    = {option.placeValue.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isSubmitted && (
        <div className={`result-panel ${selectedAnswer === correctAnswerIndex ? 'success' : 'error'}`}>
          <div className="result-header">
            <span className="result-icon">
              {selectedAnswer === correctAnswerIndex ? '✅' : '❌'}
            </span>
            <span className="result-text">
              {selectedAnswer === correctAnswerIndex 
                ? `Правильно! Цифра ${normalizedTarget} в разряде ${getPositionName(options[correctAnswerIndex].position)} равна ${options[correctAnswerIndex].placeValue.toLocaleString()}`
                : `Неверно. В выбранном числе цифра ${normalizedTarget} равна ${options[selectedAnswer!]?.placeValue.toLocaleString() || 0}`
              }
            </span>
          </div>
          
          <div className="solution-explanation">
            <h4>Объяснение:</h4>
            <div className="place-value-table">
              <div className="table-header">
                <div>Число</div>
                <div>Разряд</div>
                <div>Значение</div>
              </div>
              {options.map((option) => (
                <div 
                  key={option.id} 
                  className={`table-row ${option.id === correctAnswerIndex ? 'correct-row' : ''}`}
                >
                  <div className="number-cell">{option.formattedValue}</div>
                  <div className="position-cell">{getPositionName(option.position)}</div>
                  <div className="value-cell">{option.placeValue.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="controls">
        <button
          className="btn submit-btn"
          onClick={handleSubmit}
          disabled={selectedAnswer === null || isSubmitted}
        >
          {isSubmitted ? 'Ответ отправлен' : 'Проверить ответ'}
        </button>
        
        {isSubmitted && (
          <button
            className="btn new-question-btn"
            onClick={handleNewQuestion}
          >
            Новый вопрос
          </button>
        )}
        
        <button
          className="btn hint-btn"
          onClick={() => {
            alert(`Подсказка: Рассмотрите каждое число и определите, в каком разряде находится цифра ${normalizedTarget}.`);
          }}
          disabled={isSubmitted}
        >
          Подсказка
        </button>
      </div>

      <div className="instructions">
        <h3>Как играть:</h3>
        <ul>
          <li>Найдите число, где подчеркнутая цифра имеет указанное значение</li>
          <li>Каждая позиция цифры имеет разное значение:</li>
          <li>Единицы: ×1, Десятки: ×10, Сотни: ×100, Тысячи: ×1000, Десятки тысяч: ×10000</li>
        </ul>
      </div>
    </div>
  );
};

// Компонент с валидацией пропсов
const PlaceValueGameWithValidation = ({ targetNumber = 4 }) => {
  // Валидация входного параметра
  const isValidNumber = Number.isInteger(targetNumber) && targetNumber >= 1 && targetNumber <= 9;
  
  if (!isValidNumber) {
    return (
      <div className="error-message">
        <h3>Ошибка ввода</h3>
        <p>Пожалуйста, укажите число от 1 до 9</p>
        <p>Переданное значение: {targetNumber}</p>
      </div>
    );
  }
  
  return <PlaceValueGame targetNumber={targetNumber} />;
};

export default PlaceValueGameWithValidation;