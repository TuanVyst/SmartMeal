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
          Dashboard
        </NavLink>
        <NavLink 
          to="/meal-suggestions" 
          className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
        >
          Meal Suggestions
        </NavLink>
        <NavLink 
          to="/favorites" 
          className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
        >
          Favorites
        </NavLink>
        <NavLink 
          to="/meal-plans" 
          className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
        >
          Meal Plans
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
            Admin Panel
          </NavLink>
        )}
      </nav>
    </aside>
  );
}
