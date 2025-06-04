#!/usr/bin/env node

const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const imageminWebp = require('imagemin-webp');
const imageminSvgo = require('imagemin-svgo');
const imageminGifsicle = require('imagemin-gifsicle');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Configuration
const config = {
  inputDir: 'public',
  outputDir: 'public/optimized',
  generateWebP: true,
  generateAvif: false, // Set to true if you want AVIF (newer format)
  preserveOriginals: true,
  quality: {
    jpeg: 85,
    png: 90,
    webp: 90,
    avif: 80
  },
  // Resize options for different use cases
  resize: {
    hero: { width: 1920, height: 1080, fit: 'cover' },
    product: { width: 800, height: 800, fit: 'cover' },
    thumbnail: { width: 400, height: 400, fit: 'cover' }
  }
};

// Get file size in MB
function getFileSizeInMB(filePath) {
  const stats = fs.statSync(filePath);
  return (stats.size / (1024 * 1024)).toFixed(2);
}

// Ensure directory exists
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Get all image files recursively
function getAllImageFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      getAllImageFiles(fullPath, files);
    } else if (/\.(jpe?g|png|gif|webp|svg)$/i.test(item)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Determine image category based on path
function getImageCategory(filePath) {
  const pathLower = filePath.toLowerCase();
  if (pathLower.includes('hero')) return 'hero';
  if (pathLower.includes('product')) return 'product';
  if (pathLower.includes('thumb')) return 'thumbnail';
  return 'default';
}

// Optimize with Sharp (for resizing and format conversion)
async function optimizeWithSharp(inputPath, outputDir, category) {
  const extname = path.extname(inputPath).toLowerCase();
  const basename = path.basename(inputPath, extname);
  const relativePath = path.relative(config.inputDir, path.dirname(inputPath));
  const outputDirPath = path.join(outputDir, relativePath);
  
  ensureDir(outputDirPath);
  
  const results = [];
  
  try {
    let sharpInstance = sharp(inputPath);
    
    // Apply resizing based on category
    if (config.resize[category] && category !== 'default') {
      const { width, height, fit } = config.resize[category];
      sharpInstance = sharpInstance.resize(width, height, { fit, withoutEnlargement: true });
    }
    
    // Generate optimized original format
    if (extname === '.jpg' || extname === '.jpeg') {
      const outputPath = path.join(outputDirPath, `${basename}.jpg`);
      await sharpInstance.jpeg({ quality: config.quality.jpeg, progressive: true }).toFile(outputPath);
      results.push({ format: 'JPEG', path: outputPath, size: getFileSizeInMB(outputPath) });
    } else if (extname === '.png') {
      const outputPath = path.join(outputDirPath, `${basename}.png`);
      await sharpInstance.png({ quality: config.quality.png, progressive: true }).toFile(outputPath);
      results.push({ format: 'PNG', path: outputPath, size: getFileSizeInMB(outputPath) });
    }
    
    // Generate WebP version
    if (config.generateWebP && extname !== '.svg') {
      const webpPath = path.join(outputDirPath, `${basename}.webp`);
      await sharp(inputPath)
        .resize(config.resize[category]?.width, config.resize[category]?.height, { 
          fit: config.resize[category]?.fit || 'cover', 
          withoutEnlargement: true 
        })
        .webp({ quality: config.quality.webp })
        .toFile(webpPath);
      results.push({ format: 'WebP', path: webpPath, size: getFileSizeInMB(webpPath) });
    }
    
    // Generate AVIF version (if enabled)
    if (config.generateAvif && extname !== '.svg') {
      const avifPath = path.join(outputDirPath, `${basename}.avif`);
      await sharp(inputPath)
        .resize(config.resize[category]?.width, config.resize[category]?.height, { 
          fit: config.resize[category]?.fit || 'cover', 
          withoutEnlargement: true 
        })
        .avif({ quality: config.quality.avif })
        .toFile(avifPath);
      results.push({ format: 'AVIF', path: avifPath, size: getFileSizeInMB(avifPath) });
    }
    
  } catch (error) {
    log('red', `Error processing ${inputPath}: ${error.message}`);
  }
  
  return results;
}

// Optimize with imagemin (for SVGs and additional compression)
async function optimizeWithImagemin(inputPath, outputDir) {
  const extname = path.extname(inputPath).toLowerCase();
  const relativePath = path.relative(config.inputDir, path.dirname(inputPath));
  const outputDirPath = path.join(outputDir, relativePath);
  
  ensureDir(outputDirPath);
  
  if (extname === '.svg') {
    try {
      await imagemin([inputPath], {
        destination: outputDirPath,
        plugins: [
          imageminSvgo({
            plugins: [
              { name: 'removeViewBox', active: false },
              { name: 'removeDimensions', active: true }
            ]
          })
        ]
      });
      
      const outputPath = path.join(outputDirPath, path.basename(inputPath));
      return [{ format: 'SVG', path: outputPath, size: getFileSizeInMB(outputPath) }];
    } catch (error) {
      log('red', `Error optimizing SVG ${inputPath}: ${error.message}`);
      return [];
    }
  }
  
  return [];
}

// Main optimization function
async function optimizeImages() {
  log('bold', '🖼️  Image Optimization Tool for Wufi Storefront');
  log('cyan', '================================================');
  
  const startTime = Date.now();
  
  // Ensure output directory exists
  ensureDir(config.outputDir);
  
  // Get all image files
  log('blue', `\n📁 Scanning for images in ${config.inputDir}...`);
  const imageFiles = getAllImageFiles(config.inputDir);
  
  if (imageFiles.length === 0) {
    log('yellow', 'No image files found!');
    return;
  }
  
  log('green', `Found ${imageFiles.length} image files to optimize\n`);
  
  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;
  let processedCount = 0;
  
  // Process each image
  for (const imagePath of imageFiles) {
    const originalSize = parseFloat(getFileSizeInMB(imagePath));
    totalOriginalSize += originalSize;
    
    log('blue', `\n📸 Processing: ${path.relative(config.inputDir, imagePath)} (${originalSize} MB)`);
    
    const category = getImageCategory(imagePath);
    const extname = path.extname(imagePath).toLowerCase();
    
    let results = [];
    
    if (extname === '.svg') {
      results = await optimizeWithImagemin(imagePath, config.outputDir);
    } else {
      results = await optimizeWithSharp(imagePath, config.outputDir, category);
    }
    
    // Display results
    for (const result of results) {
      const optimizedSize = parseFloat(result.size);
      totalOptimizedSize += optimizedSize;
      const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
      
      log('green', `   ✅ ${result.format}: ${result.size} MB (${savings}% smaller)`);
    }
    
    processedCount++;
    log('cyan', `   Progress: ${processedCount}/${imageFiles.length}`);
  }
  
  // Summary
  const totalSavings = ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize * 100).toFixed(1);
  const timeTaken = ((Date.now() - startTime) / 1000).toFixed(1);
  
  log('bold', '\n🎉 Optimization Complete!');
  log('cyan', '========================');
  log('green', `📊 Original size: ${totalOriginalSize.toFixed(2)} MB`);
  log('green', `📉 Optimized size: ${totalOptimizedSize.toFixed(2)} MB`);
  log('green', `💾 Total savings: ${totalSavings}% (${(totalOriginalSize - totalOptimizedSize).toFixed(2)} MB)`);
  log('blue', `⏱️  Time taken: ${timeTaken} seconds`);
  log('yellow', `\n📁 Optimized images saved to: ${config.outputDir}`);
  
  if (config.generateWebP) {
    log('cyan', '\n💡 Pro tip: Use WebP images in your Next.js components for best performance!');
    log('cyan', '   Example: <Image src="/optimized/hero/image.webp" alt="..." />');
  }
}

