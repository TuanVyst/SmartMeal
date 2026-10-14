import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { IoLogOut } from 'react-icons/io5';
import { FiBell, FiMenu } from 'react-icons/fi';
import SidebarProgressAvatar from '../common/SidebarProgressAvatar';
import { useTodayCalorieProgress } from '../../hooks/useTodayCalorieProgress';
import './Header.css';

export default function Header() {
  const { user, isPremium, logout }  = useAuth();
  const navigate          = useNavigate();
  const { caloriesToday, targetCalories } = useTodayCalorieProgress();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Dispatch custom event so Sidebar can listen and open
  const handleHamburger = () => {
    window.dispatchEvent(new CustomEvent('smartmeal:open-sidebar'));
  };

  const displayName = user?.username || 'Bạn';
  const initials    = displayName.charAt(0).toUpperCase();
  const avatarSrc   = user?.avatar || '';

  return (
    <header className="main-header">

      {/* ── Mobile Only: Left Controls ── */}
      <div className="header-mobile-left">
        <button
          className="header-hamburger"
          onClick={handleHamburger}
          aria-label="Mở menu"
        >
          <FiMenu size={22} />
        </button>

        <div className="header-streak-mobile">
          Ngày liên tiếp
        </div>
      </div>

      {/* ── Right Controls ── */}
      <div className="header-right">
        {/* Notification Bell (Hidden on mobile to match wireframe) */}
        <button className="header-notif-btn desktop-only-bell" title="Thông báo">
          <FiBell size={20} />
          <span className="header-notif-dot" />
        </button>

        {/* Desktop: Logout Button */}
        <button className="header-logout-btn" onClick={handleLogout} title="Đăng xuất">
          <IoLogOut size={18} />
          <span>Đăng xuất</span>
        </button>

        {/* Mobile: Avatar with Calorie Progress Ring */}
        <div 
          className="header-avatar-container" 
          onClick={() => navigate('/profile')}
          title={`Hôm nay: ${caloriesToday}/${targetCalories} kcal - Bấm để vào trang cá nhân`}
        >
          <SidebarProgressAvatar
            avatarSrc={avatarSrc}
            initials={initials}
            isPremium={isPremium}
            caloriesToday={caloriesToday}
            targetCalories={targetCalories}
          />
        </div>
      </div>
    </header>
  );
}
