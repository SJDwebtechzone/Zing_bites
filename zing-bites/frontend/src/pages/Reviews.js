import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, Quote, MessageCircle, Calendar, User } from 'lucide-react';
import './Reviews.css';

const API = process.env.REACT_APP_API_URL || '/api';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(`${API}/feedback/public`);
      if (data.success) setReviews(data.data);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        size={16} 
        fill={i < rating ? "#FFB703" : "none"} 
        stroke={i < rating ? "#FFB703" : "#ccc"} 
      />
    ));
  };

  return (
    <div className="reviews-page">
      <section className="reviews-hero">
        <div className="container">
          <p className="section-tag" style={{ color: '#FF6B35' }}>TESTIMONIALS</p>
          <h1>What Our <span>Customers Say</span></h1>
          <p>Real stories and feedback from the Zing Bites community across Chennai.</p>
        </div>
      </section>

      <div className="container">
        {loading ? (
          <div className="no-reviews">
            <div className="spinner"></div>
            <p>Loading the latest reviews...</p>
          </div>
        ) : reviews.length > 0 ? (
          <div className="reviews-grid">
            {reviews.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <div className="user-info">
                    <h4>{review.user_name}</h4>
                    <span className="review-date">
                      <Calendar size={12} style={{ marginRight: '5px' }} />
                      {new Date(review.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="rating-stars">
                    {renderStars(review.rating)}
                  </div>
                </div>

                <div className="review-comment">
                  <p>{review.comment}</p>
                </div>

                {review.admin_reply && (
                  <div className="admin-reply-box">
                    <h5>
                      <img src="/images/download.png" alt="Zing_Bites Logo" style={{ width: '20px', height: '20px' }} />
                      Zing Bites Team Response
                    </h5>
                    <p>{review.admin_reply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-reviews">
            <MessageCircle size={64} color="#ddd" strokeWidth={1} />
            <h3>No reviews yet</h3>
            <p>Order now and be the first to share your experience!</p>
          </div>
        )}
      </div>
    </div>
  );
}
