const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const db = require('../db');
const { authenticate, JWT_SECRET } = require('../middleware/auth');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '547111778244-o780h96i0cvr63k5ubhuasmk53k13a40.apps.googleusercontent.com';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Validate 10-digit Indian mobile number
function isValidIndianMobile(mobile) {
  if (!mobile) return false;
  const cleaned = mobile.toString().replace(/[\s\-\+]/g, '');
  const digits = cleaned.startsWith('91') && cleaned.length === 12 ? cleaned.slice(2) : cleaned;
  return /^[6-9]\d{9}$/.test(digits);
}

function cleanIndianMobile(mobile) {
  const cleaned = mobile.toString().replace(/[\s\-\+]/g, '');
  return cleaned.startsWith('91') && cleaned.length === 12 ? cleaned.slice(2) : cleaned;
}

// Google OAuth Handler
router.post('/google', async (req, res) => {
  try {
    const { credential, userInfo } = req.body;
    let googleId = null;
    let email = null;
    let name = null;
    let picture = null;

    if (credential) {
      if (googleClient) {
        try {
          const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: GOOGLE_CLIENT_ID
          });
          const payload = ticket.getPayload();
          googleId = payload.sub;
          email = payload.email;
          name = payload.name;
          picture = payload.picture;
        } catch (err) {
          console.warn('Google verifyIdToken failed, falling back to jwt.decode:', err.message);
        }
      }
      if (!email) {
        try {
          const decoded = jwt.decode(credential);
          if (decoded && decoded.email) {
            googleId = decoded.sub;
            email = decoded.email;
            name = decoded.name;
            picture = decoded.picture;
          }
        } catch (e) {
          console.warn('jwt.decode fallback error:', e.message);
        }
      }
    }

    // Fallback for development / mock Google OAuth or client-decoded profile
    if (!email && userInfo) {
      googleId = userInfo.sub || userInfo.id || 'google_' + Date.now();
      email = userInfo.email;
      name = userInfo.name || 'Customer';
      picture = userInfo.picture || userInfo.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
    }

    if (!email) {
      return res.status(400).json({ error: 'Valid Google credential or user details required' });
    }

    // Find or create customer
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    if (!user) {
      const insert = db.prepare(`
        INSERT INTO users (google_id, name, email, profile_image, role, login_count, first_login, last_login, status)
        VALUES (?, ?, ?, ?, 'CUSTOMER', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'ACTIVE')
      `).run(googleId, name, email, picture);
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(insert.lastInsertRowid);
    } else {
      db.prepare(`
        UPDATE users
        SET google_id = COALESCE(google_id, ?),
            name = COALESCE(?, name),
            profile_image = COALESCE(?, profile_image),
            login_count = login_count + 1,
            last_login = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(googleId, name, picture, user.id);
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
    }

    // Record login history
    db.prepare(`
      INSERT INTO login_history (user_id, role, ip_address, user_agent)
      VALUES (?, 'CUSTOMER', ?, ?)
    `).run(user.id, ip, userAgent);

    const token = jwt.sign(
      { id: user.id, email: user.email, type: 'customer', role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    const needsMobile = !user.mobile || !isValidIndianMobile(user.mobile);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        profile_image: user.profile_image,
        address: user.address,
        role: user.role,
        last_login: user.last_login
      },
      needsMobile
    });
  } catch (err) {
    console.error('Google Auth Error:', err);
    res.status(500).json({ error: 'Internal server error during Google login' });
  }
});

// Update customer profile (Mobile verification, address)
router.put('/profile', authenticate, (req, res) => {
  try {
    const { name, mobile, address } = req.body;
    const userId = req.user.id;

    if (mobile && !isValidIndianMobile(mobile)) {
      return res.status(400).json({
        error: 'Please enter a valid 10-digit Indian mobile number (e.g., 9944076675).'
      });
    }

    const cleanedMobile = mobile ? cleanIndianMobile(mobile) : req.user.mobile;

    db.prepare(`
      UPDATE users
      SET name = COALESCE(?, name),
          mobile = COALESCE(?, mobile),
          address = COALESCE(?, address),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name || null, cleanedMobile || null, address || null, userId);

    const updatedUser = db.prepare('SELECT id, name, email, mobile, address, profile_image, role, status FROM users WHERE id = ?').get(userId);
    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Failed to update customer profile' });
  }
});

// Get Current User / Session
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// Admin Login
router.post('/admin/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const admin = db.prepare('SELECT * FROM admins WHERE email = ?').get(email.toLowerCase().trim());
    if (!admin) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    if (admin.status !== 'ACTIVE') {
      return res.status(403).json({ error: 'Admin account has been deactivated' });
    }

    const passwordMatch = bcrypt.compareSync(password, admin.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    // Update last login
    db.prepare('UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(admin.id);

    // Record login history
    const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';
    db.prepare(`
      INSERT INTO login_history (admin_id, role, ip_address, user_agent)
      VALUES (?, ?, ?, ?)
    `).run(admin.id, admin.role, ip, userAgent);

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role, type: 'admin' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        status: admin.status
      }
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Server error during admin authentication' });
  }
});

router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
