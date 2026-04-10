import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Utensils, 
  MapPin, 
  Mail, 
  RefreshCw, 
  TrendingUp, 
  Users,
  Package,
  CheckCircle,
  XCircle,
  IndianRupee,
  Star,
  MessageSquare
} from 'lucide-react';
import './Admin.css';

const API = process.env.REACT_APP_API_URL || '/api';

const TABS = ['Dashboard', 'Orders', 'Products', 'Customers', 'Location', 'Messages', 'Feedback'];
const ORDER_STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('Dashboard');
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [replyText, setReplyText] = useState({});
  const [truckStatus, setTruckStatus] = useState({ is_open: false, status_message: '' });
  const [location, setLocation] = useState({ latitude: 13.0418, longitude: 80.2341, address: '', area: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.is_admin) { navigate('/'); return; }
    fetchAll();
  }, [user]);

  const fetchAll = async () => {
    try {
      const endpoints = [
        `${API}/truck/admin/stats`,
        `${API}/orders/all`,
        `${API}/products`,
        `${API}/truck/contact/messages`,
        `${API}/truck/status`,
        `${API}/feedback/admin/all`,
        `${API}/auth/users`
      ];

      const results = await Promise.allSettled(endpoints.map(ep => axios.get(ep)));

      const [statsRes, ordersRes, productsRes, msgRes, statusRes, feedbackRes, usersRes] = results;

      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data.data);
      if (ordersRes.status === 'fulfilled') setOrders(ordersRes.value.data.data);
      if (productsRes.status === 'fulfilled') setProducts(productsRes.value.data.data);
      if (msgRes.status === 'fulfilled') setMessages(msgRes.value.data.data);
      if (feedbackRes.status === 'fulfilled') setFeedbacks(feedbackRes.value.data.data);
      if (usersRes.status === 'fulfilled') setCustomers(usersRes.value.data.data);
      
      if (statusRes.status === 'fulfilled') {
        const data = statusRes.value.data.data;
        setTruckStatus({ is_open: data.is_open, status_message: data.status_message || '' });
        if (data.location) setLocation(data.location);
      }

      if (results.some(r => r.status === 'rejected')) {
        console.warn('Some data failed to load');
      }

    } catch (err) { 
      console.error('Fetch error:', err);
      toast.error('Failed to load data'); 
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await axios.patch(`${API}/orders/${id}/status`, { status });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      toast.success('Order updated!');
    } catch { toast.error('Failed to update'); }
  };

  const toggleProduct = async (id) => {
    try {
      await axios.patch(`${API}/products/${id}/toggle`);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, is_available: !p.is_available } : p));
      toast.success('Availability updated!');
    } catch { toast.error('Failed to update'); }
  };

  const updateTruckStatus = async () => {
    try {
      await axios.patch(`${API}/truck/status`, truckStatus);
      toast.success('Truck status updated!');
    } catch { toast.error('Failed to update'); }
  };

  const updateLocation = async () => {
    try {
      await axios.put(`${API}/truck/location`, location);
      toast.success('Location updated!');
    } catch { toast.error('Failed to update'); }
  };

  const markRead = async (id) => {
    try {
      await axios.patch(`${API}/truck/contact/messages/${id}/read`);
      setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m));
    } catch {}
  };

  const handleFeedbackReply = async (id) => {
    if (!replyText[id]) return;
    try {
      await axios.patch(`${API}/feedback/${id}/reply`, { reply: replyText[id] });
      setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, admin_reply: replyText[id], replied_at: new Date() } : f));
      toast.success('Reply sent to customer!');
    } catch { toast.error('Failed to send reply'); }
  };

  if (!user?.is_admin) return null;

  return (
    <div className="admin-page">
      <div className="admin-sidebar">
        <div className="admin-brand">
          <span>Zing_<span style={{color: '#FF6B35'}}>Admin</span></span>
        </div>
        <nav className="admin-nav">
          {TABS.map(t => (
            <button key={t} className={`admin-nav-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              <span className="nav-icon">
                {t === 'Dashboard' && <LayoutDashboard size={18} />}
                {t === 'Orders' && <ShoppingBag size={18} />}
                {t === 'Products' && <Utensils size={18} />}
                {t === 'Location' && <MapPin size={18} />}
                {t === 'Messages' && <Mail size={18} />}
                {t === 'Customers' && <Users size={18} />}
                {t === 'Feedback' && <MessageSquare size={18} />}
              </span>
              <span className="nav-text">{t}</span>
              {t === 'Messages' && messages.filter(m => !m.is_read).length > 0 && (
                <span className="nav-badge">{messages.filter(m => !m.is_read).length}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="admin-content">
        <div className="admin-header">
          <h1>{tab}</h1>
          <button className="btn btn-outline refresh-btn" onClick={fetchAll}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Dashboard */}
        {tab === 'Dashboard' && stats && (
          <div className="dashboard">
            <div className="stats-grid">
              {[
                { label: 'Total Orders', value: stats.total_orders, icon: <ShoppingBag />, color: '#FF6B35' },
                { label: "Today's Orders", value: stats.today_orders, icon: <Package />, color: '#FFB703' },
                { label: 'Total Revenue', value: `₹${parseFloat(stats.total_revenue).toLocaleString('en-IN')}`, icon: <IndianRupee size={22} />, color: '#22c55e' },
                { label: "Today's Revenue", value: `₹${parseFloat(stats.today_revenue).toLocaleString('en-IN')}`, icon: <TrendingUp size={22} />, color: '#3b82f6' },
                { label: 'Total Users', value: stats.total_users, icon: <Users />, color: '#8b5cf6' },
                { label: 'Unread Messages', value: stats.unread_messages, icon: <Mail />, color: '#ef4444' },
                { label: 'Avg Rating', value: `${stats.avg_rating} ⭐`, icon: <Star />, color: '#FFB703' },
              ].map((s, i) => (
                <div key={i} className="stat-card" style={{ '--color': s.color }}>
                  <div className="stat-icon-wrap" style={{ background: `${s.color}15`, color: s.color }}>
                    {s.icon}
                  </div>
                  <div className="stat-info">
                    <p className="stat-label">{s.label}</p>
                    <h3 className="stat-value">{s.value}</h3>
                  </div>
                </div>
              ))}
            </div>

            <div className="truck-control">
              <h3>Truck Control</h3>
              <div className="control-row">
                <label className="toggle-label">
                  <span>Truck Status:</span>
                  <div className={`toggle-switch ${truckStatus.is_open ? 'on' : 'off'}`} onClick={() => setTruckStatus(prev => ({ ...prev, is_open: !prev.is_open }))}>
                    <div className="toggle-thumb"></div>
                  </div>
                  <span className={truckStatus.is_open ? 'open-text' : 'closed-text'}>
                    <span className="status-dots" style={{ marginRight: '8px' }}>
                      <span className={`status-dot ${truckStatus.is_open ? 'open' : 'closed'}`}></span>
                      <span className={`status-dot ${truckStatus.is_open ? 'open' : 'closed'}`}></span>
                    </span>
                    {truckStatus.is_open ? ' Open' : ' Closed'}
                  </span>
                </label>
                <input className="admin-input" value={truckStatus.status_message} onChange={e => setTruckStatus(prev => ({ ...prev, status_message: e.target.value }))} placeholder="Status message..." />
                <button className="btn btn-primary" onClick={updateTruckStatus} style={{ padding: '10px 20px' }}>Save</button>
              </div>
            </div>
          </div>
        )}

        {/* Orders */}
        {tab === 'Orders' && (
          <div className="orders-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>Order #</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th></tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td><strong>#{order.order_number}</strong></td>
                    <td>
                      <div>{order.user_name}</div>
                      <small>{order.user_phone}</small>
                    </td>
                    <td>{order.items?.map(i => `${i.name} x${i.quantity}`).join(', ') || '-'}</td>
                    <td>
                      <strong>₹{order.total_amount}</strong>
                      <div className="text-muted" style={{fontSize: '11px'}}>₹30.00 Fee Incl.</div>
                    </td>
                    <td><span className={`badge badge-${order.payment_status === 'paid' ? 'green' : 'red'}`}>{order.payment_status}</span></td>
                    <td>
                      <select className="status-select" value={order.status} onChange={e => updateOrderStatus(order.id, e.target.value)}>
                        {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td><small>{new Date(order.created_at).toLocaleDateString('en-IN')}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && <div className="empty-state">No orders yet! 📦</div>}
          </div>
        )}

        {/* Products */}
        {tab === 'Products' && (
          <div className="products-admin-grid">
            {products.map(p => (
              <div key={p.id} className={`product-admin-card ${!p.is_available ? 'unavail' : ''}`}>
                <div className="pa-header">
                  <span>{p.is_vegetarian ? '🟢' : '🔴'}</span>
                  <h4>{p.name}</h4>
                  <strong>₹{p.price}</strong>
                </div>
                <p>{p.category_name}</p>
                <div className="pa-footer">
                  <span className={`badge ${p.is_available ? 'badge-green' : 'badge-red'}`}>
                    {p.is_available ? 'Available' : 'Unavailable'}
                  </span>
                  <button className={`toggle-avail-btn ${p.is_available ? 'make-unavail' : 'make-avail'}`} onClick={() => toggleProduct(p.id)}>
                    {p.is_available ? '❌ Disable' : '✅ Enable'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Customers */}
        {tab === 'Customers' && (
          <div className="orders-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(customer => (
                  <tr key={customer.id}>
                    <td><strong>#{customer.id}</strong></td>
                    <td>{customer.name}</td>
                    <td>{customer.email || 'N/A'}</td>
                    <td>{customer.phone || 'N/A'}</td>
                    <td><small>{new Date(customer.created_at).toLocaleDateString('en-IN')}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {customers.length === 0 && <div className="empty-state">No customers found! 👥</div>}
          </div>
        )}

        {/* Location */}
        {tab === 'Location' && (
          <div className="location-admin">
            <div className="admin-card">
              <h3>Update Truck Location</h3>
              <div className="location-form">
                <div className="form-group">
                  <label>Latitude</label>
                  <input className="admin-input" type="number" step="0.0001" value={location.latitude} onChange={e => setLocation(p => ({ ...p, latitude: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Longitude</label>
                  <input className="admin-input" type="number" step="0.0001" value={location.longitude} onChange={e => setLocation(p => ({ ...p, longitude: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Area Name</label>
                  <input className="admin-input" value={location.area} onChange={e => setLocation(p => ({ ...p, area: e.target.value }))} placeholder="e.g., T. Nagar" />
                </div>
                <div className="form-group">
                  <label>Full Address</label>
                  <input className="admin-input" value={location.address} onChange={e => setLocation(p => ({ ...p, address: e.target.value }))} placeholder="Full address..." />
                </div>
              </div>
              <button className="btn btn-primary" onClick={updateLocation}>📍 Update Location</button>

              <div className="location-presets">
                <h4>Quick Presets (Chennai)</h4>
                <div className="preset-btns">
                  {[
                    { name: 'T. Nagar', lat: 13.0418, lng: 80.2341 },
                    { name: 'Anna Nagar', lat: 13.0850, lng: 80.2101 },
                    { name: 'Adyar', lat: 13.0012, lng: 80.2565 },
                    { name: 'Velachery', lat: 12.9816, lng: 80.2209 },
                    { name: 'Porur', lat: 13.0339, lng: 80.1573 },
                    { name: 'Tambaram', lat: 12.9229, lng: 80.1275 },
                  ].map(p => (
                    <button key={p.name} className="preset-btn" onClick={() => setLocation(prev => ({ ...prev, latitude: p.lat, longitude: p.lng, area: p.name, address: `${p.name}, Chennai` }))}>
                      📍 {p.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {tab === 'Messages' && (
          <div className="messages-admin">
            {messages.map(msg => (
              <div key={msg.id} className={`message-card ${!msg.is_read ? 'unread' : ''}`}>
                <div className="msg-header">
                  <div>
                    <strong>{msg.name}</strong>
                    <span className="msg-email">{msg.email}</span>
                    {msg.phone && <span className="msg-phone">📞 {msg.phone}</span>}
                  </div>
                  <div className="msg-meta">
                    <small>{new Date(msg.created_at).toLocaleString('en-IN')}</small>
                    {!msg.is_read && <span className="unread-dot">●</span>}
                  </div>
                </div>
                <p className="msg-text">{msg.message}</p>
                {!msg.is_read && <button className="mark-read-btn" onClick={() => markRead(msg.id)}>✅ Mark as Read</button>}
              </div>
            ))}
            {messages.length === 0 && <div className="empty-state">No messages yet! ✉️</div>}
          </div>
        )}

        {/* Feedback */}
        {tab === 'Feedback' && (
          <div className="feedback-admin">
            {feedbacks.map(f => (
              <div key={f.id} className="feedback-admin-card">
                <div className="fa-header">
                  <div className="fa-user-info">
                    <h4>{f.user_name} <small style={{color: '#888', fontWeight: 400}}>({f.user_email})</small></h4>
                    <span className="fa-order-info">Order #{f.order_number}</span>
                  </div>
                  <div className="fa-rating">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill={i < f.rating ? "#FFB703" : "none"} stroke={i < f.rating ? "#FFB703" : "#ccc"} />
                    ))}
                  </div>
                </div>
                <div className="fa-comment">
                  <p>"{f.comment}"</p>
                  <small style={{display: 'block', marginTop: '10px', color: '#888'}}>
                    Submitted on: {new Date(f.created_at).toLocaleString('en-IN')}
                  </small>
                </div>
                
                <div className="fa-reply-section">
                  <h5>{f.admin_reply ? '✅ Replied' : '💬 Send a Response'}</h5>
                  {f.admin_reply ? (
                    <div className="fa-reply-content">
                      <p className="fa-reply-display">{f.admin_reply}</p>
                      <span className="fa-reply-date">Replied on: {new Date(f.replied_at).toLocaleString('en-IN')}</span>
                    </div>
                  ) : (
                    <div className="fa-reply-form">
                      <textarea 
                        className="fa-reply-input" 
                        placeholder="Write your response to the customer here..."
                        value={replyText[f.id] || ''}
                        onChange={(e) => setReplyText(prev => ({...prev, [f.id]: e.target.value}))}
                      />
                      <button className="btn btn-primary" onClick={() => handleFeedbackReply(f.id)}>
                        Send Reply Email
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {feedbacks.length === 0 && <div className="empty-state">No feedback received yet! ⭐</div>}
          </div>
        )}
      </div>
    </div>
  );
}
