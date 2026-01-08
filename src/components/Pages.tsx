import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './../contexts/AuthContext';

import PlaceValueGame from './PlaceValueGame/PlaceValueGame';
import DigitMathQuestion from './DigitMathQuestion/DigitMathQuestion';
import UnderlinedDigitQuestion from './UnderlinedDigitQuestion/UnderlinedDigitQuestion';
import PlaceValueReport from './PlaceValueReport/PlaceValueReport';
import PlaceValueEquation from './PlaceValueEquation/PlaceValueEquation';
import PlaceValueExpansion from './PlaceValueExpansion/PlaceValueExpansion';
import PracticeStats from './PracticeStats/PracticeStats';
import './../App.css';
import FontViewer from './FontViewer/FontViewer';

// Страница для названий разрядов
export const PlaceValueNamesPage = () => {
  return (
    <div className="practice-page">
      <div className="page-container">
        <h1>Grade 3 Math - Place Value Names up to Ten Thousands</h1>
        <div className="snt-practice-container">
          <PracticeStats />          
        </div>
        <div className="snt-practice-container">
          <PlaceValueGame targetNumber={4} />
        </div>
        
        <div className="snt-practice-container">
          <PlaceValueGame targetNumber={7} />
        </div>
        
        <div className="snt-practice-container">
          <PlaceValueGame targetNumber={2} />
        </div>
        <div className="snt-practice-container">
          <FontViewer />
        </div>         
      </div>
    </div>
  );
};

// Страница для значения цифры
export const ValueOfDigitPage = () => {
  return (
    <div className="practice-page">
      <div className="page-container">
        <h1>Grade 3 Math - Value of a Digit up to Ten Thousands</h1>
        <div className="snt-practice-container">
          <PracticeStats />          
        </div>

        <div className="digit-practice-container">
          <DigitMathQuestion 
            numbers={["23704", "71380", "80467", "7140"]}
            targetDigit={7}
            correctIndex={1}
          />
        </div>
        
        <div className="snt-practice-container">
          <UnderlinedDigitQuestion 
            number="18,084"
            underlinedIndex={3}
            correctAnswer={80}
          />
        </div>
        
        <div className="snt-practice-container">
          <PlaceValueReport 
            number="32,567"
            underlinedIndex={0}
          />
        </div>
        
        <div className="snt-practice-container">
          <DigitMathQuestion 
            numbers={["11511", "1151", "11115", "51111"]}
            targetDigit={5}
            correctIndex={3}
          />
        </div>
      </div>
    </div>
  );
};

// Страница для конвертации чисел
export const ConvertToFromNumberPage = () => {
  return (
    <div className="practice-page">
      <div className="page-container">
        <h1>Grade 3 Math - Convert to/from a Number</h1>
        <div className="snt-practice-container">
          <PracticeStats />          
        </div>

        <div className="snt-practice-container">
          <PlaceValueEquation correctAnswer={527} />
        </div>
        
        <div className="snt-practice-container">
          <PlaceValueExpansion number={32763} />
        </div>
        
        <div className="snt-practice-container">
          <PlaceValueEquation correctAnswer={1234} />
        </div>
        
        <div className="snt-practice-container">
          <PlaceValueExpansion number={5006} />
        </div>
        
        <div className="snt-practice-container">
          <PlaceValueExpansion number={243506} />
        </div>
      </div>
    </div>
  );
};


// Домашняя страница
export const HomePage = () => {
    const navigate = useNavigate();
  const { isLoggedIn, getUserDashboardPath } = useAuth();

  useEffect(() => {
    // Если пользователь залогинен, редиректим на его дашборд
    if (isLoggedIn) {
      const dashboardPath = getUserDashboardPath();
      if (dashboardPath !== '/') {
        navigate(dashboardPath);
      }
    }
  }, [isLoggedIn, navigate, getUserDashboardPath]);

  return (
    <>
        <div className="home-page">
      <h1>Welcome to Math Grade 3</h1>
      <p>Educational materials for learning place value.</p>
      
      {!isLoggedIn && (
        <div className="home-features">
          <h2>Features:</h2>
          <ul>
            <li>Place Value Names</li>
            <li>Value of a Digit</li>
            <li>Convert Numbers</li>
            <li>Interactive Exercises</li>
          </ul>
          
          <div className="auth-cta">
            <p>
              <a href="/login">Login</a> to access personalized dashboard
            </p>
          </div>
        </div>
      )}
    </div>
    <div className="practice-page">
      <div className="home-container">
        <h1>Grade 3 Math - Place Value Practice</h1>
        
        <div className="navigation-grid">
          <a href="/math/grade3/place_value_names_up_to_ten_thousands" className="nav-card">
            <div className="nav-icon">🔢</div>
            <h2>Place Value Names</h2>
            <p>Learn and practice place value names up to ten thousands</p>
          </a>
          
          <a href="/math/grade3/value_of_a_digit_up_to_ten_thousands" className="nav-card">
            <div className="nav-icon">💰</div>
            <h2>Value of a Digit</h2>
            <p>Practice finding the value of digits in numbers</p>
          </a>
          
          <a href="/math/grade3/convert_to_from_a_number" className="nav-card">
            <div className="nav-icon">🔄</div>
            <h2>Convert Numbers</h2>
            <p>Convert between expanded form and standard form</p>
          </a>
        </div>
      </div>
    </div>
    </>
  );
};