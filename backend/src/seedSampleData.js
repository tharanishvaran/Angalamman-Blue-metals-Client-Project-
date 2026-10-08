const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'angalamman.db');
const db = new Database(dbPath);

console.log('🌱 Seeding realistic business data for Sri Angalamman Blue Metals...');

// 1. Seed sample customers
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
if (userCount === 0) {
  const sampleUsers = [
    {
      name: 'V. Ramanathan',
      email: 'ramanathan.builder@gmail.com',
      mobile: '9842103456',
      address: 'Plot 42, 5th Cross, VIP Nagar, Lawspet, Puducherry',
      role: 'CUSTOMER',
      login_count: 5
    },
    {
      name: 'S. Jayakumar',
      email: 'jayakumar.civil@gmail.com',
      mobile: '9789012345',
      address: 'No 18, Bharathi Street, Sathiyamoorthy Nagar, Thilaspettai, Puducherry',
      role: 'CUSTOMER',
      login_count: 8
    },
    {
      name: 'M. Anand',
      email: 'anand.constructions@gmail.com',
      mobile: '9443219876',
      address: 'Site #12, Villianur Main Road, Sulthanpet, Puducherry',
      role: 'CUSTOMER',
      login_count: 3
    },
    {
      name: 'K. Balaji',
      email: 'balaji.engineers@gmail.com',
      mobile: '9629112233',
      address: '24, Kamaraj Salai, Gorimedu, Puducherry',
      role: 'CUSTOMER',
      login_count: 6
    },
    {
      name: 'R. Senthil Kumar',
      email: 'senthil.infra@gmail.com',
      mobile: '9344556677',
      address: 'Ariyankuppam Bypass, Nonankuppam, Puducherry',
      role: 'CUSTOMER',
      login_count: 2
    }
  ];

  const insertUser = db.prepare(`
    INSERT INTO users (name, email, mobile, address, role, login_count, status)
    VALUES (@name, @email, @mobile, @address, @role, @login_count, 'ACTIVE')
  `);
  sampleUsers.forEach(u => insertUser.run(u));
  console.log('✅ Seeded 5 active customers');
}

// 2. Seed Quote Requests
const quoteCount = db.prepare('SELECT COUNT(*) as count FROM quote_requests').get().count;
if (quoteCount === 0) {
  const sampleQuotes = [
    {
      request_number: 'QTE-2026-1001',
      user_id: 1,
      customer_name: 'V. Ramanathan',
      customer_mobile: '9842103456',
      customer_email: 'ramanathan.builder@gmail.com',
      material_name: '3/4 Stone (20mm)',
      quantity: 4,
      unit: 'Load',
      delivery_location: 'Lawspet 5th Cross, Puducherry',
      message: 'Need 4 loads of 20mm blue metals for residential roof slab casting this Saturday morning.',
      status: 'Quoted',
      admin_notes: 'Quoted ₹4,400/load + ₹600 freight. Customer confirmed.'
    },
    {
      request_number: 'QTE-2026-1002',
      user_id: 2,
      customer_name: 'S. Jayakumar',
      customer_mobile: '9789012345',
      customer_email: 'jayakumar.civil@gmail.com',
      material_name: 'M-Sand',
      quantity: 3,
      unit: 'Load',
      delivery_location: 'Thilaspettai colony street',
      message: 'Narrow street tractor delivery required. Need washed M-sand for brickwork.',
      status: 'Pending',
      admin_notes: null
    },
    {
      request_number: 'QTE-2026-1003',
      user_id: 3,
      customer_name: 'M. Anand',
      customer_mobile: '9443219876',
      customer_email: 'anand.constructions@gmail.com',
      material_name: 'P-Sand',
      quantity: 2,
      unit: 'Load',
      delivery_location: 'Villianur Main Road site',
      message: 'Double sifted plastering sand required for interior plastering.',
      status: 'Converted',
      admin_notes: 'Converted to Order ORD-2026-1001'
    },
    {
      request_number: 'QTE-2026-1004',
      user_id: 4,
      customer_name: 'K. Balaji',
      customer_mobile: '9629112233',
      customer_email: 'balaji.engineers@gmail.com',
      material_name: 'Sengal (Red Bricks)',
      quantity: 2,
      unit: 'Load',
      delivery_location: 'Gorimedu, Puducherry',
      message: 'Table-moulded first class Sengal bricks 6000 pieces needed.',
      status: 'Contacted',
      admin_notes: 'Called customer, rate shared.'
    }
  ];

  const insertQuote = db.prepare(`
    INSERT INTO quote_requests (request_number, user_id, customer_name, customer_mobile, customer_email, material_name, quantity, unit, delivery_location, message, status, admin_notes)
    VALUES (@request_number, @user_id, @customer_name, @customer_mobile, @customer_email, @material_name, @quantity, @unit, @delivery_location, @message, @status, @admin_notes)
  `);
  sampleQuotes.forEach(q => insertQuote.run(q));
  console.log('✅ Seeded sample quote requests');
}

