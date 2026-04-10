const mysql = require('mysql2/promise');
require('dotenv').config();

async function check() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'zing_bites'
  });

  try {
    const [rows] = await conn.execute('SELECT name, email, is_admin FROM users');
    console.log('--- Registered Users ---');
    console.table(rows);
  } catch (err) {
    console.error(err.message);
  } finally {
    await conn.end();
  }
}

check();
