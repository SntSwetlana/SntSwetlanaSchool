import React, { useState } from 'react';
import './NotLoggedMenu.css';
import { Link } from 'react-router-dom';
type LoginResp = { 
  ok: boolean; 
  roles?: string[]; 
  username?: string;
  gender?: 'male' | 'female';
  reason?: string 
};

type Props = {
  onLoginSuccess: (roles: string[]) => void;
};

const NotLoggedMenu: React.FC<Props> = ({ onLoginSuccess }) => {
 const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      console.log('Submitting login for', username);
      console.log('Submitting password for', password);
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      const data = (await res.json()) as LoginResp;

      if (!res.ok || !data.ok) {
        setError(data.reason ?? 'Invalid username or password');
        return;
      }
      
      if (data.username) {
        sessionStorage.setItem('username', data.username);
      }
      if (data.gender) {
        sessionStorage.setItem('gender', data.gender);
      }
      if (data.roles) {
        sessionStorage.setItem('userRoles', JSON.stringify(data.roles));
      }

      onLoginSuccess(data.roles ?? []);
    } catch {
      setError('network_error');
    } finally {
      setLoading(false);
    }
  }  return (
    <div className="box-site-nav-func">
      <Link to="/" className="site-nav-snt-logo site-nav-snt-logo-link" aria-label="SNT Learning Home">
      </Link>
      <form 
        className="skill-search-box" 
        id="searchBar" 
        data-cy="search-form" 
        method="get" 
        action="/search"
        role="search"
      >
        <div className="skill-search-container">
        <input 
          className="box-search-input-btn" 
          type="search" 
          autoComplete="off" 
          maxLength={200} 
          name="q" 
          placeholder="Search topics, skills, and more" 
          aria-label="Search topics, skills, and more" 
          data-cy="search-input" 
        />
        <button 
          className="skill-search-button site-nav-header-button"
          aria-controls="searchBar" 
          aria-haspopup="true"
          aria-label="Open search"
          type="submit"
        >
        </button>
        </div>
      </form>
      <div className="nav-func-right">
        <form 
          className="quick-login-box" 
          id="quickLogin" 
          onSubmit={onSubmit}
        >
          <input 
            aria-label="Username" 
            autoCapitalize="off" 
            autoComplete="off" 
            autoCorrect="off" 
            className="quick-login-text-input" 
            id="qlusername" 
            name="username" 
            placeholder="Username" 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input 
            aria-label="Password" 
            autoCapitalize="off" 
            autoComplete="off" 
            autoCorrect="off" 
            className="quick-login-text-input" 
            id="qlpassword" 
            name="password" 
            placeholder="Password" 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button 
            aria-label="Sign in" 
            className="quick-login-button" 
            type="submit" 
            disabled={loading}
          >
          {loading ? 'Signing in...' : 'Sign in'}
          </button>
          <input 
            autoComplete="off" 
            className="quick-login-checkbox" 
            id="quick-login-remember" 
            name="rememberUser" 
            type="checkbox" 
            value="true"
          />
          <label htmlFor="quick-login-remember" className="quick-login-label">
            Remember
          </label>
          {error && (
              <div className="login-error" style={{ 
              marginLeft: 12, 
              fontSize: 12,
              color: '#dc3545',
              marginTop: 8
            }}>
              {error}
            </div>
         )}

        </form>
      </div>
        
        {/* Mobile navigation content - будет открываться при клике на меню */}
        <div className="box-site-nav-content" id="mobile-nav-content">
          {/* Контент мобильного меню здесь */}
        </div>
      
      {/* Mobile search overlay */}
      <input type="checkbox" id="mobile-search-state" className="visually-hidden" />
      <label htmlFor="mobile-search-state" className="site-nav-header-mask mobile-search"></label>
      
      {/* Mobile menu overlay */}
      <label htmlFor="header-menu-state" className="site-nav-header-mask header-menu"></label>
     </div>
  );
};

export default NotLoggedMenu;