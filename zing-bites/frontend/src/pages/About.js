import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, Leaf, Target, Users, Flame, UtensilsCrossed, Clock, Star, Compass, Phone, Mail, MapPin, CheckCircle } from 'lucide-react';
import './About.css';

const TEAM_VALUES = [
  { icon: <Heart className="icon-gradient-red" size={32} strokeWidth={2.5} />, title: 'Passion for Food', desc: 'Every dish is made with genuine love and passion for authentic Chennai street food culture.' },
  { icon: <Leaf className="icon-gradient-green" size={32} strokeWidth={2.5} />, title: 'Fresh Ingredients', desc: 'We source only the freshest local produce from Chennai\'s best suppliers, daily.' },
  { icon: <Target className="icon-gradient-orange" size={32} strokeWidth={2.5} />, title: 'Consistency', desc: 'Same great taste, every single day. No shortcuts, no compromises — ever.' },
  { icon: <Users className="icon-gradient-blue" size={32} strokeWidth={2.5} />, title: 'Community', desc: 'We\'re not just a food truck — we\'re part of Chennai\'s vibrant street food community.' },
];

const SPECIALS = [
  { emoji: <img src="/images/burger_real.png" alt="Zing Special Burger" className="special-real-img" />, name: 'Zing Special Burger', desc: 'Our signature double-patty burger with secret Zing sauce', price: '₹180', target: '/menu?cat=burgers-sandwiches' },
  { emoji: <img src="/images/chole_real.png" alt="Chole Bhature" className="special-real-img" />, name: 'Chole Bhature', desc: 'Spicy chickpea curry with fluffy fried bhature', price: '₹130', target: '/menu?cat=indian-specials' },
  { emoji: <img src="/images/panipuri_real.png" alt="Pani Puri" className="special-real-img" />, name: 'Pani Puri', desc: 'Crispy puris with our tangy secret tamarind water', price: '₹50', target: '/menu?cat=street-foods' },
  { emoji: <img src="/images/kathi_roll_real.png" alt="Chicken Kathi Roll" className="special-real-img" />, name: 'Chicken Kathi Roll', desc: 'Paratha wrap with spiced chicken and fresh onions', price: '₹140', target: '/menu?cat=indian-specials' },
];

