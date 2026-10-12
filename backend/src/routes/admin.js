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
    const totalDeliveries = db.prepare('SELECT COUNT(*) as count FROM delivery_requests').get().count;
    const pendingQuotes = db.prepare("SELECT COUNT(*) as count FROM quote_requests WHERE status = 'Pending'").get().count;
    const pendingDeliveries = db.prepare("SELECT COUNT(*) as count FROM delivery_requests WHERE status IN ('Pending', 'Confirmed')").get().count;
    const totalQuotes = db.prepare('SELECT COUNT(*) as count FROM quote_requests').get().count;

    const todayOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE date(created_at) = date('now')").get().count;
    const todayDeliveries = db.prepare("SELECT COUNT(*) as count FROM delivery_requests WHERE date(created_at) = date('now')").get().count;
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

    // Recent orders: combine site delivery bookings and direct orders
    const recentDeliveries = db.prepare(`
      SELECT 
        id, 
        request_number as order_number, 
        customer_name, 
        customer_mobile, 
        material_name,
        quantity,
        unit,
        delivery_address,
        NULL as final_amount,
        status, 
        'DELIVERY' as order_type,
        created_at
      FROM delivery_requests
      ORDER BY created_at DESC
      LIMIT 8
    `).all();

    const recentDirectOrders = db.prepare(`
      SELECT 
        id, 
        order_number, 
        customer_name, 
        customer_mobile, 
        NULL as material_name,
        NULL as quantity,
        NULL as unit,
        delivery_address,
        final_amount, 
        status, 
        'DIRECT' as order_type,
        created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT 8
    `).all();

    const recentOrders = [...recentDeliveries, ...recentDirectOrders]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 8);

    // Recent quotes
    const recentQuotes = db.prepare(`
      SELECT id, request_number, customer_name, customer_mobile, customer_email, material_name, quantity, unit, delivery_location, status, created_at
      FROM quote_requests
      ORDER BY created_at DESC
      LIMIT 8
    `).all();

    res.json({
      metrics: {
        totalCustomers,
        totalOrders: totalOrders + totalDeliveries,
        pendingRequests: pendingQuotes + pendingDeliveries,
        pendingQuotes,
        pendingDeliveries,
        totalQuotes,
        totalDeliveries,
        todayOrders: todayOrders + todayDeliveries,
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

// Live Real-Time Admin Notifications: User Logins, Booked Materials, Booked Services
// Live Real-Time Admin Notifications: User Logins, Booked Materials, Booked Services, Direct Orders
router.get('/notifications', requireRole(['SUPER_ADMIN', 'ADMIN', 'STAFF']), (req, res) => {
  try {
    function formatUtcIso(dStr) {
      if (!dStr) return new Date().toISOString();
      if (dStr.endsWith('Z') || dStr.includes('+')) return new Date(dStr).toISOString();
      const parsed = new Date(dStr.replace(' ', 'T') + 'Z');
      return isNaN(parsed.getTime()) ? new Date(dStr).toISOString() : parsed.toISOString();
    }

    // 1. Material Bookings (Deliveries)
    const deliveries = db.prepare(`
      SELECT 
        id,
        request_number,
        customer_name,
        customer_mobile,
        customer_email,
        material_name,
        quantity,
        unit,
        delivery_address,
        preferred_date,
        additional_notes,
        status,
        created_at
      FROM delivery_requests
      ORDER BY created_at DESC
      LIMIT 30
    `).all();

    // 2. Direct Material Orders
    const directOrders = db.prepare(`
      SELECT 
        o.id,
        o.order_number as request_number,
        o.customer_name,
        o.customer_mobile,
        o.delivery_address,
        o.final_amount,
        o.status,
        o.created_at,
        (
          SELECT GROUP_CONCAT(quantity || ' ' || unit || ' of ' || material_name, ', ')
          FROM order_items oi
          WHERE oi.order_id = o.id
        ) as items_summary
      FROM orders o
      ORDER BY o.created_at DESC
      LIMIT 30
    `).all();

    // 3. Service Bookings & Quotes
    const quotes = db.prepare(`
      SELECT 
        id,
        request_number,
        customer_name,
        customer_mobile,
        customer_email,
        material_name,
        quantity,
        unit,
        delivery_location,
        message,
        status,
        created_at
      FROM quote_requests
      ORDER BY created_at DESC
      LIMIT 30
    `).all();

    // 4. User Logins and Customer Accounts
    const historyLogins = db.prepare(`
      SELECT 
        lh.id as login_id,
        u.id as user_id,
        u.name as customer_name,
        u.mobile as customer_mobile,
        u.email as customer_email,
        u.address as customer_address,
        u.login_count,
        lh.login_time as created_at
      FROM login_history lh
      JOIN users u ON lh.user_id = u.id
      WHERE u.role != 'SUPER_ADMIN'
      ORDER BY lh.login_time DESC
      LIMIT 25
    `).all();

    const userAccounts = db.prepare(`
      SELECT 
        u.id as user_id,
        u.name as customer_name,
        u.mobile as customer_mobile,
        u.email as customer_email,
        u.address as customer_address,
        u.login_count,
        COALESCE(u.last_login, u.created_at) as created_at
      FROM users u
      WHERE u.role != 'SUPER_ADMIN'
      ORDER BY COALESCE(u.last_login, u.created_at) DESC
      LIMIT 25
    `).all();

    const seenUserIds = new Set();
    const customerLogins = [];

    // Prioritize specific session history
    historyLogins.forEach(hl => {
      seenUserIds.add(hl.user_id);
      customerLogins.push(hl);
    });

    // Also include all customer accounts
    userAccounts.forEach(ua => {
      if (!seenUserIds.has(ua.user_id)) {
        customerLogins.push({
          login_id: null,
          ...ua
        });
      }
    });

    const items = [];

    // Map deliveries (Booked Materials & Booked Vehicles)
    deliveries.forEach(del => {
      const notesLow = (del.additional_notes || '').toLowerCase();
      const matLow = (del.material_name || '').toLowerCase();
      const isVehicle = del.unit === 'Trip' || notesLow.includes('vehicle') || matLow.includes('vehicle') || notesLow.includes('tractor') || notesLow.includes('tipper') || notesLow.includes('lorry');

      items.push({
        id: `del-${del.id}`,
        type: isVehicle ? 'VEHICLE_BOOKED' : 'MATERIAL_BOOKED',
        target_section: 'deliveries',
        badge: isVehicle ? 'Vehicle Booked' : 'Material Booked',
        badge_color: isVehicle ? '#c084fc' : '#38bdf8',
        reference_no: del.request_number,
        user_name: del.customer_name || 'Customer',
        mobile: del.customer_mobile || '',
        address: del.delivery_address || 'Puducherry Site',
        email: del.customer_email || '',
        booked_service_or_material: `${del.quantity} ${del.unit || 'Unit'} - ${del.material_name}`,
        details: {
          material: del.material_name,
          quantity: del.quantity,
          unit: del.unit || 'Unit',
          preferred_date: del.preferred_date || 'Earliest dispatch',
          notes: del.additional_notes || '',
          status: del.status || 'Pending',
          is_vehicle: isVehicle
        },
        created_at: formatUtcIso(del.created_at)
      });
    });

    // Map direct orders (Material Orders)
    directOrders.forEach(ord => {
      items.push({
        id: `ord-${ord.id}`,
        type: 'MATERIAL_BOOKED',
        target_section: 'deliveries',
        badge: 'Material Booked',
        badge_color: '#38bdf8',
        reference_no: ord.request_number,
        user_name: ord.customer_name || 'Customer',
        mobile: ord.customer_mobile || '',
        address: ord.delivery_address || 'Puducherry Site',
        email: '',
        booked_service_or_material: ord.items_summary || 'Construction Materials',
        details: {
          material: ord.items_summary || 'Materials',
          amount: ord.final_amount,
          status: ord.status || 'Pending'
        },
        created_at: formatUtcIso(ord.created_at)
      });
    });

    // Map quotes (Booked Services / Quotation Requests)
    quotes.forEach(q => {
      items.push({
        id: `quote-${q.id}`,
        type: 'SERVICE_BOOKED',
        target_section: 'quotes',
        badge: 'Service / Quotation Booked',
        badge_color: '#f59e0b',
        reference_no: q.request_number,
        user_name: q.customer_name || 'Customer',
        mobile: q.customer_mobile || '',
        address: q.delivery_location || 'Puducherry Site',
        email: q.customer_email || '',
        booked_service_or_material: `${q.quantity} ${q.unit || 'Unit'} - ${q.material_name}`,
        details: {
          material: q.material_name,
          quantity: q.quantity,
          unit: q.unit || 'Unit',
          message: q.message || '',
          status: q.status || 'Pending'
        },
        created_at: formatUtcIso(q.created_at)
      });
    });

    // Map user logins / account registrations
    customerLogins.forEach(ul => {
      const loginId = ul.login_id 
        ? `login-${ul.login_id}` 
        : `user-${ul.user_id}-${(ul.created_at || '').replace(/[^0-9]/g, '')}`;
      items.push({
        id: loginId,
        type: 'USER_LOGIN',
        target_section: 'customers',
        badge: 'New User Login',
        badge_color: '#10b981',
        reference_no: `CUST-${ul.user_id}`,
        user_name: ul.customer_name || 'Customer',
        mobile: ul.customer_mobile || 'Not provided',
        address: ul.customer_address || 'Puducherry',
        email: ul.customer_email || '',
        booked_service_or_material: null,
        details: {
          login_count: ul.login_count || 1
        },
        created_at: formatUtcIso(ul.created_at)
      });
    });

    // Sort newest first
    items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({
      notifications: items,
      total_count: items.length
    });
  } catch (err) {
    console.error('Admin notifications error:', err);
    res.status(500).json({ error: 'Failed to retrieve notifications' });
  }
});

// Customer Management: List all customers with login details and activity
router.get('/users', requireRole(['SUPER_ADMIN', 'ADMIN']), (req, res) => {
  try {
    const { search, status, logged_in } = req.query;

    // First, ensure all admin accounts are synced to users table so they appear in user directory
    try {
      const allAdmins = db.prepare('SELECT * FROM admins').all();
      for (const adm of allAdmins) {
        const u = db.prepare('SELECT id, role FROM users WHERE LOWER(email) = ?').get(adm.email.toLowerCase().trim());
        if (u) {
          if (u.role !== adm.role) {
            db.prepare('UPDATE users SET role = ?, status = ? WHERE id = ?').run(adm.role, adm.status, u.id);
          }
        } else {
          db.prepare(`
            INSERT INTO users (name, email, profile_image, role, login_count, first_login, last_login, status)
            VALUES (?, ?, ?, ?, 1, ?, ?, ?)
          `).run(adm.name, adm.email.toLowerCase().trim(), adm.profile_image || null, adm.role, adm.last_login || adm.created_at, adm.last_login || adm.created_at, adm.status);
        }
      }
    } catch (syncErr) {
      console.warn('Admin user sync warning:', syncErr.message);
    }

    let query = `
      SELECT 
        u.id, u.name, u.email, u.mobile, u.profile_image, u.role, 
        u.login_count, u.first_login, u.last_login, u.created_at, u.status, u.address,
        CASE WHEN u.google_id IS NOT NULL THEN 1 ELSE 0 END as is_google_user,
        (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) as total_orders,
        (SELECT COUNT(*) FROM quote_requests q WHERE q.user_id = u.id) as total_quotes,
        (SELECT COUNT(*) FROM delivery_requests d WHERE d.user_id = u.id) as total_deliveries
      FROM users u
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'All') {
      query += ' AND u.status = ?';
      params.push(status);
    }
    if (logged_in === 'true') {
      query += ' AND (u.login_count > 0 OR u.last_login IS NOT NULL)';
    }
    if (search) {
      query += ' AND (u.name LIKE ? OR u.email LIKE ? OR u.mobile LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY u.last_login DESC, u.created_at DESC';
    const customers = db.prepare(query).all(...params);
    res.json(customers);
  } catch (err) {
    console.error('Fetch customers error:', err);
    res.status(500).json({ error: 'Failed to fetch customer list' });
  }
});

// Customer Management: Get single customer details with orders, quotes & login history
router.get('/users/:id', requireRole(['SUPER_ADMIN', 'ADMIN']), (req, res) => {
  try {
    const { id } = req.params;
    const customer = db.prepare(`
      SELECT 
        id, name, email, mobile, profile_image, address, role, 
        login_count, first_login, last_login, created_at, status,
        CASE WHEN google_id IS NOT NULL THEN 1 ELSE 0 END as is_google_user
      FROM users WHERE id = ?
    `).get(id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(id);
    const deliveries = db.prepare(`
      SELECT * FROM delivery_requests 
      WHERE user_id = ? 
         OR (customer_mobile IS NOT NULL AND customer_mobile != '' AND customer_mobile = ?) 
         OR (customer_email IS NOT NULL AND customer_email != '' AND LOWER(customer_email) = ?)
      ORDER BY created_at DESC
    `).all(id, customer.mobile || '', (customer.email || '').toLowerCase());
    const invoices = db.prepare('SELECT * FROM invoices WHERE user_id = ? ORDER BY created_at DESC').all(id);
    const quotes = db.prepare(`
      SELECT * FROM quote_requests 
      WHERE user_id = ? 
         OR (customer_mobile IS NOT NULL AND customer_mobile != '' AND customer_mobile = ?) 
         OR (customer_email IS NOT NULL AND customer_email != '' AND LOWER(customer_email) = ?)
      ORDER BY created_at DESC
    `).all(id, customer.mobile || '', (customer.email || '').toLowerCase());
    const loginHistory = db.prepare('SELECT * FROM login_history WHERE user_id = ? ORDER BY login_time DESC LIMIT 20').all(id);

    res.json({
      customer,
      orders,
      deliveries,
      invoices,
      quotes,
      loginHistory
    });
  } catch (err) {
    console.error('Customer details error:', err);
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

// Admin Users Management (Accessible to SUPER_ADMIN & ADMIN)
router.get('/admins', requireRole(['SUPER_ADMIN', 'ADMIN']), (req, res) => {
  try {
    const admins = db.prepare('SELECT id, name, email, role, status, last_login, created_at, profile_image FROM admins ORDER BY id ASC').all();
    res.json(admins);
  } catch (err) {
    console.error('Load admins error:', err);
    res.status(500).json({ error: 'Failed to load administrators' });
  }
});

// Add New Admin
router.post('/admins', requireRole(['SUPER_ADMIN', 'ADMIN']), (req, res) => {
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
    console.error('Create admin error:', err);
    res.status(500).json({ error: 'Failed to create administrator' });
  }
});

// Edit Admin / Change Role / Reset Password / Status
router.put('/admins/:id', requireRole(['SUPER_ADMIN', 'ADMIN']), (req, res) => {
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
    console.error('Update admin error:', err);
    res.status(500).json({ error: 'Failed to update administrator' });
  }
});

// Delete Admin
router.delete('/admins/:id', requireRole(['SUPER_ADMIN', 'ADMIN']), (req, res) => {
  try {
    const { id } = req.params;
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }

    const targetAdmin = db.prepare('SELECT role FROM admins WHERE id = ?').get(id);
    if (!targetAdmin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    if (targetAdmin.role === 'SUPER_ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Only a Super Admin can remove another Super Admin' });
    }

    db.prepare('DELETE FROM admins WHERE id = ?').run(id);
    res.json({ message: 'Administrator removed successfully' });
  } catch (err) {
    console.error('Delete admin error:', err);
    res.status(500).json({ error: 'Failed to delete admin' });
  }
});

module.exports = router;
