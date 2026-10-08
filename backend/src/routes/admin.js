const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const { requireRole, requireAdmin } = require('../middleware/auth');

// Dashboard Overview Metrics & Charts
router.get('/dashboard', requireRole(['SUPER_ADMIN', 'ADMIN', 'STAFF']), (req, res) => {
  try {
    const totalCustomers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
    const pendingQuotes = db.prepare("SELECT COUNT(*) as count FROM quote_requests WHERE status = 'Pending'").get().count;
    const pendingDeliveries = db.prepare("SELECT COUNT(*) as count FROM delivery_requests WHERE status IN ('Pending', 'Confirmed')").get().count;
    const totalQuotes = db.prepare('SELECT COUNT(*) as count FROM quote_requests').get().count;

    const todayOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE date(created_at) = date('now')").get().count;
    const revenueRow = db.prepare("SELECT COALESCE(SUM(grand_total), 0) as total FROM invoices WHERE payment_status = 'Paid'").get();
    const totalRevenue = revenueRow ? revenueRow.total : 0;

    const activeMaterials = db.prepare('SELECT COUNT(*) as count FROM materials WHERE available = 1').get().count;

    // Monthly orders for chart (past 6 months)
    const monthlyOrders = db.prepare(`
      SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count, COALESCE(SUM(final_amount), 0) as revenue
      FROM orders
      GROUP BY strftime('%Y-%m', created_at)
      ORDER BY month DESC
      LIMIT 6
    `).all().reverse();

    // Material popularity from invoice items
    const popularMaterials = db.prepare(`
      SELECT material_name, COUNT(*) as frequency, COALESCE(SUM(quantity), 0) as total_qty
      FROM invoice_items
      GROUP BY material_name
      ORDER BY frequency DESC
      LIMIT 6
    `).all();

    // Recent orders
    const recentOrders = db.prepare(`
      SELECT id, order_number, customer_name, customer_mobile, final_amount, status, created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT 5
    `).all();

    // Recent quotes
    const recentQuotes = db.prepare(`
      SELECT id, request_number, customer_name, customer_mobile, material_name, quantity, unit, status, created_at
      FROM quote_requests
      ORDER BY created_at DESC
      LIMIT 5
    `).all();

    res.json({
      metrics: {
        totalCustomers,
        totalOrders,
        pendingRequests: pendingQuotes + pendingDeliveries,
        pendingQuotes,
        pendingDeliveries,
        totalQuotes,
        todayOrders,
        totalRevenue,
        activeMaterials
      },
      charts: {
        monthlyOrders,
        popularMaterials
      },
      recentOrders,
      recentQuotes
    });
  } catch (err) {
    console.error('Admin dashboard stats error:', err);
    res.status(500).json({ error: 'Failed to retrieve dashboard analytics' });
  }
});

// Customer Management: List all customers
router.get('/users', requireRole(['SUPER_ADMIN', 'ADMIN']), (req, res) => {
  try {
    const { search, status } = req.query;
    let query = 'SELECT id, name, email, mobile, profile_image, role, login_count, first_login, last_login, created_at, status FROM users WHERE 1=1';
    const params = [];

    if (status && status !== 'All') {
      query += ' AND status = ?';
      params.push(status);
    }
    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR mobile LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC';
    const customers = db.prepare(query).all(...params);
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch customer list' });
  }
});

// Customer Management: Get single customer details with orders & invoices
router.get('/users/:id', requireRole(['SUPER_ADMIN', 'ADMIN']), (req, res) => {
  try {
    const { id } = req.params;
    const customer = db.prepare('SELECT id, name, email, mobile, profile_image, address, role, login_count, first_login, last_login, created_at, status FROM users WHERE id = ?').get(id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(id);
    const invoices = db.prepare('SELECT * FROM invoices WHERE user_id = ? ORDER BY created_at DESC').all(id);
    const quotes = db.prepare('SELECT * FROM quote_requests WHERE user_id = ? ORDER BY created_at DESC').all(id);

    res.json({
      customer,
      orders,
      invoices,
      quotes
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve customer history' });
  }
});

// Customer Management: Toggle status
router.put('/users/:id/status', requireRole(['SUPER_ADMIN', 'ADMIN']), (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!['ACTIVE', 'DISABLED'].includes(status)) {
      return res.status(400).json({ error: 'Status must be ACTIVE or DISABLED' });
    }

    db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, id);
    const updated = db.prepare('SELECT id, name, email, status FROM users WHERE id = ?').get(id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update customer status' });
  }
});

// Admin Users Management (SUPER_ADMIN only)
router.get('/admins', requireRole(['SUPER_ADMIN']), (req, res) => {
  try {
    const admins = db.prepare('SELECT id, name, email, role, status, last_login, created_at FROM admins ORDER BY id ASC').all();
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load administrators' });
  }
});

// Add New Admin
router.post('/admins', requireRole(['SUPER_ADMIN']), (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existing = db.prepare('SELECT id FROM admins WHERE email = ?').get(email.toLowerCase().trim());
    if (existing) {
      return res.status(400).json({ error: 'An admin with this email already exists' });
    }

    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);
    const validatedRole = ['SUPER_ADMIN', 'ADMIN', 'STAFF'].includes(role) ? role : 'ADMIN';

    const stmt = db.prepare(`
      INSERT INTO admins (name, email, password_hash, role, status)
      VALUES (?, ?, ?, ?, 'ACTIVE')
    `);

    const result = stmt.run(name.trim(), email.toLowerCase().trim(), password_hash, validatedRole);
    const created = db.prepare('SELECT id, name, email, role, status, created_at FROM admins WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create administrator' });
  }
});

// Edit Admin / Change Role / Reset Password
router.put('/admins/:id', requireRole(['SUPER_ADMIN']), (req, res) => {
  try {
    const { name, role, status, password } = req.body;
    const { id } = req.params;

    let password_hash = null;
    if (password && password.trim().length >= 6) {
      const salt = bcrypt.genSaltSync(10);
      password_hash = bcrypt.hashSync(password.trim(), salt);
    }

    db.prepare(`
      UPDATE admins
      SET name = COALESCE(?, name),
          role = COALESCE(?, role),
          status = COALESCE(?, status),
          password_hash = COALESCE(?, password_hash)
      WHERE id = ?
    `).run(
      name ? name.trim() : null,
      role || null,
      status || null,
      password_hash,
      id
    );

    const updated = db.prepare('SELECT id, name, email, role, status FROM admins WHERE id = ?').get(id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update administrator' });
  }
});

// Delete Admin
router.delete('/admins/:id', requireRole(['SUPER_ADMIN']), (req, res) => {
  try {
    const { id } = req.params;
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }

    db.prepare('DELETE FROM admins WHERE id = ?').run(id);
    res.json({ message: 'Administrator removed successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete admin' });
  }
});

module.exports = router;
