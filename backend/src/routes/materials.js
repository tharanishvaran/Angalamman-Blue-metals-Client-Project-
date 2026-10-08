const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireRole, optionalAuthenticate } = require('../middleware/auth');

// Public: Get all materials
router.get('/', optionalAuthenticate, (req, res) => {
  try {
    const { category, search, all } = req.query;
    let query = 'SELECT * FROM materials WHERE 1=1';
    const params = [];

    // Normal users only see available materials
    const isAdmin = req.user && req.user.is_admin;
    if (!isAdmin || all !== 'true') {
      query += ' AND available = 1';
    }

    if (category && category !== 'All') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY display_order ASC, id ASC';

    const materials = db.prepare(query).all(...params);
    res.json(materials);
  } catch (err) {
    console.error('Fetch materials error:', err);
    res.status(500).json({ error: 'Failed to retrieve materials' });
  }
});

// Public: Get single material
router.get('/:id', (req, res) => {
  try {
    const material = db.prepare('SELECT * FROM materials WHERE id = ?').get(req.params.id);
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }
    res.json(material);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve material details' });
  }
});

// Admin: Add Material
router.post('/admin', requireRole(['SUPER_ADMIN', 'ADMIN']), (req, res) => {
  try {
    const { name, category, description, price, unit, image_url, available, display_order } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Material name and price are required' });
    }

    const stmt = db.prepare(`
      INSERT INTO materials (name, category, description, price, unit, image_url, available, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      name,
      category || 'Aggregate',
      description || '',
      parseFloat(price),
      unit || 'Load',
      image_url || '/images/hero.jpg',
      available !== undefined ? (available ? 1 : 0) : 1,
      display_order || 0
    );

    const created = db.prepare('SELECT * FROM materials WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(created);
  } catch (err) {
    console.error('Create material error:', err);
    res.status(500).json({ error: 'Failed to create material' });
  }
});

// Admin: Edit Material
router.put('/admin/:id', requireRole(['SUPER_ADMIN', 'ADMIN']), (req, res) => {
  try {
    const { name, category, description, price, unit, image_url, available, display_order } = req.body;
    const { id } = req.params;

    const existing = db.prepare('SELECT * FROM materials WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Material not found' });
    }

    db.prepare(`
      UPDATE materials
      SET name = COALESCE(?, name),
          category = COALESCE(?, category),
          description = COALESCE(?, description),
          price = COALESCE(?, price),
          unit = COALESCE(?, unit),
          image_url = COALESCE(?, image_url),
          available = COALESCE(?, available),
          display_order = COALESCE(?, display_order),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name !== undefined ? name : null,
      category !== undefined ? category : null,
      description !== undefined ? description : null,
      price !== undefined ? parseFloat(price) : null,
      unit !== undefined ? unit : null,
      image_url !== undefined ? image_url : null,
      available !== undefined ? (available ? 1 : 0) : null,
      display_order !== undefined ? parseInt(display_order) : null,
      id
    );

    const updated = db.prepare('SELECT * FROM materials WHERE id = ?').get(id);
    res.json(updated);
  } catch (err) {
    console.error('Update material error:', err);
    res.status(500).json({ error: 'Failed to update material' });
  }
});

// Admin: Delete Material
router.delete('/admin/:id', requireRole(['SUPER_ADMIN', 'ADMIN']), (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM materials WHERE id = ?').run(id);
    res.json({ message: 'Material removed successfully' });
  } catch (err) {
    console.error('Delete material error:', err);
    res.status(500).json({ error: 'Failed to delete material' });
  }
});

module.exports = router;
