const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateAdmin() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'zing_bites'
  });

  try {
    const newEmail = 'krishkumar3380@gmail.com';
    const oldEmail = 'admin@zingbites.com';

    console.log(`🔄 Updating admin email from ${oldEmail} to ${newEmail}...`);
    
    // Update the email for the user who is_admin
    const [result] = await conn.execute(
      'UPDATE users SET email = ? WHERE is_admin = 1 AND (email = ? OR email IS NULL OR name = "Zing Bites Admin")',
      [newEmail, oldEmail]
    );

    if (result.affectedRows > 0) {
      console.log('✅ Admin email updated successfully!');
    } else {
      console.log('ℹ️ Admin email was already up to date or no admin found with that email.');
    }

  } catch (err) {
    console.error('❌ Update failed:', err.message);
  } finally {
    await conn.end();
  }
}

updateAdmin();