export default function About() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleDishClick = (target) => {
    if (user) navigate(target);
    else navigate('/login', { state: { from: target } });
  };

  return (
    <div className="about-page">
      {/* Hero */}
      <section className="about-hero">
        <div className="about-hero-bg">
          {['🍔', '🌮', '🍟', '🌶️', '🥙', '🧆'].map((e, i) => (
            <span key={i} className={`float-emoji fe-${i}`}>{e}</span>
          ))}
        </div>
        <div className="container about-hero-content">
          <div className="about-hero-text">
            <span className="section-tag">OUR STORY</span>
            <h1>The <span>Zing Bites</span><br />Story</h1>
            <p>
              Born from a love of Chennai's legendary street food culture, Zing Bites started as a single food cart 
              in T. Nagar in 2026. Today, we're Chennai's most beloved food truck — bringing fresh, hot, authentic 
              street food to neighbourhoods across the city every evening.
            </p>
            <Link 
              to={user ? "/menu" : "/login"} 
              state={{ from: '/menu' }}
              className="btn btn-primary"
            >
              <UtensilsCrossed size={18} /> Try Our Food
            </Link>
          </div>
          <div className="about-hero-visual">
            <div className="about-truck-card">
              <img src="/images/download.png" alt="Zing_Bites Logo" className="truck-emoji-big about-logo-big" />
              <div className="truck-card-info">
                <h3>Zing Bites</h3>
                <p>Chennai, Tamil Nadu</p>
                <div className="truck-open-time"><Clock size={16} /> 6 PM – 11 PM Daily</div>
              </div>
            </div>
            <div className="about-stat-cards">
              <div className="mini-stat"><span>2026</span><p>Founded</p></div>
              <div className="mini-stat"><span>500+</span><p>Customers</p></div>
              <div className="mini-stat"><span>20+</span><p>Menu Items</p></div>
              <div className="mini-stat"><span><Star size={14} /> 4.9★</span><p>Rating</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="mission-section">
        <div className="container">
          <div className="mission-grid">
            <div className="mission-card">
              <div className="mission-icon"><Target size={32} className="icon-gradient-orange icon-filled" /></div>
              <h3>Our Mission</h3>
              <p>
                To bring the authentic flavours of Chennai's legendary street food scene to every corner of the city — 
                fresh, affordable, and made with heart. We believe great food shouldn't be limited to fancy restaurants.
              </p>
            </div>
            <div className="mission-card vision">
              <div className="mission-icon"><Compass size={32} className="icon-gradient-purple" /></div>
              <h3>Our Vision</h3>
              <p>
                To become Tamil Nadu's most loved mobile food brand by keeping traditional recipes alive while 
                innovating with modern tastes — always serving with a smile and Zing's signature flavour!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Special Foods */}
      <section className="specials-section">
        <div className="container">
          <span className="section-tag">SIGNATURE DISHES</span>
          <h2 className="section-title">Our <span>Special Foods</span></h2>
          <p className="section-subtitle">These are the dishes that made Chennai fall in love with Zing Bites</p>
          <div className="specials-grid">
            {SPECIALS.map((item, i) => (
              <div 
                key={i} 
                className="special-card" 
                style={{ animationDelay: `${i * 0.1}s` }}
                onClick={() => handleDishClick(item.target)}
              >
                <div className="special-emoji">{item.emoji}</div>
                <h4>{item.name}</h4>
                <p>{item.desc}</p>
                <span className="special-price">{item.price}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="values-section">
        <div className="container">
          <span className="section-tag">WHAT DRIVES US</span>
          <h2 className="section-title">Our <span>Values</span></h2>
          <div className="values-grid">
            {TEAM_VALUES.map((val, i) => (
              <div key={i} className="value-card">
                <div className="value-icon">{val.icon}</div>
                <h4>{val.title}</h4>
                <p>{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-us-section">
        <div className="container why-us-content">
          <div className="why-us-text">
            <span className="section-tag">WHY CHOOSE US</span>
            <h2 className="section-title">Why <span>10,000+ Chennaites</span><br/>Trust Zing Bites</h2>
            <div className="why-us-list">
              {[
                { text: 'Cooked fresh to order — no reheating', color: 'icon-gradient-orange' },
                { text: 'Premium ingredients, street food prices', color: 'icon-gradient-green' },
                { text: 'Real-time live location tracking', color: 'icon-gradient-blue' },
                { text: 'Online ordering with Razorpay', color: 'icon-gradient-purple' },
                { text: 'Tamil AI assistant for ordering help', color: 'icon-gradient-pink' },
                { text: 'Operating daily from 6 PM to 11 PM', color: 'icon-gradient-yellow' },
              ].map((item, i) => (
                <p key={i}><CheckCircle size={18} className={`${item.color} icon-filled`} /> {item.text}</p>
              ))}
            </div>
            <Link to="/contact" className="btn btn-primary"><Phone size={18} /> Get In Touch</Link>
          </div>
          <div className="why-us-visual">
            <div className="hours-card">
              <div className="hours-header">
                <img src="/images/download.png" alt="Zing_Bites Logo" className="hours-logo" />
                <h3>Operating Hours</h3>
              </div>
              <div className="hours-body">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                  <div key={day} className="hour-row">
                    <span>{day}</span>
                    <span className="hour-time">6:00 PM – 11:00 PM</span>
                  </div>
                ))}
              </div>
              <div className="hours-footer">
                <span><MapPin size={18} /> Serving all over Chennai</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="about-contact-section">
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center' }}>Get In <span>Touch</span></h2>
          <div className="contact-cards">
            <div className="contact-info-card">
              <Phone size={24} className="icon-gradient-green icon-filled" />
              <h4>Call Us</h4>
              <a href="tel:+919876543210">+91 98765 43210</a>
            </div>
            <div className="contact-info-card">
              <Mail size={24} className="icon-gradient-red icon-filled" />
              <h4>Email Us</h4>
              <a href="mailto:hello@zingbites.com">hello@zingbites.com</a>
            </div>
            <div className="contact-info-card">
              <MapPin size={24} className="icon-gradient-orange icon-filled" />
              <h4>Find Us</h4>
              <p>Chennai, Tamil Nadu</p>
            </div>
            <div className="contact-info-card">
              <Clock size={24} className="icon-gradient-blue" />
              <h4>Hours</h4>
              <p>Daily 6 PM – 11 PM</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
