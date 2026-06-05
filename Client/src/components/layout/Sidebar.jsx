import { NavLink } from 'react-router-dom';
import './Sidebar.css';

export default function Sidebar() {
  return (
    <aside className="main-sidebar">
      <div className="sidebar-logo">
        <h2>SmartMeal</h2>
      </div>
      <nav className="sidebar-nav">
        <NavLink 
          to="/" 
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
      </nav>
    </aside>
  );
}
