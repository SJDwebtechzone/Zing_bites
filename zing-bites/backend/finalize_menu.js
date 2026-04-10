const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

const imgDir = path.join(__dirname, '..', 'frontend', 'public', 'images', 'products');
const brainDir = 'C:\\Users\\KRISHNAKUMAR P\\.gemini\\antigravity\\brain\\620b344a-29ad-4dc2-8ae5-dc4dcb0e9af3';

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'zing_bites'
  });

  try {
    // 1. Move and Rename Images from BOTH Brain folder and Image folder
    // This handles files in either location
    const locations = [brainDir, imgDir];
    
    for (const loc of locations) {
      if (!fs.existsSync(loc)) continue;
      const files = fs.readdirSync(loc).filter(f => f.endsWith('.png') && f.includes('_realistic_'));
      
      for (const file of files) {
        let slug = file.replace(/^cat\d_/, '').split('_realistic_')[0];
        const dest = path.join(imgDir, `${slug}.png`);
        const src = path.join(loc, file);
        
        fs.copyFileSync(src, dest);
        console.log(`📸 Updated: ${slug}.png`);
        
        // Clean up the long-named file if it's in the target folder already
        if (loc === imgDir && file !== `${slug}.png`) {
          try { fs.unlinkSync(src); } catch (e) {}
        }
      }
    }

    // 2. Update Database with clean paths
    // We update both new and old products to use the clean [slug].png path
    const [products] = await conn.execute('SELECT id, name FROM products');
    
    for (const p of products) {
      const slug = p.name.toLowerCase()
                  .replace(/\(.*\)/g, '') // remove (6 pcs) etc
                  .trim()
                  .replace(/\s+/g, '_')
                  .replace(/&/g, 'and');
      
      const imgPath = `/images/products/${slug}.png`;
      const fullPath = path.join(imgDir, `${slug}.png`);

      if (fs.existsSync(fullPath)) {
        await conn.execute('UPDATE products SET image_url = ? WHERE id = ?', [imgPath, p.id]);
        console.log(`✅ Set image for: ${p.name}`);
      } else {
        // Use generic placeholders for now to avoid the "Salad Bowl" confusion
        // If it's non-veg, use nonveg_placeholder, else veg_placeholder
        const [pInfo] = await conn.execute('SELECT is_vegetarian FROM products WHERE id = ?', [p.id]);
        const placeholder = pInfo[0].is_vegetarian ? '/images/veg_placeholder.png' : '/images/nonveg_placeholder.png';
        await conn.execute('UPDATE products SET image_url = ? WHERE id = ?', [placeholder, p.id]);
        console.log(`⚠️  Placeholder for: ${p.name}`);
      }
    }

    console.log('\n🌟 Finalization Complete! Refresh your menu to see the changes.');

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await conn.end();
  }
}

run();
