import sqlite3Module from 'sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlite3 = sqlite3Module.verbose();
const DB_PATH = path.join(__dirname, 'ar_interia.db');

let db = null;

export const initializeDb = () => {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
      } else {
        console.log('Connected to SQLite database at:', DB_PATH);
        initializeDatabase();
        resolve(db);
      }
    });
  });
};

export const getDb = () => db;

const initializeDatabase = () => {
  if (!db) return;
  db.serialize(() => {
    // Create tables
    db.run(`
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        phone TEXT,
        address TEXT,
        location TEXT,
        pincode TEXT,
        bio TEXT,
        profilePhoto TEXT,
        role TEXT DEFAULT 'customer',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.all("PRAGMA table_info(customers)", [], (err, rows) => {
      if (!err && rows) {
        const hasPhone = rows.some(r => r.name === 'phone');
        const hasAddress = rows.some(r => r.name === 'address');
        const hasLocation = rows.some(r => r.name === 'location');
        const hasPincode = rows.some(r => r.name === 'pincode');
        const hasBio = rows.some(r => r.name === 'bio');
        const hasProfilePhoto = rows.some(r => r.name === 'profilePhoto');
        if (!hasPhone) db.run("ALTER TABLE customers ADD COLUMN phone TEXT");
        if (!hasAddress) db.run("ALTER TABLE customers ADD COLUMN address TEXT");
        if (!hasLocation) db.run("ALTER TABLE customers ADD COLUMN location TEXT");
        if (!hasPincode) db.run("ALTER TABLE customers ADD COLUMN pincode TEXT");
        if (!hasBio) db.run("ALTER TABLE customers ADD COLUMN bio TEXT");
        if (!hasProfilePhoto) db.run("ALTER TABLE customers ADD COLUMN profilePhoto TEXT");
      }
    });

    db.run(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        image TEXT,
        motion3d INTEGER DEFAULT 0,
        status TEXT DEFAULT 'active',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS designs (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        categoryId TEXT NOT NULL,
        previewImage TEXT,
        modelUrl TEXT,
        price REAL DEFAULT 0,
        motion3d INTEGER DEFAULT 0,
        availabilityStatus TEXT DEFAULT 'available',
        status TEXT DEFAULT 'active',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (categoryId) REFERENCES categories(id)
      )
    `);

    db.all("PRAGMA table_info(categories)", [], (err, rows) => {
      if (!err && rows) {
        const hasMotion3d = rows.some(r => r.name === 'motion3d');
        if (!hasMotion3d) {
          db.run("ALTER TABLE categories ADD COLUMN motion3d INTEGER DEFAULT 0");
        }
      }
    });

    db.all("PRAGMA table_info(designs)", [], (err, rows) => {
      if (!err && rows) {
        const hasMotion3d = rows.some(r => r.name === 'motion3d');
        const hasCost = rows.some(r => r.name === 'cost');
        if (!hasMotion3d) {
          db.run("ALTER TABLE designs ADD COLUMN motion3d INTEGER DEFAULT 0");
        }
        if (!hasCost) {
          db.run("ALTER TABLE designs ADD COLUMN cost REAL DEFAULT 0");
        }
      }
    });

    db.run(`
      CREATE TABLE IF NOT EXISTS likes (
        id TEXT PRIMARY KEY,
        customerId TEXT NOT NULL,
        designId TEXT NOT NULL,
        value TEXT DEFAULT 'like',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customerId) REFERENCES customers(id),
        FOREIGN KEY (designId) REFERENCES designs(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS feedbacks (
        id TEXT PRIMARY KEY,
        customerId TEXT NOT NULL,
        userName TEXT,
        designId TEXT,
        rating INTEGER,
        comment TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customerId) REFERENCES customers(id),
        FOREIGN KEY (designId) REFERENCES designs(id)
      )
    `);

    db.all("PRAGMA table_info(feedbacks)", [], (err, rows) => {
      if (!err && rows) {
        const hasUserName = rows.some(r => r.name === 'userName');
        if (!hasUserName) {
          db.run("ALTER TABLE feedbacks ADD COLUMN userName TEXT");
        }
      }
    });

    db.run(`
      CREATE TABLE IF NOT EXISTS chatbot_logs (
        id TEXT PRIMARY KEY,
        customerId TEXT,
        userType TEXT DEFAULT 'newGuest',
        userName TEXT,
        query TEXT NOT NULL,
        response TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customerId) REFERENCES customers(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        customerId TEXT NOT NULL,
        designId TEXT NOT NULL,
        designName TEXT,
        cost REAL,
        status TEXT DEFAULT 'pending',
        bookingDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customerId) REFERENCES customers(id),
        FOREIGN KEY (designId) REFERENCES designs(id)
      )
    `);

    // Add new columns to bookings table if they don't exist
    db.all("PRAGMA table_info(bookings)", [], (err, rows) => {
      if (!err && rows) {
        const hasDesignName = rows.some(r => r.name === 'designName');
        const hasCost = rows.some(r => r.name === 'cost');
        const hasPrice = rows.some(r => r.name === 'price');
        const hasDesignImage = rows.some(r => r.name === 'designImage');
        if (!hasDesignName) {
          db.run("ALTER TABLE bookings ADD COLUMN designName TEXT");
        }
        if (!hasCost) {
          db.run("ALTER TABLE bookings ADD COLUMN cost REAL");
        }
        if (!hasPrice) {
          db.run("ALTER TABLE bookings ADD COLUMN price REAL");
        }
        if (!hasDesignImage) {
          db.run("ALTER TABLE bookings ADD COLUMN designImage TEXT");
        }
      }
    });

    db.run(`
      CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        customerId TEXT NOT NULL,
        designId TEXT,
        bookingId TEXT,
        amount REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        razorpayOrderId TEXT,
        razorpayPaymentId TEXT,
        method TEXT DEFAULT 'razorpay',
        metadata TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customerId) REFERENCES customers(id),
        FOREIGN KEY (designId) REFERENCES designs(id),
        FOREIGN KEY (bookingId) REFERENCES bookings(id)
      )
    `);

    db.run(`ALTER TABLE payments ADD COLUMN metadata TEXT`, (err) => {
      if (err && !String(err.message || '').toLowerCase().includes('duplicate column')) {
        console.warn('Payments metadata migration warning:', err.message || err);
      }
    });

    db.run(`ALTER TABLE payments ADD COLUMN paymentDateTime TEXT`, (err) => {
      if (err && !String(err.message || '').toLowerCase().includes('duplicate column')) {
        console.warn('Payments paymentDateTime migration warning:', err.message || err);
      }
    });

    db.run(`
      CREATE TABLE IF NOT EXISTS backgroundImages (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        isDefault INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS category_images (
        id TEXT PRIMARY KEY,
        categoryKey TEXT NOT NULL,
        categoryName TEXT NOT NULL,
        filename TEXT NOT NULL,
        displayName TEXT,
        url TEXT NOT NULL,
        motion3d INTEGER DEFAULT 0,
        source TEXT DEFAULT 'local',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(categoryKey, filename)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS inquiries (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT,
        status TEXT DEFAULT 'new',
        adminReply TEXT,
        isReadByAdmin INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`ALTER TABLE inquiries ADD COLUMN status TEXT DEFAULT 'new'`, (err) => {
      if (err && !String(err.message || '').toLowerCase().includes('duplicate column')) {
        console.warn('Inquiries status migration warning:', err.message || err);
      }
    });

    db.run(`ALTER TABLE inquiries ADD COLUMN adminReply TEXT`, (err) => {
      if (err && !String(err.message || '').toLowerCase().includes('duplicate column')) {
        console.warn('Inquiries adminReply migration warning:', err.message || err);
      }
    });

    db.run(`ALTER TABLE inquiries ADD COLUMN isReadByAdmin INTEGER DEFAULT 0`, (err) => {
      if (err && !String(err.message || '').toLowerCase().includes('duplicate column')) {
        console.warn('Inquiries isReadByAdmin migration warning:', err.message || err);
      }
    });

    db.run(`
      CREATE TABLE IF NOT EXISTS invoices (
        id TEXT PRIMARY KEY,
        customerId TEXT NOT NULL,
        paymentId TEXT,
        bookingId TEXT,
        invoiceNumber TEXT UNIQUE NOT NULL,
        amount REAL NOT NULL,
        subtotal REAL NOT NULL,
        tax REAL DEFAULT 0,
        discount REAL DEFAULT 0,
        status TEXT DEFAULT 'generated',
        items TEXT,
        pdfPath TEXT,
        customerName TEXT,
        customerEmail TEXT,
        customerPhone TEXT,
        packageName TEXT,
        designName TEXT,
        paymentMethod TEXT,
        paymentDateTime TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customerId) REFERENCES customers(id),
        FOREIGN KEY (paymentId) REFERENCES payments(id),
        FOREIGN KEY (bookingId) REFERENCES bookings(id)
      )
    `);

    db.run(`ALTER TABLE invoices ADD COLUMN pdfPath TEXT`, (err) => {
      if (err && !String(err.message || '').toLowerCase().includes('duplicate column')) {
        console.warn('Invoices pdfPath migration warning:', err.message || err);
      }
    });

    db.run(`ALTER TABLE invoices ADD COLUMN packageName TEXT`, (err) => {
      if (err && !String(err.message || '').toLowerCase().includes('duplicate column')) {
        console.warn('Invoices packageName migration warning:', err.message || err);
      }
    });

    db.run(`ALTER TABLE invoices ADD COLUMN paymentMethod TEXT`, (err) => {
      if (err && !String(err.message || '').toLowerCase().includes('duplicate column')) {
        console.warn('Invoices paymentMethod migration warning:', err.message || err);
      }
    });

    db.run(`ALTER TABLE invoices ADD COLUMN paymentDateTime TEXT`, (err) => {
      if (err && !String(err.message || '').toLowerCase().includes('duplicate column')) {
        console.warn('Invoices paymentDateTime migration warning:', err.message || err);
      }
    });

    db.run(`ALTER TABLE invoices ADD COLUMN pdfData BLOB`, (err) => {
      if (err && !String(err.message || '').toLowerCase().includes('duplicate column')) {
        console.warn('Invoices pdfData migration warning:', err.message || err);
      }
    });

    db.run('CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoiceNumber)');
    db.run('CREATE INDEX IF NOT EXISTS idx_invoices_customer_created ON invoices(customerId, createdAt DESC)');
    db.run('CREATE INDEX IF NOT EXISTS idx_invoices_payment_id ON invoices(paymentId)');
    db.run('CREATE INDEX IF NOT EXISTS idx_invoices_booking_id ON invoices(bookingId)');
    db.run('CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status)');
    db.run('CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status)');
    db.run('CREATE INDEX IF NOT EXISTS idx_payments_customer_status ON payments(customerId, status)');

    db.all(
      `SELECT
         i.id,
         i.designName as invoiceDesignName,
         i.packageName as invoicePackageName,
         i.paymentMethod as invoicePaymentMethod,
         i.paymentDateTime as invoicePaymentDateTime,
         i.createdAt as invoiceCreatedAt,
         b.designName as bookingPackageName,
         p.method as paymentMethodFromPayment,
         COALESCE(p.updatedAt, p.createdAt) as paymentDateTimeFromPayment,
         COALESCE(d.title, b.designName, i.designName, 'Design Service') as designTitle
       FROM invoices i
       LEFT JOIN bookings b ON b.id = i.bookingId
       LEFT JOIN payments p ON p.id = i.paymentId
       LEFT JOIN designs d ON d.id = COALESCE(p.designId, b.designId)` ,
      [],
      (err, rows) => {
        if (err || !rows || rows.length === 0) return;
        rows.forEach((row) => {
          const nextPackageName = String(row.invoicePackageName || row.bookingPackageName || row.designTitle || row.invoiceDesignName || 'Booked Package');
          const nextDesignName = String(row.designTitle || row.invoiceDesignName || row.bookingPackageName || 'Design Service');
          const nextPaymentMethod = String(row.invoicePaymentMethod || row.paymentMethodFromPayment || 'N/A');
          const nextPaymentDateTime = String(row.invoicePaymentDateTime || row.paymentDateTimeFromPayment || row.invoiceCreatedAt || new Date().toISOString());

          db.run(
            `UPDATE invoices
             SET packageName = CASE WHEN packageName IS NULL OR TRIM(packageName) = '' THEN ? ELSE packageName END,
                 designName = CASE WHEN designName IS NULL OR TRIM(designName) = '' THEN ? ELSE designName END,
                 paymentMethod = CASE WHEN paymentMethod IS NULL OR TRIM(paymentMethod) = '' THEN ? ELSE paymentMethod END,
                 paymentDateTime = CASE WHEN paymentDateTime IS NULL OR TRIM(paymentDateTime) = '' THEN ? ELSE paymentDateTime END,
                 updatedAt = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [nextPackageName, nextDesignName, nextPaymentMethod, nextPaymentDateTime, row.id]
          );
        });
      }
    );

    db.run(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        price REAL NOT NULL,
        image_url TEXT,
        category TEXT NOT NULL,
        description TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS portfolio_content (
        id TEXT PRIMARY KEY,
        aboutTitle TEXT,
        aboutBody TEXT,
        worksTitle TEXT,
        worksBody TEXT,
        services TEXT,
        founder TEXT,
        coFounder TEXT,
        designers TEXT,
        feedbackVideos TEXT,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`ALTER TABLE portfolio_content ADD COLUMN coFounder TEXT`, (err) => {
      if (err && !String(err.message || '').toLowerCase().includes('duplicate column')) {
        console.warn('Portfolio coFounder migration warning:', err.message || err);
      }
    });

    db.run(`ALTER TABLE portfolio_content ADD COLUMN feedbackVideos TEXT`, (err) => {
      if (err && !String(err.message || '').toLowerCase().includes('duplicate column')) {
        console.warn('Portfolio feedbackVideos migration warning:', err.message || err);
      }
    });

    db.run(`
      CREATE TABLE IF NOT EXISTS ai_designs (
        id TEXT PRIMARY KEY,
        customerId TEXT NOT NULL,
        originalImage TEXT NOT NULL,
        variants TEXT NOT NULL,
        status TEXT DEFAULT 'draft',
        quoteAmount REAL,
        requestedAt DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customerId) REFERENCES customers(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS packages (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        subtitle TEXT,
        originalPrice REAL,
        discountedPrice REAL,
        description TEXT,
        image TEXT,
        category TEXT,
        type TEXT,
        bhk INTEGER,
        features TEXT, -- JSON array
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS package_designs (
        id TEXT PRIMARY KEY,
        packageId TEXT NOT NULL,
        title TEXT NOT NULL,
        image TEXT NOT NULL,
        description TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (packageId) REFERENCES packages(id)
      )
    `);

    // Seed data
    seedDatabase();
    setTimeout(() => {
      ensurePortfolioDemoData();
    }, 3500);
    seedPackages();
    ensureSampleInquiries();
    ensurePortfolioContent();
    setTimeout(() => {
      repairBookingDesignReferences();
    }, 2000);
  });
};

