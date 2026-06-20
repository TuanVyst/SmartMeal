import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useContext, useState, useEffect } from 'react';
import { HealthProfileContext } from '../../context/HealthProfileContext';
import avocadoMascot from '../../assets/avocado_mascot.png';
import './Sidebar.css';

const NAV_ITEMS = [
  { to: '/dashboard',         icon: '🏠', label: 'Trang chủ',        end: true  },
  { to: '/meal-suggestions',  icon: '🍽️', label: 'Khám phá món ăn'              },
  { to: '/meal-plans',        icon: '📋', label: 'Kế hoạch bữa ăn'              },
  { to: '/favorites',         icon: '❤️', label: 'Bộ sưu tập'                   },
  { to: '/nutrition-diary',   icon: '📖', label: 'Nhật ký sức khỏe'             },
  { to: '/nutrition',         icon: '🏆', label: 'Thành tích'                   },
  { to: '/profile',           icon: '⚙️', label: 'Cài đặt'                      },
];

const MASCOT_TIPS = [
  { title: '🥑 Uống đủ nước nhé!',   msg: 'Bạn mới uống 1/8 ly nước hôm nay.' },
  { title: '🌿 Đừng bỏ bữa!',        msg: 'Ăn sáng giúp bạn tập trung hơn 30%.' },
  { title: '🏃 Vận động nào!',        msg: 'Chỉ 10 phút đi bộ là đủ khởi đầu.' },
  { title: '🥗 Thêm rau xanh!',       msg: 'Mục tiêu hôm nay: 2 phần rau củ.' },
];

export default function Sidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const healthCtx = useContext(HealthProfileContext);
  const [tipIndex, setTipIndex] = useState(0);

  // Rotate mascot tips every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex(i => (i + 1) % MASCOT_TIPS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const currentTip   = MASCOT_TIPS[tipIndex];
  const displayName  = user?.username || 'Bạn';
  const initials     = displayName.charAt(0).toUpperCase();
  const isAdmin      = user?.role === 'Admin';

  // Streak & goal mock (replace with real data when API ready)
  const streakDays   = 7;
  const weekGoal     = '4/7';

  // Progress ring SVG (percentage = 70% filled)
  const RADIUS       = 30;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const progress     = 0.70;
  const strokeDash   = `${CIRCUMFERENCE * progress} ${CIRCUMFERENCE * (1 - progress)}`;

  return (
    <aside className="main-sidebar">
      {/* ── Logo ── */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🥗</div>
        <h2>SmartMeal</h2>
      </div>

      {/* ── Profile Card ── */}
      <div className="sidebar-profile-card">
        <div className="sidebar-avatar-wrapper">
          <svg className="sidebar-avatar-ring" viewBox="0 0 72 72" fill="none">
            <circle cx="36" cy="36" r={RADIUS} stroke="#e8f7e8" strokeWidth="4" />
            <circle
              cx="36" cy="36" r={RADIUS}
              stroke="#6CCB63" strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={strokeDash}
              strokeDashoffset={CIRCUMFERENCE * 0.25}
              style={{ transition: 'stroke-dasharray 1s ease' }}
            />
          </svg>
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-streak-badge">🔥</div>
        </div>

        <div className="sidebar-user-greeting">
          <h4>Xin chào, {displayName} 👋</h4>
          <p>Cùng xây dựng lối sống lành mạnh mỗi ngày nhé!</p>
        </div>

        <div className="sidebar-stats-row">
          <div className="sidebar-stat-card">
            <div className="stat-icon">🔥</div>
            <div className="stat-value">{streakDays}</div>
            <div className="stat-label">ngày liên tiếp</div>
          </div>
          <div className="sidebar-stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-value">{weekGoal}</div>
            <div className="stat-label">mục tiêu tuần</div>
          </div>
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
              <span className="nav-item-icon">🛡️</span>
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
