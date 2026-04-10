const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { protect, adminOnly } = require('../middleware/auth');
const { sendContactNotification } = require('../utils/email');

// ─── Truck Status ───────────────────────────────
router.get('/status', async (req, res) => {
  try {
    // Always get the first status record to ensure consistency
    const [rows] = await pool.execute('SELECT * FROM truck_status ORDER BY id ASC LIMIT 1');
    const [loc] = await pool.execute('SELECT * FROM truck_location WHERE is_active = 1 ORDER BY id DESC LIMIT 1');
    const status = rows[0] || { is_open: false, status_message: 'Opens at 6PM - 11PM' };
    const locData = loc[0] || { latitude: 13.0418, longitude: 80.2341, area: 'T. Nagar, Chennai' };
    
    res.json({ success: true, data: { ...status, is_open: !!status.is_open, location: locData } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.patch('/status', protect, adminOnly, async (req, res) => {
  const { is_open, status_message } = req.body;
  try {
    const [existing] = await pool.execute('SELECT id FROM truck_status ORDER BY id ASC LIMIT 1');
    if (existing.length) {
      await pool.execute('UPDATE truck_status SET is_open = ?, status_message = ? WHERE id = ?', [is_open ? 1 : 0, status_message, existing[0].id]);
    } else {
      await pool.execute('INSERT INTO truck_status (is_open, status_message) VALUES (?, ?)', [is_open ? 1 : 0, status_message]);
    }
    res.json({ success: true, message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── Location ────────────────────────────────────
router.get('/location', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM truck_location WHERE is_active = 1 ORDER BY id DESC LIMIT 1');
    res.json({ success: true, data: rows[0] || { latitude: 13.0418, longitude: 80.2341, area: 'T. Nagar, Chennai' } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/location', protect, adminOnly, async (req, res) => {
  const { latitude, longitude, address, area } = req.body;
  try {
    await pool.execute('UPDATE truck_location SET is_active = 0');
    await pool.execute('INSERT INTO truck_location (latitude, longitude, address, area, is_active) VALUES (?, ?, ?, ?, 1)', [latitude, longitude, address, area]);
    res.json({ success: true, message: 'Location updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── Contact Messages ────────────────────────────
router.post('/contact', async (req, res) => {
  const { name, email, phone, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ success: false, message: 'Name, email and message are required' });
  try {
    await pool.execute('INSERT INTO contact_messages (name, email, phone, message) VALUES (?, ?, ?, ?)', [name, email, phone, message]);
    await sendContactNotification({ name, email, phone, message });
    res.json({ success: true, message: 'Your message has been sent successfully! We\'ll get back to you soon.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/contact/messages', protect, adminOnly, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM contact_messages ORDER BY created_at DESC');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.patch('/contact/messages/:id/read', protect, adminOnly, async (req, res) => {
  try {
    await pool.execute('UPDATE contact_messages SET is_read = 1 WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── Admin Dashboard Stats ───────────────────────
router.get('/admin/stats', protect, adminOnly, async (req, res) => {
  try {
    const [[{ total_orders }]] = await pool.execute('SELECT COUNT(*) as total_orders FROM orders');
    const [[{ today_orders }]] = await pool.execute('SELECT COUNT(*) as today_orders FROM orders WHERE DATE(created_at) = CURDATE()');
    const [[{ total_revenue }]] = await pool.execute('SELECT COALESCE(SUM(total_amount),0) as total_revenue FROM orders WHERE payment_status = "paid"');
    const [[{ today_revenue }]] = await pool.execute('SELECT COALESCE(SUM(total_amount),0) as today_revenue FROM orders WHERE payment_status = "paid" AND DATE(created_at) = CURDATE()');
    const [[{ total_users }]] = await pool.execute('SELECT COUNT(*) as total_users FROM users WHERE is_admin = 0');
    const [[{ unread_messages }]] = await pool.execute('SELECT COUNT(*) as unread_messages FROM contact_messages WHERE is_read = 0');
    
    let total_reviews = 0;
    let avg_rating = "0.0";

    try {
      const [[reviews]] = await pool.execute('SELECT COUNT(*) as total_reviews FROM feedback');
      const [[rating]] = await pool.execute('SELECT AVG(rating) as avg_rating FROM feedback');
      total_reviews = reviews.total_reviews;
      avg_rating = parseFloat(rating.avg_rating || 0).toFixed(1);
    } catch (err) {
      console.error('Feedback table may be missing:', err.message);
    }
    
    res.json({ 
      success: true, 
      data: { 
        total_orders, 
        today_orders, 
        total_revenue, 
        today_revenue, 
        total_users, 
        unread_messages,
        total_reviews,
        avg_rating
      } 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── Public Stats (for Home page hero) ───────────
router.get('/public-stats', async (req, res) => {
  try {
    const [[{ total_users }]] = await pool.execute('SELECT COUNT(*) as total_users FROM users WHERE is_admin = 0');
    const [[{ total_menu_items }]] = await pool.execute('SELECT COUNT(*) as total_menu_items FROM products WHERE is_available = 1');
    
    let avg_rating = "4.9"; // Fallback
    try {
      const [[rating]] = await pool.execute('SELECT AVG(rating) as avg_rating FROM feedback');
      if (rating.avg_rating) avg_rating = parseFloat(rating.avg_rating).toFixed(1);
    } catch (err) {}

    // Add a small "starting boost" to make it look active if it's a fresh DB
    const displayUsers = total_users > 500 ? total_users : `500+`;
    const displayItems = total_menu_items > 20 ? total_menu_items : `20+`;

    res.json({ 
      success: true, 
      data: { 
        total_customers: displayUsers, 
        total_menu_items: displayItems, 
        avg_rating: avg_rating
      } 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
