import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { IoLogOut } from "react-icons/io5";
import './Header.css';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  // Use a generic avatar or initials
  const initials = user?.username ? user.username.charAt(0).toUpperCase() : 'U';

  return (
    <header className="main-header">
      <div className="header-left">
      </div>
      <div className="header-right" ref={dropdownRef}>
        <div 
          className="profile-icon" 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          title="Account"
        >
          {initials}
        </div>
        
        {isDropdownOpen && (
          <div className="profile-dropdown">
            
            <div className="profile-card">
              <div className="profile-main-row" onClick={handleProfile}>
                <div className="profile-header-avatar">
                  {initials}
                </div>
                <span className="profile-name">{user?.username || 'User'}</span>
              </div>
            </div>
            
            <div className="dropdown-divider"></div>

            <div className="dropdown-item" onClick={handleLogout}>
              <div className="dropdown-icon-wrapper">
                <IoLogOut />
              </div>
              <span className="dropdown-text">Đăng xuất</span>
            </div>

          </div>
        )}
      </div>
    </header>
  );
}