// Command line arguments parsing
const args = process.argv.slice(2);
const flags = {
  help: args.includes('--help') || args.includes('-h'),
  webp: args.includes('--webp'),
  avif: args.includes('--avif'),
  replace: args.includes('--replace'),
  quality: args.find(arg => arg.startsWith('--quality='))?.split('=')[1]
};

if (flags.help) {
  log('bold', '🖼️  Image Optimization Tool');
  log('cyan', '==========================');
  console.log(`
Usage: npm run optimize-images [options]

Options:
  --help, -h     Show this help message
  --webp         Generate WebP versions (default: true)
  --avif         Generate AVIF versions (default: false) 
  --replace      Replace original files with optimized ones
  --quality=N    Set JPEG/WebP quality (1-100, default: 85)

Examples:
  npm run optimize-images                    # Basic optimization
  npm run optimize-images -- --webp --avif  # Generate WebP and AVIF
  npm run optimize-images -- --quality=90   # Higher quality
  npm run optimize-images -- --replace      # Replace originals
  `);
  process.exit(0);
}

// Apply flags
if (flags.webp) config.generateWebP = true;
if (flags.avif) config.generateAvif = true;
if (flags.replace) {
  config.outputDir = config.inputDir;
  config.preserveOriginals = false;
}
if (flags.quality) {
  const quality = parseInt(flags.quality);
  if (quality >= 1 && quality <= 100) {
    config.quality.jpeg = quality;
    config.quality.webp = quality;
  }
}

// Run optimization
optimizeImages().catch(error => {
  log('red', `❌ Optimization failed: ${error.message}`);
  process.exit(1);
}); 