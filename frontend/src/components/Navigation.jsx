import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="nav-header">
      <div className="nav-container">
        <Link to="/" className="logo">
          🧠 MindTrack
        </Link>

        <div className="hamburger" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>
                 
        <ul className={`nav-menu ${isMenuOpen ? 'nav-menu-open' : ''}`}>
          <li>
            <Link
              to="/"
              className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              🏠 Home
            </Link>
          </li>
          
          <li>
            <Link
              to="/parent-login"
              className={`nav-link ${isActive('/parent-login') ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              👨‍👩‍👧‍👦 Parent
            </Link>
          </li>

          <li>
            <Link
              to="/teacher-login"
              className={`nav-link ${isActive('/teacher-login') ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              👩‍🏫 Teacher
            </Link>
          </li>
          
          <li>
            <Link
              to="/counselors"
              className={`nav-link ${isActive('/counselors') ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              🧑‍⚕️ Counselors
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;