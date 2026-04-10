import React, { useState } from 'react';
import axios from 'axios';
import { Phone, Mail, MapPin, Send, MessageSquare, CheckCircle, AlertTriangle, Clock, User, Smartphone } from 'lucide-react';
import './Contact.css';

const API = process.env.REACT_APP_API_URL || '/api';
const MAPS_KEY = process.env.REACT_APP_GOOGLE_MAPS_KEY;

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { setError('Please fill in required fields'); return; }
    setError(''); setLoading(true);
    try {
      const { data } = await axios.post(`${API}/truck/contact`, form);
      if (data.success) {
        setSuccess(data.message);
        setForm({ name: '', email: '', phone: '', message: '' });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message. Try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="contact-page">
      {/* Header */}
      <section className="contact-hero">
        <div className="contact-hero-bg">
          {['📞', '✉️', '📍', '💬', '🤝', '❤️'].map((e, i) => (
            <span key={i} className={`contact-float cf-${i}`}>{e}</span>
          ))}
        </div>
        <div className="container">
          <span className="section-tag" style={{ color: 'var(--orange-light)' }}>GET IN TOUCH</span>
          <h1>Contact <span>Zing Bites</span></h1>
          <p>Have a question, feedback, or just want to say hi? We'd love to hear from you!</p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="contact-info-section">
        <div className="container">
          <div className="contact-info-grid">
            {[
              { icon: <Phone size={24} className="icon-gradient-green icon-filled" />, title: 'Call Us', value: '+91 98765 43210', sub: 'Mon–Sun, 5 PM – 11:30 PM', link: 'tel:+919876543210' },
              { icon: <Mail size={24} className="icon-gradient-red icon-filled" />, title: 'Email Us', value: 'hello@zingbites.com', sub: 'We reply within 24 hours', link: 'mailto:hello@zingbites.com' },
              { icon: <MapPin size={24} className="icon-gradient-orange icon-filled" />, title: 'Find Us', value: 'Chennai, Tamil Nadu', sub: 'Track us live on our website', link: null },
              { icon: <MessageSquare size={24} className="icon-gradient-green icon-filled" />, title: 'WhatsApp', value: '+91 98765 43210', sub: 'Quick replies on WhatsApp', link: 'https://wa.me/919876543210' },
            ].map((item, i) => (
              <div key={i} className="info-card">
                <div className="info-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                {item.link ? (
                  <a href={item.link} target={item.link.startsWith('http') ? '_blank' : undefined} rel="noreferrer">{item.value}</a>
                ) : <p className="info-value">{item.value}</p>}
                <p className="info-sub">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form + Map */}
      <section className="contact-body">
        <div className="container contact-grid">
          {/* Form */}
          <div className="contact-form-card">
            <h2>Send Us a <span>Message</span></h2>
            <p>We'll get back to you as soon as possible!</p>

            {success && (
              <div className="contact-success">
                <CheckCircle size={24} className="icon-gradient-green icon-filled" />
                <div>
                  <strong>Message Sent!</strong>
                  <p>{success}</p>
                </div>
              </div>
            )}
            {error && <div className="contact-error"><AlertTriangle size={18} className="icon-gradient-yellow icon-filled" /> {error}</div>}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <div className="input-wrapper">
                    <User size={18} className="icon-gradient-orange" />
                    <input name="name" type="text" placeholder="Your name" value={form.name} onChange={handleChange} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <div className="input-wrapper">
                    <Mail size={18} className="icon-gradient-blue" />
                    <input name="email" type="email" placeholder="your@email.com" value={form.email} onChange={handleChange} required />
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <div className="input-wrapper">
                  <Smartphone size={18} className="icon-gradient-green" />
                  <input name="phone" type="tel" placeholder="+91 98765 43210 (optional)" value={form.phone} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label>Message *</label>
                <div className="textarea-wrapper">
                  <textarea name="message" placeholder="Write your message here... Tell us about your experience, feedback, or any questions!" value={form.message} onChange={handleChange} rows={5} required />
                </div>
              </div>
              <button type="submit" className="btn btn-primary send-btn" disabled={loading}>
                {loading ? '⏳ Sending...' : <><Send size={18} /> Send Message</>}
              </button>
            </form>
          </div>

          {/* Map */}
          <div className="contact-map-section">
            <h2>Find Us <span>on Map</span></h2>
            <p>We roam around Chennai — track our live location!</p>
            <div className="contact-map" style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', border: '6px solid white', boxShadow: 'var(--shadow-lg)' }}>
              <iframe
                title="Zing Bites Location"
                src="https://maps.google.com/maps?q=13.0418,80.2341&z=15&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, display: 'block' }}
                allowFullScreen
                loading="lazy"
              />
              <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 10, width: 'max-content' }}>
                <a href="https://maps.google.com/?q=13.0418,80.2341" target="_blank" rel="noreferrer" className="btn btn-primary" style={{ boxShadow: '0 8px 20px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={18} /> Open in Google Maps
                </a>
              </div>
            </div>

            <div className="quick-contact-tips">
              <div className="tip">
                <Clock size={20} className="icon-gradient-blue" />
                <div>
                  <strong>Operating Hours</strong>
                  <p>Daily 6:00 PM – 11:00 PM</p>
                </div>
              </div>
              <div className="tip">
                <Smartphone size={20} className="icon-gradient-green" />
                <div>
                  <strong>Fastest Response</strong>
                  <p>WhatsApp or calling us directly</p>
                </div>
              </div>
              <div className="tip">
                <MapPin size={20} className="icon-gradient-red icon-filled" />
                <div>
                  <strong>Location Updates</strong>
                  <p>Follow us on social media for daily location updates!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
