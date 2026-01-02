import React, { useState, useEffect } from 'react';
import './PlaceValueEquation.css';

const PlaceValueEquation = ({
  correctAnswer = 384
}) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [equationText, setEquationText] = useState('');
  const [placeValues, setPlaceValues] = useState([]);

  // Генерируем текст уравнения из correctAnswer
  useEffect(() => {
    generateEquation(correctAnswer);
  }, [correctAnswer]);

  const generateEquation = (number) => {
    const numStr = number.toString();
    const values = [];
    let equationParts = [];
    
    // Обрабатываем цифры справа налево
    for (let i = 0 ; i <= numStr.length - 1; i++) {
      const digit = parseInt(numStr[numStr.length - 1 - i]);
      if (digit === 0) continue; // Пропускаем нули
      
      let placeName = '';
      let multiplier = Math.pow(10, i);
      
      switch (i) {
        case 0:
          placeName = 'ones';
          break;
        case 1:
          placeName = 'tens';
          break;
        case 2:
          placeName = 'hundreds';
          break;
        case 3:
          placeName = 'thousands';
          break;
        case 4:
          placeName = 'ten-thousands';
          break;
        default:
          placeName = `10^${i} place`;
      }
      
      values.push({
        digit,
        placeName,
        value: digit * multiplier
      });
      
      equationParts.push(`${digit} ${placeName}`);
    }
    
    // Разворачиваем для правильного порядка (от большего к меньшему)
    values.reverse();
    equationParts.reverse();
    
    setPlaceValues(values);
    setEquationText(equationParts.join(' + '));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userAnswer.trim() !== '') {
      setIsSubmitted(true);
      setShowFeedback(true);
      
      setTimeout(() => {
        setShowFeedback(false);
      }, 3000);
    }
  };

  const handleReset = () => {
    setUserAnswer('');
    setIsSubmitted(false);
    setShowFeedback(false);
  };

  const handleKeyPress = (e) => {
    // Разрешаем только цифры и Backspace
    if (!/[0-9]|Backspace|Delete|ArrowLeft|ArrowRight|Tab/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleInputChange = (e) => {
    // Убираем все нецифровые символы
    const value = e.target.value.replace(/\D/g, '');
    setUserAnswer(value);
  };

  // Парсим уравнение для отображения
  const parseEquationForDisplay = () => {
    const parts = equationText.split('+').map(part => part.trim());
    
    return parts.map((part, index) => {
      const match = part.match(/(\d+)\s+(\S+)/);
      if (match) {
        return {
          number: match[1],
          unit: match[2],
          isLast: index === parts.length - 1
        };
      }
      return null;
    }).filter(Boolean);
  };

  const equationParts = parseEquationForDisplay();

  return (
    <div className="ixl-html-crate ixl-html-crate-root">
      <div className="question-container">
        <div className="question-text">
          Type the missing number.
        </div>
        
        <div className="equation-container">
          <div className="equation-parts">
            {equationParts.map((part, index) => (
              <React.Fragment key={index}>
                <span className="equation-part">
                  {part.number} {part.unit}
                </span>
                {!part.isLast && <span className="plus-sign"> + </span>}
              </React.Fragment>
            ))}
            
            <span className="equals-sign"> = </span>
            
            <span className="answer-input-container">
              <input
                type="text"
                className="fillIn"
                spellCheck="false"
                value={userAnswer}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                disabled={isSubmitted}
                style={{ width: `${Math.max(47, correctAnswer.toString().length * 15)}px` }}
                aria-label="Enter the missing number"
              />
            </span>
          </div>
        </div>
        
        {showFeedback && (
          <div className={`feedback-container ${parseInt(userAnswer) === correctAnswer ? 'correct' : 'incorrect'}`}>
            <div className="feedback-content">
              <span className="feedback-icon">
                {parseInt(userAnswer) === correctAnswer ? '✓' : '✗'}
              </span>
              <span className="feedback-text">
                {parseInt(userAnswer) === correctAnswer ? (
                  `Correct! ${equationText} = ${correctAnswer}`
                ) : (
                  `Incorrect. The correct answer is ${correctAnswer}`
                )}
              </span>
            </div>
          </div>
        )}
      </div>
      
      <div className="submission-footer fade-in">
        <button 
          className="crisp-button submit-button"
          onClick={handleSubmit}
          disabled={userAnswer.trim() === '' || isSubmitted}
        >
          Submit
        </button>
        
        {isSubmitted && (
          <button 
            className="crisp-button reset-button"
            onClick={handleReset}
          >
            Try Another
          </button>
        )}
      </div>

      {/* Explanation Panel */}
      {isSubmitted && !showFeedback && (
        <div className="explanation-panel">
          <div className="explanation-content">
            <h3>How to solve:</h3>
            
            <div className="calculation-steps">
              {placeValues.map((item, index) => (
                <div key={index} className="calculation-step">
                  <span className="step-number">{index + 1}.</span>
                  <span className="step-text">
                    {item.digit} {item.placeName} = {item.digit} × {Math.pow(10, placeValues.length - 1 - index)} = {item.value}
                  </span>
                </div>
              ))}
              
              <div className="calculation-step final-step">
                <span className="step-number">→</span>
                <span className="step-text">
                  Total = {placeValues.map(item => item.value).join(' + ')} = {correctAnswer}
                </span>
              </div>
            </div>
            
            <div className="place-value-explanation">
              <div className="place-value-header">Number breakdown:</div>
              <div className="number-breakdown">
                <div className="number-display-large">{correctAnswer}</div>
                <div className="place-value-grid">
                  {correctAnswer.toString().split('').map((digit, index) => {
                    const position = correctAnswer.toString().length - 1 - index;
                    let placeName = '';
                    
                    switch (position) {
                      case 0: placeName = 'ones'; break;
                      case 1: placeName = 'tens'; break;
                      case 2: placeName = 'hundreds'; break;
                      case 3: placeName = 'thousands'; break;
                      case 4: placeName = 'ten-thousands'; break;
                      default: placeName = `10^${position}`;
                    }
                    
                    return (
                      <div key={index} className="place-value-item">
                        <div className="place-value-number">{digit}</div>
                        <div className="place-value-label">{placeName}</div>
                        <div className="place-value-calculation">
                          = {digit} × 10<sup>{position}</sup>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Компонент с генерацией случайных чисел
export const RandomPlaceValueEquation = () => {
  const generateRandomNumber = () => {
    // Генерируем число от 100 до 9999 для разнообразия
    const min = 100;
    const max = 9999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const [randomNumber, setRandomNumber] = useState(generateRandomNumber());
  const [key, setKey] = useState(0);

  const handleNewQuestion = () => {
    setRandomNumber(generateRandomNumber());
    setKey(prev => prev + 1); // Принудительный ререндер
  };

  return (
    <div>
      <PlaceValueEquation 
        key={key}
        correctAnswer={randomNumber}
      />
      <div className="new-question-container">
        <button 
          className="crisp-button new-question-button"
          onClick={handleNewQuestion}
        >
          Generate New Question
        </button>
        <div className="question-info">
          Current number: <strong>{randomNumber}</strong>
        </div>
      </div>
    </div>
  );
};

export default PlaceValueEquation;