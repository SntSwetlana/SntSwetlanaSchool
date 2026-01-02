import React from 'react';
import './PlaceValueReport.css';

const PlaceValueReport = ({ 
  number = "18,084",
  underlinedIndex = 2, // индекс цифры 8 (0-based слева направо без запятых)
  showTable = true,
  showExplanation = true
}) => {
  // Парсим число, убирая запятые
  const cleanNumber = number.replace(/,/g, '');
  const underlinedDigit = cleanNumber[underlinedIndex];
  
  // Вычисляем значение подчеркнутой цифры
  const positionFromRight = cleanNumber.length - 1 - underlinedIndex;
  const digitValue = parseInt(underlinedDigit) * Math.pow(10, positionFromRight);
  
  // Получаем название позиции
  const getPositionName = () => {
    switch (positionFromRight) {
      case 0: return 'ones';
      case 1: return 'tens';
      case 2: return 'hundreds';
      case 3: return 'thousands';
      case 4: return 'ten-thousands';
      case 5: return 'hundred-thousands';
      default: return `${positionFromRight} place`;
    }
  };
  
  const positionName = getPositionName();
  
  // Форматируем число для таблицы
  const formatForTable = () => {
    const positions = [];
    let currentNumber = cleanNumber;
    
    // Дополняем нулями слева до 5 разрядов (максимум для таблицы)
    while (currentNumber.length < 5) {
      currentNumber = '0' + currentNumber;
    }
    
    // Создаем позиции справа налево
    const positionNames = ['ones', 'tens', 'hundreds', 'thousands', 'ten-thousands'];
    
    for (let i = currentNumber.length - 1, j = 0; i >= 0; i--, j++) {
      const digit = currentNumber[i];
      const isUnderlined = (currentNumber.length - 1 - i) === positionFromRight;
      
      positions.unshift({
        digit,
        position: positionNames[j] || `${j + 1} place`,
        isUnderlined
      });
    }
    
    return positions;
  };
  
  const tableData = formatForTable();

  return (
    <div className="place-value-report">
      <div className="report-header">
        <h2>Place Value Analysis</h2>
        <div className="number-display">
          Number: <span className="original-number">{number}</span>
        </div>
      </div>
      
      {showTable && (
        <div className="place-value-table-section">
          <div className="table-header">
            Write the number in a place-value chart.
          </div>
          
          <div className="place-value-table">
            <div className="table-row header-row">
              <div className="cell">ten-thousands</div>
              <div className="cell">thousands</div>
              <div className="cell">hundreds</div>
              <div className="cell">tens</div>
              <div className="cell">ones</div>
            </div>
            
            <div className="table-row data-row">
              {tableData.map((item, index) => (
                <div key={index} className={`cell ${item.isUnderlined ? 'underlined' : ''}`}>
                  {item.digit}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {showExplanation && (
        <div className="explanation-section">
          <div className="explanation-text">
            <p>
              The underlined digit is the <strong>{underlinedDigit}</strong> in the{' '}
              <strong className="highlight">{positionName}</strong> place.
            </p>
            <p>
              It is worth <strong>{underlinedDigit} {positionName.replace('-', ' ')}</strong>.
            </p>
            <div className="value-result">
              Its value is <strong className="final-value">{digitValue.toLocaleString()}</strong>.
            </div>
          </div>
          
          <div className="calculation-breakdown">
            <div className="breakdown-header">Calculation:</div>
            <div className="formula">
              {underlinedDigit} × 10<sup>{positionFromRight}</sup> = {digitValue.toLocaleString()}
            </div>
          </div>
        </div>
      )}
      
      <div className="additional-info">
        <div className="full-breakdown">
          <div className="breakdown-header">Complete breakdown of {number}:</div>
          <div className="breakdown-items">
            {cleanNumber.split('').map((digit, index) => {
              const pos = cleanNumber.length - 1 - index;
              const value = parseInt(digit) * Math.pow(10, pos);
              const posName = getPositionNameForIndex(pos);
              
              return (
                <div key={index} className={`breakdown-item ${index === underlinedIndex ? 'highlighted' : ''}`}>
                  <span className="digit">{digit}</span>
                  <span className="multiplier"> × 10<sup>{pos}</sup></span>
                  <span className="equals"> = </span>
                  <span className="value">{value.toLocaleString()}</span>
                  <span className="position"> ({posName})</span>
                </div>
              );
            })}
          </div>
          
          <div className="total-sum">
            Total: {cleanNumber.split('').reduce((sum, digit, index) => {
              const pos = cleanNumber.length - 1 - index;
              return sum + parseInt(digit) * Math.pow(10, pos);
            }, 0).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

// Вспомогательная функция для получения названия позиции по индексу
const getPositionNameForIndex = (positionFromRight) => {
  switch (positionFromRight) {
    case 0: return 'ones';
    case 1: return 'tens';
    case 2: return 'hundreds';
    case 3: return 'thousands';
    case 4: return 'ten-thousands';
    case 5: return 'hundred-thousands';
    default: return `${positionFromRight}th place`;
  }
};

export default PlaceValueReport;