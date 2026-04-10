const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'zing_bites'
  });

  try {
    console.log('🔌 Running migration to make email/phone nullable and add is_admin...');
    
    // Check if is_admin exists
    const [columns] = await conn.query('DESCRIBE users');
    const hasAdmin = columns.some(c => c.Field === 'is_admin');
    const hasVerified = columns.some(c => c.Field === 'is_verified');

    let alterQuery = `
      ALTER TABLE users 
      MODIFY COLUMN email VARCHAR(100) UNIQUE NULL,
      MODIFY COLUMN phone VARCHAR(15) UNIQUE NULL,
      MODIFY COLUMN name VARCHAR(100) NOT NULL UNIQUE
    `;

    if (!hasAdmin) alterQuery += ', ADD COLUMN is_admin BOOLEAN DEFAULT FALSE';
    if (!hasVerified) alterQuery += ', ADD COLUMN is_verified BOOLEAN DEFAULT FALSE AFTER password';

    await conn.query(alterQuery);
    console.log('✅ Users table updated successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await conn.end();
  }
}

migrate();
