const express = require('express');
const router = express.Router();
const db = require('../db');
const { optionalAuthenticate, authenticate, requireRole } = require('../middleware/auth');

function generateOrderNumber() {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${Date.now().toString().slice(-4)}${rand}`;
}

// Create Order (Customer or Guest)
router.post('/', optionalAuthenticate, (req, res) => {
  try {
    const {
      customer_name,
      customer_mobile,
      delivery_address,
      items,
      discount = 0
    } = req.body;

    if (!customer_name || !customer_mobile || !delivery_address || !items || !items.length) {
      return res.status(400).json({ error: 'Customer name, mobile, address and items are required' });
    }

    const order_number = generateOrderNumber();
    const user_id = req.user ? req.user.id : null;

    let subtotal = 0;
    items.forEach(item => {
      subtotal += parseFloat(item.quantity) * parseFloat(item.unit_price);
    });

    const parsedDiscount = parseFloat(discount) || 0;
    const final_amount = Math.max(0, subtotal - parsedDiscount);

    const insertOrder = db.prepare(`
      INSERT INTO orders (order_number, user_id, customer_name, customer_mobile, delivery_address, total_amount, discount, final_amount, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
    `);

    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, material_name, quantity, unit, unit_price, subtotal)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const orderTx = db.transaction(() => {
      const result = insertOrder.run(order_number, user_id, customer_name, customer_mobile, delivery_address, subtotal, parsedDiscount, final_amount);
      const orderId = result.lastInsertRowid;

      for (const item of items) {
        const itemSubtotal = parseFloat(item.quantity) * parseFloat(item.unit_price);
        insertItem.run(orderId, item.material_name, parseFloat(item.quantity), item.unit || 'Load', parseFloat(item.unit_price), itemSubtotal);
      }
      return orderId;
    });

    const orderId = orderTx();
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    const orderItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);

    res.status(201).json({
      message: 'Order placed successfully!',
      order: { ...order, items: orderItems }
    });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// Customer: Get my orders
router.get('/my', authenticate, (req, res) => {
  try {
    const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    const enriched = orders.map(ord => {
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(ord.id);
      return { ...ord, items };
    });
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch customer orders' });
  }
});

// Admin: Get all orders
router.get('/admin', requireRole(['SUPER_ADMIN', 'ADMIN', 'STAFF']), (req, res) => {
  try {
    const { status, search } = req.query;
    let query = 'SELECT * FROM orders WHERE 1=1';
    const params = [];

    if (status && status !== 'All') {
      query += ' AND status = ?';
      params.push(status);
    }
    if (search) {
      query += ' AND (customer_name LIKE ? OR customer_mobile LIKE ? OR order_number LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    query += ' ORDER BY created_at DESC';

    const orders = db.prepare(query).all(...params);
    const enriched = orders.map(ord => {
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(ord.id);
      return { ...ord, items };
    });
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Admin: Update order status
router.put('/admin/:id/status', requireRole(['SUPER_ADMIN', 'ADMIN', 'STAFF']), (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status' });
    }

    db.prepare('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, id);
    const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(id);

    res.json({ ...updated, items });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

module.exports = router;
