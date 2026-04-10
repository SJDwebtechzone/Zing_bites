const mysql = require('mysql2/promise');
require('dotenv').config();

const updatePrepTimes = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'zing_bites'
  });

  console.log('Connected to database. Updating prep times...');

  const updates = [
    // Street Foods
    { name: 'Pani Puri (6 pcs)', time: 5 },
    { name: 'Bhel Puri', time: 5 },
    { name: 'Samosa (2 pcs)', time: 8 },
    { name: 'Vada Pav', time: 8 },
    { name: 'Masala Pav', time: 10 },
    { name: 'Corn Chaat', time: 10 },
    { name: 'Sev Puri', time: 12 },
    { name: 'Dabeli', time: 12 },
    { name: 'Papdi Chaat', time: 12 },
    { name: 'Ragda Pattice', time: 15 },

    // Burgers & Sandwiches
    { name: 'Grilled Veg Sandwich', time: 15 },
    { name: 'Bombay Toastie', time: 15 },
    { name: 'Aloo Tikki Burger', time: 18 },
    { name: 'Club Sandwich', time: 18 },
    { name: 'BBQ Mushroom Burger', time: 18 },
    { name: 'Zing Special Burger', time: 20 },
    { name: 'Chicken Crispy Burger', time: 20 },
    { name: 'Paneer Makhani Burger', time: 20 },
    { name: 'Peri Peri Chicken Sandwich', time: 22 },
    { name: 'Spicy Fish Fillet Burger', time: 22 },

    // Snacks & Sides
    { name: 'Onion Rings (8 pcs)', time: 10 },
    { name: 'Masala Popcorn', time: 10 },
    { name: 'Cheese Balls (6 pcs)', time: 12 },
    { name: 'Loaded Fries', time: 15 },
    { name: 'Peri Peri Fries', time: 15 },
    { name: 'Sweet Potato Wedges', time: 15 },
    { name: 'Chicken Nuggets (6 pcs)', time: 18 },
    { name: 'Veg Spring Rolls (4 pcs)', time: 18 },
    { name: 'Chilli Cheese Toasts', time: 18 },
    { name: 'Masala Omelette', time: 18 },

    // Indian Street Specials
    { name: 'Dahi Puri (6 pcs)', time: 10 },
    { name: 'Kathi Roll (Veg)', time: 12 },
    { name: 'Egg Kathi Roll', time: 12 },
    { name: 'Chicken Kathi Roll', time: 15 },
    { name: 'Paneer Kathi Roll', time: 15 },
    { name: 'Raj Kachori', time: 18 },
    { name: 'Pav Bhaji', time: 18 },
    { name: 'Chole Bhature', time: 25 },
    { name: 'Misal Pav', time: 25 },
    { name: 'Kulcha with Chana', time: 25 }
  ];

  try {
    for (const item of updates) {
      await connection.execute(
        'UPDATE products SET prep_time = ? WHERE name = ?',
        [item.time, item.name]
      );
      console.log(`Updated ${item.name} to ${item.time} min`);
    }
    console.log('\nAll prep times updated successfully!');
  } catch (error) {
    console.error('Error updating prep times:', error);
  } finally {
    await connection.end();
  }
};

updatePrepTimes();
