const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { pool } = require('../config/db');
const { protect, adminOnly } = require('../middleware/auth');
const { 
  sendOrderConfirmationEmail, 
  sendOTPEmail, 
  sendOrderStatusUpdateEmail,
  sendFeedbackRequestEmail
} = require('../utils/email');
const { generateOTP } = require('../utils/otp');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Razorpay order
router.post('/create-payment', protect, async (req, res) => {
  const { items, total_amount, delivery_type, address, notes } = req.body;
  try {
    const orderNumber = 'ZB' + Date.now().toString().slice(-8);
    const options = {
      amount: Math.round(total_amount * 100),
      currency: 'INR',
      receipt: orderNumber,
      notes: { user_id: req.user.id, order_number: orderNumber }
    };
    const razorpayOrder = await razorpay.orders.create(options);

    // Create DB order
    const [result] = await pool.execute(
      'INSERT INTO orders (user_id, order_number, total_amount, razorpay_order_id, delivery_type, address, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, orderNumber, total_amount, razorpayOrder.id, delivery_type || 'pickup', address || '', notes || '']
    );
    const orderId = result.insertId;

    // Add order items
    for (const item of items) {
      await pool.execute(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.id, item.quantity, item.price]
      );
    }

    res.json({
      success: true,
      razorpay_order_id: razorpayOrder.id,
      key_id: process.env.RAZORPAY_KEY_ID,
      amount: razorpayOrder.amount,
      order_number: orderNumber,
      order_id: orderId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Payment creation failed' });
  }
});

// Verify payment
router.post('/verify-payment', protect, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body;
  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
  hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
  const generated = hmac.digest('hex');

  if (generated !== razorpay_signature) {
    return res.status(400).json({ success: false, message: 'Payment verification failed' });
  }

  try {
    const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
    const methodMap = {
      'upi': 'UPI / GPay / PhonePe',
      'card': 'Credit / Debit Card',
      'netbanking': 'Netbanking',
      'wallet': 'Wallet',
      'paylater': 'Pay Later'
    };
    const payment_method = methodMap[paymentDetails.method] || paymentDetails.method || 'Online';

    await pool.execute(
      'UPDATE orders SET payment_status = "paid", payment_id = ?, payment_method = ?, status = "confirmed" WHERE id = ?',
      [razorpay_payment_id, payment_method, order_id]
    );

    // Get order details for email
    const [orders] = await pool.execute('SELECT * FROM orders WHERE id = ?', [order_id]);
    const [items] = await pool.execute(
      'SELECT oi.*, p.name FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?',
      [order_id]
    );

    await sendOrderConfirmationEmail(req.user.email, req.user.name, {
      ...orders[0],
      items
    });

    res.json({ success: true, message: 'Payment verified! Order confirmed.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Send checkout OTP
router.post('/send-checkout-otp', protect, async (req, res) => {
  const { email, name } = req.body;
  try {
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    await pool.execute('INSERT INTO otps (email, otp, expires_at) VALUES (?, ?, ?)', [email, otp, expiresAt]);
    
    // Using existing sendOTPEmail utility
    await sendOTPEmail(email, name, otp);
    
    res.json({ success: true, message: 'Verification OTP sent to your email' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
});

// Verify checkout OTP
router.post('/verify-checkout-otp', protect, async (req, res) => {
  const { email, otp } = req.body;
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM otps WHERE email = ? AND otp = ? AND is_used = 0 AND expires_at > NOW() ORDER BY id DESC LIMIT 1',
      [email, otp]
    );
    if (!rows.length) return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });

    await pool.execute('UPDATE otps SET is_used = 1 WHERE id = ?', [rows[0].id]);
    res.json({ success: true, message: 'OTP verified successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
});
router.get('/my-orders', protect, async (req, res) => {
  try {
    const [orders] = await pool.execute(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    for (const order of orders) {
      const [items] = await pool.execute(
        'SELECT oi.*, p.name, p.image_url FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?',
        [order.id]
      );
      order.items = items;
    }
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin: Get all orders
router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const [orders] = await pool.execute(
      'SELECT o.*, u.name as user_name, u.email as user_email, u.phone as user_phone FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC LIMIT 100'
    );
    for (const order of orders) {
      const [items] = await pool.execute(
        'SELECT oi.*, p.name FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?',
        [order.id]
      );
      order.items = items;
    }
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin: Update order status
router.patch('/:id/status', protect, adminOnly, async (req, res) => {
  const { status } = req.body;
  try {
    let query = 'UPDATE orders SET status = ? WHERE id = ?';
    let params = [status, req.params.id];
    
    if (status === 'delivered') {
      query = 'UPDATE orders SET status = ?, delivered_at = NOW() WHERE id = ?';
    }
    
    await pool.execute(query, params);

    // Fetch details to send email
    const [orders] = await pool.execute(
      'SELECT o.*, u.name as user_name, u.email as user_email FROM orders o JOIN users u ON o.user_id = u.id WHERE o.id = ?',
      [req.params.id]
    );

    if (orders.length > 0) {
      const [items] = await pool.execute(
        'SELECT oi.*, p.name FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?',
        [req.params.id]
      );

      // Don't await email, let it run in background to keep admin UI fast
      sendOrderStatusUpdateEmail(orders[0].user_email, orders[0].user_name, {
        ...orders[0],
        items
      }, status).catch(err => console.error('Error sending status email:', err));
    }

    res.json({ success: true, message: `Order status updated to ${status}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
