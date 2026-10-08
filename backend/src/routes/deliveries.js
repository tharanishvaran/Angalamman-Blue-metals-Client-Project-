const express = require('express');
const router = express.Router();
const db = require('../db');
const { optionalAuthenticate, authenticate, requireRole } = require('../middleware/auth');

function generateDeliveryNumber() {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `DEL-${Date.now().toString().slice(-4)}${rand}`;
}

// Customer / Public: Submit Delivery Request
router.post('/', optionalAuthenticate, (req, res) => {
  try {
    const {
      customer_name,
      customer_mobile,
      customer_email,
      material_name,
      quantity,
      unit,
      delivery_address,
      preferred_date,
      additional_notes
    } = req.body;

    if (!customer_name || !customer_mobile || !material_name || !quantity || !delivery_address) {
      return res.status(400).json({ error: 'Please enter all required delivery details' });
    }

    const request_number = generateDeliveryNumber();
    const user_id = req.user ? req.user.id : null;

    const stmt = db.prepare(`
      INSERT INTO delivery_requests (
        request_number, user_id, customer_name, customer_mobile, customer_email,
        material_name, quantity, unit, delivery_address, preferred_date, additional_notes, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
    `);

    const result = stmt.run(
      request_number,
      user_id,
      customer_name.trim(),
      customer_mobile.trim(),
      customer_email ? customer_email.trim() : null,
      material_name,
      parseFloat(quantity),
      unit || 'Load',
      delivery_address.trim(),
      preferred_date || null,
      additional_notes ? additional_notes.trim() : null
    );

    const delivery = db.prepare('SELECT * FROM delivery_requests WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({
      message: 'Material delivery request booked successfully!',
      request_number,
      delivery
    });
  } catch (err) {
    console.error('Delivery request error:', err);
    res.status(500).json({ error: 'Failed to submit delivery request' });
  }
});

// Customer: Get my delivery requests
router.get('/my', authenticate, (req, res) => {
  try {
    const deliveries = db.prepare('SELECT * FROM delivery_requests WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    res.json(deliveries);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve delivery requests' });
  }
});

// Admin: Get all delivery requests
router.get('/admin', requireRole(['SUPER_ADMIN', 'ADMIN', 'STAFF']), (req, res) => {
  try {
    const { status, search } = req.query;
    let query = 'SELECT * FROM delivery_requests WHERE 1=1';
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
    const deliveries = db.prepare(query).all(...params);
    res.json(deliveries);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch delivery requests' });
  }
});

// Admin: Update delivery status
router.put('/admin/:id/status', requireRole(['SUPER_ADMIN', 'ADMIN', 'STAFF']), (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid delivery status value' });
    }

    db.prepare('UPDATE delivery_requests SET status = ? WHERE id = ?').run(status, id);
    const updated = db.prepare('SELECT * FROM delivery_requests WHERE id = ?').get(id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update delivery status' });
  }
});

module.exports = router;
