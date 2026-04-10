const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('./config/db');

const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/truck', require('./routes/misc'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/feedback', require('./routes/feedback'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', service: 'Zing Bites API', time: new Date() }));

// 404
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

async function start() {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`\n🚚 Zing Bites Server running on port ${PORT}`);
    console.log(`🌐 API: http://localhost:${PORT}/api`);
    console.log(`⏰  Operating Hours: 6:00 PM – 11:00 PM\n`);
  });
}

start();
