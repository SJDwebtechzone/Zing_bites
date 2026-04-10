import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Loader2, AlertCircle, XCircle, Clock, Package, MapPin, CheckCircle, FileText } from 'lucide-react';
import './Orders.css';

const API = process.env.REACT_APP_API_URL || '/api';

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axios.get(`${API}/orders/my-orders`);
        if (data.success) {
          setOrders(data.data);
        }
      } catch (err) {
        setError('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchOrders();
  }, [user]);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusClass = (status) => {
    return `status-badge status-${status.toLowerCase()}`;
  };

  if (loading) return (
    <div className="orders-page loading">
      <Loader2 className="spinner icon-gradient-orange" size={48} />
      <p>Loading your orders...</p>
    </div>
  );

  return (
    <div className="orders-page">
      <div className="orders-container">
        <div className="orders-header">
          <h1>My <span className="text-orange">Orders</span></h1>
          <p>Track all your Zing Bites orders here</p>
        </div>

        <div className="orders-list-container">
          {error && <div className="error-msg">{error}</div>}

          {orders.length === 0 ? (
            <div className="empty-orders">
              <Package size={64} className="icon-gradient-orange" style={{ marginBottom: '16px', opacity: 0.5 }} />
              <p>You haven't placed any orders yet.</p>
              <button className="btn btn-primary" onClick={() => window.location.href='/menu'}><Package size={18} /> Order Now</button>
            </div>
          ) : (
            <div className="orders-grid">
              {orders.map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-top">
                    <div className="order-id-section">
                      <h3>Order #{order.order_number}</h3>
                      <p className="order-date">
                      {order.status === 'pending' 
                        ? <span className="text-warning"><Clock size={14} className="icon-gradient-yellow" /> Payment Pending</span>
                        : order.status === 'cancelled'
                          ? <span className="text-danger"><XCircle size={14} className="icon-gradient-red icon-filled" /> Payment Cancelled</span>
                          : order.delivered_at 
                            ? `Delivered: ${formatDate(order.delivered_at)}` 
                            : `Est. Delivery: ${formatDate(new Date(new Date(order.created_at).getTime() + 30 * 60000))}`}
                    </p>
                    </div>
                    <span className={getStatusClass(order.status)}>
                      {order.status}
                    </span>
                  </div>

                  <div className="order-main">
                    {order.items && order.items[0] && (
                      <img 
                        src={order.items[0].image_url || '/images/products/placeholder.png'} 
                        alt={order.items[0].name} 
                        className="order-thumb" 
                      />
                    )}
                    <div className="order-items-preview">
                      <p className="item-list-text">
                        {order.items?.map(item => item.name).join(', ').substring(0, 50)}
                        {order.items?.map(item => item.name).join(', ').length > 50 ? '...' : ''}
                      </p>
                      <p className="more-items">
                        {order.items?.length} item{order.items?.length > 1 ? 's' : ''} • {order.payment_status}
                      </p>
                    </div>
                  </div>

                  <div className="order-footer">
                    <p className="order-total-lbl">₹{order.total_amount}</p>
                    <button 
                      className="view-details-btn"
                      onClick={() => setSelectedOrder(order)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detailed Order Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={24} className="icon-gradient-blue icon-filled" /> Order Details</h2>
                <p>#{selectedOrder.order_number}</p>
              </div>
              <button className="close-modal" onClick={() => setSelectedOrder(null)}>&times;</button>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <h4>Items Summary</h4>
                <div className="detail-items">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="detail-item">
                      <img src={item.image_url || '/images/products/placeholder.png'} alt={item.name} className="item-img" />
                      <div className="item-info">
                        <p className="item-name">{item.name}</p>
                        <p className="item-qty">Qty: {item.quantity}</p>
                      </div>
                      <p className="item-price">₹{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="detail-section">
                <h4><FileText size={18} className="icon-gradient-blue" /> Order Summary</h4>
                <div className="summary-card">
                  <div className="summary-row">
                    <span>Ordered At:</span>
                    <span>{formatDate(selectedOrder.created_at)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Delivery Type:</span>
                    <span style={{textTransform:'capitalize'}}>{selectedOrder.delivery_type}</span>
                  </div>
                  {selectedOrder.delivered_at ? (
                    <div className="summary-row">
                      <span>Delivered At:</span>
                      <span>{formatDate(selectedOrder.delivered_at)}</span>
                    </div>
                  ) : selectedOrder.status !== 'cancelled' && (
                    <div className="summary-row">
                      <span>Estimated Arrival:</span>
                      <span>{formatDate(new Date(new Date(selectedOrder.created_at).getTime() + 30 * 60000))}</span>
                    </div>
                  )}
                  <div className="summary-row">
                    <span>Payment Method:</span>
                    <span>{selectedOrder.payment_method || 'Razorpay Online'}</span>
                  </div>
                  <div className="summary-row">
                    <span>Status:</span>
                    <span style={{textTransform:'capitalize', fontWeight:700}}>{selectedOrder.status}</span>
                  </div>
                  <div className="summary-row">
                    <span>Platform Fee:</span>
                    <span>₹30.00</span>
                  </div>
                  <div className="summary-row total">
                    <span>Grand Total:</span>
                    <span>₹{selectedOrder.total_amount}</span>
                  </div>
                </div>
              </div>

              {selectedOrder.address && (
                <div className="detail-section">
                  <h4><MapPin size={18} className="icon-gradient-red icon-filled" /> Delivery Address</h4>
                  <p style={{color:'#666', lineHeight:1.5}}>{selectedOrder.address}</p>
                </div>
              )}

              {selectedOrder.notes && (
                <div className="detail-section">
                  <h4><FileText size={18} className="icon-gradient-orange" /> Notes</h4>
                  <p style={{color:'#666', fontStyle:'italic'}}>{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
