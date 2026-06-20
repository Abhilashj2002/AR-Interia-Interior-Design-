import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  generateCompleteInvoice,
  getInvoice,
  getCustomerInvoices,
  getAllInvoices,
  getInvoiceDownloadUrl,
  ensureInvoiceForPaymentId,
  resolvePackagePricing,
  generateInvoicePDF,
  regenerateAllInvoicePDFs,
  sendInvoiceEmail,
} from '../invoices.js';
import { getDb as getMainDb } from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const INVOICE_LIST_COLUMNS = `
  id, customerId, paymentId, bookingId, invoiceNumber,
  amount, subtotal, tax, discount, status, items, pdfPath,
  customerName, customerEmail, customerPhone,
  packageName, designName, paymentMethod, paymentDateTime,
  createdAt, updatedAt
`;

// Middleware to verify authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  req.token = token;
  next();
};

const allAsync = (db, sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => {
    if (err) return reject(err);
    resolve(rows || []);
  });
});

const getAsync = (db, sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => {
    if (err) return reject(err);
    resolve(row || null);
  });
});

const runAsync = (db, sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function (err) {
    if (err) return reject(err);
    resolve(this);
  });
});

const asPdfBuffer = (value) => {
  if (!value) return null;
  if (Buffer.isBuffer(value)) return value;
  if (value instanceof Uint8Array) return Buffer.from(value);
  return null;
};

const ensureInvoicePdfPayload = async (db, invoiceNumber) => {
  const row = await getAsync(
    db,
    `SELECT ${INVOICE_LIST_COLUMNS}, pdfData FROM invoices WHERE invoiceNumber = ? LIMIT 1`,
    [invoiceNumber]
  );

  if (!row) {
    return { found: false, reason: 'invoice_not_found' };
  }

  const storedPdf = asPdfBuffer(row.pdfData);
  if (storedPdf && storedPdf.length > 0) {
    return { found: true, row, pdfBuffer: storedPdf, source: 'db_blob' };
  }

  if (row.pdfPath && fs.existsSync(row.pdfPath)) {
    const filePdf = fs.readFileSync(row.pdfPath);
    if (filePdf?.length) {
      await runAsync(
        db,
        'UPDATE invoices SET pdfData = ?, updatedAt = ? WHERE id = ?',
        [filePdf, new Date().toISOString(), row.id]
      ).catch((error) => {
        console.warn('[Invoices] Failed to cache file PDF into SQLite:', error?.message || error);
      });
      return { found: true, row, pdfBuffer: filePdf, source: 'file_cache' };
    }
  }

  const parsedItems = (() => {
    if (!row.items) return [];
    if (Array.isArray(row.items)) return row.items;
    try {
      return JSON.parse(row.items);
    } catch {
      return [];
    }
  })();

  const regeneratedPath = await generateInvoicePDF({
    invoiceNumber: row.invoiceNumber,
    customerId: row.customerId,
    paymentId: row.paymentId,
    bookingId: row.bookingId,
    amount: Number(row.amount || 0),
    subtotal: Number(row.subtotal || row.amount || 0),
    tax: Number(row.tax || 0),
    discount: Number(row.discount || 0),
    customerName: row.customerName || 'N/A',
    customerEmail: row.customerEmail || 'N/A',
    customerPhone: row.customerPhone || 'N/A',
    packageName: row.packageName || row.designName || 'Booked Package',
    designName: row.designName || row.packageName || 'Design Service',
    paymentMethod: row.paymentMethod || 'N/A',
    paymentDateTime: row.paymentDateTime || row.updatedAt || row.createdAt,
    items: parsedItems,
    createdAt: row.createdAt || new Date().toISOString(),
  });

  const regeneratedPdf = fs.readFileSync(regeneratedPath);
  await runAsync(
    db,
    'UPDATE invoices SET pdfPath = ?, pdfData = ?, updatedAt = ? WHERE id = ?',
    [regeneratedPath, regeneratedPdf, new Date().toISOString(), row.id]
  );

  return { found: true, row, pdfBuffer: regeneratedPdf, source: 'regenerated' };
};