const seedDatabase = () => {
  // Check if customers already exist
  db.get(`SELECT COUNT(*) as count FROM customers`, [], (err, row) => {
    if (err) {
      console.error('Error checking customers:', err);
      return;
    }

    if (row.count > 0) {
      console.log('Database already seeded, skipping...');
      return;
    }

    console.log('Seeding database with sample data...');

    const sampleCustomers = [
      { name: 'Raj Kumar', email: 'raj@example.com', username: 'rajkumar', password: 'password123' },
      { name: 'Priya Singh', email: 'priya@example.com', username: 'priya123', password: 'password123' },
      { name: 'Amit Patel', email: 'amit@example.com', username: 'amit.patel', password: 'password123' },
      { name: 'Neha Sharma', email: 'neha@example.com', username: 'neha.sharma', password: 'password123' },
      { name: 'Vikram Desai', email: 'vikram@example.com', username: 'vikram_d', password: 'password123' },
      { name: 'Anjali Reddy', email: 'anjali@example.com', username: 'anjali.r', password: 'password123' },
      { name: 'Rohit Verma', email: 'rohit@example.com', username: 'rohit.v', password: 'password123' },
      { name: 'Divya Nair', email: 'divya@example.com', username: 'divya_nair', password: 'password123' },
      { name: 'Arun Chopra', email: 'arun@example.com', username: 'arun_c', password: 'password123' },
      { name: 'Sneha Gupta', email: 'sneha@example.com', username: 'sneha.g', password: 'password123' },
      { name: 'Karan Malhotra', email: 'karan@example.com', username: 'karan_m', password: 'password123' },
      { name: 'Pooja Yadav', email: 'pooja@example.com', username: 'pooja.y', password: 'password123' },
      { name: 'Arjun Singh', email: 'arjun@example.com', username: 'arjun_s', password: 'password123' },
      { name: 'Meera Kapoor', email: 'meera@example.com', username: 'meera_k', password: 'password123' },
      { name: 'Sanjay Bhat', email: 'sanjay@example.com', username: 'sanjay.b', password: 'password123' }
    ];

    const adminCustomer = {
      name: 'Administrator',
      email: 'admin954809@gmail.com',
      username: 'admin',
      password: 'Admin@1234',
      role: 'admin'
    };

    // Insert admin
    insertCustomer(adminCustomer, () => {
      // Insert sample customers
      sampleCustomers.forEach((customer, index) => {
        setTimeout(() => {
          insertCustomer(customer, () => {
            if (index === sampleCustomers.length - 1) {
              console.log('Sample customers seeded successfully');
              seedCategories();
            }
          });
        }, index * 50);
      });
    });
  });
};

