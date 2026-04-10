const mysql = require('mysql2/promise');
require('dotenv').config();

async function fix() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'zing_bites'
  });

  try {
    console.log('🔌 Connected to MySQL...');

    // 1. Delete duplicates from products keeping only the smallest ID for each name
    const [delResult] = await conn.execute(`
      DELETE p1 FROM products p1
      INNER JOIN products p2 
      WHERE p1.id > p2.id AND p1.name = p2.name
    `);
    console.log(`✅ Deleted ${delResult.affectedRows} duplicate products.`);

    // 2. Add UNIQUE constraint to name
    try {
      await conn.execute('ALTER TABLE products ADD CONSTRAINT unique_product_name UNIQUE (name)');
      console.log('✅ Added UNIQUE constraint to product name.');
    } catch (err) {
      if (err.code === 'ER_DUP_KEYNAME') {
        console.log('ℹ️ UNIQUE constraint already exists.');
      } else {
        throw err;
      }
    }

    // 3. Similarly for categories just in case
    const [delCatResult] = await conn.execute(`
      DELETE c1 FROM categories c1
      INNER JOIN categories c2 
      WHERE c1.id > c2.id AND c1.name = c2.name
    `);
    console.log(`✅ Deleted ${delCatResult.affectedRows} duplicate categories.`);

    try {
      await conn.execute('ALTER TABLE categories ADD CONSTRAINT unique_category_name UNIQUE (name)');
      console.log('✅ Added UNIQUE constraint to category name.');
    } catch (err) {
      if (err.code === 'ER_DUP_KEYNAME') {
        console.log('ℹ️ UNIQUE constraint already exists.');
      } else {
        throw err;
      }
    }

  } catch (err) {
    console.error('❌ Fix failed:', err.message);
  } finally {
    await conn.end();
  }
}

fix();