// 3. Seed Delivery Requests
const delivCount = db.prepare('SELECT COUNT(*) as count FROM delivery_requests').get().count;
if (delivCount === 0) {
  const sampleDeliveries = [
    {
      request_number: 'DEL-2026-2001',
      user_id: 1,
      customer_name: 'V. Ramanathan',
      customer_mobile: '9842103456',
      customer_email: 'ramanathan.builder@gmail.com',
      material_name: '3/4 Stone (20mm)',
      quantity: 2,
      unit: 'Load',
      delivery_address: 'Plot 42, 5th Cross, VIP Nagar, Lawspet, Puducherry',
      preferred_date: '2026-10-08',
      additional_notes: 'Tipper delivery 8 AM morning drop',
      status: 'Confirmed'
    },
    {
      request_number: 'DEL-2026-2002',
      user_id: 2,
      customer_name: 'S. Jayakumar',
      customer_mobile: '9789012345',
      customer_email: 'jayakumar.civil@gmail.com',
      material_name: 'M-Sand',
      quantity: 1,
      unit: 'Load',
      delivery_address: 'No 18, Bharathi Street, Thilaspettai',
      preferred_date: '2026-10-07',
      additional_notes: 'Hydraulic tractor delivery essential due to narrow street',
      status: 'Processing'
    },
    {
      request_number: 'DEL-2026-2003',
      user_id: 5,
      customer_name: 'R. Senthil Kumar',
      customer_mobile: '9344556677',
      customer_email: 'senthil.infra@gmail.com',
      material_name: 'Gravel / Kraval',
      quantity: 5,
      unit: 'Load',
      delivery_address: 'Ariyankuppam Bypass, Nonankuppam',
      preferred_date: '2026-10-09',
      additional_notes: 'Plot filling base material',
      status: 'Pending'
    }
  ];

  const insertDeliv = db.prepare(`
    INSERT INTO delivery_requests (request_number, user_id, customer_name, customer_mobile, customer_email, material_name, quantity, unit, delivery_address, preferred_date, additional_notes, status)
    VALUES (@request_number, @user_id, @customer_name, @customer_mobile, @customer_email, @material_name, @quantity, @unit, @delivery_address, @preferred_date, @additional_notes, @status)
  `);
  sampleDeliveries.forEach(d => insertDeliv.run(d));
  console.log('✅ Seeded sample delivery requests');
}

