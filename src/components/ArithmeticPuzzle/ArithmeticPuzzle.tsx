import React, { useState, useEffect } from 'react';
import './ArithmeticPuzzle.css';

const ArithmeticPuzzle = ({ 
  equation = "594+160=754", 
  template = "__*+*_*=___",
  title = "Заполните пропущенные цифры",
  showHint = true
}) => {
  // Разбираем уравнение на части
  const parseEquation = (eq) => {
    // Ищем знак равенства
    const [leftSide, rightSide] = eq.split('=');
    
    // Ищем знак операции в левой части
    let operator = '';
    let numbers = [];
    
    if (leftSide.includes('+')) {
      operator = '+';
      numbers = leftSide.split('+');
    } else if (leftSide.includes('-')) {
      operator = '-';
      numbers = leftSide.split('-');
    } else if (leftSide.includes('×') || leftSide.includes('*')) {
      operator = '×';
      const op = leftSide.includes('×') ? '×' : '*';
      numbers = leftSide.split(op);
    } else if (leftSide.includes('÷') || leftSide.includes('/')) {
      operator = '÷';
      const op = leftSide.includes('÷') ? '÷' : '/';
      numbers = leftSide.split(op);
    }
    
    return {
      firstNumber: numbers[0] || '',
      secondNumber: numbers[1] || '',
      operator,
      result: rightSide || ''
    };
  };

  // Создаем структуру на основе шаблона
  const createPuzzleStructure = () => {
    const parsedEq = parseEquation(equation);
    const { firstNumber, secondNumber, operator, result } = parsedEq;
    
    const templateChars = template.split('');
    
    let currentPos = 0;
    let inputsCount = 0;
    const structure = [];
    
    // Функция для создания элемента
    const createElement = (char, type, value = '') => {
      if (type === 'input') {
        const index = inputsCount;
        inputsCount++;
        return {
          type: 'input',
          index,
          correctValue: value,
          position: currentPos
        };
      } else {
        return {
          type: 'display',
          value: char,
          position: currentPos
        };
      }
    };
    
    // Обрабатываем шаблон
    for (let i = 0; i < templateChars.length; i++) {
      const char = templateChars[i];
      
      if (char === '*') {
        // Находим, какой символ должен быть здесь в уравнении
        let value = '';
        if (currentPos < firstNumber.length) {
          value = firstNumber[currentPos];
        } else if (currentPos === firstNumber.length) {
          value = operator;
        } else if (currentPos <= firstNumber.length + 1 + secondNumber.length) {
          const posInSecondNum = currentPos - firstNumber.length - 1;
          if (posInSecondNum >= 0 && posInSecondNum < secondNumber.length) {
            value = secondNumber[posInSecondNum];
          } else if (posInSecondNum === secondNumber.length) {
            value = '=';
          }
        } else {
          const posInResult = currentPos - firstNumber.length - 1 - secondNumber.length - 1;
          if (posInResult >= 0 && posInResult < result.length) {
            value = result[posInResult];
          }
        }
        
        structure.push(createElement('*', 'input', value));
        currentPos++;
      } else if (char === '_') {
        // Отображаемый символ из уравнения
        let value = '';
        if (currentPos < firstNumber.length) {
          value = firstNumber[currentPos];
        } else if (currentPos === firstNumber.length) {
          value = operator;
        } else if (currentPos <= firstNumber.length + 1 + secondNumber.length) {
          const posInSecondNum = currentPos - firstNumber.length - 1;
          if (posInSecondNum >= 0 && posInSecondNum < secondNumber.length) {
            value = secondNumber[posInSecondNum];
          } else if (posInSecondNum === secondNumber.length) {
            value = '=';
          }
        } else {
          const posInResult = currentPos - firstNumber.length - 1 - secondNumber.length - 1;
          if (posInResult >= 0 && posInResult < result.length) {
            value = result[posInResult];
          }
        }
        
        structure.push(createElement(value, 'display'));
        currentPos++;
      } else {
        // Любой другой символ в шаблоне (например, пробелы)
        structure.push(createElement(char, 'display'));
      }
    }
    
    // Собираем правильные ответы
    const correctAnswers = structure
      .filter(item => item.type === 'input')
      .map(item => item.correctValue);
    
    return { structure, correctAnswers, inputsCount };
  };

  const { structure, correctAnswers, inputsCount } = createPuzzleStructure();
  
  const [inputs, setInputs] = useState(Array(inputsCount).fill(''));
  const [feedback, setFeedback] = useState(Array(inputsCount).fill(''));
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    checkAnswers();
    const allFilled = inputs.every(input => input.trim() !== '');
    setIsComplete(allFilled);
  }, [inputs]);

  const handleInputChange = (index, value) => {
    if (value.length <= 1 && /^[0-9+\-×÷=*/]?$/.test(value)) {
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
      const incorrectCount = inputs.filter((input, index) => 
        input !== '' && input !== correctAnswers[index]
      ).length;
      alert(`Есть ошибки. Неправильных ответов: ${incorrectCount}. Попробуйте ещё раз!`);
    }
  };

  const handleReset = () => {
    setInputs(Array(inputsCount).fill(''));
    setFeedback(Array(inputsCount).fill(''));
    setIsComplete(false);
  };

  // Визуальное представление уравнения
  const renderEquation = () => {
    let inputIndex = 0;
    
    return (
      <div className="arithmetic-puzzle">
        <div className="equation-display">
          {structure.map((item, index) => {
            if (item.type === 'input') {
              const currentIndex = inputIndex;
              inputIndex++;
              
              return (
                <input
                  key={`input-${index}`}
                  type="text"
                  className={`fill-in-input ${feedback[currentIndex]}`}
                  value={inputs[currentIndex]}
                  onChange={(e) => handleInputChange(currentIndex, e.target.value)}
                  maxLength="1"
                  placeholder="?"
                />
              );
            } else {
              return (
                <span 
                  key={`display-${index}`}
                  className="display-char"
                >
                  {item.value}
                </span>
              );
            }
          })}
        </div>

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

  // Разбиваем шаблон для отображения подсказки
  const formatHint = () => {
    const parsedEq = parseEquation(equation);
    return `${parsedEq.firstNumber} ${parsedEq.operator} ${parsedEq.secondNumber} = ${parsedEq.result}`;
  };

  return (
    <div className="puzzle-container">
      <h2>{title}</h2>
      <p className="instructions">
        Введите пропущенные цифры так, чтобы равенство стало верным:
      </p>
      {renderEquation()}
      
      {showHint && (
        <div className="hint">
          <p>Правильное уравнение: <strong>{formatHint()}</strong></p>
          <p>Шаблон: <code>{template}</code> (где * — пропущенные цифры)</p>
        </div>
      )}
      
      <div className="puzzle-info">
        <p>Всего пропущено цифр: {inputsCount}</p>
        <p>Пример использования разных шаблонов:</p>
        <ul>
          <li><code>"__*+*_*=___"</code> — пропущены 2 цифры во втором числе</li>
          <li><code>"_*_+***=___"</code> — пропущены 3 цифры</li>
          <li><code>"***+***=***"</code> — пропущены все цифры</li>
        </ul>
      </div>
    </div>
  );
};

// Примеры использования компонента
export const PuzzleExamples = () => {
  const puzzles = [
    {
      equation: "594+160=754",
      template: "__*+*_*=___",
      title: "Задача 1: Сложение"
    },
    {
      equation: "732-185=547",
      template: "_*_-_**=___",
      title: "Задача 2: Вычитание"
    },
    {
      equation: "23×4=92",
      template: "_**×*=_**",
      title: "Задача 3: Умножение"
    },
    {
      equation: "84÷7=12",
      template: "*_÷_=_**",
      title: "Задача 4: Деление"
    }
  ];

  return (
    <div className="puzzles-container">
      {puzzles.map((puzzle, index) => (
        <div key={index} className="puzzle-wrapper">
          <ArithmeticPuzzle
            equation={puzzle.equation}
            template={puzzle.template}
            title={puzzle.title}
            showHint={false}
          />
        </div>
      ))}
    </div>
  );
};

export default ArithmeticPuzzle;