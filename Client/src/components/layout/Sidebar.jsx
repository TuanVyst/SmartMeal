import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import { useFavorite } from '../../context/FavoriteContext';
import api from '../../services/api';
import { getTodayDateKey, toDateKey } from '../../utils/dateTime';
import avocadoMascot from '../../assets/avocado_mascot.png';
import { FiHome, FiSearch, FiClipboard, FiSettings, FiTrendingUp, FiHeart, FiShield } from 'react-icons/fi';
import './Sidebar.css';

const NAV_ITEMS = [
  { to: '/dashboard',         icon: <FiHome size={20} />, label: 'Trang chủ',           end: true  },
  { to: '/meal-suggestions',  icon: <FiSearch size={20} />, label: 'Khám phá món ăn'               },
  { to: '/nutrition',         icon: <FiClipboard size={20} />, label: 'Nhật ký sức khoẻ'          },
  { to: '/profile',           icon: <FiSettings size={20} />, label: 'Cài đặt'                      },
];

const MASCOT_TIPS = [
  { title: 'Uống đủ nước nhé!',   msg: 'Bạn mới uống 1/8 ly nước hôm nay.' },
  { title: 'Đừng bỏ bữa!',        msg: 'Ăn sáng giúp bạn tập trung hơn 30%.' },
  { title: 'Vận động nào!',        msg: 'Chỉ 10 phút đi bộ là đủ khởi đầu.' },
  { title: 'Thêm rau xanh!',       msg: 'Mục tiêu hôm nay: 2 phần rau củ.' },
];

function getPreviousDateKey(dateKey) {
  if (!dateKey) {
    return '';
  }

  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);
  date.setDate(date.getDate() - 1);
  return toDateKey(date);
}

function calculateCurrentStreak(logs) {
  const uniqueDates = new Set(
    (logs || [])
      .map((log) => toDateKey(log.logDate))
      .filter(Boolean)
  );

  if (uniqueDates.size === 0) {
    return 0;
  }

  const todayKey = getTodayDateKey();
  const yesterdayKey = getPreviousDateKey(todayKey);
  const startDate = uniqueDates.has(todayKey)
    ? todayKey
    : (uniqueDates.has(yesterdayKey) ? yesterdayKey : '');

  if (!startDate) {
    return 0;
  }

  let streak = 0;
  let cursor = startDate;
  while (cursor && uniqueDates.has(cursor)) {
    streak += 1;
    cursor = getPreviousDateKey(cursor);
  }

  return streak;
}

export default function Sidebar() {
  const { user } = useAuth();
  const { favorites } = useFavorite();
  const navigate = useNavigate();
  const [tipIndex, setTipIndex] = useState(0);
  const [streakDays, setStreakDays] = useState(0);

  const accountId = user?.accountId || user?.account_id;

  // Rotate mascot tips every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex(i => (i + 1) % MASCOT_TIPS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!accountId) {
      setStreakDays(0);
      return;
    }

    let isMounted = true;

    const fetchStreak = async () => {
      try {
        const res = await api.get(`/nutritionlog?accountId=${accountId}`);
        if (!isMounted) {
          return;
        }
        setStreakDays(calculateCurrentStreak(res.data.data || []));
      } catch (error) {
        console.error('Không thể tải chuỗi ngày liên tiếp:', error);
        if (isMounted) {
          setStreakDays(0);
        }
      }
    };

    fetchStreak();

    return () => {
      isMounted = false;
    };
  }, [accountId]);

  const currentTip   = MASCOT_TIPS[tipIndex];
  const displayName  = user?.username || 'Bạn';
  const initials     = displayName.charAt(0).toUpperCase();
  const isAdmin      = user?.role === 'Admin';
  const avatarSrc    = user?.avatar || '';

  // Progress ring SVG (percentage = 70% filled)
  const RADIUS       = 30;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const progress     = 0.70;
  const strokeDash   = `${CIRCUMFERENCE * progress} ${CIRCUMFERENCE * (1 - progress)}`;

  return (
    <aside className="main-sidebar">
      {/* ── Logo ── */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon"><FiHome size={24} /></div>
        <h2>SmartMeal</h2>
      </div>

      {/* ── Profile Card ── */}
      <div className="sidebar-profile-card">
        <div className="sidebar-avatar-wrapper">
          <svg className="sidebar-avatar-ring" viewBox="0 0 72 72" fill="none">
            <circle cx="36" cy="36" r={RADIUS} stroke="#e8f7e8" strokeWidth="4" />
            <circle
              cx="36" cy="36" r={RADIUS}
              stroke="transparent" strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={strokeDash}
              strokeDashoffset={CIRCUMFERENCE * 0.25}
              style={{ transition: 'stroke-dasharray 1s ease' }}
            />
          </svg>
          {avatarSrc ? (
            <img className="sidebar-avatar sidebar-avatar-image" src={avatarSrc} alt="Avatar" />
          ) : (
            <div className="sidebar-avatar">{initials}</div>
          )}
          <div className="sidebar-streak-badge"><FiTrendingUp size={14} /></div>
        </div>

        <div className="sidebar-user-greeting">
          <h4>Xin chào, {displayName}</h4>
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

        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              isActive ? 'nav-item active' : 'nav-item'
            }
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
              className={({ isActive }) =>
                isActive ? 'nav-item active' : 'nav-item'
              }
            >
              <span className="nav-item-icon"><FiShield size={20} /></span>
              <span className="nav-item-text">Quản trị hệ thống</span>
            </NavLink>
          </>
        )}
      </nav>

      {/* ── Mascot Widget ── */}
      <div className="sidebar-mascot-widget">
        <div className="mascot-top">
          <div className="sidebar-mascot-image mascot-image-wrap">
            <img src={avocadoMascot} alt="SmartMeal Mascot" />
          </div>
          <div className="mascot-text">
            <div className="mascot-title">{currentTip.title}</div>
            <div className="mascot-message">{currentTip.msg}</div>
          </div>
        </div>
        <button
          className="mascot-cta-btn"
          onClick={() => navigate('/nutrition-diary')}
        >
          + Ghi nhận ngay
        </button>
      </div>
    </aside>
  );
}
