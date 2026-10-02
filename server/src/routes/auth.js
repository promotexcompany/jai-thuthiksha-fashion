import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { supabase } from '../config/supabase.js';
import { verifyToken, JWT_SECRET } from '../middleware/auth.js';
import { readDb, writeDb } from '../db.js';

const router = express.Router();

/* =========================================================
   REGISTER CUSTOMER
   POST /api/auth/register
========================================================= */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Name, email, and password are required.'
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return res.status(400).json({
        error: 'Please enter a valid email address.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters.'
      });
    }

    // Check whether user already exists in File DB or Supabase
    const db = readDb();
    const existingInFile = (db.users || []).find(u => u.email.toLowerCase() === cleanEmail);
    if (existingInFile) {
      return res.status(409).json({
        error: 'An account with this email address already exists.'
      });
    }

    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, email')
        .ilike('email', cleanEmail)
        .maybeSingle();

      if (existingUser) {
        return res.status(409).json({
          error: 'An account with this email address already exists.'
        });
      }
    } catch (e) {}

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `usr-cust-${Date.now()}`;

    const newUser = {
      id: userId,
      email: cleanEmail,
      name: cleanName,
      password: hashedPassword,
      role: 'CUSTOMER',
      createdAt: new Date().toISOString()
    };

    // Save to File DB
    if (!db.users) db.users = [];
    db.users.push(newUser);
    writeDb(db);

    // Sync to Supabase if available
    try {
      await supabase.from('users').insert([{
        id: userId,
        email: cleanEmail,
        name: cleanName,
        password: hashedPassword,
        role: 'CUSTOMER'
      }]);
    } catch (e) {}

    const tokenUser = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role
    };

    // Generate JWT token
    const token = jwt.sign(tokenUser, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: tokenUser
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      error: 'Internal server error.'
    });
  }
});


/* =========================================================
   LOGIN
   POST /api/auth/login
========================================================= */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !email.trim() || !password || !password.trim()) {
      return res.status(400).json({
        error: 'Email and password are required.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    const masterAdminPassword = process.env.ADMIN_PASSWORD || 'Admin@JTF2026';

    // 1. Look up user in File DB & Supabase first
    let user = null;
    const db = readDb();
    user = (db.users || []).find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      try {
        const { data } = await supabase
          .from('users')
          .select('*')
          .ilike('email', cleanEmail)
          .maybeSingle();
        if (data) user = data;
      } catch (dbErr) {}
    }

    // 2. Master Admin Email Check (admin@jaithuthiksha.com or admin@jaithuthikshafashion.online or user with ADMIN role)
    const isMasterAdminEmail = cleanEmail === 'admin@jaithuthiksha.com' || cleanEmail === 'admin@jaithuthikshafashion.online';

    if (isMasterAdminEmail && (cleanPassword === masterAdminPassword || cleanPassword === 'Admin@JTF2026')) {
      const adminId = user ? user.id : 'usr-admin-1';
      const adminName = user ? user.name : 'Master Shop Admin';

      const token = jwt.sign(
        {
          id: adminId,
          email: cleanEmail,
          role: 'ADMIN',
          name: adminName
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        message: 'Admin login successful',
        token,
        user: {
          id: adminId,
          email: cleanEmail,
          name: adminName,
          role: 'ADMIN'
        }
      });
    }

    // 3. User verification with bcrypt password hash check or master password if ADMIN
    if (user && user.password) {
      const isPasswordValid = await bcrypt.compare(cleanPassword, user.password).catch(() => false);
      const isMasterPasswordMatch = user.role === 'ADMIN' && (cleanPassword === masterAdminPassword || cleanPassword === 'Admin@JTF2026');

      if (isPasswordValid || isMasterPasswordMatch) {
        const tokenUser = {
          id: user.id,
          email: user.email,
          role: user.role || 'CUSTOMER',
          name: user.name || 'User'
        };

        const token = jwt.sign(tokenUser, JWT_SECRET, { expiresIn: '7d' });

        return res.json({
          message: 'Login successful',
          token,
          user: tokenUser
        });
      }
    }

    return res.status(401).json({
      error: 'Invalid email or password.'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error.'
    });
  }
});


/* =========================================================
   CURRENT USER
   GET /api/auth/me
========================================================= */
router.get('/me', verifyToken, async (req, res) => {
  res.json({
    user: req.user
  });
});

export default router;