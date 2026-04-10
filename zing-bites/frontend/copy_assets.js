const fs = require('fs');
const path = require('path');

const srcDir = `C:\\Users\\KRISHNAKUMAR P\\.gemini\\antigravity\\brain\\c332a7c0-78c5-4a8a-848d-2e77fdab6bfe`;
const destDir = path.join(__dirname, 'public', 'images');

// We are only updating the food truck image this time.
const filesToCopy = {
  'food_truck_transparent_1775109001928.png': 'food_truck.png',
};

let successCount = 0;

for (const [srcFile, destFile] of Object.entries(filesToCopy)) {
  const srcPath = path.join(srcDir, srcFile);
  const destPath = path.join(destDir, destFile);

  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`✅ Copied ${destFile}`);
    successCount++;
  } else {
    console.error(`❌ Source not found: ${srcPath}`);
  }
}

console.log(`\nDone! Successfully updated ${successCount} image(s).`);
