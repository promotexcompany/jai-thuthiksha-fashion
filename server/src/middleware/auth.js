import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';
import { readDb } from '../db.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'jtf_production_jwt_secret_key_2026';

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 1. Attempt Supabase lookup
    try {
      const { data: user } = await supabase
        .from('users')
        .select('id, email, name, role')
        .eq('id', decoded.id)
        .maybeSingle();

      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        };
        return next();
      }
    } catch (dbErr) {
      console.warn('Supabase DB token verify notice:', dbErr.message);
    }

    // 2. Attempt File DB lookup
    try {
      const db = readDb();
      const fileUser = (db.users || []).find(u => u.id === decoded.id);
      if (fileUser) {
        req.user = {
          id: fileUser.id,
          email: fileUser.email,
          name: fileUser.name,
          role: fileUser.role
        };
        return next();
      }
    } catch (fileDbErr) {
      console.warn('File DB lookup warning:', fileDbErr.message);
    }

    // 3. Fallback using decoded token claims
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name || 'User',
      role: decoded.role || 'CUSTOMER'
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


