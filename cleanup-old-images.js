const fs = require('fs');
const path = require('path');

// Directory containing images
const assetsDir = path.join(__dirname, 'src', 'assets', 'image');

// Supported image formats to delete (after conversion to webp)
const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif'];

// Function to recursively find and delete old image files
function cleanupOldImages(dir) {
  const files = fs.readdirSync(dir);
  let deletedCount = 0;

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      deletedCount += cleanupOldImages(filePath);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (imageExtensions.includes(ext)) {
        // Check if webp version exists
        const webpPath = filePath.replace(/\.(png|jpg|jpeg|gif)$/i, '.webp');
        if (fs.existsSync(webpPath)) {
          fs.unlinkSync(filePath);
          console.log(`✓ Deleted: ${path.basename(filePath)}`);
          deletedCount++;
        }
      }
    }
  });

  return deletedCount;
}

// Main function
console.log('Cleaning up old image files (keeping only WebP versions)...\n');
const deletedCount = cleanupOldImages(assetsDir);
console.log(`\n=== Cleanup Summary ===`);
console.log(`✓ Deleted ${deletedCount} old image files`);
console.log('All images are now in WebP format!');


