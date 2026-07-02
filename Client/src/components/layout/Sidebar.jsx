import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useFavorite } from '../../context/FavoriteContext';
import api from '../../services/api';
import { getTodayDateKey, toDateKey } from '../../utils/dateTime';
import { getRecommendation } from '../../utils/recommendationEngine';
import avocadoMascot from '../../assets/avocado_mascot.png';
import { FiHome, FiSearch, FiClipboard, FiSettings, FiTrendingUp, FiHeart, FiShield, FiAward } from 'react-icons/fi';
import './Sidebar.css';

const NAV_ITEMS = [
  { to: '/dashboard',         icon: <FiHome size={20} />, label: 'Trang chủ',           end: true  },
  { to: '/meal-suggestions',  icon: <FiSearch size={20} />, label: 'Khám phá món ăn'               },
  { to: '/nutrition',         icon: <FiClipboard size={20} />, label: 'Nhật ký sức khoẻ'          },
  { to: '/profile',           icon: <FiSettings size={20} />, label: 'Cài đặt'                      },
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
  const { user, isPremium } = useAuth();
  const { favorites } = useFavorite();
  const navigate = useNavigate();
  const [streakDays, setStreakDays] = useState(0);
  const [tip, setTip] = useState(() => getRecommendation({}));
  const [fading, setFading] = useState(false);
  const pausedRef = useRef(false);

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
    { to: '/dashboard',         icon: <FiHome size={20} />, label: 'Trang chủ',        end: true  },
    { to: '/meal-suggestions',  icon: <FiSearch size={20} />, label: 'Khám phá món ăn'              },
    { to: '/meal-plans',        icon: <FiClipboard size={20} />, label: 'Kế hoạch bữa ăn'              },
    { to: '/nutrition-diary',   icon: <FiClipboard size={20} />, label: 'Nhật ký sức khỏe'             },
    { to: '/nutrition',         icon: <FiTrendingUp size={20} />, label: 'Thành tích'                   },
    { to: '/subscription',      icon: <FiAward size={20} />, label: isPremium ? 'Gói Premium' : 'Nâng cấp Premium' },
    { to: '/profile',           icon: <FiSettings size={20} />, label: 'Cài đặt'                      },
  ];

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
            <circle cx="36" cy="36" r={RADIUS} stroke={isPremium ? "#fdf6e2" : "#e8f7e8"} strokeWidth="4" />
            <circle
              cx="36" cy="36" r={RADIUS}
              stroke={isPremium ? "#D4AF37" : "#6CCB63"} strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={strokeDash}
              strokeDashoffset={CIRCUMFERENCE * 0.25}
              style={{ transition: 'stroke-dasharray 1s ease' }}
            />
          </svg>
          {avatarSrc ? (
            <img 
              className="sidebar-avatar sidebar-avatar-image" 
              src={avatarSrc} 
              alt="Avatar" 
              style={{ border: isPremium ? '2px solid #D4AF37' : 'none' }}
            />
          ) : (
            <div 
              className="sidebar-avatar" 
              style={{ border: isPremium ? '2px solid #D4AF37' : 'none' }}
            >
              {initials}
            </div>
          )}
          <div className="sidebar-streak-badge">
            {isPremium ? '👑' : <FiTrendingUp size={14} />}
          </div>
        </div>

        <div className="sidebar-user-greeting">
          <h4 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '4px' }}>
            Xin chào, {displayName} {isPremium && <span className="premium-label-badge">PRO</span>} 👋
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
  );
}
