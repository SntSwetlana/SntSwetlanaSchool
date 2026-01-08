// AppHeader.tsx
import React, { useState, useEffect } from 'react';
import LoggedMenu from './../LoggedMenu/LoggedMenu';
import NotLoggedMenu from './../NotLoggedMenu/NotLoggedMenu';
import './AppHeader.css';

const AppHeader: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userData, setUserData] = useState<{
    username: string;
    avatarType: 'boy' | 'girl';
    roles: string[];
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Проверяем статус аутентификации при загрузке
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    setLoading(true);
    try {
      // HttpOnly cookies отправляются автоматически с credentials: 'include'
      const response = await fetch('http://localhost:3000/api/auth/verify', {
        method: 'GET',
        credentials: 'include', // Важно для HttpOnly cookies
      });

      if (response.ok) {
        const data = await response.json();
        setIsLoggedIn(true);
        setUserData({
          username: data.username || 'User',
          avatarType: data.gender === 'male' ? 'boy' : 'girl',
          roles: data.roles || []
        });
      } else {
        setIsLoggedIn(false);
        setUserData(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsLoggedIn(false);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = async () => {
    // После успешного логина проверяем статус снова
    await checkAuthStatus();
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/logout', {
        method: 'POST',
        credentials: 'include', // Для отправки HttpOnly cookies
      });

      if (response.ok) {
        // Очищаем локальное состояние
        setIsLoggedIn(false);
        setUserData(null);
        
        // Очищаем любые не-HttpOnly данные
        localStorage.removeItem('username');
        localStorage.removeItem('userRoles');
        sessionStorage.clear();
        setTimeout(() => {
          checkAuthStatus();
        }, 100);

        console.log('User logged out successfully');
      } else {
        console.error('Logout failed');
        setIsLoggedIn(false);
        setUserData(null);
      }
    } catch (error) {
      console.error('Logout error:', error);
      // В случае ошибки все равно очищаем локальное состояние
      setIsLoggedIn(false);
      setUserData(null);
    }
  };

  const handleProfileClick = () => {
    console.log('Profile clicked');
    // window.location.href = '/profile';
  };

  const handleSettingsClick = () => {
    console.log('Settings clicked');
    // window.location.href = '/settings';
  };

  const handleSearch = (query: string) => {
    console.log('Search query:', query);
  };

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

  return (
    <header className="app-header">
      {isLoggedIn && userData ? (
        <LoggedMenu
          userAvatarType={userData.avatarType}
          userName={userData.username}
          onProfileClick={handleProfileClick}
          onSettingsClick={handleSettingsClick}
          onLogoutClick={handleLogout}
          onSearch={handleSearch}
        />
      ) : (
        <NotLoggedMenu onLoginSuccess={handleLoginSuccess} />
      )}
    </header>
  );
};

export default AppHeader;