const PORTFOLIO_DEMO_TARGET_COUNT = 250;
const PORTFOLIO_DEMO_FIRST_NAMES = [
  'Aarav', 'Aanya', 'Vihaan', 'Ishita', 'Arjun', 'Saanvi', 'Reyansh', 'Anika', 'Kabir', 'Meera',
  'Aditya', 'Priya', 'Rohan', 'Nisha', 'Karan', 'Sneha', 'Dev', 'Neha', 'Rahul', 'Pooja',
  'Siddharth', 'Kavya', 'Mohan', 'Ritika', 'Yash', 'Shreya', 'Manish', 'Tanya', 'Harsh', 'Rhea'
];

const PORTFOLIO_DEMO_LAST_NAMES = [
  'Mehta', 'Sharma', 'Iyer', 'Rao', 'Nair', 'Kapoor', 'Gupta', 'Singh', 'Joshi', 'Menon',
  'Verma', 'Das', 'Khanna', 'Bhat', 'Patel', 'Reddy', 'Malhotra', 'Pillai', 'Mehra', 'Sethi',
  'Jain', 'Anand', 'Ahuja', 'Bansal', 'Chawla', 'Vardhan', 'Kumar', 'Khatri', 'Batra', 'Sen'
];

const PORTFOLIO_DEMO_CITIES = [
  'Bengaluru', 'Mumbai', 'Hyderabad', 'Pune', 'Chennai', 'Delhi', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow'
];

const PORTFOLIO_DEMO_AREAS = [
  'HSR Layout', 'Indiranagar', 'Koramangala', 'Andheri East', 'Banjara Hills', 'Hinjawadi', 'Whitefield', 'Powai', 'Jubilee Hills', 'MG Road'
];

const padDemoIndex = (index) => String(index).padStart(3, '0');

const buildPortfolioDemoContactProfile = (index, name, cityHint) => {
  const city = cityHint || PORTFOLIO_DEMO_CITIES[index % PORTFOLIO_DEMO_CITIES.length];
  const area = PORTFOLIO_DEMO_AREAS[index % PORTFOLIO_DEMO_AREAS.length];
  const phoneSuffix = String(100000000 + (index % 900000000)).padStart(9, '0');
  const pincode = String(560000 + (index % 1000)).padStart(6, '0');
  return {
    phone: `+91 9${phoneSuffix}`,
    location: city,
    pincode,
    address: `${(index % 180) + 11}, ${area}, ${city}`,
    bio: `${name} is exploring premium interior concepts in ${city}.`
  };
};

const buildPortfolioDemoCustomerRows = (existingCount) => {
  const needed = Math.max(PORTFOLIO_DEMO_TARGET_COUNT - existingCount, 0);
  return Array.from({ length: needed }, (_, offset) => {
    const absoluteIndex = existingCount + offset + 1;
    const firstName = PORTFOLIO_DEMO_FIRST_NAMES[offset % PORTFOLIO_DEMO_FIRST_NAMES.length];
    const lastName = PORTFOLIO_DEMO_LAST_NAMES[Math.floor(offset / PORTFOLIO_DEMO_FIRST_NAMES.length) % PORTFOLIO_DEMO_LAST_NAMES.length];
    const padded = padDemoIndex(absoluteIndex);
    const fullName = `${firstName} ${lastName}`;
    const profile = buildPortfolioDemoContactProfile(absoluteIndex, fullName);
    return {
      id: `demo-customer-${padded}`,
      name: fullName,
      email: `demo.customer.${padded}@example.com`,
      username: `demo_customer_${padded}`,
      password: 'password123',
      phone: profile.phone,
      address: profile.address,
      location: profile.location,
      pincode: profile.pincode,
      bio: profile.bio
    };
  });
};

