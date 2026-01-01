import React, { useState, useEffect } from 'react';
import './IXLMathQuestion.css';

const IXLMathQuestion = ({ 
  numbers = ["23,704", "44,384", "80,460", "6,140"], 
  targetDigit = 4,
  correctIndex = 1  // Индекс правильного ответа в массиве numbers
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [questionData, setQuestionData] = useState(null);
  const [error, setError] = useState('');

  // Валидация и подготовка данных
  useEffect(() => {
    try {
      // Валидация входных данных
      if (!Array.isArray(numbers) || numbers.length !== 4) {
        throw new Error('Должно быть ровно 4 числа');
      }

      if (typeof targetDigit !== 'number' || targetDigit < 0 || targetDigit > 9) {
        throw new Error('targetDigit должен быть цифрой от 0 до 9');
      }

      if (correctIndex < 0 || correctIndex > 3) {
        throw new Error('correctIndex должен быть от 0 до 3');
      }

      // Проверяем, что в каждом числе targetDigit встречается только один раз
      const preparedOptions = numbers.map((numberStr, index) => {
        // Убираем запятые для проверки
        const cleanStr = numberStr.replace(/,/g, '');
        
        // Считаем количество вхождений targetDigit
        const digitCount = cleanStr.split('').filter(d => parseInt(d) === targetDigit).length;
        
        if (digitCount !== 1) {
          throw new Error(`В числе "${numberStr}" цифра ${targetDigit} должна встречаться ровно один раз. Найдено: ${digitCount}`);
        }

        // Находим позицию цифры в числе (справа налево)
        const reversedStr = cleanStr.split('').reverse().join('');
        const position = reversedStr.indexOf(targetDigit.toString());
        
        if (position === -1) {
          throw new Error(`Цифра ${targetDigit} не найдена в числе "${numberStr}"`);
        }

        // Значение цифры в её позиции
        const worth = targetDigit * Math.pow(10, position);
        
        // Определяем имя позиции
        const positionNames = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands'];
        const positionName = positionNames[position] || `10^${position}`;
        
        // Форматируем worth
        const formattedWorth = worth.toLocaleString();
        
        // Находим подстроки для отображения
        const digitIndex = numberStr.indexOf(targetDigit.toString());
        const beforeDigit = numberStr.substring(0, digitIndex);
        const afterDigit = numberStr.substring(digitIndex + 1);

        return {
          id: index,
          value: numberStr,
          beforeDigit,
          afterDigit,
          position: position,
          positionName,
          worth,
          formattedWorth,
          isCorrect: index === correctIndex
        };
      });

      // Проверяем, что все позиции уникальны
      const positions = preparedOptions.map(opt => opt.position);
      const uniquePositions = [...new Set(positions)];
      if (uniquePositions.length !== 4) {
        console.warn('Позиции цифр не уникальны. Рассмотрите использование разных позиций.');
      }

      setQuestionData({
        question: `Which number's underlined digit is worth ${preparedOptions[correctIndex].formattedWorth}?`,
        options: preparedOptions,
        correctAnswerId: correctIndex
      });

      setError('');
    } catch (err) {
      setError(err.message);
    }
  }, [numbers, targetDigit, correctIndex]);

  const handleSelect = (id) => {
    if (!isSubmitted && questionData) {
      setSelectedAnswer(id);
    }
  };

  const handleSubmit = () => {
    if (selectedAnswer !== null && questionData) {
      setIsSubmitted(true);
      setShowFeedback(true);
      
      setTimeout(() => {
        setShowFeedback(false);
      }, 3000);
    }
  };

  const handleTryAgain = () => {
    setSelectedAnswer(null);
    setIsSubmitted(false);
    setShowFeedback(false);
  };

  const handleKeyDown = (e, id) => {
    if ((e.key === 'Enter' || e.key === ' ') && questionData) {
      e.preventDefault();
      if (!isSubmitted) {
        handleSelect(id);
      }
    }
  };

  const renderNumber = (option) => {
    if (!option) return null;
    
    return (
      <div className="number-display">
        <span>{option.beforeDigit}</span>
        <span className="underlined-digit">{targetDigit}</span>
        <span>{option.afterDigit}</span>
      </div>
    );
  };

  if (error) {
    return (
      <div className="error-container">
        <h3>Ошибка в данных</h3>
        <p>{error}</p>
        <pre>{JSON.stringify({ numbers, targetDigit, correctIndex }, null, 2)}</pre>
      </div>
    );
  }

  if (!questionData) {
    return <div className="loading">Загрузка вопроса...</div>;
  }

  return (
    <div className="ixl-container">
      <div className="ixl-question-component">
        <section className="question-and-submission-view">
          <section className="ixl-practice-crate">
            <div className="math-section">
              <div className="section-header">
                {questionData.question}
              </div>
              
              <div className="section-content">
                <div className="choices-container">
                  <div 
                    className="choice-grid"
                    role="radiogroup"
                    aria-label="Answer choices"
                  >
                    {questionData.options.map((option) => (
                      <div
                        key={option.id}
                        className={`choice-tile ${selectedAnswer === option.id ? 'selected' : ''} 
                                   ${isSubmitted && option.id === questionData.correctAnswerId ? 'correct-answer' : ''}
                                   ${isSubmitted && selectedAnswer === option.id && option.id !== questionData.correctAnswerId ? 'incorrect-selected' : ''}`}
                        onClick={() => handleSelect(option.id)}
                        onKeyDown={(e) => handleKeyDown(e, option.id)}
                        role="radio"
                        aria-checked={selectedAnswer === option.id}
                        tabIndex={0}
                      >
                        <div className="tile-content">
                          <div className="number-wrapper">
                            {renderNumber(option)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="submission-footer">
            <button
              className="submit-button"
              onClick={handleSubmit}
              disabled={selectedAnswer === null || isSubmitted}
            >
              Submit
            </button>
          </div>
        </section>
      </div>

      {/* Feedback Panel */}
      {showFeedback && questionData && (
        <div className={`feedback-panel ${selectedAnswer === questionData.correctAnswerId ? 'correct' : 'incorrect'}`}>
          <div className="feedback-content">
            <div className="feedback-icon">
              {selectedAnswer === questionData.correctAnswerId ? '✓' : '✗'}
            </div>
            <div className="feedback-text">
              {selectedAnswer === questionData.correctAnswerId ? (
                <span>
                  <strong>Correct!</strong> The underlined digit in {questionData.options[selectedAnswer].value} is in the {questionData.options[selectedAnswer].positionName} place, 
                  which equals {targetDigit} × 10<sup>{questionData.options[selectedAnswer].position}</sup> = {questionData.options[selectedAnswer].formattedWorth}.
                </span>
              ) : (
                <span>
                  <strong>Incorrect.</strong> {selectedAnswer !== null && 
                    `The underlined digit in ${questionData.options[selectedAnswer].value} is worth ${questionData.options[selectedAnswer].formattedWorth}. `}
                  Try again!
                </span>
              )}
            </div>
            <button 
              className="feedback-close"
              onClick={() => setShowFeedback(false)}
              aria-label="Close feedback"
            >
              ×
            </button>
          </div>
          
          {selectedAnswer !== questionData.correctAnswerId && (
            <div className="try-again-section">
              <button 
                className="try-again-button"
                onClick={handleTryAgain}
              >
                Try again
              </button>
            </div>
          )}
        </div>
      )}

      {/* Explanation Panel (visible after submission) */}
      {isSubmitted && !showFeedback && questionData && (
        <div className="explanation-panel">
          <h3>Explanation</h3>
          <div className="explanation-content">
            <p>The underlined digit's value depends on its place in the number:</p>
            
            <div className="place-value-examples">
              {questionData.options.map((option) => (
                <div 
                  key={option.id} 
                  className={`example ${option.id === questionData.correctAnswerId ? 'correct-example' : ''}`}
                >
                  <div className="example-number">
                    <span>{option.beforeDigit}</span>
                    <span className="underlined-example">{targetDigit}</span>
                    <span>{option.afterDigit}</span>
                  </div>
                  <div className="example-text">
                    <strong>{option.positionName} place:</strong> {targetDigit} × 10<sup>{option.position}</sup> = {option.formattedWorth}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="conclusion">
              <p>
                The number where the underlined {targetDigit} is worth {questionData.options[questionData.correctAnswerId].formattedWorth} is 
                <strong> {questionData.options[questionData.correctAnswerId].value}</strong>.
              </p>
            </div>
          </div>
          
          <button 
            className="new-question-button"
            onClick={handleTryAgain}
          >
            Practice Again
          </button>
        </div>
      )}
    </div>
  );
};

// Валидация пропсов
IXLMathQuestion.defaultProps = {
  numbers: ["23,704", "44,384", "80,460", "6,140"],
  targetDigit: 4,
  correctIndex: 1
};

export default IXLMathQuestion;