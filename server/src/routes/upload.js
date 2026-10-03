import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { supabase } from '../config/supabase.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.join(__dirname, '../../public/uploads');

// Ensure public/uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid image type. Only JPG, PNG, and WEBP images are allowed.'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max limit
  fileFilter
});

const router = express.Router();

// GET /api/uploads/:filename & GET /uploads/:filename (Serve uploaded images securely with proper MIME type)
const serveUploadedFile = (req, res) => {
  const rawFilename = req.params.filename || '';
  const filename = path.basename(rawFilename);

  if (!filename) {
    return res.status(404).send('File not found');
  }

  const localFilePath = path.join(UPLOADS_DIR, filename);

  // 1. Check local filesystem first
  if (fs.existsSync(localFilePath)) {
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml'
    };
    const contentType = mimeTypes[ext] || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return fs.createReadStream(localFilePath).pipe(res);
  }

  // 2. Redirect to Supabase Storage public URL fallback
  const supabaseUrl = process.env.SUPABASE_URL || 'https://vdpudesdaydlcholqdmx.supabase.co';
  const publicStorageUrl = `${supabaseUrl}/storage/v1/object/public/dresses/${filename}`;
  return res.redirect(302, publicStorageUrl);
};

router.get('/uploads/:filename', serveUploadedFile);
router.get('/api/uploads/:filename', serveUploadedFile);

// POST /api/admin/upload (Admin Multi-Image Upload)
router.post('/admin/upload', verifyToken, requireAdmin, (req, res) => {
  upload.array('images', 12)(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'Image upload failed.' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files were uploaded.' });
    }

    try {
      const imageUrls = [];

      for (const file of req.files) {
        const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
        const filename = `dress-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

        let uploadedUrl = null;

        // 1. Try uploading to Supabase Storage bucket 'dresses'
        try {
          const { error: uploadError } = await supabase.storage
            .from('dresses')
            .upload(filename, file.buffer, {
              contentType: file.mimetype,
              upsert: true
            });

          if (!uploadError) {
            const { data: publicUrlData } = supabase.storage
              .from('dresses')
              .getPublicUrl(filename);

            if (publicUrlData && publicUrlData.publicUrl) {
              uploadedUrl = publicUrlData.publicUrl;
            }
          }
        } catch (storageErr) {
          console.warn('Supabase storage bucket upload notice:', storageErr);
        }

        // 2. Fallback to /api/uploads/ filename route if Supabase Storage is not active
        if (!uploadedUrl) {
          try {
            const localFilePath = path.join(UPLOADS_DIR, filename);
            fs.writeFileSync(localFilePath, file.buffer);
            uploadedUrl = `/api/uploads/${filename}`;
          } catch (fsErr) {
            console.warn('Local disk file write fallback warning:', fsErr);
          }
        }

        // 3. Fallback to Base64 Data URL if disk write failed
        if (!uploadedUrl) {
          const base64Str = file.buffer.toString('base64');
          uploadedUrl = `data:${file.mimetype};base64,${base64Str}`;
        }

        imageUrls.push(uploadedUrl);
      }

      res.json({
        message: 'Images uploaded successfully',
        urls: imageUrls
      });
    } catch (processErr) {
      console.error('Upload processing error:', processErr);
      res.status(500).json({ error: 'Failed to process uploaded images.' });
    }
  });
});

export default router;
