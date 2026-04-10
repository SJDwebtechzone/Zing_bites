const mysql = require('mysql2/promise');
require('dotenv').config();

async function removeCustomers() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'zing_bites'
  });

  try {
    console.log('🗑️ Removing all customer accounts (is_admin = 0)...');
    
    // Delete all users who are not admins
    const [result] = await conn.execute(
      'DELETE FROM users WHERE is_admin = 0'
    );

    console.log(`✅ Successfully removed ${result.affectedRows} customer accounts and their associated order history.`);
    console.log('👤 Only your Admin account remains.');

  } catch (err) {
    console.error('❌ Removal failed:', err.message);
  } finally {
    await conn.end();
  }
}

removeCustomers();
