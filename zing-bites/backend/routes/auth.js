const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { sendOTPEmail } = require('../utils/email');
const { protect, adminOnly } = require('../middleware/auth');

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Register
router.post('/register', async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !password)
    return res.status(400).json({ success: false, message: 'Name and password required' });

  try {
    const [existing] = await pool.execute('SELECT id FROM users WHERE name = ?', [name]);
    if (existing.length) return res.status(400).json({ success: false, message: 'This Name is already taken' });

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, phone, password, is_verified) VALUES (?, ?, ?, ?, ?)',
      [name, email || null, phone || null, hashed, 1]
    );

    res.status(201).json({ success: true, message: 'Registration successful! You can now login.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM otps WHERE email = ? AND otp = ? AND is_used = 0 AND expires_at > NOW() ORDER BY id DESC LIMIT 1',
      [email, otp]
    );
    if (!rows.length) return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });

    await pool.execute('UPDATE otps SET is_used = 1 WHERE id = ?', [rows[0].id]);
    await pool.execute('UPDATE users SET is_verified = 1 WHERE email = ?', [email]);

    const [user] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    const token = jwt.sign({ id: user[0].id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

    res.json({ success: true, message: 'Account verified!', token, user: { id: user[0].id, name: user[0].name, email: user[0].email, is_admin: user[0].is_admin } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  const { email } = req.body;
  try {
    const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (!users.length) return res.status(404).json({ success: false, message: 'User not found' });

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await pool.execute('INSERT INTO otps (email, otp, expires_at) VALUES (?, ?, ?)', [email, otp, expiresAt]);
    await sendOTPEmail(email, users[0].name, otp);

    res.json({ success: true, message: 'OTP resent successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { name, email, password } = req.body;
  const loginIdentifier = email || name;

  if (!loginIdentifier || !password)
    return res.status(400).json({ success: false, message: 'Login ID and password required' });

  try {
    const query = email 
      ? 'SELECT * FROM users WHERE email = ?' 
      : 'SELECT * FROM users WHERE name = ?';
    
    const [rows] = await pool.execute(query, [loginIdentifier]);
    if (!rows.length) return res.status(400).json({ success: false, message: 'Invalid credentials' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ success: false, message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
    res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, is_admin: user.is_admin } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get profile
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

// Admin: Get all customers
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, name, email, phone, created_at FROM users WHERE is_admin = 0 ORDER BY created_at DESC'
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
