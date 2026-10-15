const express = require('express');
const router = express.Router();
const db = require('../db');
const { optionalAuthenticate, authenticate, requireRole } = require('../middleware/auth');

function generateDeliveryNumber() {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `DEL-${Date.now().toString().slice(-4)}${rand}`;
}

// Customer / Authenticated User: Submit Delivery Request
router.post('/', authenticate, (req, res) => {
  try {
    const {
      customer_name,
      customer_mobile,
      customer_email,
      material_name,
      quantity,
      unit,
      city,
      transport_charge,
      delivery_address,
      location_link,
      preferred_date,
      additional_notes
    } = req.body;

    const resolvedAddress = (delivery_address && delivery_address.trim()) 
      ? delivery_address.trim() 
      : (location_link && location_link.trim()) 
        ? `📍 Google Maps Pin: ${location_link.trim()}` 
        : '';

    if (!customer_name || !customer_mobile || !material_name || !quantity || !resolvedAddress) {
      return res.status(400).json({ error: 'Please enter all required delivery details (Site Address or Maps Location required)' });
    }

    const request_number = generateDeliveryNumber();
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

    const resolvedCity = (city && city.trim()) ? city.trim() : 'Pondicherry';
    const resolvedTransportCharge = parseFloat(transport_charge) || 0;

    const stmt = db.prepare(`
      INSERT INTO delivery_requests (
        request_number, user_id, customer_name, customer_mobile, customer_email,
        material_name, quantity, unit, city, transport_charge, delivery_address, preferred_date, additional_notes, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
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
      resolvedCity,
      resolvedTransportCharge,
      resolvedAddress,
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

// Customer / Admin: Get my delivery requests
router.get('/my', authenticate, (req, res) => {
  try {
    const userEmail = (req.user.email || '').toLowerCase().trim();
    const userMobile = (req.user.mobile || '').trim();
    let customerUserId = !req.user.is_admin ? req.user.id : null;

    if (req.user.is_admin) {
      const u = db.prepare('SELECT id FROM users WHERE LOWER(email) = ?').get(userEmail);
      if (u) customerUserId = u.id;
    }

    const deliveries = db.prepare(`
      SELECT * FROM delivery_requests 
      WHERE (user_id IS NOT NULL AND user_id = ?)
         OR (customer_email IS NOT NULL AND customer_email != '' AND LOWER(customer_email) = ?)
         OR (customer_mobile IS NOT NULL AND customer_mobile != '' AND customer_mobile = ?)
      ORDER BY created_at DESC
    `).all(customerUserId, userEmail, userMobile);
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
