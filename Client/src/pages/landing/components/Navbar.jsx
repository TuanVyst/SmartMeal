import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import logo from '../../../assets/SmartMealLogo.png';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="landing-navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src={logo} alt="SmartMeal" className="navbar-logo-img" />
        </Link>
        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <a href="#home" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="#explore" onClick={() => setMenuOpen(false)}>Explore Meals</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
          <div className="navbar-auth">
            <Link to="/login" className="btn-login" onClick={() => setMenuOpen(false)}>Login</Link>
            <Link to="/register" className="btn-register" onClick={() => setMenuOpen(false)}>Register</Link>
          </div>
        </div>
        <button className="navbar-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>
    </nav>
  );
}
