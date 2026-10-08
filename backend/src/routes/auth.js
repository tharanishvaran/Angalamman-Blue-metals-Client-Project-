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

// Google OAuth Handler (Optimized & Instant)
router.post('/google', async (req, res) => {
  try {
    const { credential, userInfo } = req.body;
    let googleId = null;
    let email = null;
    let name = null;
    let picture = null;

    if (credential) {
      // 1. Instant in-memory JWT payload decode (< 1ms, zero network lag)
      try {
        const decoded = jwt.decode(credential);
        if (decoded && decoded.email) {
          googleId = decoded.sub;
          email = decoded.email.toLowerCase().trim();
          name = decoded.name || 'User';
          picture = decoded.picture || null;
        }
      } catch (e) {
        console.warn('jwt.decode fallback error:', e.message);
      }

      // 2. Only if decode didn't give email, use verifyIdToken
      if (!email && googleClient) {
        try {
          const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: GOOGLE_CLIENT_ID
          });
          const payload = ticket.getPayload();
          googleId = payload.sub;
          email = payload.email ? payload.email.toLowerCase().trim() : null;
          name = payload.name || name;
          picture = payload.picture || picture;
        } catch (err) {
          console.warn('Google verifyIdToken failed:', err.message);
        }
      }
    }

    // Fallback for development / mock Google OAuth or client-decoded profile
    if (!email && userInfo) {
      googleId = userInfo.sub || userInfo.id || 'google_' + Date.now();
      email = userInfo.email ? userInfo.email.toLowerCase().trim() : null;
      name = userInfo.name || 'User';
      picture = userInfo.picture || userInfo.avatar || null;
    }

    if (!email) {
      return res.status(400).json({ error: 'Valid Google credential or user details required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    // ─── ADMIN CHECK: If this email belongs to an Admin ───
    const SUPER_ADMIN_EMAILS = [
      'angalammanbluemetalspondy@gmail.com',
      'sriangalammanbluemetalspondy@gmail.com',
      'admin@angalamman.com'
    ];

    // If it's one of the designated super admin emails, guarantee record exists in admins
    if (SUPER_ADMIN_EMAILS.includes(cleanEmail)) {
      const existingAdmin = db.prepare('SELECT id, status, role FROM admins WHERE LOWER(email) = ?').get(cleanEmail);
      if (!existingAdmin) {
        const adminSalt = bcrypt.genSaltSync(10);
        const passHash = bcrypt.hashSync('Admin@1234', adminSalt);
        db.prepare(`
          INSERT INTO admins (name, email, password_hash, role, status)
          VALUES (?, ?, ?, 'SUPER_ADMIN', 'ACTIVE')
        `).run(name || 'Sri Angalamman Admin', cleanEmail, passHash);
      } else if (existingAdmin.status !== 'ACTIVE' || existingAdmin.role !== 'SUPER_ADMIN') {
        db.prepare(`UPDATE admins SET role = 'SUPER_ADMIN', status = 'ACTIVE' WHERE id = ?`).run(existingAdmin.id);
      }

      // Remove from users to eliminate customer collision
      try {
        db.prepare('DELETE FROM users WHERE LOWER(email) = ?').run(cleanEmail);
      } catch (e) {}
    }

    const admin = db.prepare('SELECT * FROM admins WHERE LOWER(email) = ?').get(cleanEmail);
    if (admin) {
      if (admin.status !== 'ACTIVE') {
        return res.status(403).json({ error: 'Admin account has been deactivated.' });
      }

      // Update admin picture and login timestamp
      db.prepare(`
        UPDATE admins
        SET profile_image = COALESCE(?, profile_image),
            name = COALESCE(?, name),
            last_login = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(picture || null, name || null, admin.id);

      db.prepare(`
        INSERT INTO login_history (admin_id, role, ip_address, user_agent)
        VALUES (?, ?, ?, ?)
      `).run(admin.id, admin.role, ip, userAgent);

      const token = jwt.sign(
        { id: admin.id, email: admin.email, role: admin.role, type: 'admin' },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      return res.json({
        token,
        user: {
          id: admin.id,
          name: admin.name || name,
          email: admin.email,
          role: admin.role,
          profile_image: picture || admin.profile_image || null,
          status: admin.status
        },
        is_admin: true,
        needsMobile: false
      });
    }

    // ─── CUSTOMER FLOW: Find or create customer in users table ───
    let user = db.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get(cleanEmail);

    if (!user) {
      const insert = db.prepare(`
        INSERT INTO users (google_id, name, email, profile_image, role, login_count, first_login, last_login, status)
        VALUES (?, ?, ?, ?, 'CUSTOMER', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'ACTIVE')
      `).run(googleId, name, cleanEmail, picture || null);
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(insert.lastInsertRowid);
    } else {
      db.prepare(`
        UPDATE users
        SET google_id = COALESCE(?, google_id),
            name = COALESCE(?, name),
            profile_image = COALESCE(?, profile_image),
            login_count = login_count + 1,
            last_login = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(googleId, name, picture || null, user.id);
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
        profile_image: picture || user.profile_image || null,
        address: user.address,
        role: user.role,
        last_login: user.last_login
      },
      is_admin: false,
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

// Customer Registration
router.post('/register', (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'Please enter a valid full name (at least 2 characters).' });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    if (!mobile || !isValidIndianMobile(mobile)) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit Indian mobile number (e.g., 9944076675).' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanedMobile = cleanIndianMobile(mobile);

    // Check if email already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists. Please sign in.' });
    }

    const existingAdmin = db.prepare('SELECT id FROM admins WHERE email = ?').get(cleanEmail);
    if (existingAdmin) {
      return res.status(400).json({ error: 'This email is reserved for staff. Please sign in.' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    const insert = db.prepare(`
      INSERT INTO users (name, email, mobile, password_hash, role, status, login_count, first_login, last_login)
      VALUES (?, ?, ?, ?, 'CUSTOMER', 'ACTIVE', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(name.trim(), cleanEmail, cleanedMobile, passwordHash);

    const newUser = db.prepare('SELECT id, name, email, mobile, profile_image, address, role, status, last_login FROM users WHERE id = ?').get(insert.lastInsertRowid);

    // Record login history
    db.prepare(`
      INSERT INTO login_history (user_id, role, ip_address, user_agent)
      VALUES (?, 'CUSTOMER', ?, ?)
    `).run(newUser.id, ip, userAgent);

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, type: 'customer' },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: newUser,
      is_admin: false,
      message: 'Account created successfully!'
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// Unified Login for Customer and Admin
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    // 1. Check Admin Table First
    const admin = db.prepare('SELECT * FROM admins WHERE LOWER(email) = ?').get(cleanEmail);
    if (admin) {
      if (admin.status !== 'ACTIVE') {
        return res.status(403).json({ error: 'Admin account has been deactivated.' });
      }

      const adminPasswordMatch = bcrypt.compareSync(password, admin.password_hash);
      if (adminPasswordMatch) {
        db.prepare('UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(admin.id);
        db.prepare('INSERT INTO login_history (admin_id, role, ip_address, user_agent) VALUES (?, ?, ?, ?)').run(admin.id, admin.role, ip, userAgent);

        const token = jwt.sign(
          { id: admin.id, email: admin.email, role: admin.role, type: 'admin' },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        return res.json({
          token,
          user: {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
            profile_image: admin.profile_image || null,
            status: admin.status
          },
          is_admin: true
        });
      }
    }

    // 2. Check Customer Users Table
    const user = db.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get(cleanEmail);
    if (user) {
      if (user.status !== 'ACTIVE') {
        return res.status(403).json({ error: 'Account has been deactivated.' });
      }

      if (!user.password_hash) {
        return res.status(400).json({
          error: 'This account was created with Google. Please use "Continue with Google" to sign in.'
        });
      }

      const customerPasswordMatch = bcrypt.compareSync(password, user.password_hash);
      if (customerPasswordMatch) {
        db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP, login_count = login_count + 1 WHERE id = ?').run(user.id);
        db.prepare('INSERT INTO login_history (user_id, role, ip_address, user_agent) VALUES (?, ?, ?, ?)').run(user.id, user.role, ip, userAgent);

        const token = jwt.sign(
          { id: user.id, email: user.email, role: user.role, type: 'customer' },
          JWT_SECRET,
          { expiresIn: '30d' }
        );

        return res.json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            profile_image: user.profile_image,
            address: user.address,
            role: user.role,
            status: user.status
          },
          is_admin: false
        });
      }
    }

    return res.status(401).json({ error: 'Invalid email or password.' });
  } catch (err) {
    console.error('Unified login error:', err);
    res.status(500).json({ error: 'Authentication failed. Please try again.' });
  }
});

// Admin Login (Kept for compatibility)
router.post('/admin/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const admin = db.prepare('SELECT * FROM admins WHERE LOWER(email) = ?').get(email.toLowerCase().trim());
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
