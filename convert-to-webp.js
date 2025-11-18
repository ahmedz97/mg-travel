const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Directory containing images
const assetsDir = path.join(__dirname, 'src', 'assets', 'image');

// Supported image formats
const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif'];

// Function to recursively find all image files
function findImageFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findImageFiles(filePath, fileList);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (imageExtensions.includes(ext)) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

// Function to convert image to WebP
async function convertToWebP(inputPath) {
  try {
    const outputPath = inputPath.replace(/\.(png|jpg|jpeg|gif)$/i, '.webp');
    
    // Skip if WebP already exists
    if (fs.existsSync(outputPath)) {
      console.log(`Skipping ${inputPath} - WebP already exists`);
      return { inputPath, outputPath, success: true, skipped: true };
    }

    await sharp(inputPath)
      .webp({ quality: 85 })
      .toFile(outputPath);

    console.log(`✓ Converted: ${path.basename(inputPath)} → ${path.basename(outputPath)}`);
    return { inputPath, outputPath, success: true, skipped: false };
  } catch (error) {
    console.error(`✗ Error converting ${inputPath}:`, error.message);
    return { inputPath, outputPath: null, success: false, error: error.message };
  }
}

// Main function
async function main() {
  console.log('Starting image conversion to WebP...\n');
  
  const imageFiles = findImageFiles(assetsDir);
  console.log(`Found ${imageFiles.length} image files to convert.\n`);

  const results = [];
  
  for (const imageFile of imageFiles) {
    const result = await convertToWebP(imageFile);
    results.push(result);
  }

  console.log('\n=== Conversion Summary ===');
  const successful = results.filter(r => r.success && !r.skipped).length;
  const skipped = results.filter(r => r.skipped).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`✓ Successfully converted: ${successful}`);
  console.log(`⊘ Skipped (already exists): ${skipped}`);
  console.log(`✗ Failed: ${failed}`);

  if (failed > 0) {
    console.log('\nFailed files:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.inputPath}: ${r.error}`);
    });
  }
}

// Run the conversion
main().catch(console.error);