let paymentsCustomerColumnPromise = null;
const resolvePaymentsCustomerColumn = async (db) => {
  if (!paymentsCustomerColumnPromise) {
    paymentsCustomerColumnPromise = allAsync(db, 'PRAGMA table_info(payments)')
      .then((cols) => {
        const names = new Set((cols || []).map((c) => c?.name));
        if (names.has('userId')) return 'userId';
        if (names.has('customerId')) return 'customerId';
        return null;
      })
      .catch(() => null);
  }
  return paymentsCustomerColumnPromise;
};

// Get all invoices (admin only)
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ message: 'Database not initialized' });
    }

    const missingRows = await allAsync(
      db,
      `SELECT p.id
       FROM payments p
       LEFT JOIN invoices i ON i.paymentId = p.id
       WHERE lower(COALESCE(p.status, '')) IN ('completed', 'paid', 'success')
         AND i.id IS NULL
       ORDER BY COALESCE(p.updatedAt, p.createdAt) DESC
       LIMIT 20`
    );
    await Promise.all(
      missingRows.map((row) =>
        ensureInvoiceForPaymentId(db, row.id).catch((syncError) => {
          console.warn('[Invoices] Backfill skipped for payment', row.id, syncError?.message || syncError);
        })
      )
    );

    const rows = await allAsync(db, `SELECT ${INVOICE_LIST_COLUMNS} FROM invoices ORDER BY createdAt DESC`);
    res.json({
      success: true,
      count: rows.length,
      totalCount: rows.length,
      invoices: rows,
    });
  } catch (error) {
    console.error('[Invoices] Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get customer invoices
router.get('/customer/:customerId', authenticateToken, async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ message: 'Database not initialized' });
    }

    const customerId = req.params.customerId;
    console.log(`[Invoices/Customer] Fetching for customerId: ${customerId}`);

    const paymentsCustomerColumn = await resolvePaymentsCustomerColumn(db);
    if (!paymentsCustomerColumn) {
      console.error('[Invoices/Customer] payments table missing user/customer id column');
      return res.status(500).json({ message: 'Server error' });
    }

    // Backfill: Create missing invoices for completed payments
    const missingRows = await allAsync(
      db,
      `SELECT p.id
       FROM payments p
       LEFT JOIN invoices i ON i.paymentId = p.id
       WHERE p.${paymentsCustomerColumn} = ?
         AND lower(COALESCE(p.status, '')) IN ('completed', 'paid', 'success')
         AND i.id IS NULL
       ORDER BY COALESCE(p.updatedAt, p.createdAt) DESC
       LIMIT 20`,
      [customerId]
    );
    await Promise.all(
      missingRows.map((row) =>
        ensureInvoiceForPaymentId(db, row.id).catch((syncError) => {
          console.warn('[Invoices] Customer backfill skipped for payment', row.id, syncError?.message || syncError);
        })
      )
    );

    // Query 1: Invoices linked to payments (traditional payment flow)
    const invoiceRows = await allAsync(
      db,
      `SELECT ${INVOICE_LIST_COLUMNS} FROM invoices WHERE customerId = ? ORDER BY createdAt DESC`,
      [customerId]
    );
    
    // Query 2: Confirmed bookings without invoices (admin approval flow)
    // These show booking status but can help display charge summary
    const confirmedBookings = await allAsync(
      db,
      `SELECT 
         b.id as bookingId,
         b.designName,
         b.status,
         b.price as amount,
         b.bookingDate as createdAt
       FROM bookings b
       WHERE b.customerId = ? 
         AND LOWER(COALESCE(b.status, '')) IN ('confirmed', 'fulfilled')
         AND NOT EXISTS (
           SELECT 1 FROM invoices i WHERE i.bookingId = b.id
         )
       ORDER BY b.bookingDate DESC`,
      [customerId]
    );
    
    // Combine both sources: invoices are primary, confirmed bookings as secondary
    const allInvoices = [
      ...invoiceRows.map(row => ({ ...row, source: 'invoice' })),
      ...confirmedBookings.map(row => ({ ...row, source: 'booking' }))
    ].sort((a, b) => new Date(b.createdAt || b.updatedAt).getTime() - new Date(a.createdAt || a.updatedAt).getTime());
    
    console.log(`[Invoices/Customer] Found ${invoiceRows?.length || 0} invoices + ${confirmedBookings?.length || 0} confirmed bookings for customerId: ${customerId}`);
    
    res.json({
      success: true,
      count: allInvoices.length,
      invoices: allInvoices,
    });
  } catch (error) {
    console.error('[Invoices] Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single invoice by id
router.get('/id/:invoiceId', authenticateToken, (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ message: 'Database not initialized' });
    }

    const invoiceId = req.params.invoiceId;

    db.get(`SELECT ${INVOICE_LIST_COLUMNS} FROM invoices WHERE id = ?`, [invoiceId], (err, row) => {
      if (err) {
        console.error('[Invoices] Error fetching invoice:', err);
        return res.status(500).json({ message: 'Error fetching invoice' });
      }

      if (!row) {
        return res.status(404).json({ message: 'Invoice not found' });
      }

      // Parse items JSON
      if (row.items) {
        try {
          row.items = JSON.parse(row.items);
        } catch (e) {
          row.items = [];
        }
      }

      res.json({ success: true, invoice: row });
    });
  } catch (error) {
    console.error('[Invoices] Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Download invoice PDF
router.get('/download/:invoiceNumber', async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ message: 'Database not initialized' });
    }

    const invoiceNumber = req.params.invoiceNumber;
    const payload = await ensureInvoicePdfPayload(db, invoiceNumber);
    if (!payload.found || !payload.pdfBuffer) {
      return res.status(404).json({ message: 'Invoice PDF not found' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoiceNumber}.pdf"`);
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.send(payload.pdfBuffer);
  } catch (error) {
    console.error('[Invoices] Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// View invoice PDF (inline)
router.get('/view/:invoiceNumber', async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ message: 'Database not initialized' });
    }

    const invoiceNumber = req.params.invoiceNumber;
    const payload = await ensureInvoicePdfPayload(db, invoiceNumber);
    if (!payload.found || !payload.pdfBuffer) {
      return res.status(404).json({ message: 'Invoice PDF not found' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="invoice-${invoiceNumber}.pdf"`);
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.send(payload.pdfBuffer);
  } catch (error) {
    console.error('[Invoices] Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Resend invoice email for an existing invoice number
router.post('/resend/:invoiceNumber', authenticateToken, async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ message: 'Database not initialized' });
    }

    const invoiceNumber = String(req.params.invoiceNumber || '').trim();
    if (!invoiceNumber) {
      return res.status(400).json({ message: 'invoiceNumber is required' });
    }

    const payload = await ensureInvoicePdfPayload(db, invoiceNumber);
    if (!payload.found || !payload.row) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const invoice = payload.row;
    const invoiceData = {
      invoiceNumber: invoice.invoiceNumber,
      amount: Number(invoice.amount || 0),
      subtotal: Number(invoice.subtotal || invoice.amount || 0),
      discount: Number(invoice.discount || 0),
      tax: Number(invoice.tax || 0),
      customerName: invoice.customerName,
      customerEmail: invoice.customerEmail,
      customerPhone: invoice.customerPhone,
      packageName: invoice.packageName,
      designName: invoice.designName,
      paymentMethod: invoice.paymentMethod,
      paymentDateTime: invoice.paymentDateTime,
      createdAt: invoice.createdAt,
    };

    await sendInvoiceEmail(invoiceData, invoice.pdfPath);
    return res.json({
      success: true,
      message: 'Invoice email resend attempted',
      invoiceNumber: invoice.invoiceNumber,
      customerEmail: invoice.customerEmail,
    });
  } catch (error) {
    console.error('[Invoices] Resend error:', error);
    return res.status(500).json({ message: 'Failed to resend invoice email' });
  }
});

const getCustomerContext = (db) => {
  const sql = `SELECT
      c.id,
      c.name,
      c.email,
      c.phone,
      b.id AS bookingId,
      b.designName AS bookingPackageName,
      b.price AS bookingPrice,
      b.cost AS bookingCost,
      d.title AS designTitle,
      COALESCE(p.method, 'card') AS paymentMethod
    FROM customers c
    LEFT JOIN bookings b ON b.customerId = c.id
    LEFT JOIN designs d ON d.id = b.designId
    LEFT JOIN payments p ON p.bookingId = b.id
    WHERE LOWER(COALESCE(c.role, 'customer')) = 'customer'
    ORDER BY COALESCE(b.bookingDate, c.createdAt) DESC, c.createdAt DESC
    LIMIT 1`;

  return new Promise((resolve, reject) => {
    db.get(sql, [], (err, row) => {
      if (err) return reject(err);
      if (!row) return resolve(null);

      resolve(row);
    });
  });
};

// Create sample invoice (for testing/demo)
router.post('/create-sample', authenticateToken, async (req, res) => {
  try {
    const candidateDbs = [req.app.locals.db, getMainDb()].filter(Boolean);
    if (!candidateDbs.length) {
      return res.status(500).json({ message: 'Database not initialized' });
    }

    let invoiceDb = null;
    let customer = null;
    let lastError = null;

    for (const db of candidateDbs) {
      try {
        const row = await getCustomerContext(db);
        if (row) {
          const packagePricing = await resolvePackagePricing(db, [row.bookingPackageName, row.designTitle, row.name]);
          invoiceDb = db;
          customer = {
            ...row,
            packageOriginalPrice: packagePricing?.originalPrice || row.bookingPrice || 0,
            packageDiscountedPrice: packagePricing?.discountedPrice || row.bookingCost || 0,
            packageName: packagePricing?.packageName || row.bookingPackageName || row.designTitle || 'Sample Package',
            designName: packagePricing?.designName || row.designTitle || row.bookingPackageName || 'Sample Design Package',
          };
          break;
        }
      } catch (error) {
        lastError = error;
      }
    }

    if (!customer || !invoiceDb) {
      if (lastError) {
        console.error('[Invoices] Sample customer lookup error:', lastError.message || lastError);
      }
      return res.status(500).json({ message: 'No customers found' });
    }

    if (customer.bookingId) {
      const existingInvoice = await allAsync(
        invoiceDb,
        'SELECT id, invoiceNumber, paymentId, bookingId FROM invoices WHERE bookingId = ? ORDER BY createdAt DESC LIMIT 1',
        [customer.bookingId]
      );
      if (existingInvoice.length > 0) {
        return res.json({
          success: true,
          skipped: true,
          message: 'Invoice already exists for this booking',
          invoice: existingInvoice[0],
        });
      }
    }

    const now = new Date().toISOString();
    const bookingPrice = Number(customer.packageOriginalPrice || customer.bookingPrice || 0);
    const bookingCost = Number(customer.packageDiscountedPrice || customer.bookingCost || 0);
    const paymentAmount = Math.max(1, Number(customer.paymentAmount || bookingCost || bookingPrice || 0));
    const paymentData = {
      id: 'sample-payment-' + Date.now(),
      customerId: customer.id,
      bookingId: customer.bookingId || null,
      amount: paymentAmount,
      price: bookingPrice || paymentAmount,
      cost: bookingCost || paymentAmount,
      originalPrice: bookingPrice || paymentAmount,
      discountedPrice: bookingCost || paymentAmount,
      packageName: customer.packageName || customer.bookingPackageName || customer.designTitle || 'Sample Package',
      designName: customer.designName || customer.designTitle || customer.bookingPackageName || 'Sample Design Package',
      paymentMethod: customer.paymentMethod || 'card',
      paymentDateTime: now,
      createdAt: now,
    };

    const result = await generateCompleteInvoice(invoiceDb, paymentData, customer);
    res.json({
      success: true,
      message: 'Sample invoice created',
      invoice: result,
    });
  } catch (error) {
    console.error('[Invoices] Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Regenerate all invoice PDFs with latest template/formatting
router.post('/admin/regenerate-pdfs', authenticateToken, async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ message: 'Database not initialized' });
    }

    const result = await regenerateAllInvoicePDFs(db);
    return res.json({
      success: true,
      message: 'Invoice PDFs regenerated',
      ...result,
    });
  } catch (error) {
    console.error('[Invoices] Regeneration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to regenerate invoice PDFs',
      error: error?.message || String(error),
    });
  }
});

export default router;
