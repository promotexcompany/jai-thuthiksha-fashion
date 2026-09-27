import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'jtf_production_jwt_secret_key_2026';

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Attempt DB lookup
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
      console.warn('DB token verify warning, using token claims fallback');
    }

    // Fallback using decoded token if valid
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name || 'Admin',
      role: decoded.role || 'ADMIN'
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

