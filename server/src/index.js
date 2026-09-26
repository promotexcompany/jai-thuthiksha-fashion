import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

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
const allowedOrigins = process.env.CLIENT_URL ? [process.env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'] : '*';
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file uploads directory
const publicUploadsDir = path.join(__dirname, '../public/uploads');
app.use('/uploads', express.static(publicUploadsDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dresses', dressRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/filters', filterRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/offers', offersRoutes);
app.use('/api', uploadRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Jai Thuthiksha Fashion API Server Operational' });
});

// Start Server
export default app;

if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`JTF Express API Server listening on port ${PORT}`);
  });
}