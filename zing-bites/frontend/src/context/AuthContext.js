import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();
const API = process.env.REACT_APP_API_URL || '/api';

// Axios defaults
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('zb_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('zb_token');
    const savedUser = localStorage.getItem('zb_user');
    const savedCart = localStorage.getItem('zb_cart');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    if (savedCart) setCart(JSON.parse(savedCart));
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('zb_token', token);
    localStorage.setItem('zb_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('zb_token');
    localStorage.removeItem('zb_user');
    setUser(null);
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      const updated = existing
        ? prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...prev, { ...product, quantity: 1 }];
      localStorage.setItem('zb_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => {
      const updated = prev.filter(i => i.id !== id);
      localStorage.setItem('zb_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) { removeFromCart(id); return; }
    setCart(prev => {
      const updated = prev.map(i => i.id === id ? { ...i, quantity } : i);
      localStorage.setItem('zb_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('zb_cart');
  };

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <AuthContext.Provider value={{
      user, login, logout, loading,
      cart, addToCart, removeFromCart, updateQuantity, clearCart,
      cartTotal, cartCount, API
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
