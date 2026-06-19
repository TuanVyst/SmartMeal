import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

export default function Sidebar() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  return (
    <aside className="main-sidebar">
      <div className="sidebar-logo">
        <h2>SmartMeal</h2>
      </div>
      <nav className="sidebar-nav">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
          end
        >
          Bảng điều khiển
        </NavLink>
        <NavLink 
          to="/meal-suggestions" 
          className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
        >
          Gợi ý món ăn
        </NavLink>
        <NavLink 
          to="/favorites" 
          className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
        >
          Yêu thích
        </NavLink>
        <NavLink 
          to="/meal-plans" 
          className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
        >
          Kế hoạch bữa ăn
        </NavLink>
        <NavLink 
          to="/nutrition" 
          className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
        >
          Nhật ký Dinh dưỡng
        </NavLink>

        {isAdmin && (
          <NavLink 
            to="/admin" 
            className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
          >
            Quản trị
          </NavLink>
        )}
      </nav>
    </aside>
  );
}
