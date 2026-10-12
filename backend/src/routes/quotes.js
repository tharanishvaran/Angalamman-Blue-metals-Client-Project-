const express = require('express');
const router = express.Router();
const db = require('../db');
const { optionalAuthenticate, authenticate, requireRole } = require('../middleware/auth');

function generateQuoteNumber() {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `QTE-${Date.now().toString().slice(-4)}${rand}`;
}

// Customer / Authenticated User: Create Quote Request
router.post('/', authenticate, (req, res) => {
  try {
    const {
      customer_name,
      customer_mobile,
      customer_email,
      material_name,
      quantity,
      unit,
      delivery_location,
      message
    } = req.body;

    if (!customer_name || !customer_mobile || !material_name || !quantity || !delivery_location) {
      return res.status(400).json({ error: 'Please fill in all required fields' });
    }

    const request_number = generateQuoteNumber();
    let user_id = null;
    const cleanEmail = customer_email ? customer_email.trim().toLowerCase() : '';
    const cleanMobile = customer_mobile ? customer_mobile.trim() : '';

    if (req.user) {
      if (!req.user.is_admin) {
        user_id = req.user.id;
      } else {
        const userRow = db.prepare('SELECT id FROM users WHERE LOWER(email) = ?').get(cleanEmail || (req.user.email || '').toLowerCase().trim());
        user_id = userRow ? userRow.id : null;
      }
    } else if (cleanEmail) {
      const userRow = db.prepare('SELECT id FROM users WHERE LOWER(email) = ?').get(cleanEmail);
      if (userRow) user_id = userRow.id;
    }

    const stmt = db.prepare(`
      INSERT INTO quote_requests (
        request_number, user_id, customer_name, customer_mobile, customer_email,
        material_name, quantity, unit, delivery_location, message, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
    `);

    const result = stmt.run(
      request_number,
      user_id,
      customer_name.trim(),
      customer_mobile.trim(),
      customer_email ? customer_email.trim() : null,
      material_name,
      parseFloat(quantity),
      unit || 'Unit',
      delivery_location.trim(),
      message ? message.trim() : null
    );

    const quote = db.prepare('SELECT * FROM quote_requests WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({
      message: 'Quotation request submitted successfully! Our team will contact you shortly.',
      quote
    });
  } catch (err) {
    console.error('Submit quote error:', err);
    res.status(500).json({ error: 'Failed to submit quotation request' });
  }
});

// Customer / Admin: Get my quote requests
router.get('/my', authenticate, (req, res) => {
  try {
    const userEmail = (req.user.email || '').toLowerCase().trim();
    const userMobile = (req.user.mobile || '').trim();
    let customerUserId = !req.user.is_admin ? req.user.id : null;

    if (req.user.is_admin) {
      const u = db.prepare('SELECT id FROM users WHERE LOWER(email) = ?').get(userEmail);
      if (u) customerUserId = u.id;
    }

    const quotes = db.prepare(`
      SELECT * FROM quote_requests 
      WHERE (user_id IS NOT NULL AND user_id = ?)
         OR (customer_email IS NOT NULL AND customer_email != '' AND LOWER(customer_email) = ?)
         OR (customer_mobile IS NOT NULL AND customer_mobile != '' AND customer_mobile = ?)
      ORDER BY created_at DESC
    `).all(customerUserId, userEmail, userMobile);
    res.json(quotes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load your quote requests' });
  }
});

// Admin: Get all quotes
router.get('/admin', requireRole(['SUPER_ADMIN', 'ADMIN', 'STAFF']), (req, res) => {
  try {
    const { status, search } = req.query;
    let query = 'SELECT * FROM quote_requests WHERE 1=1';
    const params = [];

    if (status && status !== 'All') {
      query += ' AND status = ?';
      params.push(status);
    }
    if (search) {
      query += ' AND (customer_name LIKE ? OR customer_mobile LIKE ? OR request_number LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC';
    const quotes = db.prepare(query).all(...params);
    res.json(quotes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch quote requests' });
  }
});

// Admin: Update quote status and notes
router.put('/admin/:id', requireRole(['SUPER_ADMIN', 'ADMIN', 'STAFF']), (req, res) => {
  try {
    const { status, admin_notes } = req.body;
    const { id } = req.params;

    db.prepare(`
      UPDATE quote_requests
      SET status = COALESCE(?, status),
          admin_notes = COALESCE(?, admin_notes)
      WHERE id = ?
    `).run(status || null, admin_notes !== undefined ? admin_notes : null, id);

    const updated = db.prepare('SELECT * FROM quote_requests WHERE id = ?').get(id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update quote request' });
  }
});

module.exports = router;
