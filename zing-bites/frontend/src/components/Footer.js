import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, MessageSquare, Phone, Mail, MapPin, Clock, Heart, CreditCard, Building2, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Footer.css';

export default function Footer() {
  const { user } = useAuth();
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="container footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <img src="/images/download.png" alt="Zing_Bites Logo" className="footer-logo-img" />
              <div className="footer-brand-text">Zing_<span>Bites</span></div>
            </Link>
            <p>Chennai's most loved food truck bringing fresh, hot street food to your neighbourhood every evening!</p>
            <div className="social-links">
              <a href="#" aria-label="Instagram" className="icon-gradient-pink"><Instagram size={18} /></a>
              <a href="#" aria-label="Facebook" className="icon-gradient-blue"><Facebook size={18} /></a>
              <a href="#" aria-label="Twitter" className="icon-gradient-blue"><Twitter size={18} /></a>
              <a href="https://wa.me/919876543210" aria-label="WhatsApp" className="icon-gradient-green"><MessageSquare size={18} /></a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to={user ? "/menu" : "/login"} state={{ from: '/menu' }}>Our Menu</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Categories</h4>
            <ul>
              <li><Link to={user ? "/menu?cat=street-foods" : "/login"} state={{ from: '/menu?cat=street-foods' }}>Street Foods</Link></li>
              <li><Link to={user ? "/menu?cat=burgers-sandwiches" : "/login"} state={{ from: '/menu?cat=burgers-sandwiches' }}>Burgers</Link></li>
              <li><Link to={user ? "/menu?cat=snacks-sides" : "/login"} state={{ from: '/menu?cat=snacks-sides' }}>Snacks</Link></li>
              <li><Link to={user ? "/menu?cat=indian-specials" : "/login"} state={{ from: '/menu?cat=indian-specials' }}>Indian Specials</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contact Info</h4>
            <ul className="contact-info">
              <li><Phone size={14} className="icon-gradient-green" /> <a href="tel:+919876543210">+91 98765 43210</a></li>
              <li><Mail size={14} className="icon-gradient-red" /> <a href="mailto:hello@zingbites.com">hello@zingbites.com</a></li>
              <li><MapPin size={14} className="icon-gradient-orange" /> Chennai, Tamil Nadu</li>
              <li><Clock size={14} className="icon-gradient-blue" /> Daily: 6:00 PM – 11:00 PM</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>© 2026 Zing Bites. Made with <Heart size={14} className="icon-gradient-red icon-filled" /> in Chennai.</p>
          <div className="payment-icons">
            <span><CreditCard size={14} /> UPI</span>
            <span><Building2 size={14} /> Netbanking</span>
            <span><DollarSign size={14} /> Cards</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
