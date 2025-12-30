import { useState } from 'react'
import ArithmeticPuzzle from './ArithmeticPuzzle'
import ColumnArithmeticPuzzle from './ColumnArithmeticPuzzle'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
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
          equation="594X160=95040"
          template="_*_X*_*=_____"
          title="Умножение в столбик"
        />
      </div>
    </>
  )
}

export default App
