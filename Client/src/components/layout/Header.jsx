import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { IoLogOut } from 'react-icons/io5';
import { FaUser } from 'react-icons/fa';
import { FiBell, FiChevronDown } from 'react-icons/fi';
import './Header.css';

export default function Header() {
  const { user, logout }  = useAuth();
  const navigate          = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

  return (
    <header className="main-header">
      {/* ── Right Controls ── */}
      <div className="header-right">
        {/* Notification Bell */}
        <button className="header-notif-btn" title="Thông báo">
          <FiBell size={20} />
          <span className="header-notif-dot" />
        </button>

        {/* Profile Dropdown */}
        <div className="header-profile-wrapper" ref={dropdownRef}>
          <button
            className={`header-profile-btn${isDropdownOpen ? ' open' : ''}`}
            onClick={() => setIsDropdownOpen(prev => !prev)}
          >
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" className="profile-icon profile-image" />
            ) : (
              <div className="profile-icon">{initials}</div>
            )}
            <span className="header-profile-name">{displayName}</span>
            <FiChevronDown className="header-profile-chevron" size={14} />
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
