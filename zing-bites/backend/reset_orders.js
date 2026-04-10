const mysql = require('mysql2/promise');
require('dotenv').config();

async function resetOrders() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  console.log('--- Order History Reset ---');
  try {
    // Disable foreign key checks for clean truncation
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    
    console.log('Clearing order_items...');
    await connection.query('TRUNCATE TABLE order_items');
    
    console.log('Clearing orders...');
    await connection.query('TRUNCATE TABLE orders');
    
    // Re-enable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('SUCCESS: Order history cleared and ID counters reset.');
  } catch (err) {
    console.error('ERROR during reset:', err.message);
  } finally {
    await connection.end();
  }
}

resetOrders();
