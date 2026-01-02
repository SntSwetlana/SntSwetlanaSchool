import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

import { 
  HomePage, 
  PlaceValueNamesPage, 
  ValueOfDigitPage, 
  ConvertToFromNumberPage 
} from './components/Pages';

function App() {
  return (
    <Router>
      <div className="App">
        {/* Навигационная панель (опционально) */}
        <nav className="main-nav">
          <div className="nav-container">
            <Link to="/" className="nav-logo">
              Math Grade 3
            </Link>
            <div className="nav-links">
              <Link to="/math/grade3/place_value_names_up_to_ten_thousands">
                Place Value Names
              </Link>
              <Link to="/math/grade3/value_of_a_digit_up_to_ten_thousands">
                Value of a Digit
              </Link>
              <Link to="/math/grade3/convert_to_from_a_number">
                Convert Numbers
              </Link>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route 
            path="/math/grade3/place_value_names_up_to_ten_thousands" 
            element={<PlaceValueNamesPage />} 
          />
          <Route 
            path="/math/grade3/value_of_a_digit_up_to_ten_thousands" 
            element={<ValueOfDigitPage />} 
          />
          <Route 
            path="/math/grade3/convert_to_from_a_number" 
            element={<ConvertToFromNumberPage />} 
          />
        </Routes>

        {/* Футер (опционально) */}
        <footer className="main-footer">
          <div className="footer-container">
            <p>© 2024 Grade 3 Math Practice. Educational materials for learning place value.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;