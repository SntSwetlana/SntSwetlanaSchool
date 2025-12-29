import React, { useState, useEffect } from 'react';
import './ArithmeticPuzzle.css';

const ArithmeticPuzzle = () => {
  const [inputs, setInputs] = useState(['', '', '']);
  const [correctAnswers, setCorrectAnswers] = useState(['9', '1', '0']);
  const [feedback, setFeedback] = useState(['', '', '']);
  const [isComplete, setIsComplete] = useState(false);

  // Проверка при каждом изменении ввода
  useEffect(() => {
    checkAnswers();
    const allFilled = inputs.every(input => input.trim() !== '');
    setIsComplete(allFilled);
  }, [inputs]);

  const handleInputChange = (index, value) => {
    // Ограничиваем ввод одной цифрой
    if (value.length <= 1 && /^\d?$/.test(value)) {
      const newInputs = [...inputs];
      newInputs[index] = value;
      setInputs(newInputs);
    }
  };

  const checkAnswers = () => {
    const newFeedback = inputs.map((input, index) => {
      if (input === '') return '';
      return input === correctAnswers[index] 
        ? 'correct' 
        : 'incorrect';
    });
    setFeedback(newFeedback);
  };

  const handleSubmit = () => {
    const allCorrect = inputs.every((input, index) => input === correctAnswers[index]);
    
    if (allCorrect) {
      alert('Поздравляем! Все ответы верны!');
    } else {
      alert('Есть ошибки. Попробуйте ещё раз!');
    }
  };

  const handleReset = () => {
    setInputs(['', '', '']);
    setFeedback(['', '', '']);
    setIsComplete(false);
  };

  // Визуальное представление с пустыми местами для ввода
  const renderEquation = () => {
    return (
      <div className="arithmetic-puzzle">
        <table className="equation-table">
          <tbody>
            {/* Первая строка: 5 _ 4 */}
            <tr>
              <td></td>
              <td className="number-cell">5</td>
              <td className="input-cell">
                <input
                  type="text"
                  className={`fill-in-input ${feedback[0]}`}
                  value={inputs[0]}
                  onChange={(e) => handleInputChange(0, e.target.value)}
                  maxLength="1"
                />
              </td>
              <td className="number-cell">4</td>
            </tr>
            
            {/* Вторая строка: + _ 6 _ */}
            <tr>
              <td className="operator-cell">+</td>
              <td className="input-cell">
                <input
                  type="text"
                  className={`fill-in-input ${feedback[1]}`}
                  value={inputs[1]}
                  onChange={(e) => handleInputChange(1, e.target.value)}
                  maxLength="1"
                />
              </td>
              <td className="number-cell">6</td>
              <td className="input-cell">
                <input
                  type="text"
                  className={`fill-in-input ${feedback[2]}`}
                  value={inputs[2]}
                  onChange={(e) => handleInputChange(2, e.target.value)}
                  maxLength="1"
                />
              </td>
            </tr>
            
            {/* Разделительная линия */}
            <tr>
              <td colSpan="4" className="divider-line"></td>
            </tr>
            
            {/* Третья строка: 7 5 4 */}
            <tr>
              <td></td>
              <td className="number-cell">7</td>
              <td className="number-cell">5</td>
              <td className="number-cell">4</td>
            </tr>
          </tbody>
        </table>

        <div className="controls">
          <button 
            onClick={handleSubmit} 
            disabled={!isComplete}
            className="submit-button"
          >
            Проверить
          </button>
          <button 
            onClick={handleReset}
            className="reset-button"
          >
            Сбросить
          </button>
        </div>

        {isComplete && (
          <div className="feedback">
            <p>Все поля заполнены! Нажмите "Проверить" для проверки ответов.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="puzzle-container">
      <h2>Заполните пропущенные цифры</h2>
      <p className="instructions">
        Введите пропущенные цифры так, чтобы равенство стало верным:
      </p>
      {renderEquation()}
      <div className="hint">
        <p>Подсказка: 594 + 160 = 754</p>
      </div>
    </div>
  );
};

export default ArithmeticPuzzle;