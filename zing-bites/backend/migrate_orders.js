const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'zing_bites'
  });

  try {
    console.log('🔌 Migrating orders table...');

    // Function to check if a column exists
    async function columnExists(table, column) {
      const [rows] = await conn.execute(
        'SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?',
        ['zing_bites', table, column]
      );
      return rows.length > 0;
    }

    // Add payment_method
    if (!(await columnExists('orders', 'payment_method'))) {
      await conn.execute('ALTER TABLE orders ADD COLUMN payment_method VARCHAR(50) AFTER payment_id');
      console.log('✅ Added column: payment_method');
    } else {
      console.log('ℹ️  Column already exists: payment_method');
    }

    // Add delivered_at
    if (!(await columnExists('orders', 'delivered_at'))) {
      await conn.execute('ALTER TABLE orders ADD COLUMN delivered_at TIMESTAMP NULL AFTER status');
      console.log('✅ Added column: delivered_at');
    } else {
      console.log('ℹ️  Column already exists: delivered_at');
    }

    console.log('🌟 Migration complete!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await conn.end();
  }
}

migrate();
