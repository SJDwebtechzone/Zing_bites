// Run this once to set up the database: node setupDb.js
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setup() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  console.log('🔌 Connected to MySQL...');
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

  try {
    await conn.query(schema);
    console.log('✅ Database and tables created successfully!');
    console.log('✅ Sample data inserted!');
    console.log('\n🚀 Setup complete! You can now run: npm run dev:backend');
    console.log('\n📧 Admin credentials:');
    console.log('   Email: krishkumar3380@gmail.com');
    console.log('   Password: Admin@123\n');
  } catch (err) {
    console.error('❌ Setup failed:', err.message);
  } finally {
    await conn.end();
  }
}

setup();
