import React, { useState, useEffect } from 'react';
import './ColumnArithmeticPuzzle.css';

interface ColumnArithmeticPuzzleProps {
  equation?: string;
  template?: string;
  title?: string;
  showHint?: boolean;
}

interface ParsedEquation {
  firstNumber: string;
  secondNumber: string;
  operator: string;
  result: string;
}

interface InputCell {
  index: number;
  correctValue: string;
  row: 'first' | 'second' | 'result';
  position: number;
}

interface TemplateParts {
  firstNumber: string;
  operator: string;
  secondNumber: string;
  equals: string;
  result: string;
}

interface ColumnCell {
  value: string;
  isInput: boolean;
  inputIndex: number;
  isEmpty: boolean;
  templateChar: string;
  isOperator?: boolean;
}

const ColumnArithmeticPuzzle: React.FC<ColumnArithmeticPuzzleProps> = ({ 
  equation = "594+160=754", 
  template = "__*+*_*=___",
  title = "Сложение в столбик",
  showHint = true
}) => {
  // Функция для нормализации операторов
  const normalizeEquation = (eq:string) => {
    return eq
      .replace(/x/gi, '×')      // заменяем x на ×
      .replace(/:/g, '÷');      // заменяем : на ÷
  };

  // Разбираем уравнение на части
  const parseEquation = (eq:string): ParsedEquation => {
    const normalizedEq = normalizeEquation(eq);
    const [leftSide, rightSide] = normalizedEq.split('=');
    let operator = '';
    let numbers: string[] = [];
    
    // Определяем оператор
    const operators = ['+', '-', '×', '÷'];
    for (const op of operators) {
      if (leftSide.includes(op)) {
        operator = op;
        numbers = leftSide.split(op);
        break;
      }
    }
    
    // Если оператор не найден, используем + по умолчанию
    if (!operator) {
      operator = '+';
      numbers = [leftSide, '0'];
    }
    
    return {
      firstNumber: numbers[0] || '',
      secondNumber: numbers[1] || '',
      operator,
      result: rightSide || ''
    };
  };

  // Создаем структуру для столбика с учетом шаблона
  const createColumnStructure = () => {
    const parsedEq = parseEquation(equation);
    const { firstNumber, secondNumber, operator, result } = parsedEq;
    
    // Определяем максимальную длину для выравнивания
    const maxLength = Math.max(
      firstNumber.length,
      secondNumber.length,
      result.length
    );
    
    // Распределяем шаблон по частям уравнения
    const templateParts: TemplateParts = {
      firstNumber: '',
      operator: '',
      secondNumber: '',
      equals: '',
      result: ''
    };
    
    let currentPos = 0;
    
    // Первое число
    for (let i = 0; i < firstNumber.length; i++) {
      if (currentPos < template.length) {
        templateParts.firstNumber += template[currentPos];
        currentPos++;
      }
    }
    
    // Оператор
    if (currentPos < template.length) {
      templateParts.operator = template[currentPos];
      currentPos++;
    }
    
    // Второе число
    for (let i = 0; i < secondNumber.length; i++) {
      if (currentPos < template.length) {
        templateParts.secondNumber += template[currentPos];
        currentPos++;
      }
    }
    
    // Знак равенства
    if (currentPos < template.length) {
      templateParts.equals = template[currentPos];
      currentPos++;
    }
    
    // Результат
    for (let i = 0; i < result.length; i++) {
      if (currentPos < template.length) {
        templateParts.result += template[currentPos];
        currentPos++;
      }
    }
    
    console.log('Template parts:', templateParts);
    
    // Создаем структуры для каждой строки столбика
    const firstRow: ColumnCell[] = [];
    const secondRow: ColumnCell[] = [];
    const resultRow: ColumnCell[] = [];
    
    const inputs: InputCell[] = [];
    let inputIndex = 0;
    
    // Первая строка: первое число (выровнено по правому краю)
    for (let i = 0; i < maxLength; i++) {
//      const posInFirstNum = maxLength - firstNumber.length + i;
      let digit = '';
      let isInput = false;
      let templateChar = '';
      
      if (i >= maxLength - firstNumber.length) {
        const digitIndex = i - (maxLength - firstNumber.length);
        digit = firstNumber[digitIndex];
        templateChar = templateParts.firstNumber[digitIndex];
        
        if (templateChar === '*') {
          isInput = true;
          inputs.push({
            index: inputIndex,
            correctValue: digit,
            row: 'first',
            position: digitIndex
          });
        }
      }
      
      firstRow.push({
        value: digit,
        isInput: isInput,
        inputIndex: isInput ? inputIndex : -1,
        isEmpty: digit === '',
        templateChar: templateChar
      });
      
      if (isInput) inputIndex++;
    }
    
    // Вторая строка: оператор + второе число
    // Добавляем оператор как отдельный элемент
    secondRow.push({
      value: operator,
      isInput: false,
      isOperator: true,
      inputIndex: -1,
      isEmpty: false,
      templateChar: templateParts.operator
    });
    
    // Добавляем цифры второго числа
    for (let i = 0; i < maxLength; i++) {
//      const posInSecondNum = maxLength - secondNumber.length + i;
      let digit = '';
      let isInput = false;
      let templateChar = '';
      
      if (i >= maxLength - secondNumber.length) {
        const digitIndex = i - (maxLength - secondNumber.length);
        digit = secondNumber[digitIndex];
        templateChar = templateParts.secondNumber[digitIndex];
        
        if (templateChar === '*') {
          isInput = true;
          inputs.push({
            index: inputIndex,
            correctValue: digit,
            row: 'second',
            position: digitIndex
          });
        }
      }
      
      secondRow.push({
        value: digit,
        isInput: isInput,
        inputIndex: isInput ? inputIndex : -1,
        isEmpty: digit === '',
        templateChar: templateChar
      });
      
      if (isInput) inputIndex++;
    }
    
    // Третья строка: результат
    for (let i = 0; i < maxLength; i++) {
//      const posInResult = maxLength - result.length + i;
      let digit = '';
      let isInput = false;
      let templateChar = '';
      
      if (i >= maxLength - result.length) {
        const digitIndex = i - (maxLength - result.length);
        digit = result[digitIndex];
        templateChar = templateParts.result[digitIndex];
        
        if (templateChar === '*') {
          isInput = true;
          inputs.push({
            index: inputIndex,
            correctValue: digit,
            row: 'result',
            position: digitIndex
          });
        }
      }
      
      resultRow.push({
        value: digit,
        isInput: isInput,
        inputIndex: isInput ? inputIndex : -1,
        isEmpty: digit === '',
        templateChar: templateChar
      });
      
      if (isInput) inputIndex++;
    }
    
    // Собираем правильные ответы в порядке появления
    const correctAnswers = inputs
      .sort((a, b) => a.index - b.index)
      .map(input => input.correctValue);
    
    return {
      rows: {
        first: firstRow,
        second: secondRow,
        result: resultRow
      },
      correctAnswers,
      inputCount: inputs.length,
      maxLength,
      parsedEquation: parsedEq,
      templateParts
    };
  };

  const { rows, correctAnswers, inputCount, maxLength, parsedEquation, templateParts } = createColumnStructure();
  
  const [inputs, setInputs] = useState<string[]>(Array(inputCount).fill(''));
  const [feedback, setFeedback] = useState<string[]>(Array(inputCount).fill(''));
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    checkAnswers();
    const allFilled = inputs.every(input => input.trim() !== '');
    setIsComplete(allFilled);
  }, [inputs]);

  const handleInputChange = (inputIndex: number, value: string) => {
    if (value.length <= 1 && /^[0-9]?$/.test(value)) {
      const newInputs = [...inputs];
      newInputs[inputIndex] = value;
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
      alert('Поздравляем! Все ответы верны! ✓');
    } else {
      const incorrectCount = inputs.filter((input, index) => 
        input !== '' && input !== correctAnswers[index]
      ).length;
      alert(`Есть ошибки. Неправильных ответов: ${incorrectCount}. Попробуйте ещё раз!`);
    }
  };

  const handleReset = () => {
    setInputs(Array(inputCount).fill(''));
    setFeedback(Array(inputCount).fill(''));
    setIsComplete(false);
  };

  const handleAutoFill = () => {
    setInputs([...correctAnswers]);
  };

  // Рендерим столбик
  const renderColumn = () => {
    return (
      <div className="column-puzzle">
        <div className="column-display">
          {/* Первая строка - первое число */}
          <div className="column-row first-row">
            <div className="column-cell operator-space"></div>
            {rows.first.map((cell, index) => (
              <div key={`first-${index}`} className="column-cell">
                {cell.isInput ? (
                  <input
                    type="text"
                    className={`column-input ${feedback[cell.inputIndex]}`}
                    value={inputs[cell.inputIndex] || ''}
                    onChange={(e) => handleInputChange(cell.inputIndex, e.target.value)}
                    maxLength={1}
                    placeholder="?"
                  />
                ) : cell.isEmpty ? (
                  <span className="empty-digit"></span>
                ) : (
                  <span className="display-digit">
                    {cell.value}
                  </span>
                )}
              </div>
            ))}
          </div>
          
          {/* Вторая строка - оператор и второе число */}
          <div className="column-row second-row">
            {rows.second.map((cell, index) => (
              <div key={`second-${index}`} className="column-cell">
                {cell.isOperator ? (
                  <span className="operator-display">
                    {cell.value}
                  </span>
                ) : cell.isInput ? (
                  <input
                    type="text"
                    className={`column-input ${feedback[cell.inputIndex]}`}
                    value={inputs[cell.inputIndex] || ''}
                    onChange={(e) => handleInputChange(cell.inputIndex, e.target.value)}
                    maxLength={1}
                    placeholder="?"
                  />
                ) : cell.isEmpty ? (
                  <span className="empty-digit"></span>
                ) : (
                  <span className="display-digit">
                    {cell.value}
                  </span>
                )}
              </div>
            ))}
          </div>
          
          {/* Линия под вторым числом */}
          <div className="column-row line-row">
            <div className="column-cell operator-space"></div>
            {Array(maxLength).fill(0).map((_, index) => (
              <div key={`line-${index}`} className="column-cell">
                <div className="underline"></div>
              </div>
            ))}
          </div>
          
          {/* Третья строка - результат */}
          <div className="column-row third-row">
            <div className="column-cell operator-space"></div>
            {rows.result.map((cell, index) => (
              <div key={`third-${index}`} className="column-cell">
                {cell.isInput ? (
                  <input
                    type="text"
                    className={`column-input ${feedback[cell.inputIndex]}`}
                    value={inputs[cell.inputIndex] || ''}
                    onChange={(e) => handleInputChange(cell.inputIndex, e.target.value)}
                    maxLength={1}
                    placeholder="?"
                  />
                ) : cell.isEmpty ? (
                  <span className="empty-digit"></span>
                ) : (
                  <span className="display-digit">
                    {cell.value}
                  </span>
                )}
              </div>
            ))}
          </div>
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
          <button 
            onClick={handleAutoFill}
            className="hint-button"
          >
            Показать ответ
          </button>
        </div>

        {isComplete && (
          <div className="feedback">
            <p>✓ Все поля заполнены! Нажмите "Проверить" для проверки ответов.</p>
          </div>
        )}
      </div>
    );
  };

  // Функция для отображения шаблона
  const renderTemplateExplanation = () => {
    const { firstNumber, secondNumber, result } = parsedEquation;
    
    // Визуализируем шаблон
/*    const templateVisual = template.split('').map((char, index) => {
      if (char === '*') {
        return <span key={index} className="template-star">*</span>;
      } else if (char === '_') {
        return <span key={index} className="template-underscore">_</span>;
      } else {
        return <span key={index} className="template-char">{char}</span>;
      }
    });
  */  
    // Разбиваем шаблон на логические части
    const templateAnalysis = [];
    let currentPart = '';
    let currentType = '';
    
    for (let i = 0; i < template.length; i++) {
      const char = template[i];
      if (char === '*' || char === '_') {
        if (currentType === 'digit') {
          currentPart += char;
        } else {
          if (currentPart) templateAnalysis.push({ type: currentType, value: currentPart });
          currentPart = char;
          currentType = 'digit';
        }
      } else {
        if (currentType === 'operator') {
          currentPart += char;
        } else {
          if (currentPart) templateAnalysis.push({ type: currentType, value: currentPart });
          currentPart = char;
          currentType = 'operator';
        }
      }
    }
    if (currentPart) templateAnalysis.push({ type: currentType, value: currentPart });
    
    return (
      <div className="template-explanation">
        <h4>Разбор шаблона:</h4>
        <div className="template-visual">
          <div className="template-string">
            <code>{template}</code>
          </div>
          <div className="template-parts">
            {templateAnalysis.map((part, index) => (
              <div key={index} className={`template-part ${part.type}`}>
                <span className="part-value">{part.value}</span>
                <span className="part-desc">
                  {part.type === 'digit' ? (
                    part.value.includes('*') ? 'пропущенные цифры' : 'известные цифры'
                  ) : (
                    part.value === '+' ? 'оператор сложения' :
                    part.value === '-' ? 'оператор вычитания' :
                    part.value === '×' ? 'оператор умножения' :
                    part.value === '÷' ? 'оператор деления' :
                    part.value === '=' ? 'знак равенства' : 'оператор'
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="template-mapping">
          <h5>Соответствие шаблона уравнению:</h5>
          <div className="mapping-row">
            <div className="mapping-label">Первое число ({firstNumber}):</div>
            <div className="mapping-value">
              {templateParts.firstNumber.split('').map((char, i) => (
                <span key={i} className={`mapping-char ${char === '*' ? 'missing' : 'known'}`}>
                  {char === '*' ? '□' : firstNumber[i]}
                </span>
              ))}
            </div>
          </div>
          <div className="mapping-row">
            <div className="mapping-label">Оператор:</div>
            <div className="mapping-value">
              <span className="mapping-char operator">
                {templateParts.operator === '*' ? '□' : parsedEquation.operator}
              </span>
            </div>
          </div>
          <div className="mapping-row">
            <div className="mapping-label">Второе число ({secondNumber}):</div>
            <div className="mapping-value">
              {templateParts.secondNumber.split('').map((char, i) => (
                <span key={i} className={`mapping-char ${char === '*' ? 'missing' : 'known'}`}>
                  {char === '*' ? '□' : secondNumber[i]}
                </span>
              ))}
            </div>
          </div>
          <div className="mapping-row">
            <div className="mapping-label">Знак равенства:</div>
            <div className="mapping-value">
              <span className="mapping-char equals">
                {templateParts.equals === '*' ? '□' : '='}
              </span>
            </div>
          </div>
          <div className="mapping-row">
            <div className="mapping-label">Результат ({result}):</div>
            <div className="mapping-value">
              {templateParts.result.split('').map((char, i) => (
                <span key={i} className={`mapping-char ${char === '*' ? 'missing' : 'known'}`}>
                  {char === '*' ? '□' : result[i]}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="column-puzzle-container">
      <h2>{title}</h2>
      <p className="instructions">
        Введите пропущенные цифры в соответствующие ячейки:
      </p>
      {renderColumn()}
      
      {showHint && (
        <div className="hint">
          <div className="correct-equation">
            <h4>Правильное уравнение:</h4>
            <p className="equation-text">
              {parsedEquation.firstNumber} {parsedEquation.operator} {parsedEquation.secondNumber} = {parsedEquation.result}
            </p>
          </div>
          
          {renderTemplateExplanation()}
          
          <div className="legend">
            <div className="legend-item">
              <div className="legend-icon missing">□</div>
              <span>Пропущенная цифра (символ * в шаблоне)</span>
            </div>
            <div className="legend-item">
              <div className="legend-icon known">▣</div>
              <span>Известная цифра (символ _ в шаблоне)</span>
            </div>
            <div className="legend-item">
              <div className="legend-icon operator">+</div>
              <span>Оператор или знак равенства</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="puzzle-info">
        <h4>Как это работает:</h4>
        <p>Уравнение отображается в столбик. Цифры выровнены по правому краю.</p>
        <p>Количество пропущенных цифр: <strong>{inputCount}</strong></p>
        <p>Шаблон <code>{template}</code> определяет, какие цифры нужно ввести.</p>
      </div>
    </div>
  );
};

export default ColumnArithmeticPuzzle;