import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { ShoppingCart, UtensilsCrossed, Utensils, Trash2, MapPin, Zap, Lock, Truck, ArrowLeft, CheckCircle, Minus, Plus, AlertCircle, Clock } from 'lucide-react';
import './Cart.css';

const API = process.env.REACT_APP_API_URL || '/api';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart, cartTotal, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const checkoutFormRef = useRef(null);

  // Checkout Details State
  const [checkoutData, setCheckoutData] = useState({
    name: '',
    phone: '',
    address: ''
  });

  // OTP State
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showTruckClosedModal, setShowTruckClosedModal] = useState(false);
  const [truckStatus, setTruckStatus] = useState({ is_open: true });
  const [lastOrderDetails, setLastOrderDetails] = useState({ number: '', amount: 0, items: [] });
  const [showDiscountPopup, setShowDiscountPopup] = useState(false);
  const [currentDiscountMilestone, setCurrentDiscountMilestone] = useState(0);

  // Calculate discount
  let discountPercentage = 0;
  if (cartTotal >= 400) discountPercentage = 20;
  else if (cartTotal >= 300) discountPercentage = 15;
  else if (cartTotal >= 200) discountPercentage = 10;
  else if (cartTotal >= 100) discountPercentage = 8;

  const discountAmount = (cartTotal * discountPercentage) / 100;
  const finalTotal = cartTotal - discountAmount + 30; // 30 represents platform fee

  // Discount Popup Trigger
  useEffect(() => {
    let milestone = 0;
    if (cartTotal >= 400) milestone = 400;
    else if (cartTotal >= 300) milestone = 300;
    else if (cartTotal >= 200) milestone = 200;
    else if (cartTotal >= 100) milestone = 100;

    if (milestone > currentDiscountMilestone && milestone > 0) {
      setShowDiscountPopup(true);
    }
    if (milestone !== currentDiscountMilestone) {
      setCurrentDiscountMilestone(milestone);
    }
  }, [cartTotal, currentDiscountMilestone]);

  // Pre-fill details if user is logged in
  useEffect(() => {
    if (user) {
      setCheckoutData(prev => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || ''
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCheckoutData(prev => ({ ...prev, [name]: value }));
  };

  const isFormValid = () => {
    return checkoutData.name.trim() !== '' &&
      checkoutData.phone.trim() !== '' &&
      checkoutData.address.trim() !== '';
  };

  // Step 1: Send OTP
  const initiateCheckout = async (skipDiscountCheck = false) => {
    const scrollToForm = () => {
      checkoutFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    if (!user) {
      toast.error('Please login to place your order');
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    // Live Check of Truck Status
    try {
      const { data: statusCheck } = await axios.get(`${API}/truck/status?t=${Date.now()}`);
      // If truck is closed, block everyone
      if (!statusCheck.data.is_open) {
        setShowTruckClosedModal(true);
        return;
      }
    } catch (err) { console.error('Error in live status check', err); }

    if (!checkoutData.name.trim()) {
      toast.error('Please enter your Name');
      scrollToForm();
      return;
    }
    if (!checkoutData.phone.trim()) {
      toast.error('Please enter your Phone Number');
      scrollToForm();
      return;
    }
    if (!checkoutData.address.trim()) {
      toast.error('Please enter your Delivery/Pickup Address');
      scrollToForm();
      return;
    }

    if (discountPercentage > 0 && !skipDiscountCheck) {
      setShowDiscountPopup(true);
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/orders/send-checkout-otp`, {
        email: user.email,
        name: checkoutData.name
      });

      if (data.success) {
        toast.success('Verification code sent to your email!');
        setShowOTPModal(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Open Razorpay
  const verifyAndPay = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setVerifying(true);
    try {
      const { data: verifyData } = await axios.post(`${API}/orders/verify-checkout-otp`, {
        email: user.email,
        otp
      });

      if (verifyData.success) {
        // Now proceed to create payment
        const { data: orderData } = await axios.post(`${API}/orders/create-payment`, {
          items: cart.map(i => ({ id: i.id, quantity: i.quantity, price: i.price })),
          total_amount: finalTotal,
          delivery_type: 'delivery',
          address: checkoutData.address,
          notes: `${notes} | Phone: ${checkoutData.phone}`
        });

        const options = {
          key: orderData.key_id,
          amount: orderData.amount,
          currency: 'INR',
          name: 'Zing Bites',
          description: `Order #${orderData.order_number}`,
          order_id: orderData.razorpay_order_id,
          handler: async (response) => {
            try {
              const verifyRes = await axios.post(`${API}/orders/verify-payment`, {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order_id: orderData.order_id
              });
              if (verifyRes.data.success) {
                setLastOrderDetails({
                  number: orderData.order_number,
                  amount: orderData.amount / 100,
                  items: [...cart]
                });
                clearCart();
                setShowSuccessModal(true);
              }
            } catch { toast.error('Payment verification failed'); }
          },
          prefill: {
            name: checkoutData.name,
            email: user?.email || '',
            contact: checkoutData.phone
          },
          theme: { color: '#FF6B35' },
          modal: { ondismiss: () => setVerifying(false) }
        };

        if (window.Razorpay) {
          const rzp = new window.Razorpay(options);
          rzp.open();
          setShowOTPModal(false);
          setOtp('');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed. Try again.');
    } finally {
      setVerifying(false);
    }
  };

  if (cart.length === 0 && !showSuccessModal) return (
    <div className="cart-page empty-cart-page">
      <div className="empty-cart">
        <ShoppingCart size={64} className="icon-gradient-orange" />
        <h2>Your cart is empty!</h2>
        <p>Looks like you haven't added anything yet. Let's fix that!</p>
        <Link to="/menu" className="btn btn-primary"><UtensilsCrossed size={18} className="icon-filled" /> Browse Menu</Link>
      </div>
    </div>
  );

  return (
    <div className="cart-page">
      <div className="cart-header">
        <div className="container">
          <h1>Your <span>Cart</span></h1>
          <p>{cart.length} item(s) — Total ₹{finalTotal.toFixed(2)}</p>
        </div>
      </div>

      <div className="cart-body container">
        <div className="cart-items-column">
          <div className="cart-items">
            <h2>Items in Order</h2>
            {cart.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-img">
                  {item.image_url ? <img src={item.image_url} alt={item.name} /> : <Utensils size={24} className="icon-gradient-orange" />}
                </div>
                <div className="cart-item-info">
                  <h4>{item.name}</h4>
                  <p>₹{item.price} each</p>
                </div>
                <div className="cart-item-controls">
                  <div className="qty-control">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus size={14} className="icon-gradient-red" /></button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus size={14} className="icon-gradient-green" /></button>
                  </div>
                  <span className="item-total">₹{(item.price * item.quantity).toFixed(2)}</span>
                  <button className="remove-btn" onClick={() => removeFromCart(item.id)}><Trash2 size={18} className="icon-gradient-red" /></button>
                </div>
              </div>
            ))}
          </div>

          {/* New Checkout Details Form */}
          <div className="checkout-details-section" ref={checkoutFormRef}>
            <h3>Checkout Details</h3>
            <div className="details-grid">
              <div className="input-group">
                <label>Receiver Name <span>*</span></label>
                <input
                  type="text"
                  name="name"
                  placeholder="Who's picking up?"
                  value={checkoutData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="input-group">
                <label>Contact Phone <span>*</span></label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Mobile number"
                  value={checkoutData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="input-group full-width">
                <label>Delivery/Pickup Location <span>*</span></label>
                <textarea
                  name="address"
                  placeholder="Enter full address or landmark"
                  rows="3"
                  value={checkoutData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="input-group full-width">
                <label>Chef's Notes (Optional)</label>
                <textarea
                  placeholder="Any special requests? Eg: Less spice, extra chutney..."
                  rows="2"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="order-summary">
          <h2>Order Summary</h2>
          <div className="summary-lines">
            <div className="summary-line">
              <span>Subtotal</span>
              <span>₹{cartTotal.toFixed(2)}</span>
            </div>
            {discountPercentage > 0 && (
              <div className="summary-line discount" style={{ color: '#2ecc71', fontWeight: 'bold' }}>
                <span>Discount ({discountPercentage}%)</span>
                <span>-₹{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="summary-line">
              <span>Platform Fee</span>
              <span>₹30.00</span>
            </div>
            <div className="summary-line total">
              <span>Total</span>
              <span>₹{finalTotal.toFixed(2)}</span>
            </div>
          </div>
          <div className="pickup-info">
            <MapPin size={20} className="icon-gradient-red icon-filled" />
            <div>
              <strong>Order Commitment</strong>
              <p>Freshly prepared for you in Chennai.</p>
            </div>
          </div>
          <button
            className="btn btn-primary checkout-btn"
            onClick={() => initiateCheckout()}
            disabled={loading}
          >
            {loading ? '⏳ Sending OTP...' : <><Zap size={18} /> Verify & Pay ₹{finalTotal.toFixed(2)}</>}
          </button>
          <Link to="/menu" className="btn btn-outline continue-btn"><ArrowLeft size={18} /> Browse More</Link>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOTPModal && (
        <div className="modal-overlay">
          <div className="otp-modal-inner">
            <div className="otp-icon"><Lock size={32} /></div>
            <h2>Verify Your Order</h2>
            <p>We've sent a 6-digit code to <strong>{user?.email}</strong>. Please enter it below to confirm and proceed to payment.</p>

            <div className="otp-input-container">
              <input
                type="text"
                className="otp-input-field"
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                autoFocus
                required
              />
              <div className="otp-dotted-lines">
                {[...Array(6)].map((_, i) => (
                  <span key={i} className={otp.length > i ? 'active' : ''}></span>
                ))}
              </div>
            </div>

            <button
              className="verify-btn"
              onClick={verifyAndPay}
              disabled={verifying || otp.length !== 6}
            >
              {verifying ? '⏳ Verifying...' : <><CheckCircle size={18} className="icon-filled" /> Confirm & Pay Now</>}
            </button>

            <button
              className="btn btn-link"
              style={{ marginTop: '15px', fontSize: '13px', color: '#666', border: 'none', background: 'none', cursor: 'pointer' }}
              onClick={() => setShowOTPModal(false)}
            >
              Cancel & Edit Details
            </button>
          </div>
        </div>
      )}
      {/* Order Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay success-overlay">
          <div className="success-modal-inner">
            <div className="success-modal-brand">
              <img src="/images/download.png" alt="Logo" />
              <span>Zing_<span>Bites</span></span>
            </div>

            <div className="success-check-wrap">
              <div className="success-check-circle"></div>
              <div className="success-check-stem"></div>
              <div className="success-check-kick"></div>
            </div>

            <h2 className="success-title">Order Placed! 🎊</h2>
            <p className="success-msg">
              Thank you, <strong>{checkoutData.name}</strong>! Your delicious meal is being confirmed.
            </p>

            <div className="success-details-card">
              <div className="detail-row">
                <span>Order Number</span>
                <strong>#{lastOrderDetails?.number}</strong>
              </div>
              <div className="success-items-preview">
                {lastOrderDetails?.items?.map((item, idx) => (
                  <div key={idx} className="success-item-row">
                    <img src={item.image_url || '/images/products/placeholder.png'} alt={item.name} />
                    <div className="item-info">
                      <span>{item.name}</span>
                      <small>Qty: {item.quantity}</small>
                    </div>
                    <strong>₹{(item.price * item.quantity).toFixed(2)}</strong>
                  </div>
                ))}
              </div>
              <div className="detail-row">
                <span>Platform Fee</span>
                <span>₹30.00</span>
              </div>
              <div className="detail-row total">
                <span>Total Paid</span>
                <strong>₹{lastOrderDetails?.amount?.toFixed(2)}</strong>
              </div>
            </div>

            <div className="success-actions">
              <button
                className="btn btn-primary track-btn"
                onClick={() => navigate('/orders')}
              >
                Track My Order <Truck size={18} className="icon-filled" />
              </button>
              <button
                className="btn btn-outline home-btn"
                onClick={() => navigate('/')}
              >
                Go to Home
              </button>
            </div>

            <p className="success-footer-msg">
              A confirmation email has been sent to <strong>{user?.email}</strong>
            </p>
          </div>
        </div>
      )}



      {/* Discount Popup Modal */}
      {showDiscountPopup && (
        <div className="modal-overlay" onClick={() => setShowDiscountPopup(false)}>
          <div className="otp-modal-inner" onClick={e => e.stopPropagation()} style={{ animation: 'modalPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
            <div className="otp-icon" style={{ animation: 'bounce 2s infinite' }}>
              <span role="img" aria-label="party" style={{ fontSize: '48px' }}>🎉</span>
            </div>
            <h2 style={{ color: '#2ecc71', marginBottom: '10px' }}>Discount Unlocked!</h2>
            <p style={{ fontSize: '16px', color: '#555', marginBottom: '20px' }}>
              Your cart has reached <strong>₹{cartTotal.toFixed(2)}</strong>.<br/>
              You get a <strong>{discountPercentage}% discount</strong> on your subtotal!
            </p>
            <div className="success-actions" style={{ marginTop: '20px' }}>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  setShowDiscountPopup(false);
                  initiateCheckout(true);
                }}
              >
                Awesome, Proceed! <Zap size={18} className="icon-filled" style={{ marginLeft: '8px' }} />
              </button>
              <button 
                className="btn btn-outline" 
                onClick={() => {
                  setShowDiscountPopup(false);
                  navigate('/');
                }}
              >
                Go to Home Page <ArrowLeft size={18} style={{ marginLeft: '8px' }} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Truck Closed Alert Modal */}
      {showTruckClosedModal && (
        <div className="modal-overlay alert-overlay" onClick={() => setShowTruckClosedModal(false)}>
          <div className="alert-modal-inner truck-closed-modal" onClick={e => e.stopPropagation()}>
            <div className="alert-icon-wrap truck-icon-pulse">
              <Clock size={64} className="text-warning" />
            </div>
            <h2 className="alert-title">Truck Closed</h2>
            <p className="alert-msg">
              <strong>Zing_bites</strong> Food truck closed.
              We will open at <strong>Everyday 6:00 pm</strong>.
              <strong>SEE YOU SOON...!</strong>
            </p>
            <button className="btn btn-primary alert-btn" onClick={() => setShowTruckClosedModal(false)}>
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
