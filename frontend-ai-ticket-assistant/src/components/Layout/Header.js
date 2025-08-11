import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, Ticket, User, LogOut, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    ...(isAuthenticated ? [
      { path: '/tickets', label: 'Your Tickets', icon: Ticket },
      { path: '/create-ticket', label: 'Create Ticket', icon: Plus },
    ] : []),
  ];

  return (
    <motion.header
      className={`header ${isScrolled ? 'header-scrolled' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <nav className="nav">
        <Link to="/" className="logo">
          <motion.span
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            AI Ticket Assistant
          </motion.span>
        </Link>

        {/* Desktop Navigation */}
        <div className="nav-links desktop-nav">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.icon && <link.icon size={18} />}
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Auth Buttons */}
        <div className="auth-buttons desktop-auth">
          {isAuthenticated ? (
            <div className="user-menu">
              <span className="user-name">
                <User size={18} />
                {user?.userName}
              </span>
              <motion.button
                className="btn btn-outline"
                onClick={handleLogout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut size={18} />
                Logout
              </motion.button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">Login</Link>
              <Link to="/signup" className="btn btn-primary">Sign Up</Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <motion.button
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </motion.button>
      </nav>

      {/* Mobile Menu */}
      <motion.div
        className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}
        initial={false}
        animate={{
          height: isMobileMenuOpen ? 'auto' : 0,
          opacity: isMobileMenuOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="mobile-menu-content">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`mobile-nav-link ${location.pathname === link.path ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.icon && <link.icon size={18} />}
              {link.label}
            </Link>
          ))}
          
          <div className="mobile-auth">
            {isAuthenticated ? (
              <>
                <div className="mobile-user-info">
                  <User size={18} />
                  <span>{user?.userName}</span>
                </div>
                <button className="btn btn-outline" onClick={handleLogout}>
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="btn btn-outline mobile-auth-btn"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="btn btn-primary mobile-auth-btn"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.header>
  );
};

export default Header;