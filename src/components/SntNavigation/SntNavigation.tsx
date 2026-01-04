import React from 'react';
import './SntNavigation.css';
import { Link } from 'react-router-dom';

const SntNavigation = () => {
  return (
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
          maxLength="200" 
          name="q" 
          placeholder="Search topics, skills, and more" 
          aria-label="Search topics, skills, and more" 
          data-cy="search-input" 
          value=""
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
          data-cy="quick-login-form" 
          action="/signin" 
          method="post"
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
            value=""
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
          />
          <button 
            aria-label="Sign in" 
            className="quick-login-button" 
            id="qlsubmit" 
            name="qlsubmit" 
            type="submit" 
            value="true" 
            data-cy="qlsubmit"
          >
          Sign in
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

export default SntNavigation;