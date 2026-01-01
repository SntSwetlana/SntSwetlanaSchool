import React, { useState } from 'react';
import './PlaceValuePuzzle.css';

const PlaceValuePuzzle = ({ 
  number = "8,563",
  targetDigit = "6",
  question = "Where is the digit?",
  options = ["ones place", "tens place", "hundreds place", "thousands place"]
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Определяем правильный разряд для цифры
  const getCorrectPlace = (): string | null => {
    // Убираем запятые из числа
    const cleanNumber = number.replace(/,/g, '');
    // Находим позицию цифры справа (с 0 для ones place)
    const digitIndex = cleanNumber.indexOf(targetDigit);
    if (digitIndex === -1) return null;
    
    // Позиция справа: ones = 0, tens = 1, hundreds = 2 и т.д.
    const positionFromRight = cleanNumber.length - 1 - digitIndex;
    
    const placeNames = ["ones place", "tens place", "hundreds place", "thousands place", 
                       "ten thousands place", "hundred thousands place", "millions place"];
    
    return placeNames[positionFromRight] || "unknown place";
  };

  const correctAnswer = getCorrectPlace();

  const handleOptionSelect = (option: string) => {
    if (!isSubmitted) {
      setSelectedOption(option);
    }
  };

  const handleSubmit = () => {
    if (selectedOption) {
      setIsSubmitted(true);
      setIsCorrect(selectedOption === correctAnswer);
    }
  };

  const handleReset = () => {
    setSelectedOption(null);
    setIsSubmitted(false);
    setIsCorrect(false);
  };

  // Визуализация числа с подсветкой цифры
  const renderNumberWithHighlight = () => {
    const cleanNumber = number.replace(/,/g, '');
    
    return (
      <div className="number-display">
        {cleanNumber.split('').map((digit, index) => {
          const isTarget = digit === targetDigit;
          const positionFromRight = cleanNumber.length - 1 - index;
          const placeNames = ["ones", "tens", "hundreds", "thousands"];
          const placeName = placeNames[positionFromRight] || `place ${positionFromRight + 1}`;
          
          return (
            <div key={index} className="digit-container">
              <div className={`digit ${isTarget ? 'target-digit' : ''}`}>
                {digit}
              </div>
              {isTarget && (
                <div className="place-indicator">
                  <div className="arrow"></div>
                  <div className="place-label">{placeName}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Функция для рендеринга разбора числа
  const renderNumberBreakdown = () => {
    const cleanNumber = number.replace(/,/g, '');
    const digits = cleanNumber.split('').reverse(); // начинаем с ones place
    const placeNames = ["Ones", "Tens", "Hundreds", "Thousands", "Ten Thousands"];
    
    const breakdownItems = digits.map((digit, index) => {
      const placeName = placeNames[index] || `Place ${index}`;
      const multiplier = Math.pow(10, index);
      const value = parseInt(digit) * multiplier;
      const isTargetDigit = digit === targetDigit;
      
      return (
        <div key={index} className={`breakdown-item ${isTargetDigit ? 'highlighted' : ''}`}>
          <span className="breakdown-digit">{digit}</span>
          <span className="breakdown-times"> × </span>
          <span className="breakdown-multiplier">{multiplier}</span>
          <span className="breakdown-equals"> = </span>
          <span className="breakdown-value">{value.toLocaleString()}</span>
          <span className="breakdown-place"> ({placeName})</span>
          {isTargetDigit && <span className="breakdown-target"> ← Это цифра {targetDigit}</span>}
        </div>
      );
    }).reverse();
    
    return breakdownItems;
  };

  return (
    <div className="place-value-puzzle">
      <div className="question-section">
        <h2 className="question-title">
          {question.replace("?", "")} <span className="target-digit-inline">{targetDigit}</span>?
        </h2>
        
        <div className="number-section">
          <div className="number-large">{number}</div>
          {renderNumberWithHighlight()}
        </div>
      </div>

      <div className="options-section">
        <h3 className="options-title">Select the correct place value:</h3>
        <div className="options-grid" role="radiogroup" aria-label="answer choices">
          {options.map((option, index) => (
            <div
              key={index}
              className={`option-card ${selectedOption === option ? 'selected' : ''} ${
                isSubmitted && option === correctAnswer ? 'correct' : ''
              } ${isSubmitted && selectedOption === option && option !== correctAnswer ? 'incorrect' : ''}`}
              role="radio"
              aria-checked={selectedOption === option}
              tabIndex={0}
              onClick={() => handleOptionSelect(option)}
              onKeyPress={(e) => e.key === 'Enter' && handleOptionSelect(option)}
            >
              <div className="option-content">
                <div className="option-radio">
                  <div className="radio-circle">
                    {selectedOption === option && (
                      <div className="radio-dot"></div>
                    )}
                  </div>
                </div>
                <div className="option-text">{option}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="controls-section">
        <button
          className="submit-button"
          onClick={handleSubmit}
          disabled={!selectedOption || isSubmitted}
        >
          Проверить
        </button>
        
        <button
          className="reset-button"
          onClick={handleReset}
        >
          Сбросить
        </button>
      </div>

      {isSubmitted && (
        <div className={`feedback ${isCorrect ? 'correct-feedback' : 'incorrect-feedback'}`}>
          {isCorrect ? (
            <>
              <div className="feedback-icon correct-icon">✓</div>
              <div className="feedback-content">
                <h3>Правильно!</h3>
                <p>Цифра <strong>{targetDigit}</strong> находится в разряде <strong>{correctAnswer}</strong>.</p>
              </div>
            </>
          ) : (
            <>
              <div className="feedback-icon incorrect-icon">✗</div>
              <div className="feedback-content">
                <h3>Неправильно</h3>
                <p>Правильный ответ: <strong>{correctAnswer}</strong>.</p>
                <p>Ваш ответ: <strong>{selectedOption}</strong>.</p>
              </div>
            </>
          )}
        </div>
      )}

      <div className="explanation-section">
        <h3>Объяснение:</h3>
        <div className="place-value-chart">
          <table className="place-value-table">
            <thead>
              <tr>
                <th>Разряд</th>
                <th>Значение</th>
                <th>Пример</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Ones place</td>
                <td>Единицы (×1)</td>
                <td>3 в числе 8,563</td>
              </tr>
              <tr>
                <td>Tens place</td>
                <td>Десятки (×10)</td>
                <td>6 в числе 8,563</td>
              </tr>
              <tr>
                <td>Hundreds place</td>
                <td>Сотни (×100)</td>
                <td>5 в числе 8,563</td>
              </tr>
              <tr>
                <td>Thousands place</td>
                <td>Тысячи (×1000)</td>
                <td>8 в числе 8,563</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="number-breakdown">
          <h4>Разбор числа {number}:</h4>
          <div className="breakdown">
            {renderNumberBreakdown()}
          </div>
        </div>
      </div>
    </div>
  );
};

// Типы для примера
interface PlaceValueExample {
  number: string;
  targetDigit: string;
  question: string;
  options: string[];
  questionSuffix?: string;
}

// Компонент с несколькими примерами
export const PlaceValueExamples: React.FC = () => {
  const examples: PlaceValueExample[] = [
    {
      number: "8,563",
      targetDigit: "6",
      question: "Where is the digit",
      options: ["ones place", "tens place", "hundreds place", "thousands place"]
    },
    {
      number: "42,719",
      targetDigit: "7",
      question: "What is the place value of",
      options: ["ones place", "tens place", "hundreds place", "thousands place", "ten thousands place"]
    },
    {
      number: "3,045",
      targetDigit: "4",
      question: "Identify the place of",
      options: ["ones place", "tens place", "hundreds place", "thousands place"]
    },
    {
      number: "100,000",
      targetDigit: "1",
      question: "The digit",
      questionSuffix: "is in which place?",
      options: ["ones place", "tens place", "hundreds place", "thousands place", "hundred thousands place"]
    }
  ];

  return (
    <div className="place-value-examples">
      <h2>Practice Place Values</h2>
      <p className="examples-description">
        Определите разряд указанной цифры в каждом числе:
      </p>
      <div className="examples-grid">
        {examples.map((example, index) => (
          <div key={index} className="example-card">
            <PlaceValuePuzzle
              number={example.number}
              targetDigit={example.targetDigit}
              question={example.question}
              options={example.options}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlaceValuePuzzle;