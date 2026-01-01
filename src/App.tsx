import { useState } from 'react'
import ArithmeticPuzzle from './ArithmeticPuzzle'
import ColumnArithmeticPuzzle from './ColumnArithmeticPuzzle'
import PlaceValuePuzzle from './PlaceValuePuzzle'
import './App.css'
import PlaceValueGame from './PlaceValueGame'
import IXLMathQuestion from './IXLMathQuestion'
import UnderlinedDigitQuestion from './UnderlinedDigitQuestion'
import PlaceValueReport from './PlaceValueReport'
import PlaceValueEquation from './PlaceValueEquation'

function App() {
  const [count, setCount] = useState(0)

  return ( // проблемы со стилями, надо бы поправить
    <> 
        <div className="App">
      {/* Пример 1: Статичное число */}
      <PlaceValueEquation correctAnswer={527} />
      
      {/* Пример 2: Другое число */}
      <PlaceValueEquation correctAnswer={384} />
      
      {/* Пример 3: Большее число */}
      <PlaceValueEquation correctAnswer={1234} />
      
     
      {/* Пример 5: Число с нулями */}
      <PlaceValueEquation correctAnswer={7006} />
      
      {/* Пример 6: Однозначное число */}
      <PlaceValueEquation correctAnswer={5} />
    </div>
 
    <div className="App">
      {/* Базовый пример */}
      <PlaceValueReport 
        number="18,084"
        underlinedIndex={2}
      />
      
      {/* Пример с другим числом */}
      <PlaceValueReport 
        number="32,567"
        underlinedIndex={0} // Цифра 3 в ten-thousands
      />
      
      {/* Без таблицы */}
      <PlaceValueReport 
        number="9,876"
        underlinedIndex={1} // Цифра 8 в сотнях
        showTable={false}
      />
      
      {/* Только объяснение */}
      <PlaceValueReport 
        number="123,456"
        underlinedIndex={4} // Цифра 5 в десятках
        showTable={false}
        showExplanation={true}
      />
    </div>
    <div className="App">
      {/* Пример 1: Оригинальный вопрос */}
      <UnderlinedDigitQuestion 
        number="18,084"
        underlinedIndex={3} // Цифра 8
        correctAnswer={80}
      />
      
      {/* Пример 2: Другой вопрос */}
      <UnderlinedDigitQuestion 
        number="3,456,789"
        underlinedIndex={4} // Цифра 6 в сотнях
        correctAnswer={600}
      />
      
      {/* Пример 3: С предустановленным ответом */}
      <UnderlinedDigitQuestion 
        number="92,015"
        underlinedIndex={1} // Цифра 2 в тысячах
        correctAnswer={2000}
      />
      
      {/* Пример 4: Простое число */}
      <UnderlinedDigitQuestion 
        number="456"
        underlinedIndex={1} // Цифра 5 в десятках
        correctAnswer={50}
      />
    </div>
    <div className="App">
      <IXLMathQuestion 
        numbers={["23704", "71380", "80467", "7140"]}
        targetDigit={7}
        correctIndex={1}
      />
    </div>
    <div className="App">
      <IXLMathQuestion 
        numbers={["11511", "1151", "11115", "51111"]}
        targetDigit={5}
        correctIndex={3}
      />
    </div>
    <div className="App">
      <IXLMathQuestion 
        numbers={["123456", "34567", "4567", "6543"]}
        targetDigit={6}
        correctIndex={2}
      />
    </div>
      <div className="App">
        <PlaceValueGame targetNumber={4} />
      </div>
      <div className="App">
        <PlaceValuePuzzle 
          number="8563"
          targetDigit="6"
          question="Where is the digit?"
          options={["ones place", "tens place", "hundreds place", "thousands place"]}
        />
      </div>
      <div className="App">
        <PlaceValuePuzzle 
          number="13245"
          targetDigit="3"
          question="Where is the digit?"
          options={["ones place", "ten thousands place", "hundreds place", "thousands place"]}
        />
      </div>

      <div className="App">
        <PlaceValuePuzzle 
          number="31234"
          targetDigit="1"
          question="Where is the digit?"
          options={["ones place", "tens place", "hundreds place", "thousands place"]}
        />
      </div>


      <div className="App">
        <ColumnArithmeticPuzzle 
          equation="594+160=754"
          template="_*_+*_*=___"
          title="Сложение в столбик"
        />
      </div>
      <div className="App">
        <ColumnArithmeticPuzzle 
          equation="594-160=434"
          template="_*_-*_*=___"
          title="Вычитание в столбик"
        />
      </div>
      <div className="App">
        <ColumnArithmeticPuzzle 
          equation="320:160=2"
          template="_*_:*_*=___"
          title="Деление в столбик"
        />
      </div>
      <div className="App">
        <ColumnArithmeticPuzzle 
          equation="594X160=95040"
          template="_*_X*_*=_____"
          title="Умножение в столбик"
        />
      </div>
    </>
  )
}

export default App
