const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'sri_angalamman_secure_jwt_secret_2026';

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type === 'admin') {
      const admin = db.prepare('SELECT id, name, email, role, status FROM admins WHERE id = ?').get(decoded.id);
      if (!admin || admin.status !== 'ACTIVE') {
        return res.status(403).json({ error: 'Admin account deactivated or not found' });
      }
      req.user = { ...admin, is_admin: true };
    } else {
      const user = db.prepare('SELECT id, google_id, name, email, mobile, address, role, status, profile_image FROM users WHERE id = ?').get(decoded.id);
      if (!user || user.status !== 'ACTIVE') {
        return res.status(403).json({ error: 'Customer account suspended or not found' });
      }
      req.user = { ...user, is_admin: false };
    }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session token' });
  }
}

function optionalAuthenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.type === 'admin') {
        const admin = db.prepare('SELECT id, name, email, role, status FROM admins WHERE id = ?').get(decoded.id);
        if (admin && admin.status === 'ACTIVE') req.user = { ...admin, is_admin: true };
      } else {
        const user = db.prepare('SELECT id, google_id, name, email, mobile, address, role, status, profile_image FROM users WHERE id = ?').get(decoded.id);
        if (user && user.status === 'ACTIVE') req.user = { ...user, is_admin: false };
      }
    } catch (e) {
      // Ignore optional auth error
    }
  }
  next();
}

function requireAdmin(req, res, next) {
  const verify = () => {
    if (!req.user || !req.user.is_admin) {
      return res.status(403).json({ error: 'Administrative privilege required' });
    }
    next();
  };

  if (!req.user) {
    return authenticate(req, res, verify);
  }
  verify();
}

function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    const checkRole = () => {
      if (!req.user || !req.user.is_admin) {
        return res.status(403).json({ error: 'Administrative privilege required' });
      }
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ error: `Forbidden: requires role ${allowedRoles.join(' or ')}` });
      }
      next();
    };

    if (!req.user) {
      return authenticate(req, res, checkRole);
    }
    checkRole();
  };
}

module.exports = {
  authenticate,
  optionalAuthenticate,
  requireAdmin,
  requireRole,
  JWT_SECRET
};
