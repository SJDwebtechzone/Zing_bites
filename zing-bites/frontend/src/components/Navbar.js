import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Truck, ShoppingCart, User as UserIcon, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, cartCount } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false); // New state for dropdown
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { 
    setMenuOpen(false); 
    setUserMenuOpen(false); // Close dropdown on navigate
  }, [location]);

  const handleLogout = () => { logout(); setUserMenuOpen(false); navigate('/'); };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/menu', label: 'Menu', requiresAuth: true }, // Menu requires login
    { to: '/about', label: 'About' },
    { to: '/reviews', label: 'Reviews' },
    { to: '/contact', label: 'Contact' },
    { to: '/admin', label: 'Admin', requiresAdmin: true }, // Admin requires admin role
  ];

  const shouldScroll = scrolled || location.pathname !== '/';

  return (
    <nav className={`navbar ${shouldScroll ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <img src="/images/download.png" alt="Zing_Bites Logo" className="brand-logo-img" />
          <span className="brand-text">ZING_<span>BITES</span></span>
        </Link>

        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {navLinks.map(link => {
            // Check visibility conditions
            const isVisible = (!link.requiresAuth || user) && 
                            (!link.requiresAdmin || (user && user.is_admin));
            
            return isVisible ? (
              <Link
                key={link.to}
                to={link.to}
                className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ) : null;
          })}
        </div>

        <div className="nav-actions">
          <Link to="/cart" className="cart-btn-white">
            <ShoppingCart size={20} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          {user ? (
            <div className={`user-menu ${userMenuOpen ? 'open' : ''}`}>
              <button className="user-btn" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                <span className="user-avatar">{user.name ? user.name[0].toUpperCase() : 'Z'}</span>
                <span className="user-name">{user.is_admin ? 'ZingAdmin' : (user.name || 'User')}</span>
                <ChevronDown size={14} />
              </button>
              <div className="user-dropdown">
                <Link to="/orders"><UserIcon size={14} /> My Orders</Link>
                <button onClick={handleLogout}><LogOut size={14} /> Logout</button>
              </div>
            </div>
          ) : (
            <div className="guest-actions">
              <Link to="/login" className="btn btn-outline nav-auth-btn">Login</Link>
              <Link to="/register" className="btn btn-primary nav-auth-btn">Sign Up</Link>
            </div>
          )}
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <span className={menuOpen ? 'open' : ''}></span>
            <span className={menuOpen ? 'open' : ''}></span>
            <span className={menuOpen ? 'open' : ''}></span>
          </button>
        </div>
      </div>
    </nav>
  );
}
