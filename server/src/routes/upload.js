import express from 'express';
import multer from 'multer';
import path from 'path';
import { supabase } from '../config/supabase.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

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
          // Auto-verify / create bucket if missing
          const { data: buckets } = await supabase.storage.listBuckets().catch(() => ({ data: [] }));
          if (!buckets?.some(b => b.name === 'dresses')) {
            await supabase.storage.createBucket('dresses', { public: true, fileSizeLimit: 10485760 }).catch(() => {});
          }

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
          } else {
            console.warn('Upload to Supabase Storage dresses bucket failed:', uploadError.message);
          }
        } catch (storageErr) {
          console.warn('Supabase storage bucket upload notice:', storageErr);
        }

        // 2. Fallback to local static file storage if Supabase bucket upload fails
        if (!uploadedUrl) {
          const fs = await import('fs');
          const publicUploadsDir = path.resolve(process.cwd(), 'public/uploads');
          if (!fs.existsSync(publicUploadsDir)) {
            fs.mkdirSync(publicUploadsDir, { recursive: true });
          }
          const filePath = path.join(publicUploadsDir, filename);
          fs.writeFileSync(filePath, file.buffer);
          uploadedUrl = `/uploads/${filename}`;
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
