const bcrypt = require('bcryptjs');
const { pool } = require('./config/db');

async function createAdmin() {
  const email = 'krishkumar3380@gmail.com';
  const name = 'ZingAdmin';
  const password = 'Admin@123';
  const isAdmin = 1;

  try {
    console.log('🔌 Connecting to database...');
    const hashed = await bcrypt.hash(password, 10);

    // Check if user exists
    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);

    if (existing.length > 0) {
      console.log('📝 Updating existing user to Admin...');
      await pool.execute(
        'UPDATE users SET password = ?, is_admin = ?, is_verified = 1 WHERE email = ?',
        [hashed, isAdmin, email]
      );
      console.log('✅ Admin account updated!');
    } else {
      console.log('✨ Creating new Admin account...');
      await pool.execute(
        'INSERT INTO users (name, email, password, is_admin, is_verified) VALUES (?, ?, ?, ?, 1)',
        [name, email, hashed, isAdmin]
      );
      console.log('✅ Admin account created successfully!');
    }

    console.log('\n--- Login Details ---');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('---------------------\n');
    
    process.exit();
  } catch (err) {
    console.error('❌ Error creating admin:', err.message);
    process.exit(1);
  }
}

createAdmin();
