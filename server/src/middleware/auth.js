import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';

export const JWT_SECRET = process.env.JWT_SECRET;

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Authentication required.' });
  if (!JWT_SECRET || JWT_SECRET.length < 32) return res.status(503).json({ error: 'Authentication is not configured securely.' });
  try {
    const decoded = jwt.verify(authHeader.slice(7), JWT_SECRET);
    if (!decoded?.id) return res.status(401).json({ error: 'Invalid session token.' });
    const { data: user, error } = await supabase.from('users').select('id,email,name,role').eq('id', decoded.id).maybeSingle();
    if (error) return res.status(503).json({ error: 'Unable to validate session.' });
    if (!user) return res.status(401).json({ error: 'Account is no longer active.' });
    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session token.' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Administrator access required.' });
  next();
};
