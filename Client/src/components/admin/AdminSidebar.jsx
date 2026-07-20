import { NavLink, useNavigate } from 'react-router-dom';
import { FiGrid, FiUsers, FiTag, FiLogOut, FiMenu, FiX, FiShoppingBag, FiAward, FiHeart } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import './AdminSidebar.css';

export default function AdminSidebar() {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { to: '/admin', icon: <FiGrid />, label: 'Dashboard', end: true },
    { to: '/admin/users', icon: <FiUsers />, label: 'Users' },
    { to: '/admin/ingredient-tags', icon: <FiShoppingBag />, label: 'Ingredient Tags' },
    { to: '/admin/ingredients', icon: <FiHeart />, label: 'Ingredients' },
    { to: '/admin/recipe-tags', icon: <FiAward />, label: 'Recipe Tags' },
    { to: '/admin/recipes', icon: <FiHeart />, label: 'Recipes' },
    { to: '/admin/categories', icon: <FiTag />, label: 'Categories' },
    { to: '/admin/plans', icon: <FiAward />, label: 'Plans' },
    { to: '/admin/statistics', icon: <FiGrid />, label: 'Statistics' },
  ];

  return (
    <>
      <button className="admin-sidebar-toggle" onClick={() => setOpen(!open)}>
        {open ? <FiX size={22} /> : <FiMenu size={22} />}
      </button>
      <aside className={`admin-sidebar ${open ? 'open' : ''}`}>
        <div className="admin-sidebar-logo">
          <h2>SmartMeal</h2>
          <span>Quản trị</span>
        </div>
        <nav className="admin-sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}
              onClick={() => setOpen(false)}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <button className="admin-nav-item logout-btn" onClick={handleLogout}>
            <span className="admin-nav-icon"><FiLogOut /></span>
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>
      {open && <div className="admin-sidebar-overlay" onClick={() => setOpen(false)} />}
    </>
  );
}
