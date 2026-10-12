const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate, requireRole } = require('../middleware/auth');

function generateInvoiceNumber() {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `INV-${Date.now().toString().slice(-4)}${rand}`;
}

// Customer: Get my invoices
router.get('/my', authenticate, (req, res) => {
  try {
    const invoices = db.prepare('SELECT * FROM invoices WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    const enriched = invoices.map(inv => {
      const items = db.prepare('SELECT * FROM invoice_items WHERE invoice_id = ?').all(inv.id);
      return { ...inv, items };
    });
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch customer invoices' });
  }
});

// Admin: Get all invoices
router.get('/admin', requireRole(['SUPER_ADMIN', 'ADMIN', 'STAFF']), (req, res) => {
  try {
    const { status, search } = req.query;
    let query = 'SELECT * FROM invoices WHERE 1=1';
    const params = [];

    if (status && status !== 'All') {
      query += ' AND payment_status = ?';
      params.push(status);
    }
    if (search) {
      query += ' AND (customer_name LIKE ? OR customer_mobile LIKE ? OR invoice_number LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    query += ' ORDER BY created_at DESC';

    const invoices = db.prepare(query).all(...params);
    const enriched = invoices.map(inv => {
      const items = db.prepare('SELECT * FROM invoice_items WHERE invoice_id = ?').all(inv.id);
      return { ...inv, items };
    });
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// Admin & Customer: Get single invoice with business header
router.get('/:id', (req, res) => {
  try {
    const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    const items = db.prepare('SELECT * FROM invoice_items WHERE invoice_id = ?').all(invoice.id);
    const settingsRows = db.prepare('SELECT key, value FROM settings').all();
    const settings = {};
    settingsRows.forEach(r => { settings[r.key] = r.value; });

    res.json({
      invoice: { ...invoice, items },
      business: settings
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve invoice' });
  }
});

// Admin: Create new invoice with auto-calculated subtotal, discount, grand total
router.post('/admin', requireRole(['SUPER_ADMIN', 'ADMIN']), (req, res) => {
  try {
    const {
      user_id,
      customer_name,
      customer_mobile,
      customer_email,
      customer_address,
      items,
      discount = 0,
      paid_amount = 0,
      payment_status = 'Unpaid',
      notes
    } = req.body;

    if (!customer_name || !customer_mobile || !items || !items.length) {
      return res.status(400).json({ error: 'Customer name, mobile number and at least one item are required' });
    }

    const invoice_number = generateInvoiceNumber();

    let subtotal = 0;
    items.forEach(item => {
      subtotal += (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
    });

    const parsedDiscount = parseFloat(discount) || 0;
    const grand_total = Math.max(0, subtotal - parsedDiscount);
    const parsedPaid = Math.max(0, parseFloat(paid_amount) || 0);

    let resolvedPaymentStatus = 'Unpaid';
    if (parsedPaid >= grand_total && grand_total > 0) {
      resolvedPaymentStatus = 'Paid';
    } else if (parsedPaid > 0) {
      resolvedPaymentStatus = 'Partial';
    } else {
      resolvedPaymentStatus = 'Unpaid';
    }

    const insertInvoice = db.prepare(`
      INSERT INTO invoices (
        invoice_number, user_id, customer_name, customer_mobile, customer_email,
        customer_address, subtotal, discount, grand_total, paid_amount, payment_status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertItem = db.prepare(`
      INSERT INTO invoice_items (invoice_id, material_name, quantity, unit, unit_price, subtotal)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const invoiceTx = db.transaction(() => {
      const result = insertInvoice.run(
        invoice_number,
        user_id || null,
        customer_name.trim(),
        customer_mobile.trim(),
        customer_email ? customer_email.trim() : null,
        customer_address ? customer_address.trim() : null,
        subtotal,
        parsedDiscount,
        grand_total,
        parsedPaid,
        resolvedPaymentStatus,
        notes || null
      );
      const invoiceId = result.lastInsertRowid;

      for (const item of items) {
        const itemSubtotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
        insertItem.run(
          invoiceId,
          item.material_name,
          parseFloat(item.quantity) || 1,
          item.unit || 'Load',
          parseFloat(item.unit_price) || 0,
          itemSubtotal
        );
      }
      return invoiceId;
    });

    const invoiceId = invoiceTx();
    const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(invoiceId);
    const invoiceItems = db.prepare('SELECT * FROM invoice_items WHERE invoice_id = ?').all(invoiceId);

    res.status(201).json({
      message: 'Invoice generated successfully!',
      invoice: { ...invoice, items: invoiceItems }
    });
  } catch (err) {
    console.error('Create invoice error:', err);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// Admin: Update payment status and/or paid amount
router.put('/admin/:id/status', requireRole(['SUPER_ADMIN', 'ADMIN']), (req, res) => {
  try {
    const { payment_status, paid_amount } = req.body;
    const { id } = req.params;

    const current = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id);
    if (!current) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    let newPaid = paid_amount !== undefined ? Math.max(0, parseFloat(paid_amount) || 0) : (current.paid_amount || 0);
    let newStatus = payment_status || current.payment_status;

    if (paid_amount !== undefined) {
      if (newPaid >= current.grand_total && current.grand_total > 0) {
        newStatus = 'Paid';
      } else if (newPaid > 0) {
        newStatus = 'Partial';
      } else {
        newStatus = 'Unpaid';
      }
    } else if (payment_status) {
      if (payment_status === 'Paid') {
        newPaid = current.grand_total;
        newStatus = 'Paid';
      } else if (payment_status === 'Unpaid') {
        newPaid = 0;
        newStatus = 'Unpaid';
      } else {
        newStatus = 'Partial';
      }
    }

    db.prepare('UPDATE invoices SET payment_status = ?, paid_amount = ? WHERE id = ?').run(newStatus, newPaid, id);
    const updated = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id);
    const items = db.prepare('SELECT * FROM invoice_items WHERE invoice_id = ?').all(id);

    res.json({ ...updated, items });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update invoice payment status' });
  }
});

module.exports = router;
