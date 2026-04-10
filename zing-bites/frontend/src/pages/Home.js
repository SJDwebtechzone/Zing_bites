import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Smile, Utensils, Flame, IndianRupee, MapPin, Zap, Leaf, Heart, ShoppingCart, Info, TrendingUp, Star, Clock, Truck } from 'lucide-react';
import './Home.css';

const API = process.env.REACT_APP_API_URL || '/api';
const MAPS_KEY = process.env.REACT_APP_GOOGLE_MAPS_KEY;

const CATEGORIES = [
  { slug: 'street-foods', icon: <img src="/images/cat_street.png" alt="Street Foods" className="cat-real-img" />, name: 'Fast Moving Street Foods', desc: 'Pani Puri, Bhel, Masala Pav & more', color: '#FF6B35' },
  { slug: 'burgers-sandwiches', icon: <img src="/images/cat_burger.png" alt="Burgers" className="cat-real-img" />, name: 'Burgers & Sandwiches', desc: 'Juicy patties, loaded sauces, fresh buns', color: '#e5531d' },
  { slug: 'snacks-sides', icon: <img src="/images/cat_snacks.png" alt="Snacks" className="cat-real-img" />, name: 'Snacks & Sides', desc: 'Fries, nuggets, onion rings & more', color: '#FF8C42' },
  { slug: 'indian-specials', icon: <img src="/images/cat_indian.png" alt="Indian Specials" className="cat-real-img" />, name: 'Indian Street Specials', desc: 'Chole Bhature, Kathi Rolls & classics', color: '#FFB703' },
];

