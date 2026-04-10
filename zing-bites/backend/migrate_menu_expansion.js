const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'zing_bites',
    multipleStatements: true
  });

  try {
    console.log('🔌 Connected to MySQL...');

    const products = [
      // Street Foods (10)
      { cat: 1, name: 'Masala Pav', desc: 'Spicy bhaji with buttered pav, onions & lemon', price: 60.00, img: '/images/products/masala_pav.png', veg: true, spice: 'medium' },
      { cat: 1, name: 'Pani Puri (6 pcs)', desc: 'Crispy puris with tangy tamarind water', price: 50.00, img: '/images/products/pani_puri.png', veg: true, spice: 'hot' },
      { cat: 1, name: 'Bhel Puri', desc: 'Puffed rice, veggies, chutneys - classic street mix', price: 55.00, img: '/images/products/bhel_puri.png', veg: true, spice: 'mild' },
      { cat: 1, name: 'Corn Chaat', desc: 'Roasted corn with spices, lime & butter', price: 70.00, img: '/images/products/corn_chaat.png', veg: true, spice: 'medium' },
      { cat: 1, name: 'Samosa (2 pcs)', desc: 'Golden crispy samosas with green chutney', price: 40.00, img: '/images/products/samosa.png', veg: true, spice: 'medium' },
      { cat: 1, name: 'Vada Pav', desc: 'Spiced potato fritter in a soft bun with chutneys', price: 45.00, img: '/images/products/vada_pav.png', veg: true, spice: 'medium' },
      { cat: 1, name: 'Sev Puri', desc: 'Crispy papdis topped with spiced potatoes and sev', price: 55.00, img: '/images/products/sev_puri.png', veg: true, spice: 'medium' },
      { cat: 1, name: 'Dabeli', desc: 'Kutchi Dabeli with pomegranate and spiced peanuts', price: 50.00, img: '/images/products/dabeli.png', veg: true, spice: 'medium' },
      { cat: 1, name: 'Papdi Chaat', desc: 'Crispy wafers with yogurt, chickpeas and chutneys', price: 65.00, img: '/images/products/papdi_chaat.png', veg: true, spice: 'medium' },
      { cat: 1, name: 'Ragda Pattice', desc: 'Potato patties with white pea curry and toppings', price: 75.00, img: '/images/products/ragda_pattice.png', veg: true, spice: 'medium' },

      // Burgers & Sandwiches (10)
      { cat: 2, name: 'Zing Special Burger', desc: 'Signature double-patty with special Zing sauce', price: 180.00, img: '/images/products/zing_special_burger.png', veg: false, spice: 'medium' },
      { cat: 2, name: 'Aloo Tikki Burger', desc: 'Spiced potato patty with mint chutney & veggies', price: 120.00, img: '/images/products/aloo_tikki_burger.png', veg: true, spice: 'medium' },
      { cat: 2, name: 'Chicken Crispy Burger', desc: 'Crispy fried chicken with coleslaw & sriracha', price: 160.00, img: '/images/products/chicken_crispy_burger.png', veg: false, spice: 'hot' },
      { cat: 2, name: 'Grilled Veg Sandwich', desc: 'Loaded veggie sandwich with cheese & pesto', price: 110.00, img: '/images/products/grilled_veg_sandwich.png', veg: true, spice: 'mild' },
      { cat: 2, name: 'Club Sandwich', desc: 'Triple-decker with chicken, egg, tomato & lettuce', price: 150.00, img: '/images/products/club_sandwich.png', veg: false, spice: 'mild' },
      { cat: 2, name: 'Paneer Makhani Burger', desc: 'Grilled paneer with creamy makhani sauce', price: 150.00, img: '/images/products/paneer_makhani_burger.png', veg: true, spice: 'medium' },
      { cat: 2, name: 'BBQ Mushroom Burger', desc: 'Grilled mushrooms with smoky BBQ sauce', price: 140.00, img: '/images/products/bbq_mushroom_burger.png', veg: true, spice: 'mild' },
      { cat: 2, name: 'Bombay Toastie', desc: 'Spiced potato and veggie toasted sandwich', price: 90.00, img: '/images/products/bombay_toastie.png', veg: true, spice: 'medium' },
      { cat: 2, name: 'Peri Peri Chicken Sandwich', desc: 'Spicy peri peri chicken strips in toasted bread', price: 140.00, img: '/images/products/peri_peri_chicken_sandwich.png', veg: false, spice: 'hot' },
      { cat: 2, name: 'Spicy Fish Fillet Burger', desc: 'Crispy fish fillet with tartar sauce', price: 170.00, img: '/images/products/fish_fillet_burger.png', veg: false, spice: 'medium' },

      // Snacks & Sides (10)
      { cat: 3, name: 'Loaded Fries', desc: 'Crispy fries with cheese sauce & jalapeños', price: 120.00, img: '/images/products/loaded_fries.png', veg: true, spice: 'medium' },
      { cat: 3, name: 'Onion Rings (8 pcs)', desc: 'Beer-battered golden onion rings', price: 90.00, img: '/images/products/onion_rings.png', veg: true, spice: 'mild' },
      { cat: 3, name: 'Chicken Nuggets (6 pcs)', desc: 'Juicy chicken nuggets with dipping sauce', price: 130.00, img: '/images/products/chicken_nuggets.png', veg: false, spice: 'mild' },
      { cat: 3, name: 'Masala Popcorn', desc: 'Chennai-style spiced caramel popcorn', price: 60.00, img: '/images/products/masala_popcorn.png', veg: true, spice: 'medium' },
      { cat: 3, name: 'Cheese Balls (6 pcs)', desc: 'Gooey mozzarella cheese balls - crispy', price: 100.00, img: '/images/products/cheese_balls.png', veg: true, spice: 'mild' },
      { cat: 3, name: 'Peri Peri Fries', desc: 'Crispy fries tossed in spicy peri peri mix', price: 95.00, img: '/images/products/peri_peri_fries.png', veg: true, spice: 'hot' },
      { cat: 3, name: 'Sweet Potato Wedges', desc: 'Healthy roasted sweet potato wedges', price: 110.00, img: '/images/products/sweet_potato_wedges.png', veg: true, spice: 'mild' },
      { cat: 3, name: 'Veg Spring Rolls (4 pcs)', desc: 'Crispy rolls with veggie filling', price: 120.00, img: '/images/products/veg_spring_rolls.png', veg: true, spice: 'mild' },
      { cat: 3, name: 'Chilli Cheese Toasts', desc: 'Spicy cheese on toasted bread', price: 100.00, img: '/images/products/chilli_cheese_toasts.png', veg: true, spice: 'medium' },
      { cat: 3, name: 'Masala Omelette', desc: 'Indian style egg omelette with spices', price: 80.00, img: '/images/products/masala_omelette.png', veg: false, spice: 'medium' },

      // Indian Specials (10)
      { cat: 4, name: 'Chole Bhature', desc: 'Spicy chickpea curry with fluffy bhature', price: 130.00, img: '/images/products/chole_bhature.png', veg: true, spice: 'hot' },
      { cat: 4, name: 'Dahi Puri (6 pcs)', desc: 'Crispy puris with yogurt and chutneys', price: 80.00, img: '/images/products/dahi_puri.png', veg: true, spice: 'medium' },
      { cat: 4, name: 'Kathi Roll (Veg)', desc: 'Paneer tikka wrap with mint chutney', price: 120.00, img: '/images/products/kathi_roll_veg.png', veg: true, spice: 'medium' },
      { cat: 4, name: 'Chicken Kathi Roll', desc: 'Spiced chicken wrap with onions', price: 140.00, img: '/images/products/chicken_kathi_roll.png', veg: false, spice: 'hot' },
      { cat: 4, name: 'Raj Kachori', desc: 'Giant puri bowl with chickpeas and yogurt', price: 110.00, img: '/images/products/raj_kachori.png', veg: true, spice: 'medium' },
      { cat: 4, name: 'Pav Bhaji', desc: 'Mumbai style mashed veg curry with pav', price: 120.00, img: '/images/products/pav_bhaji.png', veg: true, spice: 'medium' },
      { cat: 4, name: 'Misal Pav', desc: 'Spicy sprout curry with pav and farsan', price: 100.00, img: '/images/products/misal_pav.png', veg: true, spice: 'hot' },
      { cat: 4, name: 'Kulcha with Chana', desc: 'Soft kulchas served with spicy chickpeas', price: 130.00, img: '/images/products/chole_bhature.png', veg: true, spice: 'medium' },
      { cat: 4, name: 'Paneer Kathi Roll', desc: 'Grilled paneer wrap specialized with spices', price: 130.00, img: '/images/products/kathi_roll_veg.png', veg: true, spice: 'medium' },
      { cat: 4, name: 'Egg Kathi Roll', desc: 'Classic egg wrap with sautéed veggies', price: 110.00, img: '/images/products/chicken_kathi_roll.png', veg: false, spice: 'medium' }
    ];

    for (const p of products) {
      await conn.execute(
        `INSERT INTO products (category_id, name, description, price, image_url, is_vegetarian, spice_level) 
         VALUES (?, ?, ?, ?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE 
         description = VALUES(description), 
         price = VALUES(price), 
         image_url = IFNULL(VALUES(image_url), image_url), 
         is_vegetarian = VALUES(is_vegetarian), 
         spice_level = VALUES(spice_level)`,
        [p.cat, p.name, p.desc, p.price, p.img, p.veg, p.spice]
      );
    }

    console.log('✅ Menu expansion complete! 40 products processed.');

  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await conn.end();
  }
}

migrate();