// 4. Seed Orders & Order Items
const orderCount = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
if (orderCount === 0) {
  const sampleOrders = [
    {
      order_number: 'ORD-2026-3001',
      user_id: 1,
      customer_name: 'V. Ramanathan',
      customer_mobile: '9842103456',
      delivery_address: 'VIP Nagar, Lawspet, Puducherry',
      total_amount: 19600,
      discount: 600,
      final_amount: 19000,
      status: 'Delivered',
      items: [
        { material_name: '3/4 Stone (20mm)', quantity: 2, unit: 'Load', unit_price: 4400, subtotal: 8800 },
        { material_name: 'M-Sand', quantity: 2, unit: 'Load', unit_price: 4800, subtotal: 9600 },
        { material_name: 'Local Transport (Lawspet)', quantity: 2, unit: 'Trip', unit_price: 600, subtotal: 1200 }
      ]
    },
    {
      order_number: 'ORD-2026-3002',
      user_id: 3,
      customer_name: 'M. Anand',
      customer_mobile: '9443219876',
      delivery_address: 'Villianur Main Road, Sulthanpet',
      total_amount: 15400,
      discount: 400,
      final_amount: 15000,
      status: 'Processing',
      items: [
        { material_name: 'P-Sand', quantity: 2, unit: 'Load', unit_price: 5200, subtotal: 10400 },
        { material_name: '1/2 Stone (12mm)', quantity: 1, unit: 'Load', unit_price: 4200, subtotal: 4200 },
        { material_name: 'Freight (Villianur)', quantity: 1, unit: 'Trip', unit_price: 800, subtotal: 800 }
      ]
    },
    {
      order_number: 'ORD-2026-3003',
      user_id: 4,
      customer_name: 'K. Balaji',
      customer_mobile: '9629112233',
      delivery_address: 'Kamaraj Salai, Gorimedu',
      total_amount: 22000,
      discount: 1000,
      final_amount: 21000,
      status: 'Confirmed',
      items: [
        { material_name: 'River Sand', quantity: 2, unit: 'Load', unit_price: 6500, subtotal: 13000 },
        { material_name: 'Sengal (Red Bricks)', quantity: 1, unit: 'Load', unit_price: 7500, subtotal: 7500 },
        { material_name: 'Tractor Haulage', quantity: 2, unit: 'Trip', unit_price: 750, subtotal: 1500 }
      ]
    }
  ];

  const insertOrder = db.prepare(`
    INSERT INTO orders (order_number, user_id, customer_name, customer_mobile, delivery_address, total_amount, discount, final_amount, status)
    VALUES (@order_number, @user_id, @customer_name, @customer_mobile, @delivery_address, @total_amount, @discount, @final_amount, @status)
  `);
  const insertItem = db.prepare(`
    INSERT INTO order_items (order_id, material_name, quantity, unit, unit_price, subtotal)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  sampleOrders.forEach(o => {
    const res = insertOrder.run(o);
    const orderId = res.lastInsertRowid;
    o.items.forEach(it => insertItem.run(orderId, it.material_name, it.quantity, it.unit, it.unit_price, it.subtotal));
  });
  console.log('✅ Seeded sample orders & items');
}

// 5. Seed Invoices & Items
const invCount = db.prepare('SELECT COUNT(*) as count FROM invoices').get().count;
if (invCount === 0) {
  const sampleInvoices = [
    {
      invoice_number: 'INV-2026-0001',
      user_id: 1,
      customer_name: 'V. Ramanathan',
      customer_mobile: '9842103456',
      customer_email: 'ramanathan.builder@gmail.com',
      customer_address: 'Plot 42, 5th Cross, VIP Nagar, Lawspet, Puducherry',
      subtotal: 19600,
      discount: 600,
      grand_total: 19000,
      payment_status: 'Paid',
      notes: 'Paid via GPay on site weighbridge delivery. Computerized slip #WB-4821 attached.',
      items: [
        { material_name: '3/4 Stone (20mm)', quantity: 2, unit: 'Load', unit_price: 4400, subtotal: 8800 },
        { material_name: 'M-Sand', quantity: 2, unit: 'Load', unit_price: 4800, subtotal: 9600 },
        { material_name: 'Transportation', quantity: 2, unit: 'Trip', unit_price: 600, subtotal: 1200 }
      ]
    },
    {
      invoice_number: 'INV-2026-0002',
      user_id: 3,
      customer_name: 'M. Anand',
      customer_mobile: '9443219876',
      customer_email: 'anand.constructions@gmail.com',
      customer_address: 'Villianur Main Road, Sulthanpet',
      subtotal: 15400,
      discount: 400,
      grand_total: 15000,
      payment_status: 'Partial',
      notes: 'Advance ₹10,000 received. Balance ₹5,000 payable upon final load drop.',
      items: [
        { material_name: 'P-Sand', quantity: 2, unit: 'Load', unit_price: 5200, subtotal: 10400 },
        { material_name: '1/2 Stone (12mm)', quantity: 1, unit: 'Load', unit_price: 4200, subtotal: 4200 },
        { material_name: 'Freight (Villianur)', quantity: 1, unit: 'Trip', unit_price: 800, subtotal: 800 }
      ]
    },
    {
      invoice_number: 'INV-2026-0003',
      user_id: 4,
      customer_name: 'K. Balaji',
      customer_mobile: '9629112233',
      customer_email: 'balaji.engineers@gmail.com',
      customer_address: 'Kamaraj Salai, Gorimedu, Puducherry',
      subtotal: 22000,
      discount: 1000,
      grand_total: 21000,
      payment_status: 'Paid',
      notes: 'Bank NEFT transfer received. Commercial delivery slip #WB-4903.',
      items: [
        { material_name: 'River Sand', quantity: 2, unit: 'Load', unit_price: 6500, subtotal: 13000 },
        { material_name: 'Sengal (Red Bricks)', quantity: 1, unit: 'Load', unit_price: 7500, subtotal: 7500 },
        { material_name: 'Tractor Haulage', quantity: 2, unit: 'Trip', unit_price: 750, subtotal: 1500 }
      ]
    }
  ];

  const insertInv = db.prepare(`
    INSERT INTO invoices (invoice_number, user_id, customer_name, customer_mobile, customer_email, customer_address, subtotal, discount, grand_total, payment_status, notes)
    VALUES (@invoice_number, @user_id, @customer_name, @customer_mobile, @customer_email, @customer_address, @subtotal, @discount, @grand_total, @payment_status, @notes)
  `);
  const insertInvItem = db.prepare(`
    INSERT INTO invoice_items (invoice_id, material_name, quantity, unit, unit_price, subtotal)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  sampleInvoices.forEach(inv => {
    const res = insertInv.run(inv);
    const invId = res.lastInsertRowid;
    inv.items.forEach(it => insertInvItem.run(invId, it.material_name, it.quantity, it.unit, it.unit_price, it.subtotal));
  });
  console.log('✅ Seeded sample invoices & line items');
}

console.log('🎉 Database seeded successfully!');
