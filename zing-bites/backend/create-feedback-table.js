const { pool } = require('./config/db');

async function createTable() {
  try {
    console.log('--- CREATING FEEDBACK TABLE ---');
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS feedback (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        user_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT NOT NULL,
        admin_reply TEXT,
        replied_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log('✅ Feedback table created successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating table:', err.message);
    process.exit(1);
  }
}

createTable();
