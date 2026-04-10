const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function resetAdmin() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'zing_bites'
  });

  try {
    const email = 'krishkumar3380@gmail.com';
    const password = 'Admin@123';
    const hashed = await bcrypt.hash(password, 10);

    console.log(`🔄 Resetting admin (${email}) password to "${password}"...`);
    
    const [result] = await conn.execute(
      'UPDATE users SET password = ? WHERE email = ? AND is_admin = 1',
      [hashed, email]
    );

    if (result.affectedRows > 0) {
      console.log('✅ Admin password has been reset successfully!');
    } else {
      console.log('❌ No admin found with that email. Please check if the email was correctly updated.');
    }

  } catch (err) {
    console.error('❌ Reset failed:', err.message);
  } finally {
    await conn.end();
  }
}

resetAdmin();
