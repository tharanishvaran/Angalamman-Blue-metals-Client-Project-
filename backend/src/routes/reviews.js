const express = require('express');
const router = express.Router();
const db = require('../db');
const { optionalAuthenticate, requireRole } = require('../middleware/auth');

// Public: Get all approved reviews
router.get('/', (req, res) => {
  try {
    const reviews = db.prepare(`
      SELECT id, customer_name, rating, comment, created_at
      FROM reviews
      WHERE is_approved = 1
      ORDER BY created_at DESC
    `).all();
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Submit review (Public or Authenticated Customer)
router.post('/', optionalAuthenticate, (req, res) => {
  try {
    const { customer_name, rating, comment } = req.body;
    if (!customer_name || !rating || !comment) {
      return res.status(400).json({ error: 'Customer name, rating, and feedback are required' });
    }

    const parsedRating = parseInt(rating);
    if (parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5 stars' });
    }

    const userId = req.user ? req.user.id : null;
    const stmt = db.prepare(`
      INSERT INTO reviews (user_id, customer_name, rating, comment, is_approved)
      VALUES (?, ?, ?, ?, 0)
    `);

    stmt.run(userId, customer_name.trim(), parsedRating, comment.trim());
    res.status(201).json({
      message: 'Thank you for your feedback! Your review has been submitted for verification.'
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

// Admin: Get all reviews (approved & pending)
router.get('/admin', requireRole(['SUPER_ADMIN', 'ADMIN']), (req, res) => {
  try {
    const reviews = db.prepare('SELECT * FROM reviews ORDER BY created_at DESC').all();
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve reviews' });
  }
});

// Admin: Approve / Reject review
router.put('/admin/:id/approve', requireRole(['SUPER_ADMIN', 'ADMIN']), (req, res) => {
  try {
    const { is_approved } = req.body;
    const { id } = req.params;

    db.prepare('UPDATE reviews SET is_approved = ? WHERE id = ?').run(is_approved ? 1 : 0, id);
    const updated = db.prepare('SELECT * FROM reviews WHERE id = ?').get(id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update review status' });
  }
});

// Admin: Delete review
router.delete('/admin/:id', requireRole(['SUPER_ADMIN', 'ADMIN']), (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM reviews WHERE id = ?').run(id);
    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

module.exports = router;
