import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useFavorite } from '../../context/FavoriteContext';
import api from '../../services/api';
import { getTodayDateKey, toDateKey } from '../../utils/dateTime';
import { getRecommendation } from '../../utils/recommendationEngine';
import avocadoMascot from '../../assets/avocado_mascot.png';
import { FiHome, FiClipboard, FiSettings, FiTrendingUp, FiHeart, FiShield, FiAward, FiMenu, FiX, FiChevronLeft, FiChevronRight, FiCamera } from 'react-icons/fi';
import SidebarProgressAvatar from '../common/SidebarProgressAvatar';
import { useTodayCalorieProgress } from '../../hooks/useTodayCalorieProgress';
import './Sidebar.css';

function getPreviousDateKey(dateKey) {
  if (!dateKey) return '';
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);
  date.setDate(date.getDate() - 1);
  return toDateKey(date);
}

function calculateCurrentStreak(logs) {
  const uniqueDates = new Set(
    (logs || []).map((log) => toDateKey(log.logDate)).filter(Boolean)
  );
  if (uniqueDates.size === 0) return 0;

  const todayKey = getTodayDateKey();
  const yesterdayKey = getPreviousDateKey(todayKey);
  const startDate = uniqueDates.has(todayKey)
    ? todayKey
    : (uniqueDates.has(yesterdayKey) ? yesterdayKey : '');

  if (!startDate) return 0;

  let streak = 0;
  let cursor = startDate;
  while (cursor && uniqueDates.has(cursor)) {
    streak += 1;
    cursor = getPreviousDateKey(cursor);
  }
  return streak;
}

