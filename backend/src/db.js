const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// Configurable DB path for Render persistent disk or local
const dbDir = path.join(__dirname, '..', 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = process.env.DATABASE_URL || process.env.SQLITE_DB_PATH || path.join(dbDir, 'angalamman.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrency and performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize schema
function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      google_id TEXT UNIQUE,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      mobile TEXT,
      profile_image TEXT,
      address TEXT,
      role TEXT DEFAULT 'CUSTOMER',
      login_count INTEGER DEFAULT 1,
      first_login DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'ACTIVE',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT CHECK(role IN ('SUPER_ADMIN', 'ADMIN', 'STAFF')) DEFAULT 'ADMIN',
      status TEXT DEFAULT 'ACTIVE',
      last_login DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT DEFAULT 'Aggregate',
      description TEXT,
      price REAL NOT NULL,
      unit TEXT DEFAULT 'Load',
      image_url TEXT,
      available INTEGER DEFAULT 1,
      display_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      icon_name TEXT DEFAULT 'Truck',
      image_url TEXT,
      starting_price REAL DEFAULT 0,
      available INTEGER DEFAULT 1,
      display_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS quote_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_number TEXT UNIQUE,
      user_id INTEGER,
      customer_name TEXT NOT NULL,
      customer_mobile TEXT NOT NULL,
      customer_email TEXT,
      material_name TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT DEFAULT 'Load',
      delivery_location TEXT NOT NULL,
      message TEXT,
      status TEXT CHECK(status IN ('Pending', 'Contacted', 'Quoted', 'Converted', 'Closed')) DEFAULT 'Pending',
      admin_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS delivery_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_number TEXT UNIQUE,
      user_id INTEGER,
      customer_name TEXT NOT NULL,
      customer_mobile TEXT NOT NULL,
      customer_email TEXT,
      material_name TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT DEFAULT 'Load',
      delivery_address TEXT NOT NULL,
      preferred_date TEXT,
      additional_notes TEXT,
      status TEXT CHECK(status IN ('Pending', 'Confirmed', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled')) DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE,
      user_id INTEGER,
      customer_name TEXT NOT NULL,
      customer_mobile TEXT NOT NULL,
      delivery_address TEXT NOT NULL,
      total_amount REAL NOT NULL,
      discount REAL DEFAULT 0,
      final_amount REAL NOT NULL,
      status TEXT CHECK(status IN ('Pending', 'Confirmed', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled')) DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      material_name TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      unit_price REAL NOT NULL,
      subtotal REAL NOT NULL,
      FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_number TEXT UNIQUE NOT NULL,
      user_id INTEGER,
      customer_name TEXT NOT NULL,
      customer_mobile TEXT NOT NULL,
      customer_email TEXT,
      customer_address TEXT,
      subtotal REAL NOT NULL,
      discount REAL DEFAULT 0,
      grand_total REAL NOT NULL,
      payment_status TEXT CHECK(payment_status IN ('Paid', 'Unpaid', 'Partial')) DEFAULT 'Unpaid',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS invoice_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id INTEGER NOT NULL,
      material_name TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      unit_price REAL NOT NULL,
      subtotal REAL NOT NULL,
      FOREIGN KEY(invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      customer_name TEXT NOT NULL,
      rating INTEGER CHECK(rating BETWEEN 1 AND 5) NOT NULL,
      comment TEXT NOT NULL,
      is_approved INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS login_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      admin_id INTEGER,
      role TEXT,
      ip_address TEXT,
      user_agent TEXT,
      login_time DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  try {
    db.prepare('ALTER TABLE users ADD COLUMN password_hash TEXT').run();
  } catch (e) {
    // Column already exists or already migrated
  }

  try {
    db.prepare('ALTER TABLE admins ADD COLUMN profile_image TEXT').run();
  } catch (e) {
    // Column already exists
  }

  // Seed / Ensure angalammanbluemetalspondy@gmail.com & sriangalammanbluemetalspondy@gmail.com are Super Admins
  const targetAdminEmails = [
    'angalammanbluemetalspondy@gmail.com',
    'sriangalammanbluemetalspondy@gmail.com'
  ];
  const adminSalt = bcrypt.genSaltSync(10);
  const defaultAdminPassHash = bcrypt.hashSync('Admin@1234', adminSalt);

  for (const email of targetAdminEmails) {
    const cleanEmail = email.toLowerCase().trim();
    const existingTargetAdmin = db.prepare('SELECT id FROM admins WHERE LOWER(email) = ?').get(cleanEmail);

    if (!existingTargetAdmin) {
      db.prepare(`
        INSERT INTO admins (name, email, password_hash, role, status)
        VALUES (?, ?, ?, 'SUPER_ADMIN', 'ACTIVE')
      `).run('Sri Angalamman Admin', cleanEmail, defaultAdminPassHash);
      console.log(`✅ Admin account initialized: ${cleanEmail} / Admin@1234`);
    } else {
      db.prepare(`
        UPDATE admins
        SET role = 'SUPER_ADMIN', status = 'ACTIVE'
        WHERE id = ?
      `).run(existingTargetAdmin.id);
    }

    // Remove from customers users table to prevent collision
    try {
      db.prepare('DELETE FROM users WHERE LOWER(email) = ?').run(cleanEmail);
    } catch (e) {}
  }

  // Seed default Super Admin fallback if admins table is empty
  const adminCount = db.prepare('SELECT COUNT(*) as count FROM admins').get();
  if (adminCount.count === 0) {
    db.prepare(`
      INSERT INTO admins (name, email, password_hash, role, status)
      VALUES (?, ?, ?, 'SUPER_ADMIN', 'ACTIVE')
    `).run('Sri Angalamman Administrator', 'admin@angalamman.com', defaultAdminPassHash);
    console.log('✅ Default Super Admin created: admin@angalamman.com / Admin@1234');
  }

  // Seed Settings
  const settingsRows = [
    ['business_name', 'Sri Angalamman Blue Metals'],
    ['tagline', 'Quality Materials for a Stronger Tomorrow'],
    ['headline', 'Quality Blue Metals & Construction Materials'],
    ['subheadline', 'Reliable construction materials and transportation services in Puducherry.'],
    ['address', 'Kalathumettu Veedhi, Sathiyamoorthy Nagar, Thilaspettai, Puducherry, India'],
    ['phone_primary', '9944076675'],
    ['phone_secondary', '9345009337'],
    ['phone_additional', '9629657833'],
    ['whatsapp_number', '9944076675'],
    ['email', 'contact@sriangalammanbluemetals.com'],
    ['maps_url', 'https://maps.app.goo.gl/Z4SS6rkY7Vknzc3SA'],
    ['operating_hours', 'Mon - Sat: 6:00 AM - 8:00 PM | Sun: 7:00 AM - 1:00 PM'],
    ['hero_image', '/images/hero.jpg'],
    ['logo_text', 'Sri Angalamman Blue Metals']
  ];

  const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
  settingsRows.forEach(([k, v]) => insertSetting.run(k, v));

  // Seed Materials if empty
  const matCount = db.prepare('SELECT COUNT(*) as count FROM materials').get();
  if (matCount.count === 0) {
    const defaultMaterials = [
      {
        name: 'M-Sand',
        category: 'Sand',
        description: 'Manufactured sand engineered with cubical particle shape for superior concrete strength and durability.',
        price: 4800,
        unit: 'Load',
        image_url: '/images/msand.jpg',
        available: 1,
        display_order: 1
      },
      {
        name: 'P-Sand',
        category: 'Sand',
        description: 'Ultra-fine plastering sand washed and sifted for smooth, crack-resistant wall rendering and ceiling plastering.',
        price: 5200,
        unit: 'Load',
        image_url: '/images/psand.jpg',
        available: 1,
        display_order: 2
      },
      {
        name: 'River Sand',
        category: 'Sand',
        description: 'Premium natural river sand ideal for structural masonry, RCC work, and long-lasting plastering applications.',
        price: 6500,
        unit: 'Load',
        image_url: '/images/riversand.jpg',
        available: 1,
        display_order: 3
      },
      {
        name: 'Sengal (Red Bricks)',
        category: 'Bricks',
        description: 'Top-grade kiln-burned red clay bricks with sharp edges, high compressive strength, and thermal efficiency.',
        price: 8.50,
        unit: 'Piece',
        image_url: '/images/sengal.jpg',
        available: 1,
        display_order: 4
      },
      {
        name: '1/4 Stone (6mm Chips)',
        category: 'Aggregates',
        description: 'Small granite aggregate chips ideal for hollow blocks, paver blocks, terrazzo flooring, and asphalt mixes.',
        price: 3600,
        unit: 'Load',
        image_url: '/images/stone_quarter.jpg',
        available: 1,
        display_order: 5
      },
      {
        name: '1/2 Stone (12mm Aggregate)',
        category: 'Aggregates',
        description: 'Medium-sized blue metal aggregate specifically graded for RCC slabs, lintels, columns, and beam concreting.',
        price: 4200,
        unit: 'Load',
        image_url: '/images/stone_half.jpg',
        available: 1,
        display_order: 6
      },
      {
        name: '3/4 Stone (20mm Aggregate)',
        category: 'Aggregates',
        description: 'Standard construction-grade blue metal granite aggregate for heavy RCC foundations, footings, and structural slabs.',
        price: 4400,
        unit: 'Load',
        image_url: '/images/stone_three_quarter.jpg',
        available: 1,
        display_order: 7
      },
      {
        name: '1 1/2 Stone (40mm Ballast)',
        category: 'Aggregates',
        description: 'Large heavy-duty granite stones for mass concrete foundations, road base metalling, retaining walls, and retaining fill.',
        price: 3900,
        unit: 'Load',
        image_url: '/images/stone_one_half.jpg',
        available: 1,
        display_order: 8
      },
      {
        name: 'Gravel / Kraval',
        category: 'Base Material',
        description: 'Naturally graded gravel and kraval material suitable for sub-base road compaction, site leveling, and plinth backfilling.',
        price: 2800,
        unit: 'Load',
        image_url: '/images/gravel.jpg',
        available: 1,
        display_order: 9
      },
      {
        name: 'Crusher Powder',
        category: 'Powder',
        description: 'Fine crushed blue metal stone dust used for paving stone bedding, solid brick manufacturing, and tile setting.',
        price: 2400,
        unit: 'Load',
        image_url: '/images/crusher_powder.jpg',
        available: 1,
        display_order: 10
      }
    ];

    const insertMat = db.prepare(`
      INSERT INTO materials (name, category, description, price, unit, image_url, available, display_order)
      VALUES (@name, @category, @description, @price, @unit, @image_url, @available, @display_order)
    `);
    defaultMaterials.forEach(m => insertMat.run(m));
    console.log('✅ Seeded 10 standard materials');
  }

  // Seed Services
  const servCount = db.prepare('SELECT COUNT(*) as count FROM services').get();
  if (servCount.count === 0) {
    const defaultServices = [
      {
        name: 'Construction Material Supply',
        description: 'Wholesale and retail supply of top-grade crushed granite aggregates and masonry materials across Puducherry.',
        icon_name: 'Layers',
        image_url: '/images/hero.jpg',
        starting_price: 2500,
        available: 1,
        display_order: 1
      },
      {
        name: 'Sand Supply (M-Sand, P-Sand, River Sand)',
        description: 'Certified manufactured and natural sands for smooth wall plastering, column casting, and structural concrete.',
        icon_name: 'Feather',
        image_url: '/images/msand.jpg',
        starting_price: 4800,
        available: 1,
        display_order: 2
      },
      {
        name: 'Blue Metal Aggregates Supply',
        description: 'Machine-crushed, dust-free blue metal stones from 6mm (1/4") to 40mm (1 1/2") with certified strength testing.',
        icon_name: 'Gem',
        image_url: '/images/stone_three_quarter.jpg',
        starting_price: 3600,
        available: 1,
        display_order: 3
      },
      {
        name: 'Gravel & Site Filling',
        description: 'Subgrade gravel and high-density kraval filling for foundation trenches, road formation, and warehouse leveling.',
        icon_name: 'Mountain',
        image_url: '/images/gravel.jpg',
        starting_price: 2800,
        available: 1,
        display_order: 4
      },
      {
        name: 'Crusher Powder Supply',
        description: 'Bulk delivery of stone quarry dust for block manufacturing units, flooring pre-mix, and paver interlocking.',
        icon_name: 'Wind',
        image_url: '/images/crusher_powder.jpg',
        starting_price: 2400,
        available: 1,
        display_order: 5
      },
      {
        name: 'Material Transportation Service',
        description: 'Dedicated fleet of modern hydraulic tractors, mini tipper trucks, and heavy haulage lorries on call.',
        icon_name: 'Truck',
        image_url: '/images/fleet.jpg',
        starting_price: 800,
        available: 1,
        display_order: 6
      },
      {
        name: 'Bulk Commercial Supply',
        description: 'Contractor rates and scheduled multi-load deliveries for apartments, factories, and infrastructure sites.',
        icon_name: 'Building2',
        image_url: '/images/hero.jpg',
        starting_price: 15000,
        available: 1,
        display_order: 7
      },
      {
        name: 'Local Quick Delivery (Puducherry & Surroundings)',
        description: 'Same-day emergency drops and flexible small loads tailored for narrow residential streets and town sites.',
        icon_name: 'Navigation',
        image_url: '/images/fleet.jpg',
        starting_price: 600,
        available: 1,
        display_order: 8
      }
    ];

    const insertServ = db.prepare(`
      INSERT INTO services (name, description, icon_name, image_url, starting_price, available, display_order)
      VALUES (@name, @description, @icon_name, @image_url, @starting_price, @available, @display_order)
    `);
    defaultServices.forEach(s => insertServ.run(s));
    console.log('✅ Seeded 8 core services');
  }

  // Seed sample approved reviews
  const reviewCount = db.prepare('SELECT COUNT(*) as count FROM reviews').get();
  if (reviewCount.count === 0) {
    const sampleReviews = [
      {
        customer_name: 'V. Ramanathan (Civil Contractor, Lawspet)',
        rating: 5,
        comment: 'Sri Angalamman Blue Metals delivers accurate weighbridge loads without delays. Their 3/4 stone and M-Sand quality gave our residential concrete mix superb compressive strength.',
        is_approved: 1
      },
      {
        customer_name: 'S. Jayakumar (Home Builder, Thilaspettai)',
        rating: 5,
        comment: 'Ordered 4 loads of P-Sand and Sengal bricks for my independent house construction. Delivered directly inside the narrow street using their tractor trolley on the exact promised morning!',
        is_approved: 1
      },
      {
        customer_name: 'M. Anand (Site Engineer, Villianur)',
        rating: 5,
        comment: 'Very professional management in Puducherry. Clean crusher dust, fair pricing without hidden transport charges, and polite drivers. Highly recommended for commercial builders.',
        is_approved: 1
      }
    ];
    const insertRev = db.prepare('INSERT INTO reviews (customer_name, rating, comment, is_approved) VALUES (?, ?, ?, ?)');
    sampleReviews.forEach(r => insertRev.run(r.customer_name, r.rating, r.comment, r.is_approved));
  }
}

initDatabase();

module.exports = db;
