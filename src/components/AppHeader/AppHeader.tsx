// AppHeader.tsx
import React from 'react';
import { useAuth } from './../../contexts/AuthContext';
import LoggedMenu from '../LoggedMenu';
import NotLoggedMenu from '../NotLoggedMenu';
import './AppHeader.css';

const AppHeader: React.FC = () => {
  const { isLoggedIn, userData, loading, logout } = useAuth();

  // Показываем лоадер во время проверки аутентификации
  if (loading) {
    return (
      <header className="app-header">
        <div className="box-site-nav-func">
          <div className="auth-loading">Checking authentication...</div>
        </div>
      </header>
    );
  }

  const handleProfileClick = () => {
    console.log('Profile clicked');
  };

  const handleSettingsClick = () => {
    console.log('Settings clicked');
  };

  const handleSearch = (query: string) => {
    console.log('Search query:', query);
  };

  return (
    <header className="app-header">
      {isLoggedIn && userData ? (
        <LoggedMenu
          userAvatarType={userData.avatarType}
          userName={userData.username}
          onProfileClick={handleProfileClick}
          onSettingsClick={handleSettingsClick}
          onLogoutClick={logout} // Используем logout из контекста
          onSearch={handleSearch}
        />
      ) : (
        <NotLoggedMenu onLoginSuccess={() => {}} />
      )}
    </header>
  );
};

export default AppHeader;