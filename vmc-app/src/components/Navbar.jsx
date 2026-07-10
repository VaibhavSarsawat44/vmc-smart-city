import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, AlertTriangle, Info, Menu, LogOut, Landmark } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // In a real app we'd clear auth tokens here.
    navigate('/');
  };

  return (
    <nav className="navbar glass-panel">
      <div className="navbar-container">
        <div className="navbar-logo">
          <div className="logo-icon-wrapper">
            <Landmark size={24} color="#10B981" />
          </div>
          <span className="logo-text">VMC <span className="text-muted">Vadodara</span></span>
        </div>

        <ul className="nav-links">
          <li>
            <a href="#home" className="nav-link active">
              <Home size={18} />
              <span>Home</span>
            </a>
          </li>
          <li>
            <a href="#report-issue" className="nav-link">
              <AlertTriangle size={18} />
              <span>Report Issue</span>
            </a>
          </li>
          <li>
            <a href="#about" className="nav-link">
              <Info size={18} />
              <span>About Us</span>
            </a>
          </li>
          <li>
            <button onClick={handleLogout} className="nav-link logout-nav-btn">
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </li>
        </ul>

        <button className="mobile-menu-btn">
          <Menu size={24} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
