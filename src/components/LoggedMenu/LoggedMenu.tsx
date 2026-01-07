import React, { useEffect, useRef, useState } from 'react';
import boyFace from './../../assets/boy-face.svg';
import girlFace from './../../assets/girl-face.svg';
import searchIcon from './../../assets/icon-mag-glass.svg';
import './LoggedMenu.css';

import { Link } from 'react-router-dom';
type LoginResp = { ok: boolean; roles?: string[]; reason?: string };

type Props = {
  userAvatarType: 'boy' | 'girl'; // Тип аватара пользователя
  userName: string; // Имя пользователя
  onProfileClick: () => void;
  onSettingsClick: () => void;
  onLogoutClick: () => void;
  onSearch: (query: string) => void; // Функция обработки поиска
};

const LoggedMenu: React.FC<Props> = ({
  userAvatarType = 'girl',
  userName = 'Irma',
  onProfileClick,
  onSettingsClick,
  onLogoutClick,
  onSearch
}) => {
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Обработчик клика для закрытия меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Фокус на поле ввода при раскрытии поиска
  useEffect(() => {
    if (searchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchExpanded]);

  // Обработка отправки поискового запроса
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
      // Сворачиваем поиск после отправки
      setSearchExpanded(false);
      setSearchQuery('');
    }
  };

  // Получаем путь к аватару в зависимости от типа
  const getAvatarPath = () => {
    return userAvatarType === 'boy' ? boyFace : girlFace;
  };

  return (
        <div className="box-site-nav-func">

      <Link to="/" className="site-nav-snt-logo site-nav-snt-logo-link" aria-label="SNT Learning Home">
      </Link>
    <div className="consolidated-rhs-container">
      {/* Контейнер поиска с анимацией */}
      <div className={`search-container ${searchExpanded ? 'expanded' : ''}`}>
        <form 
          className="search-form" 
          onSubmit={handleSearchSubmit}
          style={{ display: searchExpanded ? 'flex' : 'none' }}
        >
          <input
            ref={searchInputRef}
            type="text"
            className="search-input"
            placeholder="Search topics, skills, and more"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onBlur={() => {
              if (!searchQuery) {
                setTimeout(() => setSearchExpanded(false), 100);
              }
            }}
          />
          <button type="submit" className="search-submit-btn" aria-label="Search">
            <img src={searchIcon} alt="Search" className="search-icon" />
          </button>
        </form>

        {/* Кнопка лупы (всегда видна) */}
        <button
          className="search-toggle-btn"
          onClick={() => {
            setSearchExpanded(!searchExpanded);
            setUserMenuOpen(false);
          }}
          aria-label={searchExpanded ? "Close search" : "Open search"}
          aria-expanded={searchExpanded}
        >
          <img src={searchIcon} alt="Search" className="search-toggle-icon" />
        </button>
      </div>

      {/* Кнопка пользователя с выпадающим меню */}
      <div className="user-menu-container" ref={userMenuRef}>
        <button
          className="user-nav-wrapper icon-and-name-button"
          onClick={() => {
            setUserMenuOpen(!userMenuOpen);
            setSearchExpanded(false);
          }}
          aria-label="User menu"
          aria-expanded={userMenuOpen}
          type="button"
        >
          <div className="user-avatar-container">
            <img
              src={getAvatarPath()}
              alt={`${userName}'s avatar`}
              className="user-avatar"
            />
          </div>
          <span className="display-name">{userName}</span>
          <span className="dropdown-arrow">▾</span>
        </button>

        {/* Выпадающее меню */}
        {userMenuOpen && (
          <div className="user-dropdown-menu">
            <div className="dropdown-header">
              <div className="dropdown-avatar">
                <img
                  src={getAvatarPath()}
                  alt={`${userName}'s avatar`}
                  className="dropdown-user-avatar"
                />
              </div>
              <div className="dropdown-user-info">
                <span className="dropdown-user-name">{userName}</span>
                <span className="dropdown-user-email">{userName.toLowerCase()}@example.com</span>
              </div>
            </div>
            
            <div className="dropdown-divider"></div>
            
            <button
              className="dropdown-item"
              onClick={() => {
                onProfileClick();
                setUserMenuOpen(false);
              }}
            >
              <span className="dropdown-item-icon">👤</span>
              <span className="dropdown-item-text">Profile</span>
            </button>
            
            <button
              className="dropdown-item"
              onClick={() => {
                onSettingsClick();
                setUserMenuOpen(false);
              }}
            >
              <span className="dropdown-item-icon">⚙️</span>
              <span className="dropdown-item-text">Settings</span>
            </button>
            
            <div className="dropdown-divider"></div>
            
            <button
              className="dropdown-item logout-item"
              onClick={() => {
                onLogoutClick();
                setUserMenuOpen(false);
              }}
            >
              <span className="dropdown-item-icon">🚪</span>
              <span className="dropdown-item-text">Log Out</span>
            </button>
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default LoggedMenu;