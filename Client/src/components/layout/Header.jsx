import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { IoLogOut } from 'react-icons/io5';
import './Header.css';

export default function Header() {
  const { user, logout }  = useAuth();
  const navigate          = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="main-header">
      {/* ── Right Controls ── */}
      <div className="header-right">
        {/* Logout Button */}
        <button className="header-logout-btn" onClick={handleLogout} title="Đăng xuất">
          <IoLogOut size={18} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </header>
  );
}
