import { useState } from 'react';
import './UnderlinedDigitQuestion.css';

interface UnderlinedDigitQuestionProps {
  number?: string;
  underlinedIndex?: number;
  correctAnswer?: number | null;
}

interface FormattedPart {
  type: 'digit' | 'comma';
  value: string;
  isUnderlined?: boolean;
}

const UnderlinedDigitQuestion: React.FC<UnderlinedDigitQuestionProps> = ({ 
  number = "18,084",
  underlinedIndex = 2 // Индекс подчеркнутой цифры (0-based, считая слева без запятых)
}) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  // Парсим число, убирая запятые
  const cleanNumber = number.replace(/,/g, '');
  const underlinedDigit = cleanNumber[underlinedIndex];

  // Вычисляем значение подчеркнутой цифры
  const calculateDigitValue = () => {
    const positionFromRight = cleanNumber.length - 1 - underlinedIndex;
    return parseInt(underlinedDigit) * Math.pow(10, positionFromRight);
  };

  const actualCorrectAnswer = calculateDigitValue();

  const handleSubmit = (e: React.FormEvent) => {
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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Разрешаем только цифры и Backspace
    if (!/[0-9]|Backspace|Delete|ArrowLeft|ArrowRight|Tab/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Убираем все нецифровые символы
    const value = e.target.value.replace(/\D/g, '');
    setUserAnswer(value);
  };

  const formatNumberForDisplay = (): FormattedPart[] => {
    // Разбиваем число на части для отображения с подчеркиванием
    const parts: FormattedPart[] = [];
    let currentIndex = 0;
    
    for (let i = 0; i < number.length; i++) {
      const char = number[i];
      
      if (char === ',') {
        parts.push({ type: 'comma', value: ',' });
      } else {
        const digitIndex = currentIndex;
        const isUnderlined = digitIndex === underlinedIndex;
        
        parts.push({ 
          type: 'digit', 
          value: char, 
          isUnderlined 
        });
        currentIndex++;
      }
    }
    
    return parts;
  };

  const formattedNumber = formatNumberForDisplay();

  return (
    <div className="snt-question-container">
      <section className="question-and-submission-view fade-in" aria-label="question">
        <section className="snt-practice-crate">
          <input type="hidden" name="randomSeed" value="-6850385953813826295" />
          
          <div className="math-section">
            <div className="section-header">
              <span className="text">What</span>
              <span className="text"> is the value of the underlined </span>
              <span className="text">digit?</span>
            </div>
            
            <div className="section-content">
              <div className="content-piece number-display">
                <span className="decimal-scalar important">
                  <span className="expression number">
                    {formattedNumber.map((part, index) => {
                      if (part.type === 'comma') {
                        return (
                          <span key={index} className="digit-group-separator">
                            {part.value}
                          </span>
                        );
                      } else {
                        return (
                          <span 
                            key={index} 
                            className={`digit ${part.isUnderlined ? 'underlined' : ''}`}
                          >
                            {part.value}
                          </span>
                        );
                      }
                    })}
                  </span>
                </span>
              </div>
              
              <div className="content-piece answer-input-container">
                <input
                  type="text"
                  className="fill-in-input"
                  spellCheck="false"
                  value={userAnswer}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyPress}
                  disabled={isSubmitted}
                  placeholder="Enter value"
                  aria-label="Enter the value of the underlined digit"
                  style={{ width: '85px' }}
                />
                
                {showFeedback && (
                  <div className={`feedback-message ${parseInt(userAnswer) === actualCorrectAnswer ? 'correct' : 'incorrect'}`}>
                    <span className="feedback-icon">
                      {parseInt(userAnswer) === actualCorrectAnswer ? '✓' : '✗'}
                    </span>
                    <span className="feedback-text">
                      {parseInt(userAnswer) === actualCorrectAnswer 
                        ? `Correct! The underlined digit ${underlinedDigit} represents ${actualCorrectAnswer}`
                        : `Try again. Remember: ${underlinedDigit} in the ${getPositionName(underlinedIndex, cleanNumber.length)} place = ${actualCorrectAnswer}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
        
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
      </section>

      {/* Explanation Panel */}
      {isSubmitted && !showFeedback && (
        <div className="explanation-panel">
          <div className="explanation-content">
            <h3>Understanding Place Value</h3>
            
            <div className="place-value-breakdown">
              <div className="number-breakdown">
                <div className="breakdown-header">
                  Number: <strong>{number}</strong>
                </div>
                
                <div className="place-value-grid">
                  {cleanNumber.split('').map((digit, index) => {
                    const positionFromRight = cleanNumber.length - 1 - index;
                    const value = parseInt(digit) * Math.pow(10, positionFromRight);
                    const isCurrent = index === underlinedIndex;
                    
                    return (
                      <div 
                        key={index} 
                        className={`place-value-item ${isCurrent ? 'highlighted' : ''}`}
                      >
                        <div className="digit-display">
                          <span className={`digit ${isCurrent ? 'underlined' : ''}`}>
                            {digit}
                          </span>
                        </div>
                        <div className="position-info">
                          {getPositionName(index, cleanNumber.length)}
                        </div>
                        <div className="value-info">
                          = {value.toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="answer-summary">
                <p>
                  The underlined digit <strong>{underlinedDigit}</strong> is in the 
                  <strong> {getPositionName(underlinedIndex, cleanNumber.length)}</strong> place.
                </p>
                <p className="calculation">
                  {underlinedDigit} × 10<sup>{cleanNumber.length - 1 - underlinedIndex}</sup> = {actualCorrectAnswer}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Вспомогательная функция для получения названия позиции
const getPositionName = (index: number, length: number): string => {
  const positionsFromRight = length - 1 - index;
  
  switch (positionsFromRight) {
    case 0: return 'ones';
    case 1: return 'tens';
    case 2: return 'hundreds';
    case 3: return 'thousands';
    case 4: return 'ten thousands';
    case 5: return 'hundred thousands';
    case 6: return 'millions';
    default: return `10^${positionsFromRight}`;
  }
};

export default UnderlinedDigitQuestion;