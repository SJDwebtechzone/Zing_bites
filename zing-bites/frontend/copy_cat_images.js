const fs = require('fs');
const path = require('path');

const brainPath = 'C:\\Users\\KRISHNAKUMAR P\\.gemini\\antigravity\\brain\\c332a7c0-78c5-4a8a-848d-2e77fdab6bfe';
const publicImagesPath = path.join(__dirname, 'public', 'images');

const filesToCopy = {
  'street_foods_cat_v2_1775145813326.png': 'cat_street.png',
  'burgers_cat_v2_1775145831682.png': 'cat_burger.png',
  'snacks_cat_v2_1775145853263.png': 'cat_snacks.png',
  'indian_specials_cat_v2_1775145872133.png': 'cat_indian.png'
};

console.log("Extracting high-quality category images into your public folder...");

if (!fs.existsSync(publicImagesPath)) {
  fs.mkdirSync(publicImagesPath, { recursive: true });
}

Object.entries(filesToCopy).forEach(([srcName, destName]) => {
  const src = path.join(brainPath, srcName);
  const dest = path.join(publicImagesPath, destName);
  try {
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`✅ Successfully extracted: ${destName}`);
    } else {
      console.log(`⚠️ Could not find source image: ${srcName}.`);
    }
  } catch(e) {
    console.error(`❌ Failed to copy ${srcName}: ${e.message}`);
  }
});
console.log("\nDone! Start your server again.");
