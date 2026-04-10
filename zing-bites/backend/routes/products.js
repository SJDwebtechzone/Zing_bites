const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { protect, adminOnly } = require('../middleware/auth');

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all products (Public)
router.get('/', async (req, res) => {
  try {
    const { category, featured } = req.query;
    let query = `SELECT p.*, c.name as category_name, c.slug as category_slug 
                 FROM products p JOIN categories c ON p.category_id = c.id WHERE 1=1`;
    const params = [];
    if (category) { query += ' AND c.slug = ?'; params.push(category); }
    if (featured === 'true') { query += ' AND p.is_featured = 1'; }
    query += ' ORDER BY p.sort_order, p.id';
    const [rows] = await pool.execute(query, params);

    // Varied Prep Time Fallback: If DB value is default 15, provide a realistic estimate based on item name
    const enrichedRows = rows.map(p => {
      if (p.prep_time !== 15) return p;
      
      let estimatedTime = 15;
      const name = p.name.toLowerCase();
      
      if (name.includes('puri') || name.includes('bhel') || name.includes('samosa') || name.includes('vada pav')) estimatedTime = 8;
      else if (name.includes('chaat') || name.includes('pav') || name.includes('omelette')) estimatedTime = 10;
      else if (name.includes('sandwich') || name.includes('fries') || name.includes('nuggets') || name.includes('rolls')) estimatedTime = 15;
      else if (name.includes('burger') || name.includes('kachori')) estimatedTime = 20;
      else if (name.includes('chole') || name.includes('misal') || name.includes('kulcha')) estimatedTime = 25;
      
      return { ...p, prep_time: estimatedTime };
    });

    res.json({ success: true, data: enrichedRows });
  } catch (err) {
    console.error('❌ Error fetching products:', err.message);
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
});

// Get single product (Public)
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT p.*, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE p.id = ?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin: Add product
router.post('/', protect, adminOnly, async (req, res) => {
  const { category_id, name, description, price, image_url, is_vegetarian, spice_level, prep_time } = req.body;
  try {
    const [result] = await pool.execute(
      'INSERT INTO products (category_id, name, description, price, image_url, is_vegetarian, spice_level, prep_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [category_id, name, description, price, image_url, is_vegetarian, spice_level, prep_time]
    );
    res.status(201).json({ success: true, message: 'Product added', id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin: Update product
router.put('/:id', protect, adminOnly, async (req, res) => {
  const { name, description, price, is_available, is_featured, image_url, spice_level } = req.body;
  try {
    await pool.execute(
      'UPDATE products SET name=?, description=?, price=?, is_available=?, is_featured=?, image_url=?, spice_level=? WHERE id=?',
      [name, description, price, is_available, is_featured, image_url, spice_level, req.params.id]
    );
    res.json({ success: true, message: 'Product updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin: Toggle availability
router.patch('/:id/toggle', protect, adminOnly, async (req, res) => {
  try {
    await pool.execute('UPDATE products SET is_available = NOT is_available WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Availability toggled' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