const FOOD_EMOJIS = ['🍔', '🌮', '🍟', '🌶️', '🥙', '🧆', '🥗', '🍕'];

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [truckStatus, setTruckStatus] = useState(null);
  const [location, setLocation] = useState(null);
  const [stats, setStats] = useState({ total_customers: '500+', total_menu_items: '20+', avg_rating: '4.9' });
  const heroRef = useRef(null);

  useEffect(() => {
    fetchStatus();
    fetchStats();
    const interval = setInterval(fetchStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get(`${API}/truck/public-stats`);
      if (data.success) setStats(data.data);
    } catch (err) { console.error('Stats fetch error:', err); }
  };

  const fetchStatus = async () => {
    try {
      const { data } = await axios.get(`${API}/truck/status?t=${Date.now()}`);
      setTruckStatus(data.data);
      setLocation(data.data.location);
    } catch (err) { console.error(err); }
  };

  const handleOrderNow = () => {
    if (user) navigate('/menu');
    else navigate('/login', { state: { from: '/menu' } });
  };

  const isOpen = () => {
    const h = new Date().getHours();
    return h >= 18 && h < 23;
  };

  return (
    <div className="home-page">
      {/* ── Hero ── */}
      <section className="hero" ref={heroRef} style={{ 
        background: `linear-gradient(to right, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.3) 50%, transparent 100%), url('/images/Home.jpeg')`,
        backgroundSize: 'cover',
        backgroundPosition: '82% 40%',
        backgroundRepeat: 'no-repeat'
      }}>
        <div className="hero-content" style={{ paddingLeft: '4.1%' }}>
          <div className="hero-text">
            <div className="hero-badge">
              <span className="status-dots">
                <span className={`status-dot ${truckStatus?.is_open ? 'open' : 'closed'}`}></span>
                <span className={`status-dot ${truckStatus?.is_open ? 'open' : 'closed'}`}></span>
              </span>
              {truckStatus?.status_message || (truckStatus?.is_open ? 'Open Now - 6PM - 11PM' : 'Opens at 6PM - 11PM')}
            </div>
            <h1 className="hero-title">
              <span className="title-white">Fresh Food</span><br />
              <span className="title-orange">On Wheels</span>
            </h1>
            <p className="hero-subtitle">
              Chennai's favourite food truck serving hot, fresh street food every evening.
              Find us across the city from 6 PM to 11 PM!
            </p>
            <div className="hero-buttons">
              <button className="btn btn-primary hero-cta" onClick={handleOrderNow}>
                <ShoppingCart size={18} /> Order Now
              </button>
              <Link 
                to={user ? "/menu" : "/login"} 
                state={{ from: '/menu' }}
                className="btn btn-outline hero-secondary"
              >
                <span className="play-icon-container">
                  <span className="play-icon-inner">▶</span>
                </span>
                View Menu
              </Link>
            </div>
            <div className="hero-stats-new">
              <div className="stat-card">
                <div className="stat-icon-box icon-orange"><Smile size={24} /></div>
                <div className="stat-info">
                  <span className="stat-value">{stats.total_customers}</span>
                  <span className="stat-label">Happy Customers</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-box icon-blue"><Utensils size={24} /></div>
                <div className="stat-info">
                  <span className="stat-value">{stats.total_menu_items}</span>
                  <span className="stat-label">Menu Items</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-box icon-yellow"><Star size={24} /></div>
                <div className="stat-info">
                  <span className="stat-value">{stats.avg_rating}*</span>
                  <span className="stat-label">Rating</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-wave">
          <svg viewBox="0 0 1200 80" preserveAspectRatio="none">
            <path d="M0,40 C300,80 600,0 900,40 C1050,60 1150,20 1200,40 L1200,80 L0,80 Z" fill="#fafafa" />
          </svg>
        </div>
      </section>

      {/* ── Status Banner ── */}
      {!isOpen() && (
        <div className="status-banner">
          <Clock size={20} className="icon-gradient-blue" />
          <p>We're currently closed. Come back today at <strong>6:00 PM</strong> for fresh hot food!</p>
          <Truck size={20} className="icon-gradient-orange" />
        </div>
      )}

      {/* ── Categories ── */}
      <section className="categories-section">
        <div className="container">
          <p className="section-tag">WHAT WE SERVE</p>
          <h2 className="section-title">Our <span>Menu Categories</span></h2>
          <p className="section-subtitle">Four categories of delicious street food — from spicy chaats to loaded burgers</p>

          <div className="categories-grid">
            {CATEGORIES.map((cat, i) => (
              <Link 
                to={user ? `/menu?cat=${cat.slug}` : '/login'} 
                state={{ from: `/menu?cat=${cat.slug}` }}
                key={cat.slug} 
                className="category-card" 
                style={{ '--cat-color': cat.color, animationDelay: `${i * 0.1}s` }}
              >
                <div className="cat-icon">{cat.icon}</div>
                <h3>{cat.name}</h3>
                <p>{cat.desc}</p>
                <span className="cat-arrow">→</span>
              </Link>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link 
              to={user ? '/menu' : '/login'} 
              state={{ from: '/menu' }}
              className="btn btn-primary"
            >
              <TrendingUp size={18} /> View All Menu
            </Link>
          </div>
        </div>
      </section>

      {/* ── Why Us ── */}
      <section className="why-section">
        <div className="container">
          <p className="section-tag">WHY ZING BITES</p>
          <h2 className="section-title">Why Chennai <span>Loves Us</span></h2>
          <div className="why-grid">
            {[
              { icon: <Flame className="icon-gradient-red icon-filled" />, title: 'Always Fresh', desc: 'Every item cooked fresh to order. No reheating, ever.' },
              { icon: <IndianRupee className="icon-gradient-green" />, title: 'Pocket Friendly', desc: 'Premium street food at street-food prices. Starting ₹40!' },
              { icon: <MapPin className="icon-gradient-blue icon-filled" />, title: 'We Come to You', desc: 'Live location tracking. We move around Chennai every evening.' },
              { icon: <Zap className="icon-gradient-yellow icon-filled" />, title: 'Super Fast', desc: 'Order online & pick up in 10-15 minutes. No waiting!' },
              { icon: <Leaf className="icon-gradient-green icon-filled" />, title: 'Fresh Ingredients', desc: 'Local, fresh produce. No artificial colors or preservatives.' },
              { icon: <Heart className="icon-gradient-pink icon-filled" />, title: 'Made with Love', desc: 'Every dish made with passion by our Chennai-born chefs.' },
            ].map((item, i) => (
              <div key={i} className="why-card">
                <div className="why-icon">{item.icon}</div>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Live Location ── */}
      <section className="location-section">
        <div className="container">
          <div className="location-content">
            <div className="location-info">
              <p className="section-tag">FIND US</p>
              <h2 className="section-title">Live <span>Location</span></h2>
              <p className="section-subtitle" style={{ marginBottom: '24px' }}>
                We move around Chennai every evening! Track us live on the map.
              </p>
              <div className="location-details">
                <div className="loc-item">
                  <span className="loc-icon-bubble"><MapPin size={20} className="icon-gradient-red icon-filled" /></span>
                  <div>
                    <strong>Now Serving in Chennai</strong>
                    <p>{location?.area || 'T. Nagar, Chennai'}</p>
                  </div>
                </div>
                <div className="loc-item">
                  <span className="loc-icon-bubble"><Clock size={20} className="icon-gradient-blue" /></span>
                  <div>
                    <strong>Operating Hours</strong>
                    <p>Daily 6:00 PM – 11:00 PM</p>
                  </div>
                </div>
                <div className="loc-item">
                  <span className={isOpen() ? 'pulse-dot open' : 'pulse-dot closed'}>●</span>
                  <div>
                    <strong>{isOpen() ? 'Open Now' : 'Currently Closed'}</strong>
                    <p>{isOpen() ? 'Come grab a bite!' : 'Opens at 6 PM today'}</p>
                  </div>
                </div>
              </div>
              <a href={`https://maps.google.com/?q=${location?.latitude || 13.0418},${location?.longitude || 80.2341}`} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ marginTop: '8px' }}>
                <MapPin size={18} /> Get Directions
              </a>
            </div>
            <div className="map-container">
              {MAPS_KEY ? (
                <iframe
                  title="Zing Bites Location"
                  src={`https://www.google.com/maps/embed/v1/place?key=${MAPS_KEY}&q=${location?.latitude || 13.0418},${location?.longitude || 80.2341}&zoom=15`}
                  width="100%"
                  height="100%"
                  style={{ border: 0, borderRadius: '20px' }}
                  allowFullScreen
                  loading="lazy"
                />
              ) : (
                <div className="map-placeholder">
                  <MapPin size={48} />
                  <h3>Chennai Map</h3>
                  <p>Add GOOGLE_MAPS_KEY in .env to see live map</p>
                  <a href={`https://maps.google.com/?q=13.0418,80.2341`} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ marginTop: '16px' }}>
                    <MapPin size={18} /> Open in Google Maps
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-box">
            <div className="cta-emoji-row">🍔 🌮 🍟 🌶️ 🥙</div>
            <h2>Ready to Order?</h2>
            <p>Fresh, hot food is just a click away. Order online and pick up at our truck!</p>
            <div className="cta-buttons">
              <button className="btn btn-primary" onClick={handleOrderNow}>
                <ShoppingCart size={18} /> Order Now
              </button>
              <Link to="/contact" className="btn btn-outline" style={{ color: 'white', borderColor: 'white' }}>
                <Info size={18} /> Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
