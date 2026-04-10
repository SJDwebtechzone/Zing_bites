import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import './Feedback.css';

const API = process.env.REACT_APP_API_URL || '/api';

export default function Feedback() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await axios.get(`${API}/feedback/order/${orderId}`, { withCredentials: true });
        if (data.success) setOrder(data.data);
      } catch (err) {
        setError('Order not found or you are not authorized to provide feedback for it.');
      }
    };
    fetchOrder();
  }, [orderId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please provide a star rating!');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const { data } = await axios.post(`${API}/feedback`, {
        order_id: orderId,
        rating,
        comment
      }, { withCredentials: true });

      if (data.success) {
        setSubmitted(true);
        setTimeout(() => navigate('/reviews'), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit feedback. Have you already submitted feedback for this order?');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="feedback-page">
        <div className="feedback-card feedback-success">
          <div className="success-icon-circle">
            <CheckCircle size={48} />
          </div>
          <h2>Thank You!</h2>
          <p>Your feedback has been received. We appreciate your time and support!</p>
          <button className="btn btn-primary" onClick={() => navigate('/reviews')}>
            View All Reviews
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-page">
      <div className="feedback-card">
        <div className="feedback-brand">
          <img src="/images/download.png" alt="Zing_Bites Logo" />
          <div className="feedback-brand-text">Zing_<span>Bites</span></div>
        </div>
        
        <h2>How was your food?</h2>
        {order && (
          <div className="feedback-order-info">
            Order <strong>#{order.order_number}</strong> from {new Date(order.created_at).toLocaleDateString('en-IN')}
          </div>
        )}
        <p>Your feedback helps us provide the best street food experience in Chennai.</p>

        {error && (
          <div className="auth-error" style={{ marginBottom: '20px' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="star-btn"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
              >
                <Star
                  size={40}
                  fill={star <= (hover || rating) ? "#FFB703" : "none"}
                  stroke={star <= (hover || rating) ? "#FFB703" : "#ccc"}
                  style={{ transition: 'all 0.2s ease' }}
                />
              </button>
            ))}
          </div>

          <textarea
            className="feedback-textarea"
            placeholder="Tell us about your experience... What did you love? How can we improve?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            minLength={10}
          />

          <button 
            type="submit" 
            className="btn btn-primary feedback-submit-btn" 
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <Loader2 className="animate-spin" size={20} /> Submitting...
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <Send size={20} /> Submit Feedback
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
