import jwt from 'jsonwebtoken';
import { readDb } from '../db.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'jtf_luxury_fashion_rental_secret_key_2026';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verify user exists in database & fetch current role from backend
    const db = readDb();
    const user = db.users.find(u => u.id === decoded.id || u.email === decoded.email);

    if (!user) {
      return res.status(401).json({ error: 'User account no longer exists.' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role // Always trust backend DB role
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session token.' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({
      error: '403 Forbidden: You do not have administrator permissions to access this resource.'
    });
  }
  next();
};
