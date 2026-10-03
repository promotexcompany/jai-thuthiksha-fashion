import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from './config/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicUploadsDir = path.resolve(__dirname, '../public/uploads');

if (!fs.existsSync(publicUploadsDir)) {
  fs.mkdirSync(publicUploadsDir, { recursive: true });
}

function getExtFromMime(mime) {
  if (mime.includes('png')) return '.png';
  if (mime.includes('webp')) return '.webp';
  if (mime.includes('gif')) return '.gif';
  return '.jpg';
}

function saveBase64ToFile(base64Str, prefix) {
  if (!base64Str || typeof base64Str !== 'string' || !base64Str.startsWith('data:image')) {
    return base64Str; // Return as-is if already an HTTP URL
  }

  try {
    const match = base64Str.match(/^data:(image\/[a-zA-Z0-9-+.]+);base64,(.+)$/);
    if (!match) return base64Str;

    const mimeType = match[1];
    const rawData = match[2];
    const ext = getExtFromMime(mimeType);
    const filename = `migrated-${prefix}-${Date.now()}-${Math.round(Math.random() * 1000)}${ext}`;
    const filePath = path.join(publicUploadsDir, filename);

    const buffer = Buffer.from(rawData, 'base64');
    fs.writeFileSync(filePath, buffer);

    console.log(`Saved Base64 image (${(buffer.length / 1024).toFixed(1)} KB) -> ${filename}`);
    return `/uploads/${filename}`;
  } catch (err) {
    console.error('Error converting base64 to file:', err);
    return base64Str;
  }
}

async function migrate() {
  console.log('--- Starting Base64 to Image File Migration ---');

  const { data: dresses, error } = await supabase.from('dresses').select('*');
  if (error) {
    console.error('Failed to fetch dresses from Supabase:', error);
    process.exit(1);
  }

  console.log(`Found ${dresses.length} total dresses in database.`);
  let convertedDressesCount = 0;
  let totalImagesConverted = 0;

  for (const dress of dresses) {
    let modified = false;

    // Convert primary_image
    if (dress.primary_image && dress.primary_image.startsWith('data:image')) {
      const newPrimaryUrl = saveBase64ToFile(dress.primary_image, `${dress.id}-primary`);
      if (newPrimaryUrl !== dress.primary_image) {
        dress.primary_image = newPrimaryUrl;
        modified = true;
        totalImagesConverted++;
      }
    }

    // Convert images array
    if (Array.isArray(dress.images)) {
      const newImagesList = [];
      for (let i = 0; i < dress.images.length; i++) {
        const img = dress.images[i];
        if (typeof img === 'string' && img.startsWith('data:image')) {
          const newUrl = saveBase64ToFile(img, `${dress.id}-img${i}`);
          if (newUrl !== img) {
            newImagesList.push(newUrl);
            modified = true;
            totalImagesConverted++;
          } else {
            newImagesList.push(img);
          }
        } else {
          newImagesList.push(img);
        }
      }
      dress.images = newImagesList;
    }

    if (modified) {
      console.log(`Updating DB record for dress: ${dress.id} (${dress.name})...`);
      const { error: updateErr } = await supabase
        .from('dresses')
        .update({
          primary_image: dress.primary_image,
          images: dress.images
        })
        .eq('id', dress.id);

      if (updateErr) {
        console.error(`Failed to update dress ${dress.id} in Supabase:`, updateErr);
      } else {
        convertedDressesCount++;
      }
    }
  }

  console.log('--- Migration Completed ---');
  console.log(`Dresses updated: ${convertedDressesCount}`);
  console.log(`Total Base64 images saved to disk and converted to URLs: ${totalImagesConverted}`);
}

migrate();