const ensureCustomerProfileCoverage = () => {
  if (!db) return;

  db.all(
    `SELECT id, name, email, phone, address, location, pincode, bio, createdAt FROM customers ORDER BY createdAt ASC, id ASC`,
    [],
    (err, rows) => {
      if (err) {
        console.error('Error ensuring customer profile coverage:', err);
        return;
      }
      if (!rows || rows.length === 0) return;

      rows.forEach((customer, index) => {
        const profile = buildPortfolioDemoContactProfile(index + 1, String(customer?.name || 'Customer'));
        db.run(
          `UPDATE customers
           SET phone = COALESCE(NULLIF(phone, ''), ?),
               address = COALESCE(NULLIF(address, ''), ?),
               location = COALESCE(NULLIF(location, ''), ?),
               pincode = COALESCE(NULLIF(pincode, ''), ?),
               bio = COALESCE(NULLIF(bio, ''), ?)
           WHERE id = ?`,
          [profile.phone, profile.address, profile.location, profile.pincode, profile.bio, customer.id],
          (updateErr) => {
            if (updateErr) {
              console.warn('Customer profile backfill warning:', updateErr.message || updateErr);
            }
          }
        );
      });
    }
  );
};

const ensurePortfolioDemoData = () => {
  if (!db) return;

  db.get(`SELECT COUNT(*) as count FROM customers`, [], (customerErr, customerRow) => {
    if (customerErr) {
      console.error('Error checking portfolio demo customers:', customerErr);
      return;
    }

    const existingCustomerCount = Number(customerRow?.count || 0);
    const demoCustomers = buildPortfolioDemoCustomerRows(existingCustomerCount);

    const finalizeBookings = () => {
      db.all(
        `SELECT id, title, previewImage, price, categoryId FROM designs ORDER BY createdAt ASC, id ASC`,
        [],
        (designErr, designRows) => {
          if (designErr) {
            console.error('Error loading designs for portfolio demo bookings:', designErr);
            return;
          }

          if (!designRows || designRows.length === 0) {
            console.log('Designs are not ready yet for portfolio demo seeding; skipping booking seed pass.');
            return;
          }

          db.all(
            `SELECT id, name FROM customers ORDER BY createdAt ASC, id ASC`,
            [],
            (sortedCustomerErr, sortedCustomerRows) => {
              if (sortedCustomerErr) {
                console.error('Error loading customers for portfolio demo bookings:', sortedCustomerErr);
                return;
              }

              if (!sortedCustomerRows || sortedCustomerRows.length === 0) return;

              let pendingBookings = sortedCustomerRows.length;
              sortedCustomerRows.forEach((customer, index) => {
                const design = designRows[index % designRows.length];
                const bookingId = `demo-booking-${padDemoIndex(index + 1)}`;
                const designId = String(design?.id || `demo-design-${padDemoIndex(index + 1)}`);
                const designName = String(design?.title || 'Interior Design').trim();
                const bookingDate = new Date();
                bookingDate.setMonth(index % 12);
                bookingDate.setDate((index % 27) + 1);
                bookingDate.setHours(9 + (index % 9), 30, 0, 0);

                db.run(
                  `INSERT INTO bookings (id, customerId, designId, designName, price, cost, status, bookingDate)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                   ON CONFLICT(id) DO UPDATE SET
                     customerId = excluded.customerId,
                     designId = excluded.designId,
                     designName = excluded.designName,
                     price = excluded.price,
                     cost = excluded.cost,
                     status = excluded.status,
                     bookingDate = excluded.bookingDate` ,
                  [
                    bookingId,
                    customer.id,
                    designId,
                    designName,
                    Number(design?.price || 0),
                    Number(Number(design?.price || 0) * 0.62),
                    'confirmed',
                    bookingDate.toISOString()
                  ],
                  (bookingRunErr) => {
                    if (bookingRunErr) {
                      console.warn('Portfolio demo booking seed warning:', bookingRunErr.message || bookingRunErr);
                    }

                    pendingBookings -= 1;
                    if (pendingBookings === 0) {
                      ensureCustomerProfileCoverage();
                      console.log('Portfolio demo customers and bookings are ready in SQLite.');
                    }
                  }
                );
              });
            }
          );
        }
      );
    };

    if (demoCustomers.length === 0) {
      ensureCustomerProfileCoverage();
      finalizeBookings();
      return;
    }

    let pendingCustomers = demoCustomers.length;
    demoCustomers.forEach((customer) => {
      db.run(
        `INSERT OR IGNORE INTO customers (id, name, email, username, password, phone, address, location, pincode, bio, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
        [customer.id, customer.name, customer.email, customer.username, customer.password, customer.phone, customer.address, customer.location, customer.pincode, customer.bio, 'customer'],
        (insertErr) => {
          if (insertErr) {
            console.warn('Portfolio demo customer seed warning:', insertErr.message || insertErr);
          }
          pendingCustomers -= 1;
          if (pendingCustomers === 0) {
            ensureCustomerProfileCoverage();
            finalizeBookings();
          }
        }
      );
    });
  });
};

const ensurePortfolioContent = () => {
  if (!db) return;
  db.get(`SELECT COUNT(*) as count FROM portfolio_content`, [], (err, row) => {
    if (err) {
      console.error('Error checking portfolio content:', err);
      return;
    }
    if (row.count > 0) return;
    const defaultContent = {
      aboutTitle: 'About AR Interia',
      aboutBody: 'AR Interia blends artisanal craftsmanship with spatial technology to create luxury interiors that feel effortless and timeless. Our team delivers immersive 3D visualization and AR previews so you can see every detail before we build it.',
      worksTitle: 'How We Work',
      worksBody: 'We start with a deep discovery session, move into 3D concept development, and refine with AR walk-throughs. Every space is delivered with precision planning, material curation, and on-site execution for premium results.',
      services: [
        { title: '3D Design Studio', description: 'Photorealistic concepts, layouts, and walkthroughs to plan every detail.', icon: '3D' },
        { title: 'AR Preview', description: 'Experience your future space in real scale before execution.', icon: 'AR' },
        { title: 'Turnkey Execution', description: 'Design, materials, and build management in one seamless plan.', icon: 'Build' }
      ],
      founder: {
        name: 'Abhilash J',
        role: 'Founder and Creative Director',
        bio: 'Abhilash leads AR Interia with a focus on elevated living spaces, bringing 12+ years of luxury design experience across residential and hospitality projects.',
        photo: ''
      },
      coFounder: {
        name: 'Ramesh',
        role: 'Co-Founder',
        bio: 'Leading design and innovation with over a decade of expertise in transforming spaces into functional and artistic environments.',
        photo: ''
      },
      designers: [
        {
          name: 'Isha Kapoor',
          role: 'Lead Interior Designer',
          bio: 'Specialist in contemporary residential design and material storytelling.',
          photo: ''
        },
        {
          name: 'Rohan Malhotra',
          role: 'Spatial Visualization Lead',
          bio: 'Expert in 3D modeling, lighting, and immersive AR walkthroughs.',
          photo: ''
        }
      ],
      feedbackVideos: [
        {
          url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          title: 'Amazing Living Room Transformation - Client Review',
          showOnHomepage: true,
          showOnPortfolio: true
        },
        {
          url: 'https://www.youtube.com/embed/jfKfPfyJRdk',
          title: 'Modern Kitchen Renovation Feedback',
          showOnHomepage: true,
          showOnPortfolio: true
        },
        {
          url: 'https://www.youtube.com/embed/5qap5aO4i9A',
          title: 'Luxury Villa Interior Design Experience',
          showOnHomepage: true,
          showOnPortfolio: true
        }
      ]
    };

    db.run(
      `INSERT INTO portfolio_content (id, aboutTitle, aboutBody, worksTitle, worksBody, services, founder, coFounder, designers, feedbackVideos) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      , [
        'default',
        defaultContent.aboutTitle,
        defaultContent.aboutBody,
        defaultContent.worksTitle,
        defaultContent.worksBody,
        JSON.stringify(defaultContent.services),
        JSON.stringify(defaultContent.founder),
        JSON.stringify(defaultContent.coFounder),
        JSON.stringify(defaultContent.designers),
        JSON.stringify(defaultContent.feedbackVideos)
      ]
    );

    // Update existing portfolio content with empty feedback videos
    db.run(`
      UPDATE portfolio_content 
      SET feedbackVideos = ? 
      WHERE id = 'default' AND (feedbackVideos IS NULL OR feedbackVideos = '[]')
    `, [JSON.stringify(defaultContent.feedbackVideos)]);
  });
};

const insertCustomer = (customer, callback) => {
  bcrypt.hash(customer.password, 10, (err, hashedPassword) => {
    if (err) {
      console.error('Error hashing password:', err);
      return;
    }

    const id = `cust-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const role = customer.role || 'customer';

    db.run(
      `INSERT INTO customers (id, name, email, username, password, role) VALUES (?, ?, ?, ?, ?, ?)`,
      [id, customer.name, customer.email, customer.username, hashedPassword, role],
      callback
    );
  });
};

const normalizeCategoryKey = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .replace(/^-+|-+$/g, '');

const normalizeDesignKey = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');

const seedCategories = () => {
  if (!db) return;
  const categories = [
    { title: 'Apartment', description: 'Modern apartment interior designs for 1BHK, 2BHK, 3BHK and 4BHK homes', image: '/api/category-images/Apartment/apartment2.jpg' },
    { title: 'Living Room', description: 'Premium Indian living room designs for homes and villas', image: '/api/category-images/Living room/living1.jpg' },
    { title: 'Kids Bedroom', description: 'Fun and colourful kids bedroom designs', image: '/api/category-images/Kids-bedroom/kids-bedroom1.jpg' },
    { title: 'Master Bedroom', description: 'Premium bedroom designs for rest and renewal', image: '/api/category-images/Master Bedroom/master-bedroom1.jpg' },
    { title: 'Kitchen', description: 'Functional and stylish modular kitchens', image: '/api/category-images/Kitchen/kitchen1.jpg' },
    { title: 'Bathroom', description: 'Luxury bathroom designs for relaxation', image: '/api/category-images/Bathroom/bathroom1.jpg' },
    { title: 'Dining Area', description: 'Elegant dining room designs for families', image: '/api/category-images/Diningroom/dining-room1.jpg' },
    { title: 'Pooja Room', description: 'Sacred pooja room and mandir designs', image: '/api/category-images/Pooja room/pooja-room1.jpg' },
    { title: 'Gym', description: 'Premium home gym designs', image: '/api/category-images/Gym/gym (1).jpg' },
    { title: 'Spa', description: 'Luxury spa and wellness room designs', image: '/api/category-images/Spa/spa room (1).jpg' },
    { title: 'Balcony', description: 'Modern balcony designs for apartments and villas', image: '/api/category-images/Balcony/balcony (1).jpg' },
    { title: 'Terrace', description: 'Rooftop and terrace designs for sky villas', image: '/api/category-images/Terrace/terrace (1).jpg' },
    { title: 'Swimming Pool', description: 'Luxury pool designs for apartments and resorts', image: '/api/category-images/Swimming pool/swimmingpool1 - Copy.jpg' },
    { title: 'Garden', description: 'Luxury garden and landscape designs', image: '/api/category-images/Garden/garden (1).jpg' },
    { title: 'Wardrobe', description: 'Premium wardrobe and closet designs', image: '/api/category-images/wardrobe/wardrobe1.jpg' },
    { title: 'Office Interior', description: 'Corporate and IT office interior designs', image: '/api/category-images/Office interior/office interior (1).jpg' },
    { title: 'Meeting Room', description: 'Corporate conference and meeting room designs', image: '/api/category-images/Meeting room/meeting room (1).jpg' },
    { title: 'Home Theatre', description: 'Premium home theatre designs for luxury homes', image: '/api/category-images/Home theatre/home theatre (1).jpg' },
    { title: 'Guest Room', description: 'Elegant guest room designs for hospitality', image: '/api/category-images/Guest room/guest room  (1).jpg' },
    { title: 'Classroom', description: 'Modern learning spaces for institutes and corporates', image: '/api/category-images/Classroom/classroom1.jpg' },
    { title: 'Epoxy Floor', description: 'Modern and durable epoxy flooring designs', image: '/api/category-images/Epoxy Floor/epoxy1.jpg' }
  ];

  const categoryIds = [];
  categories.forEach((cat, index) => {
    const catId = normalizeCategoryKey(cat.title);
    categoryIds.push({ ...cat, id: catId });
    db.run(
      `INSERT INTO categories (id, title, description, image) VALUES (?, ?, ?, ?)`,
      [catId, cat.title, cat.description, cat.image]
    );
  });

  // Seed designs after a short delay
  setTimeout(() => { seedDesigns(categoryIds); }, 300);
};

const seedDesigns = (Categories) => {
  if (!db || !Categories || Categories.length === 0) return;

  const designs = [
    { title: 'Modern Minimalist Living Room', description: 'Clean lines and contemporary design', category: 0, price: 45000, previewImage: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=400' },
    { title: 'Scandinavian Living Space', description: 'Light and airy Scandinavian aesthetic', category: 0, price: 52000, previewImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=400' },
    { title: 'Industrial Chic Lounge', description: 'Raw materials with edgy elegance', category: 0, price: 58000, previewImage: 'https://images.unsplash.com/photo-1546592106-cc6b058d0b4a?auto=format&fit=crop&q=80&w=400' },
    { title: 'Cozy Master Bedroom', description: 'Warm and inviting bedroom design', category: 1, price: 38000, previewImage: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=400' },
    { title: 'Luxurious Bed Chamber', description: 'Premium materials and sophisticated style', category: 1, price: 62000, previewImage: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=400' },
    { title: 'Contemporary Kids Room', description: 'Fun and functional children bedroom', category: 1, price: 35000, previewImage: 'https://images.unsplash.com/photo-1604995872076-36f1ce0a8ac2?auto=format&fit=crop&q=80&w=400' },
    { title: 'Modern Kitchen Design', description: 'State-of-the-art kitchen solutions', category: 2, price: 78000, previewImage: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=400' },
    { title: 'Farmhouse Kitchen', description: 'Rustic charm meets modern convenience', category: 2, price: 64000, previewImage: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=400' },
    { title: 'Compact Galley Kitchen', description: 'Space-efficient kitchen for small homes', category: 2, price: 42000, previewImage: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=400' }
  ];

  designs.forEach((design, index) => {
    setTimeout(() => {
      const designId = `design-${index + 1}`;
      const categoryId = Categories[design.category].id;
      db.run(
        `INSERT INTO designs (id, title, description, categoryId, previewImage, price, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [designId, design.title, design.description, categoryId, design.previewImage, design.price, 'active']
      );
    }, index * 50);
  });

  // Seed additional data after designs
  setTimeout(() => { seedBookings(); }, 800);
};

