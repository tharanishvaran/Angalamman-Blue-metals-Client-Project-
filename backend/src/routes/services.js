const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireRole, optionalAuthenticate } = require('../middleware/auth');

// Public: Get all services
router.get('/', optionalAuthenticate, (req, res) => {
  try {
    const { all } = req.query;
    const isAdmin = req.user && req.user.is_admin;
    let query = 'SELECT * FROM services';
    if (!isAdmin || all !== 'true') {
      query += ' WHERE available = 1';
    }
    query += ' ORDER BY display_order ASC, id ASC';
    const services = db.prepare(query).all();
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve services' });
  }
});

// Admin: Add Service
router.post('/admin', requireRole(['SUPER_ADMIN', 'ADMIN']), (req, res) => {
  try {
    const { name, description, icon_name, image_url, starting_price, available, display_order } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Service name is required' });
    }

    const stmt = db.prepare(`
      INSERT INTO services (name, description, icon_name, image_url, starting_price, available, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      name,
      description || '',
      icon_name || 'Truck',
      image_url || '/images/hero.jpg',
      parseFloat(starting_price) || 0,
      available !== undefined ? (available ? 1 : 0) : 1,
      display_order || 0
    );

    const created = db.prepare('SELECT * FROM services WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create service' });
  }
});

// Admin: Edit Service
router.put('/admin/:id', requireRole(['SUPER_ADMIN', 'ADMIN']), (req, res) => {
  try {
    const { name, description, icon_name, image_url, starting_price, available, display_order } = req.body;
    const { id } = req.params;

    db.prepare(`
      UPDATE services
      SET name = COALESCE(?, name),
          description = COALESCE(?, description),
          icon_name = COALESCE(?, icon_name),
          image_url = COALESCE(?, image_url),
          starting_price = COALESCE(?, starting_price),
          available = COALESCE(?, available),
          display_order = COALESCE(?, display_order),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name !== undefined ? name : null,
      description !== undefined ? description : null,
      icon_name !== undefined ? icon_name : null,
      image_url !== undefined ? image_url : null,
      starting_price !== undefined ? parseFloat(starting_price) : null,
      available !== undefined ? (available ? 1 : 0) : null,
      display_order !== undefined ? parseInt(display_order) : null,
      id
    );

    const updated = db.prepare('SELECT * FROM services WHERE id = ?').get(id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update service' });
  }
});

// Admin: Delete Service
router.delete('/admin/:id', requireRole(['SUPER_ADMIN', 'ADMIN']), (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM services WHERE id = ?').run(id);
    res.json({ message: 'Service removed successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

module.exports = router;
