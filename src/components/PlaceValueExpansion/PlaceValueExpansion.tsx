import React, { useState, useEffect } from 'react';
import './PlaceValueExpansion.css';
interface PlaceValueExpansionProps {
  number?: number;
  showHints?: boolean;
}

interface DigitInfo {
  digit: number;
  position: number;
  value: number;
}

interface PlaceInfo {
  key: string;
  position: number;
  name: string;
  multiplier: number;
}

interface Answers {
  [key: string]: string;
}
interface CorrectDigits {
  [key: string]: number;
}


const PlaceValueExpansion: React.FC<PlaceValueExpansionProps> = ({
  number = 323,
  showHints = true
}) => {
  const [answers, setAnswers] = useState<Answers>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [numberDigits, setNumberDigits] = useState<DigitInfo[]>([]);
  const [placeFields, setPlaceFields] = useState<PlaceInfo[]>([]);
  // Определяем все возможные разряды с их названиями
  const allPlaces: PlaceInfo[] = [
    { key: 'hundred_thousands', position: 5, name: 'hundred thousands', multiplier: 100000 },
    { key: 'ten_thousands', position: 4, name: 'ten thousands', multiplier: 10000 },
    { key: 'thousands', position: 3, name: 'thousands', multiplier: 1000 },
    { key: 'hundreds', position: 2, name: 'hundreds', multiplier: 100 },
    { key: 'tens', position: 1, name: 'tens', multiplier: 10 },
    { key: 'ones', position: 0, name: 'ones', multiplier: 1 }
  ];

  // Разбиваем число на цифры и разряды
  useEffect(() => {
    const numStr = number.toString();
    const digits = [];
    
    // Заполняем массив цифр для каждого разряда
    for (let i = numStr.length - 1; i >= 0; i--) {
      const digit = parseInt(numStr[numStr.length - 1 - i]);
      const position = i;
      
      digits[position] = {
        digit,
        position,
        value: digit * Math.pow(10, position)
      };
    }
    
    // Заполняем нулями пропущенные позиции
    for (let i = 0; i < numStr.length; i++) {
      if (!digits[i]) {
        digits[i] = {
          digit: 0,
          position: i,
          value: 0
        };
      }
    }
    
    // Убираем undefined и сортируем по позиции
    const sortedDigits = digits.filter((d): d is DigitInfo => d !== undefined).sort((a, b) => b.position - a.position);
    setNumberDigits(sortedDigits);
    
    // Определяем какие поля показывать (только до самой старшей ненулевой цифры)
    const maxPosition = Math.max(...sortedDigits.map(d => d.position));
    const activePlaces = allPlaces.filter(place => place.position <= maxPosition);
    
    // Создаем начальные значения ответов (все нули по умолчанию)
    const initialAnswers : Answers = {};
    activePlaces.forEach(place => {
      const digit = sortedDigits.find(d => d.position === place.position)?.digit || 0;
      initialAnswers[place.key] = digit === 0 ? '0' : ''; // Для нулей ставим '0', остальные пустые
    });
    
    setAnswers(initialAnswers);
    setPlaceFields(activePlaces);
    setIsSubmitted(false);
    setShowFeedback(false);
  }, [number]);

  const handleInputChange = (placeKey: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 1); // Только 1 цифра
    setAnswers(prev => ({
      ...prev,
      [placeKey]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Проверяем, что все поля заполнены
    const allFilled = placeFields.every(field => answers[field.key] !== undefined && answers[field.key] !== '');
    
    if (allFilled) {
      setIsSubmitted(true);
      setShowFeedback(true);
      
      setTimeout(() => {
        setShowFeedback(false);
      }, 3000);
    }
  };

  const handleReset = () => {
    const initialAnswers : Answers = {};
    placeFields.forEach(place => {
      const digit = numberDigits.find(d => d.position === place.position)?.digit || 0;
      initialAnswers[place.key] = digit === 0 ? '0' : '';
    });
    
    setAnswers(initialAnswers);
    setIsSubmitted(false);
    setShowFeedback(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, nextField: string | null) => {
    // Разрешаем только цифры
    if (/[0-9]/.test(e.key)) {
      if (nextField && e.currentTarget.value.length >= 0) {
        // Автоматический переход к следующему полю
        setTimeout(() => {
          document.getElementById(nextField)?.focus();
        }, 10);
      }
    }
  };

  // Проверяем правильность ответов
  const isCorrect = () => {
    return placeFields.every(field => {
      const correctDigit = numberDigits.find(d => d.position === field.position)?.digit || 0;
      return parseInt(answers[field.key] || '0') === correctDigit;
    });
  };

  // Получаем правильные цифры для всех активных полей
  const getCorrectDigits = (): CorrectDigits  => {
    const correctDigits: CorrectDigits  = {};
    placeFields.forEach(field => {
      correctDigits[field.key] = numberDigits.find(d => d.position === field.position)?.digit || 0;
    });
    return correctDigits;
  };

  const correctDigits = getCorrectDigits();

  // Формируем текст уравнения для отображения
  const getEquationText = () => {
    return placeFields.map(field => {
      const digit = correctDigits[field.key];
      return `${digit} ${field.name}`;
    }).join(' + ');
  };

  // Получаем следующий field для перехода
  const getNextFieldId = (currentIndex: number) => {
    if (currentIndex < placeFields.length - 1) {
      return `${placeFields[currentIndex + 1].key}-input`;
    }
    return null;
  };

  return (
    <div className="snt-html-crate snt-html-crate-root">
      <div className="question-container">
        <div className="question-text">
          Type the missing numbers.
        </div>
        
        <div className="equation-container">
          <div className="expansion-equation">
            <span className="number-display">{number.toLocaleString()}</span>
            <span className="equals-sign"> = </span>
            
            <div className="expansion-inputs">
              {placeFields.map((field, index) => (
                <React.Fragment key={field.key}>
                  <div className="input-group">
                    <input
                      id={`${field.key}-input`}
                      type="text"
                      className={`fillIn expansion-input ${isSubmitted ? (
                        parseInt(answers[field.key] || '0') === correctDigits[field.key] ? 'correct' : 'incorrect'
                      ) : ''}`}
                      spellCheck="false"
                      value={answers[field.key] || ''}
                      onChange={handleInputChange(field.key)}
                      onKeyPress={(e) => handleKeyPress(e, getNextFieldId(index))}
                      disabled={isSubmitted}
                      maxLength={1}
                      style={{ width: '30px' }}
                      aria-label={`${field.name} digit`}
                      placeholder={correctDigits[field.key] === 0 ? "0" : ""}
                    />
                    <span className="unit-label">{field.name}</span>
                  </div>
                  
                  {index < placeFields.length - 1 && (
                    <span className="plus-sign"> + </span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
        
        {showHints && !isSubmitted && (
          <div className="hint-container">
            <div className="hint-text">
              Hint: Break down {number.toLocaleString()} into place values
            </div>
            <div className="hint-example">
              Example: 4,567 = 4 thousands + 5 hundreds + 6 tens + 7 ones
            </div>
            <div className="hint-place-values">
              Active place values: {placeFields.map(f => f.name).join(', ')}
            </div>
          </div>
        )}
        
        {showFeedback && (
          <div className={`feedback-container ${isCorrect() ? 'correct' : 'incorrect'}`}>
            <div className="feedback-content">
              <span className="feedback-icon">
                {isCorrect() ? '✓' : '✗'}
              </span>
              <span className="feedback-text">
                {isCorrect() ? (
                  `Correct! ${number.toLocaleString()} = ${getEquationText()}`
                ) : (
                  `Incorrect. ${number.toLocaleString()} = ${getEquationText()}`
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
          disabled={placeFields.some(field => !answers[field.key]) || isSubmitted}
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
            <h3>Place Value Breakdown of {number.toLocaleString()}</h3>
            
            <div className="breakdown-visual">
              <div className="number-visualization">
                <div className="number-digits">
                  {placeFields.map((field) => {
                    const digit = numberDigits.find(d => d.position === field.position)?.digit || 0;
                    const userDigit = parseInt(answers[field.key] || '0');
                    
                    return (
                      <div key={field.key} className="digit-column">
                        <div className={`digit-value ${userDigit === digit ? 'correct' : 'incorrect'}`}>
                          {userDigit}
                          {userDigit !== digit && (
                            <span className="correct-digit"> ({digit})</span>
                          )}
                        </div>
                        <div className="position-label">
                          {field.name}
                        </div>
                        <div className="position-value">
                          = {digit} × {field.multiplier.toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="verification-steps">
                {placeFields.map((field, index) => {
                  const correctDigit = numberDigits.find(d => d.position === field.position)?.digit || 0;
                  const userDigit = parseInt(answers[field.key] || '0');
                  const userValue = userDigit * field.multiplier;
                  const correctValue = correctDigit * field.multiplier;
                  
                  return (
                    <div key={field.key} className="verification-step">
                      <span className="step-number">{index + 1}.</span>
                      <span className="step-text">
                        {field.name}: {userDigit} × {field.multiplier.toLocaleString()} = {userValue.toLocaleString()}
                        {userDigit !== correctDigit && (
                          <span className="correction">
                            {' '}(should be {correctDigit} × {field.multiplier.toLocaleString()} = {correctValue.toLocaleString()})
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}
                
                <div className="verification-step final">
                  <span className="step-number">→</span>
                  <span className="step-text">
                    Total: {placeFields.map(field => {
                      const userDigit = parseInt(answers[field.key] || '0');
                      return `${userDigit} × ${field.multiplier.toLocaleString()}`;
                    }).join(' + ')} = {
                      placeFields.reduce((sum, field) => {
                        const userDigit = parseInt(answers[field.key] || '0');
                        return sum + (userDigit * field.multiplier);
                      }, 0).toLocaleString()
                    }
                  </span>
                </div>
                
                <div className="verification-step final correct-total">
                  <span className="step-number">✓</span>
                  <span className="step-text">
                    Correct total: {placeFields.map(field => {
                      const correctDigit = numberDigits.find(d => d.position === field.position)?.digit || 0;
                      return `${correctDigit} × ${field.multiplier.toLocaleString()}`;
                    }).join(' + ')} = {number.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Компонент для генерации случайных чисел
export const RandomPlaceValueExpansion = ({ min = 100, max = 999999 }) => {
  const generateRandomNumber = () => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const [randomNumber, setRandomNumber] = useState(generateRandomNumber());
  const [key, setKey] = useState(0);

  const handleNewQuestion = () => {
    setRandomNumber(generateRandomNumber());
    setKey(prev => prev + 1);
  };

  return (
    <div>
      <PlaceValueExpansion 
        key={key}
        number={randomNumber}
      />
      <div className="new-question-container">
        <button 
          className="crisp-button new-question-button"
          onClick={handleNewQuestion}
        >
          New Random Number
        </button>
        <div className="question-info">
          Current number: <strong>{randomNumber.toLocaleString()}</strong> 
          ({randomNumber.toString().length} digits, between {min.toLocaleString()} and {max.toLocaleString()})
        </div>
      </div>
    </div>
  );
};

export default PlaceValueExpansion;