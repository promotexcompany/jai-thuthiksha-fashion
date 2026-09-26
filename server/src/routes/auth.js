import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { supabase } from '../config/supabase.js';
import { verifyToken, JWT_SECRET } from '../middleware/auth.js';

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

    // Check whether user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, email')
      .ilike('email', cleanEmail)
      .maybeSingle();

    if (checkError) {
      console.error('Register check error:', checkError);
      return res.status(500).json({
        error: 'Database error while verifying email.'
      });
    }

    if (existingUser) {
      return res.status(409).json({
        error: 'An account with this email address already exists.'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `usr-cust-${Date.now()}`;

    // ALWAYS enforce role = CUSTOMER
    const newUser = {
      id: userId,
      email: cleanEmail,
      name: cleanName,
      password: hashedPassword,
      role: 'CUSTOMER'
    };

    const { data: createdUser, error: insertError } = await supabase
      .from('users')
      .insert([newUser])
      .select('id, email, name, role')
      .single();

    if (insertError) {
      console.error('Register insert error:', insertError);
      return res.status(500).json({
        error: 'Unable to create user account. Please try again.'
      });
    }

    // Generate JWT token for immediate auto-login
    const token = jwt.sign(
      {
        id: createdUser.id,
        email: createdUser.email,
        name: createdUser.name,
        role: createdUser.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: createdUser
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

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .ilike('email', cleanEmail)
      .maybeSingle();

    if (error) {
      console.error('Supabase login error:', error);
      return res.status(500).json({
        error: 'Database connection error.'
      });
    }

    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password.'
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid email or password.'
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      },
      JWT_SECRET,
      {
        expiresIn: '7d'
      }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
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