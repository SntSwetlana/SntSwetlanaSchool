import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

import { 
  HomePage, 
  PlaceValueNamesPage, 
  ValueOfDigitPage, 
  ConvertToFromNumberPage 
} from './components/Pages';
import NotLoggedMenu from './components/NotLoggedMenu/NotLoggedMenu';
import LoggedMenu from './components/LoggedMenu/LoggedMenu';
type MeResp = { ok: boolean; roles?: string[] };

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Замените на реальную логику аутентификации
  const [roles, setRoles] = useState<string[]>([]);

  // 1) при старте проверяем сессию
  useEffect(() => {
    fetch('http://localhost:3000/api/auth/me', {
      credentials: 'include',
    })
      .then(async (r) => (r.ok ? (await r.json()) as MeResp : null))
      .then((data) => {
        if (data?.ok) {
          setIsLoggedIn(true);
          setRoles(data.roles ?? []);
        } else {
          setIsLoggedIn(false);
          setRoles([]);
        }
      })
      .catch(() => {
        setIsLoggedIn(false);
        setRoles([]);
      });
  }, []);

  const handleLoginSuccess = (newRoles: string[]) => {
    setIsLoggedIn(true);
    setRoles(newRoles);
  };

  return (
    <Router>
      <div className="App">
          <nav className="main-nav">
        {/* Навигационная панель (опционально) */}
        {!isLoggedIn &&  (
          <NotLoggedMenu onLoginSuccess={handleLoginSuccess} />
        )}            
        {isLoggedIn &&  (
          <LoggedMenu onLoginSuccess={handleLoginSuccess} />
        )}            
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
                  element={<PlaceValueNamesPage />} />
                <Route
                  path="/math/grade3/value_of_a_digit_up_to_ten_thousands"
                  element={<ValueOfDigitPage />} />
                <Route
                  path="/math/grade3/convert_to_from_a_number"
                  element={<ConvertToFromNumberPage />} />
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