export default function Sidebar() {
  const { user, isPremium } = useAuth();
  const { favorites } = useFavorite();
  const navigate = useNavigate();
  const [streakDays, setStreakDays] = useState(0);
  const [tip, setTip] = useState(() => getRecommendation({}));
  const [fading, setFading] = useState(false);
  const pausedRef = useRef(false);

  // Desktop collapse state (persisted in localStorage)
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(() => {
    try { return localStorage.getItem('sidebar_collapsed') === 'true'; }
    catch { return false; }
  });

  // Mobile open state
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleDesktopCollapse = () => {
    setIsDesktopCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem('sidebar_collapsed', String(next)); } catch {}
      // Sync CSS variable so MainLayout can adjust margin-left smoothly
      document.documentElement.style.setProperty('--sidebar-width', next ? '72px' : '280px');
      return next;
    });
  };

  // Sync CSS variable on mount
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--sidebar-width',
      isDesktopCollapsed ? '72px' : '280px'
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const nextTip = useCallback(() => {
    setFading(true);
    setTimeout(() => {
      setTip(getRecommendation({}));
      setFading(false);
    }, 400);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      if (!pausedRef.current) nextTip();
    }, 12000);
    return () => clearInterval(id);
  }, [nextTip]);

  const accountId = user?.accountId || user?.account_id;

  const navItems = [
    { to: '/home',                  icon: <FiHome size={20} />,      label: 'Khám phá',                    end: false },
    { to: '/journal',               icon: <FiClipboard size={20} />, label: 'Nhật ký',                     end: false },
    { to: '/ingredient-detection',  icon: <FiCamera size={20} />,    label: 'Nhận diện nguyên liệu' },
    { to: '/subscription',          icon: <FiAward size={20} />,     label: isPremium ? 'Gói Pro' : 'Nâng cấp Pro' },
    { to: '/profile',               icon: <FiSettings size={20} />,  label: 'Cài đặt'                      },
  ];

  useEffect(() => {
    if (!accountId) { setStreakDays(0); return; }
    let isMounted = true;
    const fetchStreak = async () => {
      try {
        const res = await api.get(`/nutritionlog?accountId=${accountId}`);
        if (isMounted) setStreakDays(calculateCurrentStreak(res.data.data || []));
      } catch {
        if (isMounted) setStreakDays(0);
      }
    };
    fetchStreak();
    return () => { isMounted = false; };
  }, [accountId]);

  const displayName = user?.username || 'Bạn';
  const initials    = displayName.charAt(0).toUpperCase();
  const isAdmin     = user?.role === 'Admin';
  const avatarSrc   = user?.avatar || '';
  const { caloriesToday, targetCalories } = useTodayCalorieProgress();

  return (
    <>
      {/* ── Mobile hamburger toggle (only visible on mobile) ── */}
      <button
        className="sidebar-mobile-toggle"
        onClick={() => setIsMobileOpen(true)}
        aria-label="Mở menu"
      >
        <FiMenu size={22} />
      </button>

      {/* ── Mobile backdrop ── */}
      {isMobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Desktop collapse toggle tab (floats on the right edge of sidebar) ── */}
      <button
        className={`sidebar-desktop-toggle ${isDesktopCollapsed ? 'collapsed' : ''}`}
        onClick={toggleDesktopCollapse}
        title={isDesktopCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
        aria-label={isDesktopCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
      >
        {isDesktopCollapsed ? <FiChevronRight size={14} /> : <FiChevronLeft size={14} />}
      </button>

      <aside className={`main-sidebar${isDesktopCollapsed ? ' desktop-collapsed' : ''}${isMobileOpen ? ' mobile-open' : ''}`}>
        {/* ── Mobile close button ── */}
        <button
          className="sidebar-close-btn"
          onClick={() => setIsMobileOpen(false)}
          aria-label="Đóng menu"
        >
          <FiX size={20} />
        </button>

        {/* ── Logo ── */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon"><FiHome size={24} /></div>
          <h2 className="sidebar-logo-text">SmartMeal</h2>
        </div>

        {/* ── Profile Card ── */}
        <div className="sidebar-profile-card">
          <SidebarProgressAvatar
            avatarSrc={avatarSrc}
            initials={initials}
            isPremium={isPremium}
            caloriesToday={caloriesToday}
            targetCalories={targetCalories}
          />

          <div className="sidebar-user-greeting">
            <h4 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '4px' }}>
              Xin chào, {displayName} {isPremium && <span className="premium-label-badge">PRO</span>}
            </h4>
            <p>Cùng xây dựng lối sống lành mạnh mỗi ngày nhé!</p>
          </div>

          <div className="sidebar-stats-row">
            <div className="sidebar-stat-card">
              <div className="stat-icon"><FiTrendingUp size={18} /></div>
              <div className="stat-value">{streakDays}</div>
              <div className="stat-label">ngày liên tiếp</div>
            </div>
            <button
              type="button"
              className="sidebar-stat-card sidebar-stat-card-clickable"
              onClick={() => navigate('/favorites')}
              title="Mở bộ sưu tập"
            >
              <div className="stat-icon"><FiHeart size={18} /></div>
              <div className="stat-value">{favorites.length}</div>
              <div className="stat-label">bộ sưu tập</div>
            </button>
          </div>
        </div>

        {/* ── Navigation ── */}
        <nav className="sidebar-nav">
          <span className="sidebar-nav-label">Menu chính</span>

          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
              title={isDesktopCollapsed ? item.label : ''}
            >
              <span className="nav-item-icon">{item.icon}</span>
              <span className="nav-item-text">{item.label}</span>
            </NavLink>
          ))}

          {isAdmin && (
            <>
              <span className="sidebar-nav-label">Quản trị</span>
              <NavLink
                to="/admin"
                className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
                title={isDesktopCollapsed ? 'Quản trị hệ thống' : ''}
              >
                <span className="nav-item-icon"><FiShield size={20} /></span>
                <span className="nav-item-text">Quản trị hệ thống</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* ── Mascot Widget ── */}
        <div
          className={`sidebar-mascot-widget${fading ? ' mascot--fading' : ''}`}
          onMouseEnter={() => { pausedRef.current = true; }}
          onMouseLeave={() => { pausedRef.current = false; }}
        >
          <div className="mascot-top">
            <div className="mascot-image-wrap">
              <img src={avocadoMascot} alt="SmartMeal Mascot" />
            </div>
            <div className="mascot-text">
              <div className="mascot-title">{tip.label}</div>
              <div className="mascot-message">{tip.text}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
