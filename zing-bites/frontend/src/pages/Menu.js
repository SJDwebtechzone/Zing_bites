import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Loader2, Search, LayoutGrid, Star, Flame, Clock, ShoppingCart, Plus, Minus, Circle } from 'lucide-react';
import './Menu.css';

const API = process.env.REACT_APP_API_URL || '/api';

const SPICE_COLORS = { mild: '#22c55e', medium: '#f59e0b', hot: '#ef4444', extra_hot: '#ef4444' };

export default function Menu() {
  const { addToCart, cart, updateQuantity } = useAuth();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(searchParams.get('cat') || 'all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showPromoPopup, setShowPromoPopup] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        axios.get(`${API}/products`),
        axios.get(`${API}/products/categories`)
      ]);
      setProducts(prodRes.data.data);
      setCategories(catRes.data.data);
    } catch (err) {
      toast.error('Failed to load menu');
    } finally { setLoading(false); }
  };

  const filtered = products.filter(p => {
    const matchCat = activeCategory === 'all' || p.category_slug === activeCategory;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleAddToCart = (product) => {
    if (!product.is_available) return;
    addToCart(product);
    toast.success(`${product.name} added to cart!`, {
      icon: <ShoppingCart size={18} color="var(--orange-main)" />
    });
  };

  const getCartQty = (id) => cart.find(i => i.id === id)?.quantity || 0;

  if (loading) return (
    <div className="menu-page">
      <div className="menu-loading">
        <Loader2 className="spinner icon-gradient-orange" size={48} />
        <p>Loading delicious menu...</p>
      </div>
    </div>
  );

  return (
    <div className="menu-page">
      {/* Promo Discount Popup */}
      {showPromoPopup && (
        <div className="promo-overlay" onClick={() => setShowPromoPopup(false)}>
          <div className="promo-modal-inner" onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🎉</div>
            <h2 className="promo-title">Awesome Discounts!</h2>
            <p className="promo-text">Add more to your cart and unlock amazing savings dynamically!</p>
            <div className="promo-tiers">
              <div className="promo-tier"><span>Order Above ₹100</span><span style={{ color: '#2ecc71' }}>8% OFF</span></div>
              <div className="promo-tier"><span>Order Above ₹200</span><span style={{ color: '#2ecc71' }}>10% OFF</span></div>
              <div className="promo-tier"><span>Order Above ₹300</span><span style={{ color: '#2ecc71' }}>15% OFF</span></div>
              <div className="promo-tier"><span>Order Above ₹400</span><span style={{ color: '#2ecc71' }}>20% OFF</span></div>
            </div>
            <button className="promo-btn" onClick={() => setShowPromoPopup(false)}>Got it, Let's Eat!</button>
          </div>
        </div>
      )}

      <div className="menu-header">
        <div className="container">
          <h1>Our <span>Menu</span></h1>
          <p>Fresh, hot street food made to order every evening</p>
          <div className="menu-search">
            <Search size={18} className="icon-gradient-orange" />
            <input
              placeholder="Search menu items..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="menu-body container">
        <div className="category-tabs">
          <button
            className={`tab-btn ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          ><LayoutGrid size={18} className="icon-gradient-blue" /> All Items</button>
          {categories.map(cat => (
            <button
              key={cat.slug}
              className={`tab-btn ${activeCategory === cat.slug ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.slug)}
            >{cat.icon} {cat.name}</button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-menu">
            <Search size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
            <h3>No items found</h3>
            <p>Try a different category or search term</p>
          </div>
        ) : (
          <div className="products-grid">
            {filtered.map(product => (
              <div key={product.id} className={`product-card ${!product.is_available ? 'unavailable' : ''}`}>
                <div className="product-img">
                  {product.image_url
                    ? <img src={product.image_url} alt={product.name} />
                    : <img src={product.is_vegetarian ? '/images/veg_placeholder.png' : '/images/nonveg_placeholder.png'} alt={product.name} className="product-img-placeholder" />
                  }
                  {product.is_featured && <span className="featured-badge"><Star size={12} className="icon-filled" fill="white" /> Featured</span>}
                  {!product.is_available && <div className="unavailable-overlay">Not Available</div>}
                </div>
                <div className="product-info">
                  <div className="product-top">
                    <span className={`veg-badge ${product.is_vegetarian ? 'veg' : 'non-veg'}`}>
                      <Circle size={14} fill="currentColor" />
                    </span>
                    <span className="spice-badge" style={{ color: SPICE_COLORS[product.spice_level] }}>
                      <Circle size={8} className="icon-filled" style={{ marginRight: '4px' }} />
                      <Flame size={14} className="icon-filled" /> {product.spice_level}
                    </span>
                  </div>
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-desc">{product.description}</p>
                  <div className="product-meta">
                    <span className="prep-time"><Clock size={14} /> {product.prep_time || 15} min</span>
                  </div>
                  <div className="product-footer">
                    <span className="product-price">₹{product.price}</span>
                    {product.is_available ? (
                      getCartQty(product.id) > 0 ? (
                        <div className="qty-control">
                          <button onClick={() => updateQuantity(product.id, getCartQty(product.id) - 1)}><Minus size={14} className="icon-gradient-red" /></button>
                          <span>{getCartQty(product.id)}</span>
                          <button onClick={() => handleAddToCart(product)}><Plus size={14} className="icon-gradient-green" /></button>
                        </div>
                      ) : (
                        <button className="add-btn" onClick={() => handleAddToCart(product)}>
                          <Plus size={16} /> Add
                        </button>
                      )
                    ) : (
                      <button className="add-btn unavailable-btn" disabled>
                        Not Available
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
