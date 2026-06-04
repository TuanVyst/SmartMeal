import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiGrid, FiBox, FiLogOut } from 'react-icons/fi';

const navItems = [
  { to: '/', label: 'Dashboard', icon: <FiGrid size={20} /> },
  { to: '/ingredients', label: 'Ingredients', icon: <FiBox size={20} /> },
];

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="main-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">SmartMeal</div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">{user?.username}</div>
          <button className="logout-btn" onClick={handleLogout}>
            <FiLogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      <div className="main-area">
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
