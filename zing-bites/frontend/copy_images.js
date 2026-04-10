const fs = require('fs');
const path = require('path');

const brainPath = 'C:\\Users\\KRISHNAKUMAR P\\.gemini\\antigravity\\brain\\c332a7c0-78c5-4a8a-848d-2e77fdab6bfe';
const publicImagesPath = path.join(__dirname, 'public', 'images');

const filesToCopy = {
  'zing_special_burger_1775122055988.png': 'burger_real.png',
  'chole_bhature_1775122072571.png': 'chole_real.png',
  'pani_puri_1775122089152.png': 'panipuri_real.png',
  'chicken_kathi_roll_1775122106972.png': 'kathi_roll_real.png'
};

console.log("Extracting high-quality generated images into your public folder...");

Object.entries(filesToCopy).forEach(([srcName, destName]) => {
  const src = path.join(brainPath, srcName);
  const dest = path.join(publicImagesPath, destName);
  try {
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`✅ Successfully extracted: ${destName}`);
    } else {
      console.log(`⚠️ Could not find source image: ${srcName}. Make sure it is downloaded!`);
    }
  } catch(e) {
    console.error(`❌ Failed to copy ${srcName}: ${e.message}`);
  }
});
console.log("\nDone! Start your server again with `npm run dev`.");
