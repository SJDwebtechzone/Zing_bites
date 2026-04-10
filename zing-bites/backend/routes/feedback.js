const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { protect, adminOnly } = require('../middleware/auth');
const { sendAdminReplyEmail } = require('../utils/email');

// @route   POST /api/feedback
// @desc    Submit feedback for an order
// @access  Private
router.post('/', protect, async (req, res) => {
  const { order_id, rating, comment } = req.body;
  
  if (!order_id || !rating || !comment) {
    return res.status(400).json({ success: false, message: 'Please provide order_id, rating and comment' });
  }

  try {
    // Check if feedback already exists for this order
    const [existing] = await pool.execute('SELECT id FROM feedback WHERE order_id = ?', [order_id]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Feedback already submitted for this order' });
    }

    // Verify order exists and belongs to user and is delivered
    const [orders] = await pool.execute(
      'SELECT id FROM orders WHERE id = ? AND user_id = ? AND status = "delivered"',
      [order_id, req.user.id]
    );
    if (orders.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid order or order not delivered yet' });
    }

    await pool.execute(
      'INSERT INTO feedback (order_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
      [order_id, req.user.id, rating, comment]
    );

    res.json({ success: true, message: 'Thank you for your feedback!' });
  } catch (err) {
    console.error('Feedback Error:', err);
    if (err.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({ success: false, message: 'Missing feedback table. Please create it in your database.' });
    }
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
});

// @route   GET /api/feedback/public
// @desc    Get all public feedback
// @access  Public
router.get('/public', async (req, res) => {
  try {
    const [feedback] = await pool.execute(
      `SELECT f.*, u.name as user_name 
       FROM feedback f 
       JOIN users u ON f.user_id = u.id 
       ORDER BY f.created_at DESC`
    );
    res.json({ success: true, data: feedback });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/feedback/order/:id
// @desc    Get order info for feedback form
// @access  Private
router.get('/order/:id', protect, async (req, res) => {
  try {
    const [orders] = await pool.execute(
      'SELECT o.id, o.order_number, o.created_at FROM orders o WHERE o.id = ? AND o.user_id = ?',
      [req.params.id, req.user.id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, data: orders[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/feedback/admin/all
// @desc    Get all feedback for admin
// @access  Private (Admin)
router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    const [feedback] = await pool.execute(
      `SELECT f.*, u.name as user_name, u.email as user_email, o.order_number 
       FROM feedback f 
       JOIN users u ON f.user_id = u.id 
       JOIN orders o ON f.order_id = o.id 
       ORDER BY f.created_at DESC`
    );
    res.json({ success: true, data: feedback });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PATCH /api/feedback/:id/reply
// @desc    Admin reply to feedback
// @access  Private (Admin)
router.patch('/:id/reply', protect, adminOnly, async (req, res) => {
  const { reply } = req.body;
  if (!reply) return res.status(400).json({ success: false, message: 'Reply content is required' });

  try {
    const [feedback] = await pool.execute(
      'SELECT f.*, u.name as user_name, u.email as user_email FROM feedback f JOIN users u ON f.user_id = u.id WHERE f.id = ?',
      [req.params.id]
    );

    if (feedback.length === 0) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    await pool.execute(
      'UPDATE feedback SET admin_reply = ?, replied_at = NOW() WHERE id = ?',
      [reply, req.params.id]
    );

    // Send notification email
    sendAdminReplyEmail(feedback[0].user_email, feedback[0].user_name, feedback[0].comment, reply)
      .catch(err => console.error('Error sending reply email:', err));

    res.json({ success: true, message: 'Reply sent successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
