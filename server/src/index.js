import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from './config/supabase.js';

import authRoutes from './routes/auth.js';
import dressRoutes from './routes/dresses.js';
import categoryRoutes from './routes/categories.js';
import filterRoutes from './routes/filters.js';
import bookingRoutes from './routes/bookings.js';
import settingsRoutes from './routes/settings.js';
import uploadRoutes from './routes/upload.js';
import contactRoutes from './routes/contact.js';
import offersRoutes from './routes/offers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend client
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173,http://localhost:3000').split(',').map((origin) => origin.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin not allowed by CORS'));
  },
  credentials: true
}));

// Default anti-caching middleware for sensitive/authenticated routes
app.use((req, res, next) => {
  const isPublicRead = req.method === 'GET' && (
    req.path.startsWith('/api/dresses') || req.path.startsWith('/dresses') ||
    req.path.startsWith('/api/categories') || req.path.startsWith('/categories') ||
    req.path.startsWith('/api/filters') || req.path.startsWith('/filters') ||
    req.path.startsWith('/api/offers') || req.path.startsWith('/offers')
  ) && !req.path.includes('/admin');

  if (!isPublicRead) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
  }
  next();
});

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ limit: '2mb', extended: true }));

// Static file uploads directory
const publicUploadsDir = path.join(__dirname, '../public/uploads');
app.use('/uploads', express.static(publicUploadsDir));

// API Routes (Mounted on /api and root fallback for serverless path rewrites)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/dresses', dressRoutes);
app.use('/dresses', dressRoutes);

app.use('/api/categories', categoryRoutes);
app.use('/categories', categoryRoutes);

app.use('/api/filters', filterRoutes);
app.use('/filters', filterRoutes);

app.use('/api/bookings', bookingRoutes);
app.use('/bookings', bookingRoutes);

app.use('/api/settings', settingsRoutes);
app.use('/settings', settingsRoutes);

app.use('/api/contact', contactRoutes);
app.use('/contact', contactRoutes);

app.use('/api/offers', offersRoutes);
app.use('/offers', offersRoutes);

app.use('/api', uploadRoutes);

// Health Check
const handleHealth = (req, res) => {
  res.json({ status: 'ok', message: 'Jai Thuthiksha Fashion API Server Operational' });
};
app.get('/api/health', handleHealth);
app.get('/health', handleHealth);

// Start Server
export default app;

if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`JTF Express API Server listening on port ${PORT}`);
    // Non-blocking warmup query to pre-establish Supabase DNS, TCP, and TLS connection
    supabase
      .from('dresses')
      .select('id')
      .limit(1)
      .then(() => {
        console.log('Supabase DB connection pre-warmed successfully.');
      })
      .catch((err) => {
        console.warn('Supabase DB pre-warmup notice:', err?.message || err);
      });
  });
}