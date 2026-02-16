import sharp from 'sharp';
import { readdir, mkdir } from 'fs/promises';
import { join, basename, extname } from 'path';

const inputDir = './public/images/media';
const outputDir = './public/images';

// Target sizes for different uses
const sizes = [
  { width: 1200, suffix: '' },      // Full size for hero/large displays
  { width: 800, suffix: '_md' },    // Medium for cards
  { width: 400, suffix: '_sm' },    // Small for thumbnails
];

async function optimizeImages() {
  try {
    const files = await readdir(inputDir);
    const imageFiles = files.filter(f => /\.(jpg|jpeg|png)$/i.test(f));

    console.log(`Found ${imageFiles.length} images to process...`);

    for (const file of imageFiles) {
      const inputPath = join(inputDir, file);
      const nameWithoutExt = basename(file, extname(file))
        .replace(/_HIGHRES/gi, '')
        .replace(/_BW/gi, '')
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');

      console.log(`Processing: ${file} -> ${nameWithoutExt}`);

      for (const size of sizes) {
        const outputName = `${nameWithoutExt}${size.suffix}.webp`;
        const outputPath = join(outputDir, outputName);

        await sharp(inputPath)
          .resize(size.width, null, {
            withoutEnlargement: true,
            fit: 'inside'
          })
          .webp({ quality: 82 })
          .toFile(outputPath);

        const stats = await sharp(outputPath).metadata();
        console.log(`  -> ${outputName} (${size.width}px, ${Math.round(stats.size / 1024)}kb)`);
      }
    }

    console.log('\nDone! Images optimized and saved to', outputDir);
  } catch (error) {
    console.error('Error:', error);
  }
}

optimizeImages();