const seedBookings = () => {
  if (!db) return;
  const statuses = ['pending', 'approved', 'confirmed'];

  db.all(`SELECT id, title, categoryId, price FROM designs ORDER BY categoryId, id`, [], (designErr, designs) => {
    if (designErr || !designs || designs.length === 0) return;

    // Get all customer IDs first
    db.all(`SELECT id FROM customers WHERE role = 'customer' LIMIT 15`, [], (err, customers) => {
      if (err || !customers || customers.length === 0) return;

      const byCategory = new Map();
      designs.forEach((design) => {
        const categoryKey = String(design.categoryId || 'uncategorized');
        const list = byCategory.get(categoryKey) || [];
        list.push(design);
        byCategory.set(categoryKey, list);
      });
      const categoryKeys = Array.from(byCategory.keys());

      // Add 12 sample bookings distributed across available categories.
      for (let i = 0; i < 12; i++) {
        const customerId = customers[i % customers.length].id;
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const bookingId = `book-${Date.now()}-${Math.random().toString(16).slice(2)}`;
        const categoryKey = categoryKeys[i % categoryKeys.length];
        const options = byCategory.get(categoryKey) || designs;
        const design = options[i % options.length] || designs[i % designs.length];
        const designId = String(design.id);
        const designName = String(design.title || 'Interior Design');
        const designPrice = Number(design.price || 0);
        const designCost = Number(design.cost || 0);

        db.run(
          `INSERT INTO bookings (id, customerId, designId, designName, price, cost, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [bookingId, customerId, designId, designName, designPrice, designCost, status]
        );
      }

      setTimeout(() => {
        repairBookingDesignReferences();
        seedFeedback();
      }, 120);
    });
  });
};

const repairBookingDesignReferences = () => {
  if (!db) return;

  db.all(`SELECT id, title, categoryId, price FROM designs`, [], (designErr, designRows) => {
    if (designErr || !designRows || designRows.length === 0) return;

    const designById = new Map();
    const designByTitle = new Map();
    designRows.forEach((design) => {
      const id = String(design.id || '');
      const title = normalizeDesignKey(design.title || '');
      if (id) designById.set(id, design);
      if (title) designByTitle.set(title, design);
    });

    db.all(`SELECT id, designId, designName, cost FROM bookings`, [], (bookingErr, bookingRows) => {
      if (bookingErr || !bookingRows || bookingRows.length === 0) return;

      bookingRows.forEach((booking) => {
        const bookingDesignId = String(booking.designId || '');
        const bookingDesignName = normalizeDesignKey(booking.designName || '');

        let resolved = designById.get(bookingDesignId);
        if (!resolved && bookingDesignName) {
          resolved = designByTitle.get(bookingDesignName);
        }
        if (!resolved) {
          const fuzzyMatches = designRows
            .map((design) => {
              const designTitleKey = normalizeDesignKey(design.title || '');
              let score = 0;
              if (bookingDesignName && designTitleKey === bookingDesignName) score += 100;
              if (bookingDesignName && designTitleKey && (designTitleKey.includes(bookingDesignName) || bookingDesignName.includes(designTitleKey))) score += 40;
              return { design, score };
            })
            .filter((entry) => entry.score > 0)
            .sort((left, right) => right.score - left.score);
          resolved = fuzzyMatches[0]?.design || null;
        }
        if (!resolved) {
          const isDemo = String(booking.id || '').startsWith('demo-');
          if (isDemo && designRows.length > 0) {
            resolved = designRows[0];
          } else {
            console.warn(`[DB] Skipped ambiguous booking repair for ${booking.id}`);
            return;
          }
        }

        const nextDesignId = String(resolved.id || bookingDesignId || '');
        const nextDesignName = String(resolved.title || booking.designName || 'Interior Design');
        const nextPrice = Number(Number.isFinite(Number(resolved.price)) ? resolved.price : (booking.price || 0));
        const nextCost = Number(Number.isFinite(Number(resolved.cost)) ? resolved.cost : (booking.cost || 0));

        if (
          nextDesignId === bookingDesignId
          && nextDesignName === String(booking.designName || '')
          && nextPrice === Number(booking.price || 0)
          && nextCost === Number(booking.cost || 0)
        ) {
          return;
        }

        db.run(
          `UPDATE bookings SET designId = ?, designName = ?, price = ?, cost = ? WHERE id = ?`,
          [nextDesignId, nextDesignName, nextPrice, nextCost, booking.id]
        );
      });
    });
  });
};

const seedFeedback = () => {
  if (!db) return;

  const feedbackComments = [
    'Great quality and amazing customer service!',
    'The design perfectly matches my home aesthetic.',
    'Delivery was fast and product arrived in perfect condition.',
    'Highly recommend! Will definitely order again.',
    'The virtual preview feature is incredible.',
    'Best purchase decision for my living room.',
    'Professional team, excellent execution.',
    'Worth every penny! Outstanding work.',
    'Transformed my space completely.',
    'Exceptional attention to detail.'
  ];

  const ratings = [5, 5, 4, 5, 5, 4, 5, 5, 4, 5];

  // Get all customer IDs
  db.all(`SELECT id, name FROM customers WHERE role = 'customer' LIMIT 10`, [], (err, customers) => {
    if (err || !customers) return;

    feedbackComments.forEach((comment, index) => {
      const customer = customers[index % customers.length];
      const feedbackId = `fb-${Date.now()}-${Math.random().toString(16).slice(2)}`;

      db.run(
        `INSERT INTO feedbacks (id, customerId, rating, comment) VALUES (?, ?, ?, ?)`,
        [feedbackId, customer.id, ratings[index], comment]
      );
    });

    // Seed enquiries after feedback
    setTimeout(() => { seedEnquiries(); }, 100);
  });
};

const seedEnquiries = () => {
  if (!db) return;

  insertSampleEnquiries(0);

  // Seed projects after enquiries
  setTimeout(() => { seedProjects(); }, 500);
};

const SAMPLE_ENQUIRIES = [
  { name: 'Raj Patel', email: 'raj.patel@email.com', message: 'Interested in custom designs for my office space. Can you provide a consultation?' },
  { name: 'Priya Singh', email: 'priya.singh@email.com', message: 'Looking for budget-friendly solutions for apartment interior.' },
  { name: 'Amit Kumar', email: 'amit.kumar@email.com', message: 'Do you offer installation services? Need professional help with furniture placement.' },
  { name: 'Neha Sharma', email: 'neha.sharma@email.com', message: 'Want to redesign my kitchen. What are the available options?' },
  { name: 'Rohan Verma', email: 'rohan.verma@email.com', message: 'Interested in AR preview for my bedroom. How does it work?' },
  { name: 'Anjali Reddy', email: 'anjali.reddy@email.com', message: 'Looking for sustainable and eco-friendly design options.' },
  { name: 'Vikram Desai', email: 'vikram.desai@email.com', message: 'Need urgent interior design for my new home. Timeline?' },
  { name: 'Suresh Menon', email: 'suresh.menon@email.com', message: 'Corporate office interior needed. Bulk order discounts available?' }
];

const insertSampleEnquiries = (startDelayMs = 0) => {
  if (!db) return;
  SAMPLE_ENQUIRIES.forEach((enquiry, index) => {
    setTimeout(() => {
      const inquiryId = `inq-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      db.run(
        `INSERT INTO inquiries (id, name, email, message) VALUES (?, ?, ?, ?)`,
        [inquiryId, enquiry.name, enquiry.email, enquiry.message]
      );
    }, startDelayMs + (index * 50));
  });
};

const ensureSampleInquiries = () => {
  if (!db) return;
  db.get(`SELECT COUNT(*) as count FROM inquiries`, [], (err, row) => {
    if (err) {
      console.error('Error checking inquiries:', err);
      return;
    }
    if ((row?.count || 0) > 0) return;
    console.log('No inquiries found. Seeding sample inquiries...');
    insertSampleEnquiries(0);
  });
};

const seedProjects = () => {
  if (!db) return;

  const projects = [
    {
      title: 'Modern Living Room Transformation',
      price: 45000,
      category: 'Living Room',
      description: 'A stunning living room transformation with contemporary furniture and warm lighting.',
      image_url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=400'
    },
    {
      title: 'Luxurious Master Bedroom',
      price: 52000,
      category: 'Bedroom',
      description: 'Elegant bedroom design with premium furniture and ambient lighting.',
      image_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=400'
    },
    {
      title: 'Contemporary Kitchen Design',
      price: 38000,
      category: 'Kitchen',
      description: 'Modern kitchen with sleek cabinets and functional layout.',
      image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=400'
    },
    {
      title: 'Minimalist Studio Apartment',
      price: 30000,
      category: 'Living Room',
      description: 'Space-efficient design perfect for compact living.',
      image_url: 'https://images.unsplash.com/photo-1494145904049-0dca59b4bbad?auto=format&fit=crop&q=80&w=400'
    },
    {
      title: 'Family Kitchen Hub',
      price: 41000,
      category: 'Kitchen',
      description: 'Warm and inviting kitchen design for family gatherings.',
      image_url: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&q=80&w=400'
    }
  ];

  projects.forEach((project, index) => {
    setTimeout(() => {
      const projectId = `prj-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      db.run(
        `INSERT INTO projects (id, title, price, category, description, image_url) VALUES (?, ?, ?, ?, ?, ?)`,
        [projectId, project.title, project.price, project.category, project.description, project.image_url]
      );
    }, index * 50);
  });
};

const seedLikes = () => {
  if (!db) return;

  const designIds = ['design-001', 'design-002', 'design-003', 'design-004', 'design-005'];

  db.all(`SELECT id FROM customers WHERE role = 'customer' LIMIT 8`, [], (err, customers) => {
    if (err || !customers) return;

    customers.forEach((customer, cuIdx) => {
      for (let i = 0; i < 3; i++) {
        const designId = designIds[(cuIdx + i) % designIds.length];
        const likeId = `like-${Date.now()}-${Math.random().toString(16).slice(2)}`;

        db.run(
          `INSERT INTO likes (id, customerId, designId) VALUES (?, ?, ?)`,
          [likeId, customer.id, designId]
        );
      }
    });
  });
};

// Database query helper functions
export const runAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    if (!db) reject(new Error('Database not initialized'));
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

export const getAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    if (!db) reject(new Error('Database not initialized'));
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const allAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    if (!db) reject(new Error('Database not initialized'));
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const seedPackages = () => {
  if (!db) return;

  db.get(`SELECT COUNT(*) as count FROM packages`, [], (err, row) => {
    if (err || (row?.count || 0) > 0) return;

    console.log('Seeding packages with BHK-specific images...');

    const packageData = [
      {
        id: 'apartment-1bhk-essential',
        name: 'APARTMENT 1BHK ESSENTIAL',
        subtitle: 'Smart 1BHK Apartment',
        originalPrice: 400000,
        discountedPrice: 300000,
        description: 'Efficient and stylish 1BHK solutions for modern living.',
        image: 'https://images.unsplash.com/photo-1536376074432-bf1239aa4ee2?auto=format&fit=crop&q=80&w=1200',
        category: 'Full Home',
        type: 'Apartment',
        bhk: 1,
        features: ['Modular Kitchen', 'Wardrobes', 'Living + Dining', 'Balcony Design', 'Bathroom Vanity'],
        designs: [
          { title: 'Modern Kitchen', image: 'https://images.unsplash.com/photo-1556911227-855230007fe4?auto=format&fit=crop&q=80&w=800', description: 'Compact and efficient linear kitchen.' },
          { title: 'Cozy Living', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800', description: 'Warm living area with smart furniture.' },
          { title: 'Master Bedroom', image: 'https://images.unsplash.com/photo-1505693415918-9f3f044a0911?auto=format&fit=crop&q=80&w=800', description: 'Serene bedroom with built-in storage.' }
        ]
      },
      {
        id: 'apartment-2bhk-premium',
        name: 'APARTMENT 2BHK PREMIUM',
        subtitle: 'Elevated 2BHK Lifestyle',
        originalPrice: 750000,
        discountedPrice: 550000,
        description: 'Spacious 2BHK designs with premium finishes and layered lighting.',
        image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1200',
        category: 'Full Home',
        type: 'Apartment',
        bhk: 2,
        features: ['Designer Kitchen', 'Master Suites', 'Grand Living', 'Balcony Lounge', 'Home Office'],
        designs: [
          { title: 'Designer Kitchen', image: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&q=80&w=800', description: 'L-shaped kitchen with premium cabinetry.' },
          { title: 'Grand Living', image: 'https://images.unsplash.com/photo-1493663214027-63d0fa24b991?auto=format&fit=crop&q=80&w=800', description: 'Spacious lounge for family and guests.' },
          { title: 'Master Suite', image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=800', description: 'Premium suite with designer wall treatments.' }
        ]
      },
      {
        id: 'apartment-3bhk-luxury',
        name: 'APARTMENT 3BHK LUXURY',
        subtitle: 'Sophisticated 3BHK Living',
        originalPrice: 1200000,
        discountedPrice: 950000,
        description: 'Bespoke 3BHK interiors featuring high-end materials and custom cabinetry.',
        image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1200',
        category: 'Full Home',
        type: 'Apartment',
        bhk: 3,
        features: ['Gourmet Kitchen', 'Suite Bedrooms', 'Double-height Living', 'Terrace Garden', 'Pooja Room'],
        designs: [
          { title: 'Gourmet Kitchen', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=800', description: 'Professional-grade kitchen with island counter.' },
          { title: 'Double-height Living', image: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&q=80&w=800', description: 'Magnificent living space with statement lighting.' },
          { title: 'Luxury Suite', image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&q=80&w=800', description: 'Opulent master suite with walk-in wardrobe.' }
        ]
      },
      {
        id: 'apartment-4bhk-ultimate',
        name: 'APARTMENT 4BHK ULTIMATE',
        subtitle: 'Grand 4BHK Penthouse',
        originalPrice: 1800000,
        discountedPrice: 1450000,
        description: 'The pinnacle of apartment living with automated systems and vast social spaces.',
        image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1200',
        category: 'Full Home',
        type: 'Apartment',
        bhk: 4,
        features: ['Chef Kitchen', 'Penthouse Suites', 'Triple-height Hall', 'Sky Balcony', 'Infinity Terrace'],
        designs: [
          { title: 'Chef Kitchen', image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=800', description: 'State-of-the-art kitchen for culinary enthusiasts.' },
          { title: 'Penthouse Hall', image: 'https://images.unsplash.com/photo-1583847268964-b28dc2f51ec9?auto=format&fit=crop&q=80&w=800', description: 'Vast social area with panoramic city views.' },
          { title: 'Sky Suite', image: 'https://images.unsplash.com/photo-1616594831848-ad743fa44f8a?auto=format&fit=crop&q=80&w=800', description: 'Ultra-luxury suite at the top level.' }
        ]
      },
      {
        id: 'villa-1bhk-luxury',
        name: 'VILLA 1BHK LUXURY',
        subtitle: 'Signature 1BHK Villa',
        originalPrice: 1500000,
        discountedPrice: 1100000,
        description: 'An elegant villa experience for solo living or couples.',
        image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1200',
        category: 'Full Home',
        type: 'Villa',
        bhk: 1,
        features: ['Designer Kitchen', 'Suite Bedrooms', 'Grand Living', 'Swimming Pool', 'Garden'],
        designs: [
          { title: 'Villa Kitchen', image: 'https://images.unsplash.com/photo-1556911227-855230007fe4?auto=format&fit=crop&q=80&w=800', description: 'Luxury kitchen with designer appliances.' },
          { title: 'Villa Living', image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=800', description: 'Exquisite living area opening to pool.' },
          { title: 'Villa Suite', image: 'https://images.unsplash.com/photo-15026722023488-70e25813efdf?auto=format&fit=crop&q=80&w=800', description: 'Luxury bedroom with independent access.' }
        ]
      },
      {
        id: 'villa-2bhk-luxury',
        name: 'VILLA 2BHK LUXURY',
        subtitle: 'Contemporary 2BHK Estate',
        originalPrice: 2200000,
        discountedPrice: 1750000,
        description: 'A modern two-bedroom villa designed for privacy and social flow.',
        image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=1200',
        category: 'Full Home',
        type: 'Villa',
        bhk: 2,
        features: ['Gourmet Kitchen', 'Dual Suites', 'Grand Salon', 'Infinity Pool', 'Terrace'],
        designs: [
          { title: 'Gourmet Villa Kitchen', image: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&q=80&w=800', description: 'Spacious kitchen for entertaining guests.' },
          { title: 'Villa Salon', image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=800', description: 'Layered living experience with grand scale.' },
          { title: 'Villa Dual Suite', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800', description: 'Premium bedroom suite with private balcony.' }
        ]
      },
      {
        id: 'villa-3bhk-luxury',
        name: 'VILLA 3BHK LUXURY',
        subtitle: 'Grand 3BHK Mansion',
        originalPrice: 3500000,
        discountedPrice: 2800000,
        description: 'A magnificent three-bedroom villa with extensive outdoor living zones.',
        image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=1200',
        category: 'Full Home',
        type: 'Villa',
        bhk: 3,
        features: ['Chef Kitchen', 'Triple Suites', 'Grand Hall', 'Private Pool', 'Gym'],
        designs: [
          { title: 'Villa Chef Kitchen', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=800', description: 'Fully equipped kitchen with walk-in pantry.' },
          { title: 'Grand Villa Hall', image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=800', description: 'Dramatic social area with high ceilings.' },
          { title: 'Villa Private Suite', image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=800', description: 'Spacious suite with standalone bathtub.' }
        ]
      },
      {
        id: 'villa-4bhk-luxury',
        name: 'VILLA 4BHK LUXURY',
        subtitle: 'Ultra-Luxury 4BHK Palace',
        originalPrice: 5500000,
        discountedPrice: 4500000,
        description: 'The ultimate villa configuration for the most demanding luxury standards.',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
        category: 'Full Home',
        type: 'Villa',
        bhk: 4,
        features: ['Professional Kitchen', 'Quad Suites', 'Banquet Hall', 'Estate Pool', 'Spa'],
        designs: [
          { title: 'Villa Estate Kitchen', image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=800', description: 'Bespoke high-capacity kitchen solution.' },
          { title: 'Villa Banquet Hall', image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=800', description: 'Magnificent social space for grand events.' },
          { title: 'Villa Royal Suite', image: 'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&q=80&w=800', description: 'Palatial suite with expansive private terrace.' }
        ]
      }
    ];

    packageData.forEach((pkg, index) => {
      setTimeout(() => {
        db.run(
          `INSERT INTO packages (id, name, subtitle, originalPrice, discountedPrice, description, image, category, type, bhk, features) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [pkg.id, pkg.name, pkg.subtitle, pkg.originalPrice, pkg.discountedPrice, pkg.description, pkg.image, pkg.category, pkg.type, pkg.bhk, JSON.stringify(pkg.features)]
        );

        pkg.designs.forEach((design, dIdx) => {
          const designId = `${pkg.id}-design-${dIdx + 1}`;
          db.run(
            `INSERT INTO package_designs (id, packageId, title, image, description) VALUES (?, ?, ?, ?, ?)`,
            [designId, pkg.id, design.title, design.image, design.description]
          );
        });
      }, index * 100);
    });
  });
};

