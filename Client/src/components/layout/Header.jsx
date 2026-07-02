import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { IoLogOut } from 'react-icons/io5';
import { FaUser } from 'react-icons/fa';
import './Header.css';

export default function Header() {
  const { user, logout }  = useAuth();
  const navigate          = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchValue, setSearchValue]       = useState('');
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfile = () => {
    navigate('/profile');
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = user?.username || 'Bạn';
  const initials    = displayName.charAt(0).toUpperCase();

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      navigate(`/meal-suggestions?q=${encodeURIComponent(searchValue.trim())}`);
      setSearchValue('');
    }
  };

  return (
    <header className="main-header">
      {/* ── Search Bar ── */}
      <div className="header-search">
        <span className="header-search-icon">🔍</span>
        <input
          type="text"
          placeholder="Tìm kiếm món ăn, nguyên liệu..."
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          onKeyDown={handleSearch}
        />
      </div>

      {/* ── Right Controls ── */}
      <div className="header-right">
        {/* Notification Bell */}
        <button className="header-notif-btn" title="Thông báo">
          🔔
          <span className="header-notif-dot" />
        </button>

        {/* Profile Dropdown */}
        <div className="header-profile-wrapper" ref={dropdownRef}>
          <button
            className={`header-profile-btn${isDropdownOpen ? ' open' : ''}`}
            onClick={() => setIsDropdownOpen(prev => !prev)}
          >
            <div className="profile-icon">{initials}</div>
            <span className="header-profile-name">{displayName}</span>
            <span className="header-profile-chevron">▾</span>
          </button>

          {isDropdownOpen && (
            <div className="profile-dropdown">
              <div className="dropdown-item" onClick={handleProfile}>
                <div className="dropdown-icon-wrapper">
                  <FaUser />
                </div>
                <span className="dropdown-text">Hồ sơ</span>
              </div>

              <div className="dropdown-divider" />

              <div className="dropdown-item logout-item" onClick={handleLogout}>
                <div className="dropdown-icon-wrapper">
                  <IoLogOut />
                </div>
                <span className="dropdown-text">Đăng xuất</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
