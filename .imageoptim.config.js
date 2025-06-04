module.exports = {
  // Input and output directories
  inputDir: 'public',
  outputDir: 'public/optimized',
  
  // Format generation
  generateWebP: true,
  generateAvif: false, // Enable for even better compression (newer browsers)
  
  // Quality settings (1-100)
  quality: {
    jpeg: 85,    // Good balance of quality and file size
    png: 90,     // PNG handles transparency, keep higher quality
    webp: 90,    // WebP is very efficient, can afford higher quality
    avif: 80     // AVIF is extremely efficient
  },
  
  // Auto-resize images based on their intended use
  resize: {
    // Hero images - large, high-impact images
    hero: { 
      width: 1920, 
      height: 1080, 
      fit: 'cover' // Crop to fit dimensions
    },
    
    // Product images - square format typical for e-commerce
    product: { 
      width: 800, 
      height: 800, 
      fit: 'cover' 
    },
    
    // Thumbnails - small preview images
    thumbnail: { 
      width: 400, 
      height: 400, 
      fit: 'cover' 
    }
  },
  
  // Advanced settings
  progressive: true,        // Enable progressive JPEG loading
  preserveOriginals: true,  // Keep original files
  removeMetadata: true,     // Strip EXIF data for smaller files
  
  // Optimization presets
  presets: {
    development: {
      quality: { jpeg: 95, png: 95, webp: 95 },
      generateWebP: false
    },
    
    production: {
      quality: { jpeg: 85, png: 90, webp: 90 },
      generateWebP: true,
      generateAvif: false
    },
    
    aggressive: {
      quality: { jpeg: 75, png: 85, webp: 85, avif: 75 },
      generateWebP: true,
      generateAvif: true
    }
  }
}